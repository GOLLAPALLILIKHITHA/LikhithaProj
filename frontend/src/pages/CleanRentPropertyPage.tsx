import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad', 'Rajampeta'];
const bhkTypes = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px'
};

export default function CleanRentPropertyPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [bhkType, setBhkType] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!city) {
      alert('Please select a city');
      return;
    }
    const params = new URLSearchParams();
    params.set('category', 'property_rent');
    params.set('city', city);
    if (search.trim()) params.set('search', search.trim());
    if (bhkType) params.set('bhk', bhkType);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Card */}
        <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.08)', padding: '36px 40px', border: '1px solid #f1f5f9' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', marginBottom: 6, letterSpacing: '-0.5px' }}>
              Property Rentals
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Find your perfect home</p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 24 }} />

          {/* Row: City + Locality side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>City *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#1f2937', background: '#f8fafc', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">Select City</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Locality / Landmark</label>
              <input
                type="text"
                placeholder="e.g. Whitefield, MG Road, Koramangala..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#1f2937', outline: 'none', background: '#f8fafc' }}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 20 }} />

          {/* BHK Type */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>House Type (BHK)</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['All Types', ...bhkTypes].map(type => {
                const val = type === 'All Types' ? '' : type;
                const active = bhkType === val;
                return (
                  <label key={type} style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                    background: active ? '#eff6ff' : '#f8fafc',
                    border: active ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                    color: active ? '#1d4ed8' : '#374151',
                    transition: 'all 0.15s'
                  }}>
                    <input type="radio" name="bhkType" value={val}
                      checked={active} onChange={(e) => setBhkType(e.target.value)}
                      style={{ width: 14, height: 14, accentColor: '#3b82f6' }} />
                    {type}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Search Button */}
          <button onClick={handleSearch}
            style={{
              width: '100%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff',
              border: 'none', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, boxShadow: '0 6px 16px rgba(220,38,38,0.3)'
            }}
          >
            <Search size={18} />
            Search Properties
          </button>

        </div>
      </div>
    </div>
  );
}
