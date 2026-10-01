import React, { useState } from 'react';

interface HistogramBin {
  range: string;
  count: number;
  percentage: number;
}

interface HistogramChartProps {
  data: HistogramBin[];
  height?: number;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({ data, height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxCount = Math.max(...data.map((d) => d.count), 10);
  const width = 500;
  const padding = { top: 20, right: 20, bottom: 40, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / data.length - 12;

  const getBarColor = (range: string, isHovered: boolean) => {
    if (range.includes('81%') || range.includes('61%')) {
      return isHovered ? '#e11d48' : '#f43f5e';
    }
    if (range.includes('41%')) {
      return isHovered ? '#d97706' : '#f59e0b';
    }
    return isHovered ? '#4f46e5' : '#6366f1';
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between text-xs mb-2 text-slate-500 dark:text-slate-400">
        <span>Submission Count Distribution by Similarity Score</span>
        <span className="font-mono text-[11px]">N = {data.reduce((a, b) => a + b.count, 0)}</span>
      </div>

      <div className="relative w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Horizontal Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = padding.top + chartHeight * ratio;
            const val = Math.round(maxCount * (1 - ratio));
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Histogram Bars */}
          {data.map((bin, idx) => {
            const x = padding.left + idx * (barWidth + 12) + 6;
            const barHeight = (bin.count / maxCount) * chartHeight;
            const y = padding.top + chartHeight - barHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Rect Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill={getBarColor(bin.range, isHovered)}
                  className="transition-all duration-150"
                />

                {/* Bar Value Count above bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-600 dark:fill-slate-300 font-mono font-bold"
                >
                  {bin.count}
                </text>

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${isHovered ? 'fill-indigo-600 dark:fill-indigo-400 font-bold' : 'fill-slate-500'}`}
                >
                  {bin.range}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && (
          <div className="text-center text-xs text-slate-500 mt-1">
            Range <strong>{data[hoveredIdx].range}</strong> represents{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">
              {data[hoveredIdx].percentage}%
            </strong>{' '}
            of total submissions.
          </div>
        )}
      </div>
    </div>
  );
};
