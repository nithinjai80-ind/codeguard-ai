import React, { useState } from 'react';
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
  LogOut,
  Edit2,
  Save,
  X,
  Lock,
  UserCheck
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { setCurrentView, addToast } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science and Engineering');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const role = (user?.role || 'STUDENT').toUpperCase();

  const handleOpenEdit = () => {
    setName(user?.name || '');
    setDepartment(user?.department || 'Computer Science and Engineering');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast({ type: 'warning', message: 'Full name cannot be empty.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      addToast({ type: 'warning', message: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      addToast({ type: 'warning', message: 'Password must be at least 6 characters.' });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        department: department.trim(),
        ...(newPassword ? { password: newPassword, currentPassword } : {})
      });

      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your account changes have been saved to the database.'
      });
      setIsEditing(false);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Unable to save profile changes to database.'
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
            <UserCircle className="w-3.5 h-3.5" />
            <span>Account Profile</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            User Profile & Security
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your account settings, department details, and authentication credentials.
          </p>
        </div>

        <button
          onClick={handleOpenEdit}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {user?.name || 'User'}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColor}`}>
                {role} ACCOUNT
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                DATABASE CONNECTED
              </span>
            </div>
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
                <li className="flex items-center gap-2">✓ Submit assignments for teacher evaluation (saved to MongoDB)</li>
                <li className="flex items-center gap-2">✓ View submission feedback & revision requests</li>
              </>
            )}
            {role === 'TEACHER' && (
              <>
                <li className="flex items-center gap-2">✓ View submissions & test results across students</li>
                <li className="flex items-center gap-2">✓ Inspect multi-vector AI similarity evidence</li>
                <li className="flex items-center gap-2">✓ Side-by-side AST and variable transformation comparison</li>
                <li className="flex items-center gap-2">✓ Final decision authority: Accept, Reject, or Request Revision (saved to MongoDB)</li>
              </>
            )}
            {role === 'ADMIN' && (
              <>
                <li className="flex items-center gap-2">✓ Question Bank CRUD & test case configuration</li>
                <li className="flex items-center gap-2">✓ Course assignments orchestration & class assignment</li>
                <li className="flex items-center gap-2">✓ User account creation, edits & role management (saved to MongoDB)</li>
                <li className="flex items-center gap-2">✓ Platform-wide integrity reports & settings</li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleOpenEdit}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Update Details / Password</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of ROX AI</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-500" />
                <span>Edit Profile Details</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label htmlFor="profile-name" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 cursor-not-allowed font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Email is linked to your institutional identity.</p>
              </div>

              <div>
                <label htmlFor="profile-department" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Department
                </label>
                <input
                  id="profile-department"
                  name="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Change Password (Optional)</span>
                </div>

                <div>
                  <label htmlFor="profile-new-password" className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    New Password
                  </label>
                  <input
                    id="profile-new-password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  />
                </div>

                {newPassword && (
                  <div>
                    <label htmlFor="profile-confirm-password" className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="profile-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving to Database...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
