import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSos } from '../../hooks/useCivilianApi';

const ALERTS = [
  { id: 1, type: 'em', dot: 'var(--rd)', icon: '🚨', title: 'Active Robbery Alert', detail: 'Greenpoint · armed suspect last seen heading north on Main Road', time: '8m ago', area: 'Greenpoint' },
  { id: 2, type: 'wa', dot: 'var(--am)', icon: '⚠️', title: 'Roadblock — N1 North', detail: 'CPT Metro Police checkpoint near Century City off-ramp. Expect delays.', time: '2h ago', area: 'Century City' },
  { id: 3, type: 'in', dot: 'var(--bl)', icon: 'ℹ️', title: 'Report updated', detail: 'Case status may change in real time under My Reports.', time: '3h ago', area: 'System' },
];

const TYPE_CLASS = { em: 'alert-em', wa: 'alert-wa', in: 'alert-in', su: 'alert-su' };

export default function Alerts() {
  const [dismissed, setDismissed] = useState([]);
  const { sendSos } = useSos();
  const [sosBusy, setSosBusy] = useState(false);
  const photoRef = useRef(null);

  async function triggerSos() {
    setSosBusy(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('No GPS'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });
      const fd = new FormData();
      fd.append('lat', String(pos.coords.latitude));
      fd.append('lng', String(pos.coords.longitude));
      fd.append('message', 'SOS — civilian emergency');
      const file = photoRef.current?.files?.[0];
      if (file) fd.append('photo', file);
      await sendSos(fd);
      toast.success('SOS sent — emergency services notified');
    } catch {
      toast.error('Could not send SOS (GPS or network)');
    } finally {
      setSosBusy(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Alerts</div>
        <div className="page-title">Area Alerts & Notifications</div>
        <div className="page-desc">POST /alerts/sos includes GPS and optional photo (multipart).</div>
      </div>

      <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(239,68,68,.35)' }}>
        <div className="card-header">
          <span className="card-title">Emergency SOS</span>
        </div>
        <div className="card-body">
          <input ref={photoRef} type="file" accept="image/*" capture="environment" style={{ marginBottom: 10 }} />
          <button type="button" className="btn btn-danger btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={sosBusy} onClick={triggerSos}>
            {sosBusy ? 'Sending…' : 'Send SOS with location'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{ALERTS.length - dismissed.length} sample alerts</div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDismissed(ALERTS.map((a) => a.id))}>
          Dismiss All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ALERTS.filter((a) => !dismissed.includes(a.id)).map((a) => (
          <div key={a.id} className={`alert ${TYPE_CLASS[a.type]}`} style={{ alignItems: 'flex-start', gap: 12, padding: 14 }}>
            <div className="alert-icon" style={{ marginTop: 2 }}>
              !
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{a.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", opacity: 0.7 }}>{a.time}</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.6 }}>{a.detail}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,.05)',
                    fontFamily: "'IBM Plex Mono',monospace",
                  }}
                >
                  {a.area}
                </span>
              </div>
            </div>
            <button type="button" onClick={() => setDismissed((d) => [...d, a.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5, fontSize: 14, padding: 2 }}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
