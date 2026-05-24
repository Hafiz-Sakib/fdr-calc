import React, { useEffect, useState } from 'react';
import { formatBD, afterTDS } from '../utils/fdrCalc';
import { TrendingUp, Wallet, BarChart3, PiggyBank, ShieldCheck } from 'lucide-react';

function AnimatedNumber({ value, prefix = 'Tk ' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = Math.round(value);
    const duration = 1000;
    const steps = 50;
    const increment = (end - start) / steps;
    let current = start;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="count-anim tabular-nums">
      {prefix}{formatBD(display)}
    </span>
  );
}

const cards = (totals) => [
  {
    label: 'Total Principal',
    value: totals.principal,
    icon: Wallet,
    color: 'from-slate-500/20 to-slate-600/10',
    border: 'border-slate-500/20',
    iconColor: 'text-slate-300',
    textColor: 'text-white',
    desc: `${totals.count} active FDRs`,
  },
  {
    label: 'Total Maturity',
    value: totals.maturity,
    icon: BarChart3,
    color: 'from-violet-500/20 to-violet-600/10',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    textColor: 'text-violet-100',
    desc: 'At maturity value',
  },
  {
    label: 'Current Value',
    value: totals.current,
    icon: TrendingUp,
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    textColor: 'text-blue-100',
    desc: 'As of today',
  },
  {
    label: 'Total Gain',
    value: totals.gain,
    icon: PiggyBank,
    color: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-100',
    desc: `${((totals.gain / totals.principal) * 100).toFixed(2)}% earned`,
  },
  {
    label: 'After 10% TDS',
    value: totals.afterTDS,
    icon: ShieldCheck,
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-100',
    desc: 'Net after tax deduction',
  },
];

export default function SummaryCards({ fdrs }) {
  const totals = React.useMemo(() => {
    const principal = fdrs.reduce((s, f) => s + f.principal, 0);
    const maturity  = fdrs.reduce((s, f) => s + Math.round(f.matAmt), 0);
    const current   = fdrs.reduce((s, f) => s + Math.round(f.currentValue), 0);
    const tdsTotal  = fdrs.reduce((s, f) => s + Math.round(afterTDS(f.principal, f.currentValue)), 0);
    return {
      principal,
      maturity,
      current,
      gain: current - principal,
      afterTDS: tdsTotal,
      count: fdrs.length,
    };
  }, [fdrs]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards(totals).map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`glass-card glass-card-hover bg-gradient-to-br ${card.color} border ${card.border} p-5 flex flex-col gap-3`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider leading-tight">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 ${card.iconColor}`}>
                <Icon size={16} />
              </div>
            </div>

            <div className={`text-xl font-bold leading-none ${card.textColor}`}>
              <AnimatedNumber value={card.value} />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {card.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
}
