# Cloud Storage Setup Guide - Bahasa Learning Platform

## Overview
This guide covers the complete setup and configuration of Firebase Cloud Storage for the Bahasa Learning Platform, including image uploads for vocabulary items.

---

## 1. Firebase Cloud Storage Configuration

### 1.1 Create Cloud Storage Bucket

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **bahasa-indonesia-73d67**
3. Navigate to **Storage** in the left sidebar
4. Click **Create bucket**
5. Configure:
   - **Name**: `bahasa-indonesia-73d67.appspot.com` (default)
   - **Location**: `us-central1` (or nearest to your users)
   - **Default storage class**: `Standard`
   - **Access control**: `Public` (will be restricted via rules)
6. Click **Create**

### 1.2 Set Storage Location

```
gs://bahasa-indonesia-73d67.appspot.com/
```

---

## 2. Cloud Storage Security Rules

### 2.1 Production Rules (Recommended)

Go to **Storage > Rules** and replace with:

```firestore
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Images folder - Allow teachers to upload, everyone to read
    match /images/{allPaths=**} {
      allow read: if request.auth != null;
      
      allow create: if request.auth != null && 
                       request.resource.size < 5242880 && // 5MB limit
                       request.resource.contentType.matches('image/.*');
      
      allow update, delete: if request.auth.uid == resource.metadata.customMetadata.uploadedBy;
    }

    // Temporary uploads - Clean up after 24 hours
    match /temp/{allPaths=**} {
      allow read, write: if request.auth != null;
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 2.2 Development Rules (Local Testing)

For testing on localhost, use permissive rules:

```firestore
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // ⚠️ Only for development!
    }
  }
}
```

⚠️ **Never use development rules in production!**

---

## 3. Cloud Storage Folder Structure

```
gs://bahasa-indonesia-73d67.appspot.com/
├── images/
│   ├── {teacherId}/
│   │   ├── {listId}/
│   │   │   ├── word-{wordId}-{timestamp}.jpg
│   │   │   ├── word-{wordId}-{timestamp}.png
│   │   │   └── word-{wordId}-{timestamp}.webp
│   │   └── avatars/
│   │       └── avatar-{studentId}.jpg
│   └── shared/
│       └── template-images/
├── temp/
│   ├── uploads-{timestamp}/
│   └── processing-{timestamp}/
└── backups/
    └── list-exports-{date}.json
