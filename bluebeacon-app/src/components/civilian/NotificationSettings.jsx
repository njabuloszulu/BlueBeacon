import { useEffect, useState } from 'react';
import { useNotificationPreferences } from '../../hooks/useCivilianApi';
import { registerFcmAndSyncToken } from '../../services/fcm';
import toast from 'react-hot-toast';

export default function NotificationSettings({ userId }) {
  const { prefs, loading, save, reload } = useNotificationPreferences(userId);
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(false);
  const [fcmBusy, setFcmBusy] = useState(false);

  useEffect(() => {
    if (!prefs) return;
    setPush(prefs.pushEnabled !== false);
    setSms(Boolean(prefs.smsEnabled));
    setEmail(Boolean(prefs.emailEnabled));
  }, [prefs]);

  async function handleSave() {
    try {
      await save({ push, sms, email });
      toast.success('Notification preferences saved');
    } catch {
      /* toast from api */
    }
  }

  async function enablePush() {
    setFcmBusy(true);
    try {
      const t = await registerFcmAndSyncToken();
      if (t) toast.success('Push notifications enabled');
      else toast('Configure Firebase env vars to enable push', { icon: 'ℹ️' });
      await reload();
    } finally {
      setFcmBusy(false);
    }
  }

  if (!userId) return null;

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="card-header">
        <span className="card-title">Notification preferences</span>
      </div>
      <div className="card-body">
        {loading && <div style={{ fontSize: 12, color: 'var(--txd)' }}>Loading…</div>}
        {!loading && (
          <>
            {[
              { label: 'Push notifications', value: push, set: setPush },
              { label: 'SMS alerts', value: sms, set: setSms },
              { label: 'Email updates', value: email, set: setEmail },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(36,48,74,.3)',
                }}
              >
                <span style={{ fontSize: 12 }}>{row.label}</span>
                <div
                  role="switch"
                  aria-checked={row.value}
                  className={`toggle ${row.value ? 'on' : 'off'}`}
                  onClick={() => row.set(!row.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="toggle-knob" />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn btn-secondary btn-sm" disabled={fcmBusy} onClick={enablePush}>
                {fcmBusy ? '…' : 'Register device for push (FCM)'}
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
                Save preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
