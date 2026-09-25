CodeDNA Project Evaluation

Current Estimated Score: 70/100

Innovation & Originality: 14/20

The project shows good innovation with cohort normalization (comparing against class baseline, not just personal history), starter template subtraction to remove false positives, and tiered AI author profiling (distinguishing Consistent AI Author from Sudden AI Introduction). However, the core concept of comparing student code against their own history isn't entirely novel, and some aspects follow standard code analysis patterns.

AI Implementation: 18/30

The AI implementation properly constrains the LLM to only interpret deterministic evidence (never inventing findings) and uses structured JSON output with strict schema enforcement. However, it appears to be primarily an LLM wrapper without evidence of custom training, fine-tuning, or architecture modifications. The system relies on prompt engineering rather than specialized ML techniques.

Functionality: 20/25

The system is robust with comprehensive metadata collection (naming, formatting, complexity, architecture patterns, etc.), edge case handling (empty repos, insufficient data), and features like cohort normalization and template subtraction. File-level and function-level anomaly detection provide granular insights. However, there's limited evidence of extensive testing (no test files in main project), and language support is uneven (deep AST parsing only for Python, regex-based heuristics for JS/TS).

UI/UX Design: 12/15

The frontend provides a responsive, premium experience with good micro-interactions (Framer Motion animations), clear step-by-step investigation process, and informative dashboard with metrics and visualizations. Error handling is good with specific notifications for rate limits. However, it could benefit from more advanced visualizations (evidence graphs, temporal analysis) and accessibility features.

Documentation: 6/10

Documentation includes detailed PRD.md, TRD.md, and explainer.md files with clear architecture descriptions, feature explanations, and limitations. Setup instructions are provided. However, it lacks API documentation, architecture diagrams, contribution guides, demo screenshots/videos, and other materials that evaluators typically expect.

Prioritized Improvements

MUST DO (Critical Impact)

Improvement: Implement comprehensive test suite for core analysis functions
Why: Addresses missing testing evidence that impacts functionality score and production readiness perception - evaluators look for testing rigor
Rubric: Functionality
Implementation: Create pytest suite for analysis.py functions using test_data/ scenarios with expected outputs for each metric (structural deviation, complexity, etc.)

Improvement: Implement API documentation with OpenAPI/Swagger
Why: Addresses major documentation gap that evaluators expect for technical assessment of backend systems
Rubric: Documentation
Implementation: Add FastAPI automatic documentation endpoint (/docs) and export OpenAPI spec with detailed parameter/response descriptions for all endpoints

Improvement: Add evidence visualization dashboard showing metric contributions
Why: Enhances UI/UX with innovative forensic visualization that explains AI reasoning - makes the "black box" interpretable
Rubric: UI/UX Design
Implementation: Add radar charts/force-directed graphs showing which specific CodeDNA metrics contributed most to anomaly scores, with drill-down to file-level evidence and line-specific highlights

Improvement: Implement temporal analysis of coding style evolution
Why: Adds novel forensic capability that distinguishes natural skill development from sudden changes - addresses a key limitation in current approach
Rubric: Innovation & Originality
Implementation: Add time-series analysis of historical commits showing metric trends with change-point detection algorithms to flag abrupt deviations vs. gradual improvement

SHOULD DO (High Impact)

Improvement: Add accessibility improvements (WCAG 2.1 AA)
Why: Enhances UI/UX to competition-winning levels - evaluators notice accessibility as a quality indicator
Rubric: UI/UX Design
Implementation: Add keyboard navigation, screen reader support (ARIA labels), color contrast improvements (minimum 4.5:1), and proper focus management

Improvement: Create architecture diagrams and data flow documentation
Why: Addresses documentation gaps that evaluators expect - shows system understanding
Rubric: Documentation
Implementation: Generate C4 model diagrams showing system components (frontend, backend, analysis engine), data flows, and integration points with detailed explanations of each layer

Improvement: Implement adversarial robustness testing
Why: Strengthens AI implementation credibility by testing evasion attempts - shows security awareness
Rubric: AI Implementation
Implementation: Create test suite that attempts to fool the system with common evasion techniques (benign comment injection, whitespace/function renaming, dead code insertion) and measure detection/false negative rates

