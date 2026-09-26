# CodeDNA External Evaluator Audit Report (Pass 2)

**Audit Date:** September 26, 2026  
**Evaluation Scope:** Strict End-to-End Product Flow Verification (Input → Processing → AI/Forensic Analysis → Structured Result → Usable UI Output)

---

## 1. Executive Summary

An exhaustive end-to-end evaluation was performed on the CodeDNA forensic platform to verify that all user interactions, ingestion pathways, deterministic AST extraction algorithms, Siamese neural calibration models, and AI forensic reasoning layers operate entirely on real, authentic data without broken states, CLI dependencies, or simulated mock placeholders.

During this pass, all 5 stages of the user journey were traced. Genuine gaps—including a simulated code preview fallback, omitted AI marker region anchors, and an inverted threshold check for clean student profiles—were identified and fixed while preserving all existing mathematical and forensic logic.

---

## 2. End-to-End User Journey Audit Matrix

| Stage | Expected Flow | CodeDNA Implementation | Verification Status |
| :--- | :--- | :--- | :--- |
| **1. Real Input Ingestion** | Ingestion of up to 20 historical reference ZIPs, multi-profile GitHub scanning, target submission archive, optional instructor starter template, or LMS cohort ZIP. | • `frontend/src/app/page.tsx`: Drag-and-drop intake cards with domain typo validation (`githuub.com` flags).<br>• `backend/main.py`: `/api/session/start`, `/api/repositories/upload`, `/api/repositories/github`, `/api/repositories/template`, `/api/analyze/submission`. | ✅ **VERIFIED** — Clean extraction, strict extension filtering (`.py`, `.js`, `.ts`, `.java`, etc.), no demo data seeding. |
| **2. Core Processing Engine** | AST extraction, multi-dimensional metric computation, boilerplate subtraction, and statistical baseline calibration. | • `backend/analysis.py`: `build_repository_codedna`, `subtract_template_dna`, `compare_codedna`.<br>• Evaluates 10 deviation dimensions (AST structure, naming, indentation, complexity, architecture, dependencies, abstraction, comment cadence, error handling). | ✅ **VERIFIED** — Non-linear sigmoid deviation curves, IQR/P90 distributions, and robust template subtraction. |
| **3. Machine Learning & Calibration** | Siamese neural latent projection and Platt logistic probability calibration with dynamic confidence intervals. | • `backend/ml_engine/siamese_model.py`: 48-dim feature projection onto 24-dim unit sphere.<br>• `backend/ml_engine/calibrator.py`: Platt sigmoid scaling producing $P(\text{Discontinuity} \mid \text{DNA})$ and 95% Wald CI. | ✅ **VERIFIED** — Deterministic fallback guarantees with mathematically grounded boundaries. |
| **4. AI Forensic Reasoning** | Interpretation of structural and neural evidence by LLM with strict token limits and structured schema output. | • `backend/ai_engine.py`: Google Gemini Flash with strict token budgeting (<25,000 tokens) and automatic fallback chain.<br>• Generates executive summary, categorized findings with false-positive guardrails, and VivaGuard interview questions. | ✅ **VERIFIED** — Validated live with Google Gemini API, returning structured JSON without hallucinations. |
| **5. Usable UI Output** | Interactive investigation workstation with 6 pipeline stages, traceable code inspector, and printable official dossier. | • `frontend/src/app/page.tsx` & components: Sticky context bar, Radar deviation chart, metric comparison grid, timeline view, code inspector, and A4-styled print dossier.<br>• Standalone Scientific Evaluation Lab with 14 empirical test cases. | ✅ **VERIFIED** — Zero build warnings, complete responsive rendering, print CSS overrides for physical/PDF export. |

---

## 3. Genuine Gaps Identified & Resolved

