const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  receiverId: { type: DataTypes.INTEGER, allowNull: false },
  listingId: { type: DataTypes.INTEGER },
  message: { type: DataTypes.TEXT, allowNull: false }, // Keep as 'message'
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
});

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Listing, { foreignKey: 'listingId' });

module.exports = Message;

