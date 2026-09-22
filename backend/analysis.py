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

EXCLUDE_DIRS = {
    'node_modules', '.git', '.vscode', '.idea', '__pycache__', 
    'venv', 'env', '.env', 'dist', 'build', 'out', 'target', 'vendor',
    'coverage', '.next', '.nuxt', 'tmp', 'temp'
}
CODE_EXTENSIONS = {
    '.py': 'python', '.js': 'javascript', '.jsx': 'javascript',
    '.ts': 'typescript', '.tsx': 'typescript', '.java': 'java',
    '.c': 'c', '.cpp': 'cpp', '.cs': 'csharp', '.go': 'go',
    '.rs': 'rust', '.rb': 'ruby', '.php': 'php', '.swift': 'swift',
    '.kt': 'kotlin', '.scala': 'scala', '.html': 'html', '.css': 'css',
    '.sql': 'sql', '.sh': 'shell', '.json': 'json', '.yaml': 'yaml', '.md': 'markdown'
}

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
        self.identifier_lengths = []
        
        # Phase 2 metrics
        self.current_depth = 0
        self.nesting_depths = []
        self.control_flow = {'if': 0, 'for': 0, 'while': 0, 'try': 0, 'break': 0, 'continue': 0, 'yield': 0, 'await': 0}
        self.ast_structures = {'list_comp': 0, 'dict_comp': 0, 'lambda': 0, 'decorators': 0, 'type_hints': 0}
        self.error_handling = {'raise': 0, 'custom_exceptions': 0}
        self.oop = {'inheritance_count': 0, 'super_calls': 0, 'static_methods': 0, 'class_methods': 0}
        self.import_habits = {'aliased': 0, 'from_import': 0, 'relative': 0}
        self.idioms = {'is_none': 0, 'name_main': 0}

    def generic_visit(self, node):
        is_block = hasattr(node, 'body') and isinstance(node.body, list)
        if is_block:
            self.current_depth += 1
            
        super().generic_visit(node)
        
        if is_block:
            self.nesting_depths.append(self.current_depth)
            self.current_depth -= 1

    def register_name(self, name: str, ntype: str):
        self.names.append((name, ntype))
        self.identifier_lengths.append(len(name))

    def visit_FunctionDef(self, node):
        self.functions.append(node.name)
        self.register_name(node.name, 'function')
        self.function_lengths.append(getattr(node, 'end_lineno', node.lineno) - node.lineno + 1)
        
        if node.decorator_list:
            self.ast_structures['decorators'] += len(node.decorator_list)
            for dec in node.decorator_list:
                if isinstance(dec, ast.Name):
                    if dec.id == 'staticmethod': self.oop['static_methods'] += 1
                    elif dec.id == 'classmethod': self.oop['class_methods'] += 1
                    
        if node.returns or any(arg.annotation for arg in node.args.args):
            self.ast_structures['type_hints'] += 1
            
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
        self.register_name(node.name, 'class')
        if node.bases:
            for base in node.bases:
                if isinstance(base, ast.Name) and base.id not in ('object', 'Exception'):
                    self.oop['inheritance_count'] += 1
                elif isinstance(base, ast.Name) and base.id == 'Exception':
                    self.error_handling['custom_exceptions'] += 1
        self.generic_visit(node)
        
    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name.split('.')[0])
            if alias.asname:
                self.import_habits['aliased'] += 1
        self.generic_visit(node)
        
    def visit_ImportFrom(self, node):
        self.import_habits['from_import'] += 1
        if node.level > 0:
            self.import_habits['relative'] += 1
        if node.module:
            self.imports.append(node.module.split('.')[0])
        for alias in node.names:
            if alias.asname:
                self.import_habits['aliased'] += 1
        self.generic_visit(node)
        
    def visit_Assign(self, node):
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.register_name(target.id, 'variable')
            # type hints
        self.generic_visit(node)
        
    def visit_AnnAssign(self, node):
        self.ast_structures['type_hints'] += 1
        if isinstance(node.target, ast.Name):
            self.register_name(node.target.id, 'variable')
        self.generic_visit(node)

    def visit_If(self, node):
        self.control_flow['if'] += 1
        # Check for if __name__ == '__main__'
        try:
            if isinstance(node.test, ast.Compare) and isinstance(node.test.left, ast.Name) and node.test.left.id == '__name__':
                self.idioms['name_main'] += 1
        except Exception:
            pass
        self.generic_visit(node)
        
    def visit_Compare(self, node):
        for op, comp in zip(node.ops, node.comparators):
            if isinstance(op, (ast.Is, ast.IsNot)) and isinstance(comp, ast.Constant) and comp.value is None:
                self.idioms['is_none'] += 1
        self.generic_visit(node)

    def visit_For(self, node): self.control_flow['for'] += 1; self.generic_visit(node)
    def visit_While(self, node): self.control_flow['while'] += 1; self.generic_visit(node)
    def visit_Try(self, node): self.control_flow['try'] += 1; self.generic_visit(node)
    def visit_Break(self, node): self.control_flow['break'] += 1; self.generic_visit(node)
    def visit_Continue(self, node): self.control_flow['continue'] += 1; self.generic_visit(node)
    def visit_Yield(self, node): self.control_flow['yield'] += 1; self.generic_visit(node)
    def visit_YieldFrom(self, node): self.control_flow['yield'] += 1; self.generic_visit(node)
    def visit_Await(self, node): self.control_flow['await'] += 1; self.generic_visit(node)
    def visit_Raise(self, node): self.error_handling['raise'] += 1; self.generic_visit(node)
    def visit_ListComp(self, node): self.ast_structures['list_comp'] += 1; self.generic_visit(node)
    def visit_DictComp(self, node): self.ast_structures['dict_comp'] += 1; self.generic_visit(node)
    def visit_Lambda(self, node): self.ast_structures['lambda'] += 1; self.generic_visit(node)
    
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name) and node.func.id == 'super':
            self.oop['super_calls'] += 1
        self.generic_visit(node)


