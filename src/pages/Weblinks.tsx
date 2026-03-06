import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Globe2, Search, Loader2, AlertCircle, Link as LinkIcon, ShieldCheck,
    ShieldAlert, ShieldX, Lock, LockOpen, ExternalLink,
    Server, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp,
    RotateCcw, MapPin
} from 'lucide-react';
import { addScan } from '../lib/scanStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Threat {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
}
interface SSLInfo {
    valid?: boolean;
    issuer?: string;
    subject?: string;
    valid_from?: string;
    valid_until?: string;
    days_until_expiry?: number;
    expired?: boolean;
    expiring_soon?: boolean;
    tls_version?: string;
    san?: string[];
    error?: string;
    is_http?: boolean;
}
interface RedirectEntry { url: string; status: number; location?: string | null; }
interface RedirectInfo {
    final_url?: string;
    final_status?: number;
    redirect_count?: number;
    chain?: RedirectEntry[];
    cross_domain_redirect?: boolean;
    error?: string;
}
interface DNSInfo { A?: string[]; MX?: string[]; NS?: string[]; TXT?: string[]; }
interface WhoisInfo {
    registrar?: string;
    creation_date?: string;
    expiration_date?: string;
    country?: string;
    name_servers?: string[];
}
interface ScanResult {
    url: string;
    domain: string;
    ip?: string;
    scheme: string;
    status: 'safe' | 'suspicious' | 'malicious';
    safety_score: number;
    threats: Threat[];
    ssl: SSLInfo;
    redirects: RedirectInfo;
    dns: DNSInfo;
    whois: WhoisInfo;
    scanned_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SEVERITY_STYLES = {
    critical: { label: 'CRITICAL', text: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
    high:     { label: 'HIGH',     text: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
    medium:   { label: 'MEDIUM',   text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
    low:      { label: 'LOW',      text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-400' },
};

const STATUS_STYLES = {
    safe:       { label: 'Safe',       Icon: ShieldCheck,  color: '#0f8246', text: 'text-[#0f8246] dark:text-[#10b981]', bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800' },
    suspicious: { label: 'Suspicious', Icon: ShieldAlert,  color: '#d97706', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800' },
    malicious:  { label: 'Malicious',  Icon: ShieldX,      color: '#dc2626', text: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800' },
};

const SCAN_STEPS = [
    { label: 'Resolving Domain & DNS',         desc: 'Querying A, MX, NS, and TXT records.' },
    { label: 'Validating SSL Certificate',      desc: 'Verifying certificate chain and expiry.' },
    { label: 'Tracing Redirect Chain',          desc: 'Following all HTTP redirects to final URL.' },
    { label: 'Analysing Threat Patterns',       desc: 'Checking homograph, phishing, and brand abuse.' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ScoreRing: React.FC<{ score: number; color: string }> = ({ score, color }) => {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-[#27272a]" />
            <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 1.2s ease' }} />
            <text x="50" y="56" textAnchor="middle" style={{ fontSize: 20, fontWeight: 700, fill: color }}>{score}</text>
        </svg>
    );
};

const StatusDot: React.FC<{ active: boolean; done: boolean; isAnimating: boolean }> = ({ active, done, isAnimating }) => {
    if (done) return <CheckCircle2 size={16} className="text-[#0f8246] shrink-0" />;
    if (active && isAnimating) return <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse shrink-0" />;
    return <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-[#3f3f46] shrink-0" />;
};

const ThreatItem: React.FC<{ threat: Threat }> = ({ threat }) => {
    const [open, setOpen] = useState(false);
    const s = SEVERITY_STYLES[threat.severity] ?? SEVERITY_STYLES.low;
    return (
        <div className={`border rounded-lg overflow-hidden ${s.border}`}>
            <button onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left ${s.bg}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                    <span className="text-sm font-medium text-[#111827] dark:text-white truncate">{threat.type}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${s.text} ${s.bg} border ${s.border}`}>{s.label}</span>
                    {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
            </button>
            {open && (
                <div className="px-4 py-3 bg-white dark:bg-[#18181b] border-t border-gray-100 dark:border-[#27272a]">
                    <p className="text-xs text-gray-600 dark:text-[#a1a1aa] leading-relaxed">{threat.description}</p>
                </div>
            )}
        </div>
    );
};

const httpColor = (code: number) =>
    code < 300 ? 'text-[#0f8246]' : code < 400 ? 'text-amber-600' : 'text-red-500';

const RedirectChain: React.FC<{ redirects: RedirectInfo }> = ({ redirects }) => {
    if (!redirects.chain || redirects.chain.length === 0) {
        if (redirects.error) return <p className="text-xs text-gray-500 dark:text-[#a1a1aa]">{redirects.error}</p>;
        return <p className="text-xs text-gray-400 dark:text-[#71717a]">No redirect information available.</p>;
    }
    return (
        <div className="space-y-2">
            {redirects.chain.map((entry, i) => (
                <div key={i} className="flex items-start gap-2">
                    <div className="flex flex-col items-center gap-0.5 shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${entry.location === null ? 'bg-[#0f8246]/10 text-[#0f8246] border border-[#0f8246]/30' : 'bg-gray-100 dark:bg-[#27272a] text-gray-500 dark:text-[#a1a1aa] border border-gray-200 dark:border-[#3f3f46]'}`}>
                            {i + 1}
                        </div>
                        {i < redirects.chain!.length - 1 && <div className="w-px h-4 bg-gray-200 dark:bg-[#3f3f46]" />}
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                        <p className="text-xs text-[#111827] dark:text-[#d4d4d8] break-all leading-relaxed">{entry.url}</p>
                        <span className={`text-[11px] font-semibold ${httpColor(entry.status)}`}>
                            {entry.status} {entry.location === null ? '— Final destination' : '→ Redirect'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SSLCard: React.FC<{ ssl: SSLInfo; scheme: string }> = ({ ssl, scheme }) => {
    if (scheme === 'http') {
        return (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <LockOpen size={20} className="text-amber-600 shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">No Encryption (HTTP)</p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">Site does not use HTTPS — data is sent in plain text.</p>
                </div>
            </div>
        );
    }
    if (!ssl.valid) {
        return (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Certificate Invalid</p>
                    <p className="text-xs text-red-600/80 dark:text-red-500/80 mt-0.5">{ssl.error}</p>
                </div>
            </div>
        );
    }
    const expiryColor = ssl.expired ? 'text-red-600 dark:text-red-400' : ssl.expiring_soon ? 'text-amber-600 dark:text-amber-400' : 'text-[#0f8246] dark:text-[#10b981]';
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Lock size={16} className="text-[#0f8246] shrink-0" />
                <span className="text-sm font-medium text-[#0f8246] dark:text-[#10b981]">Valid SSL Certificate</span>
                {ssl.tls_version && <span className="ml-auto text-xs text-gray-500 dark:text-[#71717a] font-mono">{ssl.tls_version}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 dark:bg-[#27272a]/40 rounded-lg p-3">
                    <p className="text-gray-400 dark:text-[#71717a] uppercase tracking-wide mb-1">Issuer</p>
                    <p className="text-[#111827] dark:text-white font-medium truncate">{ssl.issuer || '—'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#27272a]/40 rounded-lg p-3">
                    <p className="text-gray-400 dark:text-[#71717a] uppercase tracking-wide mb-1">Subject</p>
                    <p className="text-[#111827] dark:text-white font-medium truncate">{ssl.subject || '—'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#27272a]/40 rounded-lg p-3">
                    <p className="text-gray-400 dark:text-[#71717a] uppercase tracking-wide mb-1">Valid From</p>
                    <p className="text-[#111827] dark:text-white font-medium">{ssl.valid_from || '—'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#27272a]/40 rounded-lg p-3">
                    <p className="text-gray-400 dark:text-[#71717a] uppercase tracking-wide mb-1">Expires</p>
                    <p className={`font-medium ${expiryColor}`}>{ssl.valid_until || '—'}{ssl.days_until_expiry !== undefined && !ssl.expired ? ` (${ssl.days_until_expiry}d)` : ''}</p>
                </div>
            </div>
        </div>
    );
};

// ─── Full results view ────────────────────────────────────────────────────────
const ScanResultView: React.FC<{ result: ScanResult; onReset: () => void }> = ({ result, onReset }) => {
    const s = STATUS_STYLES[result.status];
    const hasDNS = Object.values(result.dns || {}).some(v => (v as string[]).length > 0);
    const hasWhois = result.whois && Object.values(result.whois).some(v => v && (Array.isArray(v) ? v.length > 0 : true));
    const highestSeverity = result.threats.reduce<string | null>((acc, t) => {
        const order = ['critical', 'high', 'medium', 'low'];
        if (!acc) return t.severity;
        return order.indexOf(t.severity) < order.indexOf(acc) ? t.severity : acc;
    }, null);

    return (
        <div className="space-y-5 animation-fade-in">
            {/* Hero: status + score */}
            <div className={`rounded-[14px] border p-5 ${s.bg} ${s.border} flex flex-col sm:flex-row items-center gap-5`}>
                <div className="shrink-0">
                    <ScoreRing score={result.safety_score} color={s.color} />
                </div>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <s.Icon size={22} className={s.text} />
                        <span className={`text-xl font-bold ${s.text}`}>{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#a1a1aa] break-all mb-2">{result.url}</p>
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs">
                        <span className="bg-white dark:bg-[#27272a] border border-gray-200 dark:border-[#3f3f46] text-gray-600 dark:text-[#a1a1aa] px-2.5 py-1 rounded-full font-mono">{result.domain}</span>
                        {result.ip && <span className="bg-white dark:bg-[#27272a] border border-gray-200 dark:border-[#3f3f46] text-gray-600 dark:text-[#a1a1aa] px-2.5 py-1 rounded-full font-mono">{result.ip}</span>}
                        <span className={`px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${result.scheme === 'https' ? 'bg-green-100 dark:bg-green-900/30 text-[#0f8246]' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700'}`}>{result.scheme}</span>
                    </div>
                </div>
                <div className="flex flex-col items-stretch gap-2 shrink-0 w-full sm:w-auto">
                    <a href={result.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 text-xs bg-white dark:bg-[#27272a] border border-gray-200 dark:border-[#3f3f46] text-[#111827] dark:text-white px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3f3f46] transition-colors">
                        <ExternalLink size={13} /> Open URL
                    </a>
                    <button onClick={onReset}
                        className="flex items-center justify-center gap-1.5 text-xs bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                        <RotateCcw size={13} /> Scan New URL
                    </button>
                </div>
            </div>

            {/* Threats */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-[#111827] dark:text-white uppercase tracking-wider">Threats Detected</h3>
                    {result.threats.length > 0 && highestSeverity && (
                        <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded border ${SEVERITY_STYLES[highestSeverity as keyof typeof SEVERITY_STYLES]?.text} ${SEVERITY_STYLES[highestSeverity as keyof typeof SEVERITY_STYLES]?.bg} ${SEVERITY_STYLES[highestSeverity as keyof typeof SEVERITY_STYLES]?.border}`}>
                            {result.threats.length} {result.threats.length === 1 ? 'THREAT' : 'THREATS'}
                        </span>
                    )}
                </div>
                {result.threats.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <CheckCircle2 size={18} className="text-[#0f8246] shrink-0" />
                        <p className="text-sm text-[#0f8246] dark:text-[#10b981] font-medium">No threats detected. The URL passed all security checks.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {result.threats.map((t, i) => <ThreatItem key={i} threat={t} />)}
                    </div>
                )}
            </div>

            {/* SSL Certificate */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-5 shadow-sm">
                <h3 className="font-semibold text-sm text-[#111827] dark:text-white uppercase tracking-wider mb-4">SSL / TLS Certificate</h3>
                <SSLCard ssl={result.ssl} scheme={result.scheme} />
            </div>

            {/* Redirect Chain */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-[#111827] dark:text-white uppercase tracking-wider">Redirect Chain</h3>
                    {result.redirects.redirect_count !== undefined && (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${result.redirects.redirect_count === 0 ? 'text-gray-500 dark:text-[#a1a1aa] bg-gray-50 dark:bg-[#27272a] border-gray-200 dark:border-[#3f3f46]' : result.redirects.cross_domain_redirect ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'text-[#0f8246] bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
                            {result.redirects.redirect_count === 0 ? 'No redirects' : `${result.redirects.redirect_count} redirect${result.redirects.redirect_count > 1 ? 's' : ''}${result.redirects.cross_domain_redirect ? ' · Cross-domain' : ''}`}
                        </span>
                    )}
                </div>
                <RedirectChain redirects={result.redirects} />
            </div>

            {/* DNS + WHOIS */}
            {(hasDNS || hasWhois) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* DNS Records */}
                    {hasDNS && (
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Server size={15} className="text-gray-400" />
                                <h3 className="font-semibold text-sm text-[#111827] dark:text-white uppercase tracking-wider">DNS Records</h3>
                            </div>
                            <div className="space-y-2.5">
                                {(['A', 'MX', 'NS', 'TXT'] as const).map(type => {
                                    const vals = (result.dns as any)[type] as string[] | undefined;
                                    if (!vals || vals.length === 0) return null;
                                    return (
                                        <div key={type} className="flex gap-3">
                                            <span className="text-[10px] font-bold font-mono mt-0.5 w-6 shrink-0 text-gray-400 dark:text-[#71717a]">{type}</span>
                                            <div className="space-y-0.5 min-w-0">
                                                {vals.map((v, i) => <p key={i} className="text-xs text-[#111827] dark:text-[#d4d4d8] font-mono break-all leading-relaxed">{v}</p>)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* WHOIS */}
                    {hasWhois && (
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Info size={15} className="text-gray-400" />
                                <h3 className="font-semibold text-sm text-[#111827] dark:text-white uppercase tracking-wider">Domain Information</h3>
                            </div>
                            <div className="space-y-3 text-xs">
                                {result.whois.registrar && (
                                    <div className="flex gap-2">
                                        <span className="text-gray-400 dark:text-[#71717a] shrink-0 w-24">Registrar</span>
                                        <span className="text-[#111827] dark:text-[#d4d4d8] font-medium break-all">{result.whois.registrar}</span>
                                    </div>
                                )}
                                {result.whois.creation_date && (
                                    <div className="flex gap-2 items-center">
                                        <span className="text-gray-400 dark:text-[#71717a] shrink-0 w-24">Registered</span>
                                        <span className="text-[#111827] dark:text-[#d4d4d8] font-medium">{result.whois.creation_date}</span>
                                    </div>
                                )}
                                {result.whois.expiration_date && (
                                    <div className="flex gap-2">
                                        <span className="text-gray-400 dark:text-[#71717a] shrink-0 w-24">Expires</span>
                                        <span className="text-[#111827] dark:text-[#d4d4d8] font-medium">{result.whois.expiration_date}</span>
                                    </div>
                                )}
                                {result.whois.country && (
                                    <div className="flex gap-2 items-center">
                                        <span className="text-gray-400 dark:text-[#71717a] shrink-0 w-24">Country</span>
                                        <div className="flex items-center gap-1">
                                            <MapPin size={11} className="text-gray-400" />
                                            <span className="text-[#111827] dark:text-[#d4d4d8] font-medium">{result.whois.country}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const Weblinks: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [activeStep, setActiveStep] = useState(-1);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearTimers = () => {
        stepTimers.current.forEach(clearTimeout);
        stepTimers.current = [];
    };

    const startScan = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!trimmed) return;

        setIsScanning(true);
        setResult(null);
        setError(null);
        setActiveStep(0);

        // Animate steps client-side during the real API call
        const delays = [0, 800, 1600, 2400];
        delays.forEach((ms, i) => {
            const t = setTimeout(() => setActiveStep(i), ms);
            stepTimers.current.push(t);
        });

        const minDelay = new Promise<void>(res => {
            const t = setTimeout(res, 3200);
            stepTimers.current.push(t);
        });

        try {
            const [apiResult] = await Promise.all([
                fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/scan-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: trimmed }),
                }).then(async r => {
                    if (!r.ok) {
                        const data = await r.json().catch(() => ({}));
                        throw new Error(data.detail || `Server error: ${r.status}`);
                    }
                    return r.json() as Promise<ScanResult>;
                }),
                minDelay,
            ]);

            clearTimers();
            setActiveStep(SCAN_STEPS.length); // all done
            setResult(apiResult);

            // Record in scan history
            const highSeverity = apiResult.threats.some(t => t.severity === 'critical' || t.severity === 'high');
            addScan({
                fileName: apiResult.domain,
                type: 'Weblink',
                status: apiResult.status === 'safe' ? 'safe' : apiResult.status === 'malicious' ? 'malicious' : 'warning',
                severity: apiResult.threats.length === 0 ? 'clean' : (apiResult.threats[0].severity as any),
                threatsFound: apiResult.threats.map(t => t.type),
                rulesTriggered: [],
                message: `Safety score: ${apiResult.safety_score}/100 — ${apiResult.threats.length} threat(s) found.`,
                action: highSeverity ? 'Blocked' : apiResult.threats.length > 0 ? 'Flagged' : 'Allowed',
            });
        } catch (err: any) {
            clearTimers();
            setError(err.message?.includes('fetch') || err.message?.includes('Failed')
                ? 'Cannot connect to the backend. Ensure the server is running on port 8000.'
                : (err.message ?? 'Unknown error occurred.'));
        } finally {
            setIsScanning(false);
        }
    };

    const resetScan = () => {
        clearTimers();
        setUrl('');
        setResult(null);
        setError(null);
        setIsScanning(false);
        setActiveStep(-1);
    };

    useEffect(() => () => clearTimers(), []);

    return (
        <DashboardLayout>
            <div className="animation-fade-in space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">Web Analysis Engine</h1>
                        <p className="text-[#6b7280] dark:text-[#a1a1aa] text-sm mt-1">
                            Analyze URLs and comprehensive web networks for phishing attempts, malicious domains, and unsafe tracking.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Main Area ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Show scan form if no result yet */}
                        {!result && (
                            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-8 shadow-sm transition-colors duration-200">
                                <div className={`rounded-xl flex flex-col items-center justify-center gap-6 relative overflow-hidden transition-all duration-200 min-h-[300px] p-10 bg-gray-50 dark:bg-[#18181b]/50 border border-gray-200 dark:border-[#3f3f46]`}>
                                    <div className="flex flex-col items-center justify-center space-y-6 z-10 w-full max-w-xl">

                                        {/* State icon */}
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-sm transition-colors duration-300
                                            ${isScanning ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-[#27272a]'}`}>
                                            {isScanning
                                                ? <Loader2 size={36} className="text-blue-600 dark:text-blue-400 animate-spin" />
                                                : <Globe2 size={36} className="text-[#0f8246] dark:text-[#10b981]" strokeWidth={1.5} />}
                                        </div>

                                        <div className="text-center space-y-1 w-full">
                                            <p className="text-[#111827] dark:text-[#d4d4d8] font-semibold text-lg">
                                                {isScanning ? SCAN_STEPS[Math.min(activeStep, SCAN_STEPS.length - 1)]?.label + '...' : 'Enter a URL to analyze'}
                                            </p>
                                            {isScanning && (
                                                <p className="text-gray-500 dark:text-[#a1a1aa] text-sm break-all">{url}</p>
                                            )}
                                        </div>

                                        {/* Input form */}
                                        {!isScanning && (
                                            <form onSubmit={startScan} className="w-full flex flex-col space-y-4">
                                                <div className="relative w-full">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Search size={18} className="text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={url}
                                                        onChange={e => setUrl(e.target.value)}
                                                        placeholder="https://example.com"
                                                        className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#27272a]/50 border border-gray-300 dark:border-[#3f3f46] text-[#111827] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f8246]/50 focus:border-[#0f8246] transition-all shadow-sm"
                                                    />
                                                </div>
                                                <button type="submit" disabled={!url.trim()}
                                                    className="w-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-medium text-sm px-8 py-3.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
                                                    Analyze URL
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>

                                {/* Error state */}
                                {error && (
                                    <div className="mt-4 flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-red-700 dark:text-red-400">Analysis Failed</p>
                                            <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5">{error}</p>
                                        </div>
                                        <button onClick={resetScan} className="ml-auto text-xs text-red-500 hover:text-red-700 transition-colors shrink-0">Dismiss</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Scan results */}
                        {result && <ScanResultView result={result} onReset={resetScan} />}
                    </div>

                    {/* ── Side Panel ── */}
                    <div className="space-y-6">
                        {/* Analysis Steps */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Analysis Steps</h3>
                            <div className="space-y-4">
                                {SCAN_STEPS.map((step, i) => {
                                    const done = activeStep > i || !!result;
                                    const active = activeStep === i && isScanning;
                                    return (
                                        <div key={i} className="flex items-start gap-3">
                                            <StatusDot active={active} done={done} isAnimating={isScanning} />
                                            <div>
                                                <p className={`text-sm font-medium transition-colors ${done || active ? 'text-[#111827] dark:text-white' : 'text-gray-400 dark:text-[#52525b]'}`}>{step.label}</p>
                                                <p className="text-xs text-gray-400 dark:text-[#71717a] mt-0.5">{step.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Capabilities */}
                        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-[14px] p-6 shadow-sm transition-colors duration-200">
                            <h3 className="text-[#111827] dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">Capabilities</h3>
                            <ul className="space-y-3">
                                {[
                                    { Icon: ShieldCheck, label: 'SSL/TLS Certificate Validation', color: 'text-[#0f8246]', bg: 'bg-green-50 dark:bg-[#0f8246]/10', border: 'border-green-100 dark:border-[#0f8246]/20' },
                                    { Icon: LinkIcon,    label: 'Full Redirect Chain Tracing',     color: 'text-[#0f8246]', bg: 'bg-green-50 dark:bg-[#0f8246]/10', border: 'border-green-100 dark:border-[#0f8246]/20' },
                                    { Icon: Globe2,      label: 'Homograph Attack Detection',      color: 'text-[#0f8246]', bg: 'bg-green-50 dark:bg-[#0f8246]/10', border: 'border-green-100 dark:border-[#0f8246]/20' },
                                    { Icon: Server,      label: 'DNS & WHOIS Lookup',              color: 'text-[#0f8246]', bg: 'bg-green-50 dark:bg-[#0f8246]/10', border: 'border-green-100 dark:border-[#0f8246]/20' },
                                    { Icon: AlertCircle, label: 'Brand Impersonation Detection',   color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
                                    { Icon: Info,        label: 'Safety Score (0–100)',             color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
                                ].map(({ Icon, label, color, bg, border }, i) => (
                                    <li key={i} className="flex items-center text-sm text-[#4b5563] dark:text-[#d4d4d8]">
                                        <div className={`${bg} p-1.5 rounded-md mr-3 border ${border} shrink-0`}>
                                            <Icon size={15} className={color} />
                                        </div>
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Weblinks;
