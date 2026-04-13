const SIGNED = [
  { id: 'WR-2026-0414', type: 'Search & Seizure', officer: 'Det. Moyo', subject: 'Drug network premises', signed: '9 Apr 2026 · 11:45', expires: '23 Apr 2026', cas: 'CAS-070-10' },
  { id: 'WR-2026-0410', type: 'Arrest Warrant', officer: 'Lt. Marais', subject: 'H. September', signed: '7 Apr 2026 · 09:00', expires: '21 Apr 2026', cas: 'CAS-062-07' },
  { id: 'WR-2026-0407', type: 'Surveillance', officer: 'Det. Moyo', subject: 'Parow network', signed: '5 Apr 2026 · 14:30', expires: '5 May 2026', cas: 'CAS-058-05' },
  { id: 'WR-2026-0398', type: 'Search & Seizure', officer: 'Sgt. Dlamini', subject: 'K. van Wyk', signed: '1 Apr 2026 · 10:00', expires: '15 Apr 2026', cas: 'CAS-049-01' },
];

export default function SignedWarrants() {
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Judge · Signed Warrants</div>
        <div className="page-title">Signed Warrants</div>
        <div className="page-desc">Registry of all warrants signed by Judge S. van Wyk. Tamper-evident digital ledger.</div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="stat-card accent-gn"><div className="stat-label">Signed (April)</div><div className="stat-value">22</div></div>
        <div className="stat-card accent-am"><div className="stat-label">Active / Unexpired</div><div className="stat-value">14</div></div>
        <div className="stat-card accent-rd"><div className="stat-label">Expired</div><div className="stat-value">8</div></div>
        <div className="stat-card accent-bl"><div className="stat-label">Total (2026)</div><div className="stat-value">88</div></div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Signed Warrant Registry</span><button className="btn btn-secondary btn-sm">Export PDF</button></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="wt">
            <thead><tr><th>Warrant Ref</th><th>Type</th><th>Officer</th><th>Subject</th><th>CAS</th><th>Signed</th><th>Expires</th><th>Download</th></tr></thead>
            <tbody>
              {SIGNED.map(w => {
                const expired = new Date(w.expires.split(' · ')[0]) < new Date();
                return (
                  <tr key={w.id}>
                    <td className="mono" style={{ color: 'var(--blb)', fontSize: 11 }}>{w.id}</td>
                    <td style={{ fontSize: 11 }}>{w.type}</td>
                    <td style={{ fontSize: 11 }}>{w.officer}</td>
                    <td style={{ fontSize: 11 }}>{w.subject}</td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{w.cas}</td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{w.signed}</td>
                    <td className="mono" style={{ fontSize: 11, color: expired ? 'var(--rd)' : 'var(--gn)' }}>{w.expires}</td>
                    <td><button className="btn btn-secondary btn-sm">PDF</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
