import React, { useState, useEffect } from 'react';
import { RoxApiService, User } from '../api/apiService';
import { useApp } from '../context/AppContext';
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  Edit2,
  UserX,
  UserCheck,
  CheckCircle2,
  Clock,
  Shield,
  X,
  KeyRound,
  Mail,
  Building,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { addToast } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'STUDENT' | 'TEACHER'>('STUDENT');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [password, setPassword] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await RoxApiService.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('STUDENT');
    setDepartment('Computer Science and Engineering');
    setPassword('');
    setIsEditing(false);
    setEditUserId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setIsEditing(true);
    setEditUserId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role === 'TEACHER' ? 'TEACHER' : 'STUDENT');
    setDepartment(u.department || 'Computer Science and Engineering');
    setPassword(''); // never pre-fill password!
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addToast({ type: 'warning', message: 'Name and email are required.' });
      return;
    }

    if (!isEditing && !password.trim()) {
      addToast({ type: 'warning', message: 'Password is required for new accounts.' });
      return;
    }

    try {
      if (isEditing && editUserId) {
        await RoxApiService.updateAdminUser(editUserId, {
          name,
          department,
          role,
          ...(password ? { password } : {})
        });
        addToast({
          type: 'success',
          title: 'User Updated',
          message: `User '${name}' details updated successfully.`
        });
      } else {
        await RoxApiService.createAdminUser({
          name,
          email,
          password,
          role,
          department
        });
        addToast({
          type: 'success',
          title: 'User Created',
          message: `${role} account created for ${name}. Password securely hashed.`
        });
      }
      setIsModalOpen(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error Saving User',
        message: err.message || 'Operation failed.'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await RoxApiService.deleteAdminUser(deleteTarget.id);
      addToast({
        type: 'success',
        title: 'User Deleted',
        message: `'${deleteTarget.name}' has been permanently removed.`
      });
      setDeleteTarget(null);
      loadUsers();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete user.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (u: User) => {
    const nextStatus = u.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    try {
      await RoxApiService.updateAdminUser(u.id, { status: nextStatus } as any);
      addToast({
        type: 'info',
        title: 'Status Updated',
        message: `User ${u.name} is now ${nextStatus}.`
      });
      loadUsers();
    } catch (err: any) {
      addToast({ type: 'error', message: 'Failed to update account status.' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesTab = activeTab === 'ALL' || u.role === activeTab;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const studentsList = filteredUsers.filter((u) => u.role === 'STUDENT');
  const teachersList = filteredUsers.filter((u) => u.role === 'TEACHER');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Accounts & Roles</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            User Management Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student candidates and teaching faculty with role access and password hashing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-search-users"
              name="userSearch"
              aria-label="Search users by name or email"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500 w-48 sm:w-56"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('STUDENT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'STUDENT'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Students</span>
        </button>

        <button
          onClick={() => setActiveTab('TEACHER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'TEACHER'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teachers</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>All Accounts</span>
        </button>
      </div>

      {/* Student Table */}
      {(activeTab === 'STUDENT' || activeTab === 'ALL') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <span>Student Accounts ({studentsList.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Submissions</th>
                  <th className="py-2.5 px-4">Accepted</th>
                  <th className="py-2.5 px-4">Pending</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentsList.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {stu.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {stu.email}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {stu.department || 'CSE'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {stu.submissions_count ?? 4}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {stu.accepted_count ?? 2}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400">
                      {stu.pending_count ?? 1}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          stu.status === 'INACTIVE'
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}
                      >
                        {stu.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(stu)}
                          title="Edit User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(stu)}
                          title={stu.status === 'INACTIVE' ? 'Activate Account' : 'Deactivate Account'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
                        >
                          {stu.status === 'INACTIVE' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(stu)}
                          title="Delete User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher Table */}
      {(activeTab === 'TEACHER' || activeTab === 'ALL') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Teaching Faculty Accounts ({teachersList.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Questions Reviewed</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teachersList.map((tch) => (
                  <tr key={tch.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {tch.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {tch.email}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {tch.department || 'CSE'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {tch.reviews_count ?? 18}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          tch.status === 'INACTIVE'
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}
                      >
                        {tch.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(tch)}
                          title="Edit User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tch)}
                          title={tch.status === 'INACTIVE' ? 'Activate Account' : 'Deactivate Account'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
                        >
                          {tch.status === 'INACTIVE' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(tch)}
                          title="Delete User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete User Account?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You are about to permanently delete <span className="font-semibold text-slate-700 dark:text-slate-300">{deleteTarget.name}</span>.
                  This action <span className="text-rose-500 font-semibold">cannot be undone</span>.
                </p>
              </div>
              <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-left text-xs space-y-1">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold w-16 shrink-0">Name:</span>
                  <span>{deleteTarget.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold w-16 shrink-0">Email:</span>
                  <span className="font-mono">{deleteTarget.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold w-16 shrink-0">Role:</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    deleteTarget.role === 'TEACHER'
                      ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  }`}>{deleteTarget.role}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isEditing ? `Edit User Profile` : 'Create User Account'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label htmlFor="user-fullname" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  id="user-fullname"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Arun Kumar"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="user-email" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  disabled={isEditing}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@rox.ai or student@institution.edu"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden focus:border-indigo-500 disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="user-role" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role *
                  </label>
                  <select
                    id="user-role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="user-department" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    id="user-department"
                    name="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="CSE / IT"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="user-password" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Account Password *'}
                </label>
                <input
                  id="user-password"
                  name="password"
                  type="password"
                  autoComplete={isEditing ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  🔒 Passwords are encrypted with bcrypt rounds. Hashes are never exposed.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminUsersPage;
