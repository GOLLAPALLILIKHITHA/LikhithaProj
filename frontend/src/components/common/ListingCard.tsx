import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, BadgeCheck, ChevronLeft, ChevronRight, Phone, Eye, MessageCircle } from 'lucide-react';
import { Listing } from '../../types';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';

interface Props { listing: Listing; }

const formatPrice = (price?: number) => {
  if (!price) return 'Price on Request';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString()}`;
};

export default function ListingCard({ listing }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const { items, toggle } = useWishlistStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isSaved = items.includes(listing.id);
  const images = listing.images?.length > 0 ? listing.images : ['https://placehold.co/400x220/1e1b4b/818cf8?text=INFRAALL'];

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { alert('Please login to save listings'); return; }
    toggle(listing.id);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { 
      alert('Please login to chat with seller'); 
      navigate('/login');
      return; 
    }
    navigate(`/chat?sellerId=${listing.sellerId}&listingId=${listing.id}`);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { 
      alert('Please login to view contact details'); 
      navigate('/login');
      return; 
    }
    setShowPhone(true);
  };

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s', transform: hovered ? 'translateY(-3px)' : 'none' }}>

      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f1f5f9' }}>
        <img src={images[imgIndex]} alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} />

        {hovered && images.length > 1 && (
          <>
            <button onClick={(e) => { e.preventDefault(); setImgIndex((imgIndex - 1 + images.length) % images.length); }}
              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={(e) => { e.preventDefault(); setImgIndex((imgIndex + 1) % images.length); }}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <ChevronRight size={14} />
            </button>
          </>
        )}

        <button onClick={handleWishlist}
          style={{ position: 'absolute', top: 10, right: 10, background: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <Heart size={15} fill={isSaved ? '#e53e3e' : 'none'} color={isSaved ? '#e53e3e' : '#94a3b8'} />
        </button>

        {listing.isFeatured && (
          <span style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
            ⭐ Featured
          </span>
        )}

        {listing.seller?.isVerified && (
          <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(16,185,129,0.9)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <BadgeCheck size={11} /> Verified
          </span>
        )}

        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Eye size={11} /> {listing.views || 0}
        </div>
      </div>

      {/* Body */}
      <Link to={`/listing/${listing.id}`} style={{ display: 'block', padding: '16px', textDecoration: 'none' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }} className="line-clamp-2">
          {listing.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <MapPin size={13} color="#6366f1" />
          <span style={{ fontSize: 13, color: '#64748b' }}>{listing.location ? `${listing.location}, ` : ''}{listing.city}</span>
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          {formatPrice(listing.price)}
          {listing.priceType === 'per_month' && <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>/mo</span>}
          {listing.priceType === 'negotiable' && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginLeft: 6, background: '#d1fae5', padding: '2px 6px', borderRadius: 4 }}>Negotiable</span>}
        </div>

        {(listing.area || listing.bedrooms) && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
            {listing.bedrooms && <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>🛏 {listing.bedrooms} BHK</span>}
            {listing.bathrooms && <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>🚿 {listing.bathrooms}</span>}
            {listing.area && <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>📐 {listing.area} {listing.areaUnit || 'sqft'}</span>}
          </div>
        )}

        {/* Seller Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#ffffff', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/logo.png" style={{ width: '90%', height: '90%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>INFRAALL</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Contact via chat</div>
          </div>
          <span style={{ fontSize: 10, color: '#f97316', background: 'rgba(249,115,22,0.1)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>✓ Official</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={handleCall}
            style={{ 
              flex: 1, 
              border: '1.5px solid #6366f1', 
              background: showPhone ? '#6366f1' : '#fff', 
              color: showPhone ? '#fff' : '#6366f1', 
              padding: '9px 0', 
              borderRadius: 8, 
              fontSize: 13, 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              transition: 'all 0.2s'
            }}>
            <Phone size={12} /> {showPhone ? 'Call Now' : 'Show Phone'}
          </button>
          <button 
            onClick={handleChat}
            style={{ 
              flex: 1, 
              border: 'none', 
              background: 'linear-gradient(135deg,#10b981,#059669)', 
              color: '#fff', 
              padding: '9px 0', 
              borderRadius: 8, 
              fontSize: 13, 
              fontWeight: 600, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 5 
            }}>
            <MessageCircle size={12} /> Chat
          </button>
        </div>
      </Link>
    </div>
  );
}

