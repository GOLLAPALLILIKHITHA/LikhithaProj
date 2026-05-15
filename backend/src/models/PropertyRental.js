const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const PropertyRental = sequelize.define('PropertyRental', {
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
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'End date (set when tenant gives vacate notice)'
  },
  monthlyRent: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  advancePayment: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: '2 months advance payment'
  },
  firstMonthRent: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'First month rent'
  },
  initialPayment: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Total upfront payment (advance + first month)'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Total amount for the rental contract'
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Security deposit (if applicable)'
  },
  // Prepaid rental system
  paidUntilDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date until which rent is paid (prepaid system)'
  },
  nextPaymentDue: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Next payment due date (same date every month)'
  },
  paymentDayOfMonth: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Day of month when rent is due (e.g., 4 for 4th of every month)'
  },
  lastPaymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Last payment received date'
  },
  monthlyPaymentStatus: {
    type: DataTypes.ENUM('current', 'due', 'overdue', 'completed'),
    defaultValue: 'current',
    comment: 'Current monthly payment status'
  },
  // Simple vacate system (no payment needed if within paid period)
  vacateRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether tenant has requested to vacate'
  },
  vacateDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date when tenant will vacate'
  },
  vacateReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for vacating (optional)'
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
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
  tenantPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tenantEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'property_rentals'
});

// Set up associations
PropertyRental.belongsTo(User, { foreignKey: 'userId', as: 'tenant' });
PropertyRental.belongsTo(Listing, { foreignKey: 'listingId', as: 'property' });
User.hasMany(PropertyRental, { foreignKey: 'userId' });
Listing.hasMany(PropertyRental, { foreignKey: 'listingId' });

module.exports = PropertyRental;
