import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatBD, formatDate } from './fdrCalc';

export function exportCSV(rows, today) {
  const headers = ['FDR', 'Principal (Tk)', 'Term (mo)', 'Rate (%)', 'Start Date', 'Maturity Date', 'Maturity Amount (Tk)', 'Current Value (Tk)', 'Gain (Tk)', 'Status'];
  const csvRows = rows.map(r => [
    r.label,
    r.principal,
    r.months,
    r.rate,
    formatDate(r.startDate),
    formatDate(r.maturityDate),
    Math.round(r.matAmt),
    Math.round(r.current),
    Math.round(r.current - r.principal),
    r.status.label
  ]);

  const totalPrin = rows.reduce((s, r) => s + r.principal, 0);
  const totalMat  = rows.reduce((s, r) => s + Math.round(r.matAmt), 0);
  const totalCur  = rows.reduce((s, r) => s + Math.round(r.current), 0);
  csvRows.push(['TOTAL', totalPrin, '', '', '', '', totalMat, totalCur, totalCur - totalPrin, '']);

  const content = [headers, ...csvRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FDR_Summary_${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(rows, today) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(7, 11, 20);
  doc.rect(0, 0, pageW, 297, 'F');

  // Top accent bar
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageW, 1.5, 'F');

  // Left accent bar
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 1.5, 210, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(232, 237, 245);
  doc.text('Fixed Deposit Portfolio', pageW / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Report generated: ${new Date(today).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageW / 2, 25, { align: 'center' });

  // Summary cards
  const totalPrin = rows.reduce((s, r) => s + r.principal, 0);
  const totalMat  = rows.reduce((s, r) => s + Math.round(r.matAmt), 0);
  const totalCur  = rows.reduce((s, r) => s + Math.round(r.current), 0);
  const totalGain = totalCur - totalPrin;

  const cards = [
    { label: 'Total Principal', value: `Tk ${formatBD(totalPrin)}`, color: [232, 237, 245] },
    { label: 'Total Maturity', value: `Tk ${formatBD(totalMat)}`, color: [232, 237, 245] },
    { label: 'Current Value', value: `Tk ${formatBD(totalCur)}`, color: [59, 130, 246] },
    { label: 'Total Gain', value: `Tk ${formatBD(totalGain)}`, color: [0, 245, 196] },
  ];

  const cardW = (pageW - 20) / 4;
  cards.forEach((card, i) => {
    const x = 10 + i * cardW;
    doc.setFillColor(13, 21, 38);
    doc.roundedRect(x, 30, cardW - 3, 22, 2, 2, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, 30, cardW - 3, 22, 2, 2, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + (cardW - 3) / 2, 37, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...card.color);
    doc.text(card.value, x + (cardW - 3) / 2, 46, { align: 'center' });
  });

  // Table
  const tableHeaders = ['FDR', 'Principal', 'Term', 'Rate', 'Start', 'Maturity', 'Mat. Amount', 'Current Value', 'Gain', 'Status'];
  const tableRows = rows.map(r => [
    r.label,
    `Tk ${formatBD(r.principal)}`,
    `${r.months} mo`,
    `${r.rate}%`,
    formatDate(r.startDate),
    formatDate(r.maturityDate),
    `Tk ${formatBD(r.matAmt)}`,
    `Tk ${formatBD(r.current)}`,
    `Tk ${formatBD(r.current - r.principal)}`,
    r.status.label
  ]);

  tableRows.push([
    'TOTAL', `Tk ${formatBD(totalPrin)}`, '', '', '', '',
    `Tk ${formatBD(totalMat)}`, `Tk ${formatBD(totalCur)}`, `Tk ${formatBD(totalGain)}`, ''
  ]);

  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 57,
    margin: { left: 10, right: 10 },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 4,
      textColor: [232, 237, 245],
      fillColor: [13, 21, 38],
      lineColor: [30, 50, 80],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [7, 11, 20],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      lineColor: [59, 130, 246],
      lineWidth: { bottom: 0.8 },
    },
    alternateRowStyles: { fillColor: [17, 28, 51] },
    didParseCell: (data) => {
      const isTotal = data.row.index === tableRows.length - 1;
      if (isTotal) {
        data.cell.styles.fillColor = [20, 37, 70];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [59, 130, 246];
      }
      if (data.column.index === 7 && !isTotal) {
        data.cell.styles.textColor = [59, 130, 246];
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 8 && !isTotal) {
        data.cell.styles.textColor = [0, 245, 196];
      }
    },
    foot: [],
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY || 150;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('* Interest calculated on simple basis • Auto-renewal assumed upon maturity', 10, finalY + 8);

  doc.setFillColor(59, 130, 246);
  doc.rect(0, 208.5, pageW, 1.5, 'F');

  doc.save(`FDR_Portfolio_${today}.pdf`);
}
