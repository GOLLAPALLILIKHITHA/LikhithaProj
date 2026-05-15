const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Package pricing
const PACKAGE_PRICES = {
  'OneTime': 14900,  // ₹149 in paise (one-time visit)
  'Weekly':  29900,  // ₹299 in paise
  'Monthly': 99900,  // ₹999 in paise
  'Yearly':  999900  // ₹9,999 in paise
};

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { packageType } = req.body;
    const userId = req.user.id;

    if (!['OneTime', 'Monthly', 'Weekly', 'Yearly'].includes(packageType)) {
      return res.status(400).json({ message: 'Invalid package type' });
    }

    const amount = PACKAGE_PRICES[packageType];

    const options = {
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        packageType: packageType
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Verify payment and create subscription
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      packageType
    } = req.body;

    const userId = req.user.id;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // OneTime payment — just confirm, no subscription created
    if (packageType === 'OneTime') {
      return res.json({
        success: true,
        message: 'One-time payment verified. A service professional will contact you shortly.',
        oneTime: true
      });
    }

    // Calculate end date based on package type
    const startDate = new Date();
    let endDate = new Date();
    
    switch(packageType) {
      case 'Weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'Monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'Yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Create subscription
    const subscription = await Subscription.create({
      userId: userId,
      packageType: packageType,
      amount: PACKAGE_PRICES[packageType],
      startDate: startDate,
      endDate: endDate,
      status: 'active',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        id: subscription.id,
        packageType: subscription.packageType,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

// Get user subscriptions
exports.getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await Subscription.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']]
    });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch subscriptions', error: error.message });
  }
};

// Get active subscription
exports.getActiveSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      where: {
        userId: userId,
        status: 'active'
      },
      order: [['createdAt', 'DESC']]
    });

    if (!subscription) {
      return res.json({ hasActiveSubscription: false });
    }

    // Check if subscription is expired
    if (new Date() > new Date(subscription.endDate)) {
      await subscription.update({ status: 'expired' });
      return res.json({ hasActiveSubscription: false });
    }

    res.json({
      hasActiveSubscription: true,
      subscription: {
        id: subscription.id,
        packageType: subscription.packageType,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('Get active subscription error:', error);
    res.status(500).json({ message: 'Failed to fetch active subscription', error: error.message });
  }
};
