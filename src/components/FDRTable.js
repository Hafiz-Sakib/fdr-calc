import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatBD, formatDate } from '../utils/fdrCalc';

const HS = "'Hind Siliguri', sans-serif";
const MONO = "'DM Mono', monospace";

export default function FDRTable({ rows, onDelete }) {
  const totalPrin = rows.reduce((s, r) => s + r.principal, 0);
  const totalMat  = rows.reduce((s, r) => s + Math.round(r.matAmt), 0);
  const totalCur  = rows.reduce((s, r) => s + Math.round(r.current), 0);
  const totalGain = totalCur - totalPrin;

  const thStyle = {
    background: '#070B14',
    color: '#64748B',
    fontFamily: HS,
    fontSize: '10.5px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    padding: '14px 16px',
    textAlign: 'left',
    borderBottom: '1px solid rgba(59,130,246,0.2)',
    whiteSpace: 'nowrap',
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1526', border: '1px solid rgba(59,130,246,0.15)' }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: '860px' }}>
          <thead>
            <tr>
              {['FDR', 'Principal', 'Term', 'Rate', 'Start Date', 'Maturity Date', 'Maturity Amt', 'Current Value', 'Gain', 'Status', ''].map((h, i) => (
                <th key={i} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const gain = Math.round(r.current - r.principal);
              const gainPct = ((gain / r.principal) * 100).toFixed(1);
              return (
                <tr key={r.id}
                  style={{ borderBottom: '1px solid rgba(59,130,246,0.06)', animation: `fadeIn 0.4s ${idx * 0.04}s ease both` }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(59,130,246,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background=''}>
                  <td style={{ padding: '13px 16px', fontFamily: HS, fontWeight: 700, color: '#E8EDF5', fontSize: '13.5px', verticalAlign: 'middle' }}>{r.label}</td>
                  <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '12.5px', color: '#94A3B8', verticalAlign: 'middle' }}>Tk {formatBD(r.principal)}</td>
                  <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '12.5px', color: '#94A3B8', textAlign: 'center', verticalAlign: 'middle' }}>{r.months} mo</td>
                  <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '12.5px', color: '#94A3B8', textAlign: 'center', verticalAlign: 'middle' }}>{r.rate}%</td>
                  <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '11.5px', color: '#64748B', verticalAlign: 'middle' }}>{formatDate(r.startDate)}</td>
                  <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '11.5px', color: '#64748B', verticalAlign: 'middle' }}>{formatDate(r.maturityDate)}</td>
                  <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '12.5px', color: '#94A3B8', verticalAlign: 'middle' }}>Tk {formatBD(r.matAmt)}</td>
                  <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '12.5px', color: '#3B82F6', fontWeight: 500, verticalAlign: 'middle' }}>Tk {formatBD(r.current)}</td>
                  <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                    <div className="flex items-center gap-1.5 whitespace-nowrap" style={{ fontFamily: MONO, fontSize: '12px', color: '#00F5C4' }}>
                      <span>Tk {formatBD(gain)}</span>
                      <span style={{ fontSize: '10px', background: 'rgba(0,245,196,0.07)', border: '1px solid rgba(0,245,196,0.15)', padding: '2px 6px', borderRadius: '20px' }}>+{gainPct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap"
                      style={{ fontFamily: HS, fontSize: '10.5px', fontWeight: 700, color: r.status.color, background: r.status.bg, padding: '4px 10px', borderRadius: '20px' }}>
                      <span className="w-[5px] h-[5px] rounded-full inline-block" style={{ background: r.status.color }} />
                      {r.status.label}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                    <button onClick={() => onDelete(r.id)} title="Remove"
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                      style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.4)', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#EF4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.07)'; e.currentTarget.style.color='rgba(239,68,68,0.4)'; }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#111C33', borderTop: '1.5px solid rgba(59,130,246,0.25)' }}>
              <td style={{ padding: '14px 16px', fontFamily: HS, fontWeight: 700, color: '#3B82F6', fontSize: '11px', letterSpacing: '0.08em' }}>TOTAL</td>
              <td style={{ padding: '14px 16px', fontFamily: MONO, fontWeight: 700, color: '#3B82F6', fontSize: '13px' }}>Tk {formatBD(totalPrin)}</td>
              <td /><td /><td /><td />
              <td style={{ padding: '14px 16px', fontFamily: MONO, fontWeight: 700, color: '#3B82F6', fontSize: '13px' }}>Tk {formatBD(totalMat)}</td>
              <td style={{ padding: '14px 16px', fontFamily: MONO, fontWeight: 700, color: '#3B82F6', fontSize: '13px' }}>Tk {formatBD(totalCur)}</td>
              <td style={{ padding: '14px 16px', fontFamily: MONO, fontWeight: 700, color: '#3B82F6', fontSize: '13px' }}>Tk {formatBD(totalGain)}</td>
              <td /><td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
