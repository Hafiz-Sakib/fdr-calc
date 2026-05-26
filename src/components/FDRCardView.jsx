import React, { useState } from "react";
import {
  formatBD,
  formatDate,
  formatDateLong,
  getFDRStatus,
  getDaysInfo,
  STATUS_CONFIG,
} from "../utils/fdrCalc";
import {
  Trash2,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Info,
  X,
} from "lucide-react";

// ── Info Modal ─────────────────────────────────────────────────────────────────
function InfoModal({ isOpen, onClose, title, icon, children }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 p-5 shadow-2xl"
        style={{ background: "rgba(13,20,40,0.98)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X size={14} />
          </button>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClass = "text-white", sub }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/[0.06] last:border-0">
      <div>
        <p className="text-[11px] text-slate-400">{label}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
      <p className={`text-sm font-bold tabular-nums text-right ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function InfoNote({ children }) {
  return (
    <div
      className="mt-3 rounded-xl px-3 py-2.5 border border-blue-500/20 text-[11px] text-slate-400 leading-relaxed"
      style={{ background: "rgba(59,130,246,0.06)" }}
    >
      {children}
    </div>
  );
}

// ── Single FDR Card ───────────────────────────────────────────────────────────
function FDRCard({ fdr, today, onDelete }) {
  const [modal, setModal] = useState(null); // 'maturity' | 'currentValue' | 'tds' | 'gain'

  const status = getFDRStatus(fdr.startDate, fdr.maturityDate, today);
  const daysInfo = getDaysInfo(fdr.startDate, fdr.maturityDate, today, fdr);
  const cfg = STATUS_CONFIG[status];

  // Net gain = currentValue (already net of TDS) minus original principal
  const gain = Math.round(fdr.currentValue) - fdr.principal;
  const gainPct = ((gain / fdr.principal) * 100).toFixed(2);

  // TDS fields from calculateFDR
  const tdsThisCycle = Math.round(fdr.tdsThisCycle ?? 0);
  const totalTDSPaid = Math.round(fdr.totalTDSPaid ?? 0); // completed cycles only

  const grossCycleInterest = Math.round(fdr.grossCycleInterest ?? 0);
  const netCycleInterest = Math.round(fdr.netCycleInterest ?? 0);
  const cyclePrincipal = Math.round(fdr.cyclePrincipal ?? fdr.principal);

  const cycleNumber =
    (fdr.completedCycles ?? daysInfo.completedCycles ?? 0) + 1;
  const maturityDateLabel = fdr.cycleEnd
    ? formatDateLong(fdr.cycleEnd)
    : formatDateLong(fdr.maturityDate);

  const progressColor =
    {
      Running: "from-emerald-500 to-emerald-400",
      "Auto-Renewed": "from-blue-500 to-blue-400",
      "Not Started": "from-amber-500 to-amber-400",
    }[status] || "from-blue-500 to-blue-400";

  const borderColor =
    {
      Running: "hover:border-emerald-500/40",
      "Auto-Renewed": "hover:border-blue-500/40",
      "Not Started": "hover:border-amber-500/40",
    }[status] || "hover:border-blue-500/40";

  const renewedPercent = daysInfo.renewedPercent ?? daysInfo.percent;
  const progressPct =
    status === "Auto-Renewed" ? renewedPercent : daysInfo.percent;

  return (
    <>
      <div
        className={`glass-card border border-white/[0.07] ${borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col`}
        style={{ background: "rgba(13,20,35,0.85)" }}
      >
        {/* ── Card Header ── */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {fdr.label}
            </h3>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} ${status === "Running" ? "badge-running" : ""}`}
              >
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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Original Deposit (Principal)
          </p>
          <p className="text-2xl font-bold text-white tabular-nums tracking-tight">
            Tk <span className="font-mono">{formatBD(fdr.principal)}</span>
          </p>
        </div>

        {/* ── Rate / Term / Net Return row ── */}
        <div
          className="mx-5 mb-4 grid grid-cols-3 rounded-xl overflow-hidden border border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          {[
            { label: "Rate P.A.", value: `${fdr.rate}%`, color: "text-white" },
            {
              label: "Term",
              value: `${fdr.months} mo`,
              color: "text-white",
            },
            {
              label: "Net Return %",
              value: `+${gainPct}%`,
              color: "text-emerald-400",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`py-3 text-center ${i < 2 ? "border-r border-white/[0.06]" : ""}`}
            >
              <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider leading-tight px-1">
                {item.label}
              </p>
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
              <span className="tabular-nums">
                {formatDate(fdr.maturityDate)}
              </span>
            </div>
            <span className={`text-[11px] font-bold tabular-nums ${cfg.text}`}>
              {Math.round(progressPct)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-1000`}
              style={{ width: `${Math.max(1, progressPct)}%` }}
            />
          </div>

          {/* Label below bar */}
          <div className="mt-1.5">
            {status === "Running" && (
              <p className={`text-[11px] font-medium ${cfg.text}`}>
                {daysInfo.label}
              </p>
            )}
            {status === "Auto-Renewed" && (
              <div className="flex items-center justify-between">
                <p className={`text-[11px] font-medium ${cfg.text}`}>
                  {daysInfo.label}
                </p>
                <p className="text-[10px] text-slate-500">
                  New cycle: {Math.round(renewedPercent)}% done
                </p>
              </div>
            )}
            {status === "Not Started" && (
              <p className={`text-[11px] font-medium ${cfg.text}`}>
                {daysInfo.label}
              </p>
            )}
          </div>
        </div>

        {/* ── Auto-Renewed cycle dates ── */}
        {status === "Auto-Renewed" && daysInfo.renewalStart && (
          <div
            className="mx-5 mb-3 rounded-xl px-3 py-2 border border-blue-500/20 flex items-center justify-between"
            style={{ background: "rgba(59,130,246,0.06)" }}
          >
            <div>
              <p className="text-[10px] text-blue-400/70 font-bold uppercase tracking-wider mb-0.5">
                Current Renewal Cycle
                {daysInfo.completedCycles > 0 && (
                  <span className="ml-1.5 text-blue-400/50 normal-case font-normal">
                    (cycle {daysInfo.completedCycles + 1})
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-400 tabular-nums">
                {formatDate(daysInfo.renewalStart)} →{" "}
                {formatDate(daysInfo.nextMaturity)}
              </p>
            </div>
            <p className="text-[11px] font-bold text-blue-400">
              {daysInfo.days}d left
            </p>
          </div>
        )}

        {/* ── Maturity Amount + Current Value ── */}
        <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
          {/* Maturity (After TDS) */}
          <button
            onClick={() => setModal("maturity")}
            className="rounded-xl p-3 border border-white/[0.05] text-left hover:border-slate-500/40 transition-all group"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Payout at Maturity
              </p>
              <Info
                size={10}
                className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0"
              />
            </div>
            <p className="text-[10px] text-slate-600 mb-1">After 10% TDS</p>
            <p className="text-sm font-bold text-slate-200 tabular-nums">
              Tk {formatBD(Math.round(fdr.matAmt))}
            </p>
          </button>

          {/* Current Value */}
          <button
            onClick={() => setModal("currentValue")}
            className="rounded-xl p-3 border border-blue-500/20 text-left hover:border-blue-500/40 transition-all group"
            style={{ background: "rgba(59,130,246,0.07)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest">
                Withdrawable Today
              </p>
              <Info
                size={10}
                className="text-blue-500/50 group-hover:text-blue-400 transition-colors flex-shrink-0"
              />
            </div>
            <p className="text-[10px] text-blue-500/50 mb-1">After 10% TDS</p>
            <p className="text-sm font-bold text-blue-400 tabular-nums">
              Tk {formatBD(Math.round(fdr.currentValue))}
            </p>
          </button>
        </div>

        {/* ── TDS breakdown ── */}
        <button
          onClick={() => setModal("tds")}
          className="mx-5 mb-4 rounded-xl p-3 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left group"
          style={{ background: "rgba(245,158,11,0.07)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={13} className="text-amber-400" />
              <p className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider">
                TDS This Cycle (10%)
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-amber-400 tabular-nums">
                Tk {formatBD(tdsThisCycle)}
              </p>
              <Info
                size={10}
                className="text-amber-500/50 group-hover:text-amber-400 transition-colors flex-shrink-0"
              />
            </div>
          </div>
          {/* Only show cumulative line when there are completed prior cycles */}
          {totalTDSPaid > 0 && (
            <p className="text-[10px] text-slate-500 pl-5">
              Previously paid (cycles 1–
              {fdr.completedCycles ?? daysInfo.completedCycles}):&nbsp;
              <span className="text-slate-400 font-semibold">
                Tk {formatBD(totalTDSPaid)}
              </span>
            </p>
          )}
        </button>

        {/* ── Net Gain banner ── */}
        <button
          onClick={() => setModal("gain")}
          className="mx-5 mb-5 rounded-xl px-4 py-2.5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center gap-2 group"
          style={{ background: "rgba(16,185,129,0.08)" }}
        >
          <TrendingUp size={13} className="text-emerald-400 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">
              Net Gain
            </span>
          </div>
          <span className="text-sm font-bold text-emerald-400 tabular-nums">
            Tk {formatBD(gain)}
          </span>
          <span className="text-[11px] text-emerald-600">+{gainPct}%</span>
          <Info
            size={10}
            className="text-emerald-600 group-hover:text-emerald-400 transition-colors flex-shrink-0"
          />
        </button>
      </div>

      {/* ── Maturity Info Modal ── */}
      <InfoModal
        isOpen={modal === "maturity"}
        onClose={() => setModal(null)}
        title={`Payout at Cycle ${cycleNumber} Maturity (After TDS)`}
        icon={<Calendar size={15} className="text-slate-300" />}
      >
        <InfoRow
          label="Cycle Principal (your deposited amount for this cycle)"
          value={`Tk ${formatBD(cyclePrincipal)}`}
          valueClass="text-slate-200"
        />
        <InfoRow
          label="Gross Interest Earned (before tax)"
          sub={`${fdr.rate}% per year × ${fdr.months} months`}
          value={`+ Tk ${formatBD(grossCycleInterest)}`}
          valueClass="text-emerald-400"
        />
        <InfoRow
          label="TDS Deducted by Bank (10% of gross interest)"
          value={`− Tk ${formatBD(tdsThisCycle)}`}
          valueClass="text-red-400"
        />
        <InfoRow
          label="Net Interest (90% of gross — what you keep)"
          value={`= Tk ${formatBD(netCycleInterest)}`}
          valueClass="text-emerald-300"
        />
        <div
          className="rounded-xl p-3 border border-slate-500/20 flex justify-between items-center"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Final Payout
          </p>
          <p className="text-base font-bold text-white tabular-nums">
            Tk {formatBD(Math.round(fdr.matAmt))}
          </p>
        </div>
        <InfoNote>
          This is the amount you will receive on{" "}
          <strong className="text-slate-200">{maturityDateLabel}</strong> — the
          last day of Cycle {cycleNumber}. The bank deducts 10% TDS (tax) on all
          interest before paying out.
        </InfoNote>
      </InfoModal>

      {/* ── Current Value Info Modal ── */}
      <InfoModal
        isOpen={modal === "currentValue"}
        onClose={() => setModal(null)}
        title="Withdrawable Value Today"
        icon={<TrendingUp size={15} className="text-blue-400" />}
      >
        <InfoRow
          label="Cycle Principal (starting balance for this cycle)"
          value={`Tk ${formatBD(cyclePrincipal)}`}
          valueClass="text-slate-200"
        />
        <InfoRow
          label="Interest Accrued So Far (net of 10% TDS)"
          sub="Calculated daily on 365-day basis"
          value={`+ Tk ${formatBD(Math.round(fdr.currentValue) - cyclePrincipal)}`}
          valueClass="text-blue-400"
        />
        <div
          className="rounded-xl p-3 border border-blue-500/20 flex justify-between items-center"
          style={{ background: "rgba(59,130,246,0.08)" }}
        >
          <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
            If Withdrawn Today
          </p>
          <p className="text-base font-bold text-blue-400 tabular-nums">
            Tk {formatBD(Math.round(fdr.currentValue))}
          </p>
        </div>
        <InfoNote>
          This value grows every day as interest accrues. On the exact maturity
          date it becomes equal to the{" "}
          <strong className="text-slate-200">Payout at Maturity</strong> value.
          Early withdrawal may incur bank penalties not reflected here.
        </InfoNote>
      </InfoModal>

      {/* ── TDS Info Modal ── */}
      <InfoModal
        isOpen={modal === "tds"}
        onClose={() => setModal(null)}
        title="Tax Deducted at Source (TDS)"
        icon={<ShieldCheck size={15} className="text-amber-400" />}
      >
        <InfoRow
          label={`Gross Interest This Cycle (Cycle ${cycleNumber})`}
          value={`Tk ${formatBD(grossCycleInterest)}`}
          valueClass="text-slate-200"
        />
        <InfoRow
          label="TDS Rate Applied by Bank"
          value="10%"
          valueClass="text-amber-400"
        />
        <InfoRow
          label={`TDS This Cycle (will be deducted at maturity)`}
          value={`Tk ${formatBD(tdsThisCycle)}`}
          valueClass="text-amber-400"
        />
        {totalTDSPaid > 0 && (
          <InfoRow
            label={`TDS Already Paid (Cycles 1–${cycleNumber - 1})`}
            value={`Tk ${formatBD(totalTDSPaid)}`}
            valueClass="text-slate-400"
          />
        )}
        <div
          className="rounded-xl p-3 border border-amber-500/20 flex justify-between items-center"
          style={{ background: "rgba(245,158,11,0.07)" }}
        >
          <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            Total TDS (All Cycles)
          </p>
          <p className="text-base font-bold text-amber-400 tabular-nums">
            Tk {formatBD(tdsThisCycle + totalTDSPaid)}
          </p>
        </div>
        <InfoNote>
          TDS is a government tax collected by your bank on FDR interest income.
          The bank deducts it automatically — your payout amounts shown in this
          app are already calculated{" "}
          <strong className="text-slate-200">after TDS deduction</strong>.
        </InfoNote>
      </InfoModal>

      {/* ── Net Gain Info Modal ── */}
      <InfoModal
        isOpen={modal === "gain"}
        onClose={() => setModal(null)}
        title="Net Profit So Far"
        icon={<TrendingUp size={15} className="text-emerald-400" />}
      >
        <InfoRow
          label="Current Withdrawable Value (today)"
          value={`Tk ${formatBD(Math.round(fdr.currentValue))}`}
          valueClass="text-blue-400"
        />
        <InfoRow
          label="Original Deposit (Principal)"
          value={`− Tk ${formatBD(fdr.principal)}`}
          valueClass="text-slate-400"
        />
        <div
          className="rounded-xl p-3 border border-emerald-500/20 flex justify-between items-center"
          style={{ background: "rgba(16,185,129,0.08)" }}
        >
          <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
            Net Profit
          </p>
          <div className="text-right">
            <p className="text-base font-bold text-emerald-400 tabular-nums">
              Tk {formatBD(gain)}
            </p>
            <p className="text-[11px] text-emerald-600">+{gainPct}%</p>
          </div>
        </div>
        <InfoNote>
          This is your actual real-money profit from this FDR — already net of
          all TDS (tax) deductions. It grows daily as interest accrues across
          all completed and current renewal cycles.
        </InfoNote>
      </InfoModal>
    </>
  );
}

// ── Card Grid ─────────────────────────────────────────────────────────────────
export default function FDRCardView({ fdrs, today, onDelete }) {
  if (fdrs.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-slate-400 font-medium">No FDRs added yet</p>
        <p className="text-slate-600 text-sm mt-1">
          Click "Add New FDR" to get started
        </p>
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
