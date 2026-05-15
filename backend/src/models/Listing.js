const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Vendor = require('./Vendor');

const Listing = sequelize.define('Listing', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: {
    type: DataTypes.ENUM('property_sell', 'property_rent', 'furniture', 'services', 'materials', 'vehicles'),
    allowNull: false,
  },
  subCategory: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(15, 2) },
  priceType: { type: DataTypes.ENUM('fixed', 'negotiable', 'per_month', 'per_sqft', 'per_unit', 'per_kg', 'hourly', 'project_based'), defaultValue: 'fixed' },
  location: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING },
  pincode: { type: DataTypes.STRING },
  images: { type: DataTypes.JSON, defaultValue: [] },
  
  // Property specific
  bedrooms: { type: DataTypes.INTEGER },
  bathrooms: { type: DataTypes.INTEGER },
  area: { type: DataTypes.DECIMAL(10, 2) },
  areaUnit: { type: DataTypes.ENUM('sqft', 'sqmt', 'acre', 'bigha'), defaultValue: 'sqft' },
  propertyAge: { type: DataTypes.STRING },
  facing: { type: DataTypes.STRING },
  floor: { type: DataTypes.INTEGER },
  totalFloors: { type: DataTypes.INTEGER },
  parking: { type: DataTypes.STRING },
  furnishing: { type: DataTypes.STRING },
  
  // Time slots for property rentals (JSON array of available time slots)
  availableTimeSlots: { type: DataTypes.JSON, defaultValue: [] },
  
  // Package for services (Monthly, Weekly, Yearly)
  servicePackage: { type: DataTypes.STRING },
  
  // Materials/Furniture/Electronics/Vehicles specific
  brand: { type: DataTypes.STRING },
  model: { type: DataTypes.STRING },
  condition: { type: DataTypes.ENUM('new', 'like_new', 'good', 'fair', 'needs_repair'), defaultValue: 'new' },
  warranty: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  unit: { type: DataTypes.STRING },
  year: { type: DataTypes.STRING },
  materialType: { type: DataTypes.STRING }, // Quality grade for building materials
  
  // Leisure property feature
  isLeisure: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false,
    comment: 'Whether this rental property can be leased for leisure purposes (full year commitment)'
  },
  
  // Services specific
  serviceType: { type: DataTypes.STRING },
  experience: { type: DataTypes.STRING },
  availability: { type: DataTypes.STRING },
  serviceArea: { type: DataTypes.STRING },
  certifications: { type: DataTypes.TEXT },
  languages: { type: DataTypes.STRING },
  minPrice: { type: DataTypes.DECIMAL(15, 2) },
  maxPrice: { type: DataTypes.DECIMAL(15, 2) },
  
  // Service provider contact details
  contactPerson: { type: DataTypes.STRING },
  contactPhone: { type: DataTypes.STRING },
  contactEmail: { type: DataTypes.STRING },
  whatsappNumber: { type: DataTypes.STRING },
  businessName: { type: DataTypes.STRING },
  businessAddress: { type: DataTypes.TEXT },
  
  // Owner documents and agreements
  ownerDocuments: { type: DataTypes.JSON, defaultValue: [] }, // Array of document URLs
  thalukaDocuments: { type: DataTypes.JSON, defaultValue: [] }, // Property papers
  agreementDocument: { type: DataTypes.STRING }, // Agreement document URL
  commissionPercentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 10.00 }, // Commission percentage
  ownerBankDetails: { type: DataTypes.JSON, defaultValue: {} }, // Bank account details
  ownerAadhaar: { type: DataTypes.STRING }, // Owner Aadhaar number
  ownerPan: { type: DataTypes.STRING }, // Owner PAN number
  
  // Auto-created owner account tracking
  ownerAccountId: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'Auto-created owner account based on contactEmail'
  },
  
  // Vendor assignment
  vendorId: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: 'Vendors',
      key: 'id'
    },
    comment: 'Assigned vendor for this listing'
  },
  
  amenities: { type: DataTypes.JSON, defaultValue: [] },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('active', 'sold', 'rented', 'inactive'), defaultValue: 'active' },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  userId: { type: DataTypes.INTEGER, allowNull: false },
});

Listing.belongsTo(User, { foreignKey: 'userId', as: 'seller' });
User.hasMany(Listing, { foreignKey: 'userId' });

// Vendor association
Listing.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'assignedVendor' });
Vendor.hasMany(Listing, { foreignKey: 'vendorId', as: 'assignedListings' });

module.exports = Listing;

