import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, ArrowLeft } from 'lucide-react';
import api from '../../api';

export default function AdminAddListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [servicePackage, setServicePackage] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'fixed',
    category: '',
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
    
    // Materials/Furniture/Vehicles
    brand: '',
    model: '',
    condition: 'new',
    warranty: '',
    quantity: '',
    unit: '',
    year: '',
    
    // Services
    serviceType: '',
    experience: '',
    availability: '',
    serviceArea: '',
    certifications: '',
    languages: '',
    minPrice: '',
    maxPrice: '',
    
    amenities: [] as string[],
    isFeatured: false,
    isVerified: true
  });

  const categories = [
    { value: 'property_sell', label: 'Property for Sale' },
    { value: 'property_rent', label: 'Property for Rent' },
    { value: 'materials', label: 'Construction Materials' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'services', label: 'Services' }
  ];

  const propertySubCategories = ['Apartment', 'House', 'Villa', 'Plot', 'Commercial', 'PG/Hostel'];
  const materialSubCategories = ['Cement', 'Steel', 'Bricks', 'Sand', 'Tiles', 'Paint', 'Wood', 'Plumbing', 'Electrical', 'Other'];
  const furnitureSubCategories = ['Sofa', 'Bed', 'Table', 'Chair', 'Wardrobe', 'Cabinet', 'Desk', 'Other'];
  const serviceSubCategories = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Moving', 'Renovation', 'Interior Design', 'Landscaping', 'Other'];

  const getSubCategories = () => {
    if (form.category === 'property_sell' || form.category === 'property_rent') return propertySubCategories;
    if (form.category === 'materials') return materialSubCategories;
    if (form.category === 'furniture') return furnitureSubCategories;
    if (form.category === 'services') return serviceSubCategories;
    return [];
  };

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
      
      // Add service package
      if (form.category === 'services' && servicePackage) {
        fd.append('servicePackage', servicePackage);
      }
      
      // Add userId (required by backend - maps to sellerId)
      fd.append('userId', '1');
      
      // Append images
      images.forEach(img => fd.append('images', img));
      
      await api.post('/admin/listings', fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Listing created successfully!');
      navigate('/admin/listings');
    } catch (err: any) {
      console.error('Error creating listing:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setForm({
      ...form,
      amenities: form.amenities.includes(amenity)
        ? form.amenities.filter(a => a !== amenity)
        : [...form.amenities, amenity]
    });
  };

  const commonAmenities = ['Parking', 'Lift', 'Security', 'Power Backup', 'Garden', 'Gym', 'Swimming Pool', 'Club House', 'Play Area', 'Water Supply'];

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
    display: 'block' as const
  };

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
          Add New Listing
        </h1>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          Create a new listing for properties, materials, furniture, or services
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa' }}>
          
          {/* Basic Information */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>Basic Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., 2BHK Apartment, Wooden Chair, Steel Rods..."
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: '' })}
                required
                style={inputStyle}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {form.category && (
              <div>
                <label style={labelStyle}>Sub Category</label>
                <select
                  value={form.subCategory}
                  onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select type</option>
                  {getSubCategories().map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

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
                <option value="fixed">Fixed</option>
                <option value="negotiable">Negotiable</option>
                <option value="per_month">Per Month</option>
                <option value="per_sqft">Per Sq Ft</option>
                <option value="per_unit">Per Unit</option>
                <option value="per_kg">Per KG</option>
                <option value="hourly">Hourly</option>
                <option value="project_based">Project Based</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description..."
              rows={4}
              required
              style={inputStyle}
            />
          </div>

          {/* Location */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16, marginTop: 24 }}>Location</h3>
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

          {/* Property Specific Fields */}
          {(form.category === 'property_sell' || form.category === 'property_rent') && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16, marginTop: 24 }}>Property Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} placeholder="Number of bedrooms" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} placeholder="Number of bathrooms" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Area</label>
                  <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Area" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Area Unit</label>
                  <select value={form.areaUnit} onChange={(e) => setForm({ ...form, areaUnit: e.target.value })} style={inputStyle}>
                    <option value="sqft">Square Feet</option>
                    <option value="sqmt">Square Meter</option>
                    <option value="acre">Acre</option>
                    <option value="bigha">Bigha</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Property Age</label>
                  <input value={form.propertyAge} onChange={(e) => setForm({ ...form, propertyAge: e.target.value })} placeholder="e.g., 5 years" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Facing</label>
                  <select value={form.facing} onChange={(e) => setForm({ ...form, facing: e.target.value })} style={inputStyle}>
                    <option value="">Select</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Floor</label>
                  <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="Floor number" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Total Floors</label>
                  <input type="number" value={form.totalFloors} onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} placeholder="Total floors" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Parking</label>
                  <input value={form.parking} onChange={(e) => setForm({ ...form, parking: e.target.value })} placeholder="e.g., 2 Car" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Furnishing</label>
                  <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })} style={inputStyle}>
                    <option value="">Select</option>
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>

              {/* Amenities */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Amenities</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                  {commonAmenities.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      style={{
                        background: form.amenities.includes(amenity) ? '#10b981' : '#fff7ed',
                        border: '2px solid ' + (form.amenities.includes(amenity) ? '#10b981' : '#fed7aa'),
                        borderRadius: 20,
                        padding: '8px 16px',
                        color: form.amenities.includes(amenity) ? '#fff' : '#7c2d12',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {form.amenities.includes(amenity) ? '✓ ' : ''}{amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots for Rent Properties */}
              {form.category === 'property_rent' && (
                <div style={{ marginBottom: 20, background: '#fef3c7', padding: 20, borderRadius: 12, border: '2px solid #fbbf24' }}>
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
            </>
          )}

          {/* Materials/Furniture Fields */}
          {(form.category === 'materials' || form.category === 'furniture') && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16, marginTop: 24 }}>Product Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand name" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Model</label>
                  <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={inputStyle}>
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="needs_repair">Needs Repair</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="Quantity" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Unit</label>
                  <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g., pieces, kg, bags" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Warranty</label>
                  <input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} placeholder="e.g., 1 year" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Manufacturing year" style={inputStyle} />
                </div>
              </div>
            </>
          )}

          {/* Services Fields */}
          {form.category === 'services' && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16, marginTop: 24 }}>Service Details</h3>
              
              {/* Service Package */}
              <div style={{ marginBottom: 24, background: '#dbeafe', padding: 20, borderRadius: 12, border: '2px solid #3b82f6' }}>
                <label style={{ ...labelStyle, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                  📦 Service Package *
                </label>
                <p style={{ fontSize: 12, color: '#1e40af', marginBottom: 12 }}>
                  Select the service package type
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {['Monthly', 'Weekly', 'Yearly'].map(pkg => (
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Service Type</label>
                  <input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="Type of service" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Experience</label>
                  <input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g., 5 years" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Availability</label>
                  <input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="e.g., Mon-Sat, 9AM-6PM" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Service Area</label>
                  <input value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} placeholder="Areas covered" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Languages</label>
                  <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="e.g., English, Hindi" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Min Price</label>
                  <input type="number" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} placeholder="Minimum price" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Max Price</label>
                  <input type="number" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} placeholder="Maximum price" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Certifications</label>
                <textarea value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="List certifications..." rows={3} style={inputStyle} />
              </div>
            </>
          )}

          {/* Images */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12', marginBottom: 16, marginTop: 24 }}>Images</h3>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '32px', 
              border: '2px dashed #475569', 
              borderRadius: 12, 
              background: '#fff7ed', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <Upload size={32} color="#6366f1" style={{ marginBottom: 12 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>Click to upload images</span>
              <span style={{ fontSize: 12, color: '#92400e' }}>JPG, PNG, WEBP up to 5MB each</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImages} 
                style={{ display: 'none' }} 
              />
            </label>
            
            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginTop: 16 }}>
                {previews.map((preview, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img 
                      src={preview} 
                      alt={`Preview ${i + 1}`} 
                      style={{ 
                        width: '100%', 
                        height: 100, 
                        objectFit: 'cover', 
                        borderRadius: 8, 
                        border: '1px solid #fed7aa' 
                      }} 
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(239,68,68,0.9)',
                        border: 'none',
                        borderRadius: 4,
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: 14,
                        fontWeight: 700
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 14, color: '#7c2d12' }}>Featured Listing</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 14, color: '#7c2d12' }}>Verified</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#4338ca' : 'linear-gradient(135deg,#10b981,#059669)',
              border: 'none',
              borderRadius: 10,
              padding: '14px 24px',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Save size={16} />
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}


