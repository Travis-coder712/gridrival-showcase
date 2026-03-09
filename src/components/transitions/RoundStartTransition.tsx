/**
 * Cinematic transition that plays at the start of each bidding round.
 *
 * CRITICAL: This component uses pure CSS animations + a single window.setTimeout
 * for auto-dismiss. All previous approaches using React useEffect + multiple
 * setTimeout calls failed because React's lifecycle (re-renders, HMR, effect
 * cleanup) would kill or restart the timers, leaving the overlay stuck.
 *
 * The new approach:
 * 1. CSS @keyframes handle ALL visual animation (no React state changes during animation)
 * 2. A single window.setTimeout fires once on mount to dismiss after the total duration
 * 3. The dismiss timeout ID is stored on `window` so React cannot interfere with it
 */
import { useRef } from 'react';
import type { Season } from '../../../shared/types';
import { playRoundSlam, playTitleReveal, playSeasonChime, playWipeSweep } from '../../lib/transitionAudio';

interface RoundStartTransitionProps {
  isVisible: boolean;
  roundNumber: number;
  totalRounds: number;
  roundName: string;
  season: Season;
  onComplete: () => void;
}

const SEASON_CONFIG: Record<string, { icon: string; label: string; color: string; bgGradient: string }> = {
  summer: {
    icon: '🔥', label: 'SUMMER', color: '#f56565',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(245,101,101,0.2) 0%, transparent 60%)',
  },
  autumn: {
    icon: '🍂', label: 'AUTUMN', color: '#d69e2e',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(214,158,46,0.2) 0%, transparent 60%)',
  },
  winter: {
    icon: '❄️', label: 'WINTER', color: '#63b3ed',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(99,179,237,0.2) 0%, transparent 60%)',
  },
  spring: {
    icon: '🌱', label: 'SPRING', color: '#48bb78',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(72,187,120,0.2) 0%, transparent 60%)',
  },
};

const TOTAL_DURATION_MS = 4500;

