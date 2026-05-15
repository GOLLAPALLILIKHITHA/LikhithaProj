import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react';
import api from '../../api';

interface KYCRecord {
  id: number;
  userId: number;
  status: 'pending' | 'verified' | 'rejected';
  aadhaarUrl?: string;
  panUrl?: string;
  jobIdUrl?: string;
  otherDocUrl?: string;
  otherDocName?: string;
  adminNotes?: string;
  createdAt: string;
  user: { id: number; name: string; email: string; phone: string };
}

// Helper: open doc — append auth token for local files
const openDoc = (url: string) => {
  if (url.startsWith('/api/')) {
    const token = localStorage.getItem('token');
    const fullUrl = `http://localhost:5000${url}?token=${token}`;
    window.open(fullUrl, '_blank', 'noreferrer');
  } else {
    window.open(url, '_blank', 'noreferrer');
  }
};

export default function AdminKYC() {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState<KYCRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchKYC(); }, [filter]);

  const fetchKYC = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/kyc?status=${filter}`);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, status: 'verified' | 'rejected') => {
    setProcessing(true);
    try {
      await api.put(`/admin/kyc/${id}`, { status, adminNotes });
      alert(`KYC ${status} successfully`);
      setSelected(null);
      setAdminNotes('');
      fetchKYC();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update KYC');
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: any = {
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
      verified: { bg: '#d1fae5', color: '#065f46', label: 'Verified' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
    };
    const s = map[status] || map.pending;
    return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s.label}</span>;
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>KYC Verification</h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['pending', 'verified', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#6366f1' : '#f1f5f9', color: filter === f ? '#fff' : '#64748b', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b', background: '#fff', borderRadius: 12 }}>
          No {filter} KYC records found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {records.map(rec => (
            <div key={rec.id} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{rec.user.name}</span>
                  {statusBadge(rec.status)}
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{rec.user.email} {rec.user.phone && `• ${rec.user.phone}`}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Submitted: {new Date(rec.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                {rec.adminNotes && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>Note: {rec.adminNotes}</div>}
              </div>

              {/* Doc links */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {rec.aadhaarUrl && <button onClick={() => openDoc(rec.aadhaarUrl!)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6366f1', fontWeight: 500, background: '#eff6ff', padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer' }}><FileText size={12} /> Aadhaar</button>}
                {rec.panUrl && <button onClick={() => openDoc(rec.panUrl!)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6366f1', fontWeight: 500, background: '#eff6ff', padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer' }}><FileText size={12} /> PAN</button>}
                {rec.jobIdUrl && <button onClick={() => openDoc(rec.jobIdUrl!)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6366f1', fontWeight: 500, background: '#eff6ff', padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer' }}><FileText size={12} /> Job ID</button>}
                {rec.otherDocUrl && <button onClick={() => openDoc(rec.otherDocUrl!)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6366f1', fontWeight: 500, background: '#eff6ff', padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer' }}><FileText size={12} /> {rec.otherDocName || 'Other'}</button>}
              </div>

              {/* Actions */}
              {rec.status === 'pending' && (
                <button onClick={() => { setSelected(rec); setAdminNotes(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <Eye size={14} /> Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 500, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Review KYC</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>{selected.user.name} — {selected.user.email}</p>

            {/* Docs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {selected.aadhaarUrl && <button onClick={() => openDoc(selected.aadhaarUrl!)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6366f1', fontWeight: 600, background: '#eff6ff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}><FileText size={14} /> View Aadhaar</button>}
              {selected.panUrl && <button onClick={() => openDoc(selected.panUrl!)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6366f1', fontWeight: 600, background: '#eff6ff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}><FileText size={14} /> View PAN</button>}
              {selected.jobIdUrl && <button onClick={() => openDoc(selected.jobIdUrl!)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6366f1', fontWeight: 600, background: '#eff6ff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}><FileText size={14} /> View Job ID</button>}
              {selected.otherDocUrl && <button onClick={() => openDoc(selected.otherDocUrl!)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6366f1', fontWeight: 600, background: '#eff6ff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}><FileText size={14} /> {selected.otherDocName || 'Other Doc'}</button>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Admin Notes (required for rejection)</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} placeholder="Reason for rejection or any notes..."
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#1f2937', outline: 'none', resize: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleAction(selected.id, 'verified')} disabled={processing}
                style={{ flex: 1, background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle size={16} /> Verify
              </button>
              <button onClick={() => { if (!adminNotes.trim()) { alert('Please add a reason for rejection'); return; } handleAction(selected.id, 'rejected'); }} disabled={processing}
                style={{ flex: 1, background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <XCircle size={16} /> Reject
              </button>
              <button onClick={() => setSelected(null)}
                style={{ padding: '12px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
