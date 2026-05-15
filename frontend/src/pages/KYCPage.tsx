import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, Clock, XCircle, FileText, Shield } from 'lucide-react';
import api from '../api';
import { useAuthStore } from '../store/authStore';

type Occupation = 'salaried' | 'business' | 'student' | 'self_employed' | 'other' | '';

interface KYCStatus {
  status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  occupation?: string;
  aadhaarUrl?: string; panUrl?: string; jobIdUrl?: string;
  salarySlipUrl?: string; businessRegUrl?: string; gstCertUrl?: string;
  collegeIdUrl?: string; bonafideUrl?: string; workProofUrl?: string;
  otherDocUrl?: string; otherDocName?: string; adminNotes?: string;
}

const occupations = [
  { value: 'salaried',      label: '👔 Salaried Employee',  desc: 'Working in a company or organization' },
  { value: 'business',      label: '🏢 Business Owner',     desc: 'Running your own business' },
  { value: 'student',       label: '🎓 Student',            desc: 'Currently enrolled in college/university' },
  { value: 'self_employed', label: '💼 Self Employed',      desc: 'Freelancer, consultant, contractor' },
  { value: 'other',         label: '👤 Other',              desc: 'Retired, homemaker, etc.' },
];

const docConfig: Record<string, { mandatory: { field: string; label: string; hint: string }[]; optional: { field: string; label: string; hint: string }[] }> = {
  salaried:      { mandatory: [{ field: 'jobId', label: 'Job ID / Employee ID', hint: 'Your company-issued employee ID card' }], optional: [{ field: 'pan', label: 'PAN Card', hint: 'Permanent Account Number card' }, { field: 'salarySlip', label: 'Salary Slip', hint: 'Latest month salary slip' }] },
  business:      { mandatory: [{ field: 'pan', label: 'PAN Card', hint: 'Business or personal PAN card' }, { field: 'businessReg', label: 'Business Registration', hint: 'GST certificate, Shop Act, or Udyam registration' }], optional: [{ field: 'gstCert', label: 'GST Certificate', hint: 'If registered under GST' }] },
  student:       { mandatory: [{ field: 'collegeId', label: 'College / University ID', hint: 'Valid student ID card' }], optional: [{ field: 'bonafide', label: 'Bonafide Certificate', hint: 'Issued by your institution' }] },
  self_employed: { mandatory: [{ field: 'pan', label: 'PAN Card', hint: 'Permanent Account Number card' }, { field: 'workProof', label: 'Work Proof', hint: 'Any document showing your work (invoice, contract, certificate)' }], optional: [] },
  other:         { mandatory: [], optional: [{ field: 'otherDoc', label: 'Any Supporting Document', hint: 'Voter ID, Passport, Driving License, etc.' }] },
};

