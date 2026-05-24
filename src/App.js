import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Download, FileText, LayoutGrid, Table2, RefreshCw, TrendingUp } from 'lucide-react';
import { calculateFDR, fdrStatus, DEFAULT_FDRS } from './utils/fdrCalc';
import { exportCSV, exportPDF } from './utils/exportUtils';
import SummaryCards from './components/SummaryCards';
import FDRCard from './components/FDRCard';
import FDRTable from './components/FDRTable';
import AddFDRModal from './components/AddFDRModal';
import './App.css';

const TODAY = new Date().toISOString().split('T')[0];

function computeRows(fdrs, today) {
  return fdrs.map(fdr => {
    const { matAmt, current } = calculateFDR(
      fdr.principal, fdr.months, fdr.rate,
      fdr.startDate, fdr.maturityDate, today
    );
    const status = fdrStatus(fdr.startDate, fdr.maturityDate, today);
    return { ...fdr, matAmt, current, status };
  });
}

export default function App() {
  const [fdrs, setFdrs] = useState(DEFAULT_FDRS);
  const [today, setToday] = useState(TODAY);
  const [view, setView] = useState('cards');
  const [showModal, setShowModal] = useState(false);
  const [nextId, setNextId] = useState(DEFAULT_FDRS.length + 1);

  const rows = useMemo(() => computeRows(fdrs, today), [fdrs, today]);

  const totalPrincipal = rows.reduce((s, r) => s + r.principal, 0);
  const totalMaturity  = rows.reduce((s, r) => s + r.matAmt, 0);
  const totalCurrent   = rows.reduce((s, r) => s + r.current, 0);
  const totalGain      = totalCurrent - totalPrincipal;

  const handleAdd = useCallback((newFdr) => {
    setFdrs(prev => [...prev, { ...newFdr, id: nextId }]);
    setNextId(n => n + 1);
  }, [nextId]);

  const handleDelete = useCallback((id) => {
    setFdrs(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleReset = () => {
    setFdrs(DEFAULT_FDRS);
    setNextId(DEFAULT_FDRS.length + 1);
    setToday(TODAY);
  };

  return (
    <div className="app">
      {/* Background effects */}
      <div className="bg-mesh" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />

      {/* Left accent bar */}
      <div className="left-bar" />

      <div className="app-inner">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo-mark">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="app-title">FDR Portfolio</h1>
              <p className="app-sub">Fixed Deposit Receipt Manager</p>
            </div>
          </div>

          <div className="header-right">
            {/* Date picker */}
            <div className="date-field">
              <label>As of Date</label>
              <input
                type="date"
                value={today}
                onChange={e => setToday(e.target.value)}
              />
            </div>

            <button className="btn-ghost" onClick={handleReset} title="Reset to defaults">
              <RefreshCw size={15} />
              Reset
            </button>

            <button className="btn-export" onClick={() => exportCSV(rows, today)}>
              <FileText size={15} />
              CSV
            </button>

            <button className="btn-export pdf" onClick={() => exportPDF(rows, today)}>
              <Download size={15} />
              PDF
            </button>

            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} />
              Add FDR
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <SummaryCards
          totalPrincipal={totalPrincipal}
          totalMaturity={totalMaturity}
          totalCurrent={totalCurrent}
          totalGain={totalGain}
        />

        {/* Section heading + view toggle */}
        <div className="section-bar">
          <div className="section-title">
            <span>{rows.length} Fixed Deposit{rows.length !== 1 ? 's' : ''}</span>
            <span className="section-dot" />
            <span className="section-sub">Auto-renewal on maturity</span>
          </div>
          <div className="view-toggle">
            <button
              className={`vt-btn ${view === 'cards' ? 'active' : ''}`}
              onClick={() => setView('cards')}
              title="Card View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`vt-btn ${view === 'table' ? 'active' : ''}`}
              onClick={() => setView('table')}
              title="Table View"
            >
              <Table2 size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        {rows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><TrendingUp size={32} /></div>
            <div className="empty-title">No FDRs Yet</div>
            <div className="empty-sub">Click "Add FDR" to get started</div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Your First FDR
            </button>
          </div>
        ) : view === 'cards' ? (
          <div className="cards-grid">
            {rows.map((r, i) => (
              <FDRCard key={r.id} fdr={r} today={today} onDelete={handleDelete} index={i} />
            ))}
          </div>
        ) : (
          <FDRTable rows={rows} onDelete={handleDelete} />
        )}

        {/* Footer note */}
        <footer className="app-footer">
          <span>* Interest calculated on simple basis</span>
          <span className="footer-dot">·</span>
          <span>Auto-renewal assumed upon maturity</span>
          <span className="footer-dot">·</span>
          <span>Bengali number formatting (lakh/crore)</span>
        </footer>
      </div>

      {showModal && (
        <AddFDRModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          nextIndex={nextId}
        />
      )}
    </div>
  );
}
