import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, User, FileText, Home, CheckCircle, XCircle, Clock, Package, Sofa, Hammer, Building, Eye, X, DollarSign } from 'lucide-react';
import api from '../../api';

interface Purchase {
  id: string | number;
  type: string;
  typeLabel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  rentalType?: string;
  totalAmount: number;
  paymentStatus: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  item: {
    id: number;
    title: string;
    price: number;
    location: string;
    city: string;
    category: string;
    images: string[];
    seller?: {
      id: number;
      name: string;
      email: string;
      phone: string;
    } | null;
  } | null;
  details: any;
}

interface PurchaseCounts {
  total: number;
  subscriptions: number;
  buy_property: number;
  rent_property: number;
  furniture: number;
  home_services: number;
  building_materials: number;
  pending: number;
  admin_review: number;
  approved: number;
  completed: number;
  cancelled: number;
  rejected: number;
  overdue: number;
}

type TabType = 'subscriptions' | 'buy_property' | 'rent_property' | 'furniture' | 'home_services' | 'building_materials' | 'all';

export default function AdminPropertyPurchases() {
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [counts, setCounts] = useState<PurchaseCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    fetchAllPurchases();
  }, []);

  const fetchAllPurchases = async () => {
    try {
      setLoading(true);
      
      console.log('Starting to fetch data from APIs...');
      
      // Fetch data from multiple APIs
      const [purchaseRes, rentalRes, subscriptionRes, buyRequestRes] = await Promise.all([
        api.get('/purchase').catch((err) => {
          console.error('Purchase API error:', err);
          return { data: [] };
        }),
        api.get('/property-rentals').catch((err) => {
          console.error('Property rentals API error:', err);
          return { data: [] };
        }),
        api.get('/admin/subscriptions').catch((err) => {
          console.error('Subscriptions API error:', err);
          return { data: { subscriptions: [] } };
        }),
        api.get('/buy-requests').catch((err) => {
          console.error('Buy requests API error:', err.response?.data || err.message);
          return { data: [] };
        })
      ]);

      console.log('API Responses:', {
        purchases: purchaseRes.data,
        rentals: rentalRes.data,
        subscriptions: subscriptionRes.data,
        buyRequests: buyRequestRes.data
      });

      console.log('Buy requests raw data:', buyRequestRes.data);

      const allTransactions = [];

      // Process Buy Request data (property buy requests)
      // Admin API returns { buyRequests: [...], total: number }
      const buyRequestsData = buyRequestRes.data?.buyRequests || buyRequestRes.data || [];
      if (Array.isArray(buyRequestsData)) {
        console.log('Processing buy requests:', buyRequestsData);
        const buyRequests = buyRequestsData.map((buyRequest: any) => {
          console.log('Individual buy request:', buyRequest);
          const processed = {
            id: `buyrequest_${buyRequest.id}`,
            type: 'buy_request',
            typeLabel: 'Property Buy Request',
            status: buyRequest.status || 'pending',
            createdAt: buyRequest.createdAt,
            updatedAt: buyRequest.updatedAt,
            category: 'property_buy',
            rentalType: 'buy_property',
            totalAmount: parseFloat(buyRequest.offerAmount || buyRequest.amount || buyRequest.property?.price || 0),
            // Fix payment status: if buy request is completed/approved, payment is done offline
            paymentStatus: buyRequest.paymentStatus || 
                          (buyRequest.status === 'completed' ? 'paid' : 
                           buyRequest.status === 'approved' ? 'paid' : 'pending'),
            user: {
              id: buyRequest.buyer?.id || buyRequest.userId || buyRequest.user?.id || 0,
              name: buyRequest.buyer?.name || buyRequest.buyerName || buyRequest.user?.name || 'Unknown',
              email: buyRequest.buyer?.email || buyRequest.buyerEmail || buyRequest.user?.email || 'N/A',
              phone: buyRequest.buyer?.phone || buyRequest.buyerPhone || buyRequest.user?.phone || 'N/A'
            },
            item: buyRequest.listing || buyRequest.property ? {
              id: (buyRequest.listing || buyRequest.property).id,
              title: (buyRequest.listing || buyRequest.property).title,
              price: parseFloat((buyRequest.listing || buyRequest.property).price || buyRequest.offerAmount || 0),
              location: (buyRequest.listing || buyRequest.property).location || '',
              city: (buyRequest.listing || buyRequest.property).city || '',
              category: 'property_buy',
              images: (buyRequest.listing || buyRequest.property).images || [],
              seller: (buyRequest.listing || buyRequest.property).seller || (buyRequest.listing || buyRequest.property).owner
            } : {
              id: 0,
              title: 'Property Buy Request',
              price: parseFloat(buyRequest.offerAmount || buyRequest.amount || 0),
              location: '',
              city: '',
              category: 'property_buy',
              images: [],
              seller: null
            },
            details: {
              offerAmount: parseFloat(buyRequest.offerAmount || 0),
              message: buyRequest.message || buyRequest.buyerMessage,
              notes: buyRequest.notes,
              adminNotes: buyRequest.adminNotes,
              agreementDocuments: buyRequest.agreementDocuments
            }
          };
          console.log('Processed buy request:', processed);
          return processed;
        });
        console.log('All processed buy requests:', buyRequests);
        allTransactions.push(...buyRequests);
      } else {
        console.log('No buy requests data or not an array:', buyRequestsData);
      }

      // Process Purchase data (general purchases - furniture, services, etc.)
      if (purchaseRes.data && Array.isArray(purchaseRes.data)) {
        const purchases = purchaseRes.data.map((purchase: any) => {
          return {
            id: `purchase_${purchase.id}`,
            type: 'purchase',
            typeLabel: `${purchase.category ? purchase.category.charAt(0).toUpperCase() + purchase.category.slice(1) : 'Unknown'} Purchase`,
            status: purchase.status,
            createdAt: purchase.createdAt,
            updatedAt: purchase.updatedAt,
            category: purchase.category || 'other',
            rentalType: purchase.category,
            totalAmount: parseFloat(purchase.totalAmount || purchase.amount || 0),
            paymentStatus: purchase.paymentStatus || 'pending',
            user: {
              id: purchase.buyer?.id || purchase.userId || purchase.user?.id,
              name: purchase.buyer?.name || purchase.buyerName || purchase.user?.name || 'Unknown',
              email: purchase.buyer?.email || purchase.buyerEmail || purchase.user?.email || 'N/A',
              phone: purchase.buyer?.phone || purchase.buyerPhone || purchase.user?.phone || 'N/A'
            },
            item: purchase.item || purchase.listing || purchase.property ? {
              id: (purchase.item || purchase.listing || purchase.property).id,
              title: (purchase.item || purchase.listing || purchase.property).title,
              price: parseFloat((purchase.item || purchase.listing || purchase.property).price || 0),
              location: (purchase.item || purchase.listing || purchase.property).location || '',
              city: (purchase.item || purchase.listing || purchase.property).city || '',
              category: (purchase.item || purchase.listing || purchase.property).category || purchase.category,
              images: (purchase.item || purchase.listing || purchase.property).images || [],
              seller: (purchase.item || purchase.listing || purchase.property).seller || (purchase.item || purchase.listing || purchase.property).owner
            } : null,
            details: {
              quantity: purchase.quantity || 1,
              unitPrice: parseFloat(purchase.unitPrice || purchase.amount || 0),
              deliveryAddress: purchase.deliveryAddress,
              notes: purchase.notes,
              adminNotes: purchase.adminNotes,
              trackingNumber: purchase.trackingNumber,
              estimatedDelivery: purchase.estimatedDelivery
            }
          };
        });
        allTransactions.push(...purchases);
      }

      // Process Rental data (rent transactions) - Include ALL rentals regardless of payment status
      if (rentalRes.data && Array.isArray(rentalRes.data)) {
        const rentals = rentalRes.data.map((rental: any) => {
          // Fix payment status logic for rentals
          let paymentStatus = rental.paymentStatus || rental.currentPaymentStatus || 'pending';
          
          // Calculate if payment is actually overdue based on dates
          let isActuallyOverdue = false;
          const today = new Date();
          
          console.log('Processing rental:', rental.id, 'Original paymentStatus:', paymentStatus);
          console.log('Today:', today.toISOString());
          console.log('nextDueDate:', rental.nextDueDate);
          console.log('lastPaymentDate:', rental.lastPaymentDate);
          console.log('startDate:', rental.startDate);
          
          if (rental.nextDueDate) {
            const nextDue = new Date(rental.nextDueDate);
            isActuallyOverdue = nextDue < today;
            console.log('Using nextDueDate:', nextDue.toISOString(), 'isOverdue:', isActuallyOverdue);
          } else if (rental.lastPaymentDate) {
            const lastPayment = new Date(rental.lastPaymentDate);
            const nextPayment = new Date(lastPayment);
            nextPayment.setMonth(nextPayment.getMonth() + 1);
            isActuallyOverdue = nextPayment < today;
            console.log('Calculated from lastPaymentDate:', nextPayment.toISOString(), 'isOverdue:', isActuallyOverdue);
          } else if (rental.startDate) {
            const startDate = new Date(rental.startDate);
            const nextPayment = new Date(startDate);
            nextPayment.setMonth(nextPayment.getMonth() + 1);
            isActuallyOverdue = nextPayment < today;
            console.log('Calculated from startDate:', nextPayment.toISOString(), 'isOverdue:', isActuallyOverdue);
          }
          
          // If rental is active or completed, determine correct payment status
          if (rental.status === 'active' || rental.status === 'completed') {
            if (isActuallyOverdue) {
              paymentStatus = 'overdue';
            } else {
              paymentStatus = 'paid'; // Up to date
            }
          }
          
          console.log('Final paymentStatus for rental', rental.id, ':', paymentStatus);
          
          return {
            id: `rental_${rental.id}`,
            type: 'rental',
            typeLabel: 'Property Rental',
            status: rental.status,
            createdAt: rental.createdAt,
            updatedAt: rental.updatedAt,
            category: 'property_rent',
            rentalType: 'rent_property',
            totalAmount: parseFloat(rental.monthlyRent || rental.amount || 0),
            paymentStatus: paymentStatus,
            user: {
              id: rental.tenant?.id || rental.tenantId || rental.user?.id,
              name: rental.tenant?.name || rental.tenantName || rental.user?.name || 'Unknown',
              email: rental.tenant?.email || rental.tenantEmail || rental.user?.email || 'N/A',
              phone: rental.tenant?.phone || rental.tenantPhone || rental.user?.phone || 'N/A'
            },
            item: rental.property || rental.listing ? {
              id: (rental.property || rental.listing).id,
              title: (rental.property || rental.listing).title,
              price: parseFloat((rental.property || rental.listing).price || rental.monthlyRent || 0),
              location: (rental.property || rental.listing).location || '',
              city: (rental.property || rental.listing).city || '',
              category: 'property_rent',
              images: (rental.property || rental.listing).images || [],
              seller: (rental.property || rental.listing).owner || (rental.property || rental.listing).seller
            } : null,
            details: {
              monthlyRent: parseFloat(rental.monthlyRent || 0),
              startDate: rental.startDate,
              endDate: rental.endDate,
              advancePayment: parseFloat(rental.advancePayment || 0),
              notes: rental.notes,
              adminNotes: rental.adminNotes,
              isOverdue: rental.isOverdue || false,
              overdueAmount: parseFloat(rental.overdueAmount || 0),
              lastPaymentDate: rental.lastPaymentDate,
              nextDueDate: rental.nextDueDate,
              // Additional payment tracking fields
              totalPaid: parseFloat(rental.totalPaid || 0),
              pendingAmount: parseFloat(rental.pendingAmount || 0),
              paymentHistory: rental.paymentHistory || [],
              monthsPaid: rental.monthsPaid || 0,
              totalMonths: rental.totalMonths || 0
            }
          };
        });
        allTransactions.push(...rentals);
      }

      // Process Leisure Lease data (leisure property leases)
      try {
        const leisureRes = await api.get('/leisure-lease/admin/all').catch((err) => {
          console.error('Leisure lease API error:', err);
          return { data: { leisureLeases: [] } };
        });

        if (leisureRes.data && leisureRes.data.leisureLeases && Array.isArray(leisureRes.data.leisureLeases)) {
          const leisureLeases = leisureRes.data.leisureLeases.map((lease: any) => {
            return {
              id: `leisure_${lease.id}`,
              type: 'leisure_lease',
              typeLabel: '🏖️ Leisure Property Lease',
              status: lease.lease.status,
              createdAt: lease.createdAt,
              updatedAt: lease.updatedAt,
              category: 'property_rent',
              rentalType: 'rent_property',
              totalAmount: parseFloat(lease.lease.totalAmount || 0),
              paymentStatus: lease.lease.paymentStatus,
              user: {
                id: lease.tenant.id,
                name: lease.tenant.name,
                email: lease.tenant.email,
                phone: lease.tenant.phone
              },
              item: {
                id: lease.property.id,
                title: lease.property.title,
                price: parseFloat(lease.lease.monthlyEquivalent || 0),
                location: lease.property.location,
                city: lease.property.city || '',
                category: 'property_rent',
                images: lease.property.images || [],
                seller: null
              },
              details: {
                leaseType: 'leisure',
                leaseYear: lease.lease.year,
                monthlyEquivalent: parseFloat(lease.lease.monthlyEquivalent || 0),
                totalAmount: parseFloat(lease.lease.totalAmount || 0),
                startDate: lease.lease.startDate,
                endDate: lease.lease.endDate,
                paymentId: lease.lease.paymentId,
                orderId: lease.lease.orderId,
                notes: `🏖️ Leisure lease for year ${lease.lease.year}. Full year payment: ₹${parseFloat(lease.lease.totalAmount || 0).toLocaleString()}`
              }
            };
          });
          console.log('Processed leisure leases:', leisureLeases);
          allTransactions.push(...leisureLeases);
        }
      } catch (error) {
        console.error('Error fetching leisure leases:', error);
      }

      // Process Subscription data
      if (subscriptionRes.data && subscriptionRes.data.subscriptions && Array.isArray(subscriptionRes.data.subscriptions)) {
        const subscriptions = subscriptionRes.data.subscriptions.map((subscription: any) => {
          // Fix amount - if it's stored in paise, convert to rupees
          let amount = parseFloat(subscription.amount || subscription.price || 0);
          // If amount is very large (like 99900 for ₹999), it might be in paise
          if (amount > 10000) {
            amount = amount / 100; // Convert paise to rupees
          }
          
          return {
            id: `subscription_${subscription.id}`,
            type: 'subscription',
            typeLabel: 'Subscription',
            status: subscription.status,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
            category: 'subscription',
            rentalType: 'subscription',
            totalAmount: amount,
            paymentStatus: subscription.paymentStatus || (subscription.status === 'active' ? 'paid' : 'pending'),
            user: {
              id: subscription.user?.id || subscription.userId,
              name: subscription.user?.name || subscription.userName || 'Unknown',
              email: subscription.user?.email || subscription.userEmail || 'N/A',
              phone: subscription.user?.phone || subscription.userPhone || 'N/A'
            },
            item: {
              id: subscription.id,
              title: subscription.planName || subscription.name || subscription.packageType || 'Subscription Plan',
              price: amount,
              location: '',
              city: '',
              category: 'subscription',
              images: [],
              seller: null
            },
            details: {
              planName: subscription.planName || subscription.name || subscription.packageType,
              duration: subscription.duration,
              startDate: subscription.startDate,
              endDate: subscription.endDate,
              features: subscription.features
            }
          };
        });
        console.log('Processed subscriptions:', subscriptions);
        allTransactions.push(...subscriptions);
      }

      console.log('All transactions:', allTransactions);
      setAllPurchases(allTransactions);
      
      // Calculate counts based on actual data - ONLY SUCCESSFUL TRANSACTIONS
      const counts: PurchaseCounts = {
        total: allTransactions.filter(p => 
          // Completed buy requests (actually bought)
          (p.type === 'buy_request' && p.status === 'completed') ||
          // Active/completed/overdue rentals (actually rented)
          (p.type === 'rental' && (p.status === 'active' || p.status === 'completed' || p.paymentStatus === 'overdue')) ||
          // Active leisure leases (actually leased)
          (p.type === 'leisure_lease' && p.status === 'active' && p.paymentStatus === 'paid') ||
          // Active subscriptions (actually taken)
          (p.type === 'subscription' && p.status === 'active') ||
          // Completed purchases (actually purchased)
          (p.type === 'purchase' && (p.status === 'completed' || p.status === 'approved'))
        ).length,
        subscriptions: allTransactions.filter((p: Purchase) => 
          p.type === 'subscription' && p.status === 'active'
        ).length,
        buy_property: allTransactions.filter((p: Purchase) => 
          p.type === 'buy_request' && 
          (p.status === 'completed' || p.status === 'approved')
        ).length,
        rent_property: allTransactions.filter((p: Purchase) => 
          (p.type === 'rental' && 
           (p.status === 'active' || p.status === 'completed' || p.paymentStatus === 'overdue')) ||
          (p.type === 'leisure_lease' && 
           p.status === 'active' && p.paymentStatus === 'paid')
        ).length,
        furniture: allTransactions.filter((p: Purchase) => 
          p.category === 'furniture' && 
          (p.status === 'completed' || p.status === 'approved')
        ).length,
        home_services: allTransactions.filter((p: Purchase) => 
          (p.category === 'home_services' || p.category === 'service') &&
          (p.status === 'completed' || p.status === 'approved')
        ).length,
        building_materials: allTransactions.filter((p: Purchase) => 
          (p.category === 'building_materials' || p.category === 'buildings' || p.category === 'materials') &&
          (p.status === 'completed' || p.status === 'approved')
        ).length,
        pending: allTransactions.filter((p: Purchase) => p.status === 'pending').length,
        admin_review: allTransactions.filter((p: Purchase) => p.status === 'admin_review').length,
        approved: allTransactions.filter((p: Purchase) => p.status === 'approved' || p.status === 'active').length,
        completed: allTransactions.filter((p: Purchase) => p.status === 'completed').length,
        cancelled: allTransactions.filter((p: Purchase) => p.status === 'cancelled').length,
        rejected: allTransactions.filter((p: Purchase) => p.status === 'rejected').length,
        overdue: allTransactions.filter((p: Purchase) => p.paymentStatus === 'overdue').length,
      };
      console.log('Calculated counts:', counts);
      setCounts(counts);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPurchases = () => {
    let filtered = allPurchases;
    console.log('Filtering for tab:', activeTab, 'from purchases:', allPurchases);
    
    // TEMPORARY: Show all data to debug what's available
    console.log('All purchases data:', allPurchases.map(p => ({
      id: p.id,
      type: p.type,
      status: p.status,
      paymentStatus: p.paymentStatus,
      category: p.category,
      rentalType: p.rentalType
    })));
    
    switch (activeTab) {
      case 'subscriptions': 
        // Show active subscriptions (actually taken)
        filtered = filtered.filter(p => 
          p.type === 'subscription' && 
          p.status === 'active'
        ); 
        break;
      case 'buy_property': 
        // Show completed and approved buy requests (actually bought properties)
        filtered = filtered.filter(p => 
          p.type === 'buy_request' && 
          (p.status === 'completed' || p.status === 'approved')
        ); 
        break;
      case 'rent_property': 
        // Show active, completed rentals, overdue rentals, and active leisure leases
        filtered = filtered.filter(p => 
          (p.type === 'rental' &&
           (p.status === 'active' || 
            p.status === 'completed' ||
            p.paymentStatus === 'overdue')) ||
          (p.type === 'leisure_lease' &&
           p.status === 'active' && 
           p.paymentStatus === 'paid')
        ); 
        break;
      case 'furniture': 
        // Show completed furniture purchases (actually purchased)
        filtered = filtered.filter(p => 
          p.category === 'furniture' &&
          (p.status === 'completed' || p.status === 'approved')
        ); 
        break;
      case 'home_services': 
        // Show completed home services (actually completed)
        filtered = filtered.filter(p => 
          (p.category === 'home_services' || 
           p.category === 'service') &&
          (p.status === 'completed' || p.status === 'approved')
        ); 
        break;
      case 'building_materials': 
        // Show completed building materials purchases (actually purchased)
        filtered = filtered.filter(p => 
          (p.category === 'building_materials' || 
           p.category === 'buildings' || 
           p.category === 'materials') &&
          (p.status === 'completed' || p.status === 'approved')
        ); 
        break;
      case 'all': 
        // Show all successful transactions (actually completed/rented/bought/taken)
        filtered = filtered.filter(p => 
          // Completed/approved buy requests (offline payment completed)
          (p.type === 'buy_request' && (p.status === 'completed' || p.status === 'approved')) ||
          // Active/completed/overdue rentals
          (p.type === 'rental' && (p.status === 'active' || p.status === 'completed' || p.paymentStatus === 'overdue')) ||
          // Active leisure leases
          (p.type === 'leisure_lease' && p.status === 'active' && p.paymentStatus === 'paid') ||
          // Active subscriptions
          (p.type === 'subscription' && p.status === 'active') ||
          // Completed purchases
          (p.type === 'purchase' && (p.status === 'completed' || p.status === 'approved'))
        );
        break;
    }
    
    console.log('Filtered result:', filtered);
    return filtered;
  };

  const filteredPurchases = getFilteredPurchases();

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

  const handleApprovePurchase = async (purchase: Purchase) => {
    if (!confirm(`Are you sure you want to approve this ${purchase.category} purchase?`)) return;
    try {
      let endpoint = '';
      let updateData = {};
      
      // Determine the correct API endpoint based on purchase type
      if (purchase.type === 'buy_request') {
        const buyRequestId = purchase.id.toString().replace('buyrequest_', '');
        endpoint = `/buy-requests/${buyRequestId}/status`;
        updateData = { 
          status: 'approved',
          adminNotes: 'Buy request approved by admin'
        };
      } else if (purchase.type === 'purchase') {
        const purchaseId = purchase.id.toString().replace('purchase_', '');
        endpoint = `/purchase/${purchaseId}`;
        updateData = { 
          status: 'confirmed',
          adminNotes: 'Purchase approved by admin'
        };
      } else if (purchase.type === 'rental') {
        const rentalId = purchase.id.toString().replace('rental_', '');
        endpoint = `/property-rentals/${rentalId}`;
        updateData = { 
          status: 'approved',
          adminNotes: 'Rental approved by admin'
        };
      } else if (purchase.type === 'subscription') {
        const subscriptionId = purchase.id.toString().replace('subscription_', '');
        endpoint = `/subscriptions/${subscriptionId}`;
        updateData = { 
          status: 'active',
          adminNotes: 'Subscription approved by admin'
        };
      }
      
      await api.put(endpoint, updateData);
      alert('Purchase approved successfully!');
      fetchAllPurchases();
    } catch (error) {
      console.error('Error approving purchase:', error);
      alert('Failed to approve purchase. Please try again.');
    }
  };

  const handleRejectPurchase = async (purchase: Purchase) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    try {
      let endpoint = '';
      let updateData = {};
      
      // Determine the correct API endpoint based on purchase type
      if (purchase.type === 'purchase') {
        const purchaseId = purchase.id.toString().replace('purchase_', '');
        endpoint = `/purchase/${purchaseId}`;
        updateData = { 
          status: 'rejected', 
          adminNotes: reason 
        };
      } else if (purchase.type === 'rental') {
        const rentalId = purchase.id.toString().replace('rental_', '');
        endpoint = `/property-rentals/${rentalId}`;
        updateData = { 
          status: 'rejected', 
          adminNotes: reason 
        };
      } else if (purchase.type === 'subscription') {
        const subscriptionId = purchase.id.toString().replace('subscription_', '');
        endpoint = `/subscriptions/${subscriptionId}`;
        updateData = { 
          status: 'cancelled', 
          adminNotes: reason 
        };
      }
      
      await api.put(endpoint, updateData);
      alert('Purchase rejected successfully!');
      fetchAllPurchases();
    } catch (error) {
      console.error('Error rejecting purchase:', error);
      alert('Failed to reject purchase. Please try again.');
    }
  };

  const tabs = [
    { id: 'all' as TabType, label: 'All Successful', icon: Package, count: counts?.total || 0 },
    { id: 'buy_property' as TabType, label: 'Bought Properties', icon: Home, count: counts?.buy_property || 0 },
    { id: 'rent_property' as TabType, label: 'Rented Properties', icon: Building, count: counts?.rent_property || 0 },
    { id: 'home_services' as TabType, label: 'Completed Services', icon: Hammer, count: counts?.home_services || 0 },
    { id: 'furniture' as TabType, label: 'Furniture Purchased', icon: Sofa, count: counts?.furniture || 0 },
    { id: 'building_materials' as TabType, label: 'Materials Purchased', icon: DollarSign, count: counts?.building_materials || 0 },
    { id: 'subscriptions' as TabType, label: 'Active Subscriptions', icon: Clock, count: counts?.subscriptions || 0 },
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
            <p style={{ color: '#6b7280' }}>Loading purchases...</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <FileText size={64} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>No Successful Transactions Found</h3>
            <p style={{ color: '#6b7280' }}>
              {activeTab === 'buy_property' ? 'No completed property purchases' :
               activeTab === 'rent_property' ? 'No active rental properties' :
               activeTab === 'subscriptions' ? 'No active subscriptions' :
               `No successful ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`} at the moment
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPurchases.map((purchase) => {
              const hasImage = purchase.item && purchase.item.images && purchase.item.images.length > 0;
              
              return (
                <div
                  key={`${purchase.category}-${purchase.id}`}
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
                  {hasImage ? (
                    <img
                      src={purchase.item!.images[0]}
                      alt={purchase.item!.title}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      borderRadius: '12px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {purchase.rentalType === 'buy_property' || purchase.category === 'property_sell' || purchase.category === 'property' ? '🏠' : 
                       purchase.rentalType === 'rent_property' || purchase.type === 'rental' ? '🏘️' :
                       purchase.category === 'furniture' ? '🪑' :
                       purchase.category === 'home_services' || purchase.category === 'service' ? '🔧' :
                       purchase.category === 'building_materials' || purchase.category === 'buildings' || purchase.category === 'materials' ? '🧱' :
                       purchase.type === 'subscription' ? '📋' : '📦'}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {purchase.item ? purchase.item.title : `${purchase.category ? purchase.category.charAt(0).toUpperCase() + purchase.category.slice(1) : 'Unknown'} Purchase #${purchase.id}`}
                    </h3>
                    
                    {/* Location */}
                    {purchase.item && purchase.item.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <MapPin size={14} color="#9ca3af" />
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {purchase.item.location}{purchase.item.city ? `, ${purchase.item.city}` : ''}
                        </span>
                      </div>
                    )}
                    
                    {/* Price with overdue indicator */}
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: purchase.paymentStatus === 'overdue' ? '#ef4444' : '#10b981', 
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {formatPrice(purchase.totalAmount)}
                      {purchase.type === 'rental' && <span style={{ fontSize: '12px', color: '#6b7280' }}>/month</span>}
                      {purchase.paymentStatus === 'overdue' && (
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          OVERDUE
                        </span>
                      )}
                    </div>

                    {/* Payment Tracking for Rentals */}
                    {purchase.type === 'rental' && (purchase.status === 'active' || purchase.status === 'completed') && (
                      <div style={{
                        background: '#f0f9ff',
                        borderRadius: '8px',
                        padding: '10px',
                        marginBottom: '12px',
                        fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>
                          📅 Payment Tracking
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#4b5563' }}>
                          {purchase.details?.lastPaymentDate && (
                            <div>
                              <span style={{ fontWeight: '500' }}>Last Payment:</span><br />
                              <span>{formatDate(purchase.details.lastPaymentDate)}</span>
                            </div>
                          )}
                          {purchase.details?.nextDueDate && (
                            <div>
                              <span style={{ fontWeight: '500' }}>Next Due:</span><br />
                              <span style={{ 
                                color: purchase.paymentStatus === 'overdue' ? '#ef4444' : '#4b5563' 
                              }}>
                                {formatDate(purchase.details.nextDueDate)}
                              </span>
                            </div>
                          )}
                          {!purchase.details?.nextDueDate && purchase.status === 'active' && (
                            <div>
                              <span style={{ fontWeight: '500' }}>Next Payment:</span><br />
                              <span style={{ color: '#6b7280' }}>Calculate from start date</span>
                            </div>
                          )}
                          {purchase.details?.overdueAmount > 0 && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <span style={{ fontWeight: '500', color: '#ef4444' }}>Overdue Amount:</span><br />
                              <span style={{ color: '#ef4444', fontWeight: '600' }}>
                                {formatPrice(purchase.details.overdueAmount)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Subscription Tracking */}
                    {purchase.type === 'subscription' && purchase.status === 'active' && (
                      <div style={{
                        background: '#f0fdf4',
                        borderRadius: '8px',
                        padding: '10px',
                        marginBottom: '12px',
                        fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>
                          📋 Subscription Details
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#4b5563' }}>
                          {purchase.details?.startDate && (
                            <div>
                              <span style={{ fontWeight: '500' }}>Started:</span><br />
                              <span>{formatDate(purchase.details.startDate)}</span>
                            </div>
                          )}
                          {purchase.details?.endDate && (
                            <div>
                              <span style={{ fontWeight: '500' }}>Expires:</span><br />
                              <span style={{ 
                                color: new Date(purchase.details.endDate) < new Date() ? '#ef4444' : '#4b5563' 
                              }}>
                                {formatDate(purchase.details.endDate)}
                              </span>
                            </div>
                          )}
                          {purchase.details?.planName && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <span style={{ fontWeight: '500' }}>Plan:</span> {purchase.details.planName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Buyer Info */}
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
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>Buyer: {purchase.user.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#6b7280" />
                        <a href={`tel:${purchase.user.phone}`} style={{ color: '#4b5563', textDecoration: 'none' }}>
                          {purchase.user.phone}
                        </a>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#6b7280" />
                        <a href={`mailto:${purchase.user.email}`} style={{ color: '#4b5563', textDecoration: 'none' }}>
                          {purchase.user.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Status Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '200px' }}>
                    {/* Payment Status */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', color: '#6b7280' }}>
                        <span>💳</span>
                        <span style={{ fontWeight: '500' }}>Payment Status</span>
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '500',
                        background: purchase.paymentStatus === 'paid' ? '#d1fae5' : 
                                   purchase.paymentStatus === 'overdue' ? '#fee2e2' : 
                                   purchase.paymentStatus === 'failed' ? '#fee2e2' : '#fef3c7',
                        color: purchase.paymentStatus === 'paid' ? '#065f46' : 
                               purchase.paymentStatus === 'overdue' ? '#991b1b' : 
                               purchase.paymentStatus === 'failed' ? '#991b1b' : '#92400e'
                      }}>
                        <CheckCircle size={16} />
                        {purchase.paymentStatus === 'overdue' ? 'Overdue' : 
                         purchase.paymentStatus ? purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1) : 'Unknown'}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>
                        <div>Order Date: {formatDate(purchase.createdAt)}</div>
                        <div>Category: {purchase.category}</div>
                      </div>
                    </div>

                    {/* Order Status */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', color: '#6b7280' }}>
                        <span>📦</span>
                        <span style={{ fontWeight: '500' }}>Order Status</span>
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '500',
                        background: purchase.status === 'completed' ? '#d1fae5' : purchase.status === 'approved' ? '#dbeafe' : purchase.status === 'admin_review' ? '#fef3c7' : '#fee2e2',
                        color: purchase.status === 'completed' ? '#065f46' : purchase.status === 'approved' ? '#1e40af' : purchase.status === 'admin_review' ? '#92400e' : '#991b1b'
                      }}>
                        <Clock size={16} />
                        {purchase.status ? purchase.status.replace('_', ' ').charAt(0).toUpperCase() + purchase.status.replace('_', ' ').slice(1) : 'Unknown'}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedPurchase(purchase)}
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

                    {/* Action Buttons */}
                    {(purchase.status === 'admin_review' || purchase.status === 'pending') && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprovePurchase(purchase)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectPurchase(purchase)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {selectedPurchase && (
          <div 
            onClick={() => setSelectedPurchase(null)}
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
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                  {selectedPurchase.type === 'leisure_lease' ? '🏖️ Leisure Lease Details' :
                   selectedPurchase.category ? selectedPurchase.category.charAt(0).toUpperCase() + selectedPurchase.category.slice(1) + ' Purchase Details' : 'Purchase Details'}
                </h2>
                <button
                  onClick={() => setSelectedPurchase(null)}
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
                {/* Buyer Info */}
                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={20} color="#667eea" />
                    Buyer Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Name</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{selectedPurchase.user.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                      <a href={`mailto:${selectedPurchase.user.email}`} style={{ fontSize: '15px', fontWeight: '500', color: '#667eea', textDecoration: 'none' }}>{selectedPurchase.user.email}</a>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Phone</div>
                      <a href={`tel:${selectedPurchase.user.phone}`} style={{ fontSize: '15px', fontWeight: '600', color: '#667eea', textDecoration: 'none' }}>{selectedPurchase.user.phone}</a>
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
                        background: selectedPurchase.status === 'completed' ? '#d1fae5' : '#fef3c7',
                        color: selectedPurchase.status === 'completed' ? '#065f46' : '#92400e'
                      }}>
                        <CheckCircle size={14} />
                        {selectedPurchase.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item Info */}
                {selectedPurchase.item && (
                  <div style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #6ee7b7'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package size={20} color="#10b981" />
                      Item Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Title</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{selectedPurchase.item.title}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Price</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>{formatPrice(selectedPurchase.totalAmount)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Category</div>
                        <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>{selectedPurchase.category}</div>
                      </div>
                      {selectedPurchase.item.location && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
                          <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>{selectedPurchase.item.location}, {selectedPurchase.item.city}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Purchase Details */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #fcd34d'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="#f59e0b" />
                    {selectedPurchase.type === 'leisure_lease' ? '🏖️ Leisure Lease Details' : 
                     selectedPurchase.type === 'rental' ? 'Rental Details' : 'Purchase Details'}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Order Date</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{formatDate(selectedPurchase.createdAt)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Payment Status</div>
                      <div style={{ 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: selectedPurchase.paymentStatus === 'overdue' ? '#ef4444' : '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {selectedPurchase.paymentStatus}
                        {selectedPurchase.paymentStatus === 'overdue' && (
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            background: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '4px'
                          }}>
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Leisure Lease Specific Details */}
                    {selectedPurchase.type === 'leisure_lease' && (
                      <>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>🏖️ Lease Year</div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0369a1' }}>{selectedPurchase.details?.leaseYear}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>💰 Total Amount Paid</div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                            {formatPrice(selectedPurchase.totalAmount)}
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400' }}> (Full Year)</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>📅 Lease Start Date</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{formatDate(selectedPurchase.details?.startDate)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>📅 Lease End Date</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{formatDate(selectedPurchase.details?.endDate)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>💳 Monthly Equivalent</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#6b7280' }}>
                            {formatPrice(selectedPurchase.details?.monthlyEquivalent || 0)}/month
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>🏖️ Lease Type</div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#0369a1',
                            background: '#e0f2fe',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            display: 'inline-block'
                          }}>
                            Full Year Leisure Lease
                          </div>
                        </div>
                        {selectedPurchase.details?.paymentId && (
                          <div>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>💳 Payment ID</div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', fontFamily: 'monospace' }}>
                              {selectedPurchase.details.paymentId}
                            </div>
                          </div>
                        )}
                        {selectedPurchase.details?.orderId && (
                          <div>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>📋 Order ID</div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', fontFamily: 'monospace' }}>
                              {selectedPurchase.details.orderId}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Regular Rental Details */}
                    {selectedPurchase.type === 'rental' && (
                      <>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                            {selectedPurchase.type === 'rental' ? 'Monthly Rent' : 'Total Amount'}
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981' }}>
                            {formatPrice(selectedPurchase.totalAmount)}
                            {selectedPurchase.type === 'rental' && <span style={{ fontSize: '12px', color: '#6b7280' }}>/month</span>}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Order Status</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{selectedPurchase.status}</div>
                        </div>
                        {selectedPurchase.details?.startDate && (
                          <>
                            <div>
                              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Start Date</div>
                              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>{formatDate(selectedPurchase.details.startDate)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>End Date</div>
                              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>
                                {selectedPurchase.details.endDate ? formatDate(selectedPurchase.details.endDate) : 'Ongoing'}
                              </div>
                            </div>
                            {selectedPurchase.details.advancePayment > 0 && (
                              <div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Advance Paid</div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#10b981' }}>
                                  {formatPrice(selectedPurchase.details.advancePayment)}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                    
                    {/* Other Purchase Types */}
                    {selectedPurchase.type !== 'rental' && selectedPurchase.type !== 'leisure_lease' && (
                      <>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Total Amount</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981' }}>
                            {formatPrice(selectedPurchase.totalAmount)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Order Status</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{selectedPurchase.status}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Leisure Lease Summary Section */}
                {selectedPurchase.type === 'leisure_lease' && (
                  <div style={{
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #81d4fa'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏖️ Leisure Lease Summary
                    </h3>
                    <div style={{ 
                      background: '#ffffff', 
                      borderRadius: '8px', 
                      padding: '16px',
                      border: '1px solid #e0f2fe'
                    }}>
                      <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                        <strong>{selectedPurchase.user.name}</strong> has leased <strong>{selectedPurchase.item?.title}</strong> for the entire year <strong>{selectedPurchase.details?.leaseYear}</strong>.
                        <br /><br />
                        <strong>Lease Period:</strong> {formatDate(selectedPurchase.details?.startDate)} to {formatDate(selectedPurchase.details?.endDate)}
                        <br />
                        <strong>Payment:</strong> ₹{selectedPurchase.totalAmount?.toLocaleString()} paid upfront (equivalent to ₹{selectedPurchase.details?.monthlyEquivalent?.toLocaleString()}/month × 12 months)
                        <br />
                        <strong>Status:</strong> {selectedPurchase.status === 'active' && selectedPurchase.paymentStatus === 'paid' ? '✅ Active Lease' : '⏳ Pending'}
                        
                        {selectedPurchase.status === 'active' && selectedPurchase.paymentStatus === 'paid' && (
                          <>
                            <br /><br />
                            <div style={{ 
                              background: '#d1fae5', 
                              color: '#065f46', 
                              padding: '8px 12px', 
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}>
                              🎉 This property is currently leased and hidden from public listings
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Tracking Section for Rentals - Only show for active rentals without end date */}
                {selectedPurchase.type === 'rental' && selectedPurchase.status === 'active' && !selectedPurchase.details?.endDate && (
                  <div style={{
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #81d4fa'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📅 Monthly Payment Tracking
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Monthly Rent</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#0277bd' }}>
                          {formatPrice(selectedPurchase.details?.monthlyRent || selectedPurchase.totalAmount)}/month
                        </div>
                      </div>
                      {selectedPurchase.details?.lastPaymentDate && (
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Last Payment Date</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                            {formatDate(selectedPurchase.details.lastPaymentDate)}
                          </div>
                        </div>
                      )}
                      
                      {/* Next Payment Due - Only show for active rentals without end date */}
                      {selectedPurchase.type === 'rental' && selectedPurchase.status === 'active' && !selectedPurchase.details?.endDate && (
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Next Payment Date</div>
                          <div style={{ 
                            fontSize: '15px', 
                            fontWeight: '600'
                          }}>
                            {(() => {
                              let nextPaymentDate = null;
                              let nextPaymentDateString = '';
                              
                              if (selectedPurchase.details?.nextDueDate) {
                                nextPaymentDate = new Date(selectedPurchase.details.nextDueDate);
                                nextPaymentDateString = formatDate(selectedPurchase.details.nextDueDate);
                              } else if (selectedPurchase.details?.lastPaymentDate) {
                                // Calculate next payment date (1 month from last payment)
                                const lastPayment = new Date(selectedPurchase.details.lastPaymentDate);
                                const nextPayment = new Date(lastPayment);
                                nextPayment.setMonth(nextPayment.getMonth() + 1);
                                nextPaymentDate = nextPayment;
                                nextPaymentDateString = formatDate(nextPayment.toISOString());
                              } else if (selectedPurchase.details?.startDate) {
                                // Calculate from start date (1 month from start)
                                const startDate = new Date(selectedPurchase.details.startDate);
                                const nextPayment = new Date(startDate);
                                nextPayment.setMonth(nextPayment.getMonth() + 1);
                                nextPaymentDate = nextPayment;
                                nextPaymentDateString = formatDate(nextPayment.toISOString());
                              } else {
                                return <span style={{ color: '#6b7280' }}>Contact admin for payment schedule</span>;
                              }
                              
                              // Check if payment is actually overdue (only for active rentals)
                              const today = new Date();
                              const isOverdue = selectedPurchase.status === 'active' && nextPaymentDate && nextPaymentDate < today;
                              
                              return (
                                <span style={{ 
                                  color: isOverdue ? '#ef4444' : '#1f2937'
                                }}>
                                  {nextPaymentDateString}
                                  {isOverdue && (
                                    <span style={{
                                      fontSize: '11px',
                                      padding: '2px 6px',
                                      background: '#fee2e2',
                                      color: '#991b1b',
                                      borderRadius: '4px',
                                      marginLeft: '8px'
                                    }}>
                                      OVERDUE
                                    </span>
                                  )}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                      
                      {selectedPurchase.details?.overdueAmount > 0 && (
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Overdue Amount</div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>
                            {formatPrice(selectedPurchase.details.overdueAmount)}
                          </div>
                        </div>
                      )}
                      {selectedPurchase.details?.totalPaid > 0 && (
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Total Paid</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#10b981' }}>
                            {formatPrice(selectedPurchase.details.totalPaid)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Payment Status Summary */}
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.7)', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>Payment Status</div>
                        <div style={{ 
                          fontSize: '15px', 
                          fontWeight: '600'
                        }}>
                          {(() => {
                            // Calculate if payment is actually overdue
                            let isActuallyOverdue = false;
                            
                            if (selectedPurchase.details?.nextDueDate) {
                              const nextDue = new Date(selectedPurchase.details.nextDueDate);
                              const today = new Date();
                              isActuallyOverdue = nextDue < today;
                            } else if (selectedPurchase.details?.lastPaymentDate) {
                              const lastPayment = new Date(selectedPurchase.details.lastPaymentDate);
                              const nextPayment = new Date(lastPayment);
                              nextPayment.setMonth(nextPayment.getMonth() + 1);
                              const today = new Date();
                              isActuallyOverdue = nextPayment < today;
                            } else if (selectedPurchase.details?.startDate) {
                              const startDate = new Date(selectedPurchase.details.startDate);
                              const nextPayment = new Date(startDate);
                              nextPayment.setMonth(nextPayment.getMonth() + 1);
                              const today = new Date();
                              isActuallyOverdue = nextPayment < today;
                            }
                            
                            const color = isActuallyOverdue ? '#ef4444' : 
                                         selectedPurchase.paymentStatus === 'paid' ? '#10b981' : '#f59e0b';
                            
                            const statusText = isActuallyOverdue ? 'Payment Overdue' : 
                                              selectedPurchase.paymentStatus === 'paid' ? 'Up to Date' : 
                                              selectedPurchase.paymentStatus ? selectedPurchase.paymentStatus.charAt(0).toUpperCase() + selectedPurchase.paymentStatus.slice(1) : 'Unknown';
                            
                            return <span style={{ color }}>{statusText}</span>;
                          })()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>Rental Status</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                          {(() => {
                            if (selectedPurchase.status === 'active') return 'Currently Renting';
                            if (selectedPurchase.status === 'completed') return 'Rental Completed';
                            if (selectedPurchase.status && typeof selectedPurchase.status === 'string') {
                              const status = selectedPurchase.status as string;
                              return status.charAt(0).toUpperCase() + status.slice(1);
                            }
                            return 'Unknown';
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rental Completion Section for Vacated/Completed Rentals */}
                {selectedPurchase.type === 'rental' && (selectedPurchase.status === 'completed' || selectedPurchase.details?.endDate) && (
                  <div style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #86efac'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ✅ Rental Completed
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Rental Period</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                          {selectedPurchase.details?.startDate && formatDate(selectedPurchase.details.startDate)} - {selectedPurchase.details?.endDate && formatDate(selectedPurchase.details.endDate)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Monthly Rent</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                          {formatPrice(selectedPurchase.details?.monthlyRent || selectedPurchase.totalAmount)}/month
                        </div>
                      </div>
                      {selectedPurchase.details?.totalPaid > 0 && (
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Total Paid</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#059669' }}>
                            {formatPrice(selectedPurchase.details.totalPaid)}
                          </div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#059669' }}>
                          ✅ Rental Completed
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription Details Section */}
                {selectedPurchase.type === 'subscription' && (
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #86efac'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📋 Subscription Timeline
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Plan Type</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                          {selectedPurchase.details?.planName || selectedPurchase.item?.title || 'Subscription Plan'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Monthly Cost</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                          {formatPrice(selectedPurchase.totalAmount)}/month
                        </div>
                      </div>
                      {selectedPurchase.createdAt && (
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Subscription Started</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                            {formatDate(selectedPurchase.createdAt)}
                          </div>
                        </div>
                      )}
                      {selectedPurchase.details?.endDate && (
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Expires On</div>
                          <div style={{ 
                            fontSize: '15px', 
                            fontWeight: '600', 
                            color: new Date(selectedPurchase.details.endDate) < new Date() ? '#ef4444' : '#1f2937' 
                          }}>
                            {formatDate(selectedPurchase.details.endDate)}
                            {new Date(selectedPurchase.details.endDate) < new Date() && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                background: '#fee2e2',
                                color: '#991b1b',
                                borderRadius: '4px',
                                marginLeft: '8px'
                              }}>
                                EXPIRED
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedPurchase.details?.duration && (
                        <div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Duration</div>
                          <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>
                            {selectedPurchase.details.duration}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Subscription Status Summary */}
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.7)', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>Status</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#059669' }}>
                          {selectedPurchase.status === 'active' ? 'Active Subscription' : 
                           selectedPurchase.status ? selectedPurchase.status.charAt(0).toUpperCase() + selectedPurchase.status.slice(1) : 'Unknown'}
                        </div>
                      </div>
                      {selectedPurchase.details?.endDate && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>Days Remaining</div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                            {(() => {
                              const endDate = new Date(selectedPurchase.details.endDate);
                              const today = new Date();
                              const diffTime = endDate.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              return diffDays > 0 ? `${diffDays} days` : 'Expired';
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {(selectedPurchase.status === 'admin_review' || selectedPurchase.status === 'pending') && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        handleApprovePurchase(selectedPurchase);
                        setSelectedPurchase(null);
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
                      Approve Purchase
                    </button>
                    <button
                      onClick={() => {
                        handleRejectPurchase(selectedPurchase);
                        setSelectedPurchase(null);
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
                      Reject Purchase
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}