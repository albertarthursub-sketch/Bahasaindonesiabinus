# Bahasa Admin Dashboard

Independent admin dashboard application for the Bahasa Indonesia learning platform. Can be deployed separately from the main application.

## Features

- 📊 Modern dashboard with pie charts and statistics
- 👥 Teacher management with email search
- 🎓 Student management with class filtering
- 👨‍🏫 Teacher details page showing all assigned classes
- 🔐 Secure admin authentication
- 📱 Fully responsive design
- 🎨 Beautiful gradient UI with Tailwind CSS

## Setup

### Prerequisites
- Node.js 16+
- Firebase project credentials

### Installation

```bash
cd admin-dashboard
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Project Structure

```
admin-dashboard/
├── public/              # Static assets
├── src/
│   ├── pages/          # Page components (AdminDashboard, AdminLogin, etc)
│   ├── components/     # Reusable components
│   ├── lib/           # Utility functions
│   ├── firebase.js    # Firebase configuration
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── index.html         # HTML entry point
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration
└── package.json       # Dependencies and scripts
```

## Environment Variables

No `.env` file needed - Firebase config is embedded. For production, consider moving Firebase credentials to environment variables.

## Deployment

### To Vercel
```bash
vercel
```

### To Netlify
```bash
npm run build
# Deploy the dist/ folder
```

### To AWS S3 + CloudFront
```bash
npm run build
# Upload dist/ to S3 bucket
```

## Features in Detail

### Admin Login
- Email/password authentication
- Firestore admin verification
- Session storage for admin credentials

### Dashboard Tabs

**Overview Tab**
- Total users, teachers, students statistics
- Active users count
- Pie charts for teacher/student status
- Recent activity log

**Teachers Tab**
- Searchable list of all teachers
- Click email to view teacher details
- Password update capability
- Deactivate/delete actions
- Filter by status

**Students Tab**
- Class-based filtering
- View all students in selected class
- Student details: name, email, unique code, roll number, join date, score
- Search within class

**Activity Tab**
- Complete activity log
- Timestamps for all actions
- User and action details

### Teacher Details Page
- Teacher information card
- All classes assigned to teacher
- Class creation dates
- Quick access to view students

## Security

- Admin-only access via Firestore collection check
- No sensitive data exposed in URLs
- Session-based authentication
- Firestore security rules validate access

## Technologies

- **React 18** - UI framework
- **Vite** - Fast build tool
- **React Router v6** - Client-side routing
- **Firebase** - Authentication & Database
- **Tailwind CSS** - Styling
- **PostCSS** - CSS processing

## License

All rights reserved - Bahasa Indonesia Learning Platform

## Support

For issues or questions, contact the development team.
