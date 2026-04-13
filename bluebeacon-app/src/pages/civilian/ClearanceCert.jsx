import { useState } from 'react';

export default function ClearanceCert() {
  const [step, setStep] = useState('form'); // 'form' | 'submitted' | 'ready'

  if (step === 'submitted') return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Clearance Certificate</div>
        <div className="page-title">Application Submitted</div>
      </div>
      <div style={{ maxWidth: 500 }}>
        <div className="alert alert-su" style={{ marginBottom: 16 }}>
          <div className="alert-icon">✓</div>
          Application REF-CLR-0419 received. Processing time: 5–10 working days.
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Application Status</span></div>
          <div className="card-body">
            <div className="timeline">
              {[
                { label: 'Application submitted', time: '13 Apr 2026 · 10:15', state: 'done' },
                { label: 'Identity verification', time: 'In progress', state: 'current' },
                { label: 'Criminal record check', time: 'Pending', state: 'todo' },
                { label: 'Certificate generated', time: 'Pending', state: 'todo' },
                { label: 'Available for download', time: 'Pending', state: 'todo' },
              ].map((t, i) => (
                <div key={i} className="tl-item">
                  <div className={`tl-dot ${t.state}`}>{t.state === 'done' ? '✓' : t.state === 'current' ? '●' : '○'}</div>
                  <div><div className="tl-title">{t.label}</div><div className="tl-meta">{t.time}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => setStep('form')}>New Application</button>
      </div>
    </div>
  );

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Clearance Certificate</div>
        <div className="page-title">Police Clearance Certificate</div>
        <div className="page-desc">Apply online for your police clearance certificate. Valid for employment, emigration, visa applications and more.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">Applicant Information</span></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name (as per ID)</label><input className="form-input" defaultValue="Thabo Mokoena" /></div>
                <div className="form-group"><label className="form-label">ID Number</label><input className="form-input mono" defaultValue="9501015082084" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input mono" defaultValue="1995-01-01" /></div>
                <div className="form-group"><label className="form-label">Gender</label>
                  <select className="form-select"><option>Male</option><option>Female</option><option>Non-binary</option></select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Contact Number</label><input className="form-input mono" defaultValue="082 555 0123" /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" defaultValue="thabo@example.com" /></div>
              </div>
              <div className="form-group"><label className="form-label">Residential Address</label><input className="form-input" defaultValue="12 Bree Street, Cape Town CBD, 8001" /></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">Purpose of Application</span></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Employment', 'Emigration', 'Visa Application', 'Adoption', 'Volunteer Work', 'Other'].map(p => (
                  <div key={p} style={{ padding: '6px 12px', background: p === 'Employment' ? 'rgba(59,130,246,.1)' : 'var(--s3)', border: p === 'Employment' ? '1px solid var(--bl)' : '1px solid var(--bd)', borderRadius: 5, fontSize: 11, color: p === 'Employment' ? 'var(--blb)' : 'var(--txm)', cursor: 'pointer' }}>{p}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">Supporting Documents</span></div>
            <div className="card-body">
              {[
                { label: 'Certified copy of ID', status: 'uploaded', icon: '✅' },
                { label: 'Proof of address (< 3 months)', status: 'upload', icon: '📎' },
                { label: 'Application fee receipt', status: 'upload', icon: '📎' },
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                  <span style={{ fontSize: 16 }}>{d.icon}</span>
                  <span style={{ flex: 1, fontSize: 12 }}>{d.label}</span>
                  {d.status === 'uploaded' ? <span className="b b-act">Uploaded</span> : <button className="btn btn-secondary btn-sm">Upload</button>}
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('submitted')}>
            Submit Application — R140.00
          </button>
        </div>

        {/* Info panel */}
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header"><span className="card-title">Fee Structure</span></div>
            <div className="card-body" style={{ fontSize: 12 }}>
              {[['Standard (10 days)', 'R140.00'], ['Express (3 days)', 'R300.00'], ['Urgent (24hr)', 'R500.00']].map(([l, p]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                  <span>{l}</span><span className="mono" style={{ color: 'var(--am)' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="alert alert-in">
            <div className="alert-icon">i</div>
            <div>Valid for <strong>6 months</strong> from date of issue. Must be certified for international use.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
