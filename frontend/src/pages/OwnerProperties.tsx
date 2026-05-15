import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Eye, 
  MapPin, 
  DollarSign, 
  Users, 
  ShoppingCart,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import api from '../api';

interface Property {
  id: number;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  price: number;
  priceType: string;
  location: string;
  city: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  status: string;
  views: number;
  createdAt: string;
  stats: {
    totalPurchases: number;
    totalEarnings: number;
    totalRentals: number;
  };
  contactEmail: string;
  ownershipType: string;
}

export default function OwnerProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, [search, statusFilter, categoryFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await api.get(`/owner/properties?${params}`);
      setProperties(response.data.properties);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'sold': return '#3b82f6';
      case 'rented': return '#8b5cf6';
      case 'pending': return '#f59e0b';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'property_sell':
      case 'property_rent':
        return '🏠';
      case 'furniture':
        return '🪑';
      case 'materials':
        return '🧱';
      case 'services':
        return '🔧';
      default:
        return '📦';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate('/owner/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 16
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
            My Properties
          </h1>
          <p style={{ color: '#64748b' }}>
            Manage your property listings and track buyers/tenants
          </p>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, 
          marginBottom: 24,
          padding: 16,
          background: '#f8fafc',
          borderRadius: 12,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: 12, 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} />
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
          >
            <option value="all">All Categories</option>
            <option value="property_sell">Property for Sale</option>
            <option value="property_rent">Property for Rent</option>
            <option value="furniture">Furniture</option>
            <option value="materials">Materials</option>
            <option value="services">Services</option>
          </select>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: '4px solid #f3f4f6', 
              borderTop: '4px solid #f97316', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#6b7280' }}>Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 40,
            background: '#f8fafc',
            borderRadius: 16,
            border: '1px solid #e2e8f0'
          }}>
            <Building size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b', fontSize: 16 }}>No properties found</p>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>
              Properties will appear here when listings are created with your email
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {properties.map((property) => (
              <div key={property.id} style={{
                background: '#ffffff',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}>
                
                {/* Property Image */}
                <div style={{ 
                  height: 200, 
                  background: property.images && property.images.length > 0 
                    ? `url(${property.images[0]}) center/cover` 
                    : 'linear-gradient(135deg, #f97316, #ea580c)',
                  position: 'relative'
                }}>
                  {(!property.images || property.images.length === 0) && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: 48
                    }}>
                      {getCategoryIcon(property.category)}
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '4px 12px',
                    background: getStatusColor(property.status),
                    color: '#fff',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {property.status}
                  </div>

                  {/* Ownership Type Badge */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    padding: '4px 8px',
                    background: property.ownershipType === 'email_match' ? '#059669' : '#3b82f6',
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 600
                  }}>
                    {property.ownershipType === 'email_match' ? 'Email Match' : 'User Match'}
                  </div>
                </div>

                {/* Property Details */}
                <div style={{ padding: 20 }}>
                  <h3 style={{ 
                    fontSize: 18, 
                    fontWeight: 700, 
                    color: '#1e293b', 
                    marginBottom: 8,
                    lineHeight: 1.3
                  }}>
                    {property.title}
                  </h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <MapPin size={14} color="#64748b" />
                    <span style={{ fontSize: 14, color: '#64748b' }}>
                      {property.location}, {property.city}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <DollarSign size={16} color="#f97316" />
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#f97316' }}>
                      {formatCurrency(property.price)}
                      {property.priceType === 'per_month' && '/month'}
                    </span>
                  </div>

                  {/* Property Stats */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 8,
                    marginBottom: 16,
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 8
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#059669' }}>
                        {property.stats.totalPurchases}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Sales</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#3b82f6' }}>
                        {property.stats.totalRentals}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Rentals</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#8b5cf6' }}>
                        {property.views}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Views</div>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div style={{ 
                    padding: 12,
                    background: '#d1fae5',
                    borderRadius: 8,
                    marginBottom: 16,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 14, color: '#065f46', fontWeight: 600 }}>
                      Total Earnings: {formatCurrency(property.stats.totalEarnings)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/owner/property/${property.id}`)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Users size={14} />
                      View Buyers/Tenants
                    </button>
                    
                    <button
                      onClick={() => navigate(`/listing/${property.id}`)}
                      style={{
                        padding: '10px 12px',
                        background: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  {/* Property Info */}
                  <div style={{ 
                    marginTop: 12,
                    fontSize: 12,
                    color: '#94a3b8',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Listed {formatDate(property.createdAt)}</span>
                    <span>{property.category.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}