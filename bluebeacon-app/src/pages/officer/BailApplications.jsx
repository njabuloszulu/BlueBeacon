import { useState } from 'react';

const APPLICATIONS = [
  { id: 'BAIL-0419', suspect: 'John van der Berg', charge: 'Armed Robbery', amount: 'R10,000', status: 'Pending Judge', cas: 'CAS-082-25', date: '13 Apr 2026', risk: 'High' },
  { id: 'BAIL-0417', suspect: 'Sipho Nkosi', charge: 'Assault GBH', amount: 'R5,000', status: 'Approved', cas: 'CAS-079-24', date: '12 Apr 2026', risk: 'Medium' },
  { id: 'BAIL-0411', suspect: 'Peter van Niekerk', charge: 'Robbery', amount: 'R15,000', status: 'Denied', cas: 'CAS-065-12', date: '10 Apr 2026', risk: 'High' },
];

export default function BailApplications() {
  const [selected, setSelected] = useState(APPLICATIONS[0]);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Bail Applications</div>
        <div className="page-title">Bail Applications</div>
        <div className="page-desc">Submit and track bail applications. Sent electronically to the duty magistrate for review.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNew(!showNew)}>+ New Application</button>
          </div>

          {showNew && (
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-header"><span className="card-title">New Bail Application</span></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Arrest Record</label><input className="form-input mono" placeholder="ARR-2026-..." /></div>
                  <div className="form-group"><label className="form-label">Recommended Bail</label><input className="form-input mono" placeholder="R0,000" /></div>
                </div>
                <div className="form-group"><label className="form-label">Risk Assessment</label>
                  <select className="form-select"><option>High</option><option>Medium</option><option>Low</option></select>
                </div>
                <div className="form-group"><label className="form-label">Officer Recommendation</label>
                  <textarea className="form-textarea" rows={3} placeholder="Reasons for / against bail…" />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => setShowNew(false)}>Submit to Magistrate</button>
                  <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="wt">
                <thead><tr><th>Application</th><th>Suspect</th><th>Charge</th><th>Amount</th><th>Risk</th><th>Status</th></tr></thead>
                <tbody>
                  {APPLICATIONS.map(a => (
                    <tr key={a.id} onClick={() => setSelected(a)} style={{ cursor: 'pointer', background: selected?.id === a.id ? 'rgba(59,130,246,.04)' : 'transparent' }}>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--blb)' }}>{a.id}</td>
                      <td style={{ fontWeight: 600, fontSize: 12 }}>{a.suspect}</td>
                      <td>{a.charge}</td>
                      <td className="mono" style={{ color: 'var(--am)' }}>{a.amount}</td>
                      <td><span className={`b ${a.risk === 'High' ? 'b-cri' : a.risk === 'Medium' ? 'b-me' : 'b-lo'}`}>{a.risk}</span></td>
                      <td><span className={`b ${a.status === 'Approved' ? 'b-act' : a.status === 'Denied' ? 'b-cri' : 'b-pen'}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selected && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{selected.id}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.suspect}</div>
              </div>
              <span className={`b ${selected.status === 'Approved' ? 'b-act' : selected.status === 'Denied' ? 'b-cri' : 'b-pen'}`}>{selected.status}</span>
            </div>
            <div className="card-body" style={{ fontSize: 12 }}>
              {[['Charge', selected.charge], ['CAS Number', selected.cas], ['Bail Amount', selected.amount], ['Risk Level', selected.risk], ['Filed Date', selected.date]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                  <span style={{ color: 'var(--txd)' }}>{l}</span>
                  <span className={l === 'CAS Number' ? 'mono' : ''} style={{ fontFamily: l === 'Bail Amount' ? "'IBM Plex Mono',monospace" : 'inherit', color: l === 'Bail Amount' ? 'var(--am)' : 'inherit' }}>{v}</span>
                </div>
              ))}
              <div className="dv" />
              {selected.status === 'Pending Judge' && (
                <div className="alert alert-wa" style={{ marginBottom: 12 }}>
                  <div className="alert-icon">!</div>
                  Awaiting magistrate review. Expected within 4 hours.
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="btn btn-secondary">View Full Application</button>
                <button className="btn btn-secondary">Print Bail Form</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
