const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const RentalAgreement = require('./RentalAgreement');

const RentNotification = sequelize.define('RentNotification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rentalAgreementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rental_agreements',
      key: 'id'
    }
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('rent_due', 'rent_overdue', 'late_payment_warning', 'vacate_notice', 'payment_reminder'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  forMonth: {
    type: DataTypes.STRING, // Format: "YYYY-MM"
    allowNull: true
  },
  dueAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  overdueMonths: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('sent', 'read', 'acknowledged'),
    defaultValue: 'sent'
  },
  sentVia: {
    type: DataTypes.JSON, // ['email', 'sms', 'whatsapp', 'in_app']
    defaultValue: ['in_app']
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  acknowledgedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'rent_notifications'
});

// Associations
RentNotification.belongsTo(RentalAgreement, { foreignKey: 'rentalAgreementId', as: 'agreement' });
RentNotification.belongsTo(User, { foreignKey: 'tenantId', as: 'tenant' });

RentalAgreement.hasMany(RentNotification, { foreignKey: 'rentalAgreementId', as: 'notifications' });
User.hasMany(RentNotification, { foreignKey: 'tenantId', as: 'rentNotifications' });

module.exports = RentNotification;