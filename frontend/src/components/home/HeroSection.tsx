import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad'];

export default function HeroSection() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Bangalore');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    navigate(`/listings?${params.toString()}`);
  };

  const handlePropertyTypeClick = (type: 'buy' | 'rent' | 'furniture' | 'services' | 'materials') => {
    const routes = { buy: '/buy-property', rent: '/property-rentals', furniture: '/furniture', services: '/services', materials: '/materials' };
    navigate(routes[type]);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

      {/* Full-screen background image */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=90')", backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat', zIndex: 0 }} />

      {/* Dark gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(7,11,20,0.82) 0%, rgba(15,23,42,0.70) 40%, rgba(30,15,5,0.65) 100%)', zIndex: 1 }} />

      {/* Gold shimmer at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(120,53,15,0.35), transparent)', zIndex: 2 }} />

      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(249,115,22,0.06)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(249,115,22,0.05)', zIndex: 2, pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, maxWidth: 900, margin: '0 auto', padding: '80px 24px', width: '100%' }}>

        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <span style={{ background: 'rgba(249,115,22,0.18)', color: '#ffffff', fontSize: 12, fontWeight: 700, padding: '6px 20px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            🇮🇳 India's Most Trusted Marketplace
          </span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 62px)', fontWeight: 900, color: '#ffffff', textAlign: 'center', marginBottom: 16, lineHeight: 1.1, letterSpacing: '-1px', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
          Find Your Dream Home
        </h1>

        <p style={{ fontSize: 'clamp(15px, 2vw, 20px)', color: '#ffffff', textAlign: 'center', marginBottom: 12, fontWeight: 700, letterSpacing: '0.2px' }}>
          Buy · Sell · Rent · Furniture · Services · Materials
        </p>
        <p style={{ fontSize: 15, color: '#ffffff', textAlign: 'center', marginBottom: 44, fontWeight: 600 }}>
          Searching in <span style={{ color: '#fb923c', borderBottom: '1px solid #fb923c' }}>{city}</span>
        </p>

        {/* Category Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'Buy Property',       icon: '🏢', type: 'buy'       as const },
            { label: 'Rent Property',      icon: '🔑', type: 'rent'      as const },
            { label: 'Home Furniture',     icon: '🛋️', type: 'furniture' as const },
            { label: 'Home Services',      icon: '🔧', type: 'services'  as const },
            { label: 'Building Materials', icon: '🧱', type: 'materials' as const },
          ].map((tab) => (
            <button key={tab.type} onClick={() => handlePropertyTypeClick(tab.type)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 10px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.25s', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.border = '1.5px solid #f97316'; el.style.background = 'rgba(249,115,22,0.25)'; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 8px 24px rgba(249,115,22,0.3)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.border = '1.5px solid rgba(255,255,255,0.3)'; el.style.background = 'rgba(255,255,255,0.1)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}>
              <span style={{ fontSize: 28 }}>{tab.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textAlign: 'center', lineHeight: 1.4 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', overflow: 'hidden', border: '1px solid rgba(249,115,22,0.2)' }}>
          <div style={{ padding: '14px 20px', borderRight: '1px solid #e2e8f0', minWidth: 170 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <select value={city} onChange={e => setCity(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 16, fontWeight: 700, color: '#0f172a', background: 'transparent', cursor: 'pointer', width: '100%' }}>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} color="#94a3b8" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '0 20px' }}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search location, project, builder..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#0f172a', background: 'transparent', padding: '18px 0' }} />
          </div>
          <button onClick={handleSearch}
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', padding: '0 44px', height: 60, fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.3px', transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            Search
          </button>
        </div>

        {/* Popular Cities */}
        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          <span style={{ color: '#ffffff', fontSize: 13, fontWeight: 700 }}>Popular:</span>
          {['Navi Mumbai', 'Thane', 'Andheri', 'Baner Pune', 'Whitefield', 'Gachibowli'].map(c => (
            <button key={c} onClick={() => setSearch(c)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#ffffff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.35)', padding: '4px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}>
              <MapPin size={10} color="#fb923c" /> {c}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 48 }}>
          {[
            { value: '10,000+', label: 'Properties Listed' },
            { value: '5,000+',  label: 'Happy Customers' },
            { value: '50+',     label: 'Cities Covered' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fb923c', letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#ffffff', fontWeight: 700, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
