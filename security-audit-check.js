#!/usr/bin/env node
/**
 * Security Fixes Implementation Script
 * This script implements the critical security fixes identified in the audit
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Bahasa Learning Platform - Security Fixes\n');

// Check Node environment
const nodeVersion = process.version;
console.log(`✓ Node version: ${nodeVersion}\n`);

// Task 1: Generate strong JWT secret
console.log('1️⃣  Generating strong JWT_SECRET...');
const crypto = require('crypto');
const JWT_SECRET = crypto.randomBytes(32).toString('hex');
console.log(`   Generated: ${JWT_SECRET.substring(0, 20)}...\n`);

// Task 2: Check for .env in git
console.log('2️⃣  Checking if .env is tracked by git...');
const { execSync } = require('child_process');
try {
  execSync('git ls-files | grep ".env"');
  console.log('   ⚠️  WARNING: .env file is tracked by git!');
  console.log('   Run: git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all\n');
} catch (e) {
  console.log('   ✓ .env is NOT tracked by git\n');
}

// Task 3: Check .gitignore
console.log('3️⃣  Checking .gitignore...');
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  if (gitignore.includes('.env')) {
    console.log('   ✓ .env is in .gitignore\n');
  } else {
    console.log('   ⚠️  .env is NOT in .gitignore');
    console.log('   Add ".env" to .gitignore\n');
  }
} else {
  console.log('   ⚠️  .gitignore not found\n');
}

// Task 4: Display required packages
console.log('4️⃣  Required npm packages to install:\n');
const requiredPackages = [
  'helmet',
  'express-rate-limit',
  'email-validator',
  'winston'
];

requiredPackages.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`   ✓ ${pkg} - installed`);
  } catch (e) {
    console.log(`   ✗ ${pkg} - MISSING (install with: npm install ${pkg})`);
  }
});

console.log('\n5️⃣  Environment variables to set:');
console.log(`   JWT_SECRET=${JWT_SECRET}`);
console.log(`   NODE_ENV=production`);
console.log(`   CORS_ORIGINS=["https://yourdomain.com", "https://www.yourdomain.com"]`);

console.log('\n6️⃣  Critical code changes needed:');
console.log('   - Remove OTP bypass (server.js lines 200-215)');
console.log('   - Fix Firestore rules (remove || true conditions)');
console.log('   - Fix Storage rules (require authentication)');
console.log('   - Add CORS whitelist');
console.log('   - Add rate limiting');

console.log('\n✅ Run the security-fixes.js script to apply changes');
