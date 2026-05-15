const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  listingId: { type: DataTypes.INTEGER, allowNull: false },
});

Wishlist.belongsTo(User, { foreignKey: 'userId' });
Wishlist.belongsTo(Listing, { foreignKey: 'listingId' });

module.exports = Wishlist;

