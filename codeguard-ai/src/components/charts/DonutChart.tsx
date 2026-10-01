import React, { useState } from 'react';

interface DonutSlice {
  label: string;
  value: number;
  color: string;
  subtext: string;
}

interface DonutChartProps {
  slices?: DonutSlice[];
  size?: number;
}

const DEFAULT_SLICES: DonutSlice[] = [
  { label: 'Structural', value: 42, color: '#3b82f6', subtext: 'AST & token matches' },
  { label: 'Semantic', value: 28, color: '#6366f1', subtext: 'Vector embeddings' },
  { label: 'Behavioral', value: 18, color: '#f59e0b', subtext: 'Execution trace' },
  { label: 'Timeline', value: 12, color: '#f43f5e', subtext: 'Temporal clusters' }
];

export const DonutChart: React.FC<DonutChartProps> = ({
  slices = DEFAULT_SLICES,
  size = 180
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = slices.reduce((acc, s) => acc + s.value, 0);
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* SVG Donut Circle */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90 select-none">
          {slices.map((slice, idx) => {
            const sliceRatio = slice.value / total;
            const strokeDasharray = `${circumference * sliceRatio} ${circumference * (1 - sliceRatio)}`;
            const strokeDashoffset = -currentAngle * circumference;
            currentAngle += sliceRatio;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                fill="none"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {hoveredIdx !== null ? (
            <>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {slices[hoveredIdx].value}%
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {slices[hoveredIdx].label}
              </span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                100%
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Signals
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-2.5 w-full">
        {slices.map((slice, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                isHovered
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {slice.label}
                  </div>
                  <div className="text-[10px] text-slate-400">{slice.subtext}</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                {slice.value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
