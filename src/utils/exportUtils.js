import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBD, formatDate, afterTDS, getFDRStatus } from "./fdrCalc";

/**
 * Export FDR data to PDF — clean LaTeX-inspired style
 * Landscape A4, white background, simple bordered table, summary block below.
 */
export async function exportToPDF(fdrs, today) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(); // 297
  const pageH = doc.internal.pageSize.getHeight(); // 210

  // ── White background ──
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, "F");

  // ── Title block ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("Fixed Deposit Receipt (FDR) Summary", pageW / 2, 18, {
    align: "center",
  });

  // Horizontal rule under title (mimics \rule{0.7\textwidth}{1.2pt})
  const ruleW = pageW * 0.7;
  const ruleX = (pageW - ruleW) / 2;
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.6);
  doc.line(ruleX, 22, ruleX + ruleW, 22);

  // ── Sub-date line ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const dateStr = today.toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`As of ${dateStr}`, pageW / 2, 28, { align: "center" });

  // ── Compute totals ──
  let totalPrin = 0,
    totalMat = 0,
    totalCur = 0;
  fdrs.forEach((f) => {
    totalPrin += f.principal;
    totalMat += Math.round(f.matAmt);
    totalCur += Math.round(f.currentValue);
  });
  const totalGain = totalCur - totalPrin;
  const totalAfterTDS = Math.round(
    fdrs.reduce((s, f) => s + afterTDS(f.principal, f.currentValue), 0),
  );

  // ── Table ──
  const headers = [
    "FDR No.",
    "Amount (Tk)",
    "Duration",
    "Rate",
    "Approved Date",
    "Due Date",
    "Maturity Amount\n(After 10% TDS)",
    "Current Value\n(After 10% TDS)",
  ];

  const rows = fdrs.map((f) => {
    return [
      f.label,
      formatBD(f.principal),
      `${f.months} Months`,
      `${f.rate}%`,
      formatDate(f.startDate),
      formatDate(f.maturityDate),
      formatBD(Math.round(f.matAmt)),
      formatBD(Math.round(f.currentValue)),
    ];
  });

  // Total row — spans first 6 cols as "Total", then values
  rows.push([
    {
      content: "Total",
      colSpan: 6,
      styles: {
        halign: "center",
        fontStyle: "bold",
        fillColor: [240, 240, 240],
        textColor: [20, 20, 20],
      },
    },
    {
      content: formatBD(totalMat),
      styles: {
        fontStyle: "bold",
        halign: "right",
        fillColor: [240, 240, 240],
        textColor: [20, 20, 20],
      },
    },
    {
      content: formatBD(totalCur),
      styles: {
        fontStyle: "bold",
        halign: "right",
        fillColor: [240, 240, 240],
        textColor: [20, 20, 20],
      },
    },
  ]);

  const tableStartY = 33;

  autoTable(doc, {
    startY: tableStartY,
    head: [headers],
    body: rows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      textColor: [20, 20, 20],
      fillColor: [255, 255, 255],
      lineColor: [60, 60, 60],
      lineWidth: 0.25,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [20, 20, 20],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
      lineColor: [60, 60, 60],
      lineWidth: 0.25,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: "center" },
      1: { halign: "right" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "right" },
      7: { halign: "right" },
    },
    margin: { left: 12, right: 12 },
  });

  // ── Summary block below table ──
  const finalY = (doc.lastAutoTable.finalY || 120) + 10;

  const summaryItems = [
    { label: "Total Principal", value: `Tk ${formatBD(totalPrin)}` },
    { label: "Total Maturity", value: `Tk ${formatBD(totalMat)}` },
    { label: "Current Value", value: `Tk ${formatBD(totalCur)}` },
    { label: "Total Gain", value: `Tk ${formatBD(totalGain)}` },
    { label: "After 10% TDS", value: `Tk ${formatBD(totalAfterTDS)}` },
  ];

  // Draw summary as a compact horizontal strip
  const itemW = (pageW - 24) / summaryItems.length;
  const blockH = 18;
  const blockX0 = 12;

  summaryItems.forEach((item, i) => {
    const bx = blockX0 + i * itemW;

    // Box border
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.25);
    doc.setFillColor(248, 248, 248);
    doc.rect(bx, finalY, itemW, blockH, "FD");

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(item.label, bx + itemW / 2, finalY + 6, { align: "center" });

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(item.value, bx + itemW / 2, finalY + 14, { align: "center" });
  });

  // ── Footer note ──
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "* Interest calculated on simple basis  •  Auto-renewal assumed  •  10% TDS applied on interest portion  •  Confidential Report",
    pageW / 2,
    pageH - 5,
    { align: "center" },
  );

  const filename = `FDR_Summary_${today.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Export FDR data to CSV
 */
export function exportToCSV(fdrs, today) {
  const headers = [
    "FDR Label",
    "Principal (Tk)",
    "Term (Months)",
    "Rate (%)",
    "Start Date",
    "Maturity Date",
    "Maturity Amount (Tk)",
    "Current Value (Tk)",
    "Gain (Tk)",
    "After TDS (Tk)",
    "Status",
  ];

  const rows = fdrs.map((f) => {
    const status = getFDRStatus(f.startDate, f.maturityDate, today);
    const gain = Math.round(f.currentValue) - f.principal;
    const aTDS = afterTDS(f.principal, f.currentValue);
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
  const totalMat = fdrs.reduce((s, f) => s + Math.round(f.matAmt), 0);
  const totalCur = fdrs.reduce((s, f) => s + Math.round(f.currentValue), 0);
  const totalGain = totalCur - totalPrin;
  const totalTDS = fdrs.reduce(
    (s, f) => s + Math.round(afterTDS(f.principal, f.currentValue)),
    0,
  );

  rows.push([
    "TOTAL",
    totalPrin,
    "",
    "",
    "",
    "",
    totalMat,
    totalCur,
    totalGain,
    totalTDS,
    "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `FDR_Summary_${today.toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
