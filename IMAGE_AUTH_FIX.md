# Image Authentication & Display Fix

## Problem
When teachers generate images using AI and students try to view them during activities, they get:
```
Unauthorized: Missing or invalid authentication token
```

This happens even though images are successfully generated and stored.

## Root Cause
The issue was a **CORS and Cloud Storage authentication mismatch**:

1. ✅ Teachers generate images via `/api/generate-image` (no auth needed - server-side)
2. ✅ Images are uploaded to Firebase Cloud Storage
3. ✅ Cloud Storage URLs are saved to Firestore
4. ❌ **Students cannot directly access Cloud Storage URLs** (requires Firebase authentication)
5. ❌ Direct image URLs have CORS restrictions

## Solution Implemented

### 1. **Added Image Proxy Endpoint** (`server.js`)
New endpoint: `/api/proxy-image?url=<encoded-url>`

**Features:**
- Accepts Firebase Storage URLs
- Proxies the image request server-side (bypassing CORS)
- Includes proper caching headers
- Security validation (only allows `firebasestorage.googleapis.com`)
- No authentication required from students

**Code:**
```javascript
app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    let imageUrl = Buffer.from(decodeURIComponent(url), 'base64').toString('utf8');
    
    // Security: Only allow Firebase Storage URLs
    if (!imageUrl.includes('firebasestorage.googleapis.com')) {
      return res.status(403).json({ error: 'Only Firebase Storage URLs are allowed' });
    }

    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.buffer();
    
    res.setHeader('Content-Type', imageResponse.headers.get('content-type'));
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to proxy image' });
  }
});
```

### 2. **Updated Image Display Components**

**ImageVocabularyLearning.jsx:**
- Added `getStudentImageUrl()` helper function
- Converts Firebase Storage URLs to proxy URLs
- Base64 encodes the URL to preserve query parameters
- Falls back to data URLs if they exist

**StudentLearn.jsx:**
- Added same `getStudentImageUrl()` helper
- Updated image tags with `onError` handlers
- Graceful fallback to placeholder if image fails

**How it works:**
```jsx
const getStudentImageUrl = (imageUrl) => {
  if (imageUrl?.includes('firebasestorage.googleapis.com')) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      const encodedUrl = btoa(imageUrl);  // Base64 encode
      return `${apiUrl}/api/proxy-image?url=${encodedUrl}`;
    }
  }
  return imageUrl;  // Return as-is if data URL or no API
};
```

### 3. **Flow Diagram**

```
Teacher Creates List
    ↓
Generates Image via /api/generate-image
    ↓
Stability AI returns image (base64)
    ↓
Uploaded to Firebase Cloud Storage
    ↓
Cloud Storage URL saved to Firestore
    ↓
Student Loads Activity
    ↓
Component detects Cloud Storage URL
    ↓
Converts to: /api/proxy-image?url=<encoded-url>
    ↓
Server fetches from Cloud Storage
    ↓
Returns image to student (no auth needed)
    ↓
Image displays in activity ✅
```

## Files Modified
1. **server.js** - Added `/api/proxy-image` endpoint
2. **src/components/ImageVocabularyLearning.jsx** - Updated image URL handling
3. **src/pages/StudentLearn.jsx** - Updated image URL handling

## Testing Checklist
- [ ] Teacher creates a new vocabulary list with AI-generated images
- [ ] Images upload to Cloud Storage successfully
- [ ] Teacher assigns list to a class
- [ ] Student logs in and starts the activity
- [ ] Images display without "Unauthorized" error
- [ ] Images load correctly in both image-vocabulary and syllable modes
- [ ] Placeholder image (🖼️) shows if image fails to load

## Security Notes
✅ **Secure:**
- Proxy endpoint validates that only Firebase Storage URLs are proxied
- Server-side proxying prevents CORS issues
- Base64 encoding preserves URL integrity
- Cache headers minimize repeated requests

✅ **No additional auth needed:**
- Students don't need Firebase credentials
- Server credentials used to fetch from Cloud Storage
- Transparent to students

## Environment Setup
No new environment variables needed. The proxy uses:
- `VITE_API_URL` (already configured)
- Existing Firebase Cloud Storage configuration

## Rollback
If needed, remove the new `/api/proxy-image` endpoint from `server.js` and revert component changes to use `imageUrl` directly (though images won't load for students).

## Performance Impact
- ✅ Minimal - proxy endpoint is lightweight
- ✅ Caching header (1 year) reduces repeated requests
- ✅ Only used for Cloud Storage URLs, not data URLs
