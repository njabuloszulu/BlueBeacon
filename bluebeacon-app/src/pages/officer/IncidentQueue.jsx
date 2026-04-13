import { useState } from 'react';

const INCIDENTS = [
  { id: '#INC-4825', type: 'Robbery', priority: 'Urgent', status: 'New', location: '45 Long Street, CBD', reported: '10m', assigned: null },
  { id: '#INC-4824', type: 'Assault', priority: 'High', status: 'New', location: 'Greenpoint Park', reported: '18m', assigned: null },
  { id: '#INC-4823', type: 'Theft', priority: 'Medium', status: 'Assigned', location: 'Sea Point Promenade', reported: '1h', assigned: 'Cst. Jacobs' },
  { id: '#INC-4821', type: 'Theft', priority: 'Medium', status: 'Investigating', location: 'Long Street Café', reported: '3h', assigned: 'Sgt. Dlamini' },
  { id: '#INC-4820', type: 'Noise', priority: 'Low', status: 'On Scene', location: 'Observatory', reported: '4h', assigned: 'Cst. Peters' },
  { id: '#INC-4819', type: 'Assault', priority: 'High', status: 'Pending', location: 'Woodstock Market', reported: '5h', assigned: 'Sgt. Dlamini' },
  { id: '#INC-4818', type: 'Fraud', priority: 'Low', status: 'Assigned', location: 'Online', reported: '8h', assigned: 'Det. Moyo' },
];

const PRI_BADGE = { Urgent: 'b-cri', High: 'b-hi', Medium: 'b-me', Low: 'b-lo' };
const STA_BADGE = { New: 'b-rev', Assigned: 'b-pen', Investigating: 'b-act', 'On Scene': 'b-on', Pending: 'b-pen' };

export default function IncidentQueue() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(INCIDENTS[0]);

  const filtered = filter === 'All' ? INCIDENTS : INCIDENTS.filter(i => i.priority === filter || i.status === filter);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Incident Queue</div>
        <div className="page-title">Incident Queue</div>
        <div className="page-desc">All incoming and active incidents for Cape Town Central. Prioritised by severity and time.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div>
          {/* Filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {['All', 'Urgent', 'High', 'New', 'Assigned'].map(f => (
              <div key={f} onClick={() => setFilter(f)} style={{
                padding: '3px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                background: filter === f ? 'rgba(59,130,246,.1)' : 'var(--s3)',
                border: filter === f ? '1px solid var(--bl)' : '1px solid var(--bd)',
                color: filter === f ? 'var(--blb)' : 'var(--txd)',
              }}>{f}</div>
            ))}
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="wt">
                <thead><tr><th>Ref</th><th>Type</th><th>Priority</th><th>Status</th><th>Location</th><th>Assigned</th><th>Age</th></tr></thead>
                <tbody>
                  {filtered.map(inc => (
                    <tr key={inc.id} onClick={() => setSelected(inc)} style={{ cursor: 'pointer', background: selected?.id === inc.id ? 'rgba(59,130,246,.05)' : 'transparent' }}>
                      <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>{inc.id}</td>
                      <td>{inc.type}</td>
                      <td><span className={`b ${PRI_BADGE[inc.priority]}`}>{inc.priority}</span></td>
                      <td><span className={`b ${STA_BADGE[inc.status]}`}>{inc.status}</span></td>
                      <td style={{ fontSize: 11 }}>{inc.location}</td>
                      <td style={{ fontSize: 11, color: inc.assigned ? 'var(--txm)' : 'var(--txd)' }}>{inc.assigned || '—'}</td>
                      <td className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{inc.reported}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{selected.id}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.type} — {selected.location}</div>
              </div>
              <span className={`b ${PRI_BADGE[selected.priority]}`}>{selected.priority}</span>
            </div>
            <div className="card-body">
              <div className="g2" style={{ gap: 8, fontSize: 12, marginBottom: 14 }}>
                <div><div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>STATUS</div><span className={`b ${STA_BADGE[selected.status]}`}>{selected.status}</span></div>
                <div><div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>REPORTED</div><div>{selected.reported} ago</div></div>
                <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>LOCATION</div><div>{selected.location}</div></div>
                <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>ASSIGNED OFFICER</div><div>{selected.assigned || 'Unassigned'}</div></div>
              </div>

              <div className="dv" />
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="btn btn-primary">Assign to Me</button>
                <button className="btn btn-warning">Reassign Officer</button>
                <button className="btn btn-success">Mark Resolved</button>
                <button className="btn btn-secondary">Open Full Docket</button>
              </div>

              <div className="dv" />
              <div className="form-group">
                <label className="form-label">Add Note</label>
                <textarea className="form-textarea" rows={3} placeholder="Officer notes…" />
              </div>
              <button className="btn btn-secondary btn-sm">Save Note</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
