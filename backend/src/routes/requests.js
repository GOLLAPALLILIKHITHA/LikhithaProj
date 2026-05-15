const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Admin routes - get all requests consolidated
router.get('/all', auth, adminAuth, requestController.getAllRequests);
router.get('/stats', auth, adminAuth, requestController.getRequestStats);

module.exports = router;
