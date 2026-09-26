# CodeDNA — Forensic Workstation Frontend

The CodeDNA Forensic Workstation is a Next.js 16 (Turbopack) single-page application engineered for academic integrity officers, department chairs, and computer science educators. It provides interactive, multi-dimensional code authorship investigation, evidence-weighted qualitative reasoning, and printable forensic case dossiers.

---

## Key Capabilities

1. **Intake & Multi-Modal Ingestion**:
   - **Personal Historical Archives**: Drag-and-drop up to 20 reference ZIP archives or synchronize directly with student GitHub profiles (with real-time domain and handle typo validation).
   - **Cohort LMS Master Class Ingestion**: Bulk ingest class exports from Canvas, Blackboard, or Moodle to compile class-wide baseline percentiles.
   - **Instructor Starter Template Filter**: Attach skeleton starter code to automatically subtract boilerplate AST nodes before deviation calculation.
   - **One-Click Scientific Evaluation Lab**: Instant demonstration access to 14 pre-computed ground-truth academic integrity scenarios without requiring manual file uploads.

2. **9-Stage Forensic Investigation Pipeline**:
   - **Stage 1 (Overview)**: Executive summary, multi-vector radar graph, authorial profiling (`Consistent AI Author` vs `Sudden AI Introduction`), and baseline reliability scores.
   - **Stage 2 (Baseline Profile)**: Deep breakdown of historical repository corpus, LOC distributions, complexity percentiles, naming conventions, and language coverage.
   - **Stage 3 (CodeDNA Radar)**: Interactive Recharts radar visualization contrasting 8 stylistic and structural invariant dimensions against historical baselines.
   - **Stage 4 (AST Metrics)**: Detailed tabular and distribution shift comparison, including cross-language AST normalization parity for multi-language projects.
   - **Stage 5 (Code Inspector)**: Split-pane syntax-highlighted code inspector highlighting exact suspicious line ranges (complexity anomalies, introduced bare excepts, AI conversational disclaimers).
   - **Stage 6 (ML Projections)**: 24-dimensional Siamese contrastive neural style projection with Platt logistic probability calibration and 95% confidence intervals.
   - **Stage 7 (Temporal Evolution)**: Longitudinal CUSUM change-point time-series tracking historical assignments up to the investigated submission.
   - **Stage 8 (Case Dossier)**: Official printable case report with dual export modes (Simple Executive Brief vs Extended Forensic Dossier) formatted for academic hearings.
   - **Stage 9 (Validation & Hardening)**: Full empirical benchmark suite displaying confusion matrix, ROC/PR curves, and 14 controlled scenario outcomes.

3. **Google Gemini Flash Integration**:
   - Evidence-weighted forensic synthesis evaluating qualitative findings, counter-evidence, and false-positive guardrails.
   - VivaGuard Oral Defense Script Generator producing structured questions and expected answers for student interviews.

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Running CodeDNA FastAPI backend (default: `http://localhost:8000`)

### Installation & Launch
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm start
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

### Environment Configuration
Copy `.env.example` to `.env.local` to override the default backend URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Keyboard Navigation
The workstation supports rapid single-key navigation across the investigation pipeline:
- `1` : Overview Dashboard
- `2` : Baseline Profile
- `3` : CodeDNA Radar
- `4` : AST Metrics
- `5` : Code Inspector
- `6` : ML Projections
- `7` : Temporal Shifts
- `8` : Case Dossier
- `9` : Validation & Hardening Lab
