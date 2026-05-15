const BuyRequest = require('../models/BuyRequest');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { uploadToCloudinary } = require('../middleware/upload');
const { Op } = require('sequelize');

// User creates a buy request
exports.createBuyRequest = async (req, res) => {
  try {
    const { listingId, buyerMessage } = req.body;
    const userId = req.user.id;

    // Check if listing exists and is available
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'Property is not available for purchase' });
    }

    // Check if user already has a pending request for this property
    const existingRequest = await BuyRequest.findOne({
      where: {
        userId,
        listingId,
        status: ['pending', 'approved']
      }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this property' });
    }

    // Create buy request
    const buyRequest = await BuyRequest.create({
      userId,
      listingId,
      buyerMessage: buyerMessage || 'I am interested in purchasing this property.',
      status: 'pending'
    });

    const fullRequest = await BuyRequest.findByPk(buyRequest.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Listing, as: 'property', attributes: ['id', 'title', 'price', 'location', 'city'] }
      ]
    });

    res.status(201).json({
      message: 'Buy request submitted successfully! Admin will review and contact you soon.',
      buyRequest: fullRequest
    });
  } catch (error) {
    console.error('Create buy request error:', error);
    res.status(500).json({ message: 'Failed to submit buy request', error: error.message });
  }
};

// Get user's buy requests
exports.getUserBuyRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const buyRequests = await BuyRequest.findAll({
      where: { userId },
      include: [
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

    res.json(buyRequests);
  } catch (error) {
    console.error('Get user buy requests error:', error);
    res.status(500).json({ message: 'Failed to fetch buy requests', error: error.message });
  }
};

// Get specific buy request details
exports.getBuyRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const buyRequest = await BuyRequest.findByPk(id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: Listing, 
          as: 'property',
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ]
    });

    if (!buyRequest) {
      return res.status(404).json({ message: 'Buy request not found' });
    }

    // Check if user owns this request (or is admin)
    if (buyRequest.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(buyRequest);
  } catch (error) {
    console.error('Get buy request details error:', error);
    res.status(500).json({ message: 'Failed to fetch buy request details', error: error.message });
  }
};

// ===== ADMIN FUNCTIONS =====

// Get all buy requests for admin
exports.getAllBuyRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await BuyRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: Listing, 
          as: 'property',
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({ buyRequests: rows, total: count });
  } catch (error) {
    console.error('Get all buy requests error:', error);
    res.status(500).json({ message: 'Failed to fetch buy requests', error: error.message });
  }
};

// Admin approves/rejects buy request
exports.updateBuyRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const buyRequest = await BuyRequest.findByPk(id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Listing, as: 'property', attributes: ['id', 'title', 'price', 'location', 'city'] }
      ]
    });

    if (!buyRequest) {
      return res.status(404).json({ message: 'Buy request not found' });
    }

    const updates = { status, adminNotes };
    
    if (status === 'approved') {
      updates.approvedAt = new Date();
    } else if (status === 'completed') {
      updates.completedAt = new Date();
      
      // Mark property as sold
      await Listing.update(
        { status: 'sold' },
        { where: { id: buyRequest.listingId } }
      );
    }

    await buyRequest.update(updates);

    const updatedRequest = await BuyRequest.findByPk(id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Listing, as: 'property', attributes: ['id', 'title', 'price', 'location', 'city'] }
      ]
    });

    res.json({
      message: `Buy request ${status} successfully!`,
      buyRequest: updatedRequest
    });
  } catch (error) {
    console.error('Update buy request status error:', error);
    res.status(500).json({ message: 'Failed to update buy request', error: error.message });
  }
};

// Admin uploads agreement documents
exports.uploadAgreementDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const buyRequest = await BuyRequest.findByPk(id);
    if (!buyRequest) {
      return res.status(404).json({ message: 'Buy request not found' });
    }

    // Handle file uploads
    const agreementDocs = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const url = await uploadToCloudinary(file.buffer, file.mimetype);
          agreementDocs.push({
            url,
            originalName: file.originalname,
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return res.status(500).json({ message: 'Failed to upload agreement documents' });
        }
      }
    }

    if (agreementDocs.length === 0) {
      return res.status(400).json({ message: 'At least one agreement document is required' });
    }

    // Update buy request with agreement documents
    await buyRequest.update({
      agreementDocuments: [...(buyRequest.agreementDocuments || []), ...agreementDocs],
      adminNotes: adminNotes || buyRequest.adminNotes,
      status: 'completed',
      completedAt: new Date()
    });

    // Mark property as sold
    await Listing.update(
      { status: 'sold' },
      { where: { id: buyRequest.listingId } }
    );

    const updatedRequest = await BuyRequest.findByPk(id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Listing, as: 'property', attributes: ['id', 'title', 'price', 'location', 'city'] }
      ]
    });

    res.json({
      message: 'Agreement documents uploaded successfully! Property purchase completed.',
      buyRequest: updatedRequest
    });
  } catch (error) {
    console.error('Upload agreement documents error:', error);
    res.status(500).json({ message: 'Failed to upload agreement documents', error: error.message });
  }
};

// Get buy request statistics
exports.getBuyRequestStats = async (req, res) => {
  try {
    const totalRequests = await BuyRequest.count();
    const pendingRequests = await BuyRequest.count({ where: { status: 'pending' } });
    const approvedRequests = await BuyRequest.count({ where: { status: 'approved' } });
    const completedRequests = await BuyRequest.count({ where: { status: 'completed' } });
    const rejectedRequests = await BuyRequest.count({ where: { status: 'rejected' } });

    // Monthly stats
    const monthlyStats = await BuyRequest.findAll({
      attributes: [
        [require('sequelize').fn('DATE_FORMAT', require('sequelize').col('createdAt'), '%Y-%m'), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: [require('sequelize').fn('DATE_FORMAT', require('sequelize').col('createdAt'), '%Y-%m')],
      order: [[require('sequelize').fn('DATE_FORMAT', require('sequelize').col('createdAt'), '%Y-%m'), 'DESC']],
      limit: 12,
      raw: true
    });

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      rejectedRequests,
      monthlyStats
    });
  } catch (error) {
    console.error('Get buy request stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};