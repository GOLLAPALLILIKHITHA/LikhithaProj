import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, FileText, Upload, Eye, MessageSquare, User, Home, Calendar } from 'lucide-react';
import api from '../../api';

interface BuyRequest {
  id: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  buyerMessage: string;
  adminNotes?: string;
  agreementDocuments: any[];
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  buyer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  property: {
    id: number;
    title: string;
    price: number;
    location: string;
    city: string;
    images: string[];
    seller: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export default function AdminBuyRequests() {
  const navigate = useNavigate();
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<BuyRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'upload' | 'view'>('view');
  const [adminNotes, setAdminNotes] = useState('');
  const [agreementFiles, setAgreementFiles] = useState<FileList | null>(null);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetchBuyRequests();
    fetchStats();
  }, [selectedStatus]);

  const fetchBuyRequests = async () => {
    try {
      setLoading(true);
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const { data } = await api.get(`/buy-requests${params}`);
      setBuyRequests(data.buyRequests || []);
    } catch (error) {
      console.error('Error fetching buy requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/buy-requests/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await api.put(`/buy-requests/${selectedRequest.id}/status`, {
        status,
        adminNotes: adminNotes.trim() || undefined
      });

      alert(`Buy request ${status} successfully!`);
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchBuyRequests();
      fetchStats();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadAgreement = async () => {
    if (!selectedRequest || !agreementFiles || agreementFiles.length === 0) {
      alert('Please select agreement documents to upload');
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      Array.from(agreementFiles).forEach(file => {
        formData.append('agreements', file);
      });
      if (adminNotes.trim()) {
        formData.append('adminNotes', adminNotes.trim());
      }

      await api.post(`/buy-requests/${selectedRequest.id}/agreement`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Agreement documents uploaded successfully! Property purchase completed.');
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      setAgreementFiles(null);
      fetchBuyRequests();
      fetchStats();
    } catch (error: any) {
      console.error('Error uploading agreement:', error);
      alert(error.response?.data?.message || 'Failed to upload agreement documents');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (request: BuyRequest, type: 'approve' | 'reject' | 'upload' | 'view') => {
    setSelectedRequest(request);
    setModalType(type);
    setAdminNotes(request.adminNotes || '');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', color: '#92400e', text: 'Pending Review' };
      case 'approved': return { bg: '#dbeafe', color: '#1e40af', text: 'Approved' };
      case 'completed': return { bg: '#d1fae5', color: '#065f46', text: 'Completed' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b', text: 'Rejected' };
      default: return { bg: '#f1f5f9', color: '#64748b', text: status };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button 
            onClick={() => navigate('/admin')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              color: '#0369a1', 
              background: 'none', 
              border: 'none', 
              fontSize: 14, 
              fontWeight: 500, 
              cursor: 'pointer', 
              marginBottom: 16 
            }}
          >
            <ArrowLeft size={16} />
            Back to Admin Dashboard
          </button>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            🏠 Property Buy Requests
          </h1>
          <p style={{ fontSize: 16, color: '#64748b' }}>
            Manage property purchase requests from buyers
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.totalRequests || 0}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Total Requests</div>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.pendingRequests || 0}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Pending</div>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.completedRequests || 0}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Completed</div>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.rejectedRequests || 0}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Rejected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Filter by Status:</span>
            {['all', 'pending', 'approved', 'completed', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: selectedStatus === status ? '#3b82f6' : '#f1f5f9',
                  color: selectedStatus === status ? '#ffffff' : '#64748b'
                }}
              >
                {status === 'all' ? 'All Requests' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Buy Requests List */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                border: '4px solid #e2e8f0', 
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
            </div>
          ) : buyRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <Home size={48} style={{ margin: '0 auto 16px' }} />
              <p>No buy requests found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {buyRequests.map((request) => {
                const statusInfo = getStatusColor(request.status);
                return (
                  <div key={request.id} style={{
                    padding: 20,
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                        <img
                          src={request.property.images?.[0] || 'https://placehold.co/80x60/e5e7eb/6b7280?text=Property'}
                          alt={request.property.title}
                          style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                            {request.property.title}
                          </h3>
                          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                            {request.property.location}, {request.property.city}
                          </p>
                          <p style={{ fontSize: 16, fontWeight: 600, color: '#059669', marginBottom: 8 }}>
                            ₹{request.property.price?.toLocaleString()}
                          </p>
                          
                          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <User size={14} />
                              {request.buyer.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={14} />
                              {formatDate(request.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          marginBottom: 12
                        }}>
                          {getStatusIcon(request.status)}
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>

                    {request.buyerMessage && (
                      <div style={{ 
                        background: '#f0f9ff', 
                        border: '1px solid #bae6fd', 
                        borderRadius: 8, 
                        padding: 12, 
                        marginBottom: 12 
                      }}>
                        <p style={{ fontSize: 13, color: '#0369a1', margin: 0 }}>
                          <strong>Buyer Message:</strong> {request.buyerMessage}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => openModal(request, 'view')}
                        style={{
                          padding: '8px 12px',
                          background: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Eye size={12} />
                        View Details
                      </button>

                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openModal(request, 'approve')}
                            style={{
                              padding: '8px 12px',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <CheckCircle size={12} />
                            Approve
                          </button>
                          <button
                            onClick={() => openModal(request, 'reject')}
                            style={{
                              padding: '8px 12px',
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        </>
                      )}

                      {request.status === 'approved' && (
                        <button
                          onClick={() => openModal(request, 'upload')}
                          style={{
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Upload size={12} />
                          Upload Agreement
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
            padding: 20
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 32,
              width: '100%',
              maxWidth: 600,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                {modalType === 'view' && '👁️ Request Details'}
                {modalType === 'approve' && '✅ Approve Request'}
                {modalType === 'reject' && '❌ Reject Request'}
                {modalType === 'upload' && '📄 Upload Agreement'}
              </h2>
            </div>

            {/* Property & Buyer Info */}
            <div style={{ 
              background: '#f8fafc', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 24,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Property Details</h4>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {selectedRequest.property.title}
                  </p>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                    {selectedRequest.property.location}, {selectedRequest.property.city}
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#059669', marginBottom: 8 }}>
                    ₹{selectedRequest.property.price?.toLocaleString()}
                  </p>
                  
                  {/* Property Owner Details */}
                  <div style={{ marginTop: 12, padding: 8, background: '#f0f9ff', borderRadius: 6 }}>
                    <h5 style={{ fontSize: 12, fontWeight: 600, color: '#0369a1', marginBottom: 4 }}>Property Owner:</h5>
                    <p style={{ fontSize: 12, color: '#0369a1', marginBottom: 2 }}>
                      👤 {selectedRequest.property.seller.name}
                    </p>
                    <p style={{ fontSize: 12, color: '#0369a1', marginBottom: 2 }}>
                      📧 {selectedRequest.property.seller.email}
                    </p>
                    <p style={{ fontSize: 12, color: '#0369a1' }}>
                      📞 {selectedRequest.property.seller.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Buyer Details</h4>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {selectedRequest.buyer.name}
                  </p>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>
                    📧 {selectedRequest.buyer.email}
                  </p>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                    📞 {selectedRequest.buyer.phone}
                  </p>
                  
                  {/* Request Timeline */}
                  <div style={{ marginTop: 12, padding: 8, background: '#fef3c7', borderRadius: 6 }}>
                    <h5 style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Request Timeline:</h5>
                    <p style={{ fontSize: 12, color: '#92400e', marginBottom: 2 }}>
                      📅 Requested: {formatDate(selectedRequest.createdAt)}
                    </p>
                    {selectedRequest.approvedAt && (
                      <p style={{ fontSize: 12, color: '#92400e', marginBottom: 2 }}>
                        ✅ Approved: {formatDate(selectedRequest.approvedAt)}
                      </p>
                    )}
                    {selectedRequest.completedAt && (
                      <p style={{ fontSize: 12, color: '#92400e' }}>
                        🎉 Completed: {formatDate(selectedRequest.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer Message */}
            {selectedRequest.buyerMessage && (
              <div style={{ 
                background: '#f0f9ff', 
                border: '1px solid #bae6fd', 
                borderRadius: 8, 
                padding: 16, 
                marginBottom: 24 
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0369a1', marginBottom: 8 }}>
                  💬 Buyer Message:
                </h4>
                <p style={{ fontSize: 14, color: '#0369a1', margin: 0, lineHeight: 1.6 }}>
                  {selectedRequest.buyerMessage}
                </p>
              </div>
            )}

            {/* Admin Notes Input */}
            {(modalType === 'approve' || modalType === 'reject' || modalType === 'upload') && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: 8 
                }}>
                  Admin Notes {modalType === 'reject' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the buyer..."
                  rows={3}
                  style={{
                    width: '100%',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    color: '#0f172a'
                  }}
                />
              </div>
            )}

            {/* File Upload for Agreement */}
            {modalType === 'upload' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: 8 
                }}>
                  Agreement Documents *
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setAgreementFiles(e.target.files)}
                  style={{
                    width: '100%',
                    border: '2px dashed #e2e8f0',
                    borderRadius: 10,
                    padding: 16,
                    fontSize: 14,
                    color: '#64748b'
                  }}
                />
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Upload agreement documents (PDF, DOC, DOCX, JPG, PNG)
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              {modalType === 'approve' && (
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={processing}
                  style={{
                    flex: 2,
                    padding: '14px 20px',
                    background: processing ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: processing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Approving...' : '✅ Approve Request'}
                </button>
              )}

              {modalType === 'reject' && (
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={processing || !adminNotes.trim()}
                  style={{
                    flex: 2,
                    padding: '14px 20px',
                    background: processing || !adminNotes.trim() ? '#94a3b8' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: processing || !adminNotes.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Rejecting...' : '❌ Reject Request'}
                </button>
              )}

              {modalType === 'upload' && (
                <button
                  onClick={handleUploadAgreement}
                  disabled={processing || !agreementFiles || agreementFiles.length === 0}
                  style={{
                    flex: 2,
                    padding: '14px 20px',
                    background: processing || !agreementFiles || agreementFiles.length === 0 
                      ? '#94a3b8' 
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: processing || !agreementFiles || agreementFiles.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Uploading...' : '📄 Upload & Complete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}