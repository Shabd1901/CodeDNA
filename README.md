# CodeDNA — Forensic Authorship Workstation

> **Multi-Vector Student Code Authorship Investigation & Academic Integrity Platform**  
> Moving beyond generic "AI probability" detectors to longitudinal, evidence-based authorial verification.

---

## 1. Executive Summary & Core Philosophy

Traditional code plagiarism detectors (e.g., token-based string matchers) and contemporary "AI code detectors" fail in academic environments for three critical reasons:
1. **High False Positive Rates (FPR)**: Stylistic formatters (Prettier, Black) and standard course templates trigger false alarms, unfairly penalizing students.
2. **Baseline Contamination**: When students consistently use AI tools, binary AI classifiers report high AI presence without identifying whether the work represents sudden substitution fraud or permitted assistance.
3. **Lack of Forensic Defensibility**: A black-box percentage score (e.g., "87% AI-generated") cannot withstand scrutiny in an academic integrity hearing or viva defense.

**CodeDNA resolves this by evaluating Longitudinal Stylistic Invariants**:
Rather than comparing a student's submission against the entire internet or an uncalibrated LLM detector, CodeDNA compares a student's submission against **their own verified historical programming baseline** across 8 deterministic AST vectors, contrastive Siamese metric projections, temporal CUSUM change-point analysis, and evidence-weighted Gemini Flash forensic reasoning.

---

## 2. System Architecture

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
                         │   Phase 3: Google Gemini Flash      │
                         │     Forensic Reasoning Engine       │
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

## 3. Key Differentiators

| Capability | Generic Detectors | CodeDNA Forensic Workstation |
| :--- | :--- | :--- |
| **Verification Basis** | Global training set / ungrounded LLM | Student's own verified historical baseline |
| **False Positive Rate** | Uncontrolled (often 10–30%) | **0.0% Empirical FPR** on verified benign student work |
| **Starter Code Handling**| Flags boilerplate as copied code | Subtractive AST filter removes instructor templates |
| **Multi-Language Support** | Separate isolated checks | Cross-language invariant normalization (Python, JS, TS, Java, C) |
| **Defense in Hearings** | Unverifiable probability number | Concrete line-by-line evidence + custom VivaGuard interview scripts |
| **Auditability** | Closed-box | 100% reproducible open-source evaluation suite |

---

## 4. Repository Structure

```
orchestrate/
├── backend/
│   ├── main.py                  # FastAPI application & REST endpoints
│   ├── analysis.py              # 8-vector AST parser & CodeDNA deviation engine
│   ├── ai_engine.py             # Google GenAI Gemini Flash forensic integration
│   ├── requirements.txt         # Lightweight Python dependencies (no PyTorch/TF required)
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
│   │   ├── app/                 # Next.js 16 app layout & workstation page
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
│   └── package.json             # Frontend dependencies (Tailwind CSS, Lucide, Recharts)
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
└── docs/
    ├── explainer.md             # Detailed engineering log, risk matrix & changelog
    ├── architecture.md          # In-depth system architecture specification
    ├── projecteval1.md          # Internal audit & verification record
    ├── projecteval2.md          # External evaluator audit pass reports
    └── evaluation_lab_report.json # Full benchmark suite JSON results
```

---

## 5. Quick-Start Guide

### Prerequisites
- **Python 3.10+** (with virtual environment)
- **Node.js 18+** & npm
- A free **Google Gemini API Key** from [aistudio.google.com](https://aistudio.google.com/app/apikey)

### Step 1: Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows
# source venv/bin/activate     # On Linux / macOS

# Install lightweight dependencies
pip install -r requirements.txt

# Configure your Gemini API key
Copy-Item .env.example .env
# Edit .env and set: GEMINI_API_KEY=AIza...your_key_here

# Start the FastAPI server
python -m uvicorn main:app --reload --port 8000
```
*Backend API documentation is interactively available at `http://localhost:8000/docs`.*

### Step 2: Frontend Setup
```powershell
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 6. How to Run an Investigation

1. **Upload Historical Baseline**:
   - Drag and drop one or more previous project ZIPs (e.g., from `test_data/1_clean/baseline.zip`), OR
   - Enter a public GitHub username to automatically fetch public repositories.
2. **Upload Target Submission**:
   - Drag and drop the assignment ZIP to be evaluated (e.g., `test_data/1_clean/submission.zip`).
3. **Optional Starter Template**:
   - If an instructor template was provided to the class, upload it to subtract boilerplate code automatically.
4. **Begin Forensic Analysis**:
   - Click **"Begin Forensic Analysis"** — the deterministic 8-vector CodeDNA comparison runs locally and instantly for free.
5. **Explore Forensic Views**:
   - Navigate through the pipeline: **Overview**, **Baseline Profile**, **CodeDNA Radar**, **AST Metrics**, **Inspector**, **ML Projections**, **Temporal Shifts**, and **Dossier**.
6. **Trigger AI Forensic Reasoning**:
   - Click **"Run AI Analysis"** (or use the one-click trigger in the AI panel) to engage Gemini Flash for qualitative evidence weighting and viva defense script generation.
7. **Export Case Dossier**:
   - Switch between **Simple Executive Brief** and **Full Extended Dossier**, then click **Print Case Dossier** to generate a clean, headerless PDF report.

---

## 7. Empirical Verification & Benchmarks

CodeDNA includes an open, reproducible Scientific Evaluation Lab (`scripts/run_evaluation_lab.py`) validating the system against 14 controlled academic integrity scenarios:

```powershell
# Execute the evaluation lab
python scripts/run_evaluation_lab.py
```

### Verified Empirical Performance:
- **Total Scenarios Evaluated**: 14 (8 benign/authentic, 6 adversarial/suspicious)
- **Overall Classification Accuracy**: **92.9%** (13/14)
- **Precision**: **100.0%** (Zero false accusations)
- **Recall (Sensitivity)**: **83.3%**
- **Specificity (True Negative Rate)**: **100.0%** (8/8 clean cases cleared)
- **False Positive Rate (FPR)**: **0.0%** (Academic integrity safety guardrail)
- **F1-Score**: **90.9%**
- **AUC-ROC**: **0.938** (Calculated dynamically via trapezoidal numerical integration)
- **Adversarial Resilience**: **75.0%** across identifier renaming, dead code injection, and obfuscation

---

## 8. Automated Test Suite

Run the end-to-end integration test suite against the live backend server:

```powershell
# Ensure backend is running on port 8000, then:
python scripts/run_tests.py
```
This tests 8 live scenarios: Clean Student, Sudden AI, Consistent AI, Plagiarism Detection, Empty Baseline Handling, Cross-Language Parity, Sophisticated Evasion, and Template Subtraction.

---

## 9. Ethical Principles & Human-in-the-Loop Policy

CodeDNA is explicitly architected as an **Evaluator Decision-Support Tool**, not an automated disciplinary engine:
- It **never** issues an ungrounded binary judgment ("Cheated" / "Not Cheated").
- It flags anomalies categorized by evidential weight (High / Moderate / Low concern).
- It generates **VivaGuard Oral Defense Questions** so educators can interview the student fairly using their own code before making any administrative determination.
- It actively evaluates **Counter-Evidence & Mitigating Factors** (e.g., natural skill progression, framework adoption, formatter application) to protect innocent students.
