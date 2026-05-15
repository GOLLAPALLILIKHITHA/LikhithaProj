import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

export default function VendorForgotPassword() {
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
          maxWidth: 440,
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
          color: '#f8fafc',
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
            <Mail size={28} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Forgot password?</h1>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
            If you already have a vendor account, ask your administrator to resend your vendor portal sign-in link.
            You can use that link to securely create a new password for your vendor login.
          </p>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              padding: 18,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              lineHeight: 1.65,
              color: '#e2e8f0',
            }}
          >
            <strong>Tip:</strong> your vendor password is created through the email link your admin sends. If you did not receive it, ask your admin to resend the vendor invite.
          </div>

          <Link
            to="/vendor/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 18px',
              borderRadius: 12,
              background: '#6366f1',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} /> Back to vendor sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
