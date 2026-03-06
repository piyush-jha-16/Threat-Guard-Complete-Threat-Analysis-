import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import UrlScanEngine from '../components/dashboard/UrlScanEngine';
import TopDetectionRules, { type TopDetectionRule } from '../components/dashboard/TopDetectionRules';
import ScanActivityTable, { type ScanActivity } from '../components/dashboard/ScanActivityTable';
import { supabase } from '../lib/supabase';
import { Clock } from 'lucide-react';
import {
    subscribe,
    getStats,
    getHistory,
    addScan,
    resolveSeverity,
    actionFromStatus,
    severityLabel,
    type ScanRecord,
} from '../lib/scanStore';

// ── Helpers ───────────────────────────────────────────────────────────────────
const severityToLabel = (s: ScanRecord['severity']): string => {
    const map: Record<string, string> = {
        clean: 'Clean — Green',
        low: 'Low Risk — Green',
        medium: 'Medium — Amber',
        high: 'High — Orange',
        critical: 'Critical — Red',
    };
    return map[s] ?? s;
};

const recordToActivity = (r: ScanRecord): ScanActivity => ({
    name: r.fileName,
    type: r.type,
    rule: r.rulesTriggered.length > 0 ? r.rulesTriggered[0] : (r.status === 'safe' ? 'Clean Scan' : 'Heuristic Pattern Match'),
    severityLabel: severityToLabel(r.severity),
    severityLevel: r.severity === 'clean' ? 'low' : r.severity as ScanActivity['severityLevel'],
    timestamp: new Date(r.timestamp).toLocaleString(),
    action: r.action,
    secondaryAction: r.status === 'malicious' ? 'Analyzed' : '',
});

// ── Component ─────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
    const [userName, setUserName] = useState<string>('');
    const [stats, setStats] = useState(() => getStats());
    const [activities, setActivities] = useState<ScanActivity[]>(() =>
        getHistory().slice(0, 50).map(recordToActivity)
    );
    const [topRules, setTopRules] = useState<TopDetectionRule[]>(() =>
        buildTopRules(getHistory())
    );
    const [isScanning, setIsScanning] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Build top-5 most frequent triggered rules
    function buildTopRules(history: ScanRecord[]): TopDetectionRule[] {
        const ruleCount = new Map<string, number>();
        history.forEach(r => r.rulesTriggered.forEach(rule => {
            ruleCount.set(rule, (ruleCount.get(rule) ?? 0) + 1);
        }));
        return Array.from(ruleCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, alert: `${count} match${count !== 1 ? 'es' : ''}` }));
    }

    // Refresh dashboard state from store
    const refresh = useCallback(() => {
        setStats(getStats());
        const history = getHistory();
        setActivities(history.slice(0, 50).map(recordToActivity));
        setTopRules(buildTopRules(history));
    }, []);

    useEffect(() => {
        // Fetch username
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                setUserName(name);
            }
        };
        fetchUser();

        // Subscribe to scan store changes
        const unsub = subscribe(refresh);

        // Clock ticker
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => {
            unsub();
            clearInterval(timer);
        };
    }, [refresh]);

    // ── Network Scan (simulated, still writes to store) ─────────────────────
    const handleSimulateScan = (type: string, name: string) => {
        setIsScanning(true);
        setTimeout(() => {
            const isThreat = Math.random() > 0.7;
            const severities: ScanRecord['severity'][] = ['low', 'medium', 'high', 'critical'];
            const severity: ScanRecord['severity'] = isThreat
                ? severities[Math.floor(Math.random() * 3) + 1]
                : 'clean';
            const status: ScanRecord['status'] = isThreat ? 'malicious' : 'safe';

            addScan({
                fileName: name,
                type: type as ScanRecord['type'],
                status,
                severity,
                threatsFound: isThreat ? [`[${severityLabel(severity)}] Heuristic pattern match in ${name}`] : [],
                rulesTriggered: isThreat ? ['Heuristic Pattern Match'] : [],
                message: isThreat ? `Threat detected in ${name}` : `${name} is clean`,
                action: actionFromStatus(status, severity),
            });

            setIsScanning(false);
        }, 1500);
    };

    const tzString = localStorage.getItem('timeZone');
    const timeZoneOption = tzString && tzString !== 'local' ? tzString : undefined;

    return (
        <DashboardLayout>
            <div className="text-[#111827] dark:text-white w-full transition-colors duration-200">
                {/* Page Header */}
                <div className="mb-8 mt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight">
                            Welcome back, {userName ? userName : 'User'}.
                        </h1>
                        <p className="text-gray-500 dark:text-[#94a3b8] mt-1 text-base">
                            Here's what's happening with your security today.
                        </p>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-[#94a3b8] space-x-2 bg-white dark:bg-[#1A1A1A] px-4 py-2 rounded-full border border-gray-200 dark:border-[#2A2A2A] shadow-sm">
                        <Clock size={15} className="text-[#0f8246] dark:text-[#1abc63]" />
                        <span className="text-[13px] font-medium tabular-nums tracking-wide">
                            {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: timeZoneOption })}
                            <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                            {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: timeZoneOption })}
                        </span>
                    </div>
                </div>

                {/* Top Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 w-full">
                    <StatCard title="Total Scans" value={stats.total.toLocaleString()} />
                    <StatCard title="Critical Problems" value={stats.critical.toLocaleString()} />
                    <StatCard
                        title="System Health"
                        value={stats.critical > 0 ? 'Warning' : 'Optimal'}
                        icon={
                            <button
                                onClick={() => handleSimulateScan('Network', 'Network Sweep')}
                                disabled={isScanning}
                                className="text-[12px] px-3 py-1 bg-[#0f8246] hover:bg-[#0f8246]/90 text-white rounded-md transition-colors disabled:opacity-50 font-medium whitespace-nowrap"
                            >
                                Network Scan
                            </button>
                        }
                    />
                </div>

                {/* Middle Section */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6 items-stretch">
                    <UrlScanEngine onScan={handleSimulateScan} isScanning={isScanning} />
                    <TopDetectionRules rules={topRules} />
                </div>

                {/* Bottom Section: Scan Activity Table */}
                <div className="mb-8">
                    <ScanActivityTable activities={activities} />
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
