import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import SPOActivityPractice from '../components/SPOActivityPractice';

function StudentHome() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [lists, setLists] = useState([]);
  const [spoActivities, setSpoActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSPOActivity, setSelectedSPOActivity] = useState(null);

  useEffect(() => {
    const studentData = JSON.parse(sessionStorage.getItem('student'));
    if (!studentData) {
      navigate('/student');
      return;
    }
    setStudent(studentData);
    loadLists();
    loadSPOActivities(studentData.classId);
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

  const loadSPOActivities = async (classId) => {
    try {
      const q = query(collection(db, 'spoActivities'), where('classId', '==', classId));
      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('✅ Loaded SPO activities:', activities);
      setSpoActivities(activities);
    } catch (error) {
      console.error('Error loading SPO activities:', error);
    }
  };

  const handleStartLearning = (listId) => {
    navigate(`/learn/${listId}`);
  };

  const handleStartSPOPractice = (listId, classId) => {
    navigate(`/spo-practice/${classId}/${listId}`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('student');
    navigate('/student');
  };

  if (!student) {
    return null;
  }

  // Show SPO Activity modal if one is selected
  if (selectedSPOActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedSPOActivity(null)}
            className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
          >
            ← Back to Home
          </button>
          <SPOActivityPractice
            activityId={selectedSPOActivity.id}
            activity={selectedSPOActivity}
            onComplete={() => setSelectedSPOActivity(null)}
          />
        </div>
      </div>
    );
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

        {/* SPO Activities Section */}
        {spoActivities.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">✍️ Writing Practice Activities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spoActivities.map(activity => (
                <div
                  key={activity.id}
                  onClick={() => setSelectedSPOActivity(activity)}
                  className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-green-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-green-400 to-teal-500 h-24 flex items-center justify-center">
                    <span className="text-5xl">✍️</span>
                  </div>
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full capitalize">
                        {activity.difficulty} Level
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 mb-2">{activity.title || 'SPO Activity'}</p>
                    <p className="text-sm text-gray-600 mb-3">
                      📚 <span className="font-semibold">{activity.totalQuestions || activity.questions?.length || 1} Question(s)</span>
                    </p>
                    <button
                      onClick={() => setSelectedSPOActivity(activity)}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-2 rounded-lg transition"
                    >
                      Start Practice 🎯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentHome;
