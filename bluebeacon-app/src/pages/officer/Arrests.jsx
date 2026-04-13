import { useState } from 'react';

const ARRESTS = [
  { id: 'ARR-2026-0419', name: 'John van der Berg', dob: '1988-05-15', charge: 'Armed Robbery', cas: 'CAS-082-25-02-2026', officer: 'Sgt. Dlamini', date: '13 Apr 2026 · 14:30', bail: 'Pending', cell: 'B3' },
  { id: 'ARR-2026-0417', name: 'Sipho Nkosi', dob: '1995-11-20', charge: 'Assault GBH', cas: 'CAS-079-24-02-2026', officer: 'Lt. Marais', date: '12 Apr 2026 · 09:15', bail: 'Granted', cell: 'Released' },
  { id: 'ARR-2026-0411', name: 'Peter van Niekerk', dob: '1979-03-02', charge: 'Robbery', cas: 'CAS-065-12-02-2026', officer: 'Cst. Jacobs', date: '10 Apr 2026 · 22:00', bail: 'Denied', cell: 'A1' },
];

export default function Arrests() {
  const [selected, setSelected] = useState(ARRESTS[0]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Arrests</div>
        <div className="page-title">Arrest Register</div>
        <div className="page-desc">Log and manage all arrests. Linked to dockets, bail applications and cell board.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Log Arrest</button>
          </div>

          {showForm && (
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-header"><span className="card-title">New Arrest</span></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="As per ID" /></div>
                  <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-input mono" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">ID Number</label><input className="form-input mono" /></div>
                  <div className="form-group"><label className="form-label">Charge</label><input className="form-input" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Linked CAS</label><input className="form-input mono" /></div>
                  <div className="form-group"><label className="form-label">Assign Cell</label>
                    <select className="form-select"><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>B3</option></select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Arresting Officer</label><input className="form-input" defaultValue="Sgt. N. Dlamini" /></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => setShowForm(false)}>Save Arrest</button>
                  <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="wt">
                <thead><tr><th>Arrest ID</th><th>Name</th><th>Charge</th><th>Date</th><th>Bail</th><th>Cell</th></tr></thead>
                <tbody>
                  {ARRESTS.map(a => (
                    <tr key={a.id} onClick={() => setSelected(a)} style={{ cursor: 'pointer', background: selected?.id === a.id ? 'rgba(59,130,246,.04)' : 'transparent' }}>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--blb)' }}>{a.id}</td>
                      <td style={{ fontWeight: 600, fontSize: 12 }}>{a.name}</td>
                      <td>{a.charge}</td>
                      <td className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{a.date.split(' · ')[0]}</td>
                      <td><span className={`b ${a.bail === 'Granted' ? 'b-act' : a.bail === 'Denied' ? 'b-cri' : 'b-pen'}`}>{a.bail}</span></td>
                      <td className="mono" style={{ fontSize: 11 }}>{a.cell}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selected && (
          <div className="card">
            <div className="card-header"><span className="card-title">{selected.id}</span><span className={`b ${selected.bail === 'Granted' ? 'b-act' : selected.bail === 'Denied' ? 'b-cri' : 'b-pen'}`}>{selected.bail}</span></div>
            <div className="card-body" style={{ fontSize: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: 'var(--txd)', marginBottom: 14 }}>DOB: {selected.dob}</div>
              {[['Charge', selected.charge], ['CAS Number', selected.cas], ['Arresting Officer', selected.officer], ['Date & Time', selected.date], ['Cell Assigned', selected.cell]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                  <span style={{ color: 'var(--txd)' }}>{l}</span>
                  <span className={l === 'CAS Number' || l === 'Date & Time' ? 'mono' : ''} style={{ fontSize: l === 'CAS Number' ? 11 : 12 }}>{v}</span>
                </div>
              ))}
              <div className="dv" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="btn btn-primary">Open Docket</button>
                <button className="btn btn-warning">File Bail Application</button>
                <button className="btn btn-secondary">Print Charge Sheet</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
