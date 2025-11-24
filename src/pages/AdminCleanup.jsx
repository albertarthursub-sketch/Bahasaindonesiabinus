import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { createStudent, createVocabularyList } from '../lib/firebaseStorage';

export default function AdminCleanup() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [lists, setLists] = useState([]);

  const clearAllData = async () => {
    setLoading(true);
    setStatus('🔄 Clearing all data...');
    try {
      // Clear students
      const studentsSnap = await getDocs(collection(db, 'students'));
      for (const doc of studentsSnap.docs) {
        await deleteDoc(doc.ref);
      }
      
      // Clear lists
      const listsSnap = await getDocs(collection(db, 'lists'));
      for (const doc of listsSnap.docs) {
        await deleteDoc(doc.ref);
      }
      
      // Clear progress
      const progressSnap = await getDocs(collection(db, 'progress'));
      for (const doc of progressSnap.docs) {
        await deleteDoc(doc.ref);
      }
      
      // Clear sessions
      const sessionsSnap = await getDocs(collection(db, 'sessions'));
      for (const doc of sessionsSnap.docs) {
        await deleteDoc(doc.ref);
      }
      
      // Clear resources
      const resourcesSnap = await getDocs(collection(db, 'teacherResources'));
      for (const doc of resourcesSnap.docs) {
        await deleteDoc(doc.ref);
      }
      
      setStatus('✅ All data cleared successfully!');
    } catch (error) {
      setStatus(`❌ Error clearing data: ${error.message}`);
    }
    setLoading(false);
  };

  const createSampleData = async () => {
    setLoading(true);
    setStatus('🔄 Creating sample data...');
    try {
      // Create students
      const studentNames = ['Ahmad Rizki', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Lestari'];
      const createdStudents = [];
      
      for (const name of studentNames) {
        const student = await createStudent(name, '');
        createdStudents.push(student);
        setStatus(`✅ Created student: ${name} (Code: ${student.loginCode})`);
      }
      
      setStudents(createdStudents);
      
      // Create a vocabulary list
      const listData = {
        title: 'Basic Greetings & Introductions',
        description: 'Learn essential Indonesian greetings and how to introduce yourself',
        teacherId: 'demo-teacher',
        words: [
          {
            word: 'Selamat Pagi',
            syllables: ['Se', 'la', 'mat', 'Pa', 'gi'],
            translation: 'Good morning',
            pronunciation: 'suh-luh-maht pah-gee',
            category: 'greetings',
            imageUrl: '',
            audioUrl: ''
          },
          {
            word: 'Nama Saya',
            syllables: ['Na', 'ma', 'Sa', 'ya'],
            translation: 'My name is',
            pronunciation: 'nah-mah sah-yah',
            category: 'introduction',
            imageUrl: '',
            audioUrl: ''
          },
          {
            word: 'Terima Kasih',
            syllables: ['Te', 'ri', 'ma', 'Ka', 'sih'],
            translation: 'Thank you',
            pronunciation: 'tuh-ree-mah kah-see',
            category: 'politeness',
            imageUrl: '',
            audioUrl: ''
          },
          {
            word: 'Permisi',
            syllables: ['Per', 'mi', 'si'],
            translation: 'Excuse me',
            pronunciation: 'per-mee-see',
            category: 'politeness',
            imageUrl: '',
            audioUrl: ''
          },
          {
            word: 'Apa Kabar',
            syllables: ['A', 'pa', 'Ka', 'bar'],
            translation: 'How are you',
            pronunciation: 'ah-pah kah-bar',
            category: 'greetings',
            imageUrl: '',
            audioUrl: ''
          }
        ]
      };
      
      const list = await createVocabularyList(listData);
      setLists([list]);
      
      setStatus(`✅ Sample data created! Created ${createdStudents.length} students and 1 vocabulary list`);
    } catch (error) {
      setStatus(`❌ Error creating sample data: ${error.message}`);
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ⚙️ Admin Cleanup & Setup
          </h1>
          <p className="text-gray-600 mb-6">
            Clear sample data and create fresh test data for real workflow testing
          </p>

          {status && (
            <div className="mb-6 p-4 rounded-lg bg-gray-100 border-l-4 border-blue-500 text-sm font-mono">
              {status}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <button
              onClick={clearAllData}
              disabled={loading}
              className="w-full btn btn-gray hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              🗑️ Clear All Data (Students, Lists, Progress)
            </button>

            <button
              onClick={createSampleData}
              disabled={loading}
              className="w-full btn btn-blue disabled:opacity-50"
            >
              ✨ Create Fresh Sample Data
            </button>
          </div>

          {students.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="font-bold text-lg mb-3 text-blue-900">📋 Created Students (Login Codes)</h2>
              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="p-2 bg-white rounded border border-blue-200">
                    <div className="font-semibold text-gray-800">{student.name}</div>
                    <div className="text-sm text-blue-600 font-mono">Code: <span className="font-bold text-lg">{student.loginCode}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lists.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="font-bold text-lg mb-3 text-green-900">📚 Created Vocabulary List</h2>
              <div className="space-y-2">
                {lists.map((list) => (
                  <div key={list.id} className="p-2 bg-white rounded border border-green-200">
                    <div className="font-semibold text-gray-800">{list.title}</div>
                    <div className="text-sm text-gray-600">{list.description}</div>
                    <div className="text-xs text-green-600 mt-1">{list.words?.length || 0} words</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-bold text-yellow-900 mb-2">📝 Next Steps:</h3>
            <ol className="text-sm text-yellow-900 space-y-2 ml-4 list-decimal">
              <li>Click "Clear All Data" to remove sample data</li>
              <li>Click "Create Fresh Sample Data" to generate real students with login codes</li>
              <li>Copy one of the student login codes above</li>
              <li>Go to <Link to="/student" className="underline font-semibold">Student Login</Link> and paste the code</li>
              <li>Complete a learning session and track progress in analytics</li>
            </ol>
          </div>

          <div className="mt-6 flex gap-4">
            <Link to="/" className="btn btn-gray flex-1">
              ← Back to Home
            </Link>
            <Link to="/teacher" className="btn btn-blue flex-1">
              Go to Teacher Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
