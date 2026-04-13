import { useState } from 'react';

const CASES = [
  { num: 'CCT/04/2026', title: 'State v. John van der Berg', charge: 'Armed Robbery', status: 'Active', next: '20 Apr 2026 · Bail Hearing', judge: 'van Wyk J', prosecutor: 'Adv. Lindiwe Dube', defence: 'Adv. R. Smit', opened: '13 Apr 2026' },
  { num: 'CCT/03/2026', title: 'State v. S. van Niekerk', charge: 'Robbery', status: 'Active', next: '18 Apr 2026 · Mention', judge: 'van Wyk J', prosecutor: 'Adv. T. Nkosi', defence: 'Adv. P. du Plessis', opened: '12 Feb 2026' },
  { num: 'CCT/01/2026', title: 'State v. Marcus Botha', charge: 'Assault GBH', status: 'Judgment', next: '14 Apr 2026 · Sentencing', judge: 'van Wyk J', prosecutor: 'Adv. Lindiwe Dube', defence: 'Legal Aid', opened: '3 Jan 2026' },
  { num: 'CCT/11/2025', title: 'State v. K. September', charge: 'Fraud', status: 'Closed', next: 'N/A', judge: 'van Wyk J', prosecutor: 'Adv. N. Adams', defence: 'Adv. M. George', opened: '18 Nov 2025' },
];

export default function CaseFiles() {
  const [selected, setSelected] = useState(CASES[0]);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Judge · Case Files</div>
        <div className="page-title">Case Files</div>
        <div className="page-desc">Active and archived case files before Judge S. van Wyk. Full dockets, evidence bundles and orders.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="wt">
              <thead><tr><th>Case Number</th><th>Title</th><th>Charge</th><th>Status</th><th>Next Event</th></tr></thead>
              <tbody>
                {CASES.map(c => (
                  <tr key={c.num} onClick={() => setSelected(c)} style={{ cursor: 'pointer', background: selected?.num === c.num ? 'rgba(59,130,246,.04)' : 'transparent' }}>
                    <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>{c.num}</td>
                    <td style={{ fontWeight: 600, fontSize: 12 }}>{c.title}</td>
                    <td style={{ fontSize: 11 }}>{c.charge}</td>
                    <td><span className={`b ${c.status === 'Active' ? 'b-act' : c.status === 'Judgment' ? 'b-am' : 'b-cl'}`} style={c.status==='Judgment'?{background:'rgba(245,158,11,.1)',color:'var(--am)'}:{}}>{c.status}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--txd)' }}>{c.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{selected.num}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.title}</div>
              </div>
              <span className={`b ${selected.status === 'Active' ? 'b-act' : selected.status === 'Judgment' ? 'b-me' : 'b-cl'}`}>{selected.status}</span>
            </div>
            <div className="card-body" style={{ fontSize: 12 }}>
              {[['Charge', selected.charge], ['Next Event', selected.next], ['Judge', selected.judge], ['Prosecutor', selected.prosecutor], ['Defence', selected.defence], ['Date Opened', selected.opened]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                  <span style={{ color: 'var(--txd)' }}>{l}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div className="dv" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="btn btn-primary">Open Full Docket</button>
                <button className="btn btn-secondary">Evidence Bundle</button>
                <button className="btn btn-purple">Issue Court Order</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
