# Owner Account Summary

## Single Owner Login Credentials

**Login URL**: http://localhost:5173/owner/login

**Email**: demoowner@gmail.com  
**Password**: owner123

---

## Demo Owner - Complete Account Details

- **Name**: Demo Owner
- **Email**: demoowner@gmail.com
- **Password**: owner123
- **Phone**: 9876543210
- **Total Properties**: 9

### All Properties Owned

#### 1. Siva House (ID: 2)
- **Category**: Property Rent
- **Status**: Rented
- **Price**: ₹14,000/month
- **Rentals**: 2 (1 active)
- **Tenants**: 
  - Siva Prasad (sivaprasad072611@gmail.com) - Active
  - siva (sekharravi406@gmail.com) - Completed

#### 2. Modern Test Apartment (ID: 14)
- **Category**: Property Rent
- **Status**: Active
- **Price**: ₹15,000/month
- **Rentals**: 2 (1 active)
- **Tenants**:
  - Likhotha (gollapallilikki@gmail.com) - Active
  - Siva Prasad (sivaprasad072611@gmail.com) - Completed

#### 3. Sekhar Test House (ID: 15)
- **Category**: Property Rent
- **Status**: Active
- **Price**: ₹16,000/month
- **Rentals**: 1 (0 active)
- **Tenants**:
  - Likhotha (gollapallilikki@gmail.com) - Completed

#### 4. Likhitha House (ID: 16)
- **Category**: Property Rent
- **Status**: Active
- **Price**: ₹25,000/month
- **Rentals**: 2 (1 active)
- **Tenants**:
  - Test User (test@example.com) - Active
  - siva (sekharravi406@gmail.com) - Completed

#### 5. lIKKI HOUSE (ID: 17)
- **Category**: Property Rent
- **Status**: Rented
- **Price**: ₹13,000/month
- **Rentals**: 2 (1 active)
- **Tenants**:
  - KYC Test User (kyctest@example.com) - Active
  - Siva Prasad (sivaprasad072611@gmail.com) - Completed

#### 6. 1BHK Furnished Flat for Rent (ID: 21)
- **Category**: Property Rent
- **Status**: Rented
- **Price**: ₹140/month
- **Rentals**: 2 (1 active)
- **Tenants**:
  - Kavya (99220040577@klu.ac.in) - Active/Pending

#### 7. Ariel Sofa (ID: 7)
- **Category**: Furniture
- **Status**: Active
- **Price**: ₹13,999
- **Purchases**: 1
- **Earnings**: ₹13,999
- **Buyer**: Likhotha (gollapallilikki@gmail.com)

#### 8. Reliable chair (ID: 8)
- **Category**: Furniture
- **Status**: Active
- **Price**: ₹2,500
- **Purchases**: 1
- **Earnings**: ₹2,500
- **Buyer**: Test User (test@example.com)

#### 9. Abendment Hosue (ID: 9)
- **Category**: Property Sell
- **Status**: Active
- **Price**: ₹9,99,999
- **Purchases**: 1
- **Earnings**: ₹9,99,999
- **Buyer**: KYC Test User (kyctest@example.com)

---

## Overall Statistics

- **Total Properties**: 9
  - Rental Properties: 6
  - Sold Properties: 3 (Furniture: 2, Property: 1)
- **Total Rental Transactions**: 11
- **Active Rentals**: 5
- **Total Purchase Transactions**: 3
- **Total Purchase Earnings**: ₹10,16,498

---

## Testing Instructions

### 1. Login to Owner Portal
1. Go to http://localhost:5173/owner/login
2. Email: **demoowner@gmail.com**
3. Password: **owner123**

### 2. What You'll See

#### Dashboard
- Total properties: 9
- Active rentals: 5
- Total earnings: ₹10,16,498
- Recent activity from all properties
- Quick stats cards

#### My Properties
- Grid view of ALL 9 properties
- Mix of rental and sold properties
- Property status (active/rented)
- "View Buyers/Tenants" button on each property

#### Property Details (Click "View Buyers/Tenants")

**For Rental Properties** (6 properties):
- Complete tenant information (name, email, phone)
- Payment summary metrics:
  - Total amount received
  - Number of months paid
  - Pending amount
  - Overdue amount
- "Rent Paid Until" date (blue box)
- "Next Payment Due" date and amount (yellow/red if overdue)
- Complete payment history timeline (up to 6 recent payments)
- Payment status for each month

**For Sold Properties** (3 properties):
- Buyer information (name, email, phone)
- Purchase amount
- Payment status (paid/pending)
- Purchase date
- Transaction details

---

## Key Features to Test

### 1. Dashboard Overview
- Login and see summary of all 9 properties
- View total earnings from both rentals and sales
- Check active rental count
- See recent activity across all properties

### 2. Property Grid
- Navigate to "My Properties"
- See all 9 properties in grid layout
- Each card shows property image, title, price, status
- "View Buyers/Tenants" button on each card

### 3. Rental Payment Tracking
Test with these properties:
- **Siva House** - Has 1 active rental
- **Modern Test Apartment** - Has 1 active rental
- **Likhitha House** - Has 1 active rental
- **lIKKI HOUSE** - Has 1 active rental
- **1BHK Furnished Flat** - Has 1 active rental

For each, you'll see:
- Tenant contact details
- Payment summary (4 metrics)
- Rent paid until date
- Next payment due date
- Payment history timeline

### 4. Purchase Details
Test with these properties:
- **Ariel Sofa** - Sold for ₹13,999
- **Reliable chair** - Sold for ₹2,500
- **Abendment Hosue** - Sold for ₹9,99,999

For each, you'll see:
- Buyer contact details
- Purchase amount
- Payment status
- Purchase date

---

## Notes

1. **Single Owner Account**: All properties are now under ONE account (demoowner@gmail.com)
2. **Simplified Management**: No need to switch between multiple accounts
3. **Complete Data**: All 11 rental transactions and 3 purchase transactions visible
4. **Payment Tracking**: Full payment history for all active rentals
5. **Separate Portal**: Owner portal is completely separate from main website
6. **Clean Navigation**: Only 2 sidebar items (Dashboard, My Properties)
7. **No Unused Pages**: Removed "Purchases & Rentals", "Payment History", and "Analytics"

---

## Summary

✅ **ONE owner account** manages ALL properties  
✅ **9 properties** total (6 rentals + 3 sales)  
✅ **11 rental transactions** with payment tracking  
✅ **3 purchase transactions** with buyer details  
✅ **₹10,16,498** total earnings  
✅ **5 active rentals** currently ongoing  

**Login**: demoowner@gmail.com / owner123
