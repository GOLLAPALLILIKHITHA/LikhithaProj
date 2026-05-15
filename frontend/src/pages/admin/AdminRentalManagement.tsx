import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Home, User, Calendar, DollarSign, AlertTriangle, 
  CheckCircle, XCircle, Clock, Bell, FileText, Eye, Plus,
  MessageSquare, Phone, Mail
} from 'lucide-react';
import api from '../../api';

interface RentalAgreement {
  id: number;
  monthlyRent: number;
  securityDeposit: number;
  agreementStartDate: string;
  agreementEndDate: string;
  nextRentDueDate: string;
  status: string;
  overdueMonths: number;
  warningsSent: number;
  vacateNoticeSent: boolean;
  lastRentPaidDate: string;
  tenant: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  owner: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  property: {
    id: number;
    title: string;
    location: string;
    city: string;
    images: string[];
  };
  payments?: Array<{
    id: number;
    amount: number;
    paymentDate: string;
    forMonth: string;
    status: string;
  }>;
}

export default function AdminRentalManagement() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAgreement, setSelectedAgreement] = useState<RentalAgreement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetchRentalAgreements();
    fetchStats();
  }, [selectedStatus]);

  const fetchRentalAgreements = async () => {
    try {
      setLoading(true);
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const { data } = await api.get(`/rental/agreements${params}`);
      setAgreements(data.agreements || []);
    } catch (error) {
      console.error('Error fetching rental agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // This would be a separate endpoint for rental statistics
      const mockStats = {
        totalAgreements: agreements.length,
        activeAgreements: agreements.filter(a => a.status === 'active').length,
        overduePayments: agreements.filter(a => a.overdueMonths > 0).length,
        totalMonthlyRevenue: agreements.reduce((sum, a) => sum + parseFloat(a.monthlyRent.toString()), 0)
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (agreement: RentalAgreement) => {
    if (agreement.overdueMonths > 0) {
      return { bg: '#fee2e2', color: '#991b1b', text: `${agreement.overdueMonths} Month(s) Overdue` };
    }
    if (agreement.status === 'active') {
      const dueDate = new Date(agreement.nextRentDueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 3) {
        return { bg: '#fef3c7', color: '#92400e', text: `Due in ${daysUntilDue} days` };
      }
      return { bg: '#d1fae5', color: '#065f46', text: 'Active' };
    }
    return { bg: '#f1f5f9', color: '#64748b', text: agreement.status };
  };

  const getStatusIcon = (agreement: RentalAgreement) => {
    if (agreement.overdueMonths > 0) return <AlertTriangle size={16} />;
    if (agreement.status === 'active') return <CheckCircle size={16} />;
    return <Clock size={16} />;
  };

  const openModal = (agreement: RentalAgreement) => {
    setSelectedAgreement(agreement);
    setShowModal(true);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button 
            onClick={() => navigate('/admin')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              color: 'rgba(255,255,255,0.9)', 
              background: 'none', 
              border: 'none', 
              fontSize: 14, 
              fontWeight: 500, 
              cursor: 'pointer', 
              marginBottom: 16 
            }}
          >
            <ArrowLeft size={16} />
            Back to Admin Dashboard
          </button>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', marginBottom: 8, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            🏠 Rental Management System
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }}>
            Track rent payments, send notifications, and manage tenant agreements
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.totalAgreements || 0}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Total Agreements</div>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.activeAgreements || 0}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Active Rentals</div>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.overduePayments || 0}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Overdue Payments</div>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                  {formatCurrency(stats.totalMonthlyRevenue || 0)}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Monthly Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 24, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Filter by Status:</span>
            {['all', 'active', 'overdue', 'terminated'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: selectedStatus === status ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f1f5f9',
                  color: selectedStatus === status ? '#ffffff' : '#64748b',
                  transition: 'all 0.3s'
                }}
              >
                {status === 'all' ? 'All Rentals' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Rental Agreements List */}
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          borderRadius: 16, 
          padding: 24, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                border: '4px solid #e2e8f0', 
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
            </div>
          ) : agreements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <Home size={48} style={{ margin: '0 auto 16px' }} />
              <p>No rental agreements found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {agreements.map((agreement) => {
                const statusInfo = getStatusColor(agreement);
                return (
                  <div key={agreement.id} style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: 16,
                    padding: 20,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 20, alignItems: 'center' }}>
                      
                      {/* Property & Tenant Info */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <img
                            src={agreement.property.images?.[0] || 'https://placehold.co/60x45/e5e7eb/6b7280?text=Property'}
                            alt={agreement.property.title}
                            style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 8 }}
                          />
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                              {agreement.property.title}
                            </h3>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>
                              📍 {agreement.property.location}, {agreement.property.city}
                            </p>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                              {formatCurrency(agreement.monthlyRent)}/month
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ 
                          background: '#f0f9ff', 
                          padding: 8, 
                          borderRadius: 8, 
                          border: '1px solid #bae6fd' 
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0369a1', marginBottom: 2 }}>
                            👤 Tenant: {agreement.tenant.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#0369a1' }}>
                            📞 {agreement.tenant.phone} • 📧 {agreement.tenant.email}
                          </div>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                          💰 Payment Status
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          marginBottom: 8
                        }}>
                          {getStatusIcon(agreement)}
                          {statusInfo.text}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Next Due: {formatDate(agreement.nextRentDueDate)}
                        </div>
                        {agreement.lastRentPaidDate && (
                          <div style={{ fontSize: 11, color: '#059669' }}>
                            Last Paid: {formatDate(agreement.lastRentPaidDate)}
                          </div>
                        )}
                      </div>

                      {/* Notifications */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                          🔔 Alerts
                        </div>
                        {agreement.warningsSent > 0 && (
                          <div style={{ fontSize: 11, color: '#dc2626', marginBottom: 2 }}>
                            ⚠️ {agreement.warningsSent} warning(s) sent
                          </div>
                        )}
                        {agreement.vacateNoticeSent && (
                          <div style={{ fontSize: 11, color: '#dc2626', marginBottom: 2 }}>
                            🚨 Vacate notice sent
                          </div>
                        )}
                        {!agreement.warningsSent && !agreement.vacateNoticeSent && (
                          <div style={{ fontSize: 11, color: '#059669' }}>
                            ✅ No alerts
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div>
                        <button
                          onClick={() => openModal(agreement)}
                          style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 12,
                            padding: '10px 16px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'all 0.3s'
                          }}
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Modal */}
      {showModal && selectedAgreement && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            padding: 20
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: 24,
              padding: 40,
              width: '100%',
              maxWidth: 1000,
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                🏠 Rental Agreement Details
              </h2>
              <div style={{ 
                height: 4, 
                background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                borderRadius: 2, 
                width: 100, 
                margin: '0 auto' 
              }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 24 }}>
              {/* Property Information */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', 
                borderRadius: 20, 
                padding: 24,
                border: '1px solid #bae6fd'
              }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0c4a6e', marginBottom: 16 }}>
                  🏠 Property Details
                </h3>
                <div style={{ marginBottom: 12 }}>
                  <strong>Property:</strong> {selectedAgreement.property.title}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Location:</strong> {selectedAgreement.property.location}, {selectedAgreement.property.city}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Monthly Rent:</strong> {formatCurrency(selectedAgreement.monthlyRent)}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Security Deposit:</strong> {formatCurrency(selectedAgreement.securityDeposit)}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Agreement Period:</strong><br/>
                  {formatDate(selectedAgreement.agreementStartDate)} to {formatDate(selectedAgreement.agreementEndDate)}
                </div>
              </div>

              {/* Tenant Information */}
              <div style={{ 
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)', 
                borderRadius: 20, 
                padding: 24,
                border: '1px solid #fbbf24'
              }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#92400e', marginBottom: 16 }}>
                  👤 Tenant Details
                </h3>
                <div style={{ marginBottom: 12 }}>
                  <strong>Name:</strong> {selectedAgreement.tenant.name}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Email:</strong> {selectedAgreement.tenant.email}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Phone:</strong> {selectedAgreement.tenant.phone}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Next Rent Due:</strong> {formatDate(selectedAgreement.nextRentDueDate)}
                </div>
                {selectedAgreement.lastRentPaidDate && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Last Payment:</strong> {formatDate(selectedAgreement.lastRentPaidDate)}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Status & Alerts */}
            {(selectedAgreement.overdueMonths > 0 || selectedAgreement.warningsSent > 0 || selectedAgreement.vacateNoticeSent) && (
              <div style={{ 
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)', 
                borderRadius: 20, 
                padding: 24,
                border: '1px solid #f87171',
                marginBottom: 24
              }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#991b1b', marginBottom: 16 }}>
                  ⚠️ Payment Alerts
                </h3>
                {selectedAgreement.overdueMonths > 0 && (
                  <div style={{ marginBottom: 12, color: '#991b1b' }}>
                    <strong>Overdue:</strong> {selectedAgreement.overdueMonths} month(s) behind on rent
                  </div>
                )}
                {selectedAgreement.warningsSent > 0 && (
                  <div style={{ marginBottom: 12, color: '#991b1b' }}>
                    <strong>Warnings Sent:</strong> {selectedAgreement.warningsSent} payment reminder(s)
                  </div>
                )}
                {selectedAgreement.vacateNoticeSent && (
                  <div style={{ marginBottom: 12, color: '#991b1b' }}>
                    <strong>Vacate Notice:</strong> Eviction notice has been sent
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 15,
                  padding: '14px 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}