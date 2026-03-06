// ─── PDF Report Generator ─────────────────────────────────────────────────────
// Uses jsPDF + jspdf-autotable to produce branded PDF reports.

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { get30DaySummary, severityLabel, type ScanRecord } from './scanStore';

// Brand colours
const GREEN = '#0f8246';
const DARK  = '#111827';
const GRAY  = '#6b7280';

// ── Helpers ───────────────────────────────────────────────────────────────────
function drawHeader(doc: jsPDF, title: string) {
    const pageW = doc.internal.pageSize.getWidth();

    // Dark top bar
    doc.setFillColor(DARK);
    doc.rect(0, 0, pageW, 22, 'F');

    // Green accent stripe
    doc.setFillColor(GREEN);
    doc.rect(0, 22, pageW, 3, 'F');

    // Logo text
    doc.setTextColor('#ffffff');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('ThreatGuard', 14, 14);

    doc.setTextColor('#10b981');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('PROFESSIONAL', 14, 19.5);

    // Report title (right-aligned)
    doc.setTextColor('#d1fae5');
    doc.setFontSize(9);
    doc.text(title, pageW - 14, 14, { align: 'right' });

    // Generated date
    doc.setTextColor('#6ee7b7');
    doc.setFontSize(7);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 14, 19.5, { align: 'right' });
}

function drawFooter(doc: jsPDF) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor('#f9fafb');
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    doc.setDrawColor('#e5e7eb');
    doc.line(0, pageH - 10, pageW, pageH - 10);
    doc.setTextColor(GRAY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('ThreatGuard Professional — Confidential Security Report', 14, pageH - 3.5);
    doc.text(`Page ${(doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()}`, pageW - 14, pageH - 3.5, { align: 'right' });
}

function statusLabel(status: ScanRecord['status']): string {
    if (status === 'safe') return 'CLEAN';
    if (status === 'malicious') return 'MALICIOUS';
    return 'WARNING';
}

function statusRgb(status: ScanRecord['status']): [number, number, number] {
    if (status === 'safe') return [22, 163, 74];
    if (status === 'malicious') return [220, 38, 38];
    return [217, 119, 6];
}

// ── Single-Scan PDF ───────────────────────────────────────────────────────────
/** Download a PDF for one individual scan result. */
export interface SingleScanInput {
    status: 'safe' | 'warning' | 'malicious';
    threatsFound: string[];
    rulesTriggered: string[];
    message: string;
    fileName?: string;
    fileSize?: number;
    scanType?: string;
}

export function downloadSingleScanPDF(scan: SingleScanInput): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    drawHeader(doc, 'SCAN RESULT REPORT');

    let y = 32;

    // ── Status badge ──────────────────────────────────────────────────────────
    const [r, g, b] = statusRgb(scan.status);
    doc.setFillColor(r, g, b);
    doc.roundedRect(14, y, pageW - 28, 16, 3, 3, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const statusStr = statusLabel(scan.status);
    const statusIcon = scan.status === 'safe' ? '✓' : scan.status === 'malicious' ? '✕' : '⚠';
    doc.text(`${statusIcon}  ${statusStr}`, pageW / 2, y + 10.5, { align: 'center' });
    y += 24;

    // ── Details table ─────────────────────────────────────────────────────────
    doc.setTextColor(DARK);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Scan Details', 14, y);
    y += 4;

    const detailRows: [string, string][] = [
        ['File Name',  scan.fileName  || 'N/A'],
        ['Scan Type',  scan.scanType  || 'Document'],
        ['Status',     statusLabel(scan.status)],
        ['Timestamp',  new Date().toLocaleString()],
    ];
    if (scan.fileSize !== undefined) {
        const kb = (scan.fileSize / 1024).toFixed(1);
        detailRows.push(['File Size', `${kb} KB`]);
    }

    autoTable(doc, {
        startY: y,
        head: [],
        body: detailRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: '#f9fafb', textColor: DARK, cellWidth: 45 },
            1: { textColor: DARK },
        },
        margin: { left: 14, right: 14 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // ── Analysis message ──────────────────────────────────────────────────────
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(DARK);
    doc.text('Analysis Summary', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(GRAY);
    const msgLines = doc.splitTextToSize(scan.message, pageW - 28);
    doc.text(msgLines, 14, y);
    y += msgLines.length * 5 + 6;

    // ── Threats found ─────────────────────────────────────────────────────────
    if (scan.threatsFound.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#991b1b');
        doc.text(`Detected Threats (${scan.threatsFound.length})`, 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [['#', 'Threat Description']],
            body: scan.threatsFound.map((t, i) => [String(i + 1), t]),
            theme: 'striped',
            headStyles: { fillColor: '#991b1b', textColor: '#ffffff', fontSize: 8, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 12, halign: 'center' } },
            margin: { left: 14, right: 14 },
        });

        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    }

    // ── Rules triggered ───────────────────────────────────────────────────────
    if (scan.rulesTriggered.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#92400e');
        doc.text(`YARA Rules Triggered (${scan.rulesTriggered.length})`, 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [['Rule Name']],
            body: scan.rulesTriggered.map(r => [r]),
            theme: 'striped',
            headStyles: { fillColor: '#b45309', textColor: '#ffffff', fontSize: 8, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 3, font: 'courier' },
            margin: { left: 14, right: 14 },
        });
    }

    drawFooter(doc);
    const safeFileName = (scan.fileName || 'scan').replace(/[^a-z0-9_.-]/gi, '_');
    doc.save(`ThreatGuard_Report_${safeFileName}_${Date.now()}.pdf`);
}

