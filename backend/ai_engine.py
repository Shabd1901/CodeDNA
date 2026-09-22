import os
import json
from openai import AsyncOpenAI

# Initialize the OpenAI client (expects OPENAI_API_KEY environment variable)
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def generate_forensic_report(comparison_data: dict) -> dict:
    """Analyze the deterministic comparison data using OpenAI to produce a forensic report."""
    
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
        response = await client.chat.completions.create(
            model="gpt-4o",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this deterministic comparison data:\n\n{json.dumps(comparison_data, indent=2)}"}
            ],
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        # Fallback if OpenAI fails or is not configured
        return {
            "error": str(e),
            "summary": "AI analysis failed. Please check OpenAI API configuration.",
            "findings": []
        }
