"""
CodeDNA Cross-Language Universal AST Normalization Engine
Provides standardized AST parsing across Python, JavaScript, TypeScript, Java, and C-family languages.
Maps language-specific constructs into language-agnostic CodeDNA semantic nodes.
"""

import os
import re
from typing import Dict, Any, List, Tuple

class UniversalFileMetrics:
    def __init__(self, filepath: str, lang: str, content: str):
        self.filepath = filepath
        self.lang = lang
        self.content = content
        self.lines = content.splitlines()
        self.loc = len([l for l in self.lines if l.strip() and not l.strip().startswith(("#", "//", "/*", "*"))])
        
        # Unified Metric Containers
        self.functions = 0
        self.classes = 0
        self.imports = []
        self.names = []  # (name, type)
        self.function_lengths = []
        self.complexities = []
        self.docstrings = 0
        self.identifier_lengths = []
        self.nesting_depths = []
        
        self.control_flow = {
            'if': 0, 'for': 0, 'while': 0, 'try': 0, 
            'break': 0, 'continue': 0, 'yield': 0, 'await': 0,
            'switch': 0, 'ternary': 0
        }
        self.ast_structures = {
            'list_comp': 0, 'dict_comp': 0, 'lambda': 0, 
            'decorators': 0, 'type_hints': 0, 'interfaces': 0,
            'generics': 0
        }
        self.error_handling = {
            'raise': 0, 'custom_exceptions': 0, 'bare_excepts': 0, 'finally': 0
        }
        self.oop = {
            'inheritance_count': 0, 'super_calls': 0, 
            'static_methods': 0, 'class_methods': 0, 'interfaces': 0
        }
        self.import_habits = {
            'aliased': 0, 'from_import': 0, 'relative': 0, 'default_import': 0
        }
        self.idioms = {
            'is_none': 0, 'name_main': 0, 'arrow_functions': 0, 'destructuring': 0
        }
        self.function_details = []
        
        # Style & Hygiene
        self.comment_lines = 0
        self.inline_comments = 0
        self.block_comments = 0
        self.todos = 0
        self.bare_excepts = 0
        self.evals = 0
        self.secrets = 0
        self.ai_patterns = 0
        self.spaces_indent = 0
        self.tabs_indent = 0
        self.trailing_ws = 0
        self.single_quotes = 0
        self.double_quotes = 0
        self.magic_numbers = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "lang": self.lang,
            "bytes": len(self.content.encode('utf-8', errors='ignore')),
            "loc": max(1, self.loc),
            "functions": self.functions,
            "classes": self.classes,
            "imports": self.imports,
            "names": self.names,
            "function_lengths": self.function_lengths,
            "complexities": self.complexities,
            "docstrings": self.docstrings,
            "identifier_lengths": self.identifier_lengths,
            "nesting_depths": self.nesting_depths,
            "control_flow": self.control_flow,
            "ast_structures": self.ast_structures,
            "error_handling": self.error_handling,
            "oop": self.oop,
            "import_habits": self.import_habits,
            "idioms": self.idioms,
            "function_details": self.function_details,
            "comment_lines": self.comment_lines,
            "inline_comments": self.inline_comments,
            "block_comments": self.block_comments,
            "todos": self.todos,
            "bare_excepts": self.bare_excepts,
            "evals": self.evals,
            "secrets": self.secrets,
            "ai_patterns": self.ai_patterns,
            "spaces_indent": self.spaces_indent,
            "tabs_indent": self.tabs_indent,
            "trailing_ws": self.trailing_ws,
            "single_quotes": self.single_quotes,
            "double_quotes": self.double_quotes,
            "magic_numbers": self.magic_numbers
        }

RESERVED_KEYWORDS = {
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
    "switch", "case", "default", "break", "continue", "try", "catch", "finally", "throw",
    "new", "this", "super", "class", "extends", "implements", "import", "export", "from",
    "as", "async", "await", "yield", "null", "undefined", "true", "false", "typeof",
    "instanceof", "interface", "type", "public", "private", "protected", "static", "readonly",
    "void", "int", "string", "boolean", "any", "number", "package", "final", "abstract",
    "synchronized", "native", "transient", "volatile", "strictfp", "throws", "byte", "short",
    "char", "long", "float", "double", "enum", "assert", "console", "log", "process",
    "document", "window", "require", "module", "exports", "struct", "fn", "impl", "trait",
    "mut", "pub", "match", "defer", "go", "select", "chan", "map", "range"
}

