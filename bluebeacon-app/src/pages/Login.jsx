import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePhone, validateSaId, phoneToLocal } from '../utils/validators';
import toast from 'react-hot-toast';

const ROLE_PATH = {
  civilian: '/civilian/dashboard',
  officer: '/officer/dashboard',
  judge: '/judge/dashboard',
  admin: '/officer/dashboard',
  prosecutor: '/civilian/dashboard',
};

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [regRole, setRegRole] = useState('civilian');
  const [stationId, setStationId] = useState('1');
  const [busy, setBusy] = useState(false);

  async function handleSignIn(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await login(email, password);
      const path = ROLE_PATH[data.user?.role] || '/civilian/dashboard';
      navigate(path);
    } catch {
      /* toast via interceptor */
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Invalid email');
      return;
    }
    if (!validateSaId(idNumber)) {
      toast.error('Invalid South African ID');
      return;
    }
    if (!validatePhone(phone)) {
      toast.error('Phone must be +27 format');
      return;
    }
    setBusy(true);
    try {
      const body = {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: regRole,
        idNumber: idNumber.replace(/\s/g, ''),
        phone: phoneToLocal(phone),
      };
      if (regRole === 'officer' || regRole === 'admin') {
        body.stationId = stationId;
      }
      await register(body);
      toast.success('Account created — sign in');
      setMode('signin');
    } catch {
      /* interceptor */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: 'var(--bl)',
              clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
              boxShadow: '0 0 20px rgba(59,130,246,.4)',
            }}
          />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 600, letterSpacing: '.1em' }}>
            DPS · BLUEBEACON
          </span>
        </div>
        <h1 style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          Digital Policing System
        </h1>
        <p style={{ fontSize: 13, color: 'var(--txm)', maxWidth: 440 }}>
          Sign in with your issued account. Refresh tokens are stored in HTTP-only cookies (7 days).
        </p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-header" style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'signin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>
        <div className="card-body">
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
                {busy ? '…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full name (letters only)</label>
                <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                  <option value="civilian">Civilian</option>
                  <option value="officer">Officer (requires station)</option>
                  <option value="judge">Judge</option>
                </select>
              </div>
              {(regRole === 'officer' || regRole === 'admin') && (
                <div className="form-group">
                  <label className="form-label">Station ID (numeric)</label>
                  <input className="form-input mono" value={stationId} onChange={(e) => setStationId(e.target.value)} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">SA ID (13 digits)</label>
                <input className="form-input mono" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile (+27…)</label>
                <input className="form-input mono" placeholder="+27821234567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
                {busy ? '…' : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div style={{ marginTop: 28, textAlign: 'center', fontSize: 10, color: 'var(--txd)', fontFamily: "'IBM Plex Mono',monospace" }}>
        API base: {import.meta.env.VITE_API_URL || '/api (Vite proxy)'}
      </div>
    </div>
  );
}