def analyze_python_file(filepath: str, content: str) -> Dict:
    metrics = {
        "functions": 0, "classes": 0, "imports": [], "names": [],
        "function_lengths": [], "complexities": [], "docstrings": 0,
        "identifier_lengths": [], "nesting_depths": [],
        "control_flow": {}, "ast_structures": {}, "error_handling": {},
        "oop": {}, "import_habits": {}, "idioms": {}
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
        metrics["identifier_lengths"] = visitor.identifier_lengths
        metrics["nesting_depths"] = visitor.nesting_depths
        metrics["control_flow"] = visitor.control_flow
        metrics["ast_structures"] = visitor.ast_structures
        metrics["error_handling"] = visitor.error_handling
        metrics["oop"] = visitor.oop
        metrics["import_habits"] = visitor.import_habits
        metrics["idioms"] = visitor.idioms
        
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
        "function_lengths": [], "complexities": [], "docstrings": 0,
        "identifier_lengths": [], "nesting_depths": [],
        "control_flow": {'if': 0, 'for': 0, 'while': 0, 'try': 0, 'break': 0, 'continue': 0, 'yield': 0, 'await': 0},
        "ast_structures": {'list_comp': 0, 'dict_comp': 0, 'lambda': 0, 'decorators': 0, 'type_hints': 0},
        "error_handling": {'raise': 0, 'custom_exceptions': 0},
        "oop": {'inheritance_count': 0, 'super_calls': 0, 'static_methods': 0, 'class_methods': 0},
        "import_habits": {'aliased': 0, 'from_import': 0, 'relative': 0},
        "idioms": {'is_none': 0, 'name_main': 0}
    }
    in_function = False
    func_start = 0
    bracket_level = 0
    max_nesting = 0
    
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
                max_nesting = max(max_nesting, bracket_level)
        elif line.startswith("class "):
            metrics["classes"] += 1
            if "extends " in line:
                metrics["oop"]["inheritance_count"] += 1
            
        if in_function:
            bracket_level += line.count("{") - line.count("}")
            max_nesting = max(max_nesting, bracket_level)
            if bracket_level <= 0:
                metrics["function_lengths"].append(i - func_start + 1)
                metrics["nesting_depths"].append(max_nesting)
                in_function = False
                max_nesting = 0
                
        # basic control flow regex heuristics for JS
        if line.startswith("if ("): metrics["control_flow"]["if"] += 1
        if line.startswith("for ("): metrics["control_flow"]["for"] += 1
        if line.startswith("while ("): metrics["control_flow"]["while"] += 1
        if "try {" in line: metrics["control_flow"]["try"] += 1
        if "await " in line: metrics["control_flow"]["await"] += 1
        if "throw " in line: metrics["error_handling"]["raise"] += 1
        if "super(" in line: metrics["oop"]["super_calls"] += 1

        if any(kw in line for kw in ["if (", "for (", "while (", "catch (", "?", "&&", "||"]):
            metrics["complexities"].append(1)

    return metrics

