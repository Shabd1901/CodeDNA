import os
import ast
import re
import math
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple

def percentile(data: List[float], p: float) -> float:
    if not data:
        return 0.0
    data = sorted(data)
    n = len(data)
    k = (n - 1) * (p / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return data[int(k)]
    d0 = data[int(f)] * (c - k)
    d1 = data[int(c)] * (k - f)
    return d0 + d1

def compute_stats(data: List[float]) -> Dict[str, float]:
    if not data:
        return {"min": 0, "max": 0, "mean": 0, "median": 0, "p75": 0, "p90": 0, "total": 0}
    data = sorted(data)
    n = len(data)
    total = sum(data)
    return {
        "min": data[0],
        "max": data[-1],
        "mean": total / n if n > 0 else 0,
        "median": percentile(data, 50),
        "p75": percentile(data, 75),
        "p90": percentile(data, 90),
        "total": total
    }

# Constants for filtering
EXCLUDE_DIRS = {
    'node_modules', '.git', '.vscode', '.idea', '__pycache__', 
    'venv', 'env', '.env', 'dist', 'build', 'out', 'target', 'vendor',
    'coverage', '.next', '.nuxt', 'tmp', 'temp'
}
CODE_EXTENSIONS = {
    '.py': 'python',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cc': 'cpp',
    '.h': 'c',
    '.hpp': 'cpp',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'css',
    '.sql': 'sql',
    '.sh': 'shell',
    '.json': 'json',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.md': 'markdown'
}

# Regexes
RE_SNAKE = re.compile(r'^[a-z_][a-z0-9_]*$')
RE_CAMEL = re.compile(r'^[a-z][a-zA-Z0-9]*$')
RE_PASCAL = re.compile(r'^[A-Z][a-zA-Z0-9]*$')
RE_UPPER = re.compile(r'^[A-Z_][A-Z0-9_]*$')
RE_TODO = re.compile(r'(?i)\b(todo|fixme|hack|bug)\b')
RE_BARE_EXCEPT = re.compile(r'except\s*:|except\s+Exception\s*:')
RE_EVAL = re.compile(r'\b(eval|exec|Function|innerHTML)\s*(\(|=)')
RE_SECRET = re.compile(r'(?i)(password|secret|api_key|token|bearer)["\']?\s*[:=]\s*["\'][a-zA-Z0-9_.-]{8,}["\']')

def classify_name(name: str) -> str:
    if RE_UPPER.match(name): return 'UPPER_CASE'
    if RE_PASCAL.match(name): return 'PascalCase'
    if RE_CAMEL.match(name): return 'camelCase'
    if RE_SNAKE.match(name): return 'snake_case'
    return 'other'

def is_usable_file(filepath: str) -> bool:
    parts = Path(filepath).parts
    if any(p in EXCLUDE_DIRS for p in parts):
        return False
    ext = os.path.splitext(filepath)[1].lower()
    return ext in CODE_EXTENSIONS or os.path.basename(filepath) in ['requirements.txt', 'package.json']

class PythonVisitor(ast.NodeVisitor):
    def __init__(self):
        self.functions = []
        self.classes = []
        self.imports = []
        self.complexity_scores = []
        self.function_lengths = []
        self.names = []
        
    def visit_FunctionDef(self, node):
        self.functions.append(node.name)
        self.names.append((node.name, 'function'))
        self.function_lengths.append(getattr(node, 'end_lineno', node.lineno) - node.lineno + 1)
        
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.Try, ast.With, ast.ExceptHandler, ast.BoolOp)):
                if isinstance(child, ast.BoolOp):
                    complexity += len(child.values) - 1
                else:
                    complexity += 1
        self.complexity_scores.append(complexity)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node):
        self.visit_FunctionDef(node)
        
    def visit_ClassDef(self, node):
        self.classes.append(node.name)
        self.names.append((node.name, 'class'))
        self.generic_visit(node)
        
    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name.split('.')[0])
        self.generic_visit(node)
        
    def visit_ImportFrom(self, node):
        if node.module:
            self.imports.append(node.module.split('.')[0])
        self.generic_visit(node)
        
    def visit_Assign(self, node):
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.names.append((target.id, 'variable'))
        self.generic_visit(node)