Improvement: Add cross-language CodeDNA normalization
Why: Improves functionality for polyglot students and reduces false positives from language-specific patterns
Rubric: Functionality
Implementation: Map AST concepts across languages (functions, classes, nesting depth, control flow) to create language-agnostic feature vectors for comparison

NICE TO HAVE (Medium Impact)

Improvement: Implement custom CodeDNA embedding model
Why: Transforms AI implementation from LLM wrapper to genuine technical innovation with custom ML architecture
Rubric: AI Implementation
Implementation: Train a Siamese neural network on pairs of student code submissions to learn similarity embeddings that capture coding style, replacing or augmenting the current heuristic deviation scoring

Improvement: Implement confidence calibration for anomaly scores
Why: Strengthens AI implementation with statistical rigor - moves beyond arbitrary thresholds
Rubric: AI Implementation
Implementation: Use Platt scaling or isotonic regression to calibrate deviation scores to empirical false positive rates from test data, providing probability-like confidence measures

Improvement: Create contributor guide and development documentation
Why: Completes documentation package for open-source evaluation
Rubric: Documentation
Implementation: Add CONTRIBUTING.md with setup instructions, coding standards, pull request guidelines, and development workflow description

Shortest Implementation Order Maximizing Score Improvement

1. Implement comprehensive test suite (Critical, Functionality) - Quick win addressing obvious evaluation gap (1-2 days)
2. Implement API documentation with OpenAPI/Swagger (Critical, Documentation) - Addresses major evaluator expectation (1 day)
3. Add evidence visualization dashboard (Critical, UI/UX) - Creates impressive demo feature for presentations (2-3 days)
4. Implement temporal analysis of coding style evolution (High, Innovation) - Novel feature boosting innovation score significantly (2-3 days)
5. Add accessibility improvements (High, UI/UX) - Polishes UI to competition level (1-2 days)
6. Create architecture diagrams (High, Documentation) - Completes documentation package (1 day)
7. Implement adversarial robustness testing (High, AI) - Strengthens AI credibility with testing evidence (2 days)
8. Add cross-language CodeDNA normalization (High, Functionality) - Improves core functionality breadth (2-3 days)
9. Implement custom CodeDNA embedding model (Critical, AI) - Larger technical effort but highest AI score impact (3-5 days)
10. Implement confidence calibration (Medium, AI) - Statistical rigor enhancement (1-2 days)

This order prioritizes quick wins that address obvious evaluation gaps first, then progresses to larger innovations that will most significantly impact scores while minimizing risk to existing functionality. The early implementation of tests and documentation creates a safer foundation for later changes.




-------------------------------------------------------------------




CodeDNA Adversarial Competition Audit

1. Current Competitive Assessment

CodeDNA is a well-engineered AI-assisted forensic analysis system that effectively constrains LLMs to prevent hallucination through structured input/output and prompt engineering. However, it risks being perceived as an LLM wrapper rather than demonstrating genuine ML innovation (scoring toward category B, not C). The system shows strong engineering practices in session management, error handling, and UI polish, but has critical gaps in language support depth (deep AST only for Python), testing evidence, and novel technical contributions beyond standard techniques in the space. While the cohort normalization and tiered AI author profiling are thoughtful additions, they represent incremental improvements over existing approaches rather than paradigm-shifting innovations.

2. Top 10 Improvements

Improvement: Add API documentation with Swagger/OpenAPI
Why: Addresses major documentation gap that evaluators expect for backend systems, showing professionalism and enabling third-party integration
Technical approach: Add FastAPI automatic documentation endpoint (/docs) with descriptive summaries for all endpoints, including parameter types, response schemas, and error conditions
Rubric impact: Documentation +2
Effort: Low
Risk: Low

Improvement: Create architecture and data flow diagrams
Why: Evaluators expect to see architectural understanding in technical submissions; current docs describe but don't visualize system structure
Technical approach: Create C4 model diagrams showing components (frontend, backend, analysis engine, AI engine) and data flow from ZIP upload → analysis → comparison → AI reasoning → report generation
Rubric impact: Documentation +2
Effort: Low
Risk: Low

Improvement: Implement comprehensive test suite for analysis.py
Why: Addresses missing testing evidence that undermines functionality score and production readiness claims
Technical approach: Create pytest suite using test_data/ scenarios with expected outputs for each metric (structural deviation, complexity deviation, etc.) and edge cases (empty files, malformed code)
Rubric impact: Functionality +2
Effort: Low-Medium
Risk: Low

