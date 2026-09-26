# CodeDNA — Forensic Workstation Frontend

> **Interactive Client for Multi-Vector Student Code Authorship Investigation**  
> Built with Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS, Lucide Icons, Recharts, and Framer Motion.  
> **Primary Documentation:** [../README.md](../README.md) | [../docs/architecture.md](../docs/architecture.md)

---

## 1. Overview & Workstation Experience

The CodeDNA Forensic Workstation is a professional single-page web application designed for academic integrity panels, computer science faculty, and teaching assistants. It delivers an intuitive, multi-stage forensic examination workflow with zero terminal requirements for the evaluator.

### Core Workstation Capabilities:
- **Intake & Multi-Modal Ingestion:**
  - **Single Student (Personal Baseline):** Drag-and-drop up to 20 reference ZIP archives or synchronize with public GitHub profiles.
  - **Master LMS ZIP Ingestion:** Ingest bulk class archives from Canvas, Blackboard, or Moodle.
  - **Instructor Starter Template Filter:** Ingest starter skeleton code to subtract boilerplate AST nodes automatically.
  - **One-Click Scientific Evaluation Lab:** Instant access to 14 controlled benchmark scenarios.
- **9-Stage Investigation Pipeline:**
  1. `Overview`: High-level diagnosis, 8-metric summary cards, and authorial profile badge (`Clean Student`, `Consistent AI Author`, or `Sudden AI Introduction`).
  2. `Baseline Profile`: Breakdown of historical corpus, LOC distributions, complexity percentiles, naming patterns, and language coverage.
  3. `CodeDNA Radar`: Interactive 8-axis Recharts radar chart comparing submission metrics against the historical baseline.
  4. `AST Metrics`: Tabular comparison of AST node distributions, cyclomatic shifts, and cross-language invariant discounts.
  5. `Code Inspector`: Split-pane syntax viewer pinpointing exact authentic code lines exceeding historical P90 thresholds or exhibiting explicit AI conversational markers.
  6. `ML Projections`: 24-dimensional Siamese contrastive neural projection with Platt logistic calibrated probabilities and 95% confidence intervals.
  7. `Temporal Evolution`: Longitudinal CUSUM change-point time-series tracking skill acquisition across sequential submissions.
  8. `Case Dossier`: Formal printable case report with dual export modes (Simple Executive Brief vs Extended Forensic Dossier).
  9. `Validation & Hardening`: Standalone benchmark runner displaying live empirical accuracy (92.9%), 0% FPR, and ROC curves.
- **Google Gemini Flash Integration:**
  - On-demand qualitative evidence weighting, counter-evidence analysis, and VivaGuard oral defense scripts.
- **Resilient Cloud & Serverless Pipeline:**
  - Employs atomic `POST /api/analyze/direct` single-request execution to prevent serverless container state dropoffs.
  - Features a monotonic forward progress stepper that smoothly advances through pipeline stages 1 to 4 and idles at stage 5 until the API responds.

---

## 2. Quick-Start (Frontend Standalone)

### Prerequisites
- Node.js 18+ and npm
- Running CodeDNA FastAPI backend on port `8000` (see [../README.md](../README.md))

### Installation & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

---

## 3. Environment & Proxy Configuration

During local development, Next.js automatically proxies `/api/:path*` requests to the local FastAPI backend (`http://127.0.0.1:8000`) via `next.config.ts`, ensuring zero CORS friction.

If running the backend on a non-default host, set:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
In production on Vercel, `NEXT_PUBLIC_API_URL` defaults to `""` (relative origin), seamlessly routing requests through the unified monorepo gateway.

---

## 4. Workstation Keyboard Navigation

| Key | Stage | View Description |
| :---: | :--- | :--- |
| `1` | **Overview** | Executive diagnostic finding, author profiling & 8-metric summary |
| `2` | **Baseline Profile** | Historical repository corpus, complexity percentiles, and naming habits |
| `3` | **CodeDNA Radar** | Multi-vector 8-axis radar comparison chart |
| `4` | **AST Metrics** | Tabular AST shifts and cross-language invariant normalization |
| `5` | **Code Inspector** | Split-pane authentic code viewer with highlighted anomaly lines |
| `6` | **ML Projections** | 24-dim Siamese projection & Platt calibrated probability (95% CI) |
| `7` | **Temporal Evolution** | Longitudinal CUSUM change-point time-series graph |
| `8` | **Case Dossier** | Formal printable case report and hearing sign-off sheet |
| `9` | **Validation Lab** | Live 14-scenario empirical benchmark lab and ROC curve suite |

---

## 5. Component Architecture

```
frontend/src/
├── app/
│   ├── layout.tsx               # Root layout, Geist font configuration, metadata
│   ├── page.tsx                 # Primary state machine, pipeline controller, intake cards
│   ├── globals.css              # Tailwind base, custom scrollbars, print stylesheets
│   └── icon.svg                 # CodeDNA branded double-helix favicon
└── components/
    ├── AIForensicPanel.tsx      # Google Gemini Flash reasoning view & VivaGuard scripts
    ├── BaselineProfileView.tsx  # Historical corpus & statistical distribution view
    ├── BenchmarkSuiteView.tsx   # Empirical benchmark lab, confusion matrix & ROC curves
    ├── EvidenceCodeInspector.tsx# Syntax-highlighted authentic code diff inspector
    ├── ForensicDossierView.tsx  # Printable formal hearing case dossier (A4 formatted)
    ├── MetricComparisonGrid.tsx # Tabular 8-vector AST deviation breakdown
    ├── MLIntelligenceView.tsx   # Contrastive Siamese hypersphere projection view
    ├── PersistentInvestigationContext.tsx # Sticky top action bar & stage switcher
    ├── PipelineNav.tsx          # 9-stage pipeline navigation controller
    ├── RadarDeviationChart.tsx  # Recharts 8-axis polygon visualization
    └── TemporalEvolutionView.tsx# Longitudinal CUSUM time-series chart
```
