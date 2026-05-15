import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, ArrowLeft, Sofa } from 'lucide-react';
import api from '../../api';

export default function AdminAddFurniture() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'fixed',
    category: 'furniture',
    subCategory: '',
    
    // Location
    location: '',
    city: '',
    state: '',
    pincode: '',
    
    // Furniture specific
    brand: '',
    model: '',
    condition: 'new',
    warranty: '',
    quantity: '1',
    unit: 'pieces',
    year: '',
    material: '',
    color: '',
    dimensions: '',
    weight: '',
    
    isFeatured: false,
    isVerified: true
  });

  const furnitureTypes = [
    'Sofa', 'Bed', 'Table', 'Chair', 'Wardrobe', 'Cabinet', 
    'Desk', 'Bookshelf', 'Dining Set', 'Coffee Table', 
    'TV Unit', 'Dresser', 'Nightstand', 'Other'
  ];
  
  const conditionOptions = [
    { value: 'new', label: 'Brand New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good Condition' },
    { value: 'fair', label: 'Fair Condition' },
    { value: 'needs_repair', label: 'Needs Repair' }
  ];

  const materialOptions = [
    'Wood', 'Metal', 'Plastic', 'Glass', 'Leather', 
    'Fabric', 'Rattan', 'Bamboo', 'Marble', 'Other'
  ];

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      
      // Append all form fields
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          fd.append(key, value.toString());
        }
      });
      
      // Add userId (required by backend)
      fd.append('userId', '1');
      
      // Append images
      images.forEach(img => fd.append('images', img));
      
      await api.post('/admin/listings', fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Furniture listing created successfully!');
      navigate('/admin/listings');
    } catch (err: any) {
      console.error('Error creating furniture listing:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create furniture listing');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: 8,
    padding: '12px',
    color: '#7c2d12',
    fontSize: 14
  };

  const labelStyle = {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 6,
    display: 'block' as const,
    fontWeight: 600
  };

  return (
    <div style={{ padding: '32px', background: '#fff7ed', minHeight: '100vh' }}>
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate('/admin/listings/add')}
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
          <ArrowLeft size={16} /> Back to Categories
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(245,158,11,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sofa size={24} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', margin: 0 }}>
            Add Furniture Listing
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          Create a new furniture listing with detailed specifications
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa', marginBottom: 20 }}>
          
          {/* Basic Information */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Basic Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Furniture Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Modern L-Shape Sofa Set"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Furniture Type *</label>
              <select
                value={form.subCategory}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select furniture type</option>
                {furnitureTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Price *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Enter price"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Price Type</label>
              <select
                value={form.priceType}
                onChange={(e) => setForm({ ...form, priceType: e.target.value })}
                style={inputStyle}
              >
                <option value="fixed">Fixed Price</option>
                <option value="negotiable">Negotiable</option>
                <option value="per_unit">Per Unit</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the furniture item..."
              rows={4}
              required
              style={inputStyle}
            />
          </div>

          {/* Location */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Location Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>City *</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>State</label>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="State"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Location/Area</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Locality/Area"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Pincode</label>
              <input
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                placeholder="Pincode"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Furniture Specifications */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Furniture Specifications</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Brand</label>
              <input 
                value={form.brand} 
                onChange={(e) => setForm({ ...form, brand: e.target.value })} 
                placeholder="Brand name" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Model</label>
              <input 
                value={form.model} 
                onChange={(e) => setForm({ ...form, model: e.target.value })} 
                placeholder="Model/Series" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Condition *</label>
              <select 
                value={form.condition} 
                onChange={(e) => setForm({ ...form, condition: e.target.value })} 
                style={inputStyle}
              >
                {conditionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Material</label>
              <select 
                value={form.material} 
                onChange={(e) => setForm({ ...form, material: e.target.value })} 
                style={inputStyle}
              >
                <option value="">Select material</option>
                {materialOptions.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <input 
                value={form.color} 
                onChange={(e) => setForm({ ...form, color: e.target.value })} 
                placeholder="Primary color" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Quantity</label>
              <input 
                type="number" 
                value={form.quantity} 
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                placeholder="Quantity available" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Dimensions (L×W×H)</label>
              <input 
                value={form.dimensions} 
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })} 
                placeholder="e.g., 180×90×75 cm" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Weight</label>
              <input 
                value={form.weight} 
                onChange={(e) => setForm({ ...form, weight: e.target.value })} 
                placeholder="e.g., 25 kg" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Manufacturing Year</label>
              <input 
                value={form.year} 
                onChange={(e) => setForm({ ...form, year: e.target.value })} 
                placeholder="Year of manufacture" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Warranty</label>
              <input 
                value={form.warranty} 
                onChange={(e) => setForm({ ...form, warranty: e.target.value })} 
                placeholder="e.g., 2 years" 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Images */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Furniture Images</h3>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '32px', 
              border: '2px dashed #f59e0b', 
              borderRadius: 12, 
              background: '#fff7ed', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <Upload size={32} color="#f59e0b" style={{ marginBottom: 12 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>Click to upload furniture images</span>
              <span style={{ fontSize: 12, color: '#92400e' }}>Upload multiple angles and close-up shots</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
              {previews.map((preview, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={preview} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Featured & Verified Options */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>Mark as Featured</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.isVerified}
                onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>Mark as Verified</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 32px',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Save size={20} />
            {loading ? 'Creating Furniture...' : 'Create Furniture Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}