def analyze_file(filepath: str) -> Dict[str, Any]:
    ext = os.path.splitext(filepath)[1].lower()
    lang = CODE_EXTENSIONS.get(ext, 'unknown')
    
    metrics = {
        "lang": lang, "bytes": os.path.getsize(filepath), "loc": 0,
        "functions": 0, "classes": 0, "imports": [],
        "function_lengths": [], "complexities": [], "names": [], 
        "identifier_lengths": [], "nesting_depths": [],
        "control_flow": {'if': 0, 'for': 0, 'while': 0, 'try': 0, 'break': 0, 'continue': 0, 'yield': 0, 'await': 0},
        "ast_structures": {'list_comp': 0, 'dict_comp': 0, 'lambda': 0, 'decorators': 0, 'type_hints': 0},
        "error_handling": {'raise': 0, 'custom_exceptions': 0},
        "oop": {'inheritance_count': 0, 'super_calls': 0, 'static_methods': 0, 'class_methods': 0},
        "import_habits": {'aliased': 0, 'from_import': 0, 'relative': 0},
        "idioms": {'is_none': 0, 'name_main': 0},
        "docstrings": 0, "comment_lines": 0, "inline_comments": 0, "block_comments": 0,
        "todos": 0, "bare_excepts": 0, "evals": 0, "secrets": 0,
        "spaces_indent": 0, "tabs_indent": 0, "trailing_ws": 0,
        "single_quotes": 0, "double_quotes": 0, "magic_numbers": 0
    }
    
    if lang == 'unknown': return metrics

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
            
            in_block_comment = False
            for line in lines:
                sline = line.lstrip()
                if not sline: continue
                
                # Comments (block vs inline)
                if ext in ['.js', '.ts', '.java', '.c', '.cpp', '.cs']:
                    if sline.startswith('/*'): in_block_comment = True
                    if in_block_comment:
                        metrics["block_comments"] += 1
                        if '*/' in sline: in_block_comment = False
                        continue
                    if sline.startswith('//'): metrics["comment_lines"] += 1; metrics["inline_comments"] += 1
                elif ext == '.py':
                    if sline.startswith('#'): metrics["comment_lines"] += 1; metrics["inline_comments"] += 1
                    
                indent = line[:len(line) - len(sline)]
                if '\t' in indent: metrics["tabs_indent"] += 1
                elif ' ' in indent: metrics["spaces_indent"] += 1
                    
                if line.endswith(' ') or line.endswith('\t'): metrics["trailing_ws"] += 1
                if re.search(r'\b\d{2,}\b', sline): metrics["magic_numbers"] += 1
            
            if ext == '.py':
                py_metrics = analyze_python_file(filepath, content)
                for k in py_metrics:
                    if isinstance(metrics.get(k), dict):
                        for sub_k in py_metrics[k]: metrics[k][sub_k] += py_metrics[k][sub_k]
                    elif isinstance(metrics.get(k), list): metrics[k].extend(py_metrics[k])
                    else: metrics[k] += py_metrics[k]
            elif ext in ['.js', '.jsx', '.ts', '.tsx']:
                js_metrics = analyze_js_ts_file(filepath, content, lines)
                for k in js_metrics:
                    if isinstance(metrics.get(k), dict):
                        for sub_k in js_metrics[k]: metrics[k][sub_k] += js_metrics[k][sub_k]
                    elif isinstance(metrics.get(k), list): metrics[k].extend(js_metrics[k])
                    else: metrics[k] += js_metrics[k]
                
    except Exception:
        pass
        
    return metrics

