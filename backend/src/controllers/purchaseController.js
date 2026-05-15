const Purchase = require('../models/Purchase');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create purchase order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { 
      listingId, 
      quantity = 1, 
      deliveryAddress, 
      deliveryCity, 
      deliveryState, 
      deliveryPincode, 
      deliveryPhone,
      notes 
    } = req.body;
    const userId = req.user.id;

    // Get listing details
    const listing = await Listing.findByPk(listingId, {
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }]
    });
    
    if (!listing) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if category is purchasable
    const purchasableCategories = ['property_sell', 'furniture', 'materials', 'electronics', 'vehicles'];
    if (!purchasableCategories.includes(listing.category)) {
      return res.status(400).json({ message: 'This item is not available for purchase' });
    }

    // Check if already sold (for properties and vehicles)
    if (['property_sell', 'vehicles'].includes(listing.category) && listing.status === 'sold') {
      return res.status(400).json({ message: 'This item is already sold' });
    }

    // Calculate total amount
    const unitPrice = parseFloat(listing.price);
    const totalAmount = unitPrice * quantity;

    // Get user details
    const user = await User.findByPk(userId);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: `purchase_${Date.now()}`,
      notes: {
        listingId,
        userId,
        category: listing.category,
        quantity
      }
    });

    // Create purchase record
    const purchase = await Purchase.create({
      userId,
      listingId,
      category: listing.category,
      quantity,
      unitPrice,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryPincode,
      deliveryPhone: deliveryPhone || user.phone,
      buyerName: user.name,
      buyerEmail: user.email,
      buyerPhone: user.phone,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      purchaseId: purchase.id,
      key: process.env.RAZORPAY_KEY_ID,
      itemDetails: {
        title: listing.title,
        category: listing.category,
        unitPrice,
        quantity,
        totalAmount
      },
      sellerDetails: {
        name: listing.seller.name,
        phone: listing.seller.phone
      }
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ message: 'Failed to create purchase order', error: error.message });
  }
};

