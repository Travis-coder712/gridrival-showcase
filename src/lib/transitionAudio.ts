/**
 * Procedural sound effects for game transitions using Web Audio API.
 * All sounds are synthesised — no audio files needed.
 *
 * Design goals:
 *  - Electric/energy market theme (zaps, power hums, cinematic booms)
 *  - Short, punchy cues that sync to animation stages
 *  - Graceful failure — if AudioContext is blocked, nothing crashes
 */

let sharedCtx: AudioContext | null = null;

// Suppress all audio when loaded inside an iframe (e.g. trailer screenshots)
const _inIframe = typeof window !== 'undefined' && window.self !== window.top;

function getCtx(): AudioContext | null {
  if (_inIframe) return null;
  try {
    if (!sharedCtx || sharedCtx.state === 'closed') {
      sharedCtx = new AudioContext();
    }
    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

// ─── Game Start: "MARKET OPEN" sequence ──────────────────────────────

/**
 * Stage 1: Electric zap when lightning bolt appears.
 * Quick burst of white noise + high sine sweep down.
 */
export function playBoltZap() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.25, t);
  master.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  master.connect(ctx.destination);

  // White noise burst (electric crackle)
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(4000, t);
  noiseFilter.frequency.exponentialRampToValueAtTime(800, t + 0.15);
  noiseFilter.Q.value = 2;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.6, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(t);
  noise.stop(t + 0.2);

  // Descending sine sweep (zap tone)
  const sweep = ctx.createOscillator();
  sweep.type = 'sine';
  sweep.frequency.setValueAtTime(2400, t);
  sweep.frequency.exponentialRampToValueAtTime(120, t + 0.3);
  const sweepGain = ctx.createGain();
  sweepGain.gain.setValueAtTime(0.3, t);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  sweep.connect(sweepGain);
  sweepGain.connect(master);
  sweep.start(t);
  sweep.stop(t + 0.4);
}

/**
 * Stage 2: Deep cinematic boom when "MARKET OPEN" title appears.
 * Low sub-bass hit with a layered mid-range impact.
 */
export function playTitleBoom() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.35, t);
  master.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
  master.connect(ctx.destination);

  // Sub bass hit (40-60 Hz punch)
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(60, t);
  sub.frequency.exponentialRampToValueAtTime(35, t + 0.8);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.7, t);
  subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
  sub.connect(subGain);
  subGain.connect(master);
  sub.start(t);
  sub.stop(t + 1.6);

  // Mid-range impact layer
  const mid = ctx.createOscillator();
  mid.type = 'triangle';
  mid.frequency.setValueAtTime(180, t);
  mid.frequency.exponentialRampToValueAtTime(80, t + 0.5);
  const midGain = ctx.createGain();
  midGain.gain.setValueAtTime(0.25, t);
  midGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  mid.connect(midGain);
  midGain.connect(master);
  mid.start(t);
  mid.stop(t + 0.7);

  // Short noise transient for punch
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) {
    nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 4);
  }
  const noiseHit = ctx.createBufferSource();
  noiseHit.buffer = noiseBuf;
  const hitGain = ctx.createGain();
  hitGain.gain.setValueAtTime(0.2, t);
  hitGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  noiseHit.connect(hitGain);
  hitGain.connect(master);
  noiseHit.start(t);
  noiseHit.stop(t + 0.1);
}

/**
 * Stage 3: Subtle stat reveal ping — a bright chime.
 * Called once per stat counter.
 */
export function playStatPing(index: number) {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Ascending pitch per stat
  const baseFreqs = [523.25, 659.25, 783.99]; // C5, E5, G5
  const freq = baseFreqs[index % baseFreqs.length];

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.15, t);
  master.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  master.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);

  // Slight shimmer with a detuned pair
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 1.005, t);

  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.6;
  const osc2Gain = ctx.createGain();
  osc2Gain.gain.value = 0.3;

  osc.connect(oscGain);
  osc2.connect(osc2Gain);
  oscGain.connect(master);
  osc2Gain.connect(master);

  osc.start(t);
  osc2.start(t);
  osc.stop(t + 0.5);
  osc2.stop(t + 0.5);
}

