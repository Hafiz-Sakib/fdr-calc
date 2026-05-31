import React, { useEffect, useState, useRef } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Loader, Mail } from 'lucide-react';
import { formatBD, formatDate, isSameDay, parseDate } from '../utils/fdrCalc';
import { sendMaturityNotifications, getMaturedToday, EMAILJS_CONFIG } from '../utils/emailNotification';

// ── Individual matured FDR row ────────────────────────────────────────────────
function MaturedFDRRow({ fdr }) {
  return (
    <div style={{
      background: 'rgba(124,58,237,0.08)',
      border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: '10px',
      padding: '12px 14px',
      marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px' }}>{fdr.label}</div>
          <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
            Principal: <span style={{ color: '#38bdf8' }}>Tk {formatBD(fdr.cyclePrincipal || fdr.principal)}</span>
            {' · '}Net Int: <span style={{ color: '#34d399' }}>Tk {formatBD(fdr.netCycleInterest || 0)}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: '15px' }}>
            Tk {formatBD(fdr.matAmt || 0)}
          </div>
          <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>Maturity Amt</div>
        </div>
      </div>
    </div>
  );
}

// ── Status icon ───────────────────────────────────────────────────────────────
function StatusIcon({ status }) {
  if (status === 'sending') return <Loader size={16} style={{ color: '#60a5fa', animation: 'spin 1s linear infinite' }} />;
  if (status === 'sent')    return <CheckCircle size={16} style={{ color: '#34d399' }} />;
  if (status === 'error')   return <AlertCircle size={16} style={{ color: '#f87171' }} />;
  if (status === 'no-config') return <AlertCircle size={16} style={{ color: '#fbbf24' }} />;
  return null;
}

// ── Main notification panel ───────────────────────────────────────────────────
export default function MaturityNotification({ fdrs, today }) {
  const [visible, setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [emailStatus, setEmailStatus] = useState('idle'); // idle|sending|sent|error|no-config|already-sent
  const [errorMsg, setErrorMsg] = useState('');
  const [matured, setMatured]   = useState([]);
  const hasFired = useRef(false);

  // Detect matured FDRs on load / when date changes
  useEffect(() => {
    const m = getMaturedToday(fdrs, today);
    setMatured(m);

    if (m.length === 0) {
      setVisible(false);
      return;
    }

    // Show panel
    setVisible(true);
    setDismissed(false);

    // Fire email once per date change (prevent double-fire in strict mode)
    if (hasFired.current) return;
    hasFired.current = true;

    const { serviceId, templateId, publicKey } = EMAILJS_CONFIG;
    if (!serviceId || !templateId || !publicKey) {
      setEmailStatus('no-config');
      return;
    }

    setEmailStatus('sending');
    sendMaturityNotifications(fdrs, today).then(result => {
      if (result.alreadySent) {
        setEmailStatus('already-sent');
      } else if (result.sent) {
        setEmailStatus('sent');
      } else if (result.error) {
        setEmailStatus('error');
        setErrorMsg(result.error);
      }
    });
  }, [today]); // fdrs intentionally omitted — we only re-check when date changes

  // Reset fire guard when date changes
  useEffect(() => {
    hasFired.current = false;
  }, [today]);

  if (!visible || dismissed || matured.length === 0) return null;

  const totalAmt = matured.reduce((s, f) => s + (f.matAmt || 0), 0);

  const statusText = {
    idle:          '',
    sending:       'Sending email notification…',
    sent:          `Email sent to ${EMAILJS_CONFIG.toEmail}`,
    error:         `Email failed: ${errorMsg}`,
    'no-config':   'EmailJS not configured — see EMAILJS_SETUP.md',
    'already-sent':'Notification already sent today',
  }[emailStatus] || '';

  const statusColor = {
    sending:       '#60a5fa',
    sent:          '#34d399',
    error:         '#f87171',
    'no-config':   '#fbbf24',
    'already-sent':'#94a3b8',
  }[emailStatus] || 'transparent';

  return (
    <>
      {/* Spin keyframes injected inline */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes fdrSlideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      <div style={{
        position: 'fixed',
        top: '80px',
        right: '16px',
        zIndex: 9999,
        width: 'min(420px, calc(100vw - 32px))',
        background: 'rgba(10, 14, 30, 0.97)',
        border: '1px solid rgba(124,58,237,0.4)',
        borderRadius: '16px',
        boxShadow: '0 0 40px rgba(124,58,237,0.15), 0 20px 60px rgba(0,0,0,0.6)',
        animation: 'fdrSlideIn 0.35s ease-out',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
      }}>

        {/* Top accent */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)' }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(124,58,237,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bell size={15} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '13px', lineHeight: 1 }}>
                FDR Maturity Alert
              </div>
              <div style={{ color: '#a78bfa', fontSize: '11px', marginTop: '3px' }}>
                {matured.length} FDR{matured.length > 1 ? 's' : ''} mature today
              </div>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b',
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* FDR list */}
        <div style={{ padding: '14px 16px' }}>
          {matured.map(fdr => <MaturedFDRRow key={fdr.id} fdr={fdr} />)}

          {/* Total */}
          {matured.length > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px',
              background: 'rgba(167,139,250,0.06)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: '8px',
              marginTop: '4px',
            }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700 }}>TOTAL MATURITY</span>
              <span style={{ color: '#a78bfa', fontWeight: 800, fontSize: '16px' }}>
                Tk {formatBD(totalAmt)}
              </span>
            </div>
          )}
        </div>

        {/* Email status bar */}
        {emailStatus !== 'idle' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(0,0,0,0.3)',
          }}>
            <Mail size={13} style={{ color: statusColor, flexShrink: 0 }} />
            <StatusIcon status={emailStatus} />
            <span style={{ color: statusColor, fontSize: '11px', lineHeight: 1.4 }}>
              {statusText}
            </span>
          </div>
        )}

      </div>
    </>
  );
}
