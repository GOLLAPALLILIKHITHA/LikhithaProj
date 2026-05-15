import { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  Key, 
  CheckCircle, 
  XCircle, 
  Send,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import api from '../../api';

interface OwnerAccount {
  id: number;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  stats: {
    totalProperties: number;
    activeProperties: number;
    recentProperties: any[];
  };
}

export default function AdminOwnerManagement() {
  const [owners, setOwners] = useState<OwnerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState<OwnerAccount | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, [search, verifiedFilter]);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (verifiedFilter !== 'all') params.append('verified', verifiedFilter);

      const response = await api.get(`/admin/owner-accounts?${params}`);
      setOwners(response.data.owners);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!selectedOwner || !password) return;

    try {
      setSettingPassword(true);
      await api.put(`/admin/owner-accounts/${selectedOwner.id}/password`, {
        password,
        sendEmail: true
      });

      alert('Password set successfully! Email sent to owner.');
      setShowPasswordModal(false);
      setPassword('');
      setSelectedOwner(null);
      fetchOwners();
    } catch (error) {
      console.error('Failed to set password:', error);
      alert('Failed to set password');
    } finally {
      setSettingPassword(false);
    }
  };

  const toggleVerification = async (owner: OwnerAccount) => {
    try {
      await api.put(`/admin/owner-accounts/${owner.id}/toggle-verification`);
      fetchOwners();
    } catch (error) {
      console.error('Failed to toggle verification:', error);
    }
  };

  const sendCredentials = async (owner: OwnerAccount) => {
    const password = prompt('Enter password to send to owner:');
    if (!password) return;

    try {
      await api.post(`/admin/owner-accounts/${owner.id}/send-credentials`, {
        password
      });
      alert('Credentials sent successfully!');
    } catch (error) {
      console.error('Failed to send credentials:', error);
      alert('Failed to send credentials');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
          Owner Account Management
        </h1>
        <p style={{ color: '#64748b' }}>
          Manage auto-created owner accounts and set login credentials
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24,
        padding: 16,
        background: '#f8fafc',
        borderRadius: 8,
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ 
            position: 'absolute', 
            left: 12, 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#64748b'
          }} />
          <input
            type="text"
            placeholder="Search owners by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="#64748b" />
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
          >
            <option value="all">All Owners</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>

      {/* Owners List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #f97316', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading owners...</p>
        </div>
      ) : owners.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 40,
          background: '#f8fafc',
          borderRadius: 8,
          border: '1px solid #e2e8f0'
        }}>
          <Users size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: 16 }}>No owner accounts found</p>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            Owner accounts are created automatically when listings are posted
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {owners.map((owner) => (
            <div key={owner.id} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                
                {/* Owner Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 18,
                      fontWeight: 600
                    }}>
                      {owner.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                        {owner.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        {owner.isVerified ? (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#059669',
                            fontSize: 12,
                            fontWeight: 500
                          }}>
                            <CheckCircle size={14} />
                            Verified
                          </span>
                        ) : (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#dc2626',
                            fontSize: 12,
                            fontWeight: 500
                          }}>
                            <XCircle size={14} />
                            Unverified
                          </span>
                        )}
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>
                          Created {formatDate(owner.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={16} color="#64748b" />
                      <span style={{ fontSize: 14, color: '#374151' }}>{owner.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={16} color="#64748b" />
                      <span style={{ fontSize: 14, color: '#374151' }}>{owner.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building size={16} color="#64748b" />
                      <span style={{ fontSize: 14, color: '#374151' }}>
                        {owner.stats.totalProperties} Properties ({owner.stats.activeProperties} Active)
                      </span>
                    </div>
                  </div>

                  {/* Recent Properties */}
                  {owner.stats.recentProperties.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>
                        Recent Properties:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {owner.stats.recentProperties.map((property) => (
                          <span key={property.id} style={{
                            fontSize: 11,
                            padding: '4px 8px',
                            background: '#f1f5f9',
                            color: '#475569',
                            borderRadius: 12,
                            border: '1px solid #e2e8f0'
                          }}>
                            {property.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 120 }}>
                  <button
                    onClick={() => {
                      setSelectedOwner(owner);
                      setShowPasswordModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <Key size={14} />
                    Set Password
                  </button>

                  <button
                    onClick={() => toggleVerification(owner)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      background: owner.isVerified 
                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)' 
                        : 'linear-gradient(135deg, #059669, #047857)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {owner.isVerified ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    {owner.isVerified ? 'Unverify' : 'Verify'}
                  </button>

                  <button
                    onClick={() => sendCredentials(owner)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={14} />
                    Send Login
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedOwner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              Set Password for {selectedOwner.name}
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSelectedOwner(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleSetPassword}
                disabled={settingPassword || password.length < 6}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: settingPassword || password.length < 6 
                    ? '#d1d5db' 
                    : 'linear-gradient(135deg, #059669, #047857)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: settingPassword || password.length < 6 ? 'not-allowed' : 'pointer'
                }}
              >
                {settingPassword ? 'Setting...' : 'Set Password & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}