import { useNavigate } from 'react-router-dom';
import { Home, Sofa, ArrowLeft } from 'lucide-react';

export default function AdminAddListingMenu() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'property',
      title: 'Properties',
      description: 'Houses, Villas, Apartments, Plots, Commercial spaces',
      icon: Home,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.15)',
      route: '/admin/listings/add/property'
    },
    {
      id: 'furniture',
      title: 'Furniture',
      description: 'Sofa, Bed, Table, Chair, Wardrobe, Cabinet',
      icon: Sofa,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.15)',
      route: '/admin/listings/add/furniture'
    }
  ];

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate('/admin/listings')}
          style={{
            background: 'none',
            border: 'none',
            color: '#92400e',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            fontSize: 14
          }}
        >
          <ArrowLeft size={16} /> Back to Listings
        </button>
        
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>
          Choose Listing Category
        </h1>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          Select the type of listing you want to create
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: 20,
        maxWidth: '1200px'
      }}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => navigate(category.route)}
            style={{
              background: '#fff',
              border: '2px solid #fed7aa',
              borderRadius: 16,
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = category.color;
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 25px ${category.bg}`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#fed7aa';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: category.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <category.icon size={28} color={category.color} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: 18, 
                  fontWeight: 700, 
                  color: '#7c2d12', 
                  marginBottom: 4 
                }}>
                  {category.title}
                </h3>
                <p style={{ 
                  fontSize: 13, 
                  color: '#92400e', 
                  lineHeight: 1.4,
                  margin: 0
                }}>
                  {category.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}