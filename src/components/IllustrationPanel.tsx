import React from 'react';

const IllustrationPanel: React.FC = () => {
    return (
        <div className="hidden lg:flex w-1/2 bg-[#f0f4f4] dark:bg-[#121212] flex-col justify-center items-center h-screen max-h-screen relative overflow-hidden transition-colors duration-200 border-r border-gray-200 dark:border-gray-800">
            {/* Background Glow effects for depth */}
            <div className="absolute top-[20%] left-[20%] w-[40rem] h-[40rem] bg-[#0f8246]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-[#0f8246]/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {/* 
                  Removed mix-blend modes as they cause grey bounding boxes on non-pure-black images in dark mode.
                  Relying purely on radial-gradient masking for the fade effect.
                */}
                <img
                    src="/cybersecurity-illustration.png"
                    alt="Cybersecurity Threat Monitoring"
                    className="w-full h-[90%] object-contain scale-110"
                    style={{
                        maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
                    }}
                />
            </div>
        </div>
    );
};

export default IllustrationPanel;
