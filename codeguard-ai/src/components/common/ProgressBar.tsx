import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'warning' | 'danger' | 'success' | 'auto';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showValue = true,
  size = 'md',
  variant = 'auto',
  className = ''
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const getVariantBg = () => {
    if (variant === 'auto') {
      if (normalizedValue >= 80) return 'bg-rose-500';
      if (normalizedValue >= 65) return 'bg-amber-500';
      if (normalizedValue >= 40) return 'bg-indigo-600';
      return 'bg-emerald-500';
    }
    const map = {
      primary: 'bg-indigo-600',
      warning: 'bg-amber-500',
      danger: 'bg-rose-500',
      success: 'bg-emerald-500',
      auto: 'bg-indigo-600'
    };
    return map[variant];
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-700 dark:text-slate-300">
          {label && <span>{label}</span>}
          {showValue && <span className="font-mono text-slate-500 dark:text-slate-400">{normalizedValue}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getVariantBg()}`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
};
