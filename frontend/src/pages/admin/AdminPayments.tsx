import { useEffect, useState } from 'react';
import { Search, CreditCard, DollarSign, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import api from '../../api';

const formatPrice = (amount: number) => {
  return `₹${(amount / 100).toLocaleString()}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/payments', { 
        params: { search }, 
        headers 
      });
      setPayments(data.payments);
      setTotal(data.total);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get('/admin/subscriptions/analytics', { headers });
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [search]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'Monthly': return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' };
      case 'Weekly': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
      case 'Yearly': return { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' };
      default: return { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' };
    }
  };

  const openRazorpayDashboard = (paymentId: string) => {
    window.open(`https://dashboard.razorpay.com/app/payments/${paymentId}`, '_blank');
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>
          Payment History
        </h1>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          View all payment transactions and revenue analytics
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Total Revenue</span>
              <DollarSign size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {formatPrice(analytics.totalRevenue)}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Total Payments</span>
              <CreditCard size={18} color="#6366f1" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {total}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Active Subscriptions</span>
              <TrendingUp size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {analytics.activeSubscriptions}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>This Month</span>
              <Calendar size={18} color="#ec4899" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {analytics.monthlyRevenue?.[0] ? formatPrice(analytics.monthlyRevenue[0].revenue || analytics.monthlyRevenue[0].dataValues?.revenue || 0) : '₹0'}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          background: '#fff', 
          border: '1px solid #fed7aa', 
          borderRadius: 10, 
          padding: '10px 16px',
          maxWidth: 400
        }}>
          <Search size={16} color="#64748b" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by user name, email, or payment ID..."
            style={{ 
              background: 'transparent', 
              border: 'none', 
              outline: 'none', 
              color: '#7c2d12', 
              fontSize: 14, 
              width: '100%'
            }} 
          />
        </div>
      </div>

      {/* Payments Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fed7aa', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #fed7aa' }}>
              {['User', 'Package', 'Amount', 'Payment ID', 'Order ID', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ 
                  padding: '14px 16px', 
                  textAlign: 'left', 
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: '#92400e', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px' 
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} style={{ padding: 16 }}>
                    <div style={{ height: 20, background: '#fed7aa', borderRadius: 4 }} />
                  </td>
                </tr>
              ))
            ) : payments.map(payment => (
              <tr key={payment.id} style={{ borderBottom: '1px solid rgba(253,215,170,0.5)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#7c2d12' }}>
                      {payment.user?.name || 'Unknown User'}
                    </div>
                    <div style={{ fontSize: 12, color: '#92400e' }}>
                      {payment.user?.email}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    fontSize: 11, 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    background: getPackageColor(payment.packageType).bg, 
                    color: getPackageColor(payment.packageType).color, 
                    fontWeight: 600 
                  }}>
                    {payment.packageType}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                  {formatPrice(payment.amount)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#7c2d12' }}>
                    {payment.razorpayPaymentId}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#92400e' }}>
                    {payment.razorpayOrderId}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
                  {formatDate(payment.createdAt)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => openRazorpayDashboard(payment.razorpayPaymentId)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'rgba(59,130,246,0.15)',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12
                    }}
                    title="View in Razorpay Dashboard"
                  >
                    <ExternalLink size={12} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && !loading && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#92400e' 
          }}>
            No payment records found
          </div>
        )}
      </div>

      {/* Monthly Revenue Chart */}
      {analytics?.monthlyRevenue && analytics.monthlyRevenue.length > 0 && (
        <div style={{ 
          background: '#fff', 
          borderRadius: 14, 
          padding: '24px', 
          border: '1px solid #fed7aa', 
          marginTop: 24 
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>
            Monthly Revenue Trend
          </h3>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
            {analytics.monthlyRevenue.slice(0, 6).reverse().map((month: any) => (
              <div key={month.month} style={{ 
                background: '#fff7ed', 
                borderRadius: 10, 
                padding: '16px', 
                border: '1px solid #fed7aa',
                minWidth: 140,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>
                  {new Date(month.month + '-01').toLocaleDateString('en-IN', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>
                  {formatPrice(month.revenue || month.dataValues?.revenue || 0)}
                </div>
                <div style={{ fontSize: 11, color: '#92400e' }}>
                  {month.subscriptions || month.dataValues?.subscriptions || 0} payments
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue by Package */}
      {analytics?.revenueByPackage && (
        <div style={{ 
          background: '#fff', 
          borderRadius: 14, 
          padding: '24px', 
          border: '1px solid #fed7aa', 
          marginTop: 24 
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>
            Revenue Breakdown by Package
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {analytics.revenueByPackage.map((pkg: any) => (
              <div key={pkg.packageType} style={{ 
                background: getPackageColor(pkg.packageType).bg, 
                borderRadius: 10, 
                padding: '20px', 
                border: `2px solid ${getPackageColor(pkg.packageType).color}20`
              }}>
                <div style={{ 
                  fontSize: 14, 
                  color: getPackageColor(pkg.packageType).color, 
                  fontWeight: 600,
                  marginBottom: 8 
                }}>
                  {pkg.packageType} Package
                </div>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 900, 
                  color: '#7c2d12', 
                  marginBottom: 4 
                }}>
                  {formatPrice(pkg.totalRevenue || pkg.dataValues?.totalRevenue || 0)}
                </div>
                <div style={{ fontSize: 13, color: '#92400e' }}>
                  {pkg.count || pkg.dataValues?.count || 0} subscriptions
                </div>
                <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>
                  Avg: {formatPrice(Math.round(((pkg.totalRevenue || pkg.dataValues?.totalRevenue || 0) / (pkg.count || pkg.dataValues?.count || 1))))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}