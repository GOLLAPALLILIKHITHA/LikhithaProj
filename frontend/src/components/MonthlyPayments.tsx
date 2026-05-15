import { useState, useEffect } from 'react';
import { Calendar, DollarSign, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import api from '../api';

const formatPrice = (amount: number) => {
  return `₹${amount.toLocaleString()}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

interface MonthlyPayment {
  id: number;
  monthNumber: number;
  monthYear: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  lateFee: number;
  totalAmount: number;
  rental: {
    id: number;
    monthlyRent: number;
    currentMonth: number;
    totalMonths: number;
    property: {
      id: number;
      title: string;
      location: string;
      city: string;
      images: string[];
    };
  };
}

export default function MonthlyPayments() {
  const [pendingPayments, setPendingPayments] = useState<MonthlyPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      const { data } = await api.get('/property-rentals/pending-payments');
      setPendingPayments(data);
    } catch (error) {
      console.error('Error loading pending payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async (payment: MonthlyPayment) => {
    setPaymentProcessing(payment.id);
    
    try {
      const { data } = await api.post('/property-rentals/monthly-payment/create-order', {
        rentalId: payment.rental.id,
        monthNumber: payment.monthNumber
      });

      // Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'INFRAALL',
        description: `Monthly Rent - ${payment.rental.property.title}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            await api.post('/property-rentals/monthly-payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              monthlyPaymentId: data.monthlyPaymentId
            });
            alert('Monthly rent paid successfully!');
            loadPendingPayments(); // Refresh the list
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: 'Tenant', // You can get this from user context
          email: '', // You can get this from user context
          contact: '' // You can get this from user context
        },
        theme: {
          color: '#6366f1'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setPaymentProcessing(null);
    }
  };

  const getStatusConfig = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const isOverdue = today > due;

    if (status === 'overdue' || isOverdue) {
      return { 
        bg: 'rgba(239,68,68,0.15)', 
        color: '#ef4444', 
        icon: <AlertCircle size={16} />, 
        label: 'Overdue',
        priority: 'high'
      };
    }
    
    const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 2) {
      return { 
        bg: 'rgba(245,158,11,0.15)', 
        color: '#f59e0b', 
        icon: <Clock size={16} />, 
        label: `Due in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`,
        priority: 'medium'
      };
    }
    
    return { 
      bg: 'rgba(99,102,241,0.15)', 
      color: '#6366f1', 
      icon: <Calendar size={16} />, 
      label: `Due ${formatDate(dueDate)}`,
      priority: 'low'
    };
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: '#64748b' }}>Loading pending payments...</div>
      </div>
    );
  }

  if (pendingPayments.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <CheckCircle size={48} color="#10b981" style={{ marginBottom: 16 }} />
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          All Caught Up! 🎉
        </h3>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          You have no pending monthly rent payments.
        </p>
      </div>
    );
  }

  // Sort payments by priority and due date
  const sortedPayments = [...pendingPayments].sort((a, b) => {
    const aConfig = getStatusConfig(a.status, a.dueDate);
    const bConfig = getStatusConfig(b.status, b.dueDate);
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[aConfig.priority as keyof typeof priorityOrder];
    const bPriority = priorityOrder[bConfig.priority as keyof typeof priorityOrder];
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
          💳 Monthly Rent Payments
        </h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sortedPayments.map((payment) => {
          const statusConfig = getStatusConfig(payment.status, payment.dueDate);
          
          return (
            <div
              key={payment.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '20px',
                border: `2px solid ${statusConfig.priority === 'high' ? '#ef4444' : statusConfig.priority === 'medium' ? '#f59e0b' : '#e2e8f0'}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                    {payment.rental.property.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                    {payment.rental.property.location}, {payment.rental.property.city}
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    background: statusConfig.bg,
                    color: statusConfig.color
                  }}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </div>
                </div>
                
                <img 
                  src={payment.rental.property.images?.[0] || 'https://placehold.co/80x60/1e1b4b/818cf8?text=Property'} 
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} 
                />
              </div>

              {/* Payment Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Month</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {payment.monthNumber} of {payment.rental.totalMonths}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {payment.monthYear}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Monthly Rent</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {formatPrice(payment.amount)}
                  </div>
                </div>
                
                {payment.lateFee > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 4 }}>Late Fee</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444' }}>
                      {formatPrice(payment.lateFee)}
                    </div>
                  </div>
                )}
                
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Amount</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
                    {formatPrice(payment.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePayRent(payment)}
                disabled={paymentProcessing === payment.id}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: paymentProcessing === payment.id ? '#94a3b8' : 
                    statusConfig.priority === 'high' ? '#ef4444' : 
                    statusConfig.priority === 'medium' ? '#f59e0b' : '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: paymentProcessing === payment.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <CreditCard size={16} />
                {paymentProcessing === payment.id ? 'Processing...' : 
                 statusConfig.priority === 'high' ? 'Pay Now (Overdue)' :
                 statusConfig.priority === 'medium' ? 'Pay Now (Due Soon)' : 
                 'Pay Rent'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}