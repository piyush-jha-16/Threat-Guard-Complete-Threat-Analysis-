from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yara
import os
import shutil
import uuid
import re
import ssl
import socket
import ipaddress
import urllib.parse
from datetime import datetime, timezone
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
import network_scanner

# Suppress only the InsecureRequestWarning for redirect following (we handle SSL separately)
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

app = FastAPI(title="ThreatGuard Document Scanner")

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


# ─────────────────────────────────────────────────────────────────────────────
# URL SCANNING ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

class URLScanRequest(BaseModel):
    url: str


# ── Threat intelligence constants ────────────────────────────────────────────
SUSPICIOUS_TLDS = {
    '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click',
    '.download', '.work', '.zip', '.mobi', '.buzz', '.monster'
}

URL_SHORTENERS = {
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'short.link',
    'tiny.cc', 'is.gd', 'buff.ly', 'snip.ly', 'rb.gy', 'cutt.ly'
}

PHISHING_KEYWORDS = [
    'login', 'signin', 'sign-in', 'verify', 'secure', 'account',
    'update', 'confirm', 'suspended', 'limited', 'password', 'credential',
    'unlock', 'validate', 'recover'
]

BRAND_NAMES = [
    'paypal', 'amazon', 'google', 'microsoft', 'apple', 'facebook',
    'instagram', 'twitter', 'netflix', 'ebay', 'linkedin', 'dropbox',
    'bankofamerica', 'chase', 'wellsfargo', 'citibank', 'hsbc', 'adobe'
]


# ── Helper: SSRF protection ───────────────────────────────────────────────────
def is_safe_target(hostname: str) -> tuple:
    """Block requests to private/internal addresses to prevent SSRF."""
    try:
        resolved_ip = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(resolved_ip)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False, f"Access to internal/private address {resolved_ip} is blocked."
        return True, resolved_ip
    except socket.gaierror:
        return False, f"Could not resolve hostname '{hostname}'."
    except Exception as exc:
        return False, str(exc)


# ── Helper: SSL certificate info ─────────────────────────────────────────────
def check_ssl_certificate(hostname: str, port: int = 443) -> dict:
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z').replace(tzinfo=timezone.utc)
                not_before = datetime.strptime(cert['notBefore'], '%b %d %H:%M:%S %Y %Z').replace(tzinfo=timezone.utc)
                days_left = (not_after - datetime.now(timezone.utc)).days
                issuer = {k: v for tup in cert.get('issuer', ()) for k, v in [tup[0]]}
                subject = {k: v for tup in cert.get('subject', ()) for k, v in [tup[0]]}
                san = [v for _, v in cert.get('subjectAltName', [])]
                return {
                    "valid": True,
                    "issuer": issuer.get('organizationName', issuer.get('commonName', 'Unknown')),
                    "subject": subject.get('commonName', hostname),
                    "valid_from": not_before.strftime('%Y-%m-%d'),
                    "valid_until": not_after.strftime('%Y-%m-%d'),
                    "days_until_expiry": days_left,
                    "expired": days_left < 0,
                    "expiring_soon": 0 <= days_left <= 30,
                    "tls_version": ssock.version(),
                    "san": san[:5],
                }
    except ssl.SSLCertVerificationError as exc:
        return {"valid": False, "error": str(exc)[:150]}
    except ssl.SSLError as exc:
        return {"valid": False, "error": f"SSL error: {str(exc)[:120]}"}
    except (ConnectionRefusedError, socket.timeout, OSError) as exc:
        return {"valid": False, "error": f"Connection error: {str(exc)[:120]}"}
    except Exception as exc:
        return {"valid": False, "error": str(exc)[:120]}


