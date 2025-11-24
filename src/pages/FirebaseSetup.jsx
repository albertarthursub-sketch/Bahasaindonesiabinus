import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

function FirebaseSetup() {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Checking Firebase connection...');
  const [collections, setCollections] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    checkFirebase();
  }, []);

  const checkFirebase = async () => {
    try {
      setStatus('checking');
      setMessage('Testing Firebase connection...');
      
      // Test connection by trying to read students collection
      const studentsRef = collection(db, 'students');
      const snapshot = await getDocs(studentsRef);
      
      setCollections(['students']);
      setStatus('connected');
      setMessage(`✓ Firebase is connected! Found ${snapshot.size} students.`);
    } catch (error) {
      console.error('Firebase connection error:', error);
      setStatus('error');
      setMessage(`✗ Firebase connection failed: ${error.message}`);
      setErrors([error.message]);
    }
  };

  const initializeCollections = async () => {
    try {
      setStatus('initializing');
      setMessage('Creating collections and sample data...');
      
      const initErrors = [];

      // Test 1: Create students collection with sample data
      try {
        await addDoc(collection(db, 'students'), {
          name: 'Test Student',
          loginCode: 'TEST01',
          email: 'test@example.com',
          createdAt: new Date().toISOString(),
          status: 'active'
        });
        setMessage(prev => prev + '\n✓ Students collection created');
      } catch (e) {
        initErrors.push(`Students collection: ${e.message}`);
      }

      // Test 2: Create lists collection with sample data
      try {
        await addDoc(collection(db, 'lists'), {
          title: 'Sample Vocabulary List',
          learningArea: 'vocabulary',
          words: [
            {
              english: 'Cat',
              bahasa: 'Kucing',
              syllables: 'Ku-cing',
              imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          wordCount: 1,
          status: 'active'
        });
        setMessage(prev => prev + '\n✓ Lists collection created');
      } catch (e) {
        initErrors.push(`Lists collection: ${e.message}`);
      }

      // Test 3: Create progress collection
      try {
        await addDoc(collection(db, 'progress'), {
          studentId: 'test-student-id',
          listId: 'test-list-id',
          word: 'Kucing',
          english: 'Cat',
          correct: true,
          starsEarned: 3,
          timestamp: new Date().toISOString()
        });
        setMessage(prev => prev + '\n✓ Progress collection created');
      } catch (e) {
        initErrors.push(`Progress collection: ${e.message}`);
      }

      // Test 4: Create teacherResources collection
      try {
        await addDoc(collection(db, 'teacherResources'), {
          title: 'Sample Lesson Plan',
          type: 'lesson_plan',
          content: 'This is a sample lesson plan',
          tags: ['sample'],
          createdAt: new Date().toISOString(),
          status: 'active'
        });
        setMessage(prev => prev + '\n✓ Teacher Resources collection created');
      } catch (e) {
        initErrors.push(`Teacher Resources collection: ${e.message}`);
      }

      // Test 5: Create sessions collection
      try {
        await addDoc(collection(db, 'sessions'), {
          studentId: 'test-student-id',
          listId: 'test-list-id',
          startTime: new Date().toISOString(),
          status: 'active'
        });
        setMessage(prev => prev + '\n✓ Sessions collection created');
      } catch (e) {
        initErrors.push(`Sessions collection: ${e.message}`);
      }

      if (initErrors.length === 0) {
        setStatus('success');
        setMessage(prev => prev + '\n\n✓ All collections initialized successfully!');
      } else {
        setStatus('partial');
        setMessage(prev => prev + '\n\n⚠ Some collections had issues (see errors below)');
        setErrors(initErrors);
      }

      // Refresh status
      setTimeout(checkFirebase, 1000);
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus('error');
      setMessage(`✗ Initialization failed: ${error.message}`);
      setErrors([error.message]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">🔧 Firebase Setup & Status</h1>
          <p className="text-gray-600">Check Firebase connection and initialize collections</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            {status === 'checking' && (
              <div className="text-4xl animate-spin">⏳</div>
            )}
            {status === 'error' && (
              <div className="text-4xl">❌</div>
            )}
            {status === 'connected' && (
              <div className="text-4xl">✅</div>
            )}
            {status === 'initializing' && (
              <div className="text-4xl animate-pulse">⚙️</div>
            )}
            {status === 'success' && (
              <div className="text-4xl">🎉</div>
            )}
            {status === 'partial' && (
              <div className="text-4xl">⚠️</div>
            )}
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {status === 'checking' && 'Checking Firebase...'}
                {status === 'error' && 'Connection Failed'}
                {status === 'connected' && 'Firebase Connected'}
                {status === 'initializing' && 'Initializing Collections...'}
                {status === 'success' && 'Setup Complete'}
                {status === 'partial' && 'Partial Setup'}
              </h2>
              <div className="whitespace-pre-wrap text-gray-700 font-mono text-sm">
                {message}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-red-800 mb-3">⚠️ Issues Found:</h3>
            <ul className="space-y-2">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-700">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4">Actions:</h3>
          
          {status === 'error' && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 font-semibold mb-3">
                🔐 To fix Firebase connection:
              </p>
              <ol className="text-sm text-red-700 space-y-2 list-decimal list-inside">
                <li>Go to <strong>Firebase Console</strong> → Your Project</li>
                <li>Go to <strong>Firestore Database</strong></li>
                <li>Click <strong>"Create Database"</strong></li>
                <li>Choose <strong>"Start in production mode"</strong></li>
                <li>Wait for it to be created</li>
                <li>Go to <strong>Rules</strong> tab and replace with:
                  <code className="block bg-gray-800 text-white p-2 rounded mt-1 text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                  </code>
                </li>
                <li>Click <strong>"Publish"</strong></li>
                <li>Refresh this page and try again</li>
              </ol>
            </div>
          )}

          <button
            onClick={checkFirebase}
            disabled={status === 'checking' || status === 'initializing'}
            className="btn btn-blue w-full"
          >
            {status === 'checking' ? '⏳ Checking...' : '🔄 Check Connection'}
          </button>

          {(status === 'connected' || status === 'error' || status === 'partial') && (
            <button
              onClick={initializeCollections}
              disabled={status === 'initializing'}
              className="btn btn-green w-full"
            >
              {status === 'initializing' ? '⚙️ Initializing...' : '🚀 Initialize Collections'}
            </button>
          )}

          {(status === 'success' || status === 'connected') && (
            <a href="/teacher" className="btn btn-purple w-full text-center">
              ✓ Go to Teacher Dashboard
            </a>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📋 Setup Instructions:</h3>
          <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
            <li>Click "Check Connection" to test Firebase</li>
            <li>If connection fails, follow the steps in the error box above</li>
            <li>Once connected, click "Initialize Collections" to create tables</li>
            <li>When setup is complete, you can use the app normally</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default FirebaseSetup;
