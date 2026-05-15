const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const KYC = sequelize.define('KYC', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },

  // Occupation
  occupation: {
    type: DataTypes.ENUM('salaried', 'business', 'student', 'self_employed', 'other'),
    allowNull: true
  },

  // Aadhaar (mandatory for all)
  aadhaarNumber: { type: DataTypes.STRING(12), allowNull: true },
  aadhaarUrl: { type: DataTypes.STRING, allowNull: true },

  // Common
  panUrl: { type: DataTypes.STRING, allowNull: true },

  // Salaried
  jobIdUrl: { type: DataTypes.STRING, allowNull: true },
  salarySlipUrl: { type: DataTypes.STRING, allowNull: true },

  // Business
  businessRegUrl: { type: DataTypes.STRING, allowNull: true },
  gstCertUrl: { type: DataTypes.STRING, allowNull: true },

  // Student
  collegeIdUrl: { type: DataTypes.STRING, allowNull: true },
  bonafideUrl: { type: DataTypes.STRING, allowNull: true },

  // Self Employed
  workProofUrl: { type: DataTypes.STRING, allowNull: true },

  // Other
  otherDocUrl: { type: DataTypes.STRING, allowNull: true },
  otherDocName: { type: DataTypes.STRING, allowNull: true },

  // Status
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  adminNotes: { type: DataTypes.TEXT, allowNull: true },
  verifiedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'kyc_documents',
  timestamps: true
});

// Associations are defined in associations.js
module.exports = KYC;
