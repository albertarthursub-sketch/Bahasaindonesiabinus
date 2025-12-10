# Secret Manager Quick Setup

**TL;DR:** Store email credentials securely in Google Cloud Secret Manager instead of .env files.

## ⚡ Quick Start (5 minutes)

### Option 1: Automated Setup (Recommended)
```bash
bash setup-secret-manager.sh
```
Prompts for email credentials and sets everything up automatically.

### Option 2: Manual Setup

```bash
# 1. Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 2. Create secrets
echo -n "arthurapp05@gmail.com" | gcloud secrets create TEACHER_EMAIL_USER --data-file=-
echo -n "ltdh uorq wjvd opjm" | gcloud secrets create TEACHER_EMAIL_PASSWORD --data-file=-

# 3. Grant Cloud Functions access
PROJECT_ID=$(gcloud config get-value project)
FUNCTIONS_SA="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud secrets add-iam-policy-binding TEACHER_EMAIL_USER \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding TEACHER_EMAIL_PASSWORD \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/secretmanager.secretAccessor"

# 4. Deploy functions
cd functions && npm install && npm run build
firebase deploy --only functions

# 5. Verify
firebase functions:log
```

## 🔄 How It Works

**Before (unsafe):**
```
.env → sendOTP() → Email sent
 ↑
Secrets in file
```

**After (secure):**
```
Secret Manager → sendOTP() → Email sent
 ↑
Secrets in cloud
Audit logs
Access control
```

## ✨ Key Features

| Feature | Benefit |
|---------|---------|
| **Automatic Fallback** | Uses .env during development |
| **No Code Changes** | Functions work in dev and prod |
| **Audit Trail** | All secret access logged |
| **Easy Rotation** | Update secrets anytime |
| **Zero-Downtime** | No function redeploy needed |
| **Encrypted** | At rest and in transit |

## 🧪 Testing

### Local (uses .env)
```bash
cd functions
npm run start
# Logs: "📌 Using environment variable: TEACHER_EMAIL_USER"
```

### Production (uses Secret Manager)
```bash
firebase deploy --only functions
firebase functions:log
# Logs: "🔐 Retrieved secret from Secret Manager: TEACHER_EMAIL_USER"
```

## 🚨 Troubleshooting

**Permission denied?**
```bash
# Grant access again
PROJECT_ID=$(gcloud config get-value project)
FUNCTIONS_SA="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud secrets add-iam-policy-binding TEACHER_EMAIL_USER \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

**Secret not found?**
```bash
# Create it
echo -n "value" | gcloud secrets create SECRET_NAME --data-file=-
```

**Still using .env in production?**
```bash
# Check if GCLOUD_PROJECT is set
firebase functions:config:get
```

## 📖 Full Documentation

See: `SECRET_MANAGER_SETUP.md`

## 💡 Pro Tips

1. **Rotate secrets monthly:**
   ```bash
   echo -n "new-password" | gcloud secrets versions add TEACHER_EMAIL_PASSWORD --data-file=-
   ```

2. **View secret access logs:**
   - GCP Console → Logs → Cloud Audit Logs
   - Filter: `protoPayload.methodName="...AccessSecretVersion"`

3. **List all secrets:**
   ```bash
   gcloud secrets list
   ```

4. **Delete a secret (30-day grace period):**
   ```bash
   gcloud secrets delete TEACHER_EMAIL_USER
   ```

## ✅ Checklist

- [ ] Run setup script or manual commands
- [ ] Verify secrets created: `gcloud secrets list`
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Check logs: `firebase functions:log`
- [ ] Test OTP sending
- [ ] Confirm no .env secrets logged

**Status: Ready for Production ✅**
