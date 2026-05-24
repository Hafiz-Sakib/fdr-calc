import React from 'react';

/**
 * ProgressBar
 * For Auto-Renewed: shows a two-part bar:
 *   - left segment (blue): progress within the NEW (current renewal) cycle
 *   - the percent shown = current cycle's elapsed %
 * For Running: plain green bar
 * For Not Started: amber bar
 *
 * Props:
 *   percent      — current cycle elapsed percent (for all statuses)
 *   status       — 'Running' | 'Auto-Renewed' | 'Not Started'
 *   renewedPercent — same as percent for Auto-Renewed (passed explicitly for clarity)
 */
export default function ProgressBar({ percent, status, renewedPercent }) {
  if (status === 'Auto-Renewed') {
    // Two-label display: new cycle percent
    const pct = Math.round(renewedPercent ?? percent);
    return (
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden flex">
          {/* New cycle progress (blue) */}
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(1, pct)}%` }}
          />
        </div>
        <span className="text-[10px] text-blue-400 tabular-nums w-8 text-right font-semibold">
          {pct}%
        </span>
      </div>
    );
  }

  const colorMap = {
    'Running':     'bg-emerald-500',
    'Not Started': 'bg-amber-500',
  };
  const color = colorMap[status] || 'bg-blue-500';
  const pct = Math.round(percent);

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${Math.max(1, pct)}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-500 tabular-nums w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}
