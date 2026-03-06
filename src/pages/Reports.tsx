import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Activity, Download, FileText, Loader2, CheckCircle2, ShieldAlert,
    Calendar, Search, Shield, AlertTriangle, RefreshCw, Trash2
} from 'lucide-react';
import {
    subscribe,
    getHistory,
    get30DaySummary,
    clearHistory,
    type ScanRecord,
} from '../lib/scanStore';
import { downloadFullReportPDF, downloadSingleScanPDF } from '../lib/pdfReport';

// ── Icon helper ───────────────────────────────────────────────────────────────
const StatusIcon = ({ status }: { status: ScanRecord['status'] }) => {
    if (status === 'safe') return <CheckCircle2 size={14} className="ml-2 text-green-500" />;
    if (status === 'malicious') return <ShieldAlert size={14} className="ml-2 text-red-500" />;
    return <AlertTriangle size={14} className="ml-2 text-amber-500" />;
};

const statusColor = (status: ScanRecord['status']) => {
    if (status === 'safe') return 'text-green-600 dark:text-green-400';
    if (status === 'malicious') return 'text-red-600 dark:text-red-400';
    return 'text-amber-600 dark:text-amber-400';
};

const statusText = (status: ScanRecord['status']) => {
    if (status === 'safe') return 'Clean';
    if (status === 'malicious') return 'Malicious';
    return 'Warning';
};

const typeIconClass = (status: ScanRecord['status']) => {
    if (status === 'safe') return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30';
    if (status === 'malicious') return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30';
    return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30';
};

const typeIconColor = (status: ScanRecord['status']) => {
    if (status === 'safe') return 'text-green-500';
    if (status === 'malicious') return 'text-red-500';
    return 'text-amber-500';
};



