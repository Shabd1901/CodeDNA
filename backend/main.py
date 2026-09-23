from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).with_name(".env"))

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio
import io
import uuid
import os
import shutil
import zipfile
import json
from analysis import build_repository_codedna, compare_codedna
from ai_engine import generate_forensic_report

app = FastAPI(title="CodeDNA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_DIR = os.path.join(os.path.dirname(__file__), "tmp_sessions")
os.makedirs(SESSION_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "CodeDNA API is running"}

@app.post("/api/session/start")
def start_session():
    """Start a new investigation session"""
    session_id = str(uuid.uuid4())
    os.makedirs(os.path.join(SESSION_DIR, session_id, "repositories"), exist_ok=True)
    os.makedirs(os.path.join(SESSION_DIR, session_id, "submission"), exist_ok=True)
    return {"session_id": session_id}

@app.post("/api/repositories/upload")
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

@app.post("/api/repositories/github")
async def fetch_github_repos(session_id: str = Form(...), username: str = Form(...)):
    """Fetch public repositories for a GitHub user and extract them into the session."""
    session_path = os.path.join(SESSION_DIR, session_id)
    if not os.path.exists(session_path):
        raise HTTPException(status_code=404, detail="Session not found")
        
    repos_dir = os.path.join(session_path, "repositories")
    
    async with httpx.AsyncClient() as client:
        # Fetch user's public repositories
        # Limited to 10 for MVP speed, sort by pushed
        url = f"https://api.github.com/users/{username}/repos?sort=pushed&per_page=5"
        response = await client.get(url)
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to fetch user {username} from GitHub")
            
        repos = response.json()
        downloaded = []
        
        # Download the zip archive for each repo
        for repo in repos:
            repo_name = repo["name"]
            branch = repo["default_branch"]
            zip_url = f"https://github.com/{username}/{repo_name}/archive/refs/heads/{branch}.zip"
            
            # Use streaming to download
            zip_response = await client.get(zip_url, follow_redirects=True)
            if zip_response.status_code == 200:
                zip_path = os.path.join(repos_dir, f"{repo_name}.zip")
                with open(zip_path, "wb") as f:
                    f.write(zip_response.content)
                
                # Extract
                extract_path = os.path.join(repos_dir, repo_name)
                try:
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(extract_path)
                    downloaded.append(repo_name)
                except zipfile.BadZipFile:
                    pass # Skip invalid zips
                    
    return {"status": "success", "fetched": downloaded}

@app.post("/api/analyze/submission")
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

@app.post("/api/analyze/compare")
async def analyze_and_compare(session_id: str = Form(...)):
    """Run CodeDNA baseline extraction, compare against the submission, and generate AI report."""
    session_path = os.path.join(SESSION_DIR, session_id)
    if not os.path.exists(session_path):
        raise HTTPException(status_code=404, detail="Session not found")
        
    repos_dir = os.path.join(session_path, "repositories")
    sub_dir = os.path.join(session_path, "submission", "extracted")
    
    # 1. Build Baseline DNA
    baseline_dna = build_repository_codedna(repos_dir)
    
    # 2. Build Submission DNA
    submission_dna = build_repository_codedna(sub_dir)
    
    # 3. Compare (Deterministic)
    comparison_results = compare_codedna(baseline_dna, submission_dna)
    
    # Save for the AI step
    with open(os.path.join(session_path, "deterministic_results.json"), "w") as f:
        json.dump(comparison_results, f)
    
    return {
        "status": "success",
        "deterministic_data": comparison_results
    }

@app.post("/api/analyze/ai-report")
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

@app.delete("/api/session/{session_id}")
def cleanup_session(session_id: str):
    """Clean up a session manually"""
    session_path = os.path.join(SESSION_DIR, session_id)
    if os.path.exists(session_path):
        shutil.rmtree(session_path)
        return {"status": "success", "message": "Session cleaned up"}
    raise HTTPException(status_code=404, detail="Session not found")
