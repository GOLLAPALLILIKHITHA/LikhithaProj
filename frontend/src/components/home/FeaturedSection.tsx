import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Listing } from '../../types';
import ListingCard from '../common/ListingCard';
import api from '../../api';

interface Props { title: string; subtitle?: string; category: string; viewAllPath?: string; bgGray?: boolean; alwaysShow?: boolean; }

const cityTabs = ['All', 'Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Noida', 'Gurgaon', 'Hyderabad', 'Lucknow', 'Kolkata'];

export default function FeaturedSection({ title, subtitle, category, viewAllPath, bgGray, alwaysShow }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState('All');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { 
          category, 
          limit: '10',
          _t: Date.now().toString() // Cache buster
        };
        if (activeCity !== 'All') params.city = activeCity;
        
        console.log('FeaturedSection fetching listings with params:', params);
        const { data } = await api.get('/listings', { params });
        console.log('FeaturedSection received listings:', data);
        
        setListings(data.listings || []);
      } catch (error) { 
        console.error('FeaturedSection error fetching listings:', error);
        setListings([]); 
      }
      finally { setLoading(false); }
    };
    fetchData();
  }, [category, activeCity]);

  // Don't render anything if no listings and not loading (unless alwaysShow)
  if (!alwaysShow && !loading && listings.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <section style={{ background: bgGray ? '#f8f9fa' : '#fff', padding: '40px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 13, color: '#64748b' }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {viewAllPath && (
              <Link to={viewAllPath}
                style={{ fontSize: 13, color: '#6366f1', border: '1.5px solid #6366f1', padding: '5px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
                View All →
              </Link>
            )}
            <button onClick={() => scroll('left')}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronLeft size={16} color="#374151" />
            </button>
            <button onClick={() => scroll('right')}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronRight size={16} color="#374151" />
            </button>
          </div>
        </div>

        {/* City Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
          {cityTabs.map(c => (
            <button key={c} onClick={() => setActiveCity(c)}
              style={{ padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: activeCity === c ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#f1f5f9', color: activeCity === c ? '#fff' : '#475569', boxShadow: activeCity === c ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'flex', gap: 20 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ minWidth: 300, height: 340, background: '#f1f5f9', borderRadius: 14, flexShrink: 0 }} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 0', background: '#f8f9fa', borderRadius: 16, border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏠</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#475569', marginBottom: 6 }}>No listings yet</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Be the first to post in this category!</p>
            <Link to="/post-ad"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '10px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
              Post Free Ad
            </Link>
          </div>
        ) : (
          <div ref={scrollRef} style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
            {listings.map(listing => (
              <div key={listing.id} style={{ minWidth: 300, maxWidth: 300, flexShrink: 0 }}>
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

