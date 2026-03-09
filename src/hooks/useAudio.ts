import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Procedural ambient audio using Web Audio API.
 * Generates a warm, cinematic pad sound — no external files needed.
 * Falls back to an MP3 file if provided and available.
 *
 * When autoStart is true, audio begins on the first user interaction
 * (click/touch/keydown) with the page. Browsers block autoplay without
 * a user gesture, so this is the earliest we can start.
 */
export function useAudio(mp3Src?: string, autoStart = false) {
  // Don't play audio when loaded inside an iframe (e.g. trailer screenshots)
  const inIframe = typeof window !== 'undefined' && window.self !== window.top;
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const modeRef = useRef<'webaudio' | 'mp3'>('webaudio');
  const autoStartedRef = useRef(false);

  // Try to load MP3 if provided
  useEffect(() => {
    if (mp3Src) {
      const audio = new Audio(mp3Src);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = 'auto';

      audio.addEventListener('canplaythrough', () => {
        audioRef.current = audio;
        modeRef.current = 'mp3';
      });
      audio.addEventListener('error', () => {
        // MP3 not available, will use Web Audio API
        modeRef.current = 'webaudio';
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [mp3Src]);

  const startWebAudio = useCallback(() => {
    const ctx = new AudioContext();
    contextRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    // Create a warm ambient pad with multiple detuned oscillators
    const frequencies = [65.41, 98, 130.81, 196, 261.63]; // C2, G2, C3, G3, C4
    const oscNodes: OscillatorNode[] = [];

    for (const freq of frequencies) {
      // Main oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(freq < 100 ? 0.15 : freq < 200 ? 0.08 : 0.04, ctx.currentTime);

      // Slow LFO for movement
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.05 + Math.random() * 0.1, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(freq * 0.003, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      oscNodes.push(osc);

      // Slight detune for richness
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.002, ctx.currentTime);
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(freq < 100 ? 0.08 : 0.03, ctx.currentTime);
      osc2.connect(osc2Gain);
      osc2Gain.connect(masterGain);
      osc2.start();
      oscNodes.push(osc2);
    }

    nodesRef.current = oscNodes;

    // Fade in
    masterGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2);
  }, []);

  const stopWebAudio = useCallback(() => {
    if (gainRef.current && contextRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, contextRef.current.currentTime + 1);
      setTimeout(() => {
        nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
        nodesRef.current = [];
        contextRef.current?.close();
        contextRef.current = null;
        gainRef.current = null;
      }, 1200);
    }
  }, []);

  const startMp3 = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return false;

    audio.play().then(() => {
      // Fade in
      let vol = 0;
      const interval = setInterval(() => {
        vol += 0.012;
        audio.volume = Math.min(0.25, vol);
        if (vol >= 0.25) clearInterval(interval);
      }, 50);
    }).catch(() => {});
    return true;
  }, []);

  const stopMp3 = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const startVol = audio.volume;
    let vol = startVol;
    const interval = setInterval(() => {
      vol -= 0.015;
      audio.volume = Math.max(0, vol);
      if (vol <= 0) {
        clearInterval(interval);
        audio.pause();
      }
    }, 50);
  }, []);

  const toggle = useCallback(() => {
    if (inIframe) return; // No audio in iframes
    if (isPlaying) {
      if (modeRef.current === 'mp3' && audioRef.current) {
        stopMp3();
      } else {
        stopWebAudio();
      }
      setIsPlaying(false);
    } else {
      if (modeRef.current === 'mp3' && audioRef.current) {
        startMp3();
      } else {
        startWebAudio();
      }
      setIsPlaying(true);
    }
  }, [isPlaying, startWebAudio, stopWebAudio, startMp3, stopMp3]);

  // Auto-start on first user gesture (click / touch / key)
  useEffect(() => {
    if (!autoStart || autoStartedRef.current || inIframe) return;

    const start = () => {
      if (autoStartedRef.current) return;
      autoStartedRef.current = true;

      if (modeRef.current === 'mp3' && audioRef.current) {
        startMp3();
      } else {
        startWebAudio();
      }
      setIsPlaying(true);

      document.removeEventListener('click', start);
      document.removeEventListener('touchstart', start);
      document.removeEventListener('keydown', start);
    };

    document.addEventListener('click', start, { once: true });
    document.addEventListener('touchstart', start, { once: true });
    document.addEventListener('keydown', start, { once: true });

    return () => {
      document.removeEventListener('click', start);
      document.removeEventListener('touchstart', start);
      document.removeEventListener('keydown', start);
    };
  }, [autoStart, startWebAudio, startMp3]);

  // Pause audio when tab loses visibility (e.g. trailer opens in new tab)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isPlaying) {
        if (modeRef.current === 'mp3' && audioRef.current) {
          stopMp3();
        } else {
          stopWebAudio();
        }
        setIsPlaying(false);
        autoStartedRef.current = false; // allow re-autostart on return
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPlaying, stopMp3, stopWebAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
      contextRef.current?.close();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return { isPlaying, toggle };
}
