const PropertyRental = require('../models/PropertyRental');
const MonthlyPayment = require('../models/MonthlyPayment');
const User = require('../models/User');
const Listing = require('../models/Listing');
const KYC = require('../models/KYC');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create rental order with flexible payment options
exports.createRentalOrder = async (req, res) => {
  try {
    const { listingId, startDate, paymentOption = 'standard' } = req.body;
    const userId = req.user.id;

    // Check KYC verification
    const kyc = await KYC.findOne({ where: { userId } });
    if (!kyc || kyc.status !== 'verified') {
      return res.status(403).json({ 
        message: 'KYC verification required before renting a property.',
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

    // Calculate rental details based on payment option
    const monthlyRent = parseFloat(listing.price);
    let advancePayment, firstMonthRent, initialPayment, paymentDescription;

    if (paymentOption === 'reduced' || monthlyRent > 16666) { // If monthly rent > ₹16,666, total would exceed ₹50k
      // Reduced payment option: 1 month advance + 1st month rent
      advancePayment = monthlyRent; // 1 month advance
      firstMonthRent = monthlyRent; // 1 month rent
      initialPayment = advancePayment + firstMonthRent; // Total upfront payment
      paymentDescription = 'Reduced Payment (1 month advance + 1st month rent)';
    } else {
      // Standard payment option: 2 months advance + 1st month rent
      advancePayment = monthlyRent * 2; // 2 months advance
      firstMonthRent = monthlyRent; // 1 month rent
      initialPayment = advancePayment + firstMonthRent; // Total upfront payment
      paymentDescription = 'Standard Payment (2 months advance + 1st month rent)';
    }

    // Final check for test mode limits
    const RAZORPAY_TEST_LIMIT = 50000;
    if (initialPayment > RAZORPAY_TEST_LIMIT) {
      return res.status(400).json({
        message: `Payment amount ₹${initialPayment.toLocaleString()} exceeds test mode limit of ₹${RAZORPAY_TEST_LIMIT.toLocaleString()}`,
        error: 'AMOUNT_LIMIT_EXCEEDED',
        details: {
          monthlyRent: monthlyRent,
          totalAmount: initialPayment,
          limit: RAZORPAY_TEST_LIMIT,
          currentOption: paymentOption,
          breakdown: {
            advancePayment: `₹${advancePayment.toLocaleString()}`,
            firstMonthRent: `₹${firstMonthRent.toLocaleString()}`,
            total: `₹${initialPayment.toLocaleString()}`
          }
        },
        suggestion: 'This property requires live payment gateway. Please contact support.'
      });
    }

    // Calculate prepaid dates - rent paid in advance
    const startDateObj = new Date(startDate);
    const paymentDayOfMonth = startDateObj.getDate(); // Same date every month
    const paidUntilDate = new Date(startDateObj);
    paidUntilDate.setMonth(paidUntilDate.getMonth() + 1); // Paid until next month
    
    // Next payment due date (1 month from start date)
    const nextPaymentDue = new Date(startDateObj);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);

    // Create Razorpay order for initial payment (2 months advance + 1 month rent)
    console.log(`Creating Razorpay order for ₹${initialPayment} (${Math.round(initialPayment * 100)} paise)`);
    
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(initialPayment * 100), // Amount in paise
        currency: 'INR',
        receipt: `rental_${Date.now()}`,
        notes: {
          listingId,
          userId,
          paymentType: 'initial_payment',
          monthlyRent: monthlyRent.toString(),
          totalMonths: '3'
        }
      });
      
      console.log(`Razorpay order created successfully: ${razorpayOrder.id}`);
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError);
      
      // Check if it's an amount limit error
      if (razorpayError.error && razorpayError.error.description) {
        if (razorpayError.error.description.includes('amount') || razorpayError.error.description.includes('limit')) {
          return res.status(400).json({ 
            message: `Payment amount limit exceeded. The total amount ₹${initialPayment.toLocaleString()} (₹${monthlyRent.toLocaleString()} × 3 months) exceeds the allowed limit for test payments. Please contact support.`,
            error: 'AMOUNT_LIMIT_EXCEEDED',
            details: {
              monthlyRent: monthlyRent,
              totalAmount: initialPayment,
              breakdown: `₹${advancePayment.toLocaleString()} (2 months advance) + ₹${firstMonthRent.toLocaleString()} (1st month) = ₹${initialPayment.toLocaleString()}`
            }
          });
        }
      }
      
      return res.status(500).json({ 
        message: 'Failed to create payment order', 
        error: razorpayError.error?.description || razorpayError.message || 'Unknown payment gateway error'
      });
    }

    // Create rental record
    const rental = await PropertyRental.create({
      userId,
      listingId,
      startDate: startDateObj.toISOString().split('T')[0],
      monthlyRent,
      advancePayment,
      firstMonthRent,
      initialPayment,
      totalAmount: initialPayment, // Required field
      paidUntilDate: paidUntilDate.toISOString().split('T')[0],
      paymentDayOfMonth,
      nextPaymentDue: nextPaymentDue.toISOString().split('T')[0],
      monthlyPaymentStatus: 'current',
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
      paymentStatus: 'pending'
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: initialPayment,
      currency: 'INR',
      rentalId: rental.id,
      key: process.env.RAZORPAY_KEY_ID,
      paymentOption: paymentOption,
      breakdown: {
        monthlyRent,
        paymentType: paymentDescription,
        advancePayment: `₹${advancePayment.toLocaleString()}`,
        firstMonthRent: `₹${firstMonthRent.toLocaleString()}`,
        initialPayment: `₹${initialPayment.toLocaleString()}`,
        paidUntilDate: paidUntilDate.toISOString().split('T')[0],
        nextPaymentDue: nextPaymentDue.toISOString().split('T')[0],
        paymentDayOfMonth: `${paymentDayOfMonth}th of every month`,
        rentalType: 'Prepaid Monthly - Pay in advance like mobile plan'
      }
    });
  } catch (error) {
    console.error('Create rental order error:', error);
    res.status(500).json({ message: 'Failed to create rental order', error: error.message });
  }
};

