import React, { useState } from 'react';
import { KeyRound, User, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SignupForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Calculate generic password strength (0-4)
    const calculateStrength = (pass: string) => {
        let score = 0;
        if (!pass) return score;
        if (pass.length > 8) score += 1;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
        if (/\d/.test(pass)) score += 1;
        if (/[^a-zA-Z\d]/.test(pass)) score += 1;
        return score;
    };

    const strength = calculateStrength(password);

    const getStrengthBarColor = (index: number) => {
        if (strength === 0) return 'bg-gray-200 dark:bg-[#3f3f46]';
        if (index >= strength) return 'bg-gray-200 dark:bg-[#3f3f46]';
        if (strength === 1) return 'bg-red-500';
        if (strength === 2) return 'bg-yellow-500';
        if (strength === 3) return 'bg-blue-500';
        return 'bg-[#0f8246]';
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (strength < 2) {
            setError("Please choose a stronger password");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccessMessage("Registration successful! You can now log in.");
        }
        setLoading(false);
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <form className="space-y-3" onSubmit={handleSignup}>
            <div className="space-y-1">
                <label className="text-[13px] font-[500] text-[#111827] dark:text-white">
                    Full Name
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-[18px] w-[18px] text-[#9ca3af] dark:text-[#a1a1aa]" strokeWidth={2} />
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-[38px] pr-3 py-[9px] border border-gray-200 dark:border-[#3f3f46] rounded-lg bg-white dark:bg-[#27272a]/50 text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f8246]/20 focus:border-[#0f8246] transition-colors text-[14px] placeholder:text-[#9ca3af]"
                        placeholder="John Doe"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[13px] font-[500] text-[#111827] dark:text-white">
                    Email address
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <ShieldCheck className="h-[18px] w-[18px] text-[#9ca3af] dark:text-[#a1a1aa]" strokeWidth={2} />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-[38px] pr-3 py-[9px] border border-gray-200 dark:border-[#3f3f46] rounded-lg bg-white dark:bg-[#27272a]/50 text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f8246]/20 focus:border-[#0f8246] transition-colors text-[14px] placeholder:text-[#9ca3af]"
                        placeholder="john@example.com"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[13px] font-[500] text-[#111827] dark:text-white">
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <KeyRound className="h-[18px] w-[18px] text-[#9ca3af] dark:text-[#a1a1aa]" strokeWidth={2} />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-[38px] pr-3 py-[9px] border border-gray-200 dark:border-[#3f3f46] rounded-lg bg-white dark:bg-[#27272a]/50 text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f8246]/20 focus:border-[#0f8246] transition-colors text-xl placeholder:text-[14px] placeholder:tracking-normal placeholder:font-sans font-mono tracking-widest leading-none"
                        placeholder="••••••••"
                    />
                </div>
                {/* Password Strength Indicator */}
                <div className="flex items-center gap-2 pt-1 h-3">
                    <div className="flex gap-1 h-1 w-full">
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className={`h-full flex-1 rounded-full transition-colors ${getStrengthBarColor(index)}`}></div>
                        ))}
                    </div>
                    <div className="text-[11px] text-[#6b7280] dark:text-[#a1a1aa] w-16 text-right leading-none truncate">
                        {strength > 0 ? (strength === 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong') : ''}
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[13px] font-[500] text-[#111827] dark:text-white">
                    Confirm Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <KeyRound className="h-[18px] w-[18px] text-[#9ca3af] dark:text-[#a1a1aa]" strokeWidth={2} />
                    </div>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-[38px] pr-3 py-[9px] border border-gray-200 dark:border-[#3f3f46] rounded-lg bg-white dark:bg-[#27272a]/50 text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f8246]/20 focus:border-[#0f8246] transition-colors text-[14px] placeholder:text-[#9ca3af] tracking-widest"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div className="space-y-[14px] pt-3">
                {error && (
                    <div className="text-red-500 text-[13px] bg-red-50 dark:bg-red-500/10 p-2.5 rounded-lg border border-red-200 dark:border-red-500/20 leading-snug">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="text-[#0f8246] text-[13px] bg-[#0f8246]/10 p-2.5 rounded-lg border border-[#0f8246]/20 leading-snug">
                        {successMessage}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-[10px] px-4 border border-transparent rounded-lg shadow-sm text-[15px] font-[500] text-white bg-[#0f8246] hover:bg-[#0c6a39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f8246] transition-colors dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    className="w-full flex justify-center items-center py-[10px] px-4 border border-gray-200 dark:border-[#3f3f46] rounded-lg shadow-sm text-[15px] font-[500] text-[#111827] dark:text-white bg-white dark:bg-[#27272a]/50 hover:bg-gray-50 dark:hover:bg-[#3f3f46] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="h-[18px] w-[18px] mr-2.5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </button>
            </div>
        </form>
    );
};

export default SignupForm;
