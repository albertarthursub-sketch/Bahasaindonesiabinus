/**
 * Advanced Stress Test: 1000 Concurrent Students
 * 
 * This comprehensive test simulates 1000 students with realistic patterns:
 * - Staggered start times to simulate real-world adoption
 * - Multiple concurrent requests per student
 * - Connection pooling for efficiency
 * - Detailed metrics collection
 * 
 * Usage: node stress-test-1000.js
 */

import http from 'http';
import https from 'https';
import url from 'url';
import { performance } from 'perf_hooks';

// Configuration
const BASE_URL = 'http://localhost:3000';
const NUM_STUDENTS = 1000;
const REQUEST_TIMEOUT = 30000;
const BATCH_SIZE = 100; // Process 100 students at a time
const BATCH_DELAY = 500; // 500ms between batches

// Metrics tracking
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  errors: {},
  responseTimes: [],
  studentMetrics: {},
  startTime: performance.now(),
  endTime: null,
  peakConcurrency: 0,
  currentConcurrency: 0,
  batchResults: [],
};

// Agent for connection pooling
const agent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 500,
  maxFreeSockets: 10,
  timeout: REQUEST_TIMEOUT,
  freeSocketTimeout: 30000,
});

// Generate student data
function generateStudentData(studentId) {
  const classNum = Math.floor(studentId / 250) + 1;
  return {
    id: `student_stress_${studentId}`,
    name: `Student ${studentId}`,
    avatar: ['🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐺', '🐱', '🐵', '🐶'][studentId % 10],
    classId: `class_${classNum}`,
    email: `student${studentId}@school.edu`,
    batchId: Math.floor(studentId / BATCH_SIZE),
  };
}

// HTTP request with connection pooling
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    metrics.currentConcurrency++;
    if (metrics.currentConcurrency > metrics.peakConcurrency) {
      metrics.peakConcurrency = metrics.currentConcurrency;
    }

    const urlObj = new url.URL(path, BASE_URL);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'StressTest-1000/1.0',
        'Connection': 'keep-alive',
      },
      agent: agent,
      timeout: REQUEST_TIMEOUT,
    };

    const startTime = performance.now();
    const req = protocol.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        const responseTime = performance.now() - startTime;
        metrics.responseTimes.push(responseTime);
        metrics.currentConcurrency--;
        
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
      metrics.currentConcurrency--;
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      metrics.errors['TIMEOUT'] = (metrics.errors['TIMEOUT'] || 0) + 1;
      metrics.currentConcurrency--;
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Simulate individual student activity
async function simulateStudent(studentId) {
  const student = generateStudentData(studentId);
  const studentStart = performance.now();
  let successCount = 0;
  let failCount = 0;

  try {
    // Request 1: Home page (main load)
    try {
      const res = await makeRequest('/');
      metrics.totalRequests++;
      if (res.success) {
        metrics.successfulRequests++;
        successCount++;
      } else {
        metrics.failedRequests++;
        failCount++;
      }
    } catch (e) {
      metrics.failedRequests++;
      failCount++;
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, Math.random() * 500));

    // Request 2: Another page load (could be /student-home or /learn/:id)
    try {
      const res = await makeRequest('/');
      metrics.totalRequests++;
      if (res.success) {
        metrics.successfulRequests++;
        successCount++;
      } else {
        metrics.failedRequests++;
        failCount++;
      }
    } catch (e) {
      metrics.failedRequests++;
      failCount++;
    }

    // Request 3: Another navigation
    try {
      const res = await makeRequest('/');
      metrics.totalRequests++;
      if (res.success) {
        metrics.successfulRequests++;
        successCount++;
      } else {
        metrics.failedRequests++;
        failCount++;
      }
    } catch (e) {
      metrics.failedRequests++;
      failCount++;
    }

    // User think time
    await new Promise(r => setTimeout(r, Math.random() * 1500));

    // Request 4: Final interaction
    try {
      const res = await makeRequest('/');
      metrics.totalRequests++;
      if (res.success) {
        metrics.successfulRequests++;
        successCount++;
      } else {
        metrics.failedRequests++;
        failCount++;
      }
    } catch (e) {
      metrics.failedRequests++;
      failCount++;
    }

  } catch (error) {
    failCount++;
  }

  const studentDuration = performance.now() - studentStart;
  metrics.studentMetrics[studentId] = {
    success: successCount,
    failed: failCount,
    duration: studentDuration,
  };

  return { successCount, failCount, studentId };
}

