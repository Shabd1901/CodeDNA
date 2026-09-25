"""
CodeDNA Dense Feature Vector Extractor
Transforms raw AST and lexical dictionaries into a standardized 48-dimensional continuous feature vector.
"""

from typing import Dict, Any, List, Tuple
import math

FEATURE_NAMES = [
    # 1. Lexical / Naming (6)
    "snake_case_ratio", "camel_case_ratio", "pascal_case_ratio", 
    "upper_case_ratio", "single_letter_ratio", "avg_identifier_length_norm",
    
    # 2. Formatting & Indentation (6)
    "space_indent_ratio", "indent_size_4_ratio", "indent_size_2_ratio",
    "double_quote_ratio", "blank_line_density", "trailing_whitespace_density",
    
    # 3. Cyclomatic Complexity & Control Flow (8)
    "complexity_mean_norm", "complexity_p90_norm", "complexity_max_norm",
    "branch_density", "max_nesting_depth_norm", "loop_density",
    "early_return_ratio", "comprehension_to_loop_ratio",
    
    # 4. AST Structural Node Frequencies (12)
    "function_def_density", "class_def_density", "list_comp_density",
    "dict_comp_density", "lambda_density", "with_stmt_density",
    "try_stmt_density", "call_density", "assign_density",
    "type_annotated_assign_density", "return_density", "import_density",
    
    # 5. Abstraction & OOP (6)
    "class_to_function_ratio", "methods_per_class_norm", "type_hint_ratio",
    "docstring_coverage", "static_method_ratio", "inheritance_depth_norm",
    
    # 6. Error Handling & Safety (5)
    "exception_handling_density", "bare_except_ratio", "specific_except_ratio",
    "raise_density", "custom_exception_ratio",
    
    # 7. Dependency & Library Topology (5)
    "unique_deps_count_norm", "stdlib_dependency_ratio", "third_party_ratio",
    "framework_presence_oop", "framework_presence_functional"
]

DIMENSION_COUNT = len(FEATURE_NAMES)  # 48

def safe_div(numerator: float, denominator: float, default: float = 0.0) -> float:
    return float(numerator) / float(denominator) if denominator and denominator != 0 else default

