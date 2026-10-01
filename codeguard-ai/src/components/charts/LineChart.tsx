import React, { useState } from 'react';

interface DataPoint {
  label: string; // e.g. "Sep 24", "Sep 25"
  cases: number; // flagged similarity cases
  reviewed: number; // tutor reviews completed
}

interface LineChartProps {
  data?: DataPoint[];
  height?: number;
}

const DEFAULT_DATA: DataPoint[] = [
  { label: 'Sep 24', cases: 8, reviewed: 6 },
  { label: 'Sep 25', cases: 12, reviewed: 9 },
  { label: 'Sep 26', cases: 7, reviewed: 7 },
  { label: 'Sep 27', cases: 15, reviewed: 11 },
  { label: 'Sep 28', cases: 19, reviewed: 14 },
  { label: 'Sep 29', cases: 24, reviewed: 18 },
  { label: 'Sep 30', cases: 27, reviewed: 21 }
];

export const LineChart: React.FC<LineChartProps> = ({ data = DEFAULT_DATA, height = 240 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const padding = { top: 20, right: 20, bottom: 35, left: 40 };
  const width = 600; // SVG viewBox coordinate width

  const maxVal = Math.max(...data.map((d) => Math.max(d.cases, d.reviewed)), 30);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - (val / maxVal) * chartHeight;

  // Build SVG path strings
  const casesPoints = data.map((d, i) => `${getX(i)},${getY(d.cases)}`).join(' ');
  const reviewedPoints = data.map((d, i) => `${getX(i)},${getY(d.reviewed)}`).join(' ');

  const casesArea = `${getX(0)},${padding.top + chartHeight} ${casesPoints} ${getX(data.length - 1)},${padding.top + chartHeight}`;

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          Cases Monitored vs Tutor Resolutions
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Similarity Cases</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-indigo-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Tutor Reviewed</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="casesAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding.top + chartHeight * ratio;
            const val = Math.round(maxVal * (1 - ratio));
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

          {/* Area fill for cases */}
          <polygon points={casesArea} fill="url(#casesAreaGrad)" />

          {/* Cases Polyline */}
          <polyline
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={casesPoints}
          />

          {/* Reviewed Polyline */}
          <polyline
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="4 2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={reviewedPoints}
          />

          {/* Points & Interactive Tooltip triggers */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cyCases = getY(d.cases);
            const cyReviewed = getY(d.reviewed);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Vertical guide line on hover */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padding.top}
                    x2={cx}
                    y2={padding.top + chartHeight}
                    className="stroke-indigo-400/50"
                    strokeWidth="1.5"
                  />
                )}

                {/* X-axis labels */}
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[11px] font-medium ${isHovered ? 'fill-indigo-600 dark:fill-indigo-400 font-bold' : 'fill-slate-500 dark:fill-slate-400'}`}
                >
                  {d.label}
                </text>

                {/* Data point circle: cases */}
                <circle
                  cx={cx}
                  cy={cyCases}
                  r={isHovered ? 5.5 : 3.5}
                  className="fill-rose-500 stroke-white dark:stroke-slate-900 transition-all duration-150"
                  strokeWidth="2"
                />

                {/* Data point circle: reviewed */}
                <circle
                  cx={cx}
                  cy={cyReviewed}
                  r={isHovered ? 5 : 3}
                  className="fill-indigo-500 stroke-white dark:stroke-slate-900 transition-all duration-150"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 bg-slate-900/90 text-white text-xs rounded-lg py-1.5 px-3 pointer-events-none shadow-lg border border-slate-700 backdrop-blur-xs flex items-center gap-3 transform -translate-x-1/2 transition-all duration-75"
            style={{ left: `${(getX(hoveredIdx) / width) * 100}%` }}
          >
            <div>
              <span className="text-slate-400">{data[hoveredIdx].label}:</span>{' '}
              <strong className="text-rose-400">{data[hoveredIdx].cases} cases</strong>
            </div>
            <div className="border-l border-slate-700 pl-2">
              <strong className="text-indigo-400">{data[hoveredIdx].reviewed} reviewed</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
