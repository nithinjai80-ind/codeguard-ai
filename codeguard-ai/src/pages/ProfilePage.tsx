import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  UserCircle,
  Mail,
  Shield,
  Building,
  KeyRound,
  CheckCircle2,
  Calendar,
  LogOut
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { setCurrentView, addToast } = useApp();

  const role = (user?.role || 'STUDENT').toUpperCase();

  const handleLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been signed out of ROX AI.'
    });
    setCurrentView('login');
  };

  const roleColor =
    role === 'ADMIN'
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-800'
      : role === 'TEACHER'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-800'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
          <UserCircle className="w-3.5 h-3.5" />
          <span>Account Profile</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          User Profile & Security
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View your institutional account details and active role permissions.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {user?.name || 'User'}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColor}`}>
              {role} ACCOUNT
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Assigned Role</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{role}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Building className="w-3.5 h-3.5 text-indigo-500" />
              <span>Academic Department</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {user?.department || 'Computer Science and Engineering'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Account Status</span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">ACTIVE</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Authentication</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">JWT & bcrypt HS256</span>
          </div>
        </div>

        {/* Role Permissions Callout */}
        <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
          <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">
            Active Role Capabilities ({role}):
          </h4>
          <ul className="space-y-1.5 text-indigo-800 dark:text-indigo-300">
            {role === 'STUDENT' && (
              <>
                <li className="flex items-center gap-2">✓ Write code in Monaco-style editor (Java, Python, C++, JS)</li>
                <li className="flex items-center gap-2">✓ Run sandbox test executions against sample cases</li>
                <li className="flex items-center gap-2">✓ Submit assignments for teacher evaluation</li>
                <li className="flex items-center gap-2">✓ View submission feedback & revision requests</li>
              </>
            )}
            {role === 'TEACHER' && (
              <>
                <li className="flex items-center gap-2">✓ View submissions & test results across students</li>
                <li className="flex items-center gap-2">✓ Inspect multi-vector AI similarity evidence</li>
                <li className="flex items-center gap-2">✓ Side-by-side AST and variable transformation comparison</li>
                <li className="flex items-center gap-2">✓ Final decision authority: Accept, Reject, or Request Revision</li>
              </>
            )}
            {role === 'ADMIN' && (
              <>
                <li className="flex items-center gap-2">✓ Question Bank CRUD & test case configuration</li>
                <li className="flex items-center gap-2">✓ Course assignments orchestration & class assignment</li>
                <li className="flex items-center gap-2">✓ User account creation & role management</li>
                <li className="flex items-center gap-2">✓ Platform-wide integrity reports & settings</li>
              </>
            )}
          </ul>
        </div>

        {/* Sign Out Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of ROX AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
