// ── FDR Maturity Email Notification ──────────────────────────────────────────
import { formatBD, formatDate, isSameDay, parseDate } from "./fdrCalc";

export const EMAILJS_CONFIG = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID || "",
  templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "",
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "",
  toEmail: process.env.REACT_APP_NOTIFY_EMAIL || "hafizsakib5@gmail.com",
};

const SENT_KEY = "fdr_notif_sent_dates";
function getSentSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SENT_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function addToSentSet(key) {
  const set = getSentSet();
  set.add(key);
  localStorage.setItem(SENT_KEY, JSON.stringify([...set]));
}
function pruneOldEntries(todayStr) {
  try {
    const set = getSentSet();
    localStorage.setItem(
      SENT_KEY,
      JSON.stringify([...set].filter((k) => k.startsWith(todayStr))),
    );
  } catch {}
}

export function getMaturedToday(fdrs, today) {
  return fdrs.filter(
    (fdr) => fdr.cycleEnd && isSameDay(parseDate(fdr.cycleEnd), today),
  );
}

function buildEmailHtml(fdrs, today) {
  const dateLabel = today.toLocaleDateString("en-BD", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const accentColors = ["#2563eb", "#059669", "#d97706", "#db2777", "#7c3aed"];

  const cards = fdrs
    .map((fdr, i) => {
      const accent = accentColors[i % accentColors.length];
      const principal = fdr.cyclePrincipal || fdr.principal || 0;
      const gross = fdr.grossCycleInterest || 0;
      const tds = fdr.tdsThisCycle || 0;
      const net = fdr.netCycleInterest || 0;
      const matAmt = fdr.matAmt || 0;
      const cycleStart = fdr.cycleStart ? formatDate(fdr.cycleStart) : "—";
      const cycleEnd = fdr.cycleEnd ? formatDate(fdr.cycleEnd) : "—";
      const isRenewed = (fdr.completedCycles || 0) > 0;
      const cycleLabel = isRenewed
        ? `Auto-Renewal Cycle ${(fdr.completedCycles || 0) + 1}`
        : "Original Term";

      return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
  <!-- Card title bar -->
  <tr>
    <td style="background:#f8fafc;padding:14px 20px;border-bottom:2px solid ${accent};border-left:4px solid ${accent};">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <div style="color:#0f172a;font-size:17px;font-weight:800;">${fdr.label}</div>
          <div style="color:#64748b;font-size:11px;margin-top:3px;">${cycleLabel} &nbsp;·&nbsp; ${fdr.rate || 0}% p.a. &nbsp;·&nbsp; ${fdr.months || 0} months</div>
        </td>
        <td align="right">
          <div style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;">Maturity Amount</div>
          <div style="color:${accent};font-size:22px;font-weight:900;margin-top:2px;">Tk ${formatBD(matAmt)}</div>
        </td>
      </tr></table>
    </td>
  </tr>

  <!-- Dates row -->
  <tr>
    <td style="background:#ffffff;padding:12px 20px;border-bottom:1px solid #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="50%">
          <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Cycle Start</div>
          <div style="color:#334155;font-size:13px;font-weight:600;margin-top:3px;">${cycleStart}</div>
        </td>
        <td width="50%">
          <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Maturity Date</div>
          <div style="color:#334155;font-size:13px;font-weight:600;margin-top:3px;">${cycleEnd}</div>
        </td>
      </tr></table>
    </td>
  </tr>

  <!-- Breakdown table -->
  <tr>
    <td style="background:#ffffff;padding:0 20px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-top:4px;">
        <tr>
          <td style="padding:9px 0;color:#475569;border-bottom:1px solid #f1f5f9;">Principal</td>
          <td align="right" style="padding:9px 0;color:#1e40af;font-weight:700;border-bottom:1px solid #f1f5f9;">Tk ${formatBD(principal)}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;color:#475569;border-bottom:1px solid #f1f5f9;">Gross Interest</td>
          <td align="right" style="padding:9px 0;color:#92400e;font-weight:700;border-bottom:1px solid #f1f5f9;">Tk ${formatBD(gross)}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;color:#dc2626;border-bottom:1px solid #f1f5f9;">TDS Deducted <span style="color:#94a3b8;font-size:11px;">(10%)</span></td>
          <td align="right" style="padding:9px 0;color:#dc2626;font-weight:700;border-bottom:1px solid #f1f5f9;">− Tk ${formatBD(tds)}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;color:#475569;border-bottom:1px solid #f1f5f9;">Net Interest</td>
          <td align="right" style="padding:9px 0;color:#059669;font-weight:700;border-bottom:1px solid #f1f5f9;">Tk ${formatBD(net)}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:11px 10px;color:#0f172a;font-weight:800;font-size:14px;border-radius:6px;">Total Maturity Amount</td>
          <td align="right" style="padding:11px 10px;color:${accent};font-size:17px;font-weight:900;border-radius:6px;">Tk ${formatBD(matAmt)}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
    })
    .join("");

  // Grand total
  const totalPrincipal = fdrs.reduce(
    (s, f) => s + (f.cyclePrincipal || f.principal || 0),
    0,
  );
  const totalGross = fdrs.reduce((s, f) => s + (f.grossCycleInterest || 0), 0);
  const totalTds = fdrs.reduce((s, f) => s + (f.tdsThisCycle || 0), 0);
  const totalNet = fdrs.reduce((s, f) => s + (f.netCycleInterest || 0), 0);
  const totalMat = fdrs.reduce((s, f) => s + (f.matAmt || 0), 0);

  const grandTotal =
    fdrs.length > 1
      ? `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-radius:10px;overflow:hidden;border:1px solid #ddd6fe;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
  <tr><td style="background:#f5f3ff;padding:12px 20px;border-bottom:1px solid #ddd6fe;border-left:4px solid #7c3aed;">
    <span style="color:#5b21b6;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Grand Total — All ${fdrs.length} FDRs</span>
  </td></tr>
  <tr><td style="background:#ffffff;padding:0 20px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-top:4px;">
      <tr><td style="padding:9px 0;color:#475569;border-bottom:1px solid #f1f5f9;">Total Principal</td><td align="right" style="color:#1e40af;font-weight:700;border-bottom:1px solid #f1f5f9;">Tk ${formatBD(totalPrincipal)}</td></tr>
      <tr><td style="padding:9px 0;color:#475569;border-bottom:1px solid #f1f5f9;">Total Gross Interest</td><td align="right" style="color:#92400e;font-weight:700;border-bottom:1px solid #f1f5f9;">Tk ${formatBD(totalGross)}</td></tr>
      <tr><td style="padding:9px 0;color:#dc2626;border-bottom:1px solid #f1f5f9;">Total TDS Deducted</td><td align="right" style="color:#dc2626;font-weight:700;border-bottom:1px solid #f1f5f9;">− Tk ${formatBD(totalTds)}</td></tr>
      <tr><td style="padding:9px 0;color:#475569;border-bottom:1px solid #f1f5f9;">Total Net Interest</td><td align="right" style="color:#059669;font-weight:700;border-bottom:1px solid #f1f5f9;">Tk ${formatBD(totalNet)}</td></tr>
      <tr style="background:#f5f3ff;"><td style="padding:11px 10px;color:#0f172a;font-weight:800;font-size:14px;">Total Maturity Amount</td><td align="right" style="padding:11px 10px;color:#7c3aed;font-size:17px;font-weight:900;">Tk ${formatBD(totalMat)}</td></tr>
    </table>
  </td></tr>
</table>`
      : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:24px 16px;">

  <!-- HEADER -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <tr>
      <td style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:24px 24px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <div style="color:#ffffff;font-size:22px;font-weight:900;">🏦 FDR Maturity Alert</div>
            <div style="color:#bfdbfe;font-size:12px;margin-top:4px;">Fixed Deposit Receipt Dashboard</div>
          </td>
          <td align="right">
            <div style="background:#ffffff20;border:1px solid #ffffff30;border-radius:100px;padding:5px 14px;display:inline-block;">
              <span style="color:#ffffff;font-weight:700;font-size:12px;">🎯 ${fdrs.length} FDR${fdrs.length > 1 ? "s" : ""} Matured</span>
            </div>
          </td>
        </tr></table>
        <div style="margin-top:16px;background:#ffffff15;border-radius:8px;padding:10px 14px;display:inline-block;">
          <div style="color:#bfdbfe;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Maturity Date</div>
          <div style="color:#ffffff;font-size:15px;font-weight:800;margin-top:2px;">${dateLabel}</div>
        </div>
      </td>
    </tr>
    <!-- Action banner -->
    <tr>
      <td style="background:#eff6ff;padding:12px 24px;border-top:1px solid #bfdbfe;">
        <div style="color:#1e40af;font-size:12px;line-height:1.6;">
          ⚠️ <strong>Action Required:</strong> Contact your bank to <strong>withdraw, renew, or reinvest</strong> before auto-renewal on the next business day.
        </div>
      </td>
    </tr>
  </table>

  <!-- FDR CARDS -->
  ${cards}

  <!-- GRAND TOTAL -->
  ${grandTotal}
</div>
</body></html>`.trim();
}

// ── Main send function ────────────────────────────────────────────────────────
export async function sendMaturityNotifications(fdrs, today) {
  const { serviceId, templateId, publicKey, toEmail } = EMAILJS_CONFIG;

  if (!serviceId || !templateId || !publicKey) {
    console.warn("[FDR Notif] EmailJS not configured.");
    return { sent: false, count: 0, error: "EmailJS not configured" };
  }

  const matured = getMaturedToday(fdrs, today);
  if (matured.length === 0) return { sent: false, count: 0 };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  pruneOldEntries(todayStr);

  const unsent = matured.filter(
    (fdr) => !getSentSet().has(`${todayStr}::${fdr.id}`),
  );
  if (unsent.length === 0) return { sent: false, count: 0, alreadySent: true };

  const dateLabel = today.toLocaleDateString("en-BD", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const totalAmt = unsent.reduce((s, f) => s + (f.matAmt || 0), 0);
  const htmlBody = buildEmailHtml(unsent, today);

  console.log(
    `[FDR Notif] HTML size: ${(new Blob([htmlBody]).size / 1024).toFixed(1)} KB`,
  );

  const templateParams = {
    to_email: toEmail,
    to_name: "Hafiz Sakib",
    maturity_date: dateLabel,
    fdr_count: unsent.length,
    total_amount: `Tk ${formatBD(totalAmt)}`,
    html_content: htmlBody,
    subject: `🏦 FDR Maturity Alert — ${unsent.length} FDR${unsent.length > 1 ? "s" : ""} matured on ${dateLabel}`,
  };

  try {
    const emailjs = await import("@emailjs/browser");
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    unsent.forEach((fdr) => addToSentSet(`${todayStr}::${fdr.id}`));
    return { sent: true, count: unsent.length };
  } catch (err) {
    console.error("[FDR Notif] Email send failed:", err);
    const errMsg =
      err?.text ||
      err?.message ||
      (typeof err === "object" ? JSON.stringify(err) : String(err));
    return { sent: false, count: 0, error: errMsg };
  }
}