### Gap 1: Simulated Dummy Snippet in Evidence Code Inspector
- **Finding:** In [`frontend/src/components/EvidenceCodeInspector.tsx`](file:///c:/Users/praja/HomeSchool/Personal%20Projects/orchestrate/frontend/src/components/EvidenceCodeInspector.tsx), the code viewer previously used a simulated dummy line generator (`generateCodeLines`) with hardcoded mock text (`def process_data(...)`, `transform_structural_nodes(...)`).
- **Resolution:** Updated [`backend/analysis.py`](file:///c:/Users/praja/HomeSchool/Personal%20Projects/orchestrate/backend/analysis.py) to read authentic source code directly from `sub_dir` on disk for every flagged anomaly region and attach a structured `code_snippet` array (`lineNum`, `code`, `isFlagged`, `isComment`). Updated `EvidenceCodeInspector.tsx` to render the student's real uploaded code.

### Gap 2: Incomplete Suspicious Region Flagging for AI Markers & Bare Excepts
- **Finding:** In [`backend/analysis.py`](file:///c:/Users/praja/HomeSchool/Personal%20Projects/orchestrate/backend/analysis.py), `exact_suspicious_regions_lines` previously only appended functions exceeding P90 complexity. Explicit AI generation markers (such as `"As an AI..."`) and newly introduced dangerous primitives (`bare except:`, `eval`) were counted in aggregated stats but not anchored to specific line numbers in the evidence inspector.
- **Resolution:** Added line-level scans for `RE_AI_PATTERN` and `RE_BARE_EXCEPT` in `analysis.py`, appending exact line numbers, severity scores, and real contextual code snippets to `suspicious_regions`.

### Gap 3: Inverted Similarity Score Check for Clean Student Diagnoses
- **Finding:** In [`backend/analysis.py`](file:///c:/Users/praja/HomeSchool/Personal%20Projects/orchestrate/backend/analysis.py), line 702 checked `deviations["overall_behavioral_stylistic_deviation_score"] < 40` to declare `"Low Evidence"`. Because `overall_behavioral_stylistic_deviation_score` is a similarity metric ($100 - \text{average deviation}$), clean student submissions had similarity scores around ~90%, failing the `< 40` check and falling into `"Uncertain"` with `"Partial deviations detected"`.
- **Resolution:** Corrected the threshold logic to check `similarity_score >= 60.0`, accurately diagnosing matching work as `"Clean Student / Consistent Human Author"` with `"Low"` concern. Additionally mapped low similarity ($< 45.0$) to `"High Behavioral Drift"` with `"High"` concern.

### Gap 4: Gemini Fallback Chain Resilience
- **Finding:** In [`backend/ai_engine.py`](file:///c:/Users/praja/HomeSchool/Personal%20Projects/orchestrate/backend/ai_engine.py), the fallback model chain only contained preview model names, which could cause failures if specific preview models faced unexpected deprecation or regional rate limits.
- **Resolution:** Expanded the fallback chain to include `gemini-3.5-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, and `gemini-1.5-flash`.

### Gap 5: Test Harness Port Inconsistency
- **Finding:** In [`scripts/run_tests.py`](file:///c:/Users/praja/HomeSchool/Personal%20Projects/orchestrate/scripts/run_tests.py), `BASE_URL` was hardcoded to `http://localhost:8001`, while the main FastAPI server runs on port `8000`.
- **Resolution:** Standardized `BASE_URL` to `os.getenv("API_URL", "http://localhost:8000")`.

---

## 4. Verification Evidence

1. **Deterministic & Forensic Analysis Verification:**
   - Evaluated `test_data/1_clean`: Returned `Profile: Clean Student / Consistent Human Author` with `Concern: Low`.
   - Evaluated `test_data/2_sudden_ai`: Returned `Profile: Sudden AI Introduction` with `Suspicious regions: 1`, extracting the exact line `# As an AI, I need to calculate averages efficiently and accurately` with surrounding context lines.
2. **AI Engine Verification:**
   - Generated live forensic reports using Google Gemini Flash. Verified executive summary synthesis, structured findings, and VivaGuard defense questions.
3. **Scientific Evaluation Lab Verification:**
   - Executed 14 ground-truth academic integrity scenarios in `ml_engine/benchmark_runner.py`:
     - Accuracy: **92.9%** (13/14 correct)
     - Precision: **100.0%**
     - Recall (Sensitivity): **83.3%**
     - False Positive Rate: **0.0%** (Zero clean students falsely accused)
     - F1-Score: **90.9%**
4. **Frontend Production Build Verification:**
   - Ran `npm run build` using Next.js 16 (Turbopack) with 0 errors and 0 type warnings.

---

## 5. Core AI/Forensic Detection Reality & Connectivity Audit

**Audit Focus:** Verification of real AI/forensic execution, model connectivity, absence of hardcoded outputs, and direct contribution to the final results.

### 5.1 Verification Checklist
1. **Real LLM Connectivity**:
   - Verified that `backend/ai_engine.py` calls Google GenAI SDK (`google.genai.Client`) directly using the `GEMINI_API_KEY`.
   - Verified that the model prompt is dynamically constructed from real deterministic AST and ML outputs (`compact_data` via `json.dumps`).
   - Verified live execution against Gemini Flash, returning dynamic executive forensic summaries, categorized findings with evidence and counter-evidence, and viva examination scripts.
2. **Deterministic & ML Metric Connectivity**:
   - Verified that `backend/analysis.py` directly executes AST parsing, cyclomatic complexity calculations, token distribution modeling, Siamese metric projection, and Platt calibration.
   - All deviation values are calculated from student files and strictly bound to the final score without random or hardcoded constants.
3. **Contribution to Final Usable Results**:
   - The AI reasoning output directly populates:
     - `AIForensicPanel.tsx`: Executive brief, findings list with severity tags, concrete evidence, why the deviation matters, false-positive guardrails, and VivaGuard defense questions.
     - `ForensicDossierView.tsx`: Sections 1 (Executive Forensic Synthesis) and 9 (AI Forensic Reasoning Findings & VivaGuard Script) in both Simple Brief and Extended Dossier views.
     - `PersistentInvestigationContext.tsx`: Live AI status, model indicators, and analysis action controls.
4. **Clean Configuration**:
   - Removed legacy unused `AI_MOCK=true` flag from `backend/.env` to eliminate ambiguity.

---

## 6. First-Time Evaluator Frontend Usability & Ergonomics Audit

**Audit Focus:** Verification that a first-time external evaluator can operate the complete platform without terminal commands, developer knowledge, hidden steps, or confusing UI states.

### 6.1 Usability Findings & Enhancements
1. **Intake Guidance for Evaluators**:
   - Added an **Evaluator Tip Banner** right above the intake cards on the homepage pointing to pre-configured test archives in `test_data/` (`1_clean`, `2_sudden_ai`, `3_consistent_ai`, `8_template`) with instant drop-in `baseline.zip` and `submission.zip` files.
   - Evaluators without local files can also instantly click **Open Evaluation Lab** to run all 14 benchmark scenarios without uploading anything.
2. **Clean Submission Empty State Clarity**:
   - In `EvidenceCodeInspector.tsx`, updated the left and right inspector columns to present an explicit green verification badge and clear confirmation (`"Zero Syntactic Anomalies Detected - Complete AST & Behavioral Alignment with Baseline"`) when an authentic clean submission has zero flagged regions, replacing ambiguous "No item selected" placeholders.
3. **One-Click Action Discovery in AI Panel**:
   - In `AIForensicPanel.tsx`, added a direct, prominent **Generate Gemini Flash Reasoning** button directly inside the empty state card, eliminating any hunt for the action trigger in the top context header.
4. **Extended Dossier Completeness Transparency**:
   - In `ForensicDossierView.tsx`, added an informative status block for Section 9 when viewing the Extended Dossier prior to triggering Gemini Flash, clarifying that quantitative AST data is complete and guiding the reviewer on appending qualitative viva scripts.
5. **Zero Terminal / Developer Knowledge Requirement**:
   - All flows—drag-and-drop ingestion, comparison execution, stage switching, code inspection, AI reasoning, and print/PDF export—are 100% GUI-driven with real-time feedback, estimated durations, and clear status badges.


