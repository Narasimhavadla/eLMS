import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ModuleView from './pages/ModuleView';

// New Sidebar Components
import AdminUsers from './pages/AdminUsers';
import AdminModules from './pages/AdminModules';
import MentorModules from './pages/MentorModules';
import MentorStudents from './pages/MentorStudents';
import StudentLearning from './pages/StudentLearning';
// import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/module/:id" element={<ModuleView />} />
            
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/modules" element={<AdminModules />} />
            <Route path="/my-modules" element={<MentorModules />} />
            <Route path="/students" element={<MentorStudents />} />
            <Route path="/my-learning" element={<StudentLearning />} />
            {/* <Route path="/analytics" element={<Analytics />} /> */}
            <Route path="/settings" element={<Settings />} /> 
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
