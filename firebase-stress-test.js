/**
 * Advanced Firebase Stress Test
 * Tests actual Firestore operations with 100 concurrent students
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'functions/src/credentials.json');

// Load Firebase config (you may need to adjust this)
let app;
try {
  const serviceAccount = require(serviceAccountPath);
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bahasa-indonesia-learning-c62c7.firebaseio.com'
  });
} catch (e) {
  console.log('⚠️  Firebase config not found at', serviceAccountPath);
  console.log('Please set up Firebase Admin SDK credentials first.');
  console.log('\nFallback: Using emulator or local testing...\n');
}

const db = app ? admin.firestore() : null;

// Test metrics
const metrics = {
  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  errors: {},
  operationTimes: [],
  startTime: Date.now(),
};

// Generate mock student
function generateStudent(studentId, classId) {
  return {
    id: `student_stress_${studentId}`,
    name: `Stress Test Student ${studentId}`,
    email: `stress${studentId}@test.edu`,
    classId: classId,
    avatar: ['🦁', '🐯', '🐻', '🐼', '🐨'][studentId % 5],
    createdAt: new Date(),
  };
}

// Simulate student reading vocabulary lists
async function readVocabularyLists(classId) {
  if (!db) return { success: true, time: 0 };
  
  const start = Date.now();
  try {
    const query = db.collection('assignments')
      .where('classId', '==', classId)
      .where('isActive', '==', true);
    
    const snapshot = await query.get();
    const listIds = snapshot.docs.map(doc => doc.data().listId);
    
    // Read actual list documents
    for (const listId of listIds.slice(0, 3)) { // Limit to first 3
      await db.collection('lists').doc(listId).get();
    }
    
    return {
      success: true,
      time: Date.now() - start,
      listsCount: listIds.length,
    };
  } catch (error) {
    metrics.errors[error.code || 'READ_ERROR'] = (metrics.errors[error.code || 'READ_ERROR'] || 0) + 1;
    return {
      success: false,
      time: Date.now() - start,
      error: error.message,
    };
  }
}

// Simulate student reading SPO activities
async function readSPOActivities(classId) {
  if (!db) return { success: true, time: 0 };
  
  const start = Date.now();
  try {
    const snapshot = await db.collection('spoActivities')
      .where('classId', '==', classId)
      .limit(5)
      .get();
    
    return {
      success: true,
      time: Date.now() - start,
      activitiesCount: snapshot.size,
    };
  } catch (error) {
    metrics.errors[error.code || 'READ_ERROR'] = (metrics.errors[error.code || 'READ_ERROR'] || 0) + 1;
    return {
      success: false,
      time: Date.now() - start,
      error: error.message,
    };
  }
}

// Simulate student saving progress
async function saveStudentProgress(studentId, listId, word, progressData) {
  if (!db) return { success: true, time: 0 };
  
  const start = Date.now();
  try {
    const progressRef = db.collection('studentProgress')
      .doc(studentId)
      .collection('lists')
      .doc(listId)
      .collection('words')
      .doc(word);
    
    await progressRef.set(progressData, { merge: true });
    
    return {
      success: true,
      time: Date.now() - start,
    };
  } catch (error) {
    metrics.errors[error.code || 'WRITE_ERROR'] = (metrics.errors[error.code || 'WRITE_ERROR'] || 0) + 1;
    return {
      success: false,
      time: Date.now() - start,
      error: error.message,
    };
  }
}

// Main student simulation
async function simulateStudentActivity(studentId) {
  const classId = `class_${Math.floor(studentId / 25) + 1}`;
  const student = generateStudent(studentId, classId);
  
  console.log(`[Student ${studentId}] Starting simulation...`);

  try {
    // 1. Read vocabulary lists
    console.log(`  → Reading vocabulary lists...`);
    const listResult = await readVocabularyLists(classId);
    metrics.totalOperations++;
    if (listResult.success) {
      metrics.successfulOperations++;
      metrics.operationTimes.push(listResult.time);
      console.log(`  ✓ Read lists (${listResult.time}ms)`);
    } else {
      metrics.failedOperations++;
      console.log(`  ✗ Failed to read lists: ${listResult.error}`);
    }

    // Random delay
    await new Promise(r => setTimeout(r, Math.random() * 1000));

    // 2. Read SPO activities
    console.log(`  → Reading SPO activities...`);
    const activResult = await readSPOActivities(classId);
    metrics.totalOperations++;
    if (activResult.success) {
      metrics.successfulOperations++;
      metrics.operationTimes.push(activResult.time);
      console.log(`  ✓ Read activities (${activResult.time}ms)`);
    } else {
      metrics.failedOperations++;
      console.log(`  ✗ Failed to read activities: ${activResult.error}`);
    }

    // Random delay
    await new Promise(r => setTimeout(r, Math.random() * 1000));

    // 3. Save progress (multiple times)
    console.log(`  → Saving progress...`);
    for (let i = 0; i < 3; i++) {
      const progressResult = await saveStudentProgress(
        student.id,
        `list_${Math.floor(Math.random() * 5) + 1}`,
        `word_${i}`,
        {
          correct: Math.random() > 0.3,
          timestamp: new Date(),
          attempts: Math.floor(Math.random() * 3) + 1,
        }
      );
      
      metrics.totalOperations++;
      if (progressResult.success) {
        metrics.successfulOperations++;
        metrics.operationTimes.push(progressResult.time);
      } else {
        metrics.failedOperations++;
      }
    }
    console.log(`  ✓ Saved 3 progress records`);

    console.log(`[Student ${studentId}] ✅ Completed\n`);
  } catch (error) {
    console.error(`[Student ${studentId}] ❌ Error:`, error.message);
    metrics.failedOperations++;
  }
}

// Run the stress test
async function runFirebaseStressTest() {
  console.log('\n' + '='.repeat(70));
  console.log('BAHASA LEARNING PLATFORM - FIREBASE STRESS TEST');
  console.log('='.repeat(70));
  console.log(`Testing with 100 concurrent students`);
  console.log(`Firebase Project: bahasa-indonesia-learning-c62c7`);
  console.log(`Start Time: ${new Date().toISOString()}`);
  console.log('='.repeat(70) + '\n');

  if (!db) {
    console.log('⚠️  Firebase not initialized. Please configure Firebase Admin SDK.');
    console.log('Set credentials at: functions/src/credentials.json\n');
    return;
  }

  const startTime = Date.now();

  // Run 100 concurrent students with staggered starts
  const studentPromises = [];
  for (let i = 0; i < 100; i++) {
    studentPromises.push(
      simulateStudentActivity(i)
        .catch(error => console.error(`Student ${i} failed:`, error.message))
    );
    
    // Stagger to avoid thundering herd
    if (i % 10 === 0) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log('\n⏳ Running stress test with all students...\n');
  await Promise.all(studentPromises);

  const totalDuration = Date.now() - startTime;

  // Calculate statistics
  const avgTime = metrics.operationTimes.length > 0
    ? (metrics.operationTimes.reduce((a, b) => a + b, 0) / metrics.operationTimes.length).toFixed(2)
    : 0;
  const maxTime = metrics.operationTimes.length > 0
    ? Math.max(...metrics.operationTimes)
    : 0;
  const minTime = metrics.operationTimes.length > 0
    ? Math.min(...metrics.operationTimes)
    : 0;

  const successRate = ((metrics.successfulOperations / metrics.totalOperations) * 100).toFixed(2);

  // Print results
  console.log('\n' + '='.repeat(70));
  console.log('FIREBASE STRESS TEST RESULTS');
  console.log('='.repeat(70));
  
  console.log(`\n📊 Overall Statistics:`);
  console.log(`  • Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`  • Total Operations: ${metrics.totalOperations}`);
  console.log(`  • Successful: ${metrics.successfulOperations} (${successRate}%)`);
  console.log(`  • Failed: ${metrics.failedOperations}`);
  console.log(`  • Operations/Second: ${(metrics.totalOperations / (totalDuration / 1000)).toFixed(2)}`);

  console.log(`\n⏱️  Operation Time Statistics:`);
  console.log(`  • Average: ${avgTime}ms`);
  console.log(`  • Min: ${minTime}ms`);
  console.log(`  • Max: ${maxTime}ms`);

  if (Object.keys(metrics.errors).length > 0) {
    console.log(`\n⚠️  Error Summary:`);
    Object.entries(metrics.errors).forEach(([code, count]) => {
      console.log(`  • ${code}: ${count} occurrences`);
    });
  }

  console.log(`\n✅ Test completed at ${new Date().toISOString()}`);
  console.log('='.repeat(70) + '\n');
}

// Run the test
runFirebaseStressTest()
  .catch(error => {
    console.error('Firebase stress test failed:', error);
    process.exit(1);
  });
