import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, User, FileText, Home, CheckCircle, XCircle, Clock, Shield, Building, Package, Sofa, Wrench, Hammer, Eye, X } from 'lucide-react';
import api from '../../api';

interface RequestUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface RequestProperty {
  id: number;
  title: string;
  price: number;
  location: string;
  city: string;
  category: string;
  images: string[];
}

interface Request {
  id: number;
  type: string;
  typeLabel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: RequestUser;
  property: RequestProperty | null;
  details: any;
}

interface RequestCounts {
  total: number;
  buy_request: number;
  rental_request: number;
  vacate_request: number;
  visit_booking: number;
  kyc_request: number;
  furniture_inquiry: number;
  service_inquiry: number;
  service_requests: number;
  services: number;
  material_inquiry: number;
  pending: number;
  active: number;
  approved: number;
  completed: number;
  rejected: number;
  read: number;
}

type TabType = 'kyc' | 'buy' | 'vacate' | 'visit' | 'furniture' | 'services' | 'materials';

export default function AdminAllRequests() {
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [counts, setCounts] = useState<RequestCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('kyc');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/requests/all');
      setAllRequests(data.requests);
      setCounts(data.counts);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    let filtered = allRequests;
    switch (activeTab) {
      case 'kyc': filtered = filtered.filter(r => r.type === 'kyc_request'); break;
      case 'buy': filtered = filtered.filter(r => r.type === 'buy_request'); break;
      case 'vacate': filtered = filtered.filter(r => r.type === 'vacate_request'); break;
      case 'visit': filtered = filtered.filter(r => r.type === 'visit_booking'); break;
      case 'furniture': filtered = filtered.filter(r => r.type === 'furniture_inquiry'); break;
      case 'services': filtered = filtered.filter(r => r.type === 'service_inquiry' || r.type === 'service_request'); break;
      case 'materials': filtered = filtered.filter(r => r.type === 'material_inquiry'); break;
    }
    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAcceptRequest = async (request: Request) => {
    if (!confirm(`Are you sure you want to accept this ${request.typeLabel}?`)) return;
    try {
      let endpoint = '';
      let payload = {};
      switch (request.type) {
        case 'buy_request': 
          endpoint = `/buy-requests/${request.id}/status`; 
          payload = { status: 'approved' };
          break;
        case 'vacate_request': 
          endpoint = `/property-rentals/${request.id}/complete-vacate`; 
          payload = { 
            approvedBy: 'Admin',
            approvalDate: new Date().toISOString().split('T')[0]
          };
          await api.post(endpoint, payload);
          alert('Vacate request approved successfully!');
          fetchAllRequests();
          return;
        case 'visit_booking': 
          endpoint = `/visit-bookings/${request.id}`; 
          payload = { status: 'confirmed' };
          break;
        case 'kyc_request': 
          endpoint = `/kyc/${request.id}`; 
          payload = { status: 'verified' };
          break;
        default: 
          alert('Action not supported for this request type'); 
          return;
      }
      await api.put(endpoint, payload);
      alert('Request accepted successfully!');
      fetchAllRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (request: Request) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    try {
      let endpoint = '';
      let payload = {};
      switch (request.type) {
        case 'buy_request': 
          endpoint = `/buy-requests/${request.id}/status`; 
          payload = { status: 'rejected', adminNotes: reason };
          break;
        case 'visit_booking': 
          endpoint = `/visit-bookings/${request.id}`; 
          payload = { status: 'cancelled', adminNotes: reason };
          break;
        case 'kyc_request': 
          endpoint = `/kyc/${request.id}`; 
          payload = { status: 'rejected', adminNotes: reason };
          break;
        default: 
          alert('Action not supported for this request type'); 
          return;
      }
      await api.put(endpoint, payload);
      alert('Request rejected successfully!');
      fetchAllRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const tabs = [
    { id: 'kyc' as TabType, label: 'KYC Verification', icon: Shield, count: counts?.kyc_request || 0 },
    { id: 'buy' as TabType, label: 'Buy Requests', icon: Home, count: counts?.buy_request || 0 },
    { id: 'vacate' as TabType, label: 'Vacate Requests', icon: Package, count: counts?.vacate_request || 0 },
    { id: 'visit' as TabType, label: 'Visit Bookings', icon: Eye, count: counts?.visit_booking || 0 },
    { id: 'furniture' as TabType, label: 'Furniture', icon: Sofa, count: counts?.furniture_inquiry || 0 },
    { id: 'services' as TabType, label: 'Services', icon: Wrench, count: (counts?.services ?? counts?.service_inquiry) || 0 },
    { id: 'materials' as TabType, label: 'Materials', icon: Hammer, count: counts?.material_inquiry || 0 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Tabs */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  background: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  color: isActive ? '#1f2937' : '#4b5563',
                  boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: isActive ? '#e0e7ff' : '#e5e7eb',
                  color: isActive ? '#4f46e5' : '#6b7280'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTopColor: '#667eea', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#6b7280' }}>Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <FileText size={64} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>No Requests Found</h3>
            <p style={{ color: '#6b7280' }}>No {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} at the moment</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRequests.map((request) => {
              const hasImage = request.property && request.property.images && request.property.images.length > 0;
              
              return (
                <div
                  key={`${request.type}-${request.id}`}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                  }}
                >
                  {/* Image */}
                  {hasImage && (
                    <img
                      src={request.property!.images[0]}
                      alt={request.property!.title}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        flexShrink: 0
                      }}
                    />
                  )}
                  
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {request.property ? request.property.title : `${request.typeLabel}`}
                    </h3>
                    
                    {/* Location */}
                    {request.property && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <MapPin size={14} color="#9ca3af" />
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {request.property.location}, {request.property.city}
                        </span>
                      </div>
                    )}
                    
                    {/* Price */}
                    {request.property && (
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '12px' }}>
                        {formatPrice(request.property.price)}/month
                      </div>
                    )}

                    {/* Tenant Info */}
                    <div style={{
                      background: '#dbeafe',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '13px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="#6b7280" />
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>Tenant: {request.user.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#6b7280" />
                        <a href={`tel:${request.user.phone}`} style={{ color: '#4b5563', textDecoration: 'none' }}>
                          {request.user.phone}
                        </a>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#6b7280" />
                        <a href={`mailto:${request.user.email}`} style={{ color: '#4b5563', textDecoration: 'none' }}>
                          {request.user.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Status Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '200px' }}>
                    {/* Alerts */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', color: '#6b7280' }}>
                        <span>⚠️</span>
                        <span style={{ fontWeight: '500' }}>Alerts</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
                        <CheckCircle size={16} />
                        <span>No alerts</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedRequest(request)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: '#667eea',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(102,126,234,0.3)'
                      }}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {selectedRequest && (
          <div 
            onClick={() => setSelectedRequest(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              zIndex: 50
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{
                position: 'sticky',
                top: 0,
                background: '#fff',
                borderBottom: '1px solid #e5e7eb',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10,
                borderRadius: '16px 16px 0 0'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>{selectedRequest.typeLabel}</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#9ca3af'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* User Info */}
                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={20} color="#667eea" />
                    User Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Name</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{selectedRequest.user.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                      <a href={`mailto:${selectedRequest.user.email}`} style={{ fontSize: '15px', fontWeight: '500', color: '#667eea', textDecoration: 'none' }}>{selectedRequest.user.email}</a>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Phone</div>
                      <a href={`tel:${selectedRequest.user.phone}`} style={{ fontSize: '15px', fontWeight: '600', color: '#667eea', textDecoration: 'none' }}>{selectedRequest.user.phone}</a>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '500',
                        background: selectedRequest.status === 'active' ? '#d1fae5' : '#fef3c7',
                        color: selectedRequest.status === 'active' ? '#065f46' : '#92400e'
                      }}>
                        <CheckCircle size={14} />
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                {selectedRequest.property && (
                  <div style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #6ee7b7'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Home size={20} color="#10b981" />
                      Property Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Title</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{selectedRequest.property.title}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Price</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>{formatPrice(selectedRequest.property.price)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
                        <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>{selectedRequest.property.location}, {selectedRequest.property.city}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Request Details */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #fcd34d'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="#f59e0b" />
                    Request Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedRequest.type === 'kyc_request' && selectedRequest.details && (
                      <>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Occupation</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', textTransform: 'capitalize' }}>
                            {selectedRequest.details.occupation || 'Not specified'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>Submitted Documents</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {selectedRequest.details.aadhaarUrl && (
                              <button
                                onClick={() => {
                                  const token = localStorage.getItem('token');
                                  const fullUrl = `http://localhost:5000${selectedRequest.details.aadhaarUrl}?token=${token}`;
                                  window.open(fullUrl, '_blank', 'noreferrer');
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6366f1', fontWeight: '600', background: '#eff6ff', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                              >
                                <FileText size={14} />
                                View Aadhaar
                              </button>
                            )}
                            {selectedRequest.details.panUrl && (
                              <button
                                onClick={() => {
                                  const token = localStorage.getItem('token');
                                  const fullUrl = `http://localhost:5000${selectedRequest.details.panUrl}?token=${token}`;
                                  window.open(fullUrl, '_blank', 'noreferrer');
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6366f1', fontWeight: '600', background: '#eff6ff', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                              >
                                <FileText size={14} />
                                View PAN
                              </button>
                            )}
                            {selectedRequest.details.jobIdUrl && (
                              <button
                                onClick={() => {
                                  const token = localStorage.getItem('token');
                                  const fullUrl = `http://localhost:5000${selectedRequest.details.jobIdUrl}?token=${token}`;
                                  window.open(fullUrl, '_blank', 'noreferrer');
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6366f1', fontWeight: '600', background: '#eff6ff', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                              >
                                <FileText size={14} />
                                View Job ID
                              </button>
                            )}
                            {selectedRequest.details.otherDocUrl && (
                              <button
                                onClick={() => {
                                  const token = localStorage.getItem('token');
                                  const fullUrl = `http://localhost:5000${selectedRequest.details.otherDocUrl}?token=${token}`;
                                  window.open(fullUrl, '_blank', 'noreferrer');
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6366f1', fontWeight: '600', background: '#eff6ff', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                              >
                                <FileText size={14} />
                                View {selectedRequest.details.otherDocName || 'Other Document'}
                              </button>
                            )}
                          </div>
                        </div>
                        {selectedRequest.details.adminNotes && (
                          <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Admin Notes</div>
                            <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>
                              {selectedRequest.details.adminNotes}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {selectedRequest.type === 'service_request' && selectedRequest.details && (
                      <>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Service Type</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{selectedRequest.details.serviceType}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Problem Description</div>
                          <div style={{ fontSize: '15px', color: '#1f2937' }}>{selectedRequest.details.problemDescription}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>User Address</div>
                          <div style={{ fontSize: '15px', color: '#1f2937' }}>{selectedRequest.details.userAddress}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Contact Phone</div>
                            <div style={{ fontSize: '15px', color: '#1f2937' }}>{selectedRequest.details.userPhone}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Assigned Worker</div>
                            <div style={{ fontSize: '15px', color: '#1f2937' }}>{selectedRequest.details.workerName || 'Not assigned'}</div>
                          </div>
                        </div>
                        {selectedRequest.details.workerPhone && (
                          <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Worker Phone</div>
                            <div style={{ fontSize: '15px', color: '#1f2937' }}>{selectedRequest.details.workerPhone}</div>
                          </div>
                        )}
                        {selectedRequest.details.vendorName && (
                          <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Vendor</div>
                            <div style={{ fontSize: '15px', color: '#1f2937' }}>{selectedRequest.details.vendorName}</div>
                          </div>
                        )}
                        {selectedRequest.details.adminNotes && (
                          <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Admin Notes</div>
                            <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>
                              {selectedRequest.details.adminNotes}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {selectedRequest.type === 'service_inquiry' && selectedRequest.details && (
                      <>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Service Listed</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{selectedRequest.details.serviceType || 'Service Inquiry'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Message</div>
                          <div style={{ fontSize: '15px', color: '#1f2937' }}>{selectedRequest.details.message}</div>
                        </div>
                        {selectedRequest.details.contactPerson && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Contact Person</div>
                              <div style={{ fontSize: '15px', color: '#1f2937' }}>{selectedRequest.details.contactPerson}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Contact Phone</div>
                              <div style={{ fontSize: '15px', color: '#1f2937' }}>{selectedRequest.details.contactPhone}</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {['kyc_request', 'service_request', 'service_inquiry'].every((type) => type !== selectedRequest.type) && (
                      <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                        No additional details available for this request type.
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                    {(selectedRequest.status === 'pending' || selectedRequest.status === 'active') && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => {
                            handleAcceptRequest(selectedRequest);
                            setSelectedRequest(null);
                          }}
                          style={{
                            flex: 1,
                            padding: '12px 24px',
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(16,185,129,0.3)'
                          }}
                        >
                          <CheckCircle size={20} />
                          Accept Request
                        </button>
                        <button
                          onClick={() => {
                            handleRejectRequest(selectedRequest);
                            setSelectedRequest(null);
                          }}
                          style={{
                            flex: 1,
                            padding: '12px 24px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(239,68,68,0.3)'
                          }}
                        >
                          <XCircle size={20} />
                          Reject Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
        )}
      </div>
    </div>
  );
}
