const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PropertyRental = require('./PropertyRental');
const User = require('./User');

const MonthlyPayment = sequelize.define('MonthlyPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rentalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'property_rentals',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  monthNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Month number in the rental contract (1, 2, 3, etc.)'
  },
  monthYear: {
    type: DataTypes.STRING(7), // Format: 2024-01
    allowNull: false,
    comment: 'Month and year for this payment (YYYY-MM)'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Monthly rent amount'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Payment due date'
  },
  paidDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date when payment was made'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'waived'),
    defaultValue: 'pending',
    comment: 'Payment status'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Payment method used'
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
  lateFee: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    comment: 'Late payment fee if applicable'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Total amount including late fees'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Payment notes or remarks'
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether payment reminder notification was sent'
  },
  reminderCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of reminders sent'
  }
}, {
  timestamps: true,
  tableName: 'monthly_payments',
  indexes: [
    {
      unique: true,
      fields: ['rentalId', 'monthNumber']
    },
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['dueDate', 'status']
    }
  ]
});

// Set up associations
MonthlyPayment.belongsTo(PropertyRental, { foreignKey: 'rentalId', as: 'rental' });
MonthlyPayment.belongsTo(User, { foreignKey: 'userId', as: 'tenant' });
PropertyRental.hasMany(MonthlyPayment, { foreignKey: 'rentalId', as: 'monthlyPayments' });
User.hasMany(MonthlyPayment, { foreignKey: 'userId', as: 'monthlyPayments' });

module.exports = MonthlyPayment;