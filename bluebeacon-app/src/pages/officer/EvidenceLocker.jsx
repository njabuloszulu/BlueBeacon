import { useState } from 'react';

const ITEMS = [
  { id: 'EVD-0419-001', cas: 'CAS-082-25', type: 'Video', desc: 'CCTV footage — Long Street ATM', custodian: 'Sgt. Dlamini', logged: '13 Apr 14:45', chain: 3 },
  { id: 'EVD-0419-002', cas: 'CAS-082-25', type: 'Physical', desc: 'Victim\'s handbag (recovered)', custodian: 'Cst. Jacobs', logged: '13 Apr 15:20', chain: 2 },
  { id: 'EVD-0419-003', cas: 'CAS-082-25', type: 'Document', desc: 'Witness statement — J. Petersen', custodian: 'Sgt. Dlamini', logged: '13 Apr 16:00', chain: 1 },
  { id: 'EVD-0417-001', cas: 'CAS-079-24', type: 'Photo', desc: 'Crime scene photos (x8)', custodian: 'Lt. Marais', logged: '12 Apr 10:00', chain: 4 },
];

export default function EvidenceLocker() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Evidence Locker</div>
        <div className="page-title">Evidence Locker</div>
        <div className="page-desc">Chain of custody for all logged evidence. Tamper-evident digital ledger.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input className="form-input" placeholder="Search by CAS, item ID or description…" style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm">+ Log Evidence</button>
          </div>
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="wt">
                <thead><tr><th>Item ID</th><th>Type</th><th>Description</th><th>CAS</th><th>Custodian</th><th>Logged</th></tr></thead>
                <tbody>
                  {ITEMS.map(e => (
                    <tr key={e.id} onClick={() => setSelected(e)} style={{ cursor: 'pointer', background: selected?.id === e.id ? 'rgba(59,130,246,.04)' : 'transparent' }}>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--blb)' }}>{e.id}</td>
                      <td><span className={`b ${e.type === 'Video' ? 'b-pu' : e.type === 'Physical' ? 'b-am' : e.type === 'Photo' ? 'b-rev' : 'b-on'}`} style={e.type==='Physical'?{background:'rgba(245,158,11,.1)',color:'var(--am)'}:{}}>{e.type}</span></td>
                      <td style={{ fontSize: 11 }}>{e.desc}</td>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{e.cas}</td>
                      <td style={{ fontSize: 11 }}>{e.custodian}</td>
                      <td className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{e.logged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selected ? (
          <div className="card">
            <div className="card-header"><span className="card-title">{selected.id}</span></div>
            <div className="card-body" style={{ fontSize: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{selected.desc}</div>
              {[['Type', selected.type], ['CAS Number', selected.cas], ['Current Custodian', selected.custodian], ['Date Logged', selected.logged]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                  <span style={{ color: 'var(--txd)' }}>{l}</span>
                  <span className={l === 'CAS Number' ? 'mono' : ''}>{v}</span>
                </div>
              ))}
              <div className="dv" />
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Chain of Custody ({selected.chain} entries)</div>
              <div className="timeline">
                {Array.from({ length: selected.chain }, (_, i) => ({
                  label: i === 0 ? `Logged by ${selected.custodian}` : `Transferred to ${['Court', 'Lab', 'Storage'][i % 3]}`,
                  time: `${13 - i} Apr · ${15 + i}:00`,
                  state: i === 0 ? 'current' : 'done',
                })).reverse().map((t, i) => (
                  <div key={i} className="tl-item">
                    <div className={`tl-dot ${t.state}`}>{t.state === 'done' ? '✓' : '●'}</div>
                    <div><div className="tl-title">{t.label}</div><div className="tl-meta">{t.time}</div></div>
                  </div>
                ))}
              </div>
              <div className="dv" />
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Transfer Custody</button>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div style={{ textAlign: 'center', color: 'var(--txd)', padding: '32px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🧪</div>
                <div style={{ fontSize: 12 }}>Select an evidence item to view chain of custody</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
