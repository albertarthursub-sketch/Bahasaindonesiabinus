# Security Fixes - Step-by-Step Implementation Guide

**Priority**: 🔴 CRITICAL - Must complete before production deployment  
**Estimated Time**: 2-4 hours  
**Date**: January 27, 2026

---

## Step 1: Rotate All API Keys (IMMEDIATE - 5 minutes)

### 1.1 Claude API Key
1. Go to https://console.anthropic.com/account/billing/overview
2. Click "View API Keys"
3. Delete the exposed key (check audit for details)
4. Create a new API key
5. Update in `.env`:
   ```
   CLAUDE_API_KEY=<new-key>
   VITE_CLAUDE_API_KEY=<new-key>
   ```

### 1.2 Stability AI Key
1. Go to https://platform.stability.ai/account/billing
2. Navigate to API Keys
3. Delete the exposed key (check audit for details)
4. Generate new key
5. Update in `.env`:
   ```
   STABILITY_API_KEY=<new-key>
   VITE_STABILITY_API_KEY=<new-key>
   ```

### 1.3 Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Login to Google account
3. Delete the exposed password (check audit for details)
4. Generate new App Password for "Mail"
5. Update in `.env`:
   ```
   TEACHER_EMAIL_PASSWORD=<new-app-password>
   ```

**Verification**: 
```bash
# Test email sending still works
curl -X POST http://localhost:5000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Step 2: Fix JWT Secret (5 minutes)

### 2.1 Generate Strong JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: <copy-this-long-string>
```

### 2.2 Update Environment
Create/update `.env`:
```bash
JWT_SECRET=<paste-the-generated-string>
```

### 2.3 Update server.js
Replace line 41:
```javascript
// BEFORE:
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

// AFTER:
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET must be set in environment variables');
  console.error('Set JWT_SECRET=<value> in .env or environment');
  process.exit(1);
}
```

---

## Step 3: Remove OTP Hardcoded Bypass (CRITICAL - 5 minutes)

### 3.1 In [server.js](server.js)
Find and DELETE lines 200-215 (the fallback for mock mode):

```javascript
// 🔴 DELETE THIS ENTIRE BLOCK:
      } catch (dbError) {
        console.warn('Firestore verification error:', dbError.message);
        // Fallback for mock mode
        if (otp === '123456') {
          const token = jwt.sign(
            { email: email.toLowerCase(), timestamp: Date.now() },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          res.json({ 
            success: true, 
            token: token,
            email: email.toLowerCase(),
            message: 'Login successful (mock mode)'
          });
        } else {
          res.status(401).json({ error: 'Invalid OTP' });
        }
      }
```

### 3.2 Replace with:
```javascript
      } catch (dbError) {
        console.error('Database error during OTP verification:', dbError.message);
        res.status(500).json({ error: 'Database error. Please try again.' });
      }
    } else {
      res.status(500).json({ error: 'Database not configured' });
    }
```

---

## Step 4: Fix Firestore Security Rules (10 minutes)

### 4.1 Review Changes
Compare current [firestore.rules](firestore.rules) with [firestore.rules.FIXED](firestore.rules.FIXED)

Key changes:
- Remove `|| true` from all read conditions
- Require `request.auth != null` for all reads
- Add proper authorization checks (match on `teacherId`, `studentId`)

### 4.2 Apply Fixed Rules
```bash
# Option A: Manual copy-paste
# 1. Open firestore.rules.FIXED
# 2. Copy all content
# 3. Paste into firestore.rules
# 4. Save

# Option B: Command line (Windows PowerShell)
Copy-Item "firestore.rules.FIXED" "firestore.rules" -Force

# Option C: Command line (Linux/Mac)
cp firestore.rules.FIXED firestore.rules
```

### 4.3 Deploy New Rules
```bash
firebase deploy --only firestore:rules

# Wait for confirmation:
# ✔ firestore:rules deployed successfully
```

