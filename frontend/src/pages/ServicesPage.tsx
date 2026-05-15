import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api';

const serviceItems = [
  { name: 'Home Cleaning', icon: '🧹', desc: 'Professional cleaning' },
  { name: 'Maid Service',  icon: '🧺', desc: 'Daily / part-time maid' },
  { name: 'Plumbing',      icon: '🔧', desc: 'Pipe & fixture repair' },
  { name: 'Electrical',    icon: '⚡', desc: 'Wiring & repairs' },
  { name: 'Painting',      icon: '🎨', desc: 'Interior & exterior' },
  { name: 'Carpentry',     icon: '🪚', desc: 'Wood work' },
  { name: 'AC Repair',     icon: '❄️', desc: 'AC service & repair' },
  { name: 'Pest Control',  icon: '🐛', desc: 'Pest management' },
  { name: 'Appliance Repair', icon: '🔨', desc: 'Fix appliances' },
  { name: 'Gardening',     icon: '🌱', desc: 'Garden maintenance' },
  { name: 'Moving & Packing', icon: '📦', desc: 'Relocation services' },
  { name: 'Interior Design',  icon: '🏠', desc: 'Design consultation' },
  { name: 'Other',         icon: '🛠️', desc: 'Other services' }
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedService, setSelectedService] = useState('Home Cleaning');
  const [problemDescription, setProblemDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login first to request a service');
      navigate('/login');
      return;
    }

    if (!selectedService || !problemDescription.trim() || !address.trim() || !phone.trim()) {
      setErrorMessage('Please fill in all required fields');
      setSubmitStatus('error');
      return;
    }

    setLoading(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await api.post('/service-requests/create', {
        serviceType: selectedService,
        problemDescription,
        userAddress: address,
        userPhone: phone
      });

      setSubmitStatus('success');
      setSelectedService('Home Cleaning');
      setProblemDescription('');
      setAddress('');
      setPhone(user?.phone || '');

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to submit service request');
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Request Home Services</h1>
          <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>Tell us what service you need and we'll connect you with the best professionals</p>
        </div>

        {/* Form Card */}
        <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.08)', padding: '40px', border: '1px solid #f1f5f9' }}>
          
          <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#d1fae5', borderRadius: 12, border: '1px solid #6ee7b7' }}>
                <CheckCircle size={20} color="#059669" />
                <div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: 14 }}>Request Submitted!</div>
                  <p style={{ fontSize: 13, color: '#047857', margin: '4px 0 0 0' }}>Our team will review your request and assign a worker soon.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#fee2e2', borderRadius: 12, border: '1px solid #fca5a5' }}>
                <AlertCircle size={20} color="#dc2626" />
                <div>
                  <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 14 }}>Error</div>
                  <p style={{ fontSize: 13, color: '#7f1d1d', margin: '4px 0 0 0' }}>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Service Type Selection */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                Select Service Type *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
                {serviceItems.map(item => (
                  <div
                    key={item.name}
                    onClick={() => setSelectedService(item.name)}
                    style={{
                      cursor: 'pointer',
                      padding: '16px 12px',
                      background: selectedService === item.name ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#f8fafc',
                      borderRadius: 12,
                      border: selectedService === item.name ? '2px solid #f97316' : '1.5px solid #e2e8f0',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      color: selectedService === item.name ? '#fff' : '#1e293b',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                Describe Your Problem *
              </label>
              <textarea
                value={problemDescription}
                onChange={e => setProblemDescription(e.target.value)}
                placeholder="Tell us what needs to be fixed or improved. The more details, the better we can help you."
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: '14px 16px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: '#1f2937',
                  outline: 'none',
                  background: '#f8fafc',
                  resize: 'vertical'
                }}
              />
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{problemDescription.length}/500 characters</p>
            </div>

            {/* Address */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                Service Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Full address where service is needed"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 14,
                  color: '#1f2937',
                  outline: 'none',
                  background: '#f8fafc'
                }}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                Contact Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit phone number"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 14,
                  color: '#1f2937',
                  outline: 'none',
                  background: '#f8fafc'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: loading ? 'none' : '0 6px 16px rgba(249,115,22,0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Send size={18} /> {loading ? 'Submitting...' : 'Submit Service Request'}
            </button>

            <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              Our admin team will review your request and assign a qualified professional within 24 hours.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
