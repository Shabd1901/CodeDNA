# CodeDNA — Technical Requirements Document (TRD)

> **Document Version:** 2.0  
> **Status:** Production / Evaluator-Ready  
> **Primary Entry Point:** [../README.md](../README.md)  
> **Related Documents:** [architecture.md](architecture.md) | [PRD.md](PRD.md)

---

## 1. System Architecture Overview

CodeDNA operates as a 3-tier decoupled architecture:
1. **Presentation Layer:** Next.js 16 (App Router) single-page workstation.
2. **Analysis & ML Layer:** FastAPI application orchestrating deterministic AST parsing, statistical distribution modeling, contrastive Siamese embedding projection, and Platt probability calibration.
3. **Reasoning Layer:** Google Gemini Flash integration executing qualitative evidence synthesis, false-positive guardrail validation, and viva voce interview script generation.

```
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 16 Frontend Workstation             │
│  (Overview, Baseline Profile, Radar, Inspector, ML, Dossier)│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (JSON + Multipart)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Backend Gateway                     │
├──────────────────────────────┬──────────────────────────────┤
│ Deterministic Engine         │ ML & Calibration Head        │
│ • AST Parsing (ast/regex)    │ • 24-Dim Dense Extractor     │
│ • Percentile Metrics (P90)   │ • Siamese Contrastive Head   │
│ • Template Subtraction       │ • Platt Logistic Calibrator  │
│ • Invariant Normalization    │ • Longitudinal CUSUM Shifter │
└──────────────────────────────┴──────────────┬───────────────┘
                                              │ Structured Payload
                                              ▼
                               ┌──────────────────────────────┐
                               │  Google Gemini Flash Engine  │
                               │  • Forensic Reasoning        │
                               │  • Counter-Evidence Checks   │
                               │  • VivaGuard Defense Scripts │
                               └──────────────────────────────┘
```

---

## 2. Technology Stack & Runtime Dependencies

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16.3 (Turbopack) | Fast client-side hydration, App Router modularity, built-in API proxying |
| **UI Components & Styling** | Tailwind CSS, Lucide React, Framer Motion | High-density forensic dashboard styling, smooth pipeline transitions |
| **Data Visualization** | Recharts | Interactive 8-axis radar charts, longitudinal time-series, and distribution bars |
| **Backend Runtime** | Python 3.10+ / 3.12 | Native AST tree exploration, lightweight standard library math |
| **API Framework** | FastAPI + Uvicorn | High-throughput asynchronous endpoints, automatic OpenAPI/Swagger documentation |
| **HTTP Client** | httpx | Asynchronous streaming of GitHub public repositories |
| **AI SDK** | Google GenAI (`google-genai`) | Official modern SDK for Google Gemini Flash models |
| **Persistence** | Ephemeral Serverless `/tmp` or Local `tmp_sessions/` | 100% privacy-preserving; zero database requirement; GDPR-compliant by design |
| **Deployment** | Vercel Unified Monorepo (`vercel.json`) | Single-origin frontend and backend routing with zero CORS friction |

---

## 3. API Endpoint Specifications

### Health & Diagnostic Endpoints
- `GET /` | `GET /api` | `GET /api/health`
  - **Description:** Verifies service availability and runtime version.
  - **Response:** `{"status": "ok", "message": "CodeDNA API is running", "version": "1.0.0"}`

### Ingestion Endpoints (Legacy / Multi-Step Mode)
- `POST /api/session/start`
  - **Description:** Initializes a temporary session directory.
  - **Response:** `{"session_id": "<uuid>"}`
- `POST /api/repositories/upload`
  - **Form Data:** `session_id: str`, `file: UploadFile (.zip)`
  - **Description:** Unpacks historical baseline archives into `repositories/`.
- `POST /api/repositories/github`
  - **Form Data:** `session_id: str`, `username: str`
  - **Description:** Asynchronously fetches up to 5 public repositories for a GitHub handle.
- `POST /api/repositories/template`
  - **Form Data:** `session_id: str`, `file: UploadFile (.zip)`
  - **Description:** Stores instructor starter skeleton for subtractive filtering.
- `POST /api/repositories/cohort-zip`
  - **Form Data:** `session_id: str`, `file: UploadFile (.zip)`
  - **Description:** Ingests master LMS ZIP containing class submissions to build cohort distributions.
- `POST /api/analyze/submission`
  - **Form Data:** `session_id: str`, `file: UploadFile (.zip)`
  - **Description:** Unpacks investigated submission archive.

### Core Analysis Endpoints
- `POST /api/analyze/direct` *(Serverless Recommended)*
  - **Form Data:**
    - `submission: UploadFile (.zip)` *(Required)*
    - `baseline_files: List[UploadFile]` *(Optional)*
    - `template_file: UploadFile` *(Optional)*
    - `cohort_file: UploadFile` *(Optional)*
    - `baseline_type: str` (`"personal"` or `"cohort"`)
    - `github_usernames: str` *(Optional, comma-separated)*
    - `cohort_org: str`, `cohort_prefix: str` *(Optional)*
  - **Description:** Executes atomic single-request archive extraction, AST parsing, and comparison within the same container, eliminating serverless ephemeral storage state loss.
  - **Response:** `{"status": "success", "session_id": "<uuid>", "deterministic_data": {...}}`

