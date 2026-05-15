import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { User, CreditCard, Heart, MessageSquare, Settings, ArrowLeft, Calendar, CheckCircle, XCircle, Home, Clock, ShoppingCart, FileText, AlertCircle } from 'lucide-react';
import api from '../api';
import UserRentalDashboard from '../components/UserRentalDashboard';
import MonthlyPayments from '../components/MonthlyPayments';

interface Subscription {
  id: number;
  packageType: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

interface Purchase {
  id: number;
  status: string;
  documentStatus: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  item: {
    id: number;
    title: string;
    category: string;
    price: number;
    images: string[];
    location: string;
    city: string;
  };
}

export default function UserAccountPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'subscriptions');

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [visitBookings, setVisitBookings] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [leisureLeases, setLeisureLeases] = useState<any[]>([]);
  const [buyRequests, setBuyRequests] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
      fetchVisitBookings();
      fetchRentals();
      fetchPurchases();
      fetchLeisureLeases();
      fetchBuyRequests();
      fetchMessages();
    }
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-fetches

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const [subsRes, activeRes] = await Promise.all([
        api.get('/payment/subscriptions'),
        api.get('/payment/active-subscription')
      ]);
      
      setSubscriptions(subsRes.data);
      if (activeRes.data.hasActiveSubscription) {
        setActiveSubscription(activeRes.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitBookings = async () => {
    try {
      const { data } = await api.get('/visit-bookings/my-bookings');
      setVisitBookings(data);
    } catch (error) {
      console.error('Error fetching visit bookings:', error);
    }
  };

  const fetchRentals = async () => {
    try {
      const { data } = await api.get('/property-rentals/my-rentals');
      setRentals(data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const { data } = await api.get('/purchase/my-purchases');
      setPurchases(data.filter((p: Purchase) => p.item.category === 'property_sell'));
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchLeisureLeases = async () => {
    try {
      const { data } = await api.get('/leisure-lease/my-leases');
      setLeisureLeases(data.leisureLeases || []);
    } catch (error) {
      console.error('Error fetching leisure leases:', error);
    }
  };

  const fetchBuyRequests = async () => {
    try {
      const { data } = await api.get('/buy-requests/my-requests');
      setBuyRequests(data);
    } catch (error) {
      console.error('Error fetching buy requests:', error);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setMessagesLoading(true);
      console.log('Fetching messages for user:', user?.id);
      
      const { data } = await api.get('/messages', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('Messages received:', data);
      
      // Ensure data is an array to prevent errors
      const messagesArray = Array.isArray(data) ? data : [];
      
      // Filter messages to only show conversations involving the current user
      const userMessages = messagesArray.filter((msg: any) => 
        msg && (msg.senderId === user.id || msg.receiverId === user.id)
      );
      
      setMessages(userMessages);
      
      // Only show admin conversations (userId = 1) in the messages page
      const adminMessages = userMessages.filter((msg: any) => 
        (msg.senderId === 1 && msg.receiverId === user.id) ||
        (msg.senderId === user.id && msg.receiverId === 1)
      );
      
      // Group admin messages by conversation
      const conversationMap = new Map();
      
      if (adminMessages.length > 0) {
        // Create admin conversation from existing messages
        const adminConversation = {
          userId: 1,
          user: { id: 1, name: 'Admin Support', email: 'admin@infraall.com' },
          lastMessage: adminMessages[adminMessages.length - 1], // Most recent message
          unreadCount: 0,
          messages: adminMessages
        };
        
        // Count unread admin messages
        adminConversation.unreadCount = adminMessages.filter(msg => 
          msg.receiverId === user.id && !msg.isRead
        ).length;
        
        // Find the actual last message (most recent)
        adminConversation.lastMessage = adminMessages.reduce((latest, current) => 
          new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
        );
        
        conversationMap.set(1, adminConversation);
      }
      
      // Convert to array
      const conversationsArray = Array.from(conversationMap.values());
      
      console.log('Admin conversations processed:', conversationsArray);
      setConversations(conversationsArray);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Set empty arrays on error to prevent infinite loading
      setConversations([]);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const tabs = [
    { id: 'subscriptions', label: 'My Subscriptions', icon: CreditCard },
    { id: 'buy-requests', label: 'Buy Requests', icon: Home },
    { id: 'purchases', label: 'Property Purchases', icon: ShoppingCart },
    { id: 'visits', label: 'Visit Bookings', icon: Calendar },
    { id: 'rentals', label: 'My Rentals', icon: Home },
    { id: 'leisure-leases', label: 'Leisure Leases', icon: Calendar },
    { id: 'payments', label: 'Monthly Payments', icon: CreditCard },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderSubscriptions = () => (
    <div className="space-y-6">
      {/* Active Subscription Card */}
      {activeSubscription && (
        <div style={{
          background: 'linear-gradient(135deg, #059669, #047857)',
          borderRadius: 16,
          padding: 32,
          color: '#ffffff',
          boxShadow: '0 10px 30px rgba(5,150,105,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <CheckCircle size={32} />
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Active Subscription</h3>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>You're all set!</p>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            borderRadius: 12, 
            padding: 24,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Package</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{activeSubscription.packageType}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Valid Until</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{formatDate(activeSubscription.endDate)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Days Remaining</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {getDaysRemaining(activeSubscription.endDate)} days
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('/listings?category=services&city=Bangalore')}
              style={{
                background: '#ffffff',
                color: '#047857',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Browse Services
            </button>
          </div>
        </div>
      )}

      {/* No Active Subscription */}
      {!activeSubscription && !loading && (
        <div style={{
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
            No Active Subscription
          </h3>
          <p style={{ fontSize: 14, color: '#78350f', marginBottom: 20 }}>
            Subscribe to a service package to get exclusive benefits
          </p>
          <button
            onClick={() => navigate('/listings?category=services&city=Bangalore')}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              border: 'none',
              padding: '14px 32px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245,158,11,0.4)'
            }}
          >
            View Packages
          </button>
        </div>
      )}

      {/* Subscription History */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
          Subscription History
        </h3>

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
        ) : subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p>No subscription history yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: sub.status === 'active' ? 'linear-gradient(135deg, #10b981, #059669)' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    {sub.status === 'active' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                      {sub.packageType} Package
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                    ₹{(sub.amount / 100).toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 12,
                    background: sub.status === 'active' ? '#d1fae5' : '#f1f5f9',
                    color: sub.status === 'active' ? '#065f46' : '#64748b',
                    textTransform: 'capitalize'
                  }}>
                    {sub.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderVisitBookings = () => (
    <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
        📅 My Visit Bookings
      </h3>
      {visitBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          <Calendar size={48} style={{ margin: '0 auto 16px' }} />
          <p>No visit bookings yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visitBookings.map((booking: any) => (
            <div key={booking.id} style={{
              padding: 20,
              background: '#f8fafc',
              borderRadius: 12,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                    {booking.listing?.title}
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748b' }}>
                    {booking.listing?.location}, {booking.listing?.city}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: booking.status === 'confirmed' ? '#d1fae5' : booking.status === 'pending' ? '#fef3c7' : '#fee2e2',
                  color: booking.status === 'confirmed' ? '#065f46' : booking.status === 'pending' ? '#92400e' : '#991b1b'
                }}>
                  {booking.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
                <div>
                  <span style={{ color: '#64748b' }}>Date: </span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    {new Date(booking.visitDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Time: </span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    {booking.timeSlot} {booking.specificTime && `- ${booking.specificTime}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRentals = () => (
    <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
        🏠 My Rented Properties
      </h3>
      {rentals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          <Home size={48} style={{ margin: '0 auto 16px' }} />
          <p>No rented properties yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {rentals.map((rental: any) => (
            <div key={rental.id} style={{
              padding: 24,
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              borderRadius: 16,
              border: '2px solid #bae6fd'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                    {rental.property?.title}
                  </h4>
                  <p style={{ fontSize: 14, color: '#64748b' }}>
                    {rental.property?.location}, {rental.property?.city}
                  </p>
                </div>
                <span style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  background: rental.status === 'active' ? '#10b981' : '#94a3b8',
                  color: '#ffffff'
                }}>
                  {rental.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Monthly Rent</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                    ₹{rental.monthlyRent?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Duration</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                    {rental.duration} {rental.durationType}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>End Date</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                    {new Date(rental.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {rental.property?.seller && (
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.7)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Managed by INFRAALL</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    Contact us via chat for any queries
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPurchases = () => {
    // Combine actual purchases and completed buy requests
    const allPurchases = [
      ...purchases,
      ...buyRequests.filter((req: any) => req.status === 'completed').map((req: any) => ({
        id: `buyrequest_${req.id}`,
        status: 'completed',
        documentStatus: 'completed',
        totalAmount: req.property?.price || 0,
        paymentStatus: 'paid', // Completed buy requests mean payment is done offline
        createdAt: req.createdAt,
        item: {
          id: req.property?.id || 0,
          title: req.property?.title || 'Property',
          category: 'property_buy',
          price: req.property?.price || 0,
          images: req.property?.images || [],
          location: req.property?.location || '',
          city: req.property?.city || ''
        }
      }))
    ];

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'admin_review': return { bg: '#fef3c7', color: '#92400e', text: 'Under Review' };
        case 'approved': return { bg: '#dbeafe', color: '#1e40af', text: 'Approved' };
        case 'completed': return { bg: '#d1fae5', color: '#065f46', text: 'Purchased Successfully' };
        case 'documents_required': return { bg: '#fed7d7', color: '#c53030', text: 'Documents Required' };
        case 'documents_submitted': return { bg: '#e9d5ff', color: '#7c3aed', text: 'Documents Submitted' };
        case 'documents_verified': return { bg: '#d1fae5', color: '#065f46', text: 'Completed' };
        case 'rejected': return { bg: '#fee2e2', color: '#991b1b', text: 'Rejected' };
        default: return { bg: '#f1f5f9', color: '#64748b', text: status };
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'admin_review': return <Clock size={16} />;
        case 'approved': return <CheckCircle size={16} />;
        case 'completed': return <CheckCircle size={16} />;
        case 'documents_required': return <AlertCircle size={16} />;
        case 'documents_submitted': return <FileText size={16} />;
        case 'documents_verified': return <CheckCircle size={16} />;
        case 'rejected': return <XCircle size={16} />;
        default: return <Clock size={16} />;
      }
    };

    return (
      <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
          🏠 My Property Purchases
        </h3>
        {allPurchases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <ShoppingCart size={48} style={{ margin: '0 auto 16px' }} />
            <p>No property purchases yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {allPurchases.map((purchase) => {
              const statusInfo = getStatusColor(purchase.status);
              const isBuyRequest = purchase.id.toString().startsWith('buyrequest_');
              
              return (
                <div key={purchase.id} style={{
                  padding: 20,
                  background: isBuyRequest ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : '#f8fafc',
                  borderRadius: 12,
                  border: isBuyRequest ? '2px solid #86efac' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <img
                        src={purchase.item.images[0] || 'https://placehold.co/80x60/e5e7eb/6b7280?text=Property'}
                        alt={purchase.item.title}
                        style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                          {purchase.item.title}
                        </h4>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                          {purchase.item.location}, {purchase.item.city}
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#059669' }}>
                          ₹{purchase.totalAmount.toLocaleString()}
                        </p>
                        {isBuyRequest && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            background: '#d1fae5',
                            color: '#065f46',
                            padding: '4px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            marginTop: 4
                          }}>
                            🎉 Purchase Completed (Offline Payment)
                          </div>
                        )}
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
                        color: statusInfo.color
                      }}>
                        {getStatusIcon(purchase.status)}
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {isBuyRequest ? 'Purchase completed on' : 'Purchased on'} {formatDate(purchase.createdAt)}
                    </div>
                    
                    {!isBuyRequest && purchase.status === 'documents_required' && (
                      <button
                        onClick={() => navigate(`/purchase/${purchase.id}/documents`)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <FileText size={14} />
                        Submit Documents
                      </button>
                    )}
                    
                    {!isBuyRequest && ['documents_submitted', 'documents_verified'].includes(purchase.status) && (
                      <button
                        onClick={() => navigate(`/purchase/${purchase.id}/documents`)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <FileText size={14} />
                        View Documents
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderLeisureLeases = () => (
    <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
        🏖️ My Leisure Leases
      </h3>
      {leisureLeases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          <Calendar size={48} style={{ margin: '0 auto 16px' }} />
          <p>No leisure leases yet</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            Lease vacation properties for full year with upfront payment
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {leisureLeases.map((lease: any) => {
            const getStatusColor = (status: string) => {
              switch (status) {
                case 'active': return { bg: '#d1fae5', color: '#065f46', text: 'Active Lease' };
                case 'completed': return { bg: '#f1f5f9', color: '#64748b', text: 'Completed' };
                case 'cancelled': return { bg: '#fee2e2', color: '#991b1b', text: 'Cancelled' };
                default: return { bg: '#f1f5f9', color: '#64748b', text: status };
              }
            };

            const statusInfo = getStatusColor(lease.status);
            const startDate = new Date(lease.startDate);
            const endDate = new Date(lease.endDate);
            const isCurrentYear = lease.leaseYear === new Date().getFullYear();
            const daysRemaining = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={lease.id} style={{
                padding: 24,
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <img 
                    src={lease.property?.images?.[0] || 'https://placehold.co/120x90/1e1b4b/818cf8?text=Property'} 
                    alt={lease.property?.title}
                    style={{ 
                      width: 120, 
                      height: 90, 
                      objectFit: 'cover', 
                      borderRadius: 8,
                      border: '2px solid #e2e8f0'
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                          {lease.property?.title}
                        </h4>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                          📍 {lease.property?.location}, {lease.property?.city}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={14} color="#0369a1" />
                            <span style={{ fontSize: 13, color: '#0369a1', fontWeight: 600 }}>
                              Year {lease.leaseYear}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 13, color: '#64748b' }}>
                              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        {statusInfo.text}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                          ₹{lease.totalAmount?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Full year payment (₹{lease.monthlyEquivalent?.toLocaleString()}/month equivalent)
                        </div>
                      </div>
                      
                      {lease.status === 'active' && isCurrentYear && daysRemaining > 0 && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0369a1' }}>
                            {daysRemaining} days remaining
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            in current lease
                          </div>
                        </div>
                      )}
                      
                      {lease.status === 'active' && !isCurrentYear && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                            Future Lease
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            starts {startDate.toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {lease.notes && (
                      <div style={{ 
                        marginTop: 12, 
                        padding: 12, 
                        background: '#f8fafc', 
                        borderRadius: 8, 
                        border: '1px solid #e2e8f0' 
                      }}>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Notes:</div>
                        <div style={{ fontSize: 13, color: '#374151' }}>{lease.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderBuyRequests = () => {
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

    return (
      <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
          🏠 My Buy Requests
        </h3>
        {buyRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <Home size={48} style={{ margin: '0 auto 16px' }} />
            <p>No buy requests yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {buyRequests.map((request: any) => {
              const statusInfo = getStatusColor(request.status);
              return (
                <div key={request.id} style={{
                  padding: 20,
                  background: '#f8fafc',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                      <img
                        src={request.property?.images?.[0] || 'https://placehold.co/80x60/e5e7eb/6b7280?text=Property'}
                        alt={request.property?.title}
                        style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                          {request.property?.title}
                        </h4>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                          {request.property?.location}, {request.property?.city}
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#059669', marginBottom: 8 }}>
                          ₹{request.property?.price?.toLocaleString()}
                        </p>
                        
                        {/* Property Owner Details */}
                        {request.property?.seller && (
                          <div style={{ 
                            background: '#f0f9ff', 
                            border: '1px solid #bae6fd', 
                            borderRadius: 6, 
                            padding: 8, 
                            marginTop: 8 
                          }}>
                            <p style={{ fontSize: 12, color: '#0369a1', margin: 0, fontWeight: 600 }}>
                              Property Owner: {request.property.seller.name}
                            </p>
                            <p style={{ fontSize: 11, color: '#0369a1', margin: 0 }}>
                              📞 {request.property.seller.phone} | 📧 {request.property.seller.email}
                            </p>
                          </div>
                        )}
                        
                        {/* Request Timeline */}
                        <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                          <p style={{ margin: 0 }}>📅 Requested: {formatDate(request.createdAt)}</p>
                          {request.approvedAt && (
                            <p style={{ margin: 0 }}>✅ Approved: {formatDate(request.approvedAt)}</p>
                          )}
                          {request.completedAt && (
                            <p style={{ margin: 0 }}>🎉 Completed: {formatDate(request.completedAt)}</p>
                          )}
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
                        color: statusInfo.color
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
                        <strong>Your Message:</strong> {request.buyerMessage}
                      </p>
                    </div>
                  )}

                  {request.adminNotes && (
                    <div style={{ 
                      background: '#fef3c7', 
                      border: '1px solid #fbbf24', 
                      borderRadius: 8, 
                      padding: 12, 
                      marginBottom: 12 
                    }}>
                      <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
                        <strong>Admin Notes:</strong> {request.adminNotes}
                      </p>
                    </div>
                  )}

                  {request.agreementDocuments && request.agreementDocuments.length > 0 && (
                    <div style={{ 
                      background: '#d1fae5', 
                      border: '1px solid #86efac', 
                      borderRadius: 8, 
                      padding: 12, 
                      marginBottom: 12 
                    }}>
                      <p style={{ fontSize: 13, color: '#065f46', marginBottom: 8, fontWeight: 600 }}>
                        📄 Agreement Documents:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {request.agreementDocuments.map((doc: any, index: number) => (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 8px',
                              background: '#ffffff',
                              border: '1px solid #86efac',
                              borderRadius: 6,
                              fontSize: 12,
                              color: '#065f46',
                              textDecoration: 'none',
                              fontWeight: 500
                            }}
                          >
                            <FileText size={12} />
                            {doc.originalName || `Document ${index + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      Requested on {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'subscriptions':
        return renderSubscriptions();
      case 'buy-requests':
        return renderBuyRequests();
      case 'visits':
        return renderVisitBookings();
      case 'rentals':
        return <UserRentalDashboard />;
      case 'leisure-leases':
        return renderLeisureLeases();
      case 'payments':
        return <MonthlyPayments />;
      case 'purchases':
        return renderPurchases();
      case 'wishlist':
        return (
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <Heart size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Your wishlist items will appear here</p>
          </div>
        );
      case 'messages':
        return (
          <div 
            key="messages-container"
            style={{ 
              background: '#ffffff', 
              borderRadius: 16, 
              padding: 32,
              minHeight: 400,
              overflow: 'hidden'
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h2 style={{ 
                  fontSize: 24, 
                  fontWeight: 700, 
                  color: '#1e293b', 
                  margin: 0,
                  wordWrap: 'break-word',
                  lineHeight: 1.3
                }}>
                  My Messages
                </h2>
                <button
                  onClick={() => navigate('/chat?sellerId=1&isAdmin=true')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.3)';
                  }}
                >
                  <MessageSquare size={16} />
                  Chat with Admin
                </button>
              </div>
              <p style={{ 
                color: '#64748b', 
                fontSize: 14,
                lineHeight: 1.6,
                margin: '0',
                wordWrap: 'break-word'
              }}>
                Your conversations with admin support
              </p>
            </div>

            {messagesLoading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ color: '#64748b', fontSize: 14 }}>Loading your messages...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: 32
                }}>
                  👨‍💼
                </div>
                <h3 style={{ 
                  color: '#1e293b', 
                  fontSize: 20, 
                  marginBottom: 12,
                  fontWeight: 700,
                  margin: '0 0 12px 0'
                }}>
                  Start Admin Support Chat
                </h3>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: 14,
                  lineHeight: 1.6,
                  maxWidth: 400,
                  margin: '0 auto 24px',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal'
                }}>
                  Get help with your queries from our admin support team
                </p>
                <button
                  onClick={() => navigate('/chat?sellerId=1&isAdmin=true')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                  }}
                >
                  <MessageSquare size={20} />
                  Start Chat with Admin
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {conversations.map((conversation) => {
                  // Safety checks to prevent errors
                  if (!conversation || !conversation.lastMessage) return null;
                  
                  const isAdmin = conversation.userId === 1;
                  const lastMessageTime = new Date(conversation.lastMessage.createdAt);
                  const isToday = lastMessageTime.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={`conversation-${conversation.userId}`}
                      onClick={() => {
                        try {
                          const params = new URLSearchParams({
                            sellerId: conversation.userId.toString(),
                            ...(conversation.lastMessage.listingId && { 
                              listingId: conversation.lastMessage.listingId.toString() 
                            }),
                            ...(isAdmin && { isAdmin: 'true' })
                          });
                          navigate(`/chat?${params.toString()}`);
                        } catch (error) {
                          console.error('Error navigating to chat:', error);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '16px 20px',
                        background: '#f8fafc',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%', 
                        background: isAdmin 
                          ? 'linear-gradient(135deg,#dc2626,#b91c1c)' 
                          : 'linear-gradient(135deg,#6366f1,#8b5cf6)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 16,
                        flexShrink: 0
                      }}>
                        {isAdmin ? '👨‍💼' : (conversation.user?.name?.[0]?.toUpperCase() || 'U')}
                      </div>

                      {/* Message Content */}
                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <h3 style={{ 
                            fontSize: 16, 
                            fontWeight: 600, 
                            color: '#1e293b',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {isAdmin ? 'Admin Support' : (conversation.user?.name || 'Unknown User')}
                            {isAdmin && (
                              <span style={{
                                fontSize: 10,
                                background: '#dc2626',
                                color: '#fff',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontWeight: 500,
                                flexShrink: 0
                              }}>
                                ADMIN
                              </span>
                            )}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {conversation.unreadCount > 0 && (
                              <span style={{
                                background: '#dc2626',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: 10,
                                minWidth: 18,
                                textAlign: 'center'
                              }}>
                                {conversation.unreadCount}
                              </span>
                            )}
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {isToday 
                                ? lastMessageTime.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })
                                : lastMessageTime.toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short'
                                  })
                              }
                            </span>
                          </div>
                        </div>
                        
                        <p style={{ 
                          fontSize: 14, 
                          color: '#64748b', 
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.4
                        }}>
                          {conversation.lastMessage.senderId === user.id ? 'You: ' : ''}
                          {conversation.lastMessage.message || 'No message content'}
                        </p>
                        
                        {conversation.lastMessage.listing && (
                          <p style={{ 
                            fontSize: 12, 
                            color: '#059669',
                            margin: '4px 0 0 0',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            📍 {conversation.lastMessage.listing.title}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <Settings size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Account settings will appear here</p>
          </div>
        );
      default:
        return renderSubscriptions();
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff7ed 100%)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            color: '#92400e', 
            background: 'none', 
            border: 'none', 
            fontSize: 14, 
            fontWeight: 500, 
            cursor: 'pointer', 
            marginBottom: 24 
          }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        {/* Header */}
        <div style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: 32,
          marginBottom: 32,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 32,
              fontWeight: 700
            }}>
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                {user.name}
              </h1>
              <p style={{ fontSize: 15, color: '#64748b', marginBottom: 8 }}>{user.email}</p>
              {activeSubscription && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#d1fae5',
                  color: '#065f46',
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  <CheckCircle size={14} />
                  {activeSubscription.packageType} Member
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Sidebar */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: 'none',
                        background: activeTab === tab.id ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)' : 'transparent',
                        color: activeTab === tab.id ? '#1e40af' : '#64748b',
                        fontSize: 15,
                        fontWeight: activeTab === tab.id ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left'
                      }}
                    >
                      <Icon size={20} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            {renderContent()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
