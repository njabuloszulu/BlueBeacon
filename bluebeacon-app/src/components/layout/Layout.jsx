import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useApp } from '../../context/AppContext';

const ROLE_COLORS = {
  civilian: 'var(--gn)',
  officer: 'var(--blb)',
  judge: 'var(--am)',
};

export default function Layout() {
  const { role } = useApp();
  const accentColor = ROLE_COLORS[role] || 'var(--blb)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top nav bar */}
      <nav style={{
        height: 44,
        background: '#02040a',
        borderBottom: '1px solid var(--bd)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        flexShrink: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 16, borderRight: '1px solid var(--bd)' }}>
          <div style={{
            width: 20, height: 20,
            background: 'var(--bl)',
            clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
          }} />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '.14em' }}>
            DPS · BLUEBEACON
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Role indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: accentColor, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
          {role} portal
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--bd)', margin: '0 8px' }} />

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--txd)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gn)', boxShadow: '0 0 5px var(--gn)' }} />
          System Online
        </div>
      </nav>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
