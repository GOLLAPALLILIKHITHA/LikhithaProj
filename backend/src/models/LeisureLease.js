const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const LeisureLease = sequelize.define('LeisureLease', {
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
  leaseYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Year for which the leisure lease is taken (e.g., 2024, 2025)'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Start date of the leisure lease'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'End date of the leisure lease (typically 1 year from start)'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Total amount paid for the full year lease'
  },
  monthlyEquivalent: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Monthly rent equivalent (for reference)'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Razorpay payment ID'
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Razorpay order ID'
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes or terms for the leisure lease'
  }
}, {
  tableName: 'LeisureLeases',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['listingId', 'leaseYear'],
      name: 'unique_property_year_lease'
    }
  ]
});

// Associations
LeisureLease.belongsTo(User, { foreignKey: 'userId', as: 'tenant' });
LeisureLease.belongsTo(Listing, { foreignKey: 'listingId', as: 'property' });

module.exports = LeisureLease;