import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INCIDENT_TYPES = [
  { icon: '🔪', label: 'Assault / GBH', color: 'rgba(239,68,68,.1)', border: 'rgba(239,68,68,.4)', textColor: 'var(--rdb)' },
  { icon: '💰', label: 'Theft / Robbery' },
  { icon: '🚗', label: 'Vehicle Crime' },
  { icon: '🏠', label: 'Burglary' },
  { icon: '📱', label: 'Fraud / Scam' },
  { icon: '👁️', label: 'Missing Person' },
  { icon: '💊', label: 'Drug Activity' },
  { icon: '📢', label: 'Noise / Nuisance' },
  { icon: '⋯', label: 'Other' },
];

const STEPS = ['Type', 'Urgency', 'Describe', 'Location', 'Media', 'Review'];

export default function ReportIncident() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [urgency, setUrgency] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  if (submitted) {
    return (
      <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Report Submitted!</div>
          <div style={{ fontSize: 13, color: 'var(--txm)', marginBottom: 6 }}>Your incident has been recorded.</div>
          <div className="mono" style={{ fontSize: 13, color: 'var(--blb)', marginBottom: 20 }}>#INC-4825 — CAS-091-13-04-2026</div>
          <div className="alert alert-su" style={{ marginBottom: 20 }}>
            <div className="alert-icon">✓</div>
            An officer will be assigned within 2 hours. You'll receive SMS updates.
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/civilian/my-reports')}>
            Track My Report →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Report Incident</div>
        <div className="page-title">Report an Incident</div>
        <div className="page-desc">5-step guided wizard. Auto-saves at each step. If in immediate danger, use the SOS button.</div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--bd)', marginBottom: 20 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{
            padding: '8px 14px',
            fontSize: 11,
            cursor: i < step ? 'pointer' : 'default',
            borderBottom: i === step ? '2px solid var(--bl)' : i < step ? '2px solid var(--gn)' : '2px solid transparent',
            color: i === step ? 'var(--blb)' : i < step ? 'var(--gnb)' : 'var(--txd)',
            background: i <= step ? (i < step ? 'rgba(16,185,129,.05)' : 'rgba(59,130,246,.05)') : 'transparent',
          }} onClick={() => i < step && setStep(i)}>
            {i < step ? '✓ ' : i === step ? '● ' : ''}{s}
          </div>
        ))}
      </div>

      {/* Step 0 — Incident Type */}
      {step === 0 && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>What happened?</div>
          <div style={{ fontSize: 12, color: 'var(--txm)', marginBottom: 16 }}>Select the category that best describes your situation</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {INCIDENT_TYPES.map(t => (
              <div key={t.label}
                onClick={() => setSelected(t.label)}
                style={{
                  padding: '12px 8px',
                  background: selected === t.label ? (t.color || 'rgba(59,130,246,.1)') : 'var(--s3)',
                  border: selected === t.label ? `2px solid ${t.border || 'rgba(59,130,246,.4)'}` : '1px solid var(--bd)',
                  borderRadius: 7,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}>
                <div style={{ fontSize: 20, marginBottom: 5 }}>{t.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: selected === t.label ? (t.textColor || 'var(--blb)') : 'var(--txm)' }}>{t.label}</div>
              </div>
            ))}
          </div>
          {selected && (
            <div className="alert alert-wa" style={{ marginBottom: 12 }}>
              <div className="alert-icon">!</div>
              Selected: <strong>{selected}</strong> — If in immediate danger, use SOS button.
            </div>
          )}
          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={!selected} onClick={() => selected && setStep(1)}>
            Continue to Urgency →
          </button>
        </div>
      )}

      {/* Step 1 — Urgency */}
      {step === 1 && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>How urgent is this?</div>
          <div style={{ fontSize: 12, color: 'var(--txm)', marginBottom: 16 }}>This helps dispatch prioritise your report</div>
          {[
            { level: 'Immediate', desc: 'Life at risk, suspect still present', color: 'var(--rd)', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.3)' },
            { level: 'High', desc: 'Crime just occurred, suspect fled', color: 'var(--am)', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.3)' },
            { level: 'Medium', desc: 'Crime occurred in last few hours', color: 'var(--bl)', bg: 'rgba(59,130,246,.08)', border: 'rgba(59,130,246,.3)' },
            { level: 'Low', desc: 'Old incident or general report', color: 'var(--gn)', bg: 'rgba(16,185,129,.08)', border: 'rgba(16,185,129,.3)' },
          ].map(u => (
            <div key={u.level} onClick={() => setUrgency(u.level)} style={{
              padding: '14px 16px',
              background: urgency === u.level ? u.bg : 'var(--s3)',
              border: urgency === u.level ? `2px solid ${u.border}` : '1px solid var(--bd)',
              borderLeft: `4px solid ${u.color}`,
              borderRadius: 7,
              cursor: 'pointer',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: u.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: urgency === u.level ? u.color : 'var(--tx)' }}>{u.level} Priority</div>
                <div style={{ fontSize: 11, color: 'var(--txm)' }}>{u.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-primary" disabled={!urgency} onClick={() => urgency && setStep(2)}>Next: Describe →</button>
          </div>
        </div>
      )}

      {/* Step 2 — Describe */}
      {step === 2 && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Describe the incident</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Incident</label>
              <input className="form-input mono" defaultValue="2026-04-13" />
            </div>
            <div className="form-group">
              <label className="form-label">Time (approx.)</label>
              <input className="form-input mono" defaultValue="14:30" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">What happened? (Describe in detail)</label>
            <textarea className="form-textarea" rows={4} placeholder="Describe the incident clearly, including sequence of events…" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Suspect 1 — Description</label>
              <input className="form-input" placeholder="Height, clothing, features…" />
            </div>
            <div className="form-group">
              <label className="form-label">Suspect 2 (optional)</label>
              <input className="form-input" placeholder="Optional…" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Were there witnesses?</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Yes, 1–2 people', 'No witnesses', 'Unknown'].map(w => (
                <div key={w} style={{ padding: '6px 12px', background: 'var(--s3)', border: '1px solid var(--bd)', borderRadius: 5, fontSize: 11, color: 'var(--txm)', cursor: 'pointer' }}>{w}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <span style={{ fontSize: 10, color: 'var(--gn)' }}>✓ Auto-saved</span>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Location →</button>
          </div>
        </div>
      )}

      {/* Step 3 — Location */}
      {step === 3 && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Where did it happen?</div>
          <div style={{ fontSize: 12, color: 'var(--txd)', marginBottom: 12 }}>Drag the pin or type an address</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input className="form-input" defaultValue="45 Long Street, Cape Town CBD" style={{ flex: 1 }} />
            <button className="btn btn-secondary btn-sm">📍 Use GPS</button>
          </div>
          <div className="map-box" style={{ height: 200, marginBottom: 12 }}>
            <div className="map-grid" />
            <div style={{ position: 'absolute', top: '40%', left: '44%', width: 4, background: 'rgba(65,78,125,.13)', top: 0, bottom: 0 }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>📍 45 Long Street</div>
                <div style={{ color: 'var(--txd)' }}>Cape Town CBD</div>
              </div>
            </div>
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {['+', '−'].map(b => <div key={b} style={{ width: 22, height: 22, background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--txd)', cursor: 'pointer' }}>{b}</div>)}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input className="form-input" defaultValue="45 Long Street" />
            </div>
            <div className="form-group">
              <label className="form-label">Suburb</label>
              <input className="form-input" defaultValue="Cape Town CBD" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(4)}>Next: Upload Media →</button>
          </div>
        </div>
      )}

      {/* Step 4 — Media */}
      {step === 4 && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Upload Evidence</div>
          <div style={{ fontSize: 12, color: 'var(--txd)', marginBottom: 16 }}>Photos, videos, audio or documents (optional but helpful)</div>
          <div style={{ border: '2px dashed var(--bdb)', borderRadius: 8, padding: 32, textAlign: 'center', cursor: 'pointer', marginBottom: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Drag files here or click to browse</div>
            <div style={{ fontSize: 11, color: 'var(--txd)' }}>JPG, PNG, MP4, MP3, PDF · Max 50MB each</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['🖼', '📹'].map((icon, i) => (
              <div key={i} style={{ width: 56, height: 56, background: 'var(--s3)', border: '1px solid var(--bd)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(5)}>Next: Review →</button>
          </div>
        </div>
      )}

      {/* Step 5 — Review */}
      {step === 5 && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Review Your Report</div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header"><span className="card-title">Incident Details</span><span className="card-action">Edit</span></div>
            <div className="card-body">
              <div className="g2" style={{ gap: 8, fontSize: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>TYPE</div>
                  <span className="b b-cri">{selected || 'Assault / GBH'}</span>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>URGENCY</div>
                  <span className="b b-hi">{urgency || 'High'}</span>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>DATE / TIME</div>
                  <div>13 Apr 2026 · 14:30</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>LOCATION</div>
                  <div>45 Long Street, Cape Town CBD</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>MEDIA</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 40, height: 40, background: 'var(--s3)', border: '1px solid var(--bd)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🖼</div>
                    <div style={{ width: 40, height: 40, background: 'var(--s3)', border: '1px solid var(--bd)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📹</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '10px 12px', background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.15)', borderRadius: 5, fontSize: 11, color: 'var(--txm)', marginBottom: 12 }}>
            ☑ I confirm this information is accurate and I understand making a false report is a criminal offence under Section 319 of the Criminal Procedure Act.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setStep(4)}>← Back</button>
            <button className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSubmitted(true)}>
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
