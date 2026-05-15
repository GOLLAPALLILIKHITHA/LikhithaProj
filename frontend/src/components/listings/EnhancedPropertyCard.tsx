import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Car, Home, Calendar, Eye, X, Phone, MessageCircle } from 'lucide-react';
import { Listing } from '../../types';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../api';

interface EnhancedPropertyCardProps {
  listing: Listing;
}

export default function EnhancedPropertyCard({ listing }: EnhancedPropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [visitScheduled, setVisitScheduled] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { items, toggle } = useWishlistStore();
  const { user } = useAuthStore();
  const isWishlisted = items.some((item: any) => item.id === listing.id);

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ['/api/placeholder/400/300'];

  const formatPrice = (price: number | undefined) => {
    if (!price) return '₹0';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const formatPricePerSqft = (price: number | undefined, area: number | undefined) => {
    if (!area || !price) return '';
    const pricePerSqft = price / area;
    return `₹${Math.round(pricePerSqft).toLocaleString()} per sq.ft.`;
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(listing as any);
  };

  const handleScheduleVisit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to schedule a visit');
      return;
    }
    setShowModal(true);
  };

  const handleContactSeller = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to contact seller');
      return;
    }
    setShowModal(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
    <div style={{
      background: '#ffffff',
      borderRadius: 20,
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
    }}
    >
      <Link to={`/listing/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Image Section */}
        <div style={{
          position: 'relative',
          height: 240,
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          overflow: 'hidden'
        }}>
          <img
            src={images[currentImageIndex]}
            alt={listing.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLImageElement).style.transform = 'scale(1)';
            }}
          />
          
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
            pointerEvents: 'none'
          }} />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.95)',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 18,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.95)',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 18,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ›
              </button>
              <div style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                background: 'rgba(0,0,0,0.75)',
                color: '#ffffff',
                fontSize: 11,
                padding: '5px 10px',
                borderRadius: 16,
                fontWeight: 600,
                backdropFilter: 'blur(8px)'
              }}>
                📷 {currentImageIndex + 1}/{images.length}
              </div>
            </>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Heart
              size={18}
              style={{
                color: isWishlisted ? '#ef4444' : '#64748b',
                fill: isWishlisted ? '#ef4444' : 'none',
                transition: 'all 0.2s'
              }}
            />
          </button>

          {/* Property Tour Badge */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: '#ffffff',
            fontSize: 12,
            padding: '8px 14px',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(5,150,105,0.4)',
            backdropFilter: 'blur(8px)'
          }}>
            <Eye size={14} />
            {listing.category === 'property_sell' || listing.category === 'property_rent' 
              ? 'Property tour available!' 
              : 'Available for viewing!'
            }
          </div>

          {/* Featured Badge */}
          {listing.isFeatured && (
            <div style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              fontSize: 11,
              padding: '6px 12px',
              borderRadius: 16,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
              backdropFilter: 'blur(8px)'
            }}>
              ⭐ Featured
            </div>
          )}
        </div>

        {/* Content Section */}
        <div style={{ padding: '24px' }}>
          {/* Price and EMI */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <div>
              <div style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#1e293b',
                marginBottom: 4,
                letterSpacing: '-0.5px'
              }}>
                {formatPrice(listing.price)}
              </div>
              {listing.category === 'property_sell' && listing.area && (
                <div style={{
                  fontSize: 12,
                  color: '#64748b',
                  fontWeight: 500
                }}>
                  {formatPricePerSqft(listing.price, listing.area)}
                </div>
              )}
            </div>
            {(listing.category === 'property_sell' || listing.category === 'property_rent') && (
              <div style={{ 
                textAlign: 'right',
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                padding: '8px 12px',
                borderRadius: 10
              }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#047857',
                  marginBottom: 2
                }}>
                  {listing.category === 'property_sell' 
                    ? `₹${Math.round((listing.price || 0) * 0.0008).toLocaleString()}/Month`
                    : `₹${(listing.price || 0).toLocaleString()}/Month`
                  }
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#065f46',
                  fontWeight: 600
                }}>
                  {listing.category === 'property_sell' ? 'Estimated EMI' : 'Rent'}
                </div>
              </div>
            )}
          </div>

          {/* Title and Location */}
          <h3 style={{
            fontSize: 17,
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: 10,
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {listing.title}
          </h3>
          <div style={{
            fontSize: 13,
            color: '#64748b',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <MapPin size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {listing.location}
            </span>
          </div>

          {/* Property Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 20,
            padding: '18px 0',
            borderTop: '2px solid #f1f5f9',
            borderBottom: '2px solid #f1f5f9'
          }}>
            {listing.category === 'property_sell' || listing.category === 'property_rent' ? (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    margin: '0 auto 8px'
                  }}>
                    <MapPin size={16} style={{ color: '#3b82f6' }} />
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 3
                  }}>
                    {listing.facing || 'North'}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    Facing
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                    margin: '0 auto 8px'
                  }}>
                    <Bath size={16} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 3
                  }}>
                    {listing.bathrooms || 2}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    Bathrooms
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    margin: '0 auto 8px'
                  }}>
                    <Home size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 3
                  }}>
                    {listing.bedrooms ? `${listing.bedrooms} BHK` : '2 BHK'}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    Type
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                    margin: '0 auto 8px'
                  }}>
                    <Car size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 3
                  }}>
                    {listing.parking || 'Available'}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    Parking
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    margin: '0 auto 8px'
                  }}>
                    <Home size={16} style={{ color: '#3b82f6' }} />
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 3
                  }}>
                    {listing.subCategory || 'Item'}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    Category
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                    margin: '0 auto 8px'
                  }}>
                    <Calendar size={16} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 3
                  }}>
                    {listing.condition || 'Good'}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    Condition
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    margin: '0 auto 8px'
                  }}>
                    <Eye size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 3
                  }}>
                    {listing.brand || 'Brand'}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    Brand
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                    margin: '0 auto 8px'
                  }}>
                    <MapPin size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 3
                  }}>
                    Available
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    Status
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons - Outside Link to prevent navigation */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            to={`/listing/${listing.id}`}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: '#ffffff',
              border: 'none',
              padding: '14px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 6px 16px rgba(5, 150, 105, 0.35)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '0.3px'
            }}
          >
            {listing.category === 'property_sell' || listing.category === 'property_rent'
              ? 'View Property'
              : 'View Details'
            }
          </Link>
        </div>
      </div>
    </div>

    </>
  );
}
