import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Cpu,
  Network,
  Zap,
  Clock,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileCode,
  Sparkles,
  GitCompare,
  Layers,
  ChevronRight,
  School,
  Lock
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { setCurrentView } = useApp();
  const { isAuthenticated, user } = useAuth();

  const handleExploreDashboard = () => {
    if (isAuthenticated) {
      const role = (user?.role || 'STUDENT').toUpperCase();
      if (role === 'STUDENT') setCurrentView('student-dashboard');
      else if (role === 'TEACHER') setCurrentView('teacher-dashboard');
      else setCurrentView('admin-dashboard');
    } else {
      setCurrentView('login');
    }
  };

  const handleSeeHowItWorks = () => {
    const el = document.getElementById('pipeline-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 font-black text-lg">
              R
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight">ROX AI</span>
              <span className="text-[10px] ml-1 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                PLATFORM
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Core Capabilities
            </a>
            <a href="#pipeline-section" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              How It Works
            </a>
            <a href="#comparison" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              vs Traditional
            </a>
            <a href="#academic-ethos" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Ethics & Human Gate
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Dashboard ({user?.name?.split(' ')[0] || 'User'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Coding & Integrity Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              ROX AI — <span className="text-indigo-600 dark:text-indigo-400">Write. Analyze. Verify.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              An intelligent coding assessment platform that helps students write code, teachers evaluate submissions, and administrators manage programming assessments.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleExploreDashboard}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Enter ROX AI Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSeeHowItWorks}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                See Architecture
              </button>
            </div>
          </div>

          {/* 3 ROLES ARCHITECTURE VISUAL */}
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs mb-3">
                STUDENT
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Write & Submit</h3>
              <p className="text-xs text-slate-500 mt-1">
                Monaco-style editor with Java sandbox execution. Real-time test cases verification and feedback tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-500/30 dark:border-blue-500/20 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs mb-3">
                TEACHER
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Analyze & Evaluate</h3>
              <p className="text-xs text-slate-500 mt-1">
                Multi-vector AI similarity evidence, side-by-side AST and variable comparison, with final acceptance authority.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/30 dark:border-purple-500/20 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs mb-3">
                ADMIN
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Manage & Orchestrate</h3>
              <p className="text-xs text-slate-500 mt-1">
                Question Bank creation with test cases, assignment distribution across classes, and user management.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Ethical Academic Principle
              </span>
              <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mt-0.5 leading-snug">
                "We don't decide whether a student cheated. We identify meaningful similarities and present the evidence so an educator can make an informed decision."
              </p>
            </div>
          </div>
        </div>

        {/* Hero Visualization: Dual Submission Analysis Visual */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-indigo-500" />
              Live Conceptual Inference Pipeline
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded">
              Nehru Institute of Tech • CS201
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Submission A Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Student A: Arun Kumar
                </span>
                <span className="font-mono text-[10px] text-slate-400">SUB-1042</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] leading-tight">
                <span className="text-indigo-400">int</span> total = 0;<br />
                <span className="text-indigo-400">for</span>(int i=0; i &lt; n; i++) &#123;<br />
                &nbsp;&nbsp;total += arr[i];<br />
                &#125;
              </div>
              <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span>BinarySearch.java</span>
                <span className="font-mono text-emerald-500">10:32 AM</span>
              </div>
            </div>

            {/* Middle Engine Flow */}
            <div className="flex flex-col items-center gap-3 text-center px-2">
              <div className="w-full py-2.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                Structural + Semantic + Behavioral
              </div>
              <div className="text-slate-400 font-mono text-xs">↓</div>
              <div className="w-full py-2.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
                Evidence Engine
              </div>
              <div className="text-slate-400 font-mono text-xs">↓</div>
              <div className="w-full py-2 px-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
                Review Required (91%)
              </div>
              <div className="text-slate-400 font-mono text-xs">↓</div>
              <div className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Tutor Decision Gate</span>
              </div>
            </div>

            {/* Submission B Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Student B: Kavin Raj
                </span>
                <span className="font-mono text-[10px] text-slate-400">SUB-1049</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] leading-tight">
                <span className="text-indigo-400">int</span> sum = 0;<br />
                <span className="text-indigo-400">for</span>(int j=0; j &lt; n; j++) &#123;<br />
                &nbsp;&nbsp;sum = sum + values[j];<br />
                &#125;
              </div>
              <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span>BinarySearch.java</span>
                <span className="font-mono text-rose-500">10:36 AM (+4m)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section (6 Features) */ }
  <section id="features" className="py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Multi-Dimensional Signal Intelligence
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Superficial string comparisons and naive token matchers fail when code is slightly reformatted. CodeGuard AI synthesizes four orthogonal intelligence layers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            1. Structural Intelligence
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Detect similarities beyond formatting and variable names. Abstract Syntax Trees (AST) and Control-Flow Graphs (CFG) expose programmatic skeletons regardless of superficial rewrites.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Network className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            2. Semantic Understanding
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Identify code with similar meaning even when implementation details change. Deep embeddings uncover conceptually identical logic expressed via different constructs.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            3. Behavioral Evidence
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Compare execution behavior and outputs. Test vector evaluation, dynamic branch coverage deltas, and corner-case handling reveal hidden runtime similarities.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            4. Timeline Intelligence
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Understand submission and revision patterns. Detect tight temporal clusters, sudden code leaps, and synchronized revision intervals across peer cohorts.
          </p>
        </div>

        {/* Feature 5 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            5. Explainable Evidence
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            See exactly why a case was surfaced. Inspect variable renaming graphs, expression rewrites, and synchronized code blocks instead of relying on opaque black-box numbers.
          </p>
        </div>

        {/* Feature 6 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            6. Human-in-the-Loop
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            AI assists review. Tutors make the final decision. Submissions are tagged as "Review Required" or "Suspicious Similarity", never as premature accusations.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* 5-Step Visual Pipeline */ }
  <section id="pipeline-section" className="py-20 bg-slate-50 dark:bg-slate-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Deterministic Processing Pipeline
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          How CodeGuard AI Works
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
          From raw code intake to explainable educator intelligence in 5 transparent stages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Step 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              STEP 01
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 mb-2">
              Source Code Intake
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ingests multi-file or single-file student submissions (Java, Python, C++) via automated portal hooks or bulk archive uploads.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              STEP 02
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 mb-2">
              Normalization
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Strips comment noise, normalizes whitespace and indentation variations, and resolves canonical identifier scopes.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              STEP 03
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 mb-2">
              Multi-Vector Analysis
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Computes parallel metrics across AST parsing, control-flow graphs, vector embeddings, and execution input/output behavior.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              STEP 04
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 mb-2">
              Evidence Engine
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Synthesizes evidence tokens, detects cluster topology, and identifies synchronized transformation deltas between submissions.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              STEP 05
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 mb-2">
              Explainable Review Score
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ranks review priority in tutor queue with synchronized side-by-side diffs and transformation mapping.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Comparison: Traditional vs CodeGuard AI */ }
  <section id="comparison" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Modern Paradigm Shift
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Traditional Detection vs CodeGuard AI
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
          Why legacy plagiarism checkers produce countless false positives and miss structural collusions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Traditional */}
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <XCircle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              Traditional Legacy Tools (MOSS, text match)
            </h3>
          </div>
          <ul className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-3">
              <span className="text-rose-500 font-bold shrink-0">✕</span>
              <span>Pure lexical text and string matching easily bypassed by variable renaming.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-500 font-bold shrink-0">✕</span>
              <span>Basic similarity percentages with zero contextual explanation of why it was flagged.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-500 font-bold shrink-0">✕</span>
              <span>Tedious manual comparison with no automated transformation detection.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-500 font-bold shrink-0">✕</span>
              <span>No concept of submission timing, revision cycles, or student clusters.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-500 font-bold shrink-0">✕</span>
              <span>Rigid, opaque scoring with no customizable department thresholds.</span>
            </li>
          </ul>
        </div>

        {/* CodeGuard */}
        <div className="p-8 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border-2 border-indigo-500/40 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              CodeGuard AI Intelligence
            </h3>
          </div>
          <ul className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>AST & CFG Parsing:</strong> Detects logic invariants regardless of identifiers or comments.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Semantic Code Embeddings:</strong> Captures algorithmic meaning and intent equivalence.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Behavioral & Runtime Signals:</strong> Compares execution outputs and dynamic trace paths.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Temporal Intelligence & Clusters:</strong> Identifies collaborative rings and revision anomalies.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Explainable Evidence Cards:</strong> Displays variable mappings, expression rewrites, and synchronized diffs.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  {/* University Trust & Ethos */ }
  <section id="academic-ethos" className="py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 mb-4">
        <School className="w-3.5 h-3.5 text-indigo-500" />
        <span>Deployed at Nehru Institute of Technology</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
        Built for Academic Integrity, Built for Educators
      </h3>
      <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
        Protecting student academic careers while empowering instructors. ROX AI provides the forensic evidence educators need to hold fair, productive, and documented reviews.
      </p>
      <div className="mt-8">
        <button
          onClick={handleExploreDashboard}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <span>Launch ROX AI Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </section>

  {/* Footer */ }
  <footer className="py-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
    <p>© 2026 ROX AI. AI-Powered Coding & Integrity Platform for Educational Institutions.</p>
    <p className="text-[11px] text-slate-400 mt-1">
      Write. Analyze. Verify. • Designed with strict human-in-the-loop ethical guidelines.
    </p>
  </footer>
    </div>
  );
};