- `POST /api/analyze/compare`
  - **Form Data:** `session_id: str`, `baseline_type: str`
  - **Description:** Compares previously staged baseline and submission files on disk.

- `POST /api/analyze/ai-report`
  - **Form Data:** `session_id: str`, `deterministic_data: Optional[str]` *(JSON string)*
  - **Description:** Prompts Gemini Flash using deterministic data (from disk or form payload) and returns structured forensic analysis and viva questions.

### Benchmark & Validation Endpoints
- `GET /api/benchmarks/scenarios`
  - **Description:** Returns the 14 controlled academic integrity scenario definitions with ground-truth labels.
- `GET /api/benchmarks/run`
  - **Description:** Executes all 14 scenarios live through the feature extractor, Siamese projection head, and Platt calibrator, returning confusion matrix, accuracy, FPR, and ROC points.

---

## 4. In-Memory & Storage Specifications

### Session Storage Structure
```
[SESSION_DIR]/[session_id]/
├── repositories/
│   ├── project_alpha/         # Extracted historical baseline repos
│   └── project_beta/
├── submission/
│   └── extracted/             # Extracted target submission code
├── template/                  # Extracted instructor starter code
├── cohort/                    # Cohort class archives and cohort_dna.json
└── deterministic_results.json # Cached comparison payload
```
- **Localhost Environment:** `backend/tmp_sessions/`
- **Serverless Vercel Environment:** `tempfile.gettempdir()/codedna_sessions/` (`/tmp/codedna_sessions/`)

---

## 5. Machine Learning & Calibration Engine

### 1. 24-Dimensional Dense Feature Vector
The ML engine extracts 24 continuous normalized features covering:
- Structural ratios (function density, class-to-function ratio, decorator density, AST node distribution)
- Complexity distributions (mean complexity, P90 complexity, maximum nesting depth)
- Naming convention frequencies (snake_case, camelCase, PascalCase entropy)
- Code formatting characteristics (average indentation, trailing spaces, comment-to-code ratio)
- Syntactic idioms and error handling habits (bare except ratio, custom exceptions, lambda usage)

### 2. Contrastive Siamese Metric Projection
- Projects the 48-dimensional pair vector (24-dim baseline + 24-dim submission) through a trained linear projection layer onto a 24-dimensional hypersphere:
  \[
  \mathbf{z} = \frac{\mathbf{W}\mathbf{x} + \mathbf{b}}{\|\mathbf{W}\mathbf{x} + \mathbf{b}\|_2}
  \]
- Measures latent behavioral distance \(d = \|\mathbf{z}_{\text{base}} - \mathbf{z}_{\text{sub}}\|_2\).

### 3. Platt Logistic Calibration
- Calibrates latent distance into posterior probability of authorship discontinuity:
  \[
  P(\text{Discontinuity} \mid d) = \frac{1}{1 + \exp(A \cdot d + B)}
  \]
- Computes Wald 95% Confidence Intervals:
  \[
  \hat{p} \pm 1.96 \sqrt{\frac{\hat{p}(1 - \hat{p})}{N}}
  \]

### 4. Longitudinal CUSUM Change-Point Analyzer
- Evaluates the cumulative deviation sum across sequential historical repositories:
  \[
  S_k = \max(0, S_{k-1} + (x_k - \mu - k\sigma))
  \]
- Flags abrupt discontinuities exceeding dynamic threshold \(H = 4\sigma\) while absorbing gradual, monotonic skill progression.

---

## 6. Google Gemini Flash Integration & Schemas

### Token Budgeting & Compacting
To prevent `429 RESOURCE_EXHAUSTED` errors on Gemini free-tier TPM (250,000 tokens/min), `backend/ai_engine.py` compacts the deterministic input payload:
- Aggregates file metrics into distribution summaries (median, P75, P90).
- Prunes redundant file lists to top 5 anomalous files.
- Restricts total prompt token volume to `<25,000 tokens`.

### Gemini Output JSON Schema
```json
{
  "executive_summary": "string",
  "verdict_summary": "string",
  "ai_author_profile": "Consistent AI Author | Sudden AI Introduction | Clean Student / Consistent Human Author",
  "findings": [
    {
      "category": "Structural | Naming | Complexity | Formatting | Dependency",
      "severity": "High | Moderate | Low",
      "evidence": "string",
      "counter_evidence": "string",
      "affected_files": ["string"],
      "affected_lines": ["string"]
    }
  ],
  "vivaguard_interview_script": [
    {
      "question": "string",
      "focus_area": "string",
      "expected_competency_answer": "string",
      "red_flag_response": "string"
    }
  ],
  "mitigating_factors": ["string"],
  "recommended_action": "string"
}
```

---

## 7. Security, Privacy & Performance Constraints

1. **Zero Database Retention:** CodeDNA retains zero student data permanently. Sessions are volatile and scrubbed upon completion or container teardown.
2. **Serverless Payload Limits:** Individual ZIP payloads are constrained by Vercel serverless request limits (**4.5 MB**). Larger corporate/institutional archives are processed via the local desktop workflow.
3. **Execution Timeouts:** CPU-bound AST comparisons run in a thread pool with a **60.0s** safety guardrail timeout to protect server resources.