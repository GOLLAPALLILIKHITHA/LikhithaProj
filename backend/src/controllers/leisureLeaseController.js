const LeisureLease = require('../models/LeisureLease');
const User = require('../models/User');
const Listing = require('../models/Listing');
const KYC = require('../models/KYC');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create leisure lease order
exports.createLeisureLeaseOrder = async (req, res) => {
  try {
    const { listingId, leaseYear, startDate } = req.body;
    const userId = req.user.id;

    // Check KYC verification
    const kyc = await KYC.findOne({ where: { userId } });
    if (!kyc || kyc.status !== 'verified') {
      return res.status(403).json({ 
        message: 'KYC verification required before leasing a property.',
        kycStatus: kyc ? kyc.status : 'not_submitted',
        requiresKYC: true
      });
    }

    // Get listing details
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (listing.category !== 'property_rent') {
      return res.status(400).json({ message: 'This property is not available for rent' });
    }

    if (!listing.isLeisure) {
      return res.status(400).json({ message: 'This property is not available for leisure lease' });
    }

    // Check if property is already leased for this year
    const existingLease = await LeisureLease.findOne({
      where: { 
        listingId, 
        leaseYear,
        status: 'active',
        paymentStatus: 'paid' // Only consider paid leases as blocking
      }
    });

    if (existingLease) {
      return res.status(400).json({ 
        message: `This property is already leased for the year ${leaseYear}` 
      });
    }

    // Calculate lease details
    const monthlyRent = parseFloat(listing.price);
    const totalAmount = monthlyRent * 12; // Full year payment

    // Check Razorpay test mode limits
    const RAZORPAY_TEST_LIMIT = 50000;
    if (totalAmount > RAZORPAY_TEST_LIMIT) {
      return res.status(400).json({
        message: `Leisure lease amount ₹${totalAmount.toLocaleString()} exceeds test mode limit of ₹${RAZORPAY_TEST_LIMIT.toLocaleString()}`,
        error: 'AMOUNT_LIMIT_EXCEEDED',
        details: {
          monthlyRent: monthlyRent,
          totalAmount: totalAmount,
          limit: RAZORPAY_TEST_LIMIT
        },
        suggestion: 'This property requires live payment gateway. Please contact support.'
      });
    }

    // Calculate end date (1 year from start date)
    const startDateObj = new Date(startDate);
    const endDate = new Date(startDateObj);
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Create Razorpay order
    console.log(`Creating Razorpay order for leisure lease: ₹${totalAmount} (${Math.round(totalAmount * 100)} paise)`);
    
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // Amount in paise
        currency: 'INR',
        receipt: `leisure_lease_${Date.now()}`,
        notes: {
          listingId,
          userId,
          leaseYear,
          type: 'leisure_lease'
        }
      });
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError);
      return res.status(500).json({ 
        message: 'Payment gateway error. Please try again.',
        error: 'PAYMENT_GATEWAY_ERROR'
      });
    }

    // Create leisure lease record
    const leisureLease = await LeisureLease.create({
      userId,
      listingId,
      leaseYear,
      startDate,
      endDate,
      totalAmount,
      monthlyEquivalent: monthlyRent,
      orderId: razorpayOrder.id,
      paymentStatus: 'pending'
      // status will default to 'pending' from model
    });

    res.json({
      success: true,
      leisureLease,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID // Add the Razorpay key for frontend
      },
      details: {
        propertyTitle: listing.title,
        monthlyRent: `₹${monthlyRent.toLocaleString()}`,
        totalAmount: `₹${totalAmount.toLocaleString()}`,
        leaseYear,
        startDate,
        endDate: endDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Create leisure lease order error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Verify leisure lease payment
exports.verifyLeisureLeasePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, leisureLeaseId } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update leisure lease
    const leisureLease = await LeisureLease.findByPk(leisureLeaseId, {
      include: [
        { model: Listing, as: 'property' },
        { model: User, as: 'tenant' }
      ]
    });

    if (!leisureLease) {
      return res.status(404).json({ message: 'Leisure lease not found' });
    }

    await leisureLease.update({
      paymentStatus: 'paid',
      paymentId: razorpay_payment_id,
      status: 'active'
    });

    res.json({
      success: true,
      message: 'Leisure lease payment verified successfully!',
      leisureLease: {
        id: leisureLease.id,
        propertyTitle: leisureLease.property.title,
        leaseYear: leisureLease.leaseYear,
        totalAmount: leisureLease.totalAmount,
        startDate: leisureLease.startDate,
        endDate: leisureLease.endDate
      }
    });

  } catch (error) {
    console.error('Verify leisure lease payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's leisure leases
exports.getUserLeisureLeases = async (req, res) => {
  try {
    const userId = req.user.id;

    const leisureLeases = await LeisureLease.findAll({
      where: { userId },
      include: [
        { 
          model: Listing, 
          as: 'property',
          attributes: ['id', 'title', 'location', 'city', 'images', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ leisureLeases });

  } catch (error) {
    console.error('Get user leisure leases error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all leisure leases with full details
exports.getAllLeisureLeases = async (req, res) => {
  try {
    const leisureLeases = await LeisureLease.findAll({
      include: [
        { 
          model: Listing, 
          as: 'property',
          attributes: ['id', 'title', 'location', 'city', 'images', 'price', 'category', 'subCategory']
        },
        { 
          model: User, 
          as: 'tenant',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format the data for admin view
    const formattedLeases = leisureLeases.map(lease => ({
      id: lease.id,
      property: {
        id: lease.property.id,
        title: lease.property.title,
        location: `${lease.property.location}, ${lease.property.city}`,
        image: lease.property.images?.[0] || null,
        monthlyRent: lease.monthlyEquivalent,
        category: lease.property.category,
        subCategory: lease.property.subCategory
      },
      tenant: {
        id: lease.tenant.id,
        name: lease.tenant.name,
        email: lease.tenant.email,
        phone: lease.tenant.phone
      },
      lease: {
        year: lease.leaseYear,
        startDate: lease.startDate,
        endDate: lease.endDate,
        totalAmount: lease.totalAmount,
        monthlyEquivalent: lease.monthlyEquivalent,
        paymentStatus: lease.paymentStatus,
        status: lease.status,
        paymentId: lease.paymentId,
        orderId: lease.orderId
      },
      createdAt: lease.createdAt,
      updatedAt: lease.updatedAt
    }));

    res.json({ 
      leisureLeases: formattedLeases,
      summary: {
        total: leisureLeases.length,
        active: leisureLeases.filter(l => l.status === 'active' && l.paymentStatus === 'paid').length,
        pending: leisureLeases.filter(l => l.status === 'pending').length,
        totalRevenue: leisureLeases
          .filter(l => l.paymentStatus === 'paid')
          .reduce((sum, l) => sum + parseFloat(l.totalAmount), 0)
      }
    });

  } catch (error) {
    console.error('Get all leisure leases error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get property leisure lease status
exports.getPropertyLeisureStatus = async (req, res) => {
  try {
    const { listingId } = req.params;
    const currentYear = new Date().getFullYear();

    const leisureLeases = await LeisureLease.findAll({
      where: { 
        listingId,
        status: 'active',
        paymentStatus: 'paid' // Only show confirmed paid leases
      },
      include: [
        { 
          model: User, 
          as: 'tenant',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['leaseYear', 'DESC']]
    });

    // Check availability for current and next year
    const currentYearLease = leisureLeases.find(lease => lease.leaseYear === currentYear);
    const nextYearLease = leisureLeases.find(lease => lease.leaseYear === currentYear + 1);

    res.json({
      leisureLeases,
      availability: {
        [currentYear]: !currentYearLease,
        [currentYear + 1]: !nextYearLease
      }
    });

  } catch (error) {
    console.error('Get property leisure status error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;