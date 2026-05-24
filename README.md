# FDR Portfolio Manager

A premium React web application for tracking Fixed Deposit Receipts (FDRs) with real-time calculations, animations, and export capabilities.

## Features

- **4 pre-loaded FDRs** as examples (editable/deletable)
- **Add unlimited FDRs** with a sleek modal form
- **Auto-maturity date** calculation from start date + term
- **Live calculations**: current value with accrued interest, auto-renewal logic
- **Animated summary cards** with live number counters
- **Card view & Table view** with smooth transitions
- **Status tracking**: Not Started / Running / Auto-Renewed
- **Progress bars** showing maturity progress per FDR
- **Bengali number formatting** (lakh/crore system)
- **Export to CSV** — full table with totals
- **Export to PDF** — styled landscape report with summary cards
- **"As of Date" picker** — calculate values for any date
- **Dark premium UI** with animated backgrounds and micro-interactions

## Setup

```bash
# Install dependencies (Node.js 16+ required)
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app opens at **http://localhost:3000**

## Project Structure

```
src/
  App.js                  # Main app
  App.css                 # Layout & header styles
  index.js                # Entry point
  index.css               # Global styles & animations
  utils/
    fdrCalc.js            # FDR calculation logic (mirrors Python script)
    exportUtils.js        # CSV & PDF export
  components/
    SummaryCards.js/.css  # Top summary metrics
    FDRCard.js/.css       # Card view item
    FDRTable.js/.css      # Table view
    AddFDRModal.js/.css   # Add FDR modal form
    AnimatedNumber.js     # Animated counter component
```

## Calculation Logic

- **Simple interest**: `Principal × Rate × Days / 365`
- **Maturity amount**: `Principal × (1 + Rate × Months / 12)`
- **Auto-renewal**: On maturity, the maturity amount becomes the new principal
- **Current value**: Accrued interest added to current period's principal

## Notes

- Interest is calculated on a simple (non-compound) basis
- Auto-renewal is assumed upon maturity
- Numbers formatted in Bengali/South Asian style (lakh = 1,00,000; crore = 1,00,00,000)
