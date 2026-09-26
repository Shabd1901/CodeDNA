#!/usr/bin/env python3
"""
CodeDNA Scientific Evaluation Lab CLI Runner
Executes 14 controlled academic integrity test scenarios against ground-truth metadata,
calculates empirical performance metrics, outputs a terminal report, and saves JSON results.
"""

import sys
import json
from pathlib import Path

# Add backend directory to sys.path so ml_engine can be imported
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from ml_engine.benchmark_runner import run_empirical_benchmarks

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("==========================================================================")
    print("           CodeDNA SCIENTIFIC EVALUATION LAB & BENCHMARK SUITE           ")
    print("==========================================================================")
    print("Executing 14 Controlled Academic Integrity Scenarios...")
    print("Evaluating Ground Truth vs Observed Metrics vs Model Inference...\n")

    results = run_empirical_benchmarks()
    summary = results["benchmark_summary"]
    cm = results["confusion_matrix"]
    scenarios = results["scenarios"]

    print("--- BENCHMARK SUMMARY & EMPIRICAL METRICS ---")
    print(f"Total Scenarios Evaluated : {summary['total_cases']}")
    print(f"Correct Classifications   : {summary['correct_behavioral_classifications']}/{summary['total_cases']} ({summary['accuracy']}%)")
    print(f"Precision                 : {summary['precision']}%")
    print(f"Recall (Sensitivity)      : {summary['recall_sensitivity']}%")
    print(f"Specificity (TNR)         : {summary['specificity']}%")
    print(f"False Positive Rate (FPR) : {summary['false_positive_rate']}% (Target: 0.0%)")
    print(f"F1-Score                  : {summary['f1_score']}%")
    print(f"Adversarial Defense       : {summary['overall_adversarial_resilience']}%")
    print(f"Deterministic Accuracy    : {summary['deterministic_engine_accuracy']}%")
    print(f"ML Engine Accuracy        : {summary['ml_engine_accuracy']}%\n")

    print("--- CONFUSION MATRIX ---")
    print(f"  True Positives  (TP) : {cm['true_positives']} (Anomalies correctly detected)")
    print(f"  False Positives (FP) : {cm['false_positives']} (Clean code misflagged - MUST BE 0)")
    print(f"  False Negatives (FN) : {cm['false_negatives']} (Subtle anomalies missed)")
    print(f"  True Negatives  (TN) : {cm['true_negatives']} (Benign work cleared)\n")

    print("--- 14 SCENARIO EVALUATION BREAKDOWN ---")
    print(f"{'ID':<32} {'Outcome':<6} {'Observed P(Disc)':<18} {'Verdict':<18} {'Status'}")
    print("-" * 88)

    for sc in scenarios:
        sc_id = sc['id']
        outcome = sc['outcome']
        prob = f"{sc['model_inference']['calibrated_probability'] * 100:.1f}%"
        verdict = sc['model_inference']['verdict']
        status = "[PASS] MATCH" if sc['accuracy_verdict'] == "MATCH" else "[MISMATCH]"
        print(f"{sc_id:<32} {outcome:<6} {prob:<18} {verdict:<18} {status}")

    # Save JSON Report
    report_path = Path(__file__).parent.parent / "docs" / "evaluation_lab_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"\n✓ Full JSON evaluation report saved to: {report_path.resolve()}")
    print("==========================================================================")

if __name__ == "__main__":
    main()
