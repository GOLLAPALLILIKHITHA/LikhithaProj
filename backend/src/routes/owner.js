const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getOwnerDashboard,
  getOwnerProperties,
  getOwnerPurchases,
  getOwnerPropertyPurchases,
  getOwnerRentals,
  getOwnerPaymentHistory,
  getOwnerAnalytics,
  getOwnerRentTracking,
  getOwnerPurchaseTracking
} = require('../controllers/ownerController');

/**
 * OWNER DASHBOARD ROUTES
 * All routes require authentication (auth middleware)
 * These routes are for property owners to manage their listings and track earnings
 */

// Dashboard overview
router.get('/dashboard', auth, getOwnerDashboard);

// Properties management with sections (rent/buy)
router.get('/properties', auth, getOwnerProperties);

// Combined property purchases and rentals (for new dashboard)
router.get('/property-purchases', auth, getOwnerPropertyPurchases);

// Detailed tracking endpoints
router.get('/rent-tracking', auth, getOwnerRentTracking);
router.get('/purchase-tracking', auth, getOwnerPurchaseTracking);

// Legacy endpoints (kept for backward compatibility)
router.get('/purchases', auth, getOwnerPurchases);
router.get('/rentals', auth, getOwnerRentals);

// Payment history
router.get('/payments', auth, getOwnerPaymentHistory);

// Analytics
router.get('/analytics', auth, getOwnerAnalytics);

module.exports = router;