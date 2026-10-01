import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { Submission } from '../api/types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Upload,
  Files,
  Search,
  Filter,
  Eye,
  GitCompare,
  Download,
  FileCode,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SubmissionsPage: React.FC = () => {
  const { navigateToSubmission, navigateToSimilarity, addToast } = useApp();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [isSingleUploadOpen, setIsSingleUploadOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Form states for Single Upload
  const [uploadStudentName, setUploadStudentName] = useState('');
  const [uploadAssignment, setUploadAssignment] = useState('ASSIGN-01');
  const [uploadLanguage, setUploadLanguage] = useState<'Java' | 'Python' | 'C++'>('Java');
  const [uploadCode, setUploadCode] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await CodeGuardApiService.getSubmissions({
        assignmentId: selectedAssignment,
        language: selectedLanguage,
        status: selectedStatus,
        search
      });
      setSubmissions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedAssignment, selectedLanguage, selectedStatus, search]);

  const handleSingleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadStudentName || !uploadCode) {
      addToast({
        type: 'warning',
        title: 'Missing Required Fields',
        message: 'Please provide student name and source code.'
      });
      return;
    }

    try {
      const newSub = await CodeGuardApiService.uploadSubmission({
        studentName: uploadStudentName,
        assignmentId: uploadAssignment,
        assignmentTitle:
          uploadAssignment === 'ASSIGN-01'
            ? 'Binary Search Implementation'
            : uploadAssignment === 'ASSIGN-02'
            ? 'Array Rotation'
            : 'Linked List Operations',
        language: uploadLanguage,
        code: uploadCode,
        fileName: `${uploadStudentName.replace(/\s+/g, '')}Solution.${uploadLanguage === 'Java' ? 'java' : uploadLanguage === 'Python' ? 'py' : 'cpp'}`
      });

      addToast({
        type: 'success',
        title: 'Submission Uploaded & Analyzed',
        message: `Registered ${newSub.id} for ${uploadStudentName}. Analyzed with 0 syntax faults.`
      });

      setIsSingleUploadOpen(false);
      setUploadStudentName('');
      setUploadCode('');
      loadSubmissions();
    } catch {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Unable to process submission file.'
      });
    }
  };

  const handleBulkUploadSimulate = () => {
    setIsBulkUploadOpen(false);
    addToast({
      type: 'info',
      title: 'Bulk Archive Intake',
      message: 'Processing zip archive: 24 java source files queued for AST parsing and vector alignment.'
    });
  };

  const handleExportCSV = () => {
    const headers = 'Submission ID,Student Name,Roll Number,Assignment,Language,Submitted,Status,Similarity\n';
    const rows = submissions
      .map(
        (s) =>
          `"${s.id}","${s.studentName}","${s.studentId}","${s.assignmentTitle}","${s.language}","${s.submittedAt}","${s.status}","${s.overallSimilarity}%"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeguard_submissions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'CSV Export Generated',
      message: `Exported ${submissions.length} submission records.`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, inspect, and evaluate student programming assignments across cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsBulkUploadOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
          >
            <Files className="w-3.5 h-3.5" />
            <span>+ Bulk Upload</span>
          </button>

          <button
            onClick={() => setIsSingleUploadOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload Submission</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students or submissions..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Assignment Filter */}
          <div>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Assignments</option>
              <option value="ASSIGN-01">Binary Search</option>
              <option value="ASSIGN-02">Array Rotation</option>
              <option value="ASSIGN-03">Linked List</option>
              <option value="ASSIGN-04">Sorting Algorithms</option>
              <option value="ASSIGN-05">Stack Implementation</option>
              <option value="ASSIGN-06">Queue Implementation</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Languages</option>
              <option value="Java">Java (JDK 21)</option>
              <option value="Python">Python (3.11)</option>
              <option value="C++">C++ (GCC)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="REVIEW_REQUIRED">Review Required</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="ANALYZED">Analyzed</option>
              <option value="CLEAR">Clear</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Submission ID</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Assignment</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Similarity</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map((sub) => {
                const isFlagged = (sub.overallSimilarity ?? 0) >= 80;
                const isModerate = (sub.overallSimilarity ?? 0) >= 60;

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-900 dark:text-white">
                      <button
                        onClick={() => navigateToSubmission(sub.id)}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                      >
                        {sub.id}
                      </button>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {sub.studentName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{sub.studentId}</div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {sub.assignmentTitle}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {sub.language}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {sub.submittedAt}
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          sub.status === 'REVIEW_REQUIRED'
                            ? 'danger'
                            : sub.status === 'INVESTIGATING'
                            ? 'warning'
                            : sub.status === 'ANALYZED'
                            ? 'primary'
                            : 'success'
                        }
                        size="sm"
                        dot
                      >
                        {sub.status === 'REVIEW_REQUIRED'
                          ? 'Review Required'
                          : sub.status === 'INVESTIGATING'
                          ? 'Investigating'
                          : sub.status === 'ANALYZED'
                          ? 'Analyzed'
                          : 'Clear'}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md ${
                          isFlagged
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : isModerate
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {sub.overallSimilarity}%
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => navigateToSubmission(sub.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {sub.pairedSubmissionId && (
                        <button
                          onClick={() => navigateToSimilarity(sub.id, sub.pairedSubmissionId!)}
                          title="Open Side-by-Side Comparison"
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>Compare</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Upload Modal */}
      <Modal
        isOpen={isSingleUploadOpen}
        onClose={() => setIsSingleUploadOpen(false)}
        title="Upload Student Submission"
        subtitle="Ingest and run multi-dimensional integrity scan for a single code file"
      >
        <form onSubmit={handleSingleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student Full Name
            </label>
            <input
              type="text"
              value={uploadStudentName}
              onChange={(e) => setUploadStudentName(e.target.value)}
              placeholder="e.g. Harish B"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Assignment
              </label>
              <select
                value={uploadAssignment}
                onChange={(e) => setUploadAssignment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="ASSIGN-01">Binary Search Implementation</option>
                <option value="ASSIGN-02">Array Rotation</option>
                <option value="ASSIGN-03">Linked List Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Programming Language
              </label>
              <select
                value={uploadLanguage}
                onChange={(e) => setUploadLanguage(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Java">Java (JDK 21)</option>
                <option value="Python">Python (3.11)</option>
                <option value="C++">C++</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Source Code Content
            </label>
            <textarea
              rows={8}
              value={uploadCode}
              onChange={(e) => setUploadCode(e.target.value)}
              placeholder="Paste Java / Python source code here..."
              className="w-full font-mono px-3 py-2 text-xs rounded-lg bg-slate-950 text-slate-200 border border-slate-800 focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSingleUploadOpen(false)}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Run Integrity Analysis
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        title="Bulk Submissions Upload"
        subtitle="Upload ZIP or TAR archive containing cohort code files"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-950/40">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Drag and drop submissions archive here (.zip, .tar.gz)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports standard LMS exports (Moodle, Canvas, Google Classroom)
            </p>
            <input
              type="file"
              accept=".zip,.tar,.gz"
              className="mt-4 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950/80 dark:file:text-indigo-300 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsBulkUploadOpen(false)}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUploadSimulate}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Ingest & Scan Archive
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