def build_repository_codedna(repo_dir: str) -> Dict[str, Any]:
    # Phase 1 metrics base
    dna = {
        "repo_count_usable_files_languages": {"total_repos": 0, "usable_files": 0, "languages": {}},
        "loc_distribution": {}, "file_size_distribution": {},
        "function_class_distribution": {}, "dependency_library_fingerprint": {"all": []},
        "framework_fingerprint": [], "architecture_fingerprint": [],
        "code_quality_error_patterns": {"todos": 0, "bare_excepts": 0, "evals": 0, "secrets": 0, "magic_numbers": 0},
        "comment_docstring_patterns": {"comment_lines": 0, "docstrings": 0, "comment_to_code_ratio": 0.0},
        "naming_convention_distribution": {"snake_case": 0, "camelCase": 0, "PascalCase": 0, "UPPER_CASE": 0, "other": 0},
        "formatting_indentation_fingerprint": {"spaces_indent": 0, "tabs_indent": 0, "trailing_ws": 0, "single_quotes": 0, "double_quotes": 0},
        "complexity_distribution": {}, "historical_consistency_score": 0.0, "baseline_reliability_score": 0.0,
        
        # Phase 2 metrics
        "identifier_length_distribution": {},
        "nesting_depth_distribution": {},
        "control_flow_patterns": {'if': 0, 'for': 0, 'while': 0, 'try': 0, 'break': 0, 'continue': 0, 'yield': 0, 'await': 0},
        "ast_structural_patterns": {'list_comp': 0, 'dict_comp': 0, 'lambda': 0, 'decorators': 0, 'type_hints': 0},
        "error_handling_patterns": {'raise': 0, 'custom_exceptions': 0, 'bare_excepts': 0},
        "abstraction_level": {"type_hint_ratio": 0.0, "static_methods": 0, "class_methods": 0},
        "oop_composition_inheritance_tendencies": {'inheritance_count': 0, 'super_calls': 0, 'class_to_func_ratio': 0.0},
        "import_dependency_habits": {'aliased': 0, 'from_import': 0, 'relative': 0},
        "comment_style": {"inline_comments": 0, "block_comments": 0},
        "repeated_coding_idioms": {'is_none': 0, 'name_main': 0},
        "codedna_similarity_score": 0.0,
        "historical_variance_confidence": "HIGH"
    }
    
    all_loc, all_bytes, all_function_lengths, all_complexities = [], [], [], []
    all_identifier_lengths, all_nesting_depths = [], []
    funcs_per_file, classes_per_file, all_imports = [], [], []
    
    if os.path.exists(repo_dir):
        dna["repo_count_usable_files_languages"]["total_repos"] = len([d for d in os.listdir(repo_dir) if os.path.isdir(os.path.join(repo_dir, d))])
        for root, dirs, files in os.walk(repo_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                filepath = os.path.join(root, file)
                if not is_usable_file(filepath): continue
                if os.path.splitext(file)[1].lower() not in CODE_EXTENSIONS: continue
                    
                dna["repo_count_usable_files_languages"]["usable_files"] += 1
                
                m = analyze_file(filepath)
                lang = m["lang"]
                dna["repo_count_usable_files_languages"]["languages"][lang] = dna["repo_count_usable_files_languages"]["languages"].get(lang, 0) + 1
                
                all_loc.append(m["loc"])
                all_bytes.append(m["bytes"])
                all_function_lengths.extend(m["function_lengths"])
                all_identifier_lengths.extend(m["identifier_lengths"])
                all_nesting_depths.extend(m["nesting_depths"])
                
                if m["lang"] == 'python': all_complexities.extend(m["complexities"])
                else:
                    if m["complexities"]: all_complexities.append(sum(m["complexities"]))
                        
                funcs_per_file.append(m["functions"])
                classes_per_file.append(m["classes"])
                all_imports.extend(m["imports"])
                
                # Accumulate flat counts
                for k in ["todos", "bare_excepts", "evals", "secrets", "magic_numbers"]:
                    dna["code_quality_error_patterns"][k] += m[k]
                dna["error_handling_patterns"]["bare_excepts"] += m["bare_excepts"]
                
                dna["comment_docstring_patterns"]["comment_lines"] += m["comment_lines"]
                dna["comment_docstring_patterns"]["docstrings"] += m["docstrings"]
                dna["comment_style"]["inline_comments"] += m["inline_comments"]
                dna["comment_style"]["block_comments"] += m["block_comments"]
                
                for k in ["spaces_indent", "tabs_indent", "trailing_ws", "single_quotes", "double_quotes"]:
                    dna["formatting_indentation_fingerprint"][k] += m[k]
                    
                for name, ntype in m["names"]:
                    dna["naming_convention_distribution"][classify_name(name)] += 1
                    
                for dict_key in ["control_flow", "ast_structures", "error_handling", "oop", "import_habits", "idioms"]:
                    target_key = dict_key + "_patterns" if dict_key in ["control_flow", "error_handling"] else dict_key
                    if target_key == "ast_structures": target_key = "ast_structural_patterns"
                    elif target_key == "oop": target_key = "oop_composition_inheritance_tendencies"
                    elif target_key == "import_habits": target_key = "import_dependency_habits"
                    elif target_key == "idioms": target_key = "repeated_coding_idioms"
                    
                    for k, v in m[dict_key].items():
                        if k in dna[target_key]:
                            dna[target_key][k] += v
                        elif k in dna.get("abstraction_level", {}):
                            dna["abstraction_level"][k] += v
                            
    # Compute stats
    dna["loc_distribution"] = compute_stats(all_loc)
    dna["file_size_distribution"] = compute_stats(all_bytes)
    dna["identifier_length_distribution"] = compute_stats(all_identifier_lengths)
    dna["nesting_depth_distribution"] = compute_stats(all_nesting_depths)
    
    total_loc = dna["loc_distribution"]["total"]
    dna["comment_docstring_patterns"]["comment_to_code_ratio"] = (dna["comment_docstring_patterns"]["comment_lines"] / total_loc) if total_loc > 0 else 0
    
    tot_funcs = sum(funcs_per_file)
    tot_classes = sum(classes_per_file)
    dna["function_class_distribution"] = {
        "total_functions": tot_funcs, "total_classes": tot_classes,
        "functions_per_file": compute_stats(funcs_per_file), "classes_per_file": compute_stats(classes_per_file),
        "function_length_distribution": compute_stats(all_function_lengths)
    }
    
    if tot_funcs > 0:
        dna["oop_composition_inheritance_tendencies"]["class_to_func_ratio"] = tot_classes / tot_funcs
        
    if dna["ast_structural_patterns"]["type_hints"] > 0:
        dna["abstraction_level"]["type_hint_ratio"] = dna["ast_structural_patterns"]["type_hints"] / max(1, tot_funcs)
    
    dna["complexity_distribution"] = compute_stats(all_complexities)
    uniq_imports = list(set(all_imports))
    dna["dependency_library_fingerprint"]["all"] = uniq_imports
    
    frameworks = []
    if any(i in uniq_imports for i in ['fastapi', 'flask', 'django']): frameworks.append('Python Web')
    if any(i in uniq_imports for i in ['react', 'next', 'vue']): frameworks.append('Frontend JS/TS')
    dna["framework_fingerprint"] = frameworks
    
    if len(frameworks) > 1: dna["architecture_fingerprint"].append('Multi-stack/Modular')
    elif dna["repo_count_usable_files_languages"]["usable_files"] < 5: dna["architecture_fingerprint"].append('Script-based')
    else: dna["architecture_fingerprint"].append('Monolith')

    # Reliability and Variance Confidence
    files_count = dna["repo_count_usable_files_languages"]["usable_files"]
    reliability = 40 if files_count > 50 else (20 if files_count > 10 else 0)
    if dna["repo_count_usable_files_languages"]["total_repos"] > 2: reliability += 30
    if total_loc > 0 and dna["loc_distribution"]["mean"] > 50: reliability += 30
    dna["baseline_reliability_score"] = min(100, reliability)
    
    # Simple variance logic based on naming consistency
    names = dna["naming_convention_distribution"]
    total_names = sum(names.values())
    if total_names > 0:
        max_style = max(names.values()) / total_names
        if max_style > 0.8: dna["historical_variance_confidence"] = "HIGH"
        elif max_style > 0.5: dna["historical_variance_confidence"] = "MEDIUM"
        else: dna["historical_variance_confidence"] = "LOW"

    return dna

def compare_codedna(baseline_dna: Dict[str, Any], submission_dna: Dict[str, Any]) -> Dict[str, Any]:
    # Phase 2: Compute CodeDNA Similarity Score (0-100)
    score = 100.0
    
    # 1. Formatting match (Weight: 20%)
    b_fmt = baseline_dna.get("formatting_indentation_fingerprint", {})
    s_fmt = submission_dna.get("formatting_indentation_fingerprint", {})
    b_pref = 'spaces' if b_fmt.get("spaces_indent", 0) > b_fmt.get("tabs_indent", 0) else 'tabs'
    s_pref = 'spaces' if s_fmt.get("spaces_indent", 0) > s_fmt.get("tabs_indent", 0) else 'tabs'
    if b_pref != s_pref and sum(b_fmt.values()) > 0 and sum(s_fmt.values()) > 0: score -= 20.0
        
    # 2. Naming Conventions (Weight: 20%)
    b_names = baseline_dna.get("naming_convention_distribution", {})
    s_names = submission_dna.get("naming_convention_distribution", {})
    b_primary = max(b_names, key=b_names.get) if sum(b_names.values()) > 0 else None
    s_primary = max(s_names, key=s_names.get) if sum(s_names.values()) > 0 else None
    if b_primary and s_primary and b_primary != s_primary: score -= 20.0
        
    # 3. Complexity & Size Distribution (Weight: 30%)
    b_comp = baseline_dna.get("complexity_distribution", {}).get("mean", 0)
    s_comp = submission_dna.get("complexity_distribution", {}).get("mean", 0)
    if b_comp > 0:
        variance = abs(b_comp - s_comp) / b_comp
        if variance > 0.5: score -= 15.0
        elif variance > 0.2: score -= 5.0
            
    b_mean_loc = baseline_dna.get("loc_distribution", {}).get("mean", 0)
    s_mean_loc = submission_dna.get("loc_distribution", {}).get("mean", 0)
    if b_mean_loc > 0:
        variance = abs(b_mean_loc - s_mean_loc) / b_mean_loc
        if variance > 0.5: score -= 15.0
        elif variance > 0.2: score -= 5.0
            
    # 4. Idioms & Error Handling (Weight: 30%)
    # Very basic deviation penalty for OOP and idiomatic habits
    b_oop = baseline_dna.get("oop_composition_inheritance_tendencies", {}).get("class_to_func_ratio", 0)
    s_oop = submission_dna.get("oop_composition_inheritance_tendencies", {}).get("class_to_func_ratio", 0)
    if abs(b_oop - s_oop) > 0.5: score -= 15.0
    
    b_bare_excepts = baseline_dna.get("error_handling_patterns", {}).get("bare_excepts", 0)
    s_bare_excepts = submission_dna.get("error_handling_patterns", {}).get("bare_excepts", 0)
    if b_bare_excepts == 0 and s_bare_excepts > 2: score -= 15.0 # Sudden introduction of bad practice

    submission_dna["codedna_similarity_score"] = max(0.0, score)
    submission_dna["historical_consistency_score"] = max(0.0, score) # Alias for Phase 1 backwards comp
    
    return {
        "baseline_metrics": baseline_dna,
        "submission_metrics": submission_dna,
        "codedna_similarity_score": submission_dna["codedna_similarity_score"],
        "historical_consistency_score": submission_dna["historical_consistency_score"],
        "anomalies": []
    }
