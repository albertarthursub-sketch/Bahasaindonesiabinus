# 🚀 PRODUCTION LIVE - Quick Reference Card

## 📍 Your App is Live!

```
Frontend: https://bahasa-indonesia-73d67.web.app
Teacher Login: https://bahasa-indonesia-73d67.web.app/teacher-login
```

---

## 🎯 Cloud Functions Deployed

| Function | URL | Method | Status |
|----------|-----|--------|--------|
| sendOTP | https://us-central1-bahasa-indonesia-73d67.cloudfunctions.net/sendOTP | POST | ✅ LIVE |
| verifyOTP | https://us-central1-bahasa-indonesia-73d67.cloudfunctions.net/verifyOTP | POST | ✅ LIVE |
| health | https://us-central1-bahasa-indonesia-73d67.cloudfunctions.net/health | GET | ✅ LIVE |

---

## 📋 Quick Commands

### View Logs
```bash
firebase functions:log --follow
```

### Deploy Functions
```bash
cd functions && npm run build && firebase deploy --only functions
```

### Deploy Frontend
```bash
npm run build && firebase deploy --only hosting
```

### Deploy Everything
```bash
firebase deploy
```

### Check Function Status
```bash
firebase functions:list
```

---

## 🧪 Quick Tests

### Test 1: Health Check
```bash
curl https://us-central1-bahasa-indonesia-73d67.cloudfunctions.net/health
```

### Test 2: Send OTP
```bash
curl -X POST https://us-central1-bahasa-indonesia-73d67.cloudfunctions.net/sendOTP \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test 3: Frontend
```
Open: https://bahasa-indonesia-73d67.web.app/teacher-login
```

---

## 🔧 Important Links

| Link | Purpose |
|------|---------|
| https://console.firebase.google.com/project/bahasa-indonesia-73d67/ | Firebase Console |
| https://console.firebase.google.com/project/bahasa-indonesia-73d67/functions | Cloud Functions Dashboard |
| https://console.firebase.google.com/project/bahasa-indonesia-73d67/firestore | Firestore Database |
| https://console.firebase.google.com/project/bahasa-indonesia-73d67/hosting | Hosting Dashboard |

---

## 📧 Enable Email OTP

### In Firebase Console:
1. Go to Cloud Functions → sendOTP → Runtime Settings
2. Add environment variables:
   - `TEACHER_EMAIL_USER`: your-email@gmail.com
   - `TEACHER_EMAIL_PASSWORD`: 16-char-app-password
3. Redeploy: `firebase deploy --only functions`

---

## 📊 Project Info

| Field | Value |
|-------|-------|
| Project ID | bahasa-indonesia-73d67 |
| Region | us-central1 |
| Runtime | Node.js 20 |
| Database | Firestore |
| Hosting | Firebase Hosting |
| SSL | Automatic |

---

## ✅ Status: PRODUCTION READY

- ✅ Frontend deployed
- ✅ Cloud Functions deployed
- ✅ Database configured
- ✅ Authentication working
- ✅ HTTPS enabled
- ✅ Logging active
- 🟡 Email (optional - not yet configured)
- 🟡 Security Rules (open for testing)

---

## 🆘 Quick Troubleshooting

**Page won't load?**
```bash
firebase deploy --only hosting
```

**Function returning 500?**
```bash
firebase functions:log --follow
```

**Can't send emails?**
Set TEACHER_EMAIL_USER and TEACHER_EMAIL_PASSWORD in Firebase Console

**Auth token invalid?**
Clear browser cache, check Firestore OTP validation

---

## 📞 Documentation

- `PRODUCTION_QUICKSTART.md` - How to use production
- `PRODUCTION_DEPLOYMENT.md` - Detailed setup info
- `DEPLOYMENT_SUMMARY.md` - Complete overview

---

**Last Updated**: 2025-11-25 | **Status**: ✅ LIVE & READY
