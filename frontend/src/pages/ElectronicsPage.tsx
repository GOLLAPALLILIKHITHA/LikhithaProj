import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad', 'Rajampeta'];
const electronicsCategories = ['TV', 'Refrigerator', 'Washing Machine', 'AC', 'Microwave', 'Laptop', 'Mobile', 'Other'];

export default function ElectronicsPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('category', 'electronics');
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (selectedCategory) params.set('subCategory', selectedCategory);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            color: '#92400e', 
            background: 'none', 
            border: 'none', 
            fontSize: 14, 
            fontWeight: 500, 
            cursor: 'pointer', 
            marginBottom: 24 
          }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        {/* Main Search Card */}
        <div style={{ 
          background: '#ffffff', 
          borderRadius: 20, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)', 
          padding: '40px', 
          border: '1px solid #f1f5f9'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              color: '#1e293b', 
              marginBottom: 8,
              letterSpacing: '-0.5px'
            }}>
              Electronics & Appliances
            </h1>
            <p style={{ 
              fontSize: 16, 
              color: '#64748b', 
              marginBottom: 0 
            }}>
              Find the best deals on electronics
            </p>
          </div>

          {/* Search Form */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'end' }}>
              <div style={{ minWidth: 180 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: '#475569', 
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  City
                </label>
                <select
                  value={cities.includes(city) ? city : ''}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#1f2937',
                    background: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                    marginBottom: 8
                  }}
                >
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Or type city name"
                  value={cities.includes(city) ? '' : city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 15,
                    color: '#1f2937',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: '#475569', 
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search electronics, brands, or models"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 15,
                    color: '#1f2937',
                    outline: 'none'
                  }}
                />
              </div>
              
              <button
                onClick={handleSearch}
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '16px 40px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)'
                }}
              >
                <Search size={20} />
                Search
              </button>
            </div>
          </div>

          {/* Electronics Categories */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 13, 
              fontWeight: 600, 
              color: '#475569', 
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Electronics Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {electronicsCategories.map(category => (
                <label key={category} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  cursor: 'pointer',
                  padding: '16px 20px',
                  background: selectedCategory === category ? '#f0f9ff' : '#f8fafc',
                  borderRadius: 12,
                  border: selectedCategory === category ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="electronicsCategory"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ width: 18, height: 18, accentColor: '#3b82f6' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            paddingTop: 24,
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                Want to sell electronics?
              </p>
              <button 
                onClick={() => navigate('/post-ad')}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Post Free Electronics Ad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
