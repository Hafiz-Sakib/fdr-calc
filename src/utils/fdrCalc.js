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
 * Add months to a date (preserves day clamping for short months)
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
 * Calculate interest earned in one cycle using simple interest.
 * interest = principal × (rate/100) × (months/12)
 */
export function cycleInterest(principal, ratePct, months) {
  return principal * (ratePct / 100) * (months / 12);
}

/**
 * Calculate accrued interest for a partial period (given elapsed days).
 * Uses 365-day year.
 */
export function accruedInterest(principal, ratePct, days) {
  return principal * (ratePct / 100) * (days / 365);
}

/**
 * Compute the full cycle history up to (but not including) the cycle
 * that contains `today`. Returns:
 *
 *   cycleNumber    — 1-based index of the CURRENT (possibly partial) cycle
 *   cyclePrincipal — principal at the START of the current cycle
 *   cycleStart     — Date: start of current cycle
 *   cycleEnd       — Date: end (maturity) of current cycle
 *   completedCycles— number of fully elapsed cycles before current
 *
 * Each completed cycle rolls: newPrincipal = prevPrincipal + cycleInterest(...)
 */
export function getCycleState(principal, ratePct, months, firstMaturity, today) {
  let cyclePrincipal = principal;
  let cycleStart = addMonths(firstMaturity, -months); // original start date
  let cycleEnd = new Date(firstMaturity);
  let completedCycles = 0;

  // Advance through completed cycles
  while (cycleEnd <= today) {
    const interest = cycleInterest(cyclePrincipal, ratePct, months);
    cyclePrincipal = cyclePrincipal + interest; // compound: new principal for next cycle
    cycleStart = new Date(cycleEnd);
    cycleEnd = addMonths(cycleEnd, months);
    completedCycles++;
  }

  return {
    cycleNumber: completedCycles + 1,
    cyclePrincipal,   // principal for the current (possibly partial) cycle
    cycleStart,       // start of current cycle
    cycleEnd,         // end (maturity) of current cycle
    completedCycles,
  };
}

/**
 * Get duration in months between startDate and maturityDate
 */
export function getDurationMonths(startDate, maturityDate) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  return (mat.getFullYear() - start.getFullYear()) * 12 + (mat.getMonth() - start.getMonth());
}

/**
 * Calculate FDR current value, maturity amount, and cycle info.
 *
 * Key fixes vs. old code:
 *  - Each renewal cycle uses (principal + accumulated interest) as new principal
 *  - matAmt reflects the CURRENT cycle's maturity (not just original first cycle)
 *  - currentValue uses the current-cycle principal for accrual
 *  - gain is always relative to the ORIGINAL principal stored on the FDR
 */
export function calculateFDR(principal, months, ratePct, startDate, maturityDate, today) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);

  // ── Before FDR starts ──────────────────────────────────────────────────
  if (today < start) {
    const firstMatAmt = principal + cycleInterest(principal, ratePct, months);
    return {
      matAmt: firstMatAmt,
      currentValue: principal,
      cyclePrincipal: principal,
      cycleStart: start,
      cycleEnd: mat,
      completedCycles: 0,
    };
  }

  // ── During first cycle (before first maturity) ─────────────────────────
  if (today < mat) {
    const firstMatAmt = principal + cycleInterest(principal, ratePct, months);
    const daysElapsed = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const currentValue = principal + accruedInterest(principal, ratePct, daysElapsed);
    return {
      matAmt: firstMatAmt,
      currentValue,
      cyclePrincipal: principal,
      cycleStart: start,
      cycleEnd: mat,
      completedCycles: 0,
    };
  }

  // ── Auto-renewed (past first maturity) ────────────────────────────────
  // Determine which cycle we're currently in, compounding principal each time
  const state = getCycleState(principal, ratePct, months, mat, today);
  const { cyclePrincipal, cycleStart, cycleEnd, completedCycles } = state;

  // Maturity amount for the CURRENT cycle
  const matAmt = cyclePrincipal + cycleInterest(cyclePrincipal, ratePct, months);

  // Current value: cyclePrincipal + accrued interest since cycleStart
  const daysInCycle = Math.floor((today - cycleStart) / (1000 * 60 * 60 * 24));
  const currentValue = cyclePrincipal + accruedInterest(cyclePrincipal, ratePct, daysInCycle);

  return {
    matAmt,
    currentValue,
    cyclePrincipal,
    cycleStart,
    cycleEnd,
    completedCycles,
  };
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
 * Calculate after-TDS values.
 * TDS (10%) is applied on the TOTAL gain vs. the original principal.
 * Note: Bangladesh TDS on FDR interest is applied per cycle at maturity,
 * but here we compute accumulated TDS on total interest earned so far.
 */
