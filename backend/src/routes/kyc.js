const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { kycUpload } = require('../middleware/upload');

const kycFields = kycUpload.fields([
  { name: 'aadhaar',     maxCount: 1 },
  { name: 'pan',         maxCount: 1 },
  { name: 'jobId',       maxCount: 1 },
  { name: 'salarySlip',  maxCount: 1 },
  { name: 'businessReg', maxCount: 1 },
  { name: 'gstCert',     maxCount: 1 },
  { name: 'collegeId',   maxCount: 1 },
  { name: 'bonafide',    maxCount: 1 },
  { name: 'workProof',   maxCount: 1 },
  { name: 'otherDoc',    maxCount: 1 },
]);

router.get('/file/:filename', (req, res, next) => {
  if (req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
}, adminAuth, kycController.serveFile);

router.get('/my', auth, kycController.getMyKYC);
router.post('/submit', auth, kycFields, kycController.submitKYC);
router.get('/', adminAuth, kycController.getAllKYC);
router.put('/:id', adminAuth, kycController.updateKYCStatus);

module.exports = router;
