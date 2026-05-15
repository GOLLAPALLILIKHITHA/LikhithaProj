# Testing Owner Dashboard - Property Purchases Feature

## What Should Happen

When a property is **purchased** or **rented**, it should automatically appear in the **Property Purchases** tab of the Owner Dashboard with complete details.

## How to Test

### Step 1: Login as Owner
1. Go to owner login page
2. Login with owner credentials
3. Navigate to Owner Dashboard

### Step 2: Check Property Purchases Tab
1. Click on **"Property Purchases"** tab
2. You should see all properties that have been:
   - ✅ **Bought** (completed/approved buy requests)
   - ✅ **Rented** (active/completed rentals)

### Step 3: Verify Information Displayed

For each transaction, you should see:

#### For PURCHASED Properties:
- ✅ Property image and title
- ✅ Property location
- ✅ **Buyer Details:**
  - Name
  - Email
  - Phone number
- ✅ Purchase amount
- ✅ Transaction date (when purchased)
- ✅ Payment status (COMPLETED)
- ✅ Order status (COMPLETED/APPROVED)
- ✅ Transaction type badge (PURCHASE)

#### For RENTED Properties:
- ✅ Property image and title
- ✅ Property location
- ✅ **Tenant Details:**
  - Name
  - Email
  - Phone number
- ✅ Monthly rent amount
- ✅ **Payment Tracking:**
  - Start date (when rented)
  - Next payment due date
  - Overdue amount (if any)
- ✅ Payment status (PAID/OVERDUE/CURRENT)
- ✅ Order status (ACTIVE/COMPLETED)
- ✅ Transaction type badge (RENTAL)

### Step 4: View Detailed Information
1. Click **"Details"** button on any transaction
2. Modal should open showing:
   - Complete buyer/tenant information
   - Full transaction details
   - Payment history (for rentals)
   - Admin notes (if any)

## What Data is Shown

### Backend Fetches:
```javascript
// For Purchases (Buy Requests)
- Buy request status: 'completed' or 'approved'
- Buyer: name, email, phone
- Property: title, location, city, images
- Amount: property price
- Date: when purchased (createdAt)
- Payment: offline (completed)

// For Rentals (Property Rentals)
- Rental status: 'active' or 'completed'
- Tenant: name, email, phone
- Property: title, location, city, images
- Monthly rent amount
- Start date
- Next payment due date
- Overdue calculation (if payment is late)
- Payment method: online/offline
```

### Frontend Displays:
```
Property Purchases Tab
├── Transaction Card
│   ├── Property Image
│   ├── Property Details (title, location)
│   ├── Amount (with /month for rentals)
│   ├── Buyer/Tenant Info Box
│   │   ├── Name
│   │   ├── Phone
│   │   └── Email
│   ├── Payment Tracking (for rentals only)
│   │   ├── Start Date
│   │   ├── Next Due Date
│   │   └── Overdue Amount (if any)
│   └── Status Badges
│       ├── Transaction Type (RENTAL/PURCHASE)
│       ├── Payment Status (PAID/OVERDUE/CURRENT)
│       └── Order Status (ACTIVE/COMPLETED)
└── Details Button → Opens Modal with full info
```

## API Endpoint

**Endpoint:** `GET /api/owner/property-purchases`

**What it returns:**
```json
{
  "purchases": [
    {
      "id": "buy_123",
      "type": "buy",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "buyer": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "property": {
        "id": 10,
        "title": "3 BHK Apartment in Downtown",
        "location": "MG Road",
        "city": "Mumbai",
        "images": ["url1.jpg", "url2.jpg"]
      },
      "amount": 5000000,
      "paymentStatus": "completed",
      "paymentMethod": "offline"
    },
    {
      "id": "rent_456",
      "type": "rent",
      "status": "active",
      "createdAt": "2024-02-01T08:00:00.000Z",
      "buyer": {
        "id": 8,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "9123456789"
      },
      "property": {
        "id": 15,
        "title": "2 BHK Flat in Suburb",
        "location": "Andheri West",
        "city": "Mumbai",
        "images": ["url3.jpg"]
      },
      "amount": 25000,
      "totalAmount": 75000,
      "paymentStatus": "current",
      "paymentMethod": "online",
      "startDate": "2024-02-01",
      "nextPaymentDue": "2024-03-01",
      "overdueAmount": 0
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "summary": {
    "totalBought": 1,
    "totalRented": 1,
    "activeRentals": 1,
    "overduePayments": 0,
    "totalRevenue": 5025000
  }
}
```

