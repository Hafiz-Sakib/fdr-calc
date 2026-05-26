// ── FDR Calculation Utilities ─────────────────────────────────────────────
// Bangladesh FDR banking logic:
//   • TDS (Tax Deducted at Source) = 10% on interest earned
//   • At every auto-renewal boundary:
//       newPrincipal = oldPrincipal + netInterest   (TDS deducted BEFORE renewal)
//   • New cycle starts the DAY AFTER the previous cycle's maturity date
//       e.g. cycle 1 ends 01.08.26 → cycle 2 starts 02.08.26
//   • "currentValue" = what you would withdraw today (cyclePrincipal + net accrued interest)
//   • "matAmt"       = what you receive at end of current cycle (cyclePrincipal + net cycle interest)
//   • "totalTDSPaid" = TDS from COMPLETED cycles only (excludes current cycle's TDS)
// ──────────────────────────────────────────────────────────────────────────

/** TDS rate (10%) */
export const TDS_RATE = 0.1;

// ── Formatting helpers ─────────────────────────────────────────────────────

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
    result = rem.slice(-2) + "," + result;
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

// ── Date helpers ───────────────────────────────────────────────────────────

/**
 * Add months to a date — calendar-safe (handles month-end overflow).
 * e.g. Jan 31 + 1 month → Feb 28/29 (not Mar 3)
 */
export function addMonths(date, months) {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  // If day overflowed into the next month, roll back to last day of target month
  if (d.getDate() < originalDay) {
    d.setDate(0); // day 0 = last day of previous month
  }
  return d;
}

/**
 * Add days to a date — returns a new Date.
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Parse "YYYY-MM-DD" string → Date (local midnight, no TZ shift).
 * Also accepts a Date object (returns it as-is).
 */
