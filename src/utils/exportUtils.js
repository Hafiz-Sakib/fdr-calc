import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatBD, formatDate, afterTDS, getFDRStatus } from './fdrCalc';

/**
 * Export FDR data to PDF using jsPDF
 * Note: Hind Siliguri is a Google Font; jsPDF uses built-in fonts.
 * We use Helvetica as the closest Latin equivalent and embed font data.
 */
export async function exportToPDF(fdrs, today) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── Background ──
  doc.setFillColor(6, 13, 26);
  doc.rect(0, 0, pageW, pageH, 'F');

  // ── Header bar ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 22, pageW, 1.2, 'F');

  // ── Left accent ──
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 3, pageH, 'F');

  // ── Title ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Fixed Deposit Summary Report', pageW / 2, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const dateStr = today.toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`As of ${dateStr}`, pageW / 2, 18, { align: 'center' });

  // ── Summary totals ──
  let totalPrin = 0, totalMat = 0, totalCur = 0;
  fdrs.forEach(f => {
    totalPrin += f.principal;
    totalMat  += Math.round(f.matAmt);
    totalCur  += Math.round(f.currentValue);
  });
  const totalGain    = totalCur - totalPrin;
  const totalAfterTDS = fdrs.reduce((s, f) => s + afterTDS(f.principal, f.currentValue), 0);

  // Summary row boxes
  const summaryY = 28;
  const boxW = (pageW - 16) / 5;
  const summaryItems = [
    { label: 'Total Principal', value: `Tk ${formatBD(totalPrin)}`, color: [255,255,255] },
    { label: 'Total Maturity',  value: `Tk ${formatBD(totalMat)}`,  color: [255,255,255] },
    { label: 'Current Value',   value: `Tk ${formatBD(totalCur)}`,  color: [96,165,250]  },
    { label: 'Total Gain',      value: `Tk ${formatBD(totalGain)}`, color: [52,211,153]  },
    { label: 'After 10% TDS',   value: `Tk ${formatBD(totalAfterTDS)}`, color: [251,191,36] },
  ];

  summaryItems.forEach((item, i) => {
    const x = 6 + i * (boxW + 1);
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(x, summaryY, boxW, 16, 2, 2, 'F');
    doc.setDrawColor(59, 130, 246, 0.3);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, summaryY, boxW, 16, 2, 2, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, x + boxW / 2, summaryY + 5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...item.color);
    doc.text(item.value, x + boxW / 2, summaryY + 12, { align: 'center' });
  });

  // ── Main Table ──
  const tableY = summaryY + 20;
  const headers = [
    'FDR', 'Principal (Tk)', 'Term', 'Rate', 'Start Date',
    'Maturity Date', 'Maturity Amt (Tk)', 'Current Value (Tk)', 'After TDS (Tk)', 'Status'
  ];

  const rows = fdrs.map(f => {
    const status = getFDRStatus(f.startDate, f.maturityDate, today);
    const aTDS = afterTDS(f.principal, f.currentValue);
    return [
      f.label,
      formatBD(f.principal),
      `${f.months} mo`,
      `${f.rate}%`,
      formatDate(f.startDate),
      formatDate(f.maturityDate),
      formatBD(Math.round(f.matAmt)),
      formatBD(Math.round(f.currentValue)),
      formatBD(Math.round(aTDS)),
      status,
    ];
  });

  // Total row
  rows.push([
    'TOTAL', formatBD(totalPrin), '', '', '', '',
    formatBD(totalMat), formatBD(Math.round(totalCur)),
    formatBD(Math.round(totalAfterTDS)), ''
  ]);

  autoTable(doc, {
    startY: tableY,
    head: [headers],
    body: rows,
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      textColor: [226, 232, 240],
      fillColor: [15, 23, 42],
      lineColor: [30, 41, 59],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      lineWidth: 0,
    },
    alternateRowStyles: {
      fillColor: [10, 17, 30],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [255,255,255] },
      7: { textColor: [96,165,250], fontStyle: 'bold' },
      8: { textColor: [251,191,36], fontStyle: 'bold' },
      9: { textColor: [52,211,153] },
    },
    didParseCell(data) {
      // Highlight total row
      if (data.row.index === rows.length - 1) {
        data.cell.styles.fillColor = [20, 30, 48];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [255, 255, 255];
      }
      // Status colors
      if (data.column.index === 9 && data.section === 'body') {
        const val = data.cell.raw;
        if (val === 'Running')       data.cell.styles.textColor = [52,211,153];
        if (val === 'Auto-Renewed')  data.cell.styles.textColor = [96,165,250];
        if (val === 'Not Started')   data.cell.styles.textColor = [251,191,36];
      }
    },
    margin: { left: 6, right: 6 },
    tableLineColor: [30, 41, 59],
    tableLineWidth: 0.3,
  });

  // ── Footer ──
  const finalY = doc.lastAutoTable.finalY || pageH - 15;
  doc.setFillColor(6, 13, 26);
  doc.rect(0, pageH - 10, pageW, 10, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    '* Interest calculated on simple basis  •  Auto-renewal assumed  •  10% TDS applied on interest portion  •  Confidential Report',
    pageW / 2, pageH - 4, { align: 'center' }
  );

  const filename = `FDR_Summary_${today.toISOString().slice(0,10)}.pdf`;
  doc.save(filename);
}

/**
 * Export FDR data to CSV
 */
export function exportToCSV(fdrs, today) {
  const headers = [
    'FDR Label', 'Principal (Tk)', 'Term (Months)', 'Rate (%)',
    'Start Date', 'Maturity Date', 'Maturity Amount (Tk)',
    'Current Value (Tk)', 'Gain (Tk)', 'After TDS (Tk)', 'Status'
  ];

  const rows = fdrs.map(f => {
    const status = getFDRStatus(f.startDate, f.maturityDate, today);
    const gain   = Math.round(f.currentValue) - f.principal;
    const aTDS   = afterTDS(f.principal, f.currentValue);
    return [
      f.label,
      f.principal,
      f.months,
      f.rate,
      formatDate(f.startDate),
      formatDate(f.maturityDate),
      Math.round(f.matAmt),
      Math.round(f.currentValue),
      gain,
      Math.round(aTDS),
      status,
    ];
  });

  // Totals
  const totalPrin = fdrs.reduce((s, f) => s + f.principal, 0);
  const totalMat  = fdrs.reduce((s, f) => s + Math.round(f.matAmt), 0);
  const totalCur  = fdrs.reduce((s, f) => s + Math.round(f.currentValue), 0);
  const totalGain = totalCur - totalPrin;
  const totalTDS  = fdrs.reduce((s, f) => s + Math.round(afterTDS(f.principal, f.currentValue)), 0);

  rows.push(['TOTAL', totalPrin, '', '', '', '', totalMat, totalCur, totalGain, totalTDS, '']);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob     = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url      = URL.createObjectURL(blob);
  const link     = document.createElement('a');
  link.href      = url;
  link.download  = `FDR_Summary_${today.toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
