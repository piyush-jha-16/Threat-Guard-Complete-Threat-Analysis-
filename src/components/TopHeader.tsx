import React, { useEffect, useState, useRef } from 'react';
import { Search, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { supabase } from '../lib/supabase';

const TopHeader: React.FC = () => {
    const [userName, setUserName] = useState<string>('Alex');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                setUserName(name);
            }
        };
        fetchUser();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        <header className="h-full px-6 flex items-center justify-between bg-white dark:bg-[#121212] text-[#111827] dark:text-white transition-colors duration-200">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative flex items-center">
                <Search size={16} className="absolute left-3 text-gray-400 dark:text-[#6b7280] pointer-events-none" />
                <input
                    type="text"
                    placeholder="Global search..."
                    className="w-full bg-transparent text-[14px] text-[#111827] dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#6b7280] pl-9 pr-4 py-2 focus:outline-none border-none"
                    spellCheck={false}
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3 sm:space-x-5">
                <ThemeToggle />

                <div className="h-5 w-[1px] bg-gray-200 dark:bg-[#1E1E1E]"></div>

                <div className="relative" ref={dropdownRef}>
                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=b6e3f4`}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#1E1E1E] bg-gray-100 dark:bg-[#1E1E1E] hover:ring-2 hover:ring-[#0f8246]/50 transition-all"
                        />
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-[#2A2A2A] mb-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                            </div>

                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    navigate('/settings');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] hover:text-[#111827] dark:hover:text-white transition-colors flex items-center"
                            >
                                <Settings size={14} className="mr-2" />
                                Settings
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center"
                            >
                                <LogOut size={14} className="mr-2" />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
