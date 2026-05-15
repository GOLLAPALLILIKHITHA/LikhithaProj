const Wishlist = require('../models/Wishlist');
const Listing = require('../models/Listing');
const User = require('../models/User');

exports.addToWishlist = async (req, res) => {
  try {
    const { listingId } = req.body;
    const existing = await Wishlist.findOne({ where: { userId: req.user.id, listingId } });
    if (existing) {
      await existing.destroy();
      return res.json({ message: 'Removed from wishlist', saved: false });
    }
    await Wishlist.create({ userId: req.user.id, listingId });
    res.json({ message: 'Added to wishlist', saved: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Listing, include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'avatar', 'isVerified'] }] }],
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

