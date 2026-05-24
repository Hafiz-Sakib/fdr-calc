import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const HS = "'Hind Siliguri', sans-serif";
const MONO = "'DM Mono', monospace";

const BASE_INPUT = {
  background: '#070B14',
  border: '1px solid rgba(59,130,246,0.15)',
  borderRadius: '10px',
  color: '#E8EDF5',
  fontFamily: HS,
  fontSize: '14px',
  padding: '11px 14px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  width: '100%',
};

const empty = { label: '', principal: '', months: '3', rate: '', startDate: '', maturityDate: '' };

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontFamily: HS, fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontFamily: MONO, fontSize: '11px', color: '#EF4444' }}>{error}</span>}
    </div>
  );
}

export default function AddFDRModal({ onClose, onAdd, nextIndex }) {
  const [form, setForm] = useState({ ...empty, label: `FDR ${nextIndex}` });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoMaturity = (start, months) => {
    if (!start || !months) return '';
    const d = new Date(start);
    d.setMonth(d.getMonth() + parseInt(months));
    return d.toISOString().split('T')[0];
  };

  const handleStartChange = (v) => { set('startDate', v); if (form.months) set('maturityDate', autoMaturity(v, form.months)); };
  const handleMonthsChange = (v) => { set('months', v); if (form.startDate) set('maturityDate', autoMaturity(form.startDate, v)); };

  const validate = () => {
    const e = {};
    if (!form.label.trim()) e.label = 'Required';
    if (!form.principal || isNaN(form.principal) || Number(form.principal) <= 0) e.principal = 'Enter valid amount';
    if (!form.rate || isNaN(form.rate) || Number(form.rate) <= 0) e.rate = 'Enter valid rate';
    if (!form.startDate) e.startDate = 'Required';
    if (!form.maturityDate) e.maturityDate = 'Required';
    if (form.startDate && form.maturityDate && new Date(form.maturityDate) <= new Date(form.startDate)) e.maturityDate = 'Must be after start';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onAdd({ label: form.label.trim(), principal: Number(form.principal), months: Number(form.months), rate: Number(form.rate), startDate: form.startDate, maturityDate: form.maturityDate });
    onClose();
  };

  const inputStyle = (name) => ({
    ...BASE_INPUT,
    ...(focused === name ? { borderColor: 'rgba(59,130,246,0.5)', boxShadow: '0 0 0 3px rgba(59,130,246,0.1)' } : {}),
    ...(errors[name] ? { borderColor: 'rgba(239,68,68,0.4)' } : {}),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}>
      <div className="w-full overflow-hidden rounded-[20px]"
        style={{ maxWidth: '560px', background: '#0D1526', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(59,130,246,0.1)', animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
          <div>
            <div style={{ fontFamily: HS, fontSize: '20px', fontWeight: 700, color: '#E8EDF5', letterSpacing: '-0.3px' }}>Add New FDR</div>
            <div style={{ fontFamily: MONO, fontSize: '12px', color: '#64748B', marginTop: '3px' }}>Fixed Deposit Receipt</div>
          </div>
          <button onClick={onClose}
            className="w-[34px] h-[34px] flex items-center justify-center rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#EF4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#64748B'; }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="FDR Label" error={errors.label}>
              <input value={form.label} onChange={e => set('label', e.target.value)} placeholder="FDR 5"
                style={inputStyle('label')} onFocus={() => setFocused('label')} onBlur={() => setFocused('')} />
            </Field>
            <Field label="Principal Amount (Tk)" error={errors.principal}>
              <input type="number" value={form.principal} onChange={e => set('principal', e.target.value)} placeholder="100000"
                style={inputStyle('principal')} onFocus={() => setFocused('principal')} onBlur={() => setFocused('')} />
            </Field>
            <Field label="Interest Rate (%)" error={errors.rate}>
              <input type="number" step="0.1" value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="8.5"
                style={inputStyle('rate')} onFocus={() => setFocused('rate')} onBlur={() => setFocused('')} />
            </Field>
            <Field label="Term (Months)" error={errors.months}>
              <select value={form.months} onChange={e => handleMonthsChange(e.target.value)}
                style={{ ...inputStyle('months'), cursor: 'pointer' }}
                onFocus={() => setFocused('months')} onBlur={() => setFocused('')}>
                {[1,2,3,6,9,12,18,24,36].map(m => (
                  <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
                ))}
              </select>
            </Field>
            <Field label="Start Date" error={errors.startDate}>
              <input type="date" value={form.startDate} onChange={e => handleStartChange(e.target.value)}
                style={inputStyle('startDate')} onFocus={() => setFocused('startDate')} onBlur={() => setFocused('')} />
            </Field>
            <Field label="Maturity Date" error={errors.maturityDate}>
              <input type="date" value={form.maturityDate} onChange={e => set('maturityDate', e.target.value)}
                style={inputStyle('maturityDate')} onFocus={() => setFocused('maturityDate')} onBlur={() => setFocused('')} />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-7 pb-7">
          <button onClick={onClose} className="transition-all"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B', padding: '10px 22px', borderRadius: '10px', fontFamily: HS, fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='#94A3B8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#64748B'; }}>
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 transition-all hover:-translate-y-px"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', color: 'white', padding: '10px 26px', borderRadius: '10px', fontFamily: HS, fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.35)' }}>
            <Plus size={16} /> Add FDR
          </button>
        </div>
      </div>
    </div>
  );
}
