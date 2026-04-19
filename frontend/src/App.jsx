import React, { useEffect, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import StudyMaterials from './pages/StudyMaterials/StudyMaterials';
import MaterialDetail from './pages/StudyMaterials/MaterialDetail';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions/TermsAndConditions';
import FAQ from './pages/FAQ/FAQ';
import IssueList from './pages/Issues/IssueList';
import PostIssue from './pages/Issues/PostIssue';
import IssueDetail from './pages/Issues/IssueDetail';
import EditIssue from './pages/Issues/EditIssue';
import MyIssues from './pages/Issues/MyIssues';
import InternshipList from './pages/Internships/InternshipList';
import InternshipDetail from './pages/Internships/InternshipDetail';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import ChangePassword from './pages/Profile/ChangePassword';
import ManageUsers from './pages/Admin/ManageUsers';
import ProfileSetup from './pages/Profile/ProfileSetup';
import Notifications from './pages/Notifications/Notifications';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UploadMaterial from './pages/Admin/UploadMaterial';
import ManageMaterials from './pages/Admin/ManageMaterials';
import ManageInternships from './pages/Admin/ManageInternships';
import ManageDegrees from './pages/Admin/ManageDegrees';
import Moderation from './pages/Admin/Moderation';
import PartnerDashboard from './pages/PartnerDashboard/PartnerDashboard';
import Reviews from './pages/Reviews/Reviews';
import Footer from './components/Footer';
import { NotFound } from './pages/System/SystemPages';
import AccessControl from './pages/AccessControl/AccessControl';
import LecturerRequest from './pages/Lecturer/LecturerRequest';
import LecturerRequests from './pages/Admin/LecturerRequests';
import LecturerDashboard from './pages/Lecturer/LecturerDashboard';
import LecturerIssueReview from './pages/Lecturer/LecturerIssueReview';
import './App.css';

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
};

// 🔒 Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: 'white' }}>
      Loading...
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPartnerRoute = location.pathname.startsWith('/partner');
  const isLecturerRoute = location.pathname.startsWith('/lecturer');
  const isPendingLecturer = user?.role === 'pending_lecturer';

  const isDashboardLayout = isAdminRoute || isPartnerRoute || isLecturerRoute || isPendingLecturer;

  const navigate = useNavigate();

  useEffect(() => {
    // If a non-admin tries to access admin routes
    if (user?.role !== 'admin' && isAdminRoute) {
      navigate('/dashboard'); // or standard fallback
    }

    // If a partner tries to access student routes
    const studentRoutes = ['/materials', '/issues', '/internships'];
    const isStudentPage = studentRoutes.some(path => location.pathname.startsWith(path));

    if (user?.role === 'partner' && (isStudentPage || location.pathname === '/dashboard')) {
      navigate('/partner/dashboard');
    }
  }, [user, location.pathname, navigate, isAdminRoute]);

  return (
    <>
      <ScrollToTop />
      {!isDashboardLayout && <Navbar />}
      <div className={isDashboardLayout ? "dashboard-content" : "main-content"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Restricted until login) */}
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/privacy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
          <Route path="/terms" element={<ProtectedRoute><TermsAndConditions /></ProtectedRoute>} />
          <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />

          {/* Protected Student Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/profile/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />

          <Route path="/materials" element={<ProtectedRoute><StudyMaterials /></ProtectedRoute>} />
          <Route path="/materials/:id" element={<ProtectedRoute><MaterialDetail /></ProtectedRoute>} />

          <Route path="/internships" element={<ProtectedRoute><InternshipList /></ProtectedRoute>} />
          <Route path="/internships/:id" element={<ProtectedRoute><InternshipDetail /></ProtectedRoute>} />

          <Route path="/issues" element={<ProtectedRoute><IssueList /></ProtectedRoute>} />
          <Route path="/issues/new" element={<ProtectedRoute><PostIssue /></ProtectedRoute>} />
          <Route path="/issues/my" element={<ProtectedRoute><MyIssues /></ProtectedRoute>} />
          <Route path="/issues/:id" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />
          <Route path="/issues/:id/edit" element={<ProtectedRoute><EditIssue /></ProtectedRoute>} />

          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/lecturer-requests" element={<ProtectedRoute><LecturerRequests /></ProtectedRoute>} />
          <Route path="/admin/upload-materials" element={<ProtectedRoute><UploadMaterial /></ProtectedRoute>} />
          <Route path="/admin/manage-materials" element={<ProtectedRoute><ManageMaterials /></ProtectedRoute>} />
          <Route path="/admin/manage-internships" element={<ProtectedRoute><ManageInternships /></ProtectedRoute>} />
          <Route path="/admin/manage-degrees" element={<ProtectedRoute><ManageDegrees /></ProtectedRoute>} />
          <Route path="/admin/moderation" element={<ProtectedRoute><Moderation /></ProtectedRoute>} />
          <Route path="/admin/account-deactivation" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />

          {/* Partner Routes */}
          <Route path="/partner/dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />

          {/* Lecturer Routes */}
          <Route path="/request-lecturer" element={<ProtectedRoute><LecturerRequest /></ProtectedRoute>} />
          <Route path="/lecturer/dashboard" element={<ProtectedRoute><LecturerDashboard /></ProtectedRoute>} />
          <Route path="/lecturer/issues/:id" element={<ProtectedRoute><LecturerIssueReview /></ProtectedRoute>} />

          {/* System Routes */}
          <Route path="/access-denied" element={<AccessControl />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isDashboardLayout && <Footer />}
    </>
  )
}


export default App
