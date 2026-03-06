// ─── Timezone Utility ───────────────────────────────────────────────────────
// Central source for timezone list + formatting helpers.
// The selected timezone is persisted in localStorage under the key 'timeZone'.

export interface TimezoneOption {
    value: string;   // IANA timezone identifier (e.g. "America/New_York") or "local"
    label: string;   // Human-readable label shown in the dropdown
    region: string;  // Grouping label for <optgroup>
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
    // ── System ─────────────────────────────────────────────────────────────────
    { value: 'local', label: 'Local (System Default)', region: 'System' },
    { value: 'UTC', label: 'UTC — Coordinated Universal Time', region: 'System' },

    // ── Americas ───────────────────────────────────────────────────────────────
    { value: 'America/New_York', label: 'Eastern Time — New York, Toronto', region: 'Americas' },
    { value: 'America/Chicago', label: 'Central Time — Chicago, Dallas', region: 'Americas' },
    { value: 'America/Denver', label: 'Mountain Time — Denver, Phoenix', region: 'Americas' },
    { value: 'America/Los_Angeles', label: 'Pacific Time — Los Angeles, Seattle', region: 'Americas' },
    { value: 'America/Anchorage', label: 'Alaska Time — Anchorage', region: 'Americas' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time — Honolulu', region: 'Americas' },
    { value: 'America/Sao_Paulo', label: 'BRT — São Paulo, Rio de Janeiro', region: 'Americas' },
    { value: 'America/Argentina/Buenos_Aires', label: 'ART — Buenos Aires, Argentina', region: 'Americas' },
    { value: 'America/Mexico_City', label: 'CST — Mexico City', region: 'Americas' },
    { value: 'America/Toronto', label: 'EST — Toronto, Ottawa', region: 'Americas' },
    { value: 'America/Vancouver', label: 'PST — Vancouver', region: 'Americas' },
    { value: 'America/Bogota', label: 'COT — Bogotá, Colombia', region: 'Americas' },
    { value: 'America/Lima', label: 'PET — Lima, Peru', region: 'Americas' },
    { value: 'America/Santiago', label: 'CLT — Santiago, Chile', region: 'Americas' },

    // ── Europe ─────────────────────────────────────────────────────────────────
    { value: 'Europe/London', label: 'GMT/BST — London, Dublin, Lisbon', region: 'Europe' },
    { value: 'Europe/Paris', label: 'CET — Paris, Berlin, Rome, Madrid', region: 'Europe' },
    { value: 'Europe/Helsinki', label: 'EET — Helsinki, Kyiv, Athens', region: 'Europe' },
    { value: 'Europe/Moscow', label: 'MSK — Moscow, St. Petersburg', region: 'Europe' },
    { value: 'Europe/Istanbul', label: 'TRT — Istanbul, Ankara', region: 'Europe' },
    { value: 'Europe/Amsterdam', label: 'CET — Amsterdam, Brussels', region: 'Europe' },
    { value: 'Europe/Stockholm', label: 'CET — Stockholm, Oslo, Copenhagen', region: 'Europe' },
    { value: 'Europe/Warsaw', label: 'CET — Warsaw, Prague, Budapest', region: 'Europe' },
    { value: 'Europe/Zurich', label: 'CET — Zurich, Vienna, Geneva', region: 'Europe' },

    // ── Middle East & Africa ───────────────────────────────────────────────────
    { value: 'Asia/Dubai', label: 'GST — Dubai, Abu Dhabi (UAE)', region: 'Middle East & Africa' },
    { value: 'Asia/Riyadh', label: 'AST — Riyadh, Saudi Arabia', region: 'Middle East & Africa' },
    { value: 'Asia/Tehran', label: 'IRST — Tehran, Iran', region: 'Middle East & Africa' },
    { value: 'Asia/Jerusalem', label: 'IST — Jerusalem, Tel Aviv', region: 'Middle East & Africa' },
    { value: 'Africa/Cairo', label: 'EET — Cairo, Egypt', region: 'Middle East & Africa' },
    { value: 'Africa/Johannesburg', label: 'SAST — Johannesburg, South Africa', region: 'Middle East & Africa' },
    { value: 'Africa/Lagos', label: 'WAT — Lagos, Nigeria', region: 'Middle East & Africa' },
    { value: 'Africa/Nairobi', label: 'EAT — Nairobi, Kenya', region: 'Middle East & Africa' },

    // ── Asia & Pacific ─────────────────────────────────────────────────────────
    { value: 'Asia/Kolkata', label: 'IST — Mumbai, New Delhi, India', region: 'Asia & Pacific' },
    { value: 'Asia/Karachi', label: 'PKT — Karachi, Lahore, Pakistan', region: 'Asia & Pacific' },
    { value: 'Asia/Dhaka', label: 'BST — Dhaka, Bangladesh', region: 'Asia & Pacific' },
    { value: 'Asia/Colombo', label: 'SLST — Colombo, Sri Lanka', region: 'Asia & Pacific' },
    { value: 'Asia/Kathmandu', label: 'NPT — Kathmandu, Nepal', region: 'Asia & Pacific' },
    { value: 'Asia/Bangkok', label: 'ICT — Bangkok, Jakarta, Hanoi', region: 'Asia & Pacific' },
    { value: 'Asia/Singapore', label: 'SGT — Singapore, Kuala Lumpur', region: 'Asia & Pacific' },
    { value: 'Asia/Shanghai', label: 'CST — Beijing, Shanghai, China', region: 'Asia & Pacific' },
    { value: 'Asia/Hong_Kong', label: 'HKT — Hong Kong', region: 'Asia & Pacific' },
    { value: 'Asia/Taipei', label: 'CST — Taipei, Taiwan', region: 'Asia & Pacific' },
    { value: 'Asia/Seoul', label: 'KST — Seoul, South Korea', region: 'Asia & Pacific' },
    { value: 'Asia/Tokyo', label: 'JST — Tokyo, Osaka, Japan', region: 'Asia & Pacific' },
    { value: 'Asia/Kabul', label: 'AFT — Kabul, Afghanistan', region: 'Asia & Pacific' },
    { value: 'Asia/Tashkent', label: 'UZT — Tashkent, Uzbekistan', region: 'Asia & Pacific' },
    { value: 'Australia/Sydney', label: 'AEDT — Sydney, Melbourne', region: 'Asia & Pacific' },
    { value: 'Australia/Perth', label: 'AWST — Perth', region: 'Asia & Pacific' },
    { value: 'Pacific/Auckland', label: 'NZDT — Auckland, New Zealand', region: 'Asia & Pacific' },
    { value: 'Pacific/Fiji', label: 'FJT — Suva, Fiji', region: 'Asia & Pacific' },
];

// Returns the stored IANA timezone (or Intl default if 'local')
export function getStoredTimezone(): string {
    const stored = localStorage.getItem('timeZone') || 'local';
    if (stored === 'local') {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return stored;
}

// Format a Date object (or ISO string) using the user's selected timezone
export function formatDateTime(
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
): string {
    const tz = getStoredTimezone();
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        ...options,
    }).format(d);
}

// Format just the time part
export function formatTime(date: Date | string | number): string {
    return formatDateTime(date, {
        year: undefined,
        month: undefined,
        day: undefined,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
}

// Format just the date part
export function formatDate(date: Date | string | number): string {
    return formatDateTime(date, {
        hour: undefined,
        minute: undefined,
        second: undefined,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });
}

// Get current time in user's timezone as a formatted string
export function getCurrentTimeInTimezone(): string {
    return formatDateTime(new Date());
}

// Get the UTC offset label for a given IANA timezone
export function getUTCOffset(tz: string): string {
    try {
        const resolved = tz === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz;
        const now = new Date();
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(now.toLocaleString('en-US', { timeZone: resolved }));
        const diffMin = (tzDate.getTime() - utcDate.getTime()) / 60000;
        const sign = diffMin >= 0 ? '+' : '-';
        const abs = Math.abs(diffMin);
        const h = String(Math.floor(abs / 60)).padStart(2, '0');
        const m = String(abs % 60).padStart(2, '0');
        return `UTC${sign}${h}:${m}`;
    } catch {
        return 'UTC';
    }
}
