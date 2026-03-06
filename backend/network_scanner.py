from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import socket
import json
import urllib.request
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor

router = APIRouter()

class NetworkScanRequest(BaseModel):
    target: str

class PortDetails(BaseModel):
    port: int
    protocol: str
    service: str
    state: str
    warning: Optional[str] = None

class NetworkScanResponse(BaseModel):
    targetIp: str
    hostname: Optional[str] = None
    location: Optional[str] = None
    isp: Optional[str] = None
    discoveredPorts: List[PortDetails]

# Common ports to scan to keep the scan fast but comprehensive
COMMON_PORTS = {
    21: "ftp",
    22: "ssh",
    23: "telnet",
    25: "smtp",
    53: "dns",
    80: "http",
    110: "pop3",
    111: "rpcbind",
    135: "msrpc",
    139: "netbios-ssn",
    143: "imap",
    443: "https",
    445: "microsoft-ds",
    993: "imaps",
    995: "pop3s",
    1723: "pptp",
    3306: "mysql",
    3389: "ms-wbt-server",
    5432: "postgresql",
    5900: "vnc",
    8080: "http-proxy",
    8443: "https-alt"
}

def scan_port(ip: str, port: int) -> Optional[PortDetails]:
    """Attempts to connect to a specific port on the given IP address."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.0) # 1 second timeout per connection
        result = sock.connect_ex((ip, port))
        sock.close()
        
        if result == 0:
            service = COMMON_PORTS.get(port, "unknown")
            warning = None
            
            # Add some basic professional warnings
            if port in [21, 23]:
                warning = "Cleartext Protocol Detected (Insecure)"
            elif port in [3306, 5432]:
                warning = "Exposed Database Service"
            elif port == 3389:
                warning = "Exposed Remote Desktop (High Risk)"
            elif port == 22:
                warning = "Ensure Key-Based Auth Only"
                
            return PortDetails(
                port=port,
                protocol="tcp",
                service=service,
                state="open",
                warning=warning
            )
        return None
    except Exception:
        return None

def get_ip_info(ip: str) -> tuple[Optional[str], Optional[str], Optional[str]]:
    """Tries to resolve the hostname and get basic IP mapping info."""
    hostname = None
    location = None
    isp = None
    
    # Try reverse DNS
    try:
        hostname = socket.gethostbyaddr(ip)[0]
    except socket.herror:
        hostname = "Unknown Host"
        
    # Try to get public IP metadata using a free API (ip-api.com)
    # Note: We must restrict this to non-private IPs to avoid unnecessary internal lookups
    try:
        if not ip.startswith(("10.", "172.16.", "192.168.", "127.")):
            req = urllib.request.Request(
                f"http://ip-api.com/json/{ip}?fields=status,country,city,isp",
                headers={'User-Agent': 'ThreatGuard-Scanner'}
            )
            with urllib.request.urlopen(req, timeout=2) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    if data.get('status') == 'success':
                        location = f"{data.get('city', 'Unknown City')}, {data.get('country', 'Unknown Country')}"
                        isp = data.get('isp')
    except Exception as e:
        print(f"Failed to fetch IP metadata: {e}")
        
    return hostname, location, isp

@router.post("/scan-network", response_model=NetworkScanResponse)
async def scan_network(request: NetworkScanRequest):
    target = request.target.strip()
    
    # 1. Resolve Target
    try:
        # Check if it's already an IP or resolve domain
        target_ip = socket.gethostbyname(target)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Could not resolve target hostname or IP.")
        
    # 2. Gather Host Info
    hostname, location, isp = get_ip_info(target_ip)
    
    # 3. Concurrent Port Scanning
    discovered_ports = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        # Scan common ports concurrently
        futures = [executor.submit(scan_port, target_ip, port) for port in COMMON_PORTS.keys()]
        
        for future in futures:
            result = future.result()
            if result:
                discovered_ports.append(result)
                
    # Sort ports numerically
    discovered_ports.sort(key=lambda x: x.port)

    return NetworkScanResponse(
        targetIp=target_ip,
        hostname=hostname,
        location=location,
        isp=isp,
        discoveredPorts=discovered_ports
    )
