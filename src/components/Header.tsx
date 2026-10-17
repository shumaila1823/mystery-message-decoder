import React from 'react';
import { Lock, Sparkles, Terminal, Shield } from 'lucide-react';

interface HeaderProps {
  onOpenDetective: () => void;
  hasInput: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDetective, hasInput }) => {
  return (
    <header className="relative w-full border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Title */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-600/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-cyan-400">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 font-mono flex items-center gap-2">
                  🔐 MYSTERY MESSAGE DECODER
                </h1>
                <p className="text-sm sm:text-base text-slate-400 font-sans tracking-wide mt-0.5">
                  Decode the unknown. Discover the hidden message.
                </p>
              </div>
            </div>
          </div>

          {/* Status badge & AI Detective Quick Action */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Decoder Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs font-mono text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Decoder Online</span>
            </div>

            {/* Quick Detective Button */}
            <button
              onClick={onOpenDetective}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                hasInput
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:from-purple-500 hover:to-indigo-500 scale-100 hover:scale-[1.02]'
                  : 'bg-slate-900/80 border border-purple-500/30 text-purple-300 hover:bg-purple-950/40 hover:border-purple-400/50'
              }`}
              title="Analyze unknown cipher with AI Detective"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>🕵️ AI Cipher Detective</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
