import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function StudentHome() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentData = JSON.parse(sessionStorage.getItem('student'));
    if (!studentData) {
      navigate('/student');
      return;
    }
    setStudent(studentData);
    loadLists();
  }, [navigate]);

  const loadLists = async () => {
    try {
      const listsSnapshot = await getDocs(collection(db, 'lists'));
      const loadedLists = listsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('✅ Loaded vocabulary lists:', loadedLists);
      setLists(loadedLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = (listId) => {
    navigate(`/learn/${listId}`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('student');
    navigate('/student');
  };

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{student.avatar}</div>
            <div>
              <p className="text-sm text-gray-600">Welcome back!</p>
              <h1 className="text-3xl font-bold text-gray-800">{student.name}</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">📚 Available Vocabulary Lists</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-xl">Loading vocabulary lists...</p>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-xl mb-4">No vocabulary lists available yet</p>
            <p className="text-gray-500">Ask your teacher to create some vocabulary lists!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <div key={list.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-24 flex items-center justify-center">
                  <span className="text-5xl">
                    {list.mode === 'image-vocabulary' ? '🖼️' : '✋'}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{list.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{list.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>📝 {list.words?.length || 0} words</span>
                    {list.generatedByAI && <span className="text-purple-600">🤖 AI Generated</span>}
                  </div>
                  {list.theme && (
                    <p className="text-sm text-blue-600 mb-4">Theme: {list.theme}</p>
                  )}
                  <button
                    onClick={() => handleStartLearning(list.id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    Start Learning 🚀
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentHome;
