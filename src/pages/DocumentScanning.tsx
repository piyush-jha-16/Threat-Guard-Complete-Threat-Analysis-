import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { UploadCloud, FileText, CheckCircle2, ShieldAlert, Loader2, AlertTriangle, WifiOff, Server, ChevronRight, ShieldCheck, RefreshCw } from 'lucide-react';

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
        setScanComplete(false); // Force explicit flush of old results
        setScanResult(null);    // Force explicit flush of old results

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
            setBackendOnline(true);
        }
    };

    const resetScan = () => {
        setScanComplete(false);
        setSelectedFile(null);
        setScanResult(null);
    };

    return (
        <DashboardLayout>
            <div className="animation-fade-in space-y-6 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">Document Scanning Engine</h1>
                        <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">
                            Analyze documents for embedded macros, malicious links, and hidden payload structures.
                        </p>
                    </div>
                    {/* Backend Status Badge */}
                    <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${backendOnline === null
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

                {!scanComplete ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Dropzone Area */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-8 shadow-sm transition-colors duration-200">
                                {/* Drag & Drop Zone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-[1rem] p-12 flex flex-col items-center justify-center gap-6 relative overflow-hidden transition-all duration-200 min-h-[360px] 
                                        ${isDragging
                                            ? 'border-[#0f8246] bg-[#0f8246]/5 dark:bg-[#0f8246]/10'
                                            : 'border-gray-300 dark:border-[#3f3f46] bg-gray-50/50 dark:bg-[#18181b]/50 hover:bg-gray-100/50 dark:hover:bg-[#27272a]/30'}`}
                                >
                                    <div className="flex flex-col items-center justify-center space-y-6 z-10 w-full">
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-sm relative transition-colors duration-300
                                            ${isScanning
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                : 'bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-[#27272a]'}`}
                                        >
                                            {isScanning ? (
                                                <div className="relative flex items-center justify-center">
                                                    <Loader2 size={44} className="text-blue-600 dark:text-blue-400 animate-spin absolute" />
                                                    <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                            ) : (
                                                <UploadCloud size={44} className="text-[#0f8246] dark:text-[#10b981]" strokeWidth={1.5} />
                                            )}
                                        </div>

                                        <div className="text-center space-y-2">
                                            <p className="text-[#111827] dark:text-[#d4d4d8] font-bold text-xl tracking-tight">
                                                {isScanning
                                                    ? 'Analyzing Document Security...'
                                                    : selectedFile
                                                        ? 'Ready to Scan'
                                                        : 'Drag and drop your document here'}
                                            </p>
                                            <div className="text-gray-500 dark:text-[#a1a1aa] text-sm max-w-md mx-auto leading-relaxed">
                                                {isScanning
                                                    ? 'Running deep heuristic analysis, link extraction, and YARA pattern matching. Please stand by.'
                                                    : (
                                                        <>
                                                            Supported formats: Office macros, PDF payloads, RTF, TXT.<br />
                                                            Maximum file size: 50MB. All processing is localized.
                                                        </>
                                                    )
                                                }
                                            </div>
                                        </div>

                                        {(!isScanning && !selectedFile) ? (
                                            <>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleFileSelect}
                                                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.rtf"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        resetScan();
                                                        handleBrowseClick();
                                                    }}
                                                    className="bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-semibold text-sm px-8 py-3.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md tracking-wide mt-4"
                                                >
                                                    Browse Local Files
                                                </button>
                                            </>
                                        ) : null}

                                        {!isScanning && selectedFile && (
                                            <div className="flex flex-col items-center space-y-6 pt-4 w-full max-w-xs">
                                                <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#3f3f46] rounded-xl p-4 shadow-sm flex items-center space-x-4 w-full relative overflow-hidden group">
                                                    <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg">
                                                        <FileText size={20} className="text-[#0f8246]" />
                                                    </div>
                                                    <div className="truncate flex-1">
                                                        <p className="text-sm font-semibold text-[#111827] dark:text-white truncate">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa]">
                                                            {formatFileSize(selectedFile.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-3 w-full">
                                                    <button
                                                        onClick={() => setSelectedFile(null)}
                                                        className="flex-1 bg-white dark:bg-[#27272a]/50 text-[#4b5563] dark:text-[#a1a1aa] border border-gray-200 dark:border-[#3f3f46] font-medium text-sm px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3f3f46] transition-colors shadow-sm tracking-wide"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={startScan}
                                                        className="flex-[2] bg-[#0f8246] hover:bg-[#0c6a39] text-white font-semibold text-sm px-4 py-3 rounded-lg transition-all shadow-md tracking-wide flex items-center justify-center transform active:scale-[0.98]"
                                                    >
                                                        <ShieldCheck className="mr-2" size={18} />
                                                        Start Deep Scan
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
                                <h3 className="text-[#111827] dark:text-white font-bold text-sm mb-5 uppercase tracking-wider flex items-center">
                                    <ActivityIcon isScanning={isScanning} />
                                    Analysis Pipeline
                                </h3>

                                <div className="space-y-5">
                                    <div className="flex items-start space-x-3">
                                        <div className={`mt-0.5 w-2 h-2 rounded-full ${isScanning ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        <div>
                                            <p className={`text-sm font-semibold ${isScanning ? 'text-blue-600 dark:text-blue-400' : 'text-[#111827] dark:text-white'}`}>Static Extraction</p>
                                            <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5 leading-relaxed">Extracting embedded objects, macros, and hidden text.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className={`mt-0.5 w-2 h-2 rounded-full ${isScanning ? 'bg-blue-500/50' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#111827] dark:text-white">Heuristic Analysis</p>
                                            <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5 leading-relaxed">Executing YARA rules against file structure and contents.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className={`mt-0.5 w-2 h-2 rounded-full ${isScanning ? 'bg-blue-500/30' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#111827] dark:text-white">Threat Intelligence</p>
                                            <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5 leading-relaxed">Cross-referencing signatures and known malicious footprints.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Capabilities */}
                            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                                <h3 className="text-[#111827] dark:text-white font-bold text-sm mb-4 uppercase tracking-wider">Engine Capabilities</h3>
                                <ul className="space-y-3.5">
                                    <li className="flex items-center text-sm font-medium text-[#4b5563] dark:text-[#d4d4d8]">
                                        <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                            <FileText size={16} className="text-[#0f8246]" />
                                        </div>
                                        PDF JavaScript Extraction
                                    </li>
                                    <li className="flex items-center text-sm font-medium text-[#4b5563] dark:text-[#d4d4d8]">
                                        <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                            <FileText size={16} className="text-[#0f8246]" />
                                        </div>
                                        Office Macro (VBA) Analysis
                                    </li>
                                    <li className="flex items-center text-sm font-medium text-[#4b5563] dark:text-[#d4d4d8]">
                                        <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                            <ShieldAlert size={16} className="text-[#0f8246]" />
                                        </div>
                                        Phishing Link Detection
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Scan Complete Large Report View
                    <div className="animation-fade-in w-full">
                        {scanResult && (
                            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-2xl shadow-lg transition-colors duration-200 overflow-hidden">

                                {/* Status Header Bar */}
                                <div className={`px-8 py-6 flex items-center gap-4 ${scanResult.status === 'malicious'
                                    ? 'bg-red-500 text-white'
                                    : scanResult.status === 'warning'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-[#0f8246] text-white'
                                    }`}>
                                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                        {scanResult.status === 'malicious'
                                            ? <ShieldAlert size={32} className="text-white" />
                                            : scanResult.status === 'warning'
                                                ? <AlertTriangle size={32} className="text-white" />
                                                : <ShieldCheck size={32} className="text-white" />
                                        }
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight">
                                            {scanResult.status === 'malicious' ? 'Malware / Threat Detected' : scanResult.status === 'warning' ? 'Scan Warning' : 'Document is Safe'}
                                        </h2>
                                        <p className="text-white/80 text-sm mt-0.5 font-medium">
                                            {scanResult.status === 'malicious' ? 'Immediate action recommended. Do not open this file.' : scanResult.status === 'warning' ? 'Scan could not be fully completed.' : 'No known threats or signatures found in the document.'}
                                        </p>
                                    </div>
                                    <div className="ml-auto">
                                        <button
                                            onClick={resetScan}
                                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm tracking-wide flex items-center"
                                        >
                                            <RefreshCw size={16} className="mr-2" />
                                            New Scan
                                        </button>
                                    </div>
                                </div>

                                {/* Report Details */}
                                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                                    {/* File Info */}
                                    <div className="md:col-span-1 border-r border-gray-100 dark:border-[#27272a] pr-8">
                                        <h3 className="text-sm font-bold text-gray-500 dark:text-[#a1a1aa] uppercase tracking-wider mb-4">File Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-[#71717a] uppercase font-semibold">File Name</p>
                                                <p className="text-[#111827] dark:text-white font-medium break-all">{scanResult.fileName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-[#71717a] uppercase font-semibold">File Size</p>
                                                <p className="text-[#111827] dark:text-white font-medium">{scanResult.fileSize ? formatFileSize(scanResult.fileSize) : 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-[#71717a] uppercase font-semibold">Engine Details</p>
                                                <p className="text-[#111827] dark:text-white font-medium">ThreatGuard YARA Engine v1.2</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-[#71717a] uppercase font-semibold">Analysis Time</p>
                                                <p className="text-[#111827] dark:text-white font-medium">{new Date().toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Threats & Rules */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-500 dark:text-[#a1a1aa] uppercase tracking-wider mb-4">Analysis Summary</h3>
                                            <p className={`text-lg font-medium ${scanResult.status === 'malicious'
                                                ? 'text-red-600 dark:text-red-400'
                                                : scanResult.status === 'warning'
                                                    ? 'text-amber-600 dark:text-amber-400'
                                                    : 'text-[#0f8246] dark:text-[#10b981]'
                                                }`}>
                                                {scanResult.message}
                                            </p>
                                        </div>

                                        {scanResult.threatsFound.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-500 dark:text-[#a1a1aa] uppercase tracking-wider mb-3">Detected Indicators</h3>
                                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl overflow-hidden">
                                                    <ul className="divide-y divide-red-100 dark:divide-red-900/30">
                                                        {scanResult.threatsFound.map((threat, idx) => (
                                                            <li key={idx} className="p-4 flex items-start gap-4 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-colors">
                                                                <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg mt-0.5">
                                                                    <ShieldAlert size={16} className="text-red-600 dark:text-red-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-red-800 dark:text-red-300 font-semibold text-sm">Malicious Indicator Identified</p>
                                                                    <p className="text-red-600 dark:text-red-400 text-sm mt-0.5">{threat}</p>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {scanResult.rulesTriggered.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-500 dark:text-[#a1a1aa] uppercase tracking-wider mb-3">YARA Rules Triggered</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {scanResult.rulesTriggered.map((rule, idx) => (
                                                        <span key={idx} className="bg-gray-100 dark:bg-[#27272a] text-[#111827] dark:text-white font-mono text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#3f3f46] flex items-center gap-2">
                                                            <ChevronRight size={14} className="text-gray-400" />
                                                            {rule}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {scanResult.status === 'safe' && (
                                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-6 flex items-start gap-4">
                                                <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                                                    <CheckCircle2 size={24} className="text-[#0f8246]" />
                                                </div>
                                                <div>
                                                    <h4 className="text-green-800 dark:text-green-300 font-bold">Security Clearance Granted</h4>
                                                    <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                                                        This file cleared all static and heuristic checks against our threat intelligence database. It is safe to open and distribute.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

// Simple helper component for the animated status icon
const ActivityIcon = ({ isScanning }: { isScanning: boolean }) => (
    <span className="relative flex h-3 w-3 mr-2">
        {isScanning ? (
            <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </>
        ) : (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400 dark:bg-gray-600"></span>
        )}
    </span>
);

export default DocumentScanning;
