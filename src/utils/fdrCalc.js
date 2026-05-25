// ── FDR Calculation Utilities ─────────────────────────────────────────────
// Bangladesh FDR banking logic:
//   • TDS (Tax Deducted at Source) = 10% on interest earned
//   • At every auto-renewal boundary:
//       newPrincipal = oldPrincipal + netInterest   (TDS deducted BEFORE renewal)
//   • "currentValue" = what you would withdraw today (principal + net accrued interest)
//   • "matAmt"       = what you receive at end of current cycle (principal + net cycle interest)
// ──────────────────────────────────────────────────────────────────────────

/** TDS rate (10 %) */
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
 * Parse "YYYY-MM-DD" string → Date (local midnight, no TZ shift)
 */
export function parseDate(str) {
  if (str instanceof Date) return str;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
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
 * Get duration in whole months between startDate and maturityDate
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
 *   tdsAmount = grossInterest × TDS_RATE   (10 %)
 */
export function tdsOnInterest(grossInterest) {
  return grossInterest * TDS_RATE;
}

/**
 * Net interest after TDS deduction.
 *   netInterest = grossInterest × (1 − TDS_RATE)   (90 %)
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
 * KEY FIX: At each cycle boundary the principal is rolled with NET interest
 * (after TDS), matching real Bangladesh bank auto-renewal behaviour.
 *
 *   newPrincipal = oldPrincipal + netInterest(grossInterest)
 *
 * Returns:
 *   cycleNumber      — 1-based index of the current (possibly partial) cycle
 *   cyclePrincipal   — net-compounded principal at the START of current cycle
 *   cycleStart       — Date: start of current cycle
 *   cycleEnd         — Date: end (maturity) of current cycle
 *   completedCycles  — number of fully elapsed cycles before current
 *   totalTDSPaid     — cumulative TDS deducted across all completed cycles
 */
export function getCycleState(
  principal,
  ratePct,
  months,
  firstMaturity,
  today,
) {
  let cyclePrincipal = principal;
  let cycleStart = addMonths(firstMaturity, -months); // original open date
  let cycleEnd = new Date(firstMaturity);
  let completedCycles = 0;
  let totalTDSPaid = 0;

  // Advance through every cycle whose end date has already passed
  while (cycleEnd <= today) {
    const gross = cycleInterest(cyclePrincipal, ratePct, months);
    const tds = tdsOnInterest(gross);
    const net = netInterest(gross);

    totalTDSPaid += tds;
    cyclePrincipal = cyclePrincipal + net; // ← THE FIX: compound on NET only
    cycleStart = new Date(cycleEnd);
    cycleEnd = addMonths(cycleEnd, months);
    completedCycles++;
  }

  return {
    cycleNumber: completedCycles + 1,
    cyclePrincipal, // net-compounded principal for the current cycle
    cycleStart, // start of current cycle
    cycleEnd, // end (maturity) of current cycle
    completedCycles,
    totalTDSPaid,
  };
}

// ── Main FDR calculator ────────────────────────────────────────────────────

/**
 * Calculate all display values for a single FDR.
 *
 * All monetary values are net of TDS:
 *   • matAmt        — what you receive at end of CURRENT cycle (principal + net cycle interest)
 *   • currentValue  — withdrawable value right now (principal + net accrued interest today)
 *   • cyclePrincipal— compounded principal at start of current cycle (net-rolled)
 *
 * Returned shape (UI-compatible with old API):
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

  // ── During first cycle (before first maturity) ─────────────────────────
  if (today < mat) {
    const gross = cycleInterest(principal, ratePct, months);
    const tds = tdsOnInterest(gross);
    const net = netInterest(gross);
    const daysElapsed = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    // currentValue = principal + net accrued interest to date
    const currentValue =
      principal + netAccruedInterest(principal, ratePct, daysElapsed);
    return {
      matAmt: principal + net,
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

  // ── Auto-renewed (at or past first maturity) ───────────────────────────
  // getCycleState walks all completed cycles using NET compounding
  const state = getCycleState(principal, ratePct, months, mat, today);
  const {
    cyclePrincipal,
    cycleStart,
    cycleEnd,
    completedCycles,
    totalTDSPaid,
  } = state;

  // Gross / TDS / Net for the CURRENT (possibly partial) cycle
  const grossCycleInterest = cycleInterest(cyclePrincipal, ratePct, months);
  const tdsThisCycle = tdsOnInterest(grossCycleInterest);
  const netCycleInterest = netInterest(grossCycleInterest);

  // matAmt: what you receive when THIS cycle matures (net-of-TDS)
  const matAmt = cyclePrincipal + netCycleInterest;

  // currentValue: principal of this cycle + net accrued interest since cycleStart
  const daysInCycle = Math.floor((today - cycleStart) / (1000 * 60 * 60 * 24));
  const currentValue =
    cyclePrincipal + netAccruedInterest(cyclePrincipal, ratePct, daysInCycle);

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
    totalTDSPaid,
  };
}

// ── Status & display helpers ───────────────────────────────────────────────

/**
 * Get FDR status string.
 */
export function getFDRStatus(startDate, maturityDate, today) {
  const start = parseDate(startDate);
  const mat = parseDate(maturityDate);
  if (today < start) return "Not Started";
  if (today < mat) return "Running";
  return "Auto-Renewed";
}

/**
 * afterTDS — kept for backward UI compatibility.
 *
 * IMPORTANT: In the new engine, `currentValue` already reflects TDS-adjusted
 * figures (net accrued interest, net compounded principal). This function now
 * simply returns `currentValue` as-is, since TDS is already baked in.
 *
 * If you need to display the "net withdrawable" value, use `currentValue`
 * directly from calculateFDR(). This function is a no-op pass-through kept
 * so existing UI call-sites don't break.
 */
export function afterTDS(originalPrincipal, currentValue) {
  // TDS is already deducted in currentValue (new engine).
  // Return as-is — no double-deduction.
  return currentValue;
}

/**
 * Get progress/days info for display.
 * For Auto-Renewed FDRs, uses the current cycle's start/end dates from
 * the fdr object (pre-calculated by calculateFDR).
 *
 * Returns:
 *   label          — human-readable progress string
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

  // Auto-Renewed — use cycle info from calculateFDR result if available
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
  const renewedPercent = Math.min(100, (elapsedInCycle / totalCycleDays) * 100);
  const overdueDays = Math.ceil((today - mat) / (1000 * 60 * 60 * 24));
  const remaining = Math.ceil((cycleEnd - today) / (1000 * 60 * 60 * 24));

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
