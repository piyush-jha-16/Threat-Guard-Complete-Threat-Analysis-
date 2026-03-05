import React from 'react';
import IllustrationPanel from './IllustrationPanel';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen font-inter bg-[#fafafa] dark:bg-[#121212] transition-colors duration-200 w-full overflow-hidden relative">
            <IllustrationPanel />
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-4 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#fafafa] dark:bg-[#121212]">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
