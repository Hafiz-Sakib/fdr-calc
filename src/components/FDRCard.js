import React from 'react';
import { Trash2, TrendingUp, Calendar } from 'lucide-react';
import { formatBD, formatDate, progressPercent, daysRemaining } from '../utils/fdrCalc';

const HS = "'Hind Siliguri', sans-serif";
const MONO = "'DM Mono', monospace";

export default function FDRCard({ fdr, today, onDelete, index }) {
  const { label, principal, months, rate, startDate, maturityDate, matAmt, current, status } = fdr;
  const gain = current - principal;
  const gainPct = ((gain / principal) * 100).toFixed(2);
  const progress = progressPercent(startDate, maturityDate, today);
  const days = daysRemaining(maturityDate, today);

  return (
    <div className="relative overflow-hidden flex flex-col gap-4 rounded-[18px] transition-all duration-300 group hover:-translate-y-1"
      style={{ background: '#0D1526', border: '1px solid rgba(59,130,246,0.15)', padding: '22px', animation: `fadeUp 0.5s ${index * 0.08}s cubic-bezier(0.16,1,0.3,1) both` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(59,130,246,0.35)'; e.currentTarget.style.boxShadow='0 20px 40px rgba(0,0,0,0.4),0 0 0 1px rgba(59,130,246,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(59,130,246,0.15)'; e.currentTarget.style.boxShadow=''; }}>

      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.5),transparent)' }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span style={{ fontFamily: HS, fontSize: '17px', fontWeight: 700, color: '#E8EDF5', letterSpacing: '-0.3px' }}>{label}</span>
          <span className="flex items-center gap-1" style={{ fontFamily: HS, fontSize: '10.5px', fontWeight: 700, color: status.color, background: status.bg, padding: '3px 9px', borderRadius: '20px', letterSpacing: '0.03em' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: status.color }} />
            {status.label}
          </span>
        </div>
        <button onClick={() => onDelete(fdr.id)} title="Remove FDR"
          className="w-[30px] h-[30px] flex items-center justify-center rounded-lg shrink-0 transition-all"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.5)', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#EF4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.07)'; e.currentTarget.style.color='rgba(239,68,68,0.5)'; }}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Principal */}
      <div className="flex flex-col gap-0.5">
        <span style={{ fontFamily: HS, fontSize: '10.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Principal</span>
        <span style={{ fontFamily: MONO, fontSize: '22px', fontWeight: 500, color: '#E8EDF5', letterSpacing: '-0.5px' }}>Tk {formatBD(principal)}</span>
      </div>

      {/* Metrics */}
      <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(7,11,20,0.6)', border: '1px solid rgba(59,130,246,0.08)' }}>
        {[
          { val: `${rate}%`, lbl: 'Rate p.a.' },
          { val: `${months} mo`, lbl: 'Term' },
          { val: `+${gainPct}%`, lbl: 'Return', color: '#00F5C4' },
        ].map((m, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="w-px self-stretch" style={{ background: 'rgba(59,130,246,0.1)' }} />}
            <div className="flex-1 flex flex-col items-center gap-0.5 py-2.5 px-2">
              <span style={{ fontFamily: MONO, fontSize: '14px', fontWeight: 500, color: m.color || '#E8EDF5' }}>{m.val}</span>
              <span style={{ fontFamily: HS, fontSize: '9.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.lbl}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: '10.5px', color: '#64748B' }}>
            <Calendar size={11} style={{ opacity: 0.5 }} />
            <span>{formatDate(startDate)}</span>
            <span style={{ color: '#3B82F6', opacity: 0.7 }}>→</span>
            <span>{formatDate(maturityDate)}</span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>{progress}%</span>
        </div>
        <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: status.color, boxShadow: `0 0 8px ${status.color}` }} />
        </div>
        {days > 0 ? (
          <span style={{ fontFamily: MONO, fontSize: '10px', color: status.color, opacity: 0.8 }}>{days} days remaining</span>
        ) : status.label === 'Auto-Renewed' ? (
          <span style={{ fontFamily: MONO, fontSize: '10px', color: '#3B82F6' }}>Auto-renewed</span>
        ) : null}
      </div>

      {/* Bottom amounts */}
      <div className="flex overflow-hidden rounded-xl" style={{ background: 'rgba(7,11,20,0.5)', border: '1px solid rgba(59,130,246,0.08)' }}>
        <div className="flex-1 flex flex-col gap-0.5 p-3">
          <span style={{ fontFamily: HS, fontSize: '9.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maturity Amount</span>
          <span style={{ fontFamily: MONO, fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>Tk {formatBD(matAmt)}</span>
        </div>
        <div className="w-px" style={{ background: 'rgba(59,130,246,0.08)', margin: '8px 0' }} />
        <div className="flex-1 flex flex-col items-end gap-0.5 p-3">
          <span style={{ fontFamily: HS, fontSize: '9.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Value</span>
          <span style={{ fontFamily: MONO, fontSize: '13px', fontWeight: 500, color: '#3B82F6' }}>Tk {formatBD(current)}</span>
        </div>
      </div>

      {/* Gain tag */}
      <div className="flex items-center gap-1.5 self-start"
        style={{ fontFamily: MONO, fontSize: '11px', color: '#00F5C4', fontWeight: 500, padding: '6px 12px', background: 'rgba(0,245,196,0.05)', border: '1px solid rgba(0,245,196,0.12)', borderRadius: '8px' }}>
        <TrendingUp size={12} />
        Gain: Tk {formatBD(gain)}
      </div>
    </div>
  );
}
