import { useState } from 'react';
import ClearanceCertificateForm from '../../components/civilian/ClearanceCertificateForm';
import { useSubmitClearance } from '../../hooks/useCivilianApi';
import toast from 'react-hot-toast';

export default function ClearanceCert() {
  const [step, setStep] = useState('form');
  const { submitClearance } = useSubmitClearance();

  async function handleSubmit(form) {
    const { paymentUrl, id } = await submitClearance({
      subjectId: form.fullName,
      amount: form.amount,
      purpose: form.purpose,
      payload: {
        fullName: form.fullName,
        idNumber: form.idNumber,
        dob: form.dob,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        address: form.address,
        supportingDocs: form.supportingDocs,
      },
    });
    if (paymentUrl) {
      toast.success('Redirecting to PayFast…');
      window.location.href = paymentUrl;
      return;
    }
    toast.success(`Application recorded (${id})`);
    setStep('submitted');
  }

  if (step === 'submitted') {
    return (
      <div className="page-wrap">
        <div className="page-intro">
          <div className="page-tag">Civilian · Clearance Certificate</div>
          <div className="page-title">Application Submitted</div>
        </div>
        <div style={{ maxWidth: 500 }}>
          <div className="alert alert-su" style={{ marginBottom: 16 }}>
            <div className="alert-icon">✓</div>
            Application received. Processing time: 5–10 working days after payment clears.
          </div>
          <button type="button" className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => setStep('form')}>
            New Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Clearance Certificate</div>
        <div className="page-title">Police Clearance Certificate</div>
        <div className="page-desc">POST /document/documents/clearance then PayFast sandbox checkout.</div>
      </div>

      <div className="layout-split-lg">
        <div>
          <ClearanceCertificateForm onSubmitSuccess={handleSubmit} />
        </div>
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header">
              <span className="card-title">Fee Structure</span>
            </div>
            <div className="card-body" style={{ fontSize: 12 }}>
              {[
                ['Standard (10 days)', 'R140.00'],
                ['Express (3 days)', 'R300.00'],
                ['Urgent (24hr)', 'R500.00'],
              ].map(([l, p]) => (
                <div
                  key={l}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(36,48,74,.3)',
                  }}
                >
                  <span>{l}</span>
                  <span className="mono" style={{ color: 'var(--am)' }}>
                    {p}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="alert alert-in">
            <div className="alert-icon">i</div>
            <div>
              Valid for <strong>6 months</strong> from date of issue. Must be certified for international use.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
