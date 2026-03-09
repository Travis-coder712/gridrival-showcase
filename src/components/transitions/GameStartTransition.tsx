/**
 * Cinematic transition that plays when the host starts the game.
 *
 * CRITICAL: Uses pure CSS animations + a single window.setTimeout for dismiss.
 * No React state changes during the animation — all visual sequencing is done
 * via CSS animation-delay. This prevents React re-renders from interfering.
 */
import { useRef } from 'react';
import { playBoltZap, playTitleBoom, playStatPing, playFlashWhoosh } from '../../lib/transitionAudio';

interface GameStartTransitionProps {
  isVisible: boolean;
  teamCount: number;
  totalRounds: number;
  gameMode?: string;
  onComplete: () => void;
}

function getModeLabel(totalRounds: number, gameMode?: string): string {
  if (gameMode === 'first_run') return 'First Run JD Remix';
  if (gameMode === 'progressive') return 'Progressive';
  if (totalRounds <= 1) return 'Beginner Intro';
  if (totalRounds <= 4) return 'Experienced Replay';
  if (totalRounds <= 8) return 'Quick Game';
  return 'Full Simulation';
}

const TOTAL_DURATION_MS = 4500;

export default function GameStartTransition({ isVisible, teamCount, totalRounds, gameMode, onComplete }: GameStartTransitionProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // NUCLEAR OPTION: Schedule dismiss entirely outside React.
  const mountedRef = useRef(false);
  if (isVisible && !mountedRef.current) {
    mountedRef.current = true;
    queueMicrotask(() => {
      const el = document.querySelector('[data-game-transition]');
      if (el && !el.getAttribute('data-timeout-set')) {
        el.setAttribute('data-timeout-set', 'true');
        // Schedule sound effects to match CSS animation timings
        window.setTimeout(() => playBoltZap(), 150);
        window.setTimeout(() => playTitleBoom(), 1000);
        window.setTimeout(() => playStatPing(0), 2000);
        window.setTimeout(() => playStatPing(1), 2150);
        window.setTimeout(() => playStatPing(2), 2300);
        window.setTimeout(() => playFlashWhoosh(), 3700);
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
      data-game-transition="true"
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{ animation: 'gsTransFadeIn 0.3s ease-out forwards' }}
    >
      <style>{`
        @keyframes gsTransFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gsTransBgPulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        @keyframes gsTransHLine {
          0% { transform: scaleX(0); opacity: 0; }
          50% { transform: scaleX(1); opacity: 0.4; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes gsTransVLine {
          0% { opacity: 0; transform: scaleY(0); }
          40% { opacity: 0.5; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(0); }
        }
        @keyframes gsTransBoltIn {
          0% { transform: scale(0) rotate(-20deg); }
          70% { transform: scale(1.1) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes gsTransGlow {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 0.6; }
        }
        @keyframes gsTransTitleIn {
          0% { opacity: 0; transform: translateY(40px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gsTransLineGrow {
          0% { width: 0; }
          100% { width: 100%; }
        }
        @keyframes gsTransSubtitle {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes gsTransStatPop {
          0% { opacity: 0; transform: scale(0); }
          70% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes gsTransFlash {
          0% { opacity: 0; }
          30% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes gsTransPathDraw {
          0% { stroke-dashoffset: 200; fill-opacity: 0; }
          100% { stroke-dashoffset: 0; fill-opacity: 1; }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-navy-950">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(49,130,206,0.15) 0%, transparent 60%)',
            animation: 'gsTransBgPulse 2s ease-in-out 2',
          }}
        />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-electric-500/20"
            style={{
              top: `${12 + i * 12}%`,
              transformOrigin: 'left',
              animation: `gsTransHLine 1.5s ${0.1 * i}s ease-out forwards`,
              opacity: 0,
            }}
          />
        ))}
        {[...Array(6)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${15 + i * 14}%`,
              background: 'linear-gradient(to bottom, transparent, rgba(71,167,255,0.3), transparent)',
              animation: `gsTransVLine 2s ${0.3 + i * 0.15}s ease-in-out forwards`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Bolt Icon — appears at 0.15s */}
        <div
          className="mb-6"
          style={{
            animation: 'gsTransBoltIn 0.6s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          <div className="relative inline-block">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(71,167,255,0.4) 0%, transparent 70%)',
                width: '200px', height: '200px',
                left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                animation: 'gsTransGlow 1.5s ease-in-out 2',
              }}
            />
            <svg viewBox="0 0 64 64" className="w-24 h-24 md:w-32 md:h-32 mx-auto relative" fill="none">
              <path
                d="M38 4L14 36h14l-4 24 24-32H34l4-24z"
                fill="url(#start-bolt-gradient)"
                stroke="rgba(71,167,255,0.8)"
                strokeWidth="1.5"
                style={{
                  strokeDasharray: 200,
                  animation: 'gsTransPathDraw 0.6s 0.2s ease-out both',
                }}
              />
              <defs>
                <linearGradient id="start-bolt-gradient" x1="14" y1="4" x2="48" y2="60">
                  <stop offset="0%" stopColor="#75bdff" />
                  <stop offset="50%" stopColor="#47a7ff" />
                  <stop offset="100%" stopColor="#3182ce" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Title — appears at 1s */}
        <div style={{ animation: 'gsTransTitleIn 0.6s 1s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
          <h1
            className="font-mono text-5xl md:text-7xl font-extrabold text-white tracking-wider mb-2"
            style={{ textShadow: '0 0 60px rgba(71,167,255,0.5), 0 0 120px rgba(71,167,255,0.2)' }}
          >
            MARKET OPEN
          </h1>
          <div
            className="h-0.5 bg-gradient-to-r from-transparent via-electric-400 to-transparent mx-auto max-w-md mb-4"
            style={{ animation: 'gsTransLineGrow 0.6s 1.2s ease-out both', width: 0 }}
          />
          <p
            className="text-electric-300 text-lg md:text-xl font-medium tracking-widest"
            style={{ animation: 'gsTransSubtitle 0.4s 1.3s ease-out both' }}
          >
            {getModeLabel(totalRounds, gameMode)}
          </p>
        </div>

        {/* Stats — appear at 2s */}
        <div
          className="mt-8 flex items-center justify-center gap-8"
          style={{ animation: 'gsTransSubtitle 0.5s 2s ease-out both' }}
        >
          {[
            { value: teamCount, label: 'Teams' },
            { value: '5', label: 'Regions' },
            { value: 'NEM', label: 'Market' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="text-center"
              style={{ animation: `gsTransStatPop 0.4s ${2 + i * 0.15}s cubic-bezier(0.34, 1.56, 0.64, 1) both` }}
            >
              <div className="text-3xl md:text-4xl font-mono font-bold text-white">{stat.value}</div>
              <div className="text-xs text-navy-400 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Flash overlay — at 3.7s */}
      <div
        className="absolute inset-0 bg-white z-50 pointer-events-none"
        style={{
          animation: 'gsTransFlash 0.6s 3.7s ease-out both',
          opacity: 0,
        }}
      />
    </div>
  );
}