# ── Helper: Follow redirect chain ─────────────────────────────────────────────
def follow_redirect_chain(url: str) -> dict:
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/120.0.0.0 Safari/537.36'
        )
    }
    try:
        session = requests.Session()
        response = session.get(url, allow_redirects=True, headers=headers, timeout=15, verify=False)
        chain = []
        for r in response.history:
            chain.append({
                "url": r.url,
                "status": r.status_code,
                "location": r.headers.get('Location', '')
            })
        chain.append({"url": str(response.url), "status": response.status_code, "location": None})

        original_domain = urllib.parse.urlparse(url).netloc.lower().lstrip('www.')
        final_domain = urllib.parse.urlparse(str(response.url)).netloc.lower().lstrip('www.')
        return {
            "final_url": str(response.url),
            "final_status": response.status_code,
            "redirect_count": len(response.history),
            "chain": chain,
            "cross_domain_redirect": original_domain != final_domain and len(response.history) > 0,
        }
    except requests.exceptions.SSLError:
        return {"error": "SSL certificate validation failed during redirect follow", "chain": [], "redirect_count": 0, "cross_domain_redirect": False}
    except requests.exceptions.ConnectionError as exc:
        return {"error": f"Connection failed: {str(exc)[:120]}", "chain": [], "redirect_count": 0, "cross_domain_redirect": False}
    except requests.exceptions.Timeout:
        return {"error": "Request timed out after 15 seconds", "chain": [], "redirect_count": 0, "cross_domain_redirect": False}
    except Exception as exc:
        return {"error": str(exc)[:120], "chain": [], "redirect_count": 0, "cross_domain_redirect": False}


# ── Helper: DNS records ────────────────────────────────────────────────────────
def get_dns_info(hostname: str) -> dict:
    records: dict = {}
    try:
        import dns.resolver
        for rtype in ('A', 'MX', 'NS', 'TXT'):
            try:
                answers = dns.resolver.resolve(hostname, rtype, lifetime=5)
                if rtype == 'A':
                    records[rtype] = [str(r) for r in answers]
                elif rtype == 'MX':
                    records[rtype] = [str(r.exchange).rstrip('.') for r in answers]
                elif rtype == 'NS':
                    records[rtype] = [str(r).rstrip('.') for r in answers]
                elif rtype == 'TXT':
                    records[rtype] = [str(r).strip('"') for r in answers][:3]
            except Exception:
                records[rtype] = []
    except ImportError:
        try:
            records['A'] = list({addr[4][0] for addr in socket.getaddrinfo(hostname, None)})
        except Exception:
            records['A'] = []
    return records


# ── Helper: WHOIS data ────────────────────────────────────────────────────────
def get_whois_data(domain: str) -> dict:
    try:
        import whois  # python-whois
        w = whois.whois(domain)
        if not w:
            return {}
        def _fmt(d):
            if isinstance(d, list):
                d = d[0]
            if isinstance(d, datetime):
                return d.strftime('%Y-%m-%d')
            return str(d)[:10] if d else None
        return {
            "registrar": str(w.registrar)[:80] if w.registrar else None,
            "creation_date": _fmt(w.creation_date),
            "expiration_date": _fmt(w.expiration_date),
            "country": str(w.country) if w.country else None,
            "name_servers": list(w.name_servers)[:3] if w.name_servers else [],
        }
    except Exception:
        return {}


