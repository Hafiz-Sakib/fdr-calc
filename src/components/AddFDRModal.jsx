import React, { useState } from "react";
import { X, Plus, AlertCircle } from "lucide-react";
import { genId } from "../utils/fdrCalc";

const EMPTY = {
  label: "",
  principal: "",
  months: "3",
  rate: "8.0",
  startDate: "",
};

/**
 * Real calendar-based maturity calculation
 * Handles:
 * - leap years
 * - month overflow
 * - Jan 31 -> Feb 28/29
 * - year rollover
 */
function calculateMaturityDate(startDate, months) {
  if (!startDate || !months) return "";

  const date = new Date(startDate);
  const originalDay = date.getDate();

  // Move months forward
  date.setMonth(date.getMonth() + Number(months));

  /**
   * Fix overflow issue
   * Example:
   * Jan 31 + 1 month
   * becomes Mar 3 internally
   * so we rollback to last valid day
   */
  if (date.getDate() < originalDay) {
    date.setDate(0);
  }

  return date.toISOString().split("T")[0];
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>

      {children}

      {hint && <p className="mt-1 text-[11px] text-slate-600">{hint}</p>}
    </div>
  );
}

export default function AddFDRModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({
      ...f,
      [key]: val,
    }));

    if (errors[key]) {
      setErrors((e) => ({
        ...e,
        [key]: "",
      }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!form.label.trim()) {
      errs.label = "FDR name is required";
    }

    if (
      !form.principal ||
      isNaN(form.principal) ||
      Number(form.principal) <= 0
    ) {
      errs.principal = "Enter a valid principal amount";
    }

    if (!form.rate || isNaN(form.rate) || Number(form.rate) <= 0) {
      errs.rate = "Enter a valid interest rate";
    }

    if (!form.startDate) {
      errs.startDate = "Start date is required";
    }

    return errs;
  };

  const maturityDate = calculateMaturityDate(form.startDate, form.months);

  const handleSubmit = () => {
    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    onAdd({
      id: genId(),
      label: form.label.trim(),
      principal: Number(form.principal),
      months: Number(form.months),
      rate: Number(form.rate),
      startDate: form.startDate,
      maturityDate,
    });

    onClose();
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="modal-content glass-card w-full max-w-lg border-blue-500/20 shadow-2xl shadow-blue-500/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Add New FDR</h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Enter the fixed deposit details below
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="divider-glow mx-6" />

        {/* Form */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Label */}
          <div className="sm:col-span-2">
            <Field label="FDR Label / Name">
              <input
                type="text"
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="e.g. FDR 5 or My Fixed Deposit"
                className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 input-glow transition-all ${
                  errors.label ? "border-red-500/60" : "border-white/10"
                }`}
              />

              {errors.label && (
                <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle size={10} />
                  {errors.label}
                </p>
              )}
            </Field>
          </div>

          {/* Principal */}
          <Field label="Principal Amount (Tk)" hint="Amount invested in BDT">
            <input
              type="number"
              value={form.principal}
              onChange={(e) => set("principal", e.target.value)}
              placeholder="e.g. 100000"
              min="0"
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 input-glow transition-all ${
                errors.principal ? "border-red-500/60" : "border-white/10"
              }`}
            />

            {errors.principal && (
              <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.principal}
              </p>
            )}
          </Field>

          {/* Rate */}
          <Field label="Interest Rate (%)" hint="Annual rate, e.g. 8.5">
            <input
              type="number"
              value={form.rate}
              onChange={(e) => set("rate", e.target.value)}
              placeholder="e.g. 8.5"
              step="0.25"
              min="0"
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 input-glow transition-all ${
                errors.rate ? "border-red-500/60" : "border-white/10"
              }`}
            />

            {errors.rate && (
              <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.rate}
              </p>
            )}
          </Field>

          {/* Duration */}
          <Field label="Duration (Months)">
            <select
              value={form.months}
              onChange={(e) => set("months", e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white input-glow transition-all"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24, 36].map((m) => (
                <option key={m} value={m}>
                  {m} {m === 1 ? "Month" : "Months"}
                </option>
              ))}
            </select>
          </Field>

          {/* Start Date */}
          <Field label="Start Date">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white input-glow transition-all ${
                errors.startDate ? "border-red-500/60" : "border-white/10"
              }`}
              style={{ colorScheme: "dark" }}
            />

            {errors.startDate && (
              <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.startDate}
              </p>
            )}
          </Field>

          {/* Auto Calculated Maturity Date */}
          <div className="sm:col-span-2">
            <Field
              label="Maturity Date"
              hint="Automatically generated based on duration"
            >
              <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-blue-200 font-medium">
                {maturityDate || "Select start date"}
              </div>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 glow-blue"
          >
            <Plus size={15} />
            Add FDR
          </button>
        </div>
      </div>
    </div>
  );
}
