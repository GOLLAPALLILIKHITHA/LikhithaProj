import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const cities = ['Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon'];

export default function Footer() {
  return (
    <footer style={{ background: '#fff7ed', color: '#92400e', borderTop: '1px solid #fed7aa' }}>
      {/* Main Footer */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <img src="/logo.png" alt="INFRAALL" style={{ height: 70, width: "auto", objectFit: "contain", mixBlendMode: 'multiply' }} />
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 20, color: '#64748b' }}>
              India's trusted marketplace for buying, selling and renting properties, furniture, home services and building materials. No brokerage. No hidden charges.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[Facebook, Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#"
                  style={{ width: 34, height: 34, background: '#1e293b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #334155', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#6366f1'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1e293b'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Phone size={14} color="#6366f1" /> <span>+91 98765 43210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Mail size={14} color="#f97316" /> <span>support@infraall.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <MapPin size={14} color="#6366f1" /> <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: '🏢 Buy Property', p: '/listings?category=property_sell' },
                { l: '🔑 Rent Property', p: '/listings?category=property_rent' },
                { l: '🛋️ Furniture', p: '/listings?category=furniture' },
                { l: '🔧 Home Services', p: '/listings?category=services' },
                { l: '🧱 Building Materials', p: '/listings?category=materials' },
              ].map(item => (
                <Link key={item.p} to={item.p}
                  style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#818cf8'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}>
                  {item.l}
                </Link>
              ))}
            </div>
          </div>

          {/* Top Cities */}
          <div>
            <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Top Cities</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cities.map(c => (
                <Link key={c} to={`/listings?city=${c}&category=property_sell`}
                  style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#818cf8'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}>
                  Property in {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Post Free Ad', p: '/post-ad' },
                { l: 'User Login', p: '/login' },
                { l: 'Vendor Login', p: '/vendor/login' },
                { l: 'Admin Login', p: '/admin/login' },
                { l: 'My Wishlist', p: '/wishlist' },
                { l: 'Messages', p: '/chat' },
                { l: 'My Listings', p: '/my-listings' },
                { l: 'About Us', p: '/' },
                { l: 'Contact Us', p: '/' },
                { l: 'Privacy Policy', p: '/' },
              ].map(item => (
                <Link key={item.l} to={item.p}
                  style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#818cf8'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}>
                  {item.l}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#475569' }}>
            © {new Date().getFullYear()} INFRAALL.com™ — All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Sitemap'].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}



