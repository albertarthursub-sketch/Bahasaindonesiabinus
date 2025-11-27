# Firestore Database Schema - Bahasa Learning Platform

## Overview
Complete database structure for the Bahasa Indonesia Learning Platform with teacher management, student tracking, vocabulary lists, and learning activities.

---

## Collections

### 1. **teachers**
Stores teacher account information and metadata.

```
Collection: teachers
Document ID: {teacherId} (Firebase Auth UID)

Fields:
  - email: string (unique, indexed)
  - name: string
  - school: string (optional)
  - createdAt: timestamp
  - lastLogin: timestamp
  - isActive: boolean
  - plan: string (free | premium)
  - classCount: number
  - studentCount: number
```

**Indexes:**
- email (ascending)
- createdAt (descending)

---

### 2. **classes**
Stores class/group information created by teachers.

```
Collection: classes
Document ID: {classId} (auto-generated)

Fields:
  - name: string (required)
  - teacherId: string (required, indexed)
  - gradeLevel: string (Grade 1 | Grade 2 | etc.)
  - description: string (optional)
  - createdAt: timestamp
  - studentCount: number
  - avatar: string (emoji or color)
```

**Indexes:**
- teacherId (ascending)
- createdAt (descending)

**Firestore Rules:**
```
match /classes/{classId} {
  allow read: if request.auth.uid == resource.data.teacherId;
  allow create: if request.auth.uid == request.resource.data.teacherId;
  allow update, delete: if request.auth.uid == resource.data.teacherId;
}
```

---

### 3. **students**
Stores student information and login credentials.

```
Collection: students
Document ID: {studentId} (auto-generated)

Fields:
  - name: string (required)
  - classId: string (required, indexed)
  - teacherId: string (required, indexed)
  - loginCode: string (6-char unique code, indexed)
  - avatar: string (emoji)
  - suspended: boolean (default: false)
  - createdAt: timestamp
  - lastLogin: timestamp (optional)
  - totalLearningTime: number (minutes, default: 0)
  - completedActivities: number (default: 0)
```

**Indexes:**
- classId (ascending)
- teacherId (ascending)
- loginCode (ascending, unique)
- suspended (ascending)

**Firestore Rules:**
```
match /students/{studentId} {
  allow read: if request.auth.uid == resource.data.teacherId;
  allow create: if request.auth.uid == request.resource.data.teacherId;
  allow update, delete: if request.auth.uid == resource.data.teacherId;
}
```

---

### 4. **lists** (Vocabulary Lists)
Stores vocabulary lists created by teachers.

```
Collection: lists
Document ID: {listId} (auto-generated)

Fields:
  - title: string (required)
  - description: string (optional)
  - teacherId: string (required, indexed)
  - learningArea: string (Animals | Numbers | etc.)
  - type: string (drag-drop | image | mixed)
  - createdAt: timestamp
  - updatedAt: timestamp
  - isPublic: boolean (default: false)
  - words: array of objects [
    {
      id: string,
      bahasa: string,
      english: string,
      syllables: string (hyphen-separated, e.g., "ku-cing"),
      imageUrl: string (Cloud Storage URL),
      pronunciation: string (audio URL)
    }
  ]
  - wordCount: number
  - aiGenerated: boolean (default: false)
  - theme: string (colors | animals | etc.)
```

**Indexes:**
- teacherId (ascending)
- createdAt (descending)
- isPublic (ascending)

**Firestore Rules:**
```
match /lists/{listId} {
  allow read: if request.auth.uid == resource.data.teacherId || resource.data.isPublic;
  allow create: if request.auth.uid == request.resource.data.teacherId;
  allow update, delete: if request.auth.uid == resource.data.teacherId;
}
```

---

### 5. **assignments**
Stores teacher's activity assignments to specific classes.

```
Collection: assignments
Document ID: {assignmentId} (auto-generated)

Fields:
  - listId: string (required, indexed)
  - classId: string (required, indexed)
  - teacherId: string (required, indexed)
  - className: string (snapshot of class name for easy reference)
  - listTitle: string (snapshot of list title)
  - assignedAt: timestamp
  - dueDate: timestamp (optional)
  - isActive: boolean (default: true)
```

**Indexes:**
- teacherId (ascending)
- classId (ascending)
- listId (ascending)
- assignedAt (descending)

**Composite Indexes:**
- teacherId (asc) + classId (asc)
- classId (asc) + isActive (asc)

**Firestore Rules:**
```
match /assignments/{assignmentId} {
  allow read: if request.auth.uid == resource.data.teacherId;
  allow create: if request.auth.uid == request.resource.data.teacherId;
  allow update, delete: if request.auth.uid == resource.data.teacherId;
}
```

---

### 6. **progress** (Learning Progress)
Tracks student progress for each activity.

```
Collection: progress
Document ID: {progressId} (auto-generated)

Fields:
  - studentId: string (required, indexed)
  - classId: string (required, indexed)
  - listId: string (required, indexed)
  - teacherId: string (required, indexed)
  - accuracy: number (0-100, percentage)
  - completionTime: number (seconds)
  - completedAt: timestamp
  - attempts: number (default: 1)
  - score: number (0-100)
  - status: string (in-progress | completed | abandoned)
  - feedback: string (optional)
  - wordsCorrect: array of strings (word IDs)
  - wordsIncorrect: array of strings (word IDs)
```

