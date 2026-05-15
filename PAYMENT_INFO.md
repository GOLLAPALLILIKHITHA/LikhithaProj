# 💳 Payment Integration Guide

## 🔑 Current Status: TEST MODE

### What's Available in TEST Mode:
- ✅ **Card Payments** (Test cards only)
- ✅ **Payment flow testing**
- ✅ **Subscription creation**
- ❌ **UPI/QR Code** (Not available in test mode)
- ❌ **Net Banking** (Not available in test mode)
- ❌ **Wallets** (Not available in test mode)

---

## 🧪 Testing with Test Cards

### Test Card Details:
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date (e.g., 12/25)
Name: Any name
```

### Other Test Cards:
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **3D Secure:** 4000 0027 6000 3184

---

## 🚀 Going LIVE (For Production)

### Step 1: Complete KYC on Razorpay
1. Go to https://dashboard.razorpay.com
2. Complete business verification
3. Add bank account details
4. Submit required documents

### Step 2: Get LIVE API Keys
1. Go to Settings → API Keys
2. Generate LIVE keys
3. Copy Key ID and Key Secret

### Step 3: Update .env File
```env
# Replace TEST keys with LIVE keys
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_here
```

### Step 4: Restart Backend
```bash
cd backend
npm start
```

---

## ✅ What Works in LIVE Mode:

### All Payment Methods:
- 💳 **Credit/Debit Cards** (All banks)
- 📱 **UPI** (Google Pay, PhonePe, Paytm, BHIM, etc.)
- 📷 **QR Code** (Scan with any UPI app)
- 🏦 **Net Banking** (All major banks)
- 👛 **Wallets** (Paytm, PhonePe, Mobikwik, etc.)
- 💰 **EMI Options** (For eligible cards)

### UPI/QR Code Features:
- Automatic QR code generation
- Support for all UPI apps
- Instant payment confirmation
- Lower transaction fees (compared to cards)

---

## 💰 Pricing (Razorpay Fees)

### Transaction Fees:
- **Domestic Cards:** 2% + GST
- **UPI:** 2% + GST
- **Net Banking:** 2% + GST
- **Wallets:** 2% + GST

### Example:
- Customer pays: ₹999
- Razorpay fee: ₹20 (2%)
- You receive: ₹979

---

## 🔒 Security Features

✅ PCI DSS Compliant
✅ 256-bit SSL Encryption
✅ 3D Secure Authentication
✅ Fraud Detection
✅ Automatic Refunds
✅ Payment Signature Verification

---

## 📊 Dashboard Access

After going live, you can:
- View all transactions
- Issue refunds
- Download reports
- Track settlements
- Manage disputes
- View analytics

Dashboard: https://dashboard.razorpay.com

---

## 🐛 Troubleshooting

### Issue: Payment fails in test mode
**Solution:** Use test card: 4111 1111 1111 1111

### Issue: UPI not showing
**Solution:** UPI only works in LIVE mode with LIVE keys

### Issue: Payment successful but subscription not created
**Solution:** Check backend logs for errors

### Issue: Razorpay modal not opening
**Solution:** Check browser console for JavaScript errors

---

## 📞 Support

- **Razorpay Support:** support@razorpay.com
- **Documentation:** https://razorpay.com/docs/
- **Test Mode Guide:** https://razorpay.com/docs/payments/payments/test-card-details/

---

## ✨ Summary

**Current (TEST Mode):**
- Use test cards to test payment flow
- No real money involved
- Perfect for development

**Production (LIVE Mode):**
- Complete KYC verification
- Get LIVE API keys
- Replace keys in .env
- All payment methods available (UPI, QR, Cards, etc.)
- Real payments processed
- Money goes to your bank account

---

**Ready to go live? Complete KYC on Razorpay dashboard!** 🚀
