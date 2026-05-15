const router = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const { upload } = require('../middleware/upload');
const {
  adminLogin, // Add admin login
  getStats, getAnalytics,
  getUsers, updateUser, deleteUser, createUser,
  getListings, updateListing, deleteListing, createListing, bulkUpdateListings, bulkDeleteListings,
  getReviews, deleteReview,
  getMessages, sendMessage, deleteMessage, getConversations, getUserMessages,
  getSystemSettings, updateSystemSettings,
  getSubscriptions, getSubscriptionAnalytics, updateSubscription, createSubscription,
  getPaymentHistory,
  // Owner & Document Management
  getOwnerDetails, updateOwnerDetails, getCommissionAnalytics, 
  bulkUpdateCommission, getDocumentStatus,
  // Vendor Management
  getVendors, getVendorStats, createVendor, updateVendor, deleteVendor,
  toggleVendorStatus, toggleVendorVerification
} = require('../controllers/adminController');
const {
  getOwnerAccounts, setOwnerPassword, getOwnerAccountDetails, 
  toggleOwnerVerification, sendOwnerCredentials
} = require('../controllers/ownerManagementController');

// Admin login (no auth required)
router.post('/login', adminLogin);

router.get('/stats', adminAuth, getStats);
router.get('/analytics', adminAuth, getAnalytics);

router.get('/users', adminAuth, getUsers);
router.post('/users', adminAuth, createUser);
router.put('/users/:id', adminAuth, updateUser);
router.delete('/users/:id', adminAuth, deleteUser);

router.get('/listings', adminAuth, getListings);
router.post('/listings', adminAuth, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 10 },
  { name: 'agreementDocument', maxCount: 1 }
]), createListing);
router.put('/listings/:id', adminAuth, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 10 }
]), updateListing);
router.delete('/listings/:id', adminAuth, deleteListing);
router.put('/listings/bulk-update', adminAuth, bulkUpdateListings);
router.delete('/listings/bulk-delete', adminAuth, bulkDeleteListings);

router.get('/reviews', adminAuth, getReviews);
router.delete('/reviews/:id', adminAuth, deleteReview);

router.get('/messages', adminAuth, getMessages);
router.post('/messages', adminAuth, sendMessage);
router.delete('/messages/:id', adminAuth, deleteMessage);
router.get('/conversations', adminAuth, getConversations);
router.get('/messages/user/:userId', adminAuth, getUserMessages);

router.get('/settings', adminAuth, getSystemSettings);
router.put('/settings', adminAuth, updateSystemSettings);

// Subscription management
router.get('/subscriptions', adminAuth, getSubscriptions);
router.get('/subscriptions/analytics', adminAuth, getSubscriptionAnalytics);
router.post('/subscriptions', adminAuth, createSubscription);
router.put('/subscriptions/:id', adminAuth, updateSubscription);

// Payment management
router.get('/payments', adminAuth, getPaymentHistory);

// Owner & Document Management
router.get('/owners', adminAuth, getOwnerDetails);
router.get('/owners/:id', adminAuth, getOwnerDetails);
router.put('/owners/:id', adminAuth, upload.fields([
  { name: 'ownerDocuments', maxCount: 5 },
  { name: 'thalukaDocuments', maxCount: 5 },
  { name: 'agreementDocument', maxCount: 1 }
]), updateOwnerDetails);
router.put('/owners/:id/commission', adminAuth, updateOwnerDetails);
router.post('/owners/:id/upload-document', adminAuth, upload.single('document'), updateOwnerDetails);
router.get('/commission/analytics', adminAuth, getCommissionAnalytics);
router.put('/commission/bulk-update', adminAuth, bulkUpdateCommission);
router.get('/documents/status', adminAuth, getDocumentStatus);

// KYC management
const kycController = require('../controllers/kycController');
router.get('/kyc', adminAuth, kycController.getAllKYC);
router.put('/kyc/:id', adminAuth, kycController.updateKYCStatus);

// Vendor Management
router.get('/vendors', adminAuth, getVendors);
router.get('/vendors/stats', adminAuth, getVendorStats);
router.post('/vendors', adminAuth, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 10 }
]), createVendor);
router.put('/vendors/:id', adminAuth, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 10 }
]), updateVendor);
router.delete('/vendors/:id', adminAuth, deleteVendor);
router.patch('/vendors/:id/toggle-status', adminAuth, toggleVendorStatus);
router.patch('/vendors/:id/toggle-verification', adminAuth, toggleVendorVerification);

// Owner Management Routes
router.get('/owner-accounts', adminAuth, getOwnerAccounts);
router.get('/owner-accounts/:id', adminAuth, getOwnerAccountDetails);
router.put('/owner-accounts/:id/password', adminAuth, setOwnerPassword);
router.put('/owner-accounts/:id/toggle-verification', adminAuth, toggleOwnerVerification);
router.post('/owner-accounts/:id/send-credentials', adminAuth, sendOwnerCredentials);

module.exports = router;

