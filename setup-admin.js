import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to load service account
let serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
let adminSDK = null;

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    adminSDK = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Using Firebase Admin SDK");
  } catch (error) {
    console.log("⚠️ Could not initialize Admin SDK:", error.message);
  }
}

if (!adminSDK) {
  console.log("❌ Firebase Admin SDK not initialized");
  console.log("To set up admin, you need firebase-service-account.json");
  console.log("\nAlternatively, use the Firebase Console to:");
  console.log("1. Create a user with email: admin@school.com");
  console.log("2. Set password: Admin@123456");
  console.log("3. Add document to 'admins' collection with user UID as document ID");
  process.exit(1);
}

async function setupAdmin() {
  const auth = admin.auth();
  const db = admin.firestore();

  try {
    const adminEmail = "admin@school.com";
    const adminPassword = "Admin@123456";

    console.log("\n🔧 Creating admin account...");
    console.log("Email:", adminEmail);

    // Check if user already exists
    try {
      await auth.getUserByEmail(adminEmail);
      console.log("⚠️ Admin user already exists");
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        const user = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: "System Administrator"
        });
        console.log("✅ Auth user created:", user.uid);

        // Create admin document
        await db.collection('admins').doc(user.uid).set({
          email: adminEmail,
          displayName: "System Administrator",
          createdAt: new Date(),
          status: 'active',
          role: 'super_admin',
          lastLogin: null
        });

        console.log("✅ Admin record created in Firestore");
      }
    }

    console.log("\n✅ Admin account setup complete!");
    console.log("\n📝 Login credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:    " + adminEmail);
    console.log("Password: " + adminPassword);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 Access at:");
    console.log("http://10.26.30.67:8888/admin-login");
    console.log("\n⚠️  Change this password immediately after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setupAdmin();
