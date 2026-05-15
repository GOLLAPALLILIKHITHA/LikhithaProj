const router = require('express').Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { upload } = require('../middleware/upload');

const {
  createRentalAgreement,
  getAllRentalAgreements,
  recordRentPayment,
  getTenantRentals,
  getRentalPaymentHistory,
  getRentalNotifications
} = require('../controllers/rentalController');

// Tenant routes
router.get('/my-rentals', auth, getTenantRentals);
router.get('/notifications', auth, getRentalNotifications);

// Admin routes
router.post('/agreements', adminAuth, createRentalAgreement);
router.get('/agreements', adminAuth, getAllRentalAgreements);
router.post('/payments', adminAuth, recordRentPayment);
router.get('/payments/:agreementId', adminAuth, getRentalPaymentHistory);

module.exports = router;