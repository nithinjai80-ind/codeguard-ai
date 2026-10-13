import React from 'react';
import { useApp, ViewType } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Code2,
  LayoutDashboard,
  FileCode2,
  Split,
  ListTodo,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  Users,
  FolderGit2,
  FileCheck2,
  LogOut,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { currentView, setCurrentView, addToast, isSidebarCollapsed, toggleSidebarCollapse } = useApp();
  const { user, logout } = useAuth();

  const role = (user?.role || 'STUDENT').toUpperCase();

  // Role-specific navigation items
  let navItems: { view: ViewType; label: string; icon: React.ReactNode; badge?: string }[] = [];

  if (role === 'STUDENT') {
    navItems = [
      { view: 'student-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { view: 'student-questions', label: 'Questions', icon: <BookOpen className="w-4 h-4" /> },
      { view: 'student-submissions', label: 'My Submissions', icon: <FileCheck2 className="w-4 h-4" /> },
      { view: 'profile', label: 'Profile', icon: <UserCircle className="w-4 h-4" /> }
    ];
  } else if (role === 'TEACHER') {
    navItems = [
      { view: 'teacher-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { view: 'submissions', label: 'Submissions', icon: <FileCode2 className="w-4 h-4" />, badge: '642' },
      { view: 'review-queue', label: 'Review Queue', icon: <ListTodo className="w-4 h-4" />, badge: '27' },
      { view: 'similarity', label: 'Similarity Analysis', icon: <Split className="w-4 h-4" /> },
      { view: 'teacher-questions', label: 'Questions', icon: <BookOpen className="w-4 h-4" /> },
      { view: 'teacher-students', label: 'Students', icon: <GraduationCap className="w-4 h-4" /> },
      { view: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
      { view: 'profile', label: 'Profile', icon: <UserCircle className="w-4 h-4" /> }
    ];
  } else {
    // ADMIN role
    navItems = [
      { view: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { view: 'admin-questions', label: 'Questions', icon: <BookOpen className="w-4 h-4" /> },
      { view: 'admin-assignments', label: 'Assignments', icon: <FolderGit2 className="w-4 h-4" /> },
      { view: 'admin-users', label: 'Users', icon: <Users className="w-4 h-4" /> },
      { view: 'submissions', label: 'Submissions', icon: <FileCode2 className="w-4 h-4" /> },
      { view: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
      { view: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
      { view: 'profile', label: 'Profile', icon: <UserCircle className="w-4 h-4" /> }
    ];
  }

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been safely signed out of ROX AI.'
    });
    setCurrentView('login');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'RX';

  const roleBadgeColor =
    role === 'ADMIN'
      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
      : role === 'TEACHER'
      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div>
        <div className={`border-b border-slate-100 dark:border-slate-800/80 transition-all ${isSidebarCollapsed ? 'p-3 flex flex-col items-center gap-2' : 'p-5'}`}>
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div
                onClick={() => {
                  if (role === 'STUDENT') setCurrentView('student-dashboard');
                  else if (role === 'TEACHER') setCurrentView('teacher-dashboard');
                  else setCurrentView('admin-dashboard');
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform font-black text-lg tracking-wider shrink-0">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                      ROX AI
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleBadgeColor}`}>
                      {role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Write. Analyze. Verify.
                  </p>
                </div>
              </div>

              {/* Collapse to left button */}
              <button
                onClick={toggleSidebarCollapse}
                title="Collapse Workspace (Right to Left)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Collapsed Brand Header */
            <div className="flex flex-col items-center gap-2 w-full">
              <div
                onClick={() => {
                  if (role === 'STUDENT') setCurrentView('student-dashboard');
                  else if (role === 'TEACHER') setCurrentView('teacher-dashboard');
                  else setCurrentView('admin-dashboard');
                }}
                title="ROX AI"
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 cursor-pointer hover:scale-105 transition-transform font-black text-lg tracking-wider shrink-0"
              >
                R
              </div>
              <button
                onClick={toggleSidebarCollapse}
                title="Expand Workspace (Left to Right)"
                className="p-1.5 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Institution Badge */}
        {!isSidebarCollapsed && (
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/60 text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400 animate-in fade-in duration-150">
            <span className="font-medium truncate">{user?.department || 'Computer Science & Eng'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {role}
            </span>
          </div>
        )}

        {/* Role Navigation Links */}
        <nav className={`space-y-1 transition-all ${isSidebarCollapsed ? 'p-2' : 'p-3'}`}>
          {!isSidebarCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider animate-in fade-in duration-150">
              {role === 'STUDENT' ? 'Student Workspace' : role === 'TEACHER' ? 'Teacher Assessment' : 'Admin Management'}
            </div>
          )}

          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                title={item.label}
                className={`w-full flex items-center rounded-lg transition-all cursor-pointer ${
                  isSidebarCollapsed
                    ? 'justify-center p-2.5 my-1'
                    : 'justify-between px-3 py-2 text-sm font-medium'
                } ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!isSidebarCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className={`border-t border-slate-100 dark:border-slate-800 transition-all ${isSidebarCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3'}`}>
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'user@rox.ai'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div
              title={`${user?.name || 'User'} (${user?.email || ''})`}
              className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center shrink-0 cursor-default"
            >
              {userInitials}
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
