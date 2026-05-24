import React from 'react';
import { TrendingUp, DollarSign, BarChart3, Zap } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import './SummaryCards.css';

export default function SummaryCards({ totalPrincipal, totalMaturity, totalCurrent, totalGain }) {
  const cards = [
    {
      icon: <DollarSign size={18} />,
      label: 'Total Principal',
      value: totalPrincipal,
      color: '#E8EDF5',
      iconBg: 'rgba(59,130,246,0.1)',
      iconColor: '#3B82F6',
      delay: 0,
    },
    {
      icon: <BarChart3 size={18} />,
      label: 'Total Maturity',
      value: totalMaturity,
      color: '#E8EDF5',
      iconBg: 'rgba(245,158,11,0.1)',
      iconColor: '#F59E0B',
      delay: 0.08,
    },
    {
      icon: <Zap size={18} />,
      label: 'Current Value',
      value: totalCurrent,
      color: '#3B82F6',
      iconBg: 'rgba(59,130,246,0.15)',
      iconColor: '#3B82F6',
      delay: 0.16,
      highlight: true,
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Total Gain',
      value: totalGain,
      color: '#00F5C4',
      iconBg: 'rgba(0,245,196,0.1)',
      iconColor: '#00F5C4',
      delay: 0.24,
      gainPct: totalPrincipal > 0 ? ((totalGain / totalPrincipal) * 100).toFixed(2) : '0.00',
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`summary-card ${card.highlight ? 'highlight' : ''}`}
          style={{ animationDelay: `${card.delay}s` }}
        >
          <div className="sc-top">
            <div className="sc-icon" style={{ background: card.iconBg, color: card.iconColor }}>
              {card.icon}
            </div>
            {card.gainPct && (
              <div className="sc-badge">+{card.gainPct}%</div>
            )}
          </div>
          <div className="sc-label">{card.label}</div>
          <div className="sc-value" style={{ color: card.color }}>
            <span className="sc-currency">Tk </span>
            <AnimatedNumber value={Math.round(card.value)} />
          </div>
        </div>
      ))}
    </div>
  );
}
