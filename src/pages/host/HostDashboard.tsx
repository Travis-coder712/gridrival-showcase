import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { formatCurrency, formatCurrencyFull, formatMW, formatPrice, formatNumber } from '../../lib/formatters';
import { ASSET_ICONS } from '../../lib/colors';
import MeritOrderChart from '../../components/charts/MeritOrderChart';
import MeritOrderWalkthrough from '../../components/charts/MeritOrderWalkthrough';
import ProfitLossBar from '../../components/charts/ProfitLossBar';
import LeaderboardChart from '../../components/charts/LeaderboardChart';
import GameStartTransition from '../../components/transitions/GameStartTransition';
import RoundStartTransition from '../../components/transitions/RoundStartTransition';
import RoundSummary from '../../components/host/RoundSummary';
import RoundBriefing from '../../components/host/RoundBriefing';
import HowToBidTutorial from '../../components/game/HowToBidTutorial';
import StrategyGuide from '../../components/game/StrategyGuide';
import TeachingPromptCard from '../../components/host/TeachingPromptCard';
import MarketSnapshotCard from '../../components/host/MarketSnapshotCard';
import type { TimePeriod, RoundAnalysis, PeriodAnalysis, TeamAnalysis, AssetType, AssetInfo, DispatchedBand, TeamPublicInfo } from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS, SEASON_LABELS, ASSET_TYPE_LABELS } from '../../../shared/types';
import AudioManager from '../../lib/AudioManager';