/**
 * Stage 4: White flash whoosh — short breathy sweep upward.
 */
export function playFlashWhoosh() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.2, t);
  master.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  master.connect(ctx.destination);

  // Filtered noise sweep
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    d[i] = (Math.random() * 2 - 1);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, t);
  filter.frequency.exponentialRampToValueAtTime(6000, t + 0.3);
  filter.Q.value = 1.5;

  noise.connect(filter);
  filter.connect(master);
  noise.start(t);
  noise.stop(t + 0.45);
}

// ─── Round Start: per-round bidding transition ──────────────────────

/**
 * Stage 1: Number slam impact — heavy thud when round number drops in.
 */
export function playRoundSlam() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.3, t);
  master.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
  master.connect(ctx.destination);

  // Deep kick drum-style hit
  const kick = ctx.createOscillator();
  kick.type = 'sine';
  kick.frequency.setValueAtTime(150, t);
  kick.frequency.exponentialRampToValueAtTime(40, t + 0.15);
  const kickGain = ctx.createGain();
  kickGain.gain.setValueAtTime(0.8, t);
  kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  kick.connect(kickGain);
  kickGain.connect(master);
  kick.start(t);
  kick.stop(t + 0.7);

  // Click transient for attack
  const click = ctx.createOscillator();
  click.type = 'square';
  click.frequency.setValueAtTime(1200, t);
  click.frequency.exponentialRampToValueAtTime(200, t + 0.02);
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.15, t);
  clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  click.connect(clickGain);
  clickGain.connect(master);
  click.start(t);
  click.stop(t + 0.05);
}

/**
 * Stage 2: Title reveal — warm rising tone.
 */
export function playTitleReveal() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.12, t);
  master.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  master.connect(ctx.destination);

  // Rising 5th interval (C4 -> G4)
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(261.63, t);
  osc.frequency.exponentialRampToValueAtTime(392, t + 0.4);
  osc.connect(master);
  osc.start(t);
  osc.stop(t + 0.8);

  // Harmonic shimmer
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(523.25, t + 0.1);
  osc2.frequency.exponentialRampToValueAtTime(784, t + 0.5);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.06, t + 0.1);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  osc2.connect(g2);
  g2.connect(master);
  osc2.start(t + 0.1);
  osc2.stop(t + 0.8);
}

/**
 * Stage 3: Season badge appearance — gentle atmospheric chime.
 */
export function playSeasonChime() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.1, t);
  master.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  master.connect(ctx.destination);

  // Two-note bell tone (major 3rd)
  const freqs = [440, 554.37]; // A4, C#5
  for (const freq of freqs) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 1.1);

    // Second harmonic for bell character
    const h = ctx.createOscillator();
    h.type = 'sine';
    h.frequency.value = freq * 2.756; // Inharmonic overtone for bell timbre
    const hg = ctx.createGain();
    hg.gain.setValueAtTime(0.08, t);
    hg.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    h.connect(hg);
    hg.connect(master);
    h.start(t);
    h.stop(t + 0.5);
  }
}

/**
 * Stage 4: Wipe transition — mechanical shutter sweep.
 */
export function playWipeSweep() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.18, t);
  master.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  master.connect(ctx.destination);

  // Descending filtered noise (shutter closing)
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    d[i] = (Math.random() * 2 - 1);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3000, t);
  filter.frequency.exponentialRampToValueAtTime(200, t + 0.35);
  filter.Q.value = 3;

  noise.connect(filter);
  filter.connect(master);
  noise.start(t);
  noise.stop(t + 0.4);

  // Low thud as bars close
  const thud = ctx.createOscillator();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(80, t + 0.05);
  thud.frequency.exponentialRampToValueAtTime(30, t + 0.3);
  const thudGain = ctx.createGain();
  thudGain.gain.setValueAtTime(0.2, t + 0.05);
  thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  thud.connect(thudGain);
  thudGain.connect(master);
  thud.start(t + 0.05);
  thud.stop(t + 0.45);
}
