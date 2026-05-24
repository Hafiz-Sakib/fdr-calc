import React from 'react';
import { BarChart3, Calendar } from 'lucide-react';

export default function Header({ today }) {
  const dateStr = today.toLocaleDateString('en-BD', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  return (
    <header className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px]"
           style={{ background: 'linear-gradient(90deg, #3B82F6, #10B981, #3B82F6)' }} />

      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          {/* Icon badge */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-600/20 border border-blue-500/30 glow-blue">
            <BarChart3 size={22} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-none tracking-tight">
              FDR{' '}
              <span style={{ background: 'linear-gradient(90deg, #3B82F6, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Dashboard
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Fixed Deposit Receipt — Summary & Analytics
            </p>
          </div>
        </div>

        {/* Date badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <Calendar size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-sm text-slate-300 font-medium">{dateStr}</span>
        </div>
      </div>
    </header>
  );
}
