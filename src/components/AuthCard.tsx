import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ThemeToggle from './ThemeToggle';

const AuthCard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

    return (
        <div className="bg-white dark:bg-[#18181b] rounded-[14px] w-full border border-gray-100 dark:border-[#27272a] overflow-hidden transition-colors duration-200 relative" style={{ boxShadow: '0px 4px 20px -5px rgba(0,0,0,0.06)' }}>
            <div className="absolute top-4 right-4 sm:top-5 sm:right-6">
                <ThemeToggle />
            </div>
            <div className="p-7 pb-8 pt-9 sm:pt-10">
                <div className="flex flex-col items-center mb-7 space-y-2">
                    <div className="flex items-center space-x-2.5 mb-1.5 text-[#0a2e1d]">
                        <Shield size={26} strokeWidth={2.5} className="text-[#103b26] drop-shadow-sm" style={{ fill: '#d4ebd9' }} />
                        <span className="text-[20px] font-bold tracking-tight text-[#111827] dark:text-white leading-none">Threat Guard</span>
                    </div>
                    <h2 className="text-[24px] font-[600] text-[#111827] dark:text-white tracking-tight">
                        Secure Access
                    </h2>
                </div>

                <div className="flex w-full border-b border-gray-100 dark:border-[#27272a] mb-7 pt-1 relative">
                    <button
                        className={`flex-1 pb-[10px] text-[15px] font-[500] transition-colors relative z-10 ${activeTab === 'login'
                            ? 'text-[#0f8246]'
                            : 'text-[#6b7280] dark:text-[#a1a1aa] hover:text-[#111827] dark:hover:text-white'
                            }`}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                        {activeTab === 'login' && (
                            <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#0f8246]" />
                        )}
                    </button>
                    <button
                        className={`flex-1 pb-[10px] text-[15px] font-[500] transition-colors relative z-10 ${activeTab === 'signup'
                            ? 'text-[#0f8246]'
                            : 'text-[#6b7280] dark:text-[#a1a1aa] hover:text-[#111827] dark:hover:text-white'
                            }`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Sign Up
                        {activeTab === 'signup' && (
                            <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#0f8246]" />
                        )}
                    </button>
                </div>

                <div className="animation-fade-in transition-all">
                    {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
                </div>
            </div>
        </div>
    );
};

export default AuthCard;
