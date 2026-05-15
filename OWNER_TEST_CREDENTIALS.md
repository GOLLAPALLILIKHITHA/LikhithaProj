# Owner Portal - Test Credentials

## ✅ OWNER ACCOUNT CREATED

### Owner Details:
- **Name**: Amit Patel
- **Email**: amit@example.com
- **Password**: owner123
- **Phone**: 9876543212
- **Role**: user (property owner)

---

## 🏠 PROPERTIES OWNED

### 1. 1BHK Furnished Flat for Rent
- **Property ID**: 21
- **Status**: rented
- **Category**: property_rent
- **Number of Rentals**: 2 active rentals

---

## 🚀 HOW TO TEST

### Step 1: Login as Owner
1. Go to: `http://localhost:5173/owner/login`
2. Enter credentials:
   - **Email**: `amit@example.com`
   - **Password**: `owner123`
3. Click "Login"

### Step 2: You Should See
- Owner Portal with sidebar navigation
- Dashboard with statistics
- Property listings

### Step 3: Check Property Details
1. Go to "My Properties" from sidebar
2. You should see: **"1BHK Furnished Flat for Rent"**
3. Click "View Buyers/Tenants" button
4. Click "Tenants" tab
5. You should see **2 tenants** with:
   - Contact information
   - Payment summary
   - Rent paid until date
   - Next payment due
   - Payment history

---

## 📊 WHAT TO VERIFY

### Dashboard Page (`/owner/dashboard`)
- ✅ Total Properties: Should show 1
- ✅ Properties Rented: Should show 1
- ✅ Total Rentals: Should show 2
- ✅ Total Earnings: Should show rent collected
- ✅ Recent rent payments should appear

### My Properties Page (`/owner/properties`)
- ✅ Should show "1BHK Furnished Flat for Rent"
- ✅ Status badge should show "rented"
- ✅ Stats should show:
  - Rentals: 2
  - Total Earnings: (amount from rentals)
- ✅ "View Buyers/Tenants" button should work

### Property Details Page (`/owner/property/21`)
- ✅ Overview tab shows property description
- ✅ Buyers tab shows "No buyers" (it's for rent, not sale)
- ✅ **Tenants tab shows 2 tenants** with:
  - Tenant name, email, phone
  - Rental period (start - end dates)
  - Monthly rent amount
  - Payment summary (4 metrics)
  - Rent paid until date (blue box)
  - Next payment due (yellow/red box)
  - Payment history (list of payments)

### Purchases & Rentals Page (`/owner/purchases`)
- ✅ Should show 2 rental transactions
- ✅ Each transaction shows:
  - Property: 1BHK Furnished Flat for Rent
  - Tenant contact details
  - Rental tracking information
  - Payment status

---

## 🎯 EXPECTED BEHAVIOR

### For Rented Property:
Since the property is **rented** (not sold):
- **Buyers Tab**: Will show "No buyers yet"
- **Tenants Tab**: Will show 2 tenants with full details

### Payment Tracking:
Each tenant card should show:
1. **Payment Summary**:
   - Total Received: ₹X,XXX
   - Paid Months: X
   - Pending: X
   - Overdue: X

2. **Rent Paid Until**: 
   - Blue box with date
   - Example: "Nov 30, 2024"

3. **Next Payment Due**:
   - Yellow box (if current) or Red box (if overdue)
   - Shows date and amount
   - Example: "Dec 1, 2024 - ₹25,000"

4. **Payment History**:
   - List of up to 6 recent payments
   - Each shows: Month/Year, Amount, Status, Date
   - Color-coded: Green (PAID), Yellow (PENDING), Red (OVERDUE)

---

## 🔍 TROUBLESHOOTING

### If you don't see the property:
1. Make sure you're logged in with `amit@example.com`
2. Check that backend server is running
3. Verify the property has `contactEmail = 'amit@example.com'`

### If Tenants tab shows (0):
1. **RESTART BACKEND SERVER** (important!)
2. Check browser console for errors
3. Check backend logs for API errors
4. Verify PropertyRental records exist for property ID 21

### If payment history is empty:
1. Check if MonthlyPayment records exist
2. Verify they're linked to the rental IDs
3. Check backend response in Network tab

---

## 📝 DATABASE VERIFICATION

### Check Property:
```sql
SELECT * FROM listings WHERE id = 21;
```
Should show:
- contactEmail: amit@example.com
- status: rented

### Check Rentals:
```sql
SELECT * FROM property_rentals WHERE listingId = 21;
```
Should show 2 rental records

### Check Payments:
```sql
SELECT mp.* 
FROM monthly_payments mp
INNER JOIN property_rentals pr ON mp.rentalId = pr.id
WHERE pr.listingId = 21;
```
Should show payment records for the rentals

---

## ✅ SUCCESS CHECKLIST

- [ ] Can login with amit@example.com / owner123
- [ ] Dashboard shows correct statistics
- [ ] My Properties shows "1BHK Furnished Flat for Rent"
- [ ] Property card shows "Rentals: 2"
- [ ] "View Buyers/Tenants" button works
- [ ] Property details page loads
- [ ] Tenants tab shows 2 tenants
- [ ] Each tenant shows contact information
- [ ] Payment summary displays correctly
- [ ] "Rent Paid Until" date is visible
- [ ] "Next Payment Due" date is visible
- [ ] Payment history lists payments
- [ ] Overdue payments (if any) are highlighted in red
- [ ] Purchases & Rentals page shows 2 transactions

---

## 🎉 READY TO TEST!

**Login URL**: http://localhost:5173/owner/login

**Credentials**:
- Email: `amit@example.com`
- Password: `owner123`

**Important**: Make sure to **restart the backend server** to apply all the fixes!

```bash
cd backend
npm start
```

Then login and explore the Owner Portal! 🚀
