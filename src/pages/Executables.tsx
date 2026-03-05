import React, { useState, useRef } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { UploadCloud, FileCode2, CheckCircle2, Loader2, AlertCircle, Box, Cpu } from 'lucide-react';

const Executables: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setScanComplete(false);
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
        }
    };

    const startScan = () => {
        if (!selectedFile) return;
        setIsScanning(true);
        setScanComplete(false);

        // Simulate a longer sandbox scan
        setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
            setSelectedFile(null);
        }, 4500);
    };

    return (
        <DashboardLayout>
            <div className="animation-fade-in space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">Executable Sandbox Analysis</h1>
                        <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">
                            Deep scan .exe, .sh, and binary payloads in an isolated sandbox to detect advanced malware logic.
                        </p>
                    </div>
                </div>

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
                                <div className="flex flex-col items-center justify-center space-y-6 z-10 w-full">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-sm relative transition-colors duration-300
                                        ${isScanning
                                            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                            : scanComplete
                                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                : 'bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-[#27272a]'}`}
                                    >
                                        {isScanning ? (
                                            <Loader2 size={36} className="text-amber-600 dark:text-amber-400 animate-spin" />
                                        ) : scanComplete ? (
                                            <CheckCircle2 size={36} className="text-[#0f8246] dark:text-[#10b981]" />
                                        ) : (
                                            <UploadCloud size={36} className="text-[#0f8246] dark:text-[#10b981]" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    <div className="text-center space-y-2">
                                        <p className="text-[#111827] dark:text-[#d4d4d8] font-semibold text-lg">
                                            {isScanning
                                                ? 'Detonating Payload in Sandbox...'
                                                : scanComplete
                                                    ? 'Execution Analysis Complete'
                                                    : selectedFile
                                                        ? 'Ready for Sandbox Detonation'
                                                        : 'Upload binary executable for detonation'}
                                        </p>
                                        <p className="text-gray-500 dark:text-[#a1a1aa] text-sm max-w-sm mx-auto">
                                            {isScanning
                                                ? 'Monitoring memory allocation, registry writes, and network callouts in a secure VM. This may take a moment.'
                                                : scanComplete
                                                    ? 'The binary was successfully executed and its behavior tree has been logged.'
                                                    : (
                                                        <>
                                                            Supported formats: EXE, MSI, SH, BAT, BIN.<br />
                                                            Maximum file size: 100MB.
                                                        </>
                                                    )
                                            }
                                        </p>
                                    </div>

                                    {!isScanning && !selectedFile && (
                                        <>
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept=".exe,.msi,.sh,.bat,.bin"
                                            />
                                            <button
                                                onClick={handleBrowseClick}
                                                className="bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-medium text-sm px-8 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm tracking-wide mt-2"
                                            >
                                                {scanComplete ? 'Analyze Another Executable' : 'Select Executable'}
                                            </button>
                                        </>
                                    )}

                                    {!isScanning && selectedFile && (
                                        <div className="flex flex-col items-center space-y-4 pt-2">
                                            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#3f3f46] rounded-lg py-2 px-4 shadow-sm flex items-center space-x-3">
                                                <FileCode2 size={16} className="text-[#0f8246]" />
                                                <span className="text-sm font-medium text-[#111827] dark:text-white truncate max-w-[200px]">
                                                    {selectedFile.name}
                                                </span>
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => setSelectedFile(null)}
                                                    className="bg-white dark:bg-[#27272a]/50 text-[#4b5563] dark:text-[#a1a1aa] border border-gray-200 dark:border-[#3f3f46] font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3f3f46] transition-colors shadow-sm tracking-wide"
                                                >
                                                    Discard
                                                </button>
                                                <button
                                                    onClick={startScan}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm px-8 py-2.5 rounded-lg transition-colors shadow-sm tracking-wide flex items-center"
                                                >
                                                    Detonate Payload
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
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Sandbox Telemetry</h3>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-amber-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Static Reverse Engineering</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Decompiling functions and extracting packed strings.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">API Hook Monitoring</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Logging suspicious Windows API or POSIX system calls.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Memory Injection</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Detecting process hollowing or unauthorized allocations.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Alerts */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Sandbox Features</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <Box size={16} className="text-[#0f8246]" />
                                    </div>
                                    Air-Gapped VM Detonation
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <Cpu size={16} className="text-[#0f8246]" />
                                    </div>
                                    Processor Instruction Emulation
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-amber-50 dark:bg-amber-500/10 p-1.5 rounded-md mr-3 border border-amber-100 dark:border-amber-500/20">
                                        <AlertCircle size={16} className="text-amber-500" />
                                    </div>
                                    Anti-Evasion Detection Support
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Executables;
