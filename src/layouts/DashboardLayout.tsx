import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#fafafa] dark:bg-[#121212] font-inter overflow-hidden transition-colors duration-200">
            {/* Mobile/Tablet overlay backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — drawer on mobile/tablet, static on desktop */}
            <div className={`
                fixed lg:static top-0 left-0 h-full z-40
                w-[240px] flex-shrink-0
                border-r border-gray-200 dark:border-[#1E1E1E]
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <div className="h-[64px] flex-shrink-0 border-b border-gray-200 dark:border-[#1E1E1E]">
                    <TopHeader onMenuToggle={() => setSidebarOpen(prev => !prev)} />
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
                    <div className="max-w-[1200px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
