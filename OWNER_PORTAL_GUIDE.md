# Owner Portal - User Guide

## 🎯 Overview

The Owner Portal is a **separate, dedicated interface** for property owners to manage their listings and track all transactions (purchases and rentals).

---

## 🚪 Access

### Login
- URL: `http://localhost:5173/owner/login`
- After login, you'll be redirected to the Owner Portal

### Portal Structure
```
Owner Portal (Separate from Main Website)
├── Sidebar Navigation (Always Visible)
│   ├── Dashboard
│   ├── My Properties
│   ├── Purchases & Rentals
│   ├── Payment History
│   └── Analytics
└── Main Content Area
```

---

## 📊 Dashboard (`/owner/dashboard`)

### What You'll See:

#### 1. **Statistics Cards** (Top Row)
- 🏢 **Total Properties**: Count of all your listings
- 💰 **Total Earnings**: All-time revenue from sales and rentals
- 🛒 **Properties Sold**: Number of properties sold
- 🏘️ **Properties Rented**: Number of properties currently rented

#### 2. **Quick Actions** (Middle Row)
- **View All Listings** → Takes you to My Properties page
- **Property Purchases** → Takes you to Purchases & Rentals page
- **Add New Property** → Opens property listing form

#### 3. **Recent Activity** (Bottom Row)
- **Recent Sales**: Last 3 property purchases
  - Shows: Property name, buyer name, amount, date
- **Recent Rent Payments**: Last 3 rent payments received
  - Shows: Property name, tenant name, amount, month/year

---

## 🏠 My Properties (`/owner/properties`)

### Features:

#### **Search & Filters**
- 🔍 **Search Box**: Search by property title
- 📊 **Status Filter**: 
  - All Status
  - Active
  - Sold
  - Rented
  - Pending
  - Inactive
- 📁 **Category Filter**:
  - All Categories
  - Property for Sale
  - Property for Rent
  - Furniture
  - Materials
  - Services

#### **Property Cards**
Each property card shows:
- **Property Image** (or category icon if no image)
- **Status Badge** (top-right corner)
- **Ownership Type Badge** (top-left corner)
  - "Email Match" - Listed with your email
  - "User Match" - Listed with your user ID
- **Property Details**:
  - Title
  - Location
  - Price (with /month for rentals)
- **Statistics**:
  - Sales count
  - Rentals count
  - Views count
- **Total Earnings** (highlighted in green)
- **Action Buttons**:
  - 👥 **View Buyers/Tenants** - See who bought/rented
  - 👁️ **View Listing** - See public listing page

---

## 🛒 Purchases & Rentals (`/owner/purchases`)

### What This Shows:
**ALL properties that have been bought OR rented from your listings**

### Statistics Cards (Top)
- 📊 **Total Transactions**: All buys + rentals
- 🏠 **Properties Sold**: Count of purchases
- 🏘️ **Properties Rented**: Count of rentals
- 💰 **Total Earnings**: Combined revenue

### Filters
- **All** - Show everything
- **Purchases** - Only property sales
- **Rentals** - Only property rentals
- **⚠️ Overdue Indicator** - Shows count of overdue rental payments

### Transaction Cards

#### For PURCHASES (Property Sales):
```
┌─────────────────────────────────────────┐
│ 🏠 Property Image                       │
│                                         │
│ Property Title                          │
│ 📍 Location, City                       │
│ 💰 ₹50,00,000                          │
│                                         │
│ 👤 Buyer: John Doe                     │
│ 📞 +91 98765 43210                     │
│ ✉️ john@example.com                    │
│                                         │
│ 📅 Purchased on Jan 15, 2024           │
│                                         │
│ Status: 🏠 PURCHASE | ✅ PAID | ✅ COMPLETED │
│ [Details Button]                        │
└─────────────────────────────────────────┘
```

#### For RENTALS (Property Rentals):
```
┌─────────────────────────────────────────┐
│ 🏘️ Property Image                       │
│                                         │
│ Property Title                          │
│ 📍 Location, City                       │
│ 💰 ₹25,000/month                       │
│                                         │
│ 👤 Tenant: Jane Smith                  │
│ 📞 +91 98765 43210                     │
│ ✉️ jane@example.com                    │
│                                         │
│ 📅 Rental Tracking                     │
│ Start: Jan 1, 2024                     │
│ Next Due: Dec 1, 2024                  │
│ ⚠️ Overdue: ₹50,000 (if overdue)      │
│                                         │
│ 📅 Rented on Jan 1, 2024               │
│                                         │
│ Status: 🏘️ RENTAL | ⚠️ OVERDUE | ✅ ACTIVE │
│ [Details Button]                        │
└─────────────────────────────────────────┘
```

### Details Modal
Click **"Details"** button to see:
- **Property Information**: Full details
- **Buyer/Tenant Information**: Complete contact details
- **Payment Information**: 
  - Amount
  - Payment method
  - Payment status
  - Transaction status
- **Rental Tracking** (for rentals only):
  - Start date
  - End date
  - Next payment due
  - Overdue amount (if any)
- **Admin Notes**: Any notes from admin

---

## 🎨 Visual Indicators

### Status Colors
- 🟢 **Green** - Active, Paid, Completed
- 🔵 **Blue** - Sold, Purchase
- 🟣 **Purple** - Rented, Rental
- 🟡 **Yellow** - Pending
- 🔴 **Red** - Overdue, Cancelled
- ⚫ **Gray** - Inactive

### Badges
- **PURCHASE** - Blue background
- **RENTAL** - Purple background
- **PAID** - Green background with checkmark
- **OVERDUE** - Red background with warning icon
- **ACTIVE** - Green background
- **COMPLETED** - Green background

---

## 🔔 Important Information

### Overdue Rentals
- Highlighted with **red border**
- Shows **overdue amount** in red
- Warning icon (⚠️) displayed
- Appears in overdue filter

### Contact Information
All buyer/tenant contact details are visible:
- Full name
- Email address
- Phone number

### Payment Tracking (Rentals)
- **Start Date**: When rental began
- **Next Payment Due**: When next rent is due
- **Overdue Amount**: Calculated automatically if payment is late

---

## 📱 Navigation

### Sidebar Menu
- Always visible on the left
- Active page is highlighted
- Click any item to navigate

### Quick Links
- **Add Property** button in sidebar
- **Main Site** link to return to main website
- **Logout** button at bottom

---

## 💡 Tips

1. **Finding Overdue Payments**
   - Go to Purchases & Rentals
   - Look for the red "Overdue" indicator
   - Click "Rentals" filter to see only rentals
   - Overdue transactions have red borders

2. **Tracking Earnings**
   - Dashboard shows total earnings
   - Each property card shows individual earnings
   - Purchases page shows combined revenue

3. **Contacting Buyers/Tenants**
   - Click "Details" on any transaction
   - Full contact information is displayed
   - Copy email/phone to contact them

4. **Viewing Property Performance**
   - My Properties page shows stats for each listing
   - See how many sales, rentals, and views
   - Track total earnings per property

---

## 🆘 Troubleshooting

### "No properties found"
- Make sure properties are listed with your email address
- Check if you're logged in with the correct account
- Properties must have `contactEmail` matching your login email

### "No transactions yet"
- This is normal if no one has bought/rented your properties yet
- Transactions appear here after admin approval

### Can't see a property
- Check the status filter (might be filtered out)
- Use search box to find by name
- Verify the property's contact email matches yours

---

## 📞 Support

If you need help:
1. Check this guide first
2. Contact admin through the main website
3. Report any issues with property listings

---

**Enjoy managing your properties! 🏠✨**
