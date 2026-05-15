import { useState, useEffect } from 'react';
import { Users, FileText, Home, ShoppingCart, TrendingUp, Calendar, CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import api from '../../api';

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  totalRequests: number;
  totalPurchases: number;
  monthlyRevenue: number;
  pendingRequests: number;
  activeRentals: number;
  completedPurchases: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard statistics using the same logic as AdminPropertyPurchases
      const [requestsRes, usersRes, listingsRes, purchaseRes, rentalRes, subscriptionRes, buyRequestRes] = await Promise.all([
        api.get('/requests/all'),
        api.get('/admin/users'),
        api.get('/listings'),
        api.get('/purchase').catch(() => ({ data: [] })),
        api.get('/property-rentals').catch(() => ({ data: [] })),
        api.get('/admin/subscriptions').catch(() => ({ data: { subscriptions: [] } })),
        api.get('/buy-requests').catch(() => ({ data: [] }))
      ]);

      const requests = requestsRes.data.requests || [];
      const users = usersRes.data.users || [];
      const listings = listingsRes.data.listings || [];
      
      // Calculate total purchases using the same logic as AdminPropertyPurchases
      let totalPurchasesCount = 0;
      let monthlyRevenue = 0;
      
      // Count completed purchases
      if (purchaseRes.data && Array.isArray(purchaseRes.data)) {
        const completedPurchases = purchaseRes.data.filter((p: any) => 
          p.status === 'completed' || p.status === 'approved'
        );
        totalPurchasesCount += completedPurchases.length;
        monthlyRevenue += completedPurchases.reduce((sum: number, p: any) => 
          sum + parseFloat(p.totalAmount || p.amount || 0), 0
        );
      }
      
      // Count active/completed rentals
      if (rentalRes.data && Array.isArray(rentalRes.data)) {
        const activeRentals = rentalRes.data.filter((r: any) => 
          r.status === 'active' || r.status === 'completed'
        );
        totalPurchasesCount += activeRentals.length;
        monthlyRevenue += activeRentals.reduce((sum: number, r: any) => 
          sum + parseFloat(r.monthlyRent || r.amount || 0), 0
        );
      }
      
      // Count completed buy requests
      const buyRequestsData = buyRequestRes.data?.buyRequests || buyRequestRes.data || [];
      if (Array.isArray(buyRequestsData)) {
        const completedBuyRequests = buyRequestsData.filter((b: any) => 
          b.status === 'completed' || b.status === 'approved'
        );
        totalPurchasesCount += completedBuyRequests.length;
        monthlyRevenue += completedBuyRequests.reduce((sum: number, b: any) => 
          sum + parseFloat(b.offerAmount || b.amount || 0), 0
        );
      }
      
      // Count active subscriptions
      if (subscriptionRes.data && subscriptionRes.data.subscriptions && Array.isArray(subscriptionRes.data.subscriptions)) {
        const activeSubscriptions = subscriptionRes.data.subscriptions.filter((s: any) => 
          s.status === 'active'
        );
        totalPurchasesCount += activeSubscriptions.length;
        monthlyRevenue += activeSubscriptions.reduce((sum: number, s: any) => {
          let amount = parseFloat(s.amount || s.price || 0);
          // Convert paise to rupees if needed
          if (amount > 10000) {
            amount = amount / 100;
          }
          return sum + amount;
        }, 0);
      }

      setStats({
        totalUsers: users.length,
        totalListings: listings.length,
        totalRequests: requests.length,
        totalPurchases: totalPurchasesCount,
        monthlyRevenue: monthlyRevenue,
        pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
        activeRentals: rentalRes.data ? rentalRes.data.filter((r: any) => r.status === 'active').length : 0,
        completedPurchases: totalPurchasesCount
      });

      // Create recent activity from requests
      const activities = requests.slice(0, 10).map((req: any) => ({
        id: req.id,
        type: req.typeLabel,
        description: `${req.user.name} - ${req.property?.title || req.typeLabel}`,
        timestamp: req.createdAt,
        status: req.status
      }));
      setRecentActivity(activities);

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
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'active': case 'approved': return '#10b981';
      case 'completed': return '#6b7280';
      case 'rejected': case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#667eea', change: '+12%' },
    { title: 'Total Listings', value: stats?.totalListings || 0, icon: Home, color: '#10b981', change: '+8%' },
    { title: 'Pending Requests', value: stats?.pendingRequests || 0, icon: Clock, color: '#f59e0b', change: '+5%' },
    { title: 'Active Rentals', value: stats?.activeRentals || 0, icon: CheckCircle, color: '#06b6d4', change: '+15%' },
    { title: 'Total Purchases', value: stats?.totalPurchases || 0, icon: ShoppingCart, color: '#8b5cf6', change: '+20%' },
    { title: 'Monthly Revenue', value: formatCurrency(stats?.monthlyRevenue || 0), icon: DollarSign, color: '#f97316', change: '+25%' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>
            Welcome back! Here's what's happening with INFRAALL today.
          </p>
        </div>

        {loading ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTopColor: '#667eea', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      background: `${card.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={28} color={card.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{card.title}</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                        {typeof card.value === 'string' ? card.value : card.value.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
                        {card.change} from last month
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <TrendingUp size={24} color="#667eea" />
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                  Recent Activity
                </h2>
              </div>

              {recentActivity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                  <FileText size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentActivity.map((activity) => (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getStatusColor(activity.status),
                        flexShrink: 0
                      }}></div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                          {activity.type}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {activity.description}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '500',
                          background: `${getStatusColor(activity.status)}20`,
                          color: getStatusColor(activity.status)
                        }}>
                          {activity.status}
                        </span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}