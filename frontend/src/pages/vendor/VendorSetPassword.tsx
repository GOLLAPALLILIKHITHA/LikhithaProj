import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../api';

/** One-time password setup from email link: /vendor/set-password?token=... */
export default function VendorSetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Missing invitation link. Open the link from your email, or ask your administrator to resend it.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/vendor-set-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/vendor/login', { replace: true }), 2000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Could not save password.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '13px 14px',
    fontSize: 14,
    outline: 'none',
    color: '#e2e8f0',
    background: '#1e293b',
  };

  if (done) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
          color: '#d1fae5',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 400 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Password saved</h1>
          <p style={{ color: '#94a3b8', marginTop: 12 }}>Redirecting to vendor sign in…</p>
        </div>
      </div>
    );
  }

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
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>Create vendor password</h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
          Choose the password you will use at the vendor portal. This completes your account setup.
        </p>

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
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14, position: 'relative' }}>
            <Lock size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
            <input
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="New password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inp, paddingLeft: 42 }}
              required
              minLength={6}
            />
          </div>
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <Lock size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
            <input
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{ ...inp, paddingLeft: 42, paddingRight: 44 }}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
              }}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
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
              marginBottom: 16,
            }}
          >
            {loading ? 'Saving…' : 'Save password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, margin: 0 }}>
          <Link to="/vendor/login" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>
            Back to vendor sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
