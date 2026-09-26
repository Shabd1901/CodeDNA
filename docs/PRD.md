# CodeDNA — Product Requirements Document (PRD)

> **Document Version:** 2.0  
> **Status:** Production / Evaluator-Ready  
> **Primary Entry Point:** [../README.md](../README.md)  
> **Related Documents:** [architecture.md](architecture.md) | [TRD.md](TRD.md) | [explainer.md](explainer.md)

---

## 1. Product Vision & Executive Summary

**CodeDNA** is an evidence-based forensic code authorship investigation platform for higher education computer science departments and academic integrity hearing boards.

### The Problem
Contemporary AI code detectors and plagiarism matchers suffer from:
1. **Pseudoscience & Unverifiable Probabilities:** Displaying arbitrary percentages (e.g., *"88% AI-written"*) without explaining which specific tokens or AST structures triggered the score.
2. **False Accusation Vulnerability:** Punishing innocent students who write idiomatic code, use standard linters/formatters (Prettier, Black), or implement course starter templates.
3. **Inability to Contextualize Continuous AI Usage:** Failing to differentiate between a student who consistently uses permitted AI copilots across all coursework versus contract cheating where an assignment is suddenly outsourced.

### The Product Solution
CodeDNA evaluates **Longitudinal Stylistic Invariants** by comparing a target submission against **the student's own verified historical programming baseline** across deterministic AST metrics, contrastive Siamese ML embeddings, temporal change-points, and evidence-weighted Google Gemini Flash qualitative analysis.

---

## 2. Target Users & Personas

| Persona | Primary Goal | Key Pain Points Addressed |
| :--- | :--- | :--- |
| **Academic Integrity Officer** | Review referred cases with legally defensible evidence that withstands formal hearings and appeals. | Replaces ungrounded percentage flags with concrete line-by-line evidence, historical deviation radar charts, and official case dossiers. |
| **Computer Science Professor** | Quickly verify suspicious submissions without false-positive alarms caused by course starter code or library boilerplate. | Subtractive starter template filter removes false alarms; cohort mode compares against class norms. |
| **Teaching Assistant / Marker** | Interview students effectively during viva voce defense examinations. | VivaGuard automatically synthesizes personalized oral defense questions targeted directly at anomalous code sections. |

---

## 3. Core Functional Requirements

### 3.1 Data Ingestion & Intake Pathways (P0)
- **Personal Historical Archive Intake:** Support uploading up to 20 reference ZIP archives from previous courses or projects.
- **GitHub Automatic Discovery:** Support real-time ingestion of up to 5 public repositories for any public GitHub username, with client-side domain validation and typo detection.
- **Investigated Submission Intake:** Drag-and-drop ingestion of the target assignment archive (.zip).
- **Instructor Starter Template Filter:** Optional ingestion of skeleton starter code with automatic AST subtraction to eliminate boilerplate false positives.
- **Cohort Normalization (LMS / Classroom Export):** Ingestion of master class ZIP exports (Canvas, Blackboard, Moodle) or GitHub Classroom organization repositories to compute class-wide P50, P75, and P90 baseline percentiles.

### 3.2 Deterministic Forensic Extraction (P0)
- **8-Vector Invariant Metric Extraction:**
  1. AST Structural Patterns (loop ratios, list/dict comprehensions, decorators)
  2. Cyclomatic Complexity Distributions (mean, median, P75, P90 percentiles)
  3. Naming Style Cadence (snake_case, camelCase, PascalCase entropy)
  4. Formatting Fingerprints (indentation, line breaks, comment density)
  5. Architecture & Paradigm Invariants (OOP inheritance, static/class methods)
  6. Dependency Adoption Habits (new/unseen external library flags)
  7. Abstraction Ratios (type hint frequency, function length percentiles)
  8. Error Handling Patterns (try/catch granularity, bare except detection)
- **Real Code Sniffer:** Extract authentic file content and exact line ranges for flagged regions rather than mock summaries.

### 3.3 Author Profiling & Baseline Integrity (P0)
- **Categorical Signal Safety Guardrails:** Strictly replace single percentage scores with categorical indicators:
  - *Authorship Evidence:* Strong / Moderate / Weak
  - *Baseline Reliability:* High / Moderate / Low
  - *Overall Investigation Concern:* High / Moderate / Low
- **Three-Tier Author Profiling:**
  - `Clean Student / Consistent Human Author`: High historical similarity, low anomaly count.
  - `Consistent AI Author`: Low behavioral deviation paired with persistent AI markers across both baseline and submission. (Downgraded concern: *"Policy compliance issue, not substitution fraud"*).
  - `Sudden AI Introduction`: Clean historical baseline paired with sudden AI conversational markers or extreme complexity shifts in the target submission.

### 3.4 Machine Learning & Calibration (P1)
- **Contrastive Siamese Projection:** 24-dimensional dense feature projection measuring invariant style distance on a normalized hypersphere.
- **Platt Logistic Probability Calibration:** Calibrated posterior probability \(P(\text{Discontinuity} \mid \text{DNA})\) accompanied by 95% Wald confidence intervals.
- **Temporal CUSUM Analysis:** Change-point detection identifying abrupt shifts vs gradual student learning over time.

### 3.5 AI Forensic Reasoning & VivaGuard (P0/P1)
- **Evidence-Constrained Gemini Flash Integration:** LLM interprets only deterministic evidence without hallucinating unobserved patterns.
- **Counter-Evidence Analysis:** Explicit requirement for Gemini to search for and articulate mitigating factors (e.g. library documentation patterns, formatters, course framework idioms).
- **VivaGuard Defense Script Generation:** 3–5 targeted questions with expected technical answers and red-flag responses for oral hearings.

### 3.6 Interactive Workstation & Case Dossier (P0)
- **Multi-View Pipeline Navigation:** 9 distinct stages (Overview, Baseline Profile, Radar Chart, AST Metrics, Code Inspector, ML Projections, Temporal Evolution, Case Dossier, Validation Lab).
- **Printable A4 Forensic Dossier:** Dual-mode export (Executive Brief vs Full Extended Audit) with browser print formatting, CSS page breaks, and evaluator signature sign-off.

---

## 4. Non-Functional & Ethical Requirements

1. **Privacy-Preserving & Zero Permanent Retention:** No student code is written to permanent databases. All processing occurs in ephemeral serverless storage or local disk.
2. **Speed & Responsiveness:** Deterministic AST extraction and ML projection execute in `<150ms`. Complete end-to-end analysis finishes in `<2.0s`.
3. **Human-in-the-Loop Requirement:** CodeDNA is an investigative decision-support system. It never generates automated sanctions, penalties, or disciplinary verdicts.