import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { SimilarityPair } from '../api/types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  ListTodo,
  AlertTriangle,
  GitCompare,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export const ReviewQueuePage: React.FC = () => {
  const { navigateToSimilarity, addToast } = useApp();
  const [pairs, setPairs] = useState<SimilarityPair[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'RECENT' | 'REVIEWED'>('ALL');
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedPairForReview, setSelectedPairForReview] = useState<SimilarityPair | null>(null);
  const [modalVerdict, setModalVerdict] = useState('FLAG_FOR_VIVA');
  const [modalNotes, setModalNotes] = useState('');

  const loadPairs = async () => {
    setLoading(true);
    try {
      const data = await CodeGuardApiService.getSimilarityPairs();
      setPairs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPairs();
  }, []);

  const filteredPairs = pairs.filter((p) => {
    if (activeTab === 'HIGH') return p.reviewScore >= 85;
    if (activeTab === 'MEDIUM') return p.reviewScore >= 70 && p.reviewScore < 85;
    if (activeTab === 'RECENT') return (p.timeDeltaMinutes ?? 0) <= 15;
    if (activeTab === 'REVIEWED') return p.status === 'Reviewed';
    return true;
  });

  const handleMarkReviewedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPairForReview) return;

    try {
      await CodeGuardApiService.updateReviewDecision(selectedPairForReview.id, modalVerdict, modalNotes);

      addToast({
        type: 'success',
        title: 'Review Decision Logged',
        message: `Case ${selectedPairForReview.id} marked as Reviewed.`
      });

      setSelectedPairForReview(null);
      setModalNotes('');
      loadPairs();
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not record review decision.'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Review Queue
          </h1>
          <Badge variant="danger" size="md" dot>
            27 Cases Pending
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cases requiring tutor investigation. Objective evidence surfaced for human adjudication.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Cases', count: pairs.length },
          { id: 'HIGH', label: 'High Priority', count: pairs.filter((p) => p.reviewScore >= 85).length },
          { id: 'MEDIUM', label: 'Medium Priority', count: pairs.filter((p) => p.reviewScore >= 70 && p.reviewScore < 85).length },
          { id: 'RECENT', label: 'Recently Added', count: pairs.filter((p) => (p.timeDeltaMinutes ?? 0) <= 15).length },
          { id: 'REVIEWED', label: 'Reviewed', count: pairs.filter((p) => p.status === 'Reviewed').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filteredPairs.map((pair) => {
          const isHighPriority = pair.reviewScore >= 85;

          return (
            <div
              key={pair.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isHighPriority ? 'danger' : 'warning'} size="sm" dot>
                    {isHighPriority ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY'}
                  </Badge>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {pair.studentAName} ↔ {pair.studentBName}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {pair.assignmentTitle}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    <strong>{pair.detectedRegionsCount} significant similarity regions</strong> detected across control-flow and normalized AST.
                  </span>
                </p>

                {/* Metric pills */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <div className="font-mono text-slate-600 dark:text-slate-300">
                    Structural: <strong className="text-rose-600 dark:text-rose-400">{pair.structural}%</strong>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <div className="font-mono text-slate-600 dark:text-slate-300">
                    Semantic: <strong className="text-indigo-600 dark:text-indigo-400">{pair.semantic}%</strong>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <div className="font-mono text-slate-600 dark:text-slate-300">
                    Behavioral: <strong className="text-amber-600 dark:text-amber-400">{pair.behavioral}%</strong>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <div className="font-mono text-slate-500 text-[11px]">
                    Interval: {pair.timeDeltaMinutes}m delta
                  </div>
                </div>

                {/* Audit trail if reviewed */}
                {pair.tutorDecision && (
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <strong>Tutor Decision ({pair.tutorDecision.reviewedBy}):</strong> {pair.tutorDecision.verdict} — "{pair.tutorDecision.notes}"
                  </div>
                )}
              </div>

              {/* Right Scores & Buttons */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Review Score
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {pair.reviewScore}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateToSimilarity(pair.submissionAId, pair.submissionBId)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Investigate</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPairForReview(pair);
                      setModalNotes(pair.tutorDecision?.notes || '');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Mark Reviewed
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mark Reviewed Modal */}
      {selectedPairForReview && (
        <Modal
          isOpen={!!selectedPairForReview}
          onClose={() => setSelectedPairForReview(null)}
          title="Document Tutor Review Decision"
          subtitle={`Case ${selectedPairForReview.id}: ${selectedPairForReview.studentAName} ↔ ${selectedPairForReview.studentBName}`}
        >
          <form onSubmit={handleMarkReviewedSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tutor Adjudication Verdict
              </label>
              <select
                value={modalVerdict}
                onChange={(e) => setModalVerdict(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="FLAG_FOR_VIVA">Flag for In-Person Oral Viva</option>
                <option value="EXPLANATION_REQUESTED">Request Student Clarification</option>
                <option value="ACCEPTABLE_TEMPLATE">Acceptable Template / Text Idiom</option>
                <option value="DISMISSED_CLEAR">Dismissed (No Action Required)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tutor Notes & Audit Findings
              </label>
              <textarea
                rows={3}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Document your rationale for future accreditation and committee reference..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPairForReview(null)}
                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Save Decision
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
