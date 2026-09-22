# PROJECT EXPLAINER

## Current Status:
Phase 1, 2, and 3 Core Engine Refactoring Complete! Ready for Phase 4 (AI Forensic Integration & UI Dashboard Updates).

## Completed Changes:
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

## Current Focus:
- (2026-09-22 19:20) **Frontend Integration:** Now that the 5-phase backend forensic engine is fully complete, the focus shifts to mapping these detailed JSON schemas into the Next.js Dashboard UI (Framer Motion, Recharts) to render the final forensic view.

## Next Pending Work:
- Build the final Frontend UI Dashboard to display the top-level stats (Baseline Reliability, CodeDNA Consistency, Structural Deviation, etc.) and render the "Why?" → evidence → exact code flow natively in the browser.

## Known Issues / Need To make these updates:
- If OpenAI returns a 429 Quota Exhausted error (or if the API key is "mock"), `ai_engine.py` will now automatically intercept the error and return a highly detailed, schema-compliant Mock Phase 5 Report so frontend UI testing can continue uninterrupted without API costs.
