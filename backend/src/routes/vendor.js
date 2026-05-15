const router = require('express').Router();
const auth = require('../middleware/auth');
const vendorAuth = require('../middleware/vendorAuth');
const vendorPortalController = require('../controllers/vendorPortalController');

router.get('/me', auth, vendorAuth, vendorPortalController.getVendorMe);
router.get('/assignments', auth, vendorAuth, vendorPortalController.getAssignments);
router.get('/assignments/:id', auth, vendorAuth, vendorPortalController.getAssignmentById);
router.patch('/assignments/:id/complete', auth, vendorAuth, vendorPortalController.markAssignmentCompleted);
router.get('/listings', auth, vendorAuth, vendorPortalController.getAssignedListings);

module.exports = router;
