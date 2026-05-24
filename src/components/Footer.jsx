import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-600 text-xs">
          <ShieldCheck size={13} className="text-blue-500/50" />
          <span>Interest calculated on simple basis • Auto-renewal assumed after maturity</span>
        </div>
        <div className="text-xs text-slate-700">
          10% TDS applied on interest portion only • All values in BDT (Bangladeshi Taka)
        </div>
      </div>
    </footer>
  );
}
