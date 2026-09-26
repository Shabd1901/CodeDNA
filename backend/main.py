from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).with_name(".env"))

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio
import uuid
import os
import sys
import shutil
import zipfile
# Ensure backend directory is in sys.path for serverless container execution
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import tempfile
from analysis import build_repository_codedna, compare_codedna, build_cohort_codedna, subtract_template_dna
from ai_engine import generate_forensic_report

app = FastAPI(
    title="CodeDNA Forensic API", 
    version="1.0.0",
    description="""
CodeDNA API provides endpoints to ingest student repositories, process structural AST footprints (CodeDNA), 
and evaluate submission authenticity through deterministic deviation analysis combined with AI-driven forensic reasoning.

## Core Workflows
1. **Session Management**: Start and cleanup temporary investigation sessions.
2. **Data Ingestion**: Upload manual ZIPs, template code, LMS cohort exports, or sync from GitHub.
3. **Forensic Analysis**: Run deterministic comparisons and trigger LLM-based investigation reports.
    """,
    contact={
        "name": "CodeDNA AI"
    }
)

raw_origins = (os.getenv("ALLOWED_ORIGINS") or "").strip()
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()] if raw_origins else ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# On Vercel Serverless (read-only filesystem), route sessions to writable /tmp
if os.getenv("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") or os.getenv("SESSION_STORAGE_DIR"):
    SESSION_DIR = os.getenv("SESSION_STORAGE_DIR") or os.path.join(tempfile.gettempdir(), "codedna_sessions")
else:
    SESSION_DIR = os.path.join(os.path.dirname(__file__), "tmp_sessions")
os.makedirs(SESSION_DIR, exist_ok=True)

