const express = require('express');
const router = express.Router();
const propertyRentalController = require('../controllers/propertyRentalController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// User routes
router.post('/create-order', auth, propertyRentalController.createRentalOrder);
router.post('/verify-payment', auth, propertyRentalController.verifyRentalPayment);
router.get('/my-rentals', auth, propertyRentalController.getUserRentals);

// Monthly payment routes
router.post('/monthly-payment/create-order', auth, propertyRentalController.createMonthlyPaymentOrder);
router.post('/monthly-payment/verify-payment', auth, propertyRentalController.verifyMonthlyPayment);
router.get('/pending-payments', auth, propertyRentalController.getPendingMonthlyPayments);

// Vacate property routes
router.post('/request-vacate', auth, propertyRentalController.requestVacate);

// Admin routes
router.get('/', adminAuth, propertyRentalController.getAllRentals);
router.get('/stats', adminAuth, propertyRentalController.getRentalStats);
router.put('/:id', adminAuth, propertyRentalController.updateRentalStatus);
router.post('/:id/remove-from-rental', adminAuth, propertyRentalController.removeFromRental);
router.post('/:id/complete-vacate', adminAuth, propertyRentalController.completeVacate);

module.exports = router;
