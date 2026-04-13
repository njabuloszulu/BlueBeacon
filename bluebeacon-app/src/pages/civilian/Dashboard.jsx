import { useNavigate } from 'react-router-dom';

export default function CivilianDashboard() {
  const navigate = useNavigate();
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Dashboard</div>
        <div className="page-title">Good morning, Thabo 👋</div>
        <div className="page-desc">Cape Town · 13 Apr 2026 · Your personal safety hub</div>
      </div>

      {/* SOS */}
      <div className="sos-btn" style={{ marginBottom: 16 }} onClick={() => alert('SOS dispatched to nearest station!')}>
        <div className="sos-icon">SOS</div>
        <div>
          <div className="sos-title">EMERGENCY — Tap to alert nearest station</div>
          <div className="sos-sub">Sends GPS + audio to dispatch instantly</div>
        </div>
      </div>

      {/* Alert banner */}
      <div className="alert alert-em" style={{ marginBottom: 16 }}>
        <div className="alert-icon">!</div>
        Active robbery alert 800m away — Greenpoint, armed suspect
      </div>

      {/* Quick Actions */}
      <div className="section-label">Quick Actions</div>
      <div className="quick-grid">
        {[
          { icon: '📋', label: 'Report Crime', color: 'rgba(239,68,68,.1)', path: '/civilian/report' },
          { icon: '🗺️', label: 'Live Map', color: 'rgba(59,130,246,.1)', path: '/civilian/map' },
          { icon: '🔍', label: 'Track Report', color: 'rgba(16,185,129,.1)', path: '/civilian/my-reports' },
          { icon: '📍', label: 'Find Station', color: 'rgba(245,158,11,.1)', path: '/civilian/map' },
          { icon: '📄', label: 'Clearance', color: 'rgba(139,92,246,.1)', path: '/civilian/clearance' },
          { icon: '💰', label: 'Pay Fine', color: 'rgba(99,102,241,.1)', path: '/civilian/fines' },
        ].map(q => (
          <div key={q.label} className="quick-card" onClick={() => navigate(q.path)}>
            <div className="quick-icon" style={{ background: q.color }}>{q.icon}</div>
            <div className="quick-label">{q.label}</div>
          </div>
        ))}
      </div>

      {/* Reports + Notifications */}
      <div className="g2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Active Reports</span>
            <span className="card-action" onClick={() => navigate('/civilian/my-reports')}>All →</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="wt">
              <thead><tr><th>Ref #</th><th>Type</th><th>Status</th><th>Age</th></tr></thead>
              <tbody>
                <tr>
                  <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>#INC-4821</td>
                  <td>Theft</td>
                  <td><span className="b b-act">Active</span></td>
                  <td style={{ fontSize: 10, color: 'var(--txd)' }}>2h</td>
                </tr>
                <tr>
                  <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>#INC-4698</td>
                  <td>Vandalism</td>
                  <td><span className="b b-pen">Pending</span></td>
                  <td style={{ fontSize: 10, color: 'var(--txd)' }}>1d</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>#INC-4201</td>
                  <td>Fraud</td>
                  <td><span className="b b-cl">Closed</span></td>
                  <td style={{ fontSize: 10, color: 'var(--txd)' }}>5d</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Area Notifications</span>
            <span className="card-action">Settings</span>
          </div>
          <div className="card-body">
            {[
              { dot: 'var(--rd)', title: '🚨 Active Robbery Alert', sub: 'Greenpoint · armed suspect', time: '8m' },
              { dot: 'var(--am)', title: '⚠️ Roadblock — N1 North', sub: 'CPT Metro checkpoint', time: '2h' },
              { dot: 'var(--bl)', title: 'ℹ️ Report #4821 updated', sub: 'Officer assigned', time: '3h' },
              { dot: 'var(--gn)', title: '✅ Station open — Woodstock', sub: 'Normal operating hours', time: '5h' },
            ].map((n, i) => (
              <div key={i} className="notif-item">
                <div className="notif-dot" style={{ background: n.dot }} />
                <div style={{ flex: 1 }}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-sub">{n.sub}</div>
                </div>
                <div className="notif-time">{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety stats */}
      <div className="g4" style={{ marginTop: 14 }}>
        <div className="stat-card accent-rd">
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value">3</div>
          <div className="stat-delta delta-dn">↑ 1 from yesterday</div>
        </div>
        <div className="stat-card accent-bl">
          <div className="stat-label">My Open Cases</div>
          <div className="stat-value">2</div>
          <div className="stat-delta delta-neu">No change</div>
        </div>
        <div className="stat-card accent-gn">
          <div className="stat-label">Station Distance</div>
          <div className="stat-value">1.2<span style={{ fontSize: 12 }}>km</span></div>
          <div className="stat-delta delta-neu">Cape Town Central</div>
        </div>
        <div className="stat-card accent-am">
          <div className="stat-label">Pending Fine</div>
          <div className="stat-value">R<span style={{ fontSize: 16 }}>750</span></div>
          <div className="stat-delta delta-dn">Due in 5 days</div>
        </div>
      </div>
    </div>
  );
}
