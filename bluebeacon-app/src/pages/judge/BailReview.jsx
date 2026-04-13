import { useState } from 'react';

const APPLICATIONS = [
  { id: 'BAIL-0419', suspect: 'John van der Berg', charge: 'Armed Robbery', arrest: 'ARR-2026-0419', officer: 'Sgt. Dlamini', recommended: 'R10,000', risk: 'High', priors: 2, employment: 'Self-employed', address: '14 Main Rd, Woodstock', status: 'Pending' },
  { id: 'BAIL-0418', suspect: 'Marcus Botha', charge: 'Assault GBH', arrest: 'ARR-2026-0418', officer: 'Lt. Marais', recommended: 'R5,000', risk: 'Medium', priors: 1, employment: 'Formal', address: '22 Oak Ave, Claremont', status: 'Pending' },
  { id: 'BAIL-0416', suspect: 'Lerato Mthembu', charge: 'Fraud', arrest: 'ARR-2026-0416', officer: 'Det. Moyo', recommended: 'R8,000', risk: 'Low', priors: 0, employment: 'Formal', address: '5 Station Rd, Bellville', status: 'Pending' },
];

export default function BailReview() {
  const [selected, setSelected] = useState(APPLICATIONS[0]);
  const [decisions, setDecisions] = useState({});
  const [amount, setAmount] = useState('');
  const [conditions, setConditions] = useState('');

  function decide(id, decision) {
    setDecisions(d => ({ ...d, [id]: decision }));
  }

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Judge · Bail Review</div>
        <div className="page-title">Bail Review</div>
        <div className="page-desc">Review bail applications submitted by law enforcement. Set bail conditions or deny application.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        <div>
          {APPLICATIONS.map(a => {
            const dec = decisions[a.id];
            return (
              <div key={a.id} onClick={() => setSelected(a)} style={{
                padding: 12, borderRadius: 8, cursor: 'pointer', marginBottom: 6,
                background: selected?.id === a.id ? 'rgba(59,130,246,.05)' : 'var(--s2)',
                border: selected?.id === a.id ? '1px solid rgba(59,130,246,.25)' : '1px solid var(--bd)',
                opacity: dec ? .6 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--blb)' }}>{a.id}</span>
                  <span className={`b ${dec === 'granted' ? 'b-act' : dec === 'denied' ? 'b-cri' : a.risk === 'High' ? 'b-cri' : a.risk === 'Medium' ? 'b-me' : 'b-lo'}`}>{dec ? (dec === 'granted' ? 'Granted' : 'Denied') : a.risk + ' Risk'}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{a.suspect}</div>
                <div style={{ fontSize: 11, color: 'var(--txd)', marginTop: 2 }}>{a.charge}</div>
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{selected.id}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{selected.suspect}</div>
              </div>
              <span className={`b ${selected.risk === 'High' ? 'b-cri' : selected.risk === 'Medium' ? 'b-me' : 'b-lo'}`}>{selected.risk} Risk</span>
            </div>
            <div className="card-body">
              <div className="g2" style={{ gap: 10, fontSize: 12, marginBottom: 16 }}>
                {[['Charge', selected.charge], ['Arrest Record', selected.arrest], ['Requesting Officer', selected.officer], ['Recommended Bail', selected.recommended], ['Prior Convictions', selected.priors.toString()], ['Employment', selected.employment], ['Address', selected.address]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>{l.toUpperCase()}</div>
                    <div className={l === 'Arrest Record' || l === 'Recommended Bail' ? 'mono' : ''} style={{ fontWeight: l === 'Charge' ? 600 : 'normal', color: l === 'Recommended Bail' ? 'var(--am)' : 'inherit' }}>{v}</div>
                  </div>
                ))}
              </div>

              {!decisions[selected.id] && (
                <>
                  <div className="dv" />
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Judicial Decision</div>
                  <div className="form-row" style={{ marginBottom: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Bail Amount</label>
                      <input className="form-input mono" placeholder="R0,000" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bail Conditions</label>
                    <textarea className="form-textarea" rows={3} placeholder="e.g. Must surrender passport, report to station weekly, no contact with victim…" value={conditions} onChange={e => setConditions(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => decide(selected.id, 'granted')}>✓ Grant Bail</button>
                    <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => decide(selected.id, 'denied')}>✗ Deny Bail</button>
                  </div>
                </>
              )}
              {decisions[selected.id] && (
                <div className={`alert ${decisions[selected.id] === 'granted' ? 'alert-su' : 'alert-em'}`} style={{ marginTop: 12 }}>
                  <div className="alert-icon">{decisions[selected.id] === 'granted' ? '✓' : '✗'}</div>
                  Bail <strong>{decisions[selected.id] === 'granted' ? `granted — ${amount || selected.recommended}` : 'denied'}</strong>. Decision transmitted to Cape Town Central.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
