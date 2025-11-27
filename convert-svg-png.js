#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function convertSVGtoPNG() {
  console.log('🎨 Converting SVG icons to PNG...\n');
  
  const publicDir = './public';
  const sizes = [192, 512];
  
  for (const size of sizes) {
    const svgFile = path.join(publicDir, `app-icon-${size}.svg`);
    const pngFile = path.join(publicDir, `app-icon-${size}.png`);
    const maskableFile = path.join(publicDir, `app-icon-maskable-${size}.png`);
    
    try {
      // Read SVG
      const svgBuffer = fs.readFileSync(svgFile);
      
      // Convert to PNG
      const pngBuffer = await sharp(svgBuffer, { density: 150 })
        .png()
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
        .toBuffer();
      
      // Write PNG
      fs.writeFileSync(pngFile, pngBuffer);
      console.log(`✓ Created ${path.basename(pngFile)} (${size}x${size})`);
      
      // Write maskable version (same file for PWA compatibility)
      fs.writeFileSync(maskableFile, pngBuffer);
      console.log(`✓ Created ${path.basename(maskableFile)} (maskable)`);
      
    } catch (error) {
      console.error(`✗ Error converting app-icon-${size}.svg:`, error.message);
    }
  }
  
  console.log('\n✅ Conversion complete!\n');
  console.log('📍 Generated files in ./public/:');
  console.log('  - app-icon-192.png');
  console.log('  - app-icon-512.png');
  console.log('  - app-icon-maskable-192.png');
  console.log('  - app-icon-maskable-512.png\n');
}

convertSVGtoPNG().catch(console.error);
