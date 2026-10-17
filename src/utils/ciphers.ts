/**
 * Mystery Message Decoder - Cryptographic Algorithms & Utilities
 * Provides deterministic cipher encoding, decoding, format detection, and validation.
 */

// --- Morse Code Table ---
export const MORSE_CODE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  _: '..--.-',
  '"': '.-..-.',
  $: '...-..-',
  '@': '.--.-.',
};

const REVERSE_MORSE_MAP: Record<string, string> = Object.entries(MORSE_CODE_MAP).reduce(
  (acc, [char, code]) => {
    acc[code] = char;
    return acc;
  },
  {} as Record<string, string>
);

// --- Common English Words for Cipher Auto-Detection ---
const COMMON_ENGLISH_WORDS = new Set([
  'THE', 'BE', 'TO', 'OF', 'AND', 'A', 'IN', 'THAT', 'HAVE', 'I',
  'IT', 'FOR', 'NOT', 'ON', 'WITH', 'HE', 'AS', 'YOU', 'DO', 'AT',
  'THIS', 'BUT', 'HIS', 'BY', 'FROM', 'THEY', 'WE', 'SAY', 'HER', 'SHE',
  'OR', 'AN', 'WILL', 'MY', 'ONE', 'ALL', 'WOULD', 'THERE', 'THEIR', 'WHAT',
  'SO', 'UP', 'OUT', 'IF', 'ABOUT', 'WHO', 'GET', 'WHICH', 'GO', 'ME',
  'WHEN', 'MAKE', 'CAN', 'LIKE', 'TIME', 'NO', 'JUST', 'HIM', 'KNOW', 'TAKE',
  'PEOPLE', 'INTO', 'YEAR', 'YOUR', 'GOOD', 'SOME', 'COULD', 'THEM', 'SEE', 'OTHER',
  'THAN', 'THEN', 'NOW', 'LOOK', 'ONLY', 'COME', 'ITS', 'OVER', 'THINK', 'ALSO',
  'BACK', 'AFTER', 'USE', 'TWO', 'HOW', 'OUR', 'WORK', 'FIRST', 'WELL', 'WAY',
  'EVEN', 'NEW', 'WANT', 'BECAUSE', 'ANY', 'THESE', 'GIVE', 'DAY', 'MOST', 'US',
  'HELLO', 'WORLD', 'SECRET', 'MESSAGE', 'AGENT', 'DECODER', 'PASSWORD', 'MISSION',
  'HIDDEN', 'CIPHER', 'DETECTIVE', 'TREASURE', 'FLAG', 'MEET', 'MIDNIGHT', 'ATTACK',
  'DEFEND', 'SAFE', 'KEY', 'TEST', 'CODE', 'OPERATION', 'MYSTERY', 'SOLVE', 'FIND'
]);

// --- Caesar Cipher ---
export function encodeCaesar(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Uppercase
    if (code >= 65 && code <= 90) {
      result += String.fromCharCode(((code - 65 + s) % 26) + 65);
    }
    // Lowercase
    else if (code >= 97 && code <= 122) {
      result += String.fromCharCode(((code - 97 + s) % 26) + 97);
    }
    // Non-alphabetic untouched
    else {
      result += text[i];
    }
  }
  return result;
}

export function decodeCaesar(text: string, shift: number): string {
  return encodeCaesar(text, -shift);
}

// --- ROT13 ---
export function rot13(text: string): string {
  return encodeCaesar(text, 13);
}

// --- Atbash Cipher ---
export function atbash(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      // A (65) -> Z (90)
      result += String.fromCharCode(90 - (code - 65));
    } else if (code >= 97 && code <= 122) {
      // a (97) -> z (122)
      result += String.fromCharCode(122 - (code - 97));
    } else {
      result += text[i];
    }
  }
  return result;
}

// --- Reverse Text ---
export function reverseText(text: string): string {
  return Array.from(text).reverse().join('');
}

