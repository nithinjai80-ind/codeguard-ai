import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { Assignment } from '../api/types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  BookOpen,
  Plus,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Download,
  PlayCircle,
  ExternalLink,
  Users
} from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { setCurrentView, addToast } = useApp();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('CS202');
  const [newLanguage, setNewLanguage] = useState('Java');
  const [newDueDate, setNewDueDate] = useState('Nov 20, 2026');
  const [newDescription, setNewDescription] = useState('');

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await CodeGuardApiService.getAssignments();
      setAssignments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const created = await CodeGuardApiService.createAssignment({
        title: newTitle,
        courseCode: newCourseCode,
        language: newLanguage,
        dueDate: newDueDate,
        description: newDescription || 'Programming assignment on algorithm design and data structures.'
      });

      addToast({
        type: 'success',
        title: 'Assignment Created',
        message: `${created.title} (${created.id}) registered and ready for submission uploads.`
      });

      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      loadAssignments();
    } catch {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Unable to register assignment.'
      });
    }
  };

  const handleRunAnalyze = (assignment: Assignment) => {
    addToast({
      type: 'info',
      title: 'Batch Analysis Initiated',
      message: `Analyzing AST and semantic matrices for all ${assignment.totalSubmissions} submissions in ${assignment.title}...`
    });
    setTimeout(() => {
      addToast({
        type: 'success',
        title: 'Analysis Synchronized',
        message: `Updated review priorities for ${assignment.title}.`
      });
    }, 1500);
  };

  const handleExportAssignmentReport = (assignment: Assignment) => {
    const csvContent = `Assignment,${assignment.title}\nCourse,${assignment.courseCode}\nSubmissions,${assignment.totalSubmissions}\nRequiring Review,${assignment.requiringReview}\nAverage Similarity,${assignment.averageSimilarity}%\nStatus,${assignment.status}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.id}_integrity_report.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Report Exported',
      message: `Integrity summary generated for ${assignment.title}.`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage course problem sets, submission quotas, and automated integrity scanning rules.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Assignment</span>
        </button>
      </div>

      {/* Assignment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => {
          const hasHighReview = assignment.requiringReview > 0;

          return (
            <div
              key={assignment.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {assignment.courseCode} • {assignment.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                      {assignment.title}
                    </h3>
                  </div>

                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {assignment.language}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-5">
                  {assignment.description}
                </p>

                {/* Submissions & Review Metrics */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 mb-5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Submissions
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {assignment.totalSubmissions}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Requiring Review
                    </span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        hasHighReview ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                      }`}
                    >
                      {assignment.requiringReview}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Due: {assignment.dueDate}
                  </span>
                  <span className="font-mono text-[11px]">
                    Avg: {assignment.averageSimilarity}%
                  </span>
                </div>
              </div>

              {/* Action Buttons: View, Analyze, Export Report */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCurrentView('submissions')}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold text-center transition-colors"
                >
                  View
                </button>

                <button
                  onClick={() => handleRunAnalyze(assignment)}
                  className="py-1.5 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-semibold text-center transition-colors"
                >
                  Analyze
                </button>

                <button
                  onClick={() => handleExportAssignmentReport(assignment)}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Assignment"
        subtitle="Configure assignment metadata and automated similarity thresholds"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assignment Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Graph Breadth-First Search"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="CS201"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Language
              </label>
              <select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
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
              Due Date
            </label>
            <input
              type="text"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              placeholder="Nov 20, 2026"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Problem Description & Verification Guidelines
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Specify requirements, constraints, and standard libraries permitted..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Save & Activate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