Improvement: Add evidence visualization dashboard
Why: Makes AI reasoning interpretable and demonstrates technical depth by showing which specific metrics drove anomaly scores
Technical approach: Add radar chart/force-directed graph visualizing metric contributions to final score, with drill-down to file-level evidence and line-specific highlights in code view
Rubric impact: UI/UX +2
Effort: Medium
Risk: Low

Improvement: Implement temporal authorship modeling
Why: Addresses key limitation where legitimate skill progression looks like cheating; distinguishes natural evolution from sudden changes
Technical approach: Add time-series analysis of historical commits showing metric trends with change-point detection algorithms (e.g., PELT, Binseg) to flag abrupt deviations vs. gradual improvement
Rubric impact: Innovation +2, Functionality +1
Effort: High
Risk: Medium

Improvement: Add cross-language CodeDNA normalization
Why: Current system has deep AST for Python but only regex-based heuristics for JS/TS, creating unfair analysis quality differences for polyglot students
Technical approach: Map AST concepts across languages (functions, classes, nesting depth, control flow) to create language-agnostic feature vectors using tree-sitter or similar parsers
Rubric impact: Functionality +2
Effort: High
Risk: Medium

Improvement: Implement learned CodeDNA embeddings (Siamese network)
Why: Transforms AI implementation from LLM wrapper to genuine ML innovation by learning what constitutes "coding style" from data
Technical approach: Train contrastive loss network on pairs of student code to predict similarity, using current deterministic metrics as initial training targets; output hybrid score combining learned and heuristic components
Rubric impact: AI Implementation +4, Innovation +2
Effort: High
Risk: Medium

Improvement: Implement adversarial robustness testing
Why: Shows security awareness and strengthens AI credibility by measuring resistance to common evasion techniques
Technical approach: Create test suite that applies evasion techniques (benign comment injection, whitespace/function renaming, dead code insertion, trivial refactoring) and measures detection/false negative rates on held-out test set
Rubric impact: AI Implementation +2
Effort: Medium
Risk: Low

Improvement: Implement calibrated confidence scoring
Why: Moves beyond arbitrary categorical signals (High/Medium/Low) to statistically grounded confidence measures
Technical approach: Use Platt scaling or isotonic regression on validation data to convert deviation scores to empirical false positive probabilities, outputting calibrated confidence alongside findings
Rubric impact: AI Implementation +2
Effort: Medium
Risk: Low

Improvement: Add code similarity visualization (AST diffs)
Why: Provides compelling visual evidence for findings that enhances understanding and demonstrates technical capability
Technical approach: Show side-by-side AST comparisons between baseline-typical code and submission for flagged regions, with highlighted differences in node types/structure
Rubric impact: UI/UX +2
Effort: Medium
Risk: Low

3. AI/ML Deepening Options

Option: Learned CodeDNA embeddings (Siamese network)
Problem: Heuristic deviation scoring uses arbitrary mathematical transformations (sigmoid curves, fixed weights) that may not optimally capture what makes code "similar" or "anomalous" in terms of authorship
Why deterministic can't solve: Relies on predefined metrics and fixed transformations; cannot learn complex patterns from data or adapt to language-specific nuances
Data: Pairs of student code labeled as same/different author (from existing test_data/ plus additional GitHub student projects with verified authorship)
Benchmark: Beat deterministic scoring in correlation with human authorship judgments on held-out test set; aim for >0.8 Spearman correlation
Realistic for competition: Yes - a small Siamese network with contrastive loss could be trained in hours/days on moderate data (<10k pairs) using existing infrastructure
What could go wrong: Overfitting to training data if insufficient diversity; need for careful validation to ensure gains generalize; potential latency increase if not optimized
Expected rubric impact: AI Implementation +4 (could move score from 18→22+), Innovation +2 (demonstrates genuine ML novelty)

Option: Temporal authorship modeling with change-point detection
Problem: System analyzes submissions in isolation; cannot distinguish natural skill progression (e.g., summer learning) from sudden cheating
Why deterministic can't solve: Lacks temporal context; all comparisons are baseline-vs-snapshot ignoring evolution
Data: Historical commit sequences with extracted CodeDNA metrics over time for verified authors
Benchmark: Reduce false positives on legitimate skill improvement cases by >30% while maintaining detection rate for actual cheating
Realistic for competition: Requires processing commit history but feasible with existing GitHub integration; adds ~20% complexity to baseline building
What could go wrong: False alarms on noisy metric sequences; requires sufficient historical data points for reliable change-point detection
Expected rubric impact: Innovation +2 (novel temporal approach), Functionality +1 (improved baseline quality)

