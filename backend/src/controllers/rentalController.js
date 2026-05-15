const { Op } = require('sequelize');
const RentalAgreement = require('../models/RentalAgreement');
const RentPayment = require('../models/RentPayment');
const RentNotification = require('../models/RentNotification');
const User = require('../models/User');
const Listing = require('../models/Listing');

// Create rental agreement
exports.createRentalAgreement = async (req, res) => {
  try {
    const {
      tenantId,
      propertyId,
      monthlyRent,
      securityDeposit,
      agreementStartDate,
      agreementEndDate,
      rentDueDate,
      terms
    } = req.body;

    // Get property owner
    const property = await Listing.findByPk(propertyId, {
      include: [{ model: User, as: 'seller' }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Calculate next rent due date
    const startDate = new Date(agreementStartDate);
    const nextRentDueDate = new Date(startDate);
    nextRentDueDate.setDate(rentDueDate);
    if (nextRentDueDate <= startDate) {
      nextRentDueDate.setMonth(nextRentDueDate.getMonth() + 1);
    }

    const agreement = await RentalAgreement.create({
      tenantId,
      propertyId,
      ownerId: property.userId,
      monthlyRent,
      securityDeposit,
      agreementStartDate,
      agreementEndDate,
      rentDueDate,
      terms,
      nextRentDueDate,
      status: 'active'
    });

    // Mark property as rented
    await property.update({ status: 'rented' });

    // Create first rent due notification
    await createRentDueNotification(agreement.id, nextRentDueDate);

    const fullAgreement = await RentalAgreement.findByPk(agreement.id, {
      include: [
        { model: User, as: 'tenant', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Listing, as: 'property', attributes: ['id', 'title', 'location', 'city'] }
      ]
    });

    res.status(201).json({
      message: 'Rental agreement created successfully',
      agreement: fullAgreement
    });
  } catch (error) {
    console.error('Create rental agreement error:', error);
    res.status(500).json({ message: 'Failed to create rental agreement', error: error.message });
  }
};

// Get all rental agreements (Admin) - Using existing PropertyRental data
exports.getAllRentalAgreements = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const PropertyRental = require('../models/PropertyRental');
    
    const where = {};
    if (status && status !== 'all') {
      if (status === 'overdue') {
        where.monthlyPaymentStatus = 'overdue';
      } else {
        where.status = status;
      }
    }

    const rentals = await PropertyRental.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'tenant', 
          attributes: ['id', 'name', 'email', 'phone'],
          where: search ? {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } }
            ]
          } : {}
        },
        { 
          model: Listing, 
          as: 'property', 
          attributes: ['id', 'title', 'location', 'city', 'images'],
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    // Transform PropertyRental data to match RentalAgreement format
    const agreements = rentals.rows.map(rental => ({
      id: rental.id,
      monthlyRent: rental.monthlyRent,
      securityDeposit: rental.securityDeposit || rental.advancePayment,
      agreementStartDate: rental.startDate,
      agreementEndDate: rental.endDate,
      nextRentDueDate: rental.nextPaymentDue || rental.paidUntilDate,
      status: rental.status,
      overdueMonths: rental.monthlyPaymentStatus === 'overdue' ? 1 : 0,
      warningsSent: 0, // This would need to be tracked separately
      vacateNoticeSent: rental.vacateRequested,
      lastRentPaidDate: rental.lastPaymentDate,
      tenant: rental.tenant,
      owner: rental.property?.seller || { id: 0, name: 'Unknown', email: '', phone: '' },
      property: {
        id: rental.property.id,
        title: rental.property.title,
        location: rental.property.location,
        city: rental.property.city,
        images: rental.property.images
      }
    }));

    res.json({
      agreements,
      total: rentals.count,
      pages: Math.ceil(rentals.count / limit)
    });
  } catch (error) {
    console.error('Get rental agreements error:', error);
    res.status(500).json({ message: 'Failed to fetch rental agreements', error: error.message });
  }
};

