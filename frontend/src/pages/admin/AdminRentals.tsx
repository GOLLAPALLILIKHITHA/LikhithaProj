import { useEffect, useState } from 'react';
import { Search, Home, Calendar, DollarSign, User, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../api';

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

interface RentalRecord {
  id: number;
  startDate: string;
  endDate: string | null;
  monthlyRent: number;
  advancePayment: number;
  firstMonthRent: number;
  initialPayment: number;
  paidUntilDate: string | null;
  nextPaymentDue: string | null;
  paymentDayOfMonth: number | null;
  monthlyPaymentStatus: 'current' | 'due' | 'overdue' | 'completed';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  vacateRequested: boolean;
  vacateDate: string | null;
  vacateReason: string | null;
  createdAt: string;
  tenant: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  property: {
    id: number;
    title: string;
    location: string;
    city: string;
    state: string;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    area: number;
    seller: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export default function AdminRentals() {
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRental, setSelectedRental] = useState<RentalRecord | null>(null);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadRentals = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const { data } = await api.get('/property-rentals', { params, headers });
      
      // Filter by search term if provided
      let filteredRentals = data;
      if (search) {
        filteredRentals = data.filter((rental: RentalRecord) =>
          rental.tenant.name.toLowerCase().includes(search.toLowerCase()) ||
          rental.tenant.email.toLowerCase().includes(search.toLowerCase()) ||
          rental.property.title.toLowerCase().includes(search.toLowerCase()) ||
          rental.property.city.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      setRentals(filteredRentals);
    } catch (err) {
      console.error('Error loading rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get('/property-rentals/stats', { headers });
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    loadRentals();
  }, [search, statusFilter]);

  useEffect(() => {
    loadStats();
  }, []);

  const updateRentalStatus = async (id: number, status: string, adminNotes?: string) => {
    setUpdating(true);
    try {
      await api.put(`/property-rentals/${id}`, { status, adminNotes }, { headers });
      alert('Rental status updated successfully');
      setSelectedRental(null);
      loadRentals();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update rental status');
    } finally {
      setUpdating(false);
    }
  };

  const handleApproveVacate = async (rental: RentalRecord) => {
    const today = new Date();
    const paidUntil = new Date(rental.paidUntilDate || rental.startDate);
    const vacateDate = new Date(rental.vacateDate || today);
    
    const isVacatingWithinPaidPeriod = vacateDate <= paidUntil;
    
    const confirmApproval = confirm(
      `Approve vacate request for "${rental.property.title}"?\n\n` +
      `Tenant: ${rental.tenant.name}\n` +
      `Vacate Date: ${rental.vacateDate ? formatDate(rental.vacateDate) : 'Not specified'}\n` +
      `Paid Until: ${rental.paidUntilDate ? formatDate(rental.paidUntilDate) : 'N/A'}\n` +
      `Reason: ${rental.vacateReason || 'Not provided'}\n\n` +
      `${isVacatingWithinPaidPeriod 
        ? '✅ Vacating within paid period - No additional payment required' 
        : '⚠️ Vacating after paid period - Should have required payment'}\n\n` +
      `This will:\n` +
      `- Complete the rental agreement\n` +
      `- Make the property available again on website\n` +
      `- Cancel pending payments\n` +
      `- Clear vacate request status\n\n` +
      `Continue?`
    );
    
    if (!confirmApproval) return;

    setUpdating(true);
    try {
      // Complete the vacate by updating rental status and clearing vacate request
      await api.put(`/property-rentals/${rental.id}`, { 
        status: 'completed',
        adminNotes: `Vacate approved by admin - ${rental.vacateReason || 'Tenant request'}. Vacating ${isVacatingWithinPaidPeriod ? 'within' : 'after'} paid period.`
      }, { headers });
      
      // Clear the vacate request and complete the process
      await api.post(`/property-rentals/${rental.id}/complete-vacate`, {
        approvedBy: 'admin',
        approvalDate: new Date().toISOString().split('T')[0]
      }, { headers });
      
      alert(`✅ Vacate request approved and completed!\n\nProperty "${rental.property.title}" is now available for new tenants on the website.\n\nThe rental has been marked as completed and removed from active rentals.`);
      loadRentals();
      loadStats();
    } catch (err: any) {
      // If the complete-vacate endpoint doesn't exist, use the remove-from-rental endpoint
      try {
        await api.post(`/property-rentals/${rental.id}/remove-from-rental`, { 
          reason: `Vacate approved - ${rental.vacateReason || 'Tenant request'}` 
        }, { headers });
        
        alert(`✅ Vacate request approved!\n\nProperty "${rental.property.title}" is now available for new tenants on the website.`);
        loadRentals();
        loadStats();
      } catch (fallbackErr: any) {
        alert(fallbackErr.response?.data?.message || 'Failed to approve vacate request');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromRental = async (rental: RentalRecord) => {
    const reason = prompt(`Are you sure you want to remove "${rental.property.title}" from rental?\n\nThis will:\n- Cancel the rental agreement\n- Make the property available on website again\n- Cancel all pending payments\n\nPlease provide a reason:`);
    
    if (!reason) return;

    setUpdating(true);
    try {
      await api.post(`/property-rentals/${rental.id}/remove-from-rental`, { reason }, { headers });
      alert(`Property "${rental.property.title}" has been successfully removed from rental and is now available on the website again.`);
      loadRentals();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove property from rental');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: <Clock size={14} />, label: 'Pending' };
      case 'active':
        return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: <CheckCircle size={14} />, label: 'Active' };
      case 'completed':
        return { bg: 'rgba(99,102,241,0.15)', color: '#6366f1', icon: <CheckCircle size={14} />, label: 'Completed' };
      case 'cancelled':
        return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: <XCircle size={14} />, label: 'Cancelled' };
      default:
        return { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', icon: <AlertCircle size={14} />, label: status };
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Pending' };
      case 'paid':
        return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Paid' };
      case 'partial':
        return { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', label: 'Partial' };
      case 'overdue':
        return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Overdue' };
      default:
        return { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', label: status };
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>
          🏠 Rental Properties Management
        </h1>
        <p style={{ fontSize: 14, color: '#92400e' }}>
          Manage all property rentals, payments, and tenant information
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Total Rentals</span>
              <Home size={18} color="#6366f1" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {stats.total || 0}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Active Rentals</span>
              <CheckCircle size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {stats.active || 0}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Total Revenue</span>
              <DollarSign size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {formatPrice(stats.byStatus?.reduce((sum: number, s: any) => sum + (parseFloat(s.totalRevenue) || 0), 0) || 0)}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Avg. Monthly Rent</span>
              <Calendar size={18} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>
              {formatPrice(Math.round((stats.byStatus?.reduce((sum: number, s: any) => sum + (parseFloat(s.totalRevenue) || 0), 0) || 0) / (stats.total || 1)))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#92400e' }} />
            <input
              type="text"
              placeholder="Search by tenant name, email, property title, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '2px solid #fed7aa',
                borderRadius: 10,
                fontSize: 14,
                background: '#fffbf5'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #fed7aa',
              borderRadius: 10,
              fontSize: 14,
              background: '#fffbf5',
              minWidth: 150
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Rentals List */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fed7aa', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#92400e' }}>
            Loading rentals...
          </div>
        ) : rentals.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#92400e' }}>
            No rentals found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fffbf5', borderBottom: '1px solid #fed7aa' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#7c2d12' }}>Property</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#7c2d12' }}>Tenant</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#7c2d12' }}>Rental Period</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#7c2d12' }}>Payment Details</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#7c2d12' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#7c2d12' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental) => {
                  const statusConfig = getStatusConfig(rental.status);
                  const paymentConfig = getPaymentStatusConfig(rental.paymentStatus);
                  
                  return (
                    <tr key={rental.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                      {/* Property */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img 
                            src={rental.property.images?.[0] || 'https://placehold.co/60x45/1e1b4b/818cf8?text=Property'} 
                            style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 8 }} 
                          />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                              {rental.property.title}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={12} />
                              {rental.property.city}, {rental.property.state}
                            </div>
                            <div style={{ fontSize: 11, color: '#92400e' }}>
                              {rental.property.bedrooms}BR • {rental.property.bathrooms}BA • {rental.property.area} sq ft
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tenant */}
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                            {rental.tenant.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {rental.tenant.email}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {rental.tenant.phone}
                          </div>
                        </div>
                      </td>

                      {/* Rental Period */}
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                            Prepaid Monthly
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            Started: {formatDate(rental.startDate)}
                          </div>
                          <div style={{ fontSize: 12, color: rental.paidUntilDate ? '#10b981' : '#64748b' }}>
                            Paid Until: {rental.paidUntilDate ? formatDate(rental.paidUntilDate) : 'N/A'}
                          </div>
                          <div style={{ fontSize: 11, color: '#92400e' }}>
                            Payment Day: {rental.paymentDayOfMonth}th of month
                          </div>
                          {rental.vacateRequested && (
                            <div style={{ 
                              fontSize: 11, 
                              color: '#dc2626', 
                              fontWeight: 600,
                              background: '#fef2f2',
                              padding: '2px 6px',
                              borderRadius: 4,
                              marginTop: 4
                            }}>
                              🚪 VACATE REQUESTED
                              {rental.vacateDate && ` - ${formatDate(rental.vacateDate)}`}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Payment Details */}
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                            Monthly: {formatPrice(rental.monthlyRent)}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 1 }}>
                            Upfront Paid: {formatPrice(rental.initialPayment)}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 1 }}>
                            Status: {rental.monthlyPaymentStatus}
                          </div>
                          <div style={{ fontSize: 11, color: rental.nextPaymentDue ? '#f59e0b' : '#10b981' }}>
                            {rental.nextPaymentDue ? `Next Due: ${formatDate(rental.nextPaymentDue)}` : 'Completed'}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
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
                            padding: '3px 6px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                            background: paymentConfig.bg,
                            color: paymentConfig.color
                          }}>
                            {paymentConfig.label}
                          </span>
                          {rental.vacateRequested && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '3px 6px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              background: 'rgba(239,68,68,0.15)',
                              color: '#dc2626'
                            }}>
                              🚪 VACATE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <button
                            onClick={() => setSelectedRental(rental)}
                            style={{
                              padding: '6px 12px',
                              background: '#6366f1',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Manage
                          </button>
                          
                          {rental.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleRemoveFromRental(rental)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#ef4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Remove from Rental
                              </button>
                              
                              {rental.vacateRequested && (
                                <button
                                  onClick={() => handleApproveVacate(rental)}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#10b981',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Approve Vacate
                                </button>
                              )}
                            </>
                          )}
                          
                          {(rental.status === 'completed' || rental.status === 'cancelled') && (
                            <span style={{
                              padding: '6px 12px',
                              background: rental.status === 'completed' ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)',
                              color: rental.status === 'completed' ? '#6366f1' : '#ef4444',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600
                            }}>
                              {rental.status === 'completed' ? 'Rental Completed' : 'Rental Cancelled'}
                            </span>
                          )}
                          
                          {rental.status === 'pending' && (
                            <span style={{
                              padding: '6px 12px',
                              background: 'rgba(245,158,11,0.15)',
                              color: '#f59e0b',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600
                            }}>
                              Payment Pending
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rental Management Modal */}
      {selectedRental && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ padding: '24px 24px 0', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                    Manage Rental #{selectedRental.id}
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748b' }}>
                    {selectedRental.property.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRental(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 18,
                    color: '#64748b'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: 24 }}>
              {/* Current Status */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Current Status</h4>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: getStatusConfig(selectedRental.status).bg,
                    color: getStatusConfig(selectedRental.status).color
                  }}>
                    {getStatusConfig(selectedRental.status).label}
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: getPaymentStatusConfig(selectedRental.paymentStatus).bg,
                    color: getPaymentStatusConfig(selectedRental.paymentStatus).color
                  }}>
                    Payment: {getPaymentStatusConfig(selectedRental.paymentStatus).label}
                  </span>
                </div>
              </div>

              {/* Update Status */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Update Status</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['pending', 'active', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateRentalStatus(selectedRental.id, status)}
                      disabled={updating || selectedRental.status === status}
                      style={{
                        padding: '8px 16px',
                        border: '2px solid',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: updating || selectedRental.status === status ? 'not-allowed' : 'pointer',
                        opacity: updating || selectedRental.status === status ? 0.5 : 1,
                        ...getStatusConfig(status)
                      }}
                    >
                      {updating ? 'Updating...' : `Mark as ${getStatusConfig(status).label}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vacate Request Section */}
              {selectedRental.vacateRequested && (
                <div style={{ 
                  marginBottom: 24, 
                  background: '#fef2f2', 
                  borderRadius: 12, 
                  padding: 16,
                  border: '1px solid #fecaca'
                }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>
                    🚪 Vacate Request Submitted
                  </h4>
                  <div style={{ fontSize: 13, color: '#7f1d1d' }}>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Vacate Date:</strong> {selectedRental.vacateDate ? formatDate(selectedRental.vacateDate) : 'Not specified'}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Reason:</strong> {selectedRental.vacateReason || 'Not provided'}
                    </div>
                    <button
                      onClick={() => handleApproveVacate(selectedRental)}
                      disabled={updating}
                      style={{
                        padding: '8px 16px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: updating ? 'not-allowed' : 'pointer',
                        opacity: updating ? 0.5 : 1
                      }}
                    >
                      {updating ? 'Processing...' : 'Approve Vacate Request'}
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Breakdown */}
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Payment Breakdown</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Monthly Rent:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b', marginLeft: 8 }}>
                      {formatPrice(selectedRental.monthlyRent)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Advance (2 months):</span>
                    <span style={{ fontWeight: 600, color: '#1e293b', marginLeft: 8 }}>
                      {formatPrice(selectedRental.advancePayment)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>First Month:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b', marginLeft: 8 }}>
                      {formatPrice(selectedRental.firstMonthRent)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Upfront Paid:</span>
                    <span style={{ fontWeight: 600, color: '#10b981', marginLeft: 8 }}>
                      {formatPrice(selectedRental.initialPayment)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Paid Until:</span>
                    <span style={{ fontWeight: 600, color: '#6366f1', marginLeft: 8 }}>
                      {selectedRental.paidUntilDate ? formatDate(selectedRental.paidUntilDate) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Next Payment:</span>
                    <span style={{ fontWeight: 600, color: selectedRental.nextPaymentDue ? '#f59e0b' : '#10b981', marginLeft: 8 }}>
                      {selectedRental.nextPaymentDue ? formatDate(selectedRental.nextPaymentDue) : 'Completed'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Payment Day:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b', marginLeft: 8 }}>
                      {selectedRental.paymentDayOfMonth}th of every month
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Payment Status:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b', marginLeft: 8 }}>
                      {selectedRental.monthlyPaymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}