def parse_javascript_typescript(filepath: str, content: str) -> Dict[str, Any]:
    """
    Language-Agnostic Parser for JavaScript / TypeScript / JSX / TSX.
    Extracts class structures, arrow functions, async/await, interfaces, and complexity.
    """
    metrics = UniversalFileMetrics(filepath, "typescript" if filepath.endswith((".ts", ".tsx")) else "javascript", content)
    lines = content.splitlines()

    bracket_level = 0
    in_block_comment = False
    current_fn = None
    fn_start_line = 0
    fn_bracket_start = 0

    # AI Pattern Markers commonly present in LLM JS/TS code
    ai_comment_patterns = [
        re.compile(r"//\s*(step \d+|here is the implementation|helper function|handle edge cases)", re.IGNORECASE),
        re.compile(r"/\*\s*(overview|implementation details|todo: replace with your own)\s*\*/", re.IGNORECASE)
    ]

    for line_idx, raw_line in enumerate(lines, 1):
        line = raw_line.strip()

        # Formatting geometry
        if raw_line.startswith("\t"): metrics.tabs_indent += 1
        elif raw_line.startswith("  "): metrics.spaces_indent += 1
        if raw_line.endswith(" ") or raw_line.endswith("\t"): metrics.trailing_ws += 1
        metrics.single_quotes += line.count("'")
        metrics.double_quotes += line.count('"')

        # Block comment tracking
        if "/*" in line: in_block_comment = True
        if in_block_comment:
            metrics.block_comments += 1
            if "*/" in line: in_block_comment = False
            continue

        if line.startswith("//"):
            metrics.comment_lines += 1
            metrics.inline_comments += 1
            if "TODO" in line or "FIXME" in line: metrics.todos += 1
            for pat in ai_comment_patterns:
                if pat.search(line): metrics.ai_patterns += 1
            continue

        if not line: continue

        # Identifiers & Magic numbers
        tokens = re.findall(r"\b[A-Za-z_][A-Za-z0-9_]*\b", line)
        for t in tokens:
            if t.lower() not in RESERVED_KEYWORDS and len(t) > 1:
                metrics.names.append((t, "identifier"))
                metrics.identifier_lengths.append(len(t))
        numbers = re.findall(r"\b\d+\b", line)
        if len(numbers) > 3: metrics.magic_numbers += len(numbers) - 3

        # Imports & Dependencies
        if line.startswith("import ") or "require(" in line:
            metrics.control_flow["await"] += line.count("await ")
            metrics.imports.append(line[:60])
            if "from " in line: metrics.import_habits["from_import"] += 1
            if " as " in line: metrics.import_habits["aliased"] += 1
            if line.startswith("./") or "../" in line: metrics.import_habits["relative"] += 1
            continue

        # Classes & Interfaces
        if re.search(r"\bclass\s+([A-Za-z0-9_]+)", line):
            metrics.classes += 1
            if "extends " in line: metrics.oop["inheritance_count"] += 1
            if "implements " in line: metrics.oop["interfaces"] += 1
        if re.search(r"\binterface\s+([A-Za-z0-9_]+)", line):
            metrics.ast_structures["interfaces"] += 1
            metrics.classes += 1

        # TypeScript Type Annotations & Generics
        if "<" in line and ">" in line and not line.startswith("<"):
            if re.search(r"<[A-Z][A-Za-z0-9_,\s]*>", line):
                metrics.ast_structures["generics"] += 1
        if re.search(r":\s*[A-Z][A-Za-z0-9_]*(\[\])?", line) or "type " in line:
            metrics.ast_structures["type_hints"] += 1

        # Functions (Standard, Arrow, Async, Method)
        fn_match = re.search(r"\b(function\s+([A-Za-z0-9_]+)|async\s+function|const\s+([A-Za-z0-9_]+)\s*=\s*(async\s*)?\([^)]*\)\s*=>|([A-Za-z0-9_]+)\s*\([^)]*\)\s*[:{])", line)
        if fn_match and not current_fn and "{" in line:
            fn_name = fn_match.group(2) or fn_match.group(3) or fn_match.group(5) or "anonymous_fn"
            current_fn = fn_name
            fn_start_line = line_idx
            fn_bracket_start = bracket_level
            metrics.functions += 1
            if "=>" in line: metrics.idioms["arrow_functions"] += 1

        # Control Flow & Complexity triggers
        if re.search(r"\bif\s*\(", line): metrics.control_flow["if"] += 1
        if re.search(r"\bfor\s*\(", line): metrics.control_flow["for"] += 1
        if re.search(r"\bwhile\s*\(", line): metrics.control_flow["while"] += 1
        if re.search(r"\bswitch\s*\(", line): metrics.control_flow["switch"] += 1
        if " ? " in line and " : " in line: metrics.control_flow["ternary"] += 1
        if "try {" in line or line.startswith("try"): metrics.control_flow["try"] += 1
        if "catch" in line:
            if "catch {" in line or "catch ()" in line: metrics.error_handling["bare_excepts"] += 1
        if "finally" in line: metrics.error_handling["finally"] += 1
        if "throw " in line: metrics.error_handling["raise"] += 1
        if "await " in line: metrics.control_flow["await"] += 1
        if "yield " in line: metrics.control_flow["yield"] += 1
        if "super(" in line: metrics.oop["super_calls"] += 1
        if "static " in line: metrics.oop["static_methods"] += 1
        if "eval(" in line: metrics.evals += 1

        # Track Brackets & Function scopes
        open_b = line.count("{")
        close_b = line.count("}")
        bracket_level += (open_b - close_b)
        metrics.nesting_depths.append(max(0, bracket_level))

        # Function end detection
        if current_fn and bracket_level <= fn_bracket_start:
            fn_len = line_idx - fn_start_line + 1
            metrics.function_lengths.append(fn_len)
            
            # Approximate function cyclomatic complexity
            # 1 base + (branches & loops within function)
            fn_comp = 1 + line.count("if ") + line.count("for ") + line.count("while ") + line.count("case ") + line.count("&&") + line.count("||")
            metrics.complexities.append(max(1, fn_comp))
            metrics.function_details.append({
                "name": current_fn,
                "line": fn_start_line,
                "length": fn_len,
                "complexity": max(1, fn_comp)
            })
            current_fn = None

    if not metrics.complexities and metrics.loc > 0:
        metrics.complexities.append(max(1, int(metrics.control_flow["if"] + metrics.control_flow["for"] + 1)))

    return metrics.to_dict()

