# Threat Guard - Intelligent Threat Detection Platform

<div align="center">

![ThreatGuard](https://img.shields.io/badge/ThreatGuard-Professional-0f8246?style=for-the-badge&logo=shield&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**Master cybersecurity through real-time detection, deep scanning, and actionable threat intelligence.**

[Live Website](https://threat-guard-complete-threat-analys.vercel.app/)
[ ](#)
[ ](#)
[ ](#)
[Report Bug](https://github.com/piyush-jha-16/Threat-Guard-Complete-Threat-Analysis-/issues)
</div>

ThreatGuard Professional is a full-stack security platform designed for cybersecurity professionals and power users. It delivers deep file inspection, live URL analysis, network reconnaissance, and application monitoring all through a sleek, modern interface with dark mode support, PDF reporting, and role-based user management.

---

## About

ThreatGuard Professional is built on two pillars:

- **Vulnerable Mode** : Actively scan, probe, and analyse real threats across documents, URLs, executables, and networks
- **Secure Mode** : Understand exactly how each threat is detected and what defensive actions are taken

Each engine operates independently and logs results to a unified scan history, enabling cross-engine intelligence reporting.

---

## Features

###  Interactive Dashboard
A fully responsive command centre that puts your security posture at a glance:
- **Live stat cards** : Total scans, critical problems, and threats detected, updated in real time
- **URL Scan Engine widget** : Instantly scan suspicious links directly from the dashboard
- **Recent Analysis panel** : Top YARA rules triggered across all scan types
- **Scan Activity Table** : Timestamped log of every scan with file name, type, detection rule, severity badge, and action taken
- **Live clock** : Displays current date and time in your configured timezone

---

###  Document Scanning Engine
Deep-scan documents for embedded threats using the YARA pattern-matching engine:
- Upload via **drag-and-drop** or file browser
- Supports PDF, DOCX, XLSX, and more
- Detects **embedded macros**, **malicious links**, **ransomware signatures**, **phishing payloads**, and packed shellcode
- Returns a full breakdown: detected indicators, triggered YARA rules, file size, scan time
- Colour-coded **status banner** : Safe (green), Warning (amber), Malicious (red)
- **PDF report download** per scan with all findings, file metadata, and engine details
- Backend health indicator shows live engine status (Online / Offline)

---

###  Web Analysis Engine (Weblinks)
Comprehensive URL threat intelligence in a single scan:
- Input any URL and receive a full multi-stage analysis:
  - **Domain & DNS resolution** : A, MX, NS, TXT records
  - **SSL/TLS certificate validation** : Issuer, subject, expiry, TLS version
  - **Redirect chain tracing** : Follows every HTTP hop to the final destination
  - **Threat pattern analysis** : Homograph attacks, phishing indicators, brand abuse, typosquatting
- **Safety score ring** (0:100) with colour coding per threat level
- Expandable **threat cards** per detected indicator with severity labels (CRITICAL / HIGH / MEDIUM / LOW)
- **WHOIS domain information** : Registrar, registration date, expiry, country
- Animated step-by-step scan progress UI

---

###  Executable Sandbox Analysis
Detonate binary payloads in a safe, isolated analysis environment:
- Upload `.exe`, `.msi`, `.sh`, `.bat`, `.bin` files up to 100 MB
- Monitors and reports:
  - **Static reverse engineering** : Decompiles functions, extracts packed strings
  - **API hook monitoring** : Logs suspicious Windows API and POSIX system calls
  - **Memory injection detection** : Identifies process hollowing and unauthorised allocations
- Real-time telemetry panel shows each analysis stage as it progresses

---

###  Application Monitoring
Full system audit of installed software and background processes:
- Scans all **active processes**, **startup entries**, and **background services**
- Validates **digital signatures** of installed binaries
- Checks **browser extensions** and user-installed software against threat intelligence
- Live app counter during scan with animated progress indicator
- Covers: User Installed Software, Background Services, Browser Extensions

---

###  Active Network Reconnaissance
Real-time port scanning and host intelligence:
- Input any **IP address**, **domain**, or **subnet** (e.g. `192.168.1.0/24`)
- Returns:
  - Resolved **hostname**, **location**, and **ISP**
  - List of all **open/filtered ports** with service name and protocol
  - **Risk warnings** per port (e.g. high-risk services on unusual ports)
- Port entries are colour-coded: green (safe), amber (warning), grey (filtered)
- **Download PDF report** of full scan results
- All results are recorded in the unified scan history

---

###  Intelligence Reports
Centralised report management across all scan engines:
- **Scan History Log** : Filterable and searchable list of every scan across all engines
  - Filter by status: All / Clean / Warning / Malicious
  - Search by file name, scan type, or triggered rule
  - Download a **PDF report** for any individual scan
- **Master Report Generation** : Compile all historical scans into a single executive summary PDF
- **30-Day Summary panel** : Clean scans, suspicious flags, and malicious detections at a glance
- One-click **Clear History** with confirmation guard

---

###  Platform Settings
Full account and preference management:
- **Profile Overview** : Edit display name; email shown as read-only with security notice
- **Security & Auth** : Change password (minimum 6 characters, with confirmation); log out all active sessions
- **Notifications** : Toggle email threat alerts, push notifications, and weekly summary reports
- **Preferences** : Set display language and timezone with a live clock preview showing the selected zone

---

###  Authentication
Secure multi-user authentication powered by Supabase:
- **Login** and **Sign Up** on a single, tabbed auth card
- Email + password authentication with session management
- Avatar generated dynamically from username (DiceBear API)
- Live user dropdown in the header with Settings and Logout shortcuts

---

###  Dark Mode & Responsive Design
- Full **light/dark mode** toggle available on every page including the auth screen
- Completely **mobile and tablet responsive** : sidebar collapses to a slide-in drawer on small screens with a hamburger toggle
- Scan activity table switches to a **card layout** on mobile for readability
- All page headers, toolbars, and grids adapt fluidly across breakpoints (mobile  tablet  desktop)

---

###  PDF Report Engine
Every scan type supports downloadable PDF reports:
- **Single-scan reports** : Document, URL, Network, and Executable scans each export a dedicated report
- **Master report** : Exports the full scan history with a 30-day summary and all detected threats
- Reports include: scan type, file/target name, timestamp, status, detected indicators, and triggered rules

---

## Tech Stack

### Frontend

| Technology   | Version | Purpose                              |
|--------------|---------|--------------------------------------|
| React.js     | v19     | Component-based UI framework         |
| TypeScript   | v5      | Type-safe development                |
| Vite         | v6      | Lightning-fast build tool and dev server |
| Tailwind CSS | v4      | Utility-first responsive styling     |
| React Router | v7      | Client-side routing                  |
| Lucide React | latest  | Consistent icon library              |
| Supabase JS  | v2      | Authentication and user management   |
| jsPDF        | latest  | Client-side PDF report generation    |

### Backend

| Technology     | Version | Purpose                              |
|----------------|---------|--------------------------------------|
| Python         | 3.10+   | Core backend language                |
| FastAPI        | 0.100+  | High-performance async API framework |
| Uvicorn        | latest  | ASGI server                          |
| YARA / yara-python | latest | Malware pattern matching engine  |
| python-whois   | latest  | WHOIS domain lookups                 |
| dnspython      | latest  | DNS record resolution                |
| requests       | latest  | HTTP/URL scanning and redirect tracing |
| python-nmap    | latest  | Network port scanning                |

---

## Prerequisites

Ensure the following are installed before running the project:

- **Node.js** v18+
- **Python** 3.10+
- **npm** (or yarn / pnpm)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/threat-guard-professional.git
cd "threat-guard-professional"
```

### 2. Frontend Setup

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 3. Backend Setup

Open a new terminal, navigate to the `backend` directory, install dependencies, and start the server:

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend API runs at `http://localhost:8000`.  
Swagger documentation is available at `http://localhost:8000/docs`.

### 4. Environment Variables

Create a `.env` file in the project root with the following:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:8000
```

### 5. Running via Docker

Build and run the backend using Docker:

```bash
cd backend
docker build -t threat-guard-backend .
docker run -p 8000:8000 threat-guard-backend
```

---

## Project Structure

```
threat-guard-professional/
 backend/
    main.py               # FastAPI app : document & URL scanning
    network_scanner.py    # Network port scan logic
    document_rules.yar    # YARA ruleset for document analysis
    requirements.txt
 src/
    components/
       dashboard/        # StatCard, UrlScanEngine, TopDetectionRules, ScanActivityTable
       Sidebar.tsx       # Responsive collapsible navigation
       TopHeader.tsx     # Search bar, theme toggle, user dropdown
       AuthCard.tsx      # Login / Sign Up tabbed auth UI
    layouts/
       DashboardLayout.tsx  # Mobile-first layout with drawer sidebar
    lib/
       scanStore.ts      # Global scan history state (pub/sub)
       pdfReport.ts      # PDF export engine
       supabase.ts       # Supabase client
       timezone.ts       # Timezone utilities
    pages/
        Dashboard.tsx
        DocumentScanning.tsx
        Weblinks.tsx
        Executables.tsx
        Applications.tsx
        NetworkScanning.tsx
        Reports.tsx
        Settings.tsx
```

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Create an account or log in via the **Sign Up / Login** screen
3. Use the **Dashboard** for a quick URL scan or to review recent activity
4. Navigate to any scan engine from the sidebar:
   - **Document Scanning** : Upload a file and receive a full YARA-based threat report
   - **Weblinks** : Enter a URL for SSL, DNS, redirect, and threat analysis
   - **Executables** : Submit a binary for sandbox detonation analysis
   - **Applications** : Run a full system audit of installed software
   - **Network Scanning** : Probe any IP or subnet for open ports and vulnerabilities
5. Visit **Reports** to browse history, filter by status, and download PDF summaries
6. Configure your profile, password, timezone, and notifications in **Settings**

---

## Contributing

Contributions are welcome. Please check for linting and formatting issues before opening a Pull Request.

```bash
npm run lint
```

---

## License

This project is licensed under the **MIT License** : see the [LICENSE](LICENSE) file for details.
