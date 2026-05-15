import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, BadgeCheck, Heart, Phone, MessageCircle, Star, Eye, ChevronLeft, ChevronRight, Share2, ArrowLeft, Bed, Bath, Maximize2, Car, Home, Calendar, Building2 } from 'lucide-react';
import api from '../api';
import { Listing, Review, ReviewEligibility } from '../types';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';

const formatPrice = (price?: number) => {
  if (!price) return 'Price on Request';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString()}`;
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [canUserReview, setCanUserReview] = useState<ReviewEligibility | null>(null);
  const [reviewEligibilityLoading, setReviewEligibilityLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState(0); // 0 = today
  const [selectedSpecificTime, setSelectedSpecificTime] = useState('');
  const [visitScheduled, setVisitScheduled] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Rent modal states
  const [showRentModal, setShowRentModal] = useState(false);
  const [rentDuration, setRentDuration] = useState(12);
  const [rentDurationType, setRentDurationType] = useState<'months' | 'years'>('months');
  const [rentStartDate, setRentStartDate] = useState('');
  const [rentProcessing, setRentProcessing] = useState(false);
  
  // Buy modal states
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [buyProcessing, setBuyProcessing] = useState(false);

  // Property buy request states
  const [showPropertyBuyModal, setShowPropertyBuyModal] = useState(false);
  const [buyerMessage, setBuyerMessage] = useState('');
  const [propertyBuyProcessing, setPropertyBuyProcessing] = useState(false);

  // Furniture rental modal states
  const [showFurnitureRentalModal, setShowFurnitureRentalModal] = useState(false);
  const [furniturePurpose, setFurniturePurpose] = useState<'home' | 'office' | 'other' | ''>('');
  const [furnitureDuration, setFurnitureDuration] = useState(3);
  const [furnitureAddress, setFurnitureAddress] = useState('');
  const [furnitureCity, setFurnitureCity] = useState('');
  const [furnitureState, setFurnitureState] = useState('');
  const [furniturePincode, setFurniturePincode] = useState('');
  const [furniturePhone, setFurniturePhone] = useState('');
  const [furnitureNotes, setFurnitureNotes] = useState('');
  const [furnitureOtherReason, setFurnitureOtherReason] = useState('');
  const [furnitureProcessing, setFurnitureProcessing] = useState(false);

  // Leisure lease modal states
  const [showLeisureLeaseModal, setShowLeisureLeaseModal] = useState(false);
  const [leisureLeaseYear, setLeisureLeaseYear] = useState(new Date().getFullYear());
  const [leisureStartDate, setLeisureStartDate] = useState('');
  const [leisureProcessing, setLeisureProcessing] = useState(false);
  
  const { items, toggle } = useWishlistStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch listing and reviews independently so a reviews failure doesn't block the page
        const listingRes = await api.get(`/listings/${id}`);
        setListing(listingRes.data);

        // Reviews are non-critical — don't let them crash the page
        try {
          const reviewsRes = await api.get(`/reviews/${id}`);
          setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        } catch (reviewErr) {
          console.warn('Could not load reviews:', reviewErr);
          setReviews([]);
        }

        // Check if user can review (only if logged in)
        if (user) {
          checkReviewEligibility();
        }
      } catch (err) {
        console.error('Failed to load listing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const checkReviewEligibility = async () => {
    if (!user || !id) return;
    
    try {
      setReviewEligibilityLoading(true);
      const { data } = await api.get(`/reviews/can-review/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCanUserReview(data);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanUserReview({ canReview: false, reason: 'error' });
    } finally {
      setReviewEligibilityLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) return alert('Please login to review');
    if (!reviewText.trim()) return alert('Please write a review');
    setSubmitting(true);
    
    try {
      await api.post('/reviews', { 
        listingId: id, 
        rating: reviewRating, 
        comment: reviewText 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Refresh reviews and eligibility
      const reviewsRes = await api.get(`/reviews/${id}`);
      setReviews(reviewsRes.data);
      
      // Reset form
      setReviewText('');
      setReviewRating(5);
      
      // Check eligibility again (user might not be able to review again)
      checkReviewEligibility();
      
      alert('Review submitted successfully!');
    } catch (err: any) {
      console.error('Submit review error:', err);
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Rent Property
  const handleRentProperty = async () => {
    if (!user) {
      alert('Please login to rent this property');
      return;
    }
    
    if (!rentStartDate) {
      alert('Please select a start date');
      return;
    }

    setRentProcessing(true);
    try {
      const { data } = await api.post('/property-rentals/create-order', {
        listingId: listing?.id,
        startDate: rentStartDate
      });

      // Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'INFRAALL',
        description: `Rent: ${listing?.title}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            await api.post('/property-rentals/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              rentalId: data.rentalId
            });
            alert('Property rented successfully! Check your account for details.');
            setShowRentModal(false);
            window.location.href = '/account';
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#6366f1'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Rent error:', error);
      if (error.response?.data?.requiresKYC) {
        const go = window.confirm(`${error.response.data.message}\n\nClick OK to go to KYC verification page.`);
        if (go) navigate('/kyc');
      } else {
        alert(error.response?.data?.message || 'Failed to process rental');
      }
    } finally {
      setRentProcessing(false);
    }
  };

  // Handle Furniture Rental Request
  const handleFurnitureRental = async () => {
    if (!furniturePurpose) return alert('Please select the purpose of rental.');
    if (furniturePurpose === 'other' && !furnitureOtherReason.trim()) return alert('Please describe your reason for renting.');
    if (!furnitureAddress || !furnitureCity || !furnitureState || !furniturePincode) return alert('Please fill in the delivery address.');
    setFurnitureProcessing(true);
    const purposeLabel = furniturePurpose === 'home' ? '🏠 Home Use' : furniturePurpose === 'office' ? '🏢 Office Use' : `📝 Other: ${furnitureOtherReason}`;
    try {
      await api.post('/purchases/furniture-rental', {
        listingId: listing?.id,
        purpose: furniturePurpose,
        rentalDuration: furnitureDuration,
        deliveryAddress: furnitureAddress,
        deliveryCity: furnitureCity,
        deliveryState: furnitureState,
        deliveryPincode: furniturePincode,
        deliveryPhone: furniturePhone,
        notes: furniturePurpose === 'other' ? `Reason: ${furnitureOtherReason}${furnitureNotes ? '. ' + furnitureNotes : ''}` : furnitureNotes
      });
      alert(`✅ Rental request submitted!\n\nItem: ${listing?.title}\nPurpose: ${purposeLabel}\nDuration: ${furnitureDuration} month(s)\n\nAdmin will confirm within 24 hours.`);
      setShowFurnitureRentalModal(false);
      setFurniturePurpose(''); setFurnitureDuration(3); setFurnitureOtherReason('');
      setFurnitureAddress(''); setFurnitureCity(''); setFurnitureState(''); setFurniturePincode('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit rental request.');
    } finally { setFurnitureProcessing(false); }
  };

  // Handle Leisure Lease
  const handleLeisureLease = async () => {
    if (!user) {
      alert('Please login to lease this property');
      return;
    }
    
    if (!leisureStartDate) {
      alert('Please select a start date');
      return;
    }

    setLeisureProcessing(true);
    try {
      const { data } = await api.post('/leisure-lease/create-order', {
        listingId: listing?.id,
        leaseYear: leisureLeaseYear,
        startDate: leisureStartDate
      });

      // Open Razorpay checkout
      const options = {
        key: data.razorpayOrder.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'INFRAALL',
        description: `Leisure Lease: ${listing?.title} (${leisureLeaseYear})`,
        order_id: data.razorpayOrder.id,
        handler: async function (response: any) {
          try {
            await api.post('/leisure-lease/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              leisureLeaseId: data.leisureLease.id
            });
            alert(`🏖️ Leisure lease confirmed!\n\nProperty: ${listing?.title}\nYear: ${leisureLeaseYear}\nAmount: ${data.details.totalAmount}\n\nYour leisure lease is now active!`);
            setShowLeisureLeaseModal(false);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#0369a1'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Leisure lease error:', error);
      if (error.response?.data?.requiresKYC) {
        const go = window.confirm(`${error.response.data.message}\n\nClick OK to go to KYC verification page.`);
        if (go) navigate('/kyc');
      } else {
        alert(error.response?.data?.message || 'Failed to process leisure lease');
      }
    } finally {
      setLeisureProcessing(false);
    }
  };

  // Handle Buy/Purchase
  const handleBuyItem = async () => {
    if (!user) {
      alert('Please login to purchase');
      return;
    }

    // Validate delivery details for non-property items
    if (listing?.category !== 'property_sell') {
      if (!deliveryAddress || !deliveryCity || !deliveryState || !deliveryPincode || !deliveryPhone) {
        alert('Please fill in all delivery details');
        return;
      }
    }

    setBuyProcessing(true);
    try {
      const { data } = await api.post('/purchases/create-order', {
        listingId: listing?.id,
        quantity: buyQuantity,
        deliveryAddress,
        deliveryCity,
        deliveryState,
        deliveryPincode,
        deliveryPhone
      });

      // Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'INFRAALL',
        description: `Purchase: ${listing?.title}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            await api.post('/purchases/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              purchaseId: data.purchaseId
            });
            alert('Purchase successful! Check your account for order details.');
            setShowBuyModal(false);
            window.location.href = '/account';
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#6366f1'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.response?.data?.message || 'Failed to process purchase');
    } finally {
      setBuyProcessing(false);
    }
  };

  // Handle Property Buy Request
  const handlePropertyBuyRequest = async () => {
    if (!user) {
      alert('Please login to submit a buy request');
      return;
    }

    if (!buyerMessage.trim()) {
      alert('Please enter a message for the admin');
      return;
    }

    setPropertyBuyProcessing(true);
    try {
      const { data } = await api.post('/buy-requests/create', {
        listingId: listing?.id,
        buyerMessage: buyerMessage.trim()
      });

      alert('✅ Buy request submitted successfully!\n\nYour request has been sent to admin for review. You will be contacted soon with further details.\n\nYou can track the status in your account page.');
      setShowPropertyBuyModal(false);
      setBuyerMessage('');
      
      // Optionally redirect to account page
      navigate('/account?tab=buy-requests');
    } catch (error: any) {
      console.error('Property buy request error:', error);
      alert(error.response?.data?.message || 'Failed to submit buy request');
    } finally {
      setPropertyBuyProcessing(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ height: 480, background: '#e2e8f0', borderRadius: 16, marginBottom: 24, animation: 'pulse 1.5s infinite' }} />
    </div>
  );

  if (!listing) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Listing not found</h2>
    </div>
  );

  const images = listing.images?.length > 0 ? listing.images : ['https://placehold.co/800x500/1e1b4b/818cf8?text=INFRAALL'];
  const isSaved = items.includes(listing.id);

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Back bar */}
      <div style={{ background: '#0f172a', padding: '12px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Link to="/listings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>
            <ArrowLeft size={16} /> Back to Listings
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Image Gallery */}
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 460, background: '#1e293b', marginBottom: 20 }}>
              <img src={images[imgIndex]} alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex((imgIndex - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setImgIndex((imgIndex + 1) % images.length)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    <ChevronRight size={20} />
                  </button>
                  <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIndex(i)}
                        style={{ width: i === imgIndex ? 24 : 8, height: 8, borderRadius: 4, background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} />
                    ))}
                  </div>
                </>
              )}

              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                <button style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Share2 size={16} color="#374151" />
                </button>
              </div>

              <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, padding: '4px 10px', borderRadius: 8 }}>
                📷 {images.length} Photos
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <img key={i} src={img} onClick={() => setImgIndex(i)}
                    style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i === imgIndex ? '3px solid #6366f1' : '3px solid transparent', flexShrink: 0 }} />
                ))}
              </div>
            )}

            {/* Title & Location */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '28px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.3, flex: 1, marginRight: 16 }}>
                  {listing.title}
                </h1>
                {listing.isFeatured && (
                  <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ⭐ Featured
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <MapPin size={16} color="#6366f1" />
                <span style={{ fontSize: 15, color: '#475569' }}>
                  {[listing.location, listing.city, listing.state].filter(Boolean).join(', ')}
                </span>
              </div>

              <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>
                {formatPrice(listing.price)}
                {listing.priceType === 'per_month' && <span style={{ fontSize: 16, color: '#94a3b8', fontWeight: 400 }}>/month</span>}
                {listing.priceType === 'negotiable' && <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600, marginLeft: 10, background: '#d1fae5', padding: '3px 10px', borderRadius: 6 }}>Negotiable</span>}
              </div>

              {/* Category-Specific Specs - Enhanced Design */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, padding: '24px 0', marginBottom: 20 }}>
                {/* Property specs */}
                {(listing.category === 'property_sell' || listing.category === 'property_rent') && (
                  <>
                    {listing.bedrooms && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 14, 
                        padding: '16px 18px', 
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                        borderRadius: 12,
                        border: '1px solid #bae6fd',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.08)';
                      }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                          <Bed size={24} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{listing.bedrooms} Bedroom</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>No. of Bedroom</div>
                        </div>
                      </div>
                    )}
                    {listing.bathrooms && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 14, 
                        padding: '16px 18px', 
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                        borderRadius: 12,
                        border: '1px solid #fde047',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.08)';
                      }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                          <Bath size={24} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{listing.bathrooms} Bathroom</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>No. of Bathroom</div>
                        </div>
                      </div>
                    )}
                    {listing.subCategory && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 14, 
                        padding: '16px 18px', 
                        background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', 
                        borderRadius: 12,
                        border: '1px solid #f9a8d4',
                        boxShadow: '0 2px 8px rgba(236, 72, 153, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(236, 72, 153, 0.08)';
                      }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #ec4899, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)' }}>
                          <Home size={24} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{listing.subCategory}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>Property Type</div>
                        </div>
                      </div>
                    )}
                    {listing.parking && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 14, 
                        padding: '16px 18px', 
                        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', 
                        borderRadius: 12,
                        border: '1px solid #86efac',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(22, 163, 74, 0.08)';
                      }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
                          <Car size={24} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{listing.parking}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>Parking</div>
                        </div>
                      </div>
                    )}
                    {listing.area && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 14, 
                        padding: '16px 18px', 
                        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', 
                        borderRadius: 12,
                        border: '1px solid #a5b4fc',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.08)';
                      }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                          <Maximize2 size={24} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{listing.area} Sq.Ft</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>{listing.areaUnit || 'Square Feet'}</div>
                        </div>
                      </div>
                    )}
                    {listing.propertyAge && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 14, 
                        padding: '16px 18px', 
                        background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)', 
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(249, 115, 22, 0.08)';
                      }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }}>
                          <Calendar size={24} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{listing.propertyAge}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>Age of Building</div>
                        </div>
                      </div>
                    )}
                    {listing.furnishing && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 14, 
                        padding: '16px 18px', 
                        background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)', 
                        borderRadius: 12,
                        border: '1px solid #a78bfa',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.08)';
                      }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}>
                          <Building2 size={24} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, textTransform: 'capitalize' }}>{listing.furnishing}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>Furnishing</div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Materials/Furniture specs */}
                {(listing.category === 'materials' || listing.category === 'furniture') && (
                  <>
                    {listing.brand && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{listing.brand}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Brand</div>
                      </div>
                    )}
                    {listing.condition && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>{listing.condition.replace('_', ' ')}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Condition</div>
                      </div>
                    )}
                    {listing.quantity && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{listing.quantity}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{listing.unit || 'Units'}</div>
                      </div>
                    )}
                  </>
                )}

                {/* Services specs */}
                {listing.category === 'services' && (
                  <>
                    {listing.experience && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{listing.experience}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Experience</div>
                      </div>
                    )}
                    {listing.serviceArea && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{listing.serviceArea}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Service Area</div>
                      </div>
                    )}
                    {listing.availability && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{listing.availability}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Availability</div>
                      </div>
                    )}
                  </>
                )}

                {/* Vehicles specs */}
                {listing.category === 'vehicles' && (
                  <>
                    {listing.year && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{listing.year}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Year</div>
                      </div>
                    )}
                    {listing.kmDriven && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{listing.kmDriven.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>KM Driven</div>
                      </div>
                    )}
                    {listing.fuelType && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>{listing.fuelType}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Fuel Type</div>
                      </div>
                    )}
                  </>
                )}

                {/* Views - always show */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={18} color="#6366f1" /> {listing.views || 0}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Views</div>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Description</h3>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8 }}>{listing.description}</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Amenities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {listing.amenities.map((a, i) => (
                    <span key={i} style={{ background: '#eef2ff', color: '#4f46e5', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details */}
            {(listing.category === 'property_sell' || listing.category === 'property_rent') && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Property Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {listing.propertyAge && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Property Age</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.propertyAge}</span>
                    </div>
                  )}
                  {listing.facing && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Facing</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.facing}</span>
                    </div>
                  )}
                  {listing.floor && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Floor</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.floor}{listing.totalFloors ? ` of ${listing.totalFloors}` : ''}</span>
                    </div>
                  )}
                  {listing.parking && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Parking</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.parking}</span>
                    </div>
                  )}
                  {listing.furnishing && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Furnishing</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>{listing.furnishing}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Details */}
            {listing.category === 'services' && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Service Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {listing.serviceType && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Service Type</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.serviceType}</span>
                    </div>
                  )}
                  {listing.languages && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Languages</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.languages}</span>
                    </div>
                  )}
                  {(listing.minPrice || listing.maxPrice) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Price Range</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        {listing.minPrice ? `₹${listing.minPrice}` : ''}
                        {listing.minPrice && listing.maxPrice ? ' - ' : ''}
                        {listing.maxPrice ? `₹${listing.maxPrice}` : ''}
                      </span>
                    </div>
                  )}
                </div>
                {listing.certifications && (
                  <div style={{ marginTop: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Certifications</h4>
                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{listing.certifications}</p>
                  </div>
                )}
              </div>
            )}

            {/* Product Details (Materials/Furniture) */}
            {(listing.category === 'materials' || listing.category === 'furniture') && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Product Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {listing.model && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Model</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.model}</span>
                    </div>
                  )}
                  {listing.year && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Year</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.year}</span>
                    </div>
                  )}
                  {listing.warranty && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Warranty</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.warranty}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Details */}
            {listing.category === 'vehicles' && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Vehicle Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {listing.model && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Model</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.model}</span>
                    </div>
                  )}
                  {listing.transmission && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Transmission</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>{listing.transmission}</span>
                    </div>
                  )}
                  {listing.owners && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>Owners</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{listing.owners}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
                Reviews ({reviews.length})
              </h3>

              {/* Write Review */}
              {user && (
                <div style={{ marginBottom: 20 }}>
                  {reviewEligibilityLoading ? (
                    <div style={{ 
                      background: '#f8fafc', 
                      borderRadius: 12, 
                      padding: '20px', 
                      border: '1px solid #e2e8f0',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        border: '2px solid #e2e8f0',
                        borderTop: '2px solid #6366f1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px'
                      }} />
                      <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                        Checking review eligibility...
                      </p>
                    </div>
                  ) : canUserReview?.canReview ? (
                    <div style={{ 
                      background: '#f0fdf4', 
                      borderRadius: 12, 
                      padding: '20px', 
                      border: '1px solid #86efac'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <BadgeCheck size={20} color="#059669" />
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#065f46', margin: 0 }}>
                          ✅ You're eligible to review this {listing?.category?.includes('rent') ? 'rental' : 'property'}
                        </p>
                      </div>
                      <p style={{ fontSize: 13, color: '#047857', marginBottom: 16 }}>
                        You can write a review because you have a verified transaction for this listing.
                      </p>
                      
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        {[1, 2, 3, 4, 5].map(r => (
                          <button key={r} onClick={() => setReviewRating(r)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24 }}>
                            <Star size={24} fill={r <= reviewRating ? '#fbbf24' : 'none'} color={r <= reviewRating ? '#fbbf24' : '#d1d5db'} />
                          </button>
                        ))}
                      </div>
                      <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                        placeholder="Share your experience with this property..."
                        rows={3}
                        style={{ 
                          width: '100%', 
                          border: '1.5px solid #86efac', 
                          borderRadius: 10, 
                          padding: '12px', 
                          fontSize: 14, 
                          outline: 'none', 
                          resize: 'none', 
                          fontFamily: 'inherit', 
                          color: '#0f172a', 
                          background: '#fff' 
                        }} />
                      <button onClick={submitReview} disabled={submitting}
                        style={{ 
                          marginTop: 12, 
                          background: submitting ? '#94a3b8' : 'linear-gradient(135deg,#059669,#047857)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 8, 
                          padding: '12px 24px', 
                          fontSize: 14, 
                          fontWeight: 700, 
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                        {submitting ? (
                          <>
                            <div style={{ 
                              width: 16, 
                              height: 16, 
                              border: '2px solid #ffffff40',
                              borderTop: '2px solid #ffffff',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }} />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Star size={16} />
                            Submit Verified Review
                          </>
                        )}
                      </button>
                    </div>
                  ) : canUserReview && !canUserReview.canReview ? (
                    <div style={{ 
                      background: '#fef3c7', 
                      borderRadius: 12, 
                      padding: '20px', 
                      border: '1px solid #fbbf24'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          !
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', margin: 0 }}>
                          {canUserReview.reason === 'already_reviewed' 
                            ? '✅ You have already reviewed this property' 
                            : '🔒 Purchase or rent this property to leave a review'
                          }
                        </p>
                      </div>
                      <p style={{ fontSize: 13, color: '#78350f', margin: 0 }}>
                        {canUserReview.reason === 'already_reviewed'
                          ? 'Thank you for your feedback! You can only review each property once.'
                          : `Only verified ${listing?.category?.includes('rent') ? 'renters' : 'buyers'} can leave reviews to ensure authenticity.`
                        }
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Review List */}
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <Star size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No reviews yet</p>
                  <p style={{ fontSize: 14, opacity: 0.8 }}>Be the first to review after purchasing or renting!</p>
                </div>
              ) : (
                <div>
                  {/* Reviews Header */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: 20,
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                    borderRadius: 12,
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BadgeCheck size={20} color="#ffffff" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e', margin: 0 }}>
                          Verified Reviews ({reviews.length})
                        </h4>
                        <p style={{ fontSize: 13, color: '#0369a1', margin: 0 }}>
                          From customers who bought or rented this property
                        </p>
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4,
                      background: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: 20,
                      border: '1px solid #bae6fd'
                    }}>
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>
                        {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {reviews.map(r => (
                      <div key={r.id} style={{ 
                        padding: '20px', 
                        background: '#ffffff', 
                        borderRadius: 12, 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: 16, marginBottom: 12 }}>
                          {/* User Avatar */}
                          <div style={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#fff', 
                            fontWeight: 700, 
                            fontSize: 18,
                            flexShrink: 0
                          }}>
                            {r.reviewer?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            {/* User Info and Rating */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <p style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', margin: 0 }}>
                                    {r.reviewer?.name || 'Verified Customer'}
                                  </p>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    background: '#d1fae5',
                                    color: '#065f46',
                                    padding: '2px 8px',
                                    borderRadius: 12,
                                    fontSize: 11,
                                    fontWeight: 600
                                  }}>
                                    <BadgeCheck size={12} />
                                    {r.transactionType === 'rental' ? 'Verified Renter' : 'Verified Buyer'}
                                  </div>
                                </div>
                                
                                {/* Rating Stars */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <div style={{ display: 'flex', gap: 2 }}>
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        size={14} 
                                        fill={i < r.rating ? "#fbbf24" : "none"} 
                                        color={i < r.rating ? "#fbbf24" : "#d1d5db"} 
                                      />
                                    ))}
                                  </div>
                                  <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>
                                    {r.rating}/5
                                  </span>
                                </div>
                              </div>
                              
                              {/* Review Date */}
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                                  {r.createdAt && new Date(r.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            {/* Review Comment */}
                            {r.comment && (
                              <div style={{ 
                                background: '#f8fafc', 
                                padding: '12px 16px', 
                                borderRadius: 8, 
                                border: '1px solid #f1f5f9',
                                marginTop: 12
                              }}>
                                <p style={{ 
                                  fontSize: 14, 
                                  color: '#475569', 
                                  lineHeight: 1.6, 
                                  margin: 0,
                                  fontStyle: 'italic'
                                }}>
                                  "{r.comment}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Seller Card */}
          <div style={{ position: 'sticky', top: 80 }}>

            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', border: '1px solid #f1f5f9' }}>

              {/* Save */}
              <button onClick={() => user ? toggle(listing.id) : alert('Please login')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: isSaved ? '2px solid #e53e3e' : '2px solid #e2e8f0', background: isSaved ? '#fef2f2' : '#fff', color: isSaved ? '#e53e3e' : '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s' }}>
                <Heart size={16} fill={isSaved ? '#e53e3e' : 'none'} />
                {isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>

              {/* Seller Info */}
              {listing.seller && (
                <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#ffffff',
                    border: '2px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <img src="/logo.png" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>
                    INFRAALL
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#d1fae5', color: '#065f46', fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                    <BadgeCheck size={12} /> Official Listing
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Schedule Visit Button - For both rent and buy properties */}
                {(listing.category === 'property_rent' || listing.category === 'property_sell') && listing.status !== 'rented' && listing.status !== 'sold' && (
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', padding: '13px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    📅 Schedule Visit
                  </button>
                )}
                
                {/* Rent Property Button */}
                {listing.category === 'property_rent' && listing.status !== 'rented' && (
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Please login to rent this property');
                        return;
                      }
                      setRentStartDate(new Date().toISOString().split('T')[0]);
                      setShowRentModal(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', padding: '13px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    🏠 Rent Property {listing.isLeisure ? '(Monthly)' : ''}
                  </button>
                )}

                {/* Leisure Lease Button - Only for leisure properties */}
                {listing.category === 'property_rent' && listing.status !== 'rented' && listing.isLeisure && (
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Please login to lease this property');
                        return;
                      }
                      setLeisureStartDate(new Date().toISOString().split('T')[0]);
                      setShowLeisureLeaseModal(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#fff', padding: '13px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    🏖️ Lease Property (Full Year)
                  </button>
                )}
                
                {/* Rent Now — furniture only (rental, not for sale) */}
                {listing.category === 'furniture' && listing.status === 'active' && (
                  <button
                    onClick={() => { if (!user) { alert('Please login to rent'); return; } setShowFurnitureRentalModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '13px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    🛋️ Rent Now
                  </button>
                )}

                {/* Buy Now — materials, vehicles only (NOT furniture, NOT property_sell, NOT electronics) */}
                {['materials', 'vehicles'].includes(listing.category) && listing.status !== 'sold' && (
                  <button
                    onClick={() => { if (!user) { alert('Please login to purchase'); return; } setShowBuyModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '13px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    🛒 Buy Now
                  </button>
                )}

                {/* Buy Property — property_sell only */}
                {listing.category === 'property_sell' && listing.status !== 'sold' && (
                  <button
                    onClick={() => { if (!user) { alert('Please login to submit buy request'); return; } setShowPropertyBuyModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', padding: '13px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    🏠 Buy Property
                  </button>
                )}
                
                {listing.seller?.phone && (
                  <a href={`tel:${listing.seller.phone}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '13px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                    <Phone size={16} /> Call Seller
                  </a>
                )}
                <Link to={`/chat?sellerId=1&listingId=${listing.id}&isAdmin=true`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', padding: '13px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                  <MessageCircle size={16} /> Chat with Admin
                </Link>              </div>

              {/* Price Summary */}
              <div style={{ marginTop: 20, padding: '16px', background: '#f8fafc', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Price</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{formatPrice(listing.price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Category</span>
                  <span style={{ fontSize: 13, color: '#475569', textTransform: 'capitalize' }}>{listing.category?.replace('_', ' ')}</span>
                </div>
                {listing.subCategory && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Type</span>
                    <span style={{ fontSize: 13, color: '#475569' }}>{listing.subCategory}</span>
                  </div>
                )}
                {listing.condition && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Condition</span>
                    <span style={{ fontSize: 13, color: '#475569', textTransform: 'capitalize' }}>{listing.condition.replace('_', ' ')}</span>
                  </div>
                )}
                {listing.brand && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Brand</span>
                    <span style={{ fontSize: 13, color: '#475569' }}>{listing.brand}</span>
                  </div>
                )}
                {listing.city && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Location</span>
                    <span style={{ fontSize: 13, color: '#475569' }}>{listing.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Schedule Modal - For both rental and buy properties */}
      {showScheduleModal && (listing?.category === 'property_rent' || listing?.category === 'property_sell') && (
        <div 
          onClick={() => setShowScheduleModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
            padding: 20
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 24,
              maxWidth: 900,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowScheduleModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                fontSize: 24,
                color: '#64748b'
              }}
            >
              ×
            </button>

            <div style={{ padding: '40px' }}>
              {!visitScheduled ? (
                <>
                  <h2 style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: '#1e293b',
                    marginBottom: 8,
                    textAlign: 'center'
                  }}>
                    Schedule your FREE visit
                  </h2>

                  <div style={{
                    background: '#f1f5f9',
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginBottom: 32,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <div style={{ fontSize: 24 }}>👥</div>
                    <p style={{
                      fontSize: 15,
                      color: '#64748b',
                      margin: 0,
                      fontWeight: 500
                    }}>
                      {listing?.category === 'property_rent' 
                        ? '5 people are visiting this property today. Move fast or miss out!'
                        : '3 people are interested in buying this property. Schedule your visit now!'}
                    </p>
                  </div>

                  {/* Property Details */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 32,
                    border: '1px solid #cbd5e1'
                  }}>
                    <h3 style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#1e293b',
                      marginBottom: 16
                    }}>
                      {listing?.title}
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                      gap: 16
                    }}>
                      {listing?.bedrooms && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{listing.bedrooms}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Bedrooms</div>
                        </div>
                      )}
                      {listing?.bathrooms && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{listing.bathrooms}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Bathrooms</div>
                        </div>
                      )}
                      {listing?.area && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{listing.area}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Sq.ft</div>
                        </div>
                      )}
                      {listing?.parking && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{listing.parking}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Parking</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 20
                  }}>
                    Pick a Date
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: 12,
                    marginBottom: 32
                  }}>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                      const date = new Date(Date.now() + dayOffset * 86400000);
                      const dayName = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
                      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                      const isSelected = selectedDate === dayOffset;
                      
                      return (
                        <button
                          key={dayOffset}
                          onClick={() => setSelectedDate(dayOffset)}
                          style={{
                            padding: '16px 8px',
                            background: isSelected ? 'linear-gradient(135deg, #10b981, #059669)' : '#ffffff',
                            border: isSelected ? '3px solid #10b981' : '2px solid #e2e8f0',
                            borderRadius: 12,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#10b981';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          <div style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: isSelected ? '#ffffff' : '#1e293b',
                            marginBottom: 4
                          }}>
                            {date.getDate()}
                          </div>
                          <div style={{
                            fontSize: 11,
                            color: isSelected ? '#ffffff' : '#64748b',
                            fontWeight: 500
                          }}>
                            {dayName}
                          </div>
                          <div style={{
                            fontSize: 10,
                            color: isSelected ? '#ffffff' : '#94a3b8',
                            marginTop: 2
                          }}>
                            {monthName}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 20
                  }}>
                    Select Time Slot
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginBottom: 32
                  }}>
                    {[
                      { icon: '🌅', label: 'Morning', time: '9 AM - 12 PM', count: 6, times: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'] },
                      { icon: '☀️', label: 'Afternoon', time: '12 PM - 3 PM', count: 12, times: ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM'] },
                      { icon: '🌆', label: 'Evening', time: '3 PM - 6 PM', count: 3, times: ['03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'] },
                      { icon: '🌙', label: 'Night', time: '6 PM - 9 PM', count: 2, times: ['06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM'] }
                    ].map((slot) => (
                      <button
                        key={slot.label}
                        onClick={() => setSelectedTimeSlot(slot.label)}
                        style={{
                          padding: '20px',
                          background: selectedTimeSlot === slot.label
                            ? 'linear-gradient(135deg, #10b981, #059669)' 
                            : '#ffffff',
                          border: selectedTimeSlot === slot.label
                            ? '3px solid #10b981' 
                            : '2px solid #e2e8f0',
                          borderRadius: 16,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: 32, marginBottom: 8 }}>{slot.icon}</div>
                        <div style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: selectedTimeSlot === slot.label ? '#ffffff' : '#1e293b',
                          marginBottom: 4
                        }}>
                          {slot.label} ({slot.count})
                        </div>
                        <div style={{
                          fontSize: 13,
                          color: selectedTimeSlot === slot.label ? '#ffffff' : '#64748b',
                          fontWeight: 500
                        }}>
                          {slot.time}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedTimeSlot && (
                    <div style={{ marginBottom: 32 }}>
                      <h4 style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#1e293b',
                        marginBottom: 16
                      }}>
                        Choose specific time:
                      </h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 12
                      }}>
                        {[
                          { icon: '🌅', label: 'Morning', times: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'] },
                          { icon: '☀️', label: 'Afternoon', times: ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM'] },
                          { icon: '🌆', label: 'Evening', times: ['03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'] },
                          { icon: '🌙', label: 'Night', times: ['06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM'] }
                        ].find(s => s.label === selectedTimeSlot)?.times.map((time) => {
                          const isSelected = selectedSpecificTime === time;
                          return (
                            <button
                              key={time}
                              onClick={() => setSelectedSpecificTime(time)}
                              style={{
                                padding: '14px 12px',
                                background: isSelected ? 'linear-gradient(135deg, #10b981, #059669)' : '#ffffff',
                                border: isSelected ? '3px solid #10b981' : '2px solid #e2e8f0',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 700,
                                color: isSelected ? '#ffffff' : '#1e293b',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = '#10b981';
                                  e.currentTarget.style.color = '#10b981';
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                  e.currentTarget.style.color = '#1e293b';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }
                              }}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      if (!user) {
                        alert('Please login to schedule a visit');
                        return;
                      }
                      if (!selectedTimeSlot) {
                        alert('Please select a time slot');
                        return;
                      }
                      
                      try {
                        // Calculate the visit date
                        const visitDate = new Date(Date.now() + selectedDate * 86400000);
                        const formattedDate = visitDate.toISOString().split('T')[0];
                        
                        console.log('Booking data:', {
                          listingId: listing.id,
                          visitDate: formattedDate,
                          timeSlot: selectedTimeSlot,
                          specificTime: selectedSpecificTime || null,
                          notes: `Visit scheduled for ${listing.title}`
                        });
                        
                        // Create booking
                        const response = await api.post('/visit-bookings', {
                          listingId: listing.id,
                          visitDate: formattedDate,
                          timeSlot: selectedTimeSlot,
                          specificTime: selectedSpecificTime || null,
                          notes: `Visit scheduled for ${listing.title}`
                        });
                        
                        console.log('Booking response:', response.data);
                        setVisitScheduled(true);
                      } catch (error: any) {
                        console.error('Booking error:', error);
                        console.error('Error response:', error.response?.data);
                        alert(error.response?.data?.message || 'Failed to schedule visit. Please try again.');
                      }
                    }}
                    disabled={!selectedTimeSlot}
                    style={{
                      width: '100%',
                      padding: '18px',
                      background: selectedTimeSlot 
                        ? 'linear-gradient(135deg, #10b981, #059669)' 
                        : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: selectedTimeSlot ? 'pointer' : 'not-allowed',
                      boxShadow: selectedTimeSlot ? '0 8px 20px rgba(16,185,129,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    Confirm Booking
                  </button>
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px'
                }}>
                  <div style={{ fontSize: 80, marginBottom: 24 }}>✅</div>
                  <h2 style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: '#065f46',
                    marginBottom: 16
                  }}>
                    Visit Scheduled Successfully!
                  </h2>
                  <p style={{
                    fontSize: 18,
                    color: '#047857',
                    marginBottom: 8,
                    fontWeight: 600
                  }}>
                    {selectedTimeSlot}
                  </p>
                  <p style={{
                    fontSize: 15,
                    color: '#64748b',
                    marginBottom: 32,
                    lineHeight: 1.6
                  }}>
                    We'll contact you shortly to confirm your visit to<br />
                    <strong>{listing?.title}</strong>
                  </p>
                  <button
                    onClick={() => {
                      setShowScheduleModal(false);
                      setVisitScheduled(false);
                      setSelectedTimeSlot('');
                      setSelectedDate(0);
                      setSelectedSpecificTime('');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '16px 40px',
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rent Property Modal */}
      {showRentModal && listing?.category === 'property_rent' && (
        <div 
          onClick={() => setShowRentModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
            padding: 20
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 24,
              maxWidth: 600,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              position: 'relative',
              padding: 40
            }}
          >
            <button
              onClick={() => setShowRentModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 24,
                color: '#64748b'
              }}
            >
              ×
            </button>

            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
              🏠 Rent This Property
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
              {listing?.title} - Monthly Rental
            </p>

            {/* Start Date */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                Move-in Date
              </label>
              <input
                type="date"
                value={rentStartDate}
                onChange={(e) => setRentStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 14
                }}
              />
            </div>

            {/* Payment Breakdown */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                💰 Payment Structure
              </h3>
              
              {/* Upfront Payment */}
              <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, border: '2px solid #10b981' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
                  💳 UPFRONT PAYMENT (Pay Now)
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>• Advance Payment (2 months)</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {formatPrice((listing?.price || 0) * 2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>• First Month Rent</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {formatPrice(listing?.price)}
                  </span>
                </div>
                <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>Total Upfront</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>
                    {formatPrice((listing?.price || 0) * 3)}
                  </span>
                </div>
              </div>

              {/* Monthly Rental Info */}
              <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>
                  📋 MONTHLY RENTAL
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Monthly Rent</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {formatPrice(listing?.price)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Rental Type</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    Month-to-Month
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Next Payment</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>
                    Due monthly
                  </span>
                </div>
                <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>Vacate Anytime</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>
                    Pay & Leave
                  </span>
                </div>
              </div>

              {/* Payment Note */}
              <div style={{ background: '#fef3c7', borderRadius: 8, padding: 12, marginTop: 12, border: '1px solid #f59e0b' }}>
                <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.4 }}>
                  <strong>📝 Flexible Rental:</strong> Pay 3 months upfront now (2 months advance + 1st month). 
                  Continue with monthly payments. Want to leave? Just pay current month and vacate anytime!
                </p>
              </div>
            </div>

            <button
              onClick={handleRentProperty}
              disabled={rentProcessing || !rentStartDate}
              style={{
                width: '100%',
                padding: '16px',
                background: rentProcessing || !rentStartDate ? '#94a3b8' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: rentProcessing || !rentStartDate ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
              }}
            >
              {rentProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Buy/Purchase Modal */}
      {showBuyModal && listing && (
        <div 
          onClick={() => setShowBuyModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
            padding: 20
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 24,
              maxWidth: 600,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              position: 'relative',
              padding: 40
            }}
          >
            <button
              onClick={() => setShowBuyModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 24,
                color: '#64748b'
              }}
            >
              ×
            </button>

            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
              🛒 Purchase Item
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
              {listing?.title}
            </p>

            {/* Quantity (for materials, furniture) */}
            {['materials', 'furniture'].includes(listing.category) && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: 600
                  }}
                />
              </div>
            )}

            {/* Delivery Details (not for property) */}
            {listing.category !== 'property_sell' && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
                  Delivery Details
                </h3>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                    Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      placeholder="City"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                      State
                    </label>
                    <input
                      type="text"
                      value={deliveryState}
                      onChange={(e) => setDeliveryState(e.target.value)}
                      placeholder="State"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value)}
                      placeholder="Pincode"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      placeholder="Phone"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Price Summary */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                Price Summary
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Unit Price</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                  {formatPrice(listing?.price)}
                </span>
              </div>
              {buyQuantity > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: '#64748b' }}>Quantity</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    × {buyQuantity}
                  </span>
                </div>
              )}
              <div style={{ height: 1, background: '#e2e8f0', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Total Amount</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>
                  {formatPrice((listing?.price || 0) * buyQuantity)}
                </span>
              </div>
            </div>

            <button
              onClick={handleBuyItem}
              disabled={buyProcessing}
              style={{
                width: '100%',
                padding: '16px',
                background: buyProcessing ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: buyProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
              }}
            >
              {buyProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      )}

      {/* ── Furniture Rental Modal ── */}
      {showFurnitureRentalModal && listing && (
        <div onClick={() => setShowFurnitureRentalModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 24, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', padding: 40, position: 'relative' }}>

            <button onClick={() => setShowFurnitureRentalModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>🛋️ Rent This Item</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>{listing.title} — ₹{listing.price}/month</p>

            {/* Purpose */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                Purpose of Rental <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { value: 'home',   label: '🏠 Home Use',   desc: 'Personal / residential' },
                  { value: 'office', label: '🏢 Office Use',  desc: 'Business / commercial' },
                  { value: 'other',  label: '📝 Other',       desc: 'Specify your reason' },
                ].map(p => (
                  <button key={p.value} type="button" onClick={() => setFurniturePurpose(p.value as 'home' | 'office' | 'other')}
                    style={{ padding: '14px 10px', borderRadius: 12, border: furniturePurpose === p.value ? '2px solid #10b981' : '1.5px solid #e2e8f0', background: furniturePurpose === p.value ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: furniturePurpose === p.value ? '#059669' : '#1e293b', marginBottom: 3 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Other reason text input */}
              {furniturePurpose === 'other' && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    value={furnitureOtherReason}
                    onChange={e => setFurnitureOtherReason(e.target.value)}
                    placeholder="Please describe your reason for renting this item..."
                    rows={3}
                    autoFocus
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #10b981', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', background: '#f0fdf4', color: '#1e293b' }}
                  />
                  {furnitureOtherReason.trim().length === 0 && (
                    <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>⚠️ Please enter your reason</p>
                  )}
                </div>
              )}
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                Rental Duration: <span style={{ color: '#10b981' }}>{furnitureDuration} month{furnitureDuration > 1 ? 's' : ''}</span>
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1, 2, 3, 6, 9, 12].map(m => (
                  <button key={m} type="button" onClick={() => setFurnitureDuration(m)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: furnitureDuration === m ? '2px solid #10b981' : '1.5px solid #e2e8f0', background: furnitureDuration === m ? '#f0fdf4' : '#f8fafc', color: furnitureDuration === m ? '#059669' : '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    {m}M
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
                Total: ₹{((listing.price || 0) * furnitureDuration).toLocaleString()} for {furnitureDuration} month{furnitureDuration > 1 ? 's' : ''}
              </div>
            </div>

            {/* Delivery Address */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Delivery Address <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea value={furnitureAddress} onChange={e => setFurnitureAddress(e.target.value)} placeholder="Full delivery address" rows={2}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', marginBottom: 10 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input value={furnitureCity} onChange={e => setFurnitureCity(e.target.value)} placeholder="City *" style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                <input value={furnitureState} onChange={e => setFurnitureState(e.target.value)} placeholder="State *" style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={furniturePincode} onChange={e => setFurniturePincode(e.target.value)} placeholder="Pincode *" style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                <input value={furniturePhone} onChange={e => setFurniturePhone(e.target.value)} placeholder="Phone (optional)" style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Additional Notes (optional)</label>
              <textarea value={furnitureNotes} onChange={e => setFurnitureNotes(e.target.value)} placeholder="Any specific requirements or instructions for admin..." rows={2}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
            </div>

            <button onClick={handleFurnitureRental} disabled={furnitureProcessing}
              style={{ width: '100%', padding: '15px', background: furnitureProcessing ? '#94a3b8' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: furnitureProcessing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              {furnitureProcessing ? 'Submitting...' : '📋 Submit Rental Request'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 10 }}>No payment now — admin will confirm and contact you within 24 hours</p>
          </div>
        </div>
      )}

      {/* ── Property Buy Request Modal ── */}
      {showPropertyBuyModal && listing?.category === 'property_sell' && (
        <div onClick={() => setShowPropertyBuyModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: 20 }}>
          
          <div onClick={(e) => e.stopPropagation()}
            style={{ 
              background: '#ffffff', 
              borderRadius: 20, 
              padding: 32, 
              width: '100%', 
              maxWidth: 500, 
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
            
            {/* Close Button */}
            <button
              onClick={() => setShowPropertyBuyModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 18,
                color: '#64748b'
              }}
            >
              ×
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Buy Property Request
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                Submit your interest to purchase this property. Admin will review and contact you with further details.
              </p>
            </div>

            {/* Property Info */}
            <div style={{ 
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 24,
              border: '1px solid #bae6fd'
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <img 
                  src={listing.images?.[0] || 'https://placehold.co/80x60/e5e7eb/6b7280?text=Property'} 
                  alt={listing.title}
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {listing.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                    {listing.location}, {listing.city}
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>
                    {formatPrice(listing.price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: 8 
              }}>
                Message to Admin *
              </label>
              <textarea
                value={buyerMessage}
                onChange={(e) => setBuyerMessage(e.target.value)}
                placeholder="Please share your interest, timeline, and any specific requirements..."
                rows={4}
                style={{
                  width: '100%',
                  border: '2px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  color: '#0f172a',
                  background: '#ffffff',
                  minHeight: 100
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                This message will be sent to admin along with your contact details.
              </p>
            </div>

            {/* Info Box */}
            <div style={{ 
              background: '#fef3c7', 
              border: '1px solid #fbbf24', 
              borderRadius: 10, 
              padding: 16, 
              marginBottom: 24 
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                📋 What happens next?
              </h4>
              <ul style={{ fontSize: 13, color: '#78350f', margin: 0, paddingLeft: 16 }}>
                <li>Admin will review your request within 24 hours</li>
                <li>You'll be contacted for property viewing and negotiation</li>
                <li>Upon agreement, legal documents will be prepared</li>
                <li>Property will be removed from listings once sold</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowPropertyBuyModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePropertyBuyRequest}
                disabled={propertyBuyProcessing || !buyerMessage.trim()}
                style={{
                  flex: 2,
                  padding: '14px 20px',
                  background: propertyBuyProcessing || !buyerMessage.trim() 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: propertyBuyProcessing || !buyerMessage.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {propertyBuyProcessing ? (
                  <>
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    🏠 Submit Buy Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Leisure Lease Modal ── */}
      {showLeisureLeaseModal && listing?.category === 'property_rent' && listing?.isLeisure && (
        <div onClick={() => setShowLeisureLeaseModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: 20 }}>
          
          <div onClick={(e) => e.stopPropagation()}
            style={{ 
              background: '#ffffff', 
              borderRadius: 20, 
              padding: 32, 
              width: '100%', 
              maxWidth: 500, 
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
            
            <button
              onClick={() => setShowLeisureLeaseModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 18,
                color: '#64748b'
              }}
            >
              ×
            </button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏖️</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                Leisure Property Lease
              </h2>
              <p style={{ fontSize: 14, color: '#64748b' }}>
                {listing.title} — ₹{listing.price?.toLocaleString()}/month
              </p>
            </div>

            <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, marginBottom: 24, border: '1px solid #bae6fd' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0369a1', marginBottom: 8 }}>
                🏖️ What is a Leisure Lease?
              </h3>
              <ul style={{ fontSize: 13, color: '#0369a1', margin: 0, paddingLeft: 16, lineHeight: 1.5 }}>
                <li>Full year commitment with upfront payment</li>
                <li>Perfect for vacation homes and seasonal properties</li>
                <li>Total cost: ₹{((listing.price || 0) * 12).toLocaleString()} for the entire year</li>
                <li>Exclusive access for the selected year</li>
              </ul>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Lease Year *
                </label>
                <select
                  value={leisureLeaseYear}
                  onChange={(e) => setLeisureLeaseYear(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none',
                    background: '#f8fafc'
                  }}
                >
                  <option value={new Date().getFullYear()}>
                    {new Date().getFullYear()}
                  </option>
                  <option value={new Date().getFullYear() + 1}>
                    {new Date().getFullYear() + 1}
                  </option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Lease Start Date *
                </label>
                <input
                  type="date"
                  value={leisureStartDate}
                  onChange={(e) => setLeisureStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none',
                    background: '#f8fafc'
                  }}
                />
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                💰 Payment Summary
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Monthly Rent:</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  ₹{listing.price?.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Duration:</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>12 months</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Total Amount:</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0369a1' }}>
                  ₹{((listing.price || 0) * 12).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowLeisureLeaseModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLeisureLease}
                disabled={leisureProcessing || !leisureStartDate}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: leisureProcessing || !leisureStartDate 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #0ea5e9, #0369a1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: leisureProcessing || !leisureStartDate 
                    ? 'not-allowed' 
                    : 'pointer'
                }}
              >
                {leisureProcessing ? 'Processing...' : '🏖️ Proceed to Payment'}
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 16, lineHeight: 1.4 }}>
              By proceeding, you agree to lease this property for the full year with upfront payment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