### 4.4 Test Rules
```bash
# Try accessing data as unauthenticated user (should fail)
curl -H "X-Goog-User-Project: bahasa-indonesia-73d67" \
  "https://firestore.googleapis.com/v1/projects/bahasa-indonesia-73d67/databases/(default)/documents/lists"

# Should return: 403 Forbidden (Permission denied)
```

---

## Step 5: Fix Storage Security Rules (10 minutes)

### 5.1 Review Changes
Compare current [storage.rules](storage.rules) with [storage.rules.FIXED](storage.rules.FIXED)

Key changes:
- Remove `|| true` from all read conditions
- Require authentication for all reads
- Add user ID path restrictions

### 5.2 Apply Fixed Rules
```bash
# Windows PowerShell
Copy-Item "storage.rules.FIXED" "storage.rules" -Force

# Linux/Mac
cp storage.rules.FIXED storage.rules
```

### 5.3 Deploy New Rules
```bash
firebase deploy --only storage:rules

# Wait for confirmation:
# ✔ storage:rules deployed successfully
```

---

## Step 6: Add Input Validation (15 minutes)

### 6.1 Install Email Validator
```bash
npm install email-validator
```

### 6.2 Update server.js - OTP Endpoint

Find the `/api/send-otp` endpoint (around line 116) and replace email validation:

```javascript
// BEFORE:
if (!email || !email.includes('@')) {
  return res.status(400).json({ error: 'Valid email required' });
}

// AFTER:
const validator = require('email-validator');

if (!email || !validator.validate(email)) {
  return res.status(400).json({ error: 'Invalid email address' });
}

// Sanitize email
const sanitizedEmail = email.toLowerCase().trim();
```

Then replace all `email` with `sanitizedEmail` in that function.

---

## Step 7: Implement CORS Whitelist (10 minutes)

### 7.1 Update server.js - Line 30

Replace:
```javascript
// BEFORE:
app.use(cors());

// AFTER:
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(o => o) || [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000'
];

// In production, add:
// https://yourdomain.com
// https://www.yourdomain.com

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600
}));
```

### 7.2 Update .env
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

---

## Step 8: Add Rate Limiting (15 minutes)

### 8.1 Install Package
```bash
npm install express-rate-limit
```

### 8.2 Update server.js - Add After Imports

