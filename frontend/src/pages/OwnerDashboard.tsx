import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  DollarSign, 
  Building, 
  ShoppingCart, 
  Calendar,
  List,
  ArrowRight,
  Plus
} from 'lucide-react';
import api from '../api';

interface DashboardOverview {
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalPurchases: number;
  completedPurchases: number;
  totalRentals: number;
  activeRentals: number;
  totalEarnings: number;
  purchaseEarnings: number;
  rentEarnings: number;
}

interface RecentActivity {
  purchases: any[];
  rentPayments: any[];
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/owner/dashboard');
      setOverview(response.data.overview);
      setRecentActivity(response.data.recentActivity);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  if (loading) {
    return (
      <div style={{ 
        padding: 40, 
        background: '#fff7ed', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: 18, color: '#92400e' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, background: '#fff7ed', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 800, 
          color: '#7c2d12', 
          margin: '0 0 8px 0' 
        }}>
          Owner Dashboard
        </h1>
        <p style={{ fontSize: 16, color: '#92400e', margin: 0 }}>
          Welcome back! Here's an overview of your properties and earnings
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 20,
        marginBottom: 32
      }}>
        {/* Total Properties */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f97316, #ea580c)', 
          borderRadius: 16, 
          padding: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(249,115,22,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Building size={28} />
            <div style={{ fontSize: 14, opacity: 0.9 }}>Total Properties</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{overview?.totalProperties || 0}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            {overview?.activeProperties || 0} active
          </div>
        </div>

        {/* Total Earnings */}
        <div style={{ 
          background: 'linear-gradient(135deg, #059669, #047857)', 
          borderRadius: 16, 
          padding: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <DollarSign size={28} />
            <div style={{ fontSize: 14, opacity: 0.9 }}>Total Earnings</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>
            {formatCurrency(overview?.totalEarnings || 0)}
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            All time revenue
          </div>
        </div>

        {/* Properties Sold */}
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
          borderRadius: 16, 
          padding: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <ShoppingCart size={28} />
            <div style={{ fontSize: 14, opacity: 0.9 }}>Properties Sold</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{overview?.soldProperties || 0}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            {formatCurrency(overview?.purchaseEarnings || 0)} earned
          </div>
        </div>

        {/* Properties Rented */}
        <div style={{ 
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
          borderRadius: 16, 
          padding: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Home size={28} />
            <div style={{ fontSize: 14, opacity: 0.9 }}>Properties Rented</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{overview?.rentedProperties || 0}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            {formatCurrency(overview?.rentEarnings || 0)} earned
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        marginBottom: 32,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16
      }}>
        <button
          onClick={() => navigate('/owner/properties')}
          style={{
            background: '#fff',
            color: '#f97316',
            border: '2px solid #f97316',
            borderRadius: 12,
            padding: '16px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f97316';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.color = '#f97316';
          }}
        >
          <List size={18} />
          View All Listings
          <ArrowRight size={16} />
        </button>

        <button
          onClick={() => navigate('/post-ad')}
          style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'transform 0.2s',
            boxShadow: '0 4px 12px rgba(249,115,22,0.3)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} />
          Add New Property
        </button>
      </div>

      {/* Recent Activity */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: 24 
      }}>
        
        {/* Recent Purchases */}
        <div style={{ 
          background: '#ffffff', 
          borderRadius: 16, 
          padding: 24, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <h3 style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#1e293b', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <ShoppingCart size={20} />
              Recent Sales
            </h3>
            <button
              onClick={() => navigate('/owner/properties')}
              style={{
                background: 'none',
                border: 'none',
                color: '#f97316',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          {recentActivity?.purchases && recentActivity.purchases.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentActivity.purchases.slice(0, 3).map((purchase) => (
                <div key={purchase.id} style={{ 
                  padding: 16, 
                  background: '#f8fafc', 
                  borderRadius: 12,
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 4px 0' }}>
                        {purchase.item.title}
                      </p>
                      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 8px 0' }}>
                        Buyer: {purchase.buyer.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                        <Calendar size={14} />
                        {formatDate(purchase.createdAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: '#059669', margin: 0 }}>
                        {formatCurrency(purchase.totalAmount)}
                      </p>
                      <p style={{ 
                        fontSize: 12, 
                        color: '#059669', 
                        background: '#d1fae5', 
                        padding: '2px 8px', 
                        borderRadius: 12,
                        margin: '4px 0 0 0'
                      }}>
                        {purchase.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
              No recent sales
            </p>
          )}
        </div>

        {/* Recent Rent Payments */}
        <div style={{ 
          background: '#ffffff', 
          borderRadius: 16, 
          padding: 24, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <h3 style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#1e293b', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <DollarSign size={20} />
              Recent Rent Payments
            </h3>
            <button
              onClick={() => navigate('/owner/properties')}
              style={{
                background: 'none',
                border: 'none',
                color: '#f97316',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          {recentActivity?.rentPayments && recentActivity.rentPayments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentActivity.rentPayments.slice(0, 3).map((payment) => (
                <div key={payment.id} style={{ 
                  padding: 16, 
                  background: '#f8fafc', 
                  borderRadius: 12,
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 4px 0' }}>
                        {payment.rental.property.title}
                      </p>
                      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 8px 0' }}>
                        Tenant: {payment.rental.tenant.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                        <Calendar size={14} />
                        {formatDate(payment.paidDate)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: '#059669', margin: 0 }}>
                        {formatCurrency(payment.amount)}
                      </p>
                      <p style={{ 
                        fontSize: 12, 
                        color: '#8b5cf6', 
                        background: '#ede9fe', 
                        padding: '2px 8px', 
                        borderRadius: 12,
                        margin: '4px 0 0 0'
                      }}>
                        {payment.monthYear}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
              No recent rent payments
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
