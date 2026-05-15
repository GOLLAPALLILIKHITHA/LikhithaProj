import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import api from '../api';
import { Listing } from '../types';
import ListingCard from '../components/common/ListingCard';

const categoryLabels: Record<string, string> = {
  property_sell: 'Properties for Sale',
  property_rent: 'Properties for Rent',
  furniture: 'Furniture',
  services: 'Home Services',
  materials: 'Building Materials',
};

const subCategories: Record<string, string[]> = {
  property_sell: ['Apartment', 'Villa', 'Plot', 'Office', 'Shop', 'New Project'],
  property_rent: ['House', 'Apartment', 'PG/Hostel', 'Commercial', 'Short-Term'],
  furniture: ['Living Room', 'Bedroom', 'Kitchen & Dining', 'Office', 'Outdoor'],
  services: ['Interior Design', 'Painting', 'Plumbing', 'Electrical', 'Cleaning', 'Pest Control', 'Moving & Packing'],
  materials: ['Cement & Concrete', 'Steel & Iron', 'Bricks & Blocks', 'Tiles & Flooring', 'Paints', 'Plumbing Materials', 'Electrical Materials'],
};

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const search = searchParams.get('search') || '';
  const subCategory = searchParams.get('subCategory') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Force refresh function
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { 
          page: String(page), 
          limit: '12',
          _t: Date.now().toString() // Cache buster
        };
        if (category) params.category = category;
        if (city) params.city = city;
        if (search) params.search = search;
        if (subCategory) params.subCategory = subCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        
        console.log('Fetching listings with params:', params);
        const { data } = await api.get('/listings', { params });
        console.log('Received listings:', data);
        
        setListings(data.listings);
        setTotal(data.total);
        setPages(data.pages);
      } catch (error) { 
        console.error('Error fetching listings:', error);
        setListings([]); 
      }
      finally { setLoading(false); }
    };
    fetchListings();
  }, [category, city, search, subCategory, minPrice, maxPrice, page, refreshKey]);

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const inputStyle = { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#0f172a', background: '#f8fafc' };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', padding: '32px 32px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
              {categoryLabels[category] || 'All Listings'}
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>{total} results found{city ? ` in ${city}` : ''}</p>
          </div>
          <button 
            onClick={forceRefresh}
            style={{ 
              background: 'linear-gradient(135deg,#10b981,#059669)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '10px 20px', 
              fontSize: 14, 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px' }}>
        {/* Filter Bar */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', background: '#f8fafc' }}>
            <Search size={16} color="#94a3b8" />
            <input placeholder="Search listings..." defaultValue={search}
              onKeyDown={(e) => { if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value); }}
              style={{ border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: '#0f172a', width: '100%' }} />
          </div>

          {/* City */}
          <input placeholder="City" defaultValue={city}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParam('city', (e.target as HTMLInputElement).value); }}
            style={{ ...inputStyle, width: 140 }} />

          {/* Min Price */}
          <input type="number" placeholder="Min ₹" defaultValue={minPrice}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParam('minPrice', (e.target as HTMLInputElement).value); }}
            style={{ ...inputStyle, width: 120 }} />

          {/* Max Price */}
          <input type="number" placeholder="Max ₹" defaultValue={maxPrice}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParam('maxPrice', (e.target as HTMLInputElement).value); }}
            style={{ ...inputStyle, width: 120 }} />

          {/* Clear */}
          {(city || minPrice || maxPrice || search || subCategory) && (
            <button onClick={() => setSearchParams(category ? { category } : {})}
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#e53e3e', background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Sub Category Pills */}
        {category && subCategories[category] && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <button onClick={() => updateParam('subCategory', '')}
              style={{ padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: !subCategory ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#f1f5f9', color: !subCategory ? '#fff' : '#475569', boxShadow: !subCategory ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
              All
            </button>
            {subCategories[category].map(s => (
              <button key={s} onClick={() => updateParam('subCategory', s)}
                style={{ padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: subCategory === s ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#f1f5f9', color: subCategory === s ? '#fff' : '#475569', boxShadow: subCategory === s ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ height: 320, background: '#e2e8f0', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 16 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No listings found</h3>
            <p style={{ fontSize: 14, color: '#64748b' }}>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => updateParam('page', String(i + 1))}
                style={{ width: 40, height: 40, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', background: page === i + 1 ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#f1f5f9', color: page === i + 1 ? '#fff' : '#475569', boxShadow: page === i + 1 ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

