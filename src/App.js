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
      <div className="bg-mesh" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />
      <div className="left-bar" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-9 flex flex-col gap-6 sm:gap-7">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(59,130,246,0.05))', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6', animation: 'float 4s ease-in-out infinite' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', color: '#E8EDF5', lineHeight: 1 }}>
                FDR Portfolio
              </h1>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
                Fixed Deposit Receipt Manager
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Date picker */}
            <div className="flex flex-col gap-1">
              <label style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: '9.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                As of Date
              </label>
              <input
                type="date"
                value={today}
                onChange={e => setToday(e.target.value)}
                style={{ background: '#0D1526', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '9px', color: '#E8EDF5', fontFamily: "'DM Mono', monospace", fontSize: '12.5px', padding: '8px 12px', outline: 'none' }}
              />
            </div>

            <button onClick={handleReset}
              className="flex items-center gap-1.5 transition-all"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B', padding: '8px 14px', borderRadius: '9px', fontFamily: "'Hind Siliguri', sans-serif", fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              <RefreshCw size={15} /> Reset
            </button>

            <button onClick={() => exportCSV(rows, today)}
              className="flex items-center gap-1.5 transition-all"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6', padding: '8px 16px', borderRadius: '9px', fontFamily: "'Hind Siliguri', sans-serif", fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
              <FileText size={15} /> CSV
            </button>

            <button onClick={() => exportPDF(rows, today)}
              className="flex items-center gap-1.5 transition-all"
              style={{ background: 'rgba(0,245,196,0.06)', border: '1px solid rgba(0,245,196,0.2)', color: '#00F5C4', padding: '8px 16px', borderRadius: '9px', fontFamily: "'Hind Siliguri', sans-serif", fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
              <Download size={15} /> PDF
            </button>

            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', color: 'white', padding: '9px 20px', borderRadius: '9px', fontFamily: "'Hind Siliguri', sans-serif", fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
              <Plus size={16} /> Add FDR
            </button>
          </div>
        </header>

        {/* ── Summary Cards ── */}
        <SummaryCards
          totalPrincipal={totalPrincipal}
          totalMaturity={totalMaturity}
          totalCurrent={totalCurrent}
          totalGain={totalGain}
        />

        {/* ── Section bar ── */}
        <div className="flex items-center justify-between"
          style={{ animation: 'fadeUp 0.5s 0.25s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div className="flex items-center gap-2.5"
            style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: '14px', fontWeight: 700, color: '#E8EDF5' }}>
            <span>{rows.length} Fixed Deposit{rows.length !== 1 ? 's' : ''}</span>
            <span className="w-1 h-1 rounded-full" style={{ background: '#3B82F6' }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
              Auto-renewal on maturity
            </span>
          </div>
          <div className="flex rounded-xl p-1 gap-0.5"
            style={{ background: '#0D1526', border: '1px solid rgba(59,130,246,0.12)' }}>
            {[{ id: 'cards', Icon: LayoutGrid }, { id: 'table', Icon: Table2 }].map(({ id, Icon }) => (
              <button key={id} onClick={() => setView(id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                style={view === id
                  ? { background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: 'none', cursor: 'pointer' }
                  : { background: 'transparent', color: '#64748B', border: 'none', cursor: 'pointer' }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 px-5"
            style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="w-16 h-16 sm:w-[70px] sm:h-[70px] flex items-center justify-center rounded-[20px] opacity-70"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}>
              <TrendingUp size={32} />
            </div>
            <div style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: '20px', fontWeight: 700, color: '#E8EDF5' }}>No FDRs Yet</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: '#64748B' }}>Click "Add FDR" to get started</div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', color: 'white', padding: '9px 20px', borderRadius: '9px', fontFamily: "'Hind Siliguri', sans-serif", fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
              <Plus size={16} /> Add Your First FDR
            </button>
          </div>
        ) : view === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {rows.map((r, i) => (
              <FDRCard key={r.id} fdr={r} today={today} onDelete={handleDelete} index={i} />
            ))}
          </div>
        ) : (
          <FDRTable rows={rows} onDelete={handleDelete} />
        )}

        {/* ── Footer ── */}
        <footer className="flex flex-wrap items-center gap-2.5 pt-3"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#64748B', borderTop: '1px solid rgba(59,130,246,0.06)', animation: 'fadeIn 0.5s 0.4s ease both' }}>
          <span>* Interest calculated on simple basis</span>
          <span style={{ color: '#3B82F6', opacity: 0.5 }}>·</span>
          <span>Auto-renewal assumed upon maturity</span>
          <span style={{ color: '#3B82F6', opacity: 0.5 }}>·</span>
          <span>Bengali number formatting (lakh/crore)</span>
        </footer>
      </div>

      {showModal && (
        <AddFDRModal onClose={() => setShowModal(false)} onAdd={handleAdd} nextIndex={nextId} />
      )}
    </div>
  );
}