export default function KYCPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [occupation, setOccupation] = useState<Occupation>('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [files, setFiles] = useState<Record<string, File>>({});
  const [otherDocName, setOtherDocName] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchKYC();
  }, [user]);

  const fetchKYC = async () => {
    try {
      const { data } = await api.get('/kyc/my');
      setKycStatus(data);
      if (data.occupation) setOccupation(data.occupation as Occupation);
    } catch { setKycStatus({ status: 'not_submitted' }); }
    finally { setLoading(false); }
  };

  const handleFile = (field: string, file: File | undefined) => {
    if (!file) return;
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const formatAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));
  };

  const handleSubmit = async () => {
    if (!occupation) return alert('Please select your occupation.');
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    if (cleanAadhaar.length !== 12) return alert('Please enter a valid 12-digit Aadhaar number.');
    if (!files.aadhaar) return alert('Please upload your Aadhaar card document.');
    const mandatory = docConfig[occupation]?.mandatory || [];
    for (const doc of mandatory) {
      if (!files[doc.field]) return alert(`Please upload: ${doc.label}`);
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('occupation', occupation);
      fd.append('aadhaarNumber', cleanAadhaar);
      Object.entries(files).forEach(([key, file]) => fd.append(key, file));
      if (otherDocName) fd.append('otherDocName', otherDocName);
      await api.post('/kyc/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Documents submitted successfully! Admin will verify within 24 hours.');
      fetchKYC();
      setFiles({});
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit documents.');
    } finally { setSubmitting(false); }
  };

  const FileBox = ({ field, label, hint, required }: { field: string; label: string; hint: string; required?: boolean }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{hint}</p>
      <label htmlFor={`file-${field}`} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: files[field] ? '2px solid #10b981' : '2px dashed #e2e8f0', borderRadius: 10, padding: '14px 16px', background: files[field] ? '#f0fdf4' : '#f8fafc', transition: 'all 0.2s' }}>
        <Upload size={18} color={files[field] ? '#10b981' : '#6366f1'} />
        <span style={{ fontSize: 13, color: files[field] ? '#059669' : '#64748b', fontWeight: files[field] ? 600 : 400 }}>
          {files[field] ? `✓ ${files[field].name}` : 'Click to upload (JPG, PNG, PDF — max 10MB)'}
        </span>
      </label>
      <input id={`file-${field}`} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={e => handleFile(field, e.target.files?.[0])} style={{ display: 'none' }} />
    </div>
  );

  const statusConfig = {
    not_submitted: { color: '#64748b', bg: '#f1f5f9', icon: <FileText size={20} />, label: 'Not Submitted' },
    pending:       { color: '#d97706', bg: '#fef3c7', icon: <Clock size={20} />,    label: 'Under Review' },
    verified:      { color: '#059669', bg: '#d1fae5', icon: <CheckCircle size={20} />, label: 'Verified' },
    rejected:      { color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={20} />,  label: 'Rejected' },
  };

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: 14, color: '#64748b' }}>Loading...</div></div>;

  const status = kycStatus?.status || 'not_submitted';
  const cfg = statusConfig[status];
  const showForm = status === 'not_submitted' || status === 'rejected';
  const docs = occupation ? docConfig[occupation] : null;

  return (
    <div style={{ background: 'linear-gradient(135deg,#fff7ed 0%,#fef3c7 50%,#fff7ed 100%)', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', marginBottom: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>KYC Verification</h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Required for Property Rentals & Building Materials</p>
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cfg.bg, color: cfg.color, padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
            {cfg.icon} {cfg.label}
          </div>
          {status === 'verified' && <div style={{ marginTop: 16, padding: 14, background: '#d1fae5', borderRadius: 10, fontSize: 14, color: '#065f46' }}>✅ Your KYC is verified. You can now rent properties and purchase building materials.</div>}
          {status === 'pending' && <div style={{ marginTop: 16, padding: 14, background: '#fef3c7', borderRadius: 10, fontSize: 14, color: '#92400e' }}>⏳ Documents under review. Admin will verify within 24 hours.</div>}
          {status === 'rejected' && kycStatus?.adminNotes && <div style={{ marginTop: 16, padding: 14, background: '#fee2e2', borderRadius: 10, fontSize: 14, color: '#991b1b' }}>❌ <strong>Rejected:</strong> {kycStatus.adminNotes}<div style={{ marginTop: 6, fontSize: 13 }}>Please re-upload the correct documents below.</div></div>}
        </div>

        {/* Upload Form */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{status === 'rejected' ? 'Re-upload Documents' : 'Upload Your Documents'}</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>Select your occupation — documents required will change accordingly. Aadhaar is mandatory for everyone.</p>

            {/* Step 1: Occupation */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Step 1 — Select Your Occupation <span style={{ color: '#dc2626' }}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {occupations.map(o => (
                  <button key={o.value} type="button" onClick={() => setOccupation(o.value as Occupation)}
                    style={{ padding: '14px 16px', borderRadius: 12, border: occupation === o.value ? '2px solid #6366f1' : '1.5px solid #e2e8f0', background: occupation === o.value ? '#eef2ff' : '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: occupation === o.value ? '#4f46e5' : '#1e293b', marginBottom: 3 }}>{o.label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {occupation && (
              <>
                {/* Step 2: Aadhaar */}
                <div style={{ marginBottom: 28, padding: '20px 24px', background: '#fafafa', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
                    Step 2 — Aadhaar Card <span style={{ color: '#dc2626' }}>*</span> <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>(Mandatory for all)</span>
                  </label>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Aadhaar Number <span style={{ color: '#dc2626' }}>*</span></label>
                    <input type="text" inputMode="numeric" value={aadhaarNumber} onChange={e => setAadhaarNumber(formatAadhaar(e.target.value))} placeholder="XXXX XXXX XXXX" maxLength={14}
                      style={{ width: '100%', padding: '12px 16px', border: `1.5px solid ${aadhaarNumber.replace(/\s/g, '').length === 12 ? '#10b981' : '#e2e8f0'}`, borderRadius: 10, fontSize: 18, fontWeight: 700, letterSpacing: '0.15em', outline: 'none', color: '#1e293b', background: '#fff' }} />
                    {aadhaarNumber.replace(/\s/g, '').length === 12 && <p style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>✓ Valid Aadhaar number format</p>}
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Your Aadhaar number will be verified by admin against the uploaded document.</p>
                  </div>
                  <FileBox field="aadhaar" label="Upload Aadhaar Card" hint="Front & back of your Aadhaar card (JPG, PNG or PDF)" required />
                </div>

                {/* Step 3: Occupation docs */}
                {docs && (docs.mandatory.length > 0 || docs.optional.length > 0) && (
                  <div style={{ marginBottom: 28, padding: '20px 24px', background: '#fafafa', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
                      Step 3 — {occupations.find(o => o.value === occupation)?.label} Documents
                    </label>
                    {docs.mandatory.length > 0 && (
                      <>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Required</p>
                        {docs.mandatory.map(doc => <FileBox key={doc.field} field={doc.field} label={doc.label} hint={doc.hint} required />)}
                      </>
                    )}
                    {docs.optional.length > 0 && (
                      <>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, marginTop: docs.mandatory.length > 0 ? 20 : 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Optional</p>
                        {docs.optional.map(doc => (
                          <div key={doc.field}>
                            {doc.field === 'otherDoc' && (
                              <div style={{ marginBottom: 8 }}>
                                <input type="text" value={otherDocName} onChange={e => setOtherDocName(e.target.value)} placeholder="Document name (e.g. Voter ID, Passport)"
                                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }} />
                              </div>
                            )}
                            <FileBox field={doc.field} label={doc.label} hint={doc.hint} />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: 8, fontSize: 12, color: '#1e40af', marginBottom: 24 }}>
                  📌 Accepted formats: JPG, PNG, PDF (max 10MB each). Documents are securely stored and used only for identity verification. Admin will review within 24 hours.
                </div>

                <button onClick={handleSubmit} disabled={submitting}
                  style={{ width: '100%', background: submitting ? '#94a3b8' : 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 16px rgba(99,102,241,0.3)' }}>
                  <Shield size={18} />
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Submitted docs view */}
        {status !== 'not_submitted' && kycStatus && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px 32px', marginTop: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Submitted Documents</h3>
            {kycStatus.occupation && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Occupation: <strong style={{ color: '#4f46e5' }}>{occupations.find(o => o.value === kycStatus.occupation)?.label || kycStatus.occupation}</strong></p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { url: kycStatus.aadhaarUrl,    label: 'Aadhaar Card' },
                { url: kycStatus.panUrl,         label: 'PAN Card' },
                { url: kycStatus.jobIdUrl,       label: 'Job ID / Employee ID' },
                { url: kycStatus.salarySlipUrl,  label: 'Salary Slip' },
                { url: kycStatus.businessRegUrl, label: 'Business Registration' },
                { url: kycStatus.gstCertUrl,     label: 'GST Certificate' },
                { url: kycStatus.collegeIdUrl,   label: 'College ID' },
                { url: kycStatus.bonafideUrl,    label: 'Bonafide Certificate' },
                { url: kycStatus.workProofUrl,   label: 'Work Proof' },
                { url: kycStatus.otherDocUrl,    label: kycStatus.otherDocName || 'Other Document' },
              ].filter(d => d.url).map(doc => (
                <a key={doc.label} href={doc.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6366f1', fontSize: 14, fontWeight: 500 }}>
                  <FileText size={16} /> {doc.label}
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
