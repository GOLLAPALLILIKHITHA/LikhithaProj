import { useEffect, useState } from 'react';
import { Search, Calendar, DollarSign, Users, TrendingUp, Plus, Edit, X } from 'lucide-react';
import api from '../../api';

const formatPrice = (amount: number) => {
  return `₹${(amount / 100).toLocaleString()}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN');
};

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [packageType, setPackageType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/subscriptions', { 
        params: { search, packageType, status }, 
        headers 
      });
      setSubscriptions(data.subscriptions);
      setTotal(data.total);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
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
    loadSubscriptions();
  }, [search, packageType, status]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const updateSubscriptionStatus = async (id: number, newStatus: string) => {
    try {
      await api.put(`/admin/subscriptions/${id}`, { status: newStatus }, { headers });
      loadSubscriptions();
    } catch (err) {
      console.error('Error updating subscription:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
      case 'expired': return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
      case 'cancelled': return { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' };
      default: return { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' };
    }
  };

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'Monthly': return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' };
      case 'Weekly': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
      case 'Yearly': return { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' };
      default: return { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' };
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>
          Subscription Management
        </h1>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          Manage user subscriptions and view analytics
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Total Subscriptions</span>
              <Users size={18} color="#6366f1" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {analytics.totalSubscriptions}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Active Subscriptions</span>
              <TrendingUp size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {analytics.activeSubscriptions}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Total Revenue</span>
              <DollarSign size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {formatPrice(analytics.totalRevenue)}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Expired</span>
              <Calendar size={18} color="#ef4444" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {analytics.expiredSubscriptions}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 24, 
        flexWrap: 'wrap', 
        gap: 12 
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            background: '#fff', 
            border: '1px solid #fed7aa', 
            borderRadius: 10, 
            padding: '10px 16px' 
          }}>
            <Search size={16} color="#64748b" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search users..."
              style={{ 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: '#7c2d12', 
                fontSize: 14, 
                width: 180 
              }} 
            />
          </div>
          
          <select 
            value={packageType} 
            onChange={e => setPackageType(e.target.value)}
            style={{ 
              background: '#fff', 
              border: '1px solid #fed7aa', 
              borderRadius: 10, 
              padding: '10px 14px', 
              color: '#7c2d12', 
              fontSize: 14, 
              outline: 'none' 
            }}
          >
            <option value="">All Packages</option>
            <option value="Monthly">Monthly</option>
            <option value="Weekly">Weekly</option>
            <option value="Yearly">Yearly</option>
          </select>

          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)}
            style={{ 
              background: '#fff', 
              border: '1px solid #fed7aa', 
              borderRadius: 10, 
              padding: '10px 14px', 
              color: '#7c2d12', 
              fontSize: 14, 
              outline: 'none' 
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Plus size={16} />
          Create Subscription
        </button>
      </div>

      {/* Subscriptions Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fed7aa', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #fed7aa' }}>
              {['User', 'Package', 'Amount', 'Start Date', 'End Date', 'Status', 'Actions'].map(h => (
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
            ) : subscriptions.map(sub => (
              <tr key={sub.id} style={{ borderBottom: '1px solid rgba(253,215,170,0.5)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#7c2d12' }}>
                      {sub.user?.name || 'Unknown User'}
                    </div>
                    <div style={{ fontSize: 12, color: '#92400e' }}>
                      {sub.user?.email}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    fontSize: 11, 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    background: getPackageColor(sub.packageType).bg, 
                    color: getPackageColor(sub.packageType).color, 
                    fontWeight: 600 
                  }}>
                    {sub.packageType}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#7c2d12' }}>
                  {formatPrice(sub.amount)}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
                  {formatDate(sub.startDate)}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
                  {formatDate(sub.endDate)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    fontSize: 11, 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    background: getStatusColor(sub.status).bg, 
                    color: getStatusColor(sub.status).color, 
                    fontWeight: 600 
                  }}>
                    {sub.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button
                      onClick={() => setEditingSubscription(sub)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: 'none',
                        background: 'rgba(59,130,246,0.15)',
                        color: '#3b82f6',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit size={13} />
                    </button>
                    {sub.status === 'active' && (
                      <button
                        onClick={() => updateSubscriptionStatus(sub.id, 'cancelled')}
                        style={{
                          padding: '5px 8px',
                          borderRadius: 6,
                          border: 'none',
                          background: 'rgba(239,68,68,0.15)',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            Revenue by Package Type
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {analytics.revenueByPackage.map((pkg: any) => (
              <div key={pkg.packageType} style={{ 
                background: '#fff7ed', 
                borderRadius: 10, 
                padding: '16px', 
                border: '1px solid #fed7aa' 
              }}>
                <div style={{ fontSize: 13, color: '#92400e', marginBottom: 4 }}>
                  {pkg.packageType}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>
                  {formatPrice(pkg.totalRevenue || pkg.dataValues?.totalRevenue || 0)}
                </div>
                <div style={{ fontSize: 12, color: '#92400e' }}>
                  {pkg.count || pkg.dataValues?.count || 0} subscriptions
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}