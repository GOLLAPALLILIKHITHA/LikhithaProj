const router = require('express').Router();
const { addToWishlist, getWishlist } = require('../controllers/wishlistController');
const auth = require('../middleware/auth');

router.get('/', auth, getWishlist);
router.post('/', auth, addToWishlist);

module.exports = router;

