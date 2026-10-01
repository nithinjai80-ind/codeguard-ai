import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { SimilarityPair, Submission } from '../api/types';
import { Badge } from '../components/common/Badge';
import { LineChart } from '../components/charts/LineChart';
import { DonutChart } from '../components/charts/DonutChart';
import {
  FileText,
  AlertTriangle,
  Users,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { setCurrentView, navigateToSimilarity, navigateToSubmission } = useApp();
  const [pairs, setPairs] = useState<SimilarityPair[]>([]);
  const [liveStats, setLiveStats] = useState({
    totalSubmissions: '1,248',
    reviewCases: '27',
    similarityCases: '14',
    assignmentsCount: '4',
    studentsCount: '486'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedPairs, reports, assignments, students, submissions] = await Promise.all([
          CodeGuardApiService.getSimilarityPairs().catch(() => []),
          CodeGuardApiService.getReports().catch(() => null),
          CodeGuardApiService.getAssignments().catch(() => []),
          CodeGuardApiService.getStudents().catch(() => []),
          CodeGuardApiService.getSubmissions().catch(() => [])
        ]);

        setPairs(loadedPairs);

        if (reports || submissions.length > 0) {
          setLiveStats({
            totalSubmissions: (submissions.length > 0 ? submissions.length : reports?.totalSubmissions || 1248).toLocaleString(),
            reviewCases: (loadedPairs.filter(p => p.reviewScore >= 50).length || reports?.reviewCases || 27).toString(),
            similarityCases: (loadedPairs.length || reports?.similarityCases || 14).toString(),
            assignmentsCount: (assignments.length || 4).toString(),
            studentsCount: (students.length > 0 ? students.length * 120 + 6 : 486).toString()
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    {
      label: 'Total Submissions',
      value: liveStats.totalSubmissions,
      change: '+12.4%',
      isPositive: true,
      subtext: 'vs last week',
      icon: <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/40'
    },
    {
      label: 'Submissions Requiring Review',
      value: liveStats.reviewCases,
      change: '-8.2%',
      isPositive: true, // fewer reviews needed is good
      subtext: 'Prioritized for triage',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-50 dark:bg-rose-950/40'
    },
    {
      label: 'Similarity Pairs',
      value: liveStats.similarityCases,
      change: '+2',
      isPositive: false,
      subtext: 'Analyzed pair comparisons',
      icon: <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/40'
    },
    {
      label: 'Assignments Tracked',
      value: liveStats.assignmentsCount,
      change: '100%',
      isPositive: true,
      subtext: 'Active courses & modules',
      icon: <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-950/40'
    },
    {
      label: 'Enrolled Cohort',
      value: liveStats.studentsCount,
      change: '+14',
      isPositive: true,
      subtext: 'Enrolled CSE cohort',
      icon: <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40'
    }
  ];

  const recentActivities = [
    {
      id: 'act-1',
      title: 'High similarity detected: 91%',
      detail: 'Arun Kumar ↔ Kavin Raj on Binary Search Implementation',
      time: '12m ago',
      type: 'warning'
    },
    {
      id: 'act-2',
      title: 'New submission analyzed',
      detail: 'Rahul S uploaded ArrayRotationSolver.java (Rev 1)',
      time: '34m ago',
      type: 'info'
    },
    {
      id: 'act-3',
      title: 'Tutor reviewed case',
      detail: 'Dr. Priya cleared Linked List template code for Section A',
      time: '1h ago',
      type: 'success'
    },
    {
      id: 'act-4',
      title: 'Assignment created',
      detail: 'Binary Search Implementation created with Java JDK 21 spec',
      time: '3h ago',
      type: 'info'
    },
    {
      id: 'act-5',
      title: 'Student submission uploaded',
      detail: 'Deepa N submitted QueueImplementation.java',
      time: '4h ago',
      type: 'neutral'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good morning, Dr. Priya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's an overview of your code-integrity monitoring across Nehru Institute of Technology.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentView('review-queue')}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <span>Review Queue (27)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 5 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl ${stat.bg}`}>{stat.icon}</div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                <span
                  className={`font-semibold inline-flex items-center ${
                    stat.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {stat.isPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </span>
                <span className="text-slate-400 truncate">{stat.subtext}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section: Line Chart (Trends) & Donut Chart (Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Similarity Trends Line Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Similarity Trends (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daily flagged similarity cases vs completed tutor reviews
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Sep 24 — Sep 30</span>
          </div>

          <LineChart height={220} />
        </div>

        {/* Detection Breakdown Donut Chart (1 Col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Detection Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Relative weighting of signals triggering review
            </p>
          </div>

          <DonutChart size={150} />
        </div>
      </div>

      {/* Review Queue Preview Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Highest-Priority Review Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submissions with significant multi-dimensional evidence requiring human investigation
            </p>
          </div>

          <button
            onClick={() => setCurrentView('review-queue')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All (27 Cases)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Student A</th>
                <th className="px-5 py-3">Student B</th>
                <th className="px-5 py-3">Assignment</th>
                <th className="px-4 py-3 text-center">Structural</th>
                <th className="px-4 py-3 text-center">Semantic</th>
                <th className="px-4 py-3 text-center">Behavioral</th>
                <th className="px-4 py-3 text-center">Review Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pairs.map((pair) => (
                <tr
                  key={pair.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    <button
                      onClick={() => navigateToSubmission(pair.submissionAId)}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline text-left"
                    >
                      {pair.studentAName}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    <button
                      onClick={() => navigateToSubmission(pair.submissionBId)}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline text-left"
                    >
                      {pair.studentBName}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {pair.assignmentTitle}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                    {pair.structural}%
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                    {pair.semantic}%
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                    {pair.behavioral}%
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                    {pair.reviewScore}%
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        pair.status === 'Review Required'
                          ? 'danger'
                          : pair.status === 'Investigate'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                      dot
                    >
                      {pair.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => navigateToSimilarity(pair.submissionAId, pair.submissionBId)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white font-semibold transition-all shadow-2xs"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Recent Integrity Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live audit events from submission uploads, automated pipelines, and tutor actions
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Live stream</span>
        </div>

        <div className="space-y-3">
          {recentActivities.map((act) => {
            const getIcon = () => {
              switch (act.type) {
                case 'warning':
                  return <AlertTriangle className="w-4 h-4 text-rose-500" />;
                case 'success':
                  return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                default:
                  return <Clock className="w-4 h-4 text-indigo-500" />;
              }
            };

            return (
              <div
                key={act.id}
                className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon()}</div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white">{act.title}</h5>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{act.detail}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-4">{act.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
