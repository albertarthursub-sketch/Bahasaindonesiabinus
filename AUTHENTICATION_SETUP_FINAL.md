# 🔐 Authentication Setup - Final Steps

## Current Status ✅

Your authentication system is **almost ready**! Here's what's been done:

✅ Firebase Project ID configured: `bahasa-indonesia-73d67`  
✅ Cloud Functions built successfully  
✅ Frontend UI ready at http://localhost:3000  
✅ Protected routes active  
✅ Mock mode enabled (OTP: 123456)  

---

## 📧 Gmail/OTP Configuration Required

To enable **real email OTP sending**, add these to your `.env` file:

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords** (at the bottom)
4. Select: Mail → Windows Computer
5. Copy the 16-character password shown

### Step 2: Generate JWT Secret

```bash
# Run this command to generate a random secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Add to `.env` File

Open `.env` and add these lines at the end:

```env
# Gmail Configuration (for sending OTP emails)
TEACHER_EMAIL_USER=your-gmail@gmail.com
TEACHER_EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# JWT Secret for token signing
JWT_SECRET=<paste-the-random-string-here>
```

**Replace:**
- `your-gmail@gmail.com` - Your Gmail address
- `xxxx xxxx xxxx xxxx` - The 16-character app password you copied
- `<paste-the-random-string-here>` - The result from the random generation command

---

## 🧪 Testing Authentication

### Test 1: Mock Mode (Works Now - No Setup)
```
URL: http://localhost:3000/teacher-login
Email: test@example.com
OTP: 123456
Expected: ✅ Login successful
```

### Test 2: Protected Routes (Works Now)
```
1. Login with mock mode
2. From dashboard, you can access: /teacher, /classes, /teacher-analytics
3. Without login, these redirect to /teacher-login
4. Logout clears session ✅
```

### Test 3: Real Email OTP (After Gmail Setup)
```
1. Add Gmail credentials to .env
2. Restart dev server: npm run dev
3. Go to http://localhost:3000/teacher-login
4. Enter your email: your-email@gmail.com
5. Check email for 6-digit code
6. Enter code to login ✅
```

---

## 🚀 Next Steps

### Immediate (Test Mock Mode)
1. ✅ Dev server running: http://localhost:3000
2. Visit: http://localhost:3000/teacher-login
3. Login with: test@example.com / OTP: 123456
4. Should see teacher dashboard

### After Gmail Setup (30 minutes)
1. Add Gmail credentials to .env
2. Restart dev server
3. Test with real email
4. Deploy to Firebase

### For Production (1-2 hours)
1. Complete Gmail setup above
2. Run: `firebase deploy --only functions`
3. Test with deployed functions
4. Monitor logs: `firebase functions:log --follow`

---

## 📝 Current `.env` Status

**✅ Already Configured:**
- Firebase API Key
- Firebase Project ID: `bahasa-indonesia-73d67`
- Claude API Key
- Stability API Key

**❌ Still Needed:**
- `TEACHER_EMAIL_USER` - Your Gmail address
- `TEACHER_EMAIL_PASSWORD` - Gmail app password
- `JWT_SECRET` - Random security token

---

## 🔍 Verification Checklist

- [x] Cloud Functions compile without errors
- [x] TypeScript build successful
- [x] Frontend server running on :3000
- [x] Firebase config in place
- [x] Protected routes working
- [x] Mock mode functional (OTP: 123456)
- [ ] Gmail credentials configured
- [ ] Real email OTP tested
- [ ] Production deployed

---

## 💡 Tips

**If you don't have 2-Step Verification on Google Account:**
1. Go to https://myaccount.google.com/security
2. Scroll to "Signing in to Google"
3. Click "2-Step Verification"
4. Follow the prompts
5. Then get App Password

**If you see "App passwords" is greyed out:**
1. Make sure 2-Step Verification is actually ON
2. Refresh the page
3. Try again

**Test email sending locally:**
```bash
# After adding Gmail creds to .env, restart:
npm run dev

# Then visit login page and try sending OTP
# Check console for errors if it fails
```

---

## 🎯 What's Working Right Now

✨ **Authentication Features**
- [x] Login page UI
- [x] Email validation
- [x] OTP validation (6-digit)
- [x] Mock mode (OTP: 123456)
- [x] Session management
- [x] Protected routes
- [x] Logout functionality
- [x] Firestore integration
- [x] Firebase Auth integration
- [x] Error handling

✨ **Dashboard Features**
- [x] Teacher dashboard
- [x] Class management
- [x] Student display
- [x] Time-based medals
- [x] Analytics
- [x] Logout button

---

## 🐛 Troubleshooting

**Q: "OTP code not sending to email"**
A: Add Gmail credentials to .env and restart dev server

**Q: "Can't login with real email"**
A: Check TEACHER_EMAIL_USER & TEACHER_EMAIL_PASSWORD in .env

**Q: "Mock mode not working"**
A: Use exact OTP: 123456

**Q: "Protected routes not working"**
A: Clear browser session storage and login again

---

## 📋 Environment Variables Reference

```env
# Frontend (Vite - auto-loaded)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=bahasa-indonesia-73d67
VITE_FIREBASE_AUTH_DOMAIN=bahasa-indonesia-73d67.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=bahasa-indonesia-73d67.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Backend (Cloud Functions - needs setup)
TEACHER_EMAIL_USER=your-email@gmail.com        # ← ADD THIS
TEACHER_EMAIL_PASSWORD=xxxx xxxx xxxx xxxx     # ← ADD THIS
JWT_SECRET=your-random-secret-string           # ← ADD THIS
```

---

## ✅ Ready to Test?

```bash
# Current status: DEV SERVER RUNNING ✅

# 1. Already running on: http://localhost:3000

# 2. Test mock mode:
#    - Go to: /teacher-login
#    - Email: test@example.com
#    - OTP: 123456

# 3. Ready for Gmail setup? See above ☝️
```

---

**Last Updated**: November 25, 2025  
**Status**: ✅ Ready for Testing  
**Next**: Add Gmail credentials & deploy

Questions? Check `QUICK_START.md` or `FIREBASE_SETUP.md`