// Verify rental payment
exports.verifyRentalPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rentalId } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update rental record
    const rental = await PropertyRental.findByPk(rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    rental.razorpayPaymentId = razorpay_payment_id;
    rental.razorpaySignature = razorpay_signature;
    rental.paymentStatus = 'paid';
    rental.status = 'active';
    rental.lastPaymentDate = new Date().toISOString().split('T')[0];
    
    // Set paid until date for prepaid system
    const startDate = new Date(rental.startDate);
    const paidUntil = new Date(startDate);
    paidUntil.setMonth(paidUntil.getMonth() + 1); // Paid for first month
    rental.paidUntilDate = paidUntil.toISOString().split('T')[0];
    rental.paymentDayOfMonth = startDate.getDate();
    
    await rental.save();

    // Create monthly payment records for the entire rental period
    await createMonthlyPaymentSchedule(rental);

    // Update listing status
    const listing = await Listing.findByPk(rental.listingId);
    if (listing) {
      listing.status = 'rented';
      await listing.save();
    }

    res.json({
      message: 'Payment verified successfully',
      rental: await PropertyRental.findByPk(rentalId, {
        include: [
          { model: User, as: 'tenant', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Listing, as: 'property', attributes: ['id', 'title', 'location', 'city', 'price', 'images'] }
        ]
      })
    });
  } catch (error) {
    console.error('Verify rental payment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

// Get user's rentals
exports.getUserRentals = async (req, res) => {
  try {
    const userId = req.user.id;

    const rentals = await PropertyRental.findAll({
      where: { userId },
      include: [
        {
          model: Listing,
          as: 'property',
          attributes: ['id', 'title', 'location', 'city', 'state', 'price', 'images', 'bedrooms', 'bathrooms', 'area'],
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(rentals);
  } catch (error) {
    console.error('Get user rentals error:', error);
    res.status(500).json({ message: 'Failed to fetch rentals', error: error.message });
  }
};

// Get all rentals (Admin only)
exports.getAllRentals = async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const rentals = await PropertyRental.findAll({
      where,
      include: [
        { model: User, as: 'tenant', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: Listing,
          as: 'property',
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(rentals);
  } catch (error) {
    console.error('Get all rentals error:', error);
    res.status(500).json({ message: 'Failed to fetch rentals', error: error.message });
  }
};

// Update rental status (Admin only)
exports.updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const rental = await PropertyRental.findByPk(id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    rental.status = status || rental.status;
    rental.adminNotes = adminNotes || rental.adminNotes;
    await rental.save();

    // Update listing status
    if (status === 'completed' || status === 'cancelled') {
      const listing = await Listing.findByPk(rental.listingId);
      if (listing) {
        listing.status = 'active';
        await listing.save();
      }
    }

    res.json({
      message: 'Rental updated successfully',
      rental: await PropertyRental.findByPk(id, {
        include: [
          { model: User, as: 'tenant' },
          { model: Listing, as: 'property' }
        ]
      })
    });
  } catch (error) {
    console.error('Update rental error:', error);
    res.status(500).json({ message: 'Failed to update rental', error: error.message });
  }
};

// Get rental statistics (Admin only)
exports.getRentalStats = async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    
    const stats = await PropertyRental.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalRevenue']
      ],
      group: ['status']
    });

    const totalRentals = await PropertyRental.count();
    const activeRentals = await PropertyRental.count({ where: { status: 'active' } });

    res.json({
      total: totalRentals,
      active: activeRentals,
      byStatus: stats
    });
  } catch (error) {
    console.error('Get rental stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
// Helper function to create initial monthly payment record
async function createMonthlyPaymentSchedule(rental) {
  // For prepaid rentals, we create the first month payment record
  const startDate = new Date(rental.startDate);
  const monthYear = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
  
  const firstMonthPayment = {
    rentalId: rental.id,
    userId: rental.userId,
    monthNumber: 1,
    monthYear,
    amount: rental.monthlyRent,
    dueDate: startDate.toISOString().split('T')[0],
    paidDate: rental.lastPaymentDate,
    status: 'paid',
    totalAmount: rental.monthlyRent,
    notes: 'Paid with initial payment (advance + first month) - Prepaid system'
  };
  
  await MonthlyPayment.create(firstMonthPayment);
}

// Create monthly payment order (for subsequent months)
exports.createMonthlyPaymentOrder = async (req, res) => {
  try {
    const { rentalId, monthNumber } = req.body;
    const userId = req.user.id;

    // Get rental details
    const rental = await PropertyRental.findOne({
      where: { id: rentalId, userId },
      include: [
        { model: Listing, as: 'property', attributes: ['title'] }
      ]
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.status !== 'active') {
      return res.status(400).json({ message: 'Rental is not active' });
    }

    // Check if this is a vacate request
    if (rental.vacateRequested) {
      return res.status(400).json({ message: 'Property is in vacate process. Use vacate payment instead.' });
    }

    // Get or create monthly payment record for this month
    let monthlyPayment = await MonthlyPayment.findOne({
      where: { rentalId, monthNumber, userId }
    });

    if (!monthlyPayment) {
      // Create payment record for this month
      const startDate = new Date(rental.startDate);
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + monthNumber - 1);
      
      const monthYear = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
      
      monthlyPayment = await MonthlyPayment.create({
        rentalId,
        userId,
        monthNumber,
        monthYear,
        amount: rental.monthlyRent,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        totalAmount: rental.monthlyRent
      });
    }

    if (monthlyPayment.status === 'paid') {
      return res.status(400).json({ message: 'This month\'s rent is already paid' });
    }

    // Check if payment is overdue and add late fee
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const paidUntil = new Date(rental.paidUntilDate || rental.startDate);
    paidUntil.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysDiff < 0;
    
    let lateFee = 0;
    if (isOverdue) {
      const overdueDays = Math.abs(daysDiff);
      const lateFeePercent = Math.ceil(overdueDays / 2) * 2; // 2% for every 2 days
      lateFee = (rental.monthlyRent * lateFeePercent) / 100;
    }
    
    const totalAmount = parseFloat(rental.monthlyRent) + lateFee;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: `monthly_${rentalId}_${monthNumber}_${Date.now()}`,
      notes: {
        rentalId,
        monthNumber,
        userId,
        paymentType: 'monthly_rent'
      }
    });

    // Update monthly payment record
    monthlyPayment.razorpayOrderId = razorpayOrder.id;
    monthlyPayment.lateFee = lateFee;
    monthlyPayment.totalAmount = totalAmount;
    if (isOverdue && monthlyPayment.status !== 'overdue') {
      monthlyPayment.status = 'overdue';
    }
    await monthlyPayment.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      monthlyPaymentId: monthlyPayment.id,
      key: process.env.RAZORPAY_KEY_ID,
      breakdown: {
        monthlyRent: rental.monthlyRent,
        lateFee: lateFee,
        lateFeePercent: isOverdue ? Math.ceil(Math.abs(daysDiff) / 2) * 2 : 0,
        overdueDays: isOverdue ? Math.abs(daysDiff) : 0,
        totalAmount: totalAmount,
        monthNumber: monthNumber,
        monthYear: monthlyPayment.monthYear,
        dueDate: monthlyPayment.dueDate,
        isOverdue: isOverdue,
        propertyTitle: rental.property.title
      }
    });
  } catch (error) {
    console.error('Create monthly payment order error:', error);
    res.status(500).json({ message: 'Failed to create monthly payment order', error: error.message });
  }
};

// Verify monthly payment
exports.verifyMonthlyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, monthlyPaymentId, isVacatePayment } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update monthly payment record
    const monthlyPayment = await MonthlyPayment.findByPk(monthlyPaymentId, {
      include: [
        { model: PropertyRental, as: 'rental' }
      ]
    });

    if (!monthlyPayment) {
      return res.status(404).json({ message: 'Monthly payment not found' });
    }

    monthlyPayment.razorpayPaymentId = razorpay_payment_id;
    monthlyPayment.razorpaySignature = razorpay_signature;
    monthlyPayment.status = 'paid';
    monthlyPayment.paidDate = new Date().toISOString().split('T')[0];
    monthlyPayment.paymentMethod = 'razorpay';
    if (isVacatePayment) {
      monthlyPayment.notes = 'Payment for vacate - allows immediate vacate';
    }
    await monthlyPayment.save();

    // Update rental record for prepaid system
    const rental = monthlyPayment.rental;
    rental.lastPaymentDate = monthlyPayment.paidDate;
    
    if (isVacatePayment) {
      // For vacate payments, extend paid period and mark as ready for vacate
      const currentPaidUntil = new Date(rental.paidUntilDate || rental.startDate);
      const newPaidUntil = new Date(currentPaidUntil);
      newPaidUntil.setMonth(newPaidUntil.getMonth() + 1); // Extend by 1 month
      rental.paidUntilDate = newPaidUntil.toISOString().split('T')[0];
      rental.monthlyPaymentStatus = 'current';
      
      // Don't set next payment due since they're vacating
      rental.nextPaymentDue = null;
    } else {
      // For regular monthly payments, extend the paid until date
      const currentPaidUntil = new Date(rental.paidUntilDate || rental.startDate);
      const newPaidUntil = new Date(currentPaidUntil);
      newPaidUntil.setMonth(newPaidUntil.getMonth() + 1); // Extend by 1 month
      rental.paidUntilDate = newPaidUntil.toISOString().split('T')[0];
      
      // Set next payment due date
      const nextDueDate = new Date(newPaidUntil);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      rental.nextPaymentDue = nextDueDate.toISOString().split('T')[0];
      rental.monthlyPaymentStatus = 'current';
    }
    
    await rental.save();

    res.json({
      message: isVacatePayment ? 'Vacate payment verified successfully - you can now vacate' : 'Monthly payment verified successfully',
      monthlyPayment,
      rental: {
        paidUntilDate: rental.paidUntilDate,
        nextPaymentDue: rental.nextPaymentDue,
        status: rental.status,
        isVacatePayment: isVacatePayment || false
      }
    });
  } catch (error) {
    console.error('Verify monthly payment error:', error);
    res.status(500).json({ message: 'Monthly payment verification failed', error: error.message });
  }
};

