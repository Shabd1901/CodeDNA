import os
import ast
from typing import Dict, List, Any

def analyze_python_file(filepath: str) -> Dict[str, Any]:
    """Parse a Python file using the ast module and extract CodeDNA metrics."""
    metrics = {
        "lines": 0,
        "functions": 0,
        "classes": 0,
        "imports": [],
        "complexity_proxy": 0
    }
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            metrics["lines"] = len(content.split('\n'))
            
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    metrics["functions"] += 1
                elif isinstance(node, ast.ClassDef):
                    metrics["classes"] += 1
                elif isinstance(node, ast.Import):
                    for alias in node.names:
                        metrics["imports"].append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        metrics["imports"].append(node.module)
                elif isinstance(node, (ast.If, ast.For, ast.While, ast.Try, ast.With)):
                    metrics["complexity_proxy"] += 1
    except Exception:
        pass # Skip unparseable or unreadable files
            
    return metrics

def analyze_js_ts_file(filepath: str) -> Dict[str, Any]:
    """Extract basic static metrics from JS/TS files using heuristics."""
    metrics = {
        "lines": 0,
        "functions": 0,
        "classes": 0,
        "imports": [],
        "complexity_proxy": 0
    }
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
            metrics["lines"] = len(lines)
            
            for line in lines:
                line = line.strip()
                # Basic heuristics for MVP
                if line.startswith("import ") or line.startswith("const ") and "require(" in line:
                    metrics["imports"].append(line) # Simplified
                if "function " in line or "=>" in line:
                    metrics["functions"] += 1
                if line.startswith("class "):
                    metrics["classes"] += 1
                if any(kw in line for kw in ["if (", "for (", "while (", "catch ("]):
                    metrics["complexity_proxy"] += 1
    except Exception:
        pass
        
    return metrics

def build_repository_codedna(repo_path: str) -> Dict[str, Any]:
    """Traverse a repository directory and build its combined CodeDNA signature."""
    dna = {
        "total_files": 0,
        "total_lines": 0,
        "total_functions": 0,
        "total_classes": 0,
        "all_imports": [],
        "total_complexity": 0,
        "languages": {}
    }
    
    for root, _, files in os.walk(repo_path):
        for file in files:
            filepath = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower()
            
            if ext == '.py':
                metrics = analyze_python_file(filepath)
                dna["languages"]["python"] = dna.languages.get("python", 0) + 1
            elif ext in ['.js', '.jsx', '.ts', '.tsx']:
                metrics = analyze_js_ts_file(filepath)
                lang_key = "javascript" if ext in ['.js', '.jsx'] else "typescript"
                dna["languages"][lang_key] = dna.languages.get(lang_key, 0) + 1
            else:
                continue
                
            dna["total_files"] += 1
            dna["total_lines"] += metrics["lines"]
            dna["total_functions"] += metrics["functions"]
            dna["total_classes"] += metrics["classes"]
            dna["total_complexity"] += metrics["complexity_proxy"]
            dna["all_imports"].extend(metrics["imports"])
            
    # Deduplicate imports
    dna["all_imports"] = list(set(dna["all_imports"]))
    return dna

def compare_codedna(baseline_dna: Dict[str, Any], submission_dna: Dict[str, Any]) -> Dict[str, Any]:
    """Compare the new submission against the historical baseline to find anomalies."""
    
    # Calculate ratios per file to account for different project sizes
    baseline_files = baseline_dna.get("total_files", 1) or 1
    sub_files = submission_dna.get("total_files", 1) or 1
    
    b_complexity_per_file = baseline_dna.get("total_complexity", 0) / baseline_files
    s_complexity_per_file = submission_dna.get("total_complexity", 0) / sub_files
    
    b_lines_per_file = baseline_dna.get("total_lines", 0) / baseline_files
    s_lines_per_file = submission_dna.get("total_lines", 0) / sub_files
    
    # Analyze imports (new libraries used)
    b_imports = set(baseline_dna.get("all_imports", []))
    s_imports = set(submission_dna.get("all_imports", []))
    new_imports = list(s_imports - b_imports)
    
    anomalies = []
    
    if s_complexity_per_file > b_complexity_per_file * 1.5:
        anomalies.append({
            "type": "complexity_jump",
            "message": f"Average complexity per file jumped from {b_complexity_per_file:.1f} to {s_complexity_per_file:.1f}"
        })
        
    if s_lines_per_file > b_lines_per_file * 2.0:
        anomalies.append({
            "type": "size_jump",
            "message": f"Average lines per file jumped from {b_lines_per_file:.1f} to {s_lines_per_file:.1f}"
        })
        
    if new_imports:
        anomalies.append({
            "type": "new_libraries",
            "message": f"Submission uses {len(new_imports)} new libraries not seen in historical data.",
            "details": new_imports[:10] # Show up to 10
        })
        
    return {
        "baseline_metrics": baseline_dna,
        "submission_metrics": submission_dna,
        "anomalies": anomalies,
        "reliability": "Mixed" if baseline_files < 5 else "Reliable"
    }
