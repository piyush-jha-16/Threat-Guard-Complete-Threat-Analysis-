import React from 'react';

export interface TopDetectionRule {
    name: string;
    alert: string;
}

interface TopDetectionRulesProps {
    rules: TopDetectionRule[];
}

const TopDetectionRules: React.FC<TopDetectionRulesProps> = ({ rules }) => {

    return (
        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm w-full lg:w-[320px] flex-shrink-0 flex flex-col transition-colors duration-200">
            <h2 className="text-[#111827] dark:text-white text-[16px] font-medium tracking-wide mb-5">Recent Analysis</h2>

            <div className="flex justify-between text-[13px] text-gray-500 dark:text-[#a1a1aa] border-b border-gray-100 dark:border-[#27272a] pb-2 mb-3">
                <span>Rule</span>
                <span>Alert</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar min-h-0">
                {rules.length > 0 ? (
                    rules.map((rule, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[13px]">
                            <span className="text-[#111827] dark:text-[#d4d4d8]">{rule.name}</span>
                            <span className="text-gray-500 dark:text-[#a1a1aa]">{rule.alert}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 dark:text-[#a1a1aa] pt-4 text-[13px]">
                        No recent analysis triggered yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopDetectionRules;
