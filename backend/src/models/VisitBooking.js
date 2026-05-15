const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const VisitBooking = sequelize.define('VisitBooking', {
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
  visitDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false // Morning, Afternoon, Evening, Night
  },
  specificTime: {
    type: DataTypes.STRING,
    allowNull: true // 09:00 AM, 10:30 AM, etc.
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  userPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userEmail: {
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
  tableName: 'visit_bookings'
});

// Set up associations
VisitBooking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
VisitBooking.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });
User.hasMany(VisitBooking, { foreignKey: 'userId' });
Listing.hasMany(VisitBooking, { foreignKey: 'listingId' });

module.exports = VisitBooking;
