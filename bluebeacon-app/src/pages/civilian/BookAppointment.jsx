import { useState } from 'react';

const STATIONS = [
  'Cape Town Central', 'Sea Point', 'Woodstock', 'Claremont', 'Bellville', 'Mitchells Plain',
];
const SERVICES = [
  '📋 Open new case / affidavit',
  '📄 Police clearance certificate',
  '🔍 Query existing case',
  '📝 Witness statement',
  '🔒 Report domestic violence',
  '👤 Report missing person',
  '⚙ General enquiry',
];
const TIMES = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30'];

export default function BookAppointment() {
  const [station, setStation] = useState('Cape Town Central');
  const [service, setService] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState(null);
  const [booked, setBooked] = useState(false);

  if (booked) return (
    <div className="page-wrap">
      <div style={{ maxWidth: 480 }}>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📅</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Appointment Confirmed!</div>
          <div className="alert alert-su" style={{ marginBottom: 16, textAlign: 'left' }}>
            <div className="alert-icon">✓</div>
            Booking REF-APT-0831 — You'll receive an SMS reminder 2 hours before.
          </div>
          <div className="card">
            <div className="card-body" style={{ fontSize: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>STATION</div><div style={{ fontWeight: 600 }}>{station}</div></div>
                <div><div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>SERVICE</div><div>{service}</div></div>
                <div><div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>DATE</div><div className="mono">{date}</div></div>
                <div><div style={{ fontSize: 9, color: 'var(--txd)', marginBottom: 2 }}>TIME</div><div className="mono">{time}</div></div>
              </div>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={() => setBooked(false)}>Book Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Book Appointment</div>
        <div className="page-title">Book a Police Station Visit</div>
        <div className="page-desc">Skip the queue by booking your visit in advance. Available at all major stations.</div>
      </div>

      <div className="layout-master-detail">
        <div>
          <div className="form-group">
            <label className="form-label">Select Station</label>
            <select className="form-select" value={station} onChange={e => setStation(e.target.value)}>
              {STATIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Service Required</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SERVICES.map(s => (
                <div key={s} onClick={() => setService(s)} style={{
                  padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                  background: service === s ? 'rgba(59,130,246,.08)' : 'var(--s3)',
                  border: service === s ? '1px solid rgba(59,130,246,.35)' : '1px solid var(--bd)',
                  color: service === s ? 'var(--blb)' : 'var(--txm)',
                  fontSize: 12,
                }}>{s}</div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Date</label>
            <input type="date" className="form-input mono" value={date} onChange={e => setDate(e.target.value)} min="2026-04-14" />
          </div>

          {date && (
            <div className="form-group">
              <label className="form-label">Available Time Slots</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TIMES.map(t => (
                  <div key={t} onClick={() => setTime(t)} style={{
                    padding: '7px 14px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontFamily: "'IBM Plex Mono',monospace",
                    background: time === t ? 'var(--bl)' : 'var(--s3)',
                    color: time === t ? 'white' : 'var(--txm)',
                    border: time === t ? 'none' : '1px solid var(--bd)',
                  }}>{t}</div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Additional Notes (optional)</label>
            <textarea className="form-textarea" rows={3} placeholder="Any specific details the officer should know beforehand…" />
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
            disabled={!service || !date || !time}
            onClick={() => setBooked(true)}>
            Confirm Appointment
          </button>
        </div>

        <div style={{ position: 'sticky', top: 18, paddingTop: 20 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Station Info</span></div>
            <div className="card-body" style={{ fontSize: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>📍 {station}</div>
              <div style={{ color: 'var(--txd)', marginBottom: 12, lineHeight: 1.7 }}>1 Buitenkant Street, Cape Town, 8001</div>
              <div className="dv" />
              <div style={{ marginBottom: 6 }}><span style={{ color: 'var(--txd)' }}>Phone: </span><span className="mono">021 467 8000</span></div>
              <div style={{ marginBottom: 12 }}><span style={{ color: 'var(--txd)' }}>Hours: </span>Mon–Fri 07:30–16:00</div>
              <div className="alert alert-in" style={{ fontSize: 11 }}>
                <div className="alert-icon">i</div>
                Bring original ID and all supporting documents.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
