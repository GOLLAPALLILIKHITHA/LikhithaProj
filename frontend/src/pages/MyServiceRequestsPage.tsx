import { useEffect, useState } from 'react';
import { Phone, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../api';

interface ServiceRequest {
  id: number;
  serviceType: string;
  problemDescription: string;
  userPhone: string;
  userAddress: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  workerName: string | null;
  workerPhone: string | null;
  adminNotes: string | null;
  createdAt: string;
}

export default function MyServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/service-requests/my-requests');
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: { bg: '#fef3c7', color: '#92400e', icon: Clock },
      assigned: { bg: '#dbeafe', color: '#1e40af', icon: CheckCircle },
      completed: { bg: '#d1fae5', color: '#065f46', icon: CheckCircle },
      cancelled: { bg: '#fee2e2', color: '#991b1b', icon: XCircle }
    };

    const style = styles[status] || styles.pending;
    const Icon = style.icon;

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 20,
        background: style.bg,
        color: style.color,
        fontSize: 13,
        fontWeight: 600
      }}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            My Service Requests
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Track your service requests and contact assigned workers
          </p>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          marginBottom: 24,
          flexWrap: 'wrap'
        }}>
          {['all', 'pending', 'assigned', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                border: filter === f ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: 8,
                background: filter === f ? '#eff6ff' : '#fff',
                color: filter === f ? '#1e40af' : '#64748b',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '60px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              No service requests found
            </h3>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              {filter === 'all' 
                ? 'You haven\'t submitted any service requests yet'
                : `No ${filter} requests`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredRequests.map(request => (
              <div
                key={request.id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 16
                }}>
                  <div>
                    <h3 style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: 4
                    }}>
                      {request.serviceType}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      color: '#64748b'
                    }}>
                      <Calendar size={14} />
                      {new Date(request.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {/* Problem Description */}
                <div style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: 8,
                  marginBottom: 16
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    marginBottom: 4
                  }}>
                    Problem Description:
                  </div>
                  <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.6 }}>
                    {request.problemDescription}
                  </div>
                </div>

                {/* Worker Details (if assigned) */}
                {request.status === 'assigned' && request.workerName && (
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: 12,
                    border: '2px solid #3b82f6',
                    marginBottom: 16
                  }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#1e40af',
                      marginBottom: 12
                    }}>
                      ✅ Worker Assigned
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 14, color: '#1e293b' }}>
                        <strong>Name:</strong> {request.workerName}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        color: '#1e293b'
                      }}>
                        <Phone size={16} />
                        <strong>Phone:</strong>
                        <a
                          href={`tel:${request.workerPhone}`}
                          style={{
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          {request.workerPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Message */}
                {request.status === 'pending' && (
                  <div style={{
                    padding: '12px',
                    background: '#fef3c7',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#92400e',
                    marginBottom: 16
                  }}>
                    ⏳ Waiting for admin to assign a worker...
                  </div>
                )}

                {/* Completed Message */}
                {request.status === 'completed' && (
                  <div style={{
                    padding: '12px',
                    background: '#d1fae5',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#065f46',
                    marginBottom: 16
                  }}>
                    ✅ Service completed successfully!
                  </div>
                )}

                {/* Contact Info */}
                <div style={{
                  fontSize: 13,
                  color: '#64748b',
                  paddingTop: 12,
                  borderTop: '1px solid #e5e7eb'
                }}>
                  Request ID: #{request.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
