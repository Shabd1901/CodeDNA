import os
import json
from google import genai
from google.genai import types

_client = None

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
You will receive structured Phase 4 CodeDNA metrics comparing a historical baseline against a new submission.
Your job is to interpret the deeply mathematical structural/stylistic/complexity shifts and output a highly rigorous forensic report.

CRITICAL RULES:
1. NEVER output pseudoscientific certainty like "87% AI-written". Use categorical signals (High/Moderate/Low).
2. Base all findings STRICTLY on the deterministic deviations provided (e.g. structural_deviation, complexity_deviation, exact_suspicious_regions).
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


async def generate_forensic_report(comparison_data: dict) -> tuple[dict, str]:
    """Analyze deterministic comparison data using Google Gemini Flash with automatic non-blocking failover."""
    import asyncio

    primary_model = (os.getenv("GEMINI_MODEL") or "gemini-3.5-flash-lite").strip()
    fallback_chain = [primary_model, "gemini-3.5-flash-lite", "gemini-3.5-flash"]
    candidate_models = []
    for m in fallback_chain:
        if m not in candidate_models:
            candidate_models.append(m)

    client = _get_client()
    prompt = f"{SYSTEM_PROMPT}\n\nAnalyze this CodeDNA comparison data:\n\n{json.dumps(comparison_data, indent=2)}"

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
            result = json.loads(response.text)
            return result, f"gemini ({model_name})"
        except Exception as e:
            last_error = e
            error_msg = str(e)
            print(f"Model {model_name} failed ({error_msg[:120]}). Immediately switching to fallback model…")
            continue

    raise RuntimeError(f"All Gemini models in fallback chain failed. Last error: {str(last_error)}")


