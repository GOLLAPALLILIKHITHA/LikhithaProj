import { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, LayoutDashboard, List, Plus } from 'lucide-react';

export default function OwnerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/owner/login');
  }, [token, navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/owner/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/owner/dashboard' },
    { icon: List, label: 'My Properties', path: '/owner/properties' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff7ed' }}>
      <aside
        style={{
          width: 260,
          background: 'linear-gradient(180deg, #7c2d12 0%, #9a3412 100%)',
          color: '#fed7aa',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          borderRight: '1px solid #92400e',
        }}
      >
        {/* Logo Section */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #92400e' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <img src="/logo.png" alt="INFRAALL" style={{ height: 70, width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            <div style={{ fontSize: 11, color: '#fed7aa', letterSpacing: '1px', fontWeight: 600 }}>OWNER PORTAL</div>
          </div>
          <div style={{ fontSize: 12, color: '#fdba74', marginTop: 12, textAlign: 'center' }}>
            Manage your properties and earnings
          </div>
        </div>

        {/* Quick Action */}
        <div style={{ padding: '16px 12px', borderBottom: '1px solid #92400e' }}>
          <Link
            to="/post-ad"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 10,
              textDecoration: 'none',
              background: 'rgba(249,115,22,0.25)',
              color: '#fde68a',
              fontSize: 14,
              fontWeight: 700,
              border: '1px solid rgba(249,115,22,0.4)',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={16} />
            Add Property
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Management
          </div>
          {navItems.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  marginBottom: 6,
                  textDecoration: 'none',
                  background: active ? 'rgba(249,115,22,0.25)' : 'transparent',
                  color: active ? '#fef3c7' : '#fdba74',
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  border: active ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #92400e', flexShrink: 0 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              textDecoration: 'none',
              color: '#fed7aa',
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            <Home size={16} /> Main Site
          </Link>
          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 260, flex: 1, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
