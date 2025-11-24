import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FirebaseSetup from './pages/FirebaseSetup';
import AdminCleanup from './pages/AdminCleanup';
import TestFirebase from './pages/TestFirebase';
import TeacherDashboard from './pages/TeacherDashboard';
import ClassManagement from './pages/ClassManagement';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherResources from './pages/TeacherResources';
import StudentLogin from './pages/StudentLogin';
import StudentLearn from './pages/StudentLearn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<FirebaseSetup />} />
        <Route path="/admin" element={<AdminCleanup />} />
        <Route path="/test" element={<TestFirebase />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/teacher-analytics" element={<TeacherAnalytics />} />
        <Route path="/teacher-resources" element={<TeacherResources />} />
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/learn/:listId" element={<StudentLearn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
