import { useEffect, useState } from 'react';
import { Search, BadgeCheck, Trash2, ShieldOff, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      console.log('AdminUsers: Loading users...');
      const token = localStorage.getItem('token');
      console.log('AdminUsers: Token exists:', !!token);
      
      setLoading(true);
      const { data } = await api.get('/admin/users', { params: { search } });
      console.log('AdminUsers: Users loaded successfully:', data);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      console.error('AdminUsers: Error loading users:', error);
      console.error('AdminUsers: Error response:', error.response?.data);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  // Get KYC status badge styling
  const getKYCStatusBadge = (kycStatus: string) => {
    switch (kycStatus) {
      case 'verified':
        return {
          bg: 'rgba(16,185,129,0.15)',
          color: '#10b981',
          text: '✓ KYC Verified',
          icon: <CheckCircle size={12} />
        };
      case 'pending':
        return {
          bg: 'rgba(251,191,36,0.15)',
          color: '#f59e0b',
          text: '⏳ KYC Pending',
          icon: <Clock size={12} />
        };
      case 'rejected':
        return {
          bg: 'rgba(239,68,68,0.15)',
          color: '#f87171',
          text: '✗ KYC Rejected',
          icon: <XCircle size={12} />
        };
      default:
        return {
          bg: 'rgba(156,163,175,0.15)',
          color: '#9ca3af',
          text: 'Not Submitted',
          icon: <XCircle size={12} />
        };
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>Users</h1>
          <p style={{ fontSize: 14, color: '#92400e' }}>{total} total users</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 16px' }}>
          <Search size={16} color="#64748b" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#7c2d12', fontSize: 14, width: 200 }} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fed7aa', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #fed7aa' }}>
              {['User', 'Email', 'Phone', 'Role', 'KYC Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={6} style={{ padding: 16 }}><div style={{ height: 20, background: '#fed7aa', borderRadius: 4 }} /></td></tr>
              ))
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#7c2d12' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#92400e' }}>{u.email}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#92400e' }}>{u.phone || '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: u.role === 'admin' ? 'rgba(99,102,241,0.2)' : 'rgba(100,116,139,0.2)', color: u.role === 'admin' ? '#818cf8' : '#94a3b8', fontWeight: 600 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {(() => {
                    const badge = getKYCStatusBadge(u.kycStatus || 'not_submitted');
                    return (
                      <span style={{ 
                        fontSize: 12, 
                        padding: '3px 10px', 
                        borderRadius: 20, 
                        background: badge.bg, 
                        color: badge.color, 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        width: 'fit-content'
                      }}>
                        {badge.icon} {badge.text}
                      </span>
                    );
                  })()}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => deleteUser(u.id)}
                      style={{ padding: '6px 10px', borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


