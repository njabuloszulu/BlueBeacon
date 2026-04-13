import { useState } from 'react';

const DOCKETS = [
  { cas: 'CAS-082-25-02-2026', type: 'Theft', suspect: 'Unknown', status: 'Open', officer: 'Sgt. Dlamini', date: '25 Feb 2026', court: 'Pending' },
  { cas: 'CAS-079-24-02-2026', type: 'Assault GBH', suspect: 'John D. (DOB 1988)', status: 'Court', officer: 'Sgt. Dlamini', date: '24 Feb 2026', court: '20 Apr 2026' },
  { cas: 'CAS-071-18-02-2026', type: 'Fraud', suspect: 'Unknown', status: 'Closed', officer: 'Det. Moyo', date: '18 Feb 2026', court: 'N/A' },
  { cas: 'CAS-065-12-02-2026', type: 'Robbery', suspect: 'S. van Niekerk', status: 'Open', officer: 'Lt. Marais', date: '12 Feb 2026', court: '18 Apr 2026' },
];

export default function DocketManager() {
  const [selected, setSelected] = useState(DOCKETS[0]);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Docket Manager</div>
        <div className="page-title">Docket Manager</div>
        <div className="page-desc">Manage criminal dockets, add evidence, track court dates and update case status.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input className="form-input" placeholder="Search CAS number or suspect…" style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm">+ New Docket</button>
          </div>
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="wt">
                <thead><tr><th>CAS Number</th><th>Type</th><th>Suspect</th><th>Status</th><th>Court Date</th></tr></thead>
                <tbody>
                  {DOCKETS.map(d => (
                    <tr key={d.cas} onClick={() => setSelected(d)} style={{ cursor: 'pointer', background: selected?.cas === d.cas ? 'rgba(59,130,246,.04)' : 'transparent' }}>
                      <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>{d.cas}</td>
                      <td>{d.type}</td>
                      <td style={{ fontSize: 11 }}>{d.suspect}</td>
                      <td><span className={`b ${d.status === 'Open' ? 'b-act' : d.status === 'Court' ? 'b-rev' : 'b-cl'}`}>{d.status}</span></td>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{d.court}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selected && (
          <div>
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-header">
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{selected.cas}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.type}</div>
                </div>
                <span className={`b ${selected.status === 'Open' ? 'b-act' : selected.status === 'Court' ? 'b-rev' : 'b-cl'}`}>{selected.status}</span>
              </div>
              <div className="card-body" style={{ fontSize: 12 }}>
                {[
                  ['Investigating Officer', selected.officer],
                  ['Date Opened', selected.date],
                  ['Suspect', selected.suspect],
                  ['Court Date', selected.court],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                    <span style={{ color: 'var(--txd)' }}>{l}</span>
                    <span className={l === 'Date Opened' || l === 'Court Date' ? 'mono' : ''}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-header"><span className="card-title">Evidence Log</span><span className="card-action">+ Add</span></div>
              <div className="card-body">
                {[
                  { icon: '📹', label: 'CCTV Footage', date: '25 Feb', note: 'Long Street ATM' },
                  { icon: '📸', label: 'Crime scene photos (x4)', date: '25 Feb', note: 'Bag recovered' },
                  { icon: '📝', label: 'Witness statement — J. Petersen', date: '26 Feb', note: 'Eyewitness' },
                ].map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(36,48,74,.3)', fontSize: 12 }}>
                    <span style={{ fontSize: 18 }}>{e.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{e.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--txd)' }}>{e.note} · {e.date}</div>
                    </div>
                    <button className="btn btn-secondary btn-sm">View</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Edit Docket</button>
              <button className="btn btn-success">Send to Court</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
