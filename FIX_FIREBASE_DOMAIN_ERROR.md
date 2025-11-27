# 🔧 Fix Firebase Auth/Unauthorized-Domain Error

## Problem
After deploying to Vercel, you get: **"Error (auth/unauthorized-domain)"** when trying to login/signup.

## Root Cause
Firebase doesn't recognize your Vercel domain as authorized. You need to whitelist it.

---

## Solution: Add Vercel Domain to Firebase

### Step 1: Get Your Vercel URL
1. Go to https://vercel.com/dashboard
2. Click on **bahasa-learning** project
3. Copy your deployment URL (looks like: `https://bahasa-learning-xyz123.vercel.app`)

### Step 2: Add Domain to Firebase

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select your **bahasa-indonesia-73d67** project
3. Go to **Authentication** (left menu)
4. Click **Settings** (gear icon, top right)
5. Click **Authorized domains** tab
6. Click **Add domain**
7. Paste your Vercel URL (WITHOUT `https://` prefix)
   
   **Example**: `bahasa-learning-xyz123.vercel.app`

8. Click **Add**
9. Wait 5 minutes for changes to propagate

### Step 3: Test

1. Go to your Vercel URL
2. Try to login or signup
3. Should work now! ✅

---

## Add These Domains (Just in Case)

While you're in Firebase Authorized domains, add these too:

- `localhost:3000` (local development)
- `localhost:5000` (local API)
- `127.0.0.1:3000` (local testing)

This way you won't get the error locally either.

---

## Firebase Console Path

**Firebase Console** → **Authentication** → **Settings** → **Authorized domains**

![Path: Projects > Select Project > Authentication > Settings (⚙️) > Authorized domains]

---

## Still Getting Error?

### Clear Everything and Try Again

1. **Browser**: Clear cache (Ctrl+Shift+Del)
2. **Firebase Console**: Refresh page (F5)
3. **Vercel**: Hard refresh (Ctrl+F5)
4. **Wait**: Give Firebase 5 minutes to sync

### Check Domain Format

✅ **Correct**: `bahasa-learning-xyz.vercel.app`
❌ **Wrong**: `https://bahasa-learning-xyz.vercel.app`
❌ **Wrong**: `bahasa-learning-xyz.vercel.app/` (with slash)

### Verify in Code

Your Firebase config in `.env` should have:
```
VITE_FIREBASE_AUTH_DOMAIN=bahasa-indonesia-73d67.firebaseapp.com
```

This is your Firebase project domain (different from Vercel domain - this is correct).

---

## Complete Authorized Domains List

After adding Vercel URL, your list should look like:

- `localhost:3000`
- `127.0.0.1:3000`
- `bahasa-learning-xyz123.vercel.app` (your actual Vercel URL)

---

## Why This Happens?

Firebase has security restrictions:
- Only allows authentication from whitelisted domains
- Prevents unauthorized apps from using your Firebase project
- Each deployment gets a new Vercel URL, so each needs to be added

---

## Timeline

1. Add domain → **Immediate** (UI updates)
2. Backend sync → **1-5 minutes** (Firebase servers)
3. Test → **After sync** (should work)

If still not working after 10 minutes, try clearing browser cache and reloading.

---

## Success Indicators

✅ Login form submits
✅ No "auth/unauthorized-domain" error
✅ Can create teacher account
✅ Can create student account

