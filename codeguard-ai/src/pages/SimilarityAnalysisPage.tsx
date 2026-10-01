import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { SimilarityPair, Submission } from '../api/types';
import { CodeDiffViewer } from '../components/code/CodeDiffViewer';
import { EvidenceGraph } from '../components/code/EvidenceGraph';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Split,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Cpu,
  Network,
  Zap,
  Clock,
  RotateCcw,
  Sparkles,
  UserCheck,
  Send,
  Download,
  Info
} from 'lucide-react';
import { StudentCodingActivityCard } from '../components/activity/StudentCodingActivityCard';

export const SimilarityAnalysisPage: React.FC = () => {
  const { similaritySelection, setSimilaritySelection, addToast } = useApp();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentPair, setCurrentPair] = useState<SimilarityPair | null>(null);
  const [subA, setSubA] = useState<Submission | null>(null);
  const [subB, setSubB] = useState<Submission | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(true);

  // Tutor Decision State
  const [tutorVerdict, setTutorVerdict] = useState<string>('FLAG_FOR_VIVA');
  const [tutorNotes, setTutorNotes] = useState<string>(
    'Syntactic differences represent superficial identifier renaming. Core invariant logic and while-loop boundaries are identical. Scheduled for in-person viva validation on Friday.'
  );
  const [isSavingDecision, setIsSavingDecision] = useState(false);

  useEffect(() => {
    async function loadData() {
      const allSubs = await CodeGuardApiService.getSubmissions();
      setSubmissions(allSubs);

      const targetA = allSubs.find((s) => s.id === similaritySelection.submissionAId) || allSubs[0];
      const targetB =
        allSubs.find((s) => s.id === similaritySelection.submissionBId) ||
        allSubs.find((s) => s.id !== targetA.id) ||
        allSubs[1];

      setSubA(targetA);
      setSubB(targetB);

      const pair = await CodeGuardApiService.analyzeSimilarity(targetA.id, targetB.id);
      setCurrentPair(pair);
    }
    loadData();
  }, [similaritySelection]);

  const handleAnalyzeClick = async () => {
    if (!subA || !subB) return;
    setIsAnalyzing(true);
    try {
      const pair = await CodeGuardApiService.analyzeSimilarity(subA.id, subB.id);
      setCurrentPair(pair);
      setHasAnalyzed(true);
      addToast({
        type: 'success',
        title: 'Analysis Pipeline Executed',
        message: `Calculated multi-vector similarity between ${subA.studentName} and ${subB.studentName}.`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSwapSubmissions = () => {
    if (subA && subB) {
      setSimilaritySelection({
        submissionAId: subB.id,
        submissionBId: subA.id
      });
    }
  };

  const handleSaveDecision = async () => {
    if (!currentPair) return;
    setIsSavingDecision(true);
    try {
      await CodeGuardApiService.updateReviewDecision(currentPair.id, tutorVerdict, tutorNotes);
      addToast({
        type: 'success',
        title: 'Review Decision Logged',
        message: 'Tutor evaluation and notes securely saved to academic integrity audit ledger.'
      });
    } finally {
      setIsSavingDecision(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Similarity Analysis
            </h1>
            <Badge variant="danger" size="md" dot>
              Review Required
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare normalized AST, vector embeddings, and execution characteristics of two submissions.
          </p>
        </div>

        {/* Ethical Academic Principle Callout */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Evidence-Based Review • Tutor retains final decision</span>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
          {/* Student A Selector */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Student A (Anchor Submission)
            </label>
            <select
              value={subA?.id || ''}
              onChange={(e) => {
                const found = submissions.find((s) => s.id === e.target.value);
                if (found) {
                  setSubA(found);
                  setSimilaritySelection({
                    submissionAId: found.id,
                    submissionBId: subB?.id || 'SUB-1049'
                  });
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
            >
              {submissions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentName} — {s.id} ({s.assignmentTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwapSubmissions}
              title="Swap Student A and Student B"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Student B Selector */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Student B (Paired Comparison)
            </label>
            <select
              value={subB?.id || ''}
              onChange={(e) => {
                const found = submissions.find((s) => s.id === e.target.value);
                if (found) {
                  setSubB(found);
                  setSimilaritySelection({
                    submissionAId: subA?.id || 'SUB-1042',
                    submissionBId: found.id
                  });
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
            >
              {submissions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentName} — {s.id} ({s.assignmentTitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs flex items-center gap-2 transition-all ${
              isAnalyzing
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Running Neural Pipeline...' : 'Analyze Similarity'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {currentPair && hasAnalyzed && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Score Banner: Overall Review Score 91% + 4 Large Metric Cards */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Synthesized Assessment
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Overall Review Score
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                  {currentPair.reviewScore}%
                </span>
                <Badge variant="danger" size="md" dot>
                  High Similarity Alert
                </Badge>
              </div>
            </div>

            {/* 4 Large Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* STRUCTURAL */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                      STRUCTURAL
                    </span>
                    <Cpu className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {currentPair.structural}%
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  AST node sequence & CFG graph similarity
                </p>
              </div>

              {/* SEMANTIC */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                      SEMANTIC
                    </span>
                    <Network className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {currentPair.semantic}%
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  CodeBERT dense embedding cosine distance
                </p>
              </div>

              {/* BEHAVIORAL */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                      BEHAVIORAL
                    </span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {currentPair.behavioral}%
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Test vector traces & runtime branch invariants
                </p>
              </div>

              {/* TIMELINE */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                      TIMELINE
                    </span>
                    <Clock className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                    {currentPair.timeline}%
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Submitted 4 min apart; revision synchronization
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Side-by-Side Code Comparison & Detected Transformations */}
          <CodeDiffViewer
            studentAName={subA?.studentName || 'Student A'}
            studentBName={subB?.studentName || 'Student B'}
            studentACode={subA?.code || ''}
            studentBCode={subB?.code || ''}
            studentAFileName={subA?.fileName}
            studentBFileName={subB?.fileName}
            assignmentTitle={subA?.assignmentTitle || 'Programming Task'}
            transformations={currentPair.transformations}
          />

          {/* Evidence Graph */}
          <EvidenceGraph
            studentAName={subA?.studentName || 'Student A'}
            studentBName={subB?.studentName || 'Student B'}
            structuralScore={currentPair.structural}
            semanticScore={currentPair.semantic}
            behavioralScore={currentPair.behavioral}
            timelineScore={currentPair.timeline}
            overallScore={currentPair.reviewScore}
          />

          {/* Coding Activity — per student (Student A) */}
          {subA && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Coding Activity — {subA.studentName}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-semibold">
                  Behavioral Signal
                </span>
              </div>
              <StudentCodingActivityCard submissionId={subA.id} />
            </div>
          )}

          {/* Teacher Decision & Review Form */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Teacher Review & Final Academic Decision
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Audited By: Dr. Priya Kumar
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'ACCEPTED', label: 'Accept Submission', desc: 'Code meets academic criteria.', color: 'emerald' },
                  { id: 'REVISION_REQUIRED', label: 'Request Revision', desc: 'Student must revise based on feedback.', color: 'orange' },
                  { id: 'REJECTED', label: 'Reject Submission', desc: 'Solution rejected with feedback.', color: 'rose' }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTutorVerdict(option.id)}
                    className={`p-3 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                      tutorVerdict === option.id
                        ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">{option.label}</div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Feedback & Investigation Notes
                </label>
                <textarea
                  rows={3}
                  value={tutorNotes}
                  onChange={(e) => setTutorNotes(e.target.value)}
                  placeholder="Provide feedback for the student or notes for academic integrity audit..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  AI recommendations do not determine misconduct. The instructor makes the final decision.
                </span>

                <button
                  onClick={async () => {
                    if (!subA) return;
                    setIsSavingDecision(true);
                    try {
                      await CodeGuardApiService.reviewSubmission(
                        subA.id,
                        tutorVerdict as any,
                        tutorNotes
                      );
                      addToast({
                        type: 'success',
                        title: 'Teacher Decision Saved',
                        message: `Academic decision '${tutorVerdict}' recorded for ${subA.studentName}.`
                      });
                    } catch (err: any) {
                      addToast({
                        type: 'error',
                        title: 'Save Failed',
                        message: err.message || 'Error saving review decision.'
                      });
                    } finally {
                      setIsSavingDecision(false);
                    }
                  }}
                  disabled={isSavingDecision}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSavingDecision ? 'Saving...' : 'Submit Teacher Decision'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
