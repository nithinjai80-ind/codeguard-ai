import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { setCurrentView, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await CodeGuardApiService.forgotPassword(email);
      setIsSubmitted(true);
      addToast({
        type: 'success',
        title: 'Reset Link Dispatched',
        message: `Password reset instructions sent to ${email}`
      });
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden selection:bg-indigo-500/20">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div 
            onClick={() => setCurrentView('landing')}
            className="inline-flex items-center gap-3 cursor-pointer group mb-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white">CodeGuard</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  AI
                </span>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-bold text-white">Password Recovery</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Reset your institutional CodeGuard account password
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Instructions Sent</h3>
              <p className="text-xs text-slate-400">
                If an institutional account exists for <span className="text-indigo-400 font-mono">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <button
                onClick={() => setCurrentView('login')}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4.5">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@nehru.ac.in"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-5">
          <button
            onClick={() => setCurrentView('login')}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
