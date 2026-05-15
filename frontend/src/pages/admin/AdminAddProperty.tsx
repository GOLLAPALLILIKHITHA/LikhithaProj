import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, ArrowLeft, Home, X } from 'lucide-react';
import api from '../../api';

export default function AdminAddProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);
  const [agreementDocument, setAgreementDocument] = useState<File | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'fixed',
    category: 'property_sell', // Default to sell
    subCategory: '',
    
    // Location
    location: '',
    city: '',
    state: '',
    pincode: '',
    
    // Property specific
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaUnit: 'sqft',
    propertyAge: '',
    facing: '',
    floor: '',
    totalFloors: '',
    parking: '',
    furnishing: '',
    commissionPercentage: '',
    
    // Leisure property feature
    isLeisure: false,
    
    // Owner details
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    businessName: '',
    
    amenities: [] as string[],
    isFeatured: false,
    isVerified: true
  });

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Plot', 'Commercial', 'PG/Hostel'];
  const facingOptions = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
  const furnishingOptions = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
  const areaUnits = ['sqft', 'sqmt', 'acre', 'bigha'];
  
  const commonAmenities = [
    'Parking', 'Lift', 'Security', 'Power Backup', 'Garden', 'Gym', 
    'Swimming Pool', 'Club House', 'Play Area', 'Water Supply', 
    'Internet/Wi-Fi', 'Air Conditioning', 'Balcony', 'Terrace'
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

  const toggleAmenity = (amenity: string) => {
    setForm({
      ...form,
      amenities: form.amenities.includes(amenity)
        ? form.amenities.filter(a => a !== amenity)
        : [...form.amenities, amenity]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate owner details
    if (!form.contactPerson || !form.contactPhone || !form.contactEmail) {
      alert('Please fill in all required owner details');
      return;
    }
    
    if (!agreementDocument) {
      alert('Please upload the owner agreement document');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      
      // Append all form fields
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (key === 'amenities') {
            fd.append(key, JSON.stringify(value));
          } else {
            fd.append(key, value.toString());
          }
        }
      });
      
      // Add time slots for property rentals
      if (form.category === 'property_rent' && timeSlots.length > 0) {
        fd.append('availableTimeSlots', JSON.stringify(timeSlots));
      }
      
      // Add userId (required by backend)
      fd.append('userId', '1');
      
      // Append images
      images.forEach(img => fd.append('images', img));
      
      // Append documents
      documents.forEach(doc => fd.append('documents', doc));
      
      // Append agreement document
      if (agreementDocument) {
        fd.append('agreementDocument', agreementDocument);
      }
      
      await api.post('/admin/listings', fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Property listing created successfully with owner details!');
      navigate('/admin/listings');
    } catch (err: any) {
      console.error('Error creating property listing:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create property listing');
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
            background: 'rgba(16,185,129,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Home size={24} color="#10b981" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', margin: 0 }}>
            Add Property Listing
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          Create a new property listing for sale or rent
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa', marginBottom: 20 }}>
          
          {/* Property Type Selection */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Property Type</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setForm({ ...form, category: 'property_sell', priceType: 'fixed' })}
              style={{
                background: form.category === 'property_sell' ? 'linear-gradient(135deg, #10b981, #059669)' : '#fff7ed',
                border: '2px solid ' + (form.category === 'property_sell' ? '#10b981' : '#fed7aa'),
                borderRadius: 12,
                padding: '16px 20px',
                color: form.category === 'property_sell' ? '#fff' : '#7c2d12',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {form.category === 'property_sell' ? '✓ ' : ''}For Sale
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, category: 'property_rent', priceType: 'per_month' })}
              style={{
                background: form.category === 'property_rent' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#fff7ed',
                border: '2px solid ' + (form.category === 'property_rent' ? '#f59e0b' : '#fed7aa'),
                borderRadius: 12,
                padding: '16px 20px',
                color: form.category === 'property_rent' ? '#fff' : '#7c2d12',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {form.category === 'property_rent' ? '✓ ' : ''}For Rent
            </button>
          </div>

          {/* Basic Information */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Basic Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Property Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., 2BHK Apartment in Prime Location"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Property Type *</label>
              <select
                value={form.subCategory}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select property type</option>
                {propertyTypes.map(type => (
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
                placeholder={form.category === 'property_rent' ? 'Monthly rent' : 'Sale price'}
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
                <option value="fixed">Fixed</option>
                <option value="negotiable">Negotiable</option>
                {form.category === 'property_rent' && <option value="per_month">Per Month</option>}
                {form.category === 'property_sell' && <option value="per_sqft">Per Sq Ft</option>}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the property..."
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
              <label style={labelStyle}>Location/Area *</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Locality/Area/Neighborhood"
                required
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

          {/* Property Details */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Property Specifications</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Bedrooms</label>
              <input 
                type="number" 
                value={form.bedrooms} 
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} 
                placeholder="Number of bedrooms" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Bathrooms</label>
              <input 
                type="number" 
                value={form.bathrooms} 
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} 
                placeholder="Number of bathrooms" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Built-up Area</label>
              <input 
                type="number" 
                value={form.area} 
                onChange={(e) => setForm({ ...form, area: e.target.value })} 
                placeholder="Area" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Area Unit</label>
              <select 
                value={form.areaUnit} 
                onChange={(e) => setForm({ ...form, areaUnit: e.target.value })} 
                style={inputStyle}
              >
                {areaUnits.map(unit => (
                  <option key={unit} value={unit}>{unit.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Property Age</label>
              <input 
                value={form.propertyAge} 
                onChange={(e) => setForm({ ...form, propertyAge: e.target.value })} 
                placeholder="e.g., 5 years, New" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Facing Direction</label>
              <select 
                value={form.facing} 
                onChange={(e) => setForm({ ...form, facing: e.target.value })} 
                style={inputStyle}
              >
                <option value="">Select facing</option>
                {facingOptions.map(facing => (
                  <option key={facing} value={facing}>{facing}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Floor Number</label>
              <input 
                type="number" 
                value={form.floor} 
                onChange={(e) => setForm({ ...form, floor: e.target.value })} 
                placeholder="Floor number" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Total Floors</label>
              <input 
                type="number" 
                value={form.totalFloors} 
                onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} 
                placeholder="Total floors in building" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Parking</label>
              <input 
                value={form.parking} 
                onChange={(e) => setForm({ ...form, parking: e.target.value })} 
                placeholder="e.g., 2 Car, 1 Bike" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Furnishing Status</label>
              <select 
                value={form.furnishing} 
                onChange={(e) => setForm({ ...form, furnishing: e.target.value })} 
                style={inputStyle}
              >
                <option value="">Select furnishing</option>
                {furnishingOptions.map(option => (
                  <option key={option} value={option.toLowerCase()}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Commission (%) *</label>
              <input 
                type="number" 
                value={form.commissionPercentage} 
                onChange={(e) => setForm({ ...form, commissionPercentage: e.target.value })} 
                placeholder="e.g., 2.5" 
                min="0" 
                max="10" 
                step="0.1"
                required
                style={inputStyle} 
              />
            </div>
          </div>
          
          {/* Leisure Property Toggle - Only for Rental Properties */}
          {form.category === 'property_rent' && (
            <div style={{ marginTop: 16, padding: 16, background: '#f0f9ff', borderRadius: 12, border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#0369a1' }}>
                  <input 
                    type="checkbox" 
                    checked={form.isLeisure || false}
                    onChange={e => setForm({ ...form, isLeisure: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#0369a1' }}
                  />
                  🏖️ Leisure Property
                </label>
              </div>
              <p style={{ fontSize: 12, color: '#0369a1', margin: 0, lineHeight: 1.4 }}>
                <strong>Enable this for leisure/vacation properties.</strong> Tenants can lease the entire year upfront with full payment. 
                Perfect for holiday homes, vacation rentals, or seasonal properties.
              </p>
            </div>
          )}

          {/* Commission Info */}
          <div style={{ marginBottom: 24, padding: 16, background: '#f0f9ff', borderRadius: 12, border: '2px solid #bae6fd' }}>
            <p style={{ fontSize: 13, color: '#0369a1', margin: 0 }}>
              💡 <strong>Commission Info:</strong> This is the percentage commission that will be charged on the final sale price. Standard rates are 1-3% for properties.
            </p>
          </div>

          {/* Owner Details Section */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16, marginTop: 32 }}>👤 Owner Details</h3>
          <div style={{ marginBottom: 20, padding: 20, background: '#fef3c7', borderRadius: 12, border: '2px solid #fbbf24' }}>
            <p style={{ fontSize: 13, color: '#92400e', marginBottom: 16 }}>
              Enter the property owner's contact information and business details. This information will be used for all communications and documentation.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Owner Contact Person *</label>
                <input
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  placeholder="Full name of owner/contact person"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Owner Contact Phone *</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="10-digit phone number"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Owner Contact Email *</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="owner@example.com"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Business Name (Optional)</label>
                <input
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Company or business name"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Agreement Document Upload */}
            <div style={{ marginTop: 20 }}>
              <label style={{ ...labelStyle, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                📄 Owner Agreement Document *
              </label>
              <p style={{ fontSize: 12, color: '#92400e', marginBottom: 12 }}>
                Upload the signed agreement document with the property owner (PDF format only)
              </p>
              
              <label style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '24px', 
                border: '2px dashed #f59e0b', 
                borderRadius: 12, 
                background: '#ffffff', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <Upload size={28} color="#f59e0b" style={{ marginBottom: 10 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#d97706', marginBottom: 4 }}>
                  {agreementDocument ? '✓ Document Selected' : 'Click to upload agreement document'}
                </span>
                <span style={{ fontSize: 11, color: '#92400e' }}>
                  {agreementDocument ? agreementDocument.name : 'PDF only, max 10MB'}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== 'application/pdf') {
                        alert('Please upload a PDF file only');
                        e.target.value = '';
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        alert('File size must be less than 10MB');
                        e.target.value = '';
                        return;
                      }
                      setAgreementDocument(file);
                    }
                  }}
                  required
                  style={{ display: 'none' }}
                />
              </label>

              {agreementDocument && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f3f4f6', borderRadius: 8, border: '1px solid #d1d5db' }}>
                  <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>📄 {agreementDocument.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setAgreementDocument(null)}
                    style={{ 
                      background: '#ef4444', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      width: 24, 
                      height: 24, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      marginLeft: 8,
                      fontSize: 16
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Amenities & Features</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 8 }}>
              {commonAmenities.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  style={{
                    background: form.amenities.includes(amenity) ? '#10b981' : '#fff7ed',
                    border: '2px solid ' + (form.amenities.includes(amenity) ? '#10b981' : '#fed7aa'),
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: form.amenities.includes(amenity) ? '#fff' : '#7c2d12',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  {form.amenities.includes(amenity) ? '✓ ' : ''}{amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots for Rent Properties */}
          {form.category === 'property_rent' && (
            <div style={{ marginBottom: 24, background: '#fef3c7', padding: 20, borderRadius: 12, border: '2px solid #fbbf24' }}>
              <label style={{ ...labelStyle, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                🕐 Available Viewing Time Slots
              </label>
              <p style={{ fontSize: 12, color: '#92400e', marginBottom: 12 }}>
                Select the time slots when property is available for viewing
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {['Morning (9 AM - 12 PM)', 'Afternoon (12 PM - 3 PM)', 'Evening (3 PM - 6 PM)', 'Night (6 PM - 9 PM)'].map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      if (timeSlots.includes(slot)) {
                        setTimeSlots(timeSlots.filter(s => s !== slot));
                      } else {
                        setTimeSlots([...timeSlots, slot]);
                      }
                    }}
                    style={{
                      background: timeSlots.includes(slot) ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#ffffff',
                      border: '2px solid ' + (timeSlots.includes(slot) ? '#f59e0b' : '#e2e8f0'),
                      borderRadius: 12,
                      padding: '14px 20px',
                      color: timeSlots.includes(slot) ? '#fff' : '#374151',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    {timeSlots.includes(slot) ? '✓ ' : ''}{slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Property Documents */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>📄 Property Documents (Required)</h3>
          <div style={{ marginBottom: 20, padding: 20, background: '#fffbeb', borderRadius: 12, border: '2px solid #fbbf24' }}>
            <p style={{ fontSize: 13, color: '#92400e', marginBottom: 16 }}>
              Upload all required property documents. These documents are mandatory for property listings.
            </p>
            
            <label style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '32px', 
              border: '2px dashed #fbbf24', 
              borderRadius: 12, 
              background: '#ffffff', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <Upload size={32} color="#f59e0b" style={{ marginBottom: 12 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#d97706', marginBottom: 4 }}>Click to upload property documents</span>
              <span style={{ fontSize: 12, color: '#92400e' }}>PDF, JPG, PNG up to 10MB each</span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleDocuments}
                style={{ display: 'none' }}
              />
            </label>

            {/* Document Previews */}
            {documentPreviews.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Uploaded Documents:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {documentPreviews.map((name, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f3f4f6', borderRadius: 8, border: '1px solid #d1d5db' }}>
                      <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>📄 {name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeDocument(i)}
                        style={{ 
                          background: '#ef4444', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 4, 
                          width: 24, 
                          height: 24, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          marginLeft: 8 
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Documents List */}
            <div style={{ marginTop: 16, padding: 16, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#0369a1', marginBottom: 8 }}>Required Documents:</h4>
              <ul style={{ fontSize: 12, color: '#0c4a6e', margin: 0, paddingLeft: 16 }}>
                <li>Thaluka Papers / Property Documents</li>
                <li>Owner ID Proof (Aadhaar Card, PAN Card)</li>
                <li>Address Proof</li>
                <li>Property Tax Receipt (if available)</li>
                <li>NOC from Society (if applicable)</li>
                <li>Any other relevant property documents</li>
              </ul>
            </div>
          </div>

          {/* Images */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Property Images</h3>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '32px', 
              border: '2px dashed #10b981', 
              borderRadius: 12, 
              background: '#fff7ed', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <Upload size={32} color="#10b981" style={{ marginBottom: 12 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#10b981', marginBottom: 4 }}>Click to upload property images</span>
              <span style={{ fontSize: 12, color: '#92400e' }}>Upload multiple images (JPG, PNG)</span>
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
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
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
            {loading ? 'Creating Property...' : 'Create Property Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}