export function parseDate(str) {
  if (str instanceof Date) return str;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Compare two dates by calendar day only (ignores time).
 * Returns true if date a and date b are the same calendar date.
 */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Format date as DD.MM.YY
 */
export function formatDate(dateStr) {
  const d = parseDate(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

/**
 * Format date as DD Month YYYY
 */
export function formatDateLong(dateStr) {
  const d = parseDate(dateStr);
  return d.toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a duration in days as a readable string.
 * e.g. 65 days → "2mo 5d", 30 days → "1mo", 12 days → "12d"
 */
export function formatMonthsDays(totalDays) {
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  if (months > 0 && days > 0) return `${months}mo ${days}d`;
  if (months > 0) return `${months}mo`;
  return `${days}d`;
}

/**
 * Get duration in whole months between startDate and maturityDate.
 */
export function getDurationMonths(startDate, maturityDate) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  return (
    (mat.getFullYear() - start.getFullYear()) * 12 +
    (mat.getMonth() - start.getMonth())
  );
}

// ── Core interest primitives ───────────────────────────────────────────────

/**
 * Gross interest for one full cycle using simple interest.
 *   grossInterest = principal × (rate / 100) × (months / 12)
 */
export function cycleInterest(principal, ratePct, months) {
  return principal * (ratePct / 100) * (months / 12);
}

/**
 * Gross accrued interest for a partial period (elapsed days, 365-day year).
 *   accruedInterest = principal × (rate / 100) × (days / 365)
 */
export function accruedInterest(principal, ratePct, days) {
  return principal * (ratePct / 100) * (days / 365);
}

// ── TDS helpers ────────────────────────────────────────────────────────────

/**
 * TDS amount on a gross interest figure.
 *   tdsAmount = grossInterest × TDS_RATE  (10%)
 */
export function tdsOnInterest(grossInterest) {
  return grossInterest * TDS_RATE;
}

/**
 * Net interest after TDS deduction.
 *   netInterest = grossInterest × (1 − TDS_RATE)  (90%)
 */
export function netInterest(grossInterest) {
  return grossInterest * (1 - TDS_RATE);
}

/**
 * Net accrued interest for a partial period after TDS.
 *   netAccruedInterest = accruedInterest(principal, rate, days) × 0.90
 */
export function netAccruedInterest(principal, ratePct, days) {
  return netInterest(accruedInterest(principal, ratePct, days));
}

// ── Compounding engine ─────────────────────────────────────────────────────

/**
 * Walk through all COMPLETED renewal cycles up to (but not including)
 * the cycle that contains `today`.
 *
 * CYCLE DATE CONVENTION:
 *   • Cycle 1: startDate → firstMaturity          (original FDR dates)
 *   • Cycle 2: firstMaturity + 1 day → firstMaturity + 1 day + months
 *   • Cycle N: previous cycleEnd + 1 day → previous cycleEnd + 1 day + months
 *
 * This matches real bank behaviour: the maturity date belongs to the
 * ending cycle; the new cycle opens the next calendar day.
 *
 * TDS CONVENTION:
 *   • totalTDSPaid = sum of TDS from COMPLETED cycles only
 *   • tdsThisCycle = TDS for the current (possibly partial) cycle — kept separate
 *   • UI shows them independently so there is no double-count
 *
 * Returns:
 *   cycleNumber      — 1-based index of current (possibly partial) cycle
 *   cyclePrincipal   — net-compounded principal at the START of current cycle
 *   cycleStart       — Date: start of current cycle  (day after previous maturity)
 *   cycleEnd         — Date: maturity of current cycle
 *   completedCycles  — count of fully elapsed cycles before current
 *   totalTDSPaid     — cumulative TDS from completed cycles ONLY
 */
export function getCycleState(
  principal,
  ratePct,
  months,
  firstMaturity,
  today,
) {
  let cyclePrincipal = principal;
  // Cycle 1 start = firstMaturity minus one term (the original open date)
  let cycleStart = addMonths(firstMaturity, -months);
  let cycleEnd = new Date(firstMaturity); // cycle 1 ends on firstMaturity
  let completedCycles = 0;
  let totalTDSPaid = 0;

  // A cycle is "completed" when its maturity date is strictly in the past
  // (i.e. today is AFTER cycleEnd, meaning today > cycleEnd by at least 1 day)
  // Using isSameDay check: if today === cycleEnd, cycle is NOT yet completed.
  while (cycleEnd < today && !isSameDay(cycleEnd, today)) {
    const gross = cycleInterest(cyclePrincipal, ratePct, months);
    const tds = tdsOnInterest(gross);
    const net = netInterest(gross);

    // Accumulate TDS from this now-completed cycle
    totalTDSPaid += tds;
    // Roll principal forward using NET interest only
    cyclePrincipal = cyclePrincipal + net;

    // Next cycle starts the day AFTER this cycle's maturity
    // e.g. cycle 1 ends 01.08.26 → cycle 2 starts 02.08.26
    cycleStart = addDays(cycleEnd, 1);
    // Next cycle ends: cycleStart + term months (calendar-safe)
    cycleEnd = addMonths(cycleStart, months);
    completedCycles++;
  }

  return {
    cycleNumber: completedCycles + 1,
    cyclePrincipal, // net-compounded principal for the current cycle
    cycleStart, // start of current cycle (day after previous maturity)
    cycleEnd, // maturity of current cycle
    completedCycles,
    totalTDSPaid, // TDS from completed cycles ONLY — excludes current cycle
  };
}

// ── Main FDR calculator ────────────────────────────────────────────────────

/**
 * Calculate all display values for a single FDR.
 *
 * Cycle date rule:
 *   Cycle 1: startDate  → maturityDate           (original contract dates)
 *   Cycle 2: maturityDate + 1d → maturityDate + 1d + months
 *   ...and so on for every subsequent renewal.
 *
 * KEY FIX — maturity-day identity:
 *   When today === cycleEnd (the exact maturity/last day of any cycle),
 *   currentValue is set equal to matAmt. This ensures:
 *     • No floating-point day-counting gap on the final day
 *     • 100% progress + 0 days left → currentValue === matAmt exactly
 *
 * All monetary outputs are net of TDS:
 *   matAmt        — principal + net interest at end of CURRENT cycle
 *   currentValue  — cyclePrincipal + net accrued interest as of today
 *   tdsThisCycle  — TDS that WILL BE deducted at end of current cycle
 *   totalTDSPaid  — TDS already deducted across all COMPLETED cycles
 *
 * Returned shape (UI-compatible):
 *   { matAmt, currentValue, cyclePrincipal, cycleStart, cycleEnd,
 *     completedCycles, grossCycleInterest, tdsThisCycle, netCycleInterest,
 *     totalTDSPaid }
 */
export function calculateFDR(
  principal,
  months,
  ratePct,
  startDate,
  maturityDate,
  today,
) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);

  // ── Before FDR starts ──────────────────────────────────────────────────
  if (today < start) {
    const gross = cycleInterest(principal, ratePct, months);
    const tds = tdsOnInterest(gross);
    const net = netInterest(gross);
    return {
      matAmt: principal + net,
      currentValue: principal,
      cyclePrincipal: principal,
      cycleStart: start,
      cycleEnd: mat,
      completedCycles: 0,
      grossCycleInterest: gross,
      tdsThisCycle: tds,
      netCycleInterest: net,
      totalTDSPaid: 0,
    };
  }

  // ── During first cycle (today is on or after startDate, before maturityDate) ──
  // isSameDay(today, mat) falls through to the unified path below
  if (today < mat && !isSameDay(today, mat)) {
    const gross = cycleInterest(principal, ratePct, months);
    const tds = tdsOnInterest(gross);
    const net = netInterest(gross);
    const matAmt = principal + net;
    const daysElapsed = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    // ── Maturity-day identity: if today === cycleEnd, currentValue === matAmt ──
    const cycleTotalDays = Math.floor((mat - start) / (1000 * 60 * 60 * 24));
    const currentValue = (daysElapsed >= cycleTotalDays)
      ? matAmt
      : principal + netAccruedInterest(principal, ratePct, daysElapsed);
    return {
      matAmt,
      currentValue,
      cyclePrincipal: principal,
      cycleStart: start,
      cycleEnd: mat,
      completedCycles: 0,
      grossCycleInterest: gross,
      tdsThisCycle: tds,
      netCycleInterest: net,
      totalTDSPaid: 0,
    };
  }

  // ── On maturityDate itself OR Auto-renewed (today >= maturityDate) ──────
  // getCycleState walks all completed cycles with next-day start convention.
  // The isSameDay guard inside getCycleState ensures that if today === cycleEnd
  // of any renewal cycle, that cycle is treated as current (not completed).
  const state = getCycleState(principal, ratePct, months, mat, today);
  const {
    cyclePrincipal,
    cycleStart,
    cycleEnd,
    completedCycles,
    totalTDSPaid,
  } = state;

  // Interest components for the CURRENT (possibly partial) cycle
  const grossCycleInterest = cycleInterest(cyclePrincipal, ratePct, months);
  const tdsThisCycle = tdsOnInterest(grossCycleInterest);
  const netCycleInterest = netInterest(grossCycleInterest);

  // matAmt: full net payout when this cycle matures
  const matAmt = cyclePrincipal + netCycleInterest;

  // ── KEY FIX: Maturity-day identity ────────────────────────────────────
  // When today is exactly the last day of the current cycle,
  // currentValue must equal matAmt — no partial-day accrual calculation.
  // This fixes the Math.floor gap where daysInCycle = cycleTotalDays - 1
  // on the last day, causing a small but incorrect shortfall.
  let currentValue;
  if (isSameDay(today, cycleEnd)) {
    // Today IS the maturity date — full cycle interest has accrued
    currentValue = matAmt;
  } else {
    const daysInCycle = Math.floor((today - cycleStart) / (1000 * 60 * 60 * 24));
    currentValue = cyclePrincipal + netAccruedInterest(cyclePrincipal, ratePct, daysInCycle);
  }

  return {
    matAmt,
    currentValue,
    cyclePrincipal,
    cycleStart,
    cycleEnd,
    completedCycles,
    grossCycleInterest,
    tdsThisCycle,
    netCycleInterest,
    totalTDSPaid, // completed cycles only — tdsThisCycle is separate
  };
}

// ── Status & display helpers ───────────────────────────────────────────────

/**
 * Get FDR status string.
 * On maturityDate itself → 'Auto-Renewed' (cycle 2 has begun).
 */
export function getFDRStatus(startDate, maturityDate, today) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  if (today < start) return "Not Started";
  if (today < mat && !isSameDay(today, mat)) return "Running";
  return "Auto-Renewed";
}

