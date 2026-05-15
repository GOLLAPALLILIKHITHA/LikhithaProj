import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad', 'Rajampeta'];

const materialItems = [
  { name: 'Cement', image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=200&fit=crop', desc: 'All cement brands' },
  { name: 'Tiles', image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=200&h=200&fit=crop', desc: 'Floor & wall tiles' },
  { name: 'Paint', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&h=200&fit=crop', desc: 'Interior & exterior' },
  { name: 'Waterproofing', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=200&fit=crop', desc: 'Waterproof materials' },
  { name: 'Plywood', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=200&h=200&fit=crop', desc: 'MDF & HDHMR' },
  { name: 'Plumbing', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=200&h=200&fit=crop', desc: 'Pipes & fittings' },
  { name: 'Electrical', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=200&h=200&fit=crop', desc: 'Wires & switches' },
  { name: 'Hardware', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&h=200&fit=crop', desc: 'Locks & handles' },
  { name: 'Steel & Iron', image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=200&h=200&fit=crop', desc: 'TMT bars & rods' },
  { name: 'Bricks', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', desc: 'Red & fly ash bricks' },
  { name: 'Sand & Gravel', image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop', desc: 'Construction sand' },
  { name: 'Other', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=200&h=200&fit=crop', desc: 'Other materials' }
];

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px'
};

export default function MaterialsPage() {
  const [city, setCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Cement');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!city) { alert('Please select a city'); return; }
    const params = new URLSearchParams();
    params.set('category', 'materials');
    params.set('city', city);
    if (selectedCategory) params.set('subCategory', selectedCategory);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.08)', padding: '36px 40px', border: '1px solid #f1f5f9' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', marginBottom: 6, letterSpacing: '-0.5px' }}>
              Building Materials
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Quality construction materials for every project</p>
          </div>

          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 24 }} />

          {/* City row */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>City *</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#1f2937', background: '#f8fafc', cursor: 'pointer', outline: 'none' }}>
              <option value="">Select City</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 20 }} />

          {/* Material grid */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Select Material Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {materialItems.map(item => (
                <div key={item.name} onClick={() => setSelectedCategory(item.name)}
                  style={{
                    cursor: 'pointer', padding: '12px', textAlign: 'center', borderRadius: 12,
                    background: selectedCategory === item.name ? '#eff6ff' : '#f8fafc',
                    border: selectedCategory === item.name ? '2px solid #3b82f6' : '1.5px solid #e2e8f0',
                    transition: 'all 0.2s',
                    boxShadow: selectedCategory === item.name ? '0 4px 12px rgba(59,130,246,0.15)' : 'none'
                  }}>
                  <div style={{ width: '100%', height: 80, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selectedCategory === item.name ? '#1d4ed8' : '#1e293b', marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search button */}
          <button onClick={handleSearch}
            style={{ width: '100%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 16px rgba(220,38,38,0.3)' }}>
            <Search size={18} />
            Search Materials
          </button>

        </div>
      </div>
    </div>
  );
}
