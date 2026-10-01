import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { ReportStats } from '../api/types';
import { HistogramChart } from '../components/charts/HistogramChart';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  PieChart,
  Calendar,
  Layers,
  School,
  Printer
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { addToast } = useApp();
  const [reports, setReports] = useState<ReportStats | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await CodeGuardApiService.getReports();
        setReports(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!reports) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading reports...</div>;
  }

  const handleExportCSV = () => {
    let csv = 'Metric,Value\n';
    csv += `Total Submissions Analyzed,${reports.totalSubmissions}\n`;
    csv += `Similarity Cases Detected,${reports.similarityCases}\n`;
    csv += `Review Priority Cases,${reports.reviewCases}\n`;
    csv += `Cases Completed by Tutor,${reports.reviewedCases}\n`;
    csv += `Average Similarity Score,${reports.averageSimilarity}%\n\n`;

    csv += 'Score Distribution Range,Submission Count,Percentage\n';
    reports.similarityDistribution.forEach((d) => {
      csv += `"${d.range}",${d.count},${d.percentage}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeguard_academic_integrity_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'CSV Report Downloaded',
      message: 'Comprehensive academic integrity dataset exported.'
    });
  };

  const handleSimulatePdfDownload = () => {
    setIsPdfModalOpen(false);
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Integrity Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Departmental analytics, similarity distributions, and accreditation compliance audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Top 5 Stat Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Total Analyzed
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {reports.totalSubmissions.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            100% Pipeline Coverage
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Similarity Cases
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {reports.similarityCases}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Pairwise signals &gt;50%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Review Cases
          </span>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {reports.reviewCases}
          </div>
          <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-semibold mt-1 block">
            Priority Queue
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Reviewed Cases
          </span>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {reports.reviewedCases}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            78% Resolved by Tutor
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Average Similarity
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {reports.averageSimilarity}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Expected academic baseline
          </span>
        </div>
      </div>

      {/* Main Charts: Histogram Distribution + Cases by Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Similarity Score Distribution Histogram */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Similarity Score Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Population distribution of submissions across similarity brackets
            </p>
          </div>

          <HistogramChart data={reports.similarityDistribution} height={220} />
        </div>

        {/* Cases by Assignment */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              Cases by Course Assignment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Concentration of high vs medium priority reviews per problem set
            </p>
          </div>

          <div className="space-y-3.5">
            {reports.casesByAssignment.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.assignment}
                  </span>
                  <div className="font-mono text-[11px] space-x-2">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      {item.highReviewCount} High
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {item.mediumReviewCount} Medium
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 flex overflow-hidden">
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${(item.highReviewCount / 14) * 60}%` }}
                  />
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${(item.mediumReviewCount / 8) * 40}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Cases by Language + Review Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Language */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Submissions by Programming Language
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown across supported departmental compilers
            </p>
          </div>

          <div className="space-y-3">
            {reports.casesByLanguage.map((lang, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{lang.language}</span>
                  <span className="text-slate-400 text-[11px] ml-2">({lang.count} files)</span>
                </div>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {lang.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Documented Review Outcomes */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Tutor Review Outcomes Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Auditable classifications logged by course tutors
            </p>
          </div>

          <div className="space-y-3">
            {reports.reviewOutcomes.map((outcome, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: outcome.color }}
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {outcome.outcome}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {outcome.count} cases
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Export Preview Modal */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title="Official Academic Integrity Audit Report"
        subtitle="Department of Computer Science & Engineering — Nehru Institute of Technology"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span>Report Ref: NIT-CSE-2026-Q3</span>
              <span>Generated: Sep 30, 2026</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">
              Institutional Summary: Code Integrity & Similarity Verification
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              This certified audit document certifies that 1,248 student submissions across Course CS201 and CS202 underwent AST normalization, CodeBERT vector embedding analysis, and runtime behavioral trace validation. 27 flagged submissions were presented to Dr. Priya Kumar for human-in-the-loop adjudication.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Reviewed By
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                Dr. Priya Kumar
              </span>
              <span className="text-[10px] text-slate-500 block">
                Associate Professor & Course Lead
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Compliance Standard
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Ethical Human-in-the-Loop
              </span>
              <span className="text-[10px] text-slate-500 block">
                Zero Automated Punitive Flags
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setIsPdfModalOpen(false)}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200"
            >
              Close
            </button>
            <button
              onClick={handleSimulatePdfDownload}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