def analyze_python_file(filepath: str, content: str) -> Dict:
    metrics = {
        "functions": 0, "classes": 0, "imports": [], "names": [],
        "function_lengths": [], "complexities": [], "docstrings": 0
    }
    try:
        tree = ast.parse(content)
        visitor = PythonVisitor()
        visitor.visit(tree)
        metrics["functions"] = len(visitor.functions)
        metrics["classes"] = len(visitor.classes)
        metrics["imports"] = visitor.imports
        metrics["names"] = visitor.names
        metrics["function_lengths"] = visitor.function_lengths
        metrics["complexities"] = visitor.complexity_scores
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Module)):
                if ast.get_docstring(node):
                    metrics["docstrings"] += 1
    except Exception:
        pass
    return metrics

def analyze_js_ts_file(filepath: str, content: str, lines: List[str]) -> Dict:
    metrics = {
        "functions": 0, "classes": 0, "imports": [], "names": [],
        "function_lengths": [], "complexities": [], "docstrings": 0
    }
    in_function = False
    func_start = 0
    bracket_level = 0
    
    for i, line in enumerate(lines):
        line = line.strip()
        if line.startswith("import ") or "require(" in line:
            parts = line.split()
            for p in parts:
                if p.startswith("'") or p.startswith('"'):
                    metrics["imports"].append(p.strip("'\"").split('/')[0])
        
        if "function " in line or "=>" in line:
            metrics["functions"] += 1
            if not in_function and "{" in line:
                in_function = True
                func_start = i
                bracket_level = line.count("{") - line.count("}")
        elif line.startswith("class "):
            metrics["classes"] += 1
            
        if in_function:
            bracket_level += line.count("{") - line.count("}")
            if bracket_level <= 0:
                metrics["function_lengths"].append(i - func_start + 1)
                in_function = False
                
        if any(kw in line for kw in ["if (", "for (", "while (", "catch (", "?", "&&", "||"]):
            metrics["complexities"].append(1)

    return metrics

def analyze_file(filepath: str) -> Dict[str, Any]:
    ext = os.path.splitext(filepath)[1].lower()
    lang = CODE_EXTENSIONS.get(ext, 'unknown')
    
    metrics = {
        "lang": lang,
        "bytes": os.path.getsize(filepath),
        "loc": 0,
        "functions": 0, "classes": 0, "imports": [],
        "function_lengths": [], "complexities": [],
        "names": [], 
        "docstrings": 0, "comment_lines": 0,
        "todos": 0, "bare_excepts": 0, "evals": 0, "secrets": 0,
        "spaces_indent": 0, "tabs_indent": 0, "trailing_ws": 0,
        "single_quotes": 0, "double_quotes": 0, "magic_numbers": 0
    }
    
    if lang == 'unknown':
        return metrics

    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            lines = content.split('\n')
            metrics["loc"] = len(lines)
            
            metrics["todos"] = len(RE_TODO.findall(content))
            metrics["bare_excepts"] = len(RE_BARE_EXCEPT.findall(content))
            metrics["evals"] = len(RE_EVAL.findall(content))
            metrics["secrets"] = len(RE_SECRET.findall(content))
            metrics["single_quotes"] = content.count("'")
            metrics["double_quotes"] = content.count('"')
            
            for line in lines:
                sline = line.lstrip()
                if not sline: continue
                if sline.startswith('#') or sline.startswith('//') or sline.startswith('*'):
                    metrics["comment_lines"] += 1
                    
                indent = line[:len(line) - len(sline)]
                if '\t' in indent:
                    metrics["tabs_indent"] += 1
                elif ' ' in indent:
                    metrics["spaces_indent"] += 1
                    
                if line.endswith(' ') or line.endswith('\t'):
                    metrics["trailing_ws"] += 1
                    
                if re.search(r'\b\d{2,}\b', sline):
                    metrics["magic_numbers"] += 1
            
            if ext == '.py':
                py_metrics = analyze_python_file(filepath, content)
                metrics.update({k: py_metrics[k] for k in py_metrics if k in metrics})
            elif ext in ['.js', '.jsx', '.ts', '.tsx']:
                js_metrics = analyze_js_ts_file(filepath, content, lines)
                metrics.update({k: js_metrics[k] for k in js_metrics if k in metrics})
                
    except Exception:
        pass
        
    return metrics

