import React from 'react';
import {
  Sparkles,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { DetectiveAnalysis, CipherType } from '../types';

interface DetectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  analysis: DetectiveAnalysis | null;
  onApplyDecode: (decodedText: string, cipherKey?: CipherType, shift?: number) => void;
  onRunAnalyze: () => void;
  inputMessage: string;
}

export const DetectiveModal: React.FC<DetectiveModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  error,
  analysis,
  onApplyDecode,
  onRunAnalyze,
  inputMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border-2 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/80 via-indigo-950/60 to-slate-900 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-5 h-5 text-purple-300 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                🕵️ AI Cipher Detective
              </h2>
              <p className="text-xs text-purple-300/80">
                Powered by Gemini to investigate unknown ciphers and patterns
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200 text-sm">
          {/* Target Message preview */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Analyzing Secret Message:
            </span>
            <p className="font-mono text-xs text-purple-200 break-all line-clamp-3">
              "{inputMessage || 'No message entered yet.'}"
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
              <p className="font-mono text-sm text-purple-300 font-bold">
                Inspecting letter frequencies and cryptographic patterns...
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Gemini is cross-referencing substitution, transposition, rotation, and binary ciphers.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Investigation Error</p>
                <p>{error}</p>
                <button
                  onClick={onRunAnalyze}
                  className="mt-3 px-3 py-1 rounded bg-rose-900/60 hover:bg-rose-800 border border-rose-500 text-white font-mono text-xs"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {analysis && !isLoading && (
            <div className="space-y-4 animate-fade-in">
              {/* Verdict Banner */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-purple-300">
                    Primary Verdict:
                  </span>
                  <h3 className="text-lg font-mono font-bold text-white text-cyan-300">
                    {analysis.possibleCipher}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Confidence:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-900/80 border border-purple-400/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    {analysis.confidence}
                  </span>
                </div>
              </div>

              {/* Reliability check */}
              {!analysis.isReliable && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Note: The evidence is weak or the ciphertext is too short. Interpret with caution.
                  </span>
                </div>
              )}

              {/* Why explanation */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  Why this cipher?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {analysis.why}
                </p>
              </div>

              {/* Suggested Decode */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-indigo-950/40 border border-indigo-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Suggested Decoded Message:
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-indigo-500/30 font-mono text-sm text-cyan-200 break-all select-all">
                  {analysis.suggestedDecode}
                </div>
                <button
                  onClick={() =>
                    onApplyDecode(
                      analysis.suggestedDecode,
                      analysis.detectedCipherKey,
                      analysis.suggestedShift
                    )
                  }
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  <span>Apply This Decoded Text to Main Screen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Other possibilities */}
              {analysis.otherPossibilities && analysis.otherPossibilities.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                    Other Possible Interpretations:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                    {analysis.otherPossibilities.map((opt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
          >
            Close
          </button>

          <button
            onClick={onRunAnalyze}
            disabled={isLoading || !inputMessage.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>{isLoading ? 'Investigating...' : 'Analyze Mystery Again'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
