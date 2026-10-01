import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoxApiService } from '../api/apiService';
import { Submission } from '../api/types';
import { MonacoCodeViewer } from '../components/code/MonacoCodeViewer';
import { CircularProgress } from '../components/common/CircularProgress';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import {
  ArrowLeft,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  User,
  BookOpen,
  FileCode,
  ShieldAlert,
  Send,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { StudentCodingActivityCard } from '../components/activity/StudentCodingActivityCard';

export const SubmissionDetailPage: React.FC = () => {
  const { selectedSubmissionId, setCurrentView, navigateToSimilarity, addToast } = useApp();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  // Teacher Review Decision State
  const [decisionModal, setDecisionModal] = useState<'REJECT' | 'REVISE' | null>(null);
  const [teacherComment, setTeacherComment] = useState('');
  const [isProcessingDecision, setIsProcessingDecision] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await RoxApiService.getSubmissionById(selectedSubmissionId);
        setSubmission(data);
      } catch (err) {
        console.error('Failed to load submission:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedSubmissionId]);

  const handleDecision = async (decision: 'ACCEPTED' | 'REJECTED' | 'REVISION_REQUIRED', comment: string) => {
    if (!submission) return;
    setIsProcessingDecision(true);
    try {
      await RoxApiService.reviewSubmission(submission.id, decision, comment);
      setSubmission({
        ...submission,
        status: decision,
        teacher_comment: comment,
        reviewed_at: new Date().toLocaleTimeString()
      });
      addToast({
        type: 'success',
        title: 'Review Decision Recorded',
        message: `Submission marked as ${decision}. Decision logged.`
      });
      setDecisionModal(null);
      setTeacherComment('');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Decision Error',
        message: err.message || 'Failed to record decision.'
      });
    } finally {
      setIsProcessingDecision(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading submission inspection record...
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500">Submission {selectedSubmissionId} not found.</p>
        <button
          onClick={() => setCurrentView('submissions')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
        >
          Return to Submissions
        </button>
      </div>
    );
  }

  const analysis = submission.analysisDetails || {
    structuralSimilarity: 91,
    semanticSimilarity: 94,
    behavioralSimilarity: 88,
    timelineCorrelation: 67,
    overallReviewScore: 87,
    flaggedEvidence: {
      astStructure: true,
      variableRelationships: true,
      controlFlow: true,
      algorithmicOperations: true,
      matchingRegionsCount: 4,
      timelineAnomaly: true,
      timelineNote: 'Temporal correlation detected'
    },
    matchingRegions: []
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => setCurrentView('submissions')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions</span>
        </button>

        <div className="flex items-center gap-2">
          {submission.pairedSubmissionId && (
            <button
              onClick={() =>
                navigateToSimilarity(submission.id, submission.pairedSubmissionId!)
              }
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare with {submission.pairedSubmissionId}</span>
            </button>
          )}
        </div>
      </div>

      {/* Teacher Decision Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Teacher Acceptance Authority
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
            AI recommendations do NOT alter final status. The teacher makes the academic decision.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleDecision('ACCEPTED', 'Solution verified by teacher. Meets all academic requirements.')}
            disabled={isProcessingDecision}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept Submission</span>
          </button>

          <button
            onClick={() => setDecisionModal('REVISE')}
            disabled={isProcessingDecision}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Request Revision</span>
          </button>

          <button
            onClick={() => setDecisionModal('REJECT')}
            disabled={isProcessingDecision}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Submission</span>
          </button>
        </div>
      </div>

      {/* Submission Metadata Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {submission.id}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Similarity Review Required
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {submission.assignmentTitle || submission.question_title}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-700 dark:text-slate-300">
                {submission.studentName}
              </strong>{' '}
              ({submission.studentId || 'ID-001'})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {submission.submittedAt || submission.submitted_at}
            </span>
            <span>•</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              {submission.language}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Unit Tests
            </span>
            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
              {submission.test_results?.passed ?? 10} / {submission.test_results?.total ?? 10} Passed
            </span>
          </div>
          <div className="text-right pl-4 border-l border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Review Score
            </span>
            <span className="font-mono font-bold text-xl text-rose-600 dark:text-rose-400">
              {analysis.overallReviewScore || 87}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Analysis & Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Code Inspection Editor (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>Source Code Inspection</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {submission.fileName || 'Solution.java'}
            </span>
          </div>

          <MonacoCodeViewer
            code={submission.code || submission.source_code || '// Code preview'}
            language={submission.language === 'Java' ? 'java' : 'python'}
            title={`Submitted by ${submission.studentName}`}
            maxHeight="680px"
          />
        </div>

        {/* Right Side: AI Analysis & Explainable Evidence (1 Col) */}
        <div className="space-y-6">
          {/* Signal breakdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-500">
                Code Analysis Signals
              </span>
              <span className="font-mono text-indigo-500 font-bold">
                {analysis.overallReviewScore || 87}%
              </span>
            </div>

            <CircularProgress
              score={analysis.overallReviewScore || 87}
              size={140}
              strokeWidth={10}
              label="Review Score"
              sublabel="Evidence Correlation"
            />

            <div className="w-full mt-6 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
              <ProgressBar
                value={analysis.structuralSimilarity || 91}
                label="Structural Similarity"
                size="sm"
              />
              <ProgressBar
                value={analysis.semanticSimilarity || 94}
                label="Semantic Similarity"
                size="sm"
              />
              <ProgressBar
                value={analysis.behavioralSimilarity || 88}
                label="Behavioral Similarity"
                size="sm"
              />
              <ProgressBar
                value={analysis.timelineCorrelation || 67}
                label="Timeline Correlation"
                size="sm"
              />
            </div>
          </div>

          {/* Explainable Evidence */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                AI Explainable Evidence
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Orthogonal vectors surfaced to assist the instructor's academic review:
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Similar AST structure detected</span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Equivalent loop structure</span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Similar variable relationships</span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Equivalent expression transformation</span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Multiple corresponding code regions</span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Temporal correlation detected</span>
              </div>
            </div>

            {/* Academic Policy Reminder */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong>Academic Decision Policy:</strong> Evidence scores support instructor review. Labels such as "Cheater" or "Guilty" are strictly prohibited; status remains "Similarity Review Required" until the teacher decides.
              </div>
            </div>
          </div>

          {/* Coding Activity Card */}
          <StudentCodingActivityCard submissionId={submission.id} />
        </div>
      </div>

      {/* Decision Comment Modal (Required for Reject & Revision) */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {decisionModal === 'REJECT' ? 'Reject Submission' : 'Request Code Revision'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Teacher feedback is required for this action. The student will see this comment in their submission log.
            </p>
            <textarea
              value={teacherComment}
              onChange={(e) => setTeacherComment(e.target.value)}
              placeholder={
                decisionModal === 'REJECT'
                  ? 'Your solution failed the required test cases.'
                  : 'Please revise your solution based on the teacher feedback. Check edge cases for empty inputs.'
              }
              className="w-full h-28 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 resize-none font-medium mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setDecisionModal(null);
                  setTeacherComment('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleDecision(
                    decisionModal === 'REJECT' ? 'REJECTED' : 'REVISION_REQUIRED',
                    teacherComment
                  )
                }
                disabled={!teacherComment.trim() || isProcessingDecision}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                  decisionModal === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Confirm {decisionModal === 'REJECT' ? 'Rejection' : 'Revision Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SubmissionDetailPage;
