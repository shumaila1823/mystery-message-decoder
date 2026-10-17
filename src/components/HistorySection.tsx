import React from 'react';
import { History, Trash2, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySectionProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onRestore,
  onClear,
}) => {
  if (history.length === 0) {
    return null;
  }

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="mt-12 rounded-2xl bg-slate-950/70 border border-slate-800/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-mono font-bold text-slate-100 flex items-center gap-2">
            <span>🕘 Recent Decodes</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
              {history.length} saved
            </span>
          </h3>
        </div>

        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 hover:border-rose-500/40 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onRestore(item)}
            className="group cursor-pointer p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-150 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                  {item.cipher}
                  {item.shift ? ` (Shift ${item.shift})` : ''}
                </span>

                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(item.timestamp)}</span>
                </div>
              </div>

              {/* Original Preview */}
              <div className="text-xs font-mono text-slate-400 truncate mb-1">
                <span className="text-slate-500 mr-1.5">Input:</span>
                "{item.originalMessage}"
              </div>

              {/* Result Preview */}
              <div className="text-xs font-mono text-cyan-300 truncate">
                <span className="text-slate-500 mr-1.5">{item.mode === 'decode' ? 'Decoded:' : 'Encoded:'}</span>
                "{item.resultMessage}"
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
              <span>Click to restore</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
