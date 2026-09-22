import os
import json
from openai import AsyncOpenAI

_client = None

def _api_key() -> str:
    return (os.getenv("OPENAI_API_KEY") or "").strip()

def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        key = _api_key()
        if not key or key.lower() in {"your_openai_api_key_here", "changeme", "none", "null"}:
            raise ValueError("OPENAI_API_KEY is not configured or valid in environment.")
        _client = AsyncOpenAI(api_key=key)
    return _client

async def generate_forensic_report(comparison_data: dict) -> tuple[dict, str]:
    """Analyze deterministic comparison data using OpenAI GPT-4o."""
    system_prompt = """You are an elite AI Forensic Investigator analyzing code submissions for authenticity. 
You will receive structured Phase 4 CodeDNA metrics comparing a historical baseline against a new submission.
Your job is to interpret the deeply mathematical structural/stylistic/complexity shifts and output a highly rigorous forensic report.

CRITICAL RULES:
1. NEVER output pseudoscientific certainty like "87% AI-written". Use categorical signals (High/Moderate/Low).
2. Base all findings STRICTLY on the deterministic deviations provided (e.g. structural_deviation, complexity_deviation, exact_suspicious_regions).
3. Think like a forensic auditor: What is the evidence? What is the contradictory evidence? What are the false-positive risks?
4. Pinpoint "Why the deviation matters" technically.
5. Provide actionable "VivaGuard" questions the evaluator can ask the student to verify authorship (e.g. asking them to explain the mechanism behind a specific flagged line).

Output MUST be valid JSON matching this schema exactly:
{
  "executive_forensic_summary": "Deep analytical paragraph summarizing the behavioral shifts",
  "overall_investigation_score": 0, // 0-100 indicating concern level (0=clear, 100=highly concerning)
  "evidence_strength": "String evaluating how strong the deviation evidence is",
  "baseline_reliability_analysis": "String interpreting the baseline's reliability score",
  "investigation_status": "HIGH CONCERN" | "MODERATE CONCERN" | "CLEAR",
  "findings": [
    {
      "severity": "high" | "medium" | "low",
      "finding": "String (e.g., 'Sudden structural leap in OOP abstraction')",
      "evidence": "String summarizing exactly what numbers/data back this up",
      "contradictory_evidence": "String (Why this might NOT be AI/Cheating)",
      "false_positive_considerations": "String (e.g., 'They might have learned this in the recent lecture')",
      "confidence": "high" | "medium" | "low",
      "affected_files": ["List", "of", "files"],
      "exact_suspicious_regions_lines": ["List", "of", "lines/functions"],
      "why_deviation_matters": "String explaining the architectural/behavioral significance",
      "recommended_evaluator_action": "String"
    }
  ],
  "optional_vivaguard_questions": [
    "String question 1",
    "String question 2"
  ]
}"""

    try:
        client = _get_client()
        response = await client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this CodeDNA comparison data:\n\n{json.dumps(comparison_data, indent=2)}"}
            ],
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content), "openai"
    except Exception as e:
        return {
            "error": str(e),
            "executive_forensic_summary": f"AI analysis failed: {str(e)}",
            "findings": []
        }, "error"
