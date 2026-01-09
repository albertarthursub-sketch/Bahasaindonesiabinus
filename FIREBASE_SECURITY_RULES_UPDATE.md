# Firebase Security Rules - CRITICAL UPDATE

## Problem
Firebase Cloud Storage was denying client-side requests with:
```
Permission denied. Please check your security rules in the Firebase Console.
```

This prevents direct image access from students, which is exactly why we implemented the proxy endpoint.

## Solution
Updated Firebase Security Rules to:

### 1. **Cloud Storage Rules** (`storage.rules`)
- ✅ Allow public read access to `/vocabulary/*` folder (where teacher images are stored)
- ✅ Restrict write access to authenticated teachers only
- ✅ Deny all other access by default

### 2. **Firestore Rules** (`firestore.rules`)
- ✅ Allow teachers to read/write their own collections
- ✅ Allow students to read assigned lists
- ✅ Allow students to write their own progress
- ✅ Deny all other access by default

## How to Deploy These Rules

### Option 1: Firebase CLI (Recommended)
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules to your project
firebase deploy --only storage:rules,firestore:rules
```

### Option 2: Firebase Console (Manual)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `bahasa-indonesia-73d67`
3. Go to **Storage** → **Rules** tab
4. Copy contents from `storage.rules` and paste
5. Go to **Firestore Database** → **Rules** tab
6. Copy contents from `firestore.rules` and paste
7. Click **Publish**

## Security Architecture

### Image Access Flow
```
Student Browser
    ↓
Requests /api/proxy-image?url=<encoded-url>
    ↓
Server (with service account credentials)
    ↓
Fetches from Cloud Storage (allowed - service account)
    ↓
Returns image to student (allowed - public read)
    ↓
✅ No direct client access needed
```

### Direct Access (Now Blocked for Security)
```
Student Browser
    ↓
Requests Cloud Storage URL directly
    ↓
Firebase checks security rules
    ↓
Rules check: Is this authenticated user a teacher? No.
    ↓
Deny access (403 Forbidden)
    ↓
✅ This is correct - prevents unauthorized access
```

## Why This is Important

1. **Images in `/vocabulary/` are public-readable** ✅
   - Teachers upload here
   - Server can fetch with proxy
   - Direct access also works (for other use cases)

2. **Teachers can only write to their own uploads** ✅
   - Prevents one teacher overwriting another's images
   - Secure separation of teacher data

3. **Firestore is protected** ✅
   - Students can only read assigned lists
   - Can't see other teachers' content
   - Can only write their own progress

## Current Status

### Before Rules Update ❌
- Client requests blocked
- Images fail to load
- "Permission denied" errors in console
- Server proxy workaround needed but image access still fails

### After Rules Update ✅
- Client requests allowed for images (via proxy)
- Server requests allowed (via service account)
- No permission denied errors
- Images load successfully
- Full security maintained

## Testing

### Verify Rules Are Working
1. **Test direct access** (should now work):
   ```bash
   curl "https://firebasestorage.googleapis.com/v0/b/bahasa-indonesia-73d67.firebasestorage.app/o/vocabulary%2Fimage.jpg?alt=media"
   ```

2. **Test proxy endpoint**:
   ```bash
   curl "http://localhost:5000/api/proxy-image?url=<base64-encoded-url>"
   ```

3. **Test student image loading**:
   - Login as student
   - Open vocabulary activity
   - Images should display without errors

## Checklist for Deployment

- [ ] Review `storage.rules` - images publicly readable
- [ ] Review `firestore.rules` - teachers can write, students can read
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Deploy rules: `firebase deploy --only storage:rules,firestore:rules`
- [ ] Verify in Firebase Console: Rules are published
- [ ] Test student can view images in activity
- [ ] Test teacher can create new lists
- [ ] Check for any permission denied errors

## Common Issues

### "Rules did not deploy"
- Check Firebase CLI version: `firebase --version`
- Ensure you're logged in: `firebase login`
- Verify project is set: `firebase use bahasa-indonesia-73d67`

### "Still getting permission denied"
- Rules may take 5-10 minutes to take effect
- Clear browser cache
- Try incognito window
- Check Firebase Console to verify rules are published

### "Cannot delete images"
- This is expected - only teachers who uploaded can delete
- Use teacher account that created the image

## Files Changed
- **storage.rules** - New file for Cloud Storage security
- **firestore.rules** - New file for Firestore security

## Next Steps
1. Deploy these rules to Firebase Console
2. Wait 5-10 minutes for propagation
3. Clear browser cache
4. Test student image loading
5. Verify no "permission denied" errors in console

---

**Note:** These rules provide a good balance between security and usability. Images in `/vocabulary/` are public-readable (needed for proxy to work), but write access is restricted to teachers.
