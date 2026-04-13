import { useState } from 'react';

const ALERTS = [
  { id: 1, type: 'em', dot: 'var(--rd)', icon: '🚨', title: 'Active Robbery Alert', detail: 'Greenpoint · armed suspect last seen heading north on Main Road', time: '8m ago', area: 'Greenpoint' },
  { id: 2, type: 'wa', dot: 'var(--am)', icon: '⚠️', title: 'Roadblock — N1 North', detail: 'CPT Metro Police checkpoint near Century City off-ramp. Expect delays.', time: '2h ago', area: 'Century City' },
  { id: 3, type: 'in', dot: 'var(--bl)', icon: 'ℹ️', title: 'Report #4821 Updated', detail: 'Officer Sgt. N. Dlamini has been assigned to your case. Investigation underway.', time: '3h ago', area: 'System' },
  { id: 4, type: 'wa', dot: 'var(--am)', icon: '⚠️', title: 'Load-shedding Schedule', detail: 'Stage 3 — your area (Woodstock) affected 18:00–22:00 tonight.', time: '4h ago', area: 'Woodstock' },
  { id: 5, type: 'su', dot: 'var(--gn)', icon: '✅', title: 'Suspect Apprehended', detail: 'The suspect linked to the Sea Point vehicle break-ins has been arrested.', time: '6h ago', area: 'Sea Point' },
  { id: 6, type: 'em', dot: 'var(--rd)', icon: '🚨', title: 'Missing Child Alert', detail: 'Lethiwe M., 8yrs, last seen Athlone Shopping Centre at 14:30. Contact 10111.', time: '8h ago', area: 'Athlone' },
];

const TYPE_CLASS = { em: 'alert-em', wa: 'alert-wa', in: 'alert-in', su: 'alert-su' };

export default function Alerts() {
  const [dismissed, setDismissed] = useState([]);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Alerts</div>
        <div className="page-title">Area Alerts & Notifications</div>
        <div className="page-desc">Live safety alerts, case updates and community notifications for your area.</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{ALERTS.length - dismissed.length} active alerts</div>
        <button className="btn btn-secondary btn-sm" onClick={() => setDismissed(ALERTS.map(a => a.id))}>Dismiss All</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ALERTS.filter(a => !dismissed.includes(a.id)).map(a => (
          <div key={a.id} className={`alert ${TYPE_CLASS[a.type]}`} style={{ alignItems: 'flex-start', gap: 12, padding: 14 }}>
            <div className="alert-icon" style={{ marginTop: 2 }}>!</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{a.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", opacity: .7 }}>{a.time}</span>
              </div>
              <div style={{ fontSize: 12, opacity: .85, lineHeight: 1.6 }}>{a.detail}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'rgba(255,255,255,.05)', fontFamily: "'IBM Plex Mono',monospace" }}>{a.area}</span>
              </div>
            </div>
            <button onClick={() => setDismissed(d => [...d, a.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: .5, fontSize: 14, padding: 2 }}>×</button>
          </div>
        ))}
        {ALERTS.filter(a => !dismissed.includes(a.id)).length === 0 && (
          <div className="alert alert-su">
            <div className="alert-icon">✓</div>
            All caught up — no active alerts in your area.
          </div>
        )}
      </div>

      <div className="dv" style={{ margin: '20px 0' }} />
      <div className="card">
        <div className="card-header"><span className="card-title">Alert Preferences</span></div>
        <div className="card-body">
          {[
            { label: 'Critical safety alerts (recommended)', on: true },
            { label: 'Nearby incident reports', on: true },
            { label: 'My case status updates', on: true },
            { label: 'Community watch notifications', on: false },
            { label: 'Road closures & load-shedding', on: false },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
              <span style={{ fontSize: 12 }}>{p.label}</span>
              <div className={`toggle ${p.on ? 'on' : 'off'}`}><div className="toggle-knob" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
