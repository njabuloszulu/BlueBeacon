import { useState } from 'react';

const PINS = [
  { top: '35%', left: '40%', type: 'rd', label: 'Active Robbery', detail: 'Greenpoint · armed suspect' },
  { top: '55%', left: '60%', type: 'bl', label: 'Police Station', detail: 'Cape Town Central' },
  { top: '45%', left: '25%', type: 'gn', label: 'Safe Zone', detail: 'Neighbourhood Watch area' },
  { top: '25%', left: '65%', type: 'go', label: 'Road Closure', detail: 'N1 North — checkpoint' },
  { top: '65%', left: '45%', type: 'pu', label: 'CCTV Coverage', detail: 'High surveillance zone' },
];

const PIN_COLORS = { rd: 'var(--rd)', bl: 'var(--bl)', gn: 'var(--gn)', go: 'var(--am)', pu: 'var(--pu)' };

export default function LiveMap() {
  const [activePin, setActivePin] = useState(null);
  const [filter, setFilter] = useState('All');

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Live Map</div>
        <div className="page-title">Live Safety Map</div>
        <div className="page-desc">Real-time incident heatmap, police stations, and area alerts for Cape Town Metro.</div>
      </div>

      <div className="alert alert-wa" style={{ marginBottom: 16 }}>
        <div className="alert-icon">!</div>
        3 active incidents in your area. Last updated 2 minutes ago.
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {['All', 'Incidents', 'Stations', 'Alerts', 'Safe Zones'].map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{
            padding: '4px 12px', borderRadius: 10, fontSize: 11, cursor: 'pointer',
            background: filter === f ? 'var(--bl)' : 'var(--s3)',
            color: filter === f ? 'white' : 'var(--txm)',
            border: filter === f ? 'none' : '1px solid var(--bd)',
          }}>{f}</div>
        ))}
      </div>

      <div className="layout-split">
        {/* Map */}
        <div className="map-box" style={{ height: 460 }}>
          <div className="map-grid" />
          {/* Heat zones */}
          <div style={{ position: 'absolute', top: '25%', left: '30%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(239,68,68,.08)', border: '1px dashed rgba(239,68,68,.28)' }} />
          <div style={{ position: 'absolute', top: '45%', left: '50%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,158,11,.06)', border: '1px dashed rgba(245,158,11,.25)' }} />

          {/* Pins */}
          {PINS.map((pin, i) => (
            <div key={i} style={{ position: 'absolute', top: pin.top, left: pin.left, cursor: 'pointer' }} onClick={() => setActivePin(activePin === i ? null : i)}>
              <div style={{
                width: 14, height: 14, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
                background: PIN_COLORS[pin.type],
                boxShadow: `0 0 8px ${PIN_COLORS[pin.type]}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', transform: 'rotate(45deg)' }} />
              </div>
              {activePin === i && (
                <div style={{ position: 'absolute', top: -60, left: 0, background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 6, padding: '7px 10px', fontSize: 11, whiteSpace: 'nowrap', zIndex: 10 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{pin.label}</div>
                  <div style={{ color: 'var(--txd)' }}>{pin.detail}</div>
                </div>
              )}
            </div>
          ))}

          {/* Controls */}
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {['+', '−'].map(b => <div key={b} style={{ width: 24, height: 24, background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--txd)', cursor: 'pointer' }}>{b}</div>)}
          </div>

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(13,18,32,.85)', border: '1px solid var(--bd)', borderRadius: 6, padding: '8px 12px', fontSize: 10 }}>
            {[
              { color: 'var(--rd)', label: 'Active Incident' },
              { color: 'var(--bl)', label: 'Police Station' },
              { color: 'var(--gn)', label: 'Safe Zone' },
              { color: 'var(--am)', label: 'Road/Alert' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ color: 'var(--txm)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar incidents */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 10 }}>Active Incidents Nearby</div>
          {PINS.map((pin, i) => (
            <div key={i} onClick={() => setActivePin(activePin === i ? null : i)} style={{
              padding: 10, borderRadius: 7, border: `1px solid ${activePin === i ? PIN_COLORS[pin.type] : 'var(--bd)'}`,
              background: activePin === i ? `${PIN_COLORS[pin.type]}0d` : 'var(--s2)',
              cursor: 'pointer', marginBottom: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIN_COLORS[pin.type], flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{pin.label}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--txd)', marginLeft: 15 }}>{pin.detail}</div>
            </div>
          ))}

          <div className="dv" />
          <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
            🚨 Report Incident at My Location
          </button>
        </div>
      </div>
    </div>
  );
}
