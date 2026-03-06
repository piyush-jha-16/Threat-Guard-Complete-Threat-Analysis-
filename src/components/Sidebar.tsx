import React from 'react';
import {
    Home,
    FileText,
    Settings,
    Shield,
    LogOut,
    FileCode2,
    Globe2,
    Activity,
    AppWindow,
    Network,
    X
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/');
        } catch (error: any) {
            console.error('Error logging out:', error.message);
        }
    };

    return (
        <aside className="h-full flex flex-col bg-white dark:bg-[#121212] text-gray-500 dark:text-[#94a3b8] transition-colors duration-200">
            {/* Logo Area */}
            <div className="flex items-center justify-between px-6 h-[64px] mb-4 text-[#0a2e1d] dark:text-[#e2e8f0]">
                <div className="flex items-center space-x-2.5">
                    <Shield size={22} strokeWidth={2.5} className="text-[#103b26] drop-shadow-sm dark:text-white" style={{ fill: '#d4ebd9' }} />
                    <span className="text-[16px] font-semibold tracking-wide text-[#111827] dark:text-white">Threat Guard</span>
                </div>
                {/* Close button — only visible on mobile/tablet */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors"
                    aria-label="Close sidebar"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 space-y-1">
                <NavLink
                    to="/dashboard"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                            ? 'bg-gray-100 dark:bg-[#1E1E1E] text-[#111827] dark:text-white font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1E1E1E]/50 hover:text-[#111827] dark:hover:text-white'
                        }`
                    }
                >
                    <Home size={18} className="mr-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-[14px]">Dashboard</span>
                </NavLink>

                <NavLink
                    to="/document-scanning"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                            ? 'bg-gray-100 dark:bg-[#1E1E1E] text-[#111827] dark:text-white font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1E1E1E]/50 hover:text-[#111827] dark:hover:text-white'
                        }`
                    }
                >
                    <FileText size={18} className="mr-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-[14px]">Document Scanning</span>
                </NavLink>

                <NavLink
                    to="/weblinks"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                            ? 'bg-gray-100 dark:bg-[#1E1E1E] text-[#111827] dark:text-white font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1E1E1E]/50 hover:text-[#111827] dark:hover:text-white'
                        }`
                    }
                >
                    <Globe2 size={18} className="mr-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-[14px]">Weblinks</span>
                </NavLink>

                <NavLink
                    to="/executables"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                            ? 'bg-gray-100 dark:bg-[#1E1E1E] text-[#111827] dark:text-white font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1E1E1E]/50 hover:text-[#111827] dark:hover:text-white'
                        }`
                    }
                >
                    <FileCode2 size={18} className="mr-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-[14px]">Executable Files</span>
                </NavLink>

                <NavLink
                    to="/applications"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                            ? 'bg-gray-100 dark:bg-[#1E1E1E] text-[#111827] dark:text-white font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1E1E1E]/50 hover:text-[#111827] dark:hover:text-white'
                        }`
                    }
                >
                    <AppWindow size={18} className="mr-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-[14px]">Applications</span>
                </NavLink>

                <NavLink
                    to="/network-scanning"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                            ? 'bg-gray-100 dark:bg-[#1E1E1E] text-[#111827] dark:text-white font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1E1E1E]/50 hover:text-[#111827] dark:hover:text-white'
                        }`
                    }
                >
                    <Network size={18} className="mr-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-[14px]">Network Scanning</span>
                </NavLink>

                <NavLink
                    to="/reports"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                            ? 'bg-gray-100 dark:bg-[#1E1E1E] text-[#111827] dark:text-white font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1E1E1E]/50 hover:text-[#111827] dark:hover:text-white'
                        }`
                    }
                >
                    <Activity size={18} className="mr-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-[14px]">Reports</span>
                </NavLink>
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 mt-auto border-t border-gray-200 dark:border-[#1E1E1E] space-y-1">
                <NavLink
                    to="/settings"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                            ? 'bg-gray-100 dark:bg-[#1E1E1E] text-[#111827] dark:text-white font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1E1E1E]/50 hover:text-[#111827] dark:hover:text-white'
                        }`
                    }
                >
                    <Settings size={18} className="mr-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-[14px]">Settings</span>
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg transition-colors group text-[#ef4444] hover:bg-red-50 dark:hover:bg-[#ef4444]/10"
                >
                    <LogOut size={18} className="mr-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-[14px] font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
