import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Globe2, Search, CheckCircle2, Loader2, AlertCircle, Link as LinkIcon, ShieldCheck } from 'lucide-react';

const Weblinks: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);

    const startScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsScanning(true);
        setScanComplete(false);

        // Simulate a 2.5-second URL scan
        setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
        }, 2500);
    };

    const resetScan = () => {
        setUrl('');
        setScanComplete(false);
    };

    return (
        <DashboardLayout>
            <div className="animation-fade-in space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">Web Analysis Engine</h1>
                        <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">
                            Analyze URLs and comprehensive web networks for phishing attempts, malicious domains, and unsafe tracking.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Scan Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-8 shadow-sm transition-colors duration-200">

                            <div className={`rounded-xl p-12 flex flex-col items-center justify-center gap-6 relative overflow-hidden transition-all duration-200 min-h-[320px] bg-gray-50 dark:bg-[#18181b]/50 border border-gray-200 dark:border-[#3f3f46]`}>
                                <div className="flex flex-col items-center justify-center space-y-6 z-10 w-full max-w-xl">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-sm relative transition-colors duration-300
                                        ${isScanning
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : scanComplete
                                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                : 'bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-[#27272a]'}`}
                                    >
                                        {isScanning ? (
                                            <Loader2 size={36} className="text-blue-600 dark:text-blue-400 animate-spin" />
                                        ) : scanComplete ? (
                                            <CheckCircle2 size={36} className="text-[#0f8246] dark:text-[#10b981]" />
                                        ) : (
                                            <Globe2 size={36} className="text-[#0f8246] dark:text-[#10b981]" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    <div className="text-center space-y-2 w-full">
                                        <p className="text-[#111827] dark:text-[#d4d4d8] font-semibold text-lg">
                                            {isScanning
                                                ? 'Analyzing Domain Reputation...'
                                                : scanComplete
                                                    ? 'Analysis Complete'
                                                    : 'Enter a URL to analyze'}
                                        </p>

                                        {!isScanning && !scanComplete ? (
                                            <form onSubmit={startScan} className="mt-6 w-full flex flex-col space-y-4">
                                                <div className="relative w-full">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Search size={18} className="text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="url"
                                                        required
                                                        value={url}
                                                        onChange={(e) => setUrl(e.target.value)}
                                                        placeholder="https://example.com"
                                                        className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#27272a]/50 border border-gray-300 dark:border-[#3f3f46] text-[#111827] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f8246]/50 focus:border-[#0f8246] transition-all shadow-sm"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!url.trim()}
                                                    className="w-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-medium text-sm px-8 py-3.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Analyze URL
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="mt-4 flex flex-col items-center pt-2">
                                                <p className="text-gray-500 dark:text-[#a1a1aa] text-sm break-all max-w-sm mb-6">
                                                    {url}
                                                </p>
                                                {scanComplete && (
                                                    <button
                                                        onClick={resetScan}
                                                        className="bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-medium text-sm px-8 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm tracking-wide"
                                                    >
                                                        Scan New URL
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
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
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Domain Verification</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Checking DNS records and historical WHOIS data.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Phishing Signatures</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Comparing layout and code against known spoofed sites.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Malware Hosting</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Scanning linked resources for distributed payloads.</p>
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
                                        <ShieldCheck size={16} className="text-[#0f8246]" />
                                    </div>
                                    SSL/TLS Certificate Validation
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <LinkIcon size={16} className="text-[#0f8246]" />
                                    </div>
                                    Deep Link Unraveling
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <Globe2 size={16} className="text-[#0f8246]" />
                                    </div>
                                    Homograph Attack Detection
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-amber-50 dark:bg-amber-500/10 p-1.5 rounded-md mr-3 border border-amber-100 dark:border-amber-500/20">
                                        <AlertCircle size={16} className="text-amber-500" />
                                    </div>
                                    Suspicious Redirect Tracing
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Weblinks;
