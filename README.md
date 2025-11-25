# Bahasa Learning Platform

A React + Vite application for teaching Indonesian (Bahasa Indonesia) to grades 1-2 students with interactive drag-and-drop vocabulary learning and teacher management dashboard.

## Features

### For Students
- 🎮 Interactive drag-and-drop syllable matching
- ⭐ Instant feedback and star rewards
- 🎵 Celebration music on completion
- 📱 Mobile-friendly interface

### For Teachers
- 🔐 Secure email OTP authentication
- 📚 Create custom vocabulary lists
- 🏫 Manage classes and import students
- 📊 Track student progress and analytics
- 🎯 Automatic class code generation

## Tech Stack

- **Frontend**: React 18.2 + Vite 5.0 + Tailwind CSS
- **Backend**: Firebase Cloud Functions (Node.js 18)
- **Database**: Firestore
- **Authentication**: Firebase Auth + Custom OTP System
- **Email**: Nodemailer with Gmail SMTP
- **AI**: Claude API (for vocabulary generation)

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project at [firebase.google.com](https://firebase.google.com)

### Installation

```bash
# Clone and install
git clone <repo-url>
cd bahasa-learning

# Install dependencies
npm install
cd functions && npm install && cd ..

# Create environment file
cp .env.example .env
# Edit .env with your Firebase and Gmail credentials
```

### Development

```bash
# Start Vite dev server (frontend)
npm run dev

# In another terminal, build and test functions
cd functions
npm run build
firebase emulators:start --only functions
```

### Deployment

```bash
# Update .firebaserc with your Firebase project ID
firebase deploy
```

## Project Structure

```
.
├── src/
│   ├── pages/              # React components
│   │   ├── Home.jsx
│   │   ├── TeacherAuth.jsx (OTP login)
│   │   ├── TeacherDashboard.jsx
│   │   ├── ClassManagement.jsx
│   │   └── StudentLearn.jsx
│   ├── App.jsx             # Routing
│   ├── firebase.js         # Firebase config
│   └── index.css           # Tailwind CSS
├── functions/              # Cloud Functions
│   ├── src/
│   │   └── index.ts        # OTP & auth functions
│   ├── package.json
│   └── tsconfig.json
├── package.json
├── vite.config.js
├── firebase.json           # Firebase config
└── FIREBASE_SETUP.md       # Detailed setup guide
```

## Authentication Flow

1. Teacher navigates to `/teacher-login`
2. Enters email → `sendOTP` Cloud Function generates and sends OTP
3. Receives 6-digit code in email
4. Enters OTP → `verifyOTP` Cloud Function validates and returns Firebase custom token
5. JWT stored in sessionStorage for protected routes
6. Can access teacher dashboard at `/teacher`

## Environment Variables

See `.env.example` for required configuration:

```env
TEACHER_EMAIL_USER=your-email@gmail.com
TEACHER_EMAIL_PASSWORD=your-app-password
JWT_SECRET=your-secret-key
```

## Cloud Functions

- **sendOTP**: Generates OTP, stores in Firestore, sends via email
- **verifyOTP**: Validates OTP, returns Firebase custom token
- **cleanupExpiredOTPs**: Scheduled function to clean up expired OTPs
- **health**: Health check endpoint

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed documentation.

## Testing

### Mock Mode (No Email Required)
1. Enter any email on login page
2. Use OTP: `123456`
3. Access teacher dashboard

### Production Mode
1. Configure Gmail app password in `.env`
2. Deploy Cloud Functions: `firebase deploy --only functions`
3. Real OTPs sent to email (10-minute expiry)

## File Structure Details

### src/pages/
- **Home.jsx**: Landing page with student/teacher options
- **TeacherAuth.jsx**: OTP-based login (uses Firebase Cloud Functions)
- **TeacherDashboard.jsx**: Main teacher interface
- **ClassManagement.jsx**: Create/manage classes
- **StudentLogin.jsx**: Student class code entry
- **StudentLearn.jsx**: Interactive drag-and-drop learning interface

### functions/src/
- **index.ts**: Main Cloud Functions implementation
  - OTP generation and email sending
  - OTP verification with JWT tokens
  - Scheduled cleanup of expired OTPs
  - Health check endpoint

## Firestore Schema

### Collections

**teacherOTPs**
```
{
  email: string,
  otp: string,
  expiryTime: Timestamp,
  verified: boolean,
  createdAt: Timestamp,
  verifiedAt?: Timestamp,
  attempts: number
}
```

**lists** (vocabulary lists)
**classes** (student classes)
**students** (student records)

## API Endpoints

All endpoints are deployed as Firebase Cloud Functions:

| Function | Method | Input | Output |
|----------|--------|-------|--------|
| sendOTP | POST | `{email}` | `{success, message, mockMode}` |
| verifyOTP | POST | `{email, otp}` | `{success, token, email}` |
| health | GET | - | `{status, timestamp, email}` |

## Common Issues & Solutions

**"Cloud Functions not deployed"**
- Run: `firebase deploy --only functions`
- Check `.firebaserc` has correct project ID

**"Gmail authentication failed"**
- Use App Password, not regular Gmail password
- Enable 2-Step Verification on Google Account

**"OTP expired too quickly"**
- Default is 10 minutes, increase in `functions/src/index.ts` line 15

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for more troubleshooting.

## Development Workflow

1. Make changes to frontend in `src/`
2. For backend changes, edit `functions/src/index.ts`
3. Build functions: `cd functions && npm run build && cd ..`
4. Test locally with emulator
5. Deploy: `firebase deploy`

## Production Checklist

- [ ] Firebase project created and configured
- [ ] `.env` file with all credentials set
- [ ] Cloud Functions deployed: `firebase deploy --only functions`
- [ ] Firestore Security Rules configured
- [ ] Gmail App Password configured
- [ ] OTP expiry time suitable for your users
- [ ] Monitored Cloud Function logs for errors
- [ ] Tested full OTP flow end-to-end

## Contributing

1. Create a feature branch
2. Make changes and test locally
3. For Cloud Functions: `cd functions && npm run build`
4. Commit and push
5. Submit PR with description

## License

[Add your license here]

## Support

For Firebase documentation: https://firebase.google.com/docs
For Vite documentation: https://vitejs.dev/guide/
For React documentation: https://react.dev/

---

**Last Updated**: November 2025
**Version**: 1.0.0
