import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubmitIncident } from '../../hooks/useCivilianApi';
import toast from 'react-hot-toast';

const fileIcon = (file) => {
  if (file.type.startsWith('image/')) return '🖼';
  if (file.type.startsWith('video/')) return '📹';
  if (file.type.startsWith('audio/')) return '🎵';
  if (file.type === 'application/pdf') return '📄';
  return '📎';
};

const INCIDENT_TYPES = [
  { icon: '🔪', label: 'Assault / GBH', color: 'rgba(239,68,68,.1)', border: 'rgba(239,68,68,.4)', textColor: 'var(--rdb)' },
  { icon: '💰', label: 'Theft / Robbery' },
  { icon: '🚗', label: 'Vehicle Crime' },
  { icon: '🏠', label: 'Burglary' },
  { icon: '📱', label: 'Fraud / Scam' },
  { icon: '👁️', label: 'Missing Person' },
  { icon: '💊', label: 'Drug Activity' },
  { icon: '📢', label: 'Noise / Nuisance' },
];

const STEPS = ['Type', 'Urgency', 'Describe', 'Location', 'Media', 'Review'];

export default function ReportIncidentWizard() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [otherText, setOtherText] = useState('');
  const [urgency, setUrgency] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [description, setDescription] = useState('');
  const [suspect1, setSuspect1] = useState('');
  const [suspect2, setSuspect2] = useState('');
  const [street, setStreet] = useState('');
  const [suburb, setSuburb] = useState('');
  const [locationLat, setLocationLat] = useState(-33.9249);
  const [locationLng, setLocationLng] = useState(18.4241);

  const navigate = useNavigate();
  const location = useLocation();
  const { rawUser } = useAuth();
  const { submitIncident } = useSubmitIncident();
  const mediaInputRef = useRef(null);

  useEffect(() => {
    const p = location.state?.prefill;
    if (p?.lat != null && p?.lng != null) {
      setLocationLat(Number(p.lat));
      setLocationLng(Number(p.lng));
      if (p.address) {
        const parts = String(p.address).split(',');
        setStreet(parts[0]?.trim() || '');
        setSuburb(parts.slice(1).join(',').trim() || '');
      }
      toast.success('Location pre-filled from map');
    }
  }, [location.state]);

  useEffect(() => {
    const d = new Date();
    setIncidentDate(d.toISOString().slice(0, 10));
    setIncidentTime(d.toTimeString().slice(0, 5));
  }, []);

  const addFiles = (incoming) => {
    setMediaFiles((prev) => [...prev, ...Array.from(incoming)]);
  };

  const incidentTypeLabel =
    selected === 'Other' ? (otherText.trim() || 'Other') : selected || '';

  function buildDescription() {
    const parts = [
      `Urgency: ${urgency || 'n/a'}`,
      `When: ${incidentDate} ${incidentTime}`,
      '',
      description.trim(),
      '',
      suspect1.trim() ? `Suspect 1: ${suspect1.trim()}` : '',
      suspect2.trim() ? `Suspect 2: ${suspect2.trim()}` : '',
    ];
    return parts.filter(Boolean).join('\n');
  }

  async function handleFinalSubmit() {
    if (!rawUser?.id) {
      toast.error('You must be signed in to report an incident.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('reporterId', rawUser.id);
      fd.append('incidentType', incidentTypeLabel);
      fd.append('description', buildDescription());
      fd.append('locationLat', String(locationLat));
      fd.append('locationLng', String(locationLng));
      mediaFiles.forEach((f) => fd.append('media', f));
      const created = await submitIncident(fd);
      toast.success('Report submitted');
      navigate('/civilian/my-reports', { replace: true, state: { highlightId: created?.id } });
    } catch {
      /* api interceptor shows toast */
    } finally {
      setSubmitting(false);
    }
  }

  function useGps() {
    if (!navigator.geolocation) {
      toast.error('Geolocation not available');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLat(pos.coords.latitude);
        setLocationLng(pos.coords.longitude);
        toast.success('GPS location captured');
      },
      () => toast.error('Could not read GPS')
    );
  }

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Report Incident</div>
        <div className="page-title">Report an Incident</div>
        <div className="page-desc">
          Guided wizard. If in immediate danger, use the SOS button from Alerts or your device.
        </div>
      </div>

      <div className="step-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--bd)', marginBottom: 20 }}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              padding: '8px 14px',
              fontSize: 11,
              cursor: i < step ? 'pointer' : 'default',
              borderBottom:
                i === step ? '2px solid var(--bl)' : i < step ? '2px solid var(--gn)' : '2px solid transparent',
              color: i === step ? 'var(--blb)' : i < step ? 'var(--gnb)' : 'var(--txd)',
              background: i <= step ? (i < step ? 'rgba(16,185,129,.05)' : 'rgba(59,130,246,.05)') : 'transparent',
            }}
            onClick={() => i < step && setStep(i)}
          >
            {i < step ? '✓ ' : i === step ? '● ' : ''}
            {s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>What happened?</div>
          <div style={{ fontSize: 12, color: 'var(--txm)', marginBottom: 16 }}>
            Select the category that best describes your situation
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 10 }}>
            {INCIDENT_TYPES.map((t) => (
              <div
                key={t.label}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(t.label)}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(t.label)}
                style={{
                  padding: '20px 12px',
                  background: selected === t.label ? (t.color || 'rgba(59,130,246,.1)') : 'var(--s3)',
                  border: selected === t.label ? `2px solid ${t.border || 'rgba(59,130,246,.4)'}` : '1px solid var(--bd)',
                  borderRadius: 8,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 8 }}>{t.icon}</div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: selected === t.label ? (t.textColor || 'var(--blb)') : 'var(--txm)',
                  }}
                >
                  {t.label}
                </div>
              </div>
            ))}
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelected('Other')}
            onKeyDown={(e) => e.key === 'Enter' && setSelected('Other')}
            style={{
              padding: '14px 16px',
              background: selected === 'Other' ? 'rgba(59,130,246,.08)' : 'var(--s3)',
              border: selected === 'Other' ? '2px solid rgba(59,130,246,.4)' : '1px solid var(--bd)',
              borderRadius: 8,
              cursor: 'text',
              transition: 'all .15s',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: selected === 'Other' ? 10 : 0 }}>
              <span style={{ fontSize: 18 }}>⋯</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: selected === 'Other' ? 'var(--blb)' : 'var(--txm)' }}>
                Other — describe your incident type
              </span>
            </div>
            {selected === 'Other' && (
              <textarea
                autoFocus
                className="form-textarea"
                rows={3}
                placeholder="Briefly describe what happened…"
                value={otherText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setOtherText(e.target.value)}
                style={{ marginBottom: 0 }}
              />
            )}
          </div>

          {selected && (
            <div className="alert alert-wa" style={{ marginBottom: 12 }}>
              <div className="alert-icon">!</div>
              Selected: <strong>{incidentTypeLabel}</strong>
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={!selected || (selected === 'Other' && !otherText.trim())}
            onClick={() => selected && (selected !== 'Other' || otherText.trim()) && setStep(1)}
          >
            Continue to Urgency →
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>How urgent is this?</div>
          <div style={{ fontSize: 12, color: 'var(--txm)', marginBottom: 16 }}>This helps dispatch prioritise your report</div>
          {[
            { level: 'Immediate', desc: 'Life at risk, suspect still present', color: 'var(--rd)', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.3)' },
            { level: 'High', desc: 'Crime just occurred, suspect fled', color: 'var(--am)', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.3)' },
            { level: 'Medium', desc: 'Crime occurred in last few hours', color: 'var(--bl)', bg: 'rgba(59,130,246,.08)', border: 'rgba(59,130,246,.3)' },
            { level: 'Low', desc: 'Old incident or general report', color: 'var(--gn)', bg: 'rgba(16,185,129,.08)', border: 'rgba(16,185,129,.3)' },
          ].map((u) => (
            <div
              key={u.level}
              role="button"
              tabIndex={0}
              onClick={() => setUrgency(u.level)}
              onKeyDown={(e) => e.key === 'Enter' && setUrgency(u.level)}
              style={{
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
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: u.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: urgency === u.level ? u.color : 'var(--tx)' }}>
                  {u.level} Priority
                </div>
                <div style={{ fontSize: 11, color: 'var(--txm)' }}>{u.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(0)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={!urgency}
              onClick={() => urgency && setStep(2)}
            >
              Next: Describe →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Describe the incident</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Incident</label>
              <input className="form-input mono" type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Time (approx.)</label>
              <input className="form-input mono" type="time" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">What happened? (Describe in detail)</label>
            <textarea className="form-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Suspect 1 — Description</label>
            <textarea className="form-textarea" rows={3} value={suspect1} onChange={(e) => setSuspect1(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Suspect 2 — Description (optional)</label>
            <textarea className="form-textarea" rows={3} value={suspect2} onChange={(e) => setSuspect2(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(3)}>
              Next: Location →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Where did it happen?</div>
          <div style={{ fontSize: 12, color: 'var(--txd)', marginBottom: 12 }}>Use GPS or enter address; coordinates are sent with your report.</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              className="form-input"
              placeholder="Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={useGps}>
              📍 Use GPS
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input className="form-input mono" value={locationLat} onChange={(e) => setLocationLat(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input className="form-input mono" value={locationLng} onChange={(e) => setLocationLng(Number(e.target.value))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input className="form-input" value={street} onChange={(e) => setStreet(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Suburb / Area</label>
              <input className="form-input" value={suburb} onChange={(e) => setSuburb(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(4)}>
              Next: Upload Media →
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Upload Evidence</div>
          <div style={{ fontSize: 12, color: 'var(--txd)', marginBottom: 16 }}>Photos, videos, audio or documents (optional)</div>
          <input
            ref={mediaInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />
          <div
            role="button"
            tabIndex={0}
            onClick={() => mediaInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && mediaInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            style={{
              border: `2px dashed ${mediaFiles.length ? 'var(--bl)' : 'var(--bdb)'}`,
              borderRadius: 8,
              padding: 32,
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 12,
              background: mediaFiles.length ? 'rgba(59,130,246,.03)' : 'transparent',
              transition: 'all .15s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Drag files here or click to browse</div>
            <div style={{ fontSize: 11, color: 'var(--txd)' }}>Images / video / audio / PDF · max 5 files</div>
          </div>
          {mediaFiles.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {mediaFiles.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    background: 'var(--s3)',
                    border: '1px solid var(--bd)',
                    borderRadius: 6,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{fileIcon(f)}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--txm)',
                      maxWidth: 140,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {f.name}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && setMediaFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{ fontSize: 10, color: 'var(--txd)', cursor: 'pointer', marginLeft: 2 }}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(3)}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(5)}>
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Review Your Report</div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header">
              <span className="card-title">Incident Details</span>
            </div>
            <div className="card-body">
              <div className="g2" style={{ gap: 8, fontSize: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>TYPE</div>
                  <span className="b b-cri">{incidentTypeLabel}</span>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>URGENCY</div>
                  <span className="b b-hi">{urgency}</span>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>DATE / TIME</div>
                  <div>
                    {incidentDate} · {incidentTime}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>LOCATION</div>
                  <div>
                    {street}
                    {suburb ? `, ${suburb}` : ''} · {locationLat.toFixed(5)}, {locationLng.toFixed(5)}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 4 }}>MEDIA</div>
                  <div style={{ fontSize: 11 }}>{mediaFiles.length ? `${mediaFiles.length} file(s)` : 'None'}</div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(59,130,246,.05)',
              border: '1px solid rgba(59,130,246,.15)',
              borderRadius: 5,
              fontSize: 11,
              color: 'var(--txm)',
              marginBottom: 12,
            }}
          >
            I confirm this information is accurate and I understand making a false report may be a criminal offence.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(4)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={submitting}
              onClick={handleFinalSubmit}
            >
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
