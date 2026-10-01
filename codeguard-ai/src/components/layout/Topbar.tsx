import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Sun,
  Moon,
  Search,
  Bell,
  PlayCircle,
  CheckCircle,
  ChevronRight,
  LogOut,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { currentView, setCurrentView, addToast } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const role = (user?.role || 'STUDENT').toUpperCase();

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'student-dashboard':
        return 'Student Dashboard';
      case 'student-questions':
        return 'Available Questions';
      case 'student-coding':
        return 'Coding Environment';
      case 'student-submissions':
        return 'My Submissions';
      case 'teacher-dashboard':
        return 'Teacher Dashboard';
      case 'teacher-questions':
        return 'Questions Overview';
      case 'teacher-students':
        return 'Student Directory';
      case 'admin-dashboard':
        return 'Administration Overview';
      case 'admin-questions':
        return 'Question Bank';
      case 'admin-assignments':
        return 'Assignments Management';
      case 'admin-users':
        return 'User Management';
      case 'dashboard':
        return 'Overview Dashboard';
      case 'submissions':
        return 'Submissions Repository';
      case 'submission-detail':
        return 'Submission Review & Evidence';
      case 'similarity':
        return 'Similarity Analysis';
      case 'review-queue':
        return 'Review Queue';
      case 'clusters':
        return 'Similarity Clusters';
      case 'timeline':
        return 'Chronological Timeline';
      case 'assignments':
        return 'Course Assignments';
      case 'students':
        return 'Students Directory';
      case 'reports':
        return 'Integrity Reports';
      case 'settings':
        return 'Platform Settings';
      case 'profile':
        return 'User Profile';
      default:
        return 'ROX AI Platform';
    }
  };

  const handleRunScan = () => {
    setIsScanning(true);
    addToast({
      type: 'info',
      title: 'Integrity Analysis Initialized',
      message: 'Running AST normalization and semantic similarity analysis across submissions...'
    });

    setTimeout(() => {
      setIsScanning(false);
      addToast({
        type: 'success',
        title: 'Analysis Pipeline Updated',
        message: 'Review evidence updated with latest code submissions.'
      });
    }, 1200);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (role === 'STUDENT') {
        setCurrentView('student-questions');
      } else {
        setCurrentView('submissions');
      }
      addToast({
        type: 'info',
        message: `Searching for "${searchQuery}"`
      });
    }
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out of ROX AI.'
    });
    setCurrentView('login');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'RX';

  const roleBadgeStyle =
    role === 'ADMIN'
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-800'
      : role === 'TEACHER'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-800'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">ROX AI</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Center: Search */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center relative max-w-xs w-full mx-4"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={role === 'STUDENT' ? 'Search questions...' : 'Search submissions, students...'}
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeStyle}`}>
          {role}
        </span>

        {/* Quick Scan Button (Teacher & Admin only) */}
        {role !== 'STUDENT' && (
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-xs cursor-pointer ${
              isScanning
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <PlayCircle className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Analyzing...' : 'Integrity Scan'}</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
                <span>ROX AI Notifications</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">All caught up</span>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="flex gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {role === 'STUDENT'
                        ? 'Assessment submission received'
                        : 'Similarity Analysis Pipeline Active'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {role === 'STUDENT'
                        ? 'Your teacher will review your latest code submission.'
                        : 'AST and semantic evidence indexes are synchronized.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center">
              {userInitials}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@rox.ai'}</p>
                <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${roleBadgeStyle}`}>
                  {role}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setCurrentView('profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Topbar;
