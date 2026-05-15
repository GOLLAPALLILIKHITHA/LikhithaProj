import { useEffect, useState } from 'react';
import { Search, Star, Trash2, Eye, CheckCircle, UserPlus } from 'lucide-react';
import api from '../../api';

const formatPrice = (price?: number) => {
  if (!price) return '—';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString()}`;
};

export default function AdminListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/listings', { params: { search, category } });
      setListings(data.listings || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, category]);

  const toggleFeatured = async (id: number, isFeatured: boolean) => {
    try {
      await api.put(`/admin/listings/${id}`, { isFeatured });
      setListings(prev => prev.map(l => l.id === id ? { ...l, isFeatured } : l));
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const toggleVerified = async (id: number, isVerified: boolean) => {
    try {
      await api.put(`/admin/listings/${id}`, { isVerified });
      setListings(prev => prev.map(l => l.id === id ? { ...l, isVerified } : l));
    } catch (error) {
      console.error('Error toggling verified:', error);
    }
  };

  const deleteListing = async (id: number) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/admin/listings/${id}`);
      setListings(prev => prev.filter(l => l.id !== id));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const openAssignModal = async (listing: any) => {
    setSelectedListing(listing);
    setShowAssignModal(true);
    // Fetch vendors
    try {
      const { data } = await api.get('/admin/vendors');
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    }
  };

  const assignVendor = async (vendorId: number | null) => {
    if (!selectedListing) return;
    setAssignLoading(true);
    try {
      await api.put(`/admin/listings/${selectedListing.id}`, { vendorId });
      setListings(prev => prev.map(l => 
        l.id === selectedListing.id 
          ? { ...l, assignedVendor: vendors.find(v => v.id === vendorId) || null, vendorId } 
          : l
      ));
      setShowAssignModal(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Error assigning vendor:', error);
      alert('Failed to assign vendor');
    } finally {
      setAssignLoading(false);
    }
  };

  const categories = ['', 'property_sell', 'property_rent', 'furniture', 'services', 'materials', 'vehicles'];

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>Listings</h1>
          <p style={{ fontSize: 14, color: '#92400e' }}>{total} total listings</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 16px' }}>
            <Search size={16} color="#64748b" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#7c2d12', fontSize: 14, width: 180 }} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ background: '#fff', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 14px', color: '#7c2d12', fontSize: 14, outline: 'none' }}>
            {categories.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fed7aa', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #fed7aa' }}>
              {['Listing', 'Category', 'Price', 'City', 'Seller', 'Vendor', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} style={{ padding: 16 }}><div style={{ height: 20, background: '#fed7aa', borderRadius: 4 }} /></td></tr>
              ))
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#92400e' }}>
                  No listings found. {search || category ? 'Try adjusting your filters.' : 'Create your first listing!'}
                </td>
              </tr>
            ) : listings.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={l.images?.[0] || 'https://placehold.co/44x32/1e1b4b/818cf8?text=NB'} style={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 6 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#7c2d12', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600 }}>
                    {l.category?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#a5b4fc' }}>{formatPrice(l.price)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#92400e' }}>{l.city || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#92400e' }}>{l.seller?.name || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
                  {l.assignedVendor ? (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{l.assignedVendor.businessName}</div>
                      <div style={{ fontSize: 10, color: '#a3a3a3' }}>{l.assignedVendor.vendorType.replace('_', ' ')}</div>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {l.isFeatured && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontWeight: 600 }}>⭐ Featured</span>}
                    {l.isVerified && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600 }}>✓ Verified</span>}
                    {!l.isFeatured && !l.isVerified && <span style={{ fontSize: 11, color: '#92400e' }}>Normal</span>}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => openAssignModal(l)} title="Assign Vendor"
                      style={{ padding: '5px 8px', borderRadius: 6, border: 'none', background: 'rgba(99,102,241,0.15)', color: '#6366f1', cursor: 'pointer' }}>
                      <UserPlus size={13} />
                    </button>
                    <button onClick={() => toggleFeatured(l.id, !l.isFeatured)} title={l.isFeatured ? 'Unfeature' : 'Feature'}
                      style={{ padding: '5px 8px', borderRadius: 6, border: 'none', background: l.isFeatured ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.15)', color: l.isFeatured ? '#fbbf24' : '#64748b', cursor: 'pointer' }}>
                      <Star size={13} fill={l.isFeatured ? '#fbbf24' : 'none'} />
                    </button>
                    <button onClick={() => toggleVerified(l.id, !l.isVerified)} title={l.isVerified ? 'Unverify' : 'Verify'}
                      style={{ padding: '5px 8px', borderRadius: 6, border: 'none', background: l.isVerified ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', color: l.isVerified ? '#10b981' : '#64748b', cursor: 'pointer' }}>
                      <CheckCircle size={13} />
                    </button>
                    <button onClick={() => deleteListing(l.id)}
                      style={{ padding: '5px 8px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#dc2626', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Vendor Modal */}
      {showAssignModal && selectedListing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>
              Assign Vendor to: {selectedListing.title}
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#7c2d12', marginBottom: 8 }}>
                <strong>Category:</strong> {selectedListing.category.replace('_', ' ')}
              </div>
              <div style={{ fontSize: 14, color: '#7c2d12', marginBottom: 8 }}>
                <strong>Current Vendor:</strong> {selectedListing.assignedVendor ? selectedListing.assignedVendor.businessName : 'None'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: '#7c2d12', marginBottom: 12 }}>Available Vendors</h4>
              <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #fed7aa', borderRadius: 8 }}>
                <div style={{
                  padding: '12px 16px',
                  background: '#fff7ed',
                  borderBottom: '1px solid #fed7aa',
                  cursor: 'pointer',
                  color: '#92400e',
                  fontWeight: 600
                }} onClick={() => assignVendor(null)}>
                  ❌ Remove Assignment
                </div>
                {vendors.map((vendor: any) => (
                  <div key={vendor.id} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #fed7aa',
                    cursor: 'pointer',
                    color: '#7c2d12'
                  }} onClick={() => assignVendor(vendor.id)}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{vendor.businessName}</div>
                    <div style={{ fontSize: 12, color: '#92400e' }}>
                      {vendor.contactPerson} • {vendor.vendorType.replace('_', ' ')} • {vendor.city}
                    </div>
                    <div style={{ fontSize: 11, color: '#a3a3a3' }}>
                      {vendor.categories.slice(0, 3).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  background: 'white',
                  color: '#92400e',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 8,
                  background: assignLoading ? '#ccc' : '#f97316',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: assignLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {assignLoading ? 'Assigning...' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