## Troubleshooting

### If Property Purchases Tab is Empty:

1. **Check if properties are actually sold/rented:**
   - Go to admin panel
   - Check buy requests table - should have status 'completed' or 'approved'
   - Check property rentals table - should have status 'active' or 'completed'

2. **Check browser console for errors:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any API errors

3. **Check backend logs:**
   - Look for errors in terminal where backend is running
   - Check if API endpoint `/api/owner/property-purchases` is being called

4. **Verify owner authentication:**
   - Make sure you're logged in as the correct owner
   - Check if the properties belong to this owner (userId or contactEmail matches)

### Common Issues:

**Issue 1: "No Property Purchases Yet" message shows**
- **Cause:** No completed buy requests or active rentals for this owner
- **Solution:** Create test data or wait for actual transactions

**Issue 2: API returns empty array**
- **Cause:** Owner's properties don't have any completed transactions
- **Solution:** 
  - Check database: `SELECT * FROM buy_requests WHERE status IN ('completed', 'approved')`
  - Check database: `SELECT * FROM property_rentals WHERE status IN ('active', 'completed')`

**Issue 3: Buyer/Tenant details not showing**
- **Cause:** User relationship not properly loaded
- **Solution:** Check backend includes User model in query

## Database Queries to Verify Data

### Check Buy Requests:
```sql
SELECT 
  br.id,
  br.status,
  br.createdAt,
  u.name as buyer_name,
  u.email as buyer_email,
  l.title as property_title
FROM buy_requests br
JOIN Users u ON br.userId = u.id
JOIN Listings l ON br.listingId = l.id
WHERE br.status IN ('completed', 'approved')
ORDER BY br.createdAt DESC;
```

### Check Property Rentals:
```sql
SELECT 
  pr.id,
  pr.status,
  pr.startDate,
  pr.nextPaymentDue,
  pr.monthlyRent,
  u.name as tenant_name,
  u.email as tenant_email,
  l.title as property_title
FROM property_rentals pr
JOIN Users u ON pr.userId = u.id
JOIN Listings l ON pr.listingId = l.id
WHERE pr.status IN ('active', 'completed')
ORDER BY pr.createdAt DESC;
```

## Expected Behavior Summary

✅ **When property is purchased:**
- Buy request status changes to 'completed' or 'approved'
- Immediately appears in Property Purchases tab
- Shows buyer details and purchase date
- Payment status shows as 'COMPLETED'

✅ **When property is rented:**
- Property rental status changes to 'active'
- Immediately appears in Property Purchases tab
- Shows tenant details and rental start date
- Shows payment tracking with next due date
- Payment status shows as 'CURRENT' or 'OVERDUE'

✅ **Payment Tracking for Rentals:**
- Automatically calculates if payment is overdue
- Shows next payment due date
- Calculates overdue amount based on months late
- Updates in real-time

## Success Criteria

The feature is working correctly if:
1. ✅ All completed purchases appear in the tab
2. ✅ All active/completed rentals appear in the tab
3. ✅ Buyer/Tenant details are visible (name, email, phone)
4. ✅ Transaction dates are shown correctly
5. ✅ Payment tracking works for rentals
6. ✅ Overdue calculations are accurate
7. ✅ Details modal opens and shows complete information
8. ✅ Status badges display correctly

---

**Note:** The feature is already fully implemented. Just need to test with actual data!
