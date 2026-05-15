import { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import api from '../api';

interface RentalNotification {
  id: number;
  rentalId: number;
  propertyTitle: string;
  daysLeft: number;
  amount: number;
  paidUntilDate: string;
  notificationType: 'reminder_3_days' | 'reminder_1_day' | 'expiry_today' | 'overdue';
}

export default function RentalNotifications() {
  const [notifications, setNotifications] = useState<RentalNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    checkRentalNotifications();
    
    // Check every hour for new notifications
    const interval = setInterval(checkRentalNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkRentalNotifications = async () => {
    try {
      const { data } = await api.get('/property-rentals/my-rentals');
      const today = new Date();
      
      const rentalNotifications: RentalNotification[] = [];
      
      data.forEach((rental: any) => {
        if (rental.status === 'active' && !rental.vacateRequested && rental.paidUntilDate) {
          const paidUntil = new Date(rental.paidUntilDate);
          const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let notificationType: RentalNotification['notificationType'] | null = null;
          
          if (daysLeft === 3) {
            notificationType = 'reminder_3_days';
          } else if (daysLeft === 1) {
            notificationType = 'reminder_1_day';
          } else if (daysLeft === 0) {
            notificationType = 'expiry_today';
          } else if (daysLeft < 0) {
            notificationType = 'overdue';
          }
          
          if (notificationType) {
            rentalNotifications.push({
              id: rental.id,
              rentalId: rental.id,
              propertyTitle: rental.property.title,
              daysLeft,
              amount: rental.monthlyRent,
              paidUntilDate: rental.paidUntilDate,
              notificationType
            });
          }
        }
      });
      
      setNotifications(rentalNotifications);
      
      // Show browser notification for urgent cases
      if (rentalNotifications.length > 0 && 'Notification' in window) {
        const urgentNotifications = rentalNotifications.filter(n => 
          n.notificationType === 'expiry_today' || n.notificationType === 'overdue'
        );
        
        if (urgentNotifications.length > 0 && Notification.permission === 'granted') {
          new Notification('Rental Payment Due!', {
            body: `You have ${urgentNotifications.length} rental payment(s) due. Click to pay now.`,
            icon: '/logo.png'
          });
        }
      }
      
    } catch (error) {
      console.error('Error checking rental notifications:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const getNotificationConfig = (type: RentalNotification['notificationType']) => {
    switch (type) {
      case 'reminder_3_days':
        return {
          icon: <Clock size={16} />,
          color: '#f59e0b',
          bg: '#fef3c7',
          border: '#fbbf24',
          title: 'Payment Due in 3 Days',
          urgency: 'medium'
        };
      case 'reminder_1_day':
        return {
          icon: <AlertTriangle size={16} />,
          color: '#f97316',
          bg: '#fed7aa',
          border: '#fb923c',
          title: 'Payment Due Tomorrow',
          urgency: 'high'
        };
      case 'expiry_today':
        return {
          icon: <AlertTriangle size={16} />,
          color: '#dc2626',
          bg: '#fecaca',
          border: '#f87171',
          title: 'Payment Due Today',
          urgency: 'critical'
        };
      case 'overdue':
        return {
          icon: <AlertTriangle size={16} />,
          color: '#991b1b',
          bg: '#fca5a5',
          border: '#ef4444',
          title: 'Payment Overdue',
          urgency: 'critical'
        };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePayNow = (notification: RentalNotification) => {
    // Redirect to rental dashboard
    window.location.href = '/dashboard?tab=rentals';
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Notification Bell Icon */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          style={{
            position: 'relative',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '50%'
          }}
        >
          <Bell size={20} color="#64748b" />
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: '#dc2626',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600
            }}>
              {notifications.length}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: 350,
            maxHeight: 400,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                Rental Notifications ({notifications.length})
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifications.map((notification) => {
                const config = getNotificationConfig(notification.notificationType);
                return (
                  <div
                    key={notification.id}
                    style={{
                      padding: 16,
                      borderBottom: '1px solid #f1f5f9',
                      background: config.bg,
                      borderLeft: `4px solid ${config.border}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                      <div style={{ color: config.color, marginTop: 2 }}>
                        {config.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: config.color,
                          margin: '0 0 4px 0'
                        }}>
                          {config.title}
                        </h4>
                        <p style={{
                          fontSize: 12,
                          color: '#374151',
                          margin: '0 0 8px 0'
                        }}>
                          {notification.propertyTitle}
                        </p>
                        <div style={{
                          fontSize: 11,
                          color: '#6b7280',
                          marginBottom: 8
                        }}>
                          {notification.daysLeft >= 0 
                            ? `Expires: ${formatDate(notification.paidUntilDate)}`
                            : `Overdue by ${Math.abs(notification.daysLeft)} day(s)`
                          }
                        </div>
                        <button
                          onClick={() => handlePayNow(notification)}
                          style={{
                            padding: '6px 12px',
                            background: config.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <DollarSign size={12} />
                          Pay ₹{notification.amount.toLocaleString()}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}