// Verify purchase payment
exports.verifyPurchasePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchaseId } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update purchase record
    const purchase = await Purchase.findByPk(purchaseId);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    purchase.razorpayPaymentId = razorpay_payment_id;
    purchase.razorpaySignature = razorpay_signature;
    purchase.paymentStatus = 'paid';
    
    // Enhanced workflow for property purchases
    if (purchase.category === 'property_sell') {
      purchase.status = 'admin_review'; // Admin needs to review and approve
    } else {
      purchase.status = 'confirmed'; // Other items are auto-confirmed
    }
    
    // Set estimated delivery (7 days from now for non-property items)
    if (purchase.category !== 'property_sell') {
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 7);
      purchase.estimatedDelivery = estimatedDate.toISOString().split('T')[0];
    }
    
    await purchase.save();

    // Update listing status for single-item categories
    const listing = await Listing.findByPk(purchase.listingId);
    if (listing && ['property_sell', 'vehicles'].includes(purchase.category)) {
      listing.status = 'sold';
      await listing.save();
    }

    res.json({
      message: 'Payment verified successfully',
      purchase: await Purchase.findByPk(purchaseId, {
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
          { 
            model: Listing, 
            as: 'item', 
            attributes: ['id', 'title', 'category', 'price', 'images', 'location', 'city'],
            include: [
              { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
            ]
          }
        ]
      })
    });
  } catch (error) {
    console.error('Verify purchase payment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

// Get user's purchases
exports.getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    const where = { userId };
    if (category) where.category = category;

    const purchases = await Purchase.findAll({
      where,
      include: [
        {
          model: Listing,
          as: 'item',
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(purchases);
  } catch (error) {
    console.error('Get user purchases error:', error);
    res.status(500).json({ message: 'Failed to fetch purchases', error: error.message });
  }
};

// Get all purchases (Admin only)
exports.getAllPurchases = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const purchases = await Purchase.findAll({
      where,
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: Listing,
          as: 'item',
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(purchases);
  } catch (error) {
    console.error('Get all purchases error:', error);
    res.status(500).json({ message: 'Failed to fetch purchases', error: error.message });
  }
};

// Update purchase status (Admin only)
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, adminNotes, estimatedDelivery } = req.body;

    const purchase = await Purchase.findByPk(id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (status) purchase.status = status;
    if (trackingNumber) purchase.trackingNumber = trackingNumber;
    if (adminNotes) purchase.adminNotes = adminNotes;
    if (estimatedDelivery) purchase.estimatedDelivery = estimatedDelivery;
    
    await purchase.save();

    res.json({
      message: 'Purchase updated successfully',
      purchase: await Purchase.findByPk(id, {
        include: [
          { model: User, as: 'buyer' },
          { model: Listing, as: 'item' }
        ]
      })
    });
  } catch (error) {
    console.error('Update purchase error:', error);
    res.status(500).json({ message: 'Failed to update purchase', error: error.message });
  }
};

// Cancel purchase
exports.cancelPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const purchase = await Purchase.findByPk(id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Check if user owns the purchase
    if (purchase.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only cancel if not yet shipped
    if (['shipped', 'delivered', 'completed'].includes(purchase.status)) {
      return res.status(400).json({ message: 'Cannot cancel purchase at this stage' });
    }

    purchase.status = 'cancelled';
    await purchase.save();

    // Restore listing status if it was marked as sold
    if (['property_sell', 'vehicles'].includes(purchase.category)) {
      const listing = await Listing.findByPk(purchase.listingId);
      if (listing && listing.status === 'sold') {
        listing.status = 'active';
        await listing.save();
      }
    }

    res.json({ message: 'Purchase cancelled successfully' });
  } catch (error) {
    console.error('Cancel purchase error:', error);
    res.status(500).json({ message: 'Failed to cancel purchase', error: error.message });
  }
};

// Get purchase statistics (Admin only)
exports.getPurchaseStats = async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    
    const stats = await Purchase.findAll({
      attributes: [
        'category',
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalRevenue']
      ],
      group: ['category', 'status']
    });

    const totalPurchases = await Purchase.count();
    const totalRevenue = await Purchase.sum('totalAmount', {
      where: { paymentStatus: 'paid' }
    });

    res.json({
      total: totalPurchases,
      totalRevenue: totalRevenue || 0,
      byCategory: stats
    });
  } catch (error) {
    console.error('Get purchase stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

// Request furniture rental (no payment — admin reviews and confirms)
exports.requestFurnitureRental = async (req, res) => {
  try {
    const { listingId, purpose, rentalDuration, deliveryAddress, deliveryCity, deliveryState, deliveryPincode, deliveryPhone, notes } = req.body;
    const userId = req.user.id;

    if (!listingId || !purpose || !rentalDuration)
      return res.status(400).json({ message: 'Listing, purpose and rental duration are required.' });
    if (!['home', 'office', 'other'].includes(purpose))
      return res.status(400).json({ message: 'Purpose must be home, office or other.' });
    if (rentalDuration < 1 || rentalDuration > 24)
      return res.status(400).json({ message: 'Rental duration must be between 1 and 24 months.' });

    const listing = await Listing.findByPk(listingId);
    if (!listing) return res.status(404).json({ message: 'Furniture item not found.' });
    if (listing.category !== 'furniture') return res.status(400).json({ message: 'This item is not available for furniture rental.' });
    if (listing.status !== 'active') return res.status(400).json({ message: 'This item is not available for rental.' });

    const user = await User.findByPk(userId);
    const monthlyRent = parseFloat(listing.price);
    const totalAmount = monthlyRent * rentalDuration;

    const rental = await Purchase.create({
      userId, listingId, category: 'furniture',
      rentalType: 'rent', purpose, rentalDuration,
      quantity: 1, unitPrice: monthlyRent, totalAmount,
      deliveryAddress, deliveryCity, deliveryState, deliveryPincode,
      deliveryPhone: deliveryPhone || user.phone,
      buyerName: user.name, buyerEmail: user.email, buyerPhone: user.phone,
      notes, status: 'pending', paymentStatus: 'pending'
    });

    res.status(201).json({
      message: 'Furniture rental request submitted! Admin will confirm within 24 hours.',
      rental: { id: rental.id, item: listing.title, purpose, rentalDuration, monthlyRent, totalAmount, status: 'pending' }
    });
  } catch (error) {
    console.error('Furniture rental request error:', error);
    res.status(500).json({ message: 'Failed to submit rental request.', error: error.message });
  }
};

// ===== PROPERTY PURCHASE DOCUMENT WORKFLOW =====

// Admin approves property purchase (after payment verification)
exports.approvePropertyPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, adminNotes } = req.body;

    const purchase = await Purchase.findByPk(id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Listing, as: 'item', attributes: ['id', 'title', 'category', 'price'] }
      ]
    });

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.category !== 'property_sell') {
      return res.status(400).json({ message: 'This endpoint is only for property purchases' });
    }

    if (purchase.status !== 'admin_review') {
      return res.status(400).json({ message: 'Purchase is not in admin review status' });
    }

    if (approved) {
      purchase.status = 'documents_required';
      purchase.documentStatus = 'pending';
      purchase.adminNotes = adminNotes || 'Purchase approved. Please submit required documents.';
    } else {
      purchase.status = 'rejected';
      purchase.adminNotes = adminNotes || 'Purchase request rejected.';
    }

    await purchase.save();

    res.json({
      message: approved ? 'Property purchase approved. Buyer will be notified to submit documents.' : 'Property purchase rejected.',
      purchase
    });
  } catch (error) {
    console.error('Approve property purchase error:', error);
    res.status(500).json({ message: 'Failed to process approval', error: error.message });
  }
};

