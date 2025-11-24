import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState('🔄 Testing Firebase...');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
      console.log('📝 Firebase config loaded');
      console.log('🔗 Testing connection to students collection...');
      
      const snapshot = await getDocs(collection(db, 'students'));
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStudents(docs);
      setStatus(`✅ Firebase is working! Found ${docs.length} students`);
      console.log('✅ Students:', docs);
    } catch (error) {
      console.error('❌ Firebase Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold mb-4">🧪 Firebase Test</h1>
          
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mb-6">
            <p className="font-mono text-lg">{status}</p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Students Found:</h2>
            {students.length === 0 ? (
              <p className="text-gray-600">No students found</p>
            ) : (
              <div className="space-y-2">
                {students.map(student => (
                  <div key={student.id} className="bg-gray-50 p-3 rounded border">
                    <p className="font-bold">{student.name}</p>
                    <p className="text-sm text-gray-600">Code: {student.loginCode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <a href="/teacher" className="btn btn-blue">
            Go to Teacher Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
