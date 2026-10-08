import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { setCurrentView, addToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password, rememberMe);
      const role = (loggedUser?.role || 'STUDENT').toUpperCase();

      addToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome back to ROX AI, ${loggedUser.name || 'User'}!`
      });

      // Role-based redirect
      if (role === 'STUDENT') {
        setCurrentView('student-dashboard');
      } else if (role === 'TEACHER') {
        setCurrentView('teacher-dashboard');
      } else {
        setCurrentView('admin-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: err.message || 'Invalid credentials. Please verify your email and password.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: 'TEACHER' | 'ADMIN' | 'STUDENT') => {
    if (role === 'TEACHER') {
      setEmail('teacher@rox.ai');
      setPassword('Teacher@123');
    } else if (role === 'ADMIN') {
      setEmail('admin@rox.ai');
      setPassword('Admin@123');
    } else {
      setEmail('student@rox.ai');
      setPassword('Student@123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden selection:bg-indigo-500/20">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand Header */}
        <div className="text-center mb-8">
          <div
            onClick={() => setCurrentView('landing')}
            className="inline-flex items-center gap-3 cursor-pointer group mb-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform font-black text-2xl tracking-wider">
              R
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white">ROX AI</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PLATFORM
                </span>
              </div>
              <p className="text-xs text-indigo-400 font-semibold tracking-wide">
                Write. Analyze. Verify.
              </p>
            </div>
          </div>
          <h1 className="text-xl font-bold text-white mt-2">Welcome to ROX AI</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            AI-Powered Coding & Integrity Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@rox.ai or name@institution.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot-password')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="login-remember" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="login-remember"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500/20"
                />
                <span className="text-xs text-slate-400">Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Presets for Demo */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-medium text-slate-400 text-center mb-2.5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>One-Click Role Demonstration</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('STUDENT')}
                className="py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('TEACHER')}
                className="py-1.5 px-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[11px] font-medium transition-colors"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN')}
                className="py-1.5 px-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[11px] font-medium transition-colors"
              >
                Admin
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              Role is automatically determined by account upon sign in.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© 2026 ROX AI. All rights reserved.</p>
          <p className="mt-1 text-[11px]">Role-based programming assessment & code-integrity platform.</p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
