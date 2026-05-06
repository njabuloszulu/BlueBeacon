import { useRef, useState } from 'react';
import { validateEmail, validatePhone, validateSaId } from '../../utils/validators';
import toast from 'react-hot-toast';

export default function ClearanceCertificateForm({ onSubmitSuccess }) {
  const [purpose, setPurpose] = useState('Employment');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('140.00');
  const [uploadedDocs, setUploadedDocs] = useState({});
  const docRefs = useRef({});
  const [busy, setBusy] = useState(false);

  function validate() {
    if (!validateSaId(idNumber)) {
      toast.error('Invalid South African ID number');
      return false;
    }
    if (!validatePhone(phone)) {
      toast.error('Phone must be +27 followed by 9 digits (e.g. +27821234567)');
      return false;
    }
    if (!validateEmail(email)) {
      toast.error('Invalid email address');
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setBusy(true);
    try {
      await onSubmitSuccess?.({
        fullName,
        idNumber,
        dob,
        gender,
        phone,
        email,
        address,
        purpose,
        amount,
        supportingDocs: uploadedDocs,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <span className="card-title">Applicant Information</span>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name (as per ID)</label>
              <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">ID Number</label>
              <input className="form-input mono" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input mono" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact (+27)</label>
              <input
                className="form-input mono"
                placeholder="+27821234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <span className="card-title">Purpose of Application</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Employment', 'Emigration', 'Visa Application', 'Adoption', 'Volunteer Work', 'Other'].map((p) => (
              <div
                key={p}
                role="button"
                tabIndex={0}
                onClick={() => setPurpose(p)}
                onKeyDown={(e) => e.key === 'Enter' && setPurpose(p)}
                style={{
                  padding: '6px 12px',
                  background: purpose === p ? 'rgba(59,130,246,.1)' : 'var(--s3)',
                  border: purpose === p ? '1px solid var(--bl)' : '1px solid var(--bd)',
                  borderRadius: 5,
                  fontSize: 11,
                  color: purpose === p ? 'var(--blb)' : 'var(--txm)',
                  cursor: 'pointer',
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <span className="card-title">Supporting Documents</span>
        </div>
        <div className="card-body">
          {['Certified copy of ID', 'Proof of address (< 3 months)', 'Application fee receipt'].map((label) => (
            <div key={label}>
              <input
                ref={(el) => {
                  docRefs.current[label] = el;
                }}
                type="file"
                accept="*/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files[0]) setUploadedDocs((prev) => ({ ...prev, [label]: e.target.files[0].name }));
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(36,48,74,.3)',
                }}
              >
                <span style={{ fontSize: 16 }}>{uploadedDocs[label] ? '✅' : '📎'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12 }}>{label}</div>
                  {uploadedDocs[label] && (
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--txd)',
                        marginTop: 2,
                        fontFamily: "'IBM Plex Mono',monospace",
                      }}
                    >
                      {uploadedDocs[label]}
                    </div>
                  )}
                </div>
                {uploadedDocs[label] ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setUploadedDocs((prev) => {
                      const n = { ...prev };
                      delete n[label];
                      return n;
                    })}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => docRefs.current[label]?.click()}
                  >
                    Upload
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Fee tier (amount sent to PayFast)</label>
        <select className="form-select" value={amount} onChange={(e) => setAmount(e.target.value)}>
          <option value="140.00">Standard (10 days) — R140</option>
          <option value="300.00">Express (3 days) — R300</option>
          <option value="500.00">Urgent (24hr) — R500</option>
        </select>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={busy}
        onClick={handleSubmit}
      >
        {busy ? 'Submitting…' : `Submit & pay — R${parseFloat(amount).toFixed(2)}`}
      </button>
    </div>
  );
}
