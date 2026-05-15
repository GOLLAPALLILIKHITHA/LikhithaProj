const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');

// Get all vendors with filters
exports.getVendors = async (req, res) => {
  try {
    const { 
      search, 
      vendorType, 
      city, 
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

// Get vendor by ID
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'createdAt']
      }]
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create vendor (Admin only)
exports.createVendor = async (req, res) => {
  try {
    const {
      businessName,
      contactPerson,
      contactPhone,
      contactEmail,
      whatsappNumber,
      businessAddress,
      vendorType,
      categories,
      description,
      experience,
      serviceArea,
      city,
      state,
      pincode,
      minPrice,
      maxPrice,
      priceType,
      certifications,
      languages,
      availability,
      userId,
      isVerified = false,
      isFeatured = false
    } = req.body;

    // Handle file uploads
    const images = req.files?.images ? req.files.images.map(file => file.filename) : [];
    const documents = req.files?.documents ? req.files.documents.map(file => file.filename) : [];

    const vendor = await Vendor.create({
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
      userId,
      verifiedBy: isVerified ? req.user?.id : null,
      verifiedAt: isVerified ? new Date() : null
    });

    const vendorWithUser = await Vendor.findByPk(vendor.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json(vendorWithUser);
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