```javascript
import rateLimit from 'express-rate-limit';

// Rate limiting configuration
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many OTP requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 verification attempts
  skipSuccessfulRequests: true, // Don't count successful verifications
  message: 'Too many failed OTP verification attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.body.email}:${req.ip}`
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});
```

### 8.3 Apply Limiters to Routes

Find these routes and add rate limiting:

```javascript
// BEFORE:
app.post('/api/send-otp', async (req, res) => {

// AFTER:
app.post('/api/send-otp', otpLimiter, async (req, res) => {

// BEFORE:
app.post('/api/verify-otp', async (req, res) => {

// AFTER:
app.post('/api/verify-otp', verifyLimiter, async (req, res) => {

// Add to other API endpoints:
app.post('/api/generate-vocabulary', apiLimiter, async (req, res) => {
```

---

## Step 9: Add Security Headers (15 minutes)

### 9.1 Install Helmet
```bash
npm install helmet
```

### 9.2 Update server.js - After Imports

```javascript
import helmet from 'helmet';

// Apply security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.anthropic.com", "https://api.stability.ai", "https://*.firebaseapp.com"],
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
```

### 9.3 Add Body Size Limits

Find and update:
```javascript
// BEFORE:
app.use(express.json());

// AFTER:
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  limit: '10mb',
  extended: false 
}));
```

---

## Step 10: Clean Up .env from Git History (20 minutes)

### 10.1 Check if .env is tracked
```bash
git ls-files | findstr /I ".env"
```

If output shows `.env`, proceed to 10.2. If empty, skip to 10.3.

### 10.2 Remove .env from Git History
```bash
# This rewrites your entire git history
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all

# Force push to remote (WARNING: This affects shared repos)
git push origin --force --all
git push origin --force --tags

# Clean local repository
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now
```

**⚠️ WARNING**: This rewrites history. If others are using this repo, they'll need to re-clone.

### 10.3 Ensure .env in .gitignore
```bash
# Check if .env is in .gitignore
findstr ".env" .gitignore

# If not found, add it:
echo .env >> .gitignore
echo .env.local >> .gitignore
echo .env.*.local >> .gitignore

# Commit
git add .gitignore
git commit -m "Update .gitignore to exclude environment files"
```

---

## Step 11: Create .env.example Template (5 minutes)

Create [.env.example](.env.example):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID

# Backend Configuration
VITE_API_URL=http://localhost:5000
NODE_ENV=development

# API Keys (Backend Only - Never commit real values)
CLAUDE_API_KEY=sk-ant-...
VITE_CLAUDE_API_KEY=sk-ant-...
STABILITY_API_KEY=sk-...
VITE_STABILITY_API_KEY=sk-...

# Email Configuration (Gmail App Password)
TEACHER_EMAIL_USER=your-email@gmail.com
TEACHER_EMAIL_PASSWORD=your-app-password

# JWT Secret (Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secure-random-secret-key-here

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

---

## Testing Checklist

After implementing all fixes, test:

```bash
# 1. Test server starts
npm run dev:server
# Should NOT error about missing JWT_SECRET

# 2. Test OTP sending (rate limited after 5 attempts)
curl -X POST http://localhost:5000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 3. Test invalid OTP (no bypass with 123456)
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
# Should return 401, not success

# 4. Test CORS - request from unauthorized origin should fail
curl -X OPTIONS http://localhost:5000/api/health \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
# Should see CORS error in response

# 5. Test Firestore rules
# Try reading lists as unauthenticated user - should fail with permission denied

# 6. Test Storage rules
# Try downloading images as unauthenticated user - should fail
```

---

## Deployment Checklist

Before deploying to production:

```bash
# 1. All environment variables set
echo $JWT_SECRET
echo $CORS_ORIGINS
echo $NODE_ENV

# 2. No .env file in repository
git ls-files | grep ".env"

# 3. Security dependencies installed
npm ls helmet express-rate-limit email-validator

# 4. All tests passing
npm test

# 5. Firebase rules deployed
firebase deploy --only firestore:rules,storage:rules

# 6. HTTPS enabled on hosting
# For Vercel: Automatic
# For Firebase Hosting: Automatic
# For custom: Configure SSL certificate

# 7. Monitor logs for errors
firebase functions:log

# 8. Keep dependencies updated
npm audit
```

---

## Quick Reference - What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| **JWT Secret** | `'default-secret-key-change-in-production'` | `process.env.JWT_SECRET` (fails if not set) |
| **OTP Bypass** | `if (otp === '123456')` ✓ Allow | Removed entirely ✓ Blocked |
| **Firestore Reads** | `allow read: if request.auth != null \|\| true` | `allow read: if request.auth != null` |
| **Storage Reads** | `allow read: if true` | `allow read: if request.auth != null` |
| **CORS** | Allow all origins | Whitelist only authorized origins |
| **API Keys** | In .env file | In environment variables only |
| **Rate Limiting** | None | 5 OTP/15min, 10 verify/15min |

---

## Questions?

If you encounter any issues during implementation:

1. Check the error message carefully
2. Refer back to the [COMPREHENSIVE_SECURITY_AUDIT.md](COMPREHENSIVE_SECURITY_AUDIT.md)
3. Review the "Remediation" sections for each issue
4. Test in development environment first

---

**Status**: ✅ Ready for Implementation  
**Difficulty**: Medium (Requires code changes and Firebase rule deployments)  
**Estimated Total Time**: 2-4 hours
