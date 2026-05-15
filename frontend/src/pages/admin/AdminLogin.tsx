import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import api from '../../api';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      console.log('Admin login response:', data);
      localStorage.setItem('token', data.token);
      console.log('Navigating to /admin');
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa',
    borderRadius: 10, padding: '13px 14px 13px 42px', fontSize: 14, outline: 'none', color: '#7c2d12',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fff7ed,#fef3c7,#fff7ed)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" alt="INFRAALL" style={{ height: 80, width: 'auto', objectFit: 'contain', margin: '0 auto 8px', display: 'block', mixBlendMode: 'multiply' }} />
          <p style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>Administration Panel</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', border: '1px solid #fed7aa', boxShadow: '0 24px 64px rgba(249,115,22,0.15)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#7c2d12', marginBottom: 24, textAlign: 'center' }}>Admin Login</h2>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="Admin Email" required style={inp} />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Admin Password" required style={inp} />
            </div>

            <button type="submit" disabled={loading}
              style={{ background: loading ? '#fdba74' : 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
              {loading ? 'Logging in...' : 'Login to Admin Panel'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#92400e' }}>
            🔒 Restricted access — authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
