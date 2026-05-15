const router = require('express').Router();
const { createListing, getListings, getListing, updateListing, deleteListing, getFeatured } = require('../controllers/listingController');
const adminAuth = require('../middleware/adminAuth');
const { upload, kycUpload } = require('../middleware/upload');

router.get('/', getListings);
router.get('/featured', getFeatured);
router.get('/:id', getListing);
router.post('/', adminAuth, kycUpload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 10 }
]), createListing);
router.put('/:id', adminAuth, upload.array('images', 10), updateListing);
router.delete('/:id', adminAuth, deleteListing);

module.exports = router;

