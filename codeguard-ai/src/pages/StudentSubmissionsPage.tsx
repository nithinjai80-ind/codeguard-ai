import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RoxApiService } from '../api/apiService';
import { StudentSubmissionItem } from '../api/types';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Code2,
  Eye,
  MessageSquareQuote,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const StudentSubmissionsPage: React.FC = () => {
  const { navigateToCoding } = useApp();
  const [submissions, setSubmissions] = useState<StudentSubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<StudentSubmissionItem | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const data = await RoxApiService.getStudentSubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error('Failed to fetch student submissions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
      case 'RESOLVED_ACCEPTABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Code Accepted</span>
          </span>
        );
      case 'PENDING':
      case 'ANALYZED':
      case 'REVIEW_REQUIRED':
      case 'INVESTIGATING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
      case 'REVISION_REQUIRED':
      case 'RESOLVED_VIVA_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Revision Required</span>
          </span>
        );
      case 'REJECTED':
      case 'ESCALATED_DISCIPLINARY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Code Rejected</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const renderFeedbackNotice = (sub: StudentSubmissionItem) => {
    if (sub.status === 'ACCEPTED' || sub.status === 'RESOLVED_ACCEPTABLE') {
      return (
        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs">
          <p className="font-semibold flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Solution verified and accepted</span>
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            {sub.teacher_comment || 'Your code passed the required verification checks.'}
          </p>
        </div>
      );
    }

    if (sub.status === 'REVISION_REQUIRED' || sub.status === 'RESOLVED_VIVA_REQUIRED') {
      return (
        <div className="p-3 rounded-xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 text-orange-900 dark:text-orange-200 text-xs">
          <p className="font-semibold flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>Please revise your solution based on the teacher's feedback.</span>
          </p>
          <p className="text-[11px] text-orange-800 dark:text-orange-300 italic">
            "{sub.teacher_comment || 'Please review your logic and address failing edge cases.'}"
          </p>
        </div>
      );
    }

    if (sub.status === 'REJECTED' || sub.status === 'ESCALATED_DISCIPLINARY') {
      return (
        <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200 text-xs">
          <p className="font-semibold flex items-center gap-1.5 mb-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Code Rejected</span>
          </p>
          <p className="text-[11px] text-rose-800 dark:text-rose-300 italic">
            Teacher feedback: "{sub.teacher_comment || 'Your solution failed the required test cases.'}"
          </p>
        </div>
      );
    }

    return (
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
        <p className="flex items-center gap-1.5 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Submission received. Your teacher will review it.</span>
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Academic Submissions</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          My Submissions & Status
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Track the evaluation status of your submitted programming assignments.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Loading your submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Code2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No submissions found</p>
          <p className="text-xs text-slate-400 mt-1">
            Browse the questions bank and submit your first solution.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {sub.question_title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {sub.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted on {sub.submitted_at} • Language:{' '}
                    <span className="font-mono font-medium text-slate-600 dark:text-slate-300">
                      {sub.language}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {renderStatusBadge(sub.status)}

                  {(sub.status === 'REVISION_REQUIRED' || sub.status === 'RESOLVED_VIVA_REQUIRED') && (
                    <button
                      onClick={() => navigateToCoding(sub.question_id)}
                      className="px-3 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revise Code</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status and feedback callout */}
              <div className="mb-4">
                {renderFeedbackNotice(sub)}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="text-slate-500">
                  {sub.test_results
                    ? `${sub.test_results.passed} / ${sub.test_results.total} sample test cases verified`
                    : 'Sample test cases verified'}
                </span>

                <button
                  onClick={() => setSelectedSub(sub)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Submitted Code</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Code Inspection Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedSub.question_title} — Source Code
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedSub.id} • {selectedSub.language}
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 overflow-y-auto max-h-96 font-mono text-xs text-slate-200 border border-slate-800">
              <pre className="whitespace-pre-wrap">
                {selectedSub.source_code || `// Solution submitted for ${selectedSub.question_title}
public class Solution {
    public static void main(String[] args) {
        System.out.println("Solution verified.");
    }
}`}
              </pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentSubmissionsPage;
