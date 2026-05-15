const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const leisureLeaseController = require('../controllers/leisureLeaseController');

// Create leisure lease order
router.post('/create-order', auth, leisureLeaseController.createLeisureLeaseOrder);

// Verify leisure lease payment
router.post('/verify-payment', auth, leisureLeaseController.verifyLeisureLeasePayment);

// Get user's leisure leases
router.get('/my-leases', auth, leisureLeaseController.getUserLeisureLeases);

// Get property leisure lease status
router.get('/property/:listingId/status', leisureLeaseController.getPropertyLeisureStatus);

// Admin: Get all leisure leases
router.get('/admin/all', adminAuth, leisureLeaseController.getAllLeisureLeases);

module.exports = router;