import { useEffect, useState } from 'react';
import api from '../../api';
import { MapPin, Phone, Mail, User, ClipboardList, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Customer {
  name?: string;
  email?: string;
  phone?: string;
}

interface Assignment {
  id: number;
  serviceType: string;
  problemDescription: string;
  status: string;
  userAddress: string;
  userPhone: string;
  customer: Customer;
  adminNotes: string | null;
  createdAt: string;
  assignedAt: string | null;
  updatedAt: string;
}

export default function VendorAssignments() {
  const [profile, setProfile] = useState<{ businessName: string } | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, listRes] = await Promise.all([
        api.get('/vendor/me'),
        api.get('/vendor/assignments'),
      ]);
      setProfile(meRes.data);
      setAssignments(listRes.data.assignments || []);
    } catch (e: any) {
      const msg = e.response?.status === 403
        ? 'This account is not linked to an active vendor profile. Ask admin to create a vendor for your user account.'
        : e.response?.data?.message || 'Could not load vendor portal.';
      setError(msg);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markComplete = async (id: number) => {
    if (!confirm('Mark this job as completed?')) return;
    setActionId(id);
    try {
      await api.patch(`/vendor/assignments/${id}/complete`);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>Loading your assignments…</div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 48, maxWidth: 560 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Vendor portal</h1>
        <p style={{ color: '#b45309', background: '#fffbeb', padding: 16, borderRadius: 12, border: '1px solid #fcd34d' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>My jobs</h1>
        <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 15 }}>
          {profile?.businessName ? (
            <>
              Signed in as <strong style={{ color: '#334155' }}>{profile.businessName}</strong>. Customer address and contact appear on each assignment.
            </>
          ) : (
            'Jobs assigned to you by admin appear here.'
          )}
        </p>
      </div>

      {assignments.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 48,
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <ClipboardList size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#334155', marginBottom: 8 }}>No assignments yet</h2>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 420, margin: '0 auto' }}>
            When an admin assigns a home service request to your vendor account, it will show up here with the customer&apos;s
            address and phone so you can plan your visit.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assignments.map((a) => {
            const open = expanded === a.id;
            return (
              <div
                key={a.id}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : a.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{a.serviceType}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Request #{a.id} · {a.status === 'assigned' ? 'Assigned' : a.status}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 20,
                        background: a.status === 'assigned' ? '#dbeafe' : a.status === 'completed' ? '#d1fae5' : '#f1f5f9',
                        color: a.status === 'assigned' ? '#1e40af' : a.status === 'completed' ? '#065f46' : '#475569',
                        textTransform: 'capitalize',
                      }}
                    >
                      {a.status}
                    </span>
                    {open ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                  </div>
                </button>

                {open && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                        Problem description
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.55, background: '#fffbeb', padding: 12, borderRadius: 10 }}>
                        {a.problemDescription}
                      </p>
                    </div>

                    {a.adminNotes && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                          Notes from admin
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: '#334155', background: '#eef2ff', padding: 12, borderRadius: 10 }}>
                          {a.adminNotes}
                        </p>
                      </div>
                    )}

                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                        Customer details
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                          <MapPin size={16} color="#64748b" />
                          <div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Address</div>
                            <div style={{ fontSize: 13, color: '#334155' }}>{a.userAddress}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                          <Phone size={16} color="#64748b" />
                          <div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Phone</div>
                            <div style={{ fontSize: 13, color: '#334155' }}>{a.userPhone}</div>
                          </div>
                        </div>
                        {a.customer?.name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                            <User size={16} color="#64748b" />
                            <div>
                              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Name</div>
                              <div style={{ fontSize: 13, color: '#334155' }}>{a.customer.name}</div>
                            </div>
                          </div>
                        )}
                        {a.customer?.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                            <Mail size={16} color="#64748b" />
                            <div>
                              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Email</div>
                              <div style={{ fontSize: 13, color: '#334155' }}>{a.customer.email}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {a.status === 'assigned' && (
                        <button
                          type="button"
                          disabled={actionId === a.id}
                          onClick={() => markComplete(a.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 18px',
                            borderRadius: 10,
                            border: 'none',
                            background: actionId === a.id ? '#94a3b8' : '#10b981',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: actionId === a.id ? 'wait' : 'pointer',
                          }}
                        >
                          <CheckCircle size={18} />
                          {actionId === a.id ? 'Saving…' : 'Mark completed'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
