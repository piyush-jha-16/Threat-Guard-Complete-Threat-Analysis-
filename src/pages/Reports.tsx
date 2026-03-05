import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Activity, Download, FileText, Loader2, CheckCircle2, ShieldAlert, Calendar, Search, Filter } from 'lucide-react';

const Reports: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportReady, setReportReady] = useState(false);

    const generateReport = () => {
        setIsGenerating(true);
        setReportReady(false);

        // Simulate compiling all into one PDF
        setTimeout(() => {
            setIsGenerating(false);
            setReportReady(true);
        }, 3000);
    };

    const scanHistory: any[] = [];

    return (
        <DashboardLayout>
            <div className="animation-fade-in space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">Intelligence Reports</h1>
                        <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">
                            Review historical scan reports across all engines and compile executive summaries.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main List Area: Historical Scans */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] shadow-sm transition-colors duration-200 flex flex-col h-full min-h-[500px]">

                            {/* Toolbar */}
                            <div className="p-6 border-b border-gray-100 dark:border-[#27272a] flex items-center justify-between">
                                <h2 className="text-[#111827] dark:text-white font-semibold flex items-center">
                                    <Activity size={18} className="mr-2 text-[#0f8246]" />
                                    Scan History Log
                                </h2>
                                <div className="flex space-x-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search size={14} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search reports..."
                                            className="w-48 pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-[#27272a]/50 border border-gray-200 dark:border-[#3f3f46] text-[#111827] dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f8246] transition-all"
                                        />
                                    </div>
                                    <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-[#4b5563] dark:text-[#a1a1aa] bg-gray-50 dark:bg-[#27272a]/50 border border-gray-200 dark:border-[#3f3f46] rounded-md hover:bg-gray-100 dark:hover:bg-[#3f3f46] transition-colors">
                                        <Filter size={14} />
                                        <span>Filter</span>
                                    </button>
                                </div>
                            </div>

                            {/* List Content */}
                            <div className="flex-1 overflow-auto p-2">
                                {scanHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500 dark:text-[#a1a1aa] space-y-4">
                                        <FileText size={48} className="opacity-20" />
                                        <p className="font-medium text-lg">No historical scans found</p>
                                        <p className="text-sm">Initiate scans in other modules to generate intelligence reports.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100 dark:divide-[#27272a]">
                                        {scanHistory.map((scan) => {
                                            const Icon = scan.icon;
                                            return (
                                                <li key={scan.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#27272a]/30 transition-colors rounded-lg flex items-center justify-between group">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`p-2.5 rounded-lg border ${scan.bg}`}>
                                                            <Icon size={20} className={scan.color} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-[#111827] dark:text-white flex items-center">
                                                                {scan.name}
                                                                {scan.status === 'Clean' && <CheckCircle2 size={14} className="ml-2 text-green-500" />}
                                                                {(scan.status === 'Quarantined' || scan.status === 'Phishing Detected') && <ShieldAlert size={14} className="ml-2 text-red-500" />}
                                                            </p>
                                                            <div className="flex items-center text-xs text-gray-500 dark:text-[#a1a1aa] mt-1 space-x-3">
                                                                <span className="flex items-center tracking-wide">
                                                                    <Calendar size={12} className="mr-1" />
                                                                    {scan.date}
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                                <span className="font-medium">{scan.type}</span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                                <span className={
                                                                    scan.status === 'Clean' ? 'text-green-600 dark:text-green-400' :
                                                                        scan.status === 'Quarantined' ? 'text-red-600 dark:text-red-400' :
                                                                            'text-amber-600 dark:text-amber-400'
                                                                }>
                                                                    {scan.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="flex items-center px-3 py-1.5 text-xs font-medium text-[#0f8246] dark:text-[#10b981] bg-green-50 dark:bg-[#0f8246]/10 hover:bg-green-100 dark:hover:bg-[#0f8246]/20 rounded transition-colors border border-green-100 dark:border-[#0f8246]/20">
                                                            <Download size={14} className="mr-1.5" />
                                                            View Report
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>

                            {scanHistory.length > 0 && (
                                <div className="p-4 border-t border-gray-100 dark:border-[#27272a] text-center">
                                    <button className="text-sm font-medium text-[#4b5563] hover:text-[#111827] dark:text-[#a1a1aa] dark:hover:text-white transition-colors">
                                        Load More History...
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Side Panel: Compile All */}
                    <div className="space-y-6">

                        <div className="bg-[#111827] dark:bg-[#18181b] border border-gray-800 dark:border-[#27272a] rounded-[14px] p-8 shadow-md relative overflow-hidden">
                            {/* Decorative background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0f8246] opacity-[0.03] rounded-bl-full pointer-events-none"></div>

                            <div className="flex flex-col items-center justify-center space-y-5 relative z-10 text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300
                                    ${isGenerating
                                        ? 'bg-blue-900/40 border border-blue-800'
                                        : reportReady
                                            ? 'bg-[#0f8246]/20 border border-[#0f8246]/40'
                                            : 'bg-gray-800/50 border border-gray-700'}`}
                                >
                                    {isGenerating ? (
                                        <Loader2 size={28} className="text-blue-400 animate-spin" />
                                    ) : reportReady ? (
                                        <CheckCircle2 size={28} className="text-[#10b981]" />
                                    ) : (
                                        <FileText size={28} className="text-white" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-white font-semibold text-lg tracking-tight">
                                        {isGenerating ? 'Compiling PDF...' : reportReady ? 'Compilation Complete' : 'Compile All Reports'}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                                        {isGenerating
                                            ? 'Aggregating selected scan histories into a single executive PDF.'
                                            : reportReady
                                                ? 'Your comprehensive master report is ready for download.'
                                                : 'Generate a single, master PDF document containing all filtered historical scan data.'}
                                    </p>
                                </div>

                                {!isGenerating && !reportReady && (
                                    <button
                                        onClick={generateReport}
                                        className="w-full bg-[#0f8246] hover:bg-[#0c6a39] text-white font-medium text-sm px-6 py-3 rounded-lg transition-colors shadow-sm tracking-wide mt-2 flex justify-center items-center"
                                    >
                                        <Activity size={18} className="mr-2 opacity-80" />
                                        Generate Master PDF
                                    </button>
                                )}

                                {!isGenerating && reportReady && (
                                    <button
                                        className="w-full bg-white text-[#111827] hover:bg-gray-100 font-medium text-sm px-6 py-3 rounded-lg transition-colors shadow-sm tracking-wide mt-2 flex justify-center items-center"
                                    >
                                        <Download size={18} className="mr-2" />
                                        Download Master PDF
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Audit Summary Stats */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">30-Day Summary</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-[#4b5563] dark:text-[#a1a1aa]">
                                        <CheckCircle2 size={16} className="text-green-500 mr-2" />
                                        Clean Scans
                                    </div>
                                    <span className="font-semibold text-[#111827] dark:text-white">0</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-[#4b5563] dark:text-[#a1a1aa]">
                                        <ShieldAlert size={16} className="text-amber-500 mr-2" />
                                        Suspicious / Phishing
                                    </div>
                                    <span className="font-semibold text-[#111827] dark:text-white">0</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-[#4b5563] dark:text-[#a1a1aa]">
                                        <Activity size={16} className="text-red-500 mr-2" />
                                        Critical / Quarantined
                                    </div>
                                    <span className="font-semibold text-[#111827] dark:text-white">0</span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Reports;