// --- Morse Code ---
export function encodeMorse(text: string): string {
  const upper = text.toUpperCase().trim();
  if (!upper) return '';

  const words = upper.split(/\s+/);
  const encodedWords = words.map((word) => {
    const chars = Array.from(word);
    const morseChars = chars
      .map((ch) => MORSE_CODE_MAP[ch] || '')
      .filter(Boolean);
    return morseChars.join(' ');
  });

  return encodedWords.join(' / ');
}

export function decodeMorse(morseText: string): string {
  const trimmed = morseText.trim();
  if (!trimmed) return '';

  // If input is regular alphabet letters, gently guide the user
  if (/[a-zA-Z]/.test(trimmed) && !/[.\-]/.test(trimmed)) {
    throw new Error("⚠️ Input contains regular letters instead of Morse symbols. Click '🔒 Encode Message' to convert text to Morse Code!");
  }

  // Normalize dot and dash variants
  const normalized = trimmed
    .replace(/[•·*]/g, '.')
    .replace(/[—–_−]/g, '-')
    .replace(/[|\\]/g, '/');

  // Validate morse format
  const validChars = /^[.\- /0-9a-zA-Z?]+$/;
  if (!validChars.test(normalized)) {
    throw new Error("⚠️ Invalid Morse Code: Input contains symbols other than dots (.), dashes (-), and word separators (/ or space).");
  }

  // Word separators can be ' / ' or three or more spaces
  const words = normalized.split(/\s*(?:\/|\s{3,})\s*/);

  const decodedWords = words.map((word) => {
    const letters = word.trim().split(/\s+/);
    return letters
      .map((letterCode) => {
        if (!letterCode) return '';
        const char = REVERSE_MORSE_MAP[letterCode];
        return char || letterCode;
      })
      .join('');
  });

  return decodedWords.join(' ');
}

// --- Binary ---
export function encodeBinary(text: string): string {
  if (!text) return '';
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const binaryArray = Array.from(bytes).map((b) => b.toString(2).padStart(8, '0'));
  return binaryArray.join(' ');
}

export function decodeBinary(binaryText: string): string {
  // Strip 0b prefixes, commas, brackets
  const clean = binaryText
    .replace(/0b/gi, '')
    .replace(/[,;[\]]/g, ' ')
    .trim();

  if (!clean) return '';

  // Check if input is standard text rather than binary
  if (/[a-zA-Z]/.test(clean) && !/^[01\s]+$/.test(clean)) {
    throw new Error("⚠️ Input contains regular letters. Click '🔒 Encode Message' to convert your text to Binary!");
  }

  // Check if it consists only of 0, 1, and whitespace
  if (!/^[01\s]+$/.test(clean)) {
    throw new Error("⚠️ Invalid Binary: Input must contain only 0s, 1s, and spaces.");
  }

  // If there are spaces, split by spaces; if continuous, slice every 8 bits
  let chunks: string[];
  if (/\s+/.test(clean)) {
    chunks = clean.split(/\s+/).filter(Boolean);
  } else {
    // If length is multiple of 7 and not 8, slice by 7
    const step = clean.length % 8 === 0 ? 8 : (clean.length % 7 === 0 ? 7 : 8);
    chunks = [];
    for (let i = 0; i < clean.length; i += step) {
      chunks.push(clean.slice(i, i + step));
    }
  }

  const bytes: number[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    // Pad 7-bit chunks to 8-bit
    const padded = chunk.length < 8 ? chunk.padStart(8, '0') : chunk;
    if (padded.length > 8) {
      throw new Error(`⚠️ Invalid Binary: Chunk "${chunk}" is longer than 8 bits.`);
    }
    bytes.push(parseInt(padded, 2));
  }

  const decoder = new TextDecoder('utf-8', { fatal: false });
  return decoder.decode(new Uint8Array(bytes));
}

// --- Base64 ---
export function encodeBase64(text: string): string {
  if (!text) return '';
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    throw new Error("⚠️ Unable to encode to Base64.");
  }
}

