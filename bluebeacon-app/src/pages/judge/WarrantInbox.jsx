import { useState } from 'react';

const WARRANTS = [
  { id: 'WR-2026-0419', type: 'Search & Seizure', officer: 'Sgt. N. Dlamini', station: 'Cape Town Central', cas: 'CAS-082-25-02-2026', subject: 'John van der Berg', premises: '14 Main Road, Woodstock', grounds: 'Suspect in armed robbery case. CCTV evidence places him at the scene. Search required for weapon and proceeds of crime.', filed: '13 Apr 2026 · 16:00', priority: 'Urgent', status: 'Pending' },
  { id: 'WR-2026-0418', type: 'Arrest Warrant', officer: 'Lt. P. Marais', station: 'Cape Town Central', cas: 'CAS-079-24-02-2026', subject: 'Unknown Suspect', premises: 'N/A', grounds: 'Witness identified suspect from photo ID. Last known location Greenpoint. Flight risk assessed as high.', filed: '12 Apr 2026 · 14:00', priority: 'High', status: 'Pending' },
  { id: 'WR-2026-0416', type: 'Surveillance', officer: 'Det. S. Moyo', station: 'Cape Town Central', cas: 'CAS-070-10-04-2026', subject: 'Drug network', premises: 'Parow industrial area', grounds: 'Ongoing investigation into drug distribution network. Phone intercepts required to identify suppliers.', filed: '11 Apr 2026 · 10:30', priority: 'Medium', status: 'Pending' },
  { id: 'WR-2026-0415', type: 'Search & Seizure', officer: 'Cst. K. Jacobs', station: 'Cape Town Central', cas: 'CAS-065-12-02-2026', subject: 'S. van Niekerk', premises: '8 Voortrekker Rd, Bellville', grounds: 'Robbery suspect linked to multiple vehicle break-ins. Stolen goods believed to be stored at premises.', filed: '10 Apr 2026 · 08:00', priority: 'Low', status: 'Pending' },
];

export default function WarrantInbox() {
  const [selected, setSelected] = useState(WARRANTS[0]);
  const [approved, setApproved] = useState([]);
  const [denied, setDenied] = useState([]);

  function approve(id) { setApproved(a => [...a, id]); }
  function deny(id) { setDenied(d => [...d, id]); }

  const pending = WARRANTS.filter(w => !approved.includes(w.id) && !denied.includes(w.id));

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Judge · Warrant Inbox</div>
        <div className="page-title">Warrant Inbox</div>
        <div className="page-desc">Review and sign warrant applications submitted by law enforcement. All decisions are logged with timestamp and reason.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* List */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--txd)', marginBottom: 10 }}>{pending.length} pending · {approved.length} approved · {denied.length} denied</div>
          {WARRANTS.map(w => {
            const isApproved = approved.includes(w.id);
            const isDenied = denied.includes(w.id);
            return (
              <div key={w.id} onClick={() => setSelected(w)} style={{
                padding: 12, borderRadius: 8, cursor: 'pointer', marginBottom: 6,
                background: selected?.id === w.id ? 'rgba(59,130,246,.05)' : 'var(--s2)',
                border: selected?.id === w.id ? '1px solid rgba(59,130,246,.25)' : '1px solid var(--bd)',
                opacity: isApproved || isDenied ? .6 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--blb)' }}>{w.id}</span>
                  <span className={`b ${isApproved ? 'b-act' : isDenied ? 'b-cri' : w.priority === 'Urgent' ? 'b-cri' : w.priority === 'High' ? 'b-hi' : 'b-me'}`}>{isApproved ? 'Signed' : isDenied ? 'Denied' : w.priority}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{w.type}</div>
                <div style={{ fontSize: 11, color: 'var(--txd)', marginTop: 2 }}>{w.officer} · {w.filed.split(' · ')[0]}</div>
              </div>
            );
          })}
        </div>

        {/* Detail */}
        {selected && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--txd)' }}>{selected.id}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{selected.type}</div>
              </div>
              <span className={`b ${approved.includes(selected.id) ? 'b-act' : denied.includes(selected.id) ? 'b-cri' : 'b-pen'}`}>
                {approved.includes(selected.id) ? 'Signed' : denied.includes(selected.id) ? 'Denied' : 'Pending'}
              </span>
            </div>
            <div className="card-body">
              <div className="g2" style={{ gap: 8, fontSize: 12, marginBottom: 14 }}>
                {[['Requesting Officer', selected.officer], ['Station', selected.station], ['Filed', selected.filed], ['CAS Number', selected.cas], ['Subject', selected.subject], ['Premises', selected.premises]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>{l.toUpperCase()}</div>
                    <div className={l === 'CAS Number' ? 'mono' : ''} style={{ fontSize: l === 'CAS Number' ? 11 : 12 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-header"><span className="card-title">Grounds for Application</span></div>
                <div className="card-body">
                  <p style={{ fontSize: 12, color: 'var(--txm)', lineHeight: 1.7 }}>{selected.grounds}</p>
                </div>
              </div>

              {!approved.includes(selected.id) && !denied.includes(selected.id) && (
                <>
                  <div className="card" style={{ marginBottom: 14 }}>
                    <div className="card-header"><span className="card-title">Digital Signature</span></div>
                    <div className="card-body">
                      <div className="sig-pad"><div className="sig-line" /><div className="sig-text">S. van Wyk</div></div>
                      <div style={{ fontSize: 10, color: 'var(--txd)', marginTop: 6 }}>Judge S. van Wyk · Cape Town High Court · {new Date().toLocaleDateString('en-ZA')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => approve(selected.id)}>✓ Sign & Approve Warrant</button>
                    <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => deny(selected.id)}>✗ Deny Application</button>
                  </div>
                </>
              )}
              {(approved.includes(selected.id) || denied.includes(selected.id)) && (
                <div className={`alert ${approved.includes(selected.id) ? 'alert-su' : 'alert-em'}`}>
                  <div className="alert-icon">{approved.includes(selected.id) ? '✓' : '✗'}</div>
                  {approved.includes(selected.id) ? 'Warrant signed and transmitted to requesting officer.' : 'Application denied. Notification sent to requesting officer.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
