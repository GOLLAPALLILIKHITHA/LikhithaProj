import { useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, List, Star, LogOut, Shield, Home, MessageSquare, Settings, BarChart3, Plus, Package, Calendar, CreditCard, DollarSign, Building, FileText, ShoppingCart, Store, Wrench } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'All Requests', path: '/admin/all-requests' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: List, label: 'Listings', path: '/admin/listings' },
    { icon: Store, label: 'Vendors', path: '/admin/vendors' },
    { icon: FileText, label: 'Owner Management', path: '/admin/owners' },
    { icon: ShoppingCart, label: 'Property Purchases', path: '/admin/property-purchases' },
    { icon: CreditCard, label: 'Subscriptions', path: '/admin/subscriptions' },
    { icon: DollarSign, label: 'Payments', path: '/admin/payments' },
    { icon: Star, label: 'Reviews', path: '/admin/reviews' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const quickActions = [
    { icon: Plus, label: 'Add Listing', path: '/admin/listings/add' },
    { icon: Store, label: 'Add Vendor', path: '/admin/vendors/add' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff7ed' }}>
      {/* Sidebar */}
      <div style={{ width: 260, background: '#7c2d12', borderRight: '1px solid #92400e', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #92400e' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <img src="/logo.png" alt="INFRAALL" style={{ height: 70, width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            <div style={{ fontSize: 11, color: '#fed7aa', letterSpacing: '1px', fontWeight: 600 }}>ADMIN CONTROL PANEL</div>
          </div>
        </div>

        <div style={{ padding: '16px 12px', borderBottom: '1px solid #92400e' }}>
          <div style={{ fontSize: 11, color: '#fed7aa', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Quick Actions</div>
          {quickActions.map(item => (
            <Link key={item.path} to={item.path}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, marginBottom: 4, textDecoration: 'none', background: 'rgba(249,115,22,0.2)', color: '#fde68a', fontSize: 13, fontWeight: 600, border: '1px solid rgba(249,115,22,0.3)', transition: 'all 0.15s' }}>
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Management</div>
          {navItems.map(item => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, marginBottom: 4, textDecoration: 'none', background: active ? 'rgba(249,115,22,0.25)' : 'transparent', color: active ? '#a5b4fc' : '#64748b', fontWeight: active ? 700 : 500, fontSize: 14, border: active ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent', transition: 'all 0.15s' }}>
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #92400e', flexShrink: 0 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, textDecoration: 'none', color: '#fed7aa', fontSize: 14, marginBottom: 4 }}>
            <Home size={16} /> View Site
          </Link>
          <button onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 260, flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}







