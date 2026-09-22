# PROJECT EXPLAINER

## Current Status:
Phase 1, 2, and 3 Core Engine Refactoring Complete! Ready for Phase 4 (AI Forensic Integration & UI Dashboard Updates).

## Completed Changes:
- (2026-09-22 18:58) **Phase 3 (Submission Forensics) Implemented:** Overhauled `compare_codedna` engine to output a deeply analytical dictionary of deviations (Structural, Naming, Formatting, Complexity, Architecture, Dependency, Abstraction, Comment Style, Error Handling). Automatically ranks anomalies, flags new/unseen patterns (e.g. injected `eval`s), and produces per-file/per-function anomaly lists with exact suspicious lines.
- (2026-09-22 18:54) **Phase 2 (CodeDNA / Authoring Fingerprint) Implemented:** Deeply expanded the static AST parser to track nuanced author tendencies: naming profiles, block nesting depth, strict control-flow patterns, OOP tendencies (inheritance, class-to-func ratio), import dependency habits, and idiom usage to generate a robust deterministic CodeDNA similarity score.
- (2026-09-22 18:50) **Phase 1 (Repository & Baseline Intelligence) Implemented:** Completely refactored `backend/analysis.py` to calculate 14 highly robust deterministic metrics including LOC/complexity distributions (using AST and percentile math), naming convention categorizations, formatting fingerprints, and architectural inference, eliminating the reliance on simple `if` counts.
- (2026-09-22 18:25) **AI Engine Refactoring:** Removed mock report generator (`_mock_report`) from `ai_engine.py`. System now uses direct OpenAI GPT-4o integration exclusively.
- (2026-09-22 18:04) **On-Demand AI Analysis:** Separated AI Analysis from local CodeDNA comparison. Local comparison runs by default; OpenAI triggers via `/api/analyze/ai-report` only when clicking "Run AI Analysis". UI updated to pass real server session ID.
- (2026-09-22 16:57) **Frontend Directory Fix:** Fixed Next.js directory structure by moving `app` folder into `src/app` to resolve missing layout error.
- (2026-09-22 16:50) **Frontend Dashboard:** Built Next.js Frontend Dashboard with Recharts, Framer Motion, and Tailwind CSS.
- (2026-09-22 16:48) **AI Engine Initialization:** Integrated OpenAI GPT-4o (`ai_engine.py`) to generate structured JSON forensic reports based on deterministic metrics.
- (2026-09-22 16:47) **Static Parsing Engine:** Implemented AST parsing for Python and static metrics for JS/TS.
- (2026-09-22 16:47) **GitHub Integration:** Implemented GitHub repo discovery endpoint (`/api/repositories/github`).
- (2026-09-22 16:47) **Static Comparison Engine:** Completed CodeDNA Static Comparison Engine and exposed `/api/analyze/compare` endpoint.
- (2026-09-22 16:46) **Project Setup:** Added root `.gitignore` configuration for backend and frontend.
- (2026-09-22 16:44) **Frontend Init:** Initialized Next.js frontend with Tailwind CSS and TypeScript.
- (2026-09-22 16:44) **Backend Init:** Initialized FastAPI backend with `main.py` and virtual environment dependencies.
- (2026-09-22 16:44) **Session Management:** Implemented temporary server-side session management (`tmp_sessions`) and .zip upload endpoints.
- (2026-09-22 16:40) **Architecture & Strategy:**
  - Installed Antigravity UI/UX skills.
  - Removed Supabase/Database requirement from PRD, TRD, and implementation plan.
  - Added support for manual upload of historical repositories as primary workflow.
  - Migrated storage strategy to temporary server-side files for the investigation duration.

## Current Focus:
- (2026-09-22 19:00) Preparing for Phase 4 implementation (AI Forensic Reasoning & UI integration for Phase 1-3 forensic findings).

## Next Pending Work:
- **Phase 4 (Authorship & Similarity Intelligence):** 

Output separate evidence dimensions:

Historical CodeDNA similarity
Internal code duplication
Cross-repository similarity
Known/reference-code similarity
Semantic similarity
Token/AST similarity
Novel-code ratio
Code reuse ratio
AI-pattern indicators
Sudden sophistication change
Architectural discontinuity
Dependency discontinuity
Evidence Confidence Score
Baseline contamination risk

Important: never output "87% AI-written" as if that's scientifically proven.

Instead:

AI-associated signals: High
Authorship evidence: Moderate
Baseline reliability: High
Overall investigation concern: High

## Known Issues / Need To make these updates:
- None currently flagged. Phases 1-3 core backend refactoring complete and clean.
