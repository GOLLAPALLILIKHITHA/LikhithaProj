const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Vendor = sequelize.define('Vendor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  
  // Basic Info
  businessName: { type: DataTypes.STRING, allowNull: false },
  contactPerson: { type: DataTypes.STRING, allowNull: false },
  contactPhone: { type: DataTypes.STRING, allowNull: false },
  contactEmail: { type: DataTypes.STRING, allowNull: false },
  whatsappNumber: { type: DataTypes.STRING },
  businessAddress: { type: DataTypes.TEXT },
  
  // Vendor Type
  vendorType: {
    type: DataTypes.ENUM('building_materials', 'home_services'),
    allowNull: false
  },
  
  // Service/Material Categories
  categories: { type: DataTypes.JSON, defaultValue: [] }, // Array of service/material types
  
  // Business Details
  description: { type: DataTypes.TEXT },
  experience: { type: DataTypes.STRING },
  serviceArea: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING, allowNull: false },
  locality: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING },
  pincode: { type: DataTypes.STRING },
  
  // Pricing
  minPrice: { type: DataTypes.DECIMAL(15, 2) },
  maxPrice: { type: DataTypes.DECIMAL(15, 2) },
  priceType: { 
    type: DataTypes.ENUM('hourly', 'project_based', 'per_unit', 'per_kg', 'per_sqft', 'fixed'), 
    defaultValue: 'project_based' 
  },
  
  // Professional Info
  certifications: { type: DataTypes.TEXT },
  languages: { type: DataTypes.STRING },
  availability: { type: DataTypes.STRING },
  
  // Media
  images: { type: DataTypes.JSON, defaultValue: [] },
  documents: { type: DataTypes.JSON, defaultValue: [] }, // Business licenses, certifications
  
  // Status
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  // Admin fields
  adminNotes: { type: DataTypes.TEXT },
  verifiedAt: { type: DataTypes.DATE },
  verifiedBy: { type: DataTypes.INTEGER }, // Admin user ID
  
  userId: { type: DataTypes.INTEGER, allowNull: false }
});

// Associations
Vendor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Vendor, { foreignKey: 'userId', as: 'vendors' });

module.exports = Vendor;