@app.get("/", tags=["Health"])
@app.get("/api", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def read_root():
    return {"status": "ok", "message": "CodeDNA API is running", "version": "1.0.0"}

@app.post("/api/session/start", tags=["Session"], summary="Start Investigation Session")
def start_session():
    """Start a new investigation session"""
    session_id = str(uuid.uuid4())
    os.makedirs(os.path.join(SESSION_DIR, session_id, "repositories"), exist_ok=True)
    os.makedirs(os.path.join(SESSION_DIR, session_id, "submission"), exist_ok=True)
    return {"session_id": session_id}

@app.post("/api/repositories/upload", tags=["Ingestion"], summary="Upload Reference ZIP")
async def upload_repository(session_id: str = Form(...), file: UploadFile = File(...)):
    """Upload a ZIP file of a historical repository"""
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are allowed")
    
    session_path = os.path.join(SESSION_DIR, session_id)
    if not os.path.exists(session_path):
        raise HTTPException(status_code=404, detail="Session not found")
        
    repo_zip_path = os.path.join(session_path, "repositories", file.filename)
    
    with open(repo_zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Extract the zip
    extract_path = os.path.join(session_path, "repositories", file.filename[:-4])
    try:
        with zipfile.ZipFile(repo_zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid zip file")
        
    return {"status": "success", "repository": file.filename[:-4]}

@app.post("/api/repositories/github", tags=["Ingestion"], summary="Fetch from GitHub")
async def fetch_github_repos(session_id: str = Form(...), username: str = Form(...)):
    """Fetch public repositories for a GitHub user and extract them into the session."""
    session_path = os.path.join(SESSION_DIR, session_id)
    if not os.path.exists(session_path):
        raise HTTPException(status_code=404, detail="Session not found")
        
    repos_dir = os.path.join(session_path, "repositories")
    
    github_token = (os.getenv("GITHUB_TOKEN") or "").strip()
    headers = {"User-Agent": "CodeDNA-Forensic-App"}
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"
    
    async with httpx.AsyncClient(headers=headers, timeout=15.0) as client:
        url = f"https://api.github.com/users/{username}/repos?sort=pushed&per_page=5"
        try:
            response = await client.get(url)
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Network error connecting to GitHub: {str(exc)}")
        
        if response.status_code in (403, 429) or "rate limit" in response.text.lower():
            raise HTTPException(
                status_code=429,
                detail="GitHub API rate limit exceeded (60 requests/hr limit for unauthenticated users). Add a GITHUB_TOKEN to backend/.env to increase limit to 5,000 requests/hr, or upload reference ZIPs manually."
            )
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"GitHub user '{username}' was not found.")
        elif response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to fetch repositories for '{username}' (HTTP {response.status_code}).")
            
        repos = response.json()
        if not isinstance(repos, list) or len(repos) == 0:
            raise HTTPException(status_code=404, detail=f"No public repositories found for GitHub user '{username}'.")

        downloaded = []
        for repo in repos:
            repo_name = repo["name"]
            branch = repo.get("default_branch", "main")
            zip_url = f"https://github.com/{username}/{repo_name}/archive/refs/heads/{branch}.zip"
            
            try:
                zip_response = await client.get(zip_url, follow_redirects=True)
                if zip_response.status_code == 200:
                    zip_path = os.path.join(repos_dir, f"{repo_name}.zip")
                    with open(zip_path, "wb") as f:
                        f.write(zip_response.content)
                    
                    extract_path = os.path.join(repos_dir, repo_name)
                    try:
                        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                            zip_ref.extractall(extract_path)
                        downloaded.append(repo_name)
                    except zipfile.BadZipFile:
                        pass
            except httpx.RequestError:
                pass
                    
        if not downloaded:
            raise HTTPException(status_code=400, detail=f"Failed to download or extract any valid repositories for '{username}'.")

    return {"status": "success", "fetched": downloaded}

@app.post("/api/repositories/template", tags=["Ingestion"], summary="Upload Starter Template")
async def upload_template(session_id: str = Form(...), file: UploadFile = File(...)):
    """Upload a ZIP file of the starter code/template"""
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are allowed")

    session_path = os.path.join(SESSION_DIR, session_id)
    if not os.path.exists(session_path):
        raise HTTPException(status_code=404, detail="Session not found")

    # Create template directory
    template_path = os.path.join(session_path, "template")
    os.makedirs(template_path, exist_ok=True)

    # Save the zip
    template_zip_path = os.path.join(template_path, file.filename)

    with open(template_zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract the zip
    extract_path = os.path.join(template_path, file.filename[:-4])
    try:
        with zipfile.ZipFile(template_zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid zip file")

    return {"status": "success", "template": file.filename[:-4]}
@app.post("/api/repositories/cohort-zip", tags=["Ingestion"], summary="Upload LMS Cohort Export")
async def upload_cohort_zip(session_id: str = Form(...), file: UploadFile = File(...)):
    """Upload a master LMS ZIP containing student submissions"""
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are allowed")

    session_path = os.path.join(SESSION_DIR, session_id)
    if not os.path.exists(session_path):
        raise HTTPException(status_code=404, detail="Session not found")

    # Create cohort directory
    cohort_path = os.path.join(session_path, "cohort")
    os.makedirs(cohort_path, exist_ok=True)

    # Save the zip
    cohort_zip_path = os.path.join(cohort_path, file.filename)

    with open(cohort_zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract the master zip
    extract_path = os.path.join(cohort_path, "master")
    try:
        with zipfile.ZipFile(cohort_zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid zip file")

    # Process each student submission (subfolders or zips)
    student_dirs = []
    for item in os.listdir(extract_path):
        item_path = os.path.join(extract_path, item)
        if os.path.isdir(item_path):
            student_dirs.append(item_path)
        elif item_path.endswith('.zip'):
            # Extract the student zip
            student_extract_path = os.path.join(cohort_path, f"student_{item[:-4]}")
            os.makedirs(student_extract_path, exist_ok=True)
            try:
                with zipfile.ZipFile(item_path, 'r') as zip_ref:
                    zip_ref.extractall(student_extract_path)
                student_dirs.append(student_extract_path)
            except zipfile.BadZipFile:
                pass

    if not student_dirs:
        raise HTTPException(status_code=400, detail="No valid student submissions found")

    # Build cohort DNA
    cohort_dna = build_cohort_codedna(student_dirs)

    # Store cohort DNA as JSON for later use
    cohort_json_path = os.path.join(cohort_path, "cohort_dna.json")
    with open(cohort_json_path, 'w') as f:
        json.dump(cohort_dna, f)

    return {"status": "success", "cohort": "processed"}
@app.post("/api/repositories/github-classroom", tags=["Ingestion"], summary="Fetch GitHub Classroom Cohort")
async def fetch_github_classroom(
    session_id: str = Form(...),
    organization: str = Form(...),
    assignment_prefix: str = Form(...)
):
    """Fetch student repositories from a GitHub Organization for an assignment"""
    session_path = os.path.join(SESSION_DIR, session_id)
    if not os.path.exists(session_path):
        raise HTTPException(status_code=404, detail="Session not found")

    # Create cohort directory
    cohort_path = os.path.join(session_path, "cohort")
    os.makedirs(cohort_path, exist_ok=True)

    github_token = (os.getenv("GITHUB_TOKEN") or "").strip()
    headers = {"User-Agent": "CodeDNA-Forensic-App"}
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"

    async with httpx.AsyncClient(headers=headers, timeout=15.0) as client:
        # Fetch organization repositories
        url = f"https://api.github.com/orgs/{organization}/repos?per_page=100"
        try:
            response = await client.get(url)
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Network error connecting to GitHub: {str(exc)}")

        if response.status_code in (403, 429) or "rate limit" in response.text.lower():
            raise HTTPException(
                status_code=429,
                detail="GitHub API rate limit exceeded (60 requests/hr limit for unauthenticated users). Add a GITHUB_TOKEN to backend/.env to increase limit to 5,000 requests/hr, or upload reference ZIPs manually."
            )
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"GitHub organization '{organization}' not found.")
        elif response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to fetch repositories for organization '{organization}' (HTTP {response.status_code}).")

        repos = response.json()
        if not isinstance(repos, list) or len(repos) == 0:
            raise HTTPException(status_code=404, detail=f"No repositories found for GitHub organization '{organization}'.")

        # Filter by assignment prefix
        matched_repos = [repo for repo in repos if repo["name"].startswith(assignment_prefix)]
        if not matched_repos:
            raise HTTPException(status_code=404, detail=f"No repositories found with prefix '{assignment_prefix}' in organization '{organization}'.")

        # Process each matched repository
        student_dirs = []
        for repo in matched_repos:
            repo_name = repo["name"]
            branch = repo.get("default_branch", "main")
            zip_url = f"https://github.com/{organization}/{repo_name}/archive/refs/heads/{branch}.zip"

            try:
                zip_response = await client.get(zip_url, follow_redirects=True)
                if zip_response.status_code == 200:
                    zip_path = os.path.join(cohort_path, f"{repo_name}.zip")
                    with open(zip_path, "wb") as f:
                        f.write(zip_response.content)

                    extract_path = os.path.join(cohort_path, repo_name)
                    os.makedirs(extract_path, exist_ok=True)
                    try:
                        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                            zip_ref.extractall(extract_path)
                        student_dirs.append(extract_path)
                    except zipfile.BadZipFile:
                        pass
            except httpx.RequestError:
                pass

        if not student_dirs:
            raise HTTPException(status_code=400, detail="No valid student repositories processed")

        # Build cohort DNA
        cohort_dna = build_cohort_codedna(student_dirs)

        # Store cohort DNA as JSON for later use
        cohort_json_path = os.path.join(cohort_path, "cohort_dna.json")
        with open(cohort_json_path, 'w') as f:
            json.dump(cohort_dna, f)

        return {"status": "success", "fetched": len(student_dirs)}


@app.post("/api/analyze/submission", tags=["Analysis"], summary="Upload Submission ZIP")
async def upload_submission(session_id: str = Form(...), file: UploadFile = File(...)):
    """Upload the final submission for analysis"""
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are allowed")
        
    session_path = os.path.join(SESSION_DIR, session_id)
    if not os.path.exists(session_path):
        raise HTTPException(status_code=404, detail="Session not found")
        
    sub_zip_path = os.path.join(session_path, "submission", file.filename)
    
    with open(sub_zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Extract
    extract_path = os.path.join(session_path, "submission", "extracted")
    try:
        with zipfile.ZipFile(sub_zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid zip file")
        
    return {"status": "success", "message": "Submission uploaded successfully"}

@app.post("/api/analyze/compare", tags=["Analysis"], summary="Run Deterministic Comparison")
async def analyze_and_compare(session_id: str = Form(...), baseline_type: str = Form("personal")):
    """Run CodeDNA baseline extraction, compare against the submission, and generate AI report."""
    session_path = os.path.join(SESSION_DIR, session_id)
    if not os.path.exists(session_path):
        raise HTTPException(status_code=404, detail="Session not found")

    repos_dir = os.path.join(session_path, "repositories")
    sub_dir = os.path.join(session_path, "submission", "extracted")
    template_dir = os.path.join(session_path, "template")
    cohort_dir = os.path.join(session_path, "cohort")

    # All DNA-building is CPU-bound sync work — run in a thread to avoid blocking the event loop
    def _run_analysis():
        # 1. Build Baseline DNA based on baseline_type
        if baseline_type == "cohort" and os.path.exists(cohort_dir):
            cohort_json_path = os.path.join(cohort_dir, "cohort_dna.json")
            if os.path.exists(cohort_json_path):
                with open(cohort_json_path, "r") as f:
                    baseline_dna = json.load(f)
            else:
                baseline_dna = build_cohort_codedna([cohort_dir])
        else:
            baseline_dna = build_repository_codedna(repos_dir)

        # 2. Check for template DNA and subtract if exists
        template_dna = None
        if os.path.exists(template_dir):
            template_dna = build_repository_codedna(template_dir)
            if baseline_type == "cohort":
                baseline_dna = subtract_template_dna(baseline_dna, template_dna)

        # 3. Build Submission DNA
        submission_dna = build_repository_codedna(sub_dir)

        if template_dna is not None:
            submission_dna = subtract_template_dna(submission_dna, template_dna)

        return baseline_dna, submission_dna

    try:
        baseline_dna, submission_dna = await asyncio.wait_for(
            asyncio.to_thread(_run_analysis),
            timeout=60.0
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Analysis timed out (>60s). The repository may be too large. Try reducing the number of baseline repos or submission size."
        )

    sub_usable = submission_dna.get("repo_count_usable_files_languages", {}).get("usable_files", 0)
    base_usable = baseline_dna.get("repo_count_usable_files_languages", {}).get("usable_files", 0)

    if sub_usable == 0:
        raise HTTPException(
            status_code=400,
            detail="Submission contains no usable source code files. Supported extensions are: Python (.py), JavaScript/TypeScript (.js, .jsx, .ts, .tsx), Java (.java), C/C++ (.c, .cpp), C# (.cs), Go (.go), Rust (.rs). Please ensure the submission ZIP archive contains supported code files."
        )
    if base_usable == 0:
        raise HTTPException(
            status_code=400,
            detail="Baseline contains no usable source code files. Supported extensions are: Python (.py), JavaScript/TypeScript (.js, .jsx, .ts, .tsx), Java (.java), C/C++ (.c, .cpp), C# (.cs), Go (.go), Rust (.rs). Please verify your historical baseline repositories."
        )

    # 4. Compare (Deterministic + ML + Temporal) — also CPU-bound
    try:
        comparison_results = await asyncio.wait_for(
            asyncio.to_thread(compare_codedna, baseline_dna, submission_dna, repos_dir, sub_dir),
            timeout=60.0
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="CodeDNA comparison timed out (>60s). Please try again with a smaller submission."
        )

    # Save for the AI step
    with open(os.path.join(session_path, "deterministic_results.json"), "w") as f:
        json.dump(comparison_results, f)

    return {
        "status": "success",
        "deterministic_data": comparison_results
    }

@app.post("/api/analyze/ai-report", tags=["Analysis"], summary="Generate AI Forensic Report")
async def generate_ai_report(session_id: str = Form(...)):
    """Generate the AI forensic report using previously generated deterministic data."""
    session_path = os.path.join(SESSION_DIR, session_id)
    results_path = os.path.join(session_path, "deterministic_results.json")
    
    if not os.path.exists(results_path):
        raise HTTPException(status_code=400, detail="Deterministic analysis not found. Run /api/analyze/compare first.")
        
    with open(results_path, "r") as f:
        comparison_results = json.load(f)
    
    try:
        ai_report, ai_mode = await generate_forensic_report(comparison_results)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")
    
    return {
        "status": "success",
        "ai_mode": ai_mode,
        "forensic_report": ai_report
    }

@app.delete("/api/session/{session_id}", tags=["Session"], summary="Cleanup Session")
def cleanup_session(session_id: str):
    """Clean up a session manually"""
    session_path = os.path.join(SESSION_DIR, session_id)
    if os.path.exists(session_path):
        shutil.rmtree(session_path)
        return {"status": "success", "message": "Session cleaned up"}
    raise HTTPException(status_code=404, detail="Session not found")

@app.get("/api/benchmarks/run", tags=["Benchmarks"], summary="Run Empirical Benchmark Suite")
def run_benchmarks():
    """
    Executes the 12 controlled academic integrity & adversarial evasion scenarios.
    Returns confusion matrix, precision/recall/F1, ROC/PR curves, and adversarial resilience scores.
    """
    try:
        from ml_engine.benchmark_runner import run_empirical_benchmarks
        return run_empirical_benchmarks()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark execution failed: {str(e)}")

@app.get("/api/benchmarks/scenarios", tags=["Benchmarks"], summary="List Benchmark Scenarios")
def get_benchmark_scenarios():
    """Returns metadata for all 12 benchmark evaluation scenarios."""
    try:
        from ml_engine.benchmark_runner import BENCHMARK_SCENARIOS
        return {"scenarios": BENCHMARK_SCENARIOS}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve scenarios: {str(e)}")