// User submits purchase documents
exports.submitPurchaseDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const purchase = await Purchase.findByPk(id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Check if user owns the purchase
    if (purchase.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (purchase.status !== 'documents_required') {
      return res.status(400).json({ message: 'Documents are not required for this purchase' });
    }

    // Handle file uploads
    const documents = [];
    if (req.files && req.files.length > 0) {
      const { uploadToCloudinary } = require('../middleware/upload');
      
      for (const file of req.files) {
        try {
          const url = await uploadToCloudinary(file.buffer, file.mimetype);
          documents.push({
            url,
            originalName: file.originalname,
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return res.status(500).json({ message: 'Failed to upload documents' });
        }
      }
    }

    if (documents.length === 0) {
      return res.status(400).json({ message: 'At least one document is required' });
    }

    // Update purchase with documents
    purchase.purchaseDocuments = documents;
    purchase.documentStatus = 'submitted';
    purchase.status = 'documents_submitted';
    purchase.documentSubmittedAt = new Date();
    
    await purchase.save();

    res.json({
      message: 'Documents submitted successfully. Admin will verify within 2-3 business days.',
      purchase: {
        id: purchase.id,
        status: purchase.status,
        documentStatus: purchase.documentStatus,
        documentsCount: documents.length,
        submittedAt: purchase.documentSubmittedAt
      }
    });
  } catch (error) {
    console.error('Submit purchase documents error:', error);
    res.status(500).json({ message: 'Failed to submit documents', error: error.message });
  }
};

// Admin verifies purchase documents
exports.verifyPurchaseDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, documentNotes, registrationDate, possessionDate } = req.body;

    const purchase = await Purchase.findByPk(id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Listing, as: 'item', attributes: ['id', 'title', 'category', 'price'] }
      ]
    });

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.status !== 'documents_submitted') {
      return res.status(400).json({ message: 'Documents are not submitted for verification' });
    }

    if (verified) {
      purchase.documentStatus = 'verified';
      purchase.status = 'documents_verified';
      purchase.documentVerifiedAt = new Date();
      
      // Set property-specific dates
      if (registrationDate) purchase.registrationDate = registrationDate;
      if (possessionDate) purchase.possessionDate = possessionDate;
      
      purchase.documentNotes = documentNotes || 'All documents verified successfully.';
      
      // Mark listing as sold
      const listing = await Listing.findByPk(purchase.listingId);
      if (listing) {
        listing.status = 'sold';
        await listing.save();
      }
    } else {
      purchase.documentStatus = 'rejected';
      purchase.status = 'documents_required'; // Back to document submission
      purchase.documentNotes = documentNotes || 'Documents rejected. Please resubmit with corrections.';
    }

    await purchase.save();

    res.json({
      message: verified ? 'Documents verified successfully. Property purchase completed!' : 'Documents rejected. Buyer will be notified to resubmit.',
      purchase
    });
  } catch (error) {
    console.error('Verify purchase documents error:', error);
    res.status(500).json({ message: 'Failed to verify documents', error: error.message });
  }
};

// Get purchase with document details
exports.getPurchaseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const purchase = await Purchase.findByPk(id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: Listing, 
          as: 'item',
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ]
    });

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Check if user owns the purchase (or is admin)
    if (purchase.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Get purchase details error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase details', error: error.message });
  }
};

// Get purchases requiring admin action
exports.getPurchasesForReview = async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    } else {
      // Default to purchases requiring admin action
      where.status = ['admin_review', 'documents_submitted'];
    }

    const purchases = await Purchase.findAll({
      where,
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: Listing,
          as: 'item',
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ],
      order: [['createdAt', 'ASC']] // Oldest first for review queue
    });

    res.json(purchases);
  } catch (error) {
    console.error('Get purchases for review error:', error);
    res.status(500).json({ message: 'Failed to fetch purchases for review', error: error.message });
  }
};
