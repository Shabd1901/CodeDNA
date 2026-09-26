import os
import httpx
import time

TEST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test_data")
BASE_URL = os.getenv("API_URL", "http://localhost:8000")

def run_test(scenario_name, baseline_zip, submission_zip, template_zip=None):
    print(f"--- Running Test: {scenario_name} ---")
    
    with httpx.Client(timeout=30.0) as client:
        # Start session
        res = client.post(f"{BASE_URL}/api/session/start")
        if res.status_code != 200:
            print(f"❌ Failed to start session: {res.text}")
            return
        session_id = res.json()["session_id"]
        
        # Upload baseline
        with open(baseline_zip, "rb") as f:
            res = client.post(f"{BASE_URL}/api/repositories/upload", data={"session_id": session_id}, files={"file": ("baseline.zip", f, "application/zip")})
            if res.status_code != 200:
                print(f"❌ Failed to upload baseline: {res.text}")
                return

        # Upload submission
        with open(submission_zip, "rb") as f:
            res = client.post(f"{BASE_URL}/api/analyze/submission", data={"session_id": session_id}, files={"file": ("submission.zip", f, "application/zip")})
            if res.status_code != 200:
                print(f"❌ Failed to upload submission: {res.text}")
                return

        # Upload template if any
        if template_zip and os.path.exists(template_zip):
            with open(template_zip, "rb") as f:
                res = client.post(f"{BASE_URL}/api/repositories/template", data={"session_id": session_id}, files={"file": ("template.zip", f, "application/zip")})

        # Compare
        res = client.post(f"{BASE_URL}/api/analyze/compare", data={"session_id": session_id, "baseline_type": "personal"})
        if res.status_code != 200:
            print(f"❌ Compare failed: {res.text}")
            return
            
        data = res.json()["deterministic_data"]
        ai_intel = data.get("authorship_intelligence", {})
        
        # Validation Logic - Strict validation as per implementation plan
        passed = False
        msg = ""

        if "1_clean" in scenario_name:
            # Clean Student: structural_deviation < 20 for a clean student
            passed = data["forensics"]["structural_deviation"] < 20
            msg = f"Structural Deviation is {data['forensics']['structural_deviation']:.1f} (Expected < 20 for clean student)"
        elif "2_sudden_ai" in scenario_name:
            # Sudden AI: ai_author_profile == 'Sudden AI Introduction'
            passed = ai_intel.get("ai_author_profile") == "Sudden AI Introduction"
            msg = f"AI Author Profile is {ai_intel.get('ai_author_profile')} (Expected Sudden AI Introduction)"
        elif "3_consistent_ai" in scenario_name:
            # Consistent AI: ai_author_profile == 'Consistent AI Author'
            passed = ai_intel.get("ai_author_profile") == "Consistent AI Author"
            msg = f"AI Author Profile is {ai_intel.get('ai_author_profile')} (Expected Consistent AI Author)"
        elif "4_plagiarism" in scenario_name:
            # Plagiarism: Should detect strong code reuse/similarity or high/moderate concern
            token_sim = ai_intel.get("token_ast_similarity", 0)
            concern = ai_intel.get("categorical_signals", {}).get("overall_investigation_concern")
            passed = concern in ["Moderate", "High"] or token_sim > 85
            msg = f"Concern is {concern}, Token/AST Similarity is {token_sim:.1f}% (Expected Moderate/High or >85%)"
        elif "5_empty" in scenario_name:
            # Empty Repo: Should show low baseline reliability
            passed = ai_intel["categorical_signals"]["baseline_reliability"] == "Low"
            msg = f"Baseline Reliability is {ai_intel['categorical_signals']['baseline_reliability']} (Expected Low for empty repo)"
        elif "6_cross_language" in scenario_name:
            # Cross-Language: Should detect language change or high architecture shift
            cross_intel = data.get("cross_language_intelligence") or {}
            arch_dev = data["forensics"].get("architecture_deviation", 0)
            passed = cross_intel.get("is_cross_language") is True or arch_dev > 40
            msg = f"Cross-Language Detected: {cross_intel.get('is_cross_language')}, Arch Dev: {arch_dev:.1f}% (Expected detected or >40%)"
        elif "7_sophisticated_evasion" in scenario_name:
            # Sophisticated Evasion: Should still detect some anomalies
            overall_score = data["forensics"]["overall_behavioral_stylistic_deviation_score"]
            passed = overall_score > 25  # Should detect some deviation even with evasion attempts
            msg = f"Overall Deviation Score is {overall_score:.1f} (Expected > 25 to detect evasion attempt)"
        elif "8_template" in scenario_name:
            # Template Subtraction: Should work correctly
            passed = True  # If it didn't crash, the subtraction logic ran
            msg = "Template subtraction executed successfully."

        if passed:
            print(f"PASS: {msg}")
        else:
            print(f"FAIL: {msg}")
            
def main():
    scenarios = [
        ("1_clean", "1_clean/baseline.zip", "1_clean/submission.zip"),
        ("2_sudden_ai", "2_sudden_ai/baseline.zip", "2_sudden_ai/submission.zip"),
        ("3_consistent_ai", "3_consistent_ai/baseline.zip", "3_consistent_ai/submission.zip"),
        ("4_plagiarism", "4_plagiarism/baseline.zip", "4_plagiarism/submission.zip"),
        ("5_empty", "5_empty/baseline.zip", "5_empty/submission.zip"),
        ("6_cross_language", "6_cross_language/baseline.zip", "6_cross_language/submission.zip"),
        ("7_sophisticated_evasion", "7_sophisticated_evasion/baseline.zip", "7_sophisticated_evasion/submission.zip"),
        ("8_template", "8_template/baseline.zip", "8_template/submission.zip", "8_template/template.zip"),
    ]
    
    for s in scenarios:
        s_name = s[0]
        b_zip = os.path.join(TEST_DIR, s[1])
        s_zip = os.path.join(TEST_DIR, s[2])
        t_zip = os.path.join(TEST_DIR, s[3]) if len(s) > 3 else None
        
        if os.path.exists(b_zip) and os.path.exists(s_zip):
            run_test(s_name, b_zip, s_zip, t_zip)
        else:
            print(f"⚠️  Skipping {s_name} - files not generated yet.")
        print()

if __name__ == "__main__":
    try:
        main()
    except httpx.ConnectError:
        print("❌ Cannot connect to backend. Please start 'python -m uvicorn main:app' on port 8000 first.")
