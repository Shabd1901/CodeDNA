1. Product

CodeDNA — an AI-assisted student code authenticity investigation platform.


2. Goal

Analyze a student's historical public GitHub code, build a CodeDNA fingerprint, compare a new submission, identify meaningful anomalies, and produce an evidence-based forensic report.


3. Core Flow
Historical Repositories Input (Manual Upload or GitHub Username)
      ↓
Analyze Historical Code
      ↓
Build CodeDNA + Baseline Integrity
      ↓
Upload New Submission
      ↓
Static + Similarity Analysis
      ↓
AI Forensic Reasoning
      ↓
Evidence Report
      ↓
Optional VivaGuard


4. CodeDNA

Track:

Naming conventions
Formatting/indentation
Function/class structure
Architecture patterns
Complexity
Imports/libraries
Comments/docstrings
Common coding mistakes
Error-handling patterns
Code similarity


5. Baseline Integrity

Determine whether historical repositories provide a reliable baseline.

Possible states:

Reliable
Mixed
Insufficient

Never claim authorship certainty.


6. Forensic Analysis

Identify:

Major style changes
Complexity jumps
Architecture changes
Suspicious code regions
Similar/copied code
AI-code heuristic signals
Unexplained deviations


7. AI Core

LLM receives structured analysis evidence and:

reasons across signals
prioritizes anomalies
explains findings
generates investigation summaries
generates optional VivaGuard questions


8. VivaGuard

Optional evaluator tool that generates targeted questions from flagged code.


9. Cold Start

If no historical repositories exist:

Skip CodeDNA comparison
Analyze the submission independently
Clearly mark historical evidence as unavailable


10. Output

Interactive forensic dashboard containing:

Overall investigation status
Baseline reliability
CodeDNA summary
Evidence
Flagged files/lines
AI reasoning
Confidence/limitations
VivaGuard
Exportable report

11. MVP Priority

P0 — Must work

Manual upload of historical repositories & GitHub discovery
Repository/code parsing
CodeDNA
New submission upload
Comparison
Forensic findings
AI reasoning
Dashboard
PDF/export report
GitHub commit-history analysis

P1 — If time
VivaGuard

P2 — Polish
Advanced visualizations
More language support
Advanced repository filtering