Here is the full system-wide diagnostic report for the CodeDNA academic integrity platform across the backend and frontend components.

### Phase 1 — Logic Failure Mapping

| File | Line(s) | Risk | Severity |
| :--- | :--- | :--- | :--- |
| `analysis.py` | 394-395 | **Silent Analysis Failure:** The `analyze_file` function catches `Exception` broadly and passes. If a file causes an unexpected error (e.g., encoding issues, memory limits during regex), it silently returns a mostly empty metrics object without logging. | P2 |
| `analysis.py` | 428 | **Empty Repo Handling:** `build_repository_codedna` checks `if os.path.exists(repo_dir):`. If the directory doesn't exist, it silently returns an empty DNA template with `0`s. This can cause divide-by-zero or wildly skewed deviation scores in `compare_codedna`. | P1 |
| `analysis.py` | 798-809 | **Empty Cohort Skipping:** `build_cohort_codedna` returns a blank repository DNA if `cohort_dirs` is empty. If all students fail to extract, it silently generates an empty baseline. | P1 |
| `main.py` | 125-126, 203-204, 285-286 | **Swallowed ZIP Errors:** During GitHub fetching or cohort ZIP extraction, `BadZipFile` or `RequestError` are caught with `pass`. If all repositories are malformed, it silently proceeds with 0 valid repositories. | P2 |
| `ai_engine.py` | 88 | **AI JSON Parsing Crash:** The engine uses `json.loads(response.text)`. If Gemini wraps the output in Markdown (`` `json ... ` ``), this will throw a `JSONDecodeError`, failing over until all models are exhausted, ultimately crashing the request. | P0 |
| `page.tsx` | 303 | **AI Mode Mismatch:** Frontend checks `data.ai_mode === "gemini"`. But `ai_engine.py` returns `f"gemini ({model_name})"`. This condition will evaluate to false, meaning the frontend will always display "OpenAI GPT-4o" even when Gemini was used. | P2 |
| `page.tsx` | 829 | **React Crash on Malformed AI Payload:** The UI iterates `report.forensic_report.findings?.map()`. If the AI hallucinates the JSON structure and omits `findings` or returns it as an object instead of an array, this will throw a `TypeError` and crash the entire UI render. | P0 |

---

### Phase 2 — API Contract Audit

**Frontend Reads vs Backend Response Risks:**

1. **`report.deterministic_data.reliability`**:
   - *Frontend:* Expects a string `=== 'Reliable'`. (Line 653: `report.deterministic_data?.reliability === 'Reliable'`)
   - *Backend:* The backend does not return `reliability`. It returns `authorship_intelligence.evidence_confidence_score` (a number) and `authorship_intelligence.categorical_signals.baseline_reliability` (string: `"High" | "Moderate" | "Low"`). The frontend will always show "Unknown" (and the amber color) because `reliability` is undefined.

2. **`report.forensic_report.findings` structure**:
   - *Frontend:* Expects `false_positive_considerations` and `contradictory_evidence`.
   - *Backend AI Prompt:* Mandates these fields. However, AI can sometimes fuse them or rename keys if not using strict structured outputs, risking missing data on the UI.

3. **Wasted Data (Returned but Ignored):**
   - The backend `compare_codedna` generates extensive `per_file_anomaly_scores` and raw `distribution_shifts`.
   - The frontend entirely ignores `per_file_anomaly_scores` and `distribution_shifts`, wasting payload size and processing time.

---

### Phase 3 — Test Case Design

Here is the concrete test matrix to validate the system mathematically and behaviorally.

