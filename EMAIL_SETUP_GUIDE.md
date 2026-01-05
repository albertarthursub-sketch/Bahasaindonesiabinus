# 🔧 Email OTP Authentication Fix Guide

## Current Issue
❌ Gmail authentication failing with error: **"535-5.7.8 Username and Password not accepted"**

The App Password credentials in `.env` are not working with Gmail SMTP.

---

## Solution Steps

### Step 1: Generate a New Gmail App Password

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/
   - Sign in with: **arthurapp05@gmail.com**

2. **Enable 2-Step Verification (if not already done):**
   - Left sidebar → Security
   - Look for "2-Step Verification"
   - If not enabled, enable it now

3. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select: App = "Mail", Device = "Windows Computer" (or your device)
   - Click "Generate"
   - Google will show a 16-character password
   - **Copy this password**

4. **Update the .env file:**
   - Open: `functions/.env`
   - Replace the `TEACHER_EMAIL_PASSWORD` with the new 16-character password
   
   **Example:**
   ```
   TEACHER_EMAIL_USER=arthurapp05@gmail.com
   TEACHER_EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (new 16-char password from Google)
   JWT_SECRET=your-very-secure-random-string-at-least-32-characters
   ```

### Step 2: Redeploy Cloud Functions

Run these commands:

```powershell
cd functions
npm run build
firebase deploy --only functions
```

The deploy should show:
```
+  functions[sendOTP(us-central1)] ... deployed
+  functions[verifyOTP(us-central1)] ... deployed
+  functions[cleanupExpiredOTPs(us-central1)] ... deployed
+  functions[health(us-central1)] ... deployed
```

### Step 3: Test Email Delivery

1. **Go to the Sign Up page:**
   - http://localhost:3000/teacher-signup

2. **Request an OTP:**
   - Enter Name: "Test Teacher"
   - Enter Email: Your email (e.g., your.email@gmail.com)
   - Click "Request OTP Code"

3. **Check your inbox:**
   - Wait 10-15 seconds
   - Look for email from: **arthurapp05@gmail.com**
   - Subject: "Your Bahasa Learning Platform Login Code"
   - The email should contain the 6-digit code

4. **Verify OTP works:**
   - Go to http://localhost:3000/teacher-login
   - Enter same email
   - Enter the 6-digit code from the email
   - Click Login
   - Should redirect to /teacher dashboard

---

## Troubleshooting

### If email still not working:

**Check Firebase Logs:**
```powershell
firebase functions:log --only sendOTP
```

Look for:
- ✅ "OTP email sent to" = Email sent successfully
- ❌ "Error sending OTP email: EAUTH" = Authentication failed (get new App Password)
- ❌ "Error sending OTP email: ECONNREFUSED" = Network issue

### Common Errors:

| Error | Cause | Fix |
|-------|-------|-----|
| EAUTH 535 | Invalid App Password | Generate new App Password |
| ECONNREFUSED | Network blocked | Check firewall/VPN |
| ETIMEDOUT | Gmail server slow | Retry request |

---

## Current Configuration

**Email Account:** arthurapp05@gmail.com
**SMTP Server:** smtp.gmail.com:587
**Security:** TLS (not SSL)
**Functions Deployed:** 4 (sendOTP, verifyOTP, cleanupExpiredOTPs, health)

---

## What Happens After Fix

✅ User requests OTP on Sign Up page
✅ Firebase Cloud Function generates 6-digit code
✅ Code stored in Firestore with 10-minute expiry
✅ **Email sent to user's inbox** with code
✅ User enters code on Login page
✅ Code validated against Firestore
✅ Custom token generated and returned
✅ User logged in and redirected to dashboard

---

## Next Steps

1. Get new App Password from Google
2. Update `functions/.env`
3. Redeploy functions
4. Test the flow end-to-end
