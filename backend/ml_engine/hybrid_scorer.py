"""
CodeDNA Hybrid Forensic Scoring Engine
Synthesizes Deterministic Heuristics + Siamese Metric Embeddings + Statistical Platt Calibration.
"""

from typing import Dict, Any, List
from .feature_extractor import extract_dense_feature_vector
from .siamese_model import (
    project_siamese_embedding, 
    compute_embedding_distance, 
    explain_feature_attribution
)
from .calibrator import calibrate_probability

def run_hybrid_forensic_analysis(
    baseline_dna: Dict[str, Any], 
    submission_dna: Dict[str, Any],
    heuristic_deviations: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Executes hybrid ML inference:
    1. Feature extraction -> 48-dim vectors
    2. Siamese projection -> 24-dim L2 embeddings
    3. Distance & metric learning divergence
    4. Feature attribution
    5. Hybrid ensemble weighting
    6. Platt statistical probability calibration
    """
    # 1. Dense Feature Vectors
    base_vec = extract_dense_feature_vector(baseline_dna)
    sub_vec = extract_dense_feature_vector(submission_dna)

    # 2. Siamese Neural Projections
    base_emb = project_siamese_embedding(base_vec)
    sub_emb = project_siamese_embedding(sub_vec)

    # 3. Embedding Distance & Similarity
    emb_metrics = compute_embedding_distance(base_emb, sub_emb)

    # 4. Feature Attribution
    top_attributions = explain_feature_attribution(base_vec, sub_vec, top_k=5)

    # 5. Hybrid Ensemble Score
    # - Deterministic 10-vector heuristic deviation: 40%
    # - Siamese Latent Embedding divergence: 35%
    # - Anomaly / Structural outlier density: 25%
    det_dev = heuristic_deviations.get("overall_behavioral_stylistic_deviation_score", 50.0)
    # The heuristic score in analysis.py is a similarity score (100 - avg_dev), so deviation is:
    heuristic_divergence = max(0.0, min(100.0, 100.0 - det_dev))
    latent_divergence = emb_metrics["latent_divergence_score"]
    
    # Calculate structural outlier density from file anomalies
    per_file_anomalies = heuristic_deviations.get("per_file_anomaly_scores", [])
    if per_file_anomalies:
        avg_file_score = sum(f.get("anomaly_score", 0) for f in per_file_anomalies) / len(per_file_anomalies)
    else:
        avg_file_score = 0.0
    outlier_factor = min(100.0, avg_file_score)

    hybrid_composite_deviation = (
        (heuristic_divergence * 0.40) +
        (latent_divergence * 0.35) +
        (outlier_factor * 0.25)
    )

    # 6. Statistical Platt Calibration
    usable_files = baseline_dna.get("repo_count_usable_files_languages", {}).get("usable_files", 5)
    reliability = baseline_dna.get("baseline_reliability_score", 70.0)
    
    calibration = calibrate_probability(
        raw_deviation_score=hybrid_composite_deviation,
        baseline_usable_files=usable_files,
        baseline_reliability_score=reliability
    )

    return {
        "hybrid_composite_deviation": round(hybrid_composite_deviation, 1),
        "heuristic_divergence": round(heuristic_divergence, 1),
        "siamese_metrics": {
            "cosine_similarity": emb_metrics["cosine_similarity"],
            "euclidean_distance": emb_metrics["euclidean_distance"],
            "embedding_similarity_score": emb_metrics["similarity_score"],
            "latent_divergence_score": emb_metrics["latent_divergence_score"],
            "latent_dimension": 24,
            "architecture": "Siamese Feedforward Metric Projection Head (48 -> 32 -> 24 L2)"
        },
        "statistical_calibration": calibration,
        "feature_attributions": top_attributions,
        "baseline_vector_summary": {
            "dimensions": len(base_vec),
            "l2_norm": round(sum(v*v for v in base_vec) ** 0.5, 3)
        },
        "submission_vector_summary": {
            "dimensions": len(sub_vec),
            "l2_norm": round(sum(v*v for v in sub_vec) ** 0.5, 3)
        }
    }