/**
 * afterTDS — kept for backward UI compatibility.
 * In the new engine currentValue is already net of TDS.
 * This function is a no-op pass-through to avoid breaking any call-sites.
 */
export function afterTDS(_originalPrincipal, currentValue) {
  return currentValue;
}

/**
 * Get progress / days info for display.
 *
 * For Auto-Renewed FDRs the cycle dates from calculateFDR (already stored
 * on the fdr object) are used directly — no redundant recomputation.
 *
 * Returns:
 *   label           — human-readable string
 *   days            — days remaining in current cycle
 *   percent         — elapsed % within current cycle
 *   renewedPercent  — same as percent (alias for Auto-Renewed)
 *   renewalStart    — Date: current cycle start
 *   nextMaturity    — Date: current cycle end
 *   overdueDays     — total days since original maturityDate
 *   completedCycles — completed auto-renewal cycles
 */
export function getDaysInfo(startDate, maturityDate, today, fdrExtra) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  const status = getFDRStatus(startDate, maturityDate, today);

  if (status === "Not Started") {
    const days = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    return { label: `Starts in ${formatMonthsDays(days)}`, days, percent: 0 };
  }

  if (status === "Running") {
    const total = Math.ceil((mat - start) / (1000 * 60 * 60 * 24));
    const elapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    const percent = Math.min(100, (elapsed / total) * 100);
    const remaining = Math.ceil((mat - today) / (1000 * 60 * 60 * 24));
    return {
      label: `${formatMonthsDays(remaining)} remaining`,
      days: remaining,
      percent,
    };
  }

  // Auto-Renewed — prefer pre-calculated values from calculateFDR on the fdr object
  const months = getDurationMonths(startDate, maturityDate);
  let cycleStart, cycleEnd, completedCycles;

  if (fdrExtra && fdrExtra.cycleStart && fdrExtra.cycleEnd) {
    cycleStart = parseDate(fdrExtra.cycleStart);
    cycleEnd = parseDate(fdrExtra.cycleEnd);
    completedCycles = fdrExtra.completedCycles || 0;
  } else {
    const state = getCycleState(
      fdrExtra?.principal || 0,
      fdrExtra?.rate || 0,
      months,
      mat,
      today,
    );
    cycleStart = state.cycleStart;
    cycleEnd = state.cycleEnd;
    completedCycles = state.completedCycles;
  }

  const totalCycleDays = Math.ceil(
    (cycleEnd - cycleStart) / (1000 * 60 * 60 * 24),
  );
  const elapsedInCycle = Math.max(
    0,
    Math.ceil((today - cycleStart) / (1000 * 60 * 60 * 24)),
  );
  // ── KEY FIX: On the exact maturity day, force 100% progress & 0 days left ──
  const isMaturityDay = isSameDay(today, cycleEnd);
  const renewedPercent = isMaturityDay ? 100 : Math.min(100, (elapsedInCycle / totalCycleDays) * 100);
  const overdueDays = Math.ceil((today - mat) / (1000 * 60 * 60 * 24));
  const remaining = isMaturityDay ? 0 : Math.max(0, Math.ceil((cycleEnd - today) / (1000 * 60 * 60 * 24)));

  return {
    label: `${formatMonthsDays(overdueDays)} past maturity`,
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
 * Generate a unique ID
 */
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Status color config
 */
export const STATUS_CONFIG = {
  Running: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  "Auto-Renewed": {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  "Not Started": {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
};
