import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  decodeBinary,
  decodeMorse,
  decodeBase64,
  autoDetectCipher,
  rot13,
} from './src/utils/ciphers.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Shared Gemini AI instance
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
    return null;
  }
}

// Local heuristic fallback for Detective mode if API is unreachable
function getLocalDetectiveAnalysis(message: string) {
  const trimmed = message.trim();

  // 1. Binary
  if (/^[01\s]+$/.test(trimmed) && trimmed.replace(/\s+/g, '').length >= 8) {
    try {
      const decoded = decodeBinary(trimmed);
      return {
        possibleCipher: 'Binary Code (8-bit ASCII)',
        confidence: '96%',
        why: 'The message consists exclusively of 0s and 1s structured as 8-bit bytes representing ASCII characters.',
        suggestedDecode: decoded,
        otherPossibilities: ['Hexadecimal / Base16 byte stream', 'Baudot Code'],
        isReliable: true,
        detectedCipherKey: 'binary',
        suggestedShift: 0,
      };
    } catch {}
  }

  // 2. Morse Code
  if (/^[.\- /\\\s]+$/.test(trimmed) && /[.\-]/.test(trimmed)) {
    try {
      const decoded = decodeMorse(trimmed);
      return {
        possibleCipher: 'International Morse Code',
        confidence: '95%',
        why: 'The ciphertext matches standard telegraph dots (.), dashes (-), and inter-letter spacing.',
        suggestedDecode: decoded,
        otherPossibilities: ['Wabun Code', 'American Morse Code'],
        isReliable: true,
        detectedCipherKey: 'morse',
        suggestedShift: 0,
      };
    } catch {}
  }

  // 3. Base64
  try {
    const decoded = decodeBase64(trimmed);
    if (decoded && /^[\x20-\x7E\s]+$/.test(decoded) && decoded.length > 0) {
      return {
        possibleCipher: 'Base64 Encoding',
        confidence: '90%',
        why: 'The message conforms to Base64 6-bit character groupings and decoding produces clean printable text.',
        suggestedDecode: decoded,
        otherPossibilities: ['Base32 Encoding', 'Radix-64 ASCII Armor'],
        isReliable: true,
        detectedCipherKey: 'base64',
        suggestedShift: 0,
      };
    }
  } catch {}

  // 4. Auto detect dictionary / Caesar / Atbash / ROT13
  const auto = autoDetectCipher(trimmed);
  if (auto.suggestedDecodedText && auto.cipherKey !== 'unknown') {
    return {
      possibleCipher: auto.cipherName,
      confidence: `${auto.confidencePercentage}%`,
      why: auto.reason,
      suggestedDecode: auto.suggestedDecodedText,
      otherPossibilities: ['Vigenère Cipher (with short keyword)', 'Monoalphabetic Substitution'],
      isReliable: true,
      detectedCipherKey: auto.cipherKey,
      suggestedShift: auto.shift || 0,
    };
  }

  // 5. Default graceful analysis
  return {
    possibleCipher: 'Caesar Cipher or Substitution',
    confidence: '55%',
    why: 'The text exhibits letter distribution patterns consistent with an alphabetic substitution or rotation cipher.',
    suggestedDecode: rot13(trimmed),
    otherPossibilities: ['Atbash Inversion', 'Vigenère Cipher'],
    isReliable: false,
    detectedCipherKey: 'caesar',
    suggestedShift: 3,
  };
}

