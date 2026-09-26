# CodeDNA — Forensic Code Authorship Workstation

> **Multi-Vector Student Code Authorship Investigation & Academic Integrity Platform**  
> Moving beyond generic, uncalibrated "AI probability" detectors to longitudinal, evidence-based authorial verification.

[![Live Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=flat&logo=vercel)](https://codedna-orchestrate.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%20Flash-4285F4?logo=google)](https://ai.google.dev/)

---

## Quick Links

- **Live Deployed Application:** [https://codedna-orchestrate.vercel.app/](https://codedna-orchestrate.vercel.app/)
- **Interactive API Documentation:** Available at `http://localhost:8000/docs` when running backend locally
- **Architecture Specification:** [docs/architecture.md](docs/architecture.md)
- **Product Requirements Document (PRD):** [docs/PRD.md](docs/PRD.md)
- **Technical Requirements Document (TRD):** [docs/TRD.md](docs/TRD.md)
- **Frontend Overview:** [frontend/README.md](frontend/README.md)

---

## 1. Problem Statement & Philosophy

Traditional plagiarism tools (e.g. token-based string matchers like MOSS) and contemporary "AI code detectors" fail in modern computing education for three reasons:

1. **High False Positive Rates (FPR):** Standard formatters (Prettier, Black), linters, and instructor-supplied boilerplate routinely trigger false alarms, penalizing innocent students.
2. **Baseline Contamination:** When students routinely use AI tools across all projects, binary detectors flag high AI presence without distinguishing between sudden contract-cheating/substitution fraud vs. permitted continuous tool usage.
3. **Lack of Forensic Defensibility:** A black-box percentage score (e.g. *"87% AI-generated"*) cannot withstand legal or academic scrutiny in formal academic integrity hearings or viva voce examinations.

### The CodeDNA Solution: Longitudinal Stylistic Invariants
Rather than comparing student code against the entire internet or relying on an uncalibrated LLM classifier, CodeDNA compares a submission against **the student's own verified historical programming baseline**. It evaluates multi-dimensional Abstract Syntax Tree (AST) invariants, 24-dimensional contrastive Siamese metric projections, temporal CUSUM change-point shifts, and structured Google Gemini Flash forensic reasoning.

```
                    ┌───────────────────────────────────────────────┐
                    │          Student Code Ingestion               │
                    │  (Historical Baseline + Target Submission)   │
                    └───────────────────────┬───────────────────────┘
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
┌─────────────────────────────┐                           ┌─────────────────────────────┐
│    Phase 1: Deterministic   │                           │     Phase 2: ML & Temporal  │
│   Multi-Vector AST Parser   │                           │     Intelligence Engine     │
├─────────────────────────────┤                           ├─────────────────────────────┤
│ • AST Structural Patterns   │                           │ • 24-Dim Siamese Embedding  │
│ • Cyclomatic Complexity     │                           │ • Platt Logistic Sigmoid    │
│ • Naming Distributions      │                           │ • Temporal CUSUM Shift      │
│ • Formatting Fingerprints   │                           │ • Cross-Language Normalizer │
│ • Dependency Invariants     │                           │ • Starter Template Filter   │
│ • Error Handling Patterns   │                           │ • Cohort Class Baseline     │
└──────────────┬──────────────┘                           └──────────────┬──────────────┘
               │                                                         │
               └────────────────────────────┬────────────────────────────┘
                                            │
                                            ▼
                         ┌─────────────────────────────────────┐
                         │    Phase 3: Google Gemini Flash     │
                         │      Forensic Reasoning Engine      │
                         ├─────────────────────────────────────┤
                         │ • Evidence-Weighted Synthesis       │
                         │ • Contradictory Evidence & Guardrails│
                         │ • Affected Lines Code Pinpointing   │
                         │ • VivaGuard Oral Defense Script     │
                         └──────────────────┬──────────────────┘
                                            │
                                            ▼
                         ┌─────────────────────────────────────┐
                         │   Next.js 16 Forensic Workstation   │
                         ├─────────────────────────────────────┤
                         │ • 8-Metric Interactive Radar Chart  │
                         │ • Split-Pane Code Diff Inspector    │
                         │ • Siamese Latent Hypersphere View   │
                         │ • Scientific Benchmark Suite Lab    │
                         │ • Print-Ready Forensic Case Dossier │
                         └─────────────────────────────────────┘
```

---

## 2. Key Features

- **8-Vector Deterministic AST Invariants:** Mathematically quantifies structural syntax nodes, cyclomatic complexity distributions (P75/P90/median), naming style ratios (snake_case, camelCase, PascalCase), indentation cadence, error-handling habits, dependency adoption, and OOP inheritance tendencies.
- **Contrastive Siamese Neural Style Projection:** Projects code metrics onto a 24-dimensional normalized latent hypersphere to measure behavioral distance independently of variable renaming or formatting perturbation.
- **Platt Logistic Calibration (95% CI):** Calibrates raw anomaly scores into statistically bounded posterior probabilities \(P(\text{Discontinuity} \mid \text{DNA})\) with Wald confidence intervals.
- **Temporal CUSUM Change-Point Detection:** Distinguishes between natural, gradual skill acquisition over a semester versus abrupt, single-submission substitution jumps.
- **Cohort Normalization & Starter Template Filter:** Ingests LMS exports (Canvas, Blackboard, Moodle) and subtracts instructor starter boilerplate AST nodes before computing student deviation scores, eliminating false positives.
- **Cross-Language Invariant Normalization:** Normalizes language-specific syntax conventions when comparing baselines in one language (e.g. Python) against a submission in another (e.g. JavaScript or Java).
- **Categorical Signal Safety Guardrails:** Strictly replaces unscientific percentages with clear categorical signals: *Authorship Evidence (Strong/Moderate/Weak)*, *Baseline Reliability (High/Moderate/Low)*, and *Overall Investigation Concern (High/Moderate/Low)*.
- **Evidence-Weighted Gemini Flash Reasoning:** Synthesizes deterministic signals into an executive finding with mitigating factors and viva voce oral interview questions (VivaGuard).
- **Interactive Multi-Stage Workstation & Printable Dossier:** 9-stage investigation pipeline with interactive radar chart, split-pane syntax-highlighted code inspector, and print-ready formal case dossier.

---

## 3. Tech Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion | High-performance interactive workstation UI, responsive visualizations, A4 print styles |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, httpx, Pydantic | High-speed REST API, multi-part file ingestion, deterministic calculation |
| **Code Analysis** | Python `ast`, regex lexical parser, statistical distribution engine | Deterministic syntax extraction, complexity calculations, formatting fingerprinting |
| **ML Engine** | NumPy, custom contrastive Siamese projection, Platt logistic calibrator, CUSUM analyzer | Invariant metric projection, uncertainty estimation, temporal change-point detection |
| **AI Reasoning** | Google GenAI SDK (`google-genai`), Gemini 2.5/3.5 Flash | Qualitative evidence weighting, viva voce question generation, token-budgeted synthesis |
| **Deployment** | Vercel (Unified monorepo routing with Next.js frontend + FastAPI serverless service) | Single-domain cloud deployment with zero CORS configuration |

---

## 4. End-to-End User Flow

1. **Intake & Ingestion:**
   - Evaluator drops historical repository ZIPs (or provides a public GitHub username).
   - Evaluator drops the investigated target submission ZIP.
   - *(Optional)* Evaluator drops an instructor skeleton template ZIP to subtract course boilerplate.
   - *(Optional)* Evaluator selects Cohort mode to ingest a Canvas/Moodle class export.
2. **Analysis Execution:**
   - Clicking **"Begin Forensic Analysis"** triggers deterministic AST parsing and Siamese projection locally in <150ms.
3. **Interactive Investigation:**
   - **Overview:** Review author profiling (`Clean Student`, `Consistent AI Author`, or `Sudden AI Introduction`) and 8-metric summary.
   - **Baseline Profile:** Inspect historical language coverage, complexity percentiles, and naming conventions.
   - **CodeDNA Radar:** Visualize multi-vector variance against the student's historical baseline.
   - **AST Metrics:** Tabular breakdown of cyclomatic shifts, dependency changes, and error handling.
   - **Code Inspector:** Review flagged line ranges with authentic uploaded code highlighting AI markers and complexity anomalies.
   - **ML Projections:** View latent hypersphere projection, calibrated probability, and 95% confidence intervals.
   - **Temporal Evolution:** Analyze historical timeline and CUSUM change-point graphs.
4. **AI Reasoning (On-Demand):**
   - Click **"Run AI Analysis"** to prompt Google Gemini Flash with the deterministic payload, generating viva defense questions and counter-evidence analysis.
5. **Dossier Export:**
   - Toggle between **Executive Summary** and **Extended Forensic Dossier**, then click **Print Case Dossier** for a clean, headerless, court-ready PDF.

---

## 5. Local Setup & Quick-Start

### Prerequisites
- **Python 3.10+** (with virtual environment capability)
- **Node.js 18+** & npm
- A free **Google Gemini API Key** from [aistudio.google.com](https://aistudio.google.com/app/apikey)

### Step 1: Clone Repository
```powershell
git clone https://github.com/Shabd1901/CodeDNA.git
cd CodeDNA
```

### Step 2: Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows
# source venv/bin/activate     # On Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
Copy-Item .env.example .env     # On Windows (or 'cp .env.example .env' on Linux/macOS)
```

Edit `backend/.env` with your API key:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
GITHUB_TOKEN=ghp_...your_optional_github_token_here
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Start the FastAPI server:
```powershell
python -m uvicorn main:app --reload --port 8000
```
*API documentation will be accessible at [http://localhost:8000/docs](http://localhost:8000/docs).*

### Step 3: Frontend Setup
In a new terminal window:
```powershell
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 6. Development, Testing & Verification

### Running Automated Integration Tests
CodeDNA includes an automated test runner validating 8 live scenarios (Clean student, Sudden AI, Consistent AI, Plagiarism, Empty baseline, Cross-language, Evasion, Template subtraction):
```powershell
# Ensure the backend server is running on port 8000, then:
python scripts/run_tests.py
```

### Running the Scientific Evaluation Lab
Execute the 14-scenario ground-truth benchmark suite via CLI:
```powershell
python scripts/run_evaluation_lab.py
```

> **Note on the "Re-Run Suite" Workstation Button:**  
> In the frontend web UI, clicking **"Re-Run Suite"** invokes `GET /api/benchmarks/run` on the live FastAPI backend server (`backend/ml_engine/benchmark_runner.py`). It dynamically executes all 14 controlled ground-truth test cases through the 24-dimensional feature extractor, Siamese projection head, and Platt logistic calibrator, recalculating live empirical accuracy (92.9%), confusion matrix, and ROC/PR curve points in real-time.

#### Verified Benchmark Results:
- **Total Scenarios Evaluated:** 14 (8 benign/authentic, 6 adversarial/suspicious)
- **Classification Accuracy:** **92.9%** (13/14 matches)
- **False Positive Rate (FPR):** **0.0%** (Zero false accusations on authentic work)
- **Precision:** **100.0%**
- **Recall (Sensitivity):** **83.3%**
- **Specificity:** **100.0%**
- **F1-Score:** **90.9%**
- **AUC-ROC:** **0.938** (Calculated dynamically via trapezoidal numerical integration)
- **Adversarial Resilience:** **75.0%** across identifier renaming, dead code insertion, and obfuscation

---

## 7. Cloud Deployment (Vercel)

CodeDNA is configured as a **single-domain unified monorepo** on Vercel using `vercel.json` services:
- **Web Service:** `frontend/` (Next.js 16 with Turbopack)
- **API Service:** `backend/` (FastAPI via Python 3.12 Serverless runtime)
- **Routing:** `/api/(.*)` routes to FastAPI; `/(.*)` routes to Next.js.
- **Serverless Stability:** Includes `@app.post("/api/analyze/direct")` for atomic single-request archive extraction, eliminating ephemeral container state dropoffs.

### Live Production Deployment
- **URL:** [https://codedna-orchestrate.vercel.app/](https://codedna-orchestrate.vercel.app/)

### Setting up on Vercel:
1. Connect your GitHub repository (`Shabd1901/CodeDNA`) in the Vercel Dashboard.
2. In **Project Settings** → **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `GITHUB_TOKEN`: (Optional) Your GitHub personal access token for higher API limits
3. Deploy! Vercel automatically detects `vercel.json` and deploys both services together.

---

## 8. Troubleshooting & FAQ

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **HTTP 429 GitHub API Rate Limit** | Unauthenticated GitHub requests are capped at 60 req/hr. | Add a free `GITHUB_TOKEN` to `backend/.env` or upload baseline files directly as ZIPs. |
| **Gemini 429 RESOURCE_EXHAUSTED** | Free tier TPM limits exceeded by large file payloads. | CodeDNA compacts file metrics to <25,000 tokens before sending to Gemini Flash. Ensure your Gemini API key has active quota. |
| **"Submission contains no usable source code files"** | The ZIP archive contains no supported code extensions (`.py`, `.js`, `.ts`, `.java`, `.c`, `.cpp`, `.cs`, `.go`, `.rs`) or files are nested under excluded project folders (e.g. `venv`, `node_modules`). *(Note: Linux serverless `/tmp` extraction collisions are resolved in v2.0 via relative path sandboxing).* | Ensure files have supported extensions. For instant testing, use pre-packaged fixtures from `test_data/1_clean/`. |
| **Frontend Network Error (`API_BASE`)** | Backend server is not running on port 8000. | Start FastAPI with `uvicorn main:app --reload --port 8000`. In development, Next.js rewrites `/api/*` to `127.0.0.1:8000`. |
| **Vercel 4.5 MB Payload Limit** | Serverless function body cap exceeded. | Keep individual uploaded archives under 4.5 MB. For larger archives, run CodeDNA locally. |

---

## 9. Project Structure

```
CodeDNA/
├── backend/
│   ├── main.py                  # FastAPI application & REST endpoints
│   ├── analysis.py              # 8-vector AST parser & CodeDNA deviation engine
│   ├── ai_engine.py             # Google GenAI Gemini Flash forensic integration
│   ├── requirements.txt         # Lightweight Python dependencies
│   ├── .env.example             # Environment template
│   └── ml_engine/
│       ├── feature_extractor.py # 24-dimensional dense feature extraction
│       ├── siamese_model.py     # Contrastive Siamese metric projection head
│       ├── calibrator.py        # Platt logistic probability calibration (95% CI)
│       ├── hybrid_scorer.py     # Deterministic + ML fused scoring engine
│       ├── temporal_analyzer.py # Longitudinal CUSUM change-point detection
│       ├── cross_language_parser.py # Cognitive invariant AST normalizer
│       └── benchmark_runner.py  # 14-scenario empirical evaluation test harness
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js 16 layout & workstation page
│   │   └── components/          # 11 interactive forensic analysis views:
│   │       ├── AIForensicPanel.tsx
│   │       ├── BaselineProfileView.tsx
│   │       ├── BenchmarkSuiteView.tsx
│   │       ├── EvidenceCodeInspector.tsx
│   │       ├── ForensicDossierView.tsx
│   │       ├── MetricComparisonGrid.tsx
│   │       ├── MLIntelligenceView.tsx
│   │       ├── PersistentInvestigationContext.tsx
│   │       ├── PipelineNav.tsx
│   │       ├── RadarDeviationChart.tsx
│   │       └── TemporalEvolutionView.tsx
│   ├── next.config.ts           # Development proxy & build settings
│   └── package.json             # Frontend dependencies
├── scripts/
│   ├── run_evaluation_lab.py    # CLI runner for the 14-scenario benchmark lab
│   ├── run_tests.py             # Automated end-to-end integration test runner
│   └── generate_test_zips.py    # Generator for test scenario ZIP pairs
├── test_data/                   # Pre-generated ZIP archives for instant testing
│   ├── 1_clean/                 # Authentic student baseline & submission
│   ├── 2_sudden_ai/             # Sudden AI insertion scenario
│   ├── 3_consistent_ai/         # Historical consistent AI user
│   ├── 4_plagiarism/            # Near-verbatim code reuse scenario
│   ├── 5_empty/                 # Sparse baseline reliability test
│   ├── 6_cross_language/        # Python baseline to JavaScript submission
│   ├── 7_sophisticated_evasion/ # Adversarial evasion scenario
│   └── 8_template/              # Starter template subtraction test
├── docs/
│   ├── architecture.md          # In-depth system architecture specification
│   ├── PRD.md                   # Product Requirements Document
│   └── TRD.md                   # Technical Requirements Document
└── vercel.json                  # Unified Vercel monorepo services routing
```

---

## 10. Ethical Principles & Human-in-the-Loop Policy

CodeDNA is explicitly architected as an **Evaluator Decision-Support Tool**, not an automated disciplinary engine:
- It **never** issues an automated verdict or ungrounded score.
- It translates raw statistical signals into actionable, human-interpretable evidence.
- It generates **VivaGuard Oral Defense Questions** so instructors can interview students constructively using their own code.
- It actively evaluates **Counter-Evidence & Mitigating Factors** (framework adoption, natural learning progression, style reformatting) to safeguard students from false accusations.
