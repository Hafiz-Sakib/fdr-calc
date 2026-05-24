import React from 'react';
import { formatBD, afterTDS, getFDRStatus } from '../utils/fdrCalc';

const STATUS_COLORS = {
  'Running':      ['#10B981', '#059669'],
  'Auto-Renewed': ['#3B82F6', '#2563EB'],
  'Not Started':  ['#F59E0B', '#D97706'],
};

export default function ChartSection({ fdrs }) {
  if (fdrs.length === 0) return null;

  const totalCur = fdrs.reduce((s, f) => s + f.currentValue, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
      {/* Portfolio Distribution */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-white mb-4">Portfolio Distribution</h3>
        <div className="space-y-3">
          {fdrs.map((fdr, i) => {
            const pct = totalCur > 0 ? (fdr.currentValue / totalCur) * 100 : 0;
            const status = getFDRStatus(fdr.startDate, fdr.maturityDate, new Date());
            const [colorA] = STATUS_COLORS[status] || STATUS_COLORS['Running'];

            return (
              <div key={fdr.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorA }} />
                    <span className="text-sm text-slate-300 font-medium">{fdr.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 tabular-nums">{pct.toFixed(1)}%</span>
                    <span className="text-sm font-semibold text-white tabular-nums">
                      Tk {formatBD(Math.round(fdr.currentValue))}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${colorA}, ${STATUS_COLORS[status]?.[1] || colorA})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rate & Return Summary */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-white mb-4">Return Summary</h3>
        <div className="space-y-2">
          {fdrs.map((fdr) => {
            const status   = getFDRStatus(fdr.startDate, fdr.maturityDate, new Date());
            const gain     = fdr.currentValue - fdr.principal;
            const gainPct  = (gain / fdr.principal * 100).toFixed(2);
            const aTDS     = afterTDS(fdr.principal, fdr.currentValue);
            const netGain  = aTDS - fdr.principal;
            const [colorA] = STATUS_COLORS[status] || STATUS_COLORS['Running'];

            return (
              <div
                key={fdr.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ background: colorA }} />
                  <div>
                    <div className="text-sm font-semibold text-white">{fdr.label}</div>
                    <div className="text-[11px] text-slate-500">{fdr.rate}% p.a. • {fdr.months} mo</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 tabular-nums">+{gainPct}%</div>
                  <div className="text-[11px] text-amber-400/80 tabular-nums">
                    Net: Tk {formatBD(Math.round(netGain))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
