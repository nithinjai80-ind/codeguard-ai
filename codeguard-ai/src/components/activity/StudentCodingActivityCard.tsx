/**
 * StudentCodingActivityCard — Teacher-side component
 * =====================================================
 * Displays the aggregated coding activity for a student's submission.
 * Shows event counts (Copy, Paste, Cut, etc.) and a timeline of events.
 *
 * IMPORTANT:
 * - This is supporting evidence only.
 * - Paste activity detected ≠ plagiarism.
 * - The teacher must interpret all signals.
 * - No clipboard content is shown (it was never stored).
 */

import React, { useEffect, useState } from 'react';
import { RoxApiService } from '../../api/apiService';
import { CodingActivitySummary, CodingActivityEvent } from '../../api/types';
import {
  Activity,
  Copy,
  Clipboard,
  Scissors,
  MousePointer2,
  Undo2,
  Redo2,
  Monitor,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface Props {
  submissionId: string;
}

interface ActivityRowProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  highlight?: boolean;
}

const ActivityRow: React.FC<ActivityRowProps> = ({ icon, label, count, highlight }) => (
  <div
    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${
      count > 0 && highlight
        ? 'bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/40'
        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'
    }`}
  >
    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
      <span className={`${count > 0 && highlight ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
    <span
      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
        count > 0 && highlight
          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
      }`}
    >
      {count}
    </span>
  </div>
);

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return iso;
  }
}

function eventLabel(eventType: string): string {
  const map: Record<string, string> = {
    COPY: 'Copy action',
    PASTE: 'Paste action',
    CUT: 'Cut action',
    SELECT_ALL: 'Select All',
    UNDO: 'Undo action',
    REDO: 'Redo action',
    WINDOWS_KEY: 'Windows key'
  };
  return map[eventType] || eventType;
}

function eventDot(eventType: string): string {
  const map: Record<string, string> = {
    COPY: 'bg-blue-500',
    PASTE: 'bg-amber-500',
    CUT: 'bg-orange-500',
    SELECT_ALL: 'bg-purple-500',
    UNDO: 'bg-slate-400',
    REDO: 'bg-slate-500',
    WINDOWS_KEY: 'bg-rose-500'
  };
  return map[eventType] || 'bg-slate-400';
}

export const StudentCodingActivityCard: React.FC<Props> = ({ submissionId }) => {
  const [activity, setActivity] = useState<CodingActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    RoxApiService.getSubmissionActivity(submissionId).then((data) => {
      if (!cancelled) {
        setActivity(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [submissionId]);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading coding activity...</span>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <Activity className="w-4 h-4 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Coding Activity</h4>
        </div>
        <p className="text-xs text-slate-400 text-center py-4">
          No activity data recorded for this session.
        </p>
      </div>
    );
  }

  const rows = [
    { icon: <Copy className="w-3.5 h-3.5" />, label: 'Copy', count: activity.copyCount, highlight: false },
    { icon: <Clipboard className="w-3.5 h-3.5" />, label: 'Paste', count: activity.pasteCount, highlight: true },
    { icon: <Scissors className="w-3.5 h-3.5" />, label: 'Cut', count: activity.cutCount, highlight: false },
    { icon: <MousePointer2 className="w-3.5 h-3.5" />, label: 'Select All', count: activity.selectAllCount, highlight: false },
    { icon: <Undo2 className="w-3.5 h-3.5" />, label: 'Undo', count: activity.undoCount, highlight: false },
    { icon: <Redo2 className="w-3.5 h-3.5" />, label: 'Redo', count: activity.redoCount, highlight: false },
    { icon: <Monitor className="w-3.5 h-3.5" />, label: 'Windows Key', count: activity.windowsKeyCount, highlight: true }
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Student Coding Activity
          </h4>
        </div>
        {activity.sessionDurationMinutes !== null && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Session: <strong className="text-slate-600 dark:text-slate-300">{activity.sessionDurationMinutes} min</strong></span>
          </div>
        )}
      </div>

      {/* Event Counts */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mb-2">
          Editor Activity
        </span>
        {rows.map((row) => (
          <ActivityRow key={row.label} {...row} />
        ))}
      </div>

      {/* Total events badge */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Total tracked events</span>
        <span className="font-bold font-mono text-slate-700 dark:text-slate-200">
          {activity.totalEvents}
        </span>
      </div>

      {/* Timeline */}
      {activity.events.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowTimeline((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Activity Timeline ({activity.events.length} events)
            </span>
            {showTimeline ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {showTimeline && (
            <div className="mt-3 max-h-56 overflow-y-auto space-y-1 pr-1">
              {activity.events.map((event: CodingActivityEvent, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-[11px] py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${eventDot(event.eventType)}`} />
                  <span className="text-slate-400 font-mono w-24 shrink-0">
                    {formatTimestamp(event.timestamp)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {eventLabel(event.eventType)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ethical disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 text-[11px] text-indigo-800 dark:text-indigo-200 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
        <span>
          <strong>Paste activity detected</strong> — not plagiarism.
          Activity data is supporting evidence only. The teacher must interpret all signals.
        </span>
      </div>
    </div>
  );
};

export default StudentCodingActivityCard;
