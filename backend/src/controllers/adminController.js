const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sequelize = require('../config/database');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Subscription = require('../models/Subscription');
const PropertyRental = require('../models/PropertyRental');
const Vendor = require('../models/Vendor');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

// Admin login — credentials from .env
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, admin: { email, role: 'admin', name: 'Admin' } });
};

// Dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalListings = await Listing.count();
    const activeListings = await Listing.count({ where: { status: 'active' } });
    const totalReviews = await Review.count();
    const totalMessages = await Message.count();
    
    // Rental statistics
    const totalRentals = await PropertyRental.count();
    const activeRentals = await PropertyRental.count({ where: { status: 'active' } });
    const totalRentalRevenue = await PropertyRental.sum('initialPayment', { where: { paymentStatus: 'paid' } }) || 0;
    
    const recentUsers = await User.findAll({ order: [['createdAt', 'DESC']], limit: 5, attributes: { exclude: ['password'] } });
    const recentListings = await Listing.findAll({ order: [['createdAt', 'DESC']], limit: 5, include: [{ model: User, as: 'seller', attributes: ['name', 'email'] }] });
    const categoryStats = await Listing.findAll({
      attributes: ['category', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      group: ['category'],
    });
    const monthlyStats = await Listing.findAll({
      attributes: [
        [require('sequelize').fn('DATE_FORMAT', require('sequelize').col('createdAt'), '%Y-%m'), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: [require('sequelize').fn('DATE_FORMAT', require('sequelize').col('createdAt'), '%Y-%m')],
      order: [[require('sequelize').fn('DATE_FORMAT', require('sequelize').col('createdAt'), '%Y-%m'), 'DESC']],
      limit: 12
    });
    
    res.json({ 
      totalUsers, 
      totalListings, 
      activeListings, 
      totalReviews, 
      totalMessages, 
      totalRentals,
      activeRentals,
      totalRentalRevenue,
      recentUsers, 
      recentListings, 
      categoryStats, 
      monthlyStats 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const { Sequelize } = require('sequelize');
    
    // Build WHERE conditions
    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } }, 
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Get users with KYC status using raw query
    const { count, rows } = await User.findAndCountAll({ 
      where: userWhere,
      attributes: { 
        exclude: ['password'],
        include: [
          [Sequelize.literal('(SELECT status FROM kyc_documents WHERE userId = User.id LIMIT 1)'), 'kycStatus'],
          [Sequelize.literal('(SELECT verifiedAt FROM kyc_documents WHERE userId = User.id LIMIT 1)'), 'kycVerifiedAt']
        ]
      }, 
      order: [['createdAt', 'DESC']], 
      limit: parseInt(limit), 
      offset: (page - 1) * limit
    });
    
    // Process results to ensure kycStatus is properly set
    const usersWithKYC = rows.map(user => {
      const userData = user.toJSON();
      userData.kycStatus = userData.kycStatus || 'not_submitted';
      return userData;
    });
    
    res.json({ users: usersWithKYC, total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify / ban user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all listings
exports.getListings = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const where = {};
    
    if (category) where.category = category;
    if (search) where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { city: { [Op.like]: `%${search}%` } }];
    
    const { count, rows } = await Listing.findAndCountAll({
      where, 
      order: [['createdAt', 'DESC']], 
      limit: parseInt(limit), 
      offset: (page - 1) * limit,
      include: [
        { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
        { model: Vendor, as: 'assignedVendor', attributes: ['id', 'businessName', 'contactPerson', 'vendorType'] }
      ],
    });
    
    res.json({ listings: rows, total: count });
  } catch (err) {
    console.error('Admin getListings error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Feature / verify / delete listing
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    await listing.update(req.body);
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    await Listing.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reviews
exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { comment: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows } = await Review.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']], 
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      include: [
        { 
          model: User, 
          as: 'reviewer', 
          attributes: ['id', 'name', 'email', 'phone'] 
        },
        { 
          model: Listing, 
          attributes: ['id', 'title', 'category', 'price', 'city'] 
        }
      ],
    });
    
    res.json({ reviews: rows, total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== NEW ADMIN FUNCTIONS =====

// Create listing as admin
exports.createListing = async (req, res) => {
  try {
    const images = [];
    const documents = [];
    let agreementDocumentUrl = null;
    
    // Handle file uploads
    if (req.files) {
      // Handle images
      if (req.files.images) {
        for (const file of req.files.images) {
          const url = await require('../middleware/upload').uploadToCloudinary(file.buffer, file.mimetype);
          images.push(url);
        }
      }
      
      // Handle documents
      if (req.files.documents) {
        for (const file of req.files.documents) {
          const url = await require('../middleware/upload').uploadToCloudinary(file.buffer, file.mimetype);
          documents.push(url);
        }
      }
      
      // Handle agreement document
      if (req.files.agreementDocument && req.files.agreementDocument[0]) {
        agreementDocumentUrl = await require('../middleware/upload').uploadToCloudinary(
          req.files.agreementDocument[0].buffer, 
          req.files.agreementDocument[0].mimetype
        );
      }
    }
    
    // Resolve userId — use provided value, or fall back to the first user in DB
    let resolvedUserId = req.body.userId ? parseInt(req.body.userId) : null;
    if (!resolvedUserId) {
      const firstUser = await User.findOne({ order: [['id', 'ASC']], attributes: ['id'] });
      resolvedUserId = firstUser ? firstUser.id : null;
    }
    if (!resolvedUserId) {
      return res.status(400).json({ message: 'No users found in the system. Please create a user first.' });
    }

    const listingData = {
      ...req.body,
      images,
      ownerDocuments: documents,
      agreementDocument: agreementDocumentUrl,
      userId: resolvedUserId,
      status: 'active',
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      isVerified: req.body.isVerified === 'true' || req.body.isVerified === true || true, // Admin-created listings are auto-verified
      commissionPercentage: req.body.commissionPercentage ? parseFloat(req.body.commissionPercentage) : 10.00
    };
    
    // Parse amenities if it's a string
    if (typeof listingData.amenities === 'string') {
      try {
        listingData.amenities = JSON.parse(listingData.amenities);
      } catch (e) {
        listingData.amenities = [];
      }
    }
    
    // Convert numeric fields
    if (listingData.price) listingData.price = parseFloat(listingData.price);
    if (listingData.bedrooms) listingData.bedrooms = parseInt(listingData.bedrooms);
    if (listingData.bathrooms) listingData.bathrooms = parseInt(listingData.bathrooms);
    if (listingData.area) listingData.area = parseFloat(listingData.area);
    if (listingData.quantity) listingData.quantity = parseInt(listingData.quantity);
    if (listingData.floor) listingData.floor = parseInt(listingData.floor);
    if (listingData.totalFloors) listingData.totalFloors = parseInt(listingData.totalFloors);
    if (listingData.kmDriven) listingData.kmDriven = parseInt(listingData.kmDriven);
    if (listingData.minPrice) listingData.minPrice = parseFloat(listingData.minPrice);
    if (listingData.maxPrice) listingData.maxPrice = parseFloat(listingData.maxPrice);
    
    console.log('Creating listing with data:', listingData);
    
    const listing = await Listing.create(listingData);
    const fullListing = await Listing.findByPk(listing.id, {
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'email'] }]
    });
    
    console.log('Created listing:', fullListing.toJSON());
    res.status(201).json(fullListing);
  } catch (err) {
    console.error('Admin create listing error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all messages for admin oversight (only admin conversations)
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, userId } = req.query;
    const where = {
      [Op.or]: [
        { senderId: 1 }, // Messages sent by admin
        { receiverId: 1 } // Messages sent to admin
      ]
    };
    
    if (search) {
      where[Op.and] = [
        where[Op.or],
        { message: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (userId) {
      where[Op.and] = [
        where[Op.or],
        {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      ];
    }
    
    const { count, rows } = await Message.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Listing, attributes: ['id', 'title', 'category', 'price', 'city'] }
      ]
    });
    
    res.json({ messages: rows, total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send message as admin to any user
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, listingId, message } = req.body;
    
    // Create admin user if doesn't exist (ID: 1)
    let adminUser = await User.findByPk(1);
    if (!adminUser) {
      adminUser = await User.create({
        id: 1,
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@infraall.com',
        password: await require('bcryptjs').hash('admin123', 10),
        isVerified: true,
        role: 'admin'
      });
    }
    
    const newMessage = await Message.create({
      senderId: 1, // Admin user ID
      receiverId: parseInt(receiverId),
      listingId: listingId ? parseInt(listingId) : null,
      message,
      isRead: false
    });
    
    const fullMessage = await Message.findByPk(newMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] },
        { model: Listing, attributes: ['id', 'title'] }
      ]
    });
    
    res.status(201).json(fullMessage);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    await Message.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get conversations grouped by users (only admin conversations)
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.findAll({
      attributes: [
        'senderId', 'receiverId',
        [require('sequelize').fn('MAX', require('sequelize').col('createdAt')), 'lastMessageTime'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'messageCount']
      ],
      where: {
        [Op.or]: [
          { senderId: 1 }, // Admin messages
          { receiverId: 1 } // Messages to admin
        ]
      },
      group: ['senderId', 'receiverId'],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
      ],
      order: [[require('sequelize').fn('MAX', require('sequelize').col('createdAt')), 'DESC']]
    });
    
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages between admin and specific user
exports.getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: 1, receiverId: userId },
          { senderId: userId, receiverId: 1 }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] },
        { model: Listing, attributes: ['id', 'title'] }
      ]
    });
    
    // Mark messages as read
    await Message.update(
      { isRead: true },
      { 
        where: { 
          senderId: userId, 
          receiverId: 1, 
          isRead: false 
        } 
      }
    );
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk operations
exports.bulkUpdateListings = async (req, res) => {
  try {
    const { listingIds, updates } = req.body;
    await Listing.update(updates, { where: { id: { [Op.in]: listingIds } } });
    res.json({ message: `Updated ${listingIds.length} listings` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkDeleteListings = async (req, res) => {
  try {
    const { listingIds } = req.body;
    await Listing.destroy({ where: { id: { [Op.in]: listingIds } } });
    res.json({ message: `Deleted ${listingIds.length} listings` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Advanced user management
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, isVerified = true } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      isVerified,
      createdBy: 'admin'
    });
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// System settings and configuration
exports.getSystemSettings = async (req, res) => {
  try {
    // This could be expanded to include actual system settings from a settings table
    const settings = {
      siteName: 'INFRAALL',
      allowRegistration: true,
      requireEmailVerification: false,
      maxListingsPerUser: 50,
      featuredListingPrice: 99,
      categories: [
        'Apartments', 'Houses', 'Villas', 'Plots', 'Commercial',
        'Furniture', 'Electronics', 'Vehicles', 'Services'
      ],
      cities: [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
        'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
      ]
    };
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    // In a real app, you'd save these to a database
    const settings = req.body;
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Analytics and reports
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const userGrowth = await User.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: dateFilter,
      group: [require('sequelize').fn('DATE', require('sequelize').col('createdAt'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']]
    });

    const listingGrowth = await Listing.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: dateFilter,
      group: [require('sequelize').fn('DATE', require('sequelize').col('createdAt'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']]
    });

    const topCategories = await Listing.findAll({
      attributes: [
        'category',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: dateFilter,
      group: ['category'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
      limit: 10
    });

    res.json({ userGrowth, listingGrowth, topCategories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== SUBSCRIPTION MANAGEMENT =====

// Get all subscriptions with user details
exports.getSubscriptions = async (req, res) => {
  try {
    const { search, packageType, status, page = 1, limit = 20 } = req.query;
    const where = {};
    
    if (packageType) where.packageType = packageType;
    if (status) where.status = status;
    
    const { count, rows } = await Subscription.findAndCountAll({
      where,
      include: [{ 
        model: User, 
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone'],
        where: search ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        } : {}
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });
    
    res.json({ subscriptions: rows, total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get subscription analytics
exports.getSubscriptionAnalytics = async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.count();
    const activeSubscriptions = await Subscription.count({ where: { status: 'active' } });
    const expiredSubscriptions = await Subscription.count({ where: { status: 'expired' } });
    
    // Revenue by package type
    const revenueByPackage = await Subscription.findAll({
      attributes: [
        'packageType',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalRevenue'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['packageType'],
      raw: true
    });
    
    // Monthly revenue
    const monthlyRevenue = await Subscription.findAll({
      attributes: [
        [require('sequelize').fn('DATE_FORMAT', require('sequelize').col('createdAt'), '%Y-%m'), 'month'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'revenue'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'subscriptions']
      ],
      group: [require('sequelize').fn('DATE_FORMAT', require('sequelize').col('createdAt'), '%Y-%m')],
      order: [[require('sequelize').fn('DATE_FORMAT', require('sequelize').col('createdAt'), '%Y-%m'), 'DESC']],
      limit: 12,
      raw: true
    });
    
    // Total revenue
    const totalRevenue = await Subscription.sum('amount') || 0;
    
    console.log('Subscription Analytics:', {
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      totalRevenue,
      revenueByPackage,
      monthlyRevenue
    });
    
    res.json({
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      totalRevenue,
      revenueByPackage,
      monthlyRevenue
    });
  } catch (err) {
    console.error('Subscription analytics error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Manual subscription management
exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    
    await subscription.update(req.body);
    const updatedSubscription = await Subscription.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    
    res.json(updatedSubscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create manual subscription
exports.createSubscription = async (req, res) => {
  try {
    const { userId, packageType, amount, startDate, endDate } = req.body;
    
    const subscription = await Subscription.create({
      userId,
      packageType,
      amount: amount || (packageType === 'Monthly' ? 99900 : packageType === 'Weekly' ? 29900 : 999900),
      startDate: startDate || new Date(),
      endDate,
      status: 'active'
    });
    
    const fullSubscription = await Subscription.findByPk(subscription.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    
    res.status(201).json(fullSubscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = {};
    
    if (search) {
      where.razorpayPaymentId = { [Op.like]: `%${search}%` };
    }
    
    const { count, rows } = await Subscription.findAndCountAll({
      where: {
        ...where,
        razorpayPaymentId: { [Op.not]: null }
      },
      include: [{ 
        model: User, 
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone'],
        where: search ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        } : {}
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });
    
    res.json({ payments: rows, total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== OWNER & DOCUMENT MANAGEMENT =====

// Get comprehensive owner details with documents
exports.getOwnerDetails = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = {
      category: ['property_sell', 'property_rent'] // Show both sell and rent properties
    };
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { contactPerson: { [Op.like]: `%${search}%` } },
        { businessName: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows } = await Listing.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'seller',
          attributes: ['id', 'name', 'email', 'phone', 'isVerified']
        }
      ],
      attributes: [
        'id', 'title', 'category', 'price', 'city', 'state', 'pincode', 'status', 'location',
        'contactPerson', 'contactPhone', 'contactEmail', 'whatsappNumber',
        'businessName', 'businessAddress', 'ownerDocuments', 'thalukaDocuments',
        'agreementDocument', 'commissionPercentage', 'ownerBankDetails',
        'ownerAadhaar', 'ownerPan', 'createdAt', 'bedrooms', 'bathrooms', 'area',
        'subCategory', 'furnishing', 'parking', 'floor', 'totalFloors', 'images'
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });
    
    // Manually fetch buy requests for sold properties
    const listingIds = rows.map(listing => listing.id);
    const buyRequests = await require('../models/BuyRequest').findAll({
      where: { 
        listingId: { [Op.in]: listingIds },
        status: 'completed'
      },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      attributes: ['id', 'listingId', 'status', 'buyerMessage', 'adminNotes', 'agreementDocuments', 'createdAt', 'completedAt']
    });
    
    // Add buy requests to listings
    const ownersWithBuyRequests = rows.map(listing => {
      const listingBuyRequests = buyRequests.filter(br => br.listingId === listing.id);
      return {
        ...listing.toJSON(),
        buyRequests: listingBuyRequests
      };
    });
    
    res.json({ owners: ownersWithBuyRequests, total: count });
  } catch (err) {
    console.error('Get owner details error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update owner documents and details
exports.updateOwnerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByPk(id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Handle file uploads for documents
    const updates = { ...req.body };
    
    // Handle commission percentage update
    if (req.body.commissionPercentage !== undefined) {
      updates.commissionPercentage = parseFloat(req.body.commissionPercentage);
    }
    
    // Handle single document upload (for agreement document)
    if (req.file) {
      const uploadToCloudinary = require('../middleware/upload').uploadToCloudinary;
      const url = await uploadToCloudinary(req.file.buffer);
      updates.agreementDocument = url;
    }
    
    if (req.files) {
      const uploadToCloudinary = require('../middleware/upload').uploadToCloudinary;
      
      // Handle owner documents
      if (req.files.ownerDocuments) {
        const ownerDocs = [];
        for (const file of req.files.ownerDocuments) {
          const url = await uploadToCloudinary(file.buffer);
          ownerDocs.push(url);
        }
        updates.ownerDocuments = [...(listing.ownerDocuments || []), ...ownerDocs];
      }
      
      // Handle thaluka documents
      if (req.files.thalukaDocuments) {
        const thalukaDocs = [];
        for (const file of req.files.thalukaDocuments) {
          const url = await uploadToCloudinary(file.buffer);
          thalukaDocs.push(url);
        }
        updates.thalukaDocuments = [...(listing.thalukaDocuments || []), ...thalukaDocs];
      }
      
      // Handle agreement document
      if (req.files.agreementDocument && req.files.agreementDocument[0]) {
        const url = await uploadToCloudinary(req.files.agreementDocument[0].buffer);
        updates.agreementDocument = url;
      }
    }
    
    // Parse bank details if provided as string
    if (updates.ownerBankDetails && typeof updates.ownerBankDetails === 'string') {
      try {
        updates.ownerBankDetails = JSON.parse(updates.ownerBankDetails);
      } catch (e) {
        updates.ownerBankDetails = {};
      }
    }
    
    await listing.update(updates);
    
    const updatedListing = await Listing.findByPk(id, {
      include: [{ 
        model: User, 
        as: 'seller',
        attributes: ['id', 'name', 'email', 'phone', 'isVerified']
      }]
    });
    
    res.json(updatedListing);
  } catch (err) {
    console.error('Update owner details error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get commission analytics
exports.getCommissionAnalytics = async (req, res) => {
  try {
    const totalProperties = await Listing.count();
    const propertiesWithCommission = await Listing.count({
      where: { commissionPercentage: { [Op.gt]: 0 } }
    });
    
    // Average commission percentage
    const avgCommission = await Listing.findOne({
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('commissionPercentage')), 'avgCommission']],
      raw: true
    });
    
    // Commission breakdown by percentage
    const commissionBreakdown = await Listing.findAll({
      attributes: [
        'commissionPercentage',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('price')), 'totalValue']
      ],
      where: { commissionPercentage: { [Op.gt]: 0 } },
      group: ['commissionPercentage'],
      order: [['commissionPercentage', 'ASC']],
      raw: true
    });
    
    // Properties by category with commission
    const categoryCommission = await Listing.findAll({
      attributes: [
        'category',
        [require('sequelize').fn('AVG', require('sequelize').col('commissionPercentage')), 'avgCommission'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: { commissionPercentage: { [Op.gt]: 0 } },
      group: ['category'],
      raw: true
    });
    
    res.json({
      totalProperties,
      propertiesWithCommission,
      averageCommission: parseFloat(avgCommission.avgCommission || 0).toFixed(2),
      commissionBreakdown,
      categoryCommission
    });
  } catch (err) {
    console.error('Commission analytics error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Bulk update commission percentages
exports.bulkUpdateCommission = async (req, res) => {
  try {
    const { listingIds, commissionPercentage } = req.body;
    
    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ message: 'Invalid listing IDs' });
    }
    
    if (commissionPercentage < 0 || commissionPercentage > 100) {
      return res.status(400).json({ message: 'Commission percentage must be between 0 and 100' });
    }
    
    await Listing.update(
      { commissionPercentage },
      { where: { id: { [Op.in]: listingIds } } }
    );
    
    res.json({ 
      message: `Updated commission to ${commissionPercentage}% for ${listingIds.length} properties` 
    });
  } catch (err) {
    console.error('Bulk update commission error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get document verification status
exports.getDocumentStatus = async (req, res) => {
  try {
    const totalListings = await Listing.count();
    
    const withOwnerDocs = await Listing.count({
      where: { ownerDocuments: { [Op.ne]: '[]' } }
    });
    
    const withThalukaDocs = await Listing.count({
      where: { thalukaDocuments: { [Op.ne]: '[]' } }
    });
    
    const withAgreements = await Listing.count({
      where: { agreementDocument: { [Op.ne]: null } }
    });
    
    const withBankDetails = await Listing.count({
      where: { ownerBankDetails: { [Op.ne]: '{}' } }
    });
    
    const completeDocumentation = await Listing.count({
      where: {
        [Op.and]: [
          { ownerDocuments: { [Op.ne]: '[]' } },
          { thalukaDocuments: { [Op.ne]: '[]' } },
          { agreementDocument: { [Op.ne]: null } },
          { ownerBankDetails: { [Op.ne]: '{}' } }
        ]
      }
    });
    
    res.json({
      totalListings,
      withOwnerDocs,
      withThalukaDocs,
      withAgreements,
      withBankDetails,
      completeDocumentation,
      completionPercentage: totalListings > 0 ? ((completeDocumentation / totalListings) * 100).toFixed(2) : 0
    });
  } catch (err) {
    console.error('Document status error:', err);
    res.status(500).json({ message: err.message });
  }
};


// ===== PROPERTY PURCHASES & RENTALS MANAGEMENT =====

// Get all property purchases (buy requests and rentals) with detailed payment info
exports.getPropertyPurchases = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20, search } = req.query;
    
    const allTransactions = [];
    
    // Get Buy Requests (Property Purchases)
    const buyRequests = await require('../models/BuyRequest').findAll({
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Listing,
          as: 'property',
          attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images', 'contactPerson', 'contactPhone', 'contactEmail']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Process buy requests
    buyRequests.forEach(buyRequest => {
      if (buyRequest.status === 'completed' || buyRequest.status === 'approved') {
        allTransactions.push({
          id: `buy_${buyRequest.id}`,
          type: 'buy',
          status: buyRequest.status,
          createdAt: buyRequest.createdAt,
          updatedAt: buyRequest.updatedAt,
          completedAt: buyRequest.completedAt,
          approvedAt: buyRequest.approvedAt,
          buyer: buyRequest.buyer,
          property: buyRequest.property,
          amount: parseFloat(buyRequest.property?.price || 0),
          paymentStatus: 'completed', // Buy requests are offline payments
          paymentMethod: 'offline',
          adminNotes: buyRequest.adminNotes,
          buyerMessage: buyRequest.buyerMessage,
          agreementDocuments: buyRequest.agreementDocuments || []
        });
      }
    });

    // Get Property Rentals
    const rentals = await PropertyRental.findAll({
      include: [
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Listing,
          as: 'property',
          attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images', 'contactPerson', 'contactPhone', 'contactEmail']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Process rentals
    rentals.forEach(rental => {
      if (rental.status === 'active' || rental.status === 'completed') {
        // Calculate payment status
        let paymentStatus = 'current';
        let nextPaymentDue = null;
        let overdueAmount = 0;
        
        if (rental.nextPaymentDue) {
          const today = new Date();
          const dueDate = new Date(rental.nextPaymentDue);
          if (dueDate < today) {
            paymentStatus = 'overdue';
            const monthsOverdue = Math.floor((today - dueDate) / (30 * 24 * 60 * 60 * 1000));
            overdueAmount = monthsOverdue * parseFloat(rental.monthlyRent || 0);
          }
          nextPaymentDue = rental.nextPaymentDue;
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
          advancePayment: parseFloat(rental.advancePayment || 0),
          initialPayment: parseFloat(rental.initialPayment || 0),
          paymentStatus: paymentStatus,
          paymentMethod: rental.razorpayPaymentId ? 'online' : 'offline',
          razorpayPaymentId: rental.razorpayPaymentId,
          razorpayOrderId: rental.razorpayOrderId,
          startDate: rental.startDate,
          endDate: rental.endDate,
          nextPaymentDue: nextPaymentDue,
          lastPaymentDate: rental.lastPaymentDate,
          overdueAmount: overdueAmount,
          adminNotes: rental.adminNotes,
          notes: rental.notes,
          vacateRequested: rental.vacateRequested,
          vacateDate: rental.vacateDate,
          vacateReason: rental.vacateReason
        });
      }
    });

    // Apply filters
    let filtered = allTransactions;
    
    if (type && type !== 'all') {
      filtered = filtered.filter(t => t.type === type);
    }
    
    if (status && status !== 'all') {
      if (status === 'overdue') {
        filtered = filtered.filter(t => t.paymentStatus === 'overdue');
      } else {
        filtered = filtered.filter(t => t.status === status);
      }
    }
    
    if (search) {
      filtered = filtered.filter(t => 
        t.buyer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.buyer?.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.property?.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.property?.location?.toLowerCase().includes(search.toLowerCase()) ||
        t.property?.city?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = filtered.slice(startIndex, endIndex);

    // Calculate summary stats
    const stats = {
      total: total,
      totalBought: filtered.filter(t => t.type === 'buy').length,
      totalRented: filtered.filter(t => t.type === 'rent').length,
      activeRentals: filtered.filter(t => t.type === 'rent' && t.status === 'active').length,
      overduePayments: filtered.filter(t => t.paymentStatus === 'overdue').length,
      totalRevenue: filtered.reduce((sum, t) => sum + (t.totalAmount || t.amount || 0), 0),
      monthlyRentalIncome: filtered.filter(t => t.type === 'rent' && t.status === 'active').reduce((sum, t) => sum + t.amount, 0)
    };

    res.json({
      purchases: paginatedResults,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      stats: stats
    });

  } catch (error) {
    console.error('Get property purchases error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get detailed property purchase/rental information
exports.getPropertyPurchaseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const [type, actualId] = id.split('_');

    let result = null;

    if (type === 'buy') {
      const buyRequest = await require('../models/BuyRequest').findByPk(actualId, {
        include: [
          {
            model: User,
            as: 'buyer',
            attributes: ['id', 'name', 'email', 'phone', 'createdAt']
          },
          {
            model: Listing,
            as: 'property',
            attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images', 'contactPerson', 'contactPhone', 'contactEmail', 'ownerDocuments', 'agreementDocument']
          }
        ]
      });

      if (buyRequest) {
        result = {
          id: `buy_${buyRequest.id}`,
          type: 'buy',
          status: buyRequest.status,
          createdAt: buyRequest.createdAt,
          updatedAt: buyRequest.updatedAt,
          completedAt: buyRequest.completedAt,
          approvedAt: buyRequest.approvedAt,
          buyer: buyRequest.buyer,
          property: buyRequest.property,
          amount: parseFloat(buyRequest.property?.price || 0),
          paymentStatus: 'completed',
          paymentMethod: 'offline',
          adminNotes: buyRequest.adminNotes,
          buyerMessage: buyRequest.buyerMessage,
          agreementDocuments: buyRequest.agreementDocuments || []
        };
      }
    } else if (type === 'rent') {
      const rental = await PropertyRental.findByPk(actualId, {
        include: [
          {
            model: User,
            as: 'tenant',
            attributes: ['id', 'name', 'email', 'phone', 'createdAt']
          },
          {
            model: Listing,
            as: 'property',
            attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images', 'contactPerson', 'contactPhone', 'contactEmail', 'ownerDocuments', 'agreementDocument']
          }
        ]
      });

      if (rental) {
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

        result = {
          id: `rent_${rental.id}`,
          type: 'rent',
          status: rental.status,
          createdAt: rental.createdAt,
          updatedAt: rental.updatedAt,
          buyer: rental.tenant,
          property: rental.property,
          amount: parseFloat(rental.monthlyRent || 0),
          totalAmount: parseFloat(rental.totalAmount || 0),
          advancePayment: parseFloat(rental.advancePayment || 0),
          initialPayment: parseFloat(rental.initialPayment || 0),
          paymentStatus: paymentStatus,
          paymentMethod: rental.razorpayPaymentId ? 'online' : 'offline',
          razorpayPaymentId: rental.razorpayPaymentId,
          razorpayOrderId: rental.razorpayOrderId,
          startDate: rental.startDate,
          endDate: rental.endDate,
          nextPaymentDue: rental.nextPaymentDue,
          lastPaymentDate: rental.lastPaymentDate,
          overdueAmount: overdueAmount,
          adminNotes: rental.adminNotes,
          notes: rental.notes,
          vacateRequested: rental.vacateRequested,
          vacateDate: rental.vacateDate,
          vacateReason: rental.vacateReason
        };
      }
    }

    if (!result) {
      return res.status(404).json({ message: 'Property purchase/rental not found' });
    }

    res.json(result);

  } catch (error) {
    console.error('Get property purchase details error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update property purchase/rental status or payment
exports.updatePropertyPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const [type, actualId] = id.split('_');
    const updateData = req.body;

    let result = null;

    if (type === 'buy') {
      const buyRequest = await require('../models/BuyRequest').findByPk(actualId);
      if (buyRequest) {
        await buyRequest.update(updateData);
        result = await require('../models/BuyRequest').findByPk(actualId, {
          include: [
            { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
            { model: Listing, as: 'property', attributes: ['id', 'title', 'price', 'location', 'city'] }
          ]
        });
      }
    } else if (type === 'rent') {
      const rental = await PropertyRental.findByPk(actualId);
      if (rental) {
        await rental.update(updateData);
        result = await PropertyRental.findByPk(actualId, {
          include: [
            { model: User, as: 'tenant', attributes: ['id', 'name', 'email', 'phone'] },
            { model: Listing, as: 'property', attributes: ['id', 'title', 'price', 'location', 'city'] }
          ]
        });
      }
    }

    if (!result) {
      return res.status(404).json({ message: 'Property purchase/rental not found' });
    }

    res.json({ message: 'Updated successfully', data: result });

  } catch (error) {
    console.error('Update property purchase error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== VENDOR MANAGEMENT =====

// Get all vendors
exports.getVendors = async (req, res) => {
  try {
    const { 
      search, 
      vendorType, 
      city, 
      locality,
      isVerified, 
      isActive, 
      page = 1, 
      limit = 20 
    } = req.query;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { businessName: { [Op.like]: `%${search}%` } },
        { contactPerson: { [Op.like]: `%${search}%` } },
        { contactEmail: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (vendorType) where.vendorType = vendorType;
    if (city) where.city = { [Op.like]: `%${city}%` };
    if (locality) where.locality = { [Op.like]: `%${locality}%` };
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows } = await Vendor.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'createdAt']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      vendors: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get vendor statistics
exports.getVendorStats = async (req, res) => {
  try {
    const totalVendors = await Vendor.count();
    const activeVendors = await Vendor.count({ where: { isActive: true } });
    const verifiedVendors = await Vendor.count({ where: { isVerified: true } });
    const buildingMaterialVendors = await Vendor.count({ where: { vendorType: 'building_materials' } });
    const homeServiceVendors = await Vendor.count({ where: { vendorType: 'home_services' } });

    // City-wise distribution
    const cityStats = await Vendor.findAll({
      attributes: [
        'city',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['city'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      totalVendors,
      activeVendors,
      verifiedVendors,
      buildingMaterialVendors,
      homeServiceVendors,
      cityStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create vendor — links portal user by email only (no admin password / userId).
// New users get a set-password email; existing users get a short notice to use vendor login.
exports.createVendor = async (req, res) => {
  try {
    const {
      businessName,
      contactPerson,
      contactPhone,
      contactEmail,
      portalLoginEmail,
      whatsappNumber,
      businessAddress,
      vendorType,
      categories,
      description,
      experience,
      serviceArea,
      city,
      locality,
      state,
      pincode,
      minPrice,
      maxPrice,
      priceType,
      certifications,
      languages,
      availability,
      isVerified = false,
      isFeatured = false
    } = req.body;

    if (!city || !locality) {
      return res.status(400).json({ message: 'City and Locality are required for vendor registration' });
    }

    const loginEmail = String(portalLoginEmail || contactEmail || '')
      .trim()
      .toLowerCase();
    if (!loginEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      return res.status(400).json({
        message: 'A valid vendor portal email is required. Use Contact Email or enter Portal login email.',
      });
    }

    const images = req.files?.images ? req.files.images.map((file) => file.filename) : [];
    const documents = req.files?.documents ? req.files.documents.map((file) => file.filename) : [];

    let vendorRow;
    let linkedUser;
    let createdNewUser = false;

    await sequelize.transaction(async (t) => {
      let user = await User.findOne({ where: { email: loginEmail }, transaction: t });

      if (!user) {
        const randomHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
        const phoneDigits = String(contactPhone || '').replace(/\D/g, '').slice(0, 10);
        const phone = phoneDigits.length >= 10 ? phoneDigits : '0000000000';
        user = await User.create(
          {
            name: (contactPerson || businessName || 'Vendor').trim().slice(0, 120),
            email: loginEmail,
            password: randomHash,
            phone,
            role: 'user',
          },
          { transaction: t }
        );
        createdNewUser = true;
      }

      vendorRow = await Vendor.create(
        {
          businessName,
          contactPerson,
          contactPhone,
          contactEmail,
          whatsappNumber,
          businessAddress,
          vendorType,
          categories: Array.isArray(categories) ? categories : JSON.parse(categories || '[]'),
          description,
          experience,
          serviceArea,
          city,
          locality,
          state,
          pincode,
          minPrice,
          maxPrice,
          priceType,
          certifications,
          languages,
          availability,
          images,
          documents,
          isVerified,
          isFeatured,
          userId: user.id,
          verifiedBy: isVerified ? req.user?.id : null,
          verifiedAt: isVerified ? new Date() : null,
        },
        { transaction: t }
      );
      linkedUser = user;
    });

    const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

    try {
      if (createdNewUser) {
        const inviteToken = jwt.sign(
          { purpose: 'vendor_set_password', userId: linkedUser.id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        const link = `${base}/vendor/set-password?token=${encodeURIComponent(inviteToken)}`;
        await emailService.sendEmail({
          to: loginEmail,
          subject: 'Set your INFRAALL vendor portal password',
          html: `
            <p>Hello ${(contactPerson || businessName || '').replace(/</g, '')},</p>
            <p>Your vendor profile <strong>${String(businessName).replace(/</g, '')}</strong> has been created on INFRAALL.</p>
            <p>Choose a password for your vendor portal account (this link expires in 7 days):</p>
            <p><a href="${link}">${link}</a></p>
            <p>After setting your password, sign in at: <a href="${base}/vendor/login">${base}/vendor/login</a></p>
          `,
        });
      } else {
        await emailService.sendEmail({
          to: loginEmail,
          subject: 'You have been added as an INFRAALL vendor partner',
          html: `
            <p>Hello,</p>
            <p>A vendor profile <strong>${String(businessName).replace(/</g, '')}</strong> has been linked to your existing INFRAALL account.</p>
            <p>Sign in to the vendor portal with your current email and password:</p>
            <p><a href="${base}/vendor/login">${base}/vendor/login</a></p>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Vendor welcome email failed:', emailErr);
    }

    const vendorWithUser = await Vendor.findByPk(vendorRow.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    res.status(201).json({
      ...vendorWithUser.toJSON(),
      portalMessage: createdNewUser
        ? 'Vendor created. A set-password email was sent to the portal login address.'
        : 'Vendor created. An email was sent with the vendor sign-in link (use your existing password).',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update vendor
exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updateData = { ...req.body };
    
    // Handle categories
    if (updateData.categories && typeof updateData.categories === 'string') {
      updateData.categories = JSON.parse(updateData.categories);
    }

    // Handle file uploads
    if (req.files?.images) {
      updateData.images = [...(vendor.images || []), ...req.files.images.map(file => file.filename)];
    }
    if (req.files?.documents) {
      updateData.documents = [...(vendor.documents || []), ...req.files.documents.map(file => file.filename)];
    }

    // Handle verification
    if (updateData.isVerified && !vendor.isVerified) {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = req.user?.id;
    }

    await vendor.update(updateData);

    const updatedVendor = await Vendor.findByPk(vendor.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json(updatedVendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.destroy();
    res.json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle vendor status (active/inactive)
exports.toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.update({ isActive: !vendor.isActive });
    
    res.json({ 
      message: `Vendor ${vendor.isActive ? 'activated' : 'deactivated'} successfully`,
      vendor 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle vendor verification
exports.toggleVendorVerification = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updateData = { 
      isVerified: !vendor.isVerified,
      verifiedAt: !vendor.isVerified ? new Date() : null,
      verifiedBy: !vendor.isVerified ? req.user?.id : null
    };

    await vendor.update(updateData);
    
    res.json({ 
      message: `Vendor ${vendor.isVerified ? 'verified' : 'unverified'} successfully`,
      vendor 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};