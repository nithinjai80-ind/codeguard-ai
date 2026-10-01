import React from 'react';

interface CircularProgressProps {
  score: number; // 0 to 100
  size?: number; // px, e.g. 140
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  showPercent = true,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  // Determine stroke color based on academic integrity urgency
  const getStrokeColor = (val: number) => {
    if (val >= 80) return 'stroke-rose-500';
    if (val >= 65) return 'stroke-amber-500';
    if (val >= 40) return 'stroke-indigo-500';
    return 'stroke-emerald-500';
  };

  const getTextColor = (val: number) => {
    if (val >= 80) return 'text-rose-600 dark:text-rose-400';
    if (val >= 65) return 'text-amber-600 dark:text-amber-400';
    if (val >= 40) return 'text-indigo-600 dark:text-indigo-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-800 fill-none"
        />
        {/* Animated Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${getStrokeColor(score)} fill-none transition-all duration-1000 ease-out`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <span className={`font-bold tracking-tight ${getTextColor(score)} ${size > 120 ? 'text-3xl' : 'text-xl'}`}>
          {score}{showPercent && <span className="text-sm font-normal text-slate-500 dark:text-slate-400">%</span>}
        </span>
        {label && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
