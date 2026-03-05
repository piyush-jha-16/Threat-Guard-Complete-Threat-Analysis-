import React from 'react';

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 flex flex-col justify-between h-[100px] shadow-sm transition-colors duration-200">
            <h3 className="text-gray-500 dark:text-[#a1a1aa] text-[15px] font-medium tracking-wide">{title}</h3>
            <div className="flex items-center justify-between mt-auto">
                <span className="text-[#111827] dark:text-white text-[28px] font-semibold tracking-tight">{value}</span>
                {icon && <div className="text-[#111827] dark:text-white">{icon}</div>}
            </div>
        </div>
    );
};

export default StatCard;
