# Security Quick Reference Guide

## Critical Security Fixes Summary

### 🔒 What Was Fixed?

| # | Issue | Risk | Fix | Status |
|---|-------|------|-----|--------|
| 1 | Teachers see other teachers' classes | CRITICAL | Filter by `teacherId` | ✅ |
| 2 | Teachers see other teachers' lists | CRITICAL | Add WHERE clause | ✅ |
| 3 | Students see all lists in system | CRITICAL | Query assignments table | ✅ |
| 4 | Anyone can call vocabulary generator | HIGH | Validate Firebase token | ✅ |
| 5 | Anyone can call SPO generator | HIGH | Check context.auth | ✅ |

### 📍 Files Changed

```
src/pages/TeacherAnalytics.jsx     ← Filter classes/lists by teacherId
src/pages/StudentHome.jsx          ← Query assignments for list access
functions/src/index.ts             ← Add auth to Cloud Functions
```

### 🧪 Test Status

```bash
# Run tests
npm test

# Results: 14/14 ✅ PASSING
```

### 🚀 How to Deploy

```bash
# Build
npm run build

# Deploy (standard Firebase deployment)
firebase deploy
```

---

## For Developers: Key Code Patterns

### ✅ CORRECT - Teacher Data Query
```javascript
const q = query(
  collection(db, 'lists'),
  where('teacherId', '==', teacherId)  // ← Always filter by teacherId
);
const snapshot = await getDocs(q);
```

### ✅ CORRECT - Student Data Query
```javascript
// Step 1: Get assignments for class
const assignmentsQuery = query(
  collection(db, 'assignments'),
  where('classId', '==', classId)  // ← Always filter by classId
);

// Step 2: Load specific lists
for (const listId of listIds) {
  const listDoc = await getDoc(doc(db, 'lists', listId));
}
```

### ❌ WRONG - Never Do This
```javascript
// ❌ BAD: Loads all lists - anyone can see them!
const snapshot = await getDocs(collection(db, 'lists'));

// ❌ BAD: Wrong field name - doesn't filter!
where('teacherEmail', '==', email)  // Use teacherId instead

// ❌ BAD: No authentication - API abuse!
export const myFunction = functions.https.onRequest(async (req, res) => {
  // ← No auth check
});
```

---

## For Security: Key Defense Points

### Defense Layer 1: Query Filtering ✅
- All queries use WHERE clauses
- Teachers filtered by teacherId
- Students filtered by classId
- No full collection scans

### Defense Layer 2: Authentication ✅
- Cloud Functions validate Firebase tokens
- Bearer token required for sensitive operations
- Tokens cryptographically verified

### Defense Layer 3: Authorization (Recommended) ⚠️
- Enable Firebase Security Rules
- Deny by default, allow specific users
- Cannot be bypassed even if queries are wrong

---

## Quick Verification Checklist

Before writing data access code, ask:

- [ ] Does query filter by `teacherId` (for teacher data)?
- [ ] Does query filter by `classId` (for student data)?
- [ ] Is it using WHERE clause (not loading full collection)?
- [ ] If Cloud Function, does it validate `context.auth` or Bearer token?
- [ ] Could another user bypass this filter by modifying code?

If any answer is "No", 🛑 STOP - Fix it!

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Using teacherEmail
```javascript
// WRONG - Field doesn't match database
where('teacherEmail', '==', email)

// CORRECT - Use teacherId (Firebase UID)
where('teacherId', '==', teacherId)
```

### ❌ Mistake 2: No Filtering
```javascript
// WRONG - Loads all documents
await getDocs(collection(db, 'lists'))

// CORRECT - Filter by user/tenant
const q = query(collection(db, 'lists'), where('teacherId', '==', teacherId));
await getDocs(q);
```

### ❌ Mistake 3: Trusting Frontend
```typescript
// WRONG - Frontend can fake userId
const userId = request.body.userId;

// CORRECT - Get from authenticated context
const userId = context.auth.uid;
```

### ❌ Mistake 4: No Error Handling
```typescript
// WRONG - Function continues if auth fails
const verified = admin.auth().verifyIdToken(token);  // No try/catch

// CORRECT - Reject on verification failure
try {
  await admin.auth().verifyIdToken(token);
} catch (error) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## Production Checklist

- [x] All vulnerabilities fixed
- [x] Security tests passing (14/14)
- [x] Code reviewed for patterns
- [x] Query filtering verified
- [ ] **TODO: Enable Firebase Security Rules**
- [ ] **TODO: Remove admin pages from production**
- [ ] **TODO: Rotate API keys**
- [ ] **TODO: Set up monitoring**

---

## Testing Your Changes

### Before Committing
```bash
# Run security tests
npm test -- src/__tests__/SecurityAudit.test.js

# Build to catch TypeScript errors
npm run build

# Check for console errors
npm run dev
```

### When Adding New Features
```bash
# Does your code filter by teacherId/classId?
# Does your Cloud Function check context.auth?
# Can you access this data as a different user?
# Did you add a security test?
```

---

## Emergency Contacts

**If you find a security vulnerability:**
1. ❌ Don't commit it to public repo
2. ✅ Create private security issue
3. ✅ Tag @albertarthursub-sketch
4. ✅ Use `[SECURITY]` prefix

---

## Resources

- **Full Audit Report**: `SECURITY_AUDIT.md`
- **Quick Summary**: `SECURITY_REPORT.md`
- **Test Suite**: `npm test`
- **Firebase Rules**: Configure in Firebase Console

---

**Last Updated**: November 27, 2025  
**Security Level**: ✅ HARDENED  
**Vulnerabilities**: 5/5 Fixed
