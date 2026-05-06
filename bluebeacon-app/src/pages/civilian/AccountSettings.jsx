import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import NotificationSettings from '../../components/civilian/NotificationSettings';
import toast from 'react-hot-toast';

export default function AccountSettings() {
  const { user, rawUser } = useApp();
  const [saved, setSaved] = useState(false);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Account Settings</div>
        <div className="page-title">Account Settings</div>
        <div className="page-desc">Profile, security, and notification preferences backed by the API.</div>
      </div>

      {saved && (
        <div className="alert alert-su" style={{ marginBottom: 16 }}>
          <div className="alert-icon">✓</div>
          Settings saved successfully.
        </div>
      )}

      <div className="layout-settings">
        <div>
          {['Profile', 'Security', 'Notifications', 'Privacy', 'Linked Vehicles'].map((s, i) => (
            <div
              key={s}
              style={{
                padding: '8px 12px',
                fontSize: 12,
                color: i === 0 ? 'var(--blb)' : 'var(--txm)',
                background: i === 0 ? 'rgba(59,130,246,.08)' : 'transparent',
                borderLeft: i === 0 ? '2px solid var(--bl)' : '2px solid transparent',
                cursor: 'pointer',
                borderRadius: '0 4px 4px 0',
              }}
            >
              {s}
            </div>
          ))}
        </div>

        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <span className="card-title">Personal Information</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(16,185,129,.15)',
                    color: 'var(--gn)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  {user?.avatar || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{user?.name || '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--txd)' }}>User ID · {rawUser?.id?.slice(0, 12) || '—'}</div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" readOnly value={rawUser?.fullName || ''} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input className="form-input" readOnly value={rawUser?.role || ''} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" readOnly value={rawUser?.email || ''} />
              </div>
            </div>
          </div>

          <NotificationSettings userId={rawUser?.id} />

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <span className="card-title">Security</span>
            </div>
            <div className="card-body">
              <div style={{ fontSize: 12, color: 'var(--txd)' }}>
                Password changes are handled via the admin / auth service. Contact your station administrator.
              </div>
            </div>
          </div>

          <button type="button" className="btn btn-primary btn-lg" onClick={() => { setSaved(true); toast.success('Profile section saved locally'); }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
