# Deployment Guide for Bahasa Learning Platform

Complete guide to deploy the application to Firebase Cloud Functions and Hosting.

## Prerequisites

1. Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Google Cloud Project associated with Firebase
4. Gmail account with App Password configured
5. Node.js 18+ installed

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Enter project name: `bahasa-learning`
4. Accept terms and create project
5. Wait for project to initialize

### 1.2 Enable Services
In Firebase Console:
1. Go to Build → Firestore Database → Create Database
   - Choose: Start in production mode
   - Location: Choose closest region
2. Go to Build → Authentication
   - Enable: Email/Password (for testing)
3. Go to Build → Storage → Create bucket (optional, for future features)

### 1.3 Get Project ID
- Find in Firebase Console settings
- It's listed as "Project ID"
- Also visible in all service URLs

## Step 2: Local Configuration

### 2.1 Update Project Configuration

```bash
# Update .firebaserc with your project ID
# Replace YOUR_PROJECT_ID with actual ID
sed -i 's/"default": "your-firebase-project-id"/"default": "YOUR_PROJECT_ID"/' .firebaserc

# Or manually edit .firebaserc:
# {
#   "projects": {
#     "default": "your-actual-project-id"
#   }
# }
```

### 2.2 Create Environment File

```bash
# Copy template
cp .env.example .env

# Edit .env with:
TEACHER_EMAIL_USER=your-email@gmail.com
TEACHER_EMAIL_PASSWORD=your-16-char-app-password
JWT_SECRET=<generate-random-string>
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Install Dependencies

```bash
# Install all dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..
```

## Step 3: Build and Test Locally

### 3.1 Build Functions

```bash
cd functions
npm run build
cd ..
```

Verify no TypeScript errors occur.

### 3.2 Test with Emulator (Optional)

```bash
# Start emulator
firebase emulators:start --only functions

# Output will show:
# ✔  functions: sendOTP(http://localhost:5001/YOUR_PROJECT_ID/us-central1/sendOTP)
# ✔  functions: verifyOTP(http://localhost:5001/YOUR_PROJECT_ID/us-central1/verifyOTP)
# etc.

# In another terminal, test:
curl -X POST http://localhost:5001/YOUR_PROJECT_ID/us-central1/sendOTP \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3.3 Build Frontend

```bash
npm run build
```

This creates `dist/` folder with optimized production build.

## Step 4: Configure Firebase Security Rules

### 4.1 Update Firestore Rules

In Firebase Console:
1. Go to Firestore Database → Rules
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow Cloud Functions to read/write OTPs
    match /teacherOTPs/{document=**} {
      allow create: if request.auth != null;
      allow read, write: if false;
    }
    
    // Allow teachers to read/write their data
    match /lists/{document=**} {
      allow create, read, update, delete: if true;
    }
    
    match /classes/{document=**} {
      allow create, read, update, delete: if true;
    }
    
    match /students/{document=**} {
      allow create, read, update, delete: if true;
    }
  }
}
```

3. Click Publish

### 4.2 Update Storage Rules (if using Storage)

In Firebase Console:
1. Go to Storage → Rules
2. Replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Step 5: Configure Cloud Functions Environment

### 5.1 Set Environment Variables

```bash
# Via Firebase CLI
firebase functions:config:set teacher_email_user="your-email@gmail.com"
firebase functions:config:set teacher_email_password="your-app-password"
firebase functions:config:set jwt_secret="your-random-string"

# Or use Firebase Console:
# Functions → Runtime settings → Runtime environment variables
```

## Step 6: Deploy to Production

### 6.1 Authenticate with Firebase

```bash
firebase login

# This opens browser for authentication
# Login with Google account that owns Firebase project
```

### 6.2 Deploy Everything

```bash
# Deploy Functions and Hosting
firebase deploy

# Or deploy only functions:
firebase deploy --only functions

# Or deploy only hosting:
firebase deploy --only hosting
```

**Output will show:**
```
Deploying functions and hosting to project 'your-project-id'...

✔  functions[sendOTP(us-central1)] Successful update operation.
✔  functions[verifyOTP(us-central1)] Successful update operation.
✔  functions[health(us-central1)] Successful update operation.
✔  Hosting[default] release complete

Function URL (sendOTP): https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendOTP
Function URL (verifyOTP): https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/verifyOTP
```

### 6.3 Note the Function URLs

- **sendOTP**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendOTP`
- **verifyOTP**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/verifyOTP`

These are automatically used by the frontend via your Firebase config.

## Step 7: Verify Deployment

### 7.1 Check Cloud Functions

```bash
# View logs
firebase functions:log