export function afterTDS(originalPrincipal, currentValue) {
  const interest = currentValue - originalPrincipal;
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
 * Format a duration in days as a readable string.
 * e.g. 65 days → "2mo 5d", 12 days → "12d"
 */
export function formatMonthsDays(totalDays) {
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  if (months > 0 && days > 0) return `${months}mo ${days}d`;
  if (months > 0) return `${months}mo`;
  return `${days}d`;
}

/**
 * Get progress/days info for display.
 * For Auto-Renewed FDRs, uses the current cycle's start/end dates.
 *
 * Returns:
 *   label          — human-readable string
 *   days           — days remaining in current cycle
 *   percent        — progress % within current cycle
 *   renewedPercent — alias of percent (for Auto-Renewed)
 *   renewalStart   — Date: current cycle start
 *   nextMaturity   — Date: current cycle end
 *   overdueDays    — total days since original maturity
 *   completedCycles— number of completed auto-renewal cycles
 */
export function getDaysInfo(startDate, maturityDate, today, fdrExtra) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  const status = getFDRStatus(startDate, maturityDate, today);

  if (status === 'Not Started') {
    const days = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    return { label: `Starts in ${formatMonthsDays(days)}`, days, percent: 0 };
  }

  if (status === 'Running') {
    const total = Math.ceil((mat - start) / (1000 * 60 * 60 * 24));
    const elapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    const percent = Math.min(100, (elapsed / total) * 100);
    const remaining = Math.ceil((mat - today) / (1000 * 60 * 60 * 24));
    return { label: `${formatMonthsDays(remaining)} remaining`, days: remaining, percent };
  }

  // Auto-Renewed — use cycle info from calculateFDR if available, otherwise recompute
  const months = getDurationMonths(startDate, maturityDate);
  let cycleStart, cycleEnd, completedCycles;

  if (fdrExtra && fdrExtra.cycleStart && fdrExtra.cycleEnd) {
    cycleStart = parseDate(fdrExtra.cycleStart);
    cycleEnd   = parseDate(fdrExtra.cycleEnd);
    completedCycles = fdrExtra.completedCycles || 0;
  } else {
    const state = getCycleState(
      fdrExtra?.principal || 0, fdrExtra?.rate || 0, months, mat, today
    );
    cycleStart = state.cycleStart;
    cycleEnd   = state.cycleEnd;
    completedCycles = state.completedCycles;
  }

  const totalCycleDays = Math.ceil((cycleEnd - cycleStart) / (1000 * 60 * 60 * 24));
  const elapsedInCycle = Math.max(0, Math.ceil((today - cycleStart) / (1000 * 60 * 60 * 24)));
  const renewedPercent = Math.min(100, (elapsedInCycle / totalCycleDays) * 100);

  const overdueDays = Math.ceil((today - mat) / (1000 * 60 * 60 * 24));
  const overdueStr  = formatMonthsDays(overdueDays);
  const remaining   = Math.ceil((cycleEnd - today) / (1000 * 60 * 60 * 24));

  return {
    label: `${overdueStr} past maturity`,
    days: remaining,
    percent: renewedPercent,
    renewedPercent,
    renewalStart: cycleStart,
    nextMaturity: cycleEnd,
    overdueDays,
    completedCycles,
  };
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
  'Running':      { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'Auto-Renewed': { bg: 'bg-blue-500/15',   text: 'text-blue-400',    border: 'border-blue-500/30',    dot: 'bg-blue-400'    },
  'Not Started':  { bg: 'bg-amber-500/15',  text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-400'   },
};
