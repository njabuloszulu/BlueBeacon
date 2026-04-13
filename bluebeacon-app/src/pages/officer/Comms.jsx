import { useState } from 'react';

const CHANNELS = [
  { id: 1, name: 'Cape Town Central — All Units', unread: 2 },
  { id: 2, name: 'Sector B Patrol', unread: 0 },
  { id: 3, name: 'Dispatch Command', unread: 1 },
  { id: 4, name: 'Sgt. Dlamini ↔ Lt. Marais', unread: 0 },
];

const MESSAGES = {
  1: [
    { id: 1, from: 'Dispatch', out: false, text: 'All units — armed robbery in progress at 45 Long Street. Units 7 and 3 respond immediately.', time: '16:42' },
    { id: 2, from: 'Unit 7', out: false, text: 'Unit 7 responding. ETA 4 minutes.', time: '16:43' },
    { id: 3, from: 'Me', out: true, text: 'Unit 1 standing by at Cape Town Central, available for backup.', time: '16:43' },
    { id: 4, from: 'Dispatch', out: false, text: 'Acknowledged Unit 1. Remain on standby.', time: '16:44' },
  ],
  2: [
    { id: 1, from: 'Cst. Peters', out: false, text: 'Arrived at Observatory, noise complaint resolved. Returning to patrol.', time: '15:55' },
  ],
  3: [
    { id: 1, from: 'Command', out: false, text: 'Briefing at 18:00 in the operations room. All senior officers must attend.', time: '14:00' },
  ],
  4: [
    { id: 1, from: 'Lt. Marais', out: false, text: 'Dlamini, can you send me the CAS number for the Woodstock case?', time: '13:30' },
    { id: 2, from: 'Me', out: true, text: 'CAS-082-25-02-2026 — I\'ll send the full docket through shortly.', time: '13:32' },
  ],
};

export default function Comms() {
  const [activeChannel, setActiveChannel] = useState(1);
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState(MESSAGES);

  function send() {
    if (!text.trim()) return;
    const newMsg = { id: Date.now(), from: 'Me', out: true, text, time: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) };
    setMsgs(m => ({ ...m, [activeChannel]: [...(m[activeChannel] || []), newMsg] }));
    setText('');
  }

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Comms</div>
        <div className="page-title">Communications</div>
        <div className="page-desc">Secure internal messaging between officers, units and dispatch command.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 0, height: 520, border: '1px solid var(--bd)', borderRadius: 8, overflow: 'hidden' }}>
        {/* Channel list */}
        <div style={{ background: 'var(--s2)', borderRight: '1px solid var(--bd)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--bd)', fontSize: 11, fontWeight: 600 }}>Channels</div>
          {CHANNELS.map(ch => (
            <div key={ch.id} onClick={() => setActiveChannel(ch.id)} style={{
              padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              background: activeChannel === ch.id ? 'rgba(59,130,246,.08)' : 'transparent',
              borderLeft: activeChannel === ch.id ? '2px solid var(--bl)' : '2px solid transparent',
            }}>
              <span style={{ fontSize: 14 }}>💬</span>
              <span style={{ flex: 1, fontSize: 11, color: activeChannel === ch.id ? 'var(--blb)' : 'var(--txm)' }}>{ch.name}</span>
              {ch.unread > 0 && <span style={{ background: 'var(--rd)', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>{ch.unread}</span>}
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--bd)', fontSize: 12, fontWeight: 600, background: 'var(--s2)' }}>
            {CHANNELS.find(c => c.id === activeChannel)?.name}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
            {(msgs[activeChannel] || []).map(m => (
              <div key={m.id} className={`msg-wrap ${m.out ? 'msg-out' : 'msg-in'}`}>
                {!m.out && <div style={{ fontSize: 10, color: 'var(--txd)', marginBottom: 2, fontFamily: "'IBM Plex Mono',monospace" }}>{m.from}</div>}
                <div className="msg-bubble">{m.text}</div>
                <div className="msg-meta">{m.time}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid var(--bd)', display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Type a message…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={send}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
