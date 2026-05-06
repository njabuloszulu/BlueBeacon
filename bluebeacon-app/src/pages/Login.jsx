import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ROLES = [
  {
    id: 'civilian',
    icon: 'ðŸ‘¤',
    title: 'Civilian',
    subtitle: 'Report incidents, track cases, pay fines & access services',
    color: 'var(--gn)',
    bg: 'rgba(16,185,129,.08)',
    border: 'rgba(16,185,129,.25)',
    badge: 'PUBLIC ACCESS',
    badgeBg: 'var(--gnd)',
    badgeTx: 'var(--gn)',
    defaultPath: '/civilian/dashboard',
  },
  {
    id: 'officer',
    icon: 'ðŸ›¡',
    title: 'Police Officer',
    subtitle: 'Manage incidents, dockets, dispatch, arrests & evidence',
    color: 'var(--blb)',
    bg: 'rgba(59,130,246,.08)',
    border: 'rgba(59,130,246,.25)',
    badge: 'SAPS PERSONNEL',
    badgeBg: 'var(--bld)',
    badgeTx: 'var(--blb)',
    defaultPath: '/officer/dashboard',
  },
  {
    id: 'judge',
    icon: 'âš–',
    title: 'Magistrate / Judge',
    subtitle: 'Review warrants, bail applications & issue court orders',
    color: 'var(--am)',
    bg: 'rgba(245,158,11,.08)',
    border: 'rgba(245,158,11,.25)',
    badge: 'JUDICIARY',
    badgeBg: 'var(--amd)',
    badgeTx: 'var(--am)',
    defaultPath: '/judge/dashboard',
  },
];

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  function handleSelect(role) {
    login(role.id);
    navigate(role.defaultPath);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--bl)',
            clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
            boxShadow: '0 0 20px rgba(59,130,246,.4)',
          }} />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 600, letterSpacing: '.1em' }}>
            DPS Â· BLUEBEACON
          </span>
        </div>
        <h1 style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Digital Policing System
        </h1>
        <p style={{ fontSize: 13, color: 'var(--txm)', maxWidth: 440 }}>
          South Africa's integrated law enforcement & public safety platform. Select your role to continue.
        </p>
      </div>

      {/* Role cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 840, width: '100%' }}>
        {ROLES.map(role => (
          <button
            key={role.id}
            onClick={() => handleSelect(role)}
            style={{
              background: role.bg,
              border: `1px solid ${role.border}`,
              borderRadius: 12,
              padding: '24px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all .2s',
              fontFamily: "'IBM Plex Sans',sans-serif",
              color: 'var(--tx)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,.4)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{role.icon}</div>
            <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 3, fontSize: 9, fontWeight: 700, letterSpacing: '.12em', background: role.badgeBg, color: role.badgeTx, marginBottom: 10 }}>
              {role.badge}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, fontFamily: "'IBM Plex Sans',sans-serif", color: role.color }}>
              {role.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--txm)', lineHeight: 1.6 }}>
              {role.subtitle}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: role.color, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.04em' }}>
              Enter portal â†’
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, textAlign: 'center', fontSize: 10, color: 'var(--txd)', fontFamily: "'IBM Plex Mono',monospace" }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gn)', boxShadow: '0 0 5px var(--gn)' }} />
          ALL SYSTEMS OPERATIONAL Â· dps.gov.za
        </div>
        <div style={{ color: 'var(--txd)' }}>Demo environment â€” no real data is transmitted or stored</div>
      </div>
    </div>
  );
}
