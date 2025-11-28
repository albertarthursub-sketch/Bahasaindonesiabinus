# Firebase Setup Guide for Bahasa Learning Platform

## CRITICAL: App Registration & OAuth Configuration

### 🚨 Issue: "Auth pop-up blocked" on iPad/Chrome & Other Devices

This error occurs when:
1. **App is NOT registered in Firebase Console**
2. **Unauthorized redirect URIs** in OAuth settings
3. **Google OAuth consent screen** not properly configured
4. **Pop-up blockers** on Safari/browsers (especially mobile)

---

## ✅ PART 1: Firebase App Registration

### A. Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Select your project: **Bahasaindonesiabinus** (or your project name)
3. Click the **Web App** icon (</> icon) in the project overview

### B. Register a New Web App
1. Click **"Add app"** → Select **Web** (</> icon)
2. App name: `Bahasa Learning - Web`
3. Click **"Register app"**

### C. Copy Your Firebase Config
Firebase will show you a config object. Verify these match your `.env` file:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
```

---

## ✅ PART 2: Configure Google OAuth Consent Screen

### A. Enable Google Sign-In API
1. Go to: https://console.cloud.google.com/apis/dashboard
2. Click **"+ ENABLE APIS AND SERVICES"**
3. Search for: **"Google+ API"** or **"Identity Platform"**
4. Click **Enable**

### B. Set Up OAuth Consent Screen
1. Go to: **APIs & Services** → **OAuth consent screen**
2. Choose: **External** (for testing/development)
3. Click **Create**

**Fill in the form:**
- **App name:** Bahasa Learning Platform
- **User support email:** your-email@gmail.com
- **Developer contact:** your-email@gmail.com
- Click **Save and Continue**

### C. Add Scopes
1. Click **"Add or Remove Scopes"**
2. Add: `email`, `profile`, `openid`
3. Click **Update** → **Save and Continue**

### D. Add Test Users (CRITICAL!)
1. Click **"Add Users"**
2. Add all test email addresses:
   - Your Gmail
   - iPad Gmail account
   - Any other test accounts
3. Click **Save and Continue**

---

## ✅ PART 3: Configure Authorized Redirect URIs

### A. Find Your OAuth Client
1. Go to: **APIs & Services** → **Credentials**
2. Click on **OAuth 2.0 Client ID** (Web application)

### B. Add All Redirect URIs
**Development (Local):**
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

**Local Network (iPad Testing):**
```
http://192.168.1.x:3000
http://192.168.1.x:5173
```
(Replace 192.168.1.x with your computer IP - run `ipconfig` on Windows)

**Production (Vercel):**
```
https://your-app-name.vercel.app
https://your-app-name.vercel.app/
```

3. Click **Save**

---

## ✅ PART 4: Enable Firebase Auth Methods

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. **Enable Google** - Select your support email
3. **Enable Email/Password** 
4. Click **Save**

---

## ✅ PART 5: Test on Different Devices

**On Laptop:**
```
http://localhost:3000
```

**On iPad (same WiFi):**
1. Get your computer IP: `ipconfig` (Windows) or `ifconfig` (Mac)
2. On iPad open: `http://YOUR-COMPUTER-IP:3000`

**On iPad (Vercel):**
- Open your Vercel URL
- Make sure it's in Authorized Redirect URIs

---

## Cloud Functions Setup (Optional)

---

## Prerequisites

1. **Firebase Project**: Create one at [Firebase Console](https://console.firebase.google.com/)
2. **Firebase CLI**: Install with `npm install -g firebase-tools`
3. **Node.js**: Version 18 or higher
4. **Google Account**: For Gmail SMTP configuration (optional but recommended)

## Setup Instructions

### Step 1: Initialize Firebase Project

```bash
# Update .firebaserc with your Firebase project ID
# Replace "your-firebase-project-id" with your actual project ID
firebase login
firebase init
```

### Step 2: Configure Environment Variables

Create `.env` file in the root directory with:

```env
# Gmail Configuration (for sending OTPs)
TEACHER_EMAIL_USER=your-email@gmail.com
TEACHER_EMAIL_PASSWORD=your-app-password

# JWT Configuration
JWT_SECRET=your-very-secure-random-string-at-least-32-characters
```

**Note**: For Gmail, you must use an **App Password**, not your regular Gmail password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Generate an App Password for "Mail" and "Windows Computer"
4. Use this 16-character password in TEACHER_EMAIL_PASSWORD

### Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..
```

### Step 4: Build Functions

```bash
cd functions
npm run build
cd ..
```

### Step 5: Test Locally (Optional)

```bash
# Start Firebase Emulator
firebase emulators:start --only functions

# In another terminal, you can test:
curl -X POST http://localhost:5001/your-project-id/us-central1/sendOTP \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Step 6: Deploy to Firebase

```bash
# Deploy functions and hosting
firebase deploy

# Or deploy only functions
firebase deploy --only functions
```

After deployment, note the Cloud Function URLs from the console output:
- `sendOTP`: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendOTP`
- `verifyOTP`: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/verifyOTP`
- `health`: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/health`

### Step 7: Update TeacherAuth Component

The `TeacherAuth.jsx` component automatically reads the Firebase Project ID from `firebaseConfig.js`. Ensure it's correctly configured:

```javascript
// src/firebase.js should have your Firebase config:
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",  // This is used by TeacherAuth.jsx
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890"
};
```

## Testing the OTP System

### Without Email Service (Mock Mode)

1. Go to the login page: `http://localhost:5173/teacher-login`
2. Enter any email address
3. When prompted for OTP, enter `123456`
4. You'll be logged in to the teacher dashboard

