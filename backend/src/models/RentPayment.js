const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const RentalAgreement = require('./RentalAgreement');

const RentPayment = sequelize.define('RentPayment', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  forMonth: {
    type: DataTypes.STRING, // Format: "YYYY-MM"
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'upi', 'cheque', 'online'),
    defaultValue: 'online'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'completed'
  },
  receiptUrl: {
    type: DataTypes.STRING, // URL to payment receipt
    allowNull: true
  },
  lateFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paidBy: {
    type: DataTypes.ENUM('tenant', 'owner', 'admin'),
    defaultValue: 'tenant'
  }
}, {
  timestamps: true,
  tableName: 'rent_payments'
});

// Associations
RentPayment.belongsTo(RentalAgreement, { foreignKey: 'rentalAgreementId', as: 'agreement' });
RentPayment.belongsTo(User, { foreignKey: 'tenantId', as: 'tenant' });

RentalAgreement.hasMany(RentPayment, { foreignKey: 'rentalAgreementId', as: 'payments' });
User.hasMany(RentPayment, { foreignKey: 'tenantId', as: 'rentPayments' });

module.exports = RentPayment;