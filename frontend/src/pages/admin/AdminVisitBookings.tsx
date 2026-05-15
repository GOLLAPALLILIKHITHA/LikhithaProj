import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Home, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../api';

interface VisitBooking {
  id: number;
  visitDate: string;
  timeSlot: string;
  specificTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  userPhone: string;
  userEmail: string;
  notes: string;
  adminNotes: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  listing: {
    id: number;
    title: string;
    location: string;
    city: string;
    price: number;
    seller: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export default function AdminVisitBookings() {
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<VisitBooking | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get('/visit-bookings', { params });
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/visit-bookings/${id}`, { status, adminNotes });
      fetchBookings();
      setSelectedBooking(null);
      setAdminNotes('');
      alert('Booking status updated successfully');
    } catch (error) {
      console.error('Failed to update booking:', error);
      alert('Failed to update booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6366f1';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
        <p style={{ color: '#64748b' }}>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Visit Bookings
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Manage property visit schedules and contact property owners
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '10px 20px',
              background: filter === status ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff',
              color: filter === status ? '#fff' : '#64748b',
              border: filter === status ? 'none' : '2px solid #e2e8f0',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {status === 'all' ? 'All Bookings' : status}
            {status !== 'all' && ` (${bookings.filter(b => b.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: 16 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            No bookings found
          </h3>
          <p style={{ color: '#64748b' }}>
            {filter === 'all' ? 'No visit bookings yet' : `No ${filter} bookings`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, marginBottom: 20 }}>
                {/* Left: Property & User Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        background: getStatusColor(booking.status) + '20',
                        color: getStatusColor(booking.status),
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'capitalize'
                      }}
                    >
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      Booking #{booking.id}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                    <Home size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                    {booking.listing.title}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Visitor</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        <User size={14} style={{ display: 'inline', marginRight: 6 }} />
                        {booking.user.name}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                        <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {booking.userPhone || booking.user.phone}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {booking.userEmail}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Property Owner</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        {booking.listing.seller.name}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                        <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {booking.listing.seller.phone}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {booking.listing.seller.email}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Visit Schedule</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />
                        {new Date(booking.visitDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {booking.timeSlot}
                        {booking.specificTime && ` - ${booking.specificTime}`}
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>User Notes:</div>
                      <div style={{ fontSize: 13, color: '#475569' }}>{booking.notes}</div>
                    </div>
                  )}

                  {booking.adminNotes && (
                    <div style={{ padding: 12, background: '#eef2ff', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: '#6366f1', marginBottom: 4 }}>Admin Notes:</div>
                      <div style={{ fontSize: 13, color: '#4f46e5' }}>{booking.adminNotes}</div>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setAdminNotes('');
                        }}
                        style={{
                          padding: '10px 16px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        Confirm Visit
                      </button>
                      <button
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        style={{
                          padding: '10px 16px',
                          background: '#fff',
                          color: '#ef4444',
                          border: '2px solid #ef4444',
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(booking.id, 'completed')}
                      style={{
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Mark Completed
                    </button>
                  )}
                  <a
                    href={`tel:${booking.listing.seller.phone}`}
                    style={{
                      padding: '10px 16px',
                      background: '#16a34a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 13,
                      textAlign: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    Call Owner
                  </a>
                  <a
                    href={`tel:${booking.userPhone || booking.user.phone}`}
                    style={{
                      padding: '10px 16px',
                      background: '#0ea5e9',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 13,
                      textAlign: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    Call Visitor
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {selectedBooking && (
        <div
          onClick={() => setSelectedBooking(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              maxWidth: 500,
              width: '90%'
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
              Confirm Visit Booking
            </h3>
            <p style={{ color: '#64748b', marginBottom: 20 }}>
              Add notes for the property owner and visitor (optional):
            </p>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g., Owner has been notified. Visit confirmed for 10:00 AM."
              rows={4}
              style={{
                width: '100%',
                padding: 12,
                border: '2px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'inherit',
                marginBottom: 20
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#fff',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
