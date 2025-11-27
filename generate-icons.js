#!/usr/bin/env node

/**
 * Generate App Icons for PWA
 * This script creates app icons from a source image using SVG or built-in generation
 */

import fs from 'fs';
import path from 'path';

// Create simple SVG-based icons (purple butterfly theme)
const createSVGIcon = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c084fc;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="white"/>
  
  <!-- Gradient circle background -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2.2}" fill="url(#grad)"/>
  
  <!-- Butterfly wings outline -->
  <ellipse cx="${size/3}" cy="${size/2.8}" rx="${size/6}" ry="${size/4}" fill="#ffffff" opacity="0.9"/>
  <ellipse cx="${size*2/3}" cy="${size/2.8}" rx="${size/6}" ry="${size/4}" fill="#ffffff" opacity="0.9"/>
  <ellipse cx="${size/3}" cy="${size*2/3}" rx="${size/7}" ry="${size/5}" fill="#ffffff" opacity="0.9"/>
  <ellipse cx="${size*2/3}" cy="${size*2/3}" rx="${size/7}" ry="${size/5}" fill="#ffffff" opacity="0.9"/>
  
  <!-- Butterfly body -->
  <circle cx="${size/2}" cy="${size/2.5}" r="${size/12}" fill="#ffffff" opacity="0.95"/>
  <circle cx="${size/2}" cy="${size/1.8}" r="${size/14}" fill="#ffffff" opacity="0.95"/>
  
  <!-- Antennae -->
  <path d="M ${size/2} ${size/2.5} Q ${size/2.3} ${size/3.5} ${size/2.1} ${size/4}" 
        stroke="#ffffff" stroke-width="${size/40}" fill="none" stroke-linecap="round"/>
  <path d="M ${size/2} ${size/2.5} Q ${size/1.7} ${size/3.5} ${size/1.9} ${size/4}" 
        stroke="#ffffff" stroke-width="${size/40}" fill="none" stroke-linecap="round"/>
  
  <!-- Decorative circles (represents learning) -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="none" stroke="#ffffff" stroke-width="${size/50}" opacity="0.5"/>
</svg>`;

// Create PNG icons using canvas (if available)
const createIconUsingCanvas = async (size) => {
  try {
    const { createCanvas } = await import('canvas');
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    
    // Purple gradient circle
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#c084fc');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Butterfly wings
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    
    // Upper left wing
    ctx.beginPath();
    ctx.ellipse(size/3, size/2.8, size/6, size/4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Upper right wing
    ctx.beginPath();
    ctx.ellipse(size*2/3, size/2.8, size/6, size/4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Lower left wing
    ctx.beginPath();
    ctx.ellipse(size/3, size*2/3, size/7, size/5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Lower right wing
    ctx.beginPath();
    ctx.ellipse(size*2/3, size*2/3, size/7, size/5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(size/2, size/2.5, size/12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(size/2, size/1.8, size/14, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas.toBuffer('image/png');
  } catch (e) {
    return null;
  }
};

// Main generation function
async function generateIcons() {
  console.log('🎨 Generating app icons...\n');
  
  const publicDir = './public';
  const sizes = [192, 512];
  
  // Create SVG versions
  console.log('📝 Creating SVG icons...');
  sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const filename = `${publicDir}/app-icon-${size}.png`;
    
    // Write SVG (as reference)
    fs.writeFileSync(`${publicDir}/app-icon-${size}.svg`, svgContent);
    console.log(`  ✓ Created app-icon-${size}.svg`);
  });
  
  // Create PNG versions using canvas if available
  console.log('\n🖼️  Attempting to generate PNG icons...');
  for (const size of sizes) {
    try {
      const buffer = await createIconUsingCanvas(size);
      if (buffer) {
        const filename = `${publicDir}/app-icon-${size}.png`;
        fs.writeFileSync(filename, buffer);
        console.log(`  ✓ Created ${filename}`);
        
        // Create maskable version
        const maskableFilename = `${publicDir}/app-icon-maskable-${size}.png`;
        fs.writeFileSync(maskableFilename, buffer);
        console.log(`  ✓ Created ${maskableFilename} (maskable)`);
      }
    } catch (e) {
      console.log(`  ⚠️  Could not generate PNG for ${size}x${size} (canvas not available)`);
      console.log(`      Generated SVG instead - convert to PNG using online tool`);
    }
  }
  
  console.log('\n✅ Icon generation complete!\n');
  console.log('📍 Location: ./public/');
  console.log('\nNext steps:');
  console.log('1. If PNG files were not generated, convert SVG files to PNG using:');
  console.log('   - Online: https://convertio.co/svg-png/');
  console.log('   - Local: convert app-icon-192.svg app-icon-192.png');
  console.log('2. Test with: npm run build && npm run preview');
  console.log('3. Commit icons to git\n');
}

// Run
generateIcons().catch(console.error);
