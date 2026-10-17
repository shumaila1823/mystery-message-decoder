import React from 'react';
import { Sliders, RotateCw } from 'lucide-react';

interface CaesarControlsProps {
  shift: number;
  onChangeShift: (shift: number) => void;
}

export const CaesarControls: React.FC<CaesarControlsProps> = ({
  shift,
  onChangeShift,
}) => {
  // Generate sample mapping for visual preview: A -> ..., B -> ..., etc.
  const sampleLetters = ['A', 'B', 'C', 'D', 'E', '...', 'X', 'Y', 'Z'];
  const getShiftedChar = (ch: string) => {
    if (ch === '...') return '...';
    const code = ch.charCodeAt(0);
    return String.fromCharCode(((code - 65 + shift) % 26) + 65);
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 shadow-inner">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-300">
            Caesar Shift Value
          </span>
        </div>
        <div className="px-3 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 font-mono text-sm font-bold shadow-[0_0_8px_rgba(99,102,241,0.25)]">
          Shift: {shift}
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-500">1</span>
        <input
          type="range"
          min="1"
          max="25"
          value={shift}
          onChange={(e) => onChangeShift(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <span className="text-xs font-mono text-slate-500">25</span>
      </div>

      {/* Quick Shift buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
        <span className="text-[11px] font-mono text-slate-400 mr-1">Quick Select:</span>
        {[1, 3, 5, 7, 10, 13, 20, 25].map((val) => (
          <button
            key={val}
            onClick={() => onChangeShift(val)}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
              shift === val
                ? 'bg-indigo-600 text-white font-bold ring-1 ring-indigo-400'
                : 'bg-slate-800/90 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            +{val}
          </button>
        ))}
        {shift !== 3 && (
          <button
            onClick={() => onChangeShift(3)}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            Reset to 3 (Default)
          </button>
        )}
      </div>

      {/* Educational Alphabet Preview */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono overflow-x-auto pb-1 text-slate-400">
        <div className="flex items-center gap-1.5 flex-nowrap">
          <span className="text-[10px] text-slate-500 uppercase mr-1">Mapping:</span>
          {sampleLetters.map((letter, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800/80 min-w-6 text-center"
            >
              <span className="text-slate-400 text-[10px]">{letter}</span>
              <span className="text-indigo-400 font-bold text-xs">{getShiftedChar(letter)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
