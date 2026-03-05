import React from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#fafafa] dark:bg-[#121212] font-inter overflow-hidden transition-colors duration-200">
            {/* Sidebar */}
            <div className="w-[240px] flex-shrink-0 border-r border-gray-200 dark:border-[#1E1E1E]">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <div className="h-[64px] flex-shrink-0 border-b border-gray-200 dark:border-[#1E1E1E]">
                    <TopHeader />
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="max-w-[1200px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
