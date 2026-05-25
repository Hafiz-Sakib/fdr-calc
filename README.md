# FDR Calculator

A React-based Fixed Deposit Receipt (FDR) calculator tailored for Bangladesh bank FDRs. Track multiple FDRs, monitor auto-renewals, see current values, and calculate after-TDS returns.

---

## Features

- Add / delete FDRs with label, principal, rate, term, and start date
- Real-time current value with accrued interest
- **Compounding auto-renewal**: each renewal cycle uses `(principal + previous cycle interest)` as the new principal
- Accurate gain calculation vs. original invested amount
- After-TDS display (10% TDS on total interest earned)
- Date simulator — pick any date to see projected values
- Card and table views
- Chart overview of portfolio
- CSV / JSON export

---

## Calculation Logic

### Simple Interest per Cycle

Each cycle earns:

```
interest = principal × (rate / 100) × (months / 12)
maturityAmount = principal + interest
```

### Auto-Renewal Compounding

When an FDR passes its first maturity date it auto-renews. **The new principal for each renewal cycle is the maturity amount of the previous cycle:**

```
Cycle 1: principal₁ = original principal
         maturity₁  = principal₁ + cycleInterest(principal₁)

Cycle 2: principal₂ = maturity₁
         maturity₂  = principal₂ + cycleInterest(principal₂)

Cycle N: principalₙ = maturityₙ₋₁
         maturityₙ  = principalₙ + cycleInterest(principalₙ)
```

**Example — FDR 2 (Tk 50,000 @ 8% p.a., 3-month term, started 25 Nov 2025):**

| Cycle | Start       | End         | Principal  | Interest | Maturity   |
|-------|-------------|-------------|------------|----------|------------|
| 1     | 25 Nov 2025 | 25 Feb 2026 | Tk 50,000  | Tk 1,000 | Tk 51,000  |
| 2     | 25 Feb 2026 | 25 May 2026 | Tk 51,000  | Tk 1,020 | Tk 52,020  |
| 3     | 25 May 2026 | 25 Aug 2026 | Tk 52,020  | …        | …          |

As of 25 May 2026 (start of cycle 3): **current value = Tk 52,020**, **total gain = Tk 2,020**.

### Current Value (Partial Cycle)

Within any cycle, the current value accrues daily:

```
currentValue = cyclePrincipal + cyclePrincipal × (rate/100) × (daysElapsed/365)
```

### After TDS

10% TDS applies to total interest earned since the original deposit:

```
totalInterest = currentValue - originalPrincipal
TDS           = totalInterest × 0.10
afterTDS      = currentValue - TDS
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
src/
├── App.jsx                    # Root — state, date picker, FDR list
├── utils/
│   └── fdrCalc.js             # All calculation logic (cycle compounding, interest, TDS)
└── components/
    ├── AddFDRModal.jsx         # Add new FDR form
    ├── FDRCardView.jsx         # Card grid view
    ├── FDRTable.jsx            # Table view
    ├── ChartSection.jsx        # Portfolio chart
    ├── SummaryCards.jsx        # Top summary stats
    ├── Header.jsx              # Date simulator + title
    ├── Toolbar.jsx             # View toggle + export
    ├── ProgressBar.jsx         # Reusable progress bar
    ├── StatusBadge.jsx         # Running / Auto-Renewed / Not Started badge
    └── Footer.jsx
```

---

## Key Functions (`src/utils/fdrCalc.js`)

| Function | Description |
|---|---|
| `getCycleState(principal, rate, months, firstMaturity, today)` | Walks through completed cycles, compounding principal each time. Returns current cycle's principal, start, end, and cycle count. |
| `calculateFDR(...)` | Full FDR value calculation — handles pre-start, running, and multi-cycle auto-renewed states. |
| `cycleInterest(principal, rate, months)` | Interest for one complete cycle. |
| `accruedInterest(principal, rate, days)` | Day-accurate partial accrual (365-day year). |
| `afterTDS(originalPrincipal, currentValue)` | Deducts 10% TDS on total gain from original principal. |
| `getDaysInfo(startDate, maturityDate, today, fdr)` | Progress info for display — uses precomputed cycle data from `fdr` object. |

---

## Changelog

### v2.0 — Compounding Auto-Renewal Fix

**Bug fixed:** Previous version used only the original principal for every renewal cycle. After two cycles, the gain shown was only one cycle's worth (e.g. Tk 1,000 instead of Tk 2,020 for FDR 2).

**What changed:**
- `getCycleState()` — new function that walks through all completed cycles, rolling `maturityAmount` → next cycle's `principal`
- `calculateFDR()` — now returns `cyclePrincipal`, `cycleStart`, `cycleEnd`, `completedCycles` alongside `matAmt` and `currentValue`
- `getDaysInfo()` — accepts the enriched `fdr` object to avoid redundant cycle recomputation
- `afterTDS()` — always uses `originalPrincipal` (stored on fdr) so TDS reflects total accumulated interest
- `FDRCardView` & `FDRTable` — pass full `fdr` to `getDaysInfo`; show cycle number in renewal badge
- `App.jsx` — spreads full `calculateFDR` result onto each FDR object
