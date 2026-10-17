import React from 'react';
import { Search, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { DetectionResult } from '../utils/ciphers';

interface AutoDetectCardProps {
  detection: DetectionResult;
  onApplySuggestedDecode: () => void;
  onOpenDetective: () => void;
  hasInput: boolean;
}

export const AutoDetectCard: React.FC<AutoDetectCardProps> = ({
  detection,
  onApplySuggestedDecode,
  onOpenDetective,
  hasInput,
}) => {
  if (!hasInput) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
        <Search className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>Type or paste any secret message above, and Auto Detect will examine its patterns in real-time.</span>
      </div>
    );
  }

  const getConfidenceBadge = (confidence: 'High' | 'Medium' | 'Low') => {
    switch (confidence) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Confidence: High ({detection.confidencePercentage}%)
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/80 border border-amber-500/50 text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Confidence: Medium ({detection.confidencePercentage}%)
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 border border-slate-600 text-slate-400">
            Confidence: Low
          </span>
        );
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-slate-900/90 to-cyan-950/40 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-mono font-bold text-slate-200">
            🔍 Possible format: <span className="text-cyan-300">{detection.cipherName}</span>
          </span>
        </div>
        <div>{getConfidenceBadge(detection.confidence)}</div>
      </div>

      <p className="text-xs text-slate-300 font-sans mb-3 leading-relaxed">
        {detection.reason}
      </p>

      {detection.suggestedDecodedText && (
        <div className="mb-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs text-emerald-300 break-all">
          <span className="text-slate-500 mr-2 text-[11px] uppercase tracking-wider block sm:inline">Preview:</span>
          "{detection.suggestedDecodedText.length > 100
            ? detection.suggestedDecodedText.slice(0, 100) + '...'
            : detection.suggestedDecodedText}"
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {detection.cipherKey !== 'unknown' && (
          <button
            onClick={onApplySuggestedDecode}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all active:scale-95"
          >
            <span>Try Suggested Decode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={onOpenDetective}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/50 hover:border-purple-400 transition-all ml-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Need deeper analysis? Ask AI Detective</span>
        </button>
      </div>
    </div>
  );
};
