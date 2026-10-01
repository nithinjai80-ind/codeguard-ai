import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { TimelineEvent } from '../api/types';
import { Badge } from '../components/common/Badge';
import {
  Clock,
  Calendar,
  AlertTriangle,
  GitCommit,
  GitBranch,
  CheckCircle2,
  GitCompare,
  Info,
  Activity,
  History,
  TrendingUp
} from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const { navigateToSimilarity, navigateToSubmission } = useApp();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('EVT-02');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await CodeGuardApiService.getTimeline();
        setEvents(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Submission Timeline
            </h1>
            <Badge variant="warning" size="md" dot>
              Temporal Signals
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chronological event tracking of submission sequences, revision cycles, and emergence patterns.
          </p>
        </div>

        {/* Essential Academic Integrity Disclaimer */}
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 max-w-md">
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <Info className="w-3.5 h-3.5" />
            <span>Ethical Temporal Evidence</span>
          </div>
          <p className="text-[11px] leading-tight text-indigo-900/80 dark:text-indigo-300/80">
            Temporal correlation notes tight submission intervals without presuming direction of copying or intent.
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Timeline (Left) + Timeline Evidence Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Timeline Events Stream */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              Chronological Sequence (Sep 30, 2026)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {events.length} Recorded Submissions
            </span>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {events.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              const isFlagged = evt.similarityWithPrevious && evt.similarityWithPrevious >= 80;

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/80 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Timeline Node Bullet on the vertical line */}
                  <span
                    className={`absolute -left-[31px] top-5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                      isFlagged
                        ? 'bg-rose-500'
                        : evt.eventType === 'REVISION'
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {evt.time}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {evt.studentName}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{evt.studentId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {evt.timeDeltaFromPrevious && (
                        <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {evt.timeDeltaFromPrevious}
                        </span>
                      )}
                      <Badge
                        variant={
                          isFlagged
                            ? 'danger'
                            : evt.eventType === 'REVISION'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {evt.eventType === 'INITIAL_SUBMISSION'
                          ? 'Initial'
                          : evt.eventType === 'REVISION'
                          ? `Rev ${evt.revisionNumber}`
                          : 'Temporal Flag'}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {evt.details}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      {evt.assignmentTitle} ({evt.submissionId})
                    </span>

                    {evt.correlatedWithStudent && (
                      <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Correlated with {evt.correlatedWithStudent}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: "Timeline Evidence" Panel */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Timeline Evidence
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Objective behavioral signals extracted from event logs
              </p>
            </div>

            {/* Evidence block 1: Submission intervals */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Submission Intervals
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  4.2 min delta
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Submissions arrived in rapid succession well within the configured 10-minute temporal correlation threshold.
              </p>
            </div>

            {/* Evidence block 2: Revision frequency */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Revision Frequency
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  2 Synchronized Cycles
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Revision 2 submissions from both students mirrored structural updates within 12 minutes of each other.
              </p>
            </div>

            {/* Evidence block 3: Similarity emergence */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Similarity Emergence
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  89% → 91%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Similarity emerged in initial submissions and was preserved through variable substitution in subsequent revisions.
              </p>
            </div>

            {/* Evidence block 4: Attempt patterns */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Attempt Patterns
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Iterative Build
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Both student traces show compile-time test executions before final archive upload.
              </p>
            </div>

            {/* Quick Action Button */}
            {selectedEvent?.correlatedWithStudent && (
              <button
                onClick={() => navigateToSimilarity('SUB-1042', 'SUB-1049')}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Correlated Submissions</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
