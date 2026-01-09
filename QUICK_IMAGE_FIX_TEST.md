# Quick Image Fix Test Guide

## What Was Fixed
✅ **Image proxy endpoint** - `/api/proxy-image` added to `server.js`
✅ **Image URL conversion** - Students now receive proxy URLs instead of direct Cloud Storage URLs
✅ **Error handling** - Graceful fallback to placeholder if image fails

## How to Verify the Fix Works

### Step 1: Start the Server
```bash
cd bahasa-learning
node server.js
```

Expected output:
```
Claude API Key configured: Yes (sk-ant-...)
Stability API Key configured: Yes (sk-jE...)
Email Service configured: Yes
Server running on port 5000
```

### Step 2: Check the Proxy Endpoint
The proxy endpoint should be accessible. Test with curl:

```bash
# Test endpoint exists (should return 400 - missing URL param)
curl http://localhost:5000/api/proxy-image

# With a valid Firebase Storage URL (base64 encoded):
curl "http://localhost:5000/api/proxy-image?url=<base64-encoded-url>"
```

### Step 3: Teacher Flow - Create List with Images
1. Login as teacher
2. Create new vocabulary list
3. Add words with AI generation OR manual entry
4. **Check browser console** - should see:
   ```
   ✅ Uploaded image for [word] to Cloud Storage: https://firebasestorage.googleapis.com/...
   ```
5. Save the list
6. Assign to a class

### Step 4: Student Flow - View Images
1. Login as student
2. Select a vocabulary list
3. Start learning activity
4. **Images should display correctly** (no 401 errors)
5. **Browser console** should show:
   - Image loads from proxy: `http://localhost:5000/api/proxy-image?url=...`
   - No CORS errors
   - No "Unauthorized" errors

## Expected Image Flow

### Before Fix ❌
```
Student requests Cloud Storage URL
  ↓
Cloud Storage checks auth
  ↓
No student credentials
  ↓
ERROR: 401 Unauthorized
```

### After Fix ✅
```
Teacher generates image → uploads to Cloud Storage → saves URL to Firestore

Student loads list
  ↓
Component detects: https://firebasestorage.googleapis.com/...
  ↓
Converts to: http://localhost:5000/api/proxy-image?url=<encoded-url>
  ↓
Student browser requests proxy
  ↓
Server fetches from Cloud Storage (using server credentials)
  ↓
Returns image to student
  ↓
Image displays ✅
```

## Troubleshooting

### Issue: Images still show placeholder (🖼️)
**Solution:**
1. Check browser console (F12 → Console tab)
2. Look for errors like:
   - `Failed to load image` → Image URL invalid
   - `ERR_BLOCKED_BY_CLIENT` → CORS issue (shouldn't happen with proxy)
   - `404` → Image doesn't exist in Cloud Storage

### Issue: Server shows "Stability API Key configured: No"
**Solution:**
1. Add `STABILITY_API_KEY` to `.env` file (already done)
2. Restart server: `node server.js`

### Issue: "Cannot GET /api/proxy-image"
**Solution:**
1. Server might not be running
2. Check that server.js has the new endpoint (see end of file)
3. Restart server

### Issue: Images load but are slow
**Solution:**
1. Normal - proxy adds small overhead
2. Cache header set to 1 year, so subsequent loads are instant

## Files Modified for This Fix

| File | Change |
|------|--------|
| `server.js` | Added `/api/proxy-image` endpoint |
| `src/components/ImageVocabularyLearning.jsx` | Added `getStudentImageUrl()` helper |
| `src/pages/StudentLearn.jsx` | Added `getStudentImageUrl()` helper & error handler |
| `.env` | Added `STABILITY_API_KEY` for backend |

## Key Code Snippets

### Proxy Endpoint (server.js)
```javascript
app.get('/api/proxy-image', async (req, res) => {
  const { url } = req.query;
  let imageUrl = Buffer.from(decodeURIComponent(url), 'base64').toString('utf8');
  
  // Security check
  if (!imageUrl.includes('firebasestorage.googleapis.com')) {
    return res.status(403).json({ error: 'Only Firebase Storage URLs allowed' });
  }

  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.buffer();
  
  res.setHeader('Content-Type', imageResponse.headers.get('content-type'));
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.send(imageBuffer);
});
```

### Image URL Conversion (Frontend Components)
```javascript
const getStudentImageUrl = (imageUrl) => {
  if (imageUrl?.includes('firebasestorage.googleapis.com')) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      const encodedUrl = btoa(imageUrl);
      return `${apiUrl}/api/proxy-image?url=${encodedUrl}`;
    }
  }
  return imageUrl;
};
```

## Testing Checklist
- [ ] Server starts without "API key not configured" warnings
- [ ] Teacher can create list with AI-generated images
- [ ] Images upload to Cloud Storage
- [ ] Student can login and see list
- [ ] Images display in learning activity
- [ ] No 401/403 errors in console
- [ ] Images load from proxy endpoint
- [ ] Placeholder shows if image fails
- [ ] Can complete activity without image loading errors

## Still Having Issues?

1. **Check server is running:**
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status":"ok"}
   ```

2. **Check proxy endpoint:**
   ```bash
   curl http://localhost:5000/api/proxy-image
   # Should return 400: {"error":"URL parameter required"}
   ```

3. **Check API URL in frontend:**
   - Open browser DevTools → Network tab
   - Look for requests to `/api/proxy-image`
   - If not found, check that `VITE_API_URL` is set in `.env`

4. **Restart both server and vite:**
   ```bash
   # Kill existing processes and restart
   npm run dev:all
   ```