# ── Helper: URL pattern threat analysis ──────────────────────────────────────
def analyze_url_patterns(url: str, parsed: urllib.parse.ParseResult) -> list:
    threats = []
    hostname = (parsed.hostname or '').lower()
    path = parsed.path.lower()
    query = (parsed.query or '').lower()

    # Raw IP address used as hostname
    try:
        ipaddress.ip_address(hostname)
        threats.append({
            "type": "IP Address URL",
            "severity": "high",
            "description": "URL uses a raw IP address instead of a domain name — a common trait of phishing sites and malware distribution servers."
        })
    except ValueError:
        pass

    # Punycode / IDN homograph
    if 'xn--' in hostname:
        threats.append({
            "type": "IDN Homograph Attack",
            "severity": "high",
            "description": "Domain uses punycode (xn--) encoding, potentially impersonating a well-known domain using visually identical international characters."
        })

    # Non-ASCII characters (unicode homograph)
    try:
        hostname.encode('ascii')
    except UnicodeEncodeError:
        threats.append({
            "type": "Unicode Domain Attack",
            "severity": "high",
            "description": "Domain contains non-ASCII Unicode characters that may visually mimic a legitimate domain to deceive users."
        })

    # Suspicious free/abused TLDs
    for tld in SUSPICIOUS_TLDS:
        if hostname.endswith(tld):
            threats.append({
                "type": "Suspicious Top-Level Domain",
                "severity": "medium",
                "description": f"Domain ends with '{tld}' — a TLD commonly used for free or throwaway registrations associated with spam and malicious activity."
            })
            break

    # URL shortener
    base = hostname.removeprefix('www.')
    if base in URL_SHORTENERS:
        threats.append({
            "type": "URL Shortener Detected",
            "severity": "low",
            "description": "URL uses a shortening service which conceals the true destination and prevents pre-visit safety inspection."
        })

    # Excessive subdomain depth
    parts = [p for p in hostname.split('.') if p]
    if len(parts) > 4:
        threats.append({
            "type": "Excessive Subdomain Depth",
            "severity": "medium",
            "description": f"Domain has {len(parts) - 2} subdomain levels. Deep subdomain chains are used to evade filters and impersonate legitimate services."
        })

    # Brand name used inside unofficial domain
    main_domain = '.'.join(parts[-2:]) if len(parts) >= 2 else hostname
    for brand in BRAND_NAMES:
        if brand in hostname and not main_domain.startswith(f'{brand}.'):
            threats.append({
                "type": "Brand Name Impersonation",
                "severity": "high",
                "description": f"URL embeds the brand name '{brand}' inside an unofficial domain — a classic social engineering tactic."
            })
            break

    # Multiple phishing keywords in path/query
    combined = path + '?' + query
    kw_hits = [kw for kw in PHISHING_KEYWORDS if kw in combined]
    if len(kw_hits) >= 2:
        threats.append({
            "type": "Phishing Keywords in URL",
            "severity": "medium",
            "description": f"URL path/query contains multiple phishing-related keywords: {', '.join(kw_hits[:4])}."
        })

    # Credential embedding via @ in authority
    if '@' in parsed.netloc:
        threats.append({
            "type": "Credential Embedding Attack",
            "severity": "high",
            "description": "URL contains '@' in the authority — attackers use https://legit.com@evil.com to trick users into thinking they are visiting a trusted site."
        })

    # Dangerous scheme (javascript:, data:, vbscript:)
    if parsed.scheme in ('javascript', 'data', 'vbscript'):
        threats.append({
            "type": f"Dangerous URL Scheme ({parsed.scheme}:)",
            "severity": "critical",
            "description": f"URL uses the '{parsed.scheme}:' scheme which can directly execute arbitrary code in the browser."
        })

    # Excessively long URL (obfuscation)
    if len(url) > 250:
        threats.append({
            "type": "Excessively Long URL",
            "severity": "low",
            "description": f"URL is {len(url)} characters. Unusually long URLs are often crafted to obscure the real destination or embed encoded payloads."
        })

    # Double URL encoding
    if '%25' in url or '%2f%2f' in url.lower():
        threats.append({
            "type": "Double URL Encoding",
            "severity": "medium",
            "description": "URL contains double-encoded characters (%25 or %2F%2F), a technique used to bypass security filters."
        })

    return threats


