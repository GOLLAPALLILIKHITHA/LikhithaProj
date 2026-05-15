const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  listingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Listings',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.ENUM('property_sell', 'furniture', 'materials', 'electronics', 'vehicles'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  unitPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'admin_review', 'approved', 'documents_required', 'documents_submitted', 'documents_verified', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'rejected'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razorpaySignature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Delivery details
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryCity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryState: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryPincode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Buyer details
  buyerName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  buyerEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  buyerPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Additional info
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Furniture rental specific
  rentalType: {
    type: DataTypes.ENUM('buy', 'rent'),
    defaultValue: 'buy'
  },
  purpose: {
    type: DataTypes.ENUM('home', 'office', 'other'),
    allowNull: true
  },
  rentalDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Rental duration in months'
  },
  // For property purchases
  registrationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  possessionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  
  // Property Purchase Document Workflow
  purchaseDocuments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of buyer document URLs'
  },
  documentStatus: {
    type: DataTypes.ENUM('not_required', 'pending', 'submitted', 'verified', 'rejected'),
    defaultValue: 'not_required',
    comment: 'Document submission status for property purchases'
  },
  documentNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes for document verification'
  },
  documentSubmittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  documentVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Enhanced status for property purchase workflow
  // pending → admin_review → approved → documents_required → documents_submitted → documents_verified → completed
  
  // Tracking
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estimatedDelivery: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // Furniture rental vacate functionality
  vacateRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether user has requested to vacate/return furniture'
  },
  vacateDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Requested vacate/return date'
  },
  vacateReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for vacate/return request'
  },
  rentalStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Start date of furniture rental'
  },
  rentalEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'End date of furniture rental'
  }
}, {
  timestamps: true,
  tableName: 'purchases'
});

// Set up associations
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'buyer' });
Purchase.belongsTo(Listing, { foreignKey: 'listingId', as: 'item' });
User.hasMany(Purchase, { foreignKey: 'userId' });
Listing.hasMany(Purchase, { foreignKey: 'listingId' });

module.exports = Purchase;
