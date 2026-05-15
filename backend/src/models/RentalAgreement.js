const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const RentalAgreement = sequelize.define('RentalAgreement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Listings',
      key: 'id'
    }
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  monthlyRent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  agreementStartDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  agreementEndDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  rentDueDate: {
    type: DataTypes.INTEGER, // Day of month (1-31)
    allowNull: false,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('active', 'terminated', 'expired'),
    defaultValue: 'active'
  },
  agreementDocument: {
    type: DataTypes.STRING, // URL to agreement document
    allowNull: true
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastRentPaidDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextRentDueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  overdueMonths: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  warningsSent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  vacateNoticeSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  vacateNoticeDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'rental_agreements'
});

// Associations
RentalAgreement.belongsTo(User, { foreignKey: 'tenantId', as: 'tenant' });
RentalAgreement.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
RentalAgreement.belongsTo(Listing, { foreignKey: 'propertyId', as: 'property' });

User.hasMany(RentalAgreement, { foreignKey: 'tenantId', as: 'tenantAgreements' });
User.hasMany(RentalAgreement, { foreignKey: 'ownerId', as: 'ownerAgreements' });
Listing.hasMany(RentalAgreement, { foreignKey: 'propertyId', as: 'rentalAgreements' });

module.exports = RentalAgreement;