const Review = require('../models/Review');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Purchase = require('../models/Purchase');
const PropertyRental = require('../models/PropertyRental');
const { Op } = require('sequelize');

exports.addReview = async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user has already reviewed this listing
    const existingReview = await Review.findOne({
      where: { listingId, userId }
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this listing' 
      });
    }

    // Get the listing to check its category
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    let hasValidTransaction = false;
    let transactionType = '';

    // Check based on listing category
    if (listing.category === 'property_rent') {
      // For rental properties, check if user has an active or completed rental
      const rental = await PropertyRental.findOne({
        where: {
          userId,
          listingId,
          status: { [Op.in]: ['active', 'completed'] },
          paymentStatus: 'paid'
        }
      });

      if (rental) {
        // Additional check: rental should have started (past start date)
        const today = new Date();
        const startDate = new Date(rental.startDate);
        if (startDate <= today) {
          hasValidTransaction = true;
          transactionType = 'rental';
        }
      }
    } else if (['property_sell', 'furniture', 'materials', 'electronics', 'vehicles'].includes(listing.category)) {
      // For purchase items, check if user has completed a purchase
      const purchase = await Purchase.findOne({
        where: {
          userId,
          listingId,
          status: { [Op.in]: ['delivered', 'completed'] },
          paymentStatus: 'paid'
        }
      });

      if (purchase) {
        hasValidTransaction = true;
        transactionType = 'purchase';
      }
    } else if (listing.category === 'services') {
      // For services, check if user has used the service (completed purchase)
      const serviceUsage = await Purchase.findOne({
        where: {
          userId,
          listingId,
          status: { [Op.in]: ['completed'] },
          paymentStatus: 'paid'
        }
      });

      if (serviceUsage) {
        hasValidTransaction = true;
        transactionType = 'service';
      }
    }

    // If no valid transaction found, deny review
    if (!hasValidTransaction) {
      let errorMessage = '';
      switch (listing.category) {
        case 'property_rent':
          errorMessage = 'You can only review properties after you have rented them and the rental period has started.';
          break;
        case 'property_sell':
          errorMessage = 'You can only review properties after you have purchased them and the transaction is completed.';
          break;
        case 'services':
          errorMessage = 'You can only review services after you have used them and the service is completed.';
          break;
        default:
          errorMessage = 'You can only review items after you have purchased them and received delivery.';
      }
      
      return res.status(403).json({ 
        message: errorMessage,
        transactionRequired: true,
        category: listing.category
      });
    }

    // Create the review
    const review = await Review.create({ 
      listingId, 
      rating, 
      comment, 
      userId,
      transactionType // Add this field to track what type of transaction enabled the review
    });

    // Get the full review with user details
    const fullReview = await Review.findByPk(review.id, {
      include: [{ 
        model: User, 
        as: 'reviewer', 
        attributes: ['id', 'name', 'email'] 
      }]
    });

    res.status(201).json(fullReview);
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { listingId: req.params.listingId },
      include: [{ 
        model: User, 
        as: 'reviewer', 
        attributes: ['id', 'name', 'avatar'] 
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// New endpoint to check if user can review a listing
exports.canUserReview = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    // Check if user has already reviewed
    const existingReview = await Review.findOne({
      where: { listingId, userId }
    });

    if (existingReview) {
      return res.json({ 
        canReview: false, 
        reason: 'already_reviewed',
        message: 'You have already reviewed this listing'
      });
    }

    // Get the listing
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    let hasValidTransaction = false;
    let transactionDetails = null;

    // Check transaction based on category
    if (listing.category === 'property_rent') {
      const rental = await PropertyRental.findOne({
        where: {
          userId,
          listingId,
          status: { [Op.in]: ['active', 'completed'] },
          paymentStatus: 'paid'
        }
      });

      if (rental) {
        const today = new Date();
        const startDate = new Date(rental.startDate);
        if (startDate <= today) {
          hasValidTransaction = true;
          transactionDetails = {
            type: 'rental',
            startDate: rental.startDate,
            status: rental.status
          };
        }
      }
    } else if (['property_sell', 'furniture', 'materials', 'electronics', 'vehicles', 'services'].includes(listing.category)) {
      const purchase = await Purchase.findOne({
        where: {
          userId,
          listingId,
          status: { [Op.in]: ['delivered', 'completed'] },
          paymentStatus: 'paid'
        }
      });

      if (purchase) {
        hasValidTransaction = true;
        transactionDetails = {
          type: 'purchase',
          status: purchase.status,
          completedAt: purchase.updatedAt
        };
      }
    }

    res.json({
      canReview: hasValidTransaction,
      reason: hasValidTransaction ? 'eligible' : 'no_transaction',
      message: hasValidTransaction 
        ? 'You can review this listing' 
        : 'You need to complete a transaction before reviewing',
      transactionDetails,
      category: listing.category
    });

  } catch (err) {
    console.error('Can user review error:', err);
    res.status(500).json({ message: err.message });
  }
};

