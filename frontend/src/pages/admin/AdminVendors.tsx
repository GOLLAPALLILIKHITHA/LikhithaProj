import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Store, Package, Wrench, UserPlus } from 'lucide-react';
import api from '../../api';

interface Vendor {
  id: number;
  businessName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  vendorType: 'building_materials' | 'home_services';
  city: string;
  locality: string;
  state: string;
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  categories: string[];
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  verifiedVendors: number;
  buildingMaterialVendors: number;
  homeServiceVendors: number;
}

export default function AdminVendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<VendorStats>({
    totalVendors: 0,
    activeVendors: 0,
    verifiedVendors: 0,
    buildingMaterialVendors: 0,
    homeServiceVendors: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    locality: '',
    isVerified: '',
    isActive: ''
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'building_materials' | 'home_services'>('all');

  useEffect(() => {
    fetchVendors();
    fetchStats();
  }, [search, filters, page, activeTab]);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      // Add vendor type filter based on active tab
      if (activeTab !== 'all') {
        params.set('vendorType', activeTab);
      }

      const response = await api.get(`/admin/vendors?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVendors(response.data.vendors);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/vendors/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching vendor stats:', err);
    }
  };

  const toggleVendorStatus = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/admin/vendors/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVendors();
      fetchStats();
    } catch (err) {
      console.error('Error toggling vendor status:', err);
    }
  };

  const toggleVendorVerification = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/admin/vendors/${id}/toggle-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVendors();
      fetchStats();
    } catch (err) {
      console.error('Error toggling vendor verification:', err);
    }
  };

  const deleteVendor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVendors();
      fetchStats();
    } catch (err) {
      console.error('Error deleting vendor:', err);
    }
  };

  const assignVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowAssignModal(true);
  };

  const getVendorTypeIcon = (type: string) => {
    return type === 'building_materials' ? Package : Wrench;
  };

  const getVendorTypeColor = (type: string) => {
    return type === 'building_materials' ? '#ec4899' : '#6366f1';
  };

  return (
    <div style={{ padding: '32px', background: '#fff7ed', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#7c2d12', margin: 0 }}>
            Vendor Management
          </h1>
          <button
            onClick={() => navigate('/admin/vendors/add')}
            style={{
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Plus size={16} /> Add Vendor
          </button>
        </div>

        {/* Vendor Type Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #fed7aa' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              background: activeTab === 'all' ? '#f97316' : '#fff7ed',
              color: activeTab === 'all' ? 'white' : '#92400e',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Store size={16} />
            All Vendors ({stats.totalVendors})
          </button>
          <button
            onClick={() => setActiveTab('building_materials')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              background: activeTab === 'building_materials' ? '#ec4899' : '#fff7ed',
              color: activeTab === 'building_materials' ? 'white' : '#92400e',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Package size={16} />
            Building Materials ({stats.buildingMaterialVendors})
          </button>
          <button
            onClick={() => setActiveTab('home_services')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              background: activeTab === 'home_services' ? '#6366f1' : '#fff7ed',
              color: activeTab === 'home_services' ? 'white' : '#92400e',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Wrench size={16} />
            Home Services ({stats.homeServiceVendors})
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Store size={24} color="#f97316" />
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12' }}>{stats.totalVendors}</div>
                <div style={{ fontSize: 12, color: '#92400e' }}>Total Vendors</div>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={24} color="#10b981" />
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12' }}>{stats.activeVendors}</div>
                <div style={{ fontSize: 12, color: '#92400e' }}>Active Vendors</div>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Package size={24} color="#ec4899" />
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12' }}>{stats.buildingMaterialVendors}</div>
                <div style={{ fontSize: 12, color: '#92400e' }}>Building Materials</div>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Wrench size={24} color="#6366f1" />
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12' }}>{stats.homeServiceVendors}</div>
                <div style={{ fontSize: 12, color: '#92400e' }}>Home Services</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#92400e' }} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #fed7aa',
                borderRadius: 8,
                background: 'white',
                fontSize: 14
              }}
            />
          </div>
          
          <input
            type="text"
            placeholder="Filter by City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            style={{ padding: '12px', border: '1px solid #fed7aa', borderRadius: 8, background: 'white', fontSize: 14, minWidth: '120px' }}
          />
          
          <input
            type="text"
            placeholder="Filter by Locality"
            value={filters.locality}
            onChange={(e) => setFilters({ ...filters, locality: e.target.value })}
            style={{ padding: '12px', border: '1px solid #fed7aa', borderRadius: 8, background: 'white', fontSize: 14, minWidth: '120px' }}
          />
          
          <select
            value={filters.isVerified}
            onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })}
            style={{ padding: '12px', border: '1px solid #fed7aa', borderRadius: 8, background: 'white', fontSize: 14, minWidth: '120px' }}
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            style={{ padding: '12px', border: '1px solid #fed7aa', borderRadius: 8, background: 'white', fontSize: 14, minWidth: '120px' }}
          >
            <option value="">All Active Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #fed7aa', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#92400e' }}>VENDOR</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#92400e' }}>TYPE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#92400e' }}>CONTACT</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#92400e' }}>LOCATION</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#92400e' }}>STATUS</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#92400e' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => {
                const TypeIcon = getVendorTypeIcon(vendor.vendorType);
                const typeColor = getVendorTypeColor(vendor.vendorType);
                
                return (
                  <tr key={vendor.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#7c2d12', marginBottom: 4 }}>
                          {vendor.businessName}
                        </div>
                        <div style={{ fontSize: 12, color: '#92400e' }}>
                          {vendor.contactPerson}
                        </div>
                        <div style={{ fontSize: 11, color: '#a3a3a3' }}>
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TypeIcon size={16} color={typeColor} />
                        <span style={{ fontSize: 12, color: '#7c2d12', textTransform: 'capitalize' }}>
                          {vendor.vendorType.replace('_', ' ')}
                        </span>
                      </div>
                      {vendor.categories.length > 0 && (
                        <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>
                          {vendor.categories.slice(0, 2).join(', ')}
                          {vendor.categories.length > 2 && ` +${vendor.categories.length - 2}`}
                        </div>
                      )}
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: 12, color: '#7c2d12' }}>{vendor.contactPhone}</div>
                      <div style={{ fontSize: 11, color: '#92400e' }}>{vendor.contactEmail}</div>
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: 12, color: '#7c2d12', fontWeight: 600 }}>{vendor.city}</div>
                      <div style={{ fontSize: 11, color: '#92400e' }}>{vendor.locality}</div>
                      <div style={{ fontSize: 10, color: '#a3a3a3' }}>{vendor.state}</div>
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: vendor.isActive ? '#dcfce7' : '#fee2e2',
                          color: vendor.isActive ? '#166534' : '#dc2626',
                          fontWeight: 600
                        }}>
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: vendor.isVerified ? '#dbeafe' : '#fef3c7',
                          color: vendor.isVerified ? '#1e40af' : '#92400e',
                          fontWeight: 600
                        }}>
                          {vendor.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => assignVendor(vendor)}
                          style={{
                            background: 'none',
                            border: '1px solid #fed7aa',
                            borderRadius: 6,
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#f97316'
                          }}
                          title="Assign Vendor"
                        >
                          <UserPlus size={14} />
                        </button>
                        
                        <button
                          onClick={() => navigate(`/admin/vendors/${vendor.id}`)}
                          style={{
                            background: 'none',
                            border: '1px solid #fed7aa',
                            borderRadius: 6,
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#92400e'
                          }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        
                        <button
                          onClick={() => toggleVendorVerification(vendor.id, vendor.isVerified)}
                          style={{
                            background: 'none',
                            border: '1px solid #fed7aa',
                            borderRadius: 6,
                            padding: '6px',
                            cursor: 'pointer',
                            color: vendor.isVerified ? '#dc2626' : '#10b981'
                          }}
                          title={vendor.isVerified ? 'Unverify' : 'Verify'}
                        >
                          {vendor.isVerified ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                        
                        <button
                          onClick={() => toggleVendorStatus(vendor.id, vendor.isActive)}
                          style={{
                            background: 'none',
                            border: '1px solid #fed7aa',
                            borderRadius: 6,
                            padding: '6px',
                            cursor: 'pointer',
                            color: vendor.isActive ? '#dc2626' : '#10b981'
                          }}
                          title={vendor.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {vendor.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                        
                        <button
                          onClick={() => deleteVendor(vendor.id)}
                          style={{
                            background: 'none',
                            border: '1px solid #fed7aa',
                            borderRadius: 6,
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#dc2626'
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div style={{ padding: '16px', borderTop: '1px solid #fed7aa', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #fed7aa',
                borderRadius: 6,
                background: page === 1 ? '#f3f4f6' : 'white',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: 12
              }}
            >
              Previous
            </button>
            <span style={{ padding: '8px 12px', fontSize: 12, color: '#92400e' }}>
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 20)}
              style={{
                padding: '8px 12px',
                border: '1px solid #fed7aa',
                borderRadius: 6,
                background: page >= Math.ceil(total / 20) ? '#f3f4f6' : 'white',
                cursor: page >= Math.ceil(total / 20) ? 'not-allowed' : 'pointer',
                fontSize: 12
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedVendor && (
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
            maxWidth: 500,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#7c2d12', marginBottom: 16 }}>
              Assign Vendor: {selectedVendor.businessName}
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#7c2d12', marginBottom: 8 }}>
                <strong>Contact:</strong> {selectedVendor.contactPerson}
              </div>
              <div style={{ fontSize: 14, color: '#7c2d12', marginBottom: 8 }}>
                <strong>Phone:</strong> {selectedVendor.contactPhone}
              </div>
              <div style={{ fontSize: 14, color: '#7c2d12', marginBottom: 8 }}>
                <strong>Location:</strong> {selectedVendor.locality}, {selectedVendor.city}
              </div>
              <div style={{ fontSize: 14, color: '#7c2d12', marginBottom: 8 }}>
                <strong>Type:</strong> {selectedVendor.vendorType.replace('_', ' ')}
              </div>
              <div style={{ fontSize: 14, color: '#7c2d12', marginBottom: 16 }}>
                <strong>Categories:</strong> {selectedVendor.categories.join(', ')}
              </div>
            </div>

            <div style={{ 
              background: '#fff7ed', 
              padding: 16, 
              borderRadius: 8, 
              border: '1px solid #fed7aa',
              marginBottom: 16
            }}>
              <div style={{ fontSize: 14, color: '#92400e', textAlign: 'center' }}>
                <strong>Ready to Assign!</strong><br />
                This vendor is available for assignment in {selectedVendor.locality}, {selectedVendor.city}
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
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Vendor ${selectedVendor.businessName} assigned successfully!`);
                  setShowAssignModal(false);
                }}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 8,
                  background: '#f97316',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}