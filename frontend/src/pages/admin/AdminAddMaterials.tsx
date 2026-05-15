import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, ArrowLeft, Package } from 'lucide-react';
import api from '../../api';

export default function AdminAddMaterials() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/admin/vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'per_unit',
    category: 'materials',
    subCategory: '',
    
    // Location
    location: '',
    city: '',
    state: '',
    pincode: '',
    
    // Materials specific
    brand: '',
    model: '',
    condition: 'new',
    warranty: '',
    quantity: '',
    unit: '',
    year: '',
    grade: '',
    specifications: '',
    thickness: '',
    size: '',
    
    // Vendor assignment
    vendorId: '',
    
    isFeatured: false,
    isVerified: true
  });

  const materialTypes = [
    'Cement', 'Steel', 'Bricks', 'Sand', 'Tiles', 'Paint', 
    'Wood', 'Plumbing', 'Electrical', 'Roofing', 'Flooring', 
    'Insulation', 'Hardware', 'Glass', 'Marble', 'Granite', 'Other'
  ];
  
  const unitOptions = [
    'pieces', 'kg', 'bags', 'tons', 'cubic feet', 'cubic meter', 
    'square feet', 'square meter', 'liters', 'gallons', 'meters', 'feet'
  ];

  const gradeOptions = [
    'Premium', 'Standard', 'Economy', 'Grade A', 'Grade B', 'Grade C'
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
      
      // Add vendorId if selected
      if (form.vendorId) {
        fd.append('vendorId', form.vendorId);
      }
      
      // Append images
      images.forEach(img => fd.append('images', img));
      
      await api.post('/admin/listings', fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Material listing created successfully!');
      navigate('/admin/listings');
    } catch (err: any) {
      console.error('Error creating material listing:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create material listing');
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
            background: 'rgba(236,72,153,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={24} color="#ec4899" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', margin: 0 }}>
            Add Construction Material
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          Create a new construction material listing with detailed specifications
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa', marginBottom: 20 }}>
          
          {/* Basic Information */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Material Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Material Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Premium Quality Cement Bags"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Material Type *</label>
              <select
                value={form.subCategory}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select material type</option>
                {materialTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Price per Unit *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price per unit"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Pricing Type</label>
              <select
                value={form.priceType}
                onChange={(e) => setForm({ ...form, priceType: e.target.value })}
                style={inputStyle}
              >
                <option value="per_unit">Per Unit</option>
                <option value="per_kg">Per KG</option>
                <option value="per_sqft">Per Sq Ft</option>
                <option value="fixed">Fixed Price</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Material Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the construction material..."
              rows={4}
              required
              style={inputStyle}
            />
          </div>

          {/* Vendor Assignment */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Assign Vendor (Optional)</label>
            <select
              value={form.vendorId}
              onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
              style={inputStyle}
            >
              <option value="">No vendor assigned</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.businessName} ({vendor.vendorType.replace('_', ' ')}) - {vendor.city}
                </option>
              ))}
            </select>
          </div>

          {/* Material Specifications */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Material Specifications</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Brand/Manufacturer</label>
              <input 
                value={form.brand} 
                onChange={(e) => setForm({ ...form, brand: e.target.value })} 
                placeholder="Brand name" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Model/Series</label>
              <input 
                value={form.model} 
                onChange={(e) => setForm({ ...form, model: e.target.value })} 
                placeholder="Model or series" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Grade/Quality</label>
              <select 
                value={form.grade} 
                onChange={(e) => setForm({ ...form, grade: e.target.value })} 
                style={inputStyle}
              >
                <option value="">Select grade</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Quantity Available *</label>
              <input 
                type="number" 
                value={form.quantity} 
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                placeholder="Available quantity" 
                required
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Unit of Measurement *</label>
              <select 
                value={form.unit} 
                onChange={(e) => setForm({ ...form, unit: e.target.value })} 
                required
                style={inputStyle}
              >
                <option value="">Select unit</option>
                {unitOptions.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Size/Dimensions</label>
              <input 
                value={form.size} 
                onChange={(e) => setForm({ ...form, size: e.target.value })} 
                placeholder="e.g., 10x10 inches" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Thickness</label>
              <input 
                value={form.thickness} 
                onChange={(e) => setForm({ ...form, thickness: e.target.value })} 
                placeholder="e.g., 12mm" 
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
              <label style={labelStyle}>Warranty Period</label>
              <input 
                value={form.warranty} 
                onChange={(e) => setForm({ ...form, warranty: e.target.value })} 
                placeholder="e.g., 5 years" 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Technical Specifications */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Technical Specifications</label>
            <textarea
              value={form.specifications}
              onChange={(e) => setForm({ ...form, specifications: e.target.value })}
              placeholder="Technical details, composition, strength, standards compliance..."
              rows={4}
              style={inputStyle}
            />
          </div>

          {/* Location */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Location & Availability</h3>
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
              <label style={labelStyle}>Location/Warehouse</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Warehouse/Store location"
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

          {/* Images */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Material Images</h3>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '32px', 
              border: '2px dashed #ec4899', 
              borderRadius: 12, 
              background: '#fff7ed', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <Upload size={32} color="#ec4899" style={{ marginBottom: 12 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#ec4899', marginBottom: 4 }}>Click to upload material images</span>
              <span style={{ fontSize: 12, color: '#92400e' }}>Upload product photos, certificates, test reports</span>
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
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #ec4899, #db2777)',
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
            {loading ? 'Creating Material...' : 'Create Material Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}