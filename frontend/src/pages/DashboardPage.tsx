import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  Home, 
  MessageSquare, 
  Star, 
  BarChart3, 
  Settings, 
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import api from '../api';

interface DashboardStats {
  totalListings: number;
  totalUsers: number;
  totalMessages: number;
  totalReviews: number;
  recentListings: any[];
  recentUsers: any[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    totalUsers: 0,
    totalMessages: 0,
    totalReviews: 0,
    recentListings: [],
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard stats (you'll need to create these endpoints)
      const [listingsRes, usersRes] = await Promise.all([
        api.get('/listings?limit=5'),
        api.get('/admin/users?limit=5')
      ]);
      
      setStats({
        totalListings: listingsRes.data.total || 0,
        totalUsers: 25, // Mock data
        totalMessages: 48, // Mock data
        totalReviews: 156, // Mock data
        recentListings: listingsRes.data.listings || [],
        recentUsers: usersRes.data.users || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'listings', label: 'Manage Listings', icon: Home },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Listings" 
          value={stats.totalListings} 
          icon={Home} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Messages" 
          value={stats.totalMessages} 
          icon={MessageSquare} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Reviews" 
          value={stats.totalReviews} 
          icon={Star} 
          color="bg-orange-500" 
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Listings</h3>
            <button 
              onClick={() => setActiveTab('listings')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentListings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{listing.title}</p>
                  <p className="text-sm text-gray-600">{listing.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">₹{listing.price?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{listing.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.open('/post-ad', '_blank')}
              className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Add Listing</span>
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Users size={20} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">Manage Users</span>
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <MessageSquare size={20} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-700">View Messages</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <Settings size={20} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'listings':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Manage Listings</h3>
            <p className="text-gray-600">Listing management interface would go here...</p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Manage Users</h3>
            <p className="text-gray-600">User management interface would go here...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.open('/post-ad', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                Add Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}