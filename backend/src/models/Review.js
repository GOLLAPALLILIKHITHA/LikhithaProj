const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  listingId: { type: DataTypes.INTEGER, allowNull: false },
  transactionType: { 
    type: DataTypes.ENUM('purchase', 'rental', 'service'), 
    allowNull: true,
    comment: 'Type of transaction that enabled this review'
  },
  isVerified: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true,
    comment: 'Whether this review is from a verified transaction'
  }
});

Review.belongsTo(User, { foreignKey: 'userId', as: 'reviewer' });
Review.belongsTo(Listing, { foreignKey: 'listingId' });

module.exports = Review;

