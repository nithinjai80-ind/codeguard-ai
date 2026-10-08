import React, { useState, useEffect } from 'react';
import { RoxApiService } from '../api/apiService';
import { Question, TestCase, QuestionExample } from '../api/types';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Globe,
  Lock,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  FileCode2,
  Sliders
} from 'lucide-react';

export const AdminQuestionsPage: React.FC = () => {
  const { addToast } = useApp();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraintsText, setConstraintsText] = useState('1 <= arr.length <= 10^5\n-10^4 <= arr[i] <= 10^4');
  const [language, setLanguage] = useState('Java');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [timeLimit, setTimeLimit] = useState(2000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  // Test cases
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '5\n3 7 2 9 4', expected_output: '9', is_sample: true, explanation: 'Largest is 9' },
    { input: '4\n-10 -3 -45 -2', expected_output: '-2', is_sample: false }
  ]);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await RoxApiService.getAdminQuestions();
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setInputFormat('');
    setOutputFormat('');
    setConstraintsText('');
    setLanguage('Java');
    setDifficulty('MEDIUM');
    setTimeLimit(2000);
    setMemoryLimit(256);
    setStatus('PUBLISHED');
    setTestCases([
      { input: '5\n3 7 2 9 4', expected_output: '9', is_sample: true, explanation: 'Sample test' },
      { input: '4\n-10 -3 -45 -2', expected_output: '-2', is_sample: false }
    ]);
    setIsEditing(false);
    setActiveQuestionId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setIsEditing(true);
    setActiveQuestionId(q.id);
    setTitle(q.title);
    setDescription(q.description);
    setInputFormat(q.input_format || '');
    setOutputFormat(q.output_format || '');
    setConstraintsText((q.constraints || []).join('\n'));
    setLanguage(q.language);
    setDifficulty(q.difficulty);
    setTimeLimit(q.time_limit || 2000);
    setMemoryLimit(q.memory_limit || 256);
    setStatus(q.status);
    setTestCases(
      q.test_cases && q.test_cases.length > 0
        ? q.test_cases
        : [{ input: '', expected_output: '', is_sample: true }]
    );
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (finalStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim() || !description.trim()) {
      addToast({ type: 'warning', message: 'Title and description are required.' });
      return;
    }

    const payload: Partial<Question> = {
      title,
      description,
      input_format: inputFormat,
      output_format: outputFormat,
      constraints: constraintsText.split('\n').filter((c) => c.trim()),
      language,
      difficulty,
      time_limit: Number(timeLimit),
      memory_limit: Number(memoryLimit),
      status: finalStatus,
      test_cases: testCases.filter((tc) => tc.input.trim())
    };

    try {
      if (isEditing && activeQuestionId) {
        await RoxApiService.updateAdminQuestion(activeQuestionId, payload);
        addToast({
          type: 'success',
          title: 'Question Updated',
          message: `Question '${title}' updated successfully.`
        });
      } else {
        await RoxApiService.createAdminQuestion(payload);
        addToast({
          type: 'success',
          title: 'Question Created',
          message: `Question '${title}' created with status ${finalStatus}.`
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Error saving question.'
      });
    }
  };

  const handleTogglePublish = async (q: Question) => {
    const nextStatus = q.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await RoxApiService.updateAdminQuestion(q.id, { status: nextStatus });
      addToast({
        type: 'info',
        title: 'Status Updated',
        message: `Question '${q.title}' is now ${nextStatus}.`
      });
      fetchQuestions();
    } catch (err: any) {
      addToast({ type: 'error', message: 'Failed to update visibility.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await RoxApiService.deleteAdminQuestion(deleteConfirmId);
      addToast({
        type: 'success',
        title: 'Question Deleted',
        message: 'Question removed from question bank.'
      });
      setDeleteConfirmId(null);
      fetchQuestions();
    } catch (err: any) {
      addToast({ type: 'error', message: 'Failed to delete question.' });
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.language.toLowerCase().includes(search.toLowerCase()) ||
      q.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Problem Bank Repository</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Question Bank Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create, configure test cases, and publish assessment challenges for students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-search-questions"
              name="questionSearch"
              aria-label="Search questions"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500 w-48 sm:w-56"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-medium">
                <th className="py-3 px-4">Question</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submissions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{q.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{q.id}</p>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                    {q.language}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.difficulty === 'EASY'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : q.difficulty === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {q.created_by_name || 'System Administrator'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        q.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {q.submissions_count ?? 0}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePublish(q)}
                        title={q.status === 'PUBLISHED' ? 'Unpublish Question' : 'Publish Question'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                      >
                        {q.status === 'PUBLISHED' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        title="Edit Question"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(q.id)}
                        title="Delete Question"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Question?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to permanently delete question <strong className="text-slate-700 dark:text-slate-300">{deleteConfirmId}</strong>? This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Question Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? `Edit Question (${activeQuestionId})` : 'Create New Assessment Question'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Title & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="q-title" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Question Title *
                  </label>
                  <input
                    id="q-title"
                    name="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Find Maximum Element"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="q-language" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Programming Language
                  </label>
                  <select
                    id="q-language"
                    name="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden"
                  >
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </div>
              </div>

              {/* Difficulty & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="q-difficulty" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    id="q-difficulty"
                    name="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="q-time-limit" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Limit (ms)
                  </label>
                  <input
                    id="q-time-limit"
                    name="timeLimit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="q-memory-limit" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Memory Limit (MB)
                  </label>
                  <input
                    id="q-memory-limit"
                    name="memoryLimit"
                    type="number"
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Problem Statement */}
              <div>
                <label htmlFor="q-description" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Problem Statement *
                </label>
                <textarea
                  id="q-description"
                  name="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Given an array of integers, find the maximum element..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden focus:border-indigo-500 font-sans"
                />
              </div>

              {/* Input & Output Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="q-input-format" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Input Format
                  </label>
                  <input
                    id="q-input-format"
                    name="inputFormat"
                    type="text"
                    value={inputFormat}
                    onChange={(e) => setInputFormat(e.target.value)}
                    placeholder="e.g., Line 1: N, Line 2: array items"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="q-output-format" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Output Format
                  </label>
                  <input
                    id="q-output-format"
                    name="outputFormat"
                    type="text"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    placeholder="e.g., Single maximum integer value"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Constraints */}
              <div>
                <label htmlFor="q-constraints" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Constraints (one per line)
                </label>
                <textarea
                  id="q-constraints"
                  name="constraints"
                  rows={2}
                  value={constraintsText}
                  onChange={(e) => setConstraintsText(e.target.value)}
                  placeholder="1 <= nums.length <= 10^5&#10;-10^9 <= nums[i] <= 10^9"
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                />
              </div>

              {/* Test Cases Setup */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Execution Test Cases
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTestCases([...testCases, { input: '', expected_output: '', is_sample: false }])
                    }
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    + Add Test Case
                  </button>
                </div>

                <div className="space-y-2">
                  {testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-5">
                        <label htmlFor={`tc-input-${idx}`} className="sr-only">Test Case {idx + 1} Input</label>
                        <input
                          id={`tc-input-${idx}`}
                          name={`tc_input_${idx}`}
                          aria-label={`Test Case ${idx + 1} Input`}
                          type="text"
                          value={tc.input}
                          onChange={(e) => {
                            const updated = [...testCases];
                            updated[idx].input = e.target.value;
                            setTestCases(updated);
                          }}
                          placeholder="Input"
                          className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label htmlFor={`tc-output-${idx}`} className="sr-only">Test Case {idx + 1} Output</label>
                        <input
                          id={`tc-output-${idx}`}
                          name={`tc_output_${idx}`}
                          aria-label={`Test Case ${idx + 1} Expected Output`}
                          type="text"
                          value={tc.expected_output || ''}
                          onChange={(e) => {
                            const updated = [...testCases];
                            updated[idx].expected_output = e.target.value;
                            setTestCases(updated);
                          }}
                          placeholder="Expected Output"
                          className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id={`sample-${idx}`}
                          name={`sample_${idx}`}
                          checked={tc.is_sample}
                          onChange={(e) => {
                            const updated = [...testCases];
                            updated[idx].is_sample = e.target.checked;
                            setTestCases(updated);
                          }}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <label htmlFor={`sample-${idx}`} className="text-[10px] text-slate-500">
                          Sample
                        </label>
                      </div>
                      <div className="sm:col-span-1 text-right">
                        {testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuestion('DRAFT')}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuestion('PUBLISHED')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Publish Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminQuestionsPage;
