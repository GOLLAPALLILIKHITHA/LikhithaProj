const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { kycUpload } = require('../middleware/upload');

// User routes
router.post('/create-order', auth, purchaseController.createPurchaseOrder);
router.post('/verify-payment', auth, purchaseController.verifyPurchasePayment);
router.post('/furniture-rental', auth, purchaseController.requestFurnitureRental);
router.get('/my-purchases', auth, purchaseController.getUserPurchases);
router.get('/:id/details', auth, purchaseController.getPurchaseDetails);
router.put('/cancel/:id', auth, purchaseController.cancelPurchase);

// Document submission workflow
router.post('/:id/documents', auth, kycUpload.array('documents', 10), purchaseController.submitPurchaseDocuments);

// Admin routes
router.get('/', adminAuth, purchaseController.getAllPurchases);
router.get('/review-queue', adminAuth, purchaseController.getPurchasesForReview);
router.get('/stats', adminAuth, purchaseController.getPurchaseStats);
router.put('/:id', adminAuth, purchaseController.updatePurchaseStatus);
router.put('/:id/approve', adminAuth, purchaseController.approvePropertyPurchase);
router.put('/:id/verify-documents', adminAuth, purchaseController.verifyPurchaseDocuments);

module.exports = router;
