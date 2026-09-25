Architecture
Next.js Frontend
       ↓
FastAPI Backend
       ↓
Analysis Engine
 ├── Repository Collector
 ├── Code Parser / AST
 ├── Static Analyzer
 ├── Similarity Engine
 ├── CodeDNA Engine
 └── Forensic Engine
       ↓
Structured Evidence
       ↓
OpenAI API
       ↓
AI Reasoning / Report / Viva
       ↓
Temporary Server-side File Storage


----------


Stack
Frontend: Next.js + TypeScript + Tailwind
Backend: Python + FastAPI
Code analysis: Python AST + language-specific parsers where practical
GitHub: GitHub REST API
AI: OpenAI API
Storage: Temporary server-side file system / memory (no database)
Charts: Recharts
Deployment: Vercel + backend hosting
Main Backend Modules
/api/github
/api/repositories
/api/analyze
/api/codedna
/api/forensics
/api/viva
/api/reports
In-Memory / Temporary File Structures
InvestigationSession
Repository (Uploaded/Cloned)
CodeDNABaseline
AnalysisEvidence
ForensicReport

--------


AI Input

Never send an entire repository blindly.

Send the LLM:

CodeDNA
+
baseline reliability
+
static metrics
+
similarity results
+
flagged regions
+
historical-vs-new differences

----

AI Output

Structured JSON:

findings[]
severity
reason
evidence
affected_files
affected_lines
confidence
limitations
recommended_action
Important Product Rule

The AI never invents evidence.

Deterministic analysis produces evidence.
AI interprets and connects that evidence.