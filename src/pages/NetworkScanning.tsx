import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Network, CheckCircle2, ShieldAlert, Wifi, Server, Route, ShieldCheck, Loader2 } from 'lucide-react';

interface PortDetails {
    port: number;
    protocol: string;
    service: string;
    state: string;
    warning?: string;
}

const NetworkScanning: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [targetIp, setTargetIp] = useState('');
    const [discoveredPorts, setDiscoveredPorts] = useState<PortDetails[]>([]);
    const [inputError, setInputError] = useState<string | null>(null);

    const isValidIpOrSubnet = (ip: string) => {
        // Matches standard IPv4 and IPv4 with subnet (e.g., 192.168.1.1 or 10.0.0.0/24)
        const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[1-2]?[0-9]|3[0-2]))?$/;
        return regex.test(ip.trim());
    };

    const startScan = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setInputError(null);

        if (!targetIp.trim()) return;

        if (!isValidIpOrSubnet(targetIp)) {
            setInputError("Please enter a valid IPv4 address or subnet (e.g., 192.168.1.1 or 10.0.0.0/24).");
            return;
        }

        setIsScanning(true);
        setScanComplete(false);
        setDiscoveredPorts([]);

        setTimeout(() => {
            setDiscoveredPorts([
                { port: 80, protocol: 'tcp', service: 'http', state: 'open' },
                { port: 443, protocol: 'tcp', service: 'https', state: 'open' },
                { port: 22, protocol: 'tcp', service: 'ssh', state: 'open', warning: 'Weak Cypher Detected' },
                { port: 3389, protocol: 'tcp', service: 'ms-wbt-server', state: 'filtered' },
                { port: 3306, protocol: 'tcp', service: 'mysql', state: 'open', warning: 'Exposed Database' }
            ]);
            setIsScanning(false);
            setScanComplete(true);
        }, 2000);
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
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-8 shadow-sm transition-colors duration-200">

                            {!isScanning && !scanComplete && (
                                <div className={`border-2 border-dashed rounded-xl py-16 px-6 flex flex-col items-center justify-center relative transition-all duration-200 min-h-[360px] border-gray-300 dark:border-[#3f3f46] bg-gray-50 dark:bg-[#18181b]/50 hover:bg-gray-100 dark:hover:bg-[#27272a]/30`}>
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
                                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#27272a] pb-4">
                                        <div>
                                            <h3 className="text-[#111827] dark:text-white font-semibold text-lg flex items-center">
                                                <CheckCircle2 size={20} className="text-[#0f8246] mr-2" />
                                                Scan Results: {targetIp}
                                            </h3>
                                            <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">Host is active. {discoveredPorts.length} open/filtered ports discovered.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setScanComplete(false);
                                                setTargetIp('');
                                                setDiscoveredPorts([]);
                                            }}
                                            className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#3f3f46] text-[#111827] dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors shadow-sm"
                                        >
                                            New Scan
                                        </button>
                                    </div>

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
