import { useState } from 'react';

const UNITS = [
  { id: 'Unit 1', officer: 'Sgt. Dlamini', status: 'On Call', location: 'Cape Town Central', lat: '38%', lng: '42%' },
  { id: 'Unit 3', officer: 'Cst. Jacobs', status: 'Responding', location: 'Sea Point', lat: '55%', lng: '30%' },
  { id: 'Unit 5', officer: 'Cst. Peters', status: 'On Scene', location: 'Observatory', lat: '65%', lng: '55%' },
  { id: 'Unit 7', officer: 'Lt. Marais', status: 'Responding', location: 'Long Street CBD', lat: '40%', lng: '50%' },
  { id: 'Unit 9', officer: 'Sgt. Botha', status: 'Available', location: 'Bellville', lat: '30%', lng: '70%' },
  { id: 'Unit 12', officer: 'Cst. Nkosi', status: 'Responding', location: 'Greenpoint', lat: '25%', lng: '35%' },
];

const STATUS_COLOR = { 'On Call': 'var(--bl)', Responding: 'var(--am)', 'On Scene': 'var(--rd)', Available: 'var(--gn)' };
const STATUS_BADGE = { 'On Call': 'b-rev', Responding: 'b-pen', 'On Scene': 'b-cri', Available: 'b-act' };

const CALLS = [
  { level: 'urg', id: '#INC-4825', type: 'Armed Robbery', location: '45 Long Street, CBD', unit: 'Unit 7', time: '2m' },
  { level: 'med', id: '#INC-4824', type: 'Assault', location: 'Greenpoint Park', unit: 'Unit 12', time: '18m' },
  { level: 'nrm', id: '#INC-4820', type: 'Noise Complaint', location: 'Observatory', unit: 'Unit 5', time: '34m' },
  { level: 'ong', id: '#INC-4818', type: 'Fraud Investigation', location: 'Remote/Online', unit: 'Unit 3', time: '1h' },
];

export default function DispatchBoard() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Dispatch Board</div>
        <div className="page-title">Live Dispatch Board</div>
        <div className="page-desc">Real-time unit tracking, incident assignment and dispatch coordination for Cape Town Metro.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Map */}
        <div>
          <div className="map-box" style={{ height: 340, marginBottom: 14 }}>
            <div className="map-grid" />
            {UNITS.map(u => (
              <div key={u.id} style={{ position: 'absolute', top: u.lat, left: u.lng, cursor: 'pointer' }} onClick={() => setSelected(u)}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: STATUS_COLOR[u.status],
                  border: '2px solid rgba(0,0,0,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: 'white',
                  boxShadow: `0 0 8px ${STATUS_COLOR[u.status]}66`,
                  transform: 'translate(-50%,-50%)',
                }}>
                  {u.id.replace('Unit ', 'U')}
                </div>
              </div>
            ))}
            {selected && (
              <div style={{ position: 'absolute', top: selected.lat, left: selected.lng, transform: 'translate(-50%,-130%)', background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 6, padding: '7px 10px', fontSize: 11, whiteSpace: 'nowrap', zIndex: 10 }}>
                <div style={{ fontWeight: 600 }}>{selected.id} — {selected.officer}</div>
                <div style={{ color: 'var(--txd)' }}>{selected.location}</div>
                <span className={`b ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>
              </div>
            )}
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {['+','−'].map(b => <div key={b} style={{ width: 24, height: 24, background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--txd)', cursor: 'pointer' }}>{b}</div>)}
            </div>
            {/* Legend */}
            <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(13,18,32,.85)', border: '1px solid var(--bd)', borderRadius: 5, padding: '6px 10px', fontSize: 10 }}>
              {Object.entries(STATUS_COLOR).map(([s, c]) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  <span style={{ color: 'var(--txm)' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Units table */}
          <div className="card">
            <div className="card-header"><span className="card-title">Unit Status</span></div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="wt">
                <thead><tr><th>Unit</th><th>Officer</th><th>Status</th><th>Location</th><th>Action</th></tr></thead>
                <tbody>
                  {UNITS.map(u => (
                    <tr key={u.id}>
                      <td className="mono" style={{ fontSize: 11 }}>{u.id}</td>
                      <td>{u.officer}</td>
                      <td><span className={`b ${STATUS_BADGE[u.status]}`}>{u.status}</span></td>
                      <td style={{ fontSize: 11 }}>{u.location}</td>
                      <td><button className="btn btn-secondary btn-sm">Dispatch</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Active calls */}
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Active Calls</div>
          {CALLS.map((c, i) => (
            <div key={i} className={`dispatch-card ${c.level}`} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{c.id}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{c.type}</div>
              <div style={{ fontSize: 11, color: 'var(--txd)', marginBottom: 6 }}>{c.location}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--blb)' }}>{c.unit}</span>
                <button className="btn btn-secondary btn-sm">Reassign</button>
              </div>
            </div>
          ))}
          <div className="dv" />
          <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
            🚨 New Emergency Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}
