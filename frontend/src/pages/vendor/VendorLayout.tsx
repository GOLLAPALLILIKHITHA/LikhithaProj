import { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, ClipboardList } from 'lucide-react';

export default function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/vendor/login');
  }, [token, navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/vendor/login');
  };

  const navItems = [
    { icon: ClipboardList, label: 'My jobs', path: '/vendor' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <aside
        style={{
          width: 240,
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          borderRight: '1px solid #334155',
        }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em' }}>INFRAALL</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>Vendor portal</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Track jobs assigned to you</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
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
                  background: active ? 'rgba(99,102,241,0.25)' : 'transparent',
                  color: active ? '#c7d2fe' : '#94a3b8',
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid #334155' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              textDecoration: 'none',
              color: '#cbd5e1',
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            <Home size={16} /> Main site
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
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
