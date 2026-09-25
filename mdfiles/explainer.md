# PROJECT EXPLAINER

## How to Start the Project

### Prerequisites
- Python 3.10+ with a virtual environment inside `backend/venv`
- Node.js 18+ for the frontend
- A Gemini API key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free, no billing required)

### 1. Set up Environment
Create `backend/.env` (copy from `backend/.env.example`) and add your key:
```
GEMINI_API_KEY=AIza...your_key_here
```

### 2. Start the Backend
```powershell
# From the backend/ directory — activate venv FIRST
.\venv\Scripts\Activate.ps1

# Then start the server
python -m uvicorn main:app --reload --port 8000
```

### 3. Start the Frontend
```powershell
# From the frontend/ directory
npm run dev
```

### 4. Open the App
Navigate to `http://localhost:3000`

### 5. Run an Investigation
1. Drop historical reference ZIPs (or enter a GitHub username) under **Historical Baseline**
2. Drop the submission ZIP under **New Submission**
3. Click **Begin Forensic Analysis** — the deterministic 8-metric dashboard appears instantly for free
4. Optionally click **Run AI Analysis** to trigger Gemini Flash for deep forensic reasoning

## Fundamental System Limitations (Honest Assessment):

1. **Consistent AI Authors (Baseline Contamination):**
   - **The Problem:** If a student *always* uses AI (even across all historical baseline repositories), their historical CodeDNA will be inherently AI-derived. Comparing a new AI submission against an AI baseline yields **low behavioral deviation** (because they match), but **high AI-associated signals**.
   - **The Solution (Implemented):** CodeDNA distinguishes between `Consistent AI Author` (low behavioral deviation + AI signals present in baseline & submission) vs `Sudden AI Introduction` (baseline is clean, submission introduces AI patterns). For `Consistent AI Author`, the investigation concern is downgraded from **HIGH** to **MODERATE** with an explicit diagnostic note: *"This student consistently uses AI. Focus investigation on AI policy compliance, not substitution fraud."*

2. **Intra-Author Topic Variance:**
   - A single author writing a CLI script vs a React UI vs a Database ORM will naturally use different libraries, naming conventions, and AST structures. CodeDNA mitigates this using non-linear sigmoid normalization so small/natural drifts do not inflate anomaly scores.

3. **Language-Specific AST Coverage:**
   - Deep AST parsing is currently active for Python. JS/TS files use regex-based static heuristics which capture control flow and function density but lack full AST depth.
## Architecture Specification: Cohort Normalization & Starter Template Engine

### 1. Purpose & Core Value
Cohort Normalization eliminates false-positive flags caused by course-wide assignment rules, mandatory framework imports (e.g. PyTorch, FastAPI), or shared instructor starter code. It transitions CodeDNA from 1-dimensional personal comparison to a 2-dimensional matrix evaluating both **Personal Behavioral Drift** and **Cohort Norm Alignment**.

### 2. The 3 Ingestion Pathways
- **Master Class ZIP Ingestion (LMS Export)**: Unpacks bulk exports from Canvas, Moodle, or Blackboard (`CS101_Submissions.zip`), parses student folders in parallel, and compiles a class baseline (`cohort_baseline.json`) containing P50, P75, P90, and Interquartile Range (IQR) metrics.
- **GitHub Classroom Auto-Fetch**: Asynchronously streams repositories from a GitHub organization (`github.com/cs101-fall2026/assignment-2-*`) into temporary session storage to generate an automated class baseline.
- **Starter Template Subtraction Filter**: Parses an instructor's skeleton starter ZIP and subtracts identical AST nodes, boilerplate imports, and function signatures prior to computing student deviation scores.

### 3. Dual-Vector Decision Matrix
$$\text{Adjusted Anomaly Score} = \text{Personal Deviation} \times (1 - \text{Cohort Similarity})$$

| Personal Deviation | Cohort Similarity | Diagnosis | Forensic Output |
| :--- | :--- | :--- | :--- |
| **High** | **High** (Matches Class) | Student followed course template / assignment guidelines. | 🟢 **CLEAR / TEMPLATE NORM** |
| **High** | **Low** (Differs from Class) | Student inserted external code or LLM output unlike peers. | 🔴 **HIGH CONCERN** |
| **Low** | **High** (Matches Both) | Student code matches past work and assignment norm. | 🟢 **CLEAR** |

