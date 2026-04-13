import { useState } from 'react';

const WARRANTS = [
  { id: 'WR-2026-0419', type: 'Search & Seizure', subject: 'John van der Berg', address: '14 Main Road, Woodstock', officer: 'Sgt. Dlamini', cas: 'CAS-082-25', status: 'Pending', date: '13 Apr 2026' },
  { id: 'WR-2026-0416', type: 'Arrest Warrant', subject: 'Unknown Suspect', address: 'N/A', officer: 'Lt. Marais', cas: 'CAS-079-24', status: 'Signed', date: '11 Apr 2026' },
  { id: 'WR-2026-0410', type: 'Surveillance', subject: 'Drug network', address: 'Parow area', officer: 'Det. Moyo', cas: 'CAS-070-10', status: 'Approved', date: '9 Apr 2026' },
];

export default function WarrantRequests() {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(WARRANTS[0]);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Warrant Requests</div>
        <div className="page-title">Warrant Requests</div>
        <div className="page-desc">Submit warrant applications to the duty magistrate. Track status and receive signed warrants electronically.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Request Warrant</button>
          </div>

          {showForm && (
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-header"><span className="card-title">New Warrant Application</span></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Warrant Type</label>
                    <select className="form-select"><option>Search & Seizure</option><option>Arrest Warrant</option><option>Surveillance</option><option>Interception</option></select>
                  </div>
                  <div className="form-group"><label className="form-label">Linked CAS</label><input className="form-input mono" /></div>
                </div>
                <div className="form-group"><label className="form-label">Subject / Target</label><input className="form-input" /></div>
                <div className="form-group"><label className="form-label">Premises / Address</label><input className="form-input" /></div>
                <div className="form-group"><label className="form-label">Grounds / Reasons</label><textarea className="form-textarea" rows={4} placeholder="Describe the basis for this warrant application…" /></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => setShowForm(false)}>Submit to Magistrate</button>
                  <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="wt">
                <thead><tr><th>Ref</th><th>Type</th><th>Subject</th><th>Officer</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {WARRANTS.map(w => (
                    <tr key={w.id} onClick={() => setSelected(w)} style={{ cursor: 'pointer', background: selected?.id === w.id ? 'rgba(59,130,246,.04)' : 'transparent' }}>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--blb)' }}>{w.id}</td>
                      <td style={{ fontSize: 11 }}>{w.type}</td>
                      <td style={{ fontSize: 11 }}>{w.subject}</td>
                      <td style={{ fontSize: 11 }}>{w.officer}</td>
                      <td className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{w.date}</td>
                      <td><span className={`b ${w.status === 'Signed' || w.status === 'Approved' ? 'b-act' : 'b-pen'}`}>{w.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selected && (
          <div className="card">
            <div className="card-header"><span className="card-title">{selected.id}</span><span className={`b ${selected.status === 'Signed' || selected.status === 'Approved' ? 'b-act' : 'b-pen'}`}>{selected.status}</span></div>
            <div className="card-body" style={{ fontSize: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{selected.type}</div>
              {[['Subject', selected.subject], ['Address', selected.address], ['CAS Number', selected.cas], ['Requesting Officer', selected.officer], ['Date Filed', selected.date]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                  <span style={{ color: 'var(--txd)' }}>{l}</span>
                  <span className={l === 'CAS Number' ? 'mono' : ''}>{v}</span>
                </div>
              ))}
              <div className="dv" />
              {selected.status === 'Signed' && (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>Download Signed Warrant</button>
              )}
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>View Full Application</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