**Indexes:**
- studentId (ascending)
- classId (ascending)
- listId (ascending)
- teacherId (ascending)
- completedAt (descending)

**Composite Indexes:**
- studentId (asc) + listId (asc)
- classId (asc) + completedAt (desc)

**Firestore Rules:**
```
match /progress/{progressId} {
  allow read: if request.auth.uid == resource.data.teacherId || 
              request.auth.uid == resource.data.studentId;
  allow create: if request.auth.uid == request.resource.data.studentId;
  allow update: if request.auth.uid == resource.data.studentId && 
                resource.data.status != 'completed';
}
```

---

### 7. **otps** (One-Time Passwords)
Stores OTP codes for teacher authentication.

```
Collection: otps
Document ID: {email} (email as document ID for uniqueness)

Fields:
  - email: string (unique, indexed)
  - code: string (6-digit OTP)
  - expiresAt: timestamp
  - attempts: number (default: 0)
  - maxAttempts: number (default: 5)
  - createdAt: timestamp
```

**Indexes:**
- email (ascending)
- expiresAt (ascending)

**TTL Policy:**
- Set TTL on `expiresAt` field (auto-delete expired OTPs)

**Firestore Rules:**
```
match /otps/{email} {
  allow read: if email == request.auth.token.email;
  allow create: if request.resource.data.email != '' && 
                exists(/databases/$(database)/documents/teachers/$(request.auth.uid));
}
```

---

## Cloud Storage Buckets

### 1. **images/** (Vocabulary Images)
Stores images uploaded for vocabulary items.

```
Path: gs://bahasa-indonesia-73d67.appspot.com/images/

Structure:
  images/
    ├── {teacherId}/
    │   ├── {listId}/
    │   │   ├── word-{wordId}-{timestamp}.jpg
    │   │   ├── word-{wordId}-{timestamp}.png
```

**Storage Rules:**
```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.metadata.customMetadata.uploadedBy;
      allow create: if request.auth != null && 
                    request.resource.size < 5242880 && // 5MB
                    request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Data Relationships (Foreign Keys)

| Collection | Foreign Key | References |
|-----------|-----------|-----------|
| classes | teacherId | teachers/{teacherId} |
| students | classId | classes/{classId} |
| students | teacherId | teachers/{teacherId} |
| lists | teacherId | teachers/{teacherId} |
| assignments | listId | lists/{listId} |
| assignments | classId | classes/{classId} |
| assignments | teacherId | teachers/{teacherId} |
| progress | studentId | students/{studentId} |
| progress | classId | classes/{classId} |
| progress | listId | lists/{listId} |
| progress | teacherId | teachers/{teacherId} |

---

## Composite Indexes Required

```
Collection: assignments
Fields:
  - teacherId (asc)
  - classId (asc)

Collection: progress
Fields:
  - studentId (asc)
  - listId (asc)
  
Collection: progress
Fields:
  - classId (asc)
  - completedAt (desc)
```

---

## Firestore Security Rules Summary

**Authentication:**
- All operations require `request.auth.uid` to be present
- Teachers can only access their own data (filtered by teacherId)
- Students can only access their own progress

**Data Validation:**
- Email fields must not be empty
- teacherId must match authenticated user
- classId and listId must reference valid documents
- Login codes must be unique (enforced at application level)

**Quota Considerations:**
- Read operations: ~100K students × 5 lists = 500K monthly reads
- Write operations: Progress tracking = 1K-5K daily writes
- Storage: ~10MB per teacher for images

---

## Backup & Maintenance

### Recommended Backup Schedule
- Daily: Automated Firestore backups via Google Cloud
- Weekly: Export to Cloud Storage

### Monitoring
- Set up Cloud Monitoring alerts for:
  - Firestore read/write spike (> 10K reads/second)
  - Storage usage growth
  - Authentication failures

---

## Migration Path

If migrating from another system:

1. **Import Teachers** → `teachers` collection
2. **Import Classes** → `classes` collection (with teacherId)
3. **Import Students** → `students` collection (with classId, teacherId)
4. **Import Vocabulary** → `lists` collection (with teacherId)
5. **Import Assignments** → `assignments` collection
6. **Import Progress** → `progress` collection

Use Firebase Admin SDK or Firestore import/export tools for bulk migration.

---

## Example Queries

```javascript
// Get all classes for a teacher
db.collection('classes')
  .where('teacherId', '==', teacherId)
  .orderBy('createdAt', 'desc')

// Get all students in a class
db.collection('students')
  .where('classId', '==', classId)
  .orderBy('name', 'asc')

// Get student's progress for a list
db.collection('progress')
  .where('studentId', '==', studentId)
  .where('listId', '==', listId)
  .limit(1)

// Get all assigned lists for a class
db.collection('assignments')
  .where('classId', '==', classId)
  .where('isActive', '==', true)
```

---

## Document Size Limits

- **Maximum document size:** 1MB (per Firestore limit)
- **lists collection:** Typically 100-500KB per document
  - Recommendation: Split if `words` array exceeds 500 items
- **progress collection:** Typically 1-10KB per document

---

## Versioning

**Schema Version:** 1.0
**Last Updated:** November 2025
**Compatible With:** Bahasa Learning Platform v1.0+