// ── Full History Report PDF ───────────────────────────────────────────────────
/** Download a full history master report PDF (used from Reports page). */
export function downloadFullReportPDF(history: ScanRecord[]): void {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    drawHeader(doc, 'MASTER INTELLIGENCE REPORT');

    let y = 32;

    // ── 30-Day Summary boxes ──────────────────────────────────────────────────
    const summary = get30DaySummary();
    const total30 = summary.clean + summary.suspicious + summary.critical;

    const boxes = [
        { label: 'Clean Scans',      value: summary.clean,      color: '#16a34a' as const },
        { label: 'Suspicious',        value: summary.suspicious, color: '#d97706' as const },
        { label: 'Malicious',         value: summary.critical,   color: '#dc2626' as const },
        { label: 'Total (30 days)',   value: total30,            color: '#0f8246' as const },
    ];

    const boxW = (pageW - 28 - 9) / 4;
    boxes.forEach((box, i) => {
        const bx = 14 + i * (boxW + 3);
        doc.setFillColor('#f9fafb');
        doc.setDrawColor(box.color);
        doc.roundedRect(bx, y, boxW, 20, 2, 2, 'FD');
        doc.setTextColor(box.color);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(String(box.value), bx + boxW / 2, y + 11, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(GRAY);
        doc.text(box.label, bx + boxW / 2, y + 17, { align: 'center' });
    });

    y += 28;

    // ── History table ─────────────────────────────────────────────────────────
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(DARK);
    doc.text(`Scan History Log  (${history.length} records)`, 14, y);
    y += 4;

    autoTable(doc, {
        startY: y,
        head: [['#', 'File / Target', 'Type', 'Status', 'Severity', 'Action', 'Threats', 'Timestamp']],
        body: history.map((r, i) => [
            String(i + 1),
            r.fileName,
            r.type,
            statusLabel(r.status),
            severityLabel(r.severity),
            r.action,
            r.threatsFound.length > 0 ? r.threatsFound.join('\n') : '—',
            new Date(r.timestamp).toLocaleString(),
        ]),
        theme: 'striped',
        headStyles: {
            fillColor: DARK,
            textColor: '#ffffff',
            fontSize: 7.5,
            fontStyle: 'bold',
        },
        styles: { fontSize: 7, cellPadding: 2.5, overflow: 'linebreak' },
        columnStyles: {
            0:  { cellWidth: 10, halign: 'center' },
            1:  { cellWidth: 55 },
            2:  { cellWidth: 25 },
            3:  { cellWidth: 22 },
            4:  { cellWidth: 22 },
            5:  { cellWidth: 20 },
            6:  { cellWidth: 50 },
            7:  { cellWidth: 38 },
        },
        margin: { left: 14, right: 14 },
        didParseCell(data) {
            if (data.column.index === 3 && data.section === 'body') {
                const v = String(data.cell.raw);
                if (v === 'CLEAN')     { data.cell.styles.textColor = '#16a34a'; data.cell.styles.fontStyle = 'bold'; }
                if (v === 'MALICIOUS') { data.cell.styles.textColor = '#dc2626'; data.cell.styles.fontStyle = 'bold'; }
                if (v === 'WARNING')   { data.cell.styles.textColor = '#d97706'; data.cell.styles.fontStyle = 'bold'; }
            }
        },
        didDrawPage() {
            drawHeader(doc, 'MASTER INTELLIGENCE REPORT');
            drawFooter(doc);
        },
    });

    drawFooter(doc);
    doc.save(`ThreatGuard_MasterReport_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`);
}
