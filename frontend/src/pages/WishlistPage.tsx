import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import api from '../api';
import ListingCard from '../components/common/ListingCard';
import { useAuthStore } from '../store/authStore';

export default function WishlistPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/wishlist').then(({ data }) => setItems(data)).finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 64 }}>❤️</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Login to view your wishlist</h2>
      <Link to="/login" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '12px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Login</Link>
    </div>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', padding: '32px 32px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Heart size={28} fill="#e53e3e" color="#e53e3e" />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>My Wishlist</h1>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>{items.length} saved items</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: 320, background: '#e2e8f0', borderRadius: 14 }} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 16 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💔</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No saved items yet</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Start saving listings you love</p>
            <Link to="/" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Browse Listings</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {items.map(item => item.Listing && <ListingCard key={item.id} listing={item.Listing} />)}
          </div>
        )}
      </div>
    </div>
  );
}

