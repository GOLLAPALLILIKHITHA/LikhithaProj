const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// All routes require authentication
router.post('/create-order', auth, paymentController.createOrder);
router.post('/verify-payment', auth, paymentController.verifyPayment);
router.get('/subscriptions', auth, paymentController.getUserSubscriptions);
router.get('/active-subscription', auth, paymentController.getActiveSubscription);

module.exports = router;
