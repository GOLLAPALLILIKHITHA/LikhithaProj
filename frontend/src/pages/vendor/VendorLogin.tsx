import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Store } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

/**
 * Dedicated entry for vendors — same credentials as their linked user account.
 * URL: /vendor/login
 */
export default function VendorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loadUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    loadUser().then(() => {
      const u = useAuthStore.getState().user;
      if (u?.vendor) navigate('/vendor', { replace: true });
    });
  }, [loadUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      const u = useAuthStore.getState().user;
      if (!u?.vendor) {
        useAuthStore.getState().logout();
        setError(
          'No active vendor profile is linked to this account. Ask your administrator to register you as a vendor with this email.'
        );
        setLoading(false);
        return;
      }
      navigate('/vendor');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(msg || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '13px 14px 13px 42px',
    fontSize: 14,
    outline: 'none',
    color: '#e2e8f0',
    background: '#1e293b',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 14px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={28} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>Vendor sign in</h1>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
            Use the email and password for the account your administrator linked to your vendor profile.
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 18,
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(248,113,113,0.35)',
              color: '#fecaca',
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <Mail size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inp}
            />
          </div>
          <div style={{ marginBottom: 22, position: 'relative' }}>
            <Lock size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
            <input
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inp}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                color: '#94a3b8',
              }}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              background: loading ? '#475569' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
              cursor: loading ? 'wait' : 'pointer',
              marginBottom: 20,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in to vendor portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          <Link to="/vendor/forgot-password" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
