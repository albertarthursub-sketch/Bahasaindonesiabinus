# Firebase Cloud Functions Setup for Bahasa Learning Platform

This document explains how to set up and deploy Firebase Cloud Functions for OTP authentication.

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
