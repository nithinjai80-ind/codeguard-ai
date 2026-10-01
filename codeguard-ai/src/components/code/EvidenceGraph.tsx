import React from 'react';
import { ArrowDown, Cpu, Network, Zap, Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface EvidenceGraphProps {
  studentAName: string;
  studentBName: string;
  structuralScore: number;
  semanticScore: number;
  behavioralScore: number;
  timelineScore: number;
  overallScore: number;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({
  studentAName,
  studentBName,
  structuralScore,
  semanticScore,
  behavioralScore,
  timelineScore,
  overallScore
}) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-500" />
            Multi-Dimensional Evidence Graph
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent algorithmic traversal through all independent similarity vectors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Aggregate Review Priority:</span>
          <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
            {overallScore}%
          </span>
        </div>
      </div>

      {/* Vertical Graph Flow */}
      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Node 1: Student A */}
        <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Student A Submission
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {studentAName} • SUB-1042
              </div>
            </div>
          </div>
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-1 rounded-md">
            Source Anchor
          </span>
        </div>

        {/* Down Arrow connector */}
        <div className="my-1.5 flex flex-col items-center text-slate-400">
          <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-700" />
          <ArrowDown className="w-4 h-4 -my-1 text-slate-400" />
        </div>

        {/* Node 2: Structural AST Analysis */}
        <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                AST Structural Similarity
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Normalized parse tree & control-flow isomorphism
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              {structuralScore}%
            </span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="my-1.5 flex flex-col items-center text-slate-400">
          <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-700" />
          <ArrowDown className="w-4 h-4 -my-1 text-slate-400" />
        </div>

        {/* Node 3: Semantic Embeddings */}
        <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Semantic Embeddings Similarity
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                CodeBERT vector distance & programmatic intent congruence
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              {semanticScore}%
            </span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="my-1.5 flex flex-col items-center text-slate-400">
          <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-700" />
          <ArrowDown className="w-4 h-4 -my-1 text-slate-400" />
        </div>

        {/* Node 4: Behavioral Execution */}
        <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Behavioral & Test Vector Match
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Execution trace, edge cases & internal branch coverage
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              {behavioralScore}%
            </span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="my-1.5 flex flex-col items-center text-slate-400">
          <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-700" />
          <ArrowDown className="w-4 h-4 -my-1 text-slate-400" />
        </div>

        {/* Node 5: Timeline Correlation */}
        <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Temporal Correlation & Intervals
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Submitted 4 minutes apart; identical revision frequency
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              {timelineScore}%
            </span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="my-1.5 flex flex-col items-center text-slate-400">
          <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-700" />
          <ArrowDown className="w-4 h-4 -my-1 text-slate-400" />
        </div>

        {/* Node 6: Student B */}
        <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
              B
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Student B Submission
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {studentBName} • SUB-1049
              </div>
            </div>
          </div>
          <span className="text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-2.5 py-1 rounded-md">
            Paired Flag
          </span>
        </div>

        {/* Final Tutor Investigation Principle Banner */}
        <div className="w-full mt-6 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <UserCheck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Human Decision Gate:</strong> Evidence surfaced above enables informed educator review. Final assessment belongs strictly to the department course coordinator.
          </span>
        </div>
      </div>
    </div>
  );
};
