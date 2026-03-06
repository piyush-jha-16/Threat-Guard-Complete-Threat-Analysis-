import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface ScanActivity {
    name: string;
    type: string;
    rule: string;
    severityLabel: string;
    severityLevel: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    action: string;
    secondaryAction: string;
}

interface ScanActivityTableProps {
    activities: ScanActivity[];
}

const getSeverityStyles = (level: string) => {
    switch (level) {
        case 'low':
            return 'bg-[#0f8246]/10 text-[#10b981] border-[#10b981]/20';
        case 'medium':
            return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20';
        case 'high':
            return 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20';
        case 'critical':
            return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20';
        default:
            return 'bg-gray-800 text-gray-300 border-gray-700';
    }
};

const ScanActivityTable: React.FC<ScanActivityTableProps> = ({ activities }) => {
    return (
        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] shadow-sm overflow-hidden flex flex-col transition-colors duration-200">
            <div className="p-4 sm:p-6 pb-4 border-b border-gray-100 dark:border-[#27272a]">
                <h2 className="text-[#111827] dark:text-white text-[16px] font-medium tracking-wide">Recent Scan Activity</h2>
            </div>

            {activities.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-[#a1a1aa]">
                    No scan activity recorded yet. Run a scan to see results here.
                </div>
            ) : (
                <>
                    {/* Mobile card list — visible below md */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-[#27272a]/50">
                        {activities.map((activity, idx) => (
                            <div key={idx} className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold text-[#111827] dark:text-white truncate">{activity.name}</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border flex-shrink-0 ${getSeverityStyles(activity.severityLevel)}`}>
                                        {activity.severityLabel}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-[#a1a1aa]">
                                    <span>{activity.type}</span>
                                    <span className="font-mono">{activity.rule}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-[#a1a1aa]">{activity.timestamp}</span>
                                    <span className="text-[#111827] dark:text-white font-medium">{activity.action}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table — visible at md+ */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-[13px] text-gray-700 dark:text-[#d4d4d8] mb-2">
                            <thead className="text-gray-500 dark:text-[#a1a1aa] border-b border-gray-100 dark:border-[#27272a]">
                                <tr>
                                    <th className="px-6 py-3 font-normal w-[20%]">Name/Resource</th>
                                    <th className="px-6 py-3 font-normal">Type</th>
                                    <th className="px-6 py-3 font-normal w-[25%]">Detection Rule</th>
                                    <th className="px-6 py-3 font-normal">Severity</th>
                                    <th className="px-6 py-3 font-normal w-[15%] flex items-center gap-1 cursor-pointer">
                                        Timestamp <span className="text-[10px] opacity-70">▼</span>
                                    </th>
                                    <th className="px-6 py-3 font-normal">Action Taken</th>
                                    <th className="px-6 py-3 font-normal w-[48px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#27272a]/50">
                                {activities.map((activity, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#27272a]/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-[#111827] dark:text-white font-medium">{activity.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{activity.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-500 dark:text-[#a1a1aa]">{activity.rule}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium border ${getSeverityStyles(activity.severityLevel)}`}>
                                                {activity.severityLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap tracking-tight text-gray-700 dark:text-gray-300">{activity.timestamp}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-[#111827] dark:text-white">{activity.action}</span>
                                                {activity.secondaryAction && (
                                                    <span className="text-gray-500 dark:text-[#a1a1aa] text-[12px]">{activity.secondaryAction}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right">
                                            <button className="text-gray-400 dark:text-[#a1a1aa] hover:text-[#111827] dark:hover:text-white transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-[#27272a]">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default ScanActivityTable;
