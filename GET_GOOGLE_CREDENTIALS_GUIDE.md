# 🔑 How to Get Google OAuth Credentials - Step by Step

## 📋 Quick Overview
You need to create a Google Cloud project and get OAuth 2.0 credentials (Client ID and Client Secret) to enable Google Sign-In.

---

## 🚀 Step-by-Step Instructions

### Step 1: Go to Google Cloud Console
1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account (use the same account you use for development)

---

### Step 2: Create a New Project (or Select Existing)

#### If you don't have a project:
1. Click on the **project dropdown** at the top (next to "Google Cloud")
2. Click **"NEW PROJECT"** button (top right)
3. Enter project details:
   - **Project name**: `INFRAALL` (or any name you like)
   - **Organization**: Leave as default
4. Click **"CREATE"**
5. Wait for the project to be created (takes a few seconds)
6. Select your new project from the dropdown

#### If you already have a project:
1. Click on the **project dropdown** at the top
2. Select your existing project

---

### Step 3: Enable Google+ API

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or use the search bar at the top and search for "API Library"

2. In the API Library search box, type: **"Google+ API"**

3. Click on **"Google+ API"** from the results

4. Click the blue **"ENABLE"** button

5. Wait for it to enable (takes a few seconds)

---

### Step 4: Configure OAuth Consent Screen

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**

2. Choose **"External"** (unless you have a Google Workspace)
   - Click **"CREATE"**

3. Fill in the required fields:
   - **App name**: `INFRAALL`
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
   - Leave other fields as default

4. Click **"SAVE AND CONTINUE"**

5. On the "Scopes" page:
   - Click **"ADD OR REMOVE SCOPES"**
   - Select these scopes:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

6. On the "Test users" page:
   - Click **"ADD USERS"**
   - Add your Gmail address (for testing)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

7. Review and click **"BACK TO DASHBOARD"**

---

### Step 5: Create OAuth 2.0 Credentials

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**

2. Click the **"+ CREATE CREDENTIALS"** button at the top

3. Select **"OAuth client ID"**

4. Choose **"Web application"** from the dropdown

5. Fill in the details:

   **Name**: `INFRAALL Web Client`

   **Authorized JavaScript origins**:
   - Click **"+ ADD URI"**
   - Add: `http://localhost:5173` (frontend)
   - Click **"+ ADD URI"** again
   - Add: `http://localhost:5000` (backend)

   **Authorized redirect URIs**:
   - Click **"+ ADD URI"**
   - Add: `http://localhost:5000/api/auth/google/callback`

6. Click **"CREATE"**

---

### Step 6: Copy Your Credentials

A popup will appear with your credentials:

```
Your Client ID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[YOUR_CLIENT_ID].apps.googleusercontent.com

Your Client Secret
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GOCSPX-[YOUR_CLIENT_SECRET]
```

**IMPORTANT**: 
- ✅ Copy both values immediately
- ✅ Keep them secure (don't share publicly)
- ✅ You can always view them again from the Credentials page

---

### Step 7: Update Your .env Files

#### Backend `.env` (ABC-main/backend/.env)

Replace these lines:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

With your actual credentials:
```env
GOOGLE_CLIENT_ID=[YOUR_CLIENT_ID].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-[YOUR_CLIENT_SECRET]
```

#### Frontend `.env` (ABC-main/frontend/.env)

Replace this line:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

With your actual Client ID:
```env
VITE_GOOGLE_CLIENT_ID=[YOUR_CLIENT_ID].apps.googleusercontent.com
```

**Note**: Only the Client ID goes in the frontend, NOT the Client Secret!

---

### Step 8: Restart Your Servers

After updating the .env files, restart both servers:

```bash
# Stop current servers (Ctrl+C in each terminal)

# Restart backend
cd ABC-main/backend
npm run dev

# Restart frontend (in a new terminal)
cd ABC-main/frontend
npm run dev
```

---

### Step 9: Test Google Sign-In

1. Open your browser and go to: **http://localhost:5173/login**

2. You should see the **"Continue with Google"** button

3. Click it and select your Google account

4. If it's your first time:
   - Enter your mobile number
   - Verify the OTP
   - Account created!

5. If you've signed in before:
   - You'll be logged in immediately

---

## 🎯 Quick Reference

### Where to Find Your Credentials Later

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to: **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Your credentials are displayed there

---

## 🔒 Security Tips

✅ **DO**:
- Keep your Client Secret private
- Add it to `.gitignore` (already done)
- Use environment variables (already done)
- Regenerate if accidentally exposed

❌ **DON'T**:
- Share your Client Secret publicly
- Commit it to GitHub
- Use the same credentials for production (create separate ones)

---

## 🐛 Troubleshooting

### "Access blocked: This app's request is invalid"
**Solution**: Make sure you added your email as a test user in OAuth consent screen

### "Redirect URI mismatch"
**Solution**: Check that you added `http://localhost:5000/api/auth/google/callback` exactly

### "Invalid client ID"
**Solution**: 
1. Check for typos in .env files
2. Make sure you copied the full Client ID
3. Restart servers after updating .env

### Google button not showing
**Solution**:
1. Check frontend .env has `VITE_GOOGLE_CLIENT_ID`
2. Restart frontend server
3. Clear browser cache (Ctrl+Shift+Delete)

---

## 📱 For Production Deployment

When you're ready to deploy:

1. Go back to Google Cloud Console
2. Edit your OAuth 2.0 Client ID
3. Add production URLs:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://api.yourdomain.com/api/auth/google/callback`
4. Update your production .env files with the same credentials
5. Change OAuth consent screen from "Testing" to "In Production"

---

## 📞 Need Help?

If you get stuck:
1. Check the error message in browser console (F12)
2. Check backend terminal for errors
3. Verify all URLs match exactly (no trailing slashes)
4. Make sure you enabled Google+ API

---

## ✅ Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Added test user (your email)
- [ ] Created OAuth 2.0 credentials
- [ ] Added authorized origins (localhost:5173, localhost:5000)
- [ ] Added redirect URI (localhost:5000/api/auth/google/callback)
- [ ] Copied Client ID and Client Secret
- [ ] Updated backend .env with both credentials
- [ ] Updated frontend .env with Client ID only
- [ ] Restarted both servers
- [ ] Tested Google Sign-In button appears
- [ ] Tested signing in with Google account

---

**Estimated Time**: 10-15 minutes  
**Difficulty**: Easy  
**Cost**: Free (Google Cloud free tier)

---

## 🎉 You're Done!

Once you complete these steps, your Google Sign-In will be fully functional!

Test it at: **http://localhost:5173/login**
