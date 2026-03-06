import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { AppWindow, CheckCircle2, LayoutDashboard, Database, Activity } from 'lucide-react';

const Applications: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [scannedApps, setScannedApps] = useState(0);

    const startScan = () => {
        setIsScanning(true);
        setScanComplete(false);
        setScannedApps(0);

        // Simulate scanning installed apps
        let currentApps = 0;
        const interval = setInterval(() => {
            currentApps += 4;
            setScannedApps(currentApps);
            if (currentApps >= 48) {
                clearInterval(interval);
                setIsScanning(false);
                setScanComplete(true);
            }
        }, 300);
    };

    return (
        <DashboardLayout>
            <div className="animation-fade-in space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">Application Monitoring</h1>
                        <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">
                            Monitor installed application behavior, registry hooks, and background memory allocations for irregular usage patterns.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Scan Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-4 sm:p-8 shadow-sm transition-colors duration-200">

                            <div className={`rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center gap-6 relative overflow-hidden transition-all duration-200 min-h-[280px] sm:min-h-[320px] bg-gray-50 dark:bg-[#18181b]/50 border border-gray-200 dark:border-[#3f3f46]`}>
                                <div className="flex flex-col items-center justify-center space-y-6 z-10 w-full max-w-xl">
                                    <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-sm relative transition-colors duration-300
                                        ${isScanning
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : scanComplete
                                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                : 'bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-[#27272a]'}`}
                                    >
                                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0f8246]/20 border-r-[#0f8246]/20 ${isScanning ? 'animate-spin' : ''}"></div>
                                        {isScanning ? (
                                            <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
                                                <span className="text-2xl font-bold">{scannedApps}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">Apps</span>
                                            </div>
                                        ) : scanComplete ? (
                                            <CheckCircle2 size={40} className="text-[#0f8246] dark:text-[#10b981]" />
                                        ) : (
                                            <AppWindow size={40} className="text-[#0f8246] dark:text-[#10b981]" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    <div className="text-center space-y-2 w-full">
                                        <p className="text-[#111827] dark:text-[#d4d4d8] font-semibold text-lg">
                                            {isScanning
                                                ? 'Auditing System Applications...'
                                                : scanComplete
                                                    ? 'System Audit Complete'
                                                    : 'Ready to Audit Installed Applications'}
                                        </p>

                                        <p className="text-gray-500 dark:text-[#a1a1aa] text-sm max-w-sm mx-auto">
                                            {isScanning
                                                ? 'Scanning active processes, startup entries, and background services against known threat intelligence signatures.'
                                                : scanComplete
                                                    ? 'Successfully analyzed 48 installed applications and background processes. No anomalies detected.'
                                                    : 'Initiate a deep scan of all currently installed software, browser extensions, and background tasks.'}
                                        </p>

                                        {!isScanning && (
                                            <button
                                                onClick={startScan}
                                                className="bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-medium text-sm px-8 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm tracking-wide mt-6"
                                            >
                                                {scanComplete ? 'Run Audit Again' : 'Start Full System Audit'}
                                            </button>
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
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Audit Trajectory</h3>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${(isScanning && scannedApps > 10) || scanComplete ? 'bg-[#0f8246]' : isScanning ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Active Processes</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Validating currently running applications in RAM.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${(isScanning && scannedApps > 30) || scanComplete ? 'bg-[#0f8246]' : (isScanning && scannedApps > 10) ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Startup Entries</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Checking Windows Registry and daemon configurations.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${scanComplete ? 'bg-[#0f8246]' : (isScanning && scannedApps > 30) ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-[#111827] dark:text-white">Software Certificates</p>
                                        <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Verifying digital signatures of installed binaries.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Alerts */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Monitored Zones</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <LayoutDashboard size={16} className="text-[#0f8246]" />
                                    </div>
                                    User Installed Software
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-green-50 dark:bg-[#0f8246]/10 p-1.5 rounded-md mr-3 border border-green-100 dark:border-[#0f8246]/20">
                                        <Activity size={16} className="text-[#0f8246]" />
                                    </div>
                                    Background Services
                                </li>
                                <li className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                    <div className="bg-amber-50 dark:bg-amber-500/10 p-1.5 rounded-md mr-3 border border-amber-100 dark:border-amber-500/20">
                                        <Database size={16} className="text-amber-500" />
                                    </div>
                                    Browser Extensions
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Applications;
