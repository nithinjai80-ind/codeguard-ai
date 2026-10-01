import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { RoxApiService } from '../api/apiService';
import { TeacherDashboardData } from '../api/types';
import {
  Users,
  BookOpen,
  FileCode2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Split,
  ArrowRight,
  ShieldAlert,
  ListTodo,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentView, navigateToSubmission, navigateToSimilarity, addToast } = useApp();

  const [dashboardData, setDashboardData] = useState<TeacherDashboardData>({
    total_questions: 18,
    total_students: 124,
    total_submissions: 642,
    pending_reviews: 27,
    accepted_submissions: 580,
    rejected_submissions: 18,
    review_required: 14,
    similarity_cases: 14,
    review_queue: [
      {
        id: 'SUB-1042',
        student_name: 'Arun Kumar',
        question_title: 'Binary Search Implementation',
        test_results: { passed: 10, total: 10 },
        similarity: 91,
        status: 'Similarity Review Required',
        submitted_at: 'Oct 24, 2026 — 10:45 AM'
      },
      {
        id: 'SUB-1049',
        student_name: 'Kavin Raj',
        question_title: 'Binary Search Implementation',
        test_results: { passed: 10, total: 10 },
        similarity: 91,
        status: 'Similarity Review Required',
        submitted_at: 'Oct 24, 2026 — 10:54 AM'
      }
    ]
  });

  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalSubId, setRejectModalSubId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const data = await RoxApiService.getTeacherDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleQuickAccept = async (subId: string) => {
    try {
      await RoxApiService.reviewSubmission(subId, 'ACCEPTED', 'Approved by instructor upon review.');
      addToast({
        type: 'success',
        title: 'Submission Accepted',
        message: `Submission ${subId} marked as ACCEPTED.`
      });
      // update state
      setDashboardData((prev) => ({
        ...prev,
        pending_reviews: Math.max(0, prev.pending_reviews - 1),
        accepted_submissions: prev.accepted_submissions + 1,
        review_queue: prev.review_queue.filter((q) => q.id !== subId)
      }));
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Failed to update review status.'
      });
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalSubId || !rejectComment.trim()) {
      addToast({ type: 'warning', message: 'Teacher feedback comment is required.' });
      return;
    }

    try {
      await RoxApiService.reviewSubmission(rejectModalSubId, 'REJECTED', rejectComment);
      addToast({
        type: 'info',
        title: 'Submission Rejected',
        message: `Submission ${rejectModalSubId} rejected with student feedback.`
      });
      setDashboardData((prev) => ({
        ...prev,
        pending_reviews: Math.max(0, prev.pending_reviews - 1),
        rejected_submissions: prev.rejected_submissions + 1,
        review_queue: prev.review_queue.filter((q) => q.id !== rejectModalSubId)
      }));
      setRejectModalSubId(null);
      setRejectComment('');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Failed to reject submission.'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Academic Evaluation Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Teacher Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate student submissions, inspect AI similarity evidence, and make final academic decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('similarity')}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Split className="w-3.5 h-3.5 text-indigo-500" />
            <span>Similarity Analysis</span>
          </button>
          <button
            onClick={() => setCurrentView('review-queue')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Review Queue ({dashboardData.pending_reviews})</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Students</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{dashboardData.total_students}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Questions</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{dashboardData.total_questions}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Submissions</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{dashboardData.total_submissions}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block mb-1">Pending</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{dashboardData.pending_reviews}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-rose-200/50 dark:border-rose-900/30 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 block mb-1">Similarity Cases</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{dashboardData.similarity_cases}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Review Req.</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{dashboardData.review_required}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Accepted</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{dashboardData.accepted_submissions}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Rejected</span>
          <span className="text-xl font-bold text-slate-600 dark:text-slate-400">{dashboardData.rejected_submissions}</span>
        </div>
      </div>

      {/* Main Review Queue Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Review Queue</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Action Required
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submissions flagged with similarity evidence or awaiting teacher evaluation.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('review-queue')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Question</th>
                <th className="py-2.5 px-3">Tests Passed</th>
                <th className="py-2.5 px-3">Review Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dashboardData.review_queue.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{sub.student_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{sub.id}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    {sub.question_title}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {sub.test_results?.passed ?? 10} / {sub.test_results?.total ?? 10} Passed
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono font-bold text-xs ${
                          sub.similarity >= 75
                            ? 'text-rose-600 dark:text-rose-400'
                            : sub.similarity >= 50
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {sub.similarity}%
                      </span>
                      {sub.similarity >= 75 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => navigateToSubmission(sub.id)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleQuickAccept(sub.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setRejectModalSubId(sub.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Comment Required Modal */}
      {rejectModalSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Reject Submission — Feedback Required
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Teacher feedback is required when rejecting a student submission. Explain why the code failed or what misconduct was identified.
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="e.g., Your solution failed required edge cases or exceeded algorithmic complexity boundaries."
              className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-rose-500 resize-none font-medium mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setRejectModalSubId(null);
                  setRejectComment('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TeacherDashboardPage;
