import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import './AddFDRModal.css';

const empty = {
  label: '',
  principal: '',
  months: '3',
  rate: '',
  startDate: '',
  maturityDate: '',
};

export default function AddFDRModal({ onClose, onAdd, nextIndex }) {
  const [form, setForm] = useState({ ...empty, label: `FDR ${nextIndex}` });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoMaturity = (start, months) => {
    if (!start || !months) return '';
    const d = new Date(start);
    d.setMonth(d.getMonth() + parseInt(months));
    return d.toISOString().split('T')[0];
  };

  const handleStartChange = (v) => {
    set('startDate', v);
    if (form.months) set('maturityDate', autoMaturity(v, form.months));
  };

  const handleMonthsChange = (v) => {
    set('months', v);
    if (form.startDate) set('maturityDate', autoMaturity(form.startDate, v));
  };

  const validate = () => {
    const e = {};
    if (!form.label.trim()) e.label = 'Required';
    if (!form.principal || isNaN(form.principal) || Number(form.principal) <= 0) e.principal = 'Enter valid amount';
    if (!form.rate || isNaN(form.rate) || Number(form.rate) <= 0) e.rate = 'Enter valid rate';
    if (!form.startDate) e.startDate = 'Required';
    if (!form.maturityDate) e.maturityDate = 'Required';
    if (form.startDate && form.maturityDate && new Date(form.maturityDate) <= new Date(form.startDate))
      e.maturityDate = 'Must be after start';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onAdd({
      label: form.label.trim(),
      principal: Number(form.principal),
      months: Number(form.months),
      rate: Number(form.rate),
      startDate: form.startDate,
      maturityDate: form.maturityDate,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Add New FDR</div>
            <div className="modal-sub">Fixed Deposit Receipt</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <Field label="FDR Label" error={errors.label}>
              <input value={form.label} onChange={e => set('label', e.target.value)} placeholder="FDR 5" />
            </Field>
            <Field label="Principal Amount (Tk)" error={errors.principal}>
              <input type="number" value={form.principal} onChange={e => set('principal', e.target.value)} placeholder="100000" />
            </Field>
            <Field label="Interest Rate (%)" error={errors.rate}>
              <input type="number" step="0.1" value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="8.5" />
            </Field>
            <Field label="Term (Months)" error={errors.months}>
              <select value={form.months} onChange={e => handleMonthsChange(e.target.value)}>
                {[1,2,3,6,9,12,18,24,36].map(m => (
                  <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
                ))}
              </select>
            </Field>
            <Field label="Start Date" error={errors.startDate}>
              <input type="date" value={form.startDate} onChange={e => handleStartChange(e.target.value)} />
            </Field>
            <Field label="Maturity Date" error={errors.maturityDate}>
              <input type="date" value={form.maturityDate} onChange={e => set('maturityDate', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-add" onClick={handleSubmit}>
            <Plus size={16} /> Add FDR
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
