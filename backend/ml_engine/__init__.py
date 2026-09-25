"""
CodeDNA ML Engine Package
"""

from .feature_extractor import extract_dense_feature_vector, FEATURE_NAMES, DIMENSION_COUNT
from .siamese_model import project_siamese_embedding, compute_embedding_distance, explain_feature_attribution
from .calibrator import calibrate_probability
from .hybrid_scorer import run_hybrid_forensic_analysis

__all__ = [
    "extract_dense_feature_vector",
    "FEATURE_NAMES",
    "DIMENSION_COUNT",
    "project_siamese_embedding",
    "compute_embedding_distance",
    "explain_feature_attribution",
    "calibrate_probability",
    "run_hybrid_forensic_analysis"
]
