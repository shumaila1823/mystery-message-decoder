import React from 'react';
import { Lightbulb, X, BookOpen, Sparkles, Check, HelpCircle } from 'lucide-react';
import { DecodeExplanation } from '../types';

interface ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  explanation: DecodeExplanation | null;
  onRetry: () => void;
}

export const ExplainerModal: React.FC<ExplainerModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  error,
  explanation,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border-2 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950/90 via-purple-950/60 to-slate-900 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                💡 How This Secret Code Works
              </h2>
              <p className="text-xs text-indigo-300/80">
                Beginner-friendly breakdown of the cryptography math and history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200 text-sm">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin mb-4" />
              <p className="font-mono text-sm text-indigo-300 font-bold">
                Preparing student-friendly cryptography explanation...
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Gemini is breaking down the algorithm into easy-to-understand steps.
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs">
              <p className="font-bold mb-1">Couldn't load explanation</p>
              <p>{error}</p>
              <button
                onClick={onRetry}
                className="mt-3 px-3 py-1.5 rounded bg-rose-900 hover:bg-rose-800 border border-rose-500 text-white font-mono text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {explanation && !isLoading && (
            <div className="space-y-4 animate-fade-in font-sans">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold block mb-1">
                  1. Cipher Overview: {explanation.cipherName}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {explanation.summary}
                </p>
              </div>

              {/* How it works */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  2. How It Works
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {explanation.howItWorks}
                </p>
              </div>

              {/* What happened */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  3. What Happened to Your Message
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {explanation.stepByStep}
                </p>
              </div>

              {/* Mini Example */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  4. Mini Example
                </h4>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-200">
                  {explanation.miniExample}
                </div>
              </div>

              {/* Fun Fact */}
              {explanation.funFact && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs">
                  <span className="font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    🌟 Cryptography Fun Fact:
                  </span>
                  <p>{explanation.funFact}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(99,102,241,0.3)]"
          >
            Got It! Close
          </button>
        </div>
      </div>
    </div>
  );
};
