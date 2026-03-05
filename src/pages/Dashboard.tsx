import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import UrlScanEngine from '../components/dashboard/UrlScanEngine';
import TopDetectionRules, { type TopDetectionRule } from '../components/dashboard/TopDetectionRules';
import ScanActivityTable, { type ScanActivity } from '../components/dashboard/ScanActivityTable';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [userName, setUserName] = useState<string>('');
    const [stats, setStats] = useState({ total: 0, critical: 0 });
    const [activities, setActivities] = useState<ScanActivity[]>([]);
    const [topRules, setTopRules] = useState<TopDetectionRule[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                setUserName(name);
            }
        };
        fetchUser();

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSimulateScan = (type: string, name: string) => {
        setIsScanning(true);
        // Simulate a network request or scan process
        setTimeout(() => {
            const isThreat = Math.random() > 0.7; // 30% chance of threat
            const isBlocked = isThreat && Math.random() > 0.1; // 90% chance to block if threat

            const severityLevels: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
            const randomSeverity = isThreat ? severityLevels[Math.floor(Math.random() * 3) + 1] : 'low';

            setStats(prev => ({
                total: prev.total + 1,
                critical: prev.critical + (randomSeverity === 'critical' ? 1 : 0),
            }));
            const labels = {
                low: 'Low Risk - Green',
                medium: 'Medium - Amber',
                high: 'High - Orange',
                critical: 'Critical - Red'
            };

            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

            const newActivity: ScanActivity = {
                name: name,
                type: type,
                rule: isThreat ? 'Heuristic Pattern Match' : 'Clean Scan',
                severityLabel: labels[randomSeverity],
                severityLevel: randomSeverity,
                timestamp: timestamp,
                action: isBlocked ? 'Blocked' : (isThreat ? 'Flagged' : 'Allowed'),
                secondaryAction: isThreat ? 'Analyzed' : ''
            };

            setActivities(prev => [newActivity, ...prev]);

            if (isThreat) {
                setTopRules(prev => {
                    const newRuleName = Math.random() > 0.5 ? 'Malicious Macro Detection' : 'Ransomware Signature Match';
                    const newRule = { name: newRuleName, alert: 'Just now' };
                    return [newRule, ...prev].slice(0, 5); // Keep top 5 latest rules
                });
            }

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
                        value={stats.critical > 0 ? "Warning" : "Optimal"}
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

                {/* Middle Section: Scan New Content & Top Rules */}
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
