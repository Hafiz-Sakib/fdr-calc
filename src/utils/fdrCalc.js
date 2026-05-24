// FDR Calculation Logic (mirrors Python script)

export function formatBD(amount) {
  const amt = Math.round(amount);
  let s = String(amt);
  if (s.length <= 3) return s;
  let result = s.slice(-3);
  s = s.slice(0, -3);
  while (s.length > 0) {
    result = s.slice(-2) + ',' + result;
    s = s.slice(0, -2);
  }
  return result;
}

export function maturityAmount(principal, ratePct, months) {
  return principal + principal * (ratePct / 100) * months / 12;
}

export function accruedInterest(principal, ratePct, days) {
  return principal * (ratePct / 100) * days / 365;
}

export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function latestRenewalDate(firstMaturity, durationMonths, today) {
  let renewal = new Date(firstMaturity);
  while (true) {
    const nxt = addMonths(renewal, durationMonths);
    if (nxt > today) return renewal;
    renewal = nxt;
  }
}

export function calculateFDR(principal, months, ratePct, startDate, maturityDate, today) {
  const matAmt = maturityAmount(principal, ratePct, months);
  const start = new Date(startDate);
  const maturity = new Date(maturityDate);
  const todayD = new Date(today);

  if (todayD < start) {
    return { matAmt, current: principal };
  } else if (todayD < maturity) {
    const days = Math.floor((todayD - start) / (1000 * 60 * 60 * 24));
    const current = principal + accruedInterest(principal, ratePct, days);
    return { matAmt, current };
  } else {
    const renewal = latestRenewalDate(maturity, months, todayD);
    const daysSince = Math.floor((todayD - renewal) / (1000 * 60 * 60 * 24));
    const current = matAmt + accruedInterest(matAmt, ratePct, daysSince);
    return { matAmt, current };
  }
}

export function fdrStatus(startDate, maturityDate, today) {
  const start = new Date(startDate);
  const maturity = new Date(maturityDate);
  const todayD = new Date(today);

  if (todayD < start) return { label: 'Not Started', color: '#F59E0B', bg: '#F59E0B22' };
  if (todayD < maturity) return { label: 'Running', color: '#10B981', bg: '#10B98122' };
  return { label: 'Auto-Renewed', color: '#3B82F6', bg: '#3B82F622' };
}

export function progressPercent(startDate, maturityDate, today) {
  const start = new Date(startDate).getTime();
  const maturity = new Date(maturityDate).getTime();
  const todayD = new Date(today).getTime();
  if (todayD <= start) return 0;
  if (todayD >= maturity) return 100;
  return Math.round(((todayD - start) / (maturity - start)) * 100);
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysRemaining(maturityDate, today) {
  const maturity = new Date(maturityDate).getTime();
  const todayD = new Date(today).getTime();
  const diff = Math.floor((maturity - todayD) / (1000 * 60 * 60 * 24));
  return diff;
}

export const DEFAULT_FDRS = [
  { id: 1, label: 'FDR 1', principal: 300000, months: 6, rate: 9.0, startDate: '2025-07-17', maturityDate: '2026-01-17' },
  { id: 2, label: 'FDR 2', principal: 50000,  months: 3, rate: 8.0, startDate: '2025-11-25', maturityDate: '2026-02-25' },
  { id: 3, label: 'FDR 3', principal: 70000,  months: 3, rate: 8.0, startDate: '2026-02-16', maturityDate: '2026-05-16' },
  { id: 4, label: 'FDR 4', principal: 70000,  months: 3, rate: 8.0, startDate: '2026-05-14', maturityDate: '2026-08-14' },
];
