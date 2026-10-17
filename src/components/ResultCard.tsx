import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  Volume2,
  VolumeX,
  FileCode,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { morseAudio } from '../utils/morseAudio';

interface ResultCardProps {
  result: string;
  cipherName: string;
  mode: 'decode' | 'encode';
  shift?: number;
  onTryAgain: () => void;
  onExplain: () => void;
  isExplainingLoading: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  cipherName,
  mode,
  shift,
  onTryAgain,
  onExplain,
  isExplainingLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Check if result or input is Morse code so we can offer audio playback
  const isMorseCode =
    cipherName.toLowerCase().includes('morse') ||
    (/^[.\- /\\\s]+$/.test(result.trim()) && result.includes('.'));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = result;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleToggleMorseAudio = () => {
    if (isPlayingAudio) {
      morseAudio.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      morseAudio.playMorse(
        result,
        18,
        undefined,
        () => setIsPlayingAudio(false)
      );
    }
  };

  useEffect(() => {
    return () => {
      morseAudio.stop();
    };
  }, []);

  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] p-5 sm:p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-mono font-bold tracking-wide text-slate-100 flex items-center gap-2">
              <span>{mode === 'decode' ? 'Decoded Result' : 'Encoded Result'}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                {cipherName}
                {shift ? ` (Shift ${shift})` : ''}
              </span>
            </h3>
            <span className="text-xs text-slate-400">
              Length: {result.length} characters
            </span>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2">
          {isMorseCode && (
            <button
              onClick={handleToggleMorseAudio}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                isPlayingAudio
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
              }`}
              title="Listen to Morse Code telegraph sound"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Sound</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🔊 Play Morse Audio</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              copied
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>✓ Copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>📋 Copy Result</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Result Display Area */}
      <div className="relative group">
        <textarea
          readOnly
          value={result}
          rows={Math.min(10, Math.max(4, Math.ceil(result.length / 50)))}
          className="w-full p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-200 font-mono text-sm sm:text-base leading-relaxed tracking-wide selection:bg-cyan-600/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-y shadow-inner"
        />
      </div>

      {/* Footer Controls: Try Again & AI Explain */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onTryAgain}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all border border-slate-700 active:scale-95"
            title="Reset or flip result to input to encode/decode further"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>↻ Try Again</span>
          </button>
        </div>

        {/* AI Explain Button */}
        <button
          onClick={onExplain}
          disabled={isExplainingLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all active:scale-95 disabled:opacity-60"
        >
          <Lightbulb className="w-4 h-4 text-amber-300" />
          <span>{isExplainingLoading ? 'Generating Explanation...' : '💡 Explain This Decode'}</span>
        </button>
      </div>
    </div>
  );
};
