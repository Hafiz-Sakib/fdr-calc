import React from 'react';
import { TrendingUp, DollarSign, BarChart3, Zap } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

const HS = "'Hind Siliguri', sans-serif";
const MONO = "'DM Mono', monospace";

export default function SummaryCards({ totalPrincipal, totalMaturity, totalCurrent, totalGain }) {
  const cards = [
    { icon: <DollarSign size={18} />, label: 'Total Principal', value: totalPrincipal, color: '#E8EDF5', iconBg: 'rgba(59,130,246,0.1)', iconColor: '#3B82F6', delay: 0 },
    { icon: <BarChart3 size={18} />, label: 'Total Maturity', value: totalMaturity, color: '#E8EDF5', iconBg: 'rgba(245,158,11,0.1)', iconColor: '#F59E0B', delay: 0.08 },
    { icon: <Zap size={18} />, label: 'Current Value', value: totalCurrent, color: '#3B82F6', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3B82F6', delay: 0.16, highlight: true },
    { icon: <TrendingUp size={18} />, label: 'Total Gain', value: totalGain, color: '#00F5C4', iconBg: 'rgba(0,245,196,0.1)', iconColor: '#00F5C4', delay: 0.24,
      gainPct: totalPrincipal > 0 ? ((totalGain / totalPrincipal) * 100).toFixed(2) : '0.00' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => (
        <div key={i}
          className="relative overflow-hidden flex flex-col gap-2.5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: card.highlight ? 'linear-gradient(135deg,#0D1526,#0f1a35)' : '#0D1526',
            border: `1px solid ${card.highlight ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.12)'}`,
            padding: '20px 18px',
            boxShadow: card.highlight ? '0 0 0 1px rgba(59,130,246,0.1), 0 4px 30px rgba(59,130,246,0.1)' : '',
            animation: card.highlight
              ? `fadeUp 0.5s ${card.delay}s cubic-bezier(0.16,1,0.3,1) both, glow-pulse 3s ease-in-out infinite`
              : `fadeUp 0.5s ${card.delay}s cubic-bezier(0.16,1,0.3,1) both`,
          }}>
          {/* Radial shimmer */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top left,rgba(59,130,246,0.04),transparent 60%)' }} />

          <div className="flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: card.iconBg, color: card.iconColor }}>
              {card.icon}
            </div>
            {card.gainPct && (
              <span style={{ fontFamily: MONO, fontSize: '11px', color: '#00F5C4', background: 'rgba(0,245,196,0.08)', border: '1px solid rgba(0,245,196,0.2)', padding: '3px 8px', borderRadius: '20px' }}>
                +{card.gainPct}%
              </span>
            )}
          </div>

          <div style={{ fontFamily: HS, fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {card.label}
          </div>

          <div className="flex items-baseline gap-1"
            style={{ fontFamily: MONO, fontSize: '20px', fontWeight: 500, color: card.color, letterSpacing: '-0.5px' }}>
            <span style={{ fontSize: '14px', opacity: 0.6 }}>Tk </span>
            <AnimatedNumber value={Math.round(card.value)} />
          </div>
        </div>
      ))}
    </div>
  );
}