// ── Component ─────────────────────────────────────────────────────────────────
const Reports: React.FC = () => {
    const [history, setHistory] = useState<ScanRecord[]>(() => getHistory());
    const [summary30, setSummary30] = useState(() => get30DaySummary());
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | ScanRecord['status']>('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportReady, setReportReady] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const refresh = useCallback(() => {
        setHistory(getHistory());
        setSummary30(get30DaySummary());
        setReportReady(false);
    }, []);

    useEffect(() => subscribe(refresh), [refresh]);

    // Filtered history
    const filtered = history.filter(r => {
        const matchSearch = r.fileName.toLowerCase().includes(search.toLowerCase()) ||
            r.type.toLowerCase().includes(search.toLowerCase()) ||
            r.rulesTriggered.some(rule => rule.toLowerCase().includes(search.toLowerCase()));
        const matchFilter = filterStatus === 'all' || r.status === filterStatus;
        return matchSearch && matchFilter;
    });

    const generateReport = () => {
        setIsGenerating(true);
        setReportReady(false);
        setTimeout(() => {
            setIsGenerating(false);
            setReportReady(true);
        }, 900);
    };

    const downloadReport = () => {
        downloadFullReportPDF(history);
    };

    const downloadSingleReport = (scan: ScanRecord) => {
        downloadSingleScanPDF({
            status: scan.status,
            threatsFound: scan.threatsFound,
            rulesTriggered: scan.rulesTriggered,
            message: scan.message,
            fileName: scan.fileName,
            scanType: scan.type,
        });
    };

    const handleClear = () => {
        clearHistory();
        setShowClearConfirm(false);
    };

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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={refresh}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#4b5563] dark:text-[#a1a1aa] bg-gray-50 dark:bg-[#27272a]/50 border border-gray-200 dark:border-[#3f3f46] rounded-lg hover:bg-gray-100 dark:hover:bg-[#3f3f46] transition-colors"
                        >
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                        {history.length > 0 && (
                            <>
                                {!showClearConfirm ? (
                                    <button
                                        onClick={() => setShowClearConfirm(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Clear History
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg px-3 py-1.5">
                                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">Confirm clear?</span>
                                        <button onClick={handleClear} className="text-xs font-bold text-red-700 dark:text-red-300 hover:underline">Yes</button>
                                        <button onClick={() => setShowClearConfirm(false)} className="text-xs text-gray-500 hover:underline">No</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main: Scan History */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] shadow-sm transition-colors duration-200 flex flex-col h-full min-h-[500px]">

                            {/* Toolbar */}
                            <div className="p-6 border-b border-gray-100 dark:border-[#27272a] flex items-center justify-between gap-3 flex-wrap">
                                <h2 className="text-[#111827] dark:text-white font-semibold flex items-center">
                                    <Activity size={18} className="mr-2 text-[#0f8246]" />
                                    Scan History Log
                                    {history.length > 0 && (
                                        <span className="ml-2 text-xs bg-gray-100 dark:bg-[#27272a] text-gray-600 dark:text-[#a1a1aa] px-2 py-0.5 rounded-full font-normal">
                                            {history.length}
                                        </span>
                                    )}
                                </h2>
                                <div className="flex space-x-2 flex-wrap gap-y-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search size={14} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search reports..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="w-48 pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-[#27272a]/50 border border-gray-200 dark:border-[#3f3f46] text-[#111827] dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f8246] transition-all"
                                        />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-[#4b5563] dark:text-[#a1a1aa] bg-gray-50 dark:bg-[#27272a]/50 border border-gray-200 dark:border-[#3f3f46] rounded-md hover:bg-gray-100 dark:hover:bg-[#3f3f46] transition-colors outline-none focus:ring-1 focus:ring-[#0f8246]"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="safe">Clean Only</option>
                                        <option value="warning">Warning Only</option>
                                        <option value="malicious">Malicious Only</option>
                                    </select>
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-auto p-2">
                                {filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500 dark:text-[#a1a1aa] space-y-4">
                                        <FileText size={48} className="opacity-20" />
                                        <p className="font-medium text-lg">
                                            {history.length === 0 ? 'No historical scans found' : 'No results match your filter'}
                                        </p>
                                        <p className="text-sm">
                                            {history.length === 0
                                                ? 'Initiate a document scan to generate reports.'
                                                : 'Try adjusting your search or filter.'}
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100 dark:divide-[#27272a]">
                                        {filtered.map(scan => (
                                            <li key={scan.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#27272a]/30 transition-colors rounded-lg">
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center space-x-4 min-w-0">
                                                        <div className={`p-2.5 rounded-lg border flex-shrink-0 ${typeIconClass(scan.status)}`}>
                                                            {scan.status === 'safe'
                                                                ? <CheckCircle2 size={18} className={typeIconColor(scan.status)} />
                                                                : scan.status === 'malicious'
                                                                    ? <ShieldAlert size={18} className={typeIconColor(scan.status)} />
                                                                    : <AlertTriangle size={18} className={typeIconColor(scan.status)} />
                                                            }
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-[#111827] dark:text-white flex items-center flex-wrap gap-1">
                                                                <span className="truncate max-w-[200px]" title={scan.fileName}>{scan.fileName}</span>
                                                                <StatusIcon status={scan.status} />
                                                                <span className="ml-1 text-[10px] font-normal bg-gray-100 dark:bg-[#27272a] text-gray-500 dark:text-[#a1a1aa] px-1.5 py-0.5 rounded">{scan.type}</span>
                                                            </p>
                                                            <div className="flex items-center text-xs text-gray-500 dark:text-[#a1a1aa] mt-1 space-x-3 flex-wrap gap-y-1">
                                                                <span className="flex items-center tracking-wide">
                                                                    <Calendar size={11} className="mr-1" />
                                                                    {new Date(scan.timestamp).toLocaleString()}
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                                <span className={`font-semibold ${statusColor(scan.status)}`}>
                                                                    {statusText(scan.status)}
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                                <span>{scan.action}</span>
                                                                {scan.rulesTriggered.length > 0 && (
                                                                    <>
                                                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                                        <span className="font-mono text-[10px] truncate max-w-[160px]" title={scan.rulesTriggered.join(', ')}>
                                                                            {scan.rulesTriggered[0]}{scan.rulesTriggered.length > 1 ? ` +${scan.rulesTriggered.length - 1}` : ''}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                                        {scan.threatsFound.length > 0 && (
                                                            <span className="text-[10px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full border border-red-200 dark:border-red-900/30">
                                                                {scan.threatsFound.length} threat{scan.threatsFound.length !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => downloadSingleReport(scan)}
                                                            title="Download PDF report for this scan"
                                                            className="p-1.5 text-gray-400 hover:text-[#0f8246] dark:hover:text-[#10b981] hover:bg-gray-100 dark:hover:bg-[#27272a] rounded-md transition-colors"
                                                        >
                                                            <Download size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {filtered.length > 0 && (
                                <div className="p-3 border-t border-gray-100 dark:border-[#27272a] text-center text-xs text-gray-400 dark:text-[#52525b]">
                                    Showing {filtered.length} of {history.length} scan{history.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="space-y-6">

                        {/* Generate Report */}
                        <div className="bg-[#111827] dark:bg-[#18181b] border border-gray-800 dark:border-[#27272a] rounded-[14px] p-8 shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0f8246] opacity-[0.03] rounded-bl-full pointer-events-none" />

                            <div className="flex flex-col items-center justify-center space-y-5 relative z-10 text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300
                                    ${isGenerating
                                        ? 'bg-blue-900/40 border border-blue-800'
                                        : reportReady
                                            ? 'bg-[#0f8246]/20 border border-[#0f8246]/40'
                                            : 'bg-gray-800/50 border border-gray-700'}`}
                                >
                                    {isGenerating
                                        ? <Loader2 size={28} className="text-blue-400 animate-spin" />
                                        : reportReady
                                            ? <CheckCircle2 size={28} className="text-[#10b981]" />
                                            : <FileText size={28} className="text-white" />
                                    }
                                </div>

                                <div>
                                    <h3 className="text-white font-semibold text-lg tracking-tight">
                                        {isGenerating ? 'Compiling Report...' : reportReady ? 'Report Ready' : 'Compile All Reports'}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                                        {isGenerating
                                            ? 'Aggregating scan histories into a master report.'
                                            : reportReady
                                                ? 'Your report is ready for download.'
                                                : `Generate a master report from all ${history.length} historical scans.`}
                                    </p>
                                </div>

                                {!isGenerating && !reportReady && (
                                    <button
                                        onClick={generateReport}
                                        disabled={history.length === 0}
                                        className="w-full bg-[#0f8246] hover:bg-[#0c6a39] text-white font-medium text-sm px-6 py-3 rounded-lg transition-colors shadow-sm tracking-wide mt-2 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Activity size={18} className="mr-2 opacity-80" />
                                        Generate Master Report
                                    </button>
                                )}

                                {!isGenerating && reportReady && (
                                    <div className="w-full space-y-2">
                                        <button
                                            onClick={downloadReport}
                                            className="w-full bg-white text-[#111827] hover:bg-gray-100 font-medium text-sm px-6 py-3 rounded-lg transition-colors shadow-sm tracking-wide flex justify-center items-center"
                                        >
                                            <Download size={18} className="mr-2" />
                                            Download PDF Report
                                        </button>
                                        <button
                                            onClick={() => { setReportReady(false); }}
                                            className="w-full text-gray-400 hover:text-white text-xs py-1 transition-colors"
                                        >
                                            Regenerate
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 30-Day Summary */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">30-Day Summary</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-[#4b5563] dark:text-[#a1a1aa]">
                                        <CheckCircle2 size={16} className="text-green-500 mr-2" />
                                        Clean Scans
                                    </div>
                                    <span className="font-semibold text-[#111827] dark:text-white">{summary30.clean}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-[#4b5563] dark:text-[#a1a1aa]">
                                        <ShieldAlert size={16} className="text-amber-500 mr-2" />
                                        Suspicious / Warning
                                    </div>
                                    <span className="font-semibold text-[#111827] dark:text-white">{summary30.suspicious}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-[#4b5563] dark:text-[#a1a1aa]">
                                        <Activity size={16} className="text-red-500 mr-2" />
                                        Malicious / Quarantined
                                    </div>
                                    <span className="font-semibold text-[#111827] dark:text-white">{summary30.critical}</span>
                                </div>
                                <div className="border-t border-gray-100 dark:border-[#27272a] pt-3 flex items-center justify-between">
                                    <div className="flex items-center text-sm font-medium text-[#111827] dark:text-white">
                                        <Shield size={16} className="text-[#0f8246] mr-2" />
                                        Total (30 days)
                                    </div>
                                    <span className="font-bold text-[#0f8246]">
                                        {summary30.clean + summary30.suspicious + summary30.critical}
                                    </span>
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
