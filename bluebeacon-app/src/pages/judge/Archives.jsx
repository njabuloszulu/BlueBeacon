import { useState } from 'react';

const RECORDS = [
  { id: 'CCT/11/2025', title: 'State v. K. September', charge: 'Fraud', closed: 'Feb 2026', outcome: 'Guilty — 2yr suspended', warrants: 3, orders: 5 },
  { id: 'CCT/09/2025', title: 'State v. B. Williams', charge: 'Theft', closed: 'Jan 2026', outcome: 'Acquitted', warrants: 1, orders: 2 },
  { id: 'CCT/08/2025', title: 'State v. M. Petersen', charge: 'Robbery', closed: 'Dec 2025', outcome: 'Guilty — 5yr', warrants: 2, orders: 4 },
  { id: 'CCT/05/2025', title: 'State v. Group of 4', charge: 'Drug trafficking', closed: 'Oct 2025', outcome: '4x Guilty plea — fines', warrants: 6, orders: 8 },
];

export default function Archives() {
  const [query, setQuery] = useState('');

  const filtered = RECORDS.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.id.toLowerCase().includes(query.toLowerCase()) ||
    r.charge.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Judge · Archives</div>
        <div className="page-title">Case Archives</div>
        <div className="page-desc">Closed and archived cases, signed warrants, and court orders for the record.</div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="stat-card accent-bl"><div className="stat-label">Cases Archived</div><div className="stat-value">42</div></div>
        <div className="stat-card accent-gn"><div className="stat-label">Warrants Archived</div><div className="stat-value">218</div></div>
        <div className="stat-card accent-am"><div className="stat-label">Court Orders</div><div className="stat-value">156</div></div>
        <div className="stat-card accent-pu"><div className="stat-label">Total Records</div><div className="stat-value">416</div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input className="form-input" placeholder="Search case number, party name or charge…" value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1 }} />
        <select className="form-select" style={{ width: 160 }}>
          <option>All Years</option>
          <option>2026</option>
          <option>2025</option>
          <option>2024</option>
        </select>
        <button className="btn btn-primary">Search</button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="wt">
            <thead><tr><th>Case No.</th><th>Title</th><th>Charge</th><th>Closed</th><th>Outcome</th><th>Warrants</th><th>Orders</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>{r.id}</td>
                  <td style={{ fontWeight: 600, fontSize: 12 }}>{r.title}</td>
                  <td>{r.charge}</td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{r.closed}</td>
                  <td style={{ fontSize: 11 }}>{r.outcome}</td>
                  <td className="mono" style={{ fontSize: 11, textAlign: 'center' }}>{r.warrants}</td>
                  <td className="mono" style={{ fontSize: 11, textAlign: 'center' }}>{r.orders}</td>
                  <td><button className="btn btn-secondary btn-sm">Open</button></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 20, color: 'var(--txd)' }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
