import { useState } from 'react';

const FINES = [
  { ref: 'TF-2026-00412', offence: 'Speeding (65 in 60 zone)', date: '28 Mar 2026', amount: 750, location: 'N2 Eastbound, Pinelands', due: '13 May 2026', status: 'Unpaid' },
  { ref: 'TF-2025-09881', offence: 'Expired vehicle licence', date: '15 Jan 2026', amount: 1200, location: 'Voortrekker Rd, Bellville', due: '15 Mar 2026', status: 'Overdue' },
  { ref: 'TF-2025-07234', offence: 'Cell phone use while driving', date: '10 Dec 2025', amount: 1000, location: 'De Waal Drive, Cape Town', due: '10 Feb 2026', status: 'Paid' },
];

export default function PayFines() {
  const [selected, setSelected] = useState(null);
  const [paid, setPaid] = useState([]);

  const unpaid = FINES.filter(f => !paid.includes(f.ref) && f.status !== 'Paid');
  const totalOwed = unpaid.reduce((a, f) => a + f.amount, 0);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Pay Traffic Fines</div>
        <div className="page-title">Traffic Fines</div>
        <div className="page-desc">View and pay outstanding traffic fines linked to your ID and vehicle registration.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div>
          {unpaid.length > 0 && (
            <div className="alert alert-wa" style={{ marginBottom: 14 }}>
              <div className="alert-icon">!</div>
              You have {unpaid.length} outstanding fine{unpaid.length > 1 ? 's' : ''} — Total owed: <strong className="mono">R{totalOwed.toLocaleString()}</strong>
            </div>
          )}

          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>All Fines</div>
          {FINES.map(fine => {
            const isPaid = paid.includes(fine.ref) || fine.status === 'Paid';
            return (
              <div key={fine.ref} onClick={() => !isPaid && setSelected(fine)} style={{
                padding: 14, borderRadius: 8, marginBottom: 8, cursor: isPaid ? 'default' : 'pointer',
                background: selected?.ref === fine.ref ? 'rgba(59,130,246,.05)' : 'var(--s2)',
                border: selected?.ref === fine.ref ? '1px solid rgba(59,130,246,.25)' : '1px solid var(--bd)',
                opacity: isPaid ? .6 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{fine.ref}</span>
                  <span className={`b ${isPaid ? 'b-act' : fine.status === 'Overdue' ? 'b-cri' : 'b-pen'}`}>{isPaid ? 'Paid' : fine.status}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{fine.offence}</div>
                <div style={{ fontSize: 11, color: 'var(--txd)', marginBottom: 6 }}>{fine.location} · {fine.date}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 700, color: isPaid ? 'var(--gn)' : 'var(--am)' }}>R{fine.amount.toLocaleString()}</span>
                  {!isPaid && <span style={{ fontSize: 11, color: fine.status === 'Overdue' ? 'var(--rd)' : 'var(--txd)' }}>Due {fine.due}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment panel */}
        <div>
          {selected ? (
            <div className="card">
              <div className="card-header"><span className="card-title">Pay Fine</span></div>
              <div className="card-body">
                <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--s3)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--txd)', marginBottom: 2 }}>AMOUNT DUE</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 700, color: 'var(--am)' }}>R{selected.amount.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--txd)', marginTop: 2 }}>{selected.offence}</div>
                </div>
                <div className="form-group"><label className="form-label">Payment Method</label>
                  <select className="form-select"><option>Credit / Debit Card</option><option>EFT Bank Transfer</option><option>SnapScan</option><option>Zapper</option></select>
                </div>
                <div className="form-group"><label className="form-label">Card Number</label><input className="form-input mono" placeholder="•••• •••• •••• ••••" /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Expiry</label><input className="form-input mono" placeholder="MM/YY" /></div>
                  <div className="form-group"><label className="form-label">CVV</label><input className="form-input mono" placeholder="•••" /></div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setPaid(p => [...p, selected.ref]); setSelected(null); }}>
                  Pay R{selected.amount.toLocaleString()}
                </button>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} onClick={() => setSelected(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header"><span className="card-title">Payment Summary</span></div>
              <div className="card-body">
                <div className="stat-card accent-am" style={{ marginBottom: 12 }}>
                  <div className="stat-label">Total Outstanding</div>
                  <div className="stat-value">R<span style={{ fontSize: 18 }}>{totalOwed.toLocaleString()}</span></div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--txd)', lineHeight: 1.7 }}>
                  Select a fine from the list to make payment. All transactions are secured with 256-bit encryption.
                </div>
                <div className="dv" />
                <div style={{ fontSize: 11, color: 'var(--txd)' }}>🔒 Secured by SAPS Payment Gateway</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