// Record rent payment
exports.recordRentPayment = async (req, res) => {
  try {
    const {
      rentalAgreementId,
      amount,
      forMonth,
      paymentMethod,
      transactionId,
      lateFee = 0,
      notes
    } = req.body;

    const agreement = await RentalAgreement.findByPk(rentalAgreementId);
    if (!agreement) {
      return res.status(404).json({ message: 'Rental agreement not found' });
    }

    // Create payment record
    const payment = await RentPayment.create({
      rentalAgreementId,
      tenantId: agreement.tenantId,
      amount: parseFloat(amount) + parseFloat(lateFee),
      paymentDate: new Date(),
      forMonth,
      paymentMethod,
      transactionId,
      lateFee,
      notes,
      status: 'completed'
    });

    // Update agreement
    const nextMonth = new Date(agreement.nextRentDueDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await agreement.update({
      lastRentPaidDate: new Date(),
      nextRentDueDate: nextMonth,
      overdueMonths: 0,
      warningsSent: 0,
      vacateNoticeSent: false
    });

    // Create next month's rent due notification
    await createRentDueNotification(rentalAgreementId, nextMonth);

    res.status(201).json({
      message: 'Rent payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Record rent payment error:', error);
    res.status(500).json({ message: 'Failed to record rent payment', error: error.message });
  }
};

// Get tenant's rental details - Using existing PropertyRental data
exports.getTenantRentals = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const PropertyRental = require('../models/PropertyRental');

    const rentals = await PropertyRental.findAll({
      where: { userId: tenantId },
      include: [
        { 
          model: Listing, 
          as: 'property', 
          attributes: ['id', 'title', 'location', 'city', 'images'],
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform to match expected format
    const agreements = rentals.map(rental => ({
      id: rental.id,
      monthlyRent: rental.monthlyRent,
      securityDeposit: rental.securityDeposit || rental.advancePayment,
      agreementStartDate: rental.startDate,
      agreementEndDate: rental.endDate,
      nextRentDueDate: rental.nextPaymentDue || rental.paidUntilDate,
      status: rental.status,
      overdueMonths: rental.monthlyPaymentStatus === 'overdue' ? 1 : 0,
      warningsSent: 0,
      vacateNoticeSent: rental.vacateRequested,
      lastRentPaidDate: rental.lastPaymentDate,
      owner: rental.property?.seller || { id: 0, name: 'Unknown', email: '', phone: '' },
      property: {
        id: rental.property.id,
        title: rental.property.title,
        location: rental.property.location,
        city: rental.property.city,
        images: rental.property.images
      },
      payments: [], // Would need separate query for payment history
      notifications: [] // Would need separate query for notifications
    }));

    res.json(agreements);
  } catch (error) {
    console.error('Get tenant rentals error:', error);
    res.status(500).json({ message: 'Failed to fetch rental details', error: error.message });
  }
};

// Send rent reminder notifications (Cron job function)
// Send rent reminder notifications (Cron job function)
exports.sendRentReminders = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const emailService = require('../services/emailService');
    const PropertyRental = require('../models/PropertyRental');

    // Find rentals with payment due tomorrow (1 day reminder)
    const upcomingDue = await PropertyRental.findAll({
      where: {
        status: 'active',
        nextPaymentDue: {
          [Op.between]: [tomorrow.toDateString(), tomorrow.toDateString()]
        }
      },
      include: [
        { 
          model: User, 
          as: 'tenant', 
          attributes: ['id', 'name', 'email', 'phone'] 
        },
        { 
          model: Listing, 
          as: 'property', 
          attributes: ['id', 'title', 'location', 'city'] 
        }
      ]
    });

    console.log(`📧 Found ${upcomingDue.length} rentals with payment due tomorrow`);

    for (const rental of upcomingDue) {
      try {
        console.log(`📧 Sending reminder email to ${rental.tenant.email}`);
        
        const emailResult = await emailService.sendRentDueReminder(
          rental.tenant, 
          rental.property, 
          rental
        );

        if (emailResult.success) {
          console.log(`✅ Reminder email sent to ${rental.tenant.email}`);
          
          // Create notification record
          await createRentReminderNotification(rental);
        } else {
          console.log(`❌ Failed to send reminder email to ${rental.tenant.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error(`❌ Error sending reminder to rental ${rental.id}:`, emailError);
      }
    }

    console.log(`✅ Sent ${upcomingDue.length} rent reminder notifications with emails`);
  } catch (error) {
    console.error('Send rent reminders error:', error);
  }
};

// Check overdue payments and send warnings (Cron job function)
exports.checkOverduePayments = async () => {
  try {
    const today = new Date();
    const emailService = require('../services/emailService');

    // Find overdue agreements using PropertyRental data
    const PropertyRental = require('../models/PropertyRental');
    const overdueRentals = await PropertyRental.findAll({
      where: {
        status: 'active',
        monthlyPaymentStatus: 'overdue'
      },
      include: [
        { 
          model: User, 
          as: 'tenant', 
          attributes: ['id', 'name', 'email', 'phone'] 
        },
        { 
          model: Listing, 
          as: 'property', 
          attributes: ['id', 'title', 'location', 'city'] 
        }
      ]
    });

    console.log(`📧 Found ${overdueRentals.length} overdue rentals to process`);

    for (const rental of overdueRentals) {
      try {
        // Calculate days overdue
        const dueDate = new Date(rental.nextPaymentDue);
        const daysPastDue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

        console.log(`Processing rental for ${rental.tenant.name}: ${daysPastDue} days overdue`);

        // Send email notification after 2-3 days overdue
        if (daysPastDue >= 2) {
          console.log(`📧 Sending overdue email to ${rental.tenant.email}`);
          
          const emailResult = await emailService.sendOverdueWarning(
            rental.tenant, 
            rental.property, 
            rental
          );

          if (emailResult.success) {
            console.log(`✅ Overdue email sent to ${rental.tenant.email}`);
            
            // Create notification record
            await createOverdueWarningNotification(rental, daysPastDue);
          } else {
            console.log(`❌ Failed to send email to ${rental.tenant.email}:`, emailResult.error);
          }
        }

        // Send reminder email 1 day before due date
        if (daysPastDue === -1) {
          console.log(`📧 Sending reminder email to ${rental.tenant.email}`);
          
          const emailResult = await emailService.sendRentDueReminder(
            rental.tenant, 
            rental.property, 
            rental
          );

          if (emailResult.success) {
            console.log(`✅ Reminder email sent to ${rental.tenant.email}`);
          }
        }

      } catch (emailError) {
        console.error(`❌ Error processing rental ${rental.id}:`, emailError);
      }
    }

    console.log(`✅ Processed ${overdueRentals.length} overdue payment checks with email notifications`);
  } catch (error) {
    console.error('Check overdue payments error:', error);
  }
};

// Helper functions for creating notifications
async function createRentDueNotification(agreementId, dueDate) {
  const agreement = await RentalAgreement.findByPk(agreementId, {
    include: [
      { model: User, as: 'tenant' },
      { model: Listing, as: 'property' }
    ]
  });

  const forMonth = dueDate.toISOString().slice(0, 7); // YYYY-MM format

  await RentNotification.create({
    rentalAgreementId: agreementId,
    tenantId: agreement.tenantId,
    type: 'rent_due',
    title: 'Rent Due Reminder',
    message: `Your rent of ₹${agreement.monthlyRent} for ${agreement.property.title} is due on ${dueDate.toLocaleDateString()}. Please make the payment on time to avoid late fees.`,
    forMonth,
    dueAmount: agreement.monthlyRent,
    scheduledFor: dueDate,
    sentVia: ['in_app', 'email']
  });
}

async function createRentReminderNotification(agreement) {
  const forMonth = agreement.nextRentDueDate.toISOString().slice(0, 7);

  await RentNotification.create({
    rentalAgreementId: agreement.id,
    tenantId: agreement.tenantId,
    type: 'payment_reminder',
    title: 'Rent Payment Reminder',
    message: `Reminder: Your rent of ₹${agreement.monthlyRent} for ${agreement.property.title} is due in 3 days (${agreement.nextRentDueDate.toLocaleDateString()}). Please prepare for the payment.`,
    forMonth,
    dueAmount: agreement.monthlyRent,
    sentAt: new Date(),
    sentVia: ['in_app', 'email']
  });
}

async function createOverdueWarningNotification(agreement, daysPastDue) {
  const forMonth = agreement.nextRentDueDate.toISOString().slice(0, 7);

  await RentNotification.create({
    rentalAgreementId: agreement.id,
    tenantId: agreement.tenantId,
    type: 'late_payment_warning',
    title: 'Late Payment Warning',
    message: `URGENT: Your rent payment of ₹${agreement.monthlyRent} for ${agreement.property.title} is ${daysPastDue} days overdue. Please pay immediately to avoid further action. Late fees may apply.`,
    forMonth,
    dueAmount: agreement.monthlyRent,
    overdueMonths: agreement.overdueMonths,
    sentAt: new Date(),
    sentVia: ['in_app', 'email', 'sms']
  });
}

async function createVacateNotification(agreement) {
  const forMonth = agreement.nextRentDueDate.toISOString().slice(0, 7);

  await RentNotification.create({
    rentalAgreementId: agreement.id,
    tenantId: agreement.tenantId,
    type: 'vacate_notice',
    title: 'VACATE NOTICE - Immediate Action Required',
    message: `FINAL NOTICE: Your rent payment for ${agreement.property.title} is ${agreement.overdueMonths} month(s) overdue. You are required to vacate the property within 15 days if payment is not made immediately. Please contact the property owner or pay the outstanding amount of ₹${agreement.monthlyRent * (agreement.overdueMonths + 1)} to avoid eviction proceedings.`,
    forMonth,
    dueAmount: agreement.monthlyRent * (agreement.overdueMonths + 1),
    overdueMonths: agreement.overdueMonths,
    sentAt: new Date(),
    sentVia: ['in_app', 'email', 'sms', 'whatsapp']
  });
}

// Get rental payment history
exports.getRentalPaymentHistory = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const payments = await RentPayment.findAndCountAll({
      where: { rentalAgreementId: agreementId },
      include: [
        { model: User, as: 'tenant', attributes: ['id', 'name', 'email'] }
      ],
      order: [['paymentDate', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      payments: payments.rows,
      total: payments.count,
      pages: Math.ceil(payments.count / limit)
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
  }
};

// Get rental notifications
exports.getRentalNotifications = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await RentNotification.findAndCountAll({
      where: { tenantId },
      include: [
        { 
          model: RentalAgreement, 
          as: 'agreement',
          include: [
            { model: Listing, as: 'property', attributes: ['id', 'title', 'location'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      pages: Math.ceil(notifications.count / limit)
    });
  } catch (error) {
    console.error('Get rental notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Check for subscription expirations and send warning emails (limited to 2-3 alerts)
exports.checkSubscriptionExpirations = async () => {
  const Subscription = require('../models/Subscription');
  const User = require('../models/User');
  const emailService = require('../services/emailService');
  const { Op } = require('sequelize');

  try {
    // Get subscriptions expiring in the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const expiringSubscriptions = await Subscription.findAll({
      where: {
        status: 'active',
        endDate: {
          [Op.lte]: threeDaysFromNow,
          [Op.gte]: new Date()
        },
        // Limit to max 3 warnings sent
        expirationWarningsSent: {
          [Op.lt]: 3
        }
      },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }]
    });

    console.log(`📧 Found ${expiringSubscriptions.length} subscriptions eligible for expiration warnings`);

    let warningsSent = 0;

    for (const subscription of expiringSubscriptions) {
      // Check if user has made a recent payment (renewed subscription)
      const hasRecentPayment = await Subscription.findOne({
        where: {
          userId: subscription.userId,
          status: 'active',
          endDate: {
            [Op.gt]: subscription.endDate
          },
          createdAt: {
            [Op.gt]: subscription.createdAt
          }
        }
      });

      // Skip if user has already renewed
      if (hasRecentPayment) {
        console.log(`⏭️ Skipping warning for user ${subscription.User.name} - already renewed`);
        continue;
      }

      // Send warning email
      await emailService.sendSubscriptionExpirationWarning(
        subscription.User,
        subscription
      );

      // Update warning count and timestamp
      await subscription.update({
        expirationWarningsSent: subscription.expirationWarningsSent + 1,
        lastWarningSentAt: new Date()
      });

      warningsSent++;
      console.log(`📧 Sent warning #${subscription.expirationWarningsSent + 1} to ${subscription.User.email}`);
    }

    return { success: true, count: warningsSent };
  } catch (error) {
    console.error('❌ Error checking subscription expirations:', error);
    return { success: false, error: error.message };
  }
};

module.exports = exports;