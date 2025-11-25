# Quick Start Guide - Firebase Cloud Functions OTP Authentication

Get up and running with the new OTP authentication system in 5 minutes!

## 🚀 Quick Setup

### 1. Prerequisites Check
```bash
# Verify Node.js 18+
node --version

# Verify Firebase CLI
firebase --version
# If not installed:
npm install -g firebase-tools
```

### 2. Configure Project
```bash
# Edit .firebaserc (replace with your Firebase project ID)
# Find project ID at: firebase.google.com > Your Project > Settings

# Then:
npm install
cd functions && npm install && cd ..
```

### 3. Create Environment File
```bash
# Copy template
cp .env.example .env

# Edit .env with your credentials:
# - TEACHER_EMAIL_USER (Gmail address)
# - TEACHER_EMAIL_PASSWORD (Gmail app password - NOT regular password)
# - JWT_SECRET (random string)
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if needed)
3. Generate App Password for "Mail" and "Windows"
4. Copy the 16-character password to TEACHER_EMAIL_PASSWORD

### 4. Deploy Cloud Functions
```bash
# Build TypeScript
cd functions && npm run build && cd ..

# Deploy to Firebase
firebase deploy --only functions
```

**Done!** 🎉

---

## 📝 Testing

### Test with Mock Mode (No Email)
```bash
# Start dev server
npm run dev

# Visit: http://localhost:5173/teacher-login
# Enter: any email (e.g., test@example.com)
# OTP: 123456
# Login successful!
```

### Test with Real Email
1. Deploy Cloud Functions (see above)
2. Visit: `http://localhost:5173/teacher-login`
3. Enter your email
4. Check email for 6-digit code
5. Enter OTP and login

---

## 🏗️ What You Get

✅ Secure email OTP authentication  
✅ Automatic teacher dashboard access  
✅ Protected routes with logout  
✅ Automatic OTP cleanup (every hour)  
✅ Mock mode for testing  

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `functions/src/index.ts` | Cloud Functions code |
| `src/pages/TeacherAuth.jsx` | Login page |
| `src/pages/TeacherDashboard.jsx` | Dashboard (protected) |
| `.firebaserc` | Your Firebase project ID |
| `.env` | Gmail & JWT secrets |
| `firebase.json` | Deployment config |

---

## 🔗 Cloud Function URLs

After deployment, your functions are at:

```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendOTP
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/verifyOTP
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/health
```

These are automatically used by the frontend! ✨

---

## ⚠️ Common Issues

### "Cloud Functions not found"
```bash
# Make sure you deployed:
firebase deploy --only functions

# Check project ID in .firebaserc matches your Firebase project
```

### "Gmail not sending OTPs"
- Verify using App Password (not regular Gmail password)
- Check 2-Step Verification is enabled on Google Account
- Verify TEACHER_EMAIL_USER in .env matches Gmail account

### "OTP expires too quickly"
- Default: 10 minutes
- Edit in `functions/src/index.ts` line 15: `OTP_EXPIRY_MINUTES`

---

## 📚 Learn More

- Full setup guide: `FIREBASE_SETUP.md`
- Deployment guide: `DEPLOYMENT.md`
- Migration summary: `MIGRATION_SUMMARY.md`
- Main README: `README.md`

---

## 🎯 Next Steps

- [ ] Run `npm install` and build functions
- [ ] Update `.firebaserc` with your project ID
- [ ] Create `.env` with credentials
- [ ] Deploy: `firebase deploy --only functions`
- [ ] Test with mock mode (OTP: 123456)
- [ ] Test with real email

---

## 💬 Need Help?

| Issue | Command |
|-------|---------|
| Check status | `firebase functions:log` |
| View errors | `firebase functions:log --follow` |
| Test locally | `firebase emulators:start --only functions` |
| Redeploy | `firebase deploy --only functions` |

---

**You're all set!** 🚀 Visit `/teacher-login` to try it out.
