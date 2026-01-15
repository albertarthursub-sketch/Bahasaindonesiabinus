import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import StudentAnalyticsCard from '../components/StudentAnalyticsCard';
import AIAnalyticsSummary from '../components/AIAnalyticsSummary';

function TeacherAnalytics() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [lists, setLists] = useState({});
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    // Get teacher ID from sessionStorage
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      console.error('Teacher authentication not found in session');
      return;
    }
    setTeacherId(token);
    loadClasses(token);
    loadLists(token);
  }, []);

  const loadClasses = async (teacherId) => {
    try {
      // CRITICAL FIX: Filter classes by current teacher's ID
      const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
      const snapshot = await getDocs(q);
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudentsByClass = async (classId) => {
    try {
      const q = query(collection(db, 'students'), where('classId', '==', classId));
      const snapshot = await getDocs(q);
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSelectedClass(classId);
      setSelectedStudent(null);
      setStudentProgress(null);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadLists = async (teacherId) => {
    try {
      // CRITICAL FIX: Filter lists by current teacher's ID
      const q = query(collection(db, 'lists'), where('teacherId', '==', teacherId));
      const snapshot = await getDocs(q);
      const listsMap = {};
      snapshot.docs.forEach(doc => {
        listsMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setLists(listsMap);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const loadStudentProgress = async (studentId) => {
    setLoading(true);
    try {
      // Query progress documents for this student
      const progressQuery = query(
        collection(db, 'progress'),
        where('studentId', '==', studentId)
      );
      const progressSnapshot = await getDocs(progressQuery);
      
      console.log(`📊 Progress loaded for student ${studentId}:`, progressSnapshot.docs.length, 'documents');
      
      const progressData = {};
      progressSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('Progress entry:', data);
        if (!progressData[data.listId]) {
          progressData[data.listId] = [];
        }
        progressData[data.listId].push({
          id: doc.id,
          ...data
        });
      });

      console.log('Final progress data:', progressData);
      setStudentProgress(progressData);
      setSelectedStudent(studentId);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!studentProgress || Object.keys(studentProgress).length === 0) {
      console.log('⚠️ No student progress data available');
      return null;
    }

    let totalAttempts = 0;
    let correctAttempts = 0;
    let totalStars = 0;
    const listStats = {};

    Object.entries(studentProgress).forEach(([listId, attempts]) => {
      const listData = lists[listId];
      if (!listData) {
        console.warn(`⚠️ List data not found for listId: ${listId}`);
        return;
      }

      const listCorrect = attempts.filter(a => a.correct).length;
      const listTotal = attempts.length;
      const listStars = attempts.reduce((sum, a) => sum + (a.starsEarned || 0), 0);

      listStats[listId] = {
        name: listData.title,
        correct: listCorrect,
        total: listTotal,
        percentage: listTotal > 0 ? Math.round((listCorrect / listTotal) * 100) : 0,
        stars: listStars,
        attempts: attempts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      };

      totalAttempts += listTotal;
      correctAttempts += listCorrect;
      totalStars += listStars;
    });

    // Return null if no attempts made
    if (totalAttempts === 0) {
      console.log('⚠️ Total attempts is 0');
      return null;
    }

    const result = {
      overallPercentage: Math.round((correctAttempts / totalAttempts) * 100),
      totalAttempts,
      correctAttempts,
      totalStars,
      listStats
    };
    
    console.log('✅ Stats calculated:', result);
    return result;
  };

  const getStudentName = (studentId) => {
    return students.find(s => s.id === studentId)?.name || 'Unknown';
  };

  // Use useMemo to properly compute stats when dependencies change
  const stats = useMemo(() => {
    console.log('🔄 Recalculating stats with studentProgress:', studentProgress, 'lists:', lists);
    return calculateStats();
  }, [studentProgress, lists]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📊 Student Analytics</h1>
              <p className="text-gray-600">Track progress, assessment, and provide feedback</p>
            </div>
            <a href="/teacher" className="btn btn-gray">← Dashboard</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Class & Student Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">🎓 Select Class</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {classes.length === 0 ? (
                  <p className="text-gray-500 text-sm">No classes yet</p>
                ) : (
                  classes.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => loadStudentsByClass(cls.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedClass === cls.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="font-semibold">{cls.name}</div>
                      <div className="text-xs opacity-75">{cls.gradeLevel} • {cls.studentCount || 0} students</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <hr className="my-4" />

            <h2 className="text-xl font-bold mb-3">👥 Students</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedClass && students.length === 0 ? (
                <p className="text-gray-500 text-sm">No students in this class</p>
              ) : !selectedClass ? (
                <p className="text-gray-500 text-sm">Select a class first</p>
              ) : (
                students.map(student => (
                  <button
                    key={student.id}
                    onClick={() => loadStudentProgress(student.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedStudent === student.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-xs opacity-75">Code: {student.loginCode}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Analytics View */}
          <div className="md:col-span-2">
            {!selectedStudent ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-xl text-gray-600">👈 Select a student to view analytics</p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-xl text-gray-600">Loading...</p>
              </div>
            ) : !stats ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-xl text-gray-600">No progress data yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Enhanced Student Card with Level and Score */}
                <StudentAnalyticsCard 
                  studentName={students.find(s => s.id === selectedStudent)?.name || 'Student'}
                  stats={stats}
                />

                {/* AI Analytics Summary */}
                <AIAnalyticsSummary 
                  studentName={students.find(s => s.id === selectedStudent)?.name || 'Student'}
                  stats={stats}
                  listStats={stats.listStats}
                />

                {/* Overall Stats - Kept for detailed breakdown */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Detailed Performance Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.overallPercentage}%</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.correctAttempts}/{stats.totalAttempts}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Stars</p>
                      <p className="text-3xl font-bold text-yellow-500">⭐ {stats.totalStars}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Attempts</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.totalAttempts}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Lists Attempted</p>
                      <p className="text-3xl font-bold text-green-600">{Object.keys(stats.listStats).length}</p>
                    </div>
                  </div>
                </div>

                {/* Progress by List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Progress by List</h3>
                  {Object.entries(stats.listStats).map(([listId, listStat]) => (
                    <details key={listId} className="bg-white rounded-xl shadow-lg p-6 cursor-pointer group">
                      <summary className="flex items-center justify-between font-semibold hover:text-blue-600 transition-all">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">📚</span>
                          <div>
                            <p className="text-lg">{listStat.name}</p>
                            <p className="text-sm text-gray-600">
                              {listStat.correct}/{listStat.total} correct • {listStat.percentage}% • ⭐ {listStat.stars}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-24 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all"
                              style={{ width: `${listStat.percentage}%` }}
                            />
                          </div>
                        </div>
                      </summary>

                      {/* Detailed Word Assessment */}
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-4">📝 Word Assessment</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {listStat.attempts.map((attempt, idx) => {
                            const wordData = lists[listId]?.words?.find(w => w.bahasa === attempt.word);
                            return (
                              <div
                                key={attempt.id || idx}
                                className={`p-3 rounded-lg border-2 ${
                                  attempt.correct
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-red-50 border-red-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">
                                      {attempt.correct ? '✅' : '❌'}
                                    </span>
                                    <div>
                                      <p className="font-semibold">
                                        {attempt.word}
                                      </p>
                                      {wordData && (
                                        <p className="text-sm text-gray-600">
                                          {wordData.english} • Syllables: {wordData.syllables}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">⭐ {attempt.starsEarned || 0}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(attempt.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {!attempt.correct && (
                                  <div className="bg-white rounded p-2 text-sm">
                                    <p className="text-gray-700">
                                      <strong>Expected:</strong> {attempt.word}
                                    </p>
                                    <p className="text-gray-700">
                                      <strong>Given:</strong> {attempt.studentAnswer || 'N/A'}
                                    </p>
                                  </div>
                                )}

                                {attempt.timestamp && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Attempt time: {new Date(attempt.timestamp).toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>

                {/* Progress Report Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">📈 Progress Report & Feedback</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-green-800">✨ Strengths:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                        {stats.overallPercentage >= 80 && (
                          <li>Excellent overall performance with {stats.overallPercentage}% accuracy</li>
                        )}
                        {stats.totalAttempts >= 10 && (
                          <li>Consistent engagement with {stats.totalAttempts} attempts across lessons</li>
                        )}
                        {Object.values(stats.listStats).some(l => l.percentage === 100) && (
                          <li>Mastered {Object.values(stats.listStats).filter(l => l.percentage === 100).length} vocabulary list(s) perfectly</li>
                        )}
                        {stats.totalStars >= 20 && (
                          <li>Earned {stats.totalStars} stars, showing dedication to learning</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-yellow-800">🎯 Areas for Improvement:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                        {stats.overallPercentage < 70 && (
                          <li>Focus on improving accuracy - current rate is {stats.overallPercentage}%</li>
                        )}
                        {Object.entries(stats.listStats).some(([_, l]) => l.percentage < 50) && (
                          <li>Review the following challenging lists: {
                            Object.entries(stats.listStats)
                              .filter(([_, l]) => l.percentage < 50)
                              .map(([_, l]) => l.name)
                              .join(', ')
                          }</li>
                        )}
                        {stats.totalAttempts < 5 && (
                          <li>Increase practice attempts to reinforce learning</li>
                        )}
                        {Object.entries(stats.listStats).some(([_, l]) => l.percentage >= 80 && l.percentage < 100) && (
                          <li>Push toward mastery in partially learned lists</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-blue-800">💡 Recommendations:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                        <li>Practice syllable breakdown for words with errors</li>
                        <li>Use the pronunciation feature to improve listening skills</li>
                        <li>Review incorrect answers and try again</li>
                        <li>Set a goal to earn more stars in the next session</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherAnalytics;