def clamp(val: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    return max(min_val, min(max_val, float(val)))

def extract_dense_feature_vector(dna: Dict[str, Any]) -> List[float]:
    """
    Extracts a 48-dimensional normalized continuous vector from a CodeDNA dictionary.
    All dimensions are normalized into approximately [0.0, 1.0].
    """
    # 1. Lexical / Naming
    naming = dna.get("naming_convention_distribution", {})
    total_naming = sum(naming.values()) or 1
    snake = safe_div(naming.get("snake_case", 0), total_naming)
    camel = safe_div(naming.get("camelCase", 0), total_naming)
    pascal = safe_div(naming.get("PascalCase", 0), total_naming)
    upper = safe_div(naming.get("UPPER_CASE", 0), total_naming)
    single = safe_div(naming.get("single_letter", 0), total_naming)
    avg_len = clamp(safe_div(dna.get("lexical_metrics", {}).get("avg_identifier_length", 8.0), 30.0))

    # 2. Formatting & Indentation
    fmt = dna.get("formatting_indentation_fingerprint", {})
    space_ratio = clamp(fmt.get("space_indent_ratio", 0.95))
    indent_4 = clamp(fmt.get("indent_4_ratio", 0.90))
    indent_2 = clamp(fmt.get("indent_2_ratio", 0.05))
    dquote = clamp(fmt.get("double_quote_ratio", 0.50))
    blank_dense = clamp(fmt.get("blank_line_density", 0.15), 0.0, 0.5) * 2.0
    trailing_ws = clamp(fmt.get("trailing_whitespace_density", 0.0), 0.0, 0.2) * 5.0

    # 3. Complexity & Control Flow
    comp = dna.get("complexity_distribution", {})
    comp_mean = clamp(safe_div(comp.get("mean", 2.0), 15.0))
    comp_p90 = clamp(safe_div(comp.get("p90", 4.0), 25.0))
    comp_max = clamp(safe_div(comp.get("max", 8.0), 50.0))
    branch_dense = clamp(safe_div(comp.get("branch_density", 0.15), 0.5))
    
    flow = dna.get("control_flow_patterns", {})
    max_nest = clamp(safe_div(flow.get("max_nesting_depth", 3.0), 10.0))
    loop_dense = clamp(safe_div(flow.get("loop_density", 0.05), 0.25))
    early_ret = clamp(flow.get("early_return_ratio", 0.30))
    comp_ratio = clamp(flow.get("comprehension_to_loop_ratio", 0.20))

    # 4. AST Structural Node Frequencies
    ast = dna.get("ast_structural_patterns", {})
    loc_meta = dna.get("loc_distribution", {})
    total_loc = max(10, loc_meta.get("mean", 50) * max(1, dna.get("repo_count_usable_files_languages", {}).get("usable_files", 1)))
    
    fn_dense = clamp(safe_div(ast.get("FunctionDef", 0), total_loc) * 25.0)
    cls_dense = clamp(safe_div(ast.get("ClassDef", 0), total_loc) * 50.0)
    list_comp = clamp(safe_div(ast.get("ListComp", 0), total_loc) * 40.0)
    dict_comp = clamp(safe_div(ast.get("DictComp", 0), total_loc) * 80.0)
    lambda_d = clamp(safe_div(ast.get("Lambda", 0), total_loc) * 50.0)
    with_d = clamp(safe_div(ast.get("With", 0), total_loc) * 40.0)
    try_d = clamp(safe_div(ast.get("Try", 0), total_loc) * 40.0)
    call_d = clamp(safe_div(ast.get("Call", 0), total_loc) * 5.0)
    assign_d = clamp(safe_div(ast.get("Assign", 0), total_loc) * 10.0)
    ann_assign_d = clamp(safe_div(ast.get("AnnAssign", 0), total_loc) * 20.0)
    return_d = clamp(safe_div(ast.get("Return", 0), total_loc) * 20.0)
    import_d = clamp(safe_div(ast.get("Import", 0) + ast.get("ImportFrom", 0), total_loc) * 25.0)

    # 5. Abstraction & OOP
    abstr = dna.get("abstraction_level", {})
    cls_to_fn = clamp(safe_div(abstr.get("classes", 0), max(1, abstr.get("functions", 1))))
    methods_per_cls = clamp(safe_div(abstr.get("methods_per_class", 2.0), 12.0))
    type_hints = clamp(abstr.get("type_hint_ratio", 0.0))
    docstrings = clamp(abstr.get("docstring_coverage", 0.1))
    static_methods = clamp(abstr.get("static_method_ratio", 0.05))
    inheritance = clamp(safe_div(abstr.get("max_inheritance_depth", 1.0), 5.0))

    # 6. Error Handling & Safety
    err = dna.get("error_handling_patterns", {})
    err_density = clamp(safe_div(err.get("total_try_blocks", 0), total_loc) * 50.0)
    bare_ratio = clamp(err.get("bare_except_ratio", 0.0))
    spec_ratio = clamp(err.get("specific_except_ratio", 0.8))
    raise_d = clamp(safe_div(err.get("raise_statements", 0), total_loc) * 50.0)
    custom_exc = clamp(safe_div(err.get("custom_exceptions", 0), 5.0))

    # 7. Dependency & Library Topology
    deps = dna.get("dependency_library_fingerprint", {})
    all_deps = deps.get("all", [])
    unique_deps_norm = clamp(safe_div(len(all_deps), 25.0))
    stdlib_ratio = clamp(safe_div(len(deps.get("stdlib", [])), max(1, len(all_deps))))
    third_party_ratio = clamp(safe_div(len(deps.get("third_party", [])), max(1, len(all_deps))))
    
    arch = set(dna.get("architecture_fingerprint", []))
    arch_oop = 1.0 if "OOP" in arch else 0.0
    arch_func = 1.0 if "Functional" in arch else 0.0

    vector = [
        # Lexical (6)
        snake, camel, pascal, upper, single, avg_len,
        # Formatting (6)
        space_ratio, indent_4, indent_2, dquote, blank_dense, trailing_ws,
        # Complexity (8)
        comp_mean, comp_p90, comp_max, branch_dense, max_nest, loop_dense, early_ret, comp_ratio,
        # AST Structural (12)
        fn_dense, cls_dense, list_comp, dict_comp, lambda_d, with_d,
        try_d, call_d, assign_d, ann_assign_d, return_d, import_d,
        # Abstraction (6)
        cls_to_fn, methods_per_cls, type_hints, docstrings, static_methods, inheritance,
        # Error handling (5)
        err_density, bare_ratio, spec_ratio, raise_d, custom_exc,
        # Dependency & Arch (5)
        unique_deps_norm, stdlib_ratio, third_party_ratio, arch_oop, arch_func
    ]

    return vector