| Test Case | Input Scenario | Expected Deterministic Output | Expected AI Output | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **1. Clean Student** | **Baseline:** 5 small Python scripts. <br>**Sub:** Same logic, same style, snake_case, no type hints. | `structural_deviation`: < 20 <br> `ai_pattern_indicators`: 0 <br> `overall_concern`: LOW | "Behaviorally matches historical baseline." | `investigation_status` == "CLEAR", `overall_investigation_score` < 30. |
| **2. Sudden AI Intro** | **Baseline:** Messy JS, no comments, high nesting.<br>**Sub:** Clean TS, heavy docstrings, `type_hint_ratio` > 0.8, "As an AI..." comments. | `ai_author_profile`: "Sudden AI Introduction"<br>`ai_pattern_indicators`: > 0 | Highlights sudden leap in sophistication and explicit AI markers. | `investigation_status` == "HIGH CONCERN", `categorical_signals.overall_investigation_concern` == "High". |
| **3. Consistent AI** | **Baseline:** Already contains GPT fingerprints and high complexity.<br>**Sub:** Similar AI fingerprints. | `ai_author_profile`: "Consistent AI Author"<br>`ai_pattern_indicators`: > 0 | Advises that deviation is low; student consistently uses AI. | `overall_investigation_concern` == "Moderate", explicitly states "Policy issue, not substitution". |
| **4. Plagiarism** | **Baseline:** Student A's historical Python.<br>**Sub:** Exact copy of Student B's historical code. | `structural_deviation`: > 70<br>`naming_deviation`: > 80 | Flags massive structural and stylistic discontinuity. | `overall_investigation_concern` == "High", `architectural_discontinuity` == "High". |
| **5. Empty/Minimal** | **Baseline:** 10 repos.<br>**Sub:** 1 file, 10 lines of code. | `complexity_deviation`: Very High (dropped to 0). | Notes insufficient submission size for reliable comparison. | `evidence_confidence_score` drops dramatically for submission. |
| **6. Cross-Language** | **Baseline:** Java & Python.<br>**Sub:** Purely JavaScript. | `architecture_deviation`: > 90<br>`structural_deviation`: > 80 | Identifies complete language/stack pivot. | `categorical_signals.authorship_evidence` == "Strong" (deviation). |
| **7. 429 Rate Limit** | Simulating a 429 response from GitHub API. | N/A | N/A | Frontend correctly parses HTTP 429, shows Amber Rate Limit Banner instead of crashing. |
| **8. Cohort + Template** | **Cohort:** 20 student zips.<br>**Sub:** Has identical boilerplate as template. | `novel_code_ratio`: Accurately reflects only the student's additions. | Focuses only on the logic added on top of the template. | `structural_deviation` calculated strictly on non-template functions. |

---

### Phase 4 — Benchmark Thresholds

**1. Scoring Math Analysis (`calc_dev` in `analysis.py`)**
- The non-linear sigmoid `100.0 * (1.0 - 1.0 / (1.0 + (raw_ratio / 0.5) ** 1.4))` is mathematically safe. Division by zero is avoided via `max(0.1, b_val)`. It cannot produce NaN, infinity, or negative values.
- **Score Ranges:**
  - **LOW Concern (0 - 30):** Represents < 30% drift. Natural evolution of a student's coding ability over a semester.
  - **MODERATE Concern (31 - 70):** Represents 30% - 70% drift. Heavy use of new libraries or a sudden shift in paradigm (e.g., learning OOP).
  - **HIGH Concern (71 - 100):** Represents > 70% drift. Complete stylistic override (tabs to spaces, snake to camel, massive complexity drop).

**2. Vector Weights & Recommendations**
- **Highest Weight Vectors:** `structural_deviation` (AST depth, control flow) and `complexity_deviation`. Formatting can be changed by a linter (Prettier/Black), but AST structure is the true fingerprint of a developer's brain.
- **Minimum Baseline Size:** To generate a reliable signal (Reliability > 70), the baseline should contain at least **3 repositories** comprising a minimum of **500 LOC**. Anything less subjects the AST distribution to high variance.

**System Readiness Score**
* **Analysis Engine:** **8/10** — Strong mathematical models, but too many silent `except Exception: pass` swallows potential critical parser failures.
* **AI Engine:** **7/10** — Good fallback loops, but highly vulnerable to JSON markdown hallucination.
* **API Layer:** **8/10** — Well structured, but needs tighter validation on ZIP contents before processing.
* **Frontend Rendering:** **6/10** — Visually excellent, but brittle (React crashes on bad JSON arrays, misaligned `ai_mode` and `reliability` keys).