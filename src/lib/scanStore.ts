// ─── Shared Scan Store ───────────────────────────────────────────────────────
// Single source of truth for all scan results across the app.
// Persists to localStorage so data survives page refreshes.
// Any component can addScan(), subscribe to changes, and read stats.

export type ScanType = 'Document' | 'URL' | 'Network' | 'Executable' | 'Application' | 'Weblink';
export type ScanSeverity = 'clean' | 'low' | 'medium' | 'high' | 'critical';
export type ScanStatus = 'safe' | 'warning' | 'malicious';

export interface ScanRecord {
    id: string;
    fileName: string;
    type: ScanType;
    status: ScanStatus;
    severity: ScanSeverity;
    threatsFound: string[];
    rulesTriggered: string[];
    message: string;
    fileSize?: number;
    timestamp: string;    // ISO string
    action: string;       // 'Allowed' | 'Flagged' | 'Blocked'
}

// ── Persistence key ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'tg_scan_history';
const MAX_HISTORY = 200;

// ── Internal state ───────────────────────────────────────────────────────────
let _history: ScanRecord[] = [];
let _listeners: Array<() => void> = [];

// Load from localStorage on module initialisation
function _load(): void {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) _history = JSON.parse(raw) as ScanRecord[];
    } catch {
        _history = [];
    }
}

function _save(): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_history.slice(0, MAX_HISTORY)));
    } catch {
        // Storage quota exceeded – ignore
    }
}

function _notify(): void {
    _listeners.forEach(fn => fn());
}

// Initialise on import
_load();

// ── Public API ────────────────────────────────────────────────────────────────

/** Add a completed scan result and notify all subscribers. */
export function addScan(record: Omit<ScanRecord, 'id' | 'timestamp'>): ScanRecord {
    const full: ScanRecord = {
        ...record,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
    };
    _history = [full, ..._history].slice(0, MAX_HISTORY);
    _save();
    _notify();
    return full;
}

/** Subscribe to store changes. Returns an unsubscribe function. */
export function subscribe(fn: () => void): () => void {
    _listeners.push(fn);
    return () => {
        _listeners = _listeners.filter(l => l !== fn);
    };
}

/** Get a snapshot of the full scan history (newest-first). */
export function getHistory(): ScanRecord[] {
    return _history;
}

/** Aggregate dashboard stats. */
export function getStats(): { total: number; critical: number; threats: number } {
    const total = _history.length;
    const critical = _history.filter(s => s.severity === 'critical').length;
    const threats = _history.filter(s => s.status === 'malicious').length;
    return { total, critical, threats };
}

/** 30-day summary for Reports. */
export function get30DaySummary(): { clean: number; suspicious: number; critical: number } {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = _history.filter(s => new Date(s.timestamp).getTime() >= cutoff);
    return {
        clean: recent.filter(s => s.status === 'safe').length,
        suspicious: recent.filter(s => s.status === 'warning').length,
        critical: recent.filter(s => s.status === 'malicious').length,
    };
}

/** Clear all history (for testing / user reset). */
export function clearHistory(): void {
    _history = [];
    localStorage.removeItem(STORAGE_KEY);
    _notify();
}

// ── Severity helper ───────────────────────────────────────────────────────────
export function resolveSeverity(status: ScanStatus, threatsFound: string[]): ScanSeverity {
    if (status === 'safe') return 'clean';
    if (status === 'warning') return 'low';
    // malicious — try to extract severity from threat descriptions
    const joined = threatsFound.join(' ').toLowerCase();
    if (joined.includes('[critical]')) return 'critical';
    if (joined.includes('[high]')) return 'high';
    if (joined.includes('[medium]')) return 'medium';
    return 'low';
}

export function severityLabel(s: ScanSeverity): string {
    const map: Record<ScanSeverity, string> = {
        clean: 'Clean',
        low: 'Low Risk',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical',
    };
    return map[s];
}

export function actionFromStatus(status: ScanStatus, severity: ScanSeverity): string {
    if (status === 'safe') return 'Allowed';
    if (severity === 'critical' || severity === 'high') return 'Blocked';
    return 'Flagged';
}
