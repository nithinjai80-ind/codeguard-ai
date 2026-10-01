import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { Student, Submission } from '../api/types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  GraduationCap,
  Search,
  Filter,
  User,
  FileCode,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { navigateToSubmission, navigateToSimilarity } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [studData, subData] = await Promise.all([
          CodeGuardApiService.getStudents(),
          CodeGuardApiService.getSubmissions()
        ]);
        setStudents(studData);
        setSubmissions(subData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const studentSubmissions = selectedStudent
    ? submissions.filter((sub) => sub.studentId === selectedStudent.id)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Students Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Department of Computer Science and Engineering — Nehru Institute of Technology.
          </p>
        </div>

        {/* Ethical Academic Policy Banner */}
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 max-w-md">
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ethical Student Records Policy</span>
          </div>
          <p className="text-[11px] leading-tight text-indigo-900/80 dark:text-indigo-300/80">
            No permanent plagiarism scores are stored. Student records reflect only submission-level evidence and documented tutor decisions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, roll number, or ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <span className="text-xs font-mono text-slate-500">
          Showing {filteredStudents.length} Students
        </span>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Student ID</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-4 py-3 text-center">Submissions</th>
                <th className="px-4 py-3 text-center">Assignments</th>
                <th className="px-4 py-3 text-center">Review Cases</th>
                <th className="px-5 py-3">Last Submission</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => {
                const hasReview = student.reviewCasesCount > 0;

                return (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-slate-500 font-medium">
                      {student.id}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {student.rollNumber}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {student.department}
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono font-medium">
                      {student.submissionsCount}
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono font-medium">
                      {student.assignmentsCompleted}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {hasReview ? (
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {student.reviewCasesCount} Active
                        </span>
                      ) : (
                        <span className="font-mono text-slate-400 text-xs">0</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {student.lastSubmission}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <span>Profile & History</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Drawer / Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile: ${selectedStudent.name}`}
          subtitle={`${selectedStudent.rollNumber} • ${selectedStudent.department}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Header Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Batch Cohort
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedStudent.batch}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Email
                </span>
                <span className="font-semibold text-slate-900 dark:text-white truncate block">
                  {selectedStudent.email}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Total Submissions
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedStudent.submissionsCount} files
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Documented Reviews
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {selectedStudent.reviewCasesCount} cases logged
                </span>
              </div>
            </div>

            {/* Submission History */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                Submission History Across Courses
              </h4>

              <div className="space-y-2">
                {studentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{sub.assignmentTitle}</span>
                        <span className="text-[10px] font-mono text-slate-400">({sub.id})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sub.language} • {sub.submittedAt} (Rev {sub.revision})
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        {sub.overallSimilarity}% Similarity
                      </span>
                      <button
                        onClick={() => {
                          setSelectedStudent(null);
                          navigateToSubmission(sub.id);
                        }}
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documented Tutor Notes & Academic Fairness */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 text-xs space-y-2">
              <h5 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-500" />
                Department Integrity Ledger
              </h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                Student records are managed under the Nehru Institute of Technology Academic Fairness Code. All similarity metrics represent point-in-time algorithmic assistance; only tutor-documented decisions determine academic standing.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
