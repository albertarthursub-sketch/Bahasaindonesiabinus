# 📧 Enable Email OTP - Firebase Console Setup

## Current Status
- ✅ Cloud Functions deployed
- ✅ `.env.local` created for local testing
- ❌ Environment variables NOT yet in Firebase Console
- ❌ OTPs still not being emailed

## Quick Fix (2 minutes)

### Step 1: Open Firebase Cloud Functions Dashboard
Go to: **https://console.firebase.google.com/project/bahasa-indonesia-73d67/functions/list**

### Step 2: Select sendOTP Function
Click on the **sendOTP** function from the list

### Step 3: Open Runtime Settings
Look for **Settings** or **Runtime settings** (usually in top right area)

You should see something like:
```
Runtime settings
├── Memory: 256 MB
├── Timeout: 60 seconds
├── Region: us-central1
└── Runtime environment variables: [empty]
```

### Step 4: Add Environment Variables
Click **+ Add variable** and add these TWO variables:

**Variable 1:**
```
Name: TEACHER_EMAIL_USER
Value: arthurapp05@gmail.com
```

**Variable 2:**
```
Name: TEACHER_EMAIL_PASSWORD
Value: ltdhurqwjvdopjm
```

**Important**: Use password **without spaces**: `ltdhurqwjvdopjm` not `ltdh uorq wjvd opjm`

### Step 5: Save
- Click **Save** or **Deploy**
- Wait 1-2 minutes for deployment

---

## Verify It Worked

### Check Logs
```bash
firebase functions:log --follow
```

### Test Send OTP
1. Go to: https://bahasa-indonesia-73d67.web.app/teacher-login
2. Enter email: `arthurapp05@gmail.com`
3. Click "Send OTP Code"
4. Watch logs - you should see:
   ```
   OTP for arthurapp05@gmail.com: 123456
   Email sent to arthurapp05@gmail.com
   ```

### Check Your Email
- Open Gmail: https://mail.google.com
- Login to: `arthurapp05@gmail.com`
- Look for email with subject: "Your Bahasa Learning Platform Login Code"
- Copy the OTP and use it to login!

---

## Screenshots/Visual Guide

### In Firebase Console:
1. Go to Cloud Functions → Click sendOTP
2. In the top bar, look for a gear icon or "Settings"
3. Click it to open Runtime settings
4. Scroll down to "Runtime environment variables"
5. Click "Add variable" 
6. Enter the two variables above
7. Click "Deploy" or "Save"

---

## Troubleshooting

### "Still not showing environment variables"
- Try refreshing the page
- Make sure you're in the right project: `bahasa-indonesia-73d67`
- Try clicking the function name again

### "Email not arriving"
- Check SPAM folder in Gmail
- Verify no typos in the password (exactly: `ltdhurqwjvdopjm`)
- Check logs: `firebase functions:log --follow`

### "Can't find Runtime settings button"
- Look for a gear/settings icon in the function details page
- Or try right-clicking on the function name
- Should be near the top right of the page

---

## What We Already Did ✅

```
✅ Cloud Functions deployed (v1 1st Gen)
✅ Created .env.local in functions folder
✅ Email credentials added to root .env
❌ Email credentials NOT YET in Firebase Console (DO THIS NOW)
```

---

## After You Set Environment Variables

Everything else is already done:
- ✅ Frontend deployed
- ✅ Authentication working
- ✅ OTP generation working
- ⏳ Email sending (waiting for env vars in Firebase)
- ✅ Firestore configured
- ✅ Protected routes ready

Just need these environment variables in Firebase Console and you're done! 🚀

---

**Do this now and OTPs will be sent to emails!** 📧

Estimated time: **5 minutes**