// Get user's pending monthly payments
exports.getPendingMonthlyPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingPayments = await MonthlyPayment.findAll({
      where: { 
        userId, 
        status: ['pending', 'overdue'] 
      },
      include: [
        {
          model: PropertyRental,
          as: 'rental',
          include: [
            {
              model: Listing,
              as: 'property',
              attributes: ['id', 'title', 'location', 'city', 'images']
            }
          ]
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json(pendingPayments);
  } catch (error) {
    console.error('Get pending monthly payments error:', error);
    res.status(500).json({ message: 'Failed to fetch pending payments', error: error.message });
  }
};
// Admin: Complete vacate process (clear vacate request status)
exports.completeVacate = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy = 'Admin', approvalDate = new Date().toISOString().split('T')[0] } = req.body || {};

    // Get rental details
    const rental = await PropertyRental.findByPk(id, {
      include: [
        { model: Listing, as: 'property' },
        { model: User, as: 'tenant', attributes: ['name', 'email', 'phone'] }
      ]
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Complete the vacate process
    rental.status = 'completed';
    rental.vacateRequested = false; // Clear the vacate request flag
    rental.endDate = rental.vacateDate || new Date().toISOString().split('T')[0];
    rental.monthlyPaymentStatus = 'completed';
    rental.adminNotes = `${rental.adminNotes || ''} | Vacate completed by ${approvedBy} on ${approvalDate}`;
    await rental.save();

    // Update listing status back to active (available for rent again)
    const listing = await Listing.findByPk(rental.listingId);
    if (listing) {
      listing.status = 'active';
      await listing.save();
    }

    // Cancel all pending monthly payments
    await MonthlyPayment.update(
      { status: 'waived', notes: 'Rental completed - vacate approved by admin' },
      { 
        where: { 
          rentalId: id, 
          status: ['pending', 'overdue'] 
        } 
      }
    );

    res.json({
      message: 'Vacate process completed successfully',
      rental: {
        id: rental.id,
        status: rental.status,
        vacateRequested: rental.vacateRequested,
        endDate: rental.endDate,
        property: {
          id: rental.property.id,
          title: rental.property.title,
          status: listing.status
        },
        tenant: rental.tenant
      }
    });
  } catch (error) {
    console.error('Complete vacate error:', error);
    res.status(500).json({ message: 'Failed to complete vacate process', error: error.message });
  }
};

// Admin: Remove property from rental
exports.removeFromRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get rental details
    const rental = await PropertyRental.findByPk(id, {
      include: [
        { model: Listing, as: 'property' },
        { model: User, as: 'tenant', attributes: ['name', 'email', 'phone'] }
      ]
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Update rental status to cancelled
    rental.status = 'cancelled';
    rental.monthlyPaymentStatus = 'completed';
    rental.adminNotes = `Property removed from rental. Reason: ${reason || 'Admin action'}`;
    await rental.save();

    // Update listing status back to active (available for rent again)
    const listing = await Listing.findByPk(rental.listingId);
    if (listing) {
      listing.status = 'active';
      await listing.save();
    }

    // Cancel all pending monthly payments
    await MonthlyPayment.update(
      { status: 'waived', notes: 'Rental cancelled by admin' },
      { 
        where: { 
          rentalId: id, 
          status: ['pending', 'overdue'] 
        } 
      }
    );

    res.json({
      message: 'Property successfully removed from rental and made available again',
      rental: {
        id: rental.id,
        status: rental.status,
        property: {
          id: rental.property.id,
          title: rental.property.title,
          status: listing.status
        },
        tenant: rental.tenant
      }
    });
  } catch (error) {
    console.error('Remove from rental error:', error);
    res.status(500).json({ message: 'Failed to remove property from rental', error: error.message });
  }
};
// Tenant: Request to vacate property (improved logic based on paid period)
exports.requestVacate = async (req, res) => {
  try {
    const { rentalId, vacateDate, reason, paymentCompleted } = req.body;
    const userId = req.user.id;

    // Get rental details
    const rental = await PropertyRental.findOne({
      where: { id: rentalId, userId },
      include: [
        { model: Listing, as: 'property', attributes: ['title', 'city'] }
      ]
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.status !== 'active') {
      return res.status(400).json({ message: 'Only active rentals can be vacated' });
    }

    // If payment was completed, complete the vacate process
    if (paymentCompleted) {
      rental.vacateRequested = true;
      rental.vacateDate = vacateDate;
      rental.vacateReason = reason;
      rental.status = 'completed';
      rental.endDate = vacateDate;
      rental.monthlyPaymentStatus = 'completed';
      await rental.save();

      // Make property available again
      const listing = await Listing.findByPk(rental.listingId);
      if (listing) {
        listing.status = 'active';
        await listing.save();
      }

      return res.json({
        message: 'Vacate completed successfully after payment',
        rental: {
          id: rental.id,
          property: rental.property.title,
          vacateDate: rental.vacateDate,
          status: 'completed',
          noPaymentNeeded: false,
          paymentCompleted: true
        }
      });
    }

    if (rental.vacateRequested) {
      return res.status(400).json({ message: 'Vacate request already submitted' });
    }

    // Parse dates for comparison
    const paidUntil = new Date(rental.paidUntilDate);
    paidUntil.setHours(0, 0, 0, 0);
    
    const requestedVacateDate = new Date(vacateDate);
    requestedVacateDate.setHours(0, 0, 0, 0);
    
    // Check if vacating BEFORE or ON the paid until date
    const isVacatingBeforePaidPeriodEnds = requestedVacateDate <= paidUntil;
    
    if (isVacatingBeforePaidPeriodEnds) {
      // Vacating BEFORE paid period ends - Submit request to admin (no payment needed)
      rental.vacateRequested = true;
      rental.vacateDate = vacateDate;
      rental.vacateReason = reason;
      await rental.save();

      res.json({
        message: 'Vacate request submitted to admin for approval. No payment needed as you are vacating within your paid period.',
        rental: {
          id: rental.id,
          property: rental.property.title,
          vacateDate: rental.vacateDate,
          paidUntilDate: rental.paidUntilDate,
          noPaymentNeeded: true,
          status: 'pending_admin_approval',
          adminApprovalRequired: true
        }
      });
    } else {
      // Vacating AFTER paid period ends - Payment required for the month they want to vacate
      const nextPaymentAmount = rental.monthlyRent;
      
      res.json({
        message: `Payment required! You are trying to vacate after your paid period (${rental.paidUntilDate}). You must pay for the month you want to vacate.`,
        rental: {
          id: rental.id,
          property: rental.property.title,
          vacateDate: vacateDate,
          paidUntilDate: rental.paidUntilDate,
          paymentNeeded: true,
          paymentAmount: nextPaymentAmount,
          status: 'payment_required_for_vacate',
          reason: `Vacating after paid period ends (${rental.paidUntilDate})`
        }
      });
    }
  } catch (error) {
    console.error('Request vacate error:', error);
    res.status(500).json({ message: 'Failed to submit vacate request', error: error.message });
  }
};