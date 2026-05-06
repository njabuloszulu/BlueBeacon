import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const REPORTS = [
  {
    id: '#INC-4821', type: 'Theft', title: 'Laptop theft — Long Street Café',
    status: 'Investigating', statusClass: 'b-act', date: '13 Apr · 14:35',
    officer: 'Sgt. N. Dlamini', station: 'Cape Town Central', cas: 'CAS-082-25-02-2026',
    progress: 3,
    timeline: [
      { label: 'Report submitted & acknowledged', time: '13 Apr · 14:35', state: 'done' },
      { label: 'Assigned to Sgt. N. Dlamini', time: '13 Apr · 15:02', state: 'done' },
      { label: 'Investigation in progress — CCTV reviewed', time: '13 Apr · 17:10', state: 'current' },
      { label: 'Forensic / follow-up pending', time: 'Upcoming', state: 'todo' },
      { label: 'Case resolution & closure', time: 'Pending', state: 'todo' },
    ],
  },
  {
    id: '#INC-4698', type: 'Vehicle', title: 'Vehicle break-in — Sea Point',
    status: 'Assigned', statusClass: 'b-pen', date: '12 Apr', officer: 'Cst. Jacobs', progress: 2,
  },
  {
    id: '#INC-4201', type: 'Fraud', title: 'Online fraud — banking',
    status: 'Closed', statusClass: 'b-cl', date: '7 Apr', officer: 'Resolved', progress: 5,
  },
];

export default function MyReports() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(REPORTS[0]);
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? REPORTS : filter === 'Open' ? REPORTS.filter(r => r.status !== 'Closed') : REPORTS.filter(r => r.status === 'Closed');

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · My Reports</div>
        <div className="page-title">My Reports — Case Tracker</div>
        <div className="page-desc">All submitted reports with status, assigned officer and progress. Click any report to view full case timeline.</div>
      </div>

      {/* Header + filters above the grid */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>My Reports</div>
        <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
          {['All (3)', 'Open (2)', 'Closed (1)'].map(f => {
            const key = f.split(' ')[0];
            return (
              <div key={key} onClick={() => setFilter(key)} style={{
                padding: '3px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                background: filter === key ? 'rgba(59,130,246,.1)' : 'var(--s3)',
                border: filter === key ? '1px solid var(--bl)' : '1px solid var(--bd)',
                color: filter === key ? 'var(--blb)' : 'var(--txd)',
              }}>{f}</div>
            );
          })}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/civilian/report')}>+ New Report</button>
      </div>

      <div className="layout-master-detail">
        {/* List */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(r => (
              <div key={r.id} onClick={() => setSelected(r)} style={{
                padding: 12, borderRadius: 8, cursor: 'pointer',
                background: selected?.id === r.id ? 'rgba(59,130,246,.04)' : r.status === 'Closed' ? 'var(--s2)' : 'var(--s2)',
                border: selected?.id === r.id ? '1px solid rgba(59,130,246,.25)' : '1px solid var(--bd)',
                opacity: r.status === 'Closed' ? .65 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--blb)' }}>{r.id}</span>
                  <span className={`b ${r.statusClass}`}>{r.status}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: 'var(--txd)', marginBottom: 8 }}>Submitted {r.date} · {r.officer}</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(s => (
                    <div key={s} style={{ flex: 1, height: 3, borderRadius: 1, background: s <= r.progress ? (s < r.progress ? 'var(--gn)' : 'var(--bl)') : 'var(--s3)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: 18 }}>
            <div className="card-header">
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{selected.id}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{selected.title}</div>
              </div>
              <span className={`b ${selected.statusClass}`}>{selected.status}</span>
            </div>
            <div className="card-body">
              <div className="g2" style={{ marginBottom: 14, gap: 8, fontSize: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>ASSIGNED OFFICER</div>
                  <div style={{ fontWeight: 600 }}>{selected.officer || '—'}</div>
                  {selected.station && <div style={{ color: 'var(--txd)', fontSize: 11 }}>{selected.station}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>CAS NUMBER</div>
                  <div className="mono" style={{ fontSize: 11 }}>{selected.cas || '—'}</div>
                </div>
              </div>

              {selected.timeline && (
                <div className="card" style={{ marginBottom: 12 }}>
                  <div className="card-header"><span className="card-title">Case Progress</span></div>
                  <div className="card-body">
                    <div className="timeline">
                      {selected.timeline.map((t, i) => (
                        <div key={i} className="tl-item">
                          <div className={`tl-dot ${t.state}`}>{t.state === 'done' ? '✓' : t.state === 'current' ? '●' : '○'}</div>
                          <div>
                            <div className="tl-title">{t.label}</div>
                            <div className="tl-meta">{t.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-header"><span className="card-title">Add Follow-up Information</span></div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Additional details or updates</label>
                    <textarea className="form-textarea" rows={3} placeholder="e.g. I remembered the suspect had a tattoo on his right arm…" />
                  </div>
                  <button className="btn btn-primary btn-sm">Submit Update</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
