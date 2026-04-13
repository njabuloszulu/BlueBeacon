import { useNavigate } from 'react-router-dom';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Dashboard</div>
        <div className="page-title">Operations Dashboard</div>
        <div className="page-desc">Cape Town Central · Sgt. N. Dlamini · Shift: 07:00–19:00 · 13 Apr 2026</div>
      </div>

      <div className="alert alert-em" style={{ marginBottom: 16 }}>
        <div className="alert-icon">!</div>
        Priority dispatch: Armed robbery in progress — 45 Long Street, Cape Town CBD. Unit 7 responding.
      </div>

      {/* Stats */}
      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="stat-card accent-rd" style={{ cursor: 'pointer' }} onClick={() => navigate('/officer/incidents')}>
          <div className="stat-label">Open Incidents</div>
          <div className="stat-value">24</div>
          <div className="stat-delta delta-dn">↑ 7 new today</div>
        </div>
        <div className="stat-card accent-am" style={{ cursor: 'pointer' }} onClick={() => navigate('/officer/dockets')}>
          <div className="stat-label">Active Dockets</div>
          <div className="stat-value">11</div>
          <div className="stat-delta delta-neu">2 awaiting review</div>
        </div>
        <div className="stat-card accent-bl">
          <div className="stat-label">Units On Patrol</div>
          <div className="stat-value">8</div>
          <div className="stat-delta delta-up">↑ 2 from last shift</div>
        </div>
        <div className="stat-card accent-gn" style={{ cursor: 'pointer' }} onClick={() => navigate('/officer/cells')}>
          <div className="stat-label">Cells Occupied</div>
          <div className="stat-value">7<span style={{ fontSize: 12 }}>/12</span></div>
          <div className="stat-delta delta-neu">5 available</div>
        </div>
      </div>

      <div className="g2" style={{ marginBottom: 14 }}>
        {/* My assigned incidents */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Assigned Incidents</span>
            <span className="card-action" onClick={() => navigate('/officer/incidents')}>Queue →</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="wt">
              <thead><tr><th>Ref</th><th>Type</th><th>Priority</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  { ref: '#INC-4821', type: 'Theft', pri: 'Medium', status: 'Investigating', sc: 'b-act' },
                  { ref: '#INC-4819', type: 'Assault', pri: 'High', status: 'Pending', sc: 'b-pen' },
                  { ref: '#INC-4815', type: 'Robbery', pri: 'Urgent', status: 'Active', sc: 'b-cri' },
                ].map(r => (
                  <tr key={r.ref}>
                    <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>{r.ref}</td>
                    <td>{r.type}</td>
                    <td><span className={`b ${r.pri === 'Urgent' ? 'b-cri' : r.pri === 'High' ? 'b-hi' : 'b-me'}`}>{r.pri}</span></td>
                    <td><span className={`b ${r.sc}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Live Dispatch</span>
            <span className="card-action" onClick={() => navigate('/officer/dispatch')}>Board →</span>
          </div>
          <div className="card-body">
            {[
              { level: 'urg', label: '#INC-4825 — Armed Robbery', detail: '45 Long Street CBD · Unit 7 + Unit 3 responding', time: '2m' },
              { level: 'med', label: '#INC-4823 — Assault', detail: 'Greenpoint Park · Unit 12 en route', time: '15m' },
              { level: 'nrm', label: '#INC-4820 — Noise complaint', detail: 'Obs · Unit 5 on scene', time: '32m' },
            ].map((d, i) => (
              <div key={i} className={`dispatch-card ${d.level}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{d.label}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{d.time}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--txd)' }}>{d.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="card-header"><span className="card-title">Recent Activity — Today</span></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="wt">
            <thead><tr><th>Time</th><th>Event</th><th>Officer</th><th>Details</th></tr></thead>
            <tbody>
              {[
                { time: '16:45', event: 'Arrest', officer: 'Sgt. Dlamini', detail: 'John D. (DOB 1988) — armed robbery' },
                { time: '15:30', event: 'Report filed', officer: 'Cst. Jacobs', detail: 'Vehicle break-in #INC-4821' },
                { time: '14:12', event: 'Bail application', officer: 'Lt. Marais', detail: 'Peter V. — bail set at R5,000' },
                { time: '12:00', event: 'Evidence logged', officer: 'Sgt. Dlamini', detail: 'CCTV footage — case #4819' },
              ].map((r, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{r.time}</td>
                  <td><span className="b b-rev">{r.event}</span></td>
                  <td style={{ fontSize: 11 }}>{r.officer}</td>
                  <td style={{ fontSize: 11 }}>{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
