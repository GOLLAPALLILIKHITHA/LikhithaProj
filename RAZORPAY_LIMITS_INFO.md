# Razorpay Payment Limits Issue

## 🚨 Problem
When trying to rent a property with ₹75,000 total payment, getting "maximum amount exceeded" error.

## 💰 Payment Breakdown
For a ₹25,000/month property:
- Monthly rent: ₹25,000
- Advance payment (2 months): ₹50,000  
- First month rent: ₹25,000
- **Total initial payment: ₹75,000**

## 🔍 Razorpay Test Mode Limits
- **Test Mode**: Usually limited to ₹50,000 per transaction
- **Live Mode**: Much higher limits (₹10,00,000+)
- **Account Limits**: May vary based on KYC status

## ✅ Solutions

### Option 1: Split Payment (Recommended)
Split the ₹75,000 into two payments:
1. **First Payment**: ₹50,000 (2 months advance)
2. **Second Payment**: ₹25,000 (1st month rent)

### Option 2: Reduce Initial Payment
Change the rental structure:
- **Advance**: 1 month (₹25,000)
- **First month**: ₹25,000
- **Total**: ₹50,000 (within limits)

### Option 3: Use Live Mode
Switch to Razorpay live mode with proper KYC:
- Higher transaction limits
- Real payments (not for testing)

## 🛠️ Implementation Plan
1. Add payment limit detection
2. Offer split payment option for amounts > ₹50,000
3. Better error messages for users
4. Alternative payment structures