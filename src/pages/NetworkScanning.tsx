import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Network, CheckCircle2, ShieldAlert, Wifi, Server, Route, ShieldCheck, Loader2, Download } from 'lucide-react';
import { downloadSingleScanPDF, type SingleScanInput } from '../lib/pdfReport';
import { addScan } from '../lib/scanStore';

interface PortDetails {
    port: number;
    protocol: string;
    service: string;
    state: string;
    warning?: string;
}

interface HostDetails {
    hostname?: string;
    location?: string;
    isp?: string;
}

const NetworkScanning: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [targetIp, setTargetIp] = useState('');
    const [discoveredPorts, setDiscoveredPorts] = useState<PortDetails[]>([]);
    const [hostDetails, setHostDetails] = useState<HostDetails | null>(null);
    const [inputError, setInputError] = useState<string | null>(null);

    const isValidIpOrSubnet = (ip: string) => {
        // Simple validation, allow domains as well since backend resolves them
        return ip.trim().length > 0;
    };

    const startScan = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setInputError(null);

        if (!targetIp.trim()) return;

        if (!isValidIpOrSubnet(targetIp)) {
            setInputError("Please enter a valid IP address or hostname.");
            return;
        }

        setIsScanning(true);
        setScanComplete(false);
        setDiscoveredPorts([]);
        setHostDetails(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/scan-network`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: targetIp.trim() })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to scan target.');
            }

            const data = await response.json();
            setTargetIp(data.targetIp); // set to resolved IP
            setHostDetails({
                hostname: data.hostname,
                location: data.location,
                isp: data.isp
            });
            setDiscoveredPorts(data.discoveredPorts);
            setScanComplete(true);

            // Record in scan history
            const hasWarnings = data.discoveredPorts?.some((p: any) => p.warning) || false;
            let status: 'safe' | 'warning' | 'malicious' = 'safe';
            let severity: 'clean' | 'low' | 'medium' | 'high' | 'critical' = 'clean';
            let actionText = 'Allowed';

            if (hasWarnings) {
                status = 'warning';
                severity = 'medium';
                actionText = 'Flagged';
            }
            if (data.discoveredPorts?.some((p: any) => p.warning && p.warning.includes('High Risk'))) {
                status = 'malicious';
                severity = 'high';
                actionText = 'Blocked';
            }

            const threats = data.discoveredPorts
                ?.filter((p: any) => p.warning)
                .map((p: any) => `[Port ${p.port}] ${p.warning}`) || [];

            addScan({
                fileName: data.targetIp || targetIp,
                type: 'Network',
                status: status,
                severity: severity,
                threatsFound: threats,
                rulesTriggered: [],
                message: `Network scan completed for ${data.targetIp || targetIp}. Found ${data.discoveredPorts?.length || 0} open/filtered ports.`,
                action: actionText
            });
        } catch (error: any) {
            setInputError(error.message || "An unexpected error occurred during the scan.");
            setScanComplete(false);
        } finally {
            setIsScanning(false);
        }
    };

    const handleDownloadReport = () => {
        const hasWarnings = discoveredPorts.some(p => p.warning);

        let status: 'safe' | 'warning' | 'malicious' = 'safe';
        if (hasWarnings) status = 'warning';
        if (discoveredPorts.some(p => p.warning && p.warning.includes('High Risk'))) status = 'malicious';

        const threats = discoveredPorts
            .filter(p => p.warning)
            .map(p => `[Port ${p.port}] ${p.warning}`);

        const scanInput: SingleScanInput = {
            status,
            threatsFound: threats,
            rulesTriggered: [],
            message: `Network scan completed for ${targetIp}. ${hostDetails?.hostname ? `Hostname: ${hostDetails.hostname}. ` : ''}Found ${discoveredPorts.length} open/filtered ports.`,
            fileName: targetIp,
            scanType: 'Network Port Scan'
        };

        downloadSingleScanPDF(scanInput);
    };

    return (
        <DashboardLayout>
            <div className="animation-fade-in space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">Active Network Reconnaissance</h1>
                        <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">
                            Actively monitor open ports, incoming packets, and unauthorized local network bridges in real time.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Scan Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-4 sm:p-8 shadow-sm transition-colors duration-200">

                            {!isScanning && !scanComplete && (
                                <div className={`border-2 border-dashed rounded-xl py-12 sm:py-16 px-6 flex flex-col items-center justify-center relative transition-all duration-200 min-h-[320px] border-gray-300 dark:border-[#3f3f46] bg-gray-50 dark:bg-[#18181b]/50 hover:bg-gray-100 dark:hover:bg-[#27272a]/30`}>
                                    <div className="flex flex-col items-center justify-center space-y-6 z-10 w-full max-w-lg text-center">
                                        {/* Icon Circle */}
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-300 shadow-sm bg-white dark:bg-[#1e1e24] border-gray-200 dark:border-[#27272a]`}>
                                            <Network size={36} className="text-[#0f8246] dark:text-[#10b981]" strokeWidth={1.5} />
                                        </div>

                                        {/* Text / Input */}
                                        <div className="space-y-6 w-full">
                                            <div className="space-y-1.5">
                                                <h3 className="text-[#111827] dark:text-[#d4d4d8] font-semibold text-lg">
                                                    Enter Target IP or Subnet
                                                </h3>
                                                <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm">
                                                    Scan network endpoints for open ports and surface vulnerabilities.
                                                </p>
                                            </div>
                                            <form onSubmit={startScan} className="flex flex-col w-full max-w-md mx-auto relative group">
                                                <div className="flex items-center w-full relative group">
                                                    <span className="absolute left-4 font-bold text-[#0f8246] group-focus-within:text-[#0c6a39] transition-colors">$</span>
                                                    <input
                                                        type="text"
                                                        value={targetIp}
                                                        onChange={(e) => {
                                                            setTargetIp(e.target.value);
                                                            if (inputError) setInputError(null);
                                                        }}
                                                        placeholder="192.168.1.0/24"
                                                        className={`w-full bg-white dark:bg-[#18181b] border ${inputError ? 'border-red-500/50 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 dark:border-[#3f3f46] focus:border-[#0f8246] dark:focus:border-[#0f8246] focus:ring-[#0f8246]'} rounded-lg py-3 pl-10 pr-24 text-[#111827] dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 font-mono text-sm shadow-sm transition-all`}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!targetIp.trim()}
                                                        className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-gray-800 dark:hover:bg-gray-200 px-6 rounded-md font-sans text-sm font-medium tracking-wide transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Scan
                                                    </button>
                                                </div>
                                                {inputError && (
                                                    <div className="mt-2 text-red-500 dark:text-red-400 text-xs text-left flex items-center bg-red-50 dark:bg-red-500/10 py-1.5 px-3 rounded border border-red-100 dark:border-red-500/20">
                                                        <ShieldAlert size={14} className="mr-1.5 flex-shrink-0" />
                                                        {inputError}
                                                    </div>
                                                )}
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isScanning && (
                                <div className="flex flex-col items-center justify-center space-y-6 min-h-[360px]">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 shadow-sm relative transition-colors duration-300">
                                        <Loader2 size={36} className="text-blue-600 dark:text-blue-400 animate-spin" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-[#111827] dark:text-[#d4d4d8] font-semibold text-lg">Scanning target: {targetIp}...</p>
                                        <p className="text-gray-500 dark:text-[#a1a1aa] text-sm">Probing active host and identifying network services.</p>
                                    </div>
                                </div>
                            )}

                            {scanComplete && !isScanning && (
                                <div className="flex flex-col min-h-[360px] w-full space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-[#27272a] pb-4">
                                        <div>
                                            <h3 className="text-[#111827] dark:text-white font-semibold text-lg flex items-center">
                                                <CheckCircle2 size={20} className="text-[#0f8246] mr-2" />
                                                Scan Results: {targetIp}
                                            </h3>
                                            <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">Host is active. {discoveredPorts.length} open/filtered ports discovered.</p>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={handleDownloadReport}
                                                className="flex items-center bg-[#0f8246] hover:bg-[#0c6a39] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                            >
                                                <Download size={16} className="mr-2" />
                                                Download Report
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setScanComplete(false);
                                                    setTargetIp('');
                                                    setDiscoveredPorts([]);
                                                    setHostDetails(null);
                                                }}
                                                className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#3f3f46] text-[#111827] dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors shadow-sm"
                                            >
                                                New Scan
                                            </button>
                                        </div>
                                    </div>

                                    {hostDetails && (
                                        <div className="bg-gray-50 dark:bg-[#18181b]/50 border border-gray-200 dark:border-[#3f3f46] rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1">Hostname</p>
                                                <p className="text-[#111827] dark:text-white font-medium text-sm">{hostDetails.hostname || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1">Location</p>
                                                <p className="text-[#111827] dark:text-white font-medium text-sm">{hostDetails.location || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1">ISP</p>
                                                <p className="text-[#111827] dark:text-white font-medium text-sm">{hostDetails.isp || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-3">
                                        {discoveredPorts.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#18181b]/50 border border-gray-200 dark:border-[#3f3f46] rounded-xl transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-base ${p.state === 'open' ? (p.warning ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 border border-amber-200 dark:border-amber-800' : 'bg-green-100 text-[#0f8246] dark:bg-[#0f8246]/20 dark:text-[#10b981] border border-green-200 dark:border-[#0f8246]/30') : 'bg-gray-200 text-gray-500 dark:bg-[#27272a] dark:text-gray-400 border border-gray-300 dark:border-[#3f3f46]'}`}>
                                                        {p.port}
                                                    </div>
                                                    <div>
                                                        <p className="text-[#111827] dark:text-white font-semibold text-[15px] flex items-center uppercase">
                                                            {p.service} <span className="text-gray-500 dark:text-[#a1a1aa] ml-2 text-xs font-medium lowercase px-2.5 py-0.5 bg-gray-200 dark:bg-[#27272a] rounded-md">{p.protocol}</span>
                                                        </p>
                                                        {p.warning && (
                                                            <p className="text-amber-600 dark:text-amber-500 text-xs mt-1.5 flex items-center font-medium">
                                                                <ShieldAlert size={14} className="mr-1.5" /> {p.warning}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${p.state === 'open' ? 'bg-green-50 text-[#0f8246] dark:bg-[#0f8246]/10 dark:text-[#10b981] border border-green-200 dark:border-[#0f8246]/30' : 'bg-gray-100 text-gray-600 dark:bg-[#27272a] dark:text-gray-400 border border-gray-200 dark:border-[#3f3f46]'}`}>
                                                    {p.state}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Side Information Panel */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Interface Status</h3>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-blue-500 animate-pulse' : 'bg-[#0f8246]'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Wi-Fi (WLAN0)</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">802.11ax / WPA3 Personal / 1.2 Gbps</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-[#a1a1aa]">Ethernet (ETH0)</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Media Disconnected</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-blue-500 animate-pulse' : 'bg-[#0f8246]'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Local Proxy Loopback</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Routing kernel packets via localhost.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Capabilities */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Network Probes</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <Wifi size={16} className="text-[#0f8246]" />
                                    </div>
                                    Evil Twin AP Detection
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <Server size={16} className="text-[#0f8246]" />
                                    </div>
                                    Open Port Fingerprinting
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <Route size={16} className="text-[#0f8246]" />
                                    </div>
                                    Man-in-the-Middle Sweeps
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <ShieldCheck size={16} className="text-[#0f8246]" />
                                    </div>
                                    Intrusion Detection (IDS) Logs
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default NetworkScanning;
