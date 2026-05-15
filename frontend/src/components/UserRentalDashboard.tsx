import { useState, useEffect } from 'react';
import { Calendar, MapPin, Home, User, Phone, Mail, DollarSign, Clock, CheckCircle, AlertCircle, LogOut, Star, MessageSquare, BadgeCheck } from 'lucide-react';
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

interface RentalProperty {
  id: number;
  startDate: string;
  endDate: string | null;
  monthlyRent: number;
  advancePayment: number;
  firstMonthRent: number;
  initialPayment: number;
  paidUntilDate: string | null;
  paymentDayOfMonth: number | null;
  nextPaymentDue: string | null;
  lastPaymentDate: string | null;
  monthlyPaymentStatus: 'current' | 'due' | 'overdue' | 'completed';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  vacateRequested: boolean;
  vacateDate: string | null;
  createdAt: string;
  property: {
    id: number;
    title: string;
    description: string;
    location: string;
    city: string;
    state: string;
    price: number;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    area: number;
    amenities: string[];
    seller: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export default function UserRentalDashboard() {
  const [rentals, setRentals] = useState<RentalProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [vacateProcessing, setVacateProcessing] = useState<number | null>(null);
  
  // Review states
  const [reviews, setReviews] = useState<{[key: number]: any[]}>({});
  const [reviewText, setReviewText] = useState<{[key: number]: string}>({});
  const [reviewRating, setReviewRating] = useState<{[key: number]: number}>({});
  const [submittingReview, setSubmittingReview] = useState<number | null>(null);
  const [canReview, setCanReview] = useState<{[key: number]: any}>({});

  useEffect(() => {
    loadUserRentals();
  }, []);

  const loadUserRentals = async () => {
    try {
      const { data } = await api.get('/property-rentals/my-rentals');
      setRentals(data);
      
      // Load reviews for each rental property
      for (const rental of data) {
        loadReviewsForProperty(rental.property.id);
        checkReviewEligibility(rental.property.id);
      }
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewsForProperty = async (listingId: number) => {
    try {
      const { data } = await api.get(`/reviews/${listingId}`);
      setReviews(prev => ({ ...prev, [listingId]: data }));
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const checkReviewEligibility = async (listingId: number) => {
    try {
      const { data } = await api.get(`/reviews/can-review/${listingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCanReview(prev => ({ ...prev, [listingId]: data }));
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const submitReview = async (listingId: number) => {
    const text = reviewText[listingId];
    const rating = reviewRating[listingId] || 5;
    
    if (!text?.trim()) {
      alert('Please write a review');
      return;
    }

    setSubmittingReview(listingId);
    try {
      await api.post('/reviews', {
        listingId,
        rating,
        comment: text
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Refresh reviews and eligibility
      loadReviewsForProperty(listingId);
      checkReviewEligibility(listingId);
      
      // Reset form
      setReviewText(prev => ({ ...prev, [listingId]: '' }));
      setReviewRating(prev => ({ ...prev, [listingId]: 5 }));
      
      alert('Review submitted successfully!');
    } catch (error: any) {
      console.error('Submit review error:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(null);
    }
  };

  const handleMonthlyPayment = async (rental: RentalProperty) => {
    try {
      // Check payment status with accurate date calculation
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const paidUntil = new Date(rental.paidUntilDate || rental.startDate);
      paidUntil.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate late fees if overdue
      let lateFeePercent = 0;
      let lateFeeAmount = 0;
      
      if (daysDiff < 0) {
        const overdueDays = Math.abs(daysDiff);
        lateFeePercent = Math.ceil(overdueDays / 2) * 2; // 2% for every 2 days
        lateFeeAmount = (rental.monthlyRent * lateFeePercent) / 100;
      }
      
      // Show appropriate message based on payment status
      if (daysDiff > 0) {
        const confirmAdvancePayment = confirm(
          `✅ Your rental is active until ${formatDate(rental.paidUntilDate!)}\n\n` +
          `🗓️ You have ${daysDiff} days remaining.\n\n` +
          `💡 You can pay in advance if you want, or wait until ${formatDate(rental.paidUntilDate!)} to pay for the next month.\n\n` +
          `Do you want to pay ₹${rental.monthlyRent.toLocaleString()} in advance for the next month?`
        );
        if (!confirmAdvancePayment) {
          return;
        }
      } else if (daysDiff === 0) {
        const confirmPayment = confirm(
          `🟡 Payment Due Today!\n\n` +
          `Your rental period ends today (${formatDate(rental.paidUntilDate!)})\n\n` +
          `Pay ₹${rental.monthlyRent.toLocaleString()} now to continue for another month.\n\n` +
          `Continue with payment?`
        );
        if (!confirmPayment) {
          return;
        }
      } else {
        const overdueDays = Math.abs(daysDiff);
        const totalAmount = rental.monthlyRent + lateFeeAmount;
        
        const confirmOverduePayment = confirm(
          `🔴 Payment Overdue!\n\n` +
          `Your rental period ended on ${formatDate(rental.paidUntilDate!)}\n` +
          `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}\n\n` +
          `Monthly Rent: ₹${rental.monthlyRent.toLocaleString()}\n` +
          `Late Fee (${lateFeePercent}%): ₹${lateFeeAmount.toLocaleString()}\n` +
          `Total Amount: ₹${totalAmount.toLocaleString()}\n\n` +
          `Pay now to continue your rental?`
        );
        if (!confirmOverduePayment) {
          return;
        }
      }

      // Calculate next month number based on current date and start date
      const startDate = new Date(rental.startDate);
      const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth()) + 1;
      const nextMonthNumber = Math.max(2, monthsDiff + 1); // Start from month 2 since month 1 was paid upfront

      // Create monthly payment order
      const { data } = await api.post('/property-rentals/monthly-payment/create-order', {
        rentalId: rental.id,
        monthNumber: nextMonthNumber
      });

      // Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'INFRAALL',
        description: `Monthly Rent - ${rental.property.title}${lateFeeAmount > 0 ? ' (with late fee)' : ''}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            await api.post('/property-rentals/monthly-payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              monthlyPaymentId: data.monthlyPaymentId
            });
            
            const newPaidUntil = new Date(paidUntil);
            newPaidUntil.setMonth(newPaidUntil.getMonth() + 1);
            
            alert(
              `✅ Monthly rent paid successfully!\n\n` +
              `Your rental is now extended until ${formatDate(newPaidUntil.toISOString().split('T')[0])}\n\n` +
              `${lateFeeAmount > 0 ? `Late fee of ₹${lateFeeAmount.toLocaleString()} was included.` : ''}`
            );
            loadUserRentals(); // Refresh the list
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: 'Tenant',
          email: '',
          contact: ''
        },
        theme: {
          color: daysDiff < 0 ? '#dc2626' : '#0ea5e9'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Monthly payment error:', error);
      alert(error.response?.data?.message || 'Failed to create monthly payment order');
    }
  };

  const handleVacateProperty = async (rental: RentalProperty) => {
    // Create a better date input prompt with clear format
    const today = new Date().toISOString().split('T')[0];
    const paidUntil = rental.paidUntilDate;
    
    const vacateDate = prompt(
      `When do you want to vacate "${rental.property.title}"?\n\n` +
      `📅 Enter date in YYYY-MM-DD format:\n` +
      `Example: 2026-05-10 for May 10, 2026\n\n` +
      `📋 Your rental info:\n` +
      `• Paid until: ${paidUntil ? formatDate(paidUntil) : 'N/A'}\n` +
      `• Today: ${formatDate(today)}\n\n` +
      `💡 Tip: Vacating before ${paidUntil ? formatDate(paidUntil) : 'paid date'} = Admin approval (no payment)\n` +
      `💰 Vacating after ${paidUntil ? formatDate(paidUntil) : 'paid date'} = Payment required\n\n` +
      `Enter vacate date (YYYY-MM-DD):`
    );
    
    if (!vacateDate) return;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(vacateDate)) {
      alert('❌ Invalid date format!\n\nPlease use YYYY-MM-DD format.\nExample: 2026-05-10 for May 10, 2026');
      return;
    }

    // Validate that it's a valid date
    const parsedDate = new Date(vacateDate + 'T00:00:00'); // Add time to avoid timezone issues
    if (isNaN(parsedDate.getTime())) {
      alert('❌ Invalid date!\n\nPlease enter a valid date in YYYY-MM-DD format.');
      return;
    }

    // Show confirmation with the parsed date
    const confirmDate = confirm(
      `📅 Confirm vacate date:\n\n` +
      `You entered: ${vacateDate}\n` +
      `This means: ${parsedDate.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}\n\n` +
      `Is this correct?`
    );
    
    if (!confirmDate) return;

    const reason = prompt('Reason for vacating (optional):') || '';

    setVacateProcessing(rental.id);
    try {
      // Submit vacate request
      const { data } = await api.post('/property-rentals/request-vacate', {
        rentalId: rental.id,
        vacateDate,
        reason
      });

      if (data.rental.adminApprovalRequired) {
        // Vacate request submitted to admin - no payment needed
        alert(`✅ Vacate request submitted to admin!\n\n` +
              `📅 Vacate Date: ${formatDate(data.rental.vacateDate)}\n` +
              `💰 No payment needed (vacating within paid period until ${formatDate(data.rental.paidUntilDate)})\n\n` +
              `⏳ Your request is now pending admin approval. You will be notified once approved.`);
        loadUserRentals(); // Refresh the list
      } else if (data.rental.paymentNeeded) {
        // Payment needed - show payment option
        const confirmPayment = confirm(
          `💰 Payment Required for Vacate\n\n` +
          `${data.message}\n\n` +
          `You need to pay ₹${data.rental.paymentAmount.toLocaleString()} for the month you want to vacate.\n\n` +
          `After payment, you can vacate immediately and the property will be available on the website.\n\n` +
          `Proceed with payment?`
        );
        
        if (confirmPayment) {
          // Create monthly payment for vacate
          try {
            const paymentData = await api.post('/property-rentals/monthly-payment/create-order', {
              rentalId: rental.id,
              monthNumber: Math.floor(Date.now() / 1000) // Unique month number for vacate
            });

            // Open Razorpay checkout for vacate payment
            const options = {
              key: paymentData.data.key,
              amount: paymentData.data.amount * 100,
              currency: paymentData.data.currency,
              name: 'INFRAALL',
              description: `Vacate Payment - ${rental.property.title}`,
              order_id: paymentData.data.orderId,
              handler: async function (response: any) {
                try {
                  // Verify payment
                  await api.post('/property-rentals/monthly-payment/verify-payment', {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    monthlyPaymentId: paymentData.data.monthlyPaymentId,
                    isVacatePayment: true
                  });
                  
                  // Complete the vacate process
                  await api.post('/property-rentals/request-vacate', {
                    rentalId: rental.id,
                    vacateDate,
                    reason,
                    paymentCompleted: true
                  });
                  
                  alert(`✅ Vacate payment completed!\n\nYou can now leave the property on ${formatDate(vacateDate)}.\n\nThe property is now available for new tenants on the website.`);
                  loadUserRentals(); // Refresh the list
                } catch (error) {
                  console.error('Payment verification failed:', error);
                  alert('Payment verification failed. Please contact support.');
                }
              },
              prefill: {
                name: 'Tenant',
                email: '',
                contact: ''
              },
              theme: {
                color: '#dc2626'
              }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          } catch (paymentError) {
            console.error('Payment creation failed:', paymentError);
            alert('Failed to create payment order. Please try again.');
          }
        }
      }
    } catch (error: any) {
      console.error('Vacate error:', error);
      alert(error.response?.data?.message || 'Failed to process vacate request');
    } finally {
      setVacateProcessing(null);
    }
  };

  const getStatusConfig = (status: string, paymentStatus: string, vacateRequested: boolean) => {
    if (status === 'completed') {
      return { bg: 'rgba(99,102,241,0.15)', color: '#6366f1', icon: <CheckCircle size={16} />, label: 'Completed' };
    }
    if (vacateRequested && status === 'active') {
      return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: <LogOut size={16} />, label: 'Vacating' };
    }
    if (status === 'active' && paymentStatus === 'paid') {
      return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: <CheckCircle size={16} />, label: 'Active' };
    }
    if (status === 'pending') {
      return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: <Clock size={16} />, label: 'Pending' };
    }
    if (status === 'cancelled') {
      return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: <AlertCircle size={16} />, label: 'Cancelled' };
    }
    return { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', icon: <AlertCircle size={16} />, label: status };
  };

  const getPaymentStatusConfig = (monthlyPaymentStatus: string, paidUntilDate: string | null) => {
    if (!paidUntilDate) {
      return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Payment Required' };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const paidUntil = new Date(paidUntilDate);
    paidUntil.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const daysDiff = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 2) {
      return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: `Paid until ${formatDate(paidUntilDate)}` };
    } else if (daysDiff === 2) {
      return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Due in 2 days' };
    } else if (daysDiff === 1) {
      return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Due tomorrow' };
    } else if (daysDiff === 0) {
      return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Due today' };
    } else {
      const overdueDays = Math.abs(daysDiff);
      return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue` };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: '#64748b' }}>Loading your rental properties...</div>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Home size={48} color="#64748b" style={{ marginBottom: 16 }} />
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          No Rental Properties
        </h3>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          You haven't rented any properties yet. Browse available properties to get started.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
          🏠 My Rental Properties
        </h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          {rentals.length} rental propert{rentals.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {rentals.map((rental) => {
          const statusConfig = getStatusConfig(rental.status, rental.paymentStatus, rental.vacateRequested);
          const paymentConfig = getPaymentStatusConfig(rental.monthlyPaymentStatus, rental.paidUntilDate);
          
          return (
            <div
              key={rental.id}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {/* Header with Property Image and Basic Info */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                <img 
                  src={rental.property.images?.[0] || 'https://placehold.co/200x150/1e1b4b/818cf8?text=Property'} 
                  style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 12 }} 
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                        {rental.property.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <MapPin size={14} color="#64748b" />
                        <span style={{ fontSize: 14, color: '#64748b' }}>
                          {rental.property.location}, {rental.property.city}, {rental.property.state}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'end' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: statusConfig.bg,
                        color: statusConfig.color
                      }}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: paymentConfig.bg,
                        color: paymentConfig.color
                      }}>
                        {paymentConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Bedrooms</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {rental.property.bedrooms} BR
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Bathrooms</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {rental.property.bathrooms} BA
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Area</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {rental.property.area} sq ft
                      </div>
                    </div>
                  </div>

                  {/* Monthly Rent */}
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
                    {formatPrice(rental.monthlyRent)} / month
                  </div>
                </div>
              </div>

              {/* Rental Contract Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 20 }}>
                {/* Contract Info */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
                    📋 Rental Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Start Date:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatDate(rental.startDate)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Rental Type:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>Prepaid Monthly</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Payment Day:</span>
                      <span style={{ fontWeight: 600, color: '#6366f1' }}>
                        {rental.paymentDayOfMonth}th of every month
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Paid Until:</span>
                      <span style={{ fontWeight: 600, color: '#10b981' }}>
                        {rental.paidUntilDate ? formatDate(rental.paidUntilDate) : 'N/A'}
                      </span>
                    </div>
                    {(rental.vacateRequested || rental.status === 'completed') && rental.vacateDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>
                          {rental.status === 'completed' ? 'Vacated On:' : 'Vacate Date:'}
                        </span>
                        <span style={{ 
                          fontWeight: 600, 
                          color: rental.status === 'completed' ? '#dc2626' : '#f59e0b' 
                        }}>
                          {formatDate(rental.vacateDate)}
                        </span>
                      </div>
                    )}
                    {rental.status === 'completed' && rental.endDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Rental Ended:</span>
                        <span style={{ fontWeight: 600, color: '#6366f1' }}>
                          {formatDate(rental.endDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
                    💰 Payment Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Upfront Paid:</span>
                      <span style={{ fontWeight: 600, color: '#10b981' }}>{formatPrice(rental.initialPayment)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Monthly Rent:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatPrice(rental.monthlyRent)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Last Payment:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {rental.lastPaymentDate ? formatDate(rental.lastPaymentDate) : 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Paid Until:</span>
                      <span style={{ fontWeight: 600, color: '#10b981' }}>
                        {rental.paidUntilDate ? formatDate(rental.paidUntilDate) : 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Next Due:</span>
                      <span style={{ fontWeight: 600, color: rental.nextPaymentDue ? '#f59e0b' : '#10b981' }}>
                        {rental.nextPaymentDue ? formatDate(rental.nextPaymentDue) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Owner Details */}
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
                  👤 Property Owner
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={16} color="#64748b" />
                    <div>
                      <div style={{ color: '#64748b' }}>Name</div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>INFRAALL</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={16} color="#64748b" />
                    <div>
                      <div style={{ color: '#64748b' }}>Email</div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>support@infraall.com</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={16} color="#64748b" />
                    <div>
                      <div style={{ color: '#64748b' }}>Phone</div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>+91 98765 43210</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Payment Section */}
              {rental.status === 'active' && !rental.vacateRequested && (
                <div style={{ 
                  background: rental.paidUntilDate && new Date() >= new Date(rental.paidUntilDate) ? '#fef2f2' : '#f0f9ff', 
                  borderRadius: 12, 
                  padding: 16, 
                  border: rental.paidUntilDate && new Date() >= new Date(rental.paidUntilDate) ? '1px solid #fca5a5' : '1px solid #0ea5e9', 
                  marginBottom: 16 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: rental.paidUntilDate && new Date() >= new Date(rental.paidUntilDate) ? '#dc2626' : '#0369a1', 
                        marginBottom: 4 
                      }}>
                        💳 Monthly Rent Payment
                      </h4>
                      <p style={{ 
                        fontSize: 12, 
                        color: rental.paidUntilDate && new Date() >= new Date(rental.paidUntilDate) ? '#991b1b' : '#075985', 
                        margin: 0 
                      }}>
                        {rental.paidUntilDate && new Date() < new Date(rental.paidUntilDate) 
                          ? `Active until ${formatDate(rental.paidUntilDate)} • ${Math.ceil((new Date(rental.paidUntilDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`
                          : 'Payment required to continue rental'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => handleMonthlyPayment(rental)}
                      style={{
                        padding: '10px 16px',
                        background: rental.paidUntilDate && new Date() >= new Date(rental.paidUntilDate) ? '#dc2626' : '#0ea5e9',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <DollarSign size={14} />
                      {rental.paidUntilDate && new Date() >= new Date(rental.paidUntilDate) 
                        ? 'Pay Now (Overdue)' 
                        : 'Pay Monthly Rent'
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* Vacate Property Button */}
              {rental.status === 'active' && !rental.vacateRequested && (
                <div style={{ background: '#fef2f2', borderRadius: 12, padding: 16, border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>
                        Want to Leave?
                      </h4>
                      <p style={{ fontSize: 12, color: '#7f1d1d', margin: 0 }}>
                        {rental.paidUntilDate && new Date() <= new Date(rental.paidUntilDate)
                          ? `Vacate within paid period (until ${formatDate(rental.paidUntilDate)}) - Admin approval only!`
                          : 'Vacate anytime. Payment may be required if after paid period.'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => handleVacateProperty(rental)}
                      disabled={vacateProcessing === rental.id}
                      style={{
                        padding: '10px 16px',
                        background: vacateProcessing === rental.id ? '#94a3b8' : '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: vacateProcessing === rental.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <LogOut size={14} />
                      {vacateProcessing === rental.id ? 'Processing...' : 'Request Vacate'}
                    </button>
                  </div>
                </div>
              )}

              {/* Vacate Status */}
              {(rental.vacateRequested || rental.status === 'completed') && (
                <div style={{ 
                  background: rental.status === 'completed' ? '#f0f9ff' : '#fef3c7', 
                  borderRadius: 12, 
                  padding: 16, 
                  border: rental.status === 'completed' ? '1px solid #0ea5e9' : '1px solid #fbbf24',
                  marginBottom: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LogOut size={16} color={rental.status === 'completed' ? '#0369a1' : '#d97706'} />
                    <div>
                      <h4 style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: rental.status === 'completed' ? '#0369a1' : '#d97706', 
                        marginBottom: 2 
                      }}>
                        {rental.status === 'completed' ? 'Rental Completed' : 'Vacate Request Submitted'}
                      </h4>
                      <p style={{ 
                        fontSize: 12, 
                        color: rental.status === 'completed' ? '#075985' : '#92400e', 
                        margin: 0 
                      }}>
                        {rental.status === 'completed' 
                          ? `✅ You vacated this property on ${rental.vacateDate ? formatDate(rental.vacateDate) : 'the scheduled date'}. Thank you for using our service!`
                          : `⏳ Vacate request is pending admin approval. Vacate date: ${rental.vacateDate ? formatDate(rental.vacateDate) : 'Not set'}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Star size={20} color="#fbbf24" fill="#fbbf24" />
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    Reviews & Feedback
                  </h4>
                  {reviews[rental.property.id] && reviews[rental.property.id].length > 0 && (
                    <span style={{
                      background: '#f0f9ff',
                      color: '#0369a1',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {reviews[rental.property.id].length} review{reviews[rental.property.id].length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Review Form - Show for eligible users */}
                {canReview[rental.property.id]?.canReview && (
                  <div style={{ 
                    background: '#f0fdf4', 
                    borderRadius: 12, 
                    padding: 16, 
                    border: '1px solid #86efac',
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <BadgeCheck size={16} color="#059669" />
                      <h5 style={{ fontSize: 14, fontWeight: 600, color: '#065f46', margin: 0 }}>
                        ✅ Share Your Experience
                      </h5>
                    </div>
                    <p style={{ fontSize: 12, color: '#047857', marginBottom: 12 }}>
                      You can review this property because you have a verified rental.
                    </p>
                    
                    {/* Rating Stars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 13, color: '#065f46', fontWeight: 500 }}>Rating:</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(prev => ({ ...prev, [rental.property.id]: star }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                          >
                            <Star 
                              size={20} 
                              fill={star <= (reviewRating[rental.property.id] || 5) ? '#fbbf24' : 'none'} 
                              color={star <= (reviewRating[rental.property.id] || 5) ? '#fbbf24' : '#d1d5db'} 
                            />
                          </button>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: '#047857' }}>
                        ({reviewRating[rental.property.id] || 5}/5)
                      </span>
                    </div>

                    {/* Review Text */}
                    <textarea
                      value={reviewText[rental.property.id] || ''}
                      onChange={(e) => setReviewText(prev => ({ ...prev, [rental.property.id]: e.target.value }))}
                      placeholder="Share your experience with this rental property..."
                      rows={3}
                      style={{
                        width: '100%',
                        border: '1px solid #86efac',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 14,
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                        color: '#1e293b',
                        background: '#fff',
                        marginBottom: 12
                      }}
                    />

                    {/* Submit Button */}
                    <button
                      onClick={() => submitReview(rental.property.id)}
                      disabled={submittingReview === rental.property.id}
                      style={{
                        padding: '10px 20px',
                        background: submittingReview === rental.property.id ? '#94a3b8' : 'linear-gradient(135deg, #059669, #047857)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: submittingReview === rental.property.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      {submittingReview === rental.property.id ? (
                        <>
                          <div style={{ 
                            width: 14, 
                            height: 14, 
                            border: '2px solid #ffffff40',
                            borderTop: '2px solid #ffffff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Star size={14} />
                          Submit Review
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Review Eligibility Message */}
                {canReview[rental.property.id] && !canReview[rental.property.id].canReview && (
                  <div style={{ 
                    background: canReview[rental.property.id].reason === 'already_reviewed' ? '#f0f9ff' : '#fef3c7', 
                    borderRadius: 12, 
                    padding: 16, 
                    border: canReview[rental.property.id].reason === 'already_reviewed' ? '1px solid #0ea5e9' : '1px solid #fbbf24',
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {canReview[rental.property.id].reason === 'already_reviewed' ? (
                        <CheckCircle size={16} color="#0369a1" />
                      ) : (
                        <Clock size={16} color="#d97706" />
                      )}
                      <p style={{ 
                        fontSize: 13, 
                        color: canReview[rental.property.id].reason === 'already_reviewed' ? '#0369a1' : '#d97706', 
                        fontWeight: 600,
                        margin: 0 
                      }}>
                        {canReview[rental.property.id].reason === 'already_reviewed' 
                          ? '✅ Thank you for your review!' 
                          : '⏳ Complete your rental to leave a review'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Existing Reviews Display */}
                {reviews[rental.property.id] && reviews[rental.property.id].length > 0 ? (
                  <div>
                    <h5 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
                      Customer Reviews ({reviews[rental.property.id].length})
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {reviews[rental.property.id].map((review: any) => (
                        <div key={review.id} style={{
                          background: '#f8fafc',
                          borderRadius: 8,
                          padding: 12,
                          border: '1px solid #f1f5f9'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 12
                            }}>
                              {review.reviewer?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                                  {review.reviewer?.name || 'Verified Renter'}
                                </span>
                                <div style={{
                                  background: '#d1fae5',
                                  color: '#065f46',
                                  padding: '1px 6px',
                                  borderRadius: 8,
                                  fontSize: 10,
                                  fontWeight: 600
                                }}>
                                  ✓ Verified
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={12} 
                                    fill={i < review.rating ? '#fbbf24' : 'none'} 
                                    color={i < review.rating ? '#fbbf24' : '#d1d5db'} 
                                  />
                                ))}
                                <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                          {review.comment && (
                            <p style={{ 
                              fontSize: 13, 
                              color: '#475569', 
                              lineHeight: 1.5, 
                              margin: 0,
                              fontStyle: 'italic',
                              paddingLeft: 44
                            }}>
                              "{review.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b' }}>
                    <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ fontSize: 13, margin: 0 }}>No reviews yet for this property</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);