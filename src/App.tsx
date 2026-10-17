/**
 * Mystery Message Decoder
 * Full interactive cryptography web application for students.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  ClipboardPaste,
  Trash2,
  Sliders,
  ChevronDown,
  Info,
  CheckCircle,
  Hash,
} from 'lucide-react';
import { Header } from './components/Header';
import { ExamplesBar, ExampleCase } from './components/ExamplesBar';
import { CaesarControls } from './components/CaesarControls';
import { AutoDetectCard } from './components/AutoDetectCard';
import { ResultCard } from './components/ResultCard';
import { DetectiveModal } from './components/DetectiveModal';
import { ExplainerModal } from './components/ExplainerModal';
import { HistorySection } from './components/HistorySection';
import { Footer } from './components/Footer';
import {
  CipherType,
  HistoryItem,
  DetectiveAnalysis,
  DecodeExplanation,
} from './types';
import {
  encodeCaesar,
  decodeCaesar,
  rot13,
  atbash,
  reverseText,
  encodeMorse,
  decodeMorse,
  encodeBinary,
  decodeBinary,
  encodeBase64,
  decodeBase64,
  autoDetectCipher,
  DetectionResult,
} from './utils/ciphers';

const CIPHER_DESCRIPTIONS: Record<CipherType, { name: string; description: string }> = {
  auto: {
    name: 'Auto Detect',
    description:
      'Analyzes patterns, characters, and letter frequencies to automatically recognize the cipher.',
  },
  caesar: {
    name: 'Caesar Cipher',
    description:
      'Each letter is shifted by a fixed number of positions in the alphabet.',
  },
  atbash: {
    name: 'Atbash Cipher',
    description:
      'An ancient substitution cipher where the alphabet is inverted (A becomes Z, B becomes Y).',
  },
  rot13: {
    name: 'ROT13',
    description:
      'A special Caesar cipher with a shift of 13. Applying it twice returns the original message.',
  },
  morse: {
    name: 'Morse Code',
    description:
      'Encodes letters and numbers as sequences of telegraph dots (.) and dashes (-).',
  },
  binary: {
    name: 'Binary',
    description:
      'Represents characters as 8-bit computer bytes of 0s and 1s.',
  },
  base64: {
    name: 'Base64',
    description:
      'Encodes arbitrary binary data into 64 ASCII characters for safe web transmission.',
  },
  reverse: {
    name: 'Reverse Text',
    description:
      'Flips the entire sequence of characters backwards.',
  },
  unknown: {
    name: 'Unknown Cipher',
    description:
      'Undetermined format. Use Auto Detect or AI Detective to investigate.',
  },
};

const CIPHER_OPTIONS: { id: CipherType; label: string }[] = [
  { id: 'auto', label: '1. Auto Detect' },
  { id: 'caesar', label: '2. Caesar Cipher' },
  { id: 'atbash', label: '3. Atbash Cipher' },
  { id: 'rot13', label: '4. ROT13' },
  { id: 'morse', label: '5. Morse Code' },
  { id: 'binary', label: '6. Binary' },
  { id: 'base64', label: '7. Base64' },
  { id: 'reverse', label: '8. Reverse Text' },
];

const LOCAL_STORAGE_HISTORY_KEY = 'mystery_decoder_history_v1';

export default function App() {
  // Input state
  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedCipher, setSelectedCipher] = useState<CipherType>('auto');
  const [caesarShift, setCaesarShift] = useState<number>(3);

  // Result state
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [lastExecutedCipher, setLastExecutedCipher] = useState<string>('');
  const [lastExecutedShift, setLastExecutedShift] = useState<number | undefined>(undefined);
  const [lastExecutedMode, setLastExecutedMode] = useState<'decode' | 'encode'>('decode');
  const [lastOriginalMessage, setLastOriginalMessage] = useState<string>('');

  // Status / Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isDetectiveOpen, setIsDetectiveOpen] = useState<boolean>(false);
  const [isDetectiveLoading, setIsDetectiveLoading] = useState<boolean>(false);
  const [detectiveAnalysis, setDetectiveAnalysis] = useState<DetectiveAnalysis | null>(null);
  const [detectiveError, setDetectiveError] = useState<string | null>(null);

  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);
  const [isExplainerLoading, setIsExplainerLoading] = useState<boolean>(false);
  const [explanationData, setExplanationData] = useState<DecodeExplanation | null>(null);
  const [explainerError, setExplainerError] = useState<string | null>(null);

  // Save history on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.warn('Failed to save history to localStorage', err);
    }
  }, [history]);

  // Real-time Auto-Detection analysis
  const autoDetectionResult: DetectionResult = useMemo(() => {
    return autoDetectCipher(inputMessage);
  }, [inputMessage]);

  // Helper to add item to history
  const addToHistory = (
    original: string,
    result: string,
    cipher: string,
    cipherKey: CipherType,
    mode: 'decode' | 'encode',
    shift?: number
  ) => {
    const newItem: HistoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      originalMessage: original,
      resultMessage: result,
      cipher,
      cipherKey,
      shift,
      mode,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 19)]); // Keep latest 20
  };

  // Decode Handler
  const handleDecode = () => {
    setErrorMessage(null);
    const text = inputMessage.trim();

    if (!text) {
      setErrorMessage('⚠️ Please enter a message first.');
      return;
    }

    let cipherToUse = selectedCipher;
    let shiftToUse = caesarShift;

    // Handle Auto Detect Mode
    if (cipherToUse === 'auto') {
      if (autoDetectionResult.cipherKey === 'unknown') {
        if (autoDetectionResult.cipherName === 'Plain English Text') {
          setErrorMessage(
            '💡 This message already appears to be plain readable English! Choose a cipher above to encode it into a secret message.'
          );
          return;
        }
        // Graceful fallback to Caesar Shift 3
        cipherToUse = 'caesar';
        shiftToUse = 3;
      } else {
        cipherToUse = autoDetectionResult.cipherKey;
        if (autoDetectionResult.shift) {
          shiftToUse = autoDetectionResult.shift;
        }
      }
    }

    try {
      let decoded = '';
      let cipherDisplayName = CIPHER_DESCRIPTIONS[cipherToUse]?.name || cipherToUse;

      switch (cipherToUse) {
        case 'caesar':
          decoded = decodeCaesar(inputMessage, shiftToUse);
          cipherDisplayName = `Caesar Cipher`;
          break;
        case 'rot13':
          decoded = rot13(inputMessage);
          break;
        case 'atbash':
          decoded = atbash(inputMessage);
          break;
        case 'reverse':
          decoded = reverseText(inputMessage);
          break;
        case 'morse':
          decoded = decodeMorse(inputMessage);
          break;
        case 'binary':
          decoded = decodeBinary(inputMessage);
          break;
        case 'base64':
          decoded = decodeBase64(inputMessage);
          break;
        default:
          throw new Error('Unknown cipher algorithm selected.');
      }

      setResultMessage(decoded);
      setLastExecutedCipher(cipherDisplayName);
      setLastExecutedShift(cipherToUse === 'caesar' ? shiftToUse : undefined);
      setLastExecutedMode('decode');
      setLastOriginalMessage(inputMessage);

      addToHistory(
        inputMessage,
        decoded,
        cipherDisplayName,
        cipherToUse,
        'decode',
        cipherToUse === 'caesar' ? shiftToUse : undefined
      );
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "⚠️ I couldn't decode this message with the selected cipher. Check the format and try again."
      );
    }
  };

  // Encode Handler
  const handleEncode = () => {
    setErrorMessage(null);
    const text = inputMessage.trim();

    if (!text) {
      setErrorMessage('⚠️ Please enter a message first.');
      return;
    }

    let cipherToUse = selectedCipher;
    if (cipherToUse === 'auto') {
      // Default auto encode to Caesar or prompt
      cipherToUse = 'caesar';
    }

    try {
      let encoded = '';
      let cipherDisplayName = CIPHER_DESCRIPTIONS[cipherToUse]?.name || cipherToUse;

      switch (cipherToUse) {
        case 'caesar':
          encoded = encodeCaesar(inputMessage, caesarShift);
          break;
        case 'rot13':
          encoded = rot13(inputMessage);
          break;
        case 'atbash':
          encoded = atbash(inputMessage);
          break;
        case 'reverse':
          encoded = reverseText(inputMessage);
          break;
        case 'morse':
          encoded = encodeMorse(inputMessage);
          break;
        case 'binary':
          encoded = encodeBinary(inputMessage);
          break;
        case 'base64':
          encoded = encodeBase64(inputMessage);
          break;
        default:
          throw new Error('Unknown cipher algorithm selected.');
      }

      setResultMessage(encoded);
      setLastExecutedCipher(cipherDisplayName);
      setLastExecutedShift(cipherToUse === 'caesar' ? caesarShift : undefined);
      setLastExecutedMode('encode');
      setLastOriginalMessage(inputMessage);

      addToHistory(
        inputMessage,
        encoded,
        cipherDisplayName,
        cipherToUse,
        'encode',
        cipherToUse === 'caesar' ? caesarShift : undefined
      );
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "⚠️ I couldn't encode this message with the selected cipher. Please try again."
      );
    }
  };

  // Clear All
  const handleClear = () => {
    setInputMessage('');
    setResultMessage(null);
    setErrorMessage(null);
  };

  // Quick Load Example
  const handleSelectExample = (example: ExampleCase) => {
    setInputMessage(example.message);
    setSelectedCipher(example.cipher);
    if (example.shift !== undefined) {
      setCaesarShift(example.shift);
    }
    setResultMessage(null);
    setErrorMessage(null);
  };

  // Restore History Item
  const handleRestoreHistory = (item: HistoryItem) => {
    setInputMessage(item.originalMessage);
    setSelectedCipher(item.cipherKey);
    if (item.shift !== undefined) {
      setCaesarShift(item.shift);
    }
    setResultMessage(item.resultMessage);
    setLastExecutedCipher(item.cipher);
    setLastExecutedShift(item.shift);
    setLastExecutedMode(item.mode);
    setLastOriginalMessage(item.originalMessage);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear History
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your decode history?')) {
      setHistory([]);
      try {
        localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
      } catch (err) {
        console.warn('Failed to clear local storage', err);
      }
    }
  };

  // Paste from clipboard helper
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputMessage(text);
        setErrorMessage(null);
      }
    } catch (err) {
      setErrorMessage('⚠️ Could not access clipboard. Please paste manually into the text box.');
    }
  };

  // Apply suggested decode from AutoDetect
  const handleApplySuggestedDecode = () => {
    if (autoDetectionResult.suggestedDecodedText) {
      setResultMessage(autoDetectionResult.suggestedDecodedText);
      setLastExecutedCipher(autoDetectionResult.cipherName);
      setLastExecutedShift(autoDetectionResult.shift);
      setLastExecutedMode('decode');
      setLastOriginalMessage(inputMessage);

      if (autoDetectionResult.cipherKey !== 'unknown') {
        setSelectedCipher(autoDetectionResult.cipherKey);
        if (autoDetectionResult.shift) {
          setCaesarShift(autoDetectionResult.shift);
        }
      }

      addToHistory(
        inputMessage,
        autoDetectionResult.suggestedDecodedText,
        autoDetectionResult.cipherName,
        autoDetectionResult.cipherKey,
        'decode',
        autoDetectionResult.shift
      );
    } else {
      handleDecode();
    }
  };

  // AI Detective Request
  const handleRunDetective = async () => {
    const text = inputMessage.trim();
    if (!text) {
      setErrorMessage('⚠️ Please enter a message first to analyze with AI Detective.');
      return;
    }

    setIsDetectiveOpen(true);
    setIsDetectiveLoading(true);
    setDetectiveError(null);

    try {
      const res = await fetch('/api/detective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data: DetectiveAnalysis = await res.json();
      setDetectiveAnalysis(data);
    } catch (err: any) {
      console.error('Detective error:', err);
      setDetectiveError(
        err.message || 'Failed to connect to AI Detective. Please check your network and try again.'
      );
    } finally {
      setIsDetectiveLoading(false);
    }
  };

  // Apply Detective result to UI
  const handleApplyDetectiveResult = (
    decodedText: string,
    cipherKey?: CipherType,
    shift?: number
  ) => {
    setResultMessage(decodedText);
    setLastExecutedCipher(detectiveAnalysis?.possibleCipher || 'AI Cipher Detective');
    setLastExecutedShift(shift);
    setLastExecutedMode('decode');
    setLastOriginalMessage(inputMessage);

    if (cipherKey && cipherKey !== 'unknown') {
      setSelectedCipher(cipherKey);
    }
    if (shift) {
      setCaesarShift(shift);
    }

    addToHistory(
      inputMessage,
      decodedText,
      detectiveAnalysis?.possibleCipher || 'AI Detective',
      cipherKey || 'auto',
      'decode',
      shift
    );

    setIsDetectiveOpen(false);
  };

  // AI Explain Request
  const handleRunExplain = async () => {
    if (!resultMessage || !lastOriginalMessage) {
      return;
    }

    setIsExplainerOpen(true);
    setIsExplainerLoading(true);
    setExplainerError(null);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cipher: lastExecutedCipher,
          originalMessage: lastOriginalMessage,
          resultMessage: resultMessage,
          shift: lastExecutedShift,
          mode: lastExecutedMode,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data: DecodeExplanation = await res.json();
      setExplanationData(data);
    } catch (err: any) {
      console.error('Explain error:', err);
      setExplainerError(
        err.message || 'Failed to generate explanation. Please try again.'
      );
    } finally {
      setIsExplainerLoading(false);
    }
  };

  // Try Again: swap result into input or reset
  const handleTryAgain = () => {
    if (resultMessage) {
      setInputMessage(resultMessage);
      setResultMessage(null);
      setErrorMessage(null);
    } else {
      handleClear();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Background Cyber Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <Header
          onOpenDetective={handleRunDetective}
          hasInput={Boolean(inputMessage.trim())}
        />

        {/* Center Container */}
        <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {/* Try an Example Bar */}
          <ExamplesBar onSelectExample={handleSelectExample} />

          {/* Error Alert Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-sm flex items-start justify-between gap-3 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="font-mono text-xs sm:text-sm">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-100 text-xs font-mono font-bold px-2 py-0.5 rounded hover:bg-rose-900/50"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Central Workspace Card */}
          <div className="rounded-2xl bg-slate-900/80 border border-cyan-900/50 shadow-[0_0_25px_rgba(15,23,42,0.8)] backdrop-blur-md p-5 sm:p-7 relative overflow-hidden">
            {/* Corner Decorative Accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 w-2 h-10 bg-cyan-500/80 rounded-r" />

            {/* Section 1: Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="secret-message-input"
                  className="text-base sm:text-lg font-mono font-bold text-slate-100 flex items-center gap-2"
                >
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <span>Enter Your Secret Message</span>
                </label>

                {/* Quick actions on input */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasteFromClipboard}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>

                  {inputMessage && (
                    <button
                      onClick={handleClear}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
                      title="Clear message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Large Textarea */}
              <div className="relative">
                <textarea
                  id="secret-message-input"
                  rows={5}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="«Paste or type your mysterious message here...»"
                  className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 font-mono text-sm sm:text-base leading-relaxed tracking-wide focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all resize-y shadow-inner"
                />
              </div>

              {/* Dynamic Character Count */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 text-cyan-400/90 font-medium">
                  Characters: {inputMessage.length}
                </span>

                {inputMessage.length > 0 && (
                  <span className="text-slate-500 text-[11px]">
                    Words: {inputMessage.trim().split(/\s+/).filter(Boolean).length}
                  </span>
                )}
              </div>
            </div>

            {/* Section 2: Cipher Selection */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
              <label className="text-sm font-mono font-bold text-slate-200 block">
                Choose a Cipher
              </label>

              {/* Cipher Selector */}
              <div className="relative">
                <select
                  value={selectedCipher}
                  onChange={(e) => {
                    setSelectedCipher(e.target.value as CipherType);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-sm sm:text-base font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 cursor-pointer shadow-sm pr-10"
                >
                  {CIPHER_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200 py-1">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>

              {/* Cipher Explanation Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300 font-sans leading-relaxed">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono font-bold text-cyan-300 mr-2">
                    {CIPHER_DESCRIPTIONS[selectedCipher].name}:
                  </span>
                  «{CIPHER_DESCRIPTIONS[selectedCipher].description}»
                </div>
              </div>

              {/* Caesar Cipher Shift Controls */}
              {selectedCipher === 'caesar' && (
                <CaesarControls
                  shift={caesarShift}
                  onChangeShift={(val) => {
                    setCaesarShift(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
              )}

              {/* Auto Detect Live Card */}
              {selectedCipher === 'auto' && (
                <AutoDetectCard
                  detection={autoDetectionResult}
                  onApplySuggestedDecode={handleApplySuggestedDecode}
                  onOpenDetective={handleRunDetective}
                  hasInput={Boolean(inputMessage.trim())}
                />
              )}
            </div>

            {/* Section 3: Action Buttons */}
            <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Decode Button */}
                <button
                  onClick={handleDecode}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-200 active:scale-95"
                >
                  <Unlock className="w-4 h-4" />
                  <span>🔓 Decode Message</span>
                </button>

                {/* Encode Button */}
                <button
                  onClick={handleEncode}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-500 text-white font-mono font-bold text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all duration-200 active:scale-95"
                >
                  <Lock className="w-4 h-4" />
                  <span>🔒 Encode Message</span>
                </button>
              </div>

              {/* Clear Button */}
              <button
                onClick={handleClear}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-sm transition-all border border-slate-700 active:scale-95"
                title="Reset input and results"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Section 4: Result Card */}
          {resultMessage !== null && (
            <ResultCard
              result={resultMessage}
              cipherName={lastExecutedCipher}
              mode={lastExecutedMode}
              shift={lastExecutedShift}
              onTryAgain={handleTryAgain}
              onExplain={handleRunExplain}
              isExplainingLoading={isExplainerLoading}
            />
          )}

          {/* Section 5: History */}
          <HistorySection
            history={history}
            onRestore={handleRestoreHistory}
            onClear={handleClearHistory}
          />
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* AI Detective Modal */}
      <DetectiveModal
        isOpen={isDetectiveOpen}
        onClose={() => setIsDetectiveOpen(false)}
        isLoading={isDetectiveLoading}
        error={detectiveError}
        analysis={detectiveAnalysis}
        onApplyDecode={handleApplyDetectiveResult}
        onRunAnalyze={handleRunDetective}
        inputMessage={inputMessage}
      />

      {/* AI Explainer Modal */}
      <ExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        isLoading={isExplainerLoading}
        error={explainerError}
        explanation={explanationData}
        onRetry={handleRunExplain}
      />
    </div>
  );
}
