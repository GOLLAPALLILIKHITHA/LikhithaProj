import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';
import api from '../../api';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get(`/admin/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = [
      ['Date', 'New Users', 'New Listings'],
      ...analytics.userGrowth.map((item: any, index: number) => [
        item.date,
        item.count,
        analytics.listingGrowth[index]?.count || 0
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>Analytics</h1>
          <p style={{ fontSize: 14, color: '#92400e' }}>Detailed insights and performance metrics</p>
        </div>
        <button
          onClick={exportData}
          style={{
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Download size={16} /> Export Data
        </button>
      </div>

      {/* Date Range Selector */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Calendar size={18} color="#64748b" />
          <span style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>Date Range:</span>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#7c2d12',
              fontSize: 14
            }}
          />
          <span style={{ color: '#92400e' }}>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#7c2d12',
              fontSize: 14
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#92400e' }}>
          Loading analytics...
        </div>
      ) : !analytics ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#92400e' }}>
          Failed to load analytics data
        </div>
      ) : (
        <>
          {/* Growth Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* User Growth */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <TrendingUp size={20} color="#6366f1" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12' }}>User Growth</h3>
              </div>
              <div style={{ height: 200, display: 'flex', alignItems: 'end', gap: 4, padding: '0 10px' }}>
                {analytics.userGrowth.slice(-14).map((item: any, i: number) => {
                  const maxCount = Math.max(...analytics.userGrowth.map((d: any) => d.count));
                  const height = (item.count / maxCount) * 160;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '100%',
                          height: height || 4,
                          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                          borderRadius: '2px 2px 0 0',
                          marginBottom: 8
                        }}
                        title={`${item.date}: ${item.count} users`}
                      />
                      <span style={{ fontSize: 10, color: '#92400e', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Listing Growth */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <BarChart3 size={20} color="#10b981" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12' }}>Listing Growth</h3>
              </div>
              <div style={{ height: 200, display: 'flex', alignItems: 'end', gap: 4, padding: '0 10px' }}>
                {analytics.listingGrowth.slice(-14).map((item: any, i: number) => {
                  const maxCount = Math.max(...analytics.listingGrowth.map((d: any) => d.count));
                  const height = (item.count / maxCount) * 160;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '100%',
                          height: height || 4,
                          background: 'linear-gradient(135deg,#10b981,#059669)',
                          borderRadius: '2px 2px 0 0',
                          marginBottom: 8
                        }}
                        title={`${item.date}: ${item.count} listings`}
                      />
                      <span style={{ fontSize: 10, color: '#92400e', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 20 }}>Top Categories</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {analytics.topCategories.map((category: any, i: number) => {
                const maxCount = Math.max(...analytics.topCategories.map((c: any) => c.count));
                const percentage = (category.count / maxCount) * 100;
                return (
                  <div key={i} style={{ background: '#fff7ed', borderRadius: 10, padding: '16px', border: '1px solid #fed7aa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>
                        {category.category.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 18, color: '#6366f1', fontWeight: 800 }}>
                        {category.count}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#fed7aa', borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                          borderRadius: 2
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