def build_repository_codedna(repo_dir: str) -> Dict[str, Any]:
    dna = {
        "repo_count_usable_files_languages": {
            "total_repos": len(os.listdir(repo_dir)) if os.path.exists(repo_dir) else 0,
            "usable_files": 0,
            "languages": {}
        },
        "loc_distribution": {},
        "file_size_distribution": {},
        "function_class_distribution": {},
        "dependency_library_fingerprint": {"all": []},
        "framework_fingerprint": [],
        "architecture_fingerprint": [],
        "code_quality_error_patterns": {
            "todos": 0, "bare_excepts": 0, "evals": 0, "secrets": 0, "magic_numbers": 0
        },
        "comment_docstring_patterns": {
            "comment_lines": 0, "docstrings": 0, "comment_to_code_ratio": 0.0
        },
        "naming_convention_distribution": {
            "snake_case": 0, "camelCase": 0, "PascalCase": 0, "UPPER_CASE": 0, "other": 0
        },
        "formatting_indentation_fingerprint": {
            "spaces_indent": 0, "tabs_indent": 0, "trailing_ws": 0, "single_quotes": 0, "double_quotes": 0
        },
        "complexity_distribution": {},
        "historical_consistency_score": 0.0,
        "baseline_reliability_score": 0.0
    }
    
    all_loc = []
    all_bytes = []
    all_function_lengths = []
    all_complexities = []
    funcs_per_file = []
    classes_per_file = []
    all_imports = []
    
    if os.path.exists(repo_dir):
        for root, dirs, files in os.walk(repo_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                filepath = os.path.join(root, file)
                if not is_usable_file(filepath):
                    continue
                
                if os.path.splitext(file)[1].lower() not in CODE_EXTENSIONS:
                    continue
                    
                dna["repo_count_usable_files_languages"]["usable_files"] += 1
                
                m = analyze_file(filepath)
                lang = m["lang"]
                dna["repo_count_usable_files_languages"]["languages"][lang] = dna["repo_count_usable_files_languages"]["languages"].get(lang, 0) + 1
                
                all_loc.append(m["loc"])
                all_bytes.append(m["bytes"])
                all_function_lengths.extend(m["function_lengths"])
                if m["lang"] == 'python':
                    all_complexities.extend(m["complexities"])
                else:
                    if m["complexities"]:
                        all_complexities.append(sum(m["complexities"]))
                funcs_per_file.append(m["functions"])
                classes_per_file.append(m["classes"])
                all_imports.extend(m["imports"])
                
                dna["code_quality_error_patterns"]["todos"] += m["todos"]
                dna["code_quality_error_patterns"]["bare_excepts"] += m["bare_excepts"]
                dna["code_quality_error_patterns"]["evals"] += m["evals"]
                dna["code_quality_error_patterns"]["secrets"] += m["secrets"]
                dna["code_quality_error_patterns"]["magic_numbers"] += m["magic_numbers"]
                
                dna["comment_docstring_patterns"]["comment_lines"] += m["comment_lines"]
                dna["comment_docstring_patterns"]["docstrings"] += m["docstrings"]
                
                dna["formatting_indentation_fingerprint"]["spaces_indent"] += m["spaces_indent"]
                dna["formatting_indentation_fingerprint"]["tabs_indent"] += m["tabs_indent"]
                dna["formatting_indentation_fingerprint"]["trailing_ws"] += m["trailing_ws"]
                dna["formatting_indentation_fingerprint"]["single_quotes"] += m["single_quotes"]
                dna["formatting_indentation_fingerprint"]["double_quotes"] += m["double_quotes"]
                
                for name, ntype in m["names"]:
                    cls = classify_name(name)
                    dna["naming_convention_distribution"][cls] += 1
                    
    dna["loc_distribution"] = compute_stats(all_loc)
    dna["file_size_distribution"] = compute_stats(all_bytes)
    
    total_loc = dna["loc_distribution"]["total"]
    dna["comment_docstring_patterns"]["comment_to_code_ratio"] = (dna["comment_docstring_patterns"]["comment_lines"] / total_loc) if total_loc > 0 else 0
    
    dna["function_class_distribution"] = {
        "total_functions": sum(funcs_per_file),
        "total_classes": sum(classes_per_file),
        "functions_per_file": compute_stats(funcs_per_file),
        "classes_per_file": compute_stats(classes_per_file),
        "function_length_distribution": compute_stats(all_function_lengths)
    }
    
    dna["complexity_distribution"] = compute_stats(all_complexities)
    
    uniq_imports = list(set(all_imports))
    dna["dependency_library_fingerprint"]["all"] = uniq_imports
    
    frameworks = []
    if any(i in uniq_imports for i in ['fastapi', 'flask', 'django']): frameworks.append('Python Web')
    if any(i in uniq_imports for i in ['react', 'next', 'vue']): frameworks.append('Frontend JS/TS')
    dna["framework_fingerprint"] = frameworks
    
    if len(frameworks) > 1:
        dna["architecture_fingerprint"].append('Multi-stack/Modular')
    elif dna["repo_count_usable_files_languages"]["usable_files"] < 5:
        dna["architecture_fingerprint"].append('Script-based')
    else:
        dna["architecture_fingerprint"].append('Monolith')

    files_count = dna["repo_count_usable_files_languages"]["usable_files"]
    reliability = 0
    if files_count > 50: reliability += 40
    elif files_count > 10: reliability += 20
    if dna["repo_count_usable_files_languages"]["total_repos"] > 2: reliability += 30
    if len(all_loc) > 0 and dna["loc_distribution"]["mean"] > 50: reliability += 30
    dna["baseline_reliability_score"] = min(100, reliability)

    return dna

def compare_codedna(baseline_dna: Dict[str, Any], submission_dna: Dict[str, Any]) -> Dict[str, Any]:
    consistency_score = 100
    
    b_mean_loc = baseline_dna.get("loc_distribution", {}).get("mean", 0)
    s_mean_loc = submission_dna.get("loc_distribution", {}).get("mean", 0)
    if b_mean_loc > 0:
        variance = abs(b_mean_loc - s_mean_loc) / b_mean_loc
        if variance > 0.5: consistency_score -= 15
        elif variance > 0.2: consistency_score -= 5
        
    b_complexity = baseline_dna.get("complexity_distribution", {}).get("mean", 0)
    s_complexity = submission_dna.get("complexity_distribution", {}).get("mean", 0)
    if b_complexity > 0:
        variance = abs(b_complexity - s_complexity) / b_complexity
        if variance > 0.5: consistency_score -= 20
        elif variance > 0.2: consistency_score -= 10
        
    b_fmt = baseline_dna.get("formatting_indentation_fingerprint", {})
    s_fmt = submission_dna.get("formatting_indentation_fingerprint", {})
    b_spaces = b_fmt.get("spaces_indent", 0)
    b_tabs = b_fmt.get("tabs_indent", 0)
    s_spaces = s_fmt.get("spaces_indent", 0)
    s_tabs = s_fmt.get("tabs_indent", 0)
    
    b_pref = 'spaces' if b_spaces > b_tabs else 'tabs'
    s_pref = 'spaces' if s_spaces > s_tabs else 'tabs'
    if b_pref != s_pref and (s_spaces + s_tabs > 0) and (b_spaces + b_tabs > 0):
        consistency_score -= 25
        
    submission_dna["historical_consistency_score"] = max(0, consistency_score)
    
    return {
        "baseline_metrics": baseline_dna,
        "submission_metrics": submission_dna,
        "historical_consistency_score": submission_dna["historical_consistency_score"],
        "anomalies": []
    }
