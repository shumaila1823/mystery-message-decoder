/**
 * Morse Code Audio Synthesizer using Web Audio API
 * Generates classic 700Hz telegraph beeps for dots (.) and dashes (-)
 */

class MorseAudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private stopFlag = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public stop() {
    this.stopFlag = true;
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public async playMorse(
    morseCode: string,
    wpm = 18,
    onProgress?: (charIndex: number) => void,
    onFinish?: () => void
  ): Promise<void> {
    this.initContext();
    if (!this.audioCtx) return;

    this.isPlaying = true;
    this.stopFlag = false;

    // Standard Paris unit timing: unit time = 1200 / WPM ms
    const dotMs = 1200 / wpm;
    const dashMs = dotMs * 3;
    const intraSymbolPauseMs = dotMs;
    const interLetterPauseMs = dotMs * 3;
    const interWordPauseMs = dotMs * 7;
    const frequency = 700; // pleasant 700Hz tone

    const playTone = (durationMs: number): Promise<void> => {
      return new Promise((resolve) => {
        if (!this.audioCtx || this.stopFlag) {
          resolve();
          return;
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

        // Anti-click soft envelope (5ms attack & decay)
        const attack = 0.005;
        const decay = 0.005;
        const now = this.audioCtx.currentTime;
        const durSec = durationMs / 1000;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + attack);
        gain.gain.setValueAtTime(0.18, now + durSec - decay);
        gain.gain.linearRampToValueAtTime(0, now + durSec);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + durSec);

        setTimeout(() => {
          resolve();
        }, durationMs);
      });
    };

    const sleep = (ms: number): Promise<void> =>
      new Promise((res) => setTimeout(res, ms));

    try {
      const symbols = Array.from(morseCode);
      for (let i = 0; i < symbols.length; i++) {
        if (this.stopFlag) break;
        onProgress?.(i);
        const char = symbols[i];

        if (char === '.') {
          await playTone(dotMs);
          await sleep(intraSymbolPauseMs);
        } else if (char === '-' || char === '—' || char === '–') {
          await playTone(dashMs);
          await sleep(intraSymbolPauseMs);
        } else if (char === ' ') {
          await sleep(interLetterPauseMs);
        } else if (char === '/') {
          await sleep(interWordPauseMs);
        }
      }
    } finally {
      this.isPlaying = false;
      this.stopFlag = false;
      onFinish?.();
    }
  }
}

export const morseAudio = new MorseAudioSynthesizer();