Option: Calibrated confidence scoring via Platt scaling
Problem: Categorical signals (High/Medium/Low) lack statistical meaning and create false precision
Why deterministic can't solve: Deviation scores aren't probabilities; no mapping to empirical error rates
Data: Validation set with known true positives/negatives (from test_data/ scenarios and additional labeled pairs)
Benchmark: Reliability diagrams showing calibrated probabilities match observed frequencies (e.g., 80% confidence cases are correct 80% of the time)
Realistic for competition: Straightforward statistical calibration requiring only validation data collection
What could go wrong: Poor calibration if validation set unrepresentative or too small; needs periodic recalibration
Expected rubric impact: AI Implementation +2 (strengthens statistical rigor)

4. Innovative Features Worth Considering

1. Cross-language code embeddings - Unified representation capturing programming language-agnostic coding style using transformer-based architectures on ASTs
2. Causal inference for anomalies - Not just detecting anomalies but explaining why they occurred (e.g., "this complexity increase correlates with introduction of library X")
3. Federated learning for baseline updates - Privacy-preserving updates from multiple institutions without sharing raw code
4. Explainable AI for metric contributions - SHAP-like values showing which specific CodeDNA features drove the AI's decision
5. Active learning for evaluator feedback - System improves based on evaluator corrections (e.g., "this was a false positive")

5. Features That Are Mostly Fluff / Low ROI

1. Switching LLMs (Gemini → GPT-4o) - Minimal difference if prompting/constraints identical; evaluators care about what the AI does, not which API it calls
2. Adding more heuristic metrics - Increases complexity without improving accuracy; risks overfitting and making system harder to interpret
3. Fancy UI animations - Doesn't demonstrate technical capability; evaluators look for substance over flash in forensic tools
4. Blockchain audit trails - Irrelevant to core problem; seen as tech for tech's sake that adds unnecessary complexity
5. Voice-controlled interface - Solves no domain-specific problem; distracts from core functionality and introduces new failure modes
6. Real-time collaboration features - Out of scope for forensic analysis tool (which should be passive/investigative)
7. Gamification elements - Inappropriate for serious academic integrity tool; undermines gravity of the use case
8. Social media sharing - Violates privacy expectations for student code; creates liability and trust issues

6. Three Biggest Score Bottlenecks

1. AI Implementation (18/30) - Primary bottleneck; perceived as LLM wrapper rather than demonstrating deep ML innovation. The system uses off-the-shelf LLMs with careful prompting but lacks learned components, statistical rigor, or novel ML architectures specific to authorship attribution.
2. Innovation & Originality (14/20) - Lacks truly novel technical contributions beyond standard techniques in the space. While cohort normalization and tiered AI profiling are thoughtful, they represent incremental improvements over existing approaches (e.g., Moss for plagiarism, standard stylometry) rather than paradigm-shifting innovations.
3. Functionality (20/25) - Uneven language support (deep AST parsing only for Python, regex-based heuristics for JS/TS) creates unfair analysis quality differences and undermines claims of robustness. Limited testing evidence (no visible test suite in main project) further weakens production readiness perceptions.

7. Recommended Implementation Sequence

1. Implement comprehensive test suite for analysis.py
   - What: Create pytest suite verifying core analysis functions against test_data/ scenarios
   - Why: Addresses obvious evaluation gap with minimal risk; creates safer foundation for changes
   - Effort: Low-Medium | Risk: Low | Rubric impact: Functionality +2

2. Create architecture and data flow diagrams
   - What: Draw C4 model showing components and data flow from upload to report
   - Why: Addresses major documentation deficiency evaluators expect
   - Effort: Low | Risk: Low | Rubric impact: Documentation +2

3. Add API documentation with Swagger/OpenAPI
   - What: Implement FastAPI automatic documentation endpoint with descriptive endpoint summaries
   - Why: Completes documentation package; shows professionalism
   - Effort: Low | Risk: Low | Rubric impact: Documentation +1