def parse_java(filepath: str, content: str) -> Dict[str, Any]:
    """
    Language-Agnostic Parser for Java code.
    Extracts class definitions, methods, annotations, typed declarations, and complexity.
    """
    metrics = UniversalFileMetrics(filepath, "java", content)
    lines = content.splitlines()

    bracket_level = 0
    in_block_comment = False
    current_fn = None
    fn_start_line = 0
    fn_bracket_start = 0

    for line_idx, raw_line in enumerate(lines, 1):
        line = raw_line.strip()

        # Formatting
        if raw_line.startswith("\t"): metrics.tabs_indent += 1
        elif raw_line.startswith("  "): metrics.spaces_indent += 1
        metrics.single_quotes += line.count("'")
        metrics.double_quotes += line.count('"')

        # Comments
        if "/*" in line: in_block_comment = True
        if in_block_comment:
            metrics.block_comments += 1
            if "*/" in line: in_block_comment = False
            continue
        if line.startswith("//"):
            metrics.comment_lines += 1
            if "TODO" in line: metrics.todos += 1
            continue

        if not line: continue

        # Identifiers
        tokens = re.findall(r"\b[A-Za-z_][A-Za-z0-9_]*\b", line)
        for t in tokens:
            if t.lower() not in RESERVED_KEYWORDS and len(t) > 1:
                metrics.names.append((t, "identifier"))
                metrics.identifier_lengths.append(len(t))

        # Imports
        if line.startswith("import "):
            metrics.imports.append(line.replace("import ", "").replace(";", "").strip())
            continue

        # Classes & Interfaces
        if re.search(r"\b(class|enum)\s+([A-Za-z0-9_]+)", line):
            metrics.classes += 1
            if "extends " in line: metrics.oop["inheritance_count"] += 1
            if "implements " in line: metrics.oop["interfaces"] += 1
        if re.search(r"\binterface\s+([A-Za-z0-9_]+)", line):
            metrics.oop["interfaces"] += 1

        # Generics & Type Hints
        if "<" in line and ">" in line:
            metrics.ast_structures["generics"] += 1
        metrics.ast_structures["type_hints"] += 1

        # Method signature detection (public/private/protected + return type + name + args)
        method_match = re.search(r"\b(public|private|protected|static|final)\s+([A-Za-z0-9_<>,\[\]]+)\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*(\{|throws)", line)
        if method_match and not current_fn and "{" in line:
            fn_name = method_match.group(3)
            current_fn = fn_name
            fn_start_line = line_idx
            fn_bracket_start = bracket_level
            metrics.functions += 1
            if "static " in line: metrics.oop["static_methods"] += 1

        # Control flow
        if re.search(r"\bif\s*\(", line): metrics.control_flow["if"] += 1
        if re.search(r"\bfor\s*\(", line): metrics.control_flow["for"] += 1
        if re.search(r"\bwhile\s*\(", line): metrics.control_flow["while"] += 1
        if re.search(r"\bswitch\s*\(", line): metrics.control_flow["switch"] += 1
        if " ? " in line and " : " in line: metrics.control_flow["ternary"] += 1
        if line.startswith("try") or "try {" in line: metrics.control_flow["try"] += 1
        if "throw new " in line: metrics.error_handling["raise"] += 1
        if "super(" in line: metrics.oop["super_calls"] += 1

        # Scope nesting
        open_b = line.count("{")
        close_b = line.count("}")
        bracket_level += (open_b - close_b)
        metrics.nesting_depths.append(max(0, bracket_level))

        if current_fn and bracket_level <= fn_bracket_start:
            fn_len = line_idx - fn_start_line + 1
            metrics.function_lengths.append(fn_len)
            fn_comp = 1 + line.count("if ") + line.count("for ") + line.count("while ") + line.count("case ")
            metrics.complexities.append(max(1, fn_comp))
            metrics.function_details.append({
                "name": current_fn,
                "line": fn_start_line,
                "length": fn_len,
                "complexity": max(1, fn_comp)
            })
            current_fn = None

    if not metrics.complexities and metrics.loc > 0:
        metrics.complexities.append(max(1, int(metrics.control_flow["if"] + 1)))

    return metrics.to_dict()

