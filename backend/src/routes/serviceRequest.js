const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// User routes
router.post('/create', auth, serviceRequestController.createServiceRequest);
router.get('/my-requests', auth, serviceRequestController.getUserServiceRequests);

// Admin routes
router.get('/', auth, adminAuth, serviceRequestController.getAllServiceRequests);
router.get('/stats', auth, adminAuth, serviceRequestController.getServiceRequestStats);
router.post('/:id/assign', auth, adminAuth, serviceRequestController.assignWorker);
router.put('/:id/status', auth, adminAuth, serviceRequestController.updateServiceRequestStatus);

module.exports = router;
