import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, Edit } from 'lucide-react';
import api from '../api';
import { Listing } from '../types';
import { useAuthStore } from '../store/authStore';

const formatPrice = (price?: number) => {
  if (!price) return 'Price on Request';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString()}`;
};

export default function MyListingsPage() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/listings', { params: { limit: 50 } });
    setListings(data.listings.filter((l: Listing) => l.seller?.id === user?.id || (l as any).userId === user?.id));
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const deleteListing = async (id: number) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/listings/${id}`);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  if (!user) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Link to="/login" style={{ color: '#6366f1', fontWeight: 700, fontSize: 16 }}>Login to view your listings</Link>
    </div>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', padding: '32px 32px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>My Listings</h1>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>{listings.length} active listings</p>
          </div>
          {user?.role === 'admin' && (
            <Link to="/post-ad"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
              <Plus size={16} /> Post New Ad
            </Link>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ height: 80, background: '#e2e8f0', borderRadius: 12 }} />)}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 16 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No listings yet</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Post your first ad and reach thousands of buyers</p>
            <Link to="/post-ad" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Post Free Ad</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {listings.map(l => (
              <div key={l.id} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <img src={l.images?.[0] || 'https://placehold.co/80x60/1e1b4b/818cf8?text=NB'} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{l.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>{l.city} • {l.category?.replace('_', ' ')}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#6366f1', marginTop: 2 }}>{formatPrice(l.price)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13 }}>
                  <Eye size={14} /> {l.views || 0} views
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/listing/${l.id}`}
                    style={{ padding: '7px 14px', background: '#eef2ff', color: '#4f46e5', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    View
                  </Link>
                  <button onClick={() => deleteListing(l.id)}
                    style={{ padding: '7px 12px', background: '#fef2f2', color: '#e53e3e', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

