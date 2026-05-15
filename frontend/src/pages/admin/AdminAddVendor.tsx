import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Package, Wrench } from 'lucide-react';
import api from '../../api';

export default function AdminAddVendor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    businessName: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    whatsappNumber: '',
    businessAddress: '',
    vendorType: 'building_materials' as 'building_materials' | 'home_services',
    categories: [] as string[],
    description: '',
    experience: '',
    serviceArea: '',
    city: '',
    locality: '',
    state: '',
    pincode: '',
    minPrice: '',
    maxPrice: '',
    priceType: 'project_based',
    certifications: '',
    languages: '',
    availability: '',
    portalLoginEmail: '',
    isVerified: false,
    isFeatured: false
  });

  // Category options based on vendor type
  const buildingMaterialCategories = [
    'Cement', 'Steel', 'Bricks', 'Sand', 'Tiles', 'Paint', 'Wood', 'Glass',
    'Electrical Materials', 'Plumbing Materials', 'Hardware', 'Roofing Materials'
  ];

  const homeServiceCategories = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Pest Control',
    'AC Repair', 'Appliance Repair', 'Interior Design', 'Landscaping', 'Security Services'
  ];

  const priceTypes = [
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'project_based', label: 'Project Based' },
    { value: 'per_unit', label: 'Per Unit' },
    { value: 'per_kg', label: 'Per Kg' },
    { value: 'per_sqft', label: 'Per Sq Ft' },
    { value: 'fixed', label: 'Fixed Price' }
  ];

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleDocuments = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(prev => [...prev, ...files]);
    setDocumentPreviews(prev => [...prev, ...files.map(f => f.name)]);
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const removeDocument = (i: number) => {
    setDocuments(prev => prev.filter((_, idx) => idx !== i));
    setDocumentPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggleCategory = (category: string) => {
    setForm({
      ...form,
      categories: form.categories.includes(category)
        ? form.categories.filter(c => c !== category)
        : [...form.categories, category]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.businessName || !form.contactPerson || !form.contactPhone || !form.contactEmail) {
      alert('Please fill in all required fields');
      return;
    }

    if (!form.city || !form.locality) {
      alert('City and Locality are required for vendor registration');
      return;
    }

    if (form.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      
      // Append all form fields
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (key === 'categories') {
            fd.append(key, JSON.stringify(value));
          } else {
            fd.append(key, value.toString());
          }
        }
      });
      
      // Append images
      images.forEach(img => fd.append('images', img));
      
      // Append documents
      documents.forEach(doc => fd.append('documents', doc));
      
      const { data } = await api.post('/admin/vendors', fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert(data.portalMessage || 'Vendor created successfully!');
      navigate('/admin/vendors');
    } catch (err: any) {
      console.error('Error creating vendor:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create vendor');
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

  const currentCategories = form.vendorType === 'building_materials' 
    ? buildingMaterialCategories 
    : homeServiceCategories;

  return (
    <div style={{ padding: '32px', background: '#fff7ed', minHeight: '100vh' }}>
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate('/admin/vendors')}
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
          <ArrowLeft size={16} /> Back to Vendors
        </button>
        
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>
          Add New Vendor
        </h1>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          Vendor signs in with an email only—no password for you to enter. New vendors get a link to choose their own password.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Left Column */}
          <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #fed7aa', height: 'fit-content' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#7c2d12', marginBottom: 20 }}>
              Basic Information
            </h3>

            {/* Vendor Type Selection */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Vendor Type *</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, vendorType: 'building_materials', categories: [] })}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: `2px solid ${form.vendorType === 'building_materials' ? '#ec4899' : '#fed7aa'}`,
                    borderRadius: 12,
                    background: form.vendorType === 'building_materials' ? 'rgba(236,72,153,0.1)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Package size={24} color={form.vendorType === 'building_materials' ? '#ec4899' : '#92400e'} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#7c2d12' }}>
                    Building Materials
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setForm({ ...form, vendorType: 'home_services', categories: [] })}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: `2px solid ${form.vendorType === 'home_services' ? '#6366f1' : '#fed7aa'}`,
                    borderRadius: 12,
                    background: form.vendorType === 'home_services' ? 'rgba(99,102,241,0.1)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Wrench size={24} color={form.vendorType === 'home_services' ? '#6366f1' : '#92400e'} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#7c2d12' }}>
                    Home Services
                  </span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Business Name *</label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Contact Person *</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Contact Phone *</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp Number</label>
                <input
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Contact Email *</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                style={inputStyle}
                required
              />
              <p style={{ fontSize: 12, color: '#92400e', marginTop: 6, marginBottom: 0 }}>
                Used on listings and customer messages. If you leave Portal login email empty, this same address is used to sign in to the vendor portal.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Portal login email (optional)</label>
              <input
                type="email"
                value={form.portalLoginEmail}
                onChange={(e) => setForm({ ...form, portalLoginEmail: e.target.value })}
                style={inputStyle}
                placeholder="Leave blank to use Contact Email above"
              />
              <p style={{ fontSize: 12, color: '#92400e', marginTop: 6, marginBottom: 0 }}>
                Only fill this if the vendor should log in with a different email than the contact email.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Business Address</label>
              <textarea
                value={form.businessAddress}
                onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Locality *</label>
                <input
                  type="text"
                  value={form.locality}
                  onChange={(e) => setForm({ ...form, locality: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g., Andheri West, Koramangala"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Service Area</label>
                <input
                  type="text"
                  value={form.serviceArea}
                  onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g., Mumbai, Pune, Nearby areas"
                />
              </div>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Categories *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                {currentCategories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    style={{
                      padding: '8px 12px',
                      border: `1px solid ${form.categories.includes(category) ? '#f97316' : '#fed7aa'}`,
                      borderRadius: 6,
                      background: form.categories.includes(category) ? '#fff7ed' : 'white',
                      color: form.categories.includes(category) ? '#f97316' : '#92400e',
                      fontSize: 12,
                      fontWeight: form.categories.includes(category) ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Business Details */}
            <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #fed7aa' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#7c2d12', marginBottom: 20 }}>
                Business Details
              </h3>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  rows={4}
                  placeholder="Describe your business and services..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Experience</label>
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Service Area</label>
                  <input
                    type="text"
                    value={form.serviceArea}
                    onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g., Mumbai, Pune"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Price Type</label>
                <select
                  value={form.priceType}
                  onChange={(e) => setForm({ ...form, priceType: e.target.value })}
                  style={inputStyle}
                >
                  {priceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Min Price (₹)</label>
                  <input
                    type="number"
                    value={form.minPrice}
                    onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max Price (₹)</label>
                  <input
                    type="number"
                    value={form.maxPrice}
                    onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Languages</label>
                  <input
                    type="text"
                    value={form.languages}
                    onChange={(e) => setForm({ ...form, languages: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g., Hindi, English, Marathi"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Availability</label>
                  <input
                    type="text"
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g., Mon-Sat 9AM-6PM"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Certifications</label>
                <textarea
                  value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                  rows={2}
                  placeholder="List any certifications or licenses..."
                />
              </div>
            </div>

            {/* Media Upload */}
            <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #fed7aa' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#7c2d12', marginBottom: 20 }}>
                Media & Documents
              </h3>

              {/* Images */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Business Images</label>
                <div style={{ border: '2px dashed #fed7aa', borderRadius: 8, padding: 20, textAlign: 'center', marginBottom: 12 }}>
                  <Upload size={24} color="#92400e" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 14, color: '#92400e', marginBottom: 8 }}>
                    Click to upload business images
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImages}
                    style={{ display: 'none' }}
                    id="images"
                  />
                  <label htmlFor="images" style={{ cursor: 'pointer', color: '#f97316', fontSize: 14, fontWeight: 600 }}>
                    Choose Images
                  </label>
                </div>
                {previews.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                    {previews.map((preview, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={preview} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{ position: 'absolute', top: 4, right: 4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Business Documents</label>
                <div style={{ border: '2px dashed #fed7aa', borderRadius: 8, padding: 20, textAlign: 'center', marginBottom: 12 }}>
                  <Upload size={24} color="#92400e" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 14, color: '#92400e', marginBottom: 8 }}>
                    Upload licenses, certifications, etc.
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleDocuments}
                    style={{ display: 'none' }}
                    id="documents"
                  />
                  <label htmlFor="documents" style={{ cursor: 'pointer', color: '#f97316', fontSize: 14, fontWeight: 600 }}>
                    Choose Documents
                  </label>
                </div>
                {documentPreviews.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {documentPreviews.map((name, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fff7ed', borderRadius: 6, fontSize: 12 }}>
                        <span style={{ color: '#7c2d12' }}>{name}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(i)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Options */}
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#7c2d12' }}>
                  <input
                    type="checkbox"
                    checked={form.isVerified}
                    onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                  />
                  Verified Vendor
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#7c2d12' }}>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  Featured Vendor
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <button
            type="button"
            onClick={() => navigate('/admin/vendors')}
            style={{
              padding: '12px 24px',
              border: '1px solid #fed7aa',
              borderRadius: 8,
              background: 'white',
              color: '#92400e',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 8,
              background: loading ? '#fed7aa' : '#f97316',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Save size={16} />
            {loading ? 'Creating...' : 'Create Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
}