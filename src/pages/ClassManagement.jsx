import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

function ClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showImportText, setShowImportText] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 1');
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importedData, setImportedData] = useState([]);
  const [importText, setImportText] = useState('');
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const classesRef = collection(db, 'classes');
      const snapshot = await getDocs(classesRef);
      const classesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
      alert('Error loading classes');
    }
  };

  const loadClassStudents = async (classId) => {
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('classId', '==', classId));
      const snapshot = await getDocs(q);
      const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClassStudents(students);
      setSelectedClass(classId);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const createClass = async () => {
    if (!className.trim()) {
      alert('Please enter a class name');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'classes'), {
        name: className.trim(),
        gradeLevel,
        createdAt: new Date().toISOString(),
        studentCount: 0
      });
      
      alert('✅ Class created successfully!');
      setClassName('');
      setGradeLevel('Grade 1');
      setShowCreateClass(false);
      loadClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error creating class');
    }
    setLoading(false);
  };

  const deleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteDoc(doc(db, 'classes', classId));
        alert('✅ Class deleted');
        loadClasses();
        setSelectedClass(null);
        setClassStudents([]);
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class');
      }
    }
  };

  const deleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteDoc(doc(db, 'students', studentId));
        alert('✅ Student deleted');
        loadClassStudents(selectedClass);
        const currentClass = classes.find(c => c.id === selectedClass);
        if (currentClass) {
          const newCount = Math.max(0, (currentClass.studentCount || 0) - 1);
          await updateDoc(doc(db, 'classes', selectedClass), {
            studentCount: newCount
          });
          loadClasses();
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student');
      }
    }
  };

  const suspendStudent = async (studentId) => {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        suspended: true
      });
      alert('✅ Student suspended');
      loadClassStudents(selectedClass);
    } catch (error) {
      console.error('Error suspending student:', error);
      alert('Error suspending student');
    }
  };

  const unsuspendStudent = async (studentId) => {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        suspended: false
      });
      alert('✅ Student activated');
      loadClassStudents(selectedClass);
    } catch (error) {
      console.error('Error unsuspending student:', error);
      alert('Error unsuspending student');
    }
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setEditStudentName(student.name);
    setShowEditStudent(true);
  };

  const saveEditStudent = async () => {
    if (!editStudentName.trim()) {
      alert('Please enter a student name');
      return;
    }
    try {
      await updateDoc(doc(db, 'students', editingStudent.id), {
        name: editStudentName.trim()
      });
      alert('✅ Student updated');
      setShowEditStudent(false);
      loadClassStudents(selectedClass);
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student');
    }
  };

  const generateLoginCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const addStudent = async () => {
    if (!studentName.trim()) {
      alert('Please enter student name');
      return;
    }

    setLoading(true);
    try {
      const code = studentCode.trim() || generateLoginCode();
      await addDoc(collection(db, 'students'), {
        name: studentName.trim(),
        loginCode: code,
        classId: selectedClass,
        avatar: '🦁',
        createdAt: new Date().toISOString()
      });

      // Update student count in class
      const classData = classes.find(c => c.id === selectedClass);
      await updateDoc(doc(db, 'classes', selectedClass), {
        studentCount: (classData.studentCount || 0) + 1
      });

      alert('✅ Student added successfully!');
      setStudentName('');
      setStudentCode('');
      setShowAddStudent(false);
      loadClasses();
      loadClassStudents(selectedClass);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student');
    }
    setLoading(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileType = file.type;
      let data = [];

      if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          fileType === 'application/vnd.ms-excel') {
        // Excel file
        const reader = new FileReader();
        reader.onload = (e) => {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          data = XLSX.utils.sheet_to_json(worksheet);
          setImportedData(data);
          setShowBulkImport(true);
        };
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'text/plain' || fileType === 'text/csv' || file.name.endsWith('.txt')) {
        // Text or CSV file - one name per line
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          data = lines.map((name) => ({
            name: name.trim(),
            loginCode: generateLoginCode()
          }));
          setImportedData(data);
          setShowBulkImport(true);
        };
        reader.readAsText(file);
      } else {
        alert('Please use Excel (.xlsx), CSV, or text (.txt) files');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file');
    }
  };

  const importBulkStudents = async () => {
    if (importedData.length === 0) return;

    setLoading(true);
    try {
      let added = 0;
      for (const item of importedData) {
        const studentName = item.name || item.Name || item.Student || '';
        if (!studentName.trim()) continue;

        const code = item.loginCode || item.code || item.Code || generateLoginCode();
        
        await addDoc(collection(db, 'students'), {
          name: studentName.trim(),
          loginCode: code.toString().toUpperCase(),
          classId: selectedClass,
          avatar: '🦁',
          createdAt: new Date().toISOString()
        });
        added++;
      }

      // Update student count
      const classData = classes.find(c => c.id === selectedClass);
      await updateDoc(doc(db, 'classes', selectedClass), {
        studentCount: (classData.studentCount || 0) + added
      });

      alert(`✅ Successfully imported ${added} students!`);
      setImportedData([]);
      setShowBulkImport(false);
      setImportFile(null);
      loadClasses();
      loadClassStudents(selectedClass);
    } catch (error) {
      console.error('Error importing students:', error);
      alert('Error importing students');
    }
    setLoading(false);
  };

  const importTextStudents = async () => {
    const names = importText
      .split('\n')
      .map(n => n.trim())
      .filter(n => n);

    if (names.length === 0) {
      alert('Please enter at least one student name');
      return;
    }

    setLoading(true);
    try {
      let added = 0;
      for (const name of names) {
        const code = generateLoginCode();
        
        await addDoc(collection(db, 'students'), {
          name: name.trim(),
          loginCode: code,
          classId: selectedClass,
          avatar: '🦁',
          createdAt: new Date().toISOString()
        });
        added++;
      }

      // Update student count
      const classData = classes.find(c => c.id === selectedClass);
      await updateDoc(doc(db, 'classes', selectedClass), {
        studentCount: (classData.studentCount || 0) + added
      });

      alert(`✅ Successfully imported ${added} students!`);
      setImportText('');
      setShowImportText(false);
      loadClasses();
      loadClassStudents(selectedClass);
    } catch (error) {
      console.error('Error importing students:', error);
      alert('Error importing students');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Class Management</h1>
            <p className="text-gray-600">Create and manage your classes</p>
          </div>
          <button
            onClick={() => navigate('/teacher')}
            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
          >
            📊 Go to Dashboard
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Classes List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Your Classes</h2>
                <button
                  onClick={() => setShowCreateClass(true)}
                  className="btn btn-blue text-sm py-2 px-3"
                >
                  + New Class
                </button>
              </div>

              {classes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No classes yet. Create one!</p>
              ) : (
                <div className="space-y-2">
                  {classes.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => loadClassStudents(cls.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedClass === cls.id
                          ? 'bg-blue-100 border-2 border-blue-400'
                          : 'bg-gray-100 border-2 border-transparent hover:border-blue-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">{cls.name}</p>
                      <p className="text-sm text-gray-600">{cls.gradeLevel}</p>
                      <p className="text-xs text-gray-500 mt-1">👥 {cls.studentCount || 0} students</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Students List */}
          <div className="md:col-span-2">
            {selectedClass ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    Students in {classes.find(c => c.id === selectedClass)?.name}
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="btn btn-green text-sm py-2 px-3"
                    >
                      + Add Student
                    </button>
                    <button
                      onClick={() => setShowImportText(true)}
                      className="btn bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white text-sm py-2 px-3 rounded-lg font-semibold"
                    >
                      📝 Import Names
                    </button>
                    <button
                      onClick={() => setShowBulkImport(true)}
                      className="btn bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white text-sm py-2 px-3 rounded-lg font-semibold"
                    >
                      📁 Import File
                    </button>
                    <button
                      onClick={() => deleteClass(selectedClass)}
                      className="text-red-500 hover:text-red-700 font-semibold text-sm py-2 px-3 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      🗑️ Delete Class
                    </button>
                  </div>
                </div>

                {classStudents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No students in this class yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="text-left py-3 px-3">Name</th>
                          <th className="text-left py-3 px-3">Login Code</th>
                          <th className="text-left py-3 px-3">Status</th>
                          <th className="text-left py-3 px-3">Action</th>
                          <th className="text-center py-3 px-3">Options</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map(student => (
                          <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-3 font-semibold">{student.name}</td>
                            <td className="py-3 px-3">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                                {student.loginCode}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={student.suspended ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                                {student.suspended ? '🚫 Suspended' : '✅ Active'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(student.loginCode);
                                  alert(`✅ Copied: ${student.loginCode}`);
                                }}
                                className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                              >
                                Copy Code
                              </button>
                            </td>
                            <td className="py-3 px-3 text-center relative group">
                              <button className="text-gray-500 hover:text-gray-700 font-bold text-lg">⋯</button>
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg hidden group-hover:block z-10">
                                <button
                                  onClick={() => openEditStudent(student)}
                                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 font-semibold text-sm border-b"
                                >
                                  ✏️ Edit Name
                                </button>
                                <button
                                  onClick={() => student.suspended ? unsuspendStudent(student.id) : suspendStudent(student.id)}
                                  className="block w-full text-left px-4 py-2 hover:bg-yellow-50 text-yellow-600 font-semibold text-sm border-b"
                                >
                                  {student.suspended ? '🔓 Activate' : '⏸️ Suspend'}
                                </button>
                                <button
                                  onClick={() => deleteStudent(student.id)}
                                  className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold text-sm"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center py-12">
                <p className="text-gray-500 text-lg">Select a class to view students</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Create New Class</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class Name</label>
              <input
                type="text"
                className="input w-full border-2 border-gray-200 focus:border-blue-400"
                placeholder="e.g., Class A, Morning Class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Grade Level</label>
              <select
                className="input w-full border-2 border-gray-200 focus:border-blue-400"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              >
                <option>Grade 1</option>
                <option>Grade 2</option>
                <option>Grade 3</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateClass(false)}
                disabled={loading}
                className="btn btn-gray flex-1"
              >
                Cancel
              </button>
              <button
                onClick={createClass}
                disabled={loading}
                className="btn btn-blue flex-1"
              >
                {loading ? '⏳ Creating...' : '✅ Create Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">👤 Add Student</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name *</label>
              <input
                type="text"
                className="input w-full border-2 border-gray-200 focus:border-blue-400"
                placeholder="e.g., Ahmad, Siti"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Login Code (optional)</label>
              <input
                type="text"
                className="input w-full border-2 border-gray-200 focus:border-blue-400 uppercase"
                placeholder="Leave blank for auto-generate"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">If empty, a random code will be generated</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddStudent(false);
                  setStudentName('');
                  setStudentCode('');
                }}
                disabled={loading}
                className="btn btn-gray flex-1"
              >
                Cancel
              </button>
              <button
                onClick={addStudent}
                disabled={loading}
                className="btn btn-green flex-1"
              >
                {loading ? '⏳ Adding...' : '✅ Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 my-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📁 Bulk Import Students</h2>
            
            {importedData.length === 0 ? (
              <>
                <p className="text-gray-600 mb-4">Upload Excel, CSV, or Text file with student names</p>
                <div className="mb-4 p-4 border-2 border-dashed border-blue-300 rounded-lg">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.txt"
                    onChange={handleFileUpload}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  💡 <strong>Excel:</strong> First column = student names<br/>
                  💡 <strong>CSV/Text:</strong> One name per line<br/>
                  💡 Codes will be auto-generated if not provided
                </p>
                <button
                  onClick={() => {
                    setShowBulkImport(false);
                    setImportFile(null);
                  }}
                  className="btn btn-gray w-full"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">Ready to import <span className="font-bold text-green-600">{importedData.length}</span> students:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
                  {importedData.map((item, index) => (
                    <div key={index} className="text-sm py-1 border-b border-gray-200">
                      <p className="font-semibold">{item.name || item.Name || item.Student}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setImportedData([]);
                      setShowBulkImport(false);
                      setImportFile(null);
                    }}
                    disabled={loading}
                    className="btn btn-gray flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={importBulkStudents}
                    disabled={loading}
                    className="btn btn-green flex-1"
                  >
                    {loading ? '⏳ Importing...' : '✅ Import All'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Import Text Modal */}
      {showImportText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 my-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Import Student Names</h2>
            
            <p className="text-gray-600 mb-4">Enter student names (one per line). Login codes will be auto-generated.</p>
            
            <textarea
              className="input w-full min-h-[200px] border-2 border-gray-200 focus:border-blue-400 resize-none"
              placeholder="Budi&#10;Siti&#10;Ahmad&#10;Dewi&#10;..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              disabled={loading}
            />

            <p className="text-xs text-gray-500 mt-3 mb-4">
              💡 Enter one name per line. Login codes will be automatically generated.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImportText('');
                  setShowImportText(false);
                }}
                disabled={loading}
                className="btn btn-gray flex-1"
              >
                Cancel
              </button>
              <button
                onClick={importTextStudents}
                disabled={loading || !importText.trim()}
                className="btn btn-blue flex-1"
              >
                {loading ? '⏳ Importing...' : `✅ Import ${importText.split('\n').filter(n => n.trim()).length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">✏️ Edit Student</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
              <input
                type="text"
                className="input w-full border-2 border-gray-200 focus:border-blue-400"
                placeholder="Enter student name"
                value={editStudentName}
                onChange={(e) => setEditStudentName(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditStudent(false)}
                className="btn btn-gray flex-1"
              >
                Cancel
              </button>
              <button
                onClick={saveEditStudent}
                className="btn btn-blue flex-1"
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassManagement;
