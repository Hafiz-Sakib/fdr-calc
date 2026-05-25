import React from "react";
import { BarChart3, Calendar, RotateCcw } from "lucide-react";

export default function Header({
  today,
  realToday,
  selectedDateStr,
  onDateChange,
  isCustomDate,
}) {
  const dateStr = today.toLocaleDateString("en-BD", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handleReset = () => {
    const y = realToday.getFullYear();
    const m = String(realToday.getMonth() + 1).padStart(2, "0");
    const d = String(realToday.getDate()).padStart(2, "0");
    onDateChange(`${y}-${m}-${d}`);
  };

  return (
    <header className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: "linear-gradient(90deg, #3B82F6, #10B981, #3B82F6)",
        }}
      />

      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-600/20 border border-blue-500/30 glow-blue">
            <BarChart3 size={22} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-none tracking-tight">
              FDR{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #3B82F6, #10B981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Dashboard
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Fixed Deposit Receipt — Summary & Analytics
            </p>
          </div>
        </div>

        {/* Date Picker + Display */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Date selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Choose Date
            </label>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                isCustomDate
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-white/[0.04] border-white/[0.08]"
              }`}
            >
              <Calendar
                size={13}
                className={isCustomDate ? "text-amber-400" : "text-blue-400"}
              />
              <input
                type="date"
                value={selectedDateStr}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                style={{
                  color: isCustomDate ? "#fbbf24" : "#cbd5e1",
                  colorScheme: "dark",
                }}
              />
            </div>
            {isCustomDate && (
              <button
                onClick={handleReset}
                title="Reset to today"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                <RotateCcw size={12} />
                Today
              </button>
            )}
          </div>

          {/* Calculated date display */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <div
              className={`w-1.5 h-1.5 rounded-full ${isCustomDate ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`}
            />
            <span
              className={`text-sm font-medium ${isCustomDate ? "text-amber-300" : "text-slate-300"}`}
            >
              {isCustomDate ? "(Simulated) " : ""}
              {dateStr}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
