# CodeDNA — Competition Max-Out Implementation Context

You are now continuing development of **CodeDNA**, an AI-assisted Student Code Authenticity Investigation Platform.

The project is being developed for a competition where the judging rubric is:

* **Innovation & Originality — 20 pts**
* **AI Implementation — 30 pts**
* **Functionality — 25 pts**
* **UI/UX Design — 15 pts**
* **Documentation — 10 pts**

The goal is NOT merely to satisfy the problem statement.

The goal is to make CodeDNA as technically impressive, demonstrable, robust, explainable, polished, and competition-ready as realistically possible.

Two previous evaluator audit reports have been added to the project as `projecteval1.md` files. **Read both of them completely before making implementation decisions.** They contain the detailed evaluation, current weaknesses, recommended improvements, competitive gaps, and suggested implementation sequence.

## EXISTING PRODUCT

CodeDNA investigates whether a student's new code submission is consistent with their historical coding identity.

Current capabilities include:

* GitHub historical repository ingestion
* Historical ZIP ingestion
* Student CodeDNA baseline construction
* Master class/LMS ZIP analysis
* Course starter-template handling
* New submission ingestion
* Deterministic CodeDNA analysis
* Structural deviation
* Style deviation
* Complexity deviation
* Similarity evidence
* Baseline reliability scoring
* Behavioral anomaly detection
* File-level anomaly scoring
* Suspicious code regions
* Function/line-level evidence
* AI-associated signals
* Author profile diagnosis
* Gemini-based forensic reasoning
* Evidence-based forensic findings
* Counter-evidence / false-positive reasoning
* Recommended evaluator action
* VivaGuard interview questions

Preserve all useful existing functionality.

Do not remove existing features simply because they are not explicitly required by the competition.

---

# OVERALL STRATEGY

We want to build **anything and everything that provides genuine competition value**, not just the minimum viable implementation.

However:

**Do not add technology for technology's sake.**

Every major addition should have a defensible relationship to:

* authorship analysis
* forensic investigation
* anomaly detection
* evidence
* explainability
* robustness
* AI/ML depth
* evaluator usability
* empirical validation

Avoid meaningless additions such as blockchain, voice control, gamification, social sharing, arbitrary extra heuristics, or switching LLM providers purely for marketing.

---

# PRIMARY TECHNICAL GOALS

## 1. Deepen the AI/ML Layer

Current weakness:

The system has sophisticated deterministic analysis and constrained LLM reasoning, but can still appear to be primarily an LLM wrapper.

We want to move toward a genuine **hybrid forensic intelligence architecture**:

Historical Code
→ Feature Extraction
→ CodeDNA Representation
→ Statistical / ML Analysis
→ Anomaly Detection
→ Evidence Aggregation
→ AI Forensic Reasoning
→ Explainable Investigation Report

Investigate and implement where technically justified:

* learned CodeDNA representations
* code/style embeddings
* authorship similarity models
* contrastive/Siamese learning
* anomaly detection models
* clustering
* temporal modeling
* change-point detection
* statistical confidence
* calibrated probabilities
* ensemble scoring
* explainability
* cross-language representations

Do NOT blindly add a neural network.

First inspect the existing feature representation and determine the most credible ML architecture that can be trained and benchmarked with realistic data.

If a learned model is implemented:

* establish training/validation/test separation
* prevent leakage
* benchmark against the existing deterministic system
* report measurable results
* retain the deterministic system as a baseline
* integrate ML as an evidence signal rather than pretending it is absolute truth

The result should demonstrate actual technical improvement.

---

# 2. Temporal Authorship Analysis

Extend CodeDNA beyond a static baseline.

Historical repositories/commits should allow the system to understand:

normal evolution
vs.
gradual skill improvement
vs.
sudden stylistic change.

Investigate:

* historical CodeDNA snapshots
* feature trends
* time-series representation
* change-point detection
* sudden architecture shifts
* sudden complexity changes
* sudden vocabulary/naming changes
* sudden library/framework introduction

The system should be able to explain something like:

"Complexity increased gradually over six historical projects, but the current submission represents an abrupt deviation across multiple independent features."

Avoid treating improvement itself as suspicious.

---

# 3. Cross-Language CodeDNA

Current analysis depth is uneven across languages.

Improve this where practical.

Create a normalized representation of concepts such as:

* functions
* classes
* control flow
* nesting
* declarations
* naming
* imports
* error handling
* complexity
* architecture
* formatting/style

Use proper parsers/AST representations where practical rather than relying entirely on regex.

The goal is to make CodeDNA useful when a student changes language or framework without generating meaningless false positives.

---

# 4. Evidence-Centric Investigation

The strongest part of CodeDNA should be:

**"Why did the system flag this?"**

Build a traceable chain:

Overall Finding
→ Metric Contribution
→ Anomaly
→ File
→ Function
→ Line/Region
→ Supporting Evidence
→ Explanation

Add visual evidence where useful:

* metric contribution charts
* baseline vs submission comparisons
* temporal graphs
* AST/code structural differences
* suspicious-region highlighting
* evidence graphs
* confidence visualization

Do not create visualizations merely for decoration.

