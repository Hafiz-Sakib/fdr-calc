# 📊 FDR Summary Dashboard

A professional, responsive **Fixed Deposit Receipt (FDR) management dashboard** built with React.js and Tailwind CSS. Track all your fixed deposits in one place with real-time calculations, TDS deductions, export features, and a sleek dark-themed UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏦 **FDR Tracking** | Track multiple FDRs with principal, rate, term, and maturity dates |
| 📈 **Live Calculations** | Auto-calculates current value based on today's date including auto-renewals |
| 💰 **TDS Deduction** | Shows net value after 10% Tax Deducted at Source (TDS) on interest |
| ➕ **Add New FDRs** | Add unlimited FDRs dynamically via a clean modal form |
| 📄 **Export PDF** | Download a beautifully formatted landscape PDF report |
| 📊 **Export CSV** | Export all data as a CSV file for Excel/Sheets use |
| 📱 **Fully Responsive** | Works perfectly on mobile, tablet, and desktop |
| 🎨 **Animated UI** | Smooth animations, number counters, and progress bars |
| 🔤 **Hind Siliguri Font** | Uses Hind Siliguri throughout the entire app |
| 🗑️ **Delete FDRs** | Remove any FDR with one click |
| 🔃 **Sortable Table** | Sort by any column (name, rate, value, date, etc.) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher — [Download here](https://nodejs.org/)
- **npm** v8 or higher (comes with Node.js)

### Installation

1. **Extract** the downloaded ZIP file to a folder of your choice.

2. **Open a terminal** in that folder:
   ```
   cd fdr-app
   ```

3. **Install dependencies:**
   ```
   npm install
   ```
   > This may take 1–3 minutes on the first run.

4. **Start the development server:**
   ```
   npm start
   ```

5. **Open your browser** and visit:
   ```
   http://localhost:3000
   ```

---

## 🏗️ Build for Production

To create an optimized production build:

```bash
npm run build
```

The output will be in the `build/` folder. You can serve it with any static web server.

---

## 📁 Project Structure

```
fdr-app/
├── public/
│   ├── index.html          # HTML template with Hind Siliguri font import
│   └── favicon.svg         # Custom FDR-themed SVG favicon
│
├── src/
│   ├── components/
│   │   ├── Header.jsx       # Top navigation bar with date display
│   │   ├── SummaryCards.jsx # 5 animated summary metric cards
│   │   ├── ChartSection.jsx # Portfolio distribution & return summary
│   │   ├── Toolbar.jsx      # Add FDR + Export PDF/CSV buttons
│   │   ├── FDRTable.jsx     # Main sortable data table
│   │   ├── AddFDRModal.jsx  # Modal form to add a new FDR
│   │   ├── StatusBadge.jsx  # Animated status chip (Running/Renewed/etc.)
│   │   ├── ProgressBar.jsx  # Term progress bar
│   │   └── Footer.jsx       # Disclaimer footer
│   │
│   ├── utils/
│   │   ├── fdrCalc.js       # All FDR math: maturity, accrual, TDS, status
│   │   └── exportUtils.js   # PDF (jsPDF + autoTable) and CSV export logic
│   │
│   ├── App.jsx              # Root component, state management
│   ├── index.js             # React DOM entry point
│   └── index.css            # Global styles, animations, Tailwind base
│
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

---

## 💼 Default FDR Data

The app comes pre-loaded with 4 sample FDRs:

| FDR | Principal | Term | Rate | Start | Maturity |
|-----|-----------|------|------|-------|----------|
| FDR 1 | Tk 3,00,000 | 6 months | 9.0% | 17.07.25 | 17.01.26 |
| FDR 2 | Tk 50,000  | 3 months | 8.0% | 25.11.25 | 25.02.26 |
| FDR 3 | Tk 70,000  | 3 months | 8.0% | 16.02.26 | 16.05.26 |
| FDR 4 | Tk 70,000  | 3 months | 8.0% | 14.05.26 | 14.08.26 |

---

## 🧮 Calculation Methodology

### Current Value
- **Not Started**: Returns the principal (no interest yet)
- **Running**: `Principal + (Principal × Rate × Days_Elapsed / 365)`
- **Auto-Renewed**: Recalculates from the latest renewal date using maturity amount as new principal

### Maturity Amount
`Principal + Principal × (Rate / 100) × (Months / 12)`

### After TDS (10%)
`Current Value − (Interest Earned × 10%)`

Where: `Interest Earned = Current Value − Principal`

> All interest calculations use **simple interest** on a 365-day year basis.

---

## 🎨 Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Tailwind CSS** | Utility-first styling |
| **jsPDF** | PDF generation |
| **jsPDF-AutoTable** | PDF table formatting |
| **Lucide React** | Icons |
| **Google Fonts** | Hind Siliguri typography |
| **date-fns** | Date utility functions |

---

## 📤 Export Formats

### PDF Export
- Landscape A4 format
- Dark-themed professional layout
- Summary cards with totals
- Full FDR table with TDS column
- Color-coded status values
- Confidentiality footer

### CSV Export
- UTF-8 with BOM (Excel-friendly)
- All columns including After-TDS
- Totals row at the bottom
- Compatible with Excel, Google Sheets, LibreOffice

---

## 🔧 Customization

To change the default FDR entries, edit the `DEFAULT_FDRS` array in `src/App.jsx`:

```javascript
const DEFAULT_FDRS = [
  {
    id: 'fdr-001',
    label: 'FDR 1',
    principal: 300000,   // Amount in BDT
    months: 6,           // Duration in months
    rate: 9.0,           // Annual interest rate (%)
    startDate: '2025-07-17',     // YYYY-MM-DD
    maturityDate: '2026-01-17',  // YYYY-MM-DD
  },
  // ... add more
];
```

To change the **TDS rate**, edit `exportUtils.js` and `fdrCalc.js` — search for `0.10` and update it.

---

## 📜 License

This project is for personal use. Feel free to modify and redistribute.

---

## 🙏 Acknowledgments

- Original calculation logic adapted from `Modern_FDR_Calculation.py`
- Icons by [Lucide](https://lucide.dev)
- Font by [Google Fonts — Hind Siliguri](https://fonts.google.com/specimen/Hind+Siliguri)
