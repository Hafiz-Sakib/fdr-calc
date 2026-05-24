import React from 'react';
import {
  formatBD, formatDate, afterTDS,
  getFDRStatus, getDaysInfo, STATUS_CONFIG
} from '../utils/fdrCalc';
import { Trash2, Calendar, TrendingUp, ShieldCheck } from 'lucide-react';

// ── Single FDR Card ───────────────────────────────────────────────────────────
function FDRCard({ fdr, today, onDelete }) {
  const status    = getFDRStatus(fdr.startDate, fdr.maturityDate, today);
  const daysInfo  = getDaysInfo(fdr.startDate, fdr.maturityDate, today);
  const cfg       = STATUS_CONFIG[status];
  const gain      = Math.round(fdr.currentValue) - fdr.principal;
  const gainPct   = ((gain / fdr.principal) * 100).toFixed(2);
  const aTDS      = Math.round(afterTDS(fdr.principal, fdr.currentValue));
  const tdsAmount = Math.round(fdr.currentValue) - aTDS;

  const progressColor = {
    'Running':      'from-emerald-500 to-emerald-400',
    'Auto-Renewed': 'from-blue-500 to-blue-400',
    'Not Started':  'from-amber-500 to-amber-400',
  }[status] || 'from-blue-500 to-blue-400';

  const borderColor = {
    'Running':      'hover:border-emerald-500/40',
    'Auto-Renewed': 'hover:border-blue-500/40',
    'Not Started':  'hover:border-amber-500/40',
  }[status] || 'hover:border-blue-500/40';

  return (
    <div className={`glass-card border border-white/[0.07] ${borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col`}
         style={{ background: 'rgba(13,20,35,0.85)' }}>

      {/* ── Card Header ── */}
      <div className="flex items-start justify-between p-5 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{fdr.label}</h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} ${status === 'Running' ? 'badge-running' : ''}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {status}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(fdr.id)}
          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/25 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all flex-shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* ── Principal ── */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Principal</p>
        <p className="text-2xl font-bold text-white tabular-nums tracking-tight">
          Tk <span className="font-mono">{formatBD(fdr.principal)}</span>
        </p>
      </div>

      {/* ── Rate / Term / Return row ── */}
      <div className="mx-5 mb-4 grid grid-cols-3 rounded-xl overflow-hidden border border-white/[0.06]"
           style={{ background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'Rate P.A.',  value: `${fdr.rate}%`,      color: 'text-white' },
          { label: 'Term',       value: `${fdr.months} mo`,  color: 'text-white' },
          { label: 'Return',     value: `+${gainPct}%`,      color: 'text-emerald-400' },
        ].map((item, i) => (
          <div key={i} className={`py-3 text-center ${i < 2 ? 'border-r border-white/[0.06]' : ''}`}>
            <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ── Date Range + Progress ── */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar size={11} className="text-slate-500" />
            <span className="tabular-nums">{formatDate(fdr.startDate)}</span>
            <span className="text-slate-600">→</span>
            <span className="tabular-nums">{formatDate(fdr.maturityDate)}</span>
          </div>
          <span className={`text-[11px] font-bold tabular-nums ${cfg.text}`}>
            {Math.round(daysInfo.percent)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-1000`}
            style={{ width: `${Math.max(1, daysInfo.percent)}%` }}
          />
        </div>

        {/* Status label below bar */}
        <p className={`text-[11px] mt-1.5 font-medium ${cfg.text}`}>
          {status === 'Running'      && `${daysInfo.days} days remaining`}
          {status === 'Auto-Renewed' && 'Auto-renewed'}
          {status === 'Not Started'  && `Starts in ${daysInfo.days} days`}
        </p>
      </div>

      {/* ── Maturity + Current Value ── */}
      <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 border border-white/[0.05]"
             style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Maturity Amount</p>
          <p className="text-sm font-bold text-slate-200 tabular-nums">Tk {formatBD(Math.round(fdr.matAmt))}</p>
        </div>
        <div className="rounded-xl p-3 border border-blue-500/20"
             style={{ background: 'rgba(59,130,246,0.07)' }}>
          <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest mb-1">Current Value</p>
          <p className="text-sm font-bold text-blue-400 tabular-nums">Tk {formatBD(Math.round(fdr.currentValue))}</p>
        </div>
      </div>

      {/* ── After TDS ── */}
      <div className="mx-5 mb-4 rounded-xl p-3 border border-amber-500/20"
           style={{ background: 'rgba(245,158,11,0.07)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-amber-400" />
            <p className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider">After 10% TDS</p>
          </div>
          <p className="text-sm font-bold text-amber-400 tabular-nums">Tk {formatBD(aTDS)}</p>
        </div>
        <p className="text-[10px] text-slate-600 mt-1 pl-5">
          TDS deducted: Tk {formatBD(tdsAmount)} on interest
        </p>
      </div>

      {/* ── Gain Banner ── */}
      <div className="mx-5 mb-5 rounded-xl px-4 py-2.5 border border-emerald-500/20 flex items-center gap-2"
           style={{ background: 'rgba(16,185,129,0.08)' }}>
        <TrendingUp size={13} className="text-emerald-400 flex-shrink-0" />
        <span className="text-sm font-bold text-emerald-400 tabular-nums">
          Gain: Tk {formatBD(gain)}
        </span>
        <span className="text-[11px] text-emerald-600 ml-auto">+{gainPct}%</span>
      </div>
    </div>
  );
}

// ── Card Grid ─────────────────────────────────────────────────────────────────
export default function FDRCardView({ fdrs, today, onDelete }) {
  if (fdrs.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-slate-400 font-medium">No FDRs added yet</p>
        <p className="text-slate-600 text-sm mt-1">Click "Add New FDR" to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {fdrs.map((fdr, i) => (
        <div
          key={fdr.id}
          style={{ animation: `slideUp 0.4s ease ${i * 60}ms both` }}
        >
          <FDRCard fdr={fdr} today={today} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