4. Add evidence visualization dashboard
   - What: Radar chart showing metric contributions to anomaly score with drill-down to evidence
   - Why: Creates impressive demo feature that makes AI reasoning interpretable
   - Effort: Medium | Risk: Low | Rubric impact: UI/UX +2

5. Implement adversarial robustness testing
   - What: Test suite applying evasion techniques (comment injection, renaming, dead code)
   - Why: Strengthens AI credibility with concrete evidence of robustness
   - Effort: Medium | Risk: Low | Rubric impact: AI Implementation +2

6. Implement calibrated confidence scoring
   - What: Platt scoring converting deviation scores to empirical false positive probabilities
   - Why: Moves beyond arbitrary thresholds to statistically grounded measures
   - Effort: Medium | Risk: Low | Rubric impact: AI Implementation +2

7. Add code similarity visualization (AST diffs)
   - What: Side-by-side AST comparisons highlighting structural differences in flagged regions
   - Why: Provides compelling visual evidence for findings
   - Effort: Medium | Risk: Low | Rubric impact: UI/UX +2

8. Implement temporal authorship modeling
   - What: Time-series analysis of historical commits with change-point detection for abrupt deviations
   - Why: Novel feature addressing key limitation; boosts innovation and functionality scores
   - Effort: High | Risk: Medium | Rubric impact: Innovation +2, Functionality +1

9. Add cross-language CodeDNA normalization
   - What: Language-agnostic feature vectors mapping AST concepts across programming languages
   - Why: Improves core functionality breadth and fairness for polyglot students
   - Effort: High | Risk: Medium | Rubric impact: Functionality +2

10. Implement learned CodeDNA embeddings (Siamese network)
    - What: Contrastive loss network learning similarity from student code pairs
    - Why: Highest impact improvement transforming AI perception from wrapper to genuine ML innovation
    - Effort: High | Risk: Medium | Rubric impact: AI Implementation +4, Innovation +2

This sequence prioritizes low-risk, high-reward items that build confidence and foundational quality first, then progresses to higher-effort innovations that will most significantly impact scores while having validated the core system. The early focus on tests, documentation, and basic visualizations creates a stronger foundation for accepting larger technical changes later.

---

## Max-Out Implementation Roadmap (Phased)

Based on the audit reports and the primary technical goals for competition readiness, the following phased implementation plan will be executed.

### Phase 0: Workspace Restructuring & Cleanup (✅ Completed)
* [x] **Repository Organization:** Restructure the project folder (e.g., consolidating all markdown and planning docs into a unified `docs/` folder) to make it highly scannable and logically organized for AI agents and evaluators.
* [x] **Redundancy Removal:** Clean up temporary files, legacy drafts, and disconnected documentation that do not contribute to the working functionalities.

### Phase 1: Foundation & Documentation (✅ Completed)
* [x] **API Documentation:** Expose FastAPI OpenAPI (`/docs`) to demonstrate production readiness.
* [x] **Architecture Diagrams:** Generate C4 model diagrams and data flow documentation to satisfy evaluator expectations.

### Phase 2: Evidence Visualization & UX Polish
* [ ] **Evidence Dashboard:** Implement visual evidence graphs (radar charts, metric contributions) to make AI reasoning interpretable.
* [ ] **Code Similarity Diffs:** Show side-by-side AST comparisons highlighting structural differences in flagged regions.
* [ ] **Accessibility:** Ensure UI meets WCAG 2.1 AA standards (keyboard navigation, ARIA, contrast).

### Phase 3: Deep AI/ML Innovation (Core Competition Value)
* [ ] **Temporal Authorship Modeling:** Implement time-series analysis and change-point detection on historical commits to distinguish natural skill improvement from sudden anomalies.
* [ ] **Learned CodeDNA Embeddings:** Develop a Siamese neural network to learn similarity embeddings, transitioning from pure heuristics to a hybrid deterministic/ML architecture.
* [ ] **Calibrated Confidence Scoring:** Apply Platt scaling/isotonic regression to map deviation scores to empirical probabilities.

### Phase 4: Robustness & Cross-Language Parity
* [ ] **Cross-Language Normalization:** Map AST concepts across programming languages (Python, JS/TS) for agnostic feature vectors.
* [ ] **Adversarial Robustness Testing:** Create test suites targeting evasion techniques (benign comment injection, dead code, renaming) and measure detection rates.