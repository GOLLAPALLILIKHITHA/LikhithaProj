# Google OAuth Setup Guide for INFRAALL

## 🎯 Overview
Google OAuth has been integrated into the INFRAALL platform to allow users with Gmail accounts to sign in without email OTP verification. **Mobile phone OTP verification remains mandatory** for all users, including Google sign-ins.

## ✅ What's Implemented

### Backend Changes
1. **New Dependencies**:
   - `passport` - Authentication middleware
   - `passport-google-oauth20` - Google OAuth 2.0 strategy
   - `express-session` - Session management

2. **New Files**:
   - `backend/src/config/passport.js` - Passport Google OAuth configuration

3. **New API Endpoints**:
   - `POST /api/auth/google/send-phone-otp` - Send OTP to phone for new Google users
   - `POST /api/auth/google/verify-phone-otp` - Verify phone OTP and create account
   - `POST /api/auth/google/login` - Login existing Google users

4. **Environment Variables** (`.env`):
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   SESSION_SECRET=infraall_session_secret_2024
   ```

### Frontend Changes
1. **New Dependencies**:
   - `@react-oauth/google` - Google OAuth React components
   - `jwt-decode` - Decode Google JWT tokens

2. **Updated Files**:
   - `frontend/src/App.tsx` - Wrapped with GoogleOAuthProvider
   - `frontend/src/pages/LoginPage.tsx` - Added Google Sign-In button and phone verification flow

3. **Environment Variables** (`.env`):
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_API_URL=http://localhost:5000/api
   ```

## 🔧 Setup Instructions

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (frontend dev)
     - `http://localhost:5000` (backend dev)
     - Add your production URLs when deploying
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - Add your production callback URL when deploying
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

#### Backend (`.env`)
```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=infraall_session_secret_2024
```

#### Frontend (`.env`)
```env
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Restart Servers
```bash
# Backend
cd ABC-main/backend
npm run dev

# Frontend
cd ABC-main/frontend
npm run dev
```

## 🔄 User Flow

### For New Google Users (First Time)
1. User clicks "Continue with Google" button
2. Google OAuth popup appears
3. User selects their Google account
4. System checks if email exists in database
5. **If new user**:
   - Redirected to phone verification screen
   - User enters 10-digit mobile number
   - System sends voice call OTP
   - User enters 6-digit OTP
   - Account created with Google profile data
   - User logged in automatically

### For Existing Google Users
1. User clicks "Continue with Google" button
2. Google OAuth popup appears
3. User selects their Google account
4. System recognizes existing account
5. User logged in immediately (no OTP needed)

### For Regular Email Users
- **No changes** - existing email + password + phone OTP flow remains unchanged
- Mobile OTP is still mandatory during registration

## 🔐 Security Features

1. **Phone Verification Mandatory**: All users (including Google sign-ins) must verify their phone number
2. **JWT Tokens**: Secure authentication tokens for session management
3. **Session Management**: Express sessions for OAuth flow
4. **Email Verification**: Google accounts are pre-verified (isVerified: true)
5. **No Password Storage**: Google users don't need passwords (random hash stored)

## 📱 Mobile OTP Flow

### For Google Users
- **First time**: Phone OTP required during registration
- **Subsequent logins**: No OTP needed (Google OAuth only)

### For Regular Users
- **Registration**: Phone OTP required
- **Login**: Email + password (no OTP)

## 🎨 UI/UX Features

1. **Google Sign-In Button**: Professional Google-branded button
2. **Phone Verification Screen**: Clean UI for phone number entry
3. **OTP Input**: Large, centered OTP input field
4. **Resend Timer**: 30-second countdown before resend
5. **Error Handling**: Clear error messages for all scenarios
6. **Loading States**: Visual feedback during API calls

## 🧪 Testing

### Test Google OAuth (Development Mode)
1. Make sure both servers are running
2. Navigate to `http://localhost:5173/login`
3. Click "Continue with Google"
4. Select a Google account
5. If new user, enter phone number and verify OTP
6. Check that user is created in database with Google profile data

### Test Regular Login
1. Regular email + password login should work unchanged
2. Phone OTP during registration should work unchanged

## 🚀 Production Deployment

### Before Deploying:
1. Update Google OAuth credentials with production URLs
2. Update environment variables with production values
3. Enable HTTPS for secure OAuth flow
4. Update session cookie settings:
   ```javascript
   cookie: { secure: true } // Enable in production
   ```

### Production URLs to Add:
- Frontend: `https://yourdomain.com`
- Backend: `https://api.yourdomain.com`
- Callback: `https://api.yourdomain.com/api/auth/google/callback`

## 📝 Notes

- **Gmail Users**: Can sign in with Google (no email OTP)
- **Non-Gmail Users**: Must use regular email + password registration
- **Phone Verification**: Mandatory for ALL users (Google and regular)
- **Admin Login**: Not affected by Google OAuth (remains email + password)
- **Existing Users**: Can continue using email + password login

## 🐛 Troubleshooting

### "Google login failed"
- Check that GOOGLE_CLIENT_ID is set correctly in both backend and frontend
- Verify Google OAuth credentials are active in Google Cloud Console
- Check browser console for detailed error messages

### "Phone number already registered"
- User may have already registered with regular email
- Ask user to login with email + password instead

### "Session expired"
- User took too long to verify phone
- Ask user to start Google sign-in process again

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Documentation](http://www.passportjs.org/)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
