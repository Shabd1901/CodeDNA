import os
import json
from datetime import datetime, timezone

_client = None

# Hard server-side cutoff: AI available through 10 October 2026. Disabled starting 11 October 2026.
AI_CUTOFF_DATE = datetime(2026, 10, 11, 0, 0, 0, tzinfo=timezone.utc)

def is_ai_available() -> bool:
    return datetime.now(timezone.utc) < AI_CUTOFF_DATE

def _api_key() -> str:
    return (os.getenv("GEMINI_API_KEY") or "").strip()

def _get_client():
    global _client
    if _client is None:
        key = _api_key()
        if not key:
            raise ValueError("GEMINI_API_KEY is not set in backend/.env")
        _client = genai.Client(api_key=key)
    return _client

SYSTEM_PROMPT = """You are an elite AI Forensic Investigator analyzing code submissions for authenticity. 
You will receive structured CodeDNA metrics (deterministic AST/style deviations, Siamese latent neural embedding distances, and calibrated statistical probabilities with confidence intervals) comparing a historical baseline against a new submission.
Your job is to interpret the deeply mathematical structural/stylistic/complexity shifts and output a highly rigorous forensic report.

CRITICAL RULES:
1. NEVER output pseudoscientific certainty like "87% AI-written". Use categorical signals (High/Moderate/Low) and cite calibrated probabilities (e.g. "Calibrated substitution probability: 74% [95% CI: 62%-86%]").
2. Base all findings STRICTLY on the deterministic deviations and ML embedding distances provided (e.g. structural_deviation, complexity_deviation, exact_suspicious_regions, ml_intelligence).
3. Think like a forensic auditor: What is the evidence? What is the contradictory evidence? What are the false-positive risks?
4. Pinpoint "Why the deviation matters" technically.
5. Provide actionable "VivaGuard" questions the evaluator can ask the student to verify authorship.

Output MUST be valid JSON matching this schema exactly:
{
  "executive_forensic_summary": "Deep analytical paragraph summarizing the behavioral shifts",
  "overall_investigation_score": 0,
  "evidence_strength": "String evaluating how strong the deviation evidence is",
  "baseline_reliability_analysis": "String interpreting the baseline reliability score",
  "investigation_status": "HIGH CONCERN | MODERATE CONCERN | CLEAR",
  "findings": [
    {
      "severity": "high | medium | low",
      "finding": "String title of the finding",
      "evidence": "String summarizing exactly what numbers/data back this up",
      "contradictory_evidence": "String - why this might NOT be AI/Cheating",
      "false_positive_considerations": "String - e.g. they might have learned this in a recent lecture",
      "confidence": "high | medium | low",
      "affected_files": ["list", "of", "files"],
      "exact_suspicious_regions_lines": ["list", "of", "lines or functions"],
      "why_deviation_matters": "String explaining the architectural/behavioral significance",
      "recommended_evaluator_action": "String"
    }
  ],
  "optional_vivaguard_questions": [
    "String question 1",
    "String question 2"
  ]
}"""


def _compact_comparison_data(data: dict) -> dict:
    """Strip bulky raw file matrices and trim lists to prevent exceeding Gemini free-tier TPM quotas."""
    import copy
    compacted = copy.deepcopy(data)
    
    # Strip bulky file_metrics lists that can contain thousands of lines
    if "baseline_dna" in compacted and isinstance(compacted["baseline_dna"], dict):
        compacted["baseline_dna"].pop("file_metrics", None)
    if "submission_dna" in compacted and isinstance(compacted["submission_dna"], dict):
        compacted["submission_dna"].pop("file_metrics", None)
        
    # Trim deviation score lists to top 8 items
    if "deviations" in compacted and isinstance(compacted["deviations"], dict):
        devs = compacted["deviations"]
        if "exact_suspicious_regions_lines" in devs and isinstance(devs["exact_suspicious_regions_lines"], list):
            devs["exact_suspicious_regions_lines"] = devs["exact_suspicious_regions_lines"][:8]
        if "per_function_anomaly_scores" in devs and isinstance(devs["per_function_anomaly_scores"], list):
            devs["per_function_anomaly_scores"] = devs["per_function_anomaly_scores"][:8]
        if "per_file_anomaly_scores" in devs and isinstance(devs["per_file_anomaly_scores"], list):
            devs["per_file_anomaly_scores"] = devs["per_file_anomaly_scores"][:8]
            
    # Trim temporal snapshots if present
    if "temporal_evolution" in compacted and isinstance(compacted["temporal_evolution"], dict):
        te = compacted["temporal_evolution"]
        if "milestones" in te and isinstance(te["milestones"], list):
            te["milestones"] = te["milestones"][:5]

    return compacted

async def generate_forensic_report(comparison_data: dict) -> tuple[dict, str]:
    """Analyze deterministic comparison data using Google Gemini Flash with automatic non-blocking failover and strict token budgeting."""
    if not is_ai_available():
        raise PermissionError("AI-powered forensic analysis is no longer available for this demonstration deployment (cutoff date: 10 October 2026). Core CodeDNA analysis remains available.")

    import asyncio

    primary_model = (os.getenv("GEMINI_MODEL") or "gemini-3.5-flash-lite").strip()
    fallback_chain = [primary_model, "gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash"]
    candidate_models = []
    for m in fallback_chain:
        if m not in candidate_models:
            candidate_models.append(m)

    client = _get_client()
    compact_data = _compact_comparison_data(comparison_data)
    data_str = json.dumps(compact_data, indent=2)
    # Hard safety cap: ensure prompt payload stays well under ~25k tokens (~80k chars)
    if len(data_str) > 60000:
        data_str = data_str[:60000] + "\n... [Remaining low-priority metrics truncated to protect token quota] }"
        
    prompt = f"{SYSTEM_PROMPT}\n\nAnalyze this CodeDNA comparison data:\n\n{data_str}"

    def _call_api(model_name: str):
        return client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            )
        )

    last_error = None
    for model_name in candidate_models:
        try:
            # Offload blocking SDK network request to thread pool
            response = await asyncio.to_thread(_call_api, model_name)
            
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            result = json.loads(raw_text.strip())
            return result, f"gemini ({model_name})"
        except Exception as e:
            last_error = e
            error_msg = str(e)
            print(f"Model {model_name} failed ({error_msg[:120]}). Immediately switching to fallback model…")
            continue

    err_str = str(last_error)
    if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
        raise RuntimeError("Gemini free-tier quota (250,000 tokens/min) temporarily exceeded. Please wait 45 seconds and retry.")
    raise RuntimeError(f"All Gemini models in fallback chain failed. Last error: {err_str}")


