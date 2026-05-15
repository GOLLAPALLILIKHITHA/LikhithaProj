import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad', 'Rajampeta'];

const furnitureItems = [
  { name: 'Sofa', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop', desc: 'Comfortable sofas' },
  { name: 'Dining Table', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200&h=200&fit=crop', desc: 'Dining sets' },
  { name: 'Bed', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&h=200&fit=crop', desc: 'Beds & mattresses' },
  { name: 'Wardrobe', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop', desc: 'Storage solutions' },
  { name: 'Chair', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&h=200&fit=crop', desc: 'Chairs & seating' },
  { name: 'TV', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop', desc: 'Televisions' },
  { name: 'Refrigerator', image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=200&h=200&fit=crop', desc: 'Fridges' },
  { name: 'Washing Machine', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=200&h=200&fit=crop', desc: 'Washers' },
  { name: 'AC', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop', desc: 'Air conditioners' },
  { name: 'Cooler', image: 'https://images.unsplash.com/photo-1597075933405-c0f07d3f4845?w=200&h=200&fit=crop', desc: 'Air coolers' },
  { name: 'Microwave', image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=200&h=200&fit=crop', desc: 'Kitchen appliances' },
  { name: 'Other', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200&h=200&fit=crop', desc: 'Other items' }
];

export default function FurniturePage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Sofa');
  const [hasActiveRental, setHasActiveRental] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const checkRental = async () => {
      if (!user) { setChecking(false); return; }
      try {
        const { data } = await api.get('/property-rentals/my-rentals');
        const active = data.some((r: any) => r.status === 'active');
        setHasActiveRental(active);
      } catch {
        setHasActiveRental(false);
      } finally {
        setChecking(false);
      }
    };
    checkRental();
  }, [user]);

  const handleSearch = () => {
    if (!city) { alert('Please select a city'); return; }
    const params = new URLSearchParams();
    params.set('category', 'furniture');
    params.set('city', city);
    if (search) params.set('search', search);
    if (selectedCategory) params.set('subCategory', selectedCategory);
    navigate(`/listings?${params.toString()}`);
  };

  // Access gate
  if (checking) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: '#64748b' }}>Checking access...</div>
      </div>
    );
  }

  if (!user || !hasActiveRental) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.1)', padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock size={32} color="#d97706" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
            Exclusive for Our Tenants
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, marginBottom: 8 }}>
            Furniture Rental is available only for users who have an <strong>active property rental</strong> with us.
          </p>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>
            Rent a property from us first to unlock furniture & appliance rentals.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => navigate('/property-rentals')}
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.4)' }}>
              Browse Properties for Rent
            </button>
            {!user && (
              <button onClick={() => navigate('/login')}
                style={{ background: 'transparent', color: '#f97316', border: '2px solid #f97316', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Login to your account
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Active rental badge */}
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#065f46' }}>
          ✅ Active Tenant — Furniture Rental Unlocked
        </div>

        <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.08)', padding: '36px 40px', border: '1px solid #f1f5f9' }}>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Furniture Rental</h1>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Rent furniture & appliances for your home</p>
          </div>

          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 24 }} />

          {/* City + Search row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>City *</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#1f2937', background: '#f8fafc', cursor: 'pointer', outline: 'none' }}>
                <option value="">Select City</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Search</label>
              <input type="text" placeholder="Search furniture, brands..." value={search}
                onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1f2937', outline: 'none', background: '#f8fafc' }} />
            </div>
          </div>

          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 20 }} />

          {/* Furniture grid */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Select Furniture / Appliance</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {furnitureItems.map(item => (
                <div key={item.name} onClick={() => setSelectedCategory(item.name)}
                  style={{ cursor: 'pointer', padding: '12px', background: selectedCategory === item.name ? '#eff6ff' : '#f8fafc', borderRadius: 12, border: selectedCategory === item.name ? '2px solid #3b82f6' : '1.5px solid #e2e8f0', transition: 'all 0.2s', textAlign: 'center' }}>
                  <div style={{ width: '100%', height: 80, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search button */}
          <button onClick={handleSearch}
            style={{ width: '100%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 16px rgba(220,38,38,0.3)' }}>
            <Search size={18} /> Search Furniture
          </button>

        </div>
      </div>
    </div>
  );
}
