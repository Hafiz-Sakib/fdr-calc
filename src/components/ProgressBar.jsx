import React from 'react';

export default function ProgressBar({ percent, status }) {
  const colorMap = {
    'Running':      'bg-emerald-500',
    'Auto-Renewed': 'bg-blue-500',
    'Not Started':  'bg-amber-500',
  };
  const color = colorMap[status] || 'bg-blue-500';

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${Math.max(1, percent)}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-500 tabular-nums w-8 text-right">
        {Math.round(percent)}%
      </span>
    </div>
  );
}