export default function HostDashboard() {
  const navigate = useNavigate();
  const {
    connected, gameState, roundResults, biddingTimeRemaining,
    bidStatus, minigameStatus, minigameScores, allBidsIn, timerPaused, lastBalancing, teamScreenData,
    startRound, startBidding, endBidding, nextRound, resetGame, setDemand, applySurprises, viewTeamScreen,
    clearHostSession, inviteToTeam, lastInviteCode, clearInviteCode,
    pauseTimer, resumeTimer, jumpToRound, completeMinigameRound,
  } = useSocket();
  const [qrData, setQrData] = useState<{ qrDataUrl: string; joinUrl: string } | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'merit' | 'profit' | 'leaderboard' | 'slides' | 'analysis' | 'dispatch' | 'team_view' | 'walkthrough'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('day_peak');
  const [demandEdits, setDemandEdits] = useState<Record<string, number>>({});
  const [demandEditMode, setDemandEditMode] = useState(false);
  const [viewingTeamId, setViewingTeamId] = useState<string>('');
  const [showDispatchTables, setShowDispatchTables] = useState(false);

  // Transition overlays — triggered directly from button clicks (host only).
  // No socket effects, no timers to cancel, no dedup logic needed.
  const [showGameStart, setShowGameStart] = useState(false);
  const [showRoundStart, setShowRoundStart] = useState(false);
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [showRoundBriefing, setShowRoundBriefing] = useState(false);
  const [showHowToBid, setShowHowToBid] = useState(false);
  const [showStrategyGuide, setShowStrategyGuide] = useState(false);

  // Invite code modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTeamName, setInviteTeamName] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);

  // Jump-to-round (host testing / restart)
  const [showJumpToRound, setShowJumpToRound] = useState(false);
  const [jumpTargetRound, setJumpTargetRound] = useState(1);

  // WiFi config for display in lobby
  const [wifiConfig, setWifiConfig] = useState<{ networkName: string; password: string; qrDataUrl: string | null } | null>(null);
  const [showWifiOnScreen, setShowWifiOnScreen] = useState(false);

  // Minigame/explainer waiting phase — shown on host while teams play battery minigame or portfolio explainer
  const [minigameWaiting, setMinigameWaiting] = useState(false);
  const [minigameStartTime, setMinigameStartTime] = useState<number>(0);
  const [minigameElapsed, setMinigameElapsed] = useState(0);

  // Surprise events toggles (host-only, subtle, at bottom of sidebar)
  const [activeSurprises, setActiveSurprises] = useState<Set<string>>(new Set());
  const [surprisesExpanded, setSurprisesExpanded] = useState(false);
  const [surprisesApplied, setSurprisesApplied] = useState(false);

  // Auto-advance: show banner and countdown when all bids submitted (4.8)
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Disconnect alert: track teams that have been disconnected for 30+ seconds
  const [disconnectedAlerts, setDisconnectedAlerts] = useState<Map<string, { name: string; color: string; since: number }>>(new Map());
  const disconnectTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const prevTeamStatusRef = useRef<Map<string, boolean>>(new Map()); // teamId -> wasConnected

  // Derive phase early so hooks below can reference it safely
  const phase = gameState?.phase;

  // Show invite code modal when we receive one
  useEffect(() => {
    if (lastInviteCode) {
      const team = gameState?.teams?.find(t => t.id === lastInviteCode.teamId);
      setInviteTeamName(team?.name || lastInviteCode.teamId);
      setShowInviteModal(true);
      setInviteCopied(false);
    }
  }, [lastInviteCode, gameState?.teams]);

  useEffect(() => {
    if (allBidsIn && phase === 'bidding' && autoAdvanceCountdown === null) {
      // Start 5-second countdown
      setAutoAdvanceCountdown(5);
      autoAdvanceTimerRef.current = setInterval(() => {
        setAutoAdvanceCountdown(prev => {
          if (prev === null || prev <= 1) {
            // Auto-advance
            clearInterval(autoAdvanceTimerRef.current!);
            autoAdvanceTimerRef.current = null;
            endBidding();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    // Reset if bids are no longer all in or phase changes
    if ((!allBidsIn || phase !== 'bidding') && autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
      setAutoAdvanceCountdown(null);
    }
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
    };
  }, [allBidsIn, phase, endBidding]);

  // Track team disconnect/reconnect with 30-second grace period before alerting
  useEffect(() => {
    const teams: TeamPublicInfo[] = gameState?.teams || [];
    const currentStatus = new Map(teams.map(t => [t.id, t.isConnected]));
    const prevStatus = prevTeamStatusRef.current;

    for (const team of teams) {
      const wasConnected = prevStatus.get(team.id);
      const isNowConnected = team.isConnected;

      // Team just disconnected
      if (wasConnected === true && isNowConnected === false) {
        // Start 30-second timer before showing alert
        const timer = setTimeout(() => {
          setDisconnectedAlerts(prev => {
            const next = new Map(prev);
            next.set(team.id, { name: team.name, color: team.color, since: Date.now() });
            return next;
          });
          AudioManager.teamDisconnected();
        }, 30000);
        disconnectTimersRef.current.set(team.id, timer);
      }

      // Team reconnected — cancel any pending timer and clear alert
      if (wasConnected === false && isNowConnected === true) {
        const timer = disconnectTimersRef.current.get(team.id);
        if (timer) {
          clearTimeout(timer);
          disconnectTimersRef.current.delete(team.id);
        }
        setDisconnectedAlerts(prev => {
          if (!prev.has(team.id)) return prev;
          const next = new Map(prev);
          next.delete(team.id);
          AudioManager.teamReconnected();
          return next;
        });
      }
    }

    // Update previous status
    prevTeamStatusRef.current = currentStatus;

    // Cleanup timers on unmount
    return () => {
      disconnectTimersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, [gameState?.teams]);

  // Dismiss a single disconnect alert
  const dismissDisconnectAlert = useCallback((teamId: string) => {
    setDisconnectedAlerts(prev => {
      const next = new Map(prev);
      next.delete(teamId);
      return next;
    });
  }, []);

  // Wrapped handlers that show the transition, then call the socket action
  const handleStartRound = useCallback(() => {
    setShowGameStart(true);
    startRound();
  }, [startRound]);

  const handleStartBidding = useCallback(() => {
    setShowRoundStart(true);
    startBidding();
  }, [startBidding]);

  const handleNextRound = useCallback(() => {
    // No cinematic — Round Briefing will auto-show when phase becomes 'briefing'
    nextRound();
  }, [nextRound]);

  const handleStartBiddingWithSurprises = useCallback(() => {
    if (activeSurprises.size > 0 && !surprisesApplied) {
      applySurprises([...activeSurprises]);
      setSurprisesApplied(true);
      // Small delay to let server process, then start bidding
      setTimeout(() => {
        setShowRoundStart(true);
        startBidding();
      }, 200);
    } else {
      setShowRoundStart(true);
      startBidding();
    }
  }, [activeSurprises, surprisesApplied, applySurprises, startBidding]);

  const handleStartBiddingFromBriefing = useCallback(() => {
    setShowRoundBriefing(false);
    handleStartBiddingWithSurprises();
  }, [handleStartBiddingWithSurprises]);

  // Reset surprise state when round changes; auto-show minigame waiting for minigame rounds
  useEffect(() => {
    setActiveSurprises(new Set());
    setSurprisesApplied(false);
    setSurprisesExpanded(false);
    const rc = gameState?.roundConfig;
    if (rc?.batteryMiniGame || rc?.portfolioExplainer) {
      setMinigameWaiting(true);
      setMinigameStartTime(Date.now());
      setMinigameElapsed(0);
    } else {
      setMinigameWaiting(false);
    }
  }, [gameState?.currentRound]);

  // Auto-show Round Briefing when entering briefing phase (or minigame waiting screen for minigame rounds)
  const prevPhaseRef = useRef<string | null>(null);
  useEffect(() => {
    const phase = gameState?.phase;
    if (phase === 'briefing' && prevPhaseRef.current !== 'briefing' && gameState?.roundConfig && !showGameStart) {
      const rc = gameState.roundConfig;
      if (rc.batteryMiniGame || rc.portfolioExplainer) {
        // Minigame round: show waiting screen instead of round briefing
        setMinigameWaiting(true);
        setMinigameStartTime(Date.now());
        setMinigameElapsed(0);
      } else {
        setShowRoundBriefing(true);
      }
    }
    // Reset to overview when entering bidding phase
    if (phase === 'bidding' && prevPhaseRef.current !== 'bidding') {
      setActiveView('overview');
    }
    prevPhaseRef.current = phase || null;
  }, [gameState?.phase, gameState?.roundConfig, showGameStart]);

  // Count-up timer for minigame waiting screen
  useEffect(() => {
    if (!minigameWaiting) return;
    const interval = setInterval(() => {
      setMinigameElapsed(Math.floor((Date.now() - minigameStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [minigameWaiting, minigameStartTime]);

  // Sync demand edits when round config changes
  useEffect(() => {
    if (gameState?.roundConfig?.baseDemandMW) {
      setDemandEdits({ ...gameState.roundConfig.baseDemandMW });
      setDemandEditMode(false);
    }
  }, [gameState?.currentRound, gameState?.roundConfig?.baseDemandMW]);

  const handleDemandChange = useCallback((period: string, value: number) => {
    const fleetMW = gameState?.fleetInfo?.totalFleetMW[period] || Infinity;
    const capped = Math.min(Math.max(0, Math.round(value)), fleetMW);
    setDemandEdits(prev => ({ ...prev, [period]: capped }));
  }, [gameState?.fleetInfo?.totalFleetMW]);

  const handleDemandSave = useCallback(() => {
    setDemand(demandEdits);
    setDemandEditMode(false);
  }, [demandEdits, setDemand]);

  // Fetch QR code — with retry and abort for robustness across game restarts
  useEffect(() => {
    if (gameState?.gameId) {
      const controller = new AbortController();
      const fetchQR = (attempt = 0) => {
        fetch(`/api/game/${gameState.gameId}/qr`, { signal: controller.signal })
          .then(r => {
            if (!r.ok) throw new Error(`QR fetch failed: ${r.status}`);
            return r.json();
          })
          .then(data => setQrData(data))
          .catch(err => {
            if (err.name === 'AbortError') return;
            // Retry up to 4 times with increasing delay (covers race conditions on game restart)
            if (attempt < 4) {
              setTimeout(() => fetchQR(attempt + 1), 500 * (attempt + 1));
            } else {
              console.error('QR fetch failed after retries:', err);
            }
          });
      };
      fetchQR();
      return () => controller.abort();
    } else {
      setQrData(null);
    }
  }, [gameState?.gameId]);

  // Fetch WiFi config for lobby display
  useEffect(() => {
    fetch('/api/wifi')
      .then(r => r.json())
      .then(data => {
        if (data.wifi) {
          setWifiConfig({
            networkName: data.wifi.networkName,
            password: data.wifi.password,
            qrDataUrl: data.qrDataUrl || null,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-white text-lg mb-4">No game in progress</p>
          <button
            onClick={() => navigate('/host')}
            className="px-6 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-400"
          >
            Create Game
          </button>
        </div>
      </div>
    );
  }

  // phase already derived above for hooks; gameState is guaranteed non-null here
  const round = gameState.currentRound;
  const totalRounds = gameState.totalRounds;
  const teams = gameState.teams || [];
  const leaderboard = gameState.leaderboard || [];
  const roundConfig = gameState.roundConfig;
  const lastResults = gameState.lastRoundResults;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 to-navy-950">
      {/* Top Bar */}
      <div className="bg-navy-900/80 border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              if (window.confirm('Exit game? This will leave the current session.')) {
                await resetGame();
                clearHostSession();
                setQrData(null);
                navigate('/');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg text-xs transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Exit
          </button>
          <div>
            <h1 className="text-white font-bold text-sm">GridRival</h1>
            <p className="text-navy-400 text-xs">
              {round > 0 ? `Round ${round}/${totalRounds}` : 'Lobby'} &bull; {teams.length} teams
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {phase === 'bidding' && (
            <div className="flex items-center gap-2">
              <div className={`px-4 py-2 rounded-full font-mono font-bold text-lg ${
                timerPaused ? 'bg-amber-500/20 text-amber-300' :
                biddingTimeRemaining <= 30 ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-electric-500/20 text-electric-300'
              }`}>
                {timerPaused && <span className="text-xs mr-1">⏸</span>}
                {formatTime(biddingTimeRemaining)}
              </div>
              <button
                onClick={timerPaused ? resumeTimer : pauseTimer}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  timerPaused
                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                }`}
                title={timerPaused ? 'Resume timer' : 'Pause timer'}
              >
                {timerPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
            </div>
          )}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {connected ? '● Connected' : '● Disconnected'}
          </div>
        </div>
      </div>

      {/* Disconnect Alert Banner */}
      {disconnectedAlerts.size > 0 && (
        <div className="bg-red-500/15 border-b border-red-500/30 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-red-300 text-sm font-medium flex-shrink-0">
              <span className="animate-pulse">⚠️</span>
              <span>Team{disconnectedAlerts.size > 1 ? 's' : ''} disconnected:</span>
            </div>
            {[...disconnectedAlerts.entries()].map(([teamId, info]) => (
              <div key={teamId} className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 rounded-full text-sm">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                <span className="text-red-200 font-medium">{info.name}</span>
                <span className="text-red-400/70 text-xs ml-1">
                  {Math.floor((Date.now() - info.since) / 60000)}m ago
                </span>
                <button
                  onClick={() => dismissDisconnectAlert(teamId)}
                  className="ml-1 text-red-400/50 hover:text-red-300 transition-colors"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            ))}
            {qrData && (
              <div className="ml-auto flex items-center gap-2 text-xs text-red-300/70 flex-shrink-0">
                <span>Show QR to rejoin →</span>
                <button
                  onClick={() => {
                    // Scroll to QR section or show it
                    const el = document.getElementById('lobby-qr');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-red-200 rounded-lg transition-colors font-medium"
                >
                  📱 QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-[calc(100vh-56px)] max-h-[calc(100vh-56px)] overflow-y-auto bg-navy-900/50 border-r border-white/10 p-4 flex flex-col">
          {/* Phase indicator */}
          <div className="mb-6">
            <div className="text-xs text-navy-400 uppercase tracking-wide mb-2">Phase</div>
            <div className="px-3 py-2 bg-electric-500/10 border border-electric-500/30 rounded-lg text-electric-300 text-sm font-medium capitalize">
              {phase === 'lobby' ? '🏠 Lobby' :
               phase === 'briefing' && minigameWaiting ? (roundConfig?.batteryMiniGame ? '🔋 Minigame' : '📊 Explainer') :
               phase === 'briefing' ? '📋 Briefing' :
               phase === 'bidding' ? '💰 Bidding' :
               phase === 'dispatching' ? '⚙️ Dispatching' :
               phase === 'results' ? '📊 Results' :
               phase === 'final' ? '🏆 Game Over' : phase}
            </div>
          </div>

          {/* Game Controls */}
          <div className="mb-6 space-y-2">
            <div className="text-xs text-navy-400 uppercase tracking-wide mb-2">Controls</div>

            {phase === 'lobby' && (
              <button
                onClick={handleStartRound}
                disabled={teams.length < 2}
                className="w-full py-2.5 bg-electric-500 hover:bg-electric-400 text-white font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Start Round 1 →
              </button>
            )}

            {phase === 'briefing' && minigameWaiting && (
              roundConfig?.minigameOnlyRound ? (
                <button
                  onClick={() => {
                    completeMinigameRound();
                  }}
                  className={`w-full py-2.5 font-semibold rounded-lg transition-colors text-sm ${
                    teams.length > 0 && teams.every(t => minigameStatus[t.id])
                      ? 'bg-green-500 hover:bg-green-400 text-white animate-pulse-glow'
                      : 'bg-amber-500 hover:bg-amber-400 text-white'
                  }`}
                >
                  {teams.length > 0 && teams.every(t => minigameStatus[t.id])
                    ? 'Show Final Results →'
                    : 'End Challenge & Show Results →'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMinigameWaiting(false);
                    setShowRoundBriefing(true);
                  }}
                  className={`w-full py-2.5 font-semibold rounded-lg transition-colors text-sm ${
                    teams.length > 0 && teams.every(t => minigameStatus[t.id])
                      ? 'bg-green-500 hover:bg-green-400 text-white animate-pulse-glow'
                      : 'bg-white/10 hover:bg-white/20 text-navy-300 border border-white/10'
                  }`}
                >
                  {teams.length > 0 && teams.every(t => minigameStatus[t.id])
                    ? 'Continue to Briefing →'
                    : 'Skip to Briefing →'}
                </button>
              )
            )}

            {phase === 'briefing' && !minigameWaiting && !roundConfig?.minigameOnlyRound && (
              <>
                <button
                  onClick={handleStartBiddingWithSurprises}
                  className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg transition-colors text-sm animate-pulse-glow"
                >
                  {activeSurprises.size > 0 ? `Open Bidding 💰 (${activeSurprises.size} surprise${activeSurprises.size > 1 ? 's' : ''})` : 'Open Bidding 💰'}
                </button>
                <button
                  onClick={() => setShowRoundBriefing(true)}
                  className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium rounded-lg transition-colors text-sm border border-purple-500/30"
                >
                  📊 Round Briefing
                </button>
                <button
                  onClick={() => setShowHowToBid(true)}
                  className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium rounded-lg transition-colors text-sm border border-blue-500/30"
                >
                  📖 How to Bid
                </button>
                <button
                  onClick={() => setShowStrategyGuide(true)}
                  className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-medium rounded-lg transition-colors text-sm border border-indigo-500/30"
                >
                  🧠 Strategy Guide
                </button>
              </>
            )}

            {phase === 'bidding' && (
              <>
                <button
                  onClick={endBidding}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  End Bidding Early ⏱️
                </button>
                <button
                  onClick={() => setShowHowToBid(true)}
                  className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium rounded-lg transition-colors text-sm border border-blue-500/30"
                >
                  📖 How to Bid
                </button>
                <button
                  onClick={() => setShowStrategyGuide(true)}
                  className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-medium rounded-lg transition-colors text-sm border border-indigo-500/30"
                >
                  🧠 Strategy Guide
                </button>
              </>
            )}

            {phase === 'results' && (
              <button
                onClick={handleNextRound}
                className="w-full py-2.5 bg-electric-500 hover:bg-electric-400 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                {round >= totalRounds ? 'Finish Game 🏆' : `Next Round →`}
              </button>
            )}

            {phase === 'final' && (
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    await resetGame();
                    clearHostSession();
                    setQrData(null);
                    navigate('/host');
                  }}
                  className="w-full py-2.5 bg-electric-500 hover:bg-electric-400 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  New Game
                </button>
                <button
                  onClick={async () => {
                    await resetGame();
                    clearHostSession();
                    setQrData(null);
                    navigate('/');
                  }}
                  className="w-full py-2.5 bg-navy-600 hover:bg-navy-500 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="mb-6 space-y-1">
            <div className="text-xs text-navy-400 uppercase tracking-wide mb-2">Display</div>

            {/* Round Summary — prominent button, only when results exist (not for minigame-only rounds) */}
            {lastResults && gameState.lastRoundAnalysis && !roundConfig?.minigameOnlyRound && (
              <button
                onClick={() => setShowRoundSummary(true)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors mb-2"
              >
                🎯 Round Summary
              </button>
            )}

            {(['overview', 'analysis', 'walkthrough', 'dispatch', 'merit', 'profit', 'leaderboard', 'team_view', 'slides'] as const).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeView === view
                    ? 'bg-electric-500/20 text-electric-300 font-medium'
                    : 'text-navy-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {view === 'overview' ? '📋 Overview' :
                 view === 'analysis' ? '🔍 Round Analysis' :
                 view === 'walkthrough' ? '🎬 Walkthrough' :
                 view === 'dispatch' ? '⚡ Dispatch Overview' :
                 view === 'merit' ? '📊 Merit Order' :
                 view === 'profit' ? '💰 Profit/Loss' :
                 view === 'leaderboard' ? '🏆 Leaderboard' :
                 view === 'team_view' ? '👁 Team View' :
                 '📖 Slides'}
              </button>
            ))}
          </div>

          {/* Minigame / Explainer Status */}
          {phase === 'briefing' && (roundConfig?.batteryMiniGame || roundConfig?.portfolioExplainer) && (
            <div className="mb-6">
              <div className="text-xs text-navy-400 uppercase tracking-wide mb-2">
                {roundConfig?.minigameOnlyRound ? 'Challenge Scores' : roundConfig?.batteryMiniGame ? 'Battery Minigame' : 'Portfolio Explainer'}
              </div>
              <div className="space-y-1">
                {teams.map(team => {
                  const score = minigameScores.find(s => s.teamId === team.id);
                  return (
                    <div key={team.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        minigameStatus[team.id] ? 'bg-green-400' : 'bg-amber-400 animate-pulse'
                      }`} />
                      <span className="text-navy-300 truncate">{team.name}</span>
                      {roundConfig?.minigameOnlyRound && score ? (
                        <span className="ml-auto text-xs text-green-400 font-mono">
                          {formatCurrency(score.totalProfit)}
                        </span>
                      ) : (
                        <span className={`ml-auto text-xs ${minigameStatus[team.id] ? 'text-green-400' : 'text-amber-400'}`}>
                          {minigameStatus[team.id] ? 'Done' : 'In progress...'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {teams.length > 0 && teams.every(t => minigameStatus[t.id]) && (
                <div className="mt-2 text-xs text-green-400 font-medium">All teams ready!</div>
              )}
            </div>
          )}

          {/* Bid Status */}
          {phase === 'bidding' && (
            <div className="mb-6">
              <div className="text-xs text-navy-400 uppercase tracking-wide mb-2">Bid Status</div>
              <div className="space-y-1">
                {teams.map(team => (
                  <div key={team.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      bidStatus[team.id] ? 'bg-green-400' : 'bg-amber-400 animate-pulse'
                    }`} />
                    <span className="text-navy-300 truncate">{team.name}</span>
                    <span className={`ml-auto text-xs ${bidStatus[team.id] ? 'text-green-400' : 'text-amber-400'}`}>
                      {bidStatus[team.id] ? '✓' : '...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team List (lobby) */}
          {phase === 'lobby' && (
            <div className="flex-1">
              <div className="text-xs text-navy-400 uppercase tracking-wide mb-2">
                Teams ({teams.length}/{gameState.expectedTeamCount})
              </div>
              <div className="space-y-1">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                    <span className="text-white text-sm flex-1 truncate">{team.name}</span>
                    <button
                      onClick={() => inviteToTeam(team.id)}
                      className="text-[10px] text-navy-400 hover:text-electric-300 transition-colors px-1.5 py-0.5 hover:bg-white/5 rounded"
                      title="Generate invite link for observers"
                    >
                      🔗
                    </button>
                    <span className={`text-xs ${team.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                      {team.isConnected ? '●' : '○'}
                    </span>
                  </div>
                ))}
                {teams.length === 0 && (
                  <p className="text-navy-500 text-xs italic">Waiting for teams to join...</p>
                )}
              </div>
            </div>
          )}

          {/* Jump to Round — available in all non-bidding phases */}
          {phase !== 'bidding' && phase !== 'dispatching' && phase !== 'lobby' && teams.length >= 2 && (
            <div className="mb-4">
              <button
                onClick={() => setShowJumpToRound(!showJumpToRound)}
                className="w-full flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-300 transition-colors py-1"
              >
                <span>⏩</span>
                <span className="font-medium">Jump to Round</span>
              </button>
              {showJumpToRound && (
                <div className="mt-2 bg-white/5 border border-white/10 rounded-lg p-3 animate-fade-in">
                  <p className="text-navy-500 text-[10px] mb-2">
                    Jump ahead or restart from a specific round. Profits reset.
                  </p>
                  <select
                    value={jumpTargetRound}
                    onChange={e => setJumpTargetRound(Number(e.target.value))}
                    className="w-full bg-navy-800 border border-white/20 text-white text-xs rounded-lg px-2 py-1.5 mb-2"
                  >
                    {Array.from({ length: gameState.totalRounds || 0 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        R{i + 1}{gameState.roundNames?.[i] ? `: ${gameState.roundNames[i]}` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      jumpToRound(jumpTargetRound);
                      setShowJumpToRound(false);
                    }}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Jump to Round {jumpTargetRound} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Surprise Events — subtle, at bottom, scroll to find */}
          {(phase === 'briefing' || phase === 'bidding') && (
            <div className="mt-auto pt-4 border-t border-white/5">
              <button
                onClick={() => setSurprisesExpanded(!surprisesExpanded)}
                className="w-full flex items-center justify-between text-xs text-navy-600 hover:text-navy-400 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5">
                  <span>🎲</span>
                  <span className="font-medium">Game Mechanics</span>
                  {activeSurprises.size > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-400 text-[9px] font-bold flex items-center justify-center">
                      {activeSurprises.size}
                    </span>
                  )}
                </span>
                <span className={`transition-transform text-[10px] ${surprisesExpanded ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {surprisesExpanded && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[10px] text-navy-600 leading-tight px-1">
                    Secret modifiers — teams won't know these are active.
                    {phase === 'bidding' && <span className="text-amber-500 font-medium"> Locked during bidding.</span>}
                  </p>

                  {[
                    { id: 'generator_trip', icon: '🔧', name: 'Generator Trip', desc: 'Random thermal plant loses ~70% capacity. Tightens supply.', cat: 'supply' as const },
                    { id: 'demand_surge_heat', icon: '📈', name: 'Hot Day Surge', desc: 'Heatwave: +15-25% peak demand. Higher prices expected.', cat: 'demand' as const },
                    { id: 'demand_drop_solar', icon: '📉', name: 'Rooftop Solar', desc: 'Sunny day: -15-25% daytime demand. Prices drop.', cat: 'demand' as const },
                    { id: 'renewable_drought', icon: '🌫️', name: 'Dunkelflaute', desc: 'Wind to 30%, solar to 40%. Thermal more valuable.', cat: 'supply' as const },
                    { id: 'fuel_price_spike', icon: '⛽', name: 'Gas Price Spike', desc: 'Gas SRMC +50%. Coal becomes relatively cheaper.', cat: 'cost' as const },
                    { id: 'interconnector_outage', icon: '🔌', name: 'Interconnector Out', desc: 'All demand +10-20%. Broad price increase.', cat: 'demand' as const },
                  ].map(evt => {
                    const isActive = activeSurprises.has(evt.id);
                    const catColor = evt.cat === 'supply' ? 'text-red-400' : evt.cat === 'demand' ? 'text-blue-400' : 'text-amber-400';
                    const disabled = phase === 'bidding' || surprisesApplied;

                    return (
                      <button
                        key={evt.id}
                        onClick={() => {
                          if (disabled) return;
                          setActiveSurprises(prev => {
                            const next = new Set(prev);
                            if (next.has(evt.id)) next.delete(evt.id); else next.add(evt.id);
                            return next;
                          });
                        }}
                        disabled={disabled}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition-all ${
                          isActive
                            ? 'bg-amber-500/15 border border-amber-500/30'
                            : 'bg-white/3 border border-transparent hover:bg-white/5'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          {/* Toggle indicator */}
                          <div className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center transition-colors ${
                            isActive ? 'bg-amber-500 border-amber-400' : 'border-navy-600 bg-transparent'
                          }`}>
                            {isActive && <span className="text-[7px] text-white font-bold">✓</span>}
                          </div>
                          <span>{evt.icon}</span>
                          <span className={`font-medium ${isActive ? 'text-amber-300' : 'text-navy-400'}`}>{evt.name}</span>
                        </div>
                        <p className={`mt-0.5 pl-[22px] leading-tight ${isActive ? 'text-navy-400' : 'text-navy-600'}`}>
                          {evt.desc}
                        </p>
                      </button>
                    );
                  })}

                  {activeSurprises.size > 0 && !surprisesApplied && phase === 'briefing' && (
                    <div className="px-1 pt-1">
                      <p className="text-[10px] text-amber-500/70 italic">
                        {activeSurprises.size} surprise{activeSurprises.size > 1 ? 's' : ''} will activate when you open bidding.
                      </p>
                    </div>
                  )}
                  {surprisesApplied && (
                    <div className="px-1 pt-1">
                      <p className="text-[10px] text-green-500/70 italic">
                        ✓ Surprises applied this round.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Persistent Bidding Status Bar — visible in ALL views during bidding (except overview which has its own) */}
          {phase === 'bidding' && activeView !== 'overview' && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm">Bidding in Progress</span>
                  <span className="text-navy-300 text-xs">
                    {Object.values(bidStatus).filter(Boolean).length}/{teams.length} bids in
                  </span>
                </div>
                <div className={`text-xl font-mono font-bold ${
                  biddingTimeRemaining <= 30 ? 'text-red-400 animate-pulse' : 'text-electric-400'
                }`}>
                  {formatTime(biddingTimeRemaining)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {teams.map(team => (
                  <div key={team.id} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      bidStatus[team.id] ? 'bg-green-400' : 'bg-amber-400 animate-pulse'
                    }`} />
                    <span className={bidStatus[team.id] ? 'text-green-300' : 'text-navy-400'}>
                      {team.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lobby View */}
          {phase === 'lobby' && activeView === 'overview' && (
            <div className="max-w-2xl mx-auto text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-2">Waiting for Teams</h2>

              {/* Join Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-3xl font-bold text-electric-300">{teams.length}</span>
                  <span className="text-navy-400 text-lg">/</span>
                  <span className="text-3xl font-bold text-navy-400">{gameState.expectedTeamCount}</span>
                  <span className="text-navy-400 text-sm ml-2">teams joined</span>
                </div>
                <div className="w-64 mx-auto bg-navy-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-electric-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${(teams.length / (gameState.expectedTeamCount || 1)) * 100}%` }}
                  />
                </div>
                {teams.length >= (gameState.expectedTeamCount || 0) ? (
                  <p className="text-green-400 text-sm mt-2 font-medium">✓ All teams joined — ready to start!</p>
                ) : (
                  <p className="text-navy-400 text-sm mt-2">
                    Waiting for {(gameState.expectedTeamCount || 0) - teams.length} more team{(gameState.expectedTeamCount || 0) - teams.length !== 1 ? 's' : ''}...
                  </p>
                )}
              </div>

              {/* Team join status cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 text-left">
                {teams.map((team, i) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-2 px-3 py-2.5 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                    <span className="text-white text-sm font-medium truncate">{team.name}</span>
                    <span className="ml-auto text-green-400 text-xs flex-shrink-0">✓ Joined</span>
                  </div>
                ))}
                {/* Empty slots for teams not yet joined */}
                {Array.from({ length: Math.max(0, (gameState.expectedTeamCount || 0) - teams.length) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 border-dashed rounded-lg"
                  >
                    <div className="w-3 h-3 rounded-full bg-navy-600 flex-shrink-0 animate-pulse" />
                    <span className="text-navy-500 text-sm italic">Waiting...</span>
                  </div>
                ))}
              </div>

              {/* WiFi Display for projection */}
              {wifiConfig && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowWifiOnScreen(!showWifiOnScreen)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-3 ${
                      showWifiOnScreen
                        ? 'bg-electric-500 text-white'
                        : 'bg-white/10 text-navy-300 hover:bg-white/20'
                    }`}
                  >
                    📶 {showWifiOnScreen ? 'Hide WiFi Details' : 'Show WiFi for Room'}
                  </button>

                  {showWifiOnScreen && (
                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 shadow-2xl mb-4 text-center animate-fade-in">
                      <div className="text-5xl mb-3">📶</div>
                      <h3 className="text-white text-2xl font-bold mb-6">Connect to WiFi</h3>
                      <div className="flex items-center justify-center gap-8">
                        {/* WiFi QR Code */}
                        {wifiConfig.qrDataUrl && (
                          <div className="bg-white rounded-xl p-3">
                            <img src={wifiConfig.qrDataUrl} alt="WiFi QR" className="w-48 h-48" />
                            <p className="text-gray-500 text-xs mt-1">Scan to connect</p>
                          </div>
                        )}
                        {/* WiFi Details */}
                        <div className="text-left">
                          <div className="mb-4">
                            <div className="text-blue-200 text-sm font-medium">Network</div>
                            <div className="text-white text-3xl font-bold font-mono">{wifiConfig.networkName}</div>
                          </div>
                          <div>
                            <div className="text-blue-200 text-sm font-medium">Password</div>
                            <div className="text-white text-3xl font-bold font-mono tracking-wider">{wifiConfig.password || '(no password)'}</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-blue-200 text-sm mt-6">📱 Point your phone camera at the QR code to connect instantly</p>
                    </div>
                  )}
                </div>
              )}

              {qrData && (
                <div id="lobby-qr" className="bg-white rounded-2xl p-6 inline-block mb-6 shadow-xl">
                  <img src={qrData.qrDataUrl} alt="QR Code" className="w-64 h-64" />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(qrData.joinUrl).then(() => {
                        setUrlCopied(true);
                        setTimeout(() => setUrlCopied(false), 2000);
                      });
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-navy-100 hover:bg-navy-200 text-navy-700 rounded-lg transition-colors cursor-pointer group"
                    title="Click to copy URL"
                  >
                    <span className="text-sm font-mono break-all select-all">{qrData.joinUrl}</span>
                    <span className="flex-shrink-0 text-base opacity-60 group-hover:opacity-100 transition-opacity">
                      {urlCopied ? '✅' : '📋'}
                    </span>
                  </button>
                  {urlCopied && (
                    <p className="text-green-600 text-xs font-medium mt-1">Copied to clipboard!</p>
                  )}
                  {qrData.joinUrl.startsWith('https://') && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      <span>🌐</span> Public link — anyone with this URL can join
                    </div>
                  )}
                </div>
              )}

              <p className="text-navy-300 text-sm">
                {qrData?.joinUrl.startsWith('https://')
                  ? 'Share the QR code or URL with anyone — they can join from anywhere!'
                  : 'Teams scan the QR code above or navigate to the URL on their phones to join.'}
              </p>
              <p className="text-navy-500 text-xs mt-2">
                Game ID: <span className="font-mono text-electric-400">{gameState.gameId}</span>
              </p>

              {/* Jump to Round — host testing / restart after disconnect */}
              <div className="mt-6">
                <button
                  onClick={() => setShowJumpToRound(!showJumpToRound)}
                  className="text-xs text-navy-500 hover:text-navy-300 transition-colors underline underline-offset-2"
                >
                  {showJumpToRound ? 'Hide jump-to-round' : 'Jump to specific round...'}
                </button>
                {showJumpToRound && (
                  <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4 text-left animate-fade-in">
                    <div className="text-xs text-navy-400 uppercase tracking-wide mb-2">Jump to Round</div>
                    <p className="text-navy-400 text-xs mb-3">
                      Skip ahead to a specific round. Useful for testing or restarting after disconnections.
                      Team profits will be reset.
                    </p>
                    <div className="flex items-center gap-3">
                      <select
                        value={jumpTargetRound}
                        onChange={e => setJumpTargetRound(Number(e.target.value))}
                        className="bg-navy-800 border border-white/20 text-white text-sm rounded-lg px-3 py-2 flex-1"
                      >
                        {Array.from({ length: gameState.totalRounds || 0 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Round {i + 1}{gameState.roundNames?.[i] ? `: ${gameState.roundNames[i]}` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (teams.length >= 2) {
                            jumpToRound(jumpTargetRound);
                            setShowJumpToRound(false);
                          }
                        }}
                        disabled={teams.length < 2}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Jump →
                      </button>
                    </div>
                    {teams.length < 2 && (
                      <p className="text-amber-400/70 text-xs mt-2">Need at least 2 teams to start</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Minigame / Explainer Waiting Screen */}
          {phase === 'briefing' && roundConfig && minigameWaiting && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{roundConfig.batteryMiniGame ? '🔋' : '📊'}</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {roundConfig.minigameOnlyRound ? 'Battery Arbitrage Challenge' :
                   roundConfig.batteryMiniGame ? 'Battery Arbitrage Minigame' : 'Portfolio Strategy Explainer'}
                </h2>
                <p className="text-navy-300 text-sm">
                  {roundConfig.minigameOnlyRound
                    ? 'Teams are competing in the battery arbitrage challenge. Live scores update as teams finish.'
                    : roundConfig.batteryMiniGame
                      ? 'Teams are playing the battery arbitrage minigame and learning how battery bidding works.'
                      : 'Teams are reviewing portfolio strategy concepts before this round begins.'}
                </p>
              </div>

              {/* Count-up timer */}
              <div className="flex justify-center mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-center">
                  <div className="text-xs text-navy-400 uppercase tracking-wide mb-1">Time Elapsed</div>
                  <div className="text-4xl font-mono font-bold text-electric-300">
                    {Math.floor(minigameElapsed / 60)}:{String(minigameElapsed % 60).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Live Leaderboard for minigame-only rounds */}
              {roundConfig.minigameOnlyRound ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                  <div className="text-xs text-navy-400 uppercase tracking-wide mb-4">Live Leaderboard</div>

                  {/* Completed teams — sorted by profit descending */}
                  {(() => {
                    const completedTeams = teams
                      .filter(t => minigameStatus[t.id])
                      .map(t => {
                        const score = minigameScores.find(s => s.teamId === t.id);
                        return { team: t, score };
                      })
                      .sort((a, b) => (b.score?.totalProfit || 0) - (a.score?.totalProfit || 0));

                    const inProgressTeams = teams.filter(t => !minigameStatus[t.id]);

                    return (
                      <div className="space-y-2">
                        {completedTeams.map((entry, i) => (
                          <div
                            key={entry.team.id}
                            className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 animate-fade-in"
                          >
                            <div className="text-lg font-bold text-white w-8 text-center">
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </div>
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.team.color }} />
                            <span className="text-sm text-white font-medium flex-1">{entry.team.name}</span>
                            {entry.score && (
                              <>
                                <div className="text-right">
                                  <div className="text-sm font-mono font-bold text-green-400">
                                    {formatCurrency(entry.score.totalProfit)}
                                  </div>
                                  <div className="text-[10px] text-navy-400">profit</div>
                                </div>
                                <div className="text-right ml-3">
                                  <div className="text-sm font-mono font-bold text-electric-300">
                                    {entry.score.decisionsTotal > 0
                                      ? `${Math.round((entry.score.decisionsCorrect / entry.score.decisionsTotal) * 100)}%`
                                      : '—'}
                                  </div>
                                  <div className="text-[10px] text-navy-400">accuracy</div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}

                        {/* In-progress teams */}
                        {inProgressTeams.map(team => (
                          <div
                            key={team.id}
                            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                          >
                            <div className="w-8 text-center">
                              <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse mx-auto" />
                            </div>
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                            <span className="text-sm text-navy-300 font-medium flex-1">{team.name}</span>
                            <span className="text-sm text-amber-400 italic">Playing...</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm text-navy-300">
                      {teams.filter(t => minigameStatus[t.id]).length} of {teams.length} teams finished
                    </span>
                    {teams.length > 0 && teams.every(t => minigameStatus[t.id]) && (
                      <span className="text-sm font-semibold text-green-400 animate-pulse">All teams finished!</span>
                    )}
                  </div>
                </div>
              ) : (
                /* Standard done/not-done progress for non-standalone minigame rounds */
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                  <div className="text-xs text-navy-400 uppercase tracking-wide mb-4">Team Progress</div>
                  <div className="space-y-3">
                    {teams.map(team => {
                      const done = minigameStatus[team.id];
                      return (
                        <div key={team.id} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            done ? 'bg-green-400' : 'bg-amber-400 animate-pulse'
                          }`} />
                          <span className="text-sm text-white font-medium flex-1">{team.name}</span>
                          <span className={`text-sm font-medium ${done ? 'text-green-400' : 'text-amber-400'}`}>
                            {done ? '✓ Complete' : (roundConfig.batteryMiniGame ? 'Playing...' : 'Reading...')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm text-navy-300">
                      {teams.filter(t => minigameStatus[t.id]).length} of {teams.length} teams finished
                    </span>
                    {teams.length > 0 && teams.every(t => minigameStatus[t.id]) && (
                      <span className="text-sm font-semibold text-green-400 animate-pulse">All teams ready!</span>
                    )}
                  </div>
                </div>
              )}

              {/* Continue button */}
              <div className="text-center">
                {roundConfig.minigameOnlyRound ? (
                  <button
                    onClick={() => completeMinigameRound()}
                    className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
                      teams.length > 0 && teams.every(t => minigameStatus[t.id])
                        ? 'bg-green-500 hover:bg-green-400 text-white animate-pulse-glow'
                        : 'bg-amber-500 hover:bg-amber-400 text-white'
                    }`}
                  >
                    {teams.length > 0 && teams.every(t => minigameStatus[t.id])
                      ? 'Show Final Results →'
                      : 'End Challenge & Show Results →'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMinigameWaiting(false);
                      setShowRoundBriefing(true);
                    }}
                    className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
                      teams.length > 0 && teams.every(t => minigameStatus[t.id])
                        ? 'bg-green-500 hover:bg-green-400 text-white animate-pulse-glow'
                        : 'bg-white/10 hover:bg-white/20 text-navy-300 border border-white/10'
                    }`}
                  >
                    {teams.length > 0 && teams.every(t => minigameStatus[t.id])
                      ? 'Continue to Round Briefing →'
                      : 'Skip Waiting & Continue →'}
                  </button>
                )}
                {!(teams.length > 0 && teams.every(t => minigameStatus[t.id])) && !roundConfig.minigameOnlyRound && (
                  <p className="text-navy-500 text-xs mt-2">Some teams haven't finished yet</p>
                )}
              </div>
            </div>
          )}

          {/* Briefing View */}
          {phase === 'briefing' && roundConfig && !minigameWaiting && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="mb-6">
                <div className="text-sm text-electric-400 font-medium">Round {round}</div>
                <h2 className="text-3xl font-bold text-white">{roundConfig.name}</h2>
                <p className="text-navy-300 mt-2">{roundConfig.description}</p>
              </div>

              {/* Teaching Prompt Card (3.1) — host-only talking points */}
              {roundConfig.hostTeachingNotes && roundConfig.hostTeachingNotes.length > 0 && (
                <div className="mb-6">
                  <TeachingPromptCard
                    notes={roundConfig.hostTeachingNotes}
                    roundNumber={round}
                    roundName={roundConfig.name}
                  />
                </div>
              )}

              {roundConfig.educationalContent && (
                <div className="space-y-4">
                  {roundConfig.educationalContent.slides.map((slide, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">{slide.heading}</h3>
                      <div className="text-navy-300 text-sm whitespace-pre-line leading-relaxed">
                        {slide.body.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                          j % 2 === 0 ? part : <strong key={j} className="text-electric-300">{part}</strong>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Seasonal Guidance */}
              {roundConfig.seasonalGuidance && (
                <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">
                      {roundConfig.season === 'summer' ? '🔥' : roundConfig.season === 'winter' ? '❄️' : roundConfig.season === 'autumn' ? '🍂' : '🌱'}
                    </span>
                    <h3 className="text-sm font-semibold text-white">{roundConfig.seasonalGuidance.headline}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="text-xs font-semibold text-blue-300 mb-1">Demand</div>
                      <p className="text-xs text-navy-300 leading-relaxed">{roundConfig.seasonalGuidance.demandContext}</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <div className="text-xs font-semibold text-amber-300 mb-1">Supply</div>
                      <p className="text-xs text-navy-300 leading-relaxed">{roundConfig.seasonalGuidance.supplyContext}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="text-xs font-semibold text-green-300 mb-1">Bidding Strategy</div>
                      <p className="text-xs text-navy-300 leading-relaxed">{roundConfig.seasonalGuidance.biddingAdvice}</p>
                    </div>
                  </div>
                </div>
              )}

              {roundConfig.learningObjectives.length > 0 && (
                <div className="mt-6 bg-electric-500/10 border border-electric-500/20 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-electric-300 mb-2">Learning Objectives</h3>
                  <ul className="space-y-1">
                    {roundConfig.learningObjectives.map((obj, i) => (
                      <li key={i} className="text-sm text-navy-300 flex items-start gap-2">
                        <span className="text-electric-400 mt-0.5">•</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scenario Events */}
              {roundConfig.activeScenarioEvents.length > 0 && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-amber-300 mb-2">⚠️ Active Scenarios</h3>
                  <p className="text-sm text-navy-300">
                    {roundConfig.activeScenarioEvents.join(', ')}
                  </p>
                </div>
              )}

              {/* Demand Configuration Panel */}
              {gameState.fleetInfo && (
                <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      ⚡ Demand Configuration
                      <span className="text-xs text-navy-400 font-normal">({SEASON_LABELS[roundConfig.season]})</span>
                    </h3>
                    {!demandEditMode ? (
                      <button
                        onClick={() => setDemandEditMode(true)}
                        className="px-3 py-1 text-xs bg-electric-500/20 text-electric-300 rounded-lg hover:bg-electric-500/30 transition-colors"
                      >
                        ✏️ Edit Demand
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setDemandEdits({ ...roundConfig.baseDemandMW });
                            setDemandEditMode(false);
                          }}
                          className="px-3 py-1 text-xs bg-navy-600 text-navy-300 rounded-lg hover:bg-navy-500 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDemandSave}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors font-medium"
                        >
                          ✓ Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {roundConfig.timePeriods.map(period => {
                      const fleetMW = gameState.fleetInfo?.totalFleetMW[period] || 0;
                      const currentDemandMW = demandEditMode
                        ? (demandEdits[period] || 0)
                        : (gameState.fleetInfo?.demandMW[period] || 0);
                      const pctOfFleet = fleetMW > 0 ? Math.round((currentDemandMW / fleetMW) * 1000) / 10 : 0;

                      return (
                        <div key={period} className={`rounded-xl p-3 border transition-all ${
                          demandEditMode ? 'bg-electric-500/10 border-electric-500/30' : 'bg-white/5 border-white/10'
                        }`}>
                          <div className="text-xs text-navy-400 mb-2 capitalize font-medium">
                            {TIME_PERIOD_SHORT_LABELS[period as TimePeriod] || period.replace(/_/g, ' ')}
                          </div>

                          {demandEditMode ? (
                            <div className="space-y-2">
                              <div>
                                <label className="text-[10px] text-navy-500">Demand (MW)</label>
                                <input
                                  type="number"
                                  value={demandEdits[period] || 0}
                                  onChange={e => handleDemandChange(period, parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1.5 bg-navy-800 border border-navy-600 rounded text-sm font-mono text-white focus:border-electric-400 focus:outline-none"
                                  min={0}
                                  max={fleetMW}
                                />
                                <div className="text-[9px] text-navy-600 mt-0.5">
                                  Max: {formatMW(fleetMW)} (fleet supply)
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] text-navy-500">Set as % of fleet</label>
                                <input
                                  type="number"
                                  value={pctOfFleet || 0}
                                  onChange={e => {
                                    const pct = parseFloat(e.target.value) || 0;
                                    handleDemandChange(period, Math.round(fleetMW * pct / 100));
                                  }}
                                  className="w-full px-2 py-1.5 bg-navy-800 border border-navy-600 rounded text-sm font-mono text-white focus:border-electric-400 focus:outline-none"
                                  min={0}
                                  max={100}
                                  step={5}
                                />
                              </div>
                              {/* Supply proximity warning */}
                              {(() => {
                                const ratio = fleetMW > 0 ? currentDemandMW / fleetMW : 0;
                                if (ratio > 0.95) return (
                                  <div className="text-[10px] text-red-400 mt-1 font-medium">
                                    {Math.round(ratio * 100)}% of supply — very tight!
                                  </div>
                                );
                                if (ratio > 0.90) return (
                                  <div className="text-[10px] text-amber-400 mt-1 font-medium">
                                    {Math.round(ratio * 100)}% of supply — getting tight
                                  </div>
                                );
                                return null;
                              })()}
                            </div>
                          ) : (
                            <>
                              <div className="text-xl font-bold font-mono text-electric-300">
                                {formatMW(currentDemandMW)}
                              </div>
                              <div className="text-xs text-navy-500 mt-0.5">
                                {pctOfFleet}% of fleet
                              </div>
                            </>
                          )}

                          <div className="text-[10px] text-navy-600 mt-1.5 pt-1.5 border-t border-white/5">
                            Fleet: {formatMW(fleetMW)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Supply vs Demand Summary */}
                  {!demandEditMode && (
                    <div className="mt-3 flex items-center gap-4 text-xs text-navy-400">
                      <div>
                        Total Fleet: <span className="text-white font-mono">
                          {formatMW(Object.values(gameState.fleetInfo?.totalFleetMW || {}).reduce((a, b) => Math.max(a, b), 0))}
                        </span>
                      </div>
                      <div>
                        Avg Demand: <span className="text-white font-mono">
                          {formatMW(Math.round(Object.values(gameState.fleetInfo?.demandMW || {}).reduce((a, b) => a + b, 0) / Math.max(1, roundConfig.timePeriods.length)))}
                        </span>
                      </div>
                      <div>
                        Avg % of Fleet: <span className="text-white font-mono">
                          {Math.round(Object.values(gameState.fleetInfo?.demandAsPercentOfFleet || {}).reduce((a, b) => a + b, 0) / Math.max(1, roundConfig.timePeriods.length))}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bidding Overview */}
          {phase === 'bidding' && activeView === 'overview' && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">Bidding in Progress</h2>

              {/* Auto-advance banner when all bids are in */}
              {allBidsIn && autoAdvanceCountdown !== null && (
                <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <div className="text-sm font-semibold text-green-300">All bids submitted!</div>
                        <div className="text-xs text-navy-300">Auto-advancing in {autoAdvanceCountdown}s...</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (autoAdvanceTimerRef.current) {
                          clearInterval(autoAdvanceTimerRef.current);
                          autoAdvanceTimerRef.current = null;
                        }
                        setAutoAdvanceCountdown(null);
                        endBidding();
                      }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      Skip → Show Results
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className={`rounded-xl p-4 border-2 transition-all ${
                      bidStatus[team.id]
                        ? 'border-green-500/50 bg-green-500/10'
                        : 'border-amber-500/30 bg-amber-500/5 animate-pulse'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                      <span className="text-white text-sm font-medium truncate">{team.name}</span>
                    </div>
                    <div className={`text-xs font-medium ${
                      bidStatus[team.id] ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {bidStatus[team.id] ? '✓ Bids Submitted' : '⏳ Waiting...'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <div className={`text-4xl font-mono font-bold ${
                  biddingTimeRemaining <= 30 ? 'text-red-400' : 'text-electric-400'
                }`}>
                  {formatTime(biddingTimeRemaining)}
                </div>
                <p className="text-navy-400 text-sm mt-1">Time Remaining</p>
              </div>

              {/* Condensed Round Overview */}
              {roundConfig && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-electric-400 font-medium">Round {round}</span>
                      <span className="text-xs text-navy-500">|</span>
                      <span className="text-xs text-navy-400 capitalize">
                        {roundConfig.season === 'summer' ? '🔥' : roundConfig.season === 'winter' ? '❄️' : roundConfig.season === 'autumn' ? '🍂' : '🌱'}
                        {' '}{roundConfig.season}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{roundConfig.name}</h3>
                    <p className="text-sm text-navy-400 mt-1">{roundConfig.description}</p>
                  </div>

                  {roundConfig.seasonalGuidance && (
                    <div className="mb-4">
                      <div className="text-xs font-medium text-navy-300 mb-2">{roundConfig.seasonalGuidance.headline}</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold text-blue-300 mb-0.5">Demand</div>
                          <p className="text-[11px] text-navy-300 leading-relaxed">{roundConfig.seasonalGuidance.demandContext}</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold text-amber-300 mb-0.5">Supply</div>
                          <p className="text-[11px] text-navy-300 leading-relaxed">{roundConfig.seasonalGuidance.supplyContext}</p>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold text-green-300 mb-0.5">Bidding Strategy</div>
                          <p className="text-[11px] text-navy-300 leading-relaxed">{roundConfig.seasonalGuidance.biddingAdvice}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {roundConfig.activeScenarioEvents.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <div className="text-xs font-semibold text-amber-300 mb-1">⚠️ Active Scenarios</div>
                      <p className="text-xs text-navy-300">{roundConfig.activeScenarioEvents.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Walkthrough View */}
          {activeView === 'walkthrough' && lastResults && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">Merit Order Walkthrough</h2>
              <p className="text-navy-400 text-sm mb-4">Step through how the merit order was built and how the clearing price was set.</p>
              <MeritOrderWalkthrough periodResults={lastResults.periodResults} />
            </div>
          )}

          {activeView === 'walkthrough' && !lastResults && (
            <div className="text-center text-navy-400 py-12">
              <div className="text-3xl mb-2">📊</div>
              <p>Walkthrough available after dispatch results</p>
            </div>
          )}

          {/* Merit Order View */}
          {activeView === 'merit' && lastResults && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">Merit Order Stack</h2>
              <div className="flex gap-2 mb-4">
                {(roundConfig?.timePeriods || []).map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p as TimePeriod)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedPeriod === p
                        ? 'bg-electric-500 text-white'
                        : 'bg-white/10 text-navy-300 hover:bg-white/20'
                    }`}
                  >
                    {p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <MeritOrderChart
                  periodResult={lastResults.periodResults.find(r => r.timePeriod === selectedPeriod) || lastResults.periodResults[0]}
                  height={450}
                />
              </div>
            </div>
          )}

          {/* Dispatch Overview View */}
          {activeView === 'dispatch' && lastResults && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Dispatch Overview — Round {round}</h2>
                <p className="text-navy-400 text-sm">Full merit order for each period. Use the controls to replay the walkthrough.</p>
              </div>
              <MeritOrderWalkthrough periodResults={lastResults.periodResults} startAtEnd />

              {/* Collapsible detailed tables */}
              <button
                onClick={() => setShowDispatchTables(prev => !prev)}
                className="flex items-center gap-2 text-sm text-navy-300 hover:text-white transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showDispatchTables ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {showDispatchTables ? 'Hide Detailed Tables' : 'Show Detailed Tables'}
              </button>

              {showDispatchTables && (
                <div className="space-y-6">
                  {/* Summary Table: rows = asset types, columns = periods */}
                  {(() => {
                    const allPeriods = lastResults.periodResults.map(pr => pr.timePeriod);
                    const assetTypesSet = new Set<AssetType>();
                    for (const pr of lastResults.periodResults) {
                      for (const band of [...pr.meritOrderStack, ...pr.undispatchedBands]) {
                        assetTypesSet.add(band.assetType);
                      }
                    }
                    const assetTypes = Array.from(assetTypesSet).sort();

                    const summary: Record<string, Record<string, number>> = {};
                    for (const at of assetTypes) {
                      summary[at] = {};
                      for (const p of allPeriods) {
                        summary[at][p] = 0;
                      }
                    }

                    for (const pr of lastResults.periodResults) {
                      for (const band of pr.meritOrderStack) {
                        if (band.dispatchedMW > 0) {
                          summary[band.assetType][pr.timePeriod] = (summary[band.assetType][pr.timePeriod] || 0) + band.dispatchedMW;
                        }
                      }
                    }

                    return (
                      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10">
                          <h3 className="text-sm font-semibold text-white">Total Dispatched MW by Asset Type</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left text-xs text-navy-400 font-medium px-4 py-2">Asset Type</th>
                                {allPeriods.map(p => (
                                  <th key={p} className="text-right text-xs text-navy-400 font-medium px-4 py-2">
                                    {TIME_PERIOD_SHORT_LABELS[p] || p}
                                  </th>
                                ))}
                                <th className="text-right text-xs text-navy-400 font-medium px-4 py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assetTypes.map(at => {
                                const rowTotal = allPeriods.reduce((s, p) => s + (summary[at][p] || 0), 0);
                                return (
                                  <tr key={at} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="px-4 py-2 text-sm text-white flex items-center gap-2">
                                      <span>{ASSET_ICONS[at] || '🏭'}</span>
                                      {ASSET_TYPE_LABELS[at] || at}
                                    </td>
                                    {allPeriods.map(p => (
                                      <td key={p} className="px-4 py-2 text-right text-sm font-mono text-navy-200">
                                        {summary[at][p] > 0 ? formatNumber(summary[at][p]) : <span className="text-navy-600">—</span>}
                                      </td>
                                    ))}
                                    <td className="px-4 py-2 text-right text-sm font-mono font-bold text-electric-300">
                                      {formatNumber(rowTotal)}
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr className="border-t-2 border-white/20 bg-white/5">
                                <td className="px-4 py-2 text-sm font-semibold text-amber-300">Demand</td>
                                {allPeriods.map(p => {
                                  const pr = lastResults.periodResults.find(r => r.timePeriod === p);
                                  return (
                                    <td key={p} className="px-4 py-2 text-right text-sm font-mono font-bold text-amber-300">
                                      {pr ? formatNumber(pr.demandMW) : '—'}
                                    </td>
                                  );
                                })}
                                <td className="px-4 py-2 text-right text-sm font-mono font-bold text-amber-300">
                                  {formatNumber(lastResults.periodResults.reduce((s, pr) => s + pr.demandMW, 0))}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Per-Team Breakdown */}
                  {(() => {
                    const allPeriods = lastResults.periodResults.map(pr => pr.timePeriod);
                    const teamDispatched = new Map<string, { teamName: string; assets: Map<string, Record<string, number>> }>();

                    for (const pr of lastResults.periodResults) {
                      for (const band of pr.meritOrderStack) {
                        if (band.dispatchedMW <= 0) continue;
                        if (!teamDispatched.has(band.teamId)) {
                          teamDispatched.set(band.teamId, { teamName: band.teamName, assets: new Map() });
                        }
                        const teamData = teamDispatched.get(band.teamId)!;
                        if (!teamData.assets.has(band.assetName)) {
                          teamData.assets.set(band.assetName, {});
                        }
                        const assetPeriods = teamData.assets.get(band.assetName)!;
                        assetPeriods[pr.timePeriod] = (assetPeriods[pr.timePeriod] || 0) + band.dispatchedMW;
                      }
                    }

                    return (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Per-Team Dispatch Breakdown</h3>
                        {Array.from(teamDispatched.entries()).map(([teamId, teamData]) => {
                          const team = teams.find(t => t.id === teamId);
                          return (
                            <div key={teamId} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                              <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team?.color || '#888' }} />
                                <span className="text-sm font-semibold text-white">{teamData.teamName}</span>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-white/5">
                                      <th className="text-left text-[11px] text-navy-400 font-medium px-4 py-1.5">Asset</th>
                                      {allPeriods.map(p => (
                                        <th key={p} className="text-right text-[11px] text-navy-400 font-medium px-4 py-1.5">
                                          {TIME_PERIOD_SHORT_LABELS[p] || p}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Array.from(teamData.assets.entries()).map(([assetName, periods]) => (
                                      <tr key={assetName} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-4 py-1.5 text-xs text-navy-200">{assetName}</td>
                                        {allPeriods.map(p => (
                                          <td key={p} className="px-4 py-1.5 text-right text-xs font-mono text-navy-300">
                                            {periods[p] ? `${formatNumber(periods[p])} MW` : <span className="text-navy-600">—</span>}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Profit/Loss View */}
          {activeView === 'profit' && lastResults && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">Round {round} Profit/Loss</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <ProfitLossBar teamResults={lastResults.teamResults} />
              </div>
            </div>
          )}

          {/* Leaderboard View */}
          {activeView === 'leaderboard' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
              <LeaderboardChart leaderboard={leaderboard} />
            </div>
          )}

          {/* Minigame-Only Results — final leaderboard */}
          {phase === 'results' && activeView === 'overview' && roundConfig?.minigameOnlyRound && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-white mb-2">Battery Arbitrage Results</h2>
                <p className="text-navy-300 text-sm">Round {round} — {roundConfig.name}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <div className="text-xs text-navy-400 uppercase tracking-wide mb-4">Final Rankings</div>
                {(() => {
                  const rankedTeams = teams
                    .filter(t => minigameStatus[t.id])
                    .map(t => {
                      const score = minigameScores.find(s => s.teamId === t.id);
                      return { team: t, score };
                    })
                    .sort((a, b) => (b.score?.totalProfit || 0) - (a.score?.totalProfit || 0));

                  const unfinishedTeams = teams.filter(t => !minigameStatus[t.id]);

                  return (
                    <div className="space-y-3">
                      {rankedTeams.map((entry, i) => (
                        <div
                          key={entry.team.id}
                          className={`flex items-center gap-4 rounded-xl px-5 py-4 ${
                            i === 0 ? 'bg-amber-500/15 border-2 border-amber-500/30' :
                            i === 1 ? 'bg-gray-400/10 border border-gray-400/20' :
                            i === 2 ? 'bg-orange-700/10 border border-orange-700/20' :
                            'bg-white/5 border border-white/10'
                          }`}
                        >
                          <div className="text-2xl font-bold w-10 text-center">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </div>
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: entry.team.color }} />
                          <span className="text-lg text-white font-semibold flex-1">{entry.team.name}</span>
                          {entry.score && (
                            <>
                              <div className="text-right">
                                <div className="text-lg font-mono font-bold text-green-400">
                                  {formatCurrency(entry.score.totalProfit)}
                                </div>
                                <div className="text-xs text-navy-400">
                                  of {formatCurrency(entry.score.optimalProfit)} optimal
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-lg font-mono font-bold text-electric-300">
                                  {entry.score.decisionsTotal > 0
                                    ? `${Math.round((entry.score.decisionsCorrect / entry.score.decisionsTotal) * 100)}%`
                                    : '—'}
                                </div>
                                <div className="text-xs text-navy-400">
                                  {entry.score.decisionsCorrect}/{entry.score.decisionsTotal} correct
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}

                      {unfinishedTeams.length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                          <div className="text-xs text-navy-500 mb-2">Did not finish</div>
                          {unfinishedTeams.map(team => (
                            <div key={team.id} className="flex items-center gap-3 px-5 py-2 text-navy-500">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                              <span className="text-sm">{team.name}</span>
                              <span className="ml-auto text-xs italic">DNF</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <p className="text-center text-navy-500 text-xs">
                Minigame profits are separate from the main game leaderboard.
              </p>
            </div>
          )}

          {/* Results Overview (default during results phase) */}
          {phase === 'results' && activeView === 'overview' && !roundConfig?.minigameOnlyRound && lastResults && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Round {round} Results</h2>
                <p className="text-navy-400 text-sm">{roundConfig?.name}</p>
              </div>

              {/* Price Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {lastResults.periodResults.map(pr => (
                  <div key={pr.timePeriod} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-xs text-navy-400 capitalize">{pr.timePeriod.replace(/_/g, ' ')}</div>
                    <div className="text-2xl font-bold font-mono text-electric-300 mt-1">
                      ${formatNumber(pr.clearingPriceMWh)}
                    </div>
                    <div className="text-xs text-navy-500">/MWh clearing price</div>
                    <div className="text-xs text-navy-400 mt-1">
                      Demand: {formatMW(pr.demandMW)} &bull; Reserve: {pr.reserveMarginPercent.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Market Snapshot Infographic (4.3) */}
              <MarketSnapshotCard
                roundResults={lastResults}
                roundNumber={round}
                roundName={roundConfig?.name || `Round ${round}`}
              />

              {/* Team Results Table */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-xs text-navy-400 font-medium px-4 py-3">Rank</th>
                      <th className="text-left text-xs text-navy-400 font-medium px-4 py-3">Team</th>
                      <th className="text-right text-xs text-navy-400 font-medium px-4 py-3">Round Profit</th>
                      <th className="text-right text-xs text-navy-400 font-medium px-4 py-3">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, i) => {
                      const roundResult = lastResults.teamResults.find(r => r.teamId === entry.teamId);
                      return (
                        <tr key={entry.teamId} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-white font-bold">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-white text-sm">{entry.teamName}</span>
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-right font-mono text-sm ${
                            (roundResult?.totalProfitDollars || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatCurrency(roundResult?.totalProfitDollars || 0)}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono text-sm font-bold ${
                            entry.cumulativeProfitDollars >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatCurrency(entry.cumulativeProfitDollars)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Round Analysis View */}
          {activeView === 'analysis' && gameState.lastRoundAnalysis && (() => {
            const analysis = gameState.lastRoundAnalysis;
            return (
              <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">🔍 Round {analysis.roundNumber} Analysis</h2>
                  <p className="text-navy-400 text-sm">{analysis.roundName}</p>
                </div>

                {/* Overall Summary */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-electric-300 mb-2">Overall Summary</h3>
                  <p className="text-sm text-navy-200 leading-relaxed">{analysis.overallSummary}</p>
                </div>

                {/* Period-by-Period Analysis */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">Period-by-Period Breakdown</h3>
                  {analysis.periodAnalyses.map(pa => (
                    <div key={pa.timePeriod} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white capitalize">
                          {TIME_PERIOD_SHORT_LABELS[pa.timePeriod] || pa.timePeriod.replace(/_/g, ' ')}
                        </span>
                        <span className="text-lg font-bold font-mono text-electric-300">
                          ${formatNumber(pa.clearingPriceMWh)}/MWh
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-navy-300">
                        <p><span className="text-amber-300 font-medium">⚡ Price setter:</span> {pa.priceSetterTeam} — {pa.priceSetterAsset} (bid ${formatNumber(pa.priceSetterBidPrice)}/MWh)</p>
                        <p>{pa.priceExplanation}</p>
                        <p className="text-navy-400">{pa.supplyDemandNarrative}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Collective Insight */}
                <div className="bg-electric-500/10 border border-electric-500/20 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-electric-300 mb-2">💡 Market Insight</h3>
                  <p className="text-sm text-navy-200 leading-relaxed">{analysis.collectiveInsight}</p>
                </div>

                {/* Key Takeaways */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">📝 Key Takeaways</h3>
                  <ul className="space-y-2">
                    {analysis.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="text-sm text-navy-300 flex items-start gap-2">
                        <span className="text-electric-400 mt-0.5 flex-shrink-0">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Team-by-Team Summary (collapsed by default) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">Team Performance</h3>
                  {analysis.teamAnalyses.map(ta => (
                    <div key={ta.teamId} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ta.color }} />
                        <span className="text-sm font-semibold text-white">{ta.teamName}</span>
                        <span className="text-xs text-navy-400">#{ta.rank}</span>
                        <span className={`ml-auto text-sm font-mono font-bold ${
                          ta.roundProfit >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {ta.roundProfit >= 0 ? '+' : ''}{formatCurrency(ta.roundProfit)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-green-400 font-medium mb-1">✓ Strengths</div>
                          {ta.strengths.map((s, i) => (
                            <p key={i} className="text-navy-300 mb-1">{s}</p>
                          ))}
                        </div>
                        <div>
                          <div className="text-amber-400 font-medium mb-1">→ Improvements</div>
                          {ta.improvements.map((s, i) => (
                            <p key={i} className="text-navy-300 mb-1">{s}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Team View */}
          {activeView === 'team_view' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-4">Team View</h2>
              <p className="text-navy-400 text-sm mb-4">Select a team to see what they see on their screen.</p>

              {/* Team Selector */}
              <div className="flex gap-2 flex-wrap mb-6">
                {teams.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setViewingTeamId(t.id);
                      viewTeamScreen(t.id);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewingTeamId === t.id
                        ? 'text-white shadow-lg'
                        : 'bg-white/10 text-navy-300 hover:bg-white/20 hover:text-white'
                    }`}
                    style={viewingTeamId === t.id ? { backgroundColor: t.color } : undefined}
                  >
                    <span className="w-2.5 h-2.5 rounded-full inline-block mr-2" style={{ backgroundColor: t.color }} />
                    {t.name}
                    {!t.isConnected && <span className="ml-1 text-red-400 text-xs">(offline)</span>}
                  </button>
                ))}
              </div>

              {/* Team Screen Preview */}
              {viewingTeamId && teamScreenData?.myTeam ? (
                <div className="bg-navy-800 border border-white/10 rounded-xl overflow-hidden">
                  {/* Team Header Preview */}
                  <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: teamScreenData.myTeam.color }}>
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="text-white font-bold text-sm">{teamScreenData.myTeam.name}</div>
                      <div className="text-white/70 text-xs">
                        {phase === 'bidding' ? `Round ${gameState?.currentRound}` :
                         phase === 'results' ? 'Results' :
                         phase === 'briefing' ? 'Briefing' :
                         phase === 'lobby' ? 'Waiting...' : phase}
                      </div>
                    </div>
                    <div className="ml-auto text-white/80 text-sm font-mono">
                      {formatCurrency(teamScreenData.myTeam.cumulativeProfitDollars)} profit
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Team Assets */}
                    <div>
                      <h4 className="text-sm font-semibold text-navy-200 mb-2">Assets</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {teamScreenData.myTeam.assets.map(asset => {
                          const assetDef = (teamScreenData.myAssetDefs || []).find((d: AssetInfo) => d.id === asset.assetDefinitionId);
                          return (
                            <div key={asset.assetDefinitionId} className={`px-3 py-2 bg-white/5 rounded-lg border border-white/10 ${
                              asset.isForceOutage ? 'opacity-50' : ''
                            }`}>
                              <div className="text-xs font-medium text-white">
                                {assetDef?.name || asset.assetDefinitionId}
                              </div>
                              <div className="text-[10px] text-navy-400">
                                {formatMW(asset.currentAvailableMW)} available
                                {assetDef && ` · Marginal Cost $${formatNumber(assetDef.srmcPerMWh)}`}
                                {asset.isForceOutage && <span className="text-red-400 ml-1">OUTAGE</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Team's Last Round Results */}
                    {teamScreenData.lastRoundResults && (() => {
                      const teamResult = teamScreenData.lastRoundResults!.teamResults.find(
                        r => r.teamId === teamScreenData.myTeam!.id
                      );
                      if (!teamResult) return null;
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-200 mb-2">Last Round Performance</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                              <div className="text-[10px] text-navy-400">Revenue</div>
                              <div className="text-sm font-mono text-green-400">{formatCurrency(teamResult.totalRevenueDollars)}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                              <div className="text-[10px] text-navy-400">Cost</div>
                              <div className="text-sm font-mono text-red-400">{formatCurrency(teamResult.totalCostDollars)}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                              <div className="text-[10px] text-navy-400">Profit</div>
                              <div className={`text-sm font-mono font-bold ${teamResult.totalProfitDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(teamResult.totalProfitDollars)}
                              </div>
                            </div>
                          </div>

                          {/* Period breakdown */}
                          <div className="mt-3 space-y-2">
                            {teamResult.periodBreakdown.map(pb => (
                              <div key={pb.timePeriod} className="bg-white/5 rounded-lg px-3 py-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-navy-300">{TIME_PERIOD_SHORT_LABELS[pb.timePeriod]}</span>
                                  <span className={`text-xs font-mono ${pb.periodProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatCurrency(pb.periodProfit)}
                                  </span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {pb.assets.map(a => (
                                    <span key={a.assetDefinitionId} className="text-[10px] text-navy-400">
                                      {a.assetType === 'battery' ? (
                                        a.batteryMode === 'charge' ? (
                                          <>🔋 {a.assetName}: CHG {formatMW(a.chargeMW || 0)} (-{formatCurrency(a.chargeCostDollars || 0)})</>
                                        ) : a.batteryMode === 'discharge' ? (
                                          <>🔋 {a.assetName}: DIS {formatMW(a.dispatchedMW)} (+{formatCurrency(a.revenueFromDispatch)})</>
                                        ) : (
                                          <>🔋 {a.assetName}: IDLE</>
                                        )
                                      ) : (
                                        <>{a.assetName}: {formatMW(a.dispatchedMW)} @ {formatPrice(a.revenueFromDispatch / Math.max(1, a.energyMWh))}</>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Team Analysis */}
                    {teamScreenData.lastRoundAnalysis && (() => {
                      const ta = teamScreenData.lastRoundAnalysis!.teamAnalyses.find(
                        a => a.teamId === teamScreenData.myTeam!.id
                      );
                      if (!ta) return null;
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-200 mb-2">Analysis</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                              <div className="text-xs text-green-400 font-medium mb-1">Strengths</div>
                              {ta.strengths.map((s, i) => (
                                <p key={i} className="text-[11px] text-navy-300 mb-0.5">{s}</p>
                              ))}
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                              <div className="text-xs text-amber-400 font-medium mb-1">Improvements</div>
                              {ta.improvements.map((s, i) => (
                                <p key={i} className="text-[11px] text-navy-300 mb-0.5">{s}</p>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <div className="text-xs text-blue-400 font-medium mb-1">Next Round Advice</div>
                            <p className="text-[11px] text-navy-300">{ta.nextRoundAdvice}</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Rank & Position */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                      <div className="text-2xl">
                        {teamScreenData.myTeam.rank === 1 ? '🥇' :
                         teamScreenData.myTeam.rank === 2 ? '🥈' :
                         teamScreenData.myTeam.rank === 3 ? '🥉' : `#${teamScreenData.myTeam.rank}`}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          Rank {teamScreenData.myTeam.rank} of {teams.length}
                        </div>
                        <div className="text-xs text-navy-400">
                          Cumulative: {formatCurrency(teamScreenData.myTeam.cumulativeProfitDollars)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : viewingTeamId ? (
                <div className="text-center text-navy-400 py-12">
                  <div className="text-3xl mb-2">⏳</div>
                  <p>Loading team data...</p>
                </div>
              ) : (
                <div className="text-center text-navy-500 py-12">
                  <div className="text-3xl mb-2">👆</div>
                  <p>Select a team above to view their screen</p>
                </div>
              )}
            </div>
          )}

          {/* Final Results */}
          {phase === 'final' && (
            <div className="max-w-2xl mx-auto text-center animate-fade-in">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-white mb-6">Game Over!</h2>

              {leaderboard.length > 0 && (
                <div className="mb-8">
                  <div className="text-7xl mb-2">🥇</div>
                  <div className="text-2xl font-bold text-electric-300">{leaderboard[0]?.teamName}</div>
                  <div className="text-xl font-mono text-green-400">
                    {formatCurrencyFull(leaderboard[0]?.cumulativeProfitDollars || 0)}
                  </div>
                </div>
              )}

              <LeaderboardChart leaderboard={leaderboard} />

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={async () => {
                    await resetGame();
                    clearHostSession();
                    setQrData(null);
                    navigate('/host');
                  }}
                  className="px-6 py-3 bg-electric-500 hover:bg-electric-400 text-white font-semibold rounded-lg transition-colors"
                >
                  New Game
                </button>
                <button
                  onClick={async () => {
                    await resetGame();
                    clearHostSession();
                    setQrData(null);
                    navigate('/');
                  }}
                  className="px-6 py-3 bg-navy-600 hover:bg-navy-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cinematic Transitions */}
      <GameStartTransition
        isVisible={showGameStart}
        teamCount={teams.length}
        totalRounds={totalRounds}
        gameMode={gameState.gameMode}
        onComplete={() => setShowGameStart(false)}
      />
      <RoundStartTransition
        isVisible={showRoundStart}
        roundNumber={round}
        totalRounds={totalRounds}
        roundName={roundConfig?.name || `Round ${round}`}
        season={roundConfig?.season || 'summer'}
        onComplete={() => setShowRoundStart(false)}
      />

      {/* Full-screen Round Summary overlay */}
      {showRoundSummary && lastResults && gameState.lastRoundAnalysis && roundConfig && !roundConfig.minigameOnlyRound && (
        <RoundSummary
          roundResults={lastResults}
          roundAnalysis={gameState.lastRoundAnalysis}
          leaderboard={leaderboard}
          roundConfig={roundConfig}
          roundNumber={round}
          totalRounds={totalRounds}
          nextRoundConfig={gameState.nextRoundConfig}
          onClose={() => setShowRoundSummary(false)}
        />
      )}

      {/* Full-screen Round Briefing overlay */}
      {showRoundBriefing && roundConfig && gameState.fleetInfo && (
        <RoundBriefing
          roundConfig={roundConfig}
          roundNumber={round}
          totalRounds={totalRounds}
          fleetInfo={gameState.fleetInfo}
          teamCount={teams.length}
          scenarioEvents={gameState.activeScenarioEventDetails}
          surpriseIncidents={gameState.surpriseIncidents}
          preSurpriseDemandMW={gameState.preSurpriseDemandMW}
          onClose={() => setShowRoundBriefing(false)}
          onStartBidding={phase === 'briefing' ? handleStartBiddingFromBriefing : undefined}
        />
      )}

      {/* Full-screen How to Bid tutorial overlay */}
      {showHowToBid && (
        <HowToBidTutorial onClose={() => setShowHowToBid(false)} />
      )}

      {/* Full-screen Strategy Guide overlay */}
      {showStrategyGuide && (
        <StrategyGuide onClose={() => setShowStrategyGuide(false)} />
      )}

      {/* Invite Code Modal */}
      {showInviteModal && lastInviteCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-navy-900 border border-white/20 rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-fade-in">
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-xl font-bold text-white mb-1">Invite Code</h3>
            <p className="text-navy-400 text-sm mb-4">
              Share this with {inviteTeamName}'s teammates to join as observers
            </p>

            <div className="bg-navy-800 rounded-xl p-4 mb-4">
              <div className="text-3xl font-mono font-bold text-electric-300 tracking-[0.3em]">
                {lastInviteCode.inviteCode}
              </div>
              <div className="text-xs text-navy-500 mt-1">Expires in 10 minutes</div>
            </div>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => {
                  const joinUrl = `${window.location.origin}/team/join?game=${gameState?.gameId || ''}&invite=${lastInviteCode.inviteCode}`;
                  navigator.clipboard.writeText(joinUrl);
                  setInviteCopied(true);
                  setTimeout(() => setInviteCopied(false), 2000);
                }}
                className="w-full py-2.5 bg-electric-500 hover:bg-electric-400 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                {inviteCopied ? '✓ Copied!' : '📋 Copy Invite Link'}
              </button>
            </div>

            <button
              onClick={() => {
                setShowInviteModal(false);
                clearInviteCode();
              }}
              className="text-navy-400 hover:text-white text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
