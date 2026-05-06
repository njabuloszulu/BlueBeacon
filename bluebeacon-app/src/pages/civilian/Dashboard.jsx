import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDashboardAlerts, useMyReports, useSos } from '../../hooks/useCivilianApi';

const quickActions = [
  { icon: '📋', label: 'Report Crime', color: 'rgba(239,68,68,.1)', path: '/civilian/report' },
  { icon: '🗺️', label: 'Live Map', color: 'rgba(59,130,246,.1)', path: '/civilian/map' },
  { icon: '🔍', label: 'Track Report', color: 'rgba(16,185,129,.1)', path: '/civilian/my-reports' },
  { icon: '📍', label: 'Find Station', color: 'rgba(245,158,11,.1)', path: '/civilian/map' },
  { icon: '📄', label: 'Clearance', color: 'rgba(139,92,246,.1)', path: '/civilian/clearance' },
  { icon: '💰', label: 'Pay Fine', color: 'rgba(99,102,241,.1)', path: '/civilian/fines' },
];

function formatStatus(status) {
  const norm = String(status || '').toLowerCase();
  if (norm === 'closed' || norm === 'resolved') return { text: 'Closed', className: 'b b-cl' };
  if (norm === 'active' || norm === 'open' || norm === 'in_progress') return { text: 'Active', className: 'b b-act' };
  return { text: 'Pending', className: 'b b-pen' };
}

function ageFromDate(value) {
  const ts = value ? new Date(value).getTime() : NaN;
  if (!Number.isFinite(ts)) return '—';
  const deltaMinutes = Math.max(1, Math.floor((Date.now() - ts) / 60000));
  if (deltaMinutes < 60) return `${deltaMinutes}m`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h`;
  return `${Math.floor(deltaHours / 24)}d`;
}

export default function CivilianDashboard() {
  const navigate = useNavigate();
  const { profile, rawUser } = useAuth();
  const { sendSos } = useSos();
  const { reports, loading: reportsLoading } = useMyReports();
  const { alerts, loading: alertsLoading } = useDashboardAlerts();
  const [sosBusy, setSosBusy] = useState(false);

  const nowLabel = useMemo(
    () => new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
    []
  );
  const dashboardReports = useMemo(() => reports.slice(0, 3), [reports]);
  const dashboardAlerts = useMemo(() => alerts.slice(0, 4), [alerts]);
  const headlineAlert = dashboardAlerts[0] ?? null;
  const openCases = useMemo(
    () => reports.filter((r) => !['closed', 'resolved'].includes(String(r?.status || '').toLowerCase())).length,
    [reports]
  );

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
      if (rawUser?.id) fd.append('userId', rawUser.id);
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
        <div className="page-tag">Civilian · Dashboard</div>
        <div className="page-title">Good day, {profile?.name || 'Citizen'} 👋</div>
        <div className="page-desc">{nowLabel} · Your personal safety hub</div>
      </div>

      {/* SOS */}
      <div className="sos-btn" style={{ marginBottom: 16 }} onClick={triggerSos}>
        <div className="sos-icon">SOS</div>
        <div>
          <div className="sos-title">{sosBusy ? 'Sending emergency signal…' : 'EMERGENCY — Tap to alert nearest station'}</div>
          <div className="sos-sub">Sends GPS to dispatch instantly</div>
        </div>
      </div>

      {/* Alert banner */}
      {!alertsLoading && headlineAlert && (
        <div className="alert alert-em" style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => navigate('/civilian/alerts')}>
          <div className="alert-icon">!</div>
          {headlineAlert.title} — {headlineAlert.sub}
        </div>
      )}

      {/* Quick Actions */}
      <div className="section-label">Quick Actions</div>
      <div className="quick-grid">
        {quickActions.map((q) => (
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
          <div className="card-body table-wrap" style={{ padding: 0 }}>
            <table className="wt">
              <thead><tr><th>Ref #</th><th>Type</th><th>Status</th><th>Age</th></tr></thead>
              <tbody>
                {reportsLoading &&
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={`loading-${idx}`}>
                      <td className="mono" style={{ fontSize: 11, opacity: 0.6 }}>Loading…</td>
                      <td style={{ opacity: 0.6 }}>—</td>
                      <td><span className="b b-pen">Loading</span></td>
                      <td style={{ fontSize: 10, color: 'var(--txd)' }}>—</td>
                    </tr>
                  ))}
                {!reportsLoading && dashboardReports.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 16, color: 'var(--txd)', fontSize: 11 }}>
                      No active reports yet.
                    </td>
                  </tr>
                )}
                {!reportsLoading && dashboardReports.map((report, idx) => {
                  const ref = report?.reference || report?.id || `INC-${idx + 1}`;
                  const status = formatStatus(report?.status);
                  return (
                    <tr key={ref}>
                      <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>{ref}</td>
                      <td>{report?.incidentType || report?.type || 'Incident'}</td>
                      <td><span className={status.className}>{status.text}</span></td>
                      <td style={{ fontSize: 10, color: 'var(--txd)' }}>{ageFromDate(report?.createdAt || report?.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Area Notifications</span>
            <span className="card-action" onClick={() => navigate('/civilian/alerts')}>View all →</span>
          </div>
          <div className="card-body">
            {alertsLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`a-loading-${i}`} className="notif-item">
                  <div className="notif-dot" style={{ background: 'var(--txd)' }} />
                  <div style={{ flex: 1 }}>
                    <div className="notif-title" style={{ opacity: 0.6 }}>Loading alerts…</div>
                    <div className="notif-sub" style={{ opacity: 0.6 }}>Please wait</div>
                  </div>
                </div>
              ))}
            {!alertsLoading && dashboardAlerts.length === 0 && (
              <div className="notif-sub">No area alerts right now.</div>
            )}
            {!alertsLoading && dashboardAlerts.map((n) => (
              <div key={n.id} className="notif-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/civilian/alerts')}>
                <div
                  className="notif-dot"
                  style={{ background: n.severity === 'high' ? 'var(--rd)' : n.severity === 'medium' ? 'var(--am)' : 'var(--bl)' }}
                />
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
          <div className="stat-value">{alerts.length}</div>
          <div className="stat-delta delta-neu">From live map alerts</div>
        </div>
        <div className="stat-card accent-bl">
          <div className="stat-label">My Open Cases</div>
          <div className="stat-value">{openCases}</div>
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
