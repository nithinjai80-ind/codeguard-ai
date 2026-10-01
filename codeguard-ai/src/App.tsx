import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp, ViewType } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastContainer } from './components/common/ToastContainer';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';

// Student Pages
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { StudentQuestionsPage } from './pages/StudentQuestionsPage';
import { StudentCodingPage } from './pages/StudentCodingPage';
import { StudentSubmissionsPage } from './pages/StudentSubmissionsPage';

// Teacher Pages
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { SimilarityAnalysisPage } from './pages/SimilarityAnalysisPage';
import { SubmissionDetailPage } from './pages/SubmissionDetailPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { ClustersPage } from './pages/ClustersPage';
import { TimelinePage } from './pages/TimelinePage';
import { StudentsPage } from './pages/StudentsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminQuestionsPage } from './pages/AdminQuestionsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const MainLayout: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = (user?.role || 'STUDENT').toUpperCase();

  // Strict Role-Based Route Protection Guard
  useEffect(() => {
    if (isLoading) return;

    const publicViews: ViewType[] = ['landing', 'login', 'register', 'forgot-password'];

    // 1. Unauthenticated users cannot access protected views
    if (!isAuthenticated) {
      if (!publicViews.includes(currentView)) {
        setCurrentView('login');
      }
      return;
    }

    // 2. Student role permissions guard
    if (role === 'STUDENT') {
      const studentAllowedViews: ViewType[] = [
        'student-dashboard',
        'student-questions',
        'student-coding',
        'student-submissions',
        'profile'
      ];
      if (!studentAllowedViews.includes(currentView)) {
        setCurrentView('student-dashboard');
      }
      return;
    }

    // 3. Teacher role permissions guard
    if (role === 'TEACHER') {
      const teacherForbiddenViews: ViewType[] = [
        'admin-dashboard',
        'admin-assignments',
        'admin-users',
        'settings'
      ];
      if (teacherForbiddenViews.includes(currentView)) {
        setCurrentView('teacher-dashboard');
      }
      return;
    }

    // 4. Default view after logging in if on landing
    if (currentView === 'dashboard') {
      if (role === 'STUDENT') setCurrentView('student-dashboard');
      else if (role === 'TEACHER') setCurrentView('teacher-dashboard');
      else setCurrentView('admin-dashboard');
    }
  }, [isAuthenticated, isLoading, role, currentView, setCurrentView]);

  // Unauthenticated Public Pages
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  if (currentView === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  if (currentView === 'register') {
    return (
      <>
        <RegisterPage />
        <ToastContainer />
      </>
    );
  }

  if (currentView === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage />
        <ToastContainer />
      </>
    );
  }

  // Active View Dispatcher
  const renderActiveView = () => {
    switch (currentView) {
      // Student Routes
      case 'student-dashboard':
        return <StudentDashboardPage />;
      case 'student-questions':
        return <StudentQuestionsPage />;
      case 'student-coding':
        return <StudentCodingPage />;
      case 'student-submissions':
        return <StudentSubmissionsPage />;

      // Teacher Routes
      case 'teacher-dashboard':
        return <TeacherDashboardPage />;
      case 'review-queue':
        return <ReviewQueuePage />;
      case 'similarity':
        return <SimilarityAnalysisPage />;
      case 'submission-detail':
        return <SubmissionDetailPage />;
      case 'submissions':
        return <SubmissionsPage />;
      case 'teacher-questions':
        return <StudentQuestionsPage />;
      case 'teacher-students':
      case 'students':
        return <StudentsPage />;
      case 'clusters':
        return <ClustersPage />;
      case 'timeline':
        return <TimelinePage />;

      // Admin Routes
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'admin-questions':
        return <AdminQuestionsPage />;
      case 'admin-assignments':
      case 'assignments':
        return <AssignmentsPage />;
      case 'admin-users':
        return <AdminUsersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;

      // Shared
      case 'profile':
        return <ProfilePage />;

      // Fallback
      default:
        if (role === 'STUDENT') return <StudentDashboardPage />;
        if (role === 'TEACHER') return <TeacherDashboardPage />;
        return <AdminDashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
