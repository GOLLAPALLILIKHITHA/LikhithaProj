const express = require('express');
const router = express.Router();
const visitBookingController = require('../controllers/visitBookingController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// User routes
router.post('/', auth, visitBookingController.createBooking);
router.get('/my-bookings', auth, visitBookingController.getUserBookings);
router.delete('/:id', auth, visitBookingController.deleteBooking);

// Admin routes
router.get('/', adminAuth, visitBookingController.getAllBookings);
router.get('/stats', adminAuth, visitBookingController.getBookingStats);
router.put('/:id', adminAuth, visitBookingController.updateBookingStatus);

module.exports = router;
