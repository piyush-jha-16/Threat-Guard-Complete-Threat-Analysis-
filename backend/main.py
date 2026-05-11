from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import uuid
import re
import socket
from datetime import datetime, timezone
import network_scanner

app = FastAPI(title="ThreatGuard Security Scanner")

# Include the network scanner router
app.include_router(network_scanner.router)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, 'temp_uploads')

# Ensure temp directory exists
os.makedirs(TEMP_DIR, exist_ok=True)

print("✓ ThreatGuard Backend initialized successfully")


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


# ── Heuristic Scanner Functions ───────────────────────────────────────────────
def scan_file_heuristics(file_path: str, filename: str) -> tuple:
    """
    Scan file using heuristics for suspicious patterns.
    Returns: (threats_found, rules_triggered, severity_level)
    """
    threats_found = []
    rules_triggered = []
    
    try:
        # Read file content (first 100KB for performance)
        with open(file_path, 'rb') as f:
            file_content = f.read(102400)
    except Exception as e:
        return ["Error reading file"], [], 'low'
    
    # Check file signatures
    malicious_signatures = [
        (b'MZ\x90\x00\x03', 'Executable (PE)'),
        (b'\x7FELF', 'ELF Executable'),
        (b'%PDF', 'PDF with Embedded Scripts'),
        (b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1', 'OLE2/Office Document'),
    ]
    
    for sig, desc in malicious_signatures:
        if file_content.startswith(sig):
            threats_found.append(f"Detected {desc} file format")
            rules_triggered.append(f"FILE_TYPE_{desc.upper().split()[0]}")
    
    # Detect common malware patterns
    malware_patterns = [
        (rb'powershell', 'PowerShell Execution'),
        (rb'cmd\.exe', 'Command Shell Execution'),
        (rb'ShellExecute', 'Shell Code Execution'),
        (rb'URLDownloadToFile', 'File Download Attempt'),
        (rb'CreateRemoteThread', 'Process Injection'),
        (rb'WinExec', 'Legacy Process Execution'),
        (rb'eval\s*\(', 'Code Evaluation'),
        (rb'exec\s*\(', 'Code Execution'),
        (rb'system\s*\(', 'System Command Execution'),
    ]
    
    for pattern, desc in malware_patterns:
        if re.search(pattern, file_content, re.IGNORECASE):
            threats_found.append(f"Pattern detected: {desc}")
            rules_triggered.append(f"PATTERN_{desc.upper().replace(' ', '_')}")
    
    # Detect Office macros
    if b'VBA' in file_content or b'_VBA_PROJECT' in file_content:
        threats_found.append("VBA Macro detected in Office document")
        rules_triggered.append("OFFICE_MACRO_VBA")
    
    # Check for suspicious keywords
    suspicious_keywords = [
        (rb'bitcoin', 'Cryptocurrency reference'),
        (rb'ransomware', 'Ransomware signature'),
        (rb'trojan', 'Trojan signature'),
        (rb'backdoor', 'Backdoor signature'),
    ]
    
    for keyword, desc in suspicious_keywords:
        if keyword.lower() in file_content.lower():
            threats_found.append(f"Suspicious keyword: {desc}")
            rules_triggered.append(f"KEYWORD_{keyword.decode().upper()}")
    
    # Determine severity
    severity = 'clean'
    if len(threats_found) > 0:
        severity = 'low'
        # Check for high-risk indicators
        if any('Execution' in t or 'Injection' in t for t in threats_found):
            severity = 'high'
        if any('Malware' in t or 'Trojan' in t or 'Ransomware' in t for t in threats_found):
            severity = 'critical'
    
    return threats_found, rules_triggered, severity


@app.get("/health")
async def health_check():
    """Health check endpoint for the frontend to verify server status."""
    return {
        "status": "online",
        "scanner": "heuristic-based"
    }


@app.post("/scan")
async def scan_document(file: UploadFile = File(...)):
    """Scan uploaded document for threats using heuristic analysis."""
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
                "rulesTriggered": [],
                "message": "The uploaded file is empty and cannot be scanned."
            }

        # Scan the file with heuristics
        threats_found, rules_triggered, severity = scan_file_heuristics(file_path, file.filename)

        # Determine status
        if len(threats_found) > 0:
            if severity == 'critical' or severity == 'high':
                status = 'malicious'
                message = f"⚠️ ALERT: Detected {len(threats_found)} potential threat(s) in '{file.filename}'. This file may be dangerous."
            else:
                status = 'warning'
                message = f"⚠️ WARNING: Found {len(threats_found)} suspicious indicator(s) in '{file.filename}'. Review recommended."
        else:
            status = 'safe'
            message = f"✓ SAFE: '{file.filename}' passed security scan. No threats detected."

        return {
            "status": status,
            "threatsFound": threats_found,
            "rulesTriggered": rules_triggered,
            "fileSize": file_size,
            "fileName": file.filename,
            "message": message
        }

    except Exception as e:
        print(f"Scan error for '{file.filename}': {e}")
        return {
            "status": "warning",
            "threatsFound": [],
            "rulesTriggered": [],
            "message": f"Scan error: {str(e)[:100]}"
        }
    finally:
        # Always clean up the temporary file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass


@app.get("/")
async def root():
    """Root endpoint."""
    return {"status": "ThreatGuard Security Scanner API running"}


if __name__ == "__main__":
    import uvicorn
    print("Starting ThreatGuard Security Scanner on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
