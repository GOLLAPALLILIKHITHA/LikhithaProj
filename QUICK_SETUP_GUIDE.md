# 🚀 INFRAALL - Quick Setup Guide

## For New Account/Developer

### 1. Get the Code
```bash
git clone https://github.com/GOLLAPALLILIKHITHA/infraaall.git
cd infraaall
```

### 2. Backend Setup (5 minutes)
```bash
cd backend
npm install
cp .env.example .env
```

**Edit `.env` file with:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=infraall
JWT_SECRET=your_random_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Start backend:**
```bash
npm start
```

### 3. Frontend Setup (2 minutes)
```bash
cd frontend
npm install
npm run dev
```

### 4. Database Setup
- Create MySQL database named `infraall`
- Tables will be created automatically when you use features
- Or run scripts in `backend/scripts/` folder

## 🎯 What You'll Get

### ✅ Working Features
- **Property Search** - Rent/Buy properties with filters
- **Schedule Visits** - Book property visits (rent + buy)
- **Payment System** - Razorpay integration for rentals/purchases
- **User Accounts** - Registration, login, dashboard
- **Admin Panel** - Manage users, listings, bookings
- **Chat System** - User-to-seller messaging
- **Reviews** - Property ratings and reviews

### 🔧 Latest Updates (Just Added)
- Schedule visit now works for BUY properties (not just rent)
- Cleaned rent property page (removed preferred timing)
- Enhanced user experience across all property types

## 📱 Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Admin Panel:** /admin/login

## 🆘 Quick Troubleshooting
- **Database errors:** Check MySQL is running and credentials in .env
- **Payment errors:** Verify Razorpay keys in .env
- **Port conflicts:** Change ports in package.json if needed

## 📞 Key Features to Test
1. Search properties (rent/buy)
2. View property details
3. Schedule a visit (works for both rent and buy now!)
4. Register/login as user
5. Try payment flow (test mode)

**Repository:** https://github.com/GOLLAPALLILIKHITHA/infraaall.git
**Status:** ✅ All features working, code pushed to GitHub