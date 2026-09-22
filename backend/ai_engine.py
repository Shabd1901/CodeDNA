import os
import json
from openai import AsyncOpenAI

PLACEHOLDER_KEYS = {"", "your_openai_api_key_here", "changeme", "none", "null"}

_client = None


def _truthy_env(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


def _api_key() -> str:
    return (os.getenv("OPENAI_API_KEY") or "").strip()


def resolve_ai_mode() -> str:
    """Return 'mock' when AI_MOCK is set or the API key is missing/placeholder."""
    if _truthy_env("AI_MOCK"):
        return "mock"
    key = _api_key()
    if not key or key.lower() in PLACEHOLDER_KEYS:
        return "mock"
    return "openai"


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=_api_key())
    return _client


def _mock_report() -> dict:
    return {
        "summary": "MOCK AI ANALYSIS: The submission shows significant deviation from the baseline CodeDNA, primarily in the use of high-level architectural patterns not present in historical repositories.",
        "findings": [
            {
                "severity": "high",
                "reason": "Sudden complexity spike in logic implementation",
                "evidence": "Average complexity jumped dramatically compared to the baseline. Historical code primarily used simple synchronous patterns.",
                "affected_files": ["src/app/page.tsx", "backend/main.py"],
                "affected_lines": ["L42-L80"],
                "confidence": "high",
                "limitations": "Could be explained by the student learning a new paradigm, but the speed of adoption is anomalous.",
                "recommended_action": "Conduct a brief code review asking the student to explain the transition to these patterns."
            }
        ]
    }


async def generate_forensic_report(comparison_data: dict) -> tuple[dict, str]:
    """Analyze deterministic comparison data. OpenAI is used only when AI_MOCK is off and a real key is set."""
    mode = resolve_ai_mode()
    if mode == "mock":
        return _mock_report(), mode

    system_prompt = """You are an AI Forensic Investigator analyzing student code submissions for authenticity. 
You will receive structured metrics comparing a student's historical 'CodeDNA' baseline against their new submission.
Your job is to interpret these metrics and identify potential anomalies (e.g., sudden jumps in complexity, unexpected new libraries, or architectural shifts).

CRITICAL RULES:
1. NEVER invent evidence. Base all findings STRICTLY on the provided data.
2. Do NOT claim authorship certainty. You only point out anomalies and deviations.
3. If the baseline reliability is 'Mixed' or 'Insufficient', mention it in your limitations.
4. Output MUST be valid JSON matching this schema exactly:
{
  "findings": [
    {
      "severity": "low" | "medium" | "high",
      "reason": "String explaining the finding",
      "evidence": "String summarizing the data points backing this",
      "affected_files": ["List", "of", "files"],
      "affected_lines": ["List", "of", "lines"],
      "confidence": "low" | "medium" | "high",
      "limitations": "String explaining what we can't be sure of",
      "recommended_action": "String"
    }
  ],
  "summary": "Overall investigation summary"
}"""

    try:
        response = await _get_client().chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this deterministic comparison data:\n\n{json.dumps(comparison_data, indent=2)}"}
            ],
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content), mode
    except Exception as e:
        return {
            "error": str(e),
            "summary": "AI analysis failed. Please check OpenAI API configuration.",
            "findings": []
        }, mode
