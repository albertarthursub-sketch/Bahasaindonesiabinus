# 🚀 Vercel Environment Variables Setup Guide

## Problem
You got an error about missing API environment keys when deploying to Vercel.

## Solution
The `.env` file is **NOT** deployed to Vercel (for security reasons). You must add environment variables in Vercel's dashboard.

---

## Step-by-Step Setup

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Find your `bahasa-learning` project
- Click on it to open

### 2. Navigate to Settings
- Click **Settings** tab at the top
- Select **Environment Variables** from left menu

### 3. Add Environment Variables

Add each of these variables (copy from your local `.env` file):

```
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=bahasa-indonesia-73d67.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bahasa-indonesia-73d67
VITE_FIREBASE_STORAGE_BUCKET=bahasa-indonesia-73d67.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=110928773130
VITE_FIREBASE_APP_ID=1:110928773130:web:bfa1f94f609c0bb2801ff3
VITE_STABILITY_API_KEY=<your-stability-api-key>
VITE_CLAUDE_API_KEY=<your-claude-api-key>
VITE_API_URL=https://bahasa-learning-api.vercel.app
```

**For Production Only:**
- Set `VITE_API_URL` to your production API URL (not localhost:5000)

### 4. Add Each Variable

1. Click **"Add New"** button
2. Enter the variable name (e.g., `VITE_FIREBASE_API_KEY`)
3. Enter the value from your `.env` file
4. Make sure **Environment** is set to **Production** (or both if you want preview deploys to have them too)
5. Click **Save**
6. Repeat for all variables

### 5. Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **...** menu
4. Select **Redeploy**
5. Confirm

Vercel will now rebuild with the environment variables loaded.

---

## What You Just Pushed to GitHub ✅

The latest commit includes:

1. **Enhanced `.env` file** with:
   - `VITE_API_URL=http://localhost:5000`
   - `VITE_CLAUDE_API_KEY` (with VITE_ prefix)
   - `VITE_STABILITY_API_KEY`
   - All Firebase configuration

2. **Better Error Handling** in code:
   - Checks if `VITE_API_URL` exists before using
   - Clear error messages if env vars are missing
   - Better debugging logs

3. **Deployment Configuration**:
   - `vercel.json` already has env var mappings
   - `.vercelignore` keeps `.env` out of deployments
   - SPA routing rewrites configured

---

## Important Notes

### Security
- ✅ `.env` file is in `.gitignore` - **NOT pushed to GitHub**
- ✅ Vercel doesn't expose env vars to client (with `VITE_` prefix they're safe)
- ✅ Only add non-sensitive config to GitHub

### Vercel vs Local
| Environment | `.env` file | Vercel Dashboard |
|-------------|-----------|------------------|
| Local Dev | ✅ Used | ❌ Ignored |
| Vercel Production | ❌ Not deployed | ✅ Must be added |

### Troubleshooting

**Still getting env var errors after redeploy?**
1. Clear browser cache (Ctrl+Shift+Del)
2. Check Vercel build logs for which var is missing
3. Verify variable name is EXACTLY correct (case-sensitive)
4. Redeploy again

**Build succeeds but app shows blank?**
1. Check browser console for errors (F12)
2. Verify API endpoint is reachable
3. Check if API server is running (if using localhost, it won't work on Vercel)

---

## Next Steps

1. ✅ Code pushed to GitHub (done)
2. ⏭️ Add env vars in Vercel dashboard (do this now)
3. ⏭️ Redeploy on Vercel
4. ⏭️ Test live URL
5. ⏭️ Update API endpoints if using production API

---

**Status**: Ready for Vercel deployment
**Last Update**: November 27, 2025

