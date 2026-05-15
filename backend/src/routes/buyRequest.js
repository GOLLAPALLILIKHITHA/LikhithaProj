const express = require('express');
const router = express.Router();
const buyRequestController = require('../controllers/buyRequestController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { kycUpload } = require('../middleware/upload');

// User routes
router.post('/create', auth, buyRequestController.createBuyRequest);
router.get('/my-requests', auth, buyRequestController.getUserBuyRequests);
router.get('/:id/details', auth, buyRequestController.getBuyRequestDetails);

// Admin routes
router.get('/', adminAuth, buyRequestController.getAllBuyRequests);
router.get('/stats', adminAuth, buyRequestController.getBuyRequestStats);
router.put('/:id/status', adminAuth, buyRequestController.updateBuyRequestStatus);
router.post('/:id/agreement', adminAuth, kycUpload.array('agreements', 5), buyRequestController.uploadAgreementDocuments);

module.exports = router;