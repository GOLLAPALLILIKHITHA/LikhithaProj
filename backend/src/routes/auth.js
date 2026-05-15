const router = require('express').Router();
const {
  sendRegisterOtp,
  verifyRegisterOtp,
  setPasswordAndRegister,
  login,
  getMe,
  sendGooglePhoneOtp,
  verifyGooglePhoneOtp,
  googleLogin,
  vendorSetPassword,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// Registration (3 steps)
router.post('/send-register-otp', sendRegisterOtp);
router.post('/verify-register-otp', verifyRegisterOtp);
router.post('/set-password', setPasswordAndRegister);
router.post('/vendor-set-password', vendorSetPassword);

// Login (email + password)
router.post('/login', login);

// Google OAuth
router.post('/google/send-phone-otp', sendGooglePhoneOtp);
router.post('/google/verify-phone-otp', verifyGooglePhoneOtp);
router.post('/google/login', googleLogin);

// Get current user
router.get('/me', auth, getMe);

module.exports = router;
