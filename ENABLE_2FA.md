# 🔐 Enable 2-Step Verification on Gmail

## Problem
Your Gmail account (arthurapp05@gmail.com) doesn't have 2-Step Verification enabled, so you can't generate an App Password for the Cloud Functions.

## Solution: Enable 2-Step Verification

### Step 1: Go to Google Account Settings
1. Go to: https://myaccount.google.com
2. Click **Security** on the left sidebar
3. Scroll down to "How you sign in to Google"

### Step 2: Enable 2-Step Verification
1. Click on **2-Step Verification**
2. Click **Get started**
3. Follow the prompts:
   - Verify your password
   - Add a trusted phone number
   - Google will send a verification code to your phone
   - Enter the code to confirm
4. Click **Turn on**

### Step 3: Generate App Password
Once 2-Step Verification is enabled:

1. Go to: https://myaccount.google.com/apppasswords
2. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device type)
3. Click **Generate**
4. Google will show a 16-character password like: `xxxx xxxx xxxx xxxx`
5. Copy this password

### Step 4: Update Cloud Functions

Update the `.env` file in your `functions` folder:

```
TEACHER_EMAIL_USER=arthurapp05@gmail.com
TEACHER_EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

(Replace with your actual 16-character app password)

### Step 5: Redeploy

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

---

## Timeline
- ⏳ Step 1-2: Enable 2-Step Verification (5 minutes)
- ⏳ Step 3: Generate App Password (1 minute)
- ⏳ Step 4-5: Update and redeploy (2 minutes)

**Total: ~8 minutes**

---

## After You Do This ✅

Your OTP emails will start working! Teachers will receive OTP codes when they try to sign in or sign up.

---

## Questions?

**"Why does Gmail require this?"**
- It's for security - App Passwords are more secure than regular passwords
- Google forces you to use 2-Step Verification before allowing App Passwords

**"Is it safe?"**
- Yes! App Passwords are specific to one app
- You can revoke it anytime from the same page
- It's the recommended way to integrate with Gmail

**"Can I use a different email?"**
- Yes! Any Gmail account with 2-Step Verification enabled will work
- It just needs to be able to send emails

---

**Start here**: https://myaccount.google.com → Security → 2-Step Verification → Get started

Let me know once you've generated the App Password and I'll help you update the `.env` file!