---

## Current Status:
Phase 1, 2, and 3 Core Engine Refactoring Complete! Ready for Phase 4 (AI Forensic Integration & UI Dashboard Updates).

## Completed Changes:
- (2026-09-25 19:40) **Phase 4 Benchmark Thresholds Verification:** Baseline Reliability Adjusted: Modified reliability scoring in backend/analysis.py to require minimum 3 repositories and 500 total LOC for reliable signal (>70). Updated conditions: total_repos >= 3 (+30 points) and total_loc >= 500 (+40 points), preserving usable files factor. Vector weights (structural_deviation, complexity_deviation) remain equally weighted in deviation averaging. System readiness scores (Analysis Engine 8/10, AI Engine 7/10, API Layer 8/10, Frontend Rendering 6/10) documented for reference.
- (2026-09-25 19:20) **Phase 3 Test Data Generation (SUBPART 2):** Successfully executed scripts/generate_test_zips.py to populate test_data/ directory with 8 complete test scenarios containing baseline.zip and submission.zip pairs (plus template.zip for scenario 8), verifying correct file structure for all scenarios including 1_clean/, 2_sudden_ai/, 3_consistent_ai/, 4_plagiarism/, 5_empty/, 6_cross_language/,7_sophisticated_evasion/, and 8_template/ directories.
- (2026-09-25 19:15) **Phase 3 Extreme Automated Testing Implementation: (SUBPART 1)** SUBPART 1
Created comprehensive test suite with `scripts/generate_test_zips.py` for 8 distinct scenarios (Clean Student, Sudden AI, Consistent AI, Plagiarism, Empty Repo Cross-Language, Sophisticated Evasion, Template Subtraction) and updated `scripts/run_tests.py` with strict validation engine using httpx to POST generated ZIPs to local FastAPI endpoints (/api/session/start, /api/anayze/compare, /api/analyze/ai-report) with scenario-specific Pass Criteria assertions.
- (2026-09-25 16:55) **Phase 2 API Contract Audit Fixes:** Resolved frontend baseline reliability status indicator mismatch by correctly mapping `report.deterministic_data?.authorship_intelligence?.categorical_signals?.baseline_reliability` (`High` = Green, `Moderate`/`Low` = Amber). Utilized backend `per_file_anomaly_scores` payload in `page.tsx` by adding a dedicated File-Level Anomaly Scores sub-section under Deterministic Anomalies.
- (2026-09-25 16:38) **Diagnostic Phase 1 Fixes (Logic Failure Mapping):** Addressed potential silent failures across the stack. Added exception logging in `analysis.py` file parsing, raised explicit HTTP 400 errors for empty repository extractions and 0-file DNAs in `main.py`, stripped Markdown wrappers from Gemini JSON responses in `ai_engine.py` to prevent decode crashes, and safeguarded React's array `.map()` in `page.tsx` while fixing the `ai_mode` string evaluation bug.
- (2026-09-25 16:31) **Next.js Turbopack Runtime Error Fix:** Removed unused `recharts` components import in `frontend/src/app/page.tsx` that was triggering a module evaluation instantiation failure (`Tooltip.js` not found) and blocking the UI render.
- (2026-09-25 14:05) **Configurable CORS Policy Hardening:** Updated `CORSMiddleware` in `main.py` to parse comma-separated `ALLOWED_ORIGINS` environment variables, defaulting to `http://localhost:3000,http://127.0.0.1:3000` to eliminate wildcard CORS exposure without locking to localhost.
- (2026-09-25 13:31) **GitHub Classroom Endpoint Rate-Limit Hardening:** Updated `/api/repositories/github-classroom` in `main.py` to add explicit HTTP 429 rate limit exception handling, aligning org repository fetching with standard GitHub user fetching.
- (2026-09-25 12:53) **Cohort Normalization Architecture Specification Added:** Documented comprehensive architecture specification for Cohort Normalization, Starter Template AST Subtraction Filtering, LMS Bulk Export processing, and Dual-Vector Decision Matrix math in `explainer.md` for future platform documentation.
- (2026-09-24 20:05) **GitHub Rate Limit Handling & Frontend Alert Banner:** Added optional `GITHUB_TOKEN` support to `main.py` (increasing limit to 5,000 req/hr). Implemented explicit HTTP 429 rate limit exception handling in FastAPI and created an interactive error notice card in `page.tsx` to display clear rate-limit feedback instead of a perpetual loading spinner.
- (2026-09-24 19:08) **Non-Blocking Gemini Execution & Flash-Lite Optimization:** Wrapped synchronous `client.models.generate_content` in `asyncio.to_thread()` in `ai_engine.py` to prevent event-loop freezing. Defaulted primary model to `gemini-3.5-flash-lite` for near-instant responses with 0 capacity delays while maintaining automatic failover.
- (2026-09-24 18:45) **Configurable Gemini Model & Multi-Tier Fallback Chain Implemented:** Configured `GEMINI_MODEL` environment variable in `ai_engine.py` (default: `gemini-3.5-flash-lite`) with an automated failover sequence to `gemini-3.5-flash` on 503 capacity overload or 404 deprecation errors. Empirically verified automatic recovery during server demand spikes.
- (2026-09-24 18:36) **UI Copy Updated for Gemini Flash:** Replaced misleading reference to 'GPT-4o' in `frontend/src/app/page.tsx` line 519 with 'Google Gemini Flash' to align UI copy with backend engine.
- (2026-09-23 10:15) **Engine Calibration & False Positive Mitigation:** Implemented non-linear sigmoid deviation scaling, partial Jaccard architectural distance, and multi-tier AI Author Profiling (`Consistent AI Author` vs `Sudden AI Introduction`).
- (2026-09-22 23:10) **Architecture Risk Matrix Added:** Added a concise "Architecture Vulnerabilities, Gotchas & Known Risk Matrix" section to `explainer.md` capturing SDK deprecations (`google.generativeai` vs `google-genai`), global pip leaks vs venv isolation, model name shifts, JS/TS static parsing limits, zip bomb limits, GitHub unauthenticated rate limits, session disk volatility, wildcard CORS risks, and secret leakage mitigations.
- (2026-09-22 21:40) **Migrated AI Engine to Google Gemini Flash:** Completely replaced OpenAI (`gpt-4o`) with `google-generativeai` (`gemini-1.5-flash`). Uses `response_mime_type="application/json"` for strict JSON schema enforcement. Falls back gracefully to a highly realistic mock report on quota exhaustion or missing key. Updated `requirements.txt` and `.env.example`. The Gemini free tier provides 15 RPM and 1M TPM at no cost — resolving OpenAI's exhausted-credit problem permanently.
- (2026-09-22 21:30) **Session & File Cleanup on New Investigation:** Updated `handleNewInvestigation` in `frontend/src/app/page.tsx` to issue a server-side `DELETE /api/session/{session_id}` request to wipe session files from disk, reset all input fields (`githubLink`, `repoFiles`, `submissionFile`), and force recreation of the file input DOM components using a dynamic key (`resetKey`).
- (2026-09-22 19:33) **Security Hardening:** Untracked `backend/.env` from git index, added a safe `backend/.env.example` template, and updated root `.gitignore` to strictly exclude all environment and secret files (`.env`, `.env.*`, `*.env`) across the workspace.
- (2026-09-22 19:19) **Phase 5 (AI Forensic Reasoning & Investigation) Implemented:** Completely restructured the OpenAI GPT-4o system prompt in `ai_engine.py` to ingest Phase 4 CodeDNA data and output a strictly typed forensic JSON. This final structure forces the AI to abandon pseudoscientific certainty and instead generate evidence-weighted findings, evaluate false positives and contradictory evidence, pinpoint exact affected lines, and produce actionable 'VivaGuard' interview questions for the evaluator. The engine now returns top-level dashboard metrics (Baseline Reliability, CodeDNA Consistency, Style Deviation, Investigation Status) directly supporting the final UI.
- (2026-09-22 19:15) **Phase 4 (Authorship & Similarity Intelligence) Implemented:** 
  - Output separate evidence dimensions directly in `compare_codedna` via `authorship_intelligence` dictionary.
  - Implemented proxy for Historical CodeDNA similarity and Internal code duplication using deterministic byte-size matching.
  - Flagged Cross-repository and Known/reference-code similarity as offline metrics.
  - Extracted Token/AST similarity and Semantic similarity through our deep structural deviation math.
  - Tracked Novel-code ratio and Code reuse ratio via exact dependency differentials.
  - Added AI-pattern indicators using regex (e.g. flagging "As an AI") and mapped Sudden sophistication change using AST type-hint/complexity leaps.
  - Captured Architectural discontinuity, Dependency discontinuity, Evidence Confidence Score, and Baseline contamination risk mathematically.
  - Strictly replaced pseudoscientific percentage scores (like "87% AI-written") with absolute categorical signals: "AI-associated signals: High", "Authorship evidence: Moderate", "Baseline reliability: High", and "Overall investigation concern: High".