def parse_universal_file(filepath: str, content: str) -> Dict[str, Any]:
    """
    Dispatches to the appropriate language parser and returns normalized CodeDNA metrics.
    """
    ext = os.path.splitext(filepath)[1].lower()
    
    if ext in [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]:
        return parse_javascript_typescript(filepath, content)
    elif ext in [".java"]:
        return parse_java(filepath, content)
    elif ext in [".c", ".cpp", ".cc", ".h", ".hpp", ".cs", ".go", ".rs"]:
        # C-family parses with JS/TS-like block & bracket structural heuristics
        return parse_javascript_typescript(filepath, content)
    else:
        # Default fallback
        return parse_javascript_typescript(filepath, content)

def compute_cross_language_parity(baseline_dna: Dict[str, Any], submission_dna: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes semantic, structural, and cognitive invariant alignment when comparing
    repositories across different programming languages (e.g. Python -> TypeScript/Java).
    Distinguishes idiomatic conventions (e.g. snake_case in Python vs camelCase in TS)
    from anomalous behavioral divergence.
    """
    b_langs = baseline_dna.get("repo_count_usable_files_languages", {}).get("languages", {})
    s_langs = submission_dna.get("repo_count_usable_files_languages", {}).get("languages", {})
    
    b_primary = max(b_langs, key=b_langs.get) if b_langs else "unknown"
    s_primary = max(s_langs, key=s_langs.get) if s_langs else "unknown"
    
    is_cross = (b_primary != "unknown" and s_primary != "unknown" and b_primary != s_primary)
    
    if not is_cross:
        return {
            "is_cross_language": False,
            "primary_baseline_language": b_primary,
            "primary_submission_language": s_primary,
            "semantic_parity_score": 100.0,
            "cross_language_penalty_discount": 0.0,
            "idiomatic_adaptations": [],
            "language_invariant_metrics": {},
            "normalized_indicators": [f"Single-language baseline and submission match ({b_primary.upper()})."]
        }

    idiomatic_adaptations = []
    
    # 1. Naming Convention Idiomatic Translation
    b_names = baseline_dna.get("naming_convention_distribution", {})
    s_names = submission_dna.get("naming_convention_distribution", {})
    
    b_snake = b_names.get("snake_case", 0)
    s_camel = s_names.get("camelCase", 0)
    
    # Python -> TS/JS/Java idiomatic adoption
    if b_primary == "python" and s_primary in ["javascript", "typescript", "java", "csharp", "go"]:
        if s_camel >= s_names.get("snake_case", 0):
            idiomatic_adaptations.append(
                f"Idiomatic naming adoption: Author properly adopted {s_primary} standard 'camelCase' over Python 'snake_case'."
            )
    elif b_primary in ["javascript", "typescript", "java"] and s_primary == "python":
        if s_names.get("snake_case", 0) >= s_camel:
            idiomatic_adaptations.append(
                f"Idiomatic naming adoption: Author properly adopted Python 'snake_case' over historical 'camelCase'."
            )
            
    # 2. Invariant Cognitive Metrics:
    # A: Complexity Density: Average complexity per function / function length
    b_comp_mean = baseline_dna.get("complexity_distribution", {}).get("mean", 1.0)
    s_comp_mean = submission_dna.get("complexity_distribution", {}).get("mean", 1.0)
    b_fn_len = baseline_dna.get("function_class_distribution", {}).get("function_length_distribution", {}).get("mean", 10.0)
    s_fn_len = submission_dna.get("function_class_distribution", {}).get("function_length_distribution", {}).get("mean", 10.0)
    
    b_density = b_comp_mean / max(1.0, b_fn_len)
    s_density = s_comp_mean / max(1.0, s_fn_len)
    density_diff = abs(b_density - s_density) / max(0.01, b_density)
    comp_density_drift = min(100.0, density_diff * 40.0)
    
    # B: Nesting Depth Invariant
    b_nesting = baseline_dna.get("nesting_depth_distribution", {}).get("mean", 1.5)
    s_nesting = submission_dna.get("nesting_depth_distribution", {}).get("mean", 1.5)
    nesting_diff = abs(b_nesting - s_nesting) / max(0.5, b_nesting)
    nesting_drift = min(100.0, nesting_diff * 50.0)
    
    # C: Identifier Token Length Cadence
    b_id_len = baseline_dna.get("identifier_length_distribution", {}).get("mean", 6.0)
    s_id_len = submission_dna.get("identifier_length_distribution", {}).get("mean", 6.0)
    id_diff = abs(b_id_len - s_id_len) / max(1.0, b_id_len)
    ident_cadence_drift = min(100.0, id_diff * 40.0)
    
    # D: Comment Hygiene Cadence
    b_comment_ratio = baseline_dna.get("comment_docstring_patterns", {}).get("comment_to_code_ratio", 0.1)
    s_comment_ratio = submission_dna.get("comment_docstring_patterns", {}).get("comment_to_code_ratio", 0.1)
    comm_diff = abs(b_comment_ratio - s_comment_ratio) / max(0.05, b_comment_ratio)
    comment_drift = min(100.0, comm_diff * 40.0)
    
    # Overall Semantic Parity Score (100 = Identical Authorial Cognitive Style Across Languages)
    mean_invariant_drift = (comp_density_drift + nesting_drift + ident_cadence_drift + comment_drift) / 4.0
    semantic_parity_score = max(0.0, round(100.0 - mean_invariant_drift, 1))
    
    discount = 0.40 if len(idiomatic_adaptations) > 0 else 0.20
    
    indicators = [
        f"Cross-Language Transition: {b_primary.upper()} -> {s_primary.upper()}",
        f"Semantic Cognitive Parity: {semantic_parity_score}% match across language boundaries",
        f"Cognitive Density Drift: {round(comp_density_drift, 1)}% | Nesting Profile Drift: {round(nesting_drift, 1)}%",
        f"Identifier Token Cadence Drift: {round(ident_cadence_drift, 1)}% | Comment Habit Drift: {round(comment_drift, 1)}%"
    ]
    if idiomatic_adaptations:
        indicators.extend(idiomatic_adaptations)
        
    return {
        "is_cross_language": True,
        "primary_baseline_language": b_primary,
        "primary_submission_language": s_primary,
        "semantic_parity_score": semantic_parity_score,
        "cross_language_penalty_discount": discount,
        "idiomatic_adaptations": idiomatic_adaptations,
        "language_invariant_metrics": {
            "complexity_density_drift": round(comp_density_drift, 1),
            "nesting_profile_drift": round(nesting_drift, 1),
            "identifier_cadence_drift": round(ident_cadence_drift, 1),
            "comment_hygiene_drift": round(comment_drift, 1)
        },
        "normalized_indicators": indicators
    }