// Local educational fallback for Explainer mode
function getLocalExplanation(
  cipher: string,
  _originalMessage: string,
  _resultMessage: string,
  shift?: number,
  mode = 'decode'
) {
  const c = (cipher || '').toLowerCase();

  if (c.includes('caesar')) {
    const s = shift || 3;
    return {
      cipherName: `Caesar Cipher (Shift ${s})`,
      summary: `A foundational substitution cipher named after Julius Caesar, who used it to communicate securely with Roman generals.`,
      howItWorks: `Every letter in the alphabet is shifted forward or backward by ${s} positions. When shifting past 'Z', it wraps around back to 'A'.`,
      stepByStep:
        mode === 'decode'
          ? `Each letter was shifted backwards by ${s} slots in the alphabet: (letter - ${s}) mod 26. Numbers, spaces, and punctuation were preserved.`
          : `Each letter was shifted forwards by ${s} slots in the alphabet: (letter + ${s}) mod 26. Numbers, spaces, and punctuation were preserved.`,
      miniExample: `With shift ${s}: "A" becomes "${String.fromCharCode(
        65 + s
      )}" when encoding, and shifts back to "A" when decoding.`,
      funFact: `Julius Caesar used a shift of 3 around 58 BC. Because most adversaries at the time could not read Latin, this simple substitution provided formidable security!`,
    };
  }

  if (c.includes('rot13')) {
    return {
      cipherName: 'ROT13',
      summary: 'A reciprocal Caesar cipher with a fixed shift of 13 positions in the 26-letter Latin alphabet.',
      howItWorks: 'Since the Latin alphabet has 26 letters, rotating forward by 13 twice returns you back to the exact starting letter (13 + 13 = 26).',
      stepByStep: 'Every letter was rotated by 13 places. The exact same operation is used for both encoding and decoding.',
      miniExample: '"A" becomes "N", "HELLO" becomes "URYYB", and "URYYB" becomes "HELLO".',
      funFact: 'ROT13 became popular in 1980s Usenet forums to hide movie spoilers, offensive jokes, and puzzle solutions from accidental viewing!',
    };
  }

  if (c.includes('atbash')) {
    return {
      cipherName: 'Atbash Cipher',
      summary: 'An ancient Hebrew substitution cipher where the alphabet is completely reversed from end to end.',
      howItWorks: 'The first letter of the alphabet pairs with the last letter (A ↔ Z), the second with the second-to-last (B ↔ Y), and so forth.',
      stepByStep: 'Each letter was mirrored across the alphabet midpoint: code(Z) - (code(letter) - code(A)).',
      miniExample: '"A" becomes "Z", "B" becomes "Y", and "HELLO" becomes "SVOOL".',
      funFact: 'The Atbash cipher dates back to 500 BC and is found in the biblical Book of Jeremiah, where "Sheshach" was used as an Atbash code for "Babel" (Babylon)!',
    };
  }

  if (c.includes('morse')) {
    return {
      cipherName: 'International Morse Code',
      summary: 'A telecommunication method that encodes text as standardized sequences of short and long signals (dots and dashes).',
      howItWorks: 'Each letter and number is mapped to unique pulses: a dot is 1 unit of time, and a dash is equal to 3 dots.',
      stepByStep:
        mode === 'decode'
          ? 'Dits (.) and dahs (-) separated by spaces were matched against the International Morse dictionary to reconstruct words.'
          : 'Each character was translated into its telegraphic dot/dash pattern, with spaces between letters and slashes between words.',
      miniExample: '"E" is a single dot (.) because it is the most frequent letter in English! "T" is a single dash (-). "SOS" is ... --- ...',
      funFact: 'Samuel Morse and Alfred Vail invented Morse code in the 1830s. The distress call "SOS" was chosen in 1905 simply because "... --- ..." is unmistakable and quick to tap!',
    };
  }

  if (c.includes('binary')) {
    return {
      cipherName: 'Binary Code (ASCII/UTF-8)',
      summary: 'The fundamental language of digital computers, representing data using only 0s and 1s.',
      howItWorks: 'Computers store text as numbers. Under the ASCII standard, each character corresponds to an 8-bit byte composed of eight electrical switches (bits).',
      stepByStep:
        mode === 'decode'
          ? 'Each 8-digit binary byte was converted from base-2 to base-10, then mapped to its corresponding UTF-8 character.'
          : 'Each character was converted to its numerical ASCII code, then formatted into an 8-bit binary string (like 01001000 for "H").',
      miniExample: '"A" has ASCII code 65, which is 01000001 in binary (64 + 1 = 65). "B" is 01000010 (64 + 2 = 66).',
      funFact: 'Gottfried Wilhelm Leibniz documented modern binary in 1679, inspired by the ancient Chinese I Ching! Today, trillions of transistors process binary billions of times per second.',
    };
  }

  if (c.includes('base64')) {
    return {
      cipherName: 'Base64 Encoding',
      summary: 'A binary-to-text encoding scheme that translates raw bytes into 64 safe, printable ASCII characters.',
      howItWorks: 'It takes 3 bytes of data (24 bits) and splits them into 4 groups of 6 bits each. Each 6-bit value (0 to 63) indexes an alphabet of A-Z, a-z, 0-9, +, and /.',
      stepByStep:
        mode === 'decode'
          ? 'The 6-bit Base64 index values were reassembled into 8-bit bytes to restore the original UTF-8 characters.'
          : 'The raw text bytes were partitioned into 6-bit chunks and mapped to safe ASCII characters, with "=" used for padding.',
      miniExample: '"Man" encodes to "TWFu". Padding with "=" occurs when input bytes are not divisible by 3.',
      funFact: 'Base64 was developed for MIME email attachments because early email systems only supported 7-bit ASCII and would corrupt binary files like images or executables!',
    };
  }

  // Reverse text or general
  return {
    cipherName: cipher || 'Reverse Text',
    summary: 'A mirror transposition cipher where the reading order of the characters is completely flipped.',
    howItWorks: 'Characters are indexed from back to front, preserving the letters themselves but reversing their sequence.',
    stepByStep: 'The string was read character by character starting from the end and moving towards the beginning.',
    miniExample: '"SECRET" becomes "TERCES". Words that read the same backwards (like "RACECAR" or "MADAM") are called palindromes!',
    funFact: 'Leonardo da Vinci wrote his famous journals in "mirror writing" from right to left, which required a mirror to read easily!',
  };
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    geminiAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint: AI Cipher Detective
app.post('/api/detective', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Please enter a message to analyze.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Return high-quality local analysis immediately without error
    const fallback = getLocalDetectiveAnalysis(message);
    return res.json(fallback);
  }

  try {
    const prompt = `Analyze this mysterious secret message from a student cryptography perspective:
"${message.trim().slice(0, 2000)}"

Examine the characters, structure, symbols, and letter distributions. Identify the most likely cipher (e.g., Caesar Cipher with shift, Atbash Cipher, ROT13, Morse Code, Binary, Base64, Reverse Text, Substitution, Vigenere, Hex, etc.).
Important rules:
1. Do not invent a successful decode when the evidence is weak. If the message cannot be reliably decoded or is too short/random, set isReliable to false and explain that more clues are needed.
2. If it matches a known cipher, show the exact decoded message.
3. Suggest up to 2 other possibilities if applicable.
4. Keep the explanation engaging and accessible for students.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            possibleCipher: {
              type: Type.STRING,
              description: 'Name of the primary cipher identified, including shift or variant if applicable.',
            },
            confidence: {
              type: Type.STRING,
              description: 'Confidence percentage or rating (e.g., "85%" or "High (90%)").',
            },
            why: {
              type: Type.STRING,
              description: 'Short explanation of why this cipher fits the patterns.',
            },
            suggestedDecode: {
              type: Type.STRING,
              description: 'The decoded plain text if found, or an honest note if undecodable.',
            },
            otherPossibilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Up to 2 alternative cipher interpretations.',
            },
            isReliable: {
              type: Type.BOOLEAN,
              description: 'True if there is reliable evidence for the decode, false if speculative.',
            },
            detectedCipherKey: {
              type: Type.STRING,
              description: 'One of: caesar, rot13, atbash, morse, binary, base64, reverse, unknown',
            },
            suggestedShift: {
              type: Type.INTEGER,
              description: 'If Caesar cipher, suggested shift number from 1 to 25. Otherwise 0.',
            },
          },
          required: [
            'possibleCipher',
            'confidence',
            'why',
            'suggestedDecode',
            'otherPossibilities',
            'isReliable',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Gemini detective error, using local analysis fallback:', err);
    // Never fail with 500: return intelligent local analysis
    const fallback = getLocalDetectiveAnalysis(message);
    return res.json(fallback);
  }
});

// Endpoint: AI Explain Decode
app.post('/api/explain', async (req, res) => {
  const { cipher, originalMessage, resultMessage, shift, mode } = req.body;
  if (!originalMessage || !resultMessage) {
    return res.status(400).json({ error: 'Missing message parameters to explain.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Return structured educational explanation immediately
    const fallback = getLocalExplanation(cipher, originalMessage, resultMessage, shift, mode);
    return res.json(fallback);
  }

  try {
    const prompt = `You are a friendly, encouraging cryptography teacher explaining secret codes to students.
Explain the following ${mode === 'encode' ? 'encoding' : 'decoding'} operation:
- Cipher Used: ${cipher}${shift ? ` (Shift: ${shift})` : ''}
- Original Message: "${originalMessage.slice(0, 500)}"
- Result Message: "${resultMessage.slice(0, 500)}"
- Operation: ${mode}

Provide a structured, beginner-friendly explanation containing:
1. What cipher was used
2. How it works conceptually
3. Exactly what happened step-by-step to the original message
4. A small, simple 1-word or 2-letter example
5. A fun historical or puzzle fact about this cipher.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cipherName: { type: Type.STRING },
            summary: { type: Type.STRING, description: '1-2 sentence high level summary' },
            howItWorks: { type: Type.STRING, description: 'How the cipher works conceptually' },
            stepByStep: { type: Type.STRING, description: 'Step by step breakdown of the transformation' },
            miniExample: { type: Type.STRING, description: 'A tiny illustrative example' },
            funFact: { type: Type.STRING, description: 'Interesting trivia or historical background' },
          },
          required: ['cipherName', 'summary', 'howItWorks', 'stepByStep', 'miniExample', 'funFact'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Gemini explainer error, using local fallback:', err);
    // Never fail with 500: return structured educational explanation
    const fallback = getLocalExplanation(cipher, originalMessage, resultMessage, shift, mode);
    return res.json(fallback);
  }
});

// Setup server Vite / Static
async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mystery Message Decoder server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
