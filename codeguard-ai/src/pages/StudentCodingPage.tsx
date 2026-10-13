import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { RoxApiService } from '../api/apiService';
import { Question, CodeExecutionResult, CodingEventType } from '../api/types';
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
  AlertCircle,
  Copy,
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  ChevronRight,
  GripVertical,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Per-language default function stubs (shown when a question has no signature)
// ---------------------------------------------------------------------------
const FALLBACK_STUBS: Record<string, string> = {
  Java: `public static int solution(int[] arr, int target) {
    // TODO: implement your solution here
    return -1;
}`,
  Python: `def solution(arr, target):
    # TODO: implement your solution here
    pass`,
  'C++': `int solution(vector<int>& arr, int target) {
    // TODO: implement your solution here
    return -1;
}`,
  JavaScript: `function solution(arr, target) {
    // TODO: implement your solution here
    return -1;
}`,
};

/** Build the initial stub for the editor given a question + language. */
function buildEditorStub(
  question: Question | null,
  language: string,
): string {
  const sigs: Record<string, string> | undefined = (question as any)?.function_signatures;
  const sig = sigs?.[language];
  if (!sig) return FALLBACK_STUBS[language] ?? '// Write your solution here\n';

  if (language === 'Python') {
    return `${sig}\n    # TODO: implement your solution here\n    pass`;
  }
  // Java / C++ / JavaScript — add closing brace
  return `${sig}\n    // TODO: implement your solution here\n    \n}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const StudentCodingPage: React.FC = () => {
  const { selectedQuestionId, setCurrentView, addToast } = useApp();
  const { user } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [language, setLanguage] = useState<'Java' | 'Python' | 'C++' | 'JavaScript'>('Java');
  // Student writes ONLY the function body — no class, no main
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execResult, setExecResult] = useState<CodeExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'testcases' | 'terminal'>('testcases');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [copied, setCopied] = useState(false);
  // Bottom output drawer sizing: 'minimized' gives student maximum coding/scrolling space
  const [outputPanelState, setOutputPanelState] = useState<'minimized' | 'normal' | 'maximized'>('normal');

  // Split pane sizing for Question Bar (smooth decrease left-to-right or right-to-left)
  const [questionPanelWidth, setQuestionPanelWidth] = useState<number>(40); // 40% default width
  const [isQuestionCollapsed, setIsQuestionCollapsed] = useState<boolean>(false);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Smooth mouse drag handler for resizing question panel left-to-right or right-to-left
  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const containerRect = splitContainerRef.current.getBoundingClientRect();
      const newWidthPx = e.clientX - containerRect.left;
      const newWidthPct = Math.max(18, Math.min(75, (newWidthPx / containerRect.width) * 100));
      setQuestionPanelWidth(newWidthPct);
    };

    const handleMouseUp = () => {
      setIsDraggingSplitter(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplitter]);

  // Coding Activity Monitoring — session tracking
  const sessionIdRef = useRef<string>(`SESSION-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  // Load question from backend
  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const q = await RoxApiService.getStudentQuestion(selectedQuestionId);
        setQuestion(q);
        const lang = (q.language && ['Java', 'Python', 'C++', 'JavaScript'].includes(q.language)
          ? q.language
          : 'Java') as 'Java' | 'Python' | 'C++' | 'JavaScript';
        setLanguage(lang);
        // Seed the editor with the function stub for the default language
        setCode(buildEditorStub(q, lang));
        setExecResult(null);
      } catch (err) {
        console.error('Failed to load question:', err);
      }
    };
    loadQuestion();
  }, [selectedQuestionId]);

  // -------------------------------------------------------------------------
  // Coding Activity Monitor — keyboard shortcut logging (fire-and-forget)
  // -------------------------------------------------------------------------
  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      let eventType: CodingEventType | null = null;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl) {
        switch (e.key.toLowerCase()) {
          case 'c': eventType = 'COPY'; break;
          case 'v': eventType = 'PASTE'; break;
          case 'x': eventType = 'CUT'; break;
          case 'a': eventType = 'SELECT_ALL'; break;
          case 'z': eventType = 'UNDO'; break;
          case 'y': eventType = 'REDO'; break;
        }
      } else if (e.key === 'Meta' || e.key === 'OS' || e.key === 'Win') {
        eventType = 'WINDOWS_KEY';
      }
      if (eventType) {
        RoxApiService.logCodingActivity({ questionId: selectedQuestionId, sessionId: sessionIdRef.current, eventType });
      }
    },
    [selectedQuestionId],
  );

  // -------------------------------------------------------------------------
  // Language change — load new function stub from the backend template endpoint
  // -------------------------------------------------------------------------
  const handleLanguageChange = async (newLang: 'Java' | 'Python' | 'C++' | 'JavaScript') => {
    setLanguage(newLang);
    setExecResult(null);
    try {
      const res = await RoxApiService.getCodeTemplate(newLang, selectedQuestionId);
      if (res?.template) {
        setCode(res.template);
      } else {
        setCode(buildEditorStub(question, newLang));
      }
    } catch {
      setCode(buildEditorStub(question, newLang));
    }
  };

  // -------------------------------------------------------------------------
  // Reset editor to original stub for current language
  // -------------------------------------------------------------------------
  const handleResetCode = async () => {
    try {
      const res = await RoxApiService.getCodeTemplate(language, selectedQuestionId);
      if (res?.template) {
        setCode(res.template);
      } else {
        setCode(buildEditorStub(question, language));
      }
    } catch {
      setCode(buildEditorStub(question, language));
    }
    setExecResult(null);
  };

  // -------------------------------------------------------------------------
  // Run code — send student function body; backend wraps + runs all test cases
  // -------------------------------------------------------------------------
  const handleRunCode = async () => {
    if (!code.trim()) {
      addToast({ type: 'warning', message: 'Please write some code first.' });
      return;
    }

    setIsRunning(true);
    setExecResult(null);
    // If output panel was minimized, restore to normal so user sees execution results
    if (outputPanelState === 'minimized') {
      setOutputPanelState('normal');
    }
    try {
      const result = await RoxApiService.runCode({
        source_code: code,
        language,
        question_id: selectedQuestionId,
        // Don't send test_cases from the frontend — let the backend load ALL
        // (sample + hidden) from the DB via question_id
      });
      setExecResult(result);
      setActiveTab('testcases');
      setSelectedTestCaseIndex(0);

      if (result.passed === result.total && result.total > 0) {
        addToast({ type: 'success', title: 'All Tests Passed', message: `${result.passed} / ${result.total} test cases passed.` });
      } else {
        addToast({ type: 'warning', title: 'Partial Tests Passed', message: `${result.passed} / ${result.total} test cases passed.` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Execution Failed', message: err.message || 'Unable to execute code in sandbox.' });
    } finally {
      setIsRunning(false);
    }
  };

  // -------------------------------------------------------------------------
  // Submit code
  // -------------------------------------------------------------------------
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      addToast({ type: 'warning', message: 'Please write some code first.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const testResults = execResult
        ? { passed: execResult.passed, total: execResult.total }
        : { passed: 0, total: 0 };

      await RoxApiService.submitCode({
        question_id: selectedQuestionId,
        source_code: code,
        language,
        test_results: testResults,
      });

      setShowSubmitModal(true);
      addToast({ type: 'success', title: 'Submission Received', message: 'Your teacher will review it.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Submission Failed', message: err.message || 'Error saving submission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------
  const functionSignatures: Record<string, string> = (question as any)?.function_signatures ?? {};
  const currentSignature = functionSignatures[language] ?? '';

  // Line numbers for the editor (relative to the student code area only)
  const lineCount = Math.max(code.split('\n').length, 14);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const fileExt = language === 'Java' ? 'java' : language === 'Python' ? 'py' : language === 'C++' ? 'cpp' : 'js';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -mt-2 -mx-2 sm:-mx-4 lg:-mx-6 animate-in fade-in duration-200">

      {/* ── Top Action Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('student-questions')}
            title="Back to Questions"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsQuestionCollapsed((prev) => !prev)}
            title={
              isQuestionCollapsed
                ? 'Expand Question Bar (Left to Right)'
                : 'Decrease / Collapse Question Bar (Right to Left)'
            }
            className={`flex items-center gap-1 p-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isQuestionCollapsed
                ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isQuestionCollapsed ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Show Question</span>
              </>
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hide Question</span>
              </>
            )}
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

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            id="code-language-select"
            name="language"
            aria-label="Select Programming Language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            {(question as any)?.allowed_languages?.includes('Java') !== false && <option value="Java">Java 21</option>}
            {(question as any)?.allowed_languages?.includes('Python') !== false && <option value="Python">Python 3.11</option>}
            {(question as any)?.allowed_languages?.includes('C++') !== false && <option value="C++">C++ 20</option>}
            {(question as any)?.allowed_languages?.includes('JavaScript') !== false && <option value="JavaScript">JavaScript (ES2022)</option>}
          </select>

          {/* Run Code */}
          <button
            id="run-code-btn"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          {/* Submit Code */}
          <button
            id="submit-code-btn"
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Code'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Split View (Smooth Resizing Left-to-Right / Right-to-Left) ── */}
      <div
        ref={splitContainerRef}
        className={`flex-1 flex flex-row min-h-0 overflow-hidden relative ${
          isDraggingSplitter ? 'select-none cursor-col-resize' : ''
        }`}
      >
        {/* Collapsed Rail (Click to expand Left-to-Right) */}
        {isQuestionCollapsed && (
          <button
            onClick={() => setIsQuestionCollapsed(false)}
            title="Expand Problem Statement (Left to Right)"
            className="w-9 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer z-10 shrink-0 select-none group"
          >
            <div className="p-1 rounded-md group-hover:bg-indigo-600/20 text-indigo-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
            <span className="[writing-mode:vertical-rl] text-[11px] font-bold tracking-wider text-slate-300 uppercase select-none">
              Problem Statement
            </span>
          </button>
        )}

        {/* Left — Problem Statement Bar (Smooth size decrease/increase) */}
        <div
          style={{
            width: isQuestionCollapsed ? '0px' : `${questionPanelWidth}%`,
            minWidth: isQuestionCollapsed ? '0px' : '260px',
            maxWidth: '75%',
            opacity: isQuestionCollapsed ? 0 : 1,
            display: isQuestionCollapsed ? 'none' : 'flex',
          }}
          className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col min-h-0 overflow-hidden shrink-0 ${
            isDraggingSplitter ? '' : 'transition-[width,opacity] duration-300 ease-in-out'
          }`}
        >
          {/* Question Bar Top Controls: Smooth Decrease / Increase buttons */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 bg-slate-50/80 dark:bg-slate-900/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Problem Statement</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">Width:</span>
              <button
                onClick={() => {
                  setQuestionPanelWidth(25);
                  setIsQuestionCollapsed(false);
                }}
                title="Decrease size to 25% (Right-to-Left)"
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  !isQuestionCollapsed && questionPanelWidth <= 28
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                25%
              </button>
              <button
                onClick={() => {
                  setQuestionPanelWidth(40);
                  setIsQuestionCollapsed(false);
                }}
                title="Default size 40%"
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  !isQuestionCollapsed && questionPanelWidth > 28 && questionPanelWidth < 48
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                40%
              </button>
              <button
                onClick={() => {
                  setQuestionPanelWidth(55);
                  setIsQuestionCollapsed(false);
                }}
                title="Increase size to 55% (Left-to-Right)"
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  !isQuestionCollapsed && questionPanelWidth >= 48
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                55%
              </button>
              <button
                onClick={() => setIsQuestionCollapsed(true)}
                title="Collapse Question Bar (Right to Left)"
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Problem Statement Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 scroll-smooth">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {question?.title || 'Binary Search'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Time Limit: {question?.time_limit ? `${question.time_limit / 1000}s` : '2s'} • Memory: {question?.memory_limit || 256}MB
              </p>
            </div>

            <div className="prose dark:prose-invert text-xs max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Problem Statement</h4>
              <p className="whitespace-pre-line">{question?.description || 'Implement the algorithm.'}</p>

              {question?.input_format && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">Input Format</h4>
                  <p className="whitespace-pre-line p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px]">
                    {question.input_format}
                  </p>
                </div>
              )}

              {question?.output_format && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">Output Format</h4>
                  <p className="whitespace-pre-line p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px]">
                    {question.output_format}
                  </p>
                </div>
              )}

              {question?.constraints && question.constraints.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1.5">Constraints</h4>
                  <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {question?.examples && question.examples.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">Examples</h4>
                  <div className="space-y-3">
                    {question.examples.map((ex, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono space-y-1.5">
                        <p className="font-bold text-indigo-600 dark:text-indigo-400">Example {i + 1}:</p>
                        <p><span className="text-slate-400">Input:</span> {ex.input}</p>
                        <p><span className="text-slate-400">Output:</span> {ex.output}</p>
                        {ex.explanation && (
                          <p className="text-slate-500 italic font-sans text-[10px]">Explanation: {ex.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Resizable Drag Handle / Splitter (Left-to-Right or Right-to-Left Drag) ── */}
        {!isQuestionCollapsed && (
          <div
            onMouseDown={() => setIsDraggingSplitter(true)}
            onDoubleClick={() => setIsQuestionCollapsed(true)}
            title="Drag left/right to resize Question Bar (double-click to collapse)"
            className={`w-2 hover:w-2.5 z-20 cursor-col-resize flex items-center justify-center group hover:bg-indigo-500/20 active:bg-indigo-500/40 transition-all shrink-0 select-none relative ${
              isDraggingSplitter ? 'bg-indigo-500/30 w-2.5' : 'bg-transparent'
            }`}
          >
            <div className="w-0.5 h-8 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-500 group-hover:h-12 transition-all flex items-center justify-center">
              <GripVertical className="w-2.5 h-2.5 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        )}

        {/* Right — Code Editor & Execution Results */}
        <div className="flex-1 flex flex-col bg-slate-950 min-h-0 overflow-hidden">

          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[11px] text-slate-300">Solution.{fileExt}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setOutputPanelState((prev) => (prev === 'minimized' ? 'normal' : 'minimized'))}
                title={outputPanelState === 'minimized' ? 'Show Output Drawer' : 'Minimize Output Drawer (maximize coding space)'}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/70 transition-all cursor-pointer"
              >
                {outputPanelState === 'minimized' ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Show Output</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    <span>Minimize Output</span>
                  </>
                )}
              </button>
              <button onClick={handleCopyCode} className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button onClick={handleResetCode} title="Reset to starter stub" className="hover:text-slate-200 transition-colors cursor-pointer">
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* ── Locked Signature Banner ───────────────────────────────── */}
          {currentSignature && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border-b border-slate-800/60 shrink-0">
              <Lock className="w-3 h-3 text-slate-500 shrink-0" />
              <code className="font-mono text-[11px] text-indigo-300 truncate">{currentSignature}</code>
              <span className="ml-auto text-[10px] text-slate-600 whitespace-nowrap">function signature (read-only)</span>
            </div>
          )}

          {/* ── Monaco-style Editor Surface ─────────────────────────── */}
          <div className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs">
            {/* Gutter / Line Numbers */}
            <div className="w-12 py-3 bg-slate-950 text-slate-600 select-none text-right pr-3 font-mono text-xs border-r border-slate-900 shrink-0 overflow-hidden leading-6">
              {lineNumbers.map((n) => <div key={n}>{n}</div>)}
            </div>

            {/* Textarea — student writes ONLY the function body */}
            <textarea
              id="code-editor-input"
              name="sourceCode"
              aria-label="Source Code Editor — write only the function body"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-xs leading-6 resize-none focus:outline-hidden selection:bg-indigo-500/30 overflow-y-auto whitespace-pre font-medium"
              placeholder={
                language === 'Python'
                  ? '    # Write your function body here...'
                  : '    // Write your function body here...'
              }
            />
          </div>

          {/* ── Info bar: student writes function only ─────────────── */}
          <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-500 shrink-0">
            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
            <span>
              Write <strong className="text-slate-300">only the function body</strong>. The sandbox automatically wraps your code in a full class and runs all test cases.
            </span>
          </div>

          {/* ── Bottom Drawer: Execution Results / Test Cases ─────── */}
          <div
            className={`border-t border-slate-800 bg-slate-900/95 flex flex-col shrink-0 transition-all duration-200 ease-in-out ${
              outputPanelState === 'minimized'
                ? 'h-10'
                : outputPanelState === 'maximized'
                ? 'h-[460px] max-h-[80%]'
                : 'h-64'
            }`}
          >
            {/* Drawer Tabs & Minimize/Maximize Header */}
            <div
              className={`flex items-center justify-between px-4 py-2 text-xs select-none ${
                outputPanelState === 'minimized' ? 'bg-slate-900/90' : 'border-b border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveTab('testcases');
                    if (outputPanelState === 'minimized') setOutputPanelState('normal');
                  }}
                  className={`font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'testcases' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Test Cases</span>
                  {execResult && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {execResult.passed}/{execResult.total}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('terminal');
                    if (outputPanelState === 'minimized') setOutputPanelState('normal');
                  }}
                  className={`font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'terminal' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Execution Output</span>
                </button>

                {outputPanelState === 'minimized' && (
                  <span className="text-[10px] text-slate-500 hidden sm:inline italic">
                    (Output minimized — click to expand)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                {execResult && (
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {execResult.execution_time_ms}ms
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        execResult.passed === execResult.total && execResult.total > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {execResult.passed === execResult.total && execResult.total > 0 ? 'Accepted' : 'Some Tests Failed'}
                    </span>
                  </div>
                )}

                {/* Sizing Controls: Minimize, Maximize, Restore */}
                <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                  {outputPanelState === 'minimized' ? (
                    <button
                      onClick={() => setOutputPanelState('normal')}
                      title="Expand output panel"
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium text-[10px] transition-colors cursor-pointer"
                    >
                      <ChevronUp className="w-3 h-3" />
                      <span>Expand</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setOutputPanelState('minimized')}
                      title="Minimize output panel (scroll and write code freely)"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Minimize</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setOutputPanelState(outputPanelState === 'maximized' ? 'normal' : 'maximized')
                    }
                    title={
                      outputPanelState === 'maximized'
                        ? 'Restore standard output size'
                        : 'Maximize output size'
                    }
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {outputPanelState === 'maximized' ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Body — only rendered when not minimized for optimal scroll performance */}
            {outputPanelState !== 'minimized' && (
              <div className="flex-1 p-4 overflow-y-auto text-xs font-mono scroll-smooth pr-2">
              {activeTab === 'testcases' ? (
                <div>
                  {!execResult ? (
                    <div className="text-center py-6 text-slate-500">
                      Click <span className="text-slate-300 font-bold">"Run Code"</span> to execute against all test cases.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Status Summary */}
                      <p className="font-semibold text-slate-300 text-sm">
                        {execResult.summary || `${execResult.passed} / ${execResult.total} test cases passed.`}
                      </p>

                      {/* Test Case Pills */}
                      <div className="flex items-center flex-wrap gap-2">
                        {execResult.test_results.map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTestCaseIndex(idx)}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${selectedTestCaseIndex === idx ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-950 text-slate-400 hover:text-slate-200'}`}
                          >
                            {tc.passed
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                            <span>
                              Case {tc.test_case}
                              {!(tc as any).is_sample && (
                                <span className="ml-1 text-[9px] text-slate-500">(hidden)</span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Selected Test Case Detail */}
                      {execResult.test_results[selectedTestCaseIndex] && (() => {
                        const tc = execResult.test_results[selectedTestCaseIndex];
                        const isHidden = !(tc as any).is_sample;
                        return (
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
                            {isHidden ? (
                              /* Hidden test case: show only verdict */
                              <div className="flex items-center gap-2 text-slate-400">
                                <Lock className="w-3 h-3 text-slate-600" />
                                <span>This is a hidden test case. Input and expected output are not shown.</span>
                                <span className={`ml-auto font-bold ${tc.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {tc.passed ? '✓ Correct' : '✗ Incorrect'}
                                </span>
                              </div>
                            ) : (
                              /* Sample test case: show full detail */
                              <>
                                <div>
                                  <span className="text-slate-500 block">Input:</span>
                                  <pre className="text-slate-200 whitespace-pre-wrap">{tc.input}</pre>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Expected Output:</span>
                                  <span className="text-emerald-400">{tc.expected_output}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Your Output:</span>
                                  <span className={tc.passed ? 'text-emerald-400' : 'text-rose-400'}>
                                    {tc.actual_output || '(Empty output)'}
                                  </span>
                                </div>
                                {tc.error && (
                                  <div>
                                    <span className="text-slate-500 block">Error:</span>
                                    <pre className="text-rose-400 whitespace-pre-wrap text-[10px]">{tc.error}</pre>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                /* Terminal Tab */
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Process Standard Output (first test case):</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] whitespace-pre-wrap">
                    {execResult?.test_results?.[0]?.actual_output || execResult?.output || '(No console output generated)'}
                  </pre>
                  {execResult?.error && (
                    <pre className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-[11px] whitespace-pre-wrap">
                      {execResult.error}
                    </pre>
                  )}
                  {execResult?.compilation_status && execResult.compilation_status !== 'SUCCESS' && (
                    <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/50 text-amber-300 text-[10px]">
                      Compilation status: {execResult.compilation_status}
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Submission Confirmation Modal ──────────────────────────────── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submission Received</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Your solution for{' '}
              <strong className="text-slate-800 dark:text-slate-200">{question?.title}</strong>{' '}
              has been submitted.
            </p>
            {execResult && (
              <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono">
                {execResult.passed} / {execResult.total} test cases passed before submit
              </div>
            )}
            <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
              Your teacher will review it.
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => { setShowSubmitModal(false); setCurrentView('student-submissions'); }}
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
