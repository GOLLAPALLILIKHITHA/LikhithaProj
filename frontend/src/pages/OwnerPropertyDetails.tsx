import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  Users, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  Eye,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';
import api from '../api';

interface PropertyDetails {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  city: string;
  images: string[];
  status: string;
  views: number;
  createdAt: string;
  stats: {
    totalPurchases: number;
    totalEarnings: number;
    totalRentals: number;
  };
}

interface Purchase {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  buyer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  deliveryAddress?: string;
  notes?: string;
}

interface Rental {
  id: number;
  monthlyRent: number;
  startDate: string;
  endDate?: string;
  status: string;
  nextPaymentDue?: string;
  paidUntilDate?: string;
  tenant: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  paymentSummary: {
    totalAmountReceived: number;
    paidPayments: number;
    pendingPayments: number;
    overduePayments: number;
    nextDueAmount?: number;
    nextDueDate?: string;
  };
  paymentHistory?: Array<{
    id: number;
    monthYear: string;
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: string;
  }>;
}

export default function OwnerPropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
      fetchPurchases();
      fetchRentals();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await api.get(`/owner/properties?propertyId=${id}`);
      if (response.data.properties.length > 0) {
        setProperty(response.data.properties[0]);
      }
    } catch (error) {
      console.error('Failed to fetch property details:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await api.get(`/owner/purchases?propertyId=${id}`);
      setPurchases(response.data.purchases);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    }
  };

  const fetchRentals = async () => {
    try {
      const response = await api.get(`/owner/rentals?propertyId=${id}`);
      setRentals(response.data.rentals);
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
    } finally {
      setLoading(false);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#059669';
      case 'active': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #f97316', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>Property not found</p>
        <button
          onClick={() => navigate('/owner/dashboard')}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            background: '#f97316',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate('/owner/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 16
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
            {property.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={16} />
              {property.location}, {property.city}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={16} />
              {property.views} views
            </div>
            <div style={{ 
              padding: '4px 12px', 
              background: getStatusColor(property.status), 
              color: '#fff', 
              borderRadius: 12, 
              fontSize: 12,
              fontWeight: 600
            }}>
              {property.status}
            </div>
          </div>
        </div>

        {/* Property Overview */}
        <div style={{ 
          background: '#ffffff', 
          borderRadius: 16, 
          padding: 24, 
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f97316' }}>
                {formatCurrency(property.price)}
              </div>
              <div style={{ fontSize: 14, color: '#64748b' }}>Listed Price</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
                {property.stats.totalPurchases}
              </div>
              <div style={{ fontSize: 14, color: '#64748b' }}>Total Sales</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
                {property.stats.totalRentals}
              </div>
              <div style={{ fontSize: 14, color: '#64748b' }}>Total Rentals</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>
                {formatCurrency(property.stats.totalEarnings)}
              </div>
              <div style={{ fontSize: 14, color: '#64748b' }}>Total Earnings</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: 4, 
          marginBottom: 24,
          background: '#f8fafc',
          padding: 4,
          borderRadius: 12,
          border: '1px solid #e2e8f0'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'buyers', label: `Buyers (${purchases.length})`, icon: Users },
            { id: 'tenants', label: `Tenants (${rentals.length})`, icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  background: activeTab === tab.id ? '#ffffff' : 'transparent',
                  color: activeTab === tab.id ? '#1e293b' : '#64748b',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ 
            background: '#ffffff', 
            borderRadius: 16, 
            padding: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Property Description</h3>
            <p style={{ color: '#374151', lineHeight: 1.6, marginBottom: 20 }}>
              {property.description}
            </p>
            
            {property.images && property.images.length > 0 && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Property Images</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {property.images.slice(0, 6).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Property ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'buyers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {purchases.length === 0 ? (
              <div style={{ 
                background: '#ffffff', 
                borderRadius: 16, 
                padding: 40,
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
              }}>
                <Users size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: '#64748b' }}>No buyers yet for this property</p>
              </div>
            ) : (
              purchases.map((purchase) => (
                <div key={purchase.id} style={{ 
                  background: '#ffffff', 
                  borderRadius: 16, 
                  padding: 24,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div>
                      <h4 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                        {purchase.buyer.name}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Mail size={16} color="#64748b" />
                          <span style={{ color: '#374151' }}>{purchase.buyer.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Phone size={16} color="#64748b" />
                          <span style={{ color: '#374151' }}>{purchase.buyer.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={16} color="#64748b" />
                          <span style={{ color: '#374151' }}>Purchased on {formatDate(purchase.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#059669', marginBottom: 4 }}>
                        {formatCurrency(purchase.totalAmount)}
                      </div>
                      <div style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 12px',
                        background: getStatusColor(purchase.status),
                        color: '#fff',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        <CheckCircle size={12} />
                        {purchase.status}
                      </div>
                    </div>
                  </div>
                  
                  {purchase.deliveryAddress && (
                    <div style={{ 
                      padding: 16, 
                      background: '#f8fafc', 
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      marginTop: 12
                    }}>
                      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Delivery Address:</p>
                      <p style={{ color: '#374151' }}>{purchase.deliveryAddress}</p>
                    </div>
                  )}
                  
                  {purchase.notes && (
                    <div style={{ 
                      padding: 16, 
                      background: '#fef3c7', 
                      borderRadius: 8,
                      border: '1px solid #fbbf24',
                      marginTop: 12
                    }}>
                      <p style={{ fontSize: 14, color: '#92400e', marginBottom: 4 }}>Buyer Notes:</p>
                      <p style={{ color: '#92400e' }}>{purchase.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tenants' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rentals.length === 0 ? (
              <div style={{ 
                background: '#ffffff', 
                borderRadius: 16, 
                padding: 40,
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
              }}>
                <Users size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: '#64748b' }}>No tenants yet for this property</p>
              </div>
            ) : (
              rentals.map((rental) => (
                <div key={rental.id} style={{ 
                  background: '#ffffff', 
                  borderRadius: 16, 
                  padding: 24,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div>
                      <h4 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                        {rental.tenant.name}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Mail size={16} color="#64748b" />
                          <span style={{ color: '#374151' }}>{rental.tenant.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Phone size={16} color="#64748b" />
                          <span style={{ color: '#374151' }}>{rental.tenant.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={16} color="#64748b" />
                          <span style={{ color: '#374151' }}>
                            {formatDate(rental.startDate)} 
                            {rental.endDate && ` - ${formatDate(rental.endDate)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>
                        {formatCurrency(rental.monthlyRent)}/month
                      </div>
                      <div style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 12px',
                        background: getStatusColor(rental.status),
                        color: '#fff',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        <Clock size={12} />
                        {rental.status}
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Summary */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: 12,
                    padding: 16, 
                    background: '#f0fdf4', 
                    borderRadius: 8,
                    border: '1px solid #bbf7d0',
                    marginBottom: 16
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#059669' }}>
                        {formatCurrency(rental.paymentSummary.totalAmountReceived)}
                      </div>
                      <div style={{ fontSize: 12, color: '#064e3b' }}>Total Received</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#3b82f6' }}>
                        {rental.paymentSummary.paidPayments}
                      </div>
                      <div style={{ fontSize: 12, color: '#1e40af' }}>Paid Months</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#f59e0b' }}>
                        {rental.paymentSummary.pendingPayments}
                      </div>
                      <div style={{ fontSize: 12, color: '#92400e' }}>Pending</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#dc2626' }}>
                        {rental.paymentSummary.overduePayments}
                      </div>
                      <div style={{ fontSize: 12, color: '#991b1b' }}>Overdue</div>
                    </div>
                  </div>

                  {/* Rental Period & Next Payment */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: 12,
                    marginBottom: 16
                  }}>
                    {rental.paidUntilDate && (
                      <div style={{ 
                        padding: 16, 
                        background: '#dbeafe', 
                        borderRadius: 8,
                        border: '1px solid #93c5fd'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <CheckCircle size={16} color="#1e40af" />
                          <span style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>Rent Paid Until</span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a' }}>
                          {formatDate(rental.paidUntilDate)}
                        </div>
                      </div>
                    )}
                    
                    {rental.nextPaymentDue && (
                      <div style={{ 
                        padding: 16, 
                        background: rental.paymentSummary.overduePayments > 0 ? '#fee2e2' : '#fef3c7', 
                        borderRadius: 8,
                        border: rental.paymentSummary.overduePayments > 0 ? '1px solid #fca5a5' : '1px solid #fbbf24'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Calendar size={16} color={rental.paymentSummary.overduePayments > 0 ? '#991b1b' : '#92400e'} />
                          <span style={{ 
                            fontSize: 12, 
                            color: rental.paymentSummary.overduePayments > 0 ? '#991b1b' : '#92400e', 
                            fontWeight: 600 
                          }}>
                            Next Payment Due
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: 16, 
                          fontWeight: 700, 
                          color: rental.paymentSummary.overduePayments > 0 ? '#7f1d1d' : '#78350f' 
                        }}>
                          {formatDate(rental.nextPaymentDue)}
                        </div>
                        {rental.paymentSummary.nextDueAmount && (
                          <div style={{ 
                            fontSize: 14, 
                            color: rental.paymentSummary.overduePayments > 0 ? '#991b1b' : '#92400e',
                            marginTop: 4
                          }}>
                            Amount: {formatCurrency(rental.paymentSummary.nextDueAmount)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment History */}
                  {rental.paymentHistory && rental.paymentHistory.length > 0 && (
                    <div style={{ 
                      padding: 16, 
                      background: '#f8fafc', 
                      borderRadius: 8,
                      border: '1px solid #e2e8f0'
                    }}>
                      <h5 style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: '#1e293b', 
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <CreditCard size={16} />
                        Payment History
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {rental.paymentHistory.slice(0, 6).map((payment) => (
                          <div 
                            key={payment.id} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: 12,
                              background: '#fff',
                              borderRadius: 6,
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                                {payment.monthYear}
                              </div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>
                                {payment.status === 'paid' && payment.paidDate 
                                  ? `Paid on ${formatDate(payment.paidDate)}`
                                  : `Due: ${formatDate(payment.dueDate)}`
                                }
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                                {formatCurrency(payment.amount)}
                              </div>
                              <div style={{ 
                                fontSize: 11, 
                                fontWeight: 600,
                                color: payment.status === 'paid' ? '#059669' : 
                                       payment.status === 'overdue' ? '#dc2626' : '#f59e0b',
                                textTransform: 'uppercase'
                              }}>
                                {payment.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {rental.paymentHistory.length > 6 && (
                        <div style={{ 
                          textAlign: 'center', 
                          marginTop: 12, 
                          fontSize: 12, 
                          color: '#64748b' 
                        }}>
                          Showing 6 of {rental.paymentHistory.length} payments
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}