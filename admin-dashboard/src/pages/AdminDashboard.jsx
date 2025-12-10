import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signOut, updatePassword } from 'firebase/auth';

function AdminDashboard() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ totalTeachers: 0, totalStudents: 0, activeToday: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [chartData, setChartData] = useState({ teacherStatus: [0, 0], studentStatus: [0, 0] });
  const [classesData, setClassesData] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Check admin access
  useEffect(() => {
    const adminEmail = sessionStorage.getItem('adminEmail');
    if (!adminEmail) {
      navigate('/admin-login');
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load classes with readable names
      const classesSnap = await getDocs(collection(db, 'classes'));
      const classesInfo = classesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setClassesData(classesInfo);
      if (classesInfo.length > 0 && !selectedClassId) {
        setSelectedClassId(classesInfo[0].id);
      }

      // Load teachers
      const teachersSnap = await getDocs(query(collection(db, 'teachers'), limit(100)));
      const teachersData = teachersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeachers(teachersData);

      // Load students
      const studentsSnap = await getDocs(query(collection(db, 'students'), limit(100)));
      const studentsData = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(studentsData);

      // Calculate stats
      const activeTeachers = teachersData.filter(t => t.status === 'active').length;
      const inactiveTeachers = teachersData.length - activeTeachers;
      const activeStudents = studentsData.filter(s => s.status === 'active').length;
      const inactiveStudents = studentsData.length - activeStudents;
      
      setStats({
        totalTeachers: teachersData.length,
        totalStudents: studentsData.length,
        activeToday: activeTeachers + activeStudents,
        totalUsers: teachersData.length + studentsData.length
      });

      setChartData({
        teacherStatus: [activeTeachers, inactiveTeachers],
        studentStatus: [activeStudents, inactiveStudents]
      });

      // Load recent activity
      const activitySnap = await getDocs(query(collection(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(15)));
      setRecentActivity(activitySnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const user = auth.currentUser;
      if (editingUser.userType === 'teacher') {
        // Note: Can't directly update other user's password with client SDK
        // This would need backend function
        alert('Password update requires backend setup. Use Firebase Console for now.');
      }
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeactivateTeacher = async (teacherId) => {
    if (!window.confirm('Deactivate this teacher?')) return;
    try {
      await updateDoc(doc(db, 'teachers', teacherId), { status: 'inactive' });
      loadDashboardData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('Delete this teacher permanently?')) return;
    try {
      await deleteDoc(doc(db, 'teachers', teacherId));
      loadDashboardData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('adminEmail');
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PieChart = ({ active, inactive, label }) => {
    const total = active + inactive;
    const activePercent = total === 0 ? 0 : (active / total) * 100;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden" style={{
          background: `conic-gradient(#10b981 0deg ${activePercent * 3.6}deg, #ef4444 ${activePercent * 3.6}deg 360deg)`
        }}>
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
            <span className="text-2xl font-bold text-gray-800">{active}</span>
            <span className="text-xs text-gray-600">Active</span>
          </div>
        </div>
        <p className="mt-3 font-semibold text-gray-700">{label}</p>
        <p className="text-sm text-gray-600">{inactive} inactive</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>
            <p className="text-sm text-gray-300 mt-1">Platform Management & Analytics</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-8">
          {[
            { id: 'overview', label: '📈 Overview' },
            { id: 'teachers', label: '👨‍🏫 Teachers' },
            { id: 'students', label: '👨‍🎓 Students' },
            { id: 'activity', label: '📝 Activity' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-semibold transition-all text-sm ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, color: 'from-blue-500 to-blue-600', icon: '👥' },
                    { label: 'Teachers', value: stats.totalTeachers, color: 'from-purple-500 to-purple-600', icon: '👨‍🏫' },
                    { label: 'Students', value: stats.totalStudents, color: 'from-green-500 to-green-600', icon: '👨‍🎓' },
                    { label: 'Active Now', value: stats.activeToday, color: 'from-emerald-500 to-emerald-600', icon: '🟢' }
                  ].map((stat, i) => (
                    <div key={i} className={`bg-gradient-to-br ${stat.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm opacity-90 mb-1">{stat.label}</p>
                          <p className="text-4xl font-bold">{stat.value}</p>
                        </div>
                        <span className="text-4xl">{stat.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-8 text-center">Teachers Status</h3>
                    <div className="flex justify-center">
                      <PieChart active={chartData.teacherStatus[0]} inactive={chartData.teacherStatus[1]} label="Teachers" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-8 text-center">Students Status</h3>
                    <div className="flex justify-center">
                      <PieChart active={chartData.studentStatus[0]} inactive={chartData.studentStatus[1]} label="Students" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Recent Activity</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-b-0">
                          <span className="text-2xl">{activity.type === 'login' ? '🔓' : '✍️'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.user} • {activity.timestamp?.toDate?.().toLocaleString() || 'N/A'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No activity yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Teachers Tab */}
            {activeTab === 'teachers' && (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={loadDashboardData}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-all"
                  >
                    🔄 Refresh
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left font-bold text-gray-700">Email</th>
                          <th className="px-6 py-3 text-left font-bold text-gray-700">Name</th>
                          <th className="px-6 py-3 text-left font-bold text-gray-700">Status</th>
                          <th className="px-6 py-3 text-left font-bold text-gray-700">Last Login</th>
                          <th className="px-6 py-3 text-center font-bold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.length > 0 ? (
                          filteredTeachers.map((teacher, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50 transition-all">
                              <td className="px-6 py-4 font-mono text-gray-800">
                                <button
                                  onClick={() => navigate(`/admin-teacher/${teacher.id}`)}
                                  className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                                >
                                  {teacher.email}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-gray-800">{teacher.displayName || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  teacher.status === 'active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {teacher.status || 'unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600 text-sm">
                                {teacher.lastLogin?.toDate?.().toLocaleDateString() || 'Never'}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => {
                                    setEditingUser({ ...teacher, userType: 'teacher' });
                                    setShowPasswordModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 font-semibold text-xs mr-3"
                                >
                                  🔑 Password
                                </button>
                                <button
                                  onClick={() => handleDeactivateTeacher(teacher.id)}
                                  className="text-orange-600 hover:text-orange-700 font-semibold text-xs mr-2"
                                >
                                  ⏸
                                </button>
                                <button
                                  onClick={() => handleDeleteTeacher(teacher.id)}
                                  className="text-red-600 hover:text-red-700 font-semibold text-xs"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                              No teachers found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Showing {filteredTeachers.length} of {teachers.length} teachers</p>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                {/* Class Filter */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🎓 Select Class</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {classesData.length > 0 ? (
                      classesData.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => {
                            setSelectedClassId(cls.id);
                            setSearchTerm('');
                          }}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
                            selectedClassId === cls.id
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                          title={cls.name}
                        >
                          {cls.name || 'Unknown Class'}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-6 text-gray-500 text-sm">No classes found</p>
                    )}
                  </div>
                </div>

                {/* Students in Selected Class */}
                {selectedClassId && (
                  <div className="space-y-4">
                    <div className="flex gap-4 mb-4 items-center">
                      <input
                        type="text"
                        placeholder="Search students in this class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                      <button
                        onClick={loadDashboardData}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm transition-all"
                      >
                        🔄 Refresh
                      </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left font-bold text-gray-700">Name</th>
                              <th className="px-6 py-3 text-left font-bold text-gray-700">Email</th>
                              <th className="px-6 py-3 text-left font-bold text-gray-700">Unique Code</th>
                              <th className="px-6 py-3 text-left font-bold text-gray-700">Status</th>
                              <th className="px-6 py-3 text-left font-bold text-gray-700">Roll No</th>
                              <th className="px-6 py-3 text-left font-bold text-gray-700">Joined</th>
                              <th className="px-6 py-3 text-left font-bold text-gray-700">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.filter(s => s.classId === selectedClassId).length > 0 ? (
                              filteredStudents
                                .filter(s => s.classId === selectedClassId)
                                .map((student, i) => (
                                  <tr key={i} className="border-b hover:bg-gray-50 transition-all">
                                    <td className="px-6 py-4 text-gray-800 font-semibold">{student.name || 'N/A'}</td>
                                    <td className="px-6 py-4 font-mono text-gray-800 text-xs">{student.email || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                        {student.uniqueCode || student.id?.slice(0, 8) || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        student.status === 'active' 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {student.status || 'unknown'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 font-semibold">{student.rollNo || 'N/A'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                      {student.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 font-semibold">{student.score || '0'}</td>
                                  </tr>
                                ))
                            ) : (
                              <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                  No students found in {classesData.find(c => c.id === selectedClassId)?.name || 'this class'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-700">
                        📊 <span className="font-bold">{filteredStudents.filter(s => s.classId === selectedClassId).length}</span> students in <span className="font-bold text-green-600">{classesData.find(c => c.id === selectedClassId)?.name || 'selected class'}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">📊 Full Activity Log</h2>
                <div className="space-y-4 max-h-screen overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                        <span className="text-2xl mt-1">{activity.type === 'login' ? '🔓' : activity.type === 'signup' ? '📝' : '✍️'}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{activity.action}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            User: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{activity.user}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {activity.timestamp?.toDate?.().toLocaleString() || 'N/A'}
                          </p>
                          {activity.details && (
                            <p className="text-xs text-gray-600 mt-2 italic">📌 {activity.details}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No activity logged yet</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🔐 Update Password</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">User Email</p>
                <p className="font-mono bg-gray-100 px-4 py-2 rounded-lg text-gray-800">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                ℹ️ For security, password updates should be done through Firebase Console. Use the button below as reference.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
