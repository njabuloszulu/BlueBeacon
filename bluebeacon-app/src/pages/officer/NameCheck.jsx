import { useState } from 'react';

export default function NameCheck() {
  const [mode, setMode] = useState('name'); // 'name' | 'plate'
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);

  function search() {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setResult(mode === 'name' ? {
        found: true,
        name: 'John van der Berg',
        dob: '1988-05-15',
        id: '8805155092084',
        address: '14 Main Road, Woodstock, Cape Town',
        priors: [
          { cas: 'CAS-082-25', charge: 'Armed Robbery', date: '13 Apr 2026', status: 'Open' },
          { cas: 'CAS-041-21', charge: 'Theft', date: '5 Jan 2021', status: 'Closed' },
        ],
        warrants: 1,
        driverLic: 'Valid — Code 10 — Exp: 2027',
        photo: null,
      } : {
        found: true,
        plate: query.toUpperCase(),
        make: 'Toyota Hilux',
        year: '2019',
        color: 'Silver',
        owner: 'Thabo Mokoena',
        ownerID: '9501015082084',
        licenseStatus: 'Valid — Exp: Mar 2027',
        flags: [],
      });
      setSearching(false);
    }, 800);
  }

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Name / Plate Check</div>
        <div className="page-title">Name & Plate Check</div>
        <div className="page-desc">Instant lookup against HANIS, NATIS and criminal record databases.</div>
      </div>

      <div style={{ maxWidth: 700 }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'var(--s3)', borderRadius: 6, padding: 3, width: 'fit-content' }}>
          {['name', 'plate'].map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setQuery(''); }} style={{
              padding: '6px 20px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: "'IBM Plex Sans',sans-serif",
              background: mode === m ? 'var(--bl)' : 'transparent',
              color: mode === m ? 'white' : 'var(--txm)',
            }}>{m === 'name' ? '👤 Person Lookup' : '🚗 Vehicle / Plate'}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input className="form-input mono" placeholder={mode === 'name' ? 'ID number or full name…' : 'Registration plate e.g. CA 123-456'} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} style={{ flex: 1, fontSize: 14 }} />
          <button className="btn btn-primary" onClick={search} disabled={searching}>{searching ? 'Searching…' : 'Search'}</button>
        </div>

        {result && result.found && (
          <div>
            {mode === 'name' ? (
              <>
                {result.warrants > 0 && <div className="alert alert-em" style={{ marginBottom: 14 }}><div className="alert-icon">!</div><strong>{result.warrants} active warrant(s) found</strong> — exercise caution</div>}
                <div className="card" style={{ marginBottom: 14 }}>
                  <div className="card-header"><span className="card-title">Person Details</span></div>
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div style={{ width: 56, height: 56, background: 'var(--s3)', border: '1px solid var(--bd)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👤</div>
                      <div style={{ flex: 1, fontSize: 12 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{result.name}</div>
                        <div style={{ color: 'var(--txd)', marginBottom: 8 }}>DOB: {result.dob}</div>
                        {[['ID Number', result.id], ['Address', result.address], ["Driver's Licence", result.driverLic]].map(([l, v]) => (
                          <div key={l} style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
                            <span style={{ color: 'var(--txd)', minWidth: 120 }}>{l}</span>
                            <span className={l === 'ID Number' ? 'mono' : ''}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><span className="card-title">Criminal Record</span></div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <table className="wt">
                      <thead><tr><th>CAS</th><th>Charge</th><th>Date</th><th>Status</th></tr></thead>
                      <tbody>
                        {result.priors.map(p => (
                          <tr key={p.cas}><td className="mono" style={{ fontSize: 11, color: 'var(--blb)' }}>{p.cas}</td><td>{p.charge}</td><td className="mono" style={{ fontSize: 11, color: 'var(--txd)' }}>{p.date}</td><td><span className={`b ${p.status === 'Open' ? 'b-act' : 'b-cl'}`}>{p.status}</span></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="card">
                <div className="card-header"><span className="card-title">Vehicle Record — {result.plate}</span></div>
                <div className="card-body" style={{ fontSize: 12 }}>
                  {[['Make / Model', result.make], ['Year', result.year], ['Colour', result.color], ['Registered Owner', result.owner], ['Owner ID', result.ownerID], ['Licence Status', result.licenseStatus]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                      <span style={{ color: 'var(--txd)' }}>{l}</span>
                      <span className={l === 'Owner ID' ? 'mono' : ''}>{v}</span>
                    </div>
                  ))}
                  {result.flags.length === 0 && <div className="alert alert-su" style={{ marginTop: 12 }}><div className="alert-icon">✓</div>No flags on this vehicle.</div>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
