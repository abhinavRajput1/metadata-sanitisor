import os
import shutil
from pathlib import Path
from typing import Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from metadata_utils import extract_metadata, remove_metadata

app = FastAPI()

# CORSMiddleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
CLEANED_DIR = Path("cleaned")
UPLOAD_DIR.mkdir(exist_ok=True)
CLEANED_DIR.mkdir(exist_ok=True)

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_id = os.urandom(8).hex()
        file_ext = Path(file.filename).suffix
        file_path = UPLOAD_DIR / f"{file_id}{file_ext}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        metadata = extract_metadata(file_path)
        
        return {
            "id": file_id,
            "filename": file.filename,
            "metadata": metadata,
            "status": "ready"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sanitize/{file_id}")
async def sanitize_file(file_id: str):
    try:
        # Find file in uploads
        files = list(UPLOAD_DIR.glob(f"{file_id}.*"))
        if not files:
            raise HTTPException(status_code=404, detail="File not found")
        
        original_path = files[0]
        cleaned_path = CLEANED_DIR / original_path.name
        
        remove_metadata(original_path, cleaned_path)
        
        return {"status": "done", "id": file_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{file_id}")
async def download_file(file_id: str):
    files = list(CLEANED_DIR.glob(f"{file_id}.*"))
    if not files:
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(files[0], filename=f"clean_{files[0].name}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
