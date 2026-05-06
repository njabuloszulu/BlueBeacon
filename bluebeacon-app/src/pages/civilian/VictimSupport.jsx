export default function VictimSupport() {
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian Â· Victim Support</div>
        <div className="page-title">Victim Support & Resources</div>
        <div className="page-desc">Confidential support services, crisis hotlines and resources for crime victims and survivors.</div>
      </div>

      <div className="alert alert-in" style={{ marginBottom: 20 }}>
        <div className="alert-icon">i</div>
        All services on this page are <strong>confidential</strong>. Your identity is protected. In an emergency, call <strong>10111</strong>.
      </div>

      {/* Crisis lines */}
      <div className="section-label">Emergency & Crisis Lines</div>
      <div className="g3" style={{ marginBottom: 20 }}>
        {[
          { icon: 'ðŸš¨', label: 'SAPS Emergency', number: '10111', color: 'var(--rd)', bg: 'rgba(239,68,68,.07)' },
          { icon: 'â¤', label: 'GBV Command Centre', number: '0800 428 428', color: 'var(--pu)', bg: 'rgba(139,92,246,.07)' },
          { icon: 'ðŸŒ', label: 'SAPS Careline', number: '0800 333 177', color: 'var(--bl)', bg: 'rgba(59,130,246,.07)' },
          { icon: 'ðŸ‘¶', label: 'Child Line SA', number: '0800 055 555', color: 'var(--gn)', bg: 'rgba(16,185,129,.07)' },
          { icon: 'ðŸ’¬', label: 'SADAG Helpline', number: '0800 567 567', color: 'var(--am)', bg: 'rgba(245,158,11,.07)' },
          { icon: 'ðŸ ', label: 'Lifeline SA', number: '0861 322 322', color: 'var(--gnb)', bg: 'rgba(52,211,153,.07)' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 9, padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, fontWeight: 700, color: c.color }}>{c.number}</div>
            <div style={{ fontSize: 10, color: 'var(--txd)', marginTop: 4 }}>Free Â· 24/7 Â· Confidential</div>
          </div>
        ))}
      </div>

      {/* Support services */}
      <div className="section-label">Support Services</div>
      <div className="g2" style={{ marginBottom: 20 }}>
        {[
          { title: 'Trauma Counselling', desc: 'Free sessions with accredited counsellors. Book via this portal or walk in at any station.', action: 'Book Session' },
          { title: 'Legal Aid', desc: 'Free legal representation and advice for victims who cannot afford private counsel.', action: 'Apply Now' },
          { title: 'Shelter & Housing', desc: 'Emergency accommodation for victims of domestic violence and human trafficking.', action: 'Find Shelter' },
          { title: 'Witness Protection', desc: 'Apply for the National Witness Protection Programme if your safety is at risk.', action: 'Learn More' },
        ].map(s => (
          <div key={s.title} className="card">
            <div className="card-header"><span className="card-title">{s.title}</span></div>
            <div className="card-body">
              <div style={{ fontSize: 12, color: 'var(--txm)', lineHeight: 1.7, marginBottom: 12 }}>{s.desc}</div>
              <button className="btn btn-primary btn-sm">{s.action}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Request contact */}
      <div className="card">
        <div className="card-header"><span className="card-title">Request a Victim Support Officer</span></div>
        <div className="card-body" style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 12, color: 'var(--txm)', marginBottom: 14 }}>A trained Victim Support Officer will contact you within 24 hours. All enquiries are completely confidential.</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Preferred Contact</label>
              <select className="form-select"><option>Phone call</option><option>SMS</option><option>Email</option><option>In-person visit</option></select>
            </div>
            <div className="form-group"><label className="form-label">Best Time to Contact</label>
              <select className="form-select"><option>Morning (8amâ€“12pm)</option><option>Afternoon (12pmâ€“4pm)</option><option>Evening (4pmâ€“7pm)</option><option>Any time</option></select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Brief description (optional)</label>
            <textarea className="form-textarea" rows={3} placeholder="Briefly describe your situation so we can connect you with the right supportâ€¦" />
          </div>
          <button className="btn btn-primary">Request Support Officer</button>
        </div>
      </div>
    </div>
  );
}
