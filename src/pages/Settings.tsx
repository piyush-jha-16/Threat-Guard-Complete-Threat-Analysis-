import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { supabase } from '../lib/supabase';
import { User, Bell, Shield, Key, Globe, Check, AlertTriangle, Monitor, Save, Clock } from 'lucide-react';
import { TIMEZONE_OPTIONS, getUTCOffset } from '../lib/timezone';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>('');
    const [originalName, setOriginalName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Form states
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [timeZone, setTimeZone] = useState(localStorage.getItem('timeZone') || 'local');
    const [liveTime, setLiveTime] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                setUserName(name);
                setOriginalName(name);
                setEmail(user.email || '');
            }
        };
        fetchUser();
    }, []);

    // Live clock — updates every second in the selected timezone
    useEffect(() => {
        const tick = () => {
            const tz = timeZone === 'local'
                ? Intl.DateTimeFormat().resolvedOptions().timeZone
                : timeZone;
            const now = new Date();
            try {
                const formatted = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                }).format(now);
                setLiveTime(formatted);
            } catch {
                setLiveTime(now.toLocaleString());
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [timeZone]);

    const handleLogoutAll = async () => {
        try {
            // Logs out the user from the current session and all other active sessions across devices
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/');
        } catch (error: any) {
            console.error('Error logging out:', error.message);
        }
    };

    const handleSave = async () => {
        setPasswordError('');
        setIsSaving(true);
        let nameUpdated = false;

        // 1. Update Profile Name
        if (userName.trim() && userName !== originalName) {
            const { error: nameError } = await supabase.auth.updateUser({
                data: { full_name: userName.trim() }
            });

            if (nameError) {
                console.error("Name update error:", nameError);
                setSaveMessage("Failed to update name.");
                setIsSaving(false);
                return;
            }
            setOriginalName(userName.trim());
            nameUpdated = true;
        }

        // 2. Update Password
        if (newPassword) {
            if (newPassword.length < 6) {
                setPasswordError('Password must be at least 6 characters.');
                return;
            }
            if (newPassword !== confirmPassword) {
                setPasswordError('Passwords do not match.');
                return;
            }

            setIsSaving(true);
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                console.error("Supabase password update error:", error);
                setPasswordError("Failed: " + error.message);
                setIsSaving(false);
                return;
            }

            // Password changed successfully - force login with new password
            await supabase.auth.signOut();
            navigate('/', { replace: true });
            return;
        }

        // 3. Save Time Zone Preference
        localStorage.setItem('timeZone', timeZone);

        // Simulate remaining settings network request if only local preferences changed
        setTimeout(() => {
            setIsSaving(false);
            setSaveMessage(nameUpdated ? 'Profile & settings saved successfully' : 'Settings saved successfully');
            setTimeout(() => setSaveMessage(''), 3000);
        }, 800);
    };

    return (
        <DashboardLayout>
            <div className="w-full text-[#111827] dark:text-white transition-colors duration-200">
                {/* Page Header */}
                <div className="mb-8 mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                        <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight">
                            Platform Settings
                        </h1>
                        <p className="text-gray-500 dark:text-[#94a3b8] mt-1 text-sm">
                            Manage your account preferences, security configurations, and notifications.
                        </p>
                    </div>
                    {saveMessage && (
                        <div className="flex items-center text-sm text-[#0f8246] bg-[#d4ebd9] dark:bg-[#0f8246]/20 px-3 py-1.5 rounded-lg border border-[#0f8246]/30">
                            <Check size={16} className="mr-1.5" />
                            {saveMessage}
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Navigation Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'profile'
                                ? 'bg-[#0f8246] text-white shadow-md'
                                : 'hover:bg-gray-100 dark:hover:bg-[#1E1E1E] text-gray-600 dark:text-[#94a3b8] hover:text-[#111827] dark:hover:text-white'
                                }`}
                        >
                            <User size={18} className="mr-3" />
                            <span className="font-medium text-[15px]">Profile Overview</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'security'
                                ? 'bg-[#0f8246] text-white shadow-md'
                                : 'hover:bg-gray-100 dark:hover:bg-[#1E1E1E] text-gray-600 dark:text-[#94a3b8] hover:text-[#111827] dark:hover:text-white'
                                }`}
                        >
                            <Shield size={18} className="mr-3" />
                            <span className="font-medium text-[15px]">Security & Auth</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'notifications'
                                ? 'bg-[#0f8246] text-white shadow-md'
                                : 'hover:bg-gray-100 dark:hover:bg-[#1E1E1E] text-gray-600 dark:text-[#94a3b8] hover:text-[#111827] dark:hover:text-white'
                                }`}
                        >
                            <Bell size={18} className="mr-3" />
                            <span className="font-medium text-[15px]">Notifications</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'preferences'
                                ? 'bg-[#0f8246] text-white shadow-md'
                                : 'hover:bg-gray-100 dark:hover:bg-[#1E1E1E] text-gray-600 dark:text-[#94a3b8] hover:text-[#111827] dark:hover:text-white'
                                }`}
                        >
                            <Monitor size={18} className="mr-3" />
                            <span className="font-medium text-[15px]">Preferences</span>
                        </button>
                    </div>

                    {/* Settings Content Container */}
                    <div className="flex-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm p-6 sm:p-8 min-h-[500px]">

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">Personal Information</h2>
                                    <p className="text-sm text-gray-500 dark:text-[#94a3b8] mb-6">
                                        Update your personal details and how others see you on the platform.
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-[#0f8246] focus:border-transparent transition-all outline-none text-sm"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
                                        />
                                        <p className="text-[12px] text-gray-500 mt-1.5 flex items-center">
                                            <AlertTriangle size={12} className="mr-1 inline text-amber-500" />
                                            Email changes require verification for security purposes.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Role
                                        </label>
                                        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg inline-block text-sm font-medium border border-blue-200 dark:border-blue-800/30">
                                            Administrator
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">Security Settings</h2>
                                    <p className="text-sm text-gray-500 dark:text-[#94a3b8] mb-6">
                                        Manage your account security and authentication methods.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 sm:p-5 bg-gray-50 dark:bg-[#121212] rounded-xl border border-gray-100 dark:border-[#333]">
                                        <div className="flex items-start mb-4">
                                            <Key className="text-[#0f8246] mr-3 mt-0.5" size={20} />
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h3>
                                                <p className="text-xs text-gray-500 dark:text-[#94a3b8] mt-1">
                                                    Ensure your account is using a long, random password to stay secure.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pl-8">
                                            <div>
                                                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full sm:w-2/3 px-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#0f8246] focus:border-transparent transition-all outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full sm:w-2/3 px-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#0f8246] focus:border-transparent transition-all outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                            {passwordError && (
                                                <p className="text-sm text-red-500 flex items-center">
                                                    <AlertTriangle size={14} className="mr-1.5" />
                                                    {passwordError}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 bg-gray-50 dark:bg-[#121212] rounded-xl border border-gray-100 dark:border-[#333]">
                                        <div className="flex items-start">
                                            <Monitor className="text-[#0f8246] mr-4 mt-0.5" size={20} />
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
                                                <p className="text-xs text-gray-500 dark:text-[#94a3b8] mt-1 pr-4">
                                                    Manage and log out of your active sessions on other browsers and devices.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogoutAll}
                                            className="px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-[#444] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#333] transition-colors whitespace-nowrap text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                        >
                                            Log out all
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">Alert Preferences</h2>
                                    <p className="text-sm text-gray-500 dark:text-[#94a3b8] mb-6">
                                        Control how and when you receive Threat Guard alerts.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#2A2A2A]">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Threats Alert</h3>
                                            <p className="text-xs text-gray-500 dark:text-[#94a3b8] mt-0.5">Receive immediate emails for critical threats</p>
                                        </div>
                                        <button
                                            onClick={() => setEmailAlerts(!emailAlerts)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0f8246] focus:ring-offset-2 dark:focus:ring-offset-[#1A1A1A] ${emailAlerts ? 'bg-[#0f8246]' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#2A2A2A]">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                                            <p className="text-xs text-gray-500 dark:text-[#94a3b8] mt-0.5">Get desktop alerts for system events</p>
                                        </div>
                                        <button
                                            onClick={() => setPushNotifications(!pushNotifications)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0f8246] focus:ring-offset-2 dark:focus:ring-offset-[#1A1A1A] ${pushNotifications ? 'bg-[#0f8246]' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Weekly Summary Report</h3>
                                            <p className="text-xs text-gray-500 dark:text-[#94a3b8] mt-0.5">A digest of all scanning activity</p>
                                        </div>
                                        <button
                                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0f8246] focus:ring-offset-2 dark:focus:ring-offset-[#1A1A1A] bg-[#0f8246]"
                                        >
                                            <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">System Preferences</h2>
                                    <p className="text-sm text-gray-500 dark:text-[#94a3b8] mb-6">
                                        Customize your dashboard experience.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Language Focus
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center px-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-gray-50 dark:bg-[#121212]">
                                                <Globe size={16} className="text-gray-500 mr-2" />
                                                <span className="text-sm font-medium">English (US)</span>
                                            </div>
                                            <button className="text-sm text-[#0f8246] hover:underline">Change</button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Time Zone
                                        </label>

                                        {/* Grouped timezone dropdown */}
                                        <select
                                            value={timeZone}
                                            onChange={(e) => setTimeZone(e.target.value)}
                                            className="px-4 py-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-[#0f8246] focus:border-transparent transition-all outline-none text-sm w-full"
                                        >
                                            {Array.from(
                                                TIMEZONE_OPTIONS.reduce((map, tz) => {
                                                    if (!map.has(tz.region)) map.set(tz.region, []);
                                                    map.get(tz.region)!.push(tz);
                                                    return map;
                                                }, new Map<string, typeof TIMEZONE_OPTIONS>())
                                            ).map(([region, zones]) => (
                                                <optgroup key={region} label={`\u2500\u2500 ${region}`}>
                                                    {zones.map(tz => (
                                                        <option key={tz.value} value={tz.value}>
                                                            {tz.label}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>

                                        {/* Live clock preview */}
                                        <div className="mt-3 flex items-center gap-2.5 px-4 py-3 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-[#2A2A2A] rounded-xl">
                                            <Clock size={15} className="text-[#0f8246] flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-gray-500 dark:text-[#94a3b8] mb-0.5">
                                                    Current time in selected zone&nbsp;
                                                    <span className="font-mono text-[10px] bg-gray-200 dark:bg-[#2A2A2A] px-1.5 py-0.5 rounded">
                                                        {getUTCOffset(timeZone)}
                                                    </span>
                                                </p>
                                                <p className="text-sm font-mono font-medium text-[#0f8246] truncate">
                                                    {liveTime}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#2A2A2A] flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center px-6 py-2.5 bg-[#0f8246] hover:bg-[#0f8246]/90 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                ) : (
                                    <Save size={16} className="mr-2" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
