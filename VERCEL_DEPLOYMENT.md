# Vercel Deployment Guide - Bahasa Indonesia Learning Platform

## Quick Start Deployment

### Step 1: Push to GitHub
```bash
# Make sure all changes are committed
git status

# Push to GitHub repository
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in or create account with GitHub
3. Click "Import Project"
4. Select the `bahasa-learning` repository
5. Click "Import"

### Step 3: Configure Environment Variables

In Vercel Dashboard, go to **Project Settings → Environment Variables** and add:

```
VITE_FIREBASE_API_KEY=AIzaSyAu4xnTGl8rlfTvFega2zcTFUMvv-72rXc
VITE_FIREBASE_AUTH_DOMAIN=bahasa-indonesia-73d67.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bahasa-indonesia-73d67
VITE_FIREBASE_STORAGE_BUCKET=bahasa-indonesia-73d67.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=110928773130
VITE_FIREBASE_APP_ID=1:110928773130:web:bfa1f94f609c0bb2801ff3
VITE_STABILITY_API_KEY=<your-stability-ai-key>
VITE_CLAUDE_API_KEY=<your-claude-api-key>
```

### Step 4: Deploy

Click **Deploy** button. Vercel will:
- Run `npm install`
- Run `npm run build`
- Deploy the `dist` folder to CDN
- Provide a live URL

## Project Configuration

### vercel.json
- Specifies Vite as the framework
- Maps environment variables
- Configures SPA routing rewrites
- Output directory: `dist`

### .vercelignore
- Excludes unnecessary files from deployment
- Reduces deployment size
- Keeps secrets out of builds

### Build Settings
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

## Post-Deployment

### 1. Test Application
- Visit the provided Vercel URL
- Test login flows (teacher & student)
- Test vocabulary creation
- Test student learning activities

### 2. Configure Firebase Security Rules
- Update Firebase Firestore rules for production domain
- Update Firebase Storage rules
- Update Firebase Authentication allowed domains

### 3. Update API Endpoints
- If using API endpoints, update to production URLs
- Update any redirect URLs in OAuth configurations

### 4. Enable Production Features
- Enable analytics in Firebase
- Set up error monitoring
- Configure backup strategy

## Troubleshooting

### Build Fails
```bash
# Check build locally first
npm run build

# Check for TypeScript errors
npm run type-check  # if available

# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Environment Variables Not Loading
- Verify `VITE_` prefix on all client variables
- Redeploy after updating environment variables
- Check that variables are in correct environment scope

### Firebase Connection Issues
- Verify Firebase config matches project
- Check Firebase security rules allow Vercel domain
- Ensure CORS is properly configured

### Large Bundle Size
The build warning about chunk size (>500KB) is expected for this full-featured app. To optimize:

1. Implement route-based code splitting:
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'teacher': ['./src/pages/TeacherDashboard.jsx'],
          'student': ['./src/pages/StudentLearn.jsx'],
          'components': ['./src/components/']
        }
      }
    }
  }
});
```

2. Lazy load heavy components
3. Tree-shake unused dependencies

## Continuous Deployment

Every push to `main` branch automatically:
1. Triggers Vercel build
2. Runs tests (if configured)
3. Deploys to preview URL
4. Promotes to production on merge

To disable auto-deploy:
- Vercel Dashboard → Settings → Git → Uncheck "Deploy on every push"

## Production Checklist

- [ ] All environment variables set
- [ ] Firebase rules updated for production domain
- [ ] SSL certificate verified (automatic with Vercel)
- [ ] Email notifications configured
- [ ] Error monitoring enabled
- [ ] Performance monitoring active
- [ ] Backup strategy in place
- [ ] User feedback system tested
- [ ] Admin tools accessible

## Rollback

If deployment has issues:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or redeploy specific commit
# In Vercel Dashboard: Deployments → Select commit → Redeploy
```

## Support

For Vercel support: https://vercel.com/support
For Firebase support: https://firebase.google.com/support
For project issues: Check GitHub Issues

