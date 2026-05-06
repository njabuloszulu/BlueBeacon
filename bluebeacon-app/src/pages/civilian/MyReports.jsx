import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMyReports, useIncidentStatus } from '../../hooks/useCivilianApi';

const PIPELINE = ['pending', 'assigned', 'investigating', 'court_ready', 'closed'];

function statusLabel(s) {
  const m = {
    pending: 'Pending',
    assigned: 'Assigned',
    investigating: 'Investigating',
    court_ready: 'Court ready',
    closed: 'Closed',
    escalated: 'Escalated',
  };
  return m[s] || s;
}

function statusClass(s) {
  if (s === 'closed') return 'b-cl';
  if (s === 'pending') return 'b-pen';
  if (s === 'investigating' || s === 'court_ready') return 'b-act';
  return 'b-pen';
}

function Timeline({ status }) {
  const idx = Math.max(0, PIPELINE.indexOf(status));
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-header">
        <span className="card-title">Case Progress</span>
      </div>
      <div className="card-body">
        <div className="timeline">
          {PIPELINE.map((st, i) => {
            const done = i < idx;
            const current = i === idx;
            const state = done ? 'done' : current ? 'current' : 'todo';
            return (
              <div key={st} className="tl-item">
                <div className={`tl-dot ${state}`}>{done ? '✓' : current ? '●' : '○'}</div>
                <div>
                  <div className="tl-title">{statusLabel(st)}</div>
                  <div className="tl-meta">{done ? 'Completed' : current ? 'Current stage' : 'Pending'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MyReports() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reports, loading, error, reload } = useMyReports();
  const [manualId, setManualId] = useState(null);
  const [filter, setFilter] = useState('All');

  const highlightId = location.state?.highlightId;
  const activeId = manualId ?? highlightId ?? reports[0]?.id ?? null;
  const selected = activeId ? reports.find((r) => r.id === activeId) ?? null : null;

  const { statusPayload } = useIncidentStatus(selected?.id);

  const merged = useMemo(() => {
    if (!selected) return null;
    const live = statusPayload?.status;
    return { ...selected, status: live || selected.status };
  }, [selected, statusPayload]);

  const filtered = useMemo(() => {
    if (filter === 'All') return reports;
    if (filter === 'Open') return reports.filter((r) => r.status !== 'closed');
    return reports.filter((r) => r.status === 'closed');
  }, [reports, filter]);

  const openCount = reports.filter((r) => r.status !== 'closed').length;

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · My Reports</div>
        <div className="page-title">My Reports — Case Tracker</div>
        <div className="page-desc">
          Submitted incidents with live status from the API and Socket.IO updates.
        </div>
      </div>

      {loading && <div className="alert alert-in">Loading reports…</div>}
      {error && (
        <div className="alert alert-wa">
          Could not load reports. <button type="button" className="btn btn-secondary btn-sm" onClick={() => reload()}>Retry</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>My Reports</div>
        <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
          {[
            ['All', reports.length],
            ['Open', openCount],
            ['Closed', reports.length - openCount],
          ].map(([key, count]) => (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => setFilter(key)}
              onKeyDown={(e) => e.key === 'Enter' && setFilter(key)}
              style={{
                padding: '3px 10px',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
                background: filter === key ? 'rgba(59,130,246,.1)' : 'var(--s3)',
                border: filter === key ? '1px solid var(--bl)' : '1px solid var(--bd)',
                color: filter === key ? 'var(--blb)' : 'var(--txd)',
              }}
            >
              {key} ({count})
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/civilian/report')}>
          + New Report
        </button>
      </div>

      <div className="layout-master-detail">
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!loading && filtered.length === 0 && (
              <div className="alert alert-in">No reports yet. Submit an incident to see it here.</div>
            )}
            {filtered.map((r) => {
              const st = r.status;
              return (
                <div
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setManualId(r.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setManualId(r.id)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: selected?.id === r.id ? 'rgba(59,130,246,.04)' : 'var(--s2)',
                    border: selected?.id === r.id ? '1px solid rgba(59,130,246,.25)' : '1px solid var(--bd)',
                    opacity: st === 'closed' ? 0.65 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--blb)' }}>
                      {r.id.slice(0, 8)}…
                    </span>
                    <span className={`b ${statusClass(st)}`}>{statusLabel(st)}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{r.incidentType}</div>
                  <div style={{ fontSize: 11, color: 'var(--txd)', marginBottom: 8 }}>
                    {r.description?.slice(0, 80)}
                    {(r.description?.length || 0) > 80 ? '…' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {PIPELINE.map((_, i) => {
                      const p = PIPELINE.indexOf(st) >= 0 ? PIPELINE.indexOf(st) : 0;
                      const s = i + 1;
                      return (
                        <div
                          key={s}
                          style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 1,
                            background: s <= p + 1 ? (s < p + 1 ? 'var(--gn)' : 'var(--bl)') : 'var(--s3)',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {merged && (
          <div className="card" style={{ position: 'sticky', top: 18 }}>
            <div className="card-header">
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>
                  {merged.id}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{merged.incidentType}</div>
              </div>
              <span className={`b ${statusClass(merged.status)}`}>{statusLabel(merged.status)}</span>
            </div>
            <div className="card-body">
              <div className="g2" style={{ marginBottom: 14, gap: 8, fontSize: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>ASSIGNED OFFICER</div>
                  <div style={{ fontWeight: 600 }}>{merged.assignedOfficerId ? merged.assignedOfficerId.slice(0, 8) + '…' : '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>LOCATION</div>
                  <div className="mono" style={{ fontSize: 11 }}>
                    {merged.locationLat?.toFixed?.(4)}, {merged.locationLng?.toFixed?.(4)}
                  </div>
                </div>
              </div>

              <Timeline status={merged.status} />

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Description</span>
                </div>
                <div className="card-body" style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>
                  {merged.description}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
