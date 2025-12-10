# Admin Dashboard Deployment Guide

This guide explains how to deploy the admin dashboard as a separate application.

## Structure

The admin dashboard is now a completely independent application that can be:
- Deployed to its own domain
- Scaled independently
- Maintained separately from the main application
- Hosted on different platforms

## Quick Start

### Local Development

```bash
cd admin-dashboard
npm install
npm run dev
```

Visit: `http://localhost:3000`

### Production Build

```bash
cd admin-dashboard
npm install
npm run build
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub** - Make sure admin-dashboard is committed
2. **Connect to Vercel**:
   ```bash
   cd admin-dashboard
   vercel
   ```
3. **Configure**:
   - Root Directory: `admin-dashboard`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Option 2: Netlify

1. **Build locally**:
   ```bash
   cd admin-dashboard
   npm run build
   ```

2. **Deploy**:
   - Drag and drop `dist/` folder to Netlify
   - OR connect GitHub and select `admin-dashboard` as root

3. **Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

### Option 3: AWS S3 + CloudFront

1. **Build**:
   ```bash
   cd admin-dashboard
   npm run build
   ```

2. **Upload to S3**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name/
   ```

3. **Create CloudFront distribution** pointing to S3

### Option 4: Docker

1. **Create Dockerfile** in admin-dashboard/:
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:18-alpine
   WORKDIR /app
   RUN npm install -g serve
   COPY --from=build /app/dist ./dist
   EXPOSE 3000
   CMD ["serve", "-s", "dist", "-l", "3000"]
   ```

2. **Build and run**:
   ```bash
   docker build -t bahasa-admin-dashboard .
   docker run -p 3000:3000 bahasa-admin-dashboard
   ```

## Environment Configuration

The admin dashboard uses embedded Firebase credentials. For production:

1. **Option A: Keep embedded** (current)
   - Works out of the box
   - Credentials are in public build

2. **Option B: Use environment variables**
   - Create `.env.production`
   - Update `src/firebase.js` to read from `import.meta.env`
   - Set vars in deployment platform

Example for Vercel:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

## Access Control

Admin access is controlled via Firestore:
- Only users in `admins` collection can login
- `status` field must not be `'inactive'`
- Verified server-side

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS records

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Update DNS with provided records

## Monitoring & Analytics

### Add Google Analytics

1. Add to `index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_ID');
   </script>
   ```

### Add Sentry Error Tracking

```bash
npm install @sentry/react @sentry/tracing
```

## Performance Optimization

- Build is already optimized with Vite
- CSS is purged via Tailwind
- Images should be optimized before adding
- Consider adding compression middleware

## Security Checklist

- [ ] Firebase config is public (keys are public by design)
- [ ] Admin verification happens server-side
- [ ] HTTPS enabled on deployment
- [ ] CORS configured if needed
- [ ] Rate limiting on login attempts

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Build Errors
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Firebase Connection Issues
- Check network connection
- Verify Firebase project is active
- Check Firestore security rules
- Verify admin document exists

## Next Steps

1. Set up CI/CD pipeline
2. Configure auto-deploy on git push
3. Add performance monitoring
4. Set up error tracking
5. Configure automatic backups

## Support

Contact the development team for deployment assistance.
