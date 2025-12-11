import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signOut, updatePassword } from 'firebase/auth';

// Figma Design Colors
const COLORS = {
  primary: '#322757',      // Dark purple sidebar
  accent1: '#F29993',      // Red/pink
  accent2: '#5C4E8E',      // Purple
  accent3: '#FFC000',      // Gold/yellow
  accent4: '#3FB65F',      // Green
  background: '#F0F1F3',   // Light gray
  text: '#000000',         // Black
  textLight: '#5C5C5C',    // Gray
  white: '#ffffff'         // White
};

function AdminDashboard() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ schools: 6000, students: 25000, teachers: 3500, parents: 11020 });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [classesData, setClassesData] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [topScorers, setTopScorers] = useState([]);

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
      // Load classes
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

      // Calculate stats using Figma design values
      setStats({
        schools: 6000,
        students: 25000,
        teachers: 3500,
        parents: 11020
      });

      // Get top scorers
      const topStudents = studentsData
        .filter(s => s.score)
        .sort((a, b) => parseFloat(b.score || 0) - parseFloat(a.score || 0))
        .slice(0, 3);
      setTopScorers(topStudents);

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
    <div className="min-h-screen flex" style={{ backgroundColor: COLORS.background }}>
      {/* Sidebar Navigation */}
      <div style={{ backgroundColor: COLORS.primary }} className="w-52 fixed h-screen shadow-2xl overflow-y-auto">
        {/* Logo Area */}
        <div className="p-6 border-b" style={{ borderColor: COLORS.primary }}>
          <div className="flex items-center justify-center h-16 rounded-full" style={{ backgroundColor: COLORS.background }}>
            <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>CPS</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-6 space-y-6">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'students', label: 'Students', icon: '👨‍🎓' },
            { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
            { id: 'parents', label: 'Parents', icon: '👨‍👩‍👧' },
            { id: 'library', label: 'Library', icon: '📚' },
            { id: 'attendance', label: 'Attendance', icon: '✓' },
            { id: 'exam', label: 'Exam', icon: '📝' },
            { id: 'hostel', label: 'Hostel', icon: '🏢' },
            { id: 'account', label: 'Account', icon: '💼' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                activeTab === item.id
                  ? `text-center py-2 px-4 rounded-full ${COLORS.background} font-bold text-xs`
                  : 'text-white hover:bg-opacity-75'
              }`}
              style={{
                color: activeTab === item.id ? COLORS.primary : 'white',
                backgroundColor: activeTab === item.id ? COLORS.background : 'transparent'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-lg font-semibold text-xs text-white hover:opacity-80 transition-all"
            style={{ backgroundColor: COLORS.accent1 }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-52">
        {/* Top Header */}
        <div className="bg-white border-b p-6 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Welcome to CPS</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-200 outline-none text-sm w-48"
                />
                <span className="text-gray-600">🔍</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">👤</div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs">🔔</div>
                <img src="https://placehold.co/32x32" alt="user" className="w-8 h-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Overview Tab - Figma Design */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards - Figma Design */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Schools', value: stats.schools, color: COLORS.accent1 },
                      { label: 'Students', value: stats.students, color: COLORS.accent2 },
                      { label: 'Teachers', value: stats.teachers, color: COLORS.accent3 },
                      { label: 'Parents', value: stats.parents, color: COLORS.accent4 }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: stat.color }}>
                        <p className="text-gray-700 text-sm font-semibold mb-2">{stat.label}</p>
                        <p className="text-2xl font-semibold text-gray-800">{stat.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Calendar & Attendance + Performance */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calendar Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold">Calendar & Attendance</h3>
                        <span className="text-sm font-bold text-gray-700">10 February, 2024</span>
                      </div>
                      <div className="flex gap-3 mb-6">
                        <button className="px-3 py-1 text-xs font-bold rounded-full text-white" style={{ backgroundColor: COLORS.accent1 }}>← Prev</button>
                        <button className="px-3 py-1 text-xs font-bold rounded-full bg-gray-300 text-gray-700">Next →</button>
                      </div>
                      {/* Simple Calendar Grid */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-7 gap-2 mb-4">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="w-10 h-10 flex items-center justify-center font-bold text-xs bg-gray-100 rounded-lg">
                              {day}
                            </div>
                          ))}
                        </div>
                        {/* Calendar dates */}
                        <div className="grid grid-cols-7 gap-2">
                          {Array.from({ length: 35 }).map((_, i) => {
                            const day = i + 1;
                            let bgColor = 'bg-white border border-gray-200';
                            if (day === 9 || day === 16 || day === 23) bgColor = `bg-green-400`;
                            if (day === 17) bgColor = `bg-yellow-400`;
                            return (
                              <div key={i} className={`w-10 h-10 flex items-center justify-center text-xs font-bold rounded-full ${bgColor}`}>
                                {day <= 28 ? day : ''}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* School Performance */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold">School Performance</h3>
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">All the data in percentage (%)</span>
                      </div>
                      <div className="space-y-6">
                        {[
                          { name: 'Govt. School', value: 85, color: COLORS.accent2 },
                          { name: 'Private School', value: 72, color: COLORS.accent3 },
                          { name: 'Average School', value: 90, color: COLORS.accent4 }
                        ].map((school, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-gray-800">{school.name}</span>
                              <span className="text-xs font-bold text-gray-600">{school.value}%</span>
                            </div>
                            <div className="h-8 bg-gray-200 rounded-lg overflow-hidden">
                              <div 
                                className="h-full transition-all rounded-lg"
                                style={{ width: `${school.value}%`, backgroundColor: school.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Announcements + Top Scorers */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Announcements */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold">Calendar & Attendance</h3>
                        <button className="text-xs font-semibold border border-green-500 text-green-500 px-3 py-1 rounded-full hover:bg-green-50">View All</button>
                      </div>
                      <div className="space-y-4">
                        {[
                          { title: 'Compete Public School System', date: '02 Oct, 2023', desc: 'Lorem Ipsum is simply dummy text...' },
                          { title: 'Pride Public School Systems', date: '02 Oct, 2023', desc: 'Lorem Ipsum is simply dummy text...' }
                        ].map((item, i) => (
                          <div key={i} className={i > 0 ? 'border-t pt-4' : ''}>
                            <p className="font-bold text-sm text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{item.date}</p>
                            <p className="text-xs text-gray-700 mt-2">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Scorers */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-base font-bold mb-4">Top Scorer</h3>
                      <div className="space-y-4">
                        {[
                          { name: 'Jane Cooper', school: 'St.Javidar School', score: '99.99%', rank: '1st', color: COLORS.accent4 },
                          { name: 'Eleanor Pena', school: 'Polar School', score: '99.76%', rank: '2nd', color: COLORS.accent2 },
                          { name: 'Devon Lane', school: 'Polar School', score: '99.50%', rank: '3rd', color: COLORS.accent3 }
                        ].map((scorer, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-16 h-24 rounded-lg flex flex-col items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: scorer.color }}>
                              <img src="https://placehold.co/44x44" alt={scorer.name} className="w-11 h-11 rounded-full mb-1" />
                              <span className="text-xs">{scorer.rank}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm text-gray-800">{scorer.name}</p>
                              <p className="text-xs text-gray-600">{scorer.school}</p>
                              <p className="text-lg font-bold text-gray-800 mt-1">{scorer.score}</p>
                            </div>
                          </div>
                        ))}
                      </div>
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

                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b">
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
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  {/* Class Filter */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-base font-bold text-gray-800 mb-4">🎓 Select Class</h3>
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
                                ? 'bg-green-500 text-white shadow-lg'
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

                  {/* Students Table */}
                  {selectedClassId && (
                    <div className="space-y-4">
                      <div className="flex gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                        <button
                          onClick={loadDashboardData}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm"
                        >
                          🔄 Refresh
                        </button>
                      </div>

                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b">
                              <tr>
                                <th className="px-6 py-3 text-left font-bold text-gray-700">Name</th>
                                <th className="px-6 py-3 text-left font-bold text-gray-700">Email</th>
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
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-800 font-semibold">{student.name || 'N/A'}</td>
                                      <td className="px-6 py-4 font-mono text-gray-800 text-xs">{student.email || 'N/A'}</td>
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
                                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No students found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-base font-bold text-gray-800 mb-6">📊 Activity Log</h2>
                  <div className="space-y-4 max-h-screen overflow-y-auto">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                          <span className="text-2xl mt-1">{activity.type === 'login' ? '🔓' : '✍️'}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{activity.action}</p>
                            <p className="text-sm text-gray-600 mt-1">User: {activity.user}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {activity.timestamp?.toDate?.().toLocaleString() || 'N/A'}
                            </p>
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
      </div>

      {/* Password Modal */}
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
