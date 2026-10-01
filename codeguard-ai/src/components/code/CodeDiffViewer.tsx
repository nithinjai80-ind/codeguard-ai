import React, { useState } from 'react';
import { MonacoCodeViewer } from './MonacoCodeViewer';
import { Badge } from '../common/Badge';
import { CodeRegion, Transformation } from '../../api/types';
import { Split, Sparkles, RefreshCw, GitCommit } from 'lucide-react';

interface CodeDiffViewerProps {
  studentAName: string;
  studentBName: string;
  studentACode: string;
  studentBCode: string;
  studentAFileName?: string;
  studentBFileName?: string;
  assignmentTitle: string;
  transformations: Transformation[];
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({
  studentAName,
  studentBName,
  studentACode,
  studentBCode,
  studentAFileName = 'BinarySearchSolution.java',
  studentBFileName = 'BinarySearchImplementation.java',
  assignmentTitle,
  transformations
}) => {
  const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(0);

  // Defined matching regions for Student A and Student B
  const regionsA: CodeRegion[] = [
    {
      startLine: 18,
      endLine: 23,
      description: 'Loop accumulator and invariant check (total += arr[i])',
      type: 'VARIABLE_RENAMING'
    },
    {
      startLine: 24,
      endLine: 35,
      description: 'Core binary search while-loop logic & pointer advancement',
      type: 'STRUCTURAL_EQUIVALENCE'
    },
    {
      startLine: 38,
      endLine: 43,
      description: 'Standard test input instantiation array',
      type: 'EXPRESSION_TRANSFORMATION'
    }
  ];

  const regionsB: CodeRegion[] = [
    {
      startLine: 18,
      endLine: 23,
      description: 'Loop accumulator and invariant check (sum = sum + values[j])',
      type: 'VARIABLE_RENAMING'
    },
    {
      startLine: 24,
      endLine: 35,
      description: 'Core binary search while-loop logic & pointer advancement',
      type: 'STRUCTURAL_EQUIVALENCE'
    },
    {
      startLine: 38,
      endLine: 43,
      description: 'Matching test input array dataset',
      type: 'EXPRESSION_TRANSFORMATION'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Subheader Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Synchronized Multi-Region Code Diff
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing normalized AST & control-flow structures for {assignmentTitle}
            </p>
          </div>
        </div>

        {/* Region Quick Selectors */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Flagged Blocks:</span>
          {regionsA.map((r, idx) => (
            <button
              key={idx}
              onClick={() => setActiveRegionIndex(activeRegionIndex === idx ? null : idx)}
              className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium transition-all ${
                activeRegionIndex === idx
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Region #{idx + 1}
            </button>
          ))}
          <button
            onClick={() => setActiveRegionIndex(null)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Side-by-side Monaco Viewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side: Student A */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Student A: {studentAName}
              </span>
            </div>
            <Badge variant="primary" size="sm">
              Primary Reference
            </Badge>
          </div>
          <MonacoCodeViewer
            code={studentACode}
            fileName={studentAFileName}
            language="Java"
            highlightRegions={regionsA}
            activeRegionIndex={activeRegionIndex}
            onRegionClick={(idx) => setActiveRegionIndex(idx)}
            maxHeight="520px"
          />
        </div>

        {/* Right Side: Student B */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Student B: {studentBName}
              </span>
            </div>
            <Badge variant="danger" size="sm" dot>
              Review Flagged (+4m)
            </Badge>
          </div>
          <MonacoCodeViewer
            code={studentBCode}
            fileName={studentBFileName}
            language="Java"
            highlightRegions={regionsB}
            activeRegionIndex={activeRegionIndex}
            onRegionClick={(idx) => setActiveRegionIndex(idx)}
            maxHeight="520px"
          />
        </div>
      </div>

      {/* Detected Transformations Section */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Detected Transformations
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated equivalence detection mapping syntactic variations to canonical semantics
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            4 Transformations Verified
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {transformations.map((trans) => {
            const getIcon = () => {
              switch (trans.type) {
                case 'VARIABLE_RENAMING':
                  return <RefreshCw className="w-4 h-4 text-indigo-500" />;
                case 'EXPRESSION_TRANSFORMATION':
                  return <GitCommit className="w-4 h-4 text-amber-500" />;
                case 'CONTROL_FLOW':
                  return <Split className="w-4 h-4 text-rose-500" />;
                default:
                  return <Sparkles className="w-4 h-4 text-blue-500" />;
              }
            };

            return (
              <div
                key={trans.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-indigo-400/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getIcon()}
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {trans.title}
                    </span>
                  </div>

                  {/* Visual Transformation Mapping */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono mb-2.5">
                    <div className="text-slate-600 dark:text-slate-400 line-through decoration-rose-400/60">
                      {trans.detailA}
                    </div>
                    <div className="text-center text-[10px] text-indigo-500 font-bold my-0.5">
                      ↓ mapped to
                    </div>
                    <div className="text-slate-900 dark:text-emerald-400 font-semibold">
                      {trans.detailB}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {trans.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
