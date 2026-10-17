import React from 'react';
import { ShieldCheck, Lock, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 py-8 border-t border-slate-900 bg-slate-950/80 text-center">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center gap-3">
        {/* Security / Privacy Message */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-300">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>🔒 Your messages stay in your browser whenever possible.</span>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
          «This tool is for educational and puzzle-solving purposes.»
        </p>

        <div className="text-[11px] font-mono text-slate-600">
          MYSTERY MESSAGE DECODER • Built with Gemini Cryptography Engine
        </div>
      </div>
    </footer>
  );
};
