const User = require('./User');
const KYC = require('./KYC');
const Listing = require('./Listing');
const LeisureLease = require('./LeisureLease');

// Setup model associations
User.hasOne(KYC, { foreignKey: 'userId', as: 'kyc' });
KYC.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Leisure lease associations
User.hasMany(LeisureLease, { foreignKey: 'userId', as: 'leisureLeases' });
Listing.hasMany(LeisureLease, { foreignKey: 'listingId', as: 'leisureLeases' });

module.exports = {
  User,
  KYC,
  Listing,
  LeisureLease
};
