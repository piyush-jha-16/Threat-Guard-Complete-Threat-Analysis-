import React, { useState } from 'react';
import { Loader2, Globe2, ShieldAlert } from 'lucide-react';

interface UrlScanEngineProps {
    onScan: (type: string, name: string) => void;
    isScanning: boolean;
}

const UrlScanEngine: React.FC<UrlScanEngineProps> = ({ onScan, isScanning }) => {
    const [url, setUrl] = useState('');

    const handleScan = () => {
        if (!url) return;
        onScan('URL', url);
        setUrl('');
    };

    return (
        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm flex-1 transition-colors duration-200 flex flex-col">
            <h2 className="text-[#111827] dark:text-white text-[16px] font-semibold tracking-wide mb-2 flex items-center">
                <Globe2 size={18} className="mr-2 text-[#0f8246]" />
                URL Scan Engine
            </h2>
            <p className="text-[#6b7280] dark:text-[#a1a1aa] text-[13px] mb-5">
                Instantly analyze suspicious links for phishing or malicious payloads.
            </p>

            <div className="flex-1 flex flex-col justify-center">
                <div className="border border-gray-200 dark:border-[#3f3f46] rounded-xl p-6 relative overflow-hidden bg-gray-50 dark:bg-[#18181b]/50 transition-colors duration-200 flex flex-col items-center">

                    <div className="w-full max-w-md space-y-5">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <ShieldAlert size={16} className="text-gray-400 dark:text-[#a1a1aa]" />
                            </div>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/verify-login?token=..."
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-[#3f3f46] rounded-lg bg-white dark:bg-[#27272a] text-[#111827] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0f8246] transition-colors text-[14px]"
                            />
                        </div>

                        <button
                            onClick={handleScan}
                            disabled={isScanning || !url}
                            className="w-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-medium text-[14px] px-8 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin text-[#0f8246]" />
                                    Analyzing Domain Reputation...
                                </>
                            ) : (
                                'Initiate URL Scan'
                            )}
                        </button>
                    </div>

                    {/* Small visual accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0f8246] opacity-[0.02] rounded-bl-[100px] pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default UrlScanEngine;