export function decodeBase64(base64Text: string): string {
  const clean = base64Text.trim();
  if (!clean) return '';

  // Support URL-safe base64 (- and _)
  let sanitized = clean
    .replace(/\s+/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Pad missing '=' padding
  while (sanitized.length % 4 !== 0) {
    sanitized += '=';
  }

  // Check valid base64 pattern
  if (!/^[A-Za-z0-9+/=]+$/.test(sanitized)) {
    throw new Error("⚠️ This doesn't appear to be valid Base64. If you want to encode this message, click '🔒 Encode Message'!");
  }

  try {
    const binary = atob(sanitized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder('utf-8').decode(bytes);
    return decoded;
  } catch (err: any) {
    throw new Error("⚠️ This doesn't appear to be valid Base64. If you want to encode this message, click '🔒 Encode Message'!");
  }
}

// --- English Text Scoring Utility ---
function scoreEnglishText(text: string): { score: number; matchedWords: string[] } {
  const words = text.toUpperCase().replace(/[^A-Z\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return { score: 0, matchedWords: [] };

  const matchedWords: string[] = [];
  let score = 0;

  for (const w of words) {
    if (COMMON_ENGLISH_WORDS.has(w)) {
      matchedWords.push(w);
      score += w.length > 2 ? 3 : 1;
    }
  }

  // Bonus for letter frequency distribution (E, T, A, O, I, N are most frequent in English)
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (letters.length >= 6) {
    const etaoinCount = (letters.match(/[ETAOIN]/g) || []).length;
    const ratio = etaoinCount / letters.length;
    if (ratio > 0.45 && ratio < 0.75) {
      score += 2;
    }
  }

  return { score, matchedWords };
}

export interface DetectionResult {
  cipherKey: 'binary' | 'morse' | 'base64' | 'caesar' | 'rot13' | 'atbash' | 'reverse' | 'unknown';
  cipherName: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidencePercentage: number;
  reason: string;
  shift?: number;
  suggestedDecodedText?: string;
}

// --- Smart Auto Detection ---
export function autoDetectCipher(input: string): DetectionResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      cipherKey: 'unknown',
      cipherName: 'Unknown',
      confidence: 'Low',
      confidencePercentage: 0,
      reason: 'Please enter a secret message to detect its cipher format.',
    };
  }

  // 1. Binary Detection
  const strippedSpaces = trimmed.replace(/\s+/g, '');
  if (/^[01]+$/.test(strippedSpaces) && strippedSpaces.length >= 8) {
    try {
      const decoded = decodeBinary(trimmed);
      return {
        cipherKey: 'binary',
        cipherName: 'Binary',
        confidence: 'High',
        confidencePercentage: 98,
        reason: 'Message contains only 0s and 1s organized in standard byte/bit patterns.',
        suggestedDecodedText: decoded,
      };
    } catch {
      // still looks like binary
      return {
        cipherKey: 'binary',
        cipherName: 'Binary',
        confidence: 'High',
        confidencePercentage: 90,
        reason: 'Binary structure detected (0s and 1s).',
      };
    }
  }

  // 2. Morse Code Detection
  if (/^[.\-—– /\\\s]+$/.test(trimmed) && /[.\-]/.test(trimmed)) {
    try {
      const decoded = decodeMorse(trimmed);
      return {
        cipherKey: 'morse',
        cipherName: 'Morse Code',
        confidence: 'High',
        confidencePercentage: 96,
        reason: 'Message strictly contains dots, dashes, and Morse letter separators.',
        suggestedDecodedText: decoded,
      };
    } catch {
      return {
        cipherKey: 'morse',
        cipherName: 'Morse Code',
        confidence: 'High',
        confidencePercentage: 88,
        reason: 'Format matches Morse code patterns (dots and dashes).',
      };
    }
  }

  // 3. Base64 Detection
  const b64Candidate = trimmed.replace(/\s+/g, '');
  if (
    /^[A-Za-z0-9+/]+={0,2}$/.test(b64Candidate) &&
    b64Candidate.length >= 8 &&
    b64Candidate.length % 4 === 0 &&
    /[A-Z]/.test(b64Candidate) &&
    /[a-z]/.test(b64Candidate)
  ) {
    try {
      const decoded = decodeBase64(b64Candidate);
      const isClean = /^[\x20-\x7E\s]+$/.test(decoded);
      if (isClean && decoded.length > 0) {
        return {
          cipherKey: 'base64',
          cipherName: 'Base64',
          confidence: 'High',
          confidencePercentage: 92,
          reason: 'Valid Base64 encoding with typical padding and character distribution.',
          suggestedDecodedText: decoded,
        };
      }
    } catch {
      // not valid base64
    }
  }

  // 4. Reverse Text Check
  const reversed = reverseText(trimmed);
  const revScore = scoreEnglishText(reversed);
  const rawScore = scoreEnglishText(trimmed);
  if (revScore.score >= 3 && revScore.score > rawScore.score + 2) {
    return {
      cipherKey: 'reverse',
      cipherName: 'Reverse Text',
      confidence: 'Medium',
      confidencePercentage: 78,
      reason: `Reversing the letters reveals common English words like "${revScore.matchedWords.slice(0, 3).join(', ')}".`,
      suggestedDecodedText: reversed,
    };
  }

  // 5. ROT13 Check (Shift 13)
  const rot13Candidate = rot13(trimmed);
  const rot13Score = scoreEnglishText(rot13Candidate);
  if (rot13Score.score >= 3 && rot13Score.score > rawScore.score) {
    return {
      cipherKey: 'rot13',
      cipherName: 'ROT13',
      confidence: 'High',
      confidencePercentage: 89,
      reason: `A 13-letter rotation reveals readable words like "${rot13Score.matchedWords.slice(0, 3).join(', ')}".`,
      suggestedDecodedText: rot13Candidate,
    };
  }

  // 6. Caesar Shifts 1..25 Check
  let bestShift = 0;
  let bestCaesarScore = 0;
  let bestCaesarDecoded = '';
  let bestCaesarWords: string[] = [];

  for (let shift = 1; shift <= 25; shift++) {
    if (shift === 13) continue; // ROT13 checked separately
    const decoded = decodeCaesar(trimmed, shift);
    const score = scoreEnglishText(decoded);
    if (score.score > bestCaesarScore) {
      bestCaesarScore = score.score;
      bestShift = shift;
      bestCaesarDecoded = decoded;
      bestCaesarWords = score.matchedWords;
    }
  }

  // 7. Atbash Check
  const atbashCandidate = atbash(trimmed);
  const atbashScore = scoreEnglishText(atbashCandidate);

  // Compare Caesar vs Atbash
  if (atbashScore.score > bestCaesarScore && atbashScore.score >= 3 && atbashScore.score > rawScore.score) {
    return {
      cipherKey: 'atbash',
      cipherName: 'Atbash Cipher',
      confidence: atbashScore.score > 5 ? 'High' : 'Medium',
      confidencePercentage: Math.min(88, 60 + atbashScore.score * 5),
      reason: `Atbash alphabet inversion uncovers words like "${atbashScore.matchedWords.slice(0, 3).join(', ')}".`,
      suggestedDecodedText: atbashCandidate,
    };
  }

  if (bestCaesarScore >= 3 && bestCaesarScore > rawScore.score) {
    return {
      cipherKey: 'caesar',
      cipherName: `Caesar Cipher (Shift ${bestShift})`,
      confidence: bestCaesarScore > 5 ? 'High' : 'Medium',
      confidencePercentage: Math.min(94, 65 + bestCaesarScore * 5),
      shift: bestShift,
      reason: `Decoded with Shift ${bestShift} reveals familiar words like "${bestCaesarWords.slice(0, 3).join(', ')}".`,
      suggestedDecodedText: bestCaesarDecoded,
    };
  }

  // 8. If text is already plain English
  if (rawScore.score >= 4) {
    return {
      cipherKey: 'unknown',
      cipherName: 'Plain English Text',
      confidence: 'Medium',
      confidencePercentage: 70,
      reason: 'This message already looks like readable English text. You can encode it using one of the ciphers below!',
    };
  }

  // Default: Ambiguous cipher
  return {
    cipherKey: 'unknown',
    cipherName: 'Ambiguous / Custom Cipher',
    confidence: 'Low',
    confidencePercentage: 35,
    reason: 'The pattern is not distinctly matched by simple deterministic rules. Try the AI Cipher Detective for deeper analysis.',
  };
}
