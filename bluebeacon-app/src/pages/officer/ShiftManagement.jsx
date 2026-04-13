const ROSTER = [
  { name: 'Sgt. N. Dlamini', rank: 'Sergeant', shift: '07:00–19:00', sector: 'Sector B', status: 'On Duty', role: 'Patrol' },
  { name: 'Cst. K. Jacobs', rank: 'Constable', shift: '07:00–19:00', sector: 'Sector A', status: 'On Duty', role: 'Patrol' },
  { name: 'Cst. T. Peters', rank: 'Constable', shift: '07:00–19:00', sector: 'Sector C', status: 'On Scene', role: 'Response' },
  { name: 'Lt. P. Marais', rank: 'Lieutenant', shift: '06:00–18:00', sector: 'All', status: 'On Duty', role: 'Commander' },
  { name: 'Det. S. Moyo', rank: 'Detective', shift: '08:00–17:00', sector: 'N/A', status: 'Off Shift', role: 'Investigations' },
  { name: 'Cst. Z. Nkosi', rank: 'Constable', shift: '19:00–07:00', sector: 'Sector B', status: 'Off Shift', role: 'Night Patrol' },
];

export default function ShiftManagement() {
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Shift Management</div>
        <div className="page-title">Shift Management</div>
        <div className="page-desc">Today's roster, duty assignments and shift handover for Cape Town Central.</div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="stat-card accent-gn"><div className="stat-label">On Duty Now</div><div className="stat-value">4</div></div>
        <div className="stat-card accent-am"><div className="stat-label">Night Shift</div><div className="stat-value">2</div></div>
        <div className="stat-card accent-bl"><div className="stat-label">Total Officers</div><div className="stat-value">6</div></div>
        <div className="stat-card accent-rd"><div className="stat-label">Absences</div><div className="stat-value">0</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Today's Roster — 13 Apr 2026</span><button className="btn btn-secondary btn-sm">Export</button></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="wt">
              <thead><tr><th>Officer</th><th>Rank</th><th>Shift</th><th>Sector</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {ROSTER.map(r => (
                  <tr key={r.name}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td style={{ fontSize: 11 }}>{r.rank}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{r.shift}</td>
                    <td style={{ fontSize: 11 }}>{r.sector}</td>
                    <td style={{ fontSize: 11 }}>{r.role}</td>
                    <td><span className={`b ${r.status === 'On Duty' ? 'b-act' : r.status === 'On Scene' ? 'b-cri' : 'b-cl'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header"><span className="card-title">Shift Handover Notes</span></div>
            <div className="card-body">
              <div style={{ fontSize: 11, color: 'var(--txm)', lineHeight: 1.7, marginBottom: 10 }}>
                <strong>Outgoing (Day Shift):</strong><br />
                • ARR-0419 in Cell B3 — bail hearing tomorrow 09:00<br />
                • CCTV footage in evidence locker for CAS-082-25<br />
                • Robbery suspect still at large — last seen Greenpoint
              </div>
              <button className="btn btn-primary btn-sm">Add Handover Note</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Leave Requests</span></div>
            <div className="card-body" style={{ fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                <div><div style={{ fontWeight: 600 }}>Cst. Jacobs</div><div style={{ fontSize: 10, color: 'var(--txd)' }}>Annual leave · 20–24 Apr</div></div>
                <span className="b b-pen">Pending</span>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}>+ Submit Request</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
