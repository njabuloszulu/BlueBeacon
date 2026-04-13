import { useState } from 'react';

export default function AccountSettings() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Account Settings</div>
        <div className="page-title">Account Settings</div>
        <div className="page-desc">Manage your profile, notifications, privacy and security preferences.</div>
      </div>

      {saved && <div className="alert alert-su" style={{ marginBottom: 16 }}><div className="alert-icon">✓</div>Settings saved successfully.</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        {/* Section nav */}
        <div>
          {['Profile', 'Security', 'Notifications', 'Privacy', 'Linked Vehicles'].map((s, i) => (
            <div key={s} style={{ padding: '8px 12px', fontSize: 12, color: i === 0 ? 'var(--blb)' : 'var(--txm)', background: i === 0 ? 'rgba(59,130,246,.08)' : 'transparent', borderLeft: i === 0 ? '2px solid var(--bl)' : '2px solid transparent', cursor: 'pointer', borderRadius: '0 4px 4px 0' }}>{s}</div>
          ))}
        </div>

        <div>
          {/* Profile */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">Personal Information</span></div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,.15)', color: 'var(--gn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>T</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Thabo Mokoena</div>
                  <div style={{ fontSize: 11, color: 'var(--txd)' }}>ID ···5082 · Active since Jan 2026</div>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 6 }}>Change Photo</button>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">First Name</label><input className="form-input" defaultValue="Thabo" /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" defaultValue="Mokoena" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">ID Number</label><input className="form-input mono" defaultValue="9501015082084" /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input mono" defaultValue="082 555 0123" /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="thabo@example.com" /></div>
              <div className="form-group"><label className="form-label">Home Address</label><input className="form-input" defaultValue="12 Bree Street, Cape Town CBD, 8001" /></div>
            </div>
          </div>

          {/* Security */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">Security</span></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" placeholder="••••••••" /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" placeholder="••••••••" /></div>
                <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-input" placeholder="••••••••" /></div>
              </div>
              <div className="dv" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: 12, fontWeight: 600 }}>Two-Factor Authentication</div><div style={{ fontSize: 11, color: 'var(--txd)' }}>SMS code required on login</div></div>
                <div className="toggle on"><div className="toggle-knob" /></div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={() => setSaved(true)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