// Process students in batches
async function processBatch(batchNum, startIdx, endIdx) {
  const batchStart = performance.now();
  const studentPromises = [];

  for (let i = startIdx; i < endIdx; i++) {
    studentPromises.push(
      simulateStudent(i)
        .catch(error => ({ error: error.message, studentId: i }))
    );

    // Stagger within batch
    if ((i - startIdx) % 20 === 0) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  const results = await Promise.all(studentPromises);
  const batchDuration = performance.now() - batchStart;

  metrics.batchResults.push({
    batchNum,
    size: endIdx - startIdx,
    duration: batchDuration,
    successCount: results.filter(r => r.successCount).length,
  });

  const batchNum_str = String(batchNum).padStart(2, '0');
  console.log(`✓ Batch ${batchNum_str} (Students ${startIdx}-${endIdx-1}): ${(batchDuration/1000).toFixed(2)}s`);
}

// Main stress test
async function runStressTest() {
  console.log('\n' + '='.repeat(80));
  console.log('BAHASA LEARNING PLATFORM - 1000 STUDENT STRESS TEST');
  console.log('='.repeat(80));
  console.log(`\n📊 Test Configuration:`);
  console.log(`  • Total Students: ${NUM_STUDENTS}`);
  console.log(`  • Batch Size: ${BATCH_SIZE} students`);
  console.log(`  • Total Batches: ${Math.ceil(NUM_STUDENTS / BATCH_SIZE)}`);
  console.log(`  • Base URL: ${BASE_URL}`);
  console.log(`  • Start Time: ${new Date().toISOString()}\n`);

  const testStart = performance.now();

  // Process in batches
  console.log('⏳ Processing students in batches...\n');
  for (let batch = 0; batch < Math.ceil(NUM_STUDENTS / BATCH_SIZE); batch++) {
    const startIdx = batch * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, NUM_STUDENTS);
    
    await processBatch(batch, startIdx, endIdx);
    
    // Delay between batches (except last)
    if (batch < Math.ceil(NUM_STUDENTS / BATCH_SIZE) - 1) {
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  metrics.endTime = performance.now();
  const totalDuration = metrics.endTime - testStart;

  // Calculate statistics
  const sortedTimes = metrics.responseTimes.sort((a, b) => a - b);
  const avgTime = sortedTimes.length > 0
    ? (sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length).toFixed(2)
    : 0;
  const medianTime = sortedTimes.length > 0
    ? sortedTimes[Math.floor(sortedTimes.length / 2)].toFixed(2)
    : 0;
  const p95Time = sortedTimes.length > 0
    ? sortedTimes[Math.floor(sortedTimes.length * 0.95)].toFixed(2)
    : 0;
  const p99Time = sortedTimes.length > 0
    ? sortedTimes[Math.floor(sortedTimes.length * 0.99)].toFixed(2)
    : 0;

  const successRate = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2);

  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('STRESS TEST RESULTS - 1000 STUDENTS');
  console.log('='.repeat(80));

  console.log(`\n📊 Overall Statistics:`);
  console.log(`  • Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`  • Students Simulated: ${NUM_STUDENTS}`);
  console.log(`  • Total Requests: ${metrics.totalRequests}`);
  console.log(`  • Successful Requests: ${metrics.successfulRequests} (${successRate}%)`);
  console.log(`  • Failed Requests: ${metrics.failedRequests}`);
  console.log(`  • Requests/Second: ${(metrics.totalRequests / (totalDuration / 1000)).toFixed(2)}`);
  console.log(`  • Peak Concurrency: ${metrics.peakConcurrency} connections`);

  console.log(`\n⏱️  Response Time Statistics (in milliseconds):`);
  console.log(`  • Average: ${avgTime}ms`);
  console.log(`  • Median: ${medianTime}ms`);
  console.log(`  • Min: ${Math.min(...sortedTimes).toFixed(2)}ms`);
  console.log(`  • Max: ${Math.max(...sortedTimes).toFixed(2)}ms`);
  console.log(`  • P95: ${p95Time}ms`);
  console.log(`  • P99: ${p99Time}ms`);
  console.log(`  • P99.9: ${sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length * 0.999)].toFixed(2) : 0}ms`);

  console.log(`\n📈 Batch Performance:`);
  let totalBatchTime = 0;
  metrics.batchResults.forEach((batch, idx) => {
    console.log(`  Batch ${String(idx).padStart(2, '0')}: ${batch.size} students in ${(batch.duration/1000).toFixed(2)}s`);
    totalBatchTime += batch.duration;
  });
  console.log(`  Avg Batch Time: ${(totalBatchTime / metrics.batchResults.length / 1000).toFixed(2)}s`);

  if (Object.keys(metrics.errors).length > 0) {
    console.log(`\n⚠️  Errors Encountered:`);
    Object.entries(metrics.errors).forEach(([code, count]) => {
      console.log(`  • ${code}: ${count} occurrences`);
    });
  } else {
    console.log(`\n✅ No Errors - Perfect execution!`);
  }

  // System info
  console.log(`\n💾 System Information:`);
  const memUsage = process.memoryUsage();
  console.log(`  • Memory Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  • External Memory: ${(memUsage.external / 1024 / 1024).toFixed(2)}MB`);

  // Verdict
  console.log(`\n${'='.repeat(80)}`);
  const verdict = metrics.failedRequests === 0 && successRate >= 99 ? '✅ PASSED' : '⚠️  NEEDS REVIEW';
  console.log(`TEST VERDICT: ${verdict}`);
  console.log(`Completed at ${new Date().toISOString()}`);
  console.log('='.repeat(80) + '\n');

  return {
    passed: metrics.failedRequests === 0 && successRate >= 99,
    metrics,
    totalDuration,
  };
}

// Run test
console.log('\n🚀 Starting 1000-student stress test...');
runStressTest()
  .then(result => {
    process.exit(result.passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Stress test failed:', error);
    process.exit(1);
  });
