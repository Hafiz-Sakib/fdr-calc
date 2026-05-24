import React, { useState } from 'react';
import { Plus, FileText, FileSpreadsheet, Loader2, LayoutGrid, Table2 } from 'lucide-react';
import { exportToPDF, exportToCSV } from '../utils/exportUtils';

export default function Toolbar({ fdrs, today, viewMode, onViewChange, onAddFDR }) {
  const [exporting, setExporting] = useState('');

  const handlePDF = async () => {
    if (!fdrs.length) return;
    setExporting('pdf');
    try { await exportToPDF(fdrs, today); } finally { setExporting(''); }
  };

  const handleCSV = () => {
    if (!fdrs.length) return;
    setExporting('csv');
    try { exportToCSV(fdrs, today); } finally { setTimeout(() => setExporting(''), 800); }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Left */}
      <div>
        <h2 className="text-lg font-bold text-white">FDR Portfolio</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {fdrs.length} {fdrs.length === 1 ? 'deposit' : 'deposits'} tracked
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* View Toggle */}
        <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1 gap-1">
          <button
            onClick={() => onViewChange('card')}
            title="Card View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'card'
                ? 'bg-blue-600 text-white shadow shadow-blue-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={13} />
            Cards
          </button>
          <button
            onClick={() => onViewChange('table')}
            title="Table View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow shadow-blue-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table2 size={13} />
            Table
          </button>
        </div>

        {/* Export CSV */}
        <button
          onClick={handleCSV}
          disabled={!fdrs.length || !!exporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting === 'csv' ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} className="text-emerald-400" />}
          CSV
        </button>

        {/* Export PDF */}
        <button
          onClick={handlePDF}
          disabled={!fdrs.length || !!exporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} className="text-red-400" />}
          PDF
        </button>

        {/* Add FDR */}
        <button
          onClick={onAddFDR}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-all glow-blue"
        >
          <Plus size={16} />
          Add New FDR
        </button>
      </div>
    </div>
  );
}
