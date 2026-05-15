const { Op } = require('sequelize');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Purchase = require('../models/Purchase');
const PropertyRental = require('../models/PropertyRental');
const MonthlyPayment = require('../models/MonthlyPayment');
const RentalAgreement = require('../models/RentalAgreement');
const RentPayment = require('../models/RentPayment');
const BuyRequest = require('../models/BuyRequest');

/**
 * OWNER DASHBOARD CONTROLLER
 * Provides comprehensive dashboard for property owners to track:
 * - Their listed properties
 * - Purchase transactions and payments
 * - Rental agreements and rent payments
 * - Overall financial analytics
 */

// Get owner dashboard overview
exports.getOwnerDashboard = async (req, res) => {
  try {
    const ownerEmail = req.user.email;

    // Get owner's properties based on contactEmail in listings
    const ownerListings = await Listing.findAll({
      where: { 
        [Op.or]: [
          { userId: req.user.id },
          { contactEmail: ownerEmail }
        ]
      },
      attributes: ['id', 'title', 'status', 'price', 'category']
    });

    // Calculate basic stats
    const totalProperties = ownerListings.length;
    const activeProperties = ownerListings.filter(l => l.status === 'active').length;
    const soldProperties = ownerListings.filter(l => l.status === 'sold').length;
    const rentedProperties = ownerListings.filter(l => l.status === 'rented').length;

    // Get listing IDs for further queries
    const listingIds = ownerListings.map(l => l.id);

    // Get purchase statistics (simplified to avoid schema issues)
    let totalPurchases = 0;
    let completedPurchases = 0;
    let purchaseEarnings = 0;

    if (listingIds.length > 0) {
      totalPurchases = await Purchase.count({
        where: { listingId: { [Op.in]: listingIds } }
      });

      completedPurchases = await Purchase.count({
        where: { 
          listingId: { [Op.in]: listingIds },
          status: 'completed'
        }
      });

      // Get completed purchases for earnings calculation
      const completedPurchasesList = await Purchase.findAll({
        where: { 
          listingId: { [Op.in]: listingIds },
          status: 'completed'
        },
        attributes: ['totalAmount']
      });

      purchaseEarnings = completedPurchasesList.reduce((sum, p) => sum + parseFloat(p.totalAmount || 0), 0);
    }

    // Get rental statistics (simplified)
    let totalRentals = 0;
    let activeRentals = 0;
    let rentEarnings = 0;

    if (listingIds.length > 0) {
      totalRentals = await PropertyRental.count({
        where: { listingId: { [Op.in]: listingIds } }
      });

      activeRentals = await PropertyRental.count({
        where: { 
          listingId: { [Op.in]: listingIds },
          status: 'active'
        }
      });

      // Get rental IDs for payment calculation
      const rentals = await PropertyRental.findAll({
        where: { listingId: { [Op.in]: listingIds } },
        attributes: ['id']
      });

      const rentalIds = rentals.map(r => r.id);

      if (rentalIds.length > 0) {
        const paidPayments = await MonthlyPayment.findAll({
          where: { 
            rentalId: { [Op.in]: rentalIds },
            status: 'paid'
          },
          attributes: ['amount']
        });

        rentEarnings = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      }
    }

    // Get recent purchases (with limited attributes to avoid schema issues)
    let recentPurchases = [];
    if (listingIds.length > 0) {
      recentPurchases = await Purchase.findAll({
        where: { listingId: { [Op.in]: listingIds } },
        attributes: ['id', 'totalAmount', 'status', 'createdAt'], // Only safe attributes
        include: [{
          model: Listing,
          as: 'item',
          attributes: ['id', 'title', 'category', 'price']
        }, {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email', 'phone']
        }],
        order: [['createdAt', 'DESC']],
        limit: 5
      });
    }

    // Get recent rent payments (simplified)
    let recentRentPayments = [];
    if (listingIds.length > 0) {
      const rentals = await PropertyRental.findAll({
        where: { listingId: { [Op.in]: listingIds } },
        attributes: ['id']
      });

      const rentalIds = rentals.map(r => r.id);

      if (rentalIds.length > 0) {
        recentRentPayments = await MonthlyPayment.findAll({
          where: { 
            rentalId: { [Op.in]: rentalIds },
            status: 'paid'
          },
          include: [{
            model: PropertyRental,
            as: 'rental',
            include: [{
              model: Listing,
              as: 'property',
              attributes: ['id', 'title', 'location']
            }, {
              model: User,
              as: 'tenant',
              attributes: ['id', 'name', 'email', 'phone']
            }]
          }],
          order: [['paidDate', 'DESC']],
          limit: 5
        });
      }
    }

    res.json({
      overview: {
        totalProperties,
        activeProperties,
        soldProperties,
        rentedProperties,
        totalPurchases,
        completedPurchases,
        totalRentals,
        activeRentals,
        totalEarnings: purchaseEarnings + rentEarnings,
        purchaseEarnings,
        rentEarnings
      },
      recentActivity: {
        purchases: recentPurchases,
        rentPayments: recentRentPayments
      }
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
};

// Get owner's properties with detailed information - Enhanced with two sections
exports.getOwnerProperties = async (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const { section, status, page = 1, limit = 20 } = req.query;

    const where = { 
      [Op.or]: [
        { userId: req.user.id },
        { contactEmail: ownerEmail }
      ]
    };

    // Filter by section (rent or buy)
    if (section === 'rent') {
      where.category = 'property_rent';
    } else if (section === 'buy') {
      where.category = 'property_sell';
    }

    if (status) where.status = status;

    const { count, rows } = await Listing.findAndCountAll({
      where,
      attributes: [
        'id', 'title', 'description', 'category', 'subCategory', 'price', 'priceType',
        'location', 'city', 'state', 'pincode', 'images', 'bedrooms', 'bathrooms',
        'area', 'areaUnit', 'propertyAge', 'facing', 'floor', 'totalFloors',
        'parking', 'furnishing', 'amenities', 'status', 'views', 'isVerified',
        'isFeatured', 'createdAt', 'updatedAt', 'commissionPercentage',
        'contactPerson', 'contactPhone', 'contactEmail'
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    const propertyIds = rows.map(p => p.id);
    let propertiesWithDetails = [];

    // Process each property and add relevant details
    for (const property of rows) {
      const propertyData = {
        ...property.toJSON(),
        type: property.category === 'property_rent' ? 'rent' : 
              property.category === 'property_sell' ? 'buy' : 'other',
        ownershipType: property.contactEmail === ownerEmail ? 'email_match' : 'user_match',
        stats: {
          totalPurchases: 0,
          totalRentals: 0,
          totalEarnings: 0
        }
      };

      if (property.category === 'property_rent' && (section === 'rent' || !section)) {
        // Get rental details for rent properties
        try {
          const rentals = await PropertyRental.findAll({
            where: { listingId: property.id },
            include: [{
              model: User,
              as: 'tenant',
              attributes: ['id', 'name', 'email', 'phone']
            }],
            order: [['createdAt', 'DESC']]
          });

          const rentalDetails = [];
          for (const rental of rentals) {
            // Get monthly payments for this rental
            const payments = await MonthlyPayment.findAll({
              where: { rentalId: rental.id },
              order: [['monthNumber', 'ASC']]
            });

            const paidPayments = payments.filter(p => p.status === 'paid');
            const pendingPayments = payments.filter(p => p.status === 'pending');
            const overduePayments = payments.filter(p => p.status === 'overdue');
            const totalReceived = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

            rentalDetails.push({
              id: rental.id,
              tenant: rental.tenant,
              startDate: rental.startDate,
              endDate: rental.endDate,
              monthlyRent: rental.monthlyRent,
              securityDeposit: rental.securityDeposit,
              status: rental.status,
              nextPaymentDue: rental.nextPaymentDue,
              paidUntilDate: rental.paidUntilDate,
              paymentSummary: {
                totalPayments: payments.length,
                paidPayments: paidPayments.length,
                pendingPayments: pendingPayments.length,
                overduePayments: overduePayments.length,
                totalReceived,
                nextDueAmount: pendingPayments[0]?.amount || 0,
                nextDueDate: pendingPayments[0]?.dueDate || null
              },
              recentPayments: payments.slice(-3)
            });
          }

          propertyData.rentalDetails = rentalDetails;
          propertyData.totalRentals = rentals.length;
          propertyData.activeRentals = rentals.filter(r => r.status === 'active').length;
          propertyData.totalRentEarnings = rentalDetails.reduce((sum, r) => sum + r.paymentSummary.totalReceived, 0);
          
          // Update stats
          propertyData.stats.totalRentals = rentals.length;
          propertyData.stats.totalEarnings += propertyData.totalRentEarnings;
        } catch (error) {
          console.error('Error fetching rental details:', error);
          propertyData.rentalDetails = [];
          propertyData.totalRentals = 0;
          propertyData.activeRentals = 0;
          propertyData.totalRentEarnings = 0;
        }
      }

      if (property.category === 'property_sell' && (section === 'buy' || !section)) {
        // Get purchase details for sell properties
        try {
          const purchases = await Purchase.findAll({
            where: { listingId: property.id },
            include: [{
              model: User,
              as: 'buyer',
              attributes: ['id', 'name', 'email', 'phone']
            }],
            attributes: ['id', 'totalAmount', 'status', 'paymentStatus', 'createdAt', 'registrationDate', 'possessionDate', 'documentStatus', 'razorpayPaymentId', 'notes'],
            order: [['createdAt', 'DESC']]
          });

          const purchaseDetails = purchases.map(purchase => ({
            id: purchase.id,
            buyer: purchase.buyer,
            totalAmount: parseFloat(purchase.totalAmount),
            status: purchase.status,
            paymentStatus: purchase.paymentStatus,
            createdAt: purchase.createdAt,
            registrationDate: purchase.registrationDate,
            possessionDate: purchase.possessionDate,
            documentStatus: purchase.documentStatus,
            razorpayPaymentId: purchase.razorpayPaymentId,
            notes: purchase.notes
          }));

          const completedPurchases = purchases.filter(p => p.status === 'completed');
          const totalEarnings = completedPurchases.reduce((sum, p) => sum + parseFloat(p.totalAmount || 0), 0);

          propertyData.purchaseDetails = purchaseDetails;
          propertyData.totalPurchases = purchases.length;
          propertyData.completedPurchases = completedPurchases.length;
          propertyData.totalSaleEarnings = totalEarnings;
          propertyData.latestPurchase = purchases[0] || null;
          
          // Update stats
          propertyData.stats.totalPurchases = purchases.length;
          propertyData.stats.totalEarnings += totalEarnings;
        } catch (error) {
          console.error('Error fetching purchase details:', error);
          propertyData.purchaseDetails = [];
          propertyData.totalPurchases = 0;
          propertyData.completedPurchases = 0;
          propertyData.totalSaleEarnings = 0;
          propertyData.latestPurchase = null;
        }
      }

      propertiesWithDetails.push(propertyData);
    }

    res.json({
      properties: propertiesWithDetails,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      section: section || 'all',
      summary: {
        rentProperties: propertiesWithDetails.filter(p => p.type === 'rent').length,
        buyProperties: propertiesWithDetails.filter(p => p.type === 'buy').length,
        totalRentEarnings: propertiesWithDetails
          .filter(p => p.type === 'rent')
          .reduce((sum, p) => sum + (p.totalRentEarnings || 0), 0),
        totalSaleEarnings: propertiesWithDetails
          .filter(p => p.type === 'buy')
          .reduce((sum, p) => sum + (p.totalSaleEarnings || 0), 0)
      }
    });
  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({ message: 'Failed to fetch properties', error: error.message });
  }
};

// Get detailed rent tracking for owner
exports.getOwnerRentTracking = async (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const { propertyId, status, page = 1, limit = 20 } = req.query;

    // Get owner's rental properties
    const whereProperty = { 
      [Op.or]: [
        { userId: req.user.id },
        { contactEmail: ownerEmail }
      ],
      category: 'property_rent'
    };
    
    if (propertyId) whereProperty.id = propertyId;

    const rentalProperties = await Listing.findAll({
      where: whereProperty,
      attributes: ['id', 'title', 'location', 'price']
    });

    const propertyIds = rentalProperties.map(p => p.id);

    if (propertyIds.length === 0) {
      return res.json({
        rentTracking: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        summary: {
          totalProperties: 0,
          activeRentals: 0,
          totalMonthlyRent: 0,
          pendingPayments: 0,
          overduePayments: 0
        }
      });
    }

    // Get all rentals for these properties
    const whereRental = { listingId: { [Op.in]: propertyIds } };
    if (status) whereRental.status = status;

    const { count, rows: rentals } = await PropertyRental.findAndCountAll({
      where: whereRental,
      include: [{
        model: Listing,
        as: 'property',
        attributes: ['id', 'title', 'location', 'price', 'images']
      }, {
        model: User,
        as: 'tenant',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    // Get detailed payment information for each rental
    const rentTrackingDetails = [];
    
    for (const rental of rentals) {
      const payments = await MonthlyPayment.findAll({
        where: { rentalId: rental.id },
        order: [['monthNumber', 'ASC']]
      });

      const paidPayments = payments.filter(p => p.status === 'paid');
      const pendingPayments = payments.filter(p => p.status === 'pending');
      const overduePayments = payments.filter(p => p.status === 'overdue');
      
      const totalReceived = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const pendingAmount = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const overdueAmount = overduePayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // Calculate next payment due
      const nextPayment = pendingPayments[0] || overduePayments[0];
      
      rentTrackingDetails.push({
        id: rental.id,
        property: rental.property,
        tenant: rental.tenant,
        rentalInfo: {
          startDate: rental.startDate,
          endDate: rental.endDate,
          monthlyRent: parseFloat(rental.monthlyRent),
          securityDeposit: parseFloat(rental.securityDeposit || 0),
          status: rental.status,
          agreementDate: rental.createdAt
        },
        paymentSummary: {
          totalPayments: payments.length,
          paidPayments: paidPayments.length,
          pendingPayments: pendingPayments.length,
          overduePayments: overduePayments.length,
          totalReceived,
          pendingAmount,
          overdueAmount,
          nextPaymentDue: nextPayment ? {
            amount: parseFloat(nextPayment.amount),
            dueDate: nextPayment.dueDate,
            monthYear: nextPayment.monthYear,
            status: nextPayment.status,
            daysPastDue: nextPayment.status === 'overdue' ? 
              Math.floor((new Date() - new Date(nextPayment.dueDate)) / (1000 * 60 * 60 * 24)) : 0
          } : null
        },
        paymentHistory: payments.map(payment => ({
          id: payment.id,
          monthYear: payment.monthYear,
          amount: parseFloat(payment.amount),
          dueDate: payment.dueDate,
          paidDate: payment.paidDate,
          status: payment.status,
          razorpayPaymentId: payment.razorpayPaymentId,
          notes: payment.notes
        })),
        lastPayment: paidPayments[paidPayments.length - 1] ? {
          date: paidPayments[paidPayments.length - 1].paidDate,
          amount: parseFloat(paidPayments[paidPayments.length - 1].amount),
          monthYear: paidPayments[paidPayments.length - 1].monthYear
        } : null
      });
    }

    // Calculate summary statistics
    const summary = {
      totalProperties: rentalProperties.length,
      activeRentals: rentTrackingDetails.filter(r => r.rentalInfo.status === 'active').length,
      totalMonthlyRent: rentTrackingDetails
        .filter(r => r.rentalInfo.status === 'active')
        .reduce((sum, r) => sum + r.rentalInfo.monthlyRent, 0),
      pendingPayments: rentTrackingDetails.reduce((sum, r) => sum + r.paymentSummary.pendingPayments, 0),
      overduePayments: rentTrackingDetails.reduce((sum, r) => sum + r.paymentSummary.overduePayments, 0),
      totalPendingAmount: rentTrackingDetails.reduce((sum, r) => sum + r.paymentSummary.pendingAmount, 0),
      totalOverdueAmount: rentTrackingDetails.reduce((sum, r) => sum + r.paymentSummary.overdueAmount, 0),
      totalReceived: rentTrackingDetails.reduce((sum, r) => sum + r.paymentSummary.totalReceived, 0)
    };

    res.json({
      rentTracking: rentTrackingDetails,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      summary
    });
  } catch (error) {
    console.error('Get owner rent tracking error:', error);
    res.status(500).json({ message: 'Failed to fetch rent tracking data', error: error.message });
  }
};

// Get detailed purchase tracking for owner
exports.getOwnerPurchaseTracking = async (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const { propertyId, status, page = 1, limit = 20 } = req.query;

    // Get owner's sale properties
    const whereProperty = { 
      [Op.or]: [
        { userId: req.user.id },
        { contactEmail: ownerEmail }
      ],
      category: 'property_sell'
    };
    
    if (propertyId) whereProperty.id = propertyId;

    const saleProperties = await Listing.findAll({
      where: whereProperty,
      attributes: ['id', 'title', 'location', 'price']
    });

    const propertyIds = saleProperties.map(p => p.id);

    if (propertyIds.length === 0) {
      return res.json({
        purchaseTracking: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        summary: {
          totalProperties: 0,
          totalPurchases: 0,
          completedSales: 0,
          totalEarnings: 0,
          pendingSales: 0
        }
      });
    }

    // Get all purchases for these properties
    const wherePurchase = { listingId: { [Op.in]: propertyIds } };
    if (status) wherePurchase.status = status;

    const { count, rows: purchases } = await Purchase.findAndCountAll({
      where: wherePurchase,
      include: [{
        model: Listing,
        as: 'item',
        attributes: ['id', 'title', 'location', 'price', 'images']
      }, {
        model: User,
        as: 'buyer',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    const purchaseTrackingDetails = purchases.map(purchase => ({
      id: purchase.id,
      property: purchase.item,
      buyer: purchase.buyer,
      purchaseInfo: {
        totalAmount: parseFloat(purchase.totalAmount),
        status: purchase.status,
        paymentStatus: purchase.paymentStatus,
        purchaseDate: purchase.createdAt,
        registrationDate: purchase.registrationDate,
        possessionDate: purchase.possessionDate
      },
      documentInfo: {
        status: purchase.documentStatus,
        submittedAt: purchase.documentSubmittedAt,
        verifiedAt: purchase.documentVerifiedAt,
        notes: purchase.documentNotes
      },
      paymentInfo: {
        razorpayOrderId: purchase.razorpayOrderId,
        razorpayPaymentId: purchase.razorpayPaymentId,
        paidAmount: purchase.paymentStatus === 'paid' ? parseFloat(purchase.totalAmount) : 0
      },
      deliveryInfo: {
        address: purchase.deliveryAddress,
        city: purchase.deliveryCity,
        state: purchase.deliveryState,
        pincode: purchase.deliveryPincode,
        phone: purchase.deliveryPhone
      },
      notes: purchase.notes,
      adminNotes: purchase.adminNotes
    }));

    // Calculate summary statistics
    const summary = {
      totalProperties: saleProperties.length,
      totalPurchases: purchases.length,
      completedSales: purchases.filter(p => p.status === 'completed').length,
      pendingSales: purchases.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length,
      cancelledSales: purchases.filter(p => p.status === 'cancelled').length,
      totalEarnings: purchases
        .filter(p => p.status === 'completed' && p.paymentStatus === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.totalAmount), 0),
      pendingAmount: purchases
        .filter(p => p.status !== 'completed' && p.status !== 'cancelled')
        .reduce((sum, p) => sum + parseFloat(p.totalAmount), 0)
    };

    res.json({
      purchaseTracking: purchaseTrackingDetails,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      summary
    });
  } catch (error) {
    console.error('Get owner purchase tracking error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase tracking data', error: error.message });
  }
};
exports.getOwnerPurchases = async (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const { status, propertyId, page = 1, limit = 20 } = req.query;

    const includeWhere = { 
      [Op.or]: [
        { userId: req.user.id },
        { contactEmail: ownerEmail }
      ]
    };
    if (propertyId) includeWhere.id = propertyId;

    const purchaseWhere = {};
    if (status) purchaseWhere.status = status;

    const { count, rows } = await Purchase.findAndCountAll({
      where: purchaseWhere,
      include: [{
        model: Listing,
        as: 'item',
        where: includeWhere,
        attributes: ['id', 'title', 'category', 'price', 'location', 'city', 'images', 'contactEmail']
      }, {
        model: User,
        as: 'buyer',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      purchases: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get owner purchases error:', error);
    res.status(500).json({ message: 'Failed to fetch purchases', error: error.message });
  }
};

// Get owner's property purchases and rentals combined
exports.getOwnerPropertyPurchases = async (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const { type, status, page = 1, limit = 20 } = req.query;

    // Get owner's properties
    const ownerListings = await Listing.findAll({
      where: { 
        [Op.or]: [
          { userId: req.user.id },
          { contactEmail: ownerEmail }
        ]
      },
      attributes: ['id', 'title', 'location', 'city', 'images', 'category']
    });

    const listingIds = ownerListings.map(l => l.id);
    const allTransactions = [];

    if (listingIds.length > 0) {
      // Get Buy Requests (Property Purchases)
      if (!type || type === 'buy') {
        const buyRequests = await BuyRequest.findAll({
          where: { 
            listingId: { [Op.in]: listingIds },
            status: ['completed', 'approved']
          },
          include: [
            {
              model: User,
              as: 'buyer',
              attributes: ['id', 'name', 'email', 'phone']
            },
            {
              model: Listing,
              as: 'property',
              attributes: ['id', 'title', 'location', 'city', 'images']
            }
          ],
          order: [['createdAt', 'DESC']]
        });

        buyRequests.forEach(buyRequest => {
          allTransactions.push({
            id: `buy_${buyRequest.id}`,
            type: 'buy',
            status: buyRequest.status,
            createdAt: buyRequest.createdAt,
            updatedAt: buyRequest.updatedAt,
            completedAt: buyRequest.completedAt,
            buyer: buyRequest.buyer,
            property: buyRequest.property,
            amount: parseFloat(buyRequest.property?.price || 0),
            paymentStatus: 'completed',
            paymentMethod: 'offline',
            adminNotes: buyRequest.adminNotes,
            buyerMessage: buyRequest.buyerMessage
          });
        });
      }

      // Get Property Rentals
      if (!type || type === 'rent') {
        const rentals = await PropertyRental.findAll({
          where: { 
            listingId: { [Op.in]: listingIds },
            status: ['active', 'completed']
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
              attributes: ['id', 'title', 'location', 'city', 'images']
            }
          ],
          order: [['createdAt', 'DESC']]
        });

        rentals.forEach(rental => {
          // Calculate payment status
          let paymentStatus = 'current';
          let overdueAmount = 0;
          
          if (rental.nextPaymentDue) {
            const today = new Date();
            const dueDate = new Date(rental.nextPaymentDue);
            if (dueDate < today) {
              paymentStatus = 'overdue';
              const monthsOverdue = Math.floor((today - dueDate) / (30 * 24 * 60 * 60 * 1000));
              overdueAmount = monthsOverdue * parseFloat(rental.monthlyRent || 0);
            }
          }

          allTransactions.push({
            id: `rent_${rental.id}`,
            type: 'rent',
            status: rental.status,
            createdAt: rental.createdAt,
            updatedAt: rental.updatedAt,
            buyer: rental.tenant,
            property: rental.property,
            amount: parseFloat(rental.monthlyRent || 0),
            totalAmount: parseFloat(rental.totalAmount || 0),
            paymentStatus: paymentStatus,
            paymentMethod: rental.razorpayPaymentId ? 'online' : 'offline',
            startDate: rental.startDate,
            endDate: rental.endDate,
            nextPaymentDue: rental.nextPaymentDue,
            overdueAmount: overdueAmount,
            adminNotes: rental.adminNotes
          });
        });
      }
    }

    // Apply status filter
    let filtered = allTransactions;
    if (status && status !== 'all') {
      if (status === 'overdue') {
        filtered = filtered.filter(t => t.paymentStatus === 'overdue');
      } else {
        filtered = filtered.filter(t => t.status === status);
      }
    }

    // Sort by creation date
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = filtered.slice(startIndex, endIndex);

    res.json({
      purchases: paginatedResults,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      summary: {
        totalBought: filtered.filter(t => t.type === 'buy').length,
        totalRented: filtered.filter(t => t.type === 'rent').length,
        activeRentals: filtered.filter(t => t.type === 'rent' && t.status === 'active').length,
        overduePayments: filtered.filter(t => t.paymentStatus === 'overdue').length,
        totalRevenue: filtered.reduce((sum, t) => sum + (t.amount || 0), 0)
      }
    });

  } catch (error) {
    console.error('Get owner property purchases error:', error);
    res.status(500).json({ message: 'Failed to fetch property purchases', error: error.message });
  }
};

// Get rental details for owner's properties
exports.getOwnerRentals = async (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const { status, propertyId, page = 1, limit = 20 } = req.query;

    const includeWhere = { 
      [Op.or]: [
        { userId: req.user.id },
        { contactEmail: ownerEmail }
      ]
    };
    if (propertyId) includeWhere.id = propertyId;

    const rentalWhere = {};
    if (status) rentalWhere.status = status;

    const { count, rows } = await PropertyRental.findAndCountAll({
      where: rentalWhere,
      include: [{
        model: Listing,
        as: 'property',
        where: includeWhere,
        attributes: ['id', 'title', 'location', 'city', 'images', 'bedrooms', 'bathrooms']
      }, {
        model: User,
        as: 'tenant',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    // Get monthly payments for each rental
    const rentalIds = rows.map(r => r.id);
    const monthlyPayments = await MonthlyPayment.findAll({
      where: { rentalId: { [Op.in]: rentalIds } },
      order: [['monthNumber', 'ASC']]
    });

    // Group payments by rental
    const rentalsWithPayments = rows.map(rental => {
      const payments = monthlyPayments.filter(p => p.rentalId === rental.id);
      const paidPayments = payments.filter(p => p.status === 'paid');
      const pendingPayments = payments.filter(p => p.status === 'pending');
      const overduePayments = payments.filter(p => p.status === 'overdue');
      const totalPaid = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      // Get next payment due
      const nextPayment = pendingPayments[0] || overduePayments[0];

      return {
        ...rental.toJSON(),
        paymentSummary: {
          totalPayments: payments.length,
          paidPayments: paidPayments.length,
          pendingPayments: pendingPayments.length,
          overduePayments: overduePayments.length,
          totalAmountReceived: totalPaid,
          nextDueAmount: nextPayment ? parseFloat(nextPayment.amount) : null,
          nextDueDate: nextPayment ? nextPayment.dueDate : null
        },
        paymentHistory: payments.map(p => ({
          id: p.id,
          monthYear: p.monthYear,
          amount: parseFloat(p.amount),
          dueDate: p.dueDate,
          paidDate: p.paidDate,
          status: p.status,
          razorpayPaymentId: p.razorpayPaymentId,
          notes: p.notes
        }))
      };
    });

    res.json({
      rentals: rentalsWithPayments,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get owner rentals error:', error);
    res.status(500).json({ message: 'Failed to fetch rentals', error: error.message });
  }
};

// Get detailed payment history for owner
exports.getOwnerPaymentHistory = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { type, propertyId, startDate, endDate, page = 1, limit = 50 } = req.query;

    let payments = [];

    // Get purchase payments
    if (!type || type === 'purchase') {
      const includeWhere = { userId: ownerId };
      if (propertyId) includeWhere.id = propertyId;

      const purchasePayments = await Purchase.findAll({
        where: {
          status: 'completed',
          paymentStatus: 'paid',
          ...(startDate && endDate ? {
            createdAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          } : {})
        },
        include: [{
          model: Listing,
          as: 'item',
          where: includeWhere,
          attributes: ['id', 'title', 'category', 'location']
        }, {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        }],
        attributes: ['id', 'totalAmount', 'createdAt', 'razorpayPaymentId'],
        order: [['createdAt', 'DESC']]
      });

      payments = payments.concat(purchasePayments.map(p => ({
        id: p.id,
        type: 'purchase',
        amount: parseFloat(p.totalAmount),
        date: p.createdAt,
        property: p.item,
        customer: p.buyer,
        paymentId: p.razorpayPaymentId,
        description: `Property purchase - ${p.item.title}`
      })));
    }

    // Get rental payments
    if (!type || type === 'rental') {
      const rentalPayments = await MonthlyPayment.findAll({
        where: {
          status: 'paid',
          ...(startDate && endDate ? {
            paidDate: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          } : {})
        },
        include: [{
          model: PropertyRental,
          as: 'rental',
          include: [{
            model: Listing,
            as: 'property',
            where: { userId: ownerId },
            attributes: ['id', 'title', 'location']
          }, {
            model: User,
            as: 'tenant',
            attributes: ['id', 'name', 'email']
          }]
        }],
        order: [['paidDate', 'DESC']]
      });

      payments = payments.concat(rentalPayments.map(p => ({
        id: p.id,
        type: 'rental',
        amount: parseFloat(p.amount),
        date: p.paidDate,
        property: p.rental.property,
        customer: p.rental.tenant,
        paymentId: p.razorpayPaymentId,
        description: `Rent payment - ${p.monthYear} - ${p.rental.property.title}`,
        monthYear: p.monthYear
      })));
    }

    // Sort all payments by date
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginate
    const total = payments.length;
    const startIndex = (page - 1) * limit;
    const paginatedPayments = payments.slice(startIndex, startIndex + parseInt(limit));

    // Calculate totals
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const purchaseTotal = payments.filter(p => p.type === 'purchase').reduce((sum, p) => sum + p.amount, 0);
    const rentalTotal = payments.filter(p => p.type === 'rental').reduce((sum, p) => sum + p.amount, 0);

    res.json({
      payments: paginatedPayments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      summary: {
        totalAmount,
        purchaseTotal,
        rentalTotal,
        totalTransactions: payments.length
      }
    });
  } catch (error) {
    console.error('Get owner payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
  }
};

// Get financial analytics for owner
exports.getOwnerAnalytics = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { period = '12months' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '12months':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'ytd':
        startDate.setMonth(0, 1); // January 1st of current year
        break;
    }

    // Monthly earnings breakdown
    const monthlyEarnings = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Purchase earnings for this month
      const purchaseEarnings = await Purchase.sum('totalAmount', {
        where: {
          status: 'completed',
          createdAt: { [Op.between]: [monthStart, monthEnd] }
        },
        include: [{
          model: Listing,
          as: 'item',
          where: { userId: ownerId }
        }]
      }) || 0;

      // Rental earnings for this month
      const rentalEarnings = await MonthlyPayment.sum('amount', {
        where: {
          status: 'paid',
          paidDate: { [Op.between]: [monthStart, monthEnd] }
        },
        include: [{
          model: PropertyRental,
          as: 'rental',
          include: [{
            model: Listing,
            as: 'property',
            where: { userId: ownerId }
          }]
        }]
      }) || 0;

      monthlyEarnings.push({
        month: currentDate.toISOString().slice(0, 7), // YYYY-MM format
        purchaseEarnings: parseFloat(purchaseEarnings),
        rentalEarnings: parseFloat(rentalEarnings),
        totalEarnings: parseFloat(purchaseEarnings) + parseFloat(rentalEarnings)
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Property performance
    const propertyPerformance = await Listing.findAll({
      where: { userId: ownerId },
      attributes: [
        'id', 'title', 'category', 'price', 'status', 'views',
        [require('sequelize').literal('(SELECT COUNT(*) FROM purchases WHERE purchases.listingId = Listing.id)'), 'purchaseCount'],
        [require('sequelize').literal('(SELECT COUNT(*) FROM property_rentals WHERE property_rentals.listingId = Listing.id)'), 'rentalCount'],
        [require('sequelize').literal('(SELECT COALESCE(SUM(totalAmount), 0) FROM purchases WHERE purchases.listingId = Listing.id AND purchases.status = "completed")'), 'totalEarnings']
      ],
      order: [['views', 'DESC']]
    });

    res.json({
      monthlyEarnings,
      propertyPerformance: propertyPerformance.map(p => ({
        ...p.toJSON(),
        totalEarnings: parseFloat(p.dataValues.totalEarnings || 0)
      })),
      period
    });
  } catch (error) {
    console.error('Get owner analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

module.exports = {
  getOwnerDashboard: exports.getOwnerDashboard,
  getOwnerProperties: exports.getOwnerProperties,
  getOwnerPurchases: exports.getOwnerPurchases,
  getOwnerPropertyPurchases: exports.getOwnerPropertyPurchases,
  getOwnerRentals: exports.getOwnerRentals,
  getOwnerPaymentHistory: exports.getOwnerPaymentHistory,
  getOwnerAnalytics: exports.getOwnerAnalytics,
  getOwnerRentTracking: exports.getOwnerRentTracking,
  getOwnerPurchaseTracking: exports.getOwnerPurchaseTracking
};