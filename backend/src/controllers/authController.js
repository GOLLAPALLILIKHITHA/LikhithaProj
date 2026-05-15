const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// In-memory store: phone → { sessionId, verified, expiresAt, data }
const pendingStore = new Map();

// ── Send OTP via 2Factor.in (voice call) ─────────────────────────────────────
const sendOtp = async (phone) => {
  const apiKey = process.env.TWOFACTOR_API_KEY;

  if (!apiKey || apiKey === 'your_2factor_api_key_here') {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n=============================`);
    console.log(`[DEV MODE] Phone: ${phone}  OTP: ${otp}`);
    console.log(`=============================\n`);
    return `dev_${otp}`;
  }

  const url = `https://2factor.in/API/V1/${apiKey}/SMS/+91${phone}/AUTOGEN`;
  const { data } = await axios.get(url);

  if (data.Status !== 'Success') {
    throw new Error(data.Details || 'Failed to send OTP.');
  }

  console.log(`[2Factor] OTP sent to ${phone} via voice call`);
  return data.Details; // session ID
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
const verifyOtp = async (sessionId, otp) => {
  if (sessionId.startsWith('dev_')) {
    return otp.trim() === sessionId.replace('dev_', '');
  }
  const apiKey = process.env.TWOFACTOR_API_KEY;
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp.trim()}`;
  const { data } = await axios.get(url);
  return data.Status === 'Success' && data.Details === 'OTP Matched';
};

// ── REGISTER: Step 1 — Send OTP ───────────────────────────────────────────────
exports.sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone)
      return res.status(400).json({ message: 'Name, email and phone are required.' });

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10)
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number.' });

    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) return res.status(400).json({ message: 'Email is already registered.' });

    const phoneExists = await User.findOne({ where: { phone: cleanPhone } });
    if (phoneExists) return res.status(400).json({ message: 'Mobile number is already registered.' });

    const sessionId = await sendOtp(cleanPhone);

    pendingStore.set(`reg_${cleanPhone}`, {
      sessionId,
      verified: false,
      expiresAt: Date.now() + 10 * 60 * 1000,
      data: { name, email, phone: cleanPhone }
    });

    res.json({
      message: 'You will receive a voice call with your OTP shortly.',
      maskedPhone: `${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)}`
    });
  } catch (err) {
    console.error('sendRegisterOtp error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to send OTP.' });
  }
};

// ── REGISTER: Step 2 — Verify OTP ────────────────────────────────────────────
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required.' });

    const cleanPhone = phone.replace(/\D/g, '');
    const record = pendingStore.get(`reg_${cleanPhone}`);

    if (!record) return res.status(400).json({ message: 'Session expired. Please request a new OTP.' });
    if (Date.now() > record.expiresAt) {
      pendingStore.delete(`reg_${cleanPhone}`);
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    const isValid = await verifyOtp(record.sessionId, otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    record.verified = true;
    pendingStore.set(`reg_${cleanPhone}`, record);

    res.json({ message: 'OTP verified. Please set your password.', verified: true });
  } catch (err) {
    console.error('verifyRegisterOtp error:', err.message);
    res.status(500).json({ message: 'OTP verification failed. Please try again.' });
  }
};

// ── REGISTER: Step 3 — Set Password & Create Account ─────────────────────────
exports.setPasswordAndRegister = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const cleanPhone = phone.replace(/\D/g, '');
    const record = pendingStore.get(`reg_${cleanPhone}`);

    if (!record) return res.status(400).json({ message: 'Session expired. Please start registration again.' });
    if (!record.verified) return res.status(400).json({ message: 'OTP not verified.' });

    const { name, email } = record.data;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone: cleanPhone });
    pendingStore.delete(`reg_${cleanPhone}`);

    res.status(201).json({
      token: generateToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('setPasswordAndRegister error:', err.message);
    res.status(500).json({ message: 'Failed to create account.' });
  }
};

// ── LOGIN: Email + Password ───────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'No account found with this email.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password.' });

    const vendor = await Vendor.findOne({
      where: { userId: user.id, isActive: true },
      attributes: ['id', 'businessName', 'vendorType', 'isVerified'],
    });

    res.json({
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        vendor: vendor ? vendor.toJSON() : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET ME ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const plain = user.toJSON();
    const vendor = await Vendor.findOne({
      where: { userId: user.id, isActive: true },
      attributes: ['id', 'businessName', 'vendorType', 'isVerified'],
    });
    res.json({ ...plain, vendor: vendor ? vendor.toJSON() : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GOOGLE OAUTH: Send Phone OTP for New Google Users ────────────────────────
exports.sendGooglePhoneOtp = async (req, res) => {
  try {
    const { phone, googleData } = req.body;
    
    if (!phone || !googleData) {
      return res.status(400).json({ message: 'Phone and Google data are required.' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number.' });
    }

    // Check if phone is already registered
    const phoneExists = await User.findOne({ where: { phone: cleanPhone } });
    if (phoneExists) {
      return res.status(400).json({ message: 'Mobile number is already registered.' });
    }

    // Send OTP
    const sessionId = await sendOtp(cleanPhone);

    // Store Google data with phone verification session
    pendingStore.set(`google_${cleanPhone}`, {
      sessionId,
      verified: false,
      expiresAt: Date.now() + 10 * 60 * 1000,
      data: {
        phone: cleanPhone,
        email: googleData.email,
        name: googleData.name,
        avatar: googleData.avatar,
        googleId: googleData.googleId
      }
    });

    res.json({
      message: 'You will receive a voice call with your OTP shortly.',
      maskedPhone: `${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)}`
    });
  } catch (err) {
    console.error('sendGooglePhoneOtp error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to send OTP.' });
  }
};

// ── GOOGLE OAUTH: Verify Phone OTP and Create Account ────────────────────────
exports.verifyGooglePhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required.' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const record = pendingStore.get(`google_${cleanPhone}`);

    if (!record) {
      return res.status(400).json({ message: 'Session expired. Please start again.' });
    }

    if (Date.now() > record.expiresAt) {
      pendingStore.delete(`google_${cleanPhone}`);
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    // Verify OTP
    const isValid = await verifyOtp(record.sessionId, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Create user account with Google data
    const { email, name, avatar, googleId } = record.data;
    
    // Check if email already exists (shouldn't happen, but double-check)
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      pendingStore.delete(`google_${cleanPhone}`);
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Create user without password (Google OAuth user)
    const user = await User.create({
      name,
      email,
      phone: cleanPhone,
      avatar,
      password: await bcrypt.hash(Math.random().toString(36), 10), // Random password (won't be used)
      isVerified: true // Google users are pre-verified
    });

    pendingStore.delete(`google_${cleanPhone}`);

    res.status(201).json({
      token: generateToken(user),
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        avatar: user.avatar 
      }
    });
  } catch (err) {
    console.error('verifyGooglePhoneOtp error:', err.message);
    res.status(500).json({ message: 'Failed to verify OTP and create account.' });
  }
};

// ── VENDOR: set password from admin invite link ───────────────────────────────
exports.vendorSetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      return res.status(400).json({ message: 'Valid token and password (at least 6 characters) are required.' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired link. Ask your administrator to resend the vendor invite.' });
    }
    if (decoded.purpose !== 'vendor_set_password' || !decoded.userId) {
      return res.status(400).json({ message: 'Invalid invitation link.' });
    }
    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    await user.update({ password: await bcrypt.hash(password, 10) });
    res.json({ message: 'Password saved. You can sign in at the vendor portal.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GOOGLE OAUTH: Login Existing User ────────────────────────────────────────
exports.googleLogin = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'No account found. Please complete phone verification.',
        requiresPhoneVerification: true 
      });
    }

    const vendor = await Vendor.findOne({
      where: { userId: user.id, isActive: true },
      attributes: ['id', 'businessName', 'vendorType', 'isVerified'],
    });

    res.json({
      token: generateToken(user),
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        vendor: vendor ? vendor.toJSON() : null,
      }
    });
  } catch (err) {
    console.error('googleLogin error:', err.message);
    res.status(500).json({ message: 'Login failed.' });
  }
};
