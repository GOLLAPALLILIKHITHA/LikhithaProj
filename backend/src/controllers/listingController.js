const { Op } = require('sequelize');
const Listing = require('../models/Listing');
const User = require('../models/User');
const LeisureLease = require('../models/LeisureLease');
const { uploadToCloudinary } = require('../middleware/upload');

// Import associations to ensure they are loaded
require('../models/associations');

exports.createListing = async (req, res) => {
  try {
    const images = [];
    const documents = [];
    
    // Handle file uploads
    if (req.files) {
      // Separate images and documents
      const imageFiles = req.files.filter(file => file.fieldname === 'images');
      const documentFiles = req.files.filter(file => file.fieldname === 'documents');
      
      // Upload images
      for (const file of imageFiles) {
        const url = await uploadToCloudinary(file.buffer, file.mimetype);
        images.push(url);
      }
      
      // Upload documents
      for (const file of documentFiles) {
        const url = await uploadToCloudinary(file.buffer, file.mimetype);
        documents.push({
          url,
          originalName: file.originalname,
          uploadedAt: new Date()
        });
      }
    }
    
    // Auto-create owner account if contactEmail is provided and doesn't exist
    let ownerUser = null;
    if (req.body.contactEmail) {
      const contactEmail = req.body.contactEmail.toLowerCase().trim();
      
      // Check if user already exists with this email
      ownerUser = await User.findOne({ where: { email: contactEmail } });
      
      if (!ownerUser) {
        // Create new owner account with temporary password
        const bcrypt = require('bcryptjs');
        const tempPassword = Math.random().toString(36).slice(-8); // Random 8-char password
        
        ownerUser = await User.create({
          name: req.body.contactPerson || 'Property Owner',
          email: contactEmail,
          password: await bcrypt.hash(tempPassword, 10),
          phone: req.body.contactPhone || '0000000000',
          role: 'user',
          isVerified: false // Admin needs to verify and set proper password
        });
        
        console.log(`Created owner account for ${contactEmail} with temp password: ${tempPassword}`);
        
        // TODO: Send email to admin about new owner account creation
        // TODO: Send email to owner about account creation (optional)
      }
    }
    
    // For property listings, set initial status as pending for admin review
    const isProperty = req.body.category === 'property_sell' || req.body.category === 'property_rent';
    const status = isProperty ? 'pending' : 'active';
    
    const listing = await Listing.create({ 
      ...req.body, 
      images, 
      ownerDocuments: documents,
      userId: req.user.id, // Keep original user who created the listing
      status,
      commissionPercentage: req.body.commissionPercentage || 10.00,
      // Store owner info for dashboard matching
      ownerAccountId: ownerUser ? ownerUser.id : null
    });
    
    const message = isProperty 
      ? 'Property listing submitted successfully! Admin will review and approve within 24 hours.'
      : 'Listing created successfully!';
    
    // Add owner account info to response if created
    const response = { listing, message };
    if (ownerUser && !await User.findOne({ where: { email: req.body.contactEmail, isVerified: true } })) {
      response.ownerAccountCreated = true;
      response.ownerEmail = req.body.contactEmail;
      response.adminNote = 'New owner account created. Admin should set password and verify account.';
    }
    
    res.status(201).json(response);
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getListings = async (req, res) => {
  try {
    const { 
      category, city, minPrice, maxPrice, subCategory, search, bhk, 
      condition, brand, materialType, availability, propertyType,
      page = 1, limit = 12 
    } = req.query;
    
    const where = { 
      status: 'active'
    };
    
    // Basic filters
    if (category) where.category = category;
    if (city) where.city = { [Op.like]: `%${city}%` };
    if (subCategory) where.subCategory = { [Op.like]: `%${subCategory}%` };
    if (propertyType) where.subCategory = { [Op.like]: `%${propertyType}%` };
    
    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }
    
    // Search filter
    if (search) {
      where[Op.or] = [
        { location: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { pincode: { [Op.like]: `%${search}%` } },
      ];
    }
    
    // BHK filter: map "1 BHK" -> bedrooms=1, "2 BHK" -> bedrooms=2, etc.
    if (bhk) {
      const bhkList = bhk.split(',').map((b) => {
        const match = b.trim().match(/^(\d+)/);
        return match ? parseInt(match[1]) : null;
      }).filter(Boolean);
      if (bhkList.length > 0) {
        where.bedrooms = { [Op.in]: bhkList };
      }
    }
    
    // New enhanced filters
    
    // Condition filter (for furniture and electronics)
    if (condition) {
      // Normalize condition values from frontend to backend enum format
      const conditionMap = {
        'New': 'new',
        'Like New': 'like_new', 
        'Good': 'good',
        'Fair': 'fair',
        'Needs Repair': 'needs_repair'
      };
      const normalizedCondition = conditionMap[condition] || condition.toLowerCase().replace(/\s+/g, '_');
      where.condition = normalizedCondition;
    }
    
    // Brand filter (for furniture and electronics)
    if (brand) {
      where.brand = brand;
    }
    
    // Material type/Quality grade filter (for building materials)
    if (materialType) {
      where.materialType = materialType;
    }
    
    // Availability filter (for services)
    if (availability) {
      where.availability = availability;
    }
    
    const offset = (page - 1) * limit;
    const currentYear = new Date().getFullYear();
    
    const { count, rows } = await Listing.findAndCountAll({
      where,
      include: [
        { model: User, as: 'seller', attributes: ['id', 'name', 'avatar', 'isVerified'] },
        {
          model: LeisureLease,
          as: 'leisureLeases',
          required: false,
          where: {
            leaseYear: currentYear,
            status: 'active',
            paymentStatus: 'paid'
          }
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']], // Show newest listings first
    });

    // Filter out properties that are currently leased for this year
    const availableListings = rows.filter(listing => {
      // If it's not a leisure property, always show it
      if (!listing.isLeisure) return true;
      
      // If it's a leisure property, only show if not leased for current year
      return !listing.leisureLeases || listing.leisureLeases.length === 0;
    });

    res.json({ 
      listings: availableListings, 
      total: availableListings.length, 
      pages: Math.ceil(availableListings.length / limit) 
    });
  } catch (err) {
    console.error('Get listings error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'avatar', 'isVerified'] }],
    });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    await listing.increment('views');
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (listing.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    await listing.update(req.body);
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (listing.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    await listing.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const listings = await Listing.findAll({
      where: { isFeatured: true, status: 'active' },
      include: [
        { model: User, as: 'seller', attributes: ['id', 'name', 'avatar', 'isVerified'] },
        {
          model: LeisureLease,
          as: 'leisureLeases',
          required: false,
          where: {
            leaseYear: currentYear,
            status: 'active',
            paymentStatus: 'paid'
          }
        }
      ],
      limit: 8,
      order: [['createdAt', 'DESC']],
    });

    // Filter out properties that are currently leased for this year
    const availableListings = listings.filter(listing => {
      // If it's not a leisure property, always show it
      if (!listing.isLeisure) return true;
      
      // If it's a leisure property, only show if not leased for current year
      return !listing.leisureLeases || listing.leisureLeases.length === 0;
    });

    res.json(availableListings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

