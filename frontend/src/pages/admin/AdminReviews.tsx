import { useEffect, useState } from 'react';
import { Trash2, Star, Search, User, MapPin, IndianRupee, Package } from 'lucide-react';
import api from '../../api';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  Listing: {
    id: number;
    title: string;
    category: string;
    price: number;
    city: string;
  };
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadReviews();
  }, [search, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/reviews?search=${search}&page=${currentPage}&limit=10`, { headers });
      setReviews(data.reviews);
      setTotalReviews(data.total);
    } catch (err) {
      console.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Delete this review? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/reviews/${id}`, { headers });
      loadReviews();
    } catch (err) {
      console.error('Failed to delete review');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const totalPages = Math.ceil(totalReviews / 10);

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>
          Reviews Management
        </h1>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          {totalReviews} total reviews • Monitor user feedback and ratings
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search reviews by comment..."
            style={{
              width: '100%',
              background: '#fff',
              border: '1px solid #fed7aa',
              borderRadius: 10,
              padding: '12px 14px 12px 42px',
              fontSize: 14,
              outline: 'none',
              color: '#7c2d12'
            }}
          />
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} style={{ 
              height: 120, 
              background: '#fff', 
              borderRadius: 12, 
              border: '1px solid #fed7aa',
              animation: 'pulse 2s infinite'
            }} />
          ))
        ) : reviews.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0', 
            color: '#92400e',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #fed7aa'
          }}>
            <Star size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: 16, marginBottom: 4 }}>No reviews found</p>
            <p style={{ fontSize: 14, opacity: 0.7 }}>
              {search ? 'Try adjusting your search terms' : 'Reviews will appear here once users start rating properties'}
            </p>
          </div>
        ) : (
          reviews.map(review => (
            <div 
              key={review.id} 
              style={{ 
                background: '#fff', 
                borderRadius: 12, 
                padding: '20px', 
                border: '1px solid #fed7aa',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedReview(review)}
            >
              <div style={{ display: 'flex', gap: 16 }}>
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
                  fontSize: 16, 
                  flexShrink: 0 
                }}>
                  {review.reviewer?.name?.[0]?.toUpperCase() || 'U'}
                </div>

                <div style={{ flex: 1 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#7c2d12' }}>
                        {review.reviewer?.name || 'Unknown User'}
                      </span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < review.rating ? '#fbbf24' : 'none'} 
                            color={i < review.rating ? '#fbbf24' : '#fed7aa'} 
                          />
                        ))}
                      </div>
                      <span style={{ 
                        fontSize: 12, 
                        color: '#fff',
                        background: '#10b981',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontWeight: 500
                      }}>
                        {review.rating}/5
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#92400e' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Property Info */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16, 
                    marginBottom: 12,
                    padding: '8px 12px',
                    background: '#fff7ed',
                    borderRadius: 8,
                    border: '1px solid #fed7aa'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Package size={14} color="#ea580c" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#ea580c' }}>
                        {review.Listing?.title || 'Unknown Property'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color="#64748b" />
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {review.Listing?.city || 'Unknown City'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IndianRupee size={14} color="#059669" />
                      <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                        {review.Listing?.price ? formatPrice(review.Listing.price) : 'Price not available'}
                      </span>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <p style={{ 
                    fontSize: 14, 
                    color: '#374151', 
                    lineHeight: 1.6,
                    marginBottom: 12,
                    fontStyle: review.comment ? 'normal' : 'italic'
                  }}>
                    {review.comment || 'No comment provided'}
                  </p>

                  {/* User Contact Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={12} />
                      <span>{review.reviewer?.email}</span>
                    </div>
                    {review.reviewer?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>📞</span>
                        <span>{review.reviewer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReview(review.id);
                    }}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: 8, 
                      border: 'none', 
                      background: 'rgba(239,68,68,0.1)', 
                      color: '#dc2626', 
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 8, 
          marginTop: 24 
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #fed7aa',
              background: currentPage === 1 ? '#f3f4f6' : '#fff',
              color: currentPage === 1 ? '#9ca3af' : '#7c2d12',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <span style={{ fontSize: 14, color: '#64748b', padding: '0 16px' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #fed7aa',
              background: currentPage === totalPages ? '#f3f4f6' : '#fff',
              color: currentPage === totalPages ? '#9ca3af' : '#7c2d12',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}


