const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const BuyRequest = sequelize.define('BuyRequest', {
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
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending'
  },
  buyerMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Message from buyer to admin'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes for the request'
  },
  agreementDocuments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of agreement document URLs uploaded by admin'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'buy_requests'
});

// Set up associations
BuyRequest.belongsTo(User, { foreignKey: 'userId', as: 'buyer' });
BuyRequest.belongsTo(Listing, { foreignKey: 'listingId', as: 'property' });
User.hasMany(BuyRequest, { foreignKey: 'userId' });
Listing.hasMany(BuyRequest, { foreignKey: 'listingId' });

module.exports = BuyRequest;