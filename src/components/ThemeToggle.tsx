import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Evaluate initial theme preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDark(true);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-transparent hover:bg-gray-100 dark:bg-transparent dark:hover:bg-[#2A2A2A] dark:text-gray-400 text-gray-500 transition-colors flex items-center justify-center border border-transparent"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun size={18} className="text-gray-300" />
            ) : (
                <Moon size={18} className="text-gray-600" />
            )}
        </button>
    );
};

export default ThemeToggle;