```

---

## 4. Image Upload Implementation

### 4.1 Frontend Upload Code

Already implemented in `AIVocabularyGenerator.jsx` and `TeacherDashboard.jsx`:

```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const uploadImageToStorage = async (base64Image, teacherId, listId, wordId) => {
  try {
    // Convert base64 to blob
    const response = await fetch(base64Image);
    const blob = await response.blob();

    // Create storage reference
    const timestamp = new Date().getTime();
    const fileName = `word-${wordId}-${timestamp}.jpg`;
    const storageRef = ref(
      storage,
      `images/${teacherId}/${listId}/${fileName}`
    );

    // Upload with metadata
    const metadata = {
      customMetadata: {
        uploadedBy: teacherId,
        wordId: wordId,
        uploadedAt: new Date().toISOString()
      }
    };

    await uploadBytes(storageRef, blob, metadata);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;

  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
```

### 4.2 Image Optimization

For better performance, compress images before uploading:

```javascript
const compressImage = async (base64Image) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size (max 800x600)
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG (0.8 quality)
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};
```

---

## 5. File Size & Type Limits

### 5.1 Size Limits

| Content | Max Size | Recommendation |
|---------|----------|-----------------|
| Image (vocabulary) | 5 MB | 500 KB - 1 MB |
| Audio (pronunciation) | 10 MB | 100 KB - 500 KB |
| Video (future) | 100 MB | 10 MB - 50 MB |
| PDF Exports | 20 MB | - |

### 5.2 Allowed MIME Types

```javascript
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm'
];
```

---

## 6. Handling CORS Issues

### 6.1 CORS Configuration (if needed)

For API access from different domains, configure CORS via Cloud Storage:

```bash
# Create cors-config.json
[
  {
    "origin": ["https://yourdomain.com", "http://localhost:3001"],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]

# Apply configuration
gsutil cors set cors-config.json gs://bahasa-indonesia-73d67.appspot.com/
```

### 6.2 Local Development CORS

For localhost testing, Firebase SDK automatically handles CORS. No additional configuration needed.

---

## 7. Quotas & Pricing

### 7.1 Free Tier Limits

```
- Storage: 5 GB
- Download: 1 GB/day
- Upload: Unlimited
```

### 7.2 Pricing (Pay as you go)

| Operation | Cost |
|-----------|------|
| Storage | $0.018/GB/month |
| Download | $0.12/GB |
| Upload | Free |
| Delete | Free |

**Estimated monthly cost** for 10 teachers × 50 lists × 20 images × 1MB each:
- Storage: ~$9/month
- Downloads: ~$3/month (if 100GB downloaded)
- **Total: ~$12/month**

---

## 8. Monitoring & Optimization

### 8.1 Monitor Usage in Firebase Console

1. **Storage > Files**: View total storage used
2. **Storage > Rules**: Check for rule errors
3. **Cloud Monitoring**: Set up alerts

### 8.2 Optimization Tips

**1. Image Format**
- Use WebP for best compression (80% smaller than JPEG)
- Fallback to JPEG for older browsers

**2. Caching**
- Set `Cache-Control` metadata on images
- Browser will cache for 1 year

```javascript
const metadata = {
  cacheControl: 'public, max-age=31536000', // 1 year
  customMetadata: { uploadedBy: teacherId }
};
```

**3. Cleanup**
- Delete unused images regularly
- Implement automatic cleanup for deleted words

```javascript
const deleteOldImages = async (teacherId) => {
  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles({
    prefix: `images/${teacherId}/`,
    maxResults: 100
  });
  
  for (const file of files) {
    await file.delete();
  }
};
```

---

## 9. Backup & Recovery

### 9.1 Backup Strategy

**Automated Backups:**
1. Enable versioning on bucket
2. Set up lifecycle rules to archive old versions

**Manual Backups:**
```bash
# Download entire bucket
gsutil -m cp -r gs://bahasa-indonesia-73d67.appspot.com/images ./backup/

# Restore from backup
gsutil -m cp -r ./backup/images gs://bahasa-indonesia-73d67.appspot.com/
```

### 9.2 Lifecycle Rules

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": { "type": "Delete" },
        "condition": {
          "age": 90,
          "matchesPrefix": ["temp/"]
        }
      },
      {
        "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" },
        "condition": {
          "age": 365,
          "matchesPrefix": ["images/"]
        }
      }
    ]
  }
}
```

---

## 10. Troubleshooting

### 10.1 "Access Denied" Error

**Cause**: Cloud Storage rules too restrictive
**Solution**: Check rules in Firebase Console, ensure authentication is working

### 10.2 "CORS Error" on Upload

**Cause**: Browser blocking cross-origin request
**Solution**: Use Firebase SDK (handles CORS automatically) or configure CORS

### 10.3 "Quota Exceeded" Error

**Cause**: Hit free tier download limit
**Solution**: Upgrade to Pay-as-you-go plan or implement caching

### 10.4 "File Too Large" Error

**Cause**: Image > 5MB
**Solution**: Compress image before upload using `compressImage()` function

---

## 11. Security Best Practices

### 11.1 Do's ✅

- ✅ Validate file types before upload
- ✅ Compress images before uploading
- ✅ Use secure rules (not open to public)
- ✅ Store file URLs in Firestore, not actual files
- ✅ Set reasonable size limits
- ✅ Use HTTPS only

### 11.2 Don'ts ❌

- ❌ Don't store large files in Firestore (use Cloud Storage)
- ❌ Don't use development rules in production
- ❌ Don't allow direct URL access without authentication
- ❌ Don't store sensitive data in public buckets
- ❌ Don't implement custom upload mechanism (use Firebase SDK)

---

## 12. Setup Checklist

- [ ] Cloud Storage bucket created
- [ ] Security rules configured (production rules set)
- [ ] Folder structure documented
- [ ] Upload code implemented in frontend
- [ ] Image compression implemented
- [ ] File size limits configured (5MB)
- [ ] CORS configured (if needed)
- [ ] Lifecycle rules set up for cleanup
- [ ] Monitoring & alerts configured
- [ ] Backup strategy implemented
- [ ] Team trained on usage

---

## Useful Firebase CLI Commands

```bash
# List all files in bucket
gsutil ls -r gs://bahasa-indonesia-73d67.appspot.com/images/

# Get file info (size, last modified, etc)
gsutil stat gs://bahasa-indonesia-73d67.appspot.com/images/teacher1/list1/word1.jpg

# Download entire folder
gsutil -m cp -r gs://bahasa-indonesia-73d67.appspot.com/images/teacher1/ ./downloads/

# Delete specific file
gsutil rm gs://bahasa-indonesia-73d67.appspot.com/images/teacher1/old-image.jpg

# Set metadata
gsutil setmeta -h "Cache-Control:public, max-age=3600" gs://bahasa-indonesia-73d67.appspot.com/images/**

# Monitor bandwidth usage
gsutil du -s gs://bahasa-indonesia-73d67.appspot.com/
```

---

## Support & Resources

- **Firebase Storage Docs**: https://firebase.google.com/docs/storage
- **Firebase CLI Reference**: https://firebase.google.com/docs/cli
- **Cloud Storage Pricing**: https://firebase.google.com/pricing
- **Security Rules Playground**: https://firebase.google.com/docs/storage/security/rules-and-tests

---

**Last Updated**: November 2025
**Version**: 1.0
**Status**: Production Ready ✅
