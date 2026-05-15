import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Home } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

/**
 * Dedicated entry for property owners
 * URL: /owner/login
 */
export default function OwnerLogin() {
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
      if (u) navigate('/owner/dashboard', { replace: true });
    });
  }, [loadUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      const u = useAuthStore.getState().user;
      if (!u) {
        setError('Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }
      navigate('/owner/dashboard');
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
    border: '1px solid #d97706',
    borderRadius: 10,
    padding: '13px 14px 13px 42px',
    fontSize: 14,
    outline: 'none',
    color: '#1c1917',
    background: '#fef3c7',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(160deg, #fff7ed 0%, #fed7aa 50%, #fff7ed 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #f97316',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 24px 48px rgba(249, 115, 22, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 14px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Home size={28} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1c1917' }}>Owner sign in</h1>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: '#78716c', lineHeight: 1.5 }}>
            Access your property dashboard to manage listings, track rentals, and monitor sales.
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
              color: '#dc2626',
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <Mail size={18} color="#a8a29e" style={{ position: 'absolute', left: 14, top: 14 }} />
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
            <Lock size={18} color="#a8a29e" style={{ position: 'absolute', left: 14, top: 14 }} />
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
                color: '#a8a29e',
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
              background: loading ? '#a8a29e' : 'linear-gradient(135deg, #f97316, #ea580c)',
              cursor: loading ? 'wait' : 'pointer',
              marginBottom: 20,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in to owner portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: '#78716c' }}>
          <Link to="/login" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>
            General Login
          </Link>
          {' • '}
          <Link to="/vendor/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
            Vendor Login
          </Link>
        </div>
      </div>
    </div>
  );
}