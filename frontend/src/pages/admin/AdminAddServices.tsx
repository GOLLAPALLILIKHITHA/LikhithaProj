import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, ArrowLeft, Wrench, Phone, Mail, MessageCircle } from 'lucide-react';
import api from '../../api';

export default function AdminAddServices() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [servicePackage, setServicePackage] = useState('');
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
    priceType: 'hourly',
    category: 'services',
    subCategory: '',
    
    // Location
    location: '',
    city: '',
    state: '',
    pincode: '',
    
    // Services specific
    serviceType: '',
    experience: '',
    availability: '',
    serviceArea: '',
    certifications: '',
    languages: '',
    minPrice: '',
    maxPrice: '',
    
    // Contact Details
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    whatsappNumber: '',
    businessName: '',
    businessAddress: '',
    
    // Vendor assignment
    vendorId: '',
    
    isFeatured: false,
    isVerified: true
  });

  const serviceTypes = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 
    'Moving', 'Renovation', 'Interior Design', 'Landscaping', 
    'AC Repair', 'Appliance Repair', 'Pest Control', 'Security Services', 'Other'
  ];
  
  const packageTypes = ['Monthly', 'Weekly', 'Yearly'];
  
  const availabilityOptions = [
    '24/7 Available', 'Mon-Fri (9AM-6PM)', 'Mon-Sat (9AM-6PM)', 
    'Weekends Only', 'Emergency Services', 'By Appointment'
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
      
      // Add service package
      if (servicePackage) {
        fd.append('servicePackage', servicePackage);
      }
      
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
      
      alert('Service listing created successfully!');
      navigate('/admin/listings');
    } catch (err: any) {
      console.error('Error creating service listing:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create service listing');
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
            background: 'rgba(99,102,241,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wrench size={24} color="#6366f1" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', margin: 0 }}>
            Add Service Listing
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          Create a new service listing with provider contact details
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa', marginBottom: 20 }}>
          
          {/* Basic Information */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Service Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Service Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Professional Plumbing Services"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Service Type *</label>
              <select
                value={form.subCategory}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select service type</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Base Price *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Starting price"
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
                <option value="hourly">Per Hour</option>
                <option value="fixed">Fixed Price</option>
                <option value="project_based">Project Based</option>
                <option value="per_sqft">Per Sq Ft</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Minimum Price</label>
              <input
                type="number"
                value={form.minPrice}
                onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                placeholder="Minimum charge"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Maximum Price</label>
              <input
                type="number"
                value={form.maxPrice}
                onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                placeholder="Maximum charge"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Service Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of services offered..."
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

          {/* Service Package */}
          <div style={{ marginBottom: 24, background: '#dbeafe', padding: 20, borderRadius: 12, border: '2px solid #3b82f6' }}>
            <label style={{ ...labelStyle, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              📦 Service Package Type *
            </label>
            <p style={{ fontSize: 12, color: '#1e40af', marginBottom: 12 }}>
              Select the service package duration
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {packageTypes.map(pkg => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => setServicePackage(pkg)}
                  style={{
                    background: servicePackage === pkg ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#ffffff',
                    border: '2px solid ' + (servicePackage === pkg ? '#3b82f6' : '#e2e8f0'),
                    borderRadius: 12,
                    padding: '16px 20px',
                    color: servicePackage === pkg ? '#fff' : '#374151',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  {servicePackage === pkg ? '✓ ' : ''}{pkg}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Phone size={18} color="#6366f1" />
            Contact Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Contact Person Name *</label>
              <input
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                placeholder="Service provider name"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Business Name</label>
              <input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="Business/Company name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Contact Phone *</label>
              <input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="Primary phone number"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp Number</label>
              <input
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="WhatsApp number"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="Contact email"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Business Address */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Business Address</label>
            <textarea
              value={form.businessAddress}
              onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
              placeholder="Complete business address..."
              rows={3}
              style={inputStyle}
            />
          </div>

          {/* Service Area & Availability */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Service Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Experience</label>
              <input
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="e.g., 5+ years"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Languages Spoken</label>
              <input
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                placeholder="e.g., English, Hindi, Tamil"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Service Areas</label>
              <input
                value={form.serviceArea}
                onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                placeholder="Areas you serve"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Availability</label>
              <select
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select availability</option>
                {availabilityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Certifications */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Certifications & Qualifications</label>
            <textarea
              value={form.certifications}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
              placeholder="List your certifications, licenses, and qualifications..."
              rows={3}
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
                placeholder="Primary service location"
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
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Service Images</h3>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '32px', 
              border: '2px dashed #6366f1', 
              borderRadius: 12, 
              background: '#fff7ed', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <Upload size={32} color="#6366f1" style={{ marginBottom: 12 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>Click to upload service images</span>
              <span style={{ fontSize: 12, color: '#92400e' }}>Upload work samples, certificates, team photos</span>
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
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
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
            {loading ? 'Creating Service...' : 'Create Service Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}