import { useState } from 'react';

const ORDERS = [
  { id: 'ORD-2026-0041', case: 'CCT/04/2026', type: 'Bail Conditions', subject: 'John van der Berg', issued: '13 Apr 2026', summary: 'Bail granted at R10,000. Suspect must surrender passport, report weekly, no contact with victim.' },
  { id: 'ORD-2026-0038', case: 'CCT/01/2026', type: 'Sentencing', subject: 'Marcus Botha', issued: '10 Apr 2026', summary: '3 years imprisonment, suspended for 5 years on conditions. 200 hours community service.' },
  { id: 'ORD-2026-0031', case: 'CCT/03/2026', type: 'Interdict', subject: 'S. van Niekerk', issued: '5 Apr 2026', summary: 'Interdict against approaching victim within 200m or any form of contact.' },
];

export default function CourtOrders() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Judge · Court Orders</div>
        <div className="page-title">Court Orders</div>
        <div className="page-desc">Issue and manage court orders, interdicts, and judgments.</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button className="btn btn-primary" onClick={() => setShowNew(!showNew)}>+ New Court Order</button>
      </div>

      {showNew && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title">Draft New Order</span></div>
          <div className="card-body" style={{ maxWidth: 700 }}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Case Number</label><input className="form-input mono" placeholder="CCT/XX/2026" /></div>
              <div className="form-group"><label className="form-label">Order Type</label>
                <select className="form-select"><option>Bail Conditions</option><option>Interdict</option><option>Sentencing</option><option>Remand</option><option>Acquittal</option></select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Subject of Order</label><input className="form-input" /></div>
            <div className="form-group"><label className="form-label">Order Details</label><textarea className="form-textarea" rows={5} placeholder="Full text of the court order…" /></div>
            <div className="sig-pad" style={{ marginBottom: 10 }}><div className="sig-line" /><div className="sig-text">S. van Wyk</div></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => setShowNew(false)}>Sign & Issue Order</button>
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Save Draft</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><span className="card-title">Issued Orders</span></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="wt">
            <thead><tr><th>Order Ref</th><th>Case</th><th>Type</th><th>Subject</th><th>Issued</th><th>Action</th></tr></thead>
            <tbody>
              {ORDERS.map(o => (
                <tr key={o.id}>
                  <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>{o.id}</td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{o.case}</td>
                  <td><span className="b b-rev">{o.type}</span></td>
                  <td style={{ fontSize: 11 }}>{o.subject}</td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{o.issued}</td>
                  <td><button className="btn btn-secondary btn-sm">View / Print</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
