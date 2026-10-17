import React from 'react';
import { FlaskConical, ChevronRight } from 'lucide-react';
import { CipherType } from '../types';

export interface ExampleCase {
  label: string;
  cipher: CipherType;
  message: string;
  shift?: number;
  expected: string;
  description: string;
}

export const SAMPLE_EXAMPLES: ExampleCase[] = [
  {
    label: 'Caesar (Shift 3)',
    cipher: 'caesar',
    message: 'KHOOR ZRUOG',
    shift: 3,
    expected: 'HELLO WORLD',
    description: 'Letters shifted forward by 3',
  },
  {
    label: 'ROT13',
    cipher: 'rot13',
    message: 'URYYB JBEYQ',
    expected: 'HELLO WORLD',
    description: 'Standard 13-character rotation',
  },
  {
    label: 'Morse Code',
    cipher: 'morse',
    message: '.... . .-.. .-.. ---',
    expected: 'HELLO',
    description: 'Telegraph dots and dashes',
  },
  {
    label: 'Binary',
    cipher: 'binary',
    message: '01001000 01001001',
    expected: 'HI',
    description: '8-bit ASCII computer bytes',
  },
  {
    label: 'Atbash',
    cipher: 'atbash',
    message: 'SVOOL DLIOW',
    expected: 'HELLO WORLD',
    description: 'Alphabet inverted (A ↔ Z)',
  },
  {
    label: 'Base64',
    cipher: 'base64',
    message: 'U2VjcmV0IEFnZW50IDAwNw==',
    expected: 'Secret Agent 007',
    description: 'ASCII byte-to-text encoding',
  },
  {
    label: 'Reverse Text',
    cipher: 'reverse',
    message: 'EDOC TERCES',
    expected: 'SECRET CODE',
    description: 'Characters flipped backwards',
  },
  {
    label: 'Auto Detect Test',
    cipher: 'auto',
    message: '01010011 01001111 01010011',
    expected: 'SOS',
    description: 'Test the automatic detector',
  },
];

interface ExamplesBarProps {
  onSelectExample: (example: ExampleCase) => void;
}

export const ExamplesBar: React.FC<ExamplesBarProps> = ({ onSelectExample }) => {
  return (
    <div className="mb-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-semibold">
          <FlaskConical className="w-4 h-4 text-cyan-400" />
          <span>🧪 Try an Example Secret Message:</span>
        </div>
        <span className="text-xs text-slate-400">Click any preset to load instantly</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
        {SAMPLE_EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => onSelectExample(ex)}
            className="group flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-700/60 hover:border-cyan-500/60 hover:bg-slate-800/80 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all duration-150 active:scale-95"
            title={`${ex.description} (Decodes to: ${ex.expected})`}
          >
            <span className="font-semibold text-cyan-400">{ex.label}</span>
            <span className="text-slate-500 group-hover:text-cyan-400/80 transition-colors">
              <ChevronRight className="w-3 h-3" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
