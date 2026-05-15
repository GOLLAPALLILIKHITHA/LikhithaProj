# Service Request Submission Troubleshooting Guide

## Issue: "Failed to submit request" error when submitting home services

The backend API is working correctly, so the issue is likely on the frontend side. Here's how to diagnose and fix it:

## ✅ Backend Status: WORKING
- Database connection: ✅ Working
- API endpoint: ✅ Working  
- Service request creation: ✅ Working
- Email notifications: ✅ Working

## 🔍 Frontend Troubleshooting Steps

### Step 1: Check if servers are running
```bash
# Backend server (should be on port 5000)
cd backend
npm run dev

# Frontend server (should be on port 5173)  
cd frontend
npm run dev
```

### Step 2: Check user authentication
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Check Local Storage for 'token'
4. If no token exists, user is not logged in

### Step 3: Check browser console for errors
1. Open developer tools (F12)
2. Go to Console tab
3. Try submitting a service request
4. Look for any JavaScript errors

### Step 4: Check network requests
1. Open developer tools (F12)
2. Go to Network tab
3. Try submitting a service request
4. Look for the API call to `/api/service-requests/create`
5. Check the response status and error message

## 🛠️ Common Issues and Solutions

### Issue 1: User not logged in
**Symptoms:** No token in localStorage, 401 Unauthorized error
**Solution:** 
1. Go to login page: http://localhost:5173/login
2. Login with valid credentials
3. Try submitting service request again

### Issue 2: Backend server not running
**Symptoms:** Network error, ECONNREFUSED, 500 error
**Solution:**
```bash
cd backend
npm install
npm run dev
```

### Issue 3: Frontend server not running
**Symptoms:** Page not loading, connection refused
**Solution:**
```bash
cd frontend
npm install
npm run dev
```

### Issue 4: CORS issues
**Symptoms:** CORS policy error in console
**Solution:** Backend is configured for CORS, but check if CLIENT_URL in .env matches frontend URL

### Issue 5: Validation errors
**Symptoms:** 400 Bad Request with validation message
**Solution:** Ensure all required fields are filled:
- Service type selected
- Problem description entered
- Address provided
- Phone number entered

## 🧪 Test Credentials

### Regular User Login:
- Email: `sekharravi406@gmail.com` (or any existing user)
- Password: Check database or create new user

### Admin Login:
- Email: `sivaprasad072611@gmail.com`
- Password: `Admin@123456`
- URL: http://localhost:5173/admin/login

### Vendor Login:
- Email: `materials@vendor.com`
- Password: `Materials@123`
- URL: http://localhost:5173/vendor/login

## 📝 Manual Testing Steps

1. **Login as regular user:**
   ```
   URL: http://localhost:5173/login
   Email: sekharravi406@gmail.com
   Password: [check database]
   ```

2. **Go to services page:**
   ```
   URL: http://localhost:5173/services
   ```

3. **Fill service request form:**
   - Select service type (e.g., "Plumbing")
   - Enter problem description
   - Enter address
   - Enter phone number
   - Click "Submit Service Request"

4. **Check for success message:**
   - Should see green success message
   - Form should reset
   - Request should appear in database

## 🔧 Debug API Call

If the frontend is still failing, add this debug code to ServicesPage.tsx:

```javascript
// Add this before the api.post call in handleSubmitRequest
console.log('Submitting request with data:', {
  serviceType: selectedService,
  problemDescription,
  userAddress: address,
  userPhone: phone
});

console.log('User token:', localStorage.getItem('token'));
console.log('API base URL:', api.defaults.baseURL);
```

## 📊 Database Verification

To check if requests are being created in database:

```bash
cd backend
node scripts/testServiceRequest.js
```

This will show:
- Database connection status
- Number of users
- Recent service requests
- API endpoint test results

## 🚨 Emergency Fix

If the issue persists, try this quick fix:

1. **Update frontend API configuration:**
   ```typescript
   // In frontend/src/api/index.ts
   const api = axios.create({ 
     baseURL: 'http://localhost:5000/api', // Use full URL instead of relative
     timeout: 10000,
   });
   ```

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R
   - Clear localStorage: Application tab → Local Storage → Clear

3. **Restart both servers:**
   ```bash
   # Kill all node processes
   taskkill /f /im node.exe
   
   # Start backend
   cd backend && npm run dev
   
   # Start frontend (in new terminal)
   cd frontend && npm run dev
   ```

## 📞 Support

If the issue still persists:
1. Check the exact error message in browser console
2. Check the network request details
3. Verify user authentication status
4. Check if all required environment variables are set

The backend API is confirmed working, so the issue is definitely on the frontend side or with user authentication.