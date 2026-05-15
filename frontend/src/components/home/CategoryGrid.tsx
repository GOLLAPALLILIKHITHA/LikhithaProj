import { useNavigate } from 'react-router-dom';

const categories = [
  { emoji: '🏢', label: 'Property Selling', sub: 'Apartments • Villas • Plots • Offices', value: 'property_sell', grad: 'linear-gradient(135deg,#f97316,#ea580c)', shadow: 'rgba(249,115,22,0.35)' },
  { emoji: '🔑', label: 'Property Rentals', sub: 'Houses • PG • Hostels • Commercial', value: 'property_rent', grad: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', shadow: 'rgba(59,130,246,0.35)' },
  { emoji: '🛋️', label: 'Home Furniture', sub: 'Living • Bedroom • Kitchen • Office', value: 'furniture', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)', shadow: 'rgba(79,172,254,0.35)' },
  { emoji: '🔧', label: 'Home Services', sub: 'Plumbing • Painting • Cleaning', value: 'services', grad: 'linear-gradient(135deg,#43e97b,#38f9d7)', shadow: 'rgba(67,233,123,0.35)' },
  { emoji: '🧱', label: 'Building Materials', sub: 'Cement • Steel • Tiles • Paints', value: 'materials', grad: 'linear-gradient(135deg,#fa709a,#fee140)', shadow: 'rgba(250,112,154,0.35)' },
];

export default function CategoryGrid() {
  const navigate = useNavigate();
  return (
    <section style={{ background: '#f8f9fa', padding: '48px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Browse by Category</h2>
          <p style={{ fontSize: 15, color: '#64748b' }}>Everything you need for your home — all in one place</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, maxWidth: 1120 }}>
          {categories.map(cat => (
            <button key={cat.value} onClick={() => navigate(`/listings?category=${cat.value}`)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px', borderRadius: 16, border: 'none', background: '#fff', cursor: 'pointer', transition: 'all 0.2s', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 32px ${cat.shadow}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: cat.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: `0 8px 20px ${cat.shadow}` }}>
                {cat.emoji}
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>{cat.label}</span>
              <span style={{ fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>{cat.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

