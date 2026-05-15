const Vendor = require('../models/Vendor');

/**
 * After `auth` — attaches `req.vendor` for the logged-in user's active vendor profile.
 */
async function vendorAuth(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const vendor = await Vendor.findOne({
      where: { userId: req.user.id, isActive: true },
    });
    if (!vendor) {
      return res.status(403).json({ message: 'No active vendor profile is linked to this account.' });
    }
    req.vendor = vendor;
    next();
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = vendorAuth;
