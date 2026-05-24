import React from 'react';
import { Trash2, TrendingUp, Calendar } from 'lucide-react';
import { formatBD, formatDate, progressPercent, daysRemaining } from '../utils/fdrCalc';
import './FDRCard.css';

export default function FDRCard({ fdr, today, onDelete, index }) {
  const { label, principal, months, rate, startDate, maturityDate, matAmt, current, status } = fdr;
  const gain = current - principal;
  const gainPct = ((gain / principal) * 100).toFixed(2);
  const progress = progressPercent(startDate, maturityDate, today);
  const days = daysRemaining(maturityDate, today);

  return (
    <div className="fdr-card" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="fdr-card-top">
        <div className="fdr-card-label-row">
          <div className="fdr-card-label">{label}</div>
          <div className="fdr-card-status" style={{ color: status.color, background: status.bg }}>
            <span className="status-dot" style={{ background: status.color }} />
            {status.label}
          </div>
        </div>
        <button className="fdr-delete-btn" onClick={() => onDelete(fdr.id)} title="Remove FDR">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="fdr-principal">
        <span className="fdr-principal-label">Principal</span>
        <span className="fdr-principal-value">Tk {formatBD(principal)}</span>
      </div>

      <div className="fdr-metrics">
        <div className="fdr-metric">
          <span className="metric-val">{rate}%</span>
          <span className="metric-lbl">Rate p.a.</span>
        </div>
        <div className="metric-divider" />
        <div className="fdr-metric">
          <span className="metric-val">{months} mo</span>
          <span className="metric-lbl">Term</span>
        </div>
        <div className="metric-divider" />
        <div className="fdr-metric">
          <span className="metric-val" style={{ color: '#00F5C4' }}>+{gainPct}%</span>
          <span className="metric-lbl">Return</span>
        </div>
      </div>

      <div className="fdr-progress-section">
        <div className="fdr-progress-header">
          <div className="fdr-date-row">
            <Calendar size={11} />
            <span>{formatDate(startDate)}</span>
            <span className="arrow">→</span>
            <span>{formatDate(maturityDate)}</span>
          </div>
          <span className="fdr-progress-pct">{progress}%</span>
        </div>
        <div className="fdr-progress-track">
          <div
            className="fdr-progress-fill"
            style={{ width: `${progress}%`, background: status.color }}
          />
        </div>
        {days > 0 ? (
          <div className="fdr-days-left" style={{ color: status.color }}>
            {days} days remaining
          </div>
        ) : status.label === 'Auto-Renewed' ? (
          <div className="fdr-days-left" style={{ color: '#3B82F6' }}>Auto-renewed</div>
        ) : null}
      </div>

      <div className="fdr-bottom">
        <div className="fdr-bottom-item">
          <span className="bottom-label">Maturity Amount</span>
          <span className="bottom-val">Tk {formatBD(matAmt)}</span>
        </div>
        <div className="fdr-bottom-divider" />
        <div className="fdr-bottom-item right">
          <span className="bottom-label">Current Value</span>
          <span className="bottom-val highlight">Tk {formatBD(current)}</span>
        </div>
      </div>

      <div className="fdr-gain-tag">
        <TrendingUp size={12} />
        Gain: Tk {formatBD(gain)}
      </div>
    </div>
  );
}
