import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import FDRTable from './components/FDRTable';
import FDRCardView from './components/FDRCardView';
import Toolbar from './components/Toolbar';
import AddFDRModal from './components/AddFDRModal';
import ChartSection from './components/ChartSection';
import Footer from './components/Footer';
import { calculateFDR, parseDate } from './utils/fdrCalc';

const DEFAULT_FDRS = [
  { id: 'fdr-001', label: 'FDR 1', principal: 300000, months: 6, rate: 9.0, startDate: '2025-07-17', maturityDate: '2026-01-17' },
  { id: 'fdr-002', label: 'FDR 2', principal: 50000,  months: 3, rate: 8.0, startDate: '2025-11-25', maturityDate: '2026-02-25' },
  { id: 'fdr-003', label: 'FDR 3', principal: 70000,  months: 3, rate: 8.0, startDate: '2026-02-16', maturityDate: '2026-05-16' },
  { id: 'fdr-004', label: 'FDR 4', principal: 70000,  months: 3, rate: 8.0, startDate: '2026-05-14', maturityDate: '2026-08-14' },
];

// Format a Date object as YYYY-MM-DD for input[type=date]
function toInputDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function App() {
  const realToday = useMemo(() => new Date(), []);
  const [rawFdrs, setRawFdrs]     = useState(DEFAULT_FDRS);
  const [showModal, setShowModal]  = useState(false);
  const [viewMode, setViewMode]    = useState('card');
  // Date picker state — default = today
  const [selectedDateStr, setSelectedDateStr] = useState(toInputDate(realToday));

  // The "active date" used for all calculations
  const today = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDateStr]);

  const isCustomDate = selectedDateStr !== toInputDate(realToday);

  const fdrs = useMemo(() => rawFdrs.map(f => {
    const result = calculateFDR(f.principal, f.months, f.rate, f.startDate, f.maturityDate, today);
    return { ...f, ...result };
  }), [rawFdrs, today]);

  const handleAdd    = (fdr) => setRawFdrs(prev => [...prev, fdr]);
  const handleDelete = (id)  => setRawFdrs(prev => prev.filter(f => f.id !== id));

  return (
    <div className="min-h-screen bg-animated">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.03]"
             style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
             style={{ background: 'radial-gradient(circle, #10B981, transparent)' }} />
      </div>

      <div className="relative z-10">
        <Header
          today={today}
          realToday={realToday}
          selectedDateStr={selectedDateStr}
          onDateChange={setSelectedDateStr}
          isCustomDate={isCustomDate}
        />

        <main className="px-4 sm:px-6 lg:px-8 pb-8 max-w-screen-xl mx-auto">
          <SummaryCards fdrs={fdrs} />
          <ChartSection fdrs={fdrs} />

          <Toolbar
            fdrs={fdrs}
            today={today}
            viewMode={viewMode}
            onViewChange={setViewMode}
            onAddFDR={() => setShowModal(true)}
          />

          {viewMode === 'card'
            ? <FDRCardView fdrs={fdrs} today={today} onDelete={handleDelete} />
            : <FDRTable    fdrs={fdrs} today={today} onDelete={handleDelete} />
          }
        </main>

        <Footer />
      </div>

      {showModal && (
        <AddFDRModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
