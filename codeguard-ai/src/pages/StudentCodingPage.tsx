import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { RoxApiService } from '../api/apiService';
import { Question, CodeExecutionResult } from '../api/types';
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ChevronLeft,
  FileCode2,
  Sparkles,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

const DEFAULT_JAVA_CODE = `public class Solution {
    public static int search(int[] arr, int target) {
        if (arr == null || arr.length == 0) {
            return -1;
        }

        int low = 0;
        int high = arr.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;

            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return -1;
    }

    public static void main(String[] args) {
        // Sample driver
        int[] arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        int target = 23;
        System.out.println(search(arr, target));
    }
}`;

export const StudentCodingPage: React.FC = () => {
  const { selectedQuestionId, setCurrentView, addToast } = useApp();
  const { user } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [language, setLanguage] = useState<'Java' | 'Python' | 'C++' | 'JavaScript'>('Java');
  const [code, setCode] = useState<string>(DEFAULT_JAVA_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execResult, setExecResult] = useState<CodeExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'testcases' | 'terminal'>('testcases');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const q = await RoxApiService.getStudentQuestion(selectedQuestionId);
        setQuestion(q);
        if (q.language && ['Java', 'Python', 'C++', 'JavaScript'].includes(q.language)) {
          setLanguage(q.language as any);
        }
      } catch (err) {
        console.error('Failed to load question:', err);
      }
    };
    loadQuestion();
  }, [selectedQuestionId]);

  const handleLanguageChange = async (newLang: 'Java' | 'Python' | 'C++' | 'JavaScript') => {
    setLanguage(newLang);
    try {
      const res = await RoxApiService.getCodeTemplate(newLang);
      if (res && res.template) {
        setCode(res.template);
      }
    } catch {
      // fallback
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      addToast({ type: 'warning', message: 'Please write some code first.' });
      return;
    }

    setIsRunning(true);
    setExecResult(null);
    try {
      const result = await RoxApiService.runCode({
        source_code: code,
        language,
        question_id: selectedQuestionId,
        test_cases: question?.test_cases || []
      });
      setExecResult(result);
      setActiveTab('testcases');

      if (result.passed === result.total) {
        addToast({
          type: 'success',
          title: 'All Tests Passed',
          message: `${result.passed} / ${result.total} test cases passed successfully.`
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Partial Tests Passed',
          message: `${result.passed} / ${result.total} test cases passed.`
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Execution Failed',
        message: err.message || 'Unable to execute code in sandbox.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      addToast({ type: 'warning', message: 'Please write some code first.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const testResults = execResult
        ? { passed: execResult.passed, total: execResult.total }
        : { passed: 2, total: 3 };

      await RoxApiService.submitCode({
        question_id: selectedQuestionId,
        source_code: code,
        language,
        test_results: testResults
      });

      setShowSubmitModal(true);
      addToast({
        type: 'success',
        title: 'Submission Received',
        message: 'Your teacher will review it.'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.message || 'Error saving submission.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate line numbers for editor
  const lineCount = Math.max(code.split('\n').length, 22);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -mt-2 -mx-2 sm:-mx-4 lg:-mx-6 animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('student-questions')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {question?.title || 'Problem Title'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {question?.difficulty || 'MEDIUM'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="Java">Java 21</option>
            <option value="Python">Python 3.11</option>
            <option value="C++">C++ 20</option>
            <option value="JavaScript">JavaScript (ES2022)</option>
          </select>

          {/* Run Code */}
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          {/* Submit Code */}
          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Code'}</span>
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Column: Problem Statement */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 overflow-y-auto space-y-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {question?.title || 'Binary Search'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Time Limit: {question?.time_limit ? `${question.time_limit / 1000}s` : '2s'} • Memory: {question?.memory_limit || 256}MB
            </p>
          </div>

          <div className="prose dark:prose-invert text-xs max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Problem Statement
            </h4>
            <p className="whitespace-pre-line">{question?.description || 'Implement the algorithm.'}</p>

            {question?.input_format && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                  Input Format
                </h4>
                <p className="whitespace-pre-line p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px]">
                  {question.input_format}
                </p>
              </div>
            )}

            {question?.output_format && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                  Output Format
                </h4>
                <p className="whitespace-pre-line p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px]">
                  {question.output_format}
                </p>
              </div>
            )}

            {question?.constraints && question.constraints.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1.5">
                  Constraints
                </h4>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {question.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {question?.examples && question.examples.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
                  Examples
                </h4>
                <div className="space-y-3">
                  {question.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono space-y-1.5"
                    >
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">Example {i + 1}:</p>
                      <p>
                        <span className="text-slate-400">Input:</span> {ex.input}
                      </p>
                      <p>
                        <span className="text-slate-400">Output:</span> {ex.output}
                      </p>
                      {ex.explanation && (
                        <p className="text-slate-500 italic font-sans text-[10px]">
                          Explanation: {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Results */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 min-h-0 overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[11px] text-slate-300">Solution.{language === 'Java' ? 'java' : language === 'Python' ? 'py' : language === 'C++' ? 'cpp' : 'js'}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleLanguageChange(language)}
                title="Reset Code Template"
                className="hover:text-slate-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Monaco-style Code Editor Surface */}
          <div className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs">
            {/* Gutter / Line Numbers */}
            <div className="w-12 py-3 bg-slate-950 text-slate-600 select-none text-right pr-3 font-mono text-xs border-r border-slate-900 shrink-0 overflow-hidden leading-6">
              {lineNumbers.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>

            {/* Textarea Code Input */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-xs leading-6 resize-none focus:outline-hidden selection:bg-indigo-500/30 overflow-y-auto whitespace-pre font-medium"
              placeholder="// Write your code here..."
            />
          </div>

          {/* Bottom Drawer: Execution Results / Test Cases */}
          <div className="h-64 border-t border-slate-800 bg-slate-900/95 flex flex-col shrink-0">
            {/* Drawer Tabs */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('testcases')}
                  className={`font-semibold transition-colors cursor-pointer ${
                    activeTab === 'testcases' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Cases {execResult && `(${execResult.passed}/${execResult.total} Passed)`}
                </button>
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`font-semibold transition-colors cursor-pointer ${
                    activeTab === 'terminal' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Execution Output
                </button>
              </div>

              {execResult && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {execResult.execution_time_ms}ms
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      execResult.passed === execResult.total
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {execResult.passed === execResult.total ? 'Accepted' : 'Some Tests Failed'}
                  </span>
                </div>
              )}
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-4 overflow-y-auto text-xs font-mono">
              {activeTab === 'testcases' ? (
                <div>
                  {!execResult ? (
                    <div className="text-center py-6 text-slate-500">
                      Click <span className="text-slate-300 font-bold">"Run Code"</span> to execute against sample test cases.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Status Summary */}
                      <p className="font-semibold text-slate-300 text-sm">
                        {execResult.summary || `${execResult.passed} / ${execResult.total} test cases passed.`}
                      </p>

                      {/* Test Cases Pill selector */}
                      <div className="flex items-center gap-2">
                        {execResult.test_results.map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTestCaseIndex(idx)}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                              selectedTestCaseIndex === idx
                                ? 'bg-slate-800 text-white border border-slate-700'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {tc.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                            <span>Case {tc.test_case}</span>
                          </button>
                        ))}
                      </div>

                      {/* Selected Test Case Detail */}
                      {execResult.test_results[selectedTestCaseIndex] && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Input:</span>
                            <span className="text-slate-200">
                              {execResult.test_results[selectedTestCaseIndex].input}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Expected Output:</span>
                            <span className="text-emerald-400">
                              {execResult.test_results[selectedTestCaseIndex].expected_output}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Your Output:</span>
                            <span
                              className={
                                execResult.test_results[selectedTestCaseIndex].passed
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }
                            >
                              {execResult.test_results[selectedTestCaseIndex].actual_output || '(Empty output)'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Process Standard Output:</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] whitespace-pre-wrap">
                    {execResult?.output || '(No console output generated)'}
                  </pre>
                  {execResult?.error && (
                    <pre className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-[11px] whitespace-pre-wrap">
                      {execResult.error}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Submission Received
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Your solution has been submitted for question{' '}
              <strong className="text-slate-800 dark:text-slate-200">{question?.title}</strong>.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
              Your teacher will review it.
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setCurrentView('student-submissions');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-colors"
              >
                View My Submissions
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                Keep Coding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentCodingPage;