---

# 5. Statistical Confidence

Current 0–100 scores must not pretend to be probabilities unless they are statistically justified.

Build toward:

* empirical confidence
* calibration
* validation datasets
* false-positive rate
* false-negative rate
* precision/recall
* ROC/PR analysis where applicable
* reliability diagrams where appropriate

If calibration is implemented, clearly distinguish:

"Deviation score"

from

"Calibrated probability/confidence."

Do not manufacture statistical claims without data.

---

# 6. Robustness & Adversarial Testing

Build systematic tests for cases such as:

* whitespace changes
* variable renaming
* comment injection
* dead code insertion
* trivial refactoring
* function reordering
* formatting changes
* legitimate framework migration
* legitimate skill progression
* starter-template overlap
* copied external code
* AI-assisted historical code
* insufficient historical baseline
* malformed repositories
* tiny submissions
* large repositories
* generated/vendor code

Measure whether CodeDNA remains stable or appropriately reacts.

---

# 7. Production-Grade Functionality

Strengthen:

* upload handling
* ZIP security
* path traversal protection
* malformed files
* unsupported languages
* oversized repositories
* GitHub API failures
* rate limits
* Gemini failures
* invalid AI responses
* database failures
* empty baselines
* insufficient data
* partial analysis failures
* loading states
* retry behavior
* error states
* deployment configuration

The evaluator should never need to use a terminal to operate the product.

---

# 8. Premium UI/UX

The application should feel like a serious forensic investigation platform.

Prioritize:

* clear investigation workflow
* evidence hierarchy
* intuitive dashboards
* excellent information density
* responsive design
* accessible controls
* keyboard navigation
* readable risk indicators
* meaningful animations
* code evidence inspection
* visual comparison
* temporal analysis
* investigation report presentation
* polished loading/error/empty states

Do not overdo animations.

Substance first.

---

# 9. Documentation

Bring documentation to competition-grade quality.

Include where appropriate:

* README
* architecture diagram
* data-flow diagram
* C4-style architecture
* analysis pipeline
* CodeDNA methodology
* scoring methodology
* mathematical definitions
* AI architecture
* ML architecture
* API documentation
* database schema
* security considerations
* limitations
* benchmarking methodology
* test methodology
* reproducibility instructions
* screenshots
* example investigation
* deployment instructions
* environment configuration
* development/contribution documentation

The documentation should allow an evaluator to understand the technical depth without reading the entire source code.

---

# 10. EMPIRICAL BENCHMARKING

This is extremely important.

Eventually we need controlled datasets/scenarios that demonstrate that CodeDNA actually works.

Do not fabricate results.

Prepare the system so we can later test scenarios including:

1. Same author, normal submission
2. Same author, legitimate improvement
3. Same author, framework change
4. Same author, language change
5. Sudden suspicious style change
6. Sudden complexity jump
7. Strong structural anomaly
8. AI-assisted student with historical AI usage
9. Insufficient historical baseline
10. Starter-template-heavy submission
11. Copied/external code
12. Adversarially modified code
13. False-positive cases
14. False-negative cases

Eventually measure:

* detection rate
* false-positive rate
* false-negative rate
* precision
* recall
* confidence calibration
* robustness
* deterministic vs ML performance

The benchmark becomes evidence for the competition submission.

---

# IMPLEMENTATION RULES

Before implementing major architectural changes:

1. Read both evaluator audit `.md` files completely.
2. Inspect the existing implementation.
3. Understand the current architecture.
4. Do not duplicate existing functionality.
5. Do not break working features.
6. Do not replace working systems with mocks.
7. Do not fabricate benchmark results.
8. Do not claim ML performance without actually measuring it.
9. Keep deterministic evidence as the foundation.
10. Keep LLM reasoning grounded in actual evidence.
11. Prefer measurable improvements over marketing language.
12. Maintain clean production-quality code.

For major features, implement incrementally and verify the existing application still builds and runs.

---

# COMPETITION MINDSET

Think like a skeptical evaluator.

For every feature ask:

* Does this solve the actual problem?
* Is it technically meaningful?
* Is it demonstrable?
* Can we prove it works?
* Does it differentiate CodeDNA?
* Does it increase a rubric score?
* Can an evaluator understand its value quickly?

If something sounds impressive but has no real technical value, do not prioritize it.

If something is technically strong but invisible to the evaluator, make it discoverable through the UI or documentation.

---

# CURRENT OBJECTIVE

Start by reading the two audit reports and inspecting the current repository.

Then create an implementation roadmap based on the audits and the actual codebase.

Prioritize:

1. AI/ML depth
2. Innovation
3. Empirical/benchmark foundation
4. Core functionality robustness
5. Evidence/explainability
6. UI/UX
7. Documentation

Do not blindly follow the audit order.

Use your own technical judgment after inspecting the actual implementation.

For now, **do not wait for further clarification**.

Begin implementing the approved high-value improvements progressively.

After each major subsystem, verify that existing functionality remains intact.

The final objective is a CodeDNA system that can withstand both:

* a technical repository-level evaluation
* a live product demonstration

and can support actual empirical evidence for its claims.