- (2026-09-22 18:58) **Phase 3 (Submission Forensics) Implemented:** Overhauled the `compare_codedna` engine to output a deeply analytical dictionary of deviations (Structural, Naming, Formatting, Complexity, Architecture, Dependency, Abstraction, Comment Style, Error Handling). It automatically ranks standard deviation anomalies mathematically, flags new/unseen patterns (e.g., injected `eval`s), and actively tracks internal `file_metrics` to produce distinct per-file and per-function lists highlighting the exact lines breaching historical P90 constraints.
- (2026-09-22 18:54) **Phase 2 (CodeDNA / Authoring Fingerprint) Implemented:** Deeply expanded the static AST parser to track highly nuanced authoring tendencies. We now capture precise identifier lengths and block nesting depth distributions, strict control-flow counts, OOP tendencies (inheritance ratios, `super()` calls), import dependency habits, and idiom usage (like `if __name__ == '__main__'`), generating a robust multi-dimensional deterministic CodeDNA similarity score.
- (2026-09-22 18:50) **Phase 1 (Repository & Baseline Intelligence) Implemented:** Completely refactored `backend/analysis.py` to calculate 14 robust metrics using deep AST and regex parsing paired with percentile math (P75, P90, median). It extracts LOC/complexity distributions, naming convention categorizations (snake_case vs camelCase), formatting fingerprints, and architectural inferences, eliminating the reliance on simple `if` counts.
- (2026-09-22 18:25) **AI Engine Refactoring:** Removed the legacy mock report generator (`_mock_report`) from `ai_engine.py`. The system now exclusively uses direct OpenAI GPT-4o integration to generate forensic reports, feeding it the rich deterministic CodeDNA JSON payloads. This ensures real LLM evaluation is reserved solely for complex anomaly explanations rather than basic metric counting.
- (2026-09-22 18:04) **On-Demand AI Analysis:** Separated the costly AI Analysis from the local CodeDNA comparison. The local baseline generation and submission comparison now run deterministically and immediately by default. The OpenAI API is only triggered via `/api/analyze/ai-report` when a user explicitly clicks "Run AI Analysis", keeping standard investigations instant and free while passing real server session IDs.
- (2026-09-22 16:57) **Frontend Directory Fix:** Fixed the Next.js directory structure by moving the legacy `app` folder directly into `src/app`. This correctly resolved Next.js missing layout errors and routing conflicts, ensuring the frontend dashboard renders smoothly without standard hydration faults.
- (2026-09-22 16:50) **Frontend Dashboard:** Built a responsive Next.js Frontend Dashboard integrating Recharts for data visualization, Framer Motion for smooth transitions, and Tailwind CSS for rapid styling.
- (2026-09-22 16:48) **AI Engine Initialization:** Integrated OpenAI GPT-4o into a new `ai_engine.py` service. It processes the raw deterministic metrics and translates them into a structured JSON forensic report, acting as the secondary layer of investigation when deterministic confidence is low.
- (2026-09-22 16:47) **Static Parsing Engine:** Built the foundational AST parsing logic for Python files and heuristic regex static metrics for JS/TS, setting the essential groundwork for the subsequent CodeDNA fingerprinting passes.
- (2026-09-22 16:47) **GitHub Integration:** Implemented a GitHub repository discovery endpoint (`/api/repositories/github`) utilizing `httpx` to dynamically fetch and download public zip archives directly into the server's session storage.
- (2026-09-22 16:47) **Static Comparison Engine:** Completed the initial CodeDNA Static Comparison Engine and exposed the `/api/analyze/compare` FastAPI endpoint to rapidly diff historical baselines against new submissions.
- (2026-09-22 16:46) **Project Setup:** Added root `.gitignore` configuration for backend and frontend to safely exclude node_modules, pycache, venv, and temporary session artifacts from version control.
- (2026-09-22 16:44) **Frontend Init:** Initialized a modern Next.js 14 frontend boilerplate configured with Tailwind CSS styling and rigorous TypeScript type support.
- (2026-09-22 16:44) **Backend Init:** Initialized the robust FastAPI backend architecture with `main.py` and strictly scoped virtual environment dependencies defined in `requirements.txt`.
- (2026-09-22 16:44) **Session Management:** Implemented temporary server-side session management (`tmp_sessions`) and multi-part `.zip` file upload endpoints to securely segregate different investigation contexts without any database persistence.
- (2026-09-22 16:40) **Architecture & Strategy:**
  - Installed Antigravity UI/UX skills.
  - Removed Supabase/Database requirement from PRD, TRD, and implementation plan.
  - Added support for manual upload of historical repositories as primary workflow.
  - Migrated storage strategy to temporary server-side files for the investigation duration.

---

## Skipped for Now:
- (2026-09-24) **ZIP Extraction Protection & Zip Bomb Prevention:** Postponed 50MB archive size limits and zip bomb entry count validation in `main.py`.


## Next Pending Work:
- Cohort normalization: compare a student's CodeDNA against a class/course baseline, not just their own history.

## Known Issues / Need To make these updates:
- *None currently open.*

## Architecture Vulnerabilities, Gotchas & Known Risk Matrix:

| Risk / Gotcha | Issue (In Simple Words) | Fix / Solution |
| :--- | :--- | :--- |
| **Deprecated Gemini SDK** | `google.generativeai` package is deprecated in favor of `google-genai`. | Migrate import to `from google import genai` and use `client = genai.Client()`. |
| **Model Name Mismatch & High Demand 503s** | Hardcoded model or peak demand 503s can cause investigation failures. | Configured `GEMINI_MODEL` via `.env` with automatic fallback chain (`gemini-3.6-flash` -> `gemini-3.5-flash-lite`). |
| **Global Python Environment Leak** | `pip install` run without activating `venv` installs packages globally. | Always use `.\venv\Scripts\python.exe -m pip install -r requirements.txt`. |
| **JS/TS Static Metric Limits** | Python has deep AST parsing; JS/TS uses regex heuristics which miss complex syntax. | Integrate Tree-Sitter or TypeScript AST CLI parser for JS/TS files. |
| **Unbounded ZIP Extraction Risk** | Uploading massive `.zip` files can exhaust disk space or trigger zip bombs. | Add 50MB file size limit and max file count checks during zip extraction in `main.py`. |
| **GitHub Rate Limiting** | Unauthenticated requests are capped at 60 req/hr, freezing UI on limits. | Supported `GITHUB_TOKEN` in `main.py` (5,000 req/hr) and added frontend HTTP 429 error alert card. |
| **Session Volatility (No DB)** | `tmp_sessions/` lives on local disk; server restarts wipe active investigation state. | Add periodic disk cleanup job or use Redis/S3 for production multi-node scaling. |
| **Wildcard CORS Policy** | Wildcard `allow_origins=["*"]` exposes API to unauthorized cross-origin requests. | Configured `ALLOWED_ORIGINS` env parser in `main.py` supporting comma-separated origin URLs. |
| **Secret Leakage Risk** | ACCIDENTAL commit of `GEMINI_API_KEY` or `OPENAI_API_KEY` to public Git repos. | Keep `.env` strictly in `.gitignore`, use `.env.example` templates, and run `check-ignore` audits. |

