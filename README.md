# ThreatGuard Professional

ThreatGuard Professional is a comprehensive security application designed to analyze, detect, and mitigate potential threats from malicious files and URLs. It provides a robust, user-friendly interface powered by a React frontend and a FastAPI backend integrating the YARA engine for advanced malware detection.

## Features

- **Document Scanning Engine**: Upload and scan files for ransomware, phishing attempts, and other malicious content using powerful YARA rules.
- **URL Scan Engine**: Input URLs to be checked against known phishing and malicious databases to ensure safe browsing.
- **Real-time Threat Analysis**: Fast and efficient scanning with immediate, professional, and clear presentation of scan results.
- **Interactive Dashboard**: A comprehensive dashboard showing scan histories, system health, user profile, and quick access to various scanning methodologies.
- **Secure File Handling**: Temporary and safe handling of uploaded files for analysis without compromising the host system.
- **Modern UI/UX**: Built with Tailwind CSS and responsive design to offer a seamless experience.

## Tech Stack

### Frontend
- **React.js (v19)**: Component-based UI.
- **Vite & TypeScript**: Extremely fast and type-safe frontend tooling.
- **Tailwind CSS (v4)**: Utility-first styling for a pixel-perfect, modern UI.
- **Lucide React**: Clean and consistent iconography.
- **Supabase**: Backend-as-a-service functionality integration for the frontend workflow.

### Backend
- **Python 3.10+**: Core backend language.
- **FastAPI**: High-performance, highly concurrent API framework.
- **Uvicorn**: Lightning-fast ASGI server.
- **YARA & YARA-Python**: Powerful pattern matching engine for malware research and detection.

## Prerequisites

Before you start, ensure you have the following installed on your machine:
- Node.js (v18+)
- Python (v3.10+)
- npm (or yarn/pnpm)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/threat-guard-professional.git
cd "threat-guard-professional"
```

### 2. Frontend Setup

From the project root, install the necessary dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The frontend will typically run on `http://localhost:5173`. Open this URL in your browser to access the application.

### 3. Backend Setup

Open a new terminal and navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment (highly recommended):
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

Install the required Python packages:
```bash
pip install -r requirements.txt
```

Start the FastAPI backend server:
```bash
python main.py
# Alternatively run using uvicorn directly:
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API and its corresponding Swagger documentation will be available at `http://localhost:8000/docs`.

### 4. Running via Docker

*(If Docker configurations are fully structured)*
Navigate to the `backend` folder and run the following to build and run the backend image:
```bash
cd backend
docker build -t threat-guard-backend .
docker run -p 8000:8000 threat-guard-backend
```

## Usage

1. Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2. Explore the dashboard to start scanning URLs.
3. Access the **Document Scanner** to upload files and scrutinize their safety using the tightly-integrated Python YARA engine.
4. Review the returned scan reports, detailing if the file/URL is clean, suspicious, or malicious based on the latest threat databases and rule configurations.

## Contributing

Contributions are always welcome. Be sure to check thoroughly for formatting and linting errors before you submit a Pull Request.
```bash
# Run linting
npm run lint
```
## License

This project is licensed under the MIT License - see the LICENSE file for details.