export default function RoundStartTransition({
  isVisible, roundNumber, totalRounds, roundName, season, onComplete,
}: RoundStartTransitionProps) {
  const seasonCfg = SEASON_CONFIG[season] || SEASON_CONFIG.summer;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // NUCLEAR OPTION: Schedule dismiss entirely outside React.
  // When isVisible becomes true, we set a global window timeout that calls
  // onComplete. No refs, no guards, no React involvement whatsoever.
  // The timeout ID is stored on a data attribute on the DOM element itself.
  const mountedRef = useRef(false);
  if (isVisible && !mountedRef.current) {
    mountedRef.current = true;
    // Use queueMicrotask to ensure this runs after the current render
    queueMicrotask(() => {
      const el = document.querySelector('[data-round-transition]');
      if (el && !el.getAttribute('data-timeout-set')) {
        el.setAttribute('data-timeout-set', 'true');
        // Schedule sound effects to match CSS animation timings
        window.setTimeout(() => playRoundSlam(), 200);
        window.setTimeout(() => playTitleReveal(), 1100);
        window.setTimeout(() => playSeasonChime(), 2100);
        window.setTimeout(() => playWipeSweep(), 3600);
        window.setTimeout(() => {
          onCompleteRef.current();
        }, TOTAL_DURATION_MS);
      }
    });
  }
  if (!isVisible) {
    mountedRef.current = false;
  }

  if (!isVisible) return null;

  return (
    <div
      data-round-transition="true"
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{ animation: 'rsTransFadeIn 0.2s ease-out forwards' }}
    >
      {/* Inline keyframes — guarantees they exist even after HMR */}
      <style>{`
        @keyframes rsTransFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rsTransBgPulse { 0% { opacity: 0.3; } 50% { opacity: 0.8; } 100% { opacity: 0.3; } }
        @keyframes rsTransLineGrow { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
        @keyframes rsTransRoundSlam {
          0% { transform: scale(4); opacity: 0; }
          60% { transform: scale(0.9); opacity: 1; }
          80% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rsTransTitleSlide {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rsTransSeasonPop {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rsTransBadgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes rsTransProgressFill {
          0% { width: ${((roundNumber - 1) / totalRounds) * 100}%; }
          100% { width: ${(roundNumber / totalRounds) * 100}%; }
        }
        @keyframes rsTransWipeIn {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes rsTransFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes rsTransVertLine {
          0% { opacity: 0; transform: scaleY(0); }
          40% { opacity: 0.6; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(0); }
        }
        @keyframes rsTransSpotlight {
          0%   { left: 15%; top: 70%; transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
          8%   { left: 15%; top: 70%; transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          25%  { left: 80%; top: 25%; transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
          45%  { left: 25%; top: 20%; transform: translate(-50%, -50%) scale(0.7); opacity: 0.5; }
          65%  { left: 70%; top: 65%; transform: translate(-50%, -50%) scale(0.85); opacity: 0.6; }
          85%  { left: 50%; top: 45%; transform: translate(-50%, -50%) scale(1.0); opacity: 0.9; }
          100% { left: 50%; top: 45%; transform: translate(-50%, -50%) scale(1.0); opacity: 1; }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-navy-950">
        {/* Animated spotlight that roams around then settles on the text */}
        <div
          className="absolute"
          style={{
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${seasonCfg.color}30 0%, ${seasonCfg.color}10 35%, transparent 70%)`,
            animation: 'rsTransSpotlight 3.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-full w-1"
            style={{
              left: `${10 + i * 20}%`,
              background: `linear-gradient(to bottom, transparent 20%, ${seasonCfg.color}20 50%, transparent 80%)`,
              transform: 'skewX(-15deg)',
              animation: `rsTransVertLine 1.8s ${0.15 * i}s ease-in-out forwards`,
              opacity: 0,
            }}
          />
        ))}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(to right, transparent, ${seasonCfg.color}, transparent)`,
            transformOrigin: 'left',
            animation: 'rsTransLineGrow 1.5s 0.3s ease-out forwards',
            transform: 'scaleX(0)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-2xl px-6">
        {/* Round Number — slams in at 0.2s */}
        <div
          className="mb-2"
          style={{
            animation: 'rsTransRoundSlam 0.6s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          <div className="text-sm font-mono uppercase tracking-[0.4em] text-navy-400 mb-2">Round</div>
          <div
            className="font-mono text-8xl md:text-9xl font-black"
            style={{ color: seasonCfg.color, textShadow: `0 0 80px ${seasonCfg.color}80, 0 0 160px ${seasonCfg.color}30` }}
          >
            {roundNumber}
          </div>
        </div>

        {/* Title — slides in at 1.1s */}
        <div
          style={{
            animation: 'rsTransTitleSlide 0.5s 1.1s ease-out both',
          }}
        >
          <div
            className="h-px mx-auto max-w-sm mb-5"
            style={{
              background: `linear-gradient(to right, transparent, ${seasonCfg.color}80, transparent)`,
              transformOrigin: 'left',
              animation: 'rsTransLineGrow 0.5s 1.1s ease-out both',
            }}
          />
          <h2
            className="text-2xl md:text-3xl font-bold text-white tracking-wide"
            style={{ textShadow: '0 0 40px rgba(255,255,255,0.1)' }}
          >
            {roundName}
          </h2>
        </div>

        {/* Season badge + progress — appears at 2.1s */}
        <div
          className="mt-8"
          style={{
            animation: 'rsTransSeasonPop 0.5s 2.1s ease-out both',
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-6"
            style={{
              borderColor: `${seasonCfg.color}40`,
              backgroundColor: `${seasonCfg.color}10`,
              animation: 'rsTransBadgePop 0.4s 2.2s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            <span className="text-xl">{seasonCfg.icon}</span>
            <span className="text-sm font-mono font-bold tracking-widest" style={{ color: seasonCfg.color }}>
              {seasonCfg.label}
            </span>
          </div>

          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-[10px] font-mono text-navy-500 mb-1.5">
              <span>ROUND {roundNumber}</span>
              <span>OF {totalRounds}</span>
            </div>
            <div className="w-full h-1.5 bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: seasonCfg.color,
                  animation: `rsTransProgressFill 0.8s 2.3s ease-out both`,
                  width: `${((roundNumber - 1) / totalRounds) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wipe-out bands — start at 3.6s */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`wipe-${i}`}
          className="absolute left-0 right-0 z-50"
          style={{
            top: `${i * (100 / 6)}%`,
            height: `${100 / 6 + 1}%`,
            backgroundColor: i % 2 === 0 ? '#08101c' : '#0f1f38',
            transformOrigin: i % 2 === 0 ? 'left' : 'right',
            animation: `rsTransWipeIn 0.4s ${3.6 + i * 0.05}s cubic-bezier(0.22, 1, 0.36, 1) both`,
            transform: 'scaleX(0)',
          }}
        />
      ))}
    </div>
  );
}