# Should show recent activity
```

### 7.2 Test OTP Flow

1. Visit your hosted site (URL shown in deployment output)
2. Go to `/teacher-login`
3. Enter test email
4. Check email for OTP (if email configured)
5. Or use mock OTP: `123456`
6. Verify login works

### 7.3 Check Firestore

Firebase Console → Firestore:
1. New OTP records should appear in `teacherOTPs` collection
2. Records marked as `verified: true` after login

## Step 8: Post-Deployment

### 8.1 Monitor Cloud Functions

```bash
# Watch logs in real-time
firebase functions:log --follow

# Or in Firebase Console:
# Functions → Logs
```

### 8.2 Configure Custom Domain (Optional)

In Firebase Console:
1. Hosting → Add custom domain
2. Follow DNS configuration steps
3. SSL certificate auto-provisioned

### 8.3 Enable Monitoring

In Firebase Console:
1. Functions → select function → Monitoring
2. Set up alerts for errors/latency
3. Configure email notifications

## Troubleshooting Deployment

### Issue: "Project ID not found"
**Solution:**
```bash
firebase init
# Or manually edit .firebaserc with correct project ID
```

### Issue: "Build failed"
**Solution:**
```bash
# Check functions build
cd functions && npm run build

# Check for TypeScript errors
npm list
```

### Issue: "Functions deployment timed out"
**Solution:**
- Increase timeout or try again
- Check Cloud Functions quota in Google Cloud Console

### Issue: "Permission denied" on deploy
**Solution:**
```bash
firebase login --reauth
# Or check project permissions in Google Cloud Console
```

### Issue: "Cloud Functions not working"
**Solution:**
1. Check logs: `firebase functions:log`
2. Verify environment variables set: `firebase functions:config:get`
3. Test with emulator locally first

## Updating Deployment

### Update Code

```bash
# Make changes to functions/src/index.ts or src/
cd functions
npm run build
cd ..
firebase deploy
```

### Update Environment Variables

```bash
firebase functions:config:set key="new-value"
firebase deploy --only functions
```

### Rollback Previous Version

In Firebase Console:
1. Functions → select function
2. Versions tab → select previous version → rollback

## Production Checklist

Before going live:

- [ ] Firebase project created and enabled
- [ ] Firestore Security Rules configured
- [ ] Cloud Functions deployed successfully
- [ ] Environment variables set in Cloud Functions
- [ ] Gmail SMTP configured and tested
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring and alerts enabled
- [ ] OTP email tested end-to-end
- [ ] Student and teacher flows tested
- [ ] Analytics enabled (Firebase Console)
- [ ] Backup strategy planned
- [ ] Support/feedback mechanism configured

## Performance Optimization

### Cold Start Reduction
- Keep functions lightweight
- Minimize dependencies
- Use npm --production

### Firestore Optimization
- Add indexes for frequently queried fields
- Use document subcollections for scale
- Enable TTL policy for OTPs

### Frontend Optimization
- Use Vite build already optimized
- Enable gzip compression
- Configure CDN caching headers

## Disaster Recovery

### Backup Firestore

```bash
# Automated backups (set in Firebase Console)
# Or manual export:
gcloud firestore export gs://YOUR_BUCKET/exports/$(date +%Y%m%d)
```

### Disaster Recovery Plan
1. Firestore automated backups enabled
2. Multi-region backup strategy
3. Documented restoration procedures
4. Regular backup testing

## Support & Monitoring

### Logs
- Firebase Console → Functions → Logs
- Command line: `firebase functions:log`

### Metrics
- Firebase Console → Functions → Monitoring
- Google Cloud Console → Cloud Functions

### Alerts
- Firebase Console → Alerts
- Set up email notifications for errors

## Scaling Considerations

### For High Traffic
- Cloud Functions automatically scale
- Consider Firestore scaling limits
- Monitor costs in Google Cloud Console

### Rate Limiting
- Implement client-side throttling
- Add Firebase reCAPTCHA for signup
- Monitor for abuse patterns

---

**Next Steps:**
1. Follow all steps above in order
2. Test thoroughly in staging first
3. Monitor logs after going live
4. Set up regular backup verification

For support:
- Firebase Docs: https://firebase.google.com/docs
- Cloud Functions: https://firebase.google.com/docs/functions
- Stack Overflow: Tag `firebase`