# ── Helper: Calculate safety score ───────────────────────────────────────────
def calculate_safety_score(threats: list, ssl_info: dict, redirect_info: dict) -> int:
    score = 100
    deductions = {"critical": 40, "high": 25, "medium": 12, "low": 5}
    for t in threats:
        score -= deductions.get(t.get("severity", "low"), 5)
    if not ssl_info.get("valid", True):
        score -= 20
    if ssl_info.get("expired"):
        score -= 15
    elif ssl_info.get("expiring_soon"):
        score -= 5
    if redirect_info.get("cross_domain_redirect"):
        score -= 15
    if redirect_info.get("redirect_count", 0) > 5:
        score -= 10
    return max(0, min(100, score))


# ── /scan-url endpoint ────────────────────────────────────────────────────────
@app.post("/scan-url")
def scan_url(request: URLScanRequest):
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required.")

    # Normalise — add scheme if missing
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    try:
        parsed = urllib.parse.urlparse(url)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL format.")

    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL: no domain found.")

    hostname = (parsed.hostname or parsed.netloc.split(':')[0].split('@')[-1]).lower()

    # SSRF protection — block internal/private targets
    safe, ip_or_error = is_safe_target(hostname)
    if not safe:
        raise HTTPException(status_code=400, detail=f"Cannot scan this target: {ip_or_error}")

    # 1. URL pattern analysis
    threats = analyze_url_patterns(url, parsed)

    # 2. SSL certificate
    ssl_info: dict = {}
    if parsed.scheme == 'https':
        ssl_info = check_ssl_certificate(hostname, parsed.port or 443)
        if ssl_info.get("expired"):
            threats.append({
                "type": "Expired SSL Certificate",
                "severity": "high",
                "description": "The site's SSL/TLS certificate has expired. The connection cannot be verified as secure."
            })
        elif not ssl_info.get("valid") and not ssl_info.get("is_http"):
            threats.append({
                "type": "Invalid SSL Certificate",
                "severity": "high",
                "description": "SSL certificate validation failed — the site's identity cannot be confirmed."
            })
    else:
        ssl_info = {"valid": False, "error": "Site uses unencrypted HTTP", "is_http": True}
        threats.append({
            "type": "No SSL/TLS Encryption",
            "severity": "medium",
            "description": "The site does not use HTTPS. All data is transmitted in plain text and can be intercepted by a man-in-the-middle attacker."
        })

    # 3. Redirect chain
    redirect_info = follow_redirect_chain(url)
    if redirect_info.get("cross_domain_redirect"):
        final_domain = urllib.parse.urlparse(redirect_info.get("final_url", "")).netloc
        threats.append({
            "type": "Cross-Domain Redirect",
            "severity": "medium",
            "description": f"URL silently redirects to a different domain: '{final_domain}'. This may indicate cloaking or a redirect-based phishing attack."
        })
    if redirect_info.get("redirect_count", 0) > 5:
        threats.append({
            "type": "Excessive Redirect Chain",
            "severity": "low",
            "description": f"URL chains through {redirect_info['redirect_count']} redirects, which can be used to obscure the final destination from security tools."
        })

    # 4. DNS records
    dns_info = get_dns_info(hostname)

    # 5. WHOIS (best-effort, optional dependency)
    whois_info = get_whois_data(hostname)

    # 6. Final score and verdict
    safety_score = calculate_safety_score(threats, ssl_info, redirect_info)
    if safety_score >= 75:
        status = "safe"
    elif safety_score >= 45:
        status = "suspicious"
    else:
        status = "malicious"

    return {
        "url": url,
        "domain": hostname,
        "ip": ip_or_error,
        "scheme": parsed.scheme,
        "status": status,
        "safety_score": safety_score,
        "threats": threats,
        "ssl": ssl_info,
        "redirects": redirect_info,
        "dns": dns_info,
        "whois": whois_info,
        "scanned_at": datetime.now(timezone.utc).isoformat(),
    }

@app.route("/")
def home():
    return {"status": "Threat Guard API running"}

@app.route("/health")
def health():
    return {"status": "ok"}

@app.route("/ping")
def ping():
    return "pong"

if __name__ == "__main__":
    import uvicorn
    print("Starting ThreatGuard Document Scanner on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
