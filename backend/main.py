from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yara
import os
import shutil
import uuid
import re

app = FastAPI(title="ThreatGuard Document Scanner")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RULES_FILE = os.path.join(BASE_DIR, 'document_rules.yar')
TEMP_DIR = os.path.join(BASE_DIR, 'temp_uploads')

# Ensure temp directory exists
os.makedirs(TEMP_DIR, exist_ok=True)

# Try to compile rules on startup
try:
    if not os.path.exists(RULES_FILE):
        print(f"WARNING: YARA rules file not found at {RULES_FILE}")
        compiled_rules = None
    else:
        compiled_rules = yara.compile(filepath=RULES_FILE)
        print("✓ YARA rules compiled successfully.")
except Exception as e:
    print(f"ERROR: Failed to compile YARA rules: {e}")
    compiled_rules = None


def safe_filename(filename: str | None) -> str:
    """Sanitize filename to prevent path traversal and invalid characters."""
    if not filename:
        return f"upload_{uuid.uuid4().hex}"
    # Strip directory components
    filename = os.path.basename(filename)
    # Remove anything that isn't alphanumeric, dot, underscore, or hyphen
    filename = re.sub(r'[^\w.\-]', '_', filename)
    # Prepend a UUID prefix to avoid collisions
    return f"{uuid.uuid4().hex}_{filename}"


@app.get("/health")
async def health_check():
    """Health check endpoint for the frontend to verify server status."""
    return {
        "status": "online",
        "rules_loaded": compiled_rules is not None
    }


@app.post("/scan")
async def scan_document(file: UploadFile = File(...)):
    if not compiled_rules:
        raise HTTPException(
            status_code=500,
            detail="YARA rules engine is not initialized. Check server logs."
        )

    if not file.filename and not file.size:
        raise HTTPException(status_code=400, detail="No file was uploaded.")

    safe_name = safe_filename(file.filename)
    file_path = os.path.join(TEMP_DIR, safe_name)

    try:
        # Save the uploaded file temporarily
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Verify file is not empty
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return {
                "status": "warning",
                "threatsFound": [],
                "message": "The uploaded file is empty and cannot be scanned."
            }

        # Scan the file with YARA
        matches = compiled_rules.match(file_path)

        threats_found = []
        rule_names = []

        if matches:
            for match in matches:
                threat_desc = match.meta.get('description', f"Rule triggered: {match.rule}")
                severity = match.meta.get('severity', 'Unknown')
                threats_found.append(f"[{severity}] {threat_desc}")
                rule_names.append(match.rule)

        # Determine status
        if threats_found:
            status = 'malicious'
            message = f"Detected {len(threats_found)} potential threat(s) in '{file.filename}'."
        else:
            status = 'safe'
            message = f"'{file.filename}' passed all security checks. No threats detected."

        return {
            "status": status,
            "threatsFound": threats_found,
            "rulesTriggered": rule_names,
            "fileSize": file_size,
            "fileName": file.filename,
            "message": message
        }

    except yara.Error as ye:
        print(f"YARA scan error for '{file.filename}': {ye}")
        return {
            "status": "warning",
            "threatsFound": [],
            "message": f"YARA engine error while scanning the file: {str(ye)}"
        }
    except Exception as e:
        print(f"Unexpected error scanning '{file.filename}': {e}")
        return {
            "status": "warning",
            "threatsFound": [],
            "message": f"An unexpected error occurred during scanning: {str(e)}"
        }
    finally:
        # Always clean up the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)


if __name__ == "__main__":
    import uvicorn
    print("Starting ThreatGuard Document Scanner on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
