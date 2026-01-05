# 🔧 Set Email Credentials in Firebase Console

## Your Email Settings Found ✅
```
Email: arthurapp05@gmail.com
Password: ltdh uorq wjvd opjm
```

## Step-by-Step Instructions

### 1. Go to Firebase Cloud Functions Console
**Direct Link**: https://console.firebase.google.com/project/bahasa-indonesia-73d67/functions/list

### 2. Find the sendOTP Function
Look for the table showing all functions. Click on **sendOTP**

### 3. Click "Runtime settings"
In the function details page, look for a **Runtime settings** button/link in the top right area

### 4. Edit Environment Variables
Scroll down to **Runtime environment variables** section

### 5. Add Your Email Credentials
Click **Add variable** and add BOTH:

#### Variable 1:
- **Name**: `TEACHER_EMAIL_USER`
- **Value**: `arthurapp05@gmail.com`

#### Variable 2:
- **Name**: `TEACHER_EMAIL_PASSWORD`
- **Value**: `ltdhurqwjvdopjm` (without spaces)

⚠️ **IMPORTANT**: Remove the spaces from the password!
- Given: `ltdh uorq wjvd opjm`
- Use: `ltdhurqwjvdopjm`

### 6. Save and Deploy
- Click **Save** or **Deploy**
- Wait 1-2 minutes for the update

---

## Alternative: Deploy via Command Line

If you want to use command line, create a `.env.local` file in the `functions` folder:

```bash
cd functions
```

Create `functions/.env.local`:
```
TEACHER_EMAIL_USER=arthurapp05@gmail.com
TEACHER_EMAIL_PASSWORD=your-16-char-app-password
```

Then redeploy:
```bash
firebase deploy --only functions
```

---

## After Deployment ✅

Once deployed with environment variables:
1. Go back to https://bahasa-indonesia-73d67.web.app/teacher-login
2. Enter your email
3. Click "Send OTP Code"
4. Check your email (arthurapp05@gmail.com) for the OTP
5. Enter it and login!

---

## 🧪 Test It

While waiting for deployment, you can check logs:
```bash
firebase functions:log --follow
```

Then try sending an OTP and watch the logs to see if emails are being sent.

---

## ⚠️ Important Note

The `.env` file in your project root is for **frontend** environment variables (Vite).

Cloud Functions environment variables must be set in **Firebase Console**, not in `.env`.

The credentials in `.env` won't be used by Cloud Functions unless you:
1. Set them in Firebase Console UI (easiest), OR
2. Create `.env.local` in the `functions` folder and redeploy

---

**Do this now and your OTPs will be emailed!** 📧
