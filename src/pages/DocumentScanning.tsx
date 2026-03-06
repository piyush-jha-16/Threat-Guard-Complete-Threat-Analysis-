import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { UploadCloud, FileText, CheckCircle2, ShieldAlert, Loader2, AlertCircle, AlertTriangle, WifiOff, Server, Download } from 'lucide-react';
import { downloadSingleScanPDF } from '../lib/pdfReport';

type ScanStatus = 'safe' | 'warning' | 'malicious';

interface ScanResult {
    status: ScanStatus;
    threatsFound: string[];
    rulesTriggered: string[];
    message: string;
    fileName?: string;
    fileSize?: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentScanning: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
    const [scanTime, setScanTime] = useState<Date | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check backend health on mount
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(3000) });
                const data = await res.json();
                setBackendOnline(data.status === 'online');
            } catch {
                setBackendOnline(false);
            }
        };
        checkBackend();
    }, []);

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setScanComplete(false);
            setScanResult(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setSelectedFile(e.dataTransfer.files[0]);
            setScanComplete(false);
            setScanResult(null);
        }
    };

    const startScan = async () => {
        if (!selectedFile) return;
        setIsScanning(true);
        setScanComplete(false);
        setScanResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch(`${BACKEND_URL}/scan`, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(30000),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setScanResult({
                status: data.status,
                threatsFound: data.threatsFound || [],
                rulesTriggered: data.rulesTriggered || [],
                message: data.message,
                fileName: data.fileName || selectedFile.name,
                fileSize: data.fileSize,
            });

        } catch (error: unknown) {
            const isNetworkError = error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'));
            const isTimeout = error instanceof DOMException && error.name === 'TimeoutError';
            setScanResult({
                status: 'warning',
                threatsFound: [],
                rulesTriggered: [],
                message: isNetworkError || isTimeout
                    ? 'Cannot reach the scanner backend. Make sure the Python server is running on port 8000.'
                    : `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        } finally {
            setIsScanning(false);
            setScanComplete(true);
            setScanTime(new Date());
            setBackendOnline(true); // If we got any response, backend is online
        }
    };

    const resetScan = () => {
        setScanComplete(false);
        setSelectedFile(null);
        setScanResult(null);
        setScanTime(null);
        handleBrowseClick();
    };

    return (
        <DashboardLayout>
            <div className="animation-fade-in space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">Document Scanning Engine</h1>
                        <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">
                            Analyze documents for embedded macros, malicious links, and hidden payload structures.
                        </p>
                    </div>
                    {/* Backend Status Badge */}
                    <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                        backendOnline === null
                            ? 'bg-gray-100 dark:bg-[#27272a] text-gray-500 dark:text-[#a1a1aa] border-gray-200 dark:border-[#3f3f46]'
                            : backendOnline
                                ? 'bg-green-50 dark:bg-[#0f8246]/10 text-[#0f8246] border-green-200 dark:border-[#0f8246]/30'
                                : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30'
                    }`}>
                        <Server size={13} />
                        {backendOnline === null ? 'Checking engine...' : backendOnline ? 'Engine Online' : 'Engine Offline'}
                    </div>
                </div>

                {/* Backend offline warning */}
                {backendOnline === false && (
                    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl px-4 py-3">
                        <WifiOff size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Scanner Engine Offline</p>
                            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
                                The Python backend is not running. Start it with:{' '}
                                <code className="bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded font-mono text-xs">
                                    python backend/main.py
                                </code>
                            </p>
                        </div>
                    </div>
                )}

                {/* ── New results UI ────────────────────────────────────────────────── */}
                {scanComplete && scanResult && (
                    <div className="space-y-4 animation-fade-in">

                        {/* Status Banner */}
                        <div className={`rounded-[14px] p-5 flex items-center justify-between flex-wrap gap-4 shadow-sm ${
                            scanResult.status === 'malicious'
                                ? 'bg-red-500 dark:bg-red-600'
                                : scanResult.status === 'warning'
                                    ? 'bg-amber-500 dark:bg-amber-600'
                                    : 'bg-[#0f8246] dark:bg-[#0f8246]'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl flex-shrink-0 ${
                                    scanResult.status === 'malicious'
                                        ? 'bg-red-400/40'
                                        : scanResult.status === 'warning'
                                            ? 'bg-amber-400/40'
                                            : 'bg-white/20'
                                }`}>
                                    {scanResult.status === 'malicious'
                                        ? <ShieldAlert size={26} className="text-white" />
                                        : scanResult.status === 'warning'
                                            ? <AlertTriangle size={26} className="text-white" />
                                            : <CheckCircle2 size={26} className="text-white" />
                                    }
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-xl tracking-tight">
                                        {scanResult.status === 'malicious'
                                            ? 'Malware / Threat Detected'
                                            : scanResult.status === 'warning'
                                                ? 'Scan Warning'
                                                : 'Document is Safe'}
                                    </h2>
                                    <p className="text-white/80 text-sm mt-0.5">
                                        {scanResult.status === 'malicious'
                                            ? 'Immediate action recommended. Do not open this file.'
                                            : scanResult.status === 'warning'
                                                ? 'Review the details below before proceeding.'
                                                : 'No threats found. This document is safe to use.'}
                                    </p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => downloadSingleScanPDF({
                                        status: scanResult.status,
                                        threatsFound: scanResult.threatsFound,
                                        rulesTriggered: scanResult.rulesTriggered,
                                        message: scanResult.message,
                                        fileName: scanResult.fileName || selectedFile?.name,
                                        fileSize: scanResult.fileSize,
                                        scanType: 'Document',
                                    })}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-medium rounded-lg transition-colors backdrop-blur-sm"
                                >
                                    <Download size={15} />
                                    Download Report
                                </button>
                                <button
                                    onClick={resetScan}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-[#111827] hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                    New Scan
                                </button>
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] shadow-sm transition-colors duration-200 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-[#27272a]">

                                {/* Left: File Details */}
                                <div className="p-7">
                                    <h3 className="text-[10px] font-bold tracking-[0.12em] text-gray-400 dark:text-[#71717a] uppercase mb-5">File Details</h3>
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-[10px] font-semibold tracking-[0.1em] text-gray-400 dark:text-[#71717a] uppercase mb-1">File Name</p>
                                            <p className="text-[#111827] dark:text-white font-semibold text-sm break-all">{scanResult.fileName || selectedFile?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold tracking-[0.1em] text-gray-400 dark:text-[#71717a] uppercase mb-1">File Size</p>
                                            <p className="text-[#111827] dark:text-white font-semibold text-sm">
                                                {scanResult.fileSize !== undefined ? formatFileSize(scanResult.fileSize) : selectedFile ? formatFileSize(selectedFile.size) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold tracking-[0.1em] text-gray-400 dark:text-[#71717a] uppercase mb-1">Engine Details</p>
                                            <p className="text-[#111827] dark:text-white font-semibold text-sm">ThreatGuard YARA Engine v1.2</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold tracking-[0.1em] text-gray-400 dark:text-[#71717a] uppercase mb-1">Analysis Time</p>
                                            <p className="text-[#111827] dark:text-white font-semibold text-sm">
                                                {scanTime ? scanTime.toLocaleTimeString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Analysis Summary */}
                                <div className="p-7">
                                    <h3 className="text-[10px] font-bold tracking-[0.12em] text-gray-400 dark:text-[#71717a] uppercase mb-5">Analysis Summary</h3>

                                    <p className={`font-semibold text-sm mb-5 ${
                                        scanResult.status === 'malicious'
                                            ? 'text-red-600 dark:text-red-400'
                                            : scanResult.status === 'warning'
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-[#0f8246] dark:text-[#10b981]'
                                    }`}>
                                        {scanResult.message}
                                    </p>

                                    {scanResult.threatsFound.length > 0 && (
                                        <div className="mb-5">
                                            <p className="text-[10px] font-bold tracking-[0.1em] text-gray-400 dark:text-[#71717a] uppercase mb-3">Detected Indicators</p>
                                            <div className="space-y-2">
                                                {scanResult.threatsFound.map((threat, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-3">
                                                        <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-md flex-shrink-0">
                                                            <ShieldAlert size={14} className="text-red-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-red-700 dark:text-red-300">Malicious Indicator Identified</p>
                                                            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5 break-words">{threat}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {scanResult.rulesTriggered.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-bold tracking-[0.1em] text-gray-400 dark:text-[#71717a] uppercase mb-3">YARA Rules Triggered</p>
                                            <div className="flex flex-wrap gap-2">
                                                {scanResult.rulesTriggered.map((rule, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-[#27272a] text-[#374151] dark:text-[#d4d4d8] text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#3f3f46]">
                                                        <span className="text-gray-400 dark:text-[#71717a]">&gt;</span>
                                                        {rule}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {scanResult.threatsFound.length === 0 && scanResult.rulesTriggered.length === 0 && (
                                        <div className="flex items-center gap-2 text-sm text-[#0f8246] dark:text-[#10b981]">
                                            <CheckCircle2 size={16} />
                                            No threats or suspicious indicators detected.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Download PDF footer ─────────────────────────────────────── */}
                            <div className="border-t border-gray-100 dark:border-[#27272a] px-7 py-4 flex items-center justify-between gap-4 bg-gray-50/60 dark:bg-[#111111]/40">
                                <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">
                                    Export a full PDF report with threats, YARA rules, and file details.
                                </p>
                                <button
                                    onClick={() => downloadSingleScanPDF({
                                        status: scanResult.status,
                                        threatsFound: scanResult.threatsFound,
                                        rulesTriggered: scanResult.rulesTriggered,
                                        message: scanResult.message,
                                        fileName: scanResult.fileName || selectedFile?.name,
                                        fileSize: scanResult.fileSize,
                                        scanType: 'Document',
                                    })}
                                    className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#111827] dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-[#111827] text-sm font-semibold rounded-lg transition-colors shadow-sm"
                                >
                                    <Download size={15} />
                                    Download PDF Report
                                </button>
                            </div>
                        </div>

                        {/* remove old standalone download bar */}
                    </div>
                )}

                {/* ── Upload / scanning UI ───────────────────────────────────────────── */}
                {!scanComplete && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Dropzone Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-8 shadow-sm transition-colors duration-200">

                            {/* Drag & Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-6 relative overflow-hidden transition-all duration-200 min-h-[320px] 
                                    ${isDragging
                                        ? 'border-[#0f8246] bg-[#0f8246]/5 dark:bg-[#0f8246]/10'
                                        : 'border-gray-300 dark:border-[#3f3f46] bg-gray-50 dark:bg-[#18181b]/50 hover:bg-gray-100 dark:hover:bg-[#27272a]/30'}`}
                            >
                                <div className="flex flex-col items-center justify-center space-y-6 z-10">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-sm relative transition-colors duration-300
                                        ${isScanning
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : 'bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-[#27272a]'}`}
                                    >
                                        {isScanning ? (
                                            <Loader2 size={36} className="text-blue-600 dark:text-blue-400 animate-spin" />
                                        ) : (
                                            <UploadCloud size={36} className="text-[#0f8246] dark:text-[#10b981]" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    <div className="text-center space-y-2">
                                        <p className="text-[#111827] dark:text-[#d4d4d8] font-semibold text-lg">
                                            {isScanning
                                                ? 'Analyzing Document Structure...'
                                                : selectedFile
                                                    ? 'Ready to Scan'
                                                    : 'Drag and drop your document here'}
                                        </p>
                                        <div className="text-gray-500 dark:text-[#a1a1aa] text-sm max-w-sm mx-auto">
                                            {isScanning
                                                ? 'Running heuristic behavioral analysis and static extraction. Please do not close this window.'
                                                : (
                                                    <>
                                                        Supported formats: PDF, DOCX, PPT, TXT.<br />
                                                        Maximum file size: 50MB.
                                                    </>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {!isScanning && !selectedFile && (
                                        <>
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept=".pdf,.docx,.ppt,.txt"
                                            />
                                            <button
                                                onClick={handleBrowseClick}
                                                className="bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-medium text-sm px-8 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm tracking-wide mt-2"
                                            >
                                                Browse Files
                                            </button>
                                        </>
                                    )}

                                    {!isScanning && selectedFile && !scanComplete && (
                                        <div className="flex flex-col items-center space-y-4 pt-2">
                                            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#3f3f46] rounded-lg py-2 px-4 shadow-sm flex items-center space-x-3">
                                                <FileText size={16} className="text-[#0f8246]" />
                                                <span className="text-sm font-medium text-[#111827] dark:text-white truncate max-w-[200px]">
                                                    {selectedFile.name}
                                                </span>
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => setSelectedFile(null)}
                                                    className="bg-white dark:bg-[#27272a]/50 text-[#4b5563] dark:text-[#a1a1aa] border border-gray-200 dark:border-[#3f3f46] font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3f3f46] transition-colors shadow-sm tracking-wide"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={startScan}
                                                    className="bg-[#0f8246] hover:bg-[#0c6a39] text-white font-medium text-sm px-8 py-2.5 rounded-lg transition-colors shadow-sm tracking-wide flex items-center"
                                                >
                                                    Start Scan
                                                    <Loader2 size={16} className="ml-2 hidden" /> {/* Hidden icon for spacing consistency if needed later */}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Side Information Panel */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Analysis Status</h3>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Static Extraction</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Extracting embedded objects, macros, and metadata.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Heuristic Analysis</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Detecting zero-day patterns and suspicious logic.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Threat Intelligence</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Cross-referencing global IOCs and malicious signatures.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Alerts */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Capabilities</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <FileText size={16} className="text-[#0f8246]" />
                                    </div>
                                    PDF JavaScript Extraction
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <FileText size={16} className="text-[#0f8246]" />
                                    </div>
                                    Office Macro (VBA) Analysis
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <FileText size={16} className="text-[#0f8246]" />
                                    </div>
                                    RTF Exploit Detection
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-amber-50 dark:bg-amber-500/10 p-1.5 rounded-md mr-3 border border-amber-100 dark:border-amber-500/20">
                                        <AlertCircle size={16} className="text-amber-500" />
                                    </div>
                                    Encrypted Archive Bypassing
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
                )} {/* end !scanComplete */}

            </div>
        </DashboardLayout>
    );
};

export default DocumentScanning;
