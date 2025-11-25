# 📧 Enable Email OTP - Step by Step

## Your Situation
- ✅ Cloud Functions are deployed
- ✅ OTP is being generated
- ❌ Email is NOT being sent (credentials not configured)

Currently, OTP codes are being logged to Cloud Functions console instead of emailed.

---

## Step 1: Generate Gmail App Password

### If using Gmail:
1. Go to: https://myaccount.google.com/apppasswords
2. Select:
   - App: **Mail**
   - Device: **Windows Computer**
3. Click **Generate**
4. Google will show a 16-character password
5. **Copy this password** (you'll need it in Step 2)

### If NOT using Gmail:
You need to use Gmail for this setup. Use any Gmail account as your teacher email sender.

---

## Step 2: Set Environment Variables in Firebase

### Method 1: Firebase Console (Easiest)

1. Go to: https://console.firebase.google.com/project/bahasa-indonesia-73d67/functions/list

2. Click on the **sendOTP** function

3. Click **Runtime settings**

4. Scroll down to **Runtime environment variables**

5. Click **Add variable** and add these TWO variables:

   **Variable 1:**
   - Name: `TEACHER_EMAIL_USER`
   - Value: `your-gmail@gmail.com` (the Gmail account that will send OTPs)

   **Variable 2:**
   - Name: `TEACHER_EMAIL_PASSWORD`
   - Value: `xxxx xxxx xxxx xxxx` (the 16-char app password from Step 1)

6. Click **Deploy**

7. Wait 1-2 minutes for the update to complete

### Method 2: Command Line

```bash
# Deploy with environment variables
firebase deploy --only functions \
  --set-env-vars TEACHER_EMAIL_USER=your-gmail@gmail.com,TEACHER_EMAIL_PASSWORD="xxxx xxxx xxxx xxxx"
```

---

## Step 3: Verify It's Working

### Check Logs
```bash
firebase functions:log --follow
```

Then:
1. Go to https://bahasa-indonesia-73d67.web.app/teacher-login
2. Enter your email
3. Click "Send OTP Code"
4. Watch the logs - you should see something like:
   ```
   OTP for test@example.com: 123456
   Email sent successfully
   ```

### Check Your Email
- Open your Gmail inbox (the one you used as TEACHER_EMAIL_USER)
- Look for an email with subject: "Your Bahasa Learning Platform Login Code"
- If you don't see it, check **Spam** folder

---

## ⚠️ Important Notes

### Security
- ⚠️ **Never** share your app password
- ⚠️ **Never** commit credentials to git
- ⚠️ These are stored securely in Firebase (encrypted at rest)

### Gmail Account
- Can be any Gmail account
- Teachers will see this email as the sender
- Should be a dedicated account (e.g., noreply@yourschool.com)

### App Passwords
- Only works with Gmail accounts that have 2-Step Verification enabled
- Each app password is unique and can be revoked anytime
- You can generate multiple app passwords for different apps

### Test Mode
- Currently: **OTP logged to console** (no email sent)
- After setup: **OTP emailed + logged to console**
- Check console logs: `firebase functions:log --follow`

---

## 🧪 Quick Test After Setup

1. **Open Firebase logs in one terminal:**
   ```bash
   firebase functions:log --follow
   ```

2. **In another window:**
   - Go to: https://bahasa-indonesia-73d67.web.app/teacher-login
   - Enter: `test@example.com`
   - Click: "Send OTP Code"

3. **You should see in logs:**
   ```
   OTP for test@example.com: 123456
   Email sent to test@example.com
   ```

4. **Check your email (TEACHER_EMAIL_USER Gmail inbox):**
   - New email from your-gmail@gmail.com
   - Subject: "Your Bahasa Learning Platform Login Code"
   - Contains the OTP code

---

## 🆘 Troubleshooting

### Problem: "Still not receiving emails"

**Solution 1: Check function deployed**
```bash
firebase functions:list
```
Verify sendOTP shows v1 and nodejs20

**Solution 2: Check environment variables**
```bash
firebase functions:describe sendOTP
```
Look for: `environmentVariables: { TEACHER_EMAIL_USER: '...', TEACHER_EMAIL_PASSWORD: '...' }`

**Solution 3: Check logs**
```bash
firebase functions:log --follow
```
Look for errors like "Invalid credentials" or "SMTP connection failed"

**Solution 4: Verify Gmail app password**
- Ensure it's exactly 16 characters (with spaces: xxxx xxxx xxxx xxxx)
- Don't include the spaces in Firebase - use: xxxxxxxxxxxxxxxx
- The account must have 2-Step Verification enabled

### Problem: "Wrong email receiving OTPs"

Check that `TEACHER_EMAIL_USER` is set to YOUR Gmail account (the sender), not the teacher's email.

### Problem: "Email says invalid credentials"

The app password is incorrect. Generate a new one and update Firebase Console.

---

## ✅ After Setup Complete

1. ✅ OTPs will be emailed to teachers
2. ✅ Emails sent from your Gmail account
3. ✅ Teachers can log in with real OTPs
4. ✅ Production is fully functional!

---

## Next: Full Production Checklist

- ✅ Cloud Functions deployed
- ✅ Frontend deployed
- ✅ OTP generation working
- ⏳ Email sending (YOU ARE HERE)
- ⏳ Firestore Security Rules (recommended)
- ⏳ Custom domain (optional)
- ⏳ Monitoring alerts (recommended)

---

## 📞 Need Help?

**Gmail app password issues?**
- Go to: https://support.google.com/accounts/answer/185833

**Firebase issues?**
- Logs: `firebase functions:log --follow`
- Console: https://console.firebase.google.com/project/bahasa-indonesia-73d67/functions

**Still not working?**
- Check all special characters in your app password
- Ensure no extra spaces
- Try generating a new app password
- Re-deploy functions after changing variables

---

**Do this now to enable email OTP delivery!** 📧
