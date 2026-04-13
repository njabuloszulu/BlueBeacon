import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const CIVILIAN_NAV = [
  { group: 'Main' },
  { path: '/civilian/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/civilian/report', icon: '✦', label: 'Report Incident', badge: '!' },
  { path: '/civilian/my-reports', icon: '◎', label: 'My Reports' },
  { group: 'Safety' },
  { path: '/civilian/map', icon: '🗺', label: 'Live Map' },
  { path: '/civilian/alerts', icon: '🔔', label: 'Alerts', badge: '3' },
  { group: 'Services' },
  { path: '/civilian/clearance', icon: '📄', label: 'Clearance Cert' },
  { path: '/civilian/fines', icon: '💳', label: 'Pay Traffic Fine' },
  { path: '/civilian/appointments', icon: '📅', label: 'Book Appointment' },
  { group: 'Help' },
  { path: '/civilian/support', icon: '❤', label: 'Victim Support' },
  { path: '/civilian/settings', icon: '⚙', label: 'Settings' },
];

const OFFICER_NAV = [
  { group: 'Operations' },
  { path: '/officer/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/officer/incidents', icon: '🚨', label: 'Incident Queue', badge: '7' },
  { path: '/officer/dockets', icon: '📁', label: 'Docket Manager' },
  { path: '/officer/dispatch', icon: '📡', label: 'Dispatch Board' },
  { path: '/officer/map', icon: '🗺', label: 'Patrol Map' },
  { group: 'Records' },
  { path: '/officer/arrests', icon: '🔒', label: 'Arrests' },
  { path: '/officer/bail', icon: '⚖', label: 'Bail Applications' },
  { path: '/officer/evidence', icon: '🧪', label: 'Evidence Locker' },
  { path: '/officer/warrants', icon: '📋', label: 'Warrant Requests' },
  { group: 'Station' },
  { path: '/officer/cells', icon: '🏢', label: 'Cell Board' },
  { path: '/officer/namecheck', icon: '🔍', label: 'Name / Plate Check' },
  { path: '/officer/comms', icon: '💬', label: 'Comms', badge: '2' },
  { path: '/officer/shifts', icon: '📆', label: 'Shift Management' },
];

const JUDGE_NAV = [
  { group: 'Judicial' },
  { path: '/judge/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/judge/warrants', icon: '📋', label: 'Warrant Inbox', badge: '4' },
  { path: '/judge/bail', icon: '⚖', label: 'Bail Review' },
  { path: '/judge/cases', icon: '📁', label: 'Case Files' },
  { group: 'Records' },
  { path: '/judge/signed-warrants', icon: '✍', label: 'Signed Warrants' },
  { path: '/judge/orders', icon: '📜', label: 'Court Orders' },
  { path: '/judge/archives', icon: '🗄', label: 'Archives' },
];

const NAV_MAP = { civilian: CIVILIAN_NAV, officer: OFFICER_NAV, judge: JUDGE_NAV };

const ROLE_META = {
  civilian: { label: 'CIVILIAN', color: 'var(--gn)', bg: 'rgba(16,185,129,.15)', badgeBg: 'var(--gnd)', badgeTx: 'var(--gn)' },
  officer:  { label: 'OFFICER',  color: 'var(--blb)', bg: 'rgba(59,130,246,.15)', badgeBg: 'var(--bld)', badgeTx: 'var(--blb)' },
  judge:    { label: 'JUDGE',    color: 'var(--am)',  bg: 'rgba(245,158,11,.15)', badgeBg: 'var(--amd)', badgeTx: 'var(--am)' },
};

export default function Sidebar() {
  const { role, user, logout } = useApp();
  const navigate = useNavigate();
  const nav = NAV_MAP[role] || [];
  const meta = ROLE_META[role] || ROLE_META.civilian;

  return (
    <aside style={{
      width: 200,
      minWidth: 200,
      background: 'var(--s2)',
      borderRight: '1px solid var(--bd)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100%',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--bd)', marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginBottom: 5 }}>
          {role === 'civilian' ? '👤' : role === 'officer' ? '🛡' : '⚖'}
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '.07em' }}>DPS PORTAL</div>
        <div style={{ display: 'inline-block', marginTop: 3, padding: '1px 6px', borderRadius: 2, fontSize: 8, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', background: meta.badgeBg, color: meta.badgeTx }}>
          {meta.label}
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1 }}>
        {nav.map((item, i) =>
          item.group ? (
            <div key={i} style={{ padding: '6px 12px 2px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, letterSpacing: '.17em', textTransform: 'uppercase', color: 'var(--txd)' }}>
              {item.group}
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                color: isActive ? 'var(--blb)' : 'var(--txm)',
                cursor: 'pointer',
                borderLeft: isActive ? '2px solid var(--bl)' : '2px solid transparent',
                background: isActive ? 'rgba(59,130,246,.08)' : 'transparent',
                textDecoration: 'none',
                transition: 'all .1s',
              })}
            >
              <span style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--bd)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: 'var(--rd)', color: 'white', fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 5 }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        )}
      </div>

      {/* User + logout */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--bd)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            {user?.avatar}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 9, color: 'var(--txd)', fontFamily: "'IBM Plex Mono',monospace" }}>{user?.id}</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { logout(); navigate('/'); }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
