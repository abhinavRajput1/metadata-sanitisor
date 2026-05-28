from dotenv import load_dotenv
load_dotenv()

import os
import re
import shutil
from pathlib import Path
from typing import Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from metadata_utils import extract_metadata, remove_metadata
from audit_logger import log_event, get_logs, get_log_count, compute_sha256

FILE_ID_PATTERN = re.compile(r"^[a-f0-9]{16}$")

# Admin secret for accessing sensitive log fields (IP addresses).
# Set via environment variable; leave empty to disable admin access.
ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "")

app = FastAPI()

# CORSMiddleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("/tmp/uploads")
CLEANED_DIR = Path("/tmp/cleaned")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
CLEANED_DIR.mkdir(parents=True, exist_ok=True)

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
async def sanitize_file(file_id: str, request: Request):
    if not FILE_ID_PATTERN.match(file_id):
        raise HTTPException(status_code=400, detail="Invalid file id")
    try:
        files = list(UPLOAD_DIR.glob(f"{file_id}.*"))
        if not files:
            raise HTTPException(status_code=404, detail="File not found")
        
        original_path = files[0]
        cleaned_path = CLEANED_DIR / original_path.name
        
        remove_metadata(original_path, cleaned_path)

        log_event(
            filename=original_path.name,
            action="Full Strip",
            status="Success",
            file_size_bytes=original_path.stat().st_size,
            file_id=file_id,
            file_hash=compute_sha256(original_path),
            ip_address=request.client.host if request.client else None,
        )

        return {"status": "done", "id": file_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/sanitize-file")
async def sanitize_file_inline(request: Request, file: UploadFile = File(...)):
    """Stateless sanitize: process file in one request (required for serverless)."""
    try:
        file_id = os.urandom(8).hex()
        safe_name = Path(file.filename or "file").name
        file_ext = Path(safe_name).suffix
        input_path = UPLOAD_DIR / f"{file_id}{file_ext}"
        output_path = CLEANED_DIR / f"{file_id}{file_ext}"

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        remove_metadata(input_path, output_path)

        log_event(
            filename=safe_name,
            action="Full Strip",
            status="Success",
            file_size_bytes=input_path.stat().st_size,
            file_id=file_id,
            file_hash=compute_sha256(input_path),
            ip_address=request.client.host if request.client else None,
        )

        if not output_path.exists():
            raise HTTPException(status_code=500, detail="Failed to create cleaned file")

        def iterfile():
            with open(output_path, "rb") as f:
                while chunk := f.read(65536):
                    yield chunk

        media_type = file.content_type or "application/octet-stream"
        return StreamingResponse(
            iterfile(),
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="clean_{safe_name}"',
                "X-File-Id": file_id,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/{file_id}")
async def download_file(file_id: str):
    if not FILE_ID_PATTERN.match(file_id):
        raise HTTPException(status_code=404, detail="File not found")
    try:
        files = list(CLEANED_DIR.glob(f"{file_id}.*"))
        if not files:
            raise HTTPException(status_code=404, detail="File not found")

        cleaned_path = files[0]

        def iterfile():
            with open(cleaned_path, "rb") as f:
                while chunk := f.read(65536):
                    yield chunk

        return StreamingResponse(
            iterfile(),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="clean_{cleaned_path.name}"',
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logs")
async def list_logs(limit: int = 50, offset: int = 0, admin_key: str = ""):
    """Return sanitization audit logs, newest first.

    Pass ?admin_key=<ADMIN_SECRET> to include IP addresses in the response.
    """
    is_admin = bool(ADMIN_SECRET) and admin_key == ADMIN_SECRET
    return {
        "logs": get_logs(limit=limit, offset=offset, include_ip=is_admin),
        "total": get_log_count(),
        "admin": is_admin,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
