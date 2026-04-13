export default function PatrolMap() {
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Patrol Map</div>
        <div className="page-title">Patrol Map</div>
        <div className="page-desc">Live patrol routes, sector assignments, hotspots and real-time unit locations.</div>
      </div>
      <div className="alert alert-in" style={{ marginBottom: 14 }}>
        <div className="alert-icon">i</div>
        Your patrol sector: <strong>Sector B — Cape Town CBD / Greenpoint</strong>. Current shift: 07:00–19:00.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        <div className="map-box" style={{ height: 480 }}>
          <div className="map-grid" />
          {/* Sectors */}
          {[
            { top: '20%', left: '20%', w: '30%', h: '25%', color: 'rgba(59,130,246,.06)', border: 'rgba(59,130,246,.2)', label: 'Sector A' },
            { top: '20%', left: '52%', w: '28%', h: '25%', color: 'rgba(16,185,129,.05)', border: 'rgba(16,185,129,.18)', label: 'Sector B' },
            { top: '48%', left: '20%', w: '30%', h: '25%', color: 'rgba(245,158,11,.05)', border: 'rgba(245,158,11,.18)', label: 'Sector C' },
            { top: '48%', left: '52%', w: '28%', h: '25%', color: 'rgba(139,92,246,.05)', border: 'rgba(139,92,246,.18)', label: 'Sector D' },
          ].map(s => (
            <div key={s.label} style={{ position: 'absolute', top: s.top, left: s.left, width: s.w, height: s.h, background: s.color, border: `1px dashed ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--txd)', fontFamily: "'IBM Plex Mono',monospace" }}>{s.label}</span>
            </div>
          ))}
          {/* Hotspots */}
          <div style={{ position: 'absolute', top: '30%', left: '35%', width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,.08)', border: '1px dashed rgba(239,68,68,.28)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '55%', width: 40, height: 40, borderRadius: '50%', background: 'rgba(245,158,11,.06)', border: '1px dashed rgba(245,158,11,.25)' }} />
          {/* My unit */}
          <div style={{ position: 'absolute', top: '38%', left: '56%', width: 20, height: 20, borderRadius: '50%', background: 'var(--bl)', boxShadow: '0 0 10px rgba(59,130,246,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', fontWeight: 700, transform: 'translate(-50%,-50%)' }}>U1</div>
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {['+','−'].map(b => <div key={b} style={{ width: 24, height: 24, background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--txd)', cursor: 'pointer' }}>{b}</div>)}
          </div>
        </div>
        <div>
          <div className="stat-card accent-bl" style={{ marginBottom: 10 }}>
            <div className="stat-label">Your Location</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Sector B</div>
            <div style={{ fontSize: 11, color: 'var(--txd)', marginTop: 4 }}>Cape Town CBD · Greenpoint</div>
          </div>
          <div className="card" style={{ marginBottom: 10 }}>
            <div className="card-header"><span className="card-title">Hotspots Today</span></div>
            <div className="card-body">
              {[
                { dot: 'var(--rd)', name: 'Long Street area', count: '4 incidents' },
                { dot: 'var(--am)', name: 'Greenpoint Park', count: '2 incidents' },
                { dot: 'var(--gn)', name: 'Sea Point Prom.', count: '1 incident' },
              ].map((h, i) => (
                <div key={i} className="notif-item">
                  <div className="notif-dot" style={{ background: h.dot }} />
                  <div><div className="notif-title">{h.name}</div><div className="notif-sub">{h.count}</div></div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Update My Location</button>
        </div>
      </div>
    </div>
  );
}
