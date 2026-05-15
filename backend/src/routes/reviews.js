const router = require('express').Router();
const { addReview, getReviews, canUserReview } = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.get('/:listingId', getReviews);
router.get('/can-review/:listingId', auth, canUserReview);
router.post('/', auth, addReview);

module.exports = router;

