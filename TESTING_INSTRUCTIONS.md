# Testing Instructions - Owner Portal

## 🔧 IMPORTANT: Backend Fix Applied

### What Was Fixed:
The `getOwnerRentals` function was only matching properties by `userId`, but it should also match by `contactEmail` (like all other owner functions).

**Fixed in**: `backend/src/controllers/ownerController.js`

---

## 🚀 HOW TO TEST

### Step 1: Restart Backend Server
```bash
cd backend
npm start
```

**Why?** The backend code was updated to fix the property matching logic.

---

### Step 2: Login as Owner
1. Go to: `http://localhost:5173/owner/login`
2. Login with owner credentials
3. You should be redirected to Owner Portal

---

### Step 3: Check Dashboard
**URL**: `/owner/dashboard`

**What to verify:**
- ✅ Stats cards show correct numbers
- ✅ Recent sales appear (if any)
- ✅ Recent rent payments appear (if any)
- ✅ Quick action buttons work

---

### Step 4: Check My Properties Page
**URL**: `/owner/properties`

**What to verify:**
- ✅ All properties are listed
- ✅ Each property card shows:
  - Property image
  - Status badge (active/sold/rented)
  - Ownership type badge (email match/user match)
  - Location
  - Price
  - Stats (sales, rentals, views)
  - Total earnings
- ✅ Search works
- ✅ Filters work (status, category)
- ✅ "View Buyers/Tenants" button works

---

### Step 5: Check Individual Property Details
**URL**: `/owner/property/:id`

**How to get there:**
- From "My Properties" page
- Click "View Buyers/Tenants" button on any property card

**What to verify:**

#### Overview Tab:
- ✅ Property description shows
- ✅ Property images display
- ✅ Stats are correct (price, sales, rentals, earnings)

#### Buyers Tab (For Sold Properties):
- ✅ Shows all buyers who purchased the property
- ✅ Each buyer card shows:
  - Name, email, phone
  - Purchase date
  - Purchase amount
  - Payment status
  - Delivery address (if provided)
  - Buyer notes (if any)

#### Tenants Tab (For Rented Properties):
- ✅ Shows all tenants who rented the property
- ✅ Each tenant card shows:
  - **Contact Info**: Name, email, phone
  - **Rental Period**: Start date - End date
  - **Monthly Rent**: Amount per month
  - **Status**: Active/Completed
  
  - **Payment Summary** (4 metrics):
    - Total Received
    - Paid Months
    - Pending Payments
    - Overdue Payments
  
  - **Rent Paid Until** (Blue box):
    - Shows last date rent is paid for
  
  - **Next Payment Due** (Yellow/Red box):
    - Shows next due date
    - Shows amount due
    - Red if overdue
  
  - **Payment History**:
    - Lists up to 6 recent payments
    - Each payment shows:
      - Month/Year
      - Amount
      - Status (PAID/PENDING/OVERDUE)
      - Paid date or Due date
    - Color-coded status badges

---

### Step 6: Check Purchases & Rentals Page
**URL**: `/owner/purchases`

**What to verify:**
- ✅ Stats cards show correct numbers
- ✅ Filters work (All/Purchases/Rentals)
- ✅ Overdue indicator shows (if any overdue)
- ✅ Transaction cards show:
  - Property image and details
  - Buyer/Tenant contact info
  - Payment tracking for rentals
  - Transaction type badge
  - Payment status badge
  - Order status badge
- ✅ "Details" button opens modal
- ✅ Modal shows complete information

---

## 🐛 TROUBLESHOOTING

### Issue: "No properties found"
**Possible causes:**
1. Properties not listed with your email
2. Wrong user logged in
3. Backend not restarted after fix

**Solution:**
1. Check if properties have `contactEmail` matching your login email
2. Verify you're logged in with correct account
3. Restart backend server

---

### Issue: "Buyers (0)" and "Tenants (0)" showing
**Possible causes:**
1. No actual purchases/rentals for this property
2. Backend not restarted after fix
3. API endpoint not returning data

**Solution:**
1. Restart backend server (IMPORTANT!)
2. Check browser console for API errors
3. Check backend logs for errors
4. Verify data exists in database

---

### Issue: Payment history not showing
**Possible causes:**
1. No payment records in database
2. MonthlyPayment table empty
3. Backend not returning payment history

**Solution:**
1. Check if MonthlyPayment records exist for the rental
2. Verify backend is returning `paymentHistory` array
3. Check browser console for errors

---

## 📊 DATABASE REQUIREMENTS

For the features to work, you need:

### For Buyers Tab:
- `Purchase` records with:
  - `listingId` matching the property
  - `status` = 'completed' or 'approved'
  - Associated `User` (buyer)

### For Tenants Tab:
- `PropertyRental` records with:
  - `listingId` matching the property
  - `status` = 'active' or 'completed'
  - Associated `User` (tenant)
- `MonthlyPayment` records with:
  - `rentalId` matching the rental
  - Various statuses (paid/pending/overdue)

---

## 🔍 API ENDPOINTS TO TEST

### 1. Get Owner Properties
```
GET /api/owner/properties
```
**Should return**: List of properties with stats

### 2. Get Owner Purchases
```
GET /api/owner/purchases?propertyId=123
```
**Should return**: List of purchases for property 123

### 3. Get Owner Rentals
```
GET /api/owner/rentals?propertyId=123
```
**Should return**: List of rentals with payment history for property 123

### 4. Get Property Purchases (Combined)
```
GET /api/owner/property-purchases
```
**Should return**: Combined list of purchases and rentals

---

## ✅ SUCCESS CRITERIA

The implementation is working correctly if:

1. ✅ Owner can see all their properties
2. ✅ Properties show correct stats (sales, rentals, earnings)
3. ✅ Individual property page shows buyers/tenants
4. ✅ Tenant cards show payment summary
5. ✅ "Rent Paid Until" date is visible
6. ✅ "Next Payment Due" date is visible
7. ✅ Payment history lists all payments
8. ✅ Overdue payments are highlighted in red
9. ✅ All contact information is visible
10. ✅ Purchases & Rentals page shows combined view

---

## 🎯 QUICK TEST CHECKLIST

- [ ] Backend server restarted
- [ ] Owner can login
- [ ] Dashboard loads with stats
- [ ] My Properties shows all listings
- [ ] Property details page loads
- [ ] Buyers tab shows purchase info
- [ ] Tenants tab shows rental info
- [ ] Payment summary displays
- [ ] Rent paid until date shows
- [ ] Next payment due shows
- [ ] Payment history lists payments
- [ ] Overdue payments are red
- [ ] Purchases page shows transactions
- [ ] Filters work correctly
- [ ] Modal popup works

---

## 📝 NOTES

### Property Matching Logic:
Properties are matched to owners by:
```javascript
{
  [Op.or]: [
    { userId: req.user.id },
    { contactEmail: req.user.email }
  ]
}
```

This means a property will show if:
- The `userId` matches the logged-in user's ID, OR
- The `contactEmail` matches the logged-in user's email

### Payment Status Logic:
- **PAID**: Payment received, `paidDate` is set
- **PENDING**: Payment not yet due
- **OVERDUE**: Payment past `dueDate` and not paid

---

**Ready to test! 🚀**

If you encounter any issues, check:
1. Backend console for errors
2. Browser console for API errors
3. Network tab to see API responses
4. Database to verify data exists
