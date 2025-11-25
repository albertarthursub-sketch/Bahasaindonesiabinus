import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import FirebaseSetup from './pages/FirebaseSetup';
import AdminCleanup from './pages/AdminCleanup';
import TestFirebase from './pages/TestFirebase';
import TeacherAuth from './pages/TeacherAuth';
import TeacherDashboard from './pages/TeacherDashboard';
import ClassManagement from './pages/ClassManagement';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherResources from './pages/TeacherResources';
import StudentLogin from './pages/StudentLogin';
import StudentLearn from './pages/StudentLearn';

// Protected route component for teacher-only pages
function ProtectedRoute({ element }) {
  const token = sessionStorage.getItem('authToken');
  return token ? element : <Navigate to="/teacher-login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<FirebaseSetup />} />
        <Route path="/admin" element={<AdminCleanup />} />
        <Route path="/test" element={<TestFirebase />} />
        
        {/* Teacher Authentication */}
        <Route path="/teacher-login" element={<TeacherAuth />} />
        
        {/* Protected Teacher Routes */}
        <Route path="/teacher" element={<ProtectedRoute element={<TeacherDashboard />} />} />
        <Route path="/classes" element={<ProtectedRoute element={<ClassManagement />} />} />
        <Route path="/teacher-analytics" element={<ProtectedRoute element={<TeacherAnalytics />} />} />
        <Route path="/teacher-resources" element={<ProtectedRoute element={<TeacherResources />} />} />
        
        {/* Student Routes (public) */}
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/learn/:listId" element={<StudentLearn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
