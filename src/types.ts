export type CipherType =
  | 'auto'
  | 'caesar'
  | 'atbash'
  | 'rot13'
  | 'morse'
  | 'binary'
  | 'base64'
  | 'reverse'
  | 'unknown';

export interface HistoryItem {
  id: string;
  originalMessage: string;
  resultMessage: string;
  cipher: string;
  cipherKey: CipherType;
  shift?: number;
  mode: 'decode' | 'encode';
  timestamp: number;
}

export interface DetectiveAnalysis {
  possibleCipher: string;
  confidence: string;
  why: string;
  suggestedDecode: string;
  otherPossibilities: string[];
  isReliable: boolean;
  detectedCipherKey?: CipherType;
  suggestedShift?: number;
}

export interface DecodeExplanation {
  cipherName: string;
  summary: string;
  howItWorks: string;
  stepByStep: string;
  miniExample: string;
  funFact: string;
}
