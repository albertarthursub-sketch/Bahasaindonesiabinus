import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

function AdminTeacherDetails() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();

  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherDetails();
  }, [teacherId]);

  const loadTeacherDetails = async () => {
    setLoading(true);
    try {
      // Load teacher details
      const teacherDoc = await getDoc(doc(db, 'teachers', teacherId));
      if (teacherDoc.exists()) {
        setTeacher({ id: teacherDoc.id, ...teacherDoc.data() });

        // Load classes for this teacher
        const classesSnap = await getDocs(
          query(collection(db, 'classes'), where('teacherId', '==', teacherId))
        );
        const classesData = classesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClasses(classesData);
      }
    } catch (error) {
      console.error('Error loading teacher details:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            ← Back to Dashboard
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">Teacher not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-6 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="mb-4 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-start gap-6">
            <div className="text-6xl">👨‍🏫</div>
            <div>
              <h1 className="text-3xl font-bold">{teacher.displayName || 'Teacher'}</h1>
              <p className="text-gray-300 mt-2">Teacher Profile & Classes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Teacher Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Teacher Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
              <p className="text-lg font-mono text-gray-800 bg-gray-50 p-3 rounded-lg break-all">
                {teacher.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  teacher.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {teacher.status || 'unknown'}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Last Login</p>
              <p className="text-lg text-gray-800">
                {teacher.lastLogin?.toDate?.().toLocaleString() || 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Account Created</p>
              <p className="text-lg text-gray-800">
                {teacher.createdAt?.toDate?.().toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Classes Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🎓 Classes ({classes.length})
          </h2>

          {classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex-1">{cls.name || 'Unnamed Class'}</h3>
                    <span className="text-3xl">📚</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Created</p>
                      <p className="text-sm text-gray-700">
                        {cls.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                      </p>
                    </div>

                    {cls.description && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{cls.description}</p>
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/admin-dashboard?tab=students&class=${cls.id}`)}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-all"
                    >
                      👥 View Students
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg mb-2">No classes assigned</p>
              <p className="text-gray-400 text-sm">This teacher doesn't have any classes yet</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <p className="text-sm opacity-90 mb-1">Total Classes</p>
            <p className="text-4xl font-bold">{classes.length}</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
            <p className="text-sm opacity-90 mb-1">Total Students</p>
            <p className="text-4xl font-bold">
              {classes.reduce((total, cls) => total + (cls.studentCount || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTeacherDetails;
