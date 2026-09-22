from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
import shutil
import zipfile

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

@app.delete("/api/session/{session_id}")
def cleanup_session(session_id: str):
    """Clean up a session manually"""
    session_path = os.path.join(SESSION_DIR, session_id)
    if os.path.exists(session_path):
        shutil.rmtree(session_path)
        return {"status": "success", "message": "Session cleaned up"}
    raise HTTPException(status_code=404, detail="Session not found")
