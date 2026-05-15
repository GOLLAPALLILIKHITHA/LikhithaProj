import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Phone, ShieldCheck, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../store/authStore';
import api from '../api';

type Mode = 'login' | 'register' | 'google-phone';
type RegStep = 'details' | 'otp' | 'set-password';

interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [regStep, setRegStep] = useState<RegStep>('details');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');

  // Google OAuth state
  const [googleData, setGoogleData] = useState<GoogleUser | null>(null);
  const [googlePhone, setGooglePhone] = useState('');
  const [googleOtp, setGoogleOtp] = useState('');
  const [googleMaskedPhone, setGoogleMaskedPhone] = useState('');
  const [googleOtpSent, setGoogleOtpSent] = useState(false);

  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const inp: React.CSSProperties = {
    width: '100%', border: '1.5px solid #fed7aa', borderRadius: 10,
    padding: '13px 14px 13px 42px', fontSize: 14, outline: 'none',
    color: '#7c2d12', background: '#fff7ed'
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer(p => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; });
    }, 1000);
  };

  const resetAll = (newMode: Mode) => {
    setMode(newMode); setRegStep('details');
    setOtp(''); setMaskedPhone('');
    setNewPassword(''); setConfirmPassword('');
    setRegName(''); setRegEmail(''); setRegPhone('');
    setLoginEmail(''); setLoginPassword('');
    setGoogleData(null); setGooglePhone(''); setGoogleOtp('');
    setGoogleMaskedPhone(''); setGoogleOtpSent(false);
    setError('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!regName.trim()) return setError('Enter your full name.');
    if (!regEmail.trim()) return setError('Enter your email address.');
    if (cleanPhone.length !== 10) return setError('Enter a valid 10-digit mobile number.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-register-otp', { name: regName, email: regEmail, phone: cleanPhone });
      setMaskedPhone(data.maskedPhone);
      setRegStep('otp');
      startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (otp.length !== 6) return setError('Enter the 6-digit OTP.');
    setLoading(true);
    try {
      await api.post('/auth/verify-register-otp', { phone: regPhone.replace(/\D/g, ''), otp });
      setRegStep('set-password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally { setLoading(false); }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/set-password', { phone: regPhone.replace(/\D/g, ''), password: newPassword });
      localStorage.setItem('token', data.token);
      useAuthStore.setState({ user: data.user, token: data.token });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError(''); setLoading(true);
    try {
      await api.post('/auth/send-register-otp', { name: regName, email: regEmail, phone: regPhone.replace(/\D/g, '') });
      setOtp(''); startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      setTimeout(() => {
        const u = useAuthStore.getState().user;
        if (u?.role === 'admin') { setError('Admin users must use "Admin Login".'); setLoading(false); useAuthStore.getState().logout(); return; }
        navigate('/');
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  // Google OAuth Handlers
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setError(''); setLoading(true);
      
      if (!credentialResponse.credential) {
        setError('Google login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Decode Google JWT token
      const decoded: any = jwtDecode(credentialResponse.credential);
      const googleUser: GoogleUser = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub
      };

      // Try to login existing user
      try {
        const { data } = await api.post('/auth/google/login', { email: googleUser.email });
        localStorage.setItem('token', data.token);
        useAuthStore.setState({ user: data.user, token: data.token });
        navigate('/');
      } catch (err: any) {
        // User doesn't exist, need phone verification
        if (err.response?.data?.requiresPhoneVerification) {
          setGoogleData(googleUser);
          setMode('google-phone');
        } else {
          setError(err.response?.data?.message || 'Login failed.');
        }
      }
    } catch (err: any) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleGooglePhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const cleanPhone = googlePhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return setError('Enter a valid 10-digit mobile number.');
    if (!googleData) return setError('Session expired. Please try again.');
    
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google/send-phone-otp', {
        phone: cleanPhone,
        googleData: {
          email: googleData.email,
          name: googleData.name,
          avatar: googleData.picture,
          googleId: googleData.sub
        }
      });
      setGoogleMaskedPhone(data.maskedPhone);
      setGoogleOtpSent(true);
      startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (googleOtp.length !== 6) return setError('Enter the 6-digit OTP.');
    
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google/verify-phone-otp', {
        phone: googlePhone.replace(/\D/g, ''),
        otp: googleOtp
      });
      localStorage.setItem('token', data.token);
      useAuthStore.setState({ user: data.user, token: data.token });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResendOtp = async () => {
    if (resendTimer > 0 || !googleData) return;
    setError(''); setLoading(true);
    try {
      await api.post('/auth/google/send-phone-otp', {
        phone: googlePhone.replace(/\D/g, ''),
        googleData: {
          email: googleData.email,
          name: googleData.name,
          avatar: googleData.picture,
          googleId: googleData.sub
        }
      });
      setGoogleOtp('');
      startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Details', 'Verify OTP', 'Set Password'];
  const stepIndex = regStep === 'details' ? 0 : regStep === 'otp' ? 1 : 2;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fff7ed,#fef3c7,#fff7ed)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '40px', boxShadow: '0 24px 64px rgba(249,115,22,0.15)', border: '1px solid #fed7aa' }}>

          <Link to="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, textDecoration: 'none' }}>
            <img src="/logo.png" alt="INFRAALL" style={{ height: 60, objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </Link>

          <div style={{ display: 'flex', background: '#fff7ed', borderRadius: 10, padding: 4, marginBottom: 28, border: '1px solid #fed7aa' }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => resetAll(m)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', background: mode === m ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'transparent', color: mode === m ? '#fff' : '#92400e', transition: 'all 0.2s' }}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Register progress bar */}
          {mode === 'register' && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: i < stepIndex ? '#10b981' : i === stepIndex ? 'linear-gradient(135deg,#f97316,#ea580c)' : '#f1f5f9', color: i <= stepIndex ? '#fff' : '#94a3b8', border: i === stepIndex ? '2px solid #ea580c' : 'none' }}>
                      {i < stepIndex ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    <span style={{ fontSize: 10, color: i === stepIndex ? '#ea580c' : i < stepIndex ? '#10b981' : '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</span>
                  </div>
                  {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIndex ? '#10b981' : '#f1f5f9', margin: '0 6px', marginBottom: 18 }} />}
                </div>
              ))}
            </div>
          )}

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>⚠️ {error}</div>}

          {/* REGISTER — Step 1 */}
          {mode === 'register' && regStep === 'details' && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#7c2d12', textAlign: 'center', marginBottom: 20 }}>Create Your Account</h2>
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Full Name" required style={inp} />
                </div>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email Address" required style={inp} />
                </div>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Mobile Number (10 digits)" required maxLength={10} style={inp} />
                </div>
                <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>📞 You will receive a voice call with your OTP on this number</p>
                <button type="submit" disabled={loading} style={{ background: loading ? '#fdba74' : 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
                  {loading ? 'Sending OTP...' : 'Send OTP →'}
                </button>
              </form>
            </>
          )}

          {/* REGISTER — Step 2 */}
          {mode === 'register' && regStep === 'otp' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <ShieldCheck size={32} color="#fff" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#7c2d12', marginBottom: 6 }}>Verify Your Number</h2>
                <p style={{ fontSize: 14, color: '#92400e' }}>You will receive a <strong>voice call</strong> on <strong>+91 {maskedPhone}</strong> with your OTP</p>
              </div>
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8, textAlign: 'center' }}>Enter 6-digit OTP</label>
                  <input type="text" inputMode="numeric" maxLength={6} autoFocus value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="• • • • • •"
                    style={{ width: '100%', border: '2px solid #fed7aa', borderRadius: 12, padding: '16px', fontSize: 28, fontWeight: 700, outline: 'none', color: '#7c2d12', background: '#fff7ed', textAlign: 'center', letterSpacing: '0.5em' }} />
                </div>
                <button type="submit" disabled={loading || otp.length !== 6} style={{ background: loading || otp.length !== 6 ? '#fdba74' : 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
                  {loading ? 'Verifying...' : 'Verify OTP →'}
                </button>
              </form>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                <button onClick={() => { setRegStep('details'); setOtp(''); setError(''); }} style={{ background: 'none', border: 'none', fontSize: 13, color: '#92400e', cursor: 'pointer' }}>← Change details</button>
                <button onClick={handleResend} disabled={resendTimer > 0 || loading} style={{ background: 'none', border: 'none', fontSize: 13, cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', color: resendTimer > 0 ? '#94a3b8' : '#f97316', fontWeight: 600 }}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}

          {/* REGISTER — Step 3 */}
          {mode === 'register' && regStep === 'set-password' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle size={32} color="#fff" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#7c2d12', marginBottom: 6 }}>Set Your Password</h2>
                <p style={{ fontSize: 13, color: '#92400e' }}>OTP verified ✅ — Create a password to complete registration</p>
              </div>
              <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type={showNewPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" required style={{ ...inp, paddingRight: 42 }} />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#f97316' }}>
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type={showConfirmPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" required
                      style={{ ...inp, paddingRight: 42, borderColor: confirmPassword && confirmPassword !== newPassword ? '#fca5a5' : confirmPassword && confirmPassword === newPassword ? '#6ee7b7' : '#fed7aa' }} />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#f97316' }}>
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>❌ Passwords do not match</p>}
                  {confirmPassword && confirmPassword === newPassword && <p style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>✅ Passwords match</p>}
                </div>
                <button type="submit" disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  style={{ background: loading || !newPassword || !confirmPassword || newPassword !== confirmPassword ? '#fdba74' : 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading || !newPassword || !confirmPassword || newPassword !== confirmPassword ? 'not-allowed' : 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
                  {loading ? 'Creating Account...' : '🎉 Update Password & Create Account'}
                </button>
              </form>
            </>
          )}

          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#7c2d12', textAlign: 'center', marginBottom: 20 }}>Welcome Back!</h2>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email Address" required style={inp} />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type={showLoginPass ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" required style={{ ...inp, paddingRight: 42 }} />
                  <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#f97316' }}>
                    {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button type="submit" disabled={loading} style={{ background: loading ? '#fdba74' : 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#fed7aa' }} />
                <span style={{ padding: '0 12px', fontSize: 13, color: '#92400e', fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#fed7aa' }} />
              </div>

              {/* Google Sign-In Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  text="continue_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>
              <p style={{ fontSize: 12, color: '#92400e', textAlign: 'center', marginTop: 12 }}>
                📱 Phone verification required for new Gmail users
              </p>
            </>
          )}

          {/* GOOGLE PHONE VERIFICATION */}
          {mode === 'google-phone' && !googleOtpSent && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#4285f4,#34a853)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Phone size={32} color="#fff" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#7c2d12', marginBottom: 6 }}>Verify Your Phone</h2>
                <p style={{ fontSize: 14, color: '#92400e' }}>
                  Welcome <strong>{googleData?.name}</strong>!<br />
                  Please verify your mobile number to complete registration
                </p>
              </div>
              <form onSubmit={handleGooglePhoneOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#f97316" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="tel" 
                    value={googlePhone} 
                    onChange={e => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                    placeholder="Mobile Number (10 digits)" 
                    required 
                    maxLength={10} 
                    style={inp} 
                  />
                </div>
                <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>📞 You will receive a voice call with your OTP</p>
                <button type="submit" disabled={loading} style={{ background: loading ? '#fdba74' : 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
                  {loading ? 'Sending OTP...' : 'Send OTP →'}
                </button>
                <button type="button" onClick={() => resetAll('login')} style={{ background: 'none', border: 'none', fontSize: 13, color: '#92400e', cursor: 'pointer' }}>
                  ← Back to Login
                </button>
              </form>
            </>
          )}

          {/* GOOGLE OTP VERIFICATION */}
          {mode === 'google-phone' && googleOtpSent && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <ShieldCheck size={32} color="#fff" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#7c2d12', marginBottom: 6 }}>Verify OTP</h2>
                <p style={{ fontSize: 14, color: '#92400e' }}>
                  Voice call sent to <strong>+91 {googleMaskedPhone}</strong>
                </p>
              </div>
              <form onSubmit={handleGoogleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8, textAlign: 'center' }}>Enter 6-digit OTP</label>
                  <input 
                    type="text" 
                    inputMode="numeric" 
                    maxLength={6} 
                    autoFocus 
                    value={googleOtp} 
                    onChange={e => setGoogleOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                    placeholder="• • • • • •"
                    style={{ width: '100%', border: '2px solid #fed7aa', borderRadius: 12, padding: '16px', fontSize: 28, fontWeight: 700, outline: 'none', color: '#7c2d12', background: '#fff7ed', textAlign: 'center', letterSpacing: '0.5em' }} 
                  />
                </div>
                <button type="submit" disabled={loading || googleOtp.length !== 6} style={{ background: loading || googleOtp.length !== 6 ? '#fdba74' : 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading || googleOtp.length !== 6 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
                  {loading ? 'Verifying...' : '🎉 Verify & Create Account'}
                </button>
              </form>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                <button onClick={() => { setGoogleOtpSent(false); setGoogleOtp(''); setError(''); }} style={{ background: 'none', border: 'none', fontSize: 13, color: '#92400e', cursor: 'pointer' }}>
                  ← Change number
                </button>
                <button onClick={handleGoogleResendOtp} disabled={resendTimer > 0 || loading} style={{ background: 'none', border: 'none', fontSize: 13, cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', color: resendTimer > 0 ? '#94a3b8' : '#f97316', fontWeight: 600 }}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/" style={{ fontSize: 13, color: '#92400e', textDecoration: 'none' }}>Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
