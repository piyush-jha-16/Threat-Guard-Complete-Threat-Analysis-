import React from 'react';
// Icons are inlined as small SVGs for tighter theme control

const nodes = [
    { id: 'n1', x: 14, y: 25, size: 'h-4 w-4' },
    { id: 'n2', x: 28, y: 68, size: 'h-3 w-3' },
    { id: 'n3', x: 38, y: 44, size: 'h-5 w-5' },
    { id: 'n4', x: 52, y: 22, size: 'h-3 w-3' },
    { id: 'n5', x: 57, y: 62, size: 'h-4 w-4' },
    { id: 'n6', x: 72, y: 34, size: 'h-3 w-3' },
    { id: 'n7', x: 82, y: 56, size: 'h-5 w-5' },
];

const links = [
    [14, 25, 38, 44],
    [28, 68, 38, 44],
    [38, 44, 52, 22],
    [38, 44, 57, 62],
    [52, 22, 72, 34],
    [57, 62, 82, 56],
    [72, 34, 82, 56],
    [14, 25, 28, 68],
];

const IllustrationPanel: React.FC = () => {
    return (
        <div className="hidden lg:flex w-1/2 min-h-screen h-full relative overflow-hidden border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="absolute inset-0 bg-[linear-gradient(140deg,#ecf3f1_0%,#e3edea_45%,#edf4f1_100%)] dark:bg-[linear-gradient(145deg,#080b10_0%,#0c1016_50%,#0a0f12_100%)]" />
            <div className="absolute inset-0 opacity-60 dark:opacity-35 [background-image:linear-gradient(rgba(15,130,70,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(15,130,70,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
            <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-[#0f8246]/15 blur-[110px] dark:bg-[#12a35a]/20" />
            <div className="absolute -right-20 -bottom-20 h-[24rem] w-[24rem] rounded-full bg-[#66c58f]/20 blur-[120px] dark:bg-[#0f8246]/25" />

            <div className="relative z-10 absolute inset-0 p-6 min-h-screen bg-transparent overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(15,130,70,0.24)_0%,rgba(15,130,70,0.02)_55%,transparent_75%)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(38,196,116,0.2)_0%,rgba(11,18,28,0)_60%,transparent_75%)]" />

                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-[#0f8246]/35 dark:text-[#1bd07a]/40" preserveAspectRatio="none">
                    {links.map((line, idx) => (
                        <line
                            key={`line-${idx}`}
                            x1={line[0]}
                            y1={line[1]}
                            x2={line[2]}
                            y2={line[3]}
                            stroke="currentColor"
                            strokeWidth="0.35"
                        />
                    ))}
                </svg>

                {nodes.map((node) => (
                    <div
                        key={node.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        <div className={`${node.size} rounded-full bg-[#0f8246] dark:bg-[#27d67f] ring-4 ring-[#0f8246]/10 dark:ring-[#27d67f]/12 drop-shadow-[0_6px_20px_rgba(15,130,70,0.08)]`} />
                    </div>
                ))}

                {/* Domain-specific widgets arranged vertically to fill the card */}
                <div className="flex-1 flex flex-col justify-between relative">
                    {/* Top area: title / threat map small header */}
                    <div className="flex items-center justify-between w-full mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#eaf7ee] dark:bg-[#08302a] flex items-center justify-center text-[#0f8246] dark:text-[#7ff0b2]">TG</div>
                            <div>
                                <h4 className="text-sm font-semibold text-[#0f4e36] dark:text-[#d6fbe3]">Threat Map</h4>
                                <p className="text-xs text-[#547a67] dark:text-[#9fb4ca]">Live overview of active signals</p>
                            </div>
                        </div>
                        <div className="text-xs text-[#2d6b4f] dark:text-[#9fe9c7]">Updated: now</div>
                    </div>

                    {/* Middle: network canvas (nodes already positioned) */}
                    <div className="flex-1 flex items-center justify-center relative">
                        {/* nodes are rendered above via absolute positioning */}
                    </div>

                    {/* Bottom: stacked domain cards and activity */}
                    <div className="w-full grid grid-cols-3 gap-4 mt-6">
                        <div className="col-span-1 rounded-2xl border border-[#cde7da] dark:border-[#284560] bg-white/85 dark:bg-[#0b1722]/85 p-3 shadow-sm">
                            <p className="text-xs text-[#3b4d45] dark:text-[#9fb4ca]">Recent Analysis</p>
                            <ul className="mt-2 space-y-2">
                                <li className="text-[13px] font-medium text-[#0f8246] dark:text-[#7ff0b2]">KEYWORD_BITCOIN — 1 match</li>
                                <li className="text-[13px] text-[#556e60] dark:text-[#9fb4ca]">OFFICE_MACRO_VBA — 1 match</li>
                                <li className="text-[13px] text-[#556e60] dark:text-[#9fb4ca]">Heuristic Pattern — 1 match</li>
                            </ul>
                        </div>

                        <div className="col-span-1 rounded-2xl border border-[#cde7da] dark:border-[#284560] bg-white/85 dark:bg-[#0b1722]/85 p-3 shadow-sm">
                            <p className="text-xs text-[#3b4d45] dark:text-[#9fb4ca]">Scan Activity</p>
                            <div className="mt-2 space-y-1 text-[13px] text-[#556e60] dark:text-[#9fb4ca]">
                                <div>URL scan — example.com — Clean</div>
                                <div>Executable — invoice.exe — Malicious</div>
                                <div>Network — 192.168.1.0/24 — Suspicious</div>
                            </div>
                        </div>

                        <div className="col-span-1 rounded-2xl border border-[#cde7da] dark:border-[#284560] bg-white/85 dark:bg-[#0b1722]/85 p-3 shadow-sm flex flex-col justify-between">
                            <div>
                                <p className="text-xs text-[#3b4d45] dark:text-[#9fb4ca]">Exports</p>
                                <p className="text-2xl font-bold text-[#0f8246] dark:text-[#34de87]">PDF</p>
                                <p className="text-xs text-[#5f746a] dark:text-[#89a3bf]">Last exported 2h ago</p>
                            </div>
                            <button className="mt-3 bg-[#0f8246] dark:bg-[#1fc56f] text-white px-3 py-2 rounded-md text-sm">Export Report</button>
                        </div>
                    </div>
                </div>
                <div className="absolute left-[12%] top-[18%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#cde7da] dark:border-[#284560] bg-white/85 dark:bg-[#0b1722]/85 p-4 shadow-lg dark:shadow-black/30 w-40">
                    <div className="flex items-center gap-2 text-[#0d3d27] dark:text-[#b6f6d4]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#0f8246] dark:text-[#a6f3c2]"><path d="M3 7h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 11h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        <span className="text-xs font-semibold tracking-wide">URL Scan</span>
                    </div>
                    <p className="mt-2 text-[11px] text-[#475b4e] dark:text-[#9fb4ca]">Live URL reputation & analysis</p>
                </div>

                <div className="absolute left-[24%] bottom-[22%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#cde7da] dark:border-[#284560] bg-white/85 dark:bg-[#0b1722]/85 p-4 shadow-lg dark:shadow-black/30 w-44">
                    <div className="flex items-center gap-2 text-[#0d3d27] dark:text-[#b6f6d4]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#0f8246] dark:text-[#a6f3c2]"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M8 8h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        <span className="text-xs font-semibold tracking-wide">Executable</span>
                    </div>
                    <p className="mt-2 text-[11px] text-[#475b4e] dark:text-[#9fb4ca]">Binary heuristics & sandbox</p>
                </div>

                <div className="absolute right-[18%] top-[28%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#cde7da] dark:border-[#284560] bg-white/85 dark:bg-[#0b1722]/85 p-4 shadow-lg dark:shadow-black/30 w-44">
                    <div className="flex items-center gap-2 text-[#0d3d27] dark:text-[#b6f6d4]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#0f8246] dark:text-[#a6f3c2]"><path d="M12 2v20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M5 7h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        <span className="text-xs font-semibold tracking-wide">Network</span>
                    </div>
                    <p className="mt-2 text-[11px] text-[#475b4e] dark:text-[#9fb4ca]">Topology & traffic signals</p>
                </div>

                <div className="absolute right-[12%] bottom-[18%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#cde7da] dark:border-[#284560] bg-white/85 dark:bg-[#0b1722]/85 px-4 py-3 shadow-lg dark:shadow-black/30 w-44">
                    <p className="text-[11px] font-medium tracking-wide text-[#3b4d45] dark:text-[#9fb4ca]">Reports</p>
                    <p className="text-2xl font-bold text-[#0f8246] dark:text-[#34de87] leading-tight">PDF</p>
                    <p className="text-xs text-[#5f746a] dark:text-[#89a3bf]">Export & download</p>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/55 to-transparent dark:from-[#0f1722]/72 dark:to-transparent" />
            </div>
        </div>
    );
};

export default IllustrationPanel;
