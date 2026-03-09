/**
 * AudioManager (Improvement 4.1)
 * Web Audio API-based sound effect system using synthesized tones (no audio files needed).
 * Provides countdown beeps, clearing price reveals, profit/loss sounds, and phase transitions.
 */

let audioCtx: AudioContext | null = null;
let _muted = false;

function getCtx(): AudioContext | null {
  if (_muted) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playChord(freqs: number[], duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  freqs.forEach(f => playTone(f, duration, type, volume));
}

export const AudioManager = {
  /** Mute/unmute all sounds */
  get muted() { return _muted; },
  set muted(val: boolean) { _muted = val; },
  toggle() { _muted = !_muted; return _muted; },

  /** Countdown beep — plays for last 10 seconds of bidding timer */
  countdownBeep(secondsLeft: number) {
    if (secondsLeft <= 0) return;
    if (secondsLeft <= 3) {
      // Urgent: higher pitch, louder
      playTone(880, 0.15, 'square', 0.25);
    } else if (secondsLeft <= 10) {
      // Normal countdown beep
      playTone(660, 0.1, 'sine', 0.15);
    }
  },

  /** Time's up — bidding ended */
  timesUp() {
    playTone(440, 0.3, 'square', 0.3);
    setTimeout(() => playTone(330, 0.5, 'square', 0.3), 350);
  },

  /** Bid submitted successfully */
  bidSubmitted() {
    playTone(523, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 100);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.2), 200);
  },

  /** Clearing price reveal — dramatic ascending tone */
  clearingPriceReveal() {
    const freqs = [262, 330, 392, 523];
    freqs.forEach((f, i) => {
      setTimeout(() => playTone(f, 0.2, 'triangle', 0.2), i * 150);
    });
  },

  /** Profit sound — happy ascending chord */
  profitSound(amount: number) {
    if (amount > 100000) {
      // Big profit — triumphant chord
      playChord([523, 659, 784], 0.5, 'triangle', 0.15);
      setTimeout(() => playChord([587, 740, 880], 0.6, 'triangle', 0.15), 300);
    } else if (amount > 0) {
      // Small profit — pleasant ding
      playChord([523, 659, 784], 0.4, 'sine', 0.1);
    }
  },

  /** Loss sound — descending tone */
  lossSound() {
    playTone(440, 0.2, 'sine', 0.15);
    setTimeout(() => playTone(370, 0.2, 'sine', 0.15), 200);
    setTimeout(() => playTone(330, 0.3, 'sine', 0.15), 400);
  },

  /** Round start — attention grab */
  roundStart() {
    playTone(523, 0.15, 'triangle', 0.2);
    setTimeout(() => playTone(659, 0.15, 'triangle', 0.2), 150);
    setTimeout(() => playTone(784, 0.25, 'triangle', 0.25), 300);
  },

  /** Game over — fanfare */
  gameOver() {
    const melody = [
      { freq: 523, delay: 0 },
      { freq: 659, delay: 200 },
      { freq: 784, delay: 400 },
      { freq: 1047, delay: 600 },
    ];
    melody.forEach(n => {
      setTimeout(() => playTone(n.freq, 0.4, 'triangle', 0.2), n.delay);
    });
  },

  /** Phase transition click */
  click() {
    playTone(800, 0.05, 'sine', 0.1);
  },

  /** Error / warning buzz */
  error() {
    playTone(200, 0.15, 'sawtooth', 0.1);
    setTimeout(() => playTone(200, 0.15, 'sawtooth', 0.1), 200);
  },

  /** Team disconnected — soft alert for host */
  teamDisconnected() {
    playTone(440, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(349, 0.25, 'sine', 0.12), 180);
  },

  /** Team reconnected — gentle positive */
  teamReconnected() {
    playTone(523, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 120);
  },

  /** Initialize audio context on user interaction */
  init() {
    getCtx();
  },
};

export default AudioManager;
