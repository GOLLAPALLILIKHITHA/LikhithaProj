import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Menu, X, Plus, ChevronDown, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Buy Property', path: '/buy-property' },
    { label: 'Rent Property', path: '/property-rentals' },
    { label: 'Furniture Rental', path: '/furniture' },
    { label: 'Home Services', path: '/services' },
    { label: 'Building Materials', path: '/materials' },
  ];

  return (
    <nav style={{ background: '#fff7ed', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(249,115,22,0.1)', borderBottom: '1px solid #fed7aa' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 100 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none', gap: 2 }}>
          <div style={{ overflow: 'hidden', height: 70 }}>
            <img src="/logo.png" alt="INFRAALL" style={{ height: 160, width: 'auto', objectFit: 'cover', mixBlendMode: 'multiply', marginTop: -45, marginBottom: -45 }} />
          </div>
          <span style={{ fontSize: 9, color: '#92400e', fontStyle: 'italic', fontWeight: 600, letterSpacing: '0.3px', lineHeight: 1, marginLeft: 20 }}>
            Most Trusted Platform <span style={{ color: '#f97316' }}>Buy. Sell. Rent.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hidden lg:flex">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}
              style={{ color: '#92400e', fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 8, transition: 'all 0.15s', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7c2d12'; (e.currentTarget as HTMLElement).style.background = '#fed7aa'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#92400e'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/wishlist" style={{ color: '#92400e', display: 'flex', position: 'relative' }}>
            <Heart size={20} />
          </Link>
          <Link to="/chat" style={{ color: '#92400e', display: 'flex' }}>
            <Bell size={20} />
          </Link>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropOpen(!dropOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '6px 12px', cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ color: '#7c2d12', fontSize: 13, fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={12} color="#94a3b8" />
              </button>
              {dropOpen && (
                <div style={{ position: 'absolute', right: 0, top: 46, background: '#fff7ed', border: '1px solid #334155', borderRadius: 12, width: 200, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', zIndex: 999 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#7c2d12' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{user.email}</div>
                  </div>
                    {[
                    { l: 'My Account', p: '/account' },
                    { l: 'KYC Verification', p: '/kyc' },
                    { l: 'Wishlist', p: '/wishlist' }, 
                    { l: 'Messages', p: '/account?tab=messages' },
                    ...(user.vendor ? [{ l: 'Vendor portal', p: '/vendor' }] : []),
                    ...(user.role === 'admin' ? [{ l: 'Admin Dashboard', p: '/admin' }] : [])
                  ].map(i => (
                    <Link key={i.p} to={i.p} onClick={() => setDropOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', fontSize: 14, color: '#92400e', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      {i.l}
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setDropOpen(false); navigate('/'); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 14, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #334155' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: 14, fontWeight: 500, background: 'linear-gradient(135deg,#f97316,#ea580c)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>
              <User size={16} /> User Login
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/post-ad"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', padding: '9px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(249,115,22,0.4)' }}
              className="hidden md:flex">
              <Plus size={15} /> Post Ad
            </Link>
          )}

          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e' }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: '#fff7ed', borderTop: '1px solid #334155', padding: '12px 24px 20px' }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '12px 0', fontSize: 15, color: '#92400e', textDecoration: 'none', borderBottom: '1px solid #334155' }}>
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link to="/login" onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '12px 0', fontSize: 15, color: '#fff', background: 'linear-gradient(135deg,#f97316,#ea580c)', textAlign: 'center', borderRadius: 8, fontWeight: 700, textDecoration: 'none', marginTop: 8 }}>
              User Login
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/post-ad" onClick={() => setMenuOpen(false)}
              style={{ display: 'block', marginTop: 12, background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', textAlign: 'center', padding: 12, borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
              + Post Ad
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}




