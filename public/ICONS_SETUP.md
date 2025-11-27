# PWA App Icons Setup

This file explains how to generate and setup the required app icons for the Progressive Web App.

## Required Icons

The following icon files need to be placed in the `public/` folder:

### Standard Icons
- **app-icon-192.png** (192x192px) - Used for home screen and shortcut icons
- **app-icon-512.png** (512x512px) - Used for splash screens and larger displays

### Maskable Icons (Adaptive Icons)
- **app-icon-maskable-192.png** (192x192px) - Safe zone in center 40x40%
- **app-icon-maskable-512.png** (512x512px) - Safe zone in center 40x40%

### Screenshots (Optional)
- **screenshot-540x720.png** (540x720px) - Phone screenshot
- **screenshot-1280x720.png** (1280x720px) - Tablet screenshot

## Quick Generation Using Node.js

1. Install `sharp` for image processing:
```bash
npm install --save-dev sharp
```

2. Run the icon generation script:
```bash
node generate-icons.js
```

## Manual Generation Options

### Option 1: Using Online Tools
- Visit https://www.favicon-generator.org/
- Upload a PNG image (minimum 512x512px)
- Download the generated icons
- Move them to `public/` folder

### Option 2: Using Figma
- Create a 512x512px design in Figma
- Export as PNG at 1x (192x192) and 2x (512x512)
- Export maskable versions with 40% safe zone

### Option 3: Using ImageMagick
```bash
# Install ImageMagick
brew install imagemagick  # macOS
# or
choco install imagemagick  # Windows

# Generate icons from a source image
convert source-icon.png -resize 192x192 app-icon-192.png
convert source-icon.png -resize 512x512 app-icon-512.png
```

## Icon Design Guidelines

### Color
- **Primary Color:** Purple (#8b5cf6) - matches theme
- **Background:** White or gradient
- **Contrast:** Ensure at least 4.5:1 contrast ratio

### Content
- ✅ Simple and recognizable
- ✅ Works at small sizes (192px)
- ✅ Clear on both light and dark backgrounds
- ❌ Avoid thin lines or small text

### Safe Zone (Maskable Icons)
The safe zone is the center 40% of the icon (81x81px for 192px icon).
- All important content must fit in this zone
- Edges may be cropped on some devices
- Provide both standard and maskable versions

## Testing PWA Locally

1. Build the app:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

3. Open DevTools and check:
- **Chrome:** DevTools → Application → Manifest
- **Firefox:** about:debugging → This Firefox
- Check for ✅ icons available
- Test "Install app" button

## Checking Installation

### Android Chrome
- Open app → Menu (⋮) → Install app
- Icon appears on home screen
- Can launch as standalone app

### iOS Safari
- Open app → Share → Add to Home Screen
- Icon appears on home screen
- Can launch as full-screen app

### Desktop (Chrome/Edge)
- Open app → Menu (⋮) → Install
- Desktop shortcut created
- Window opens in standalone mode

## Current Status

- ✅ Service Worker configured (offline support)
- ✅ Manifest configured (app metadata)
- ✅ Install prompt component created
- ⏳ App icons need to be generated/added

## Next Steps

1. Generate or create app icons (192x192 and 512x512)
2. Add icons to `public/` folder
3. Run `npm run build && npm run preview`
4. Test installation on device
5. Commit icons to git

## Recommended Icon Maker Script

Create `generate-icons.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');

const sourceIcon = './source-icon.png'; // Your 512x512 source icon

// Generate standard icons
sharp(sourceIcon).resize(192, 192).png().toFile('./public/app-icon-192.png');
sharp(sourceIcon).resize(512, 512).png().toFile('./public/app-icon-512.png');

// Generate maskable icons (with padding for safe zone)
sharp(sourceIcon)
  .resize(192, 192)
  .png()
  .toFile('./public/app-icon-maskable-192.png');
  
sharp(sourceIcon)
  .resize(512, 512)
  .png()
  .toFile('./public/app-icon-maskable-512.png');

console.log('✅ Icons generated successfully!');
```

---

For questions or issues, check the [PWA guide](https://web.dev/progressive-web-apps/).
