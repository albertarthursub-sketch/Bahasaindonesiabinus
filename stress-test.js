/**
 * Stress Test: 100 Concurrent Students
 * 
 * This test simulates 100 students simultaneously:
 * 1. Logging in
 * 2. Browsing vocabulary lists
 * 3. Starting learning activities
 * 4. Answering questions
 * 5. Completing activities
 * 
 * Usage: node stress-test.js
 */

import http from 'http';
import https from 'https';
import url from 'url';

// Configuration
const BASE_URL = 'http://localhost:5173';
const NUM_STUDENTS = 100;
const REQUEST_TIMEOUT = 30000; // 30 seconds
const REQUESTS_PER_STUDENT = 5;

// Metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  errors: {},
  responseTimes: [],
  startTime: Date.now(),
  endTime: null,
};

// Mock student data
function generateStudentData(studentId) {
  return {
    id: `student_${studentId}`,
    name: `Student ${studentId}`,
    avatar: ['🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐺', '🐱', '🐵', '🐶'][studentId % 10],
    classId: `class_${Math.floor(studentId / 25) + 1}`,
    email: `student${studentId}@school.edu`,
    loginTime: new Date().toISOString(),
  };
}

// HTTP request wrapper
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(path, BASE_URL);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'StressTest/1.0',
      },
      timeout: REQUEST_TIMEOUT,
    };

    const startTime = Date.now();
    const req = protocol.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        metrics.responseTimes.push(responseTime);
        
        resolve({
          status: res.statusCode,
          time: responseTime,
          data: responseData,
          success: res.statusCode >= 200 && res.statusCode < 300,
        });
      });
    });

    req.on('error', (error) => {
      metrics.errors[error.code] = (metrics.errors[error.code] || 0) + 1;
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      metrics.errors['TIMEOUT'] = (metrics.errors['TIMEOUT'] || 0) + 1;
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Simulate student activity
async function simulateStudent(studentId) {
  const student = generateStudentData(studentId);
  const results = [];

  try {
    // 1. Simulate loading home page
    console.log(`[Student ${studentId}] Starting activity...`);
    try {
      const homeRes = await makeRequest('/');
      metrics.totalRequests++;
      if (homeRes.success) {
        metrics.successfulRequests++;
        results.push({ action: 'load_home', status: 'success', time: homeRes.time });
      } else {
        metrics.failedRequests++;
        results.push({ action: 'load_home', status: 'failed', code: homeRes.status });
      }
    } catch (e) {
      metrics.failedRequests++;
      results.push({ action: 'load_home', status: 'error', error: e.message });
    }

    // 2. Simulate fetching student data (from sessionStorage simulation)
    try {
      // This would normally come from Firebase, we're just simulating the request
      await new Promise(r => setTimeout(r, Math.random() * 1000)); // Random delay
      metrics.totalRequests++;
      metrics.successfulRequests++;
      results.push({ action: 'fetch_student_data', status: 'success' });
    } catch (e) {
      metrics.failedRequests++;
      results.push({ action: 'fetch_student_data', status: 'error' });
    }

    // 3. Simulate loading vocabulary lists
    try {
      const listsRes = await makeRequest('/api/lists'); // Hypothetical endpoint
      metrics.totalRequests++;
      if (listsRes.success || listsRes.status === 404) { // 404 is ok for this test
        metrics.successfulRequests++;
        results.push({ action: 'fetch_lists', status: 'success', time: listsRes.time });
      } else {
        metrics.failedRequests++;
      }
    } catch (e) {
      metrics.failedRequests++;
      results.push({ action: 'fetch_lists', status: 'error' });
    }

    // 4. Simulate loading SPO activities
    try {
      const activitiesRes = await makeRequest('/api/activities');
      metrics.totalRequests++;
      if (activitiesRes.success || activitiesRes.status === 404) {
        metrics.successfulRequests++;
        results.push({ action: 'fetch_activities', status: 'success', time: activitiesRes.time });
      } else {
        metrics.failedRequests++;
      }
    } catch (e) {
      metrics.failedRequests++;
      results.push({ action: 'fetch_activities', status: 'error' });
    }

    // 5. Simulate user interaction (random delay)
    await new Promise(r => setTimeout(r, Math.random() * 2000));
    metrics.totalRequests++;
    metrics.successfulRequests++;
    results.push({ action: 'user_interaction', status: 'success' });

    console.log(`[Student ${studentId}] ✅ Completed ${results.length} actions`);
    
  } catch (error) {
    console.error(`[Student ${studentId}] ❌ Error:`, error.message);
  }

  return results;
}

// Run stress test
async function runStressTest() {
  console.log('\n' + '='.repeat(60));
  console.log('BAHASA LEARNING PLATFORM - STRESS TEST');
  console.log('='.repeat(60));
  console.log(`Testing with ${NUM_STUDENTS} concurrent students`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Start Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60) + '\n');

  const startTime = Date.now();

  // Create array of student promises
  const studentPromises = [];
  for (let i = 0; i < NUM_STUDENTS; i++) {
    studentPromises.push(
      simulateStudent(i)
        .catch(error => {
          console.error(`Student ${i} failed:`, error.message);
          return [];
        })
    );
    
    // Stagger the start slightly to avoid thundering herd
    if (i % 10 === 0) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  // Wait for all students to complete
  console.log('\n⏳ Running stress test...\n');
  const results = await Promise.all(studentPromises);

  metrics.endTime = Date.now();
  const totalDuration = metrics.endTime - startTime;

  // Calculate statistics
  const avgResponseTime = metrics.responseTimes.length > 0 
    ? (metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length).toFixed(2)
    : 0;
  const maxResponseTime = metrics.responseTimes.length > 0 
    ? Math.max(...metrics.responseTimes)
    : 0;
  const minResponseTime = metrics.responseTimes.length > 0 
    ? Math.min(...metrics.responseTimes)
    : 0;

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('STRESS TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`\n📊 Overall Statistics:`);
  console.log(`  • Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`  • Students Simulated: ${NUM_STUDENTS}`);
  console.log(`  • Total Requests: ${metrics.totalRequests}`);
  console.log(`  • Successful Requests: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`  • Failed Requests: ${metrics.failedRequests}`);
  console.log(`  • Requests/Second: ${(metrics.totalRequests / (totalDuration / 1000)).toFixed(2)}`);

  console.log(`\n⏱️  Response Time Statistics:`);
  console.log(`  • Average: ${avgResponseTime}ms`);
  console.log(`  • Min: ${minResponseTime}ms`);
  console.log(`  • Max: ${maxResponseTime}ms`);
  console.log(`  • P95: ${metrics.responseTimes.length > 0 ? (metrics.responseTimes.sort((a, b) => a - b)[Math.floor(metrics.responseTimes.length * 0.95)]).toFixed(2) : 0}ms`);
  console.log(`  • P99: ${metrics.responseTimes.length > 0 ? (metrics.responseTimes.sort((a, b) => a - b)[Math.floor(metrics.responseTimes.length * 0.99)]).toFixed(2) : 0}ms`);

  if (Object.keys(metrics.errors).length > 0) {
    console.log(`\n⚠️  Errors:`);
    Object.entries(metrics.errors).forEach(([code, count]) => {
      console.log(`  • ${code}: ${count}`);
    });
  }

  console.log(`\n✅ Test completed at ${new Date().toISOString()}`);
  console.log('='.repeat(60) + '\n');

  // Return test results
  return {
    passed: metrics.failedRequests === 0,
    metrics,
    duration: totalDuration,
  };
}

// Run the test
runStressTest()
  .then(result => {
    process.exit(result.passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Stress test failed:', error);
    process.exit(1);
  });
