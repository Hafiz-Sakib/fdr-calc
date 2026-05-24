import React, { useState } from 'react';
import {
  formatBD, formatDate, afterTDS, getFDRStatus, getDaysInfo
} from '../utils/fdrCalc';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { Trash2, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

function Th({ children, sortKey, sortState, onSort, className = '' }) {
  const isActive = sortState.key === sortKey;
  return (
    <th
      className={`px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap select-none cursor-pointer hover:text-slate-200 transition-colors ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {children}
        {isActive
          ? sortState.dir === 'asc'
            ? <ChevronUp size={12} className="text-blue-400" />
            : <ChevronDown size={12} className="text-blue-400" />
          : <ArrowUpDown size={10} className="opacity-30" />
        }
      </span>
    </th>
  );
}

export default function FDRTable({ fdrs, today, onDelete }) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  const handleSort = (key) => {
    setSort(s => ({
      key,
      dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sorted = React.useMemo(() => {
    if (!sort.key) return fdrs;
    return [...fdrs].sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (sort.key === 'currentValue' || sort.key === 'matAmt' || sort.key === 'principal') {
        av = Number(av); bv = Number(bv);
      }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [fdrs, sort]);

  if (fdrs.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-slate-400 font-medium">No FDRs added yet</p>
        <p className="text-slate-600 text-sm mt-1">Click "Add New FDR" to get started</p>
      </div>
    );
  }

  // Totals
  const totalPrin  = fdrs.reduce((s, f) => s + f.principal, 0);
  const totalMat   = fdrs.reduce((s, f) => s + Math.round(f.matAmt), 0);
  const totalCur   = fdrs.reduce((s, f) => s + Math.round(f.currentValue), 0);
  const totalGain  = totalCur - totalPrin;
  const totalTDS   = fdrs.reduce((s, f) => s + Math.round(afterTDS(f.principal, f.currentValue)), 0);

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr style={{ background: 'rgba(15,23,42,0.9)' }}>
              <Th sortKey="label"        sortState={sort} onSort={handleSort}>FDR</Th>
              <Th sortKey="principal"    sortState={sort} onSort={handleSort} className="text-right">Principal (Tk)</Th>
              <Th sortKey="months"       sortState={sort} onSort={handleSort}>Term</Th>
              <Th sortKey="rate"         sortState={sort} onSort={handleSort}>Rate</Th>
              <Th sortKey="startDate"    sortState={sort} onSort={handleSort}>Start</Th>
              <Th sortKey="maturityDate" sortState={sort} onSort={handleSort}>Maturity</Th>
              <Th sortKey="matAmt"       sortState={sort} onSort={handleSort} className="text-right">Maturity Amt</Th>
              <Th sortKey="currentValue" sortState={sort} onSort={handleSort} className="text-right">Current Value</Th>
              <th className="px-4 py-3 text-right text-[11px] font-bold text-amber-400/70 uppercase tracking-wider whitespace-nowrap">
                After TDS (10%)
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 w-10" />
            </tr>
            {/* Blue accent line */}
            <tr>
              <td colSpan={12} className="p-0">
                <div style={{ height: '2px', background: 'linear-gradient(90deg, #3B82F6, #10B981)' }} />
              </td>
            </tr>
          </thead>

          <tbody>
            {sorted.map((fdr, i) => {
              const status   = getFDRStatus(fdr.startDate, fdr.maturityDate, today);
              const gain     = Math.round(fdr.currentValue) - fdr.principal;
              const aTDS     = Math.round(afterTDS(fdr.principal, fdr.currentValue));
              const daysInfo = getDaysInfo(fdr.startDate, fdr.maturityDate, today);
              const isEven   = i % 2 === 0;

              return (
                <tr
                  key={fdr.id}
                  className="table-row-hover border-b border-white/[0.04]"
                  style={{ background: isEven ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                >
                  {/* FDR Name */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-white text-sm">{fdr.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{daysInfo.label}</div>
                  </td>

                  {/* Principal */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-slate-200 font-semibold text-sm tabular-nums">
                      {formatBD(fdr.principal)}
                    </span>
                  </td>

                  {/* Term */}
                  <td className="px-4 py-3">
                    <span className="text-slate-300 text-sm">{fdr.months} mo</span>
                  </td>

                  {/* Rate */}
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-semibold text-sm">{fdr.rate}%</span>
                  </td>

                  {/* Start */}
                  <td className="px-4 py-3">
                    <span className="text-slate-400 text-sm tabular-nums">{formatDate(fdr.startDate)}</span>
                  </td>

                  {/* Maturity Date */}
                  <td className="px-4 py-3">
                    <span className="text-slate-400 text-sm tabular-nums">{formatDate(fdr.maturityDate)}</span>
                  </td>

                  {/* Maturity Amount */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-slate-300 text-sm tabular-nums">{formatBD(Math.round(fdr.matAmt))}</span>
                  </td>

                  {/* Current Value */}
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-blue-400 text-sm tabular-nums">
                      {formatBD(Math.round(fdr.currentValue))}
                    </div>
                    <div className={`text-[11px] mt-0.5 tabular-nums ${gain >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      +{formatBD(gain)}
                    </div>
                  </td>

                  {/* After TDS */}
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-amber-400 text-sm tabular-nums">{formatBD(aTDS)}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      -{formatBD(Math.round(fdr.currentValue) - aTDS)} TDS
                    </div>
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-3 min-w-[100px]">
                    <ProgressBar percent={daysInfo.percent} status={status} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>

                  {/* Delete */}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => onDelete(fdr.id)}
                      className="w-7 h-7 rounded-md bg-transparent hover:bg-red-500/15 flex items-center justify-center text-slate-600 hover:text-red-400 transition-all"
                      title="Remove FDR"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Totals row */}
          <tfoot>
            <tr>
              <td colSpan={12} className="p-0">
                <div style={{ height: '2px', background: 'linear-gradient(90deg, #3B82F6, #10B981)' }} />
              </td>
            </tr>
            <tr style={{ background: 'rgba(15,23,42,0.95)' }}>
              <td className="px-4 py-3 font-bold text-white text-sm" colSpan={1}>
                TOTALS
              </td>
              <td className="px-4 py-3 text-right font-bold text-white text-sm tabular-nums">
                {formatBD(totalPrin)}
              </td>
              <td colSpan={4} />
              <td className="px-4 py-3 text-right font-bold text-slate-200 text-sm tabular-nums">
                {formatBD(totalMat)}
              </td>
              <td className="px-4 py-3 text-right font-bold text-blue-400 text-sm tabular-nums">
                <div>{formatBD(totalCur)}</div>
                <div className="text-emerald-500 text-[11px]">+{formatBD(totalGain)}</div>
              </td>
              <td className="px-4 py-3 text-right font-bold text-amber-400 text-sm tabular-nums">
                {formatBD(totalTDS)}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
