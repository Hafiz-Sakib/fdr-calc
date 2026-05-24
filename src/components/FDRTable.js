import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatBD, formatDate } from '../utils/fdrCalc';
import './FDRTable.css';

export default function FDRTable({ rows, onDelete }) {
  const totalPrin = rows.reduce((s, r) => s + r.principal, 0);
  const totalMat  = rows.reduce((s, r) => s + Math.round(r.matAmt), 0);
  const totalCur  = rows.reduce((s, r) => s + Math.round(r.current), 0);
  const totalGain = totalCur - totalPrin;

  return (
    <div className="fdr-table-wrap">
      <div className="fdr-table-scroll">
        <table className="fdr-table">
          <thead>
            <tr>
              {['FDR', 'Principal', 'Term', 'Rate', 'Start Date', 'Maturity Date', 'Maturity Amt', 'Current Value', 'Gain', 'Status', ''].map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const gain = Math.round(r.current - r.principal);
              const gainPct = ((gain / r.principal) * 100).toFixed(1);
              return (
                <tr key={r.id} style={{ animationDelay: `${idx * 0.04}s` }}>
                  <td className="td-label">{r.label}</td>
                  <td className="td-mono">Tk {formatBD(r.principal)}</td>
                  <td className="td-center">{r.months} mo</td>
                  <td className="td-center">{r.rate}%</td>
                  <td className="td-mono td-date">{formatDate(r.startDate)}</td>
                  <td className="td-mono td-date">{formatDate(r.maturityDate)}</td>
                  <td className="td-mono">Tk {formatBD(r.matAmt)}</td>
                  <td className="td-mono td-current">Tk {formatBD(r.current)}</td>
                  <td className="td-gain">
                    <span>Tk {formatBD(gain)}</span>
                    <span className="gain-pct">+{gainPct}%</span>
                  </td>
                  <td>
                    <span className="td-status" style={{ color: r.status.color, background: r.status.bg }}>
                      <span className="status-dot" style={{ background: r.status.color }} />
                      {r.status.label}
                    </span>
                  </td>
                  <td>
                    <button className="tbl-delete" onClick={() => onDelete(r.id)} title="Remove">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td className="td-label">TOTAL</td>
              <td className="td-mono">Tk {formatBD(totalPrin)}</td>
              <td /><td /><td /><td />
              <td className="td-mono">Tk {formatBD(totalMat)}</td>
              <td className="td-mono td-current">Tk {formatBD(totalCur)}</td>
              <td className="td-gain"><span>Tk {formatBD(totalGain)}</span></td>
              <td /><td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
