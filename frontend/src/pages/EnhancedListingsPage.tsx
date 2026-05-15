import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, RotateCcw } from 'lucide-react';
import api from '../api';
import { Listing } from '../types';
import EnhancedPropertyCard from '../components/listings/EnhancedPropertyCard';
import { useAuthStore } from '../store/authStore';

// Declare Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

const cities = ['Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad', 'Rajampeta'];
const bhkTypes = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];

const quickButtonStyle = {
  padding: '4px 6px',
  fontSize: 10,
  fontWeight: 500,
  border: '1px solid #e2e8f0',
  borderRadius: 3,
  background: '#ffffff',
  color: '#374151',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

export default function EnhancedListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Search state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [selectedBHK, setSelectedBHK] = useState<string[]>(searchParams.get('bhk')?.split(',') || []);
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || searchParams.get('subCategory') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedPackage, setSelectedPackage] = useState(searchParams.get('package') || '');
  
  // Additional filter states
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [materialType, setMaterialType] = useState(searchParams.get('materialType') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || '');
  
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Check active subscription when on services page
  useEffect(() => {
    if (category === 'services' && user) {
      checkActiveSubscription();
    }
  }, [category, user]);

  const checkActiveSubscription = async () => {
    try {
      setCheckingSubscription(true);
      const { data } = await api.get('/payment/active-subscription');
      if (data.hasActiveSubscription) {
        setActiveSubscription(data.subscription);
      } else {
        setActiveSubscription(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  // Handle package purchase
  const handleBuyPackage = async () => {
    if (!user) {
      alert('Please login to purchase a package');
      navigate('/login');
      return;
    }

    if (!selectedPackage) {
      alert('Please select a payment option');
      return;
    }

    if (activeSubscription && selectedPackage !== 'OneTime') {
      return;
    }

    try {
      let orderData: any;

      if (selectedPackage === 'OneTime') {
        // One-time payment — ₹149 minimum
        const { data } = await api.post('/payment/create-order', { packageType: 'OneTime' });
        orderData = data;
      } else {
        const { data } = await api.post('/payment/create-order', { packageType: selectedPackage });
        orderData = data;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'INFRAALL Services',
        description: selectedPackage === 'OneTime' ? 'One-Time Service Visit (₹149)' : `${selectedPackage} Service Package`,
        image: '/logo.png',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const { data } = await api.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageType: selectedPackage
            });
            if (data.success) {
              if (selectedPackage === 'OneTime') {
                alert(`✅ Payment Successful!\n\nOne-time visit payment of ₹149 confirmed.\nA service professional will contact you shortly.`);
              } else {
                alert(`🎉 Payment Successful!\n\n${selectedPackage} package activated!\nValid until: ${new Date(data.subscription.endDate).toLocaleDateString()}`);
              }
              setSelectedPackage('');
              await checkActiveSubscription();
            }
          } catch (error: any) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        notes: { package: selectedPackage, user_id: user.id },
        theme: { color: selectedPackage === 'OneTime' ? '#10b981' : '#059669' },
        modal: { ondismiss: function() {} }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      alert('Failed to initiate payment. Please try again.');
      console.error('Payment error:', error);
    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { 
          page: String(page), 
          limit: '12'
        };
        if (category) params.category = category;
        if (city) params.city = city;
        if (search) params.search = search;
        if (selectedBHK.length > 0) params.bhk = selectedBHK.join(',');
        if (propertyType && propertyType !== 'Other') params.propertyType = propertyType;
        if (propertyType && propertyType !== 'Other') params.subCategory = propertyType; // Also send as subCategory for furniture/services/materials
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (selectedPackage) params.package = selectedPackage;
        if (condition) params.condition = condition;
        if (brand) params.brand = brand;
        if (materialType) params.materialType = materialType;
        if (availability) params.availability = availability;
        
        console.log('Fetching listings with params:', params); // Debug log
        const { data } = await api.get('/listings', { params });
        console.log('API Response:', data); // Debug log
        setListings(data.listings || []);
        setTotal(data.total || 0);
      } catch (error: any) { 
        console.error('Error fetching listings:', error);
        // Show user-friendly error message
        if (error.response) {
          console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('Network Error: No response received');
        } else {
          console.error('Request Error:', error.message);
        }
        setListings([]); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchListings();
  }, [category, city, search, selectedBHK, propertyType, minPrice, maxPrice, selectedPackage, condition, brand, materialType, availability, page]);

  const handleSearch = () => {
    // Validation: Only city is required
    if (!city.trim()) {
      alert('Please enter a city');
      return;
    }

    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (search) params.set('search', search);
    if (selectedBHK.length > 0) params.set('bhk', selectedBHK.join(','));
    if (propertyType && propertyType !== 'Other') params.set('propertyType', propertyType);
    if (propertyType && propertyType !== 'Other') params.set('subCategory', propertyType); // Also send as subCategory for furniture/services/materials
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (condition) params.set('condition', condition);
    if (brand) params.set('brand', brand);
    if (materialType) params.set('materialType', materialType);
    if (availability) params.set('availability', availability);
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearch('');
    setCity('');
    setSelectedBHK([]);
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setCondition('');
    setBrand('');
    setMaterialType('');
    setAvailability('');
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    setSearchParams(params);
  };

  const handleBHKToggle = (bhk: string) => {
    setSelectedBHK(prev => 
      prev.includes(bhk) 
        ? prev.filter(b => b !== bhk)
        : [...prev, bhk]
    );
  };

  const getCategoryTitle = () => {
    switch(category) {
      case 'property_sell': return 'Buy Properties';
      case 'property_rent': return 'Rent Properties';
      case 'furniture': return 'Furniture';
      case 'services': return 'Services';
      case 'materials': return 'Materials';
      default: return 'Properties';
    }
  };

  const getPropertyTypes = () => {
    switch(category) {
      case 'property_sell':
        return ['Full House', 'PG/Hostel', 'Flatmates', 'Shop', 'House', 'Other'];
      case 'property_rent':
        return ['House']; // Only houses for rent
      case 'furniture':
        return [
          'Sofa', 'Seating', 'Dining Table', 'Bed', 'Mattress', 'Wardrobe', 'Storage', 
          'Chair', 'Stool', 'Study Table', 'TV Unit', 'Bookshelf', 
          'Coffee Table', 'Dressing Table', 'Cabinet', 'Other'
        ];
      case 'services':
        return [
          'Home Cleaning', 'Deep Cleaning', 'Plumbing', 'Electrical Work', 
          'Painting', 'Whitewashing', 'Carpentry', 'AC Repair', 'AC Service', 
          'Appliance Repair', 'Pest Control', 'Home Security', 
          'Interior Design', 'Gardening', 'Other'
        ];
      case 'materials':
        return [
          'Cement', 'Concrete', 'Steel Rods', 'Iron Rods', 'Bricks', 'Blocks', 
          'Sand', 'Gravel', 'Tiles', 'Flooring', 'Paint', 'Coating', 
          'Pipes', 'Fittings', 'Electrical Items', 'Hardware', 'Tools', 
          'Roofing Materials', 'Doors', 'Windows', 'Other'
        ];
      default:
        return [];
    }
  };

  // Get condition filter options for furniture only (remove electronics)
  const getConditionOptions = () => {
    if (category === 'furniture') {
      return ['New', 'Like New', 'Good', 'Fair', 'Needs Repair'];
    }
    return [];
  };

  // Get brand filter options for furniture only (remove electronics)
  const getBrandOptions = () => {
    if (category === 'furniture') {
      return ['IKEA', 'Godrej', 'Nilkamal', 'Durian', 'Urban Ladder', 'Pepperfry', 'Local Made', 'Other'];
    }
    return [];
  };

  // Get material type options for building materials
  const getMaterialTypes = () => {
    if (category === 'materials') {
      return ['Premium Quality', 'Standard Quality', 'Economy Grade', 'Certified', 'ISI Marked'];
    }
    return [];
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Main Layout */}
        <div style={{ display: 'flex', gap: 32 }}>
          {/* Left Sidebar - Clean Filters */}
          <div style={{ width: 340, flexShrink: 0 }}>
            <div style={{ 
              background: '#ffffff', 
              borderRadius: 16, 
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)', 
              padding: '24px', 
              border: '1px solid #f1f5f9',
              position: 'sticky',
              top: 24
            }}>
              {/* Filter Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                  Filters
                </h3>
                <button
                  onClick={resetFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={10} />
                  Reset
                </button>
              </div>

              {/* City Filter */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: '#475569', 
                  marginBottom: 4
                }}>
                  City *
                </label>
                <select
                  value={cities.includes(city) ? city : ''}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 4,
                    fontSize: 12,
                    color: '#1f2937',
                    outline: 'none'
                  }}
                >
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Locality Filter - Optional */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: '#475569', 
                  marginBottom: 4
                }}>
                  Locality (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter locality"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 4,
                    fontSize: 12,
                    color: '#1f2937',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Service Package Filter - For Services Only */}
              {category === 'services' && (
                <div style={{ marginBottom: 12, background: '#dbeafe', padding: 12, borderRadius: 8, border: '2px solid #3b82f6' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 8 }}>
                    💳 Payment Options
                  </label>

                  {/* One-time payment */}
                  <button
                    onClick={() => setSelectedPackage(selectedPackage === 'OneTime' ? '' : 'OneTime')}
                    style={{
                      width: '100%', padding: '10px 12px', fontSize: 13, fontWeight: 600,
                      border: '2px solid', marginBottom: 8,
                      borderColor: selectedPackage === 'OneTime' ? '#059669' : '#6ee7b7',
                      borderRadius: 8,
                      background: selectedPackage === 'OneTime' ? 'linear-gradient(135deg, #10b981, #059669)' : '#ffffff',
                      color: selectedPackage === 'OneTime' ? '#ffffff' : '#065f46',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>⚡ One-Time Visit</div>
                    <div style={{ fontSize: 11, opacity: 0.9 }}>Starting ₹149 per visit</div>
                  </button>

                  <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600, marginBottom: 6, marginTop: 4 }}>— or subscribe —</div>

                  {/* Subscription packages */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Weekly', 'Monthly', 'Yearly'].map(pkg => (
                      <button
                        key={pkg}
                        onClick={() => setSelectedPackage(selectedPackage === pkg ? '' : pkg)}
                        style={{
                          padding: '10px 12px', fontSize: 13, fontWeight: 600,
                          border: '2px solid',
                          borderColor: selectedPackage === pkg ? '#1e40af' : '#bfdbfe',
                          borderRadius: 8,
                          background: selectedPackage === pkg ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#ffffff',
                          color: selectedPackage === pkg ? '#ffffff' : '#1e40af',
                          cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{pkg}</div>
                        <div style={{ fontSize: 11, opacity: 0.9 }}>
                          {pkg === 'Weekly' && '₹299/week'}
                          {pkg === 'Monthly' && '₹999/month'}
                          {pkg === 'Yearly' && '₹9,999/year'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BHK Filter for Properties */}
              {(category === 'property_sell' || category === 'property_rent') && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: '#475569', 
                    marginBottom: 4
                  }}>
                    BHK Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                    {bhkTypes.map(bhk => (
                      <button
                        key={bhk}
                        onClick={() => handleBHKToggle(bhk)}
                        style={{
                          padding: '5px 3px',
                          fontSize: 11,
                          fontWeight: 500,
                          border: '1px solid #e2e8f0',
                          borderRadius: 4,
                          background: selectedBHK.includes(bhk) ? '#3b82f6' : '#ffffff',
                          color: selectedBHK.includes(bhk) ? '#ffffff' : '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {bhk}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range for Properties - Adjusted line spacing */}
              {(category === 'property_sell' || category === 'property_rent') && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: '#475569', 
                    marginBottom: 4
                  }}>
                    Price {category === 'property_sell' ? '(₹ Lakhs)' : '(₹/month)'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '6px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                        fontSize: 12,
                        color: '#1f2937',
                        outline: 'none'
                      }}
                    />
                    <span style={{ 
                      color: '#64748b', 
                      fontSize: 12, 
                      fontWeight: 500 
                    }}>
                      to
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '6px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                        fontSize: 12,
                        color: '#1f2937',
                        outline: 'none'
                      }}
                    />
                  </div>
                  {/* Quick Price Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                    {category === 'property_sell' ? (
                      <>
                        <button onClick={() => { setMinPrice('20'); setMaxPrice('50'); }} style={quickButtonStyle}>20-50L</button>
                        <button onClick={() => { setMinPrice('50'); setMaxPrice('100'); }} style={quickButtonStyle}>50L-1Cr</button>
                        <button onClick={() => { setMinPrice('100'); setMaxPrice('200'); }} style={quickButtonStyle}>1-2Cr</button>
                        <button onClick={() => { setMinPrice('200'); setMaxPrice(''); }} style={quickButtonStyle}>2Cr+</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setMinPrice('10000'); setMaxPrice('25000'); }} style={quickButtonStyle}>10-25K</button>
                        <button onClick={() => { setMinPrice('25000'); setMaxPrice('50000'); }} style={quickButtonStyle}>25-50K</button>
                        <button onClick={() => { setMinPrice('50000'); setMaxPrice('100000'); }} style={quickButtonStyle}>50K-1L</button>
                        <button onClick={() => { setMinPrice('100000'); setMaxPrice(''); }} style={quickButtonStyle}>1L+</button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Category Type Filter - For Furniture, Services, Materials */}
              {(category === 'furniture' || category === 'services' || category === 'materials') && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: '#475569', 
                    marginBottom: 4
                  }}>
                    {category === 'furniture' ? 'Furniture Type' : 
                     category === 'services' ? 'Service Type' : 
                     'Material Type'}
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: 13,
                      color: '#1f2937',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">All {category === 'furniture' ? 'Furniture' : category === 'services' ? 'Services' : 'Materials'}</option>
                    {getPropertyTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Condition Filter - For Furniture Only */}
              {category === 'furniture' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: '#475569', 
                    marginBottom: 4
                  }}>
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: 13,
                      color: '#1f2937',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">Any Condition</option>
                    {getConditionOptions().map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand Filter - For Furniture Only */}
              {category === 'furniture' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: '#475569', 
                    marginBottom: 4
                  }}>
                    Brand
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: 13,
                      color: '#1f2937',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">Any Brand</option>
                    {getBrandOptions().map(brandOption => (
                      <option key={brandOption} value={brandOption}>{brandOption}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quality Grade Filter - For Building Materials */}
              {category === 'materials' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: '#475569', 
                    marginBottom: 4
                  }}>
                    Quality Grade
                  </label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: 13,
                      color: '#1f2937',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">Any Quality</option>
                    {getMaterialTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Availability Filter - For Services */}
              {category === 'services' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: '#475569', 
                    marginBottom: 4
                  }}>
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: 13,
                      color: '#1f2937',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">Any Time</option>
                    <option value="immediate">Available Now</option>
                    <option value="24hours">Within 24 Hours</option>
                    <option value="weekend">Weekend Only</option>
                    <option value="emergency">Emergency Service</option>
                  </select>
                </div>
              )}

              {/* Price Range for Non-Properties (remove electronics) */}
              {(category === 'furniture' || category === 'materials' || category === 'services') && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: '#475569', 
                    marginBottom: 4
                  }}>
                    Price Range (₹)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '6px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                        fontSize: 12,
                        color: '#1f2937',
                        outline: 'none'
                      }}
                    />
                    <span style={{ 
                      color: '#64748b', 
                      fontSize: 12, 
                      fontWeight: 500 
                    }}>
                      to
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '6px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                        fontSize: 12,
                        color: '#1f2937',
                        outline: 'none'
                      }}
                    />
                  </div>
                  {/* Quick Price Buttons for Different Categories */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                    {category === 'furniture' && (
                      <>
                        <button onClick={() => { setMinPrice('1000'); setMaxPrice('10000'); }} style={quickButtonStyle}>1K-10K</button>
                        <button onClick={() => { setMinPrice('10000'); setMaxPrice('25000'); }} style={quickButtonStyle}>10K-25K</button>
                        <button onClick={() => { setMinPrice('25000'); setMaxPrice('50000'); }} style={quickButtonStyle}>25K-50K</button>
                        <button onClick={() => { setMinPrice('50000'); setMaxPrice(''); }} style={quickButtonStyle}>50K+</button>
                      </>
                    )}
                    {category === 'services' && (
                      <>
                        <button onClick={() => { setMinPrice('500'); setMaxPrice('2000'); }} style={quickButtonStyle}>₹500-2K</button>
                        <button onClick={() => { setMinPrice('2000'); setMaxPrice('5000'); }} style={quickButtonStyle}>₹2K-5K</button>
                        <button onClick={() => { setMinPrice('5000'); setMaxPrice('10000'); }} style={quickButtonStyle}>₹5K-10K</button>
                        <button onClick={() => { setMinPrice('10000'); setMaxPrice(''); }} style={quickButtonStyle}>₹10K+</button>
                      </>
                    )}
                    {category === 'materials' && (
                      <>
                        <button onClick={() => { setMinPrice('100'); setMaxPrice('1000'); }} style={quickButtonStyle}>₹100-1K</button>
                        <button onClick={() => { setMinPrice('1000'); setMaxPrice('5000'); }} style={quickButtonStyle}>₹1K-5K</button>
                        <button onClick={() => { setMinPrice('5000'); setMaxPrice('20000'); }} style={quickButtonStyle}>₹5K-20K</button>
                        <button onClick={() => { setMinPrice('20000'); setMaxPrice(''); }} style={quickButtonStyle}>₹20K+</button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Apply Filters Button */}
              <button
                onClick={handleSearch}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
              >
                <Search size={14} />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div style={{ flex: 1 }}>
            {/* Results Header */}
            <div style={{ 
              background: '#ffffff', 
              borderRadius: 16, 
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)', 
              padding: '20px 24px', 
              border: '1px solid #f1f5f9',
              marginBottom: 24
            }}>
              <h1 style={{ 
                fontSize: 20, 
                fontWeight: 600, 
                color: '#1e293b', 
                marginBottom: 4,
                margin: 0
              }}>
                {getCategoryTitle()} in {city}
              </h1>
              <p style={{ 
                fontSize: 14, 
                color: '#64748b', 
                margin: 0
              }}>
                {total} results found
              </p>
            </div>

            {/* Active Subscription Status - Show when user has active subscription */}
            {category === 'services' && activeSubscription && !checkingSubscription && (
              <div style={{ 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
                borderRadius: 16, 
                boxShadow: '0 10px 30px rgba(16,185,129,0.15)', 
                padding: '32px', 
                border: '2px solid #10b981',
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28
                  }}>
                    ✅
                  </div>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#065f46', margin: 0, marginBottom: 4 }}>
                      Active Subscription
                    </h2>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#047857', margin: 0 }}>
                      You have {activeSubscription.packageType} subscription
                    </p>
                  </div>
                </div>

                <div style={{ 
                  background: '#ffffff', 
                  borderRadius: 12, 
                  padding: '20px 24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 20,
                  marginBottom: 20
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Package Type</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
                      {activeSubscription.packageType}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Valid Until</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
                      {new Date(activeSubscription.endDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Days Remaining</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>
                      {Math.ceil((new Date(activeSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </div>

                {/* Benefits Section */}
                <div style={{ background: '#ffffff', borderRadius: 12, padding: '24px', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#065f46', marginBottom: 16 }}>
                    Your {activeSubscription.packageType} Benefits:
                  </h3>
                  
                  {/* Monthly Package Benefits */}
                  {activeSubscription.packageType === 'Monthly' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>⚡</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Priority Booking</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Get your service requests prioritized and scheduled faster</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🕐</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Business Hours Support</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Customer support available during business hours (9 AM - 6 PM)</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>💰</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>10% Discount</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Save 10% on all services included in your package</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weekly Package Benefits */}
                  {activeSubscription.packageType === 'Weekly' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>⚡</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Priority Booking</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Get your service requests prioritized and scheduled faster</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🕐</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Extended Support</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Customer support available 7 AM - 10 PM, 7 days a week</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>❌</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Free Cancellation</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Cancel or reschedule bookings up to 2 hours before without charges</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>💰</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>15% Discount</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Save 15% on all services with special weekly rates</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>✅</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Quality Guarantee</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>100% satisfaction guaranteed with verified service professionals</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Yearly Package Benefits */}
                  {activeSubscription.packageType === 'Yearly' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>⚡</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>VIP Priority Booking</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Highest priority with same-day service availability</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🕐</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>24/7 Premium Support</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Round-the-clock dedicated support with emergency assistance</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>❌</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Anytime Free Cancellation</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Cancel or reschedule anytime without any cancellation charges</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>💰</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>25% Discount</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Maximum savings with 25% off on all services year-round</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>✅</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Premium Quality Guarantee</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Top-rated professionals with 100% satisfaction or money-back guarantee</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🔄</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Unlimited Requests</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Make unlimited service requests throughout your subscription</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🎁</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Free Annual Maintenance</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Complimentary annual maintenance check for all your appliances</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>👨‍🔧</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Dedicated Service Manager</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Personal service manager to handle all your requests and queries</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => navigate('/account')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                    }}
                  >
                    View Subscription Details
                  </button>
                  <div style={{ 
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 13,
                    color: '#047857',
                    fontWeight: 600,
                    paddingLeft: 12
                  }}>
                    🎉 Enjoy your exclusive benefits!
                  </div>
                </div>
              </div>
            )}

            {/* One-Time Payment Card */}
            {category === 'services' && selectedPackage === 'OneTime' && (
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: 16, padding: '28px 32px', border: '2px solid #10b981', marginBottom: 24, boxShadow: '0 10px 30px rgba(16,185,129,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 48 }}>⚡</div>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#065f46', margin: 0, marginBottom: 4 }}>One-Time Service Visit</h2>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#059669', margin: 0 }}>₹149 minimum charge</p>
                  </div>
                </div>
                <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  {[
                    { icon: '🔍', title: 'Inspection Visit', desc: 'Worker visits to check & diagnose the problem' },
                    { icon: '🔧', title: 'Problem Solved', desc: 'Pay only if the issue is resolved on the spot' },
                    { icon: '💰', title: 'Min. ₹149', desc: 'Starting price, final cost depends on work done' },
                  ].map(b => (
                    <div key={b.title} style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                      <div style={{ fontSize: 22 }}>{b.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{b.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleBuyPackage}
                    style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    💳 Pay ₹149 Now
                  </button>
                  <button onClick={() => setSelectedPackage('')}
                    style={{ background: '#fff', color: '#64748b', border: '2px solid #e2e8f0', padding: '14px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Service Package Benefits - Show when subscription package is selected and NO active subscription */}
            {category === 'services' && selectedPackage && selectedPackage !== 'OneTime' && !activeSubscription && (
              <div style={{ 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                borderRadius: 16, 
                boxShadow: '0 10px 30px rgba(59,130,246,0.15)', 
                padding: '32px', 
                border: '2px solid #3b82f6',
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 40 }}>📦</div>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e40af', margin: 0, marginBottom: 4 }}>
                      {selectedPackage} Service Package
                    </h2>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#2563eb', margin: 0 }}>
                      {selectedPackage === 'Monthly' && '₹999/month'}
                      {selectedPackage === 'Weekly' && '₹299/week'}
                      {selectedPackage === 'Yearly' && '₹9,999/year'}
                    </p>
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: 12, padding: '24px', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e40af', marginBottom: 16 }}>
                    Package Benefits:
                  </h3>
                  
                  {/* Monthly Package - Basic Benefits (3 benefits) */}
                  {selectedPackage === 'Monthly' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>⚡</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Priority Booking</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Get your service requests prioritized and scheduled faster</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🕐</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Business Hours Support</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Customer support available during business hours (9 AM - 6 PM)</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>💰</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>10% Discount</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Save 10% on all services included in your package</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weekly Package - More Benefits (5 benefits) */}
                  {selectedPackage === 'Weekly' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>⚡</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Priority Booking</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Get your service requests prioritized and scheduled faster</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🕐</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Extended Support</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Customer support available 7 AM - 10 PM, 7 days a week</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>❌</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Free Cancellation</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Cancel or reschedule bookings up to 2 hours before without charges</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>💰</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>15% Discount</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Save 15% on all services with special weekly rates</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>✅</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Quality Guarantee</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>100% satisfaction guaranteed with verified service professionals</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Yearly Package - Premium Benefits (8 benefits) */}
                  {selectedPackage === 'Yearly' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>⚡</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>VIP Priority Booking</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Highest priority with same-day service availability</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🕐</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>24/7 Premium Support</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Round-the-clock dedicated support with emergency assistance</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>❌</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Anytime Free Cancellation</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Cancel or reschedule anytime without any cancellation charges</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>💰</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>25% Discount</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Maximum savings with 25% off on all services year-round</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>✅</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Premium Quality Guarantee</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Top-rated professionals with 100% satisfaction or money-back guarantee</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🔄</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Unlimited Requests</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Make unlimited service requests throughout your subscription</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🎁</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Free Annual Maintenance</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Complimentary annual maintenance check for all your appliances</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>👨‍🔧</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Dedicated Service Manager</div>
                          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Personal service manager to handle all your requests and queries</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {!activeSubscription ? (
                    <button 
                      onClick={handleBuyPackage}
                      style={{ 
                        flex: 1,
                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                        color: '#ffffff', 
                        border: 'none', 
                        padding: '16px 32px', 
                        borderRadius: 12, 
                        fontSize: 16, 
                        fontWeight: 700, 
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(16,185,129,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <span>💳</span>
                      Buy {selectedPackage} Package - {selectedPackage === 'Monthly' ? '₹999/month' : selectedPackage === 'Weekly' ? '₹299/week' : '₹9,999/year'}
                    </button>
                  ) : (
                    <div style={{
                      flex: 1,
                      background: '#fef3c7',
                      border: '2px solid #fbbf24',
                      padding: '16px 24px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#92400e',
                      textAlign: 'center'
                    }}>
                      ⚠️ You already have an active {activeSubscription.packageType} subscription
                    </div>
                  )}
                  <button 
                    onClick={() => setSelectedPackage('')}
                    style={{ 
                      background: '#ffffff', 
                      color: '#64748b', 
                      border: '2px solid #e2e8f0', 
                      padding: '16px 24px', 
                      borderRadius: 12, 
                      fontSize: 14, 
                      fontWeight: 600, 
                      cursor: 'pointer'
                    }}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ 
                    background: '#ffffff', 
                    borderRadius: 16, 
                    padding: 20, 
                    border: '1px solid #f1f5f9' 
                  }}>
                    <div style={{ height: 200, background: '#f1f5f9', borderRadius: 12, marginBottom: 16 }}></div>
                    <div style={{ height: 16, background: '#f1f5f9', borderRadius: 4, marginBottom: 8 }}></div>
                    <div style={{ height: 16, background: '#f1f5f9', borderRadius: 4, width: '70%' }}></div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div style={{ 
                background: '#ffffff', 
                borderRadius: 16, 
                padding: 60, 
                textAlign: 'center',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  No results found
                </h3>
                <p style={{ color: '#64748b', marginBottom: 20 }}>
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={resetFilters}
                  style={{
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {listings.map(listing => (
                  <EnhancedPropertyCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}