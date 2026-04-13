import { useNavigate } from 'react-router-dom';

export default function JudgeDashboard() {
  const navigate = useNavigate();
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Judge · Dashboard</div>
        <div className="page-title">Judicial Dashboard</div>
        <div className="page-desc">Cape Town High Court · Judge S. van Wyk · 13 Apr 2026 · 4 items requiring your attention</div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="stat-card accent-am" style={{ cursor: 'pointer' }} onClick={() => navigate('/judge/warrants')}>
          <div className="stat-label">Pending Warrants</div>
          <div className="stat-value">4</div>
          <div className="stat-delta delta-dn">↑ 2 new today</div>
        </div>
        <div className="stat-card accent-rd" style={{ cursor: 'pointer' }} onClick={() => navigate('/judge/bail')}>
          <div className="stat-label">Bail Reviews</div>
          <div className="stat-value">3</div>
          <div className="stat-delta delta-dn">1 urgent</div>
        </div>
        <div className="stat-card accent-bl" style={{ cursor: 'pointer' }} onClick={() => navigate('/judge/cases')}>
          <div className="stat-label">Open Case Files</div>
          <div className="stat-value">12</div>
          <div className="stat-delta delta-neu">2 hearing today</div>
        </div>
        <div className="stat-card accent-gn" style={{ cursor: 'pointer' }} onClick={() => navigate('/judge/signed-warrants')}>
          <div className="stat-label">Signed This Month</div>
          <div className="stat-value">28</div>
          <div className="stat-delta delta-up">↑ 5 from last month</div>
        </div>
      </div>

      <div className="g2" style={{ marginBottom: 14 }}>
        {/* Pending warrants */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pending Warrant Requests</span>
            <span className="card-action" onClick={() => navigate('/judge/warrants')}>Inbox →</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="wt">
              <thead><tr><th>Ref</th><th>Type</th><th>Officer</th><th>Priority</th></tr></thead>
              <tbody>
                {[
                  { ref: 'WR-2026-0419', type: 'Search & Seizure', officer: 'Sgt. Dlamini', pri: 'Urgent' },
                  { ref: 'WR-2026-0418', type: 'Arrest Warrant', officer: 'Lt. Marais', pri: 'High' },
                  { ref: 'WR-2026-0416', type: 'Surveillance', officer: 'Det. Moyo', pri: 'Medium' },
                  { ref: 'WR-2026-0415', type: 'Search & Seizure', officer: 'Cst. Jacobs', pri: 'Low' },
                ].map(w => (
                  <tr key={w.ref}>
                    <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>{w.ref}</td>
                    <td style={{ fontSize: 11 }}>{w.type}</td>
                    <td style={{ fontSize: 11 }}>{w.officer}</td>
                    <td><span className={`b ${w.pri === 'Urgent' ? 'b-cri' : w.pri === 'High' ? 'b-hi' : w.pri === 'Medium' ? 'b-me' : 'b-lo'}`}>{w.pri}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's calendar */}
        <div className="card">
          <div className="card-header"><span className="card-title">Today's Court Schedule</span></div>
          <div className="card-body">
            {[
              { time: '09:00', case: 'State v. John van der Berg', type: 'Bail Hearing', court: 'Court 3' },
              { time: '11:30', case: 'State v. S. van Niekerk', type: 'Mention', court: 'Court 3' },
              { time: '14:00', case: 'State v. M. Bosch', type: 'Sentencing', court: 'Court 1' },
              { time: '15:30', case: 'Warrant review session', type: 'Admin', court: 'Chambers' },
            ].map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(36,48,74,.3)', alignItems: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 600, color: 'var(--am)', minWidth: 44 }}>{ev.time}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{ev.case}</div>
                  <div style={{ fontSize: 10, color: 'var(--txd)' }}>{ev.type} · {ev.court}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="card-header"><span className="card-title">April 2026 — Judicial Activity</span></div>
        <div className="card-body">
          <div className="g4" style={{ gap: 8 }}>
            {[
              { label: 'Warrants Approved', val: '22', color: 'var(--gn)' },
              { label: 'Warrants Denied', val: '6', color: 'var(--rd)' },
              { label: 'Bail Granted', val: '8', color: 'var(--gn)' },
              { label: 'Bail Denied', val: '5', color: 'var(--rd)' },
            ].map(s => (
              <div key={s.label} style={{ padding: 12, background: 'var(--s3)', borderRadius: 7, textAlign: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'var(--txd)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