### With Email Service (Production)

1. Ensure environment variables are set correctly
2. Go to login page
3. Enter your email
4. Check your email for the 6-digit OTP
5. Enter the OTP (expires in 10 minutes)
6. You'll be logged in

## Cloud Functions Overview

### `sendOTP` Function
- **Endpoint**: `POST /sendOTP`
- **Input**: `{ email: "teacher@example.com" }`
- **Output**: `{ success: true, message: "OTP sent to your email", mockMode: false }`
- **Actions**:
  - Generates random 6-digit OTP
  - Stores in Firestore with 10-minute expiry
  - Sends email via Gmail SMTP

### `verifyOTP` Function
- **Endpoint**: `POST /verifyOTP`
- **Input**: `{ email: "teacher@example.com", otp: "123456" }`
- **Output**: `{ success: true, token: "custom-token", email: "teacher@example.com" }`
- **Actions**:
  - Validates OTP against stored record
  - Checks expiry time
  - Marks OTP as verified
  - Returns Firebase custom token for authentication

### `cleanupExpiredOTPs` Function
- **Type**: Scheduled (runs every hour)
- **Actions**:
  - Deletes expired unverified OTPs from Firestore
  - Keeps database clean

### `health` Function
- **Endpoint**: `GET /health`
- **Output**: Status information and email configuration status

## Firestore Collections

### `teacherOTPs` Collection

Each document contains:
```javascript
{
  email: "teacher@example.com",
  otp: "123456",
  expiryTime: Timestamp,
  verified: false,
  createdAt: Timestamp,
  verifiedAt: Timestamp (added when verified),
  attempts: 0
}
```

## Security Considerations

1. **OTP Expiry**: Set to 10 minutes (configurable in `functions/src/index.ts`)
2. **CORS**: Configured to accept requests from origin (update for production)
3. **Rate Limiting**: Implement via Firebase Cloud Functions rate limiting rules (future enhancement)
4. **Email Verification**: Consider adding domain whitelist for email sending

## Troubleshooting

### "Cloud Functions not found" error
- Verify your `.firebaserc` has correct project ID
- Check that `firebase deploy` completed successfully
- Wait a few minutes for deployment to propagate

### "Gmail authentication failed"
- Verify you're using App Password, not regular Gmail password
- Check 2-Step Verification is enabled on Google Account
- Verify TEACHER_EMAIL_USER matches the Gmail account used for App Password

### "OTP expired" error
- Adjust OTP_EXPIRY_MINUTES in `functions/src/index.ts` (line 15)
- Default is 10 minutes

### "Firestore permission denied"
- Update Firestore Security Rules:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /teacherOTPs/{document=**} {
        allow create: if request.auth != null;
        allow read, write: if false;
      }
    }
  }
  ```

## Production Deployment Checklist

- [ ] Update `.firebaserc` with production project ID
- [ ] Set all environment variables in Firebase Functions settings
- [ ] Enable Authentication in Firebase Console
- [ ] Update Firestore Security Rules
- [ ] Configure custom domain (optional)
- [ ] Set up CloudWatch or Firebase monitoring
- [ ] Update TeacherAuth component with production URLs
- [ ] Test OTP flow end-to-end
- [ ] Set up backup for Firestore data

## Commands Reference

```bash
# Install all dependencies
npm install && cd functions && npm install && cd ..

# Build functions
cd functions && npm run build && cd ..

# Test locally
firebase emulators:start --only functions

# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# View logs
firebase functions:log

# Open Firebase Console
firebase open
```

## Support

For Firebase Cloud Functions documentation: [Firebase Docs](https://firebase.google.com/docs/functions)
