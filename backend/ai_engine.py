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
        # Check if the user explicitly wants mock mode or has a placeholder key
        key = _api_key()
        if not key or key.lower() in {"mock", "your_openai_api_key_here", "changeme", "none", "null"}:
            return _generate_mock_report(comparison_data), "mock"

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
        # Gracefully fallback to mock on quota issues or connection errors
        error_msg = str(e)
        if "insufficient_quota" in error_msg or "credit_balance_exhausted" in error_msg or "429" in error_msg:
            print(f"OpenAI Quota Exhausted. Falling back to Mock Report.")
            return _generate_mock_report(comparison_data), "mock (quota exhausted fallback)"
        
        return {
            "error": error_msg,
            "executive_forensic_summary": f"AI analysis failed: {error_msg}",
            "findings": []
        }, "error"

def _generate_mock_report(data: dict) -> dict:
    """Generates a highly realistic mock Phase 5 report for UI testing without API costs."""
    return {
      "executive_forensic_summary": "[MOCK ANALYSIS] The submission demonstrates a highly sudden and suspicious architectural maturity. While the historical baseline CodeDNA indicates a rudimentary understanding of single-file imperative scripting, this submission employs advanced abstract base classes and highly optimized nested list comprehensions that do not align with the student's prior fingerprint.",
      "overall_investigation_score": 85,
      "evidence_strength": "Strong due to multiple highly suspicious structural deviations across the control-flow AST.",
      "baseline_reliability_analysis": "The historical baseline consists of over 50 files and 2,000 LOC, making the established CodeDNA signature highly reliable.",
      "investigation_status": "HIGH CONCERN",
      "findings": [
        {
          "severity": "high",
          "finding": "Sudden structural leap in nested comprehensions and OOP abstraction",
          "evidence": "Submission utilizes 14 complex list/dict comprehensions and 3 Abstract Base Classes, whereas the baseline contains 0 across its entire history.",
          "contradictory_evidence": "The student might have just learned this concept in a recent week's module and actively applied it.",
          "false_positive_considerations": "Week 6 syllabus explicitly covers list comprehensions. If this submission is from Week 6, the deviation is expected.",
          "confidence": "high",
          "affected_files": ["app/services/processor.py", "app/models/base.py"],
          "exact_suspicious_regions_lines": ["Line 42", "Line 115-120"],
          "why_deviation_matters": "It indicates a sudden leap from O(N^2) for-loops to functional map-reduce patterns, which is rarely an overnight organic transition for beginners.",
          "recommended_evaluator_action": "Ask the student to explain the mechanism behind the 'processor.py' dictionary comprehension in a Viva session."
        },
        {
          "severity": "medium",
          "finding": "Novel introduction of uncharacteristic libraries",
          "evidence": "Imports include 'concurrent.futures' and 'asyncio' which were completely absent from the 3 historical repositories.",
          "contradictory_evidence": "The assignment prompt may have specifically required asynchronous processing.",
          "false_positive_considerations": "Check the assignment rubric to see if threading/async was a grading criteria.",
          "confidence": "medium",
          "affected_files": ["app/main.py"],
          "exact_suspicious_regions_lines": ["Lines 1-5"],
          "why_deviation_matters": "Indicates a jump to multi-threading complexity.",
          "recommended_evaluator_action": "Verify if the assignment mandated concurrency."
        }
      ],
      "optional_vivaguard_questions": [
        "Can you walk me through why you chose to use an abstract base class here instead of a simple dictionary?",
        "Explain how the `concurrent.futures.ThreadPoolExecutor` is managing state in your `processor.py` file.",
        "Your code uses a nested dictionary comprehension on line 42. Could you rewrite that as standard for-loops right now?"
      ]
    }
