// ── FDR Calculation Utilities ─────────────────────────────────────────────

/**
 * Format number in Bangladeshi style (e.g. 3,00,000)
 */
export function formatBD(amount) {
  const amt = Math.round(amount);
  const s = String(amt);
  if (s.length <= 3) return s;
  let result = s.slice(-3);
  let rem = s.slice(0, -3);
  while (rem.length > 0) {
    result = rem.slice(-2) + ',' + result;
    rem = rem.slice(0, -2);
  }
  return result;
}

/**
 * Format with Tk prefix
 */
export function formatTk(amount) {
  return `Tk ${formatBD(amount)}`;
}

/**
 * Calculate maturity amount (simple interest)
 */
export function maturityAmount(principal, ratePct, months) {
  return principal + principal * (ratePct / 100) * months / 12;
}

/**
 * Calculate accrued interest for given days
 */
export function accruedInterest(principal, ratePct, days) {
  return principal * (ratePct / 100) * days / 365;
}

/**
 * Get latest renewal date
 */
export function latestRenewalDate(firstMaturity, durationMonths, today) {
  let renewal = new Date(firstMaturity);
  while (true) {
    const nxt = addMonths(renewal, durationMonths);
    if (nxt > today) return renewal;
    renewal = nxt;
  }
}

/**
 * Add months to a date
 */
export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Parse "YYYY-MM-DD" string to Date
 */
export function parseDate(str) {
  if (str instanceof Date) return str;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Calculate FDR current value and maturity amount
 */
export function calculateFDR(principal, months, ratePct, startDate, maturityDate, today) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  const matAmt = maturityAmount(principal, ratePct, months);

  if (today < start) {
    return { matAmt, currentValue: principal };
  } else if (today < mat) {
    const days = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const current = principal + accruedInterest(principal, ratePct, days);
    return { matAmt, currentValue: current };
  } else {
    const renewal = latestRenewalDate(mat, months, today);
    const daysSince = Math.floor((today - renewal) / (1000 * 60 * 60 * 24));
    const current = matAmt + accruedInterest(matAmt, ratePct, daysSince);
    return { matAmt, currentValue: current };
  }
}

/**
 * Get FDR status
 */
export function getFDRStatus(startDate, maturityDate, today) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  if (today < start) return 'Not Started';
  if (today < mat) return 'Running';
  return 'Auto-Renewed';
}

/**
 * Calculate after-TDS values (10% TDS on interest only)
 */
export function afterTDS(principal, currentValue) {
  const interest = currentValue - principal;
  const tds = interest * 0.10;
  return currentValue - tds;
}

/**
 * Format date as DD.MM.YY
 */
export function formatDate(dateStr) {
  const d = parseDate(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

/**
 * Format date as DD Month YYYY
 */
export function formatDateLong(dateStr) {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Format a duration in months+days as a readable string.
 * e.g. 2 months 5 days → "2m 5d", 0 months 12 days → "12d"
 */
export function formatMonthsDays(totalDays) {
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  if (months > 0 && days > 0) return `${months}mo ${days}d`;
  if (months > 0) return `${months}mo`;
  return `${days}d`;
}

/**
 * Get days remaining or elapsed — with updated label logic:
 * - Running: "Xd remaining" shown as months+days
 * - Auto-Renewed: shows new period percent + overdue info in label
 * - Not Started: "Starts in Xd"
 *
 * Returns:
 *   label          — human-readable string shown under progress bar / in table
 *   days           — raw days (remaining for Running; elapsed in new period for Auto-Renewed)
 *   percent        — progress percent
 *   renewedPercent — for Auto-Renewed: percent elapsed in current renewal cycle
 *   renewalStart   — Date: when current cycle began (Auto-Renewed only)
 *   nextMaturity   — Date: when current cycle ends (Auto-Renewed only)
 *   overdueDays    — days since ORIGINAL maturity date (Auto-Renewed: after passes)
 */
export function getDaysInfo(startDate, maturityDate, today) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  const status = getFDRStatus(startDate, maturityDate, today);

  if (status === 'Not Started') {
    const days = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    return { label: `Starts in ${formatMonthsDays(days)}`, days, percent: 0 };
  } else if (status === 'Running') {
    const total = Math.ceil((mat - start) / (1000 * 60 * 60 * 24));
    const elapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    const percent = Math.min(100, (elapsed / total) * 100);
    const remaining = Math.ceil((mat - today) / (1000 * 60 * 60 * 24));
    return { label: `${formatMonthsDays(remaining)} remaining`, days: remaining, percent };
  } else {
    // Auto-Renewed
    const durationMonths = getDurationMonths(startDate, maturityDate);
    const renewal = latestRenewalDate(parseDate(maturityDate), durationMonths, today);
    const nextMat = addMonths(renewal, durationMonths);

    const total = Math.ceil((nextMat - renewal) / (1000 * 60 * 60 * 24));
    const elapsed = Math.ceil((today - renewal) / (1000 * 60 * 60 * 24));
    const renewedPercent = Math.min(100, (elapsed / total) * 100);

    // How long since ORIGINAL maturity date (total overdue)
    const overdueDays = Math.ceil((today - mat) / (1000 * 60 * 60 * 24));
    const overdueStr = formatMonthsDays(overdueDays);

    // Days remaining in current cycle
    const remaining = Math.ceil((nextMat - today) / (1000 * 60 * 60 * 24));

    return {
      label: `${overdueStr} past maturity`,
      days: remaining,
      percent: renewedPercent,
      renewedPercent,
      renewalStart: renewal,
      nextMaturity: nextMat,
      overdueDays,
    };
  }
}

export function getDurationMonths(startDate, maturityDate) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  return (mat.getFullYear() - start.getFullYear()) * 12 + (mat.getMonth() - start.getMonth());
}

/**
 * Generate unique ID
 */
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Status color config
 */
export const STATUS_CONFIG = {
  'Running':     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'Auto-Renewed': { bg: 'bg-blue-500/15',   text: 'text-blue-400',    border: 'border-blue-500/30',    dot: 'bg-blue-400'    },
  'Not Started':  { bg: 'bg-amber-500/15',  text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-400'   },
};
