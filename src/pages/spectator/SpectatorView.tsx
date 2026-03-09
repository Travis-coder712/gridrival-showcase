import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { formatCurrency, formatMW, formatNumber } from '../../lib/formatters';
import { ASSET_ICONS, ASSET_COLORS } from '../../lib/colors';
import type { TimePeriod, AssetType } from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS, SEASON_LABELS } from '../../../shared/types';
import StrategyGuide from '../../components/game/StrategyGuide';
import HowToBidTutorial from '../../components/game/HowToBidTutorial';
import BatteryExplainer from '../../components/game/BatteryExplainer';
import PortfolioExplainer from '../../components/game/PortfolioExplainer';

/**
 * SpectatorView — Observer Mode
 *
 * Three-phase UI:
 *   Phase A: Game code entry (with ?game=XXXX auto-fill + auto-discover)
 *   Phase B: Team selection grid
 *   Phase C: Team observation (read-only team view + educational modals)
 */
export default function SpectatorView() {
  const {
    connected,
    gameState,
    roundResults,
    biddingTimeRemaining,
    isObserverMode,
    observerTeams,
    observedTeamId,
    observedTeamName,
    joinAsObserver,
    selectObservedTeam,
  } = useSocket();

  const [searchParams] = useSearchParams();
  const [gameCodeInput, setGameCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoDiscoverAttempted, setAutoDiscoverAttempted] = useState(false);

  // Educational modals
  const [showStrategyGuide, setShowStrategyGuide] = useState(false);
  const [showHowToBid, setShowHowToBid] = useState(false);
  const [showBatteryExplainer, setShowBatteryExplainer] = useState(false);
  const [showPortfolioExplainer, setShowPortfolioExplainer] = useState(false);

  // Auto-fill game code from URL param
  useEffect(() => {
    const gameParam = searchParams.get('game');
    if (gameParam) {
      setGameCodeInput(gameParam.toUpperCase());
    }
  }, [searchParams]);

  // Auto-discover active game if no code provided
  useEffect(() => {
    if (autoDiscoverAttempted || gameCodeInput) return;
    setAutoDiscoverAttempted(true);

    fetch('/api/games')
      .then(r => r.json())
      .then(data => {
        if (data.games?.length > 0 && !gameCodeInput) {
          setGameCodeInput(data.games[0].id);
        }
      })
      .catch(() => {}); // silent fail
  }, [autoDiscoverAttempted, gameCodeInput]);

  const handleJoin = () => {
    if (!gameCodeInput || gameCodeInput.length < 4) return;
    setJoining(true);
    setError(null);
    joinAsObserver(gameCodeInput);

    // Timeout in case server doesn't respond
    setTimeout(() => {
      setJoining(false);
    }, 5000);
  };

  // Clear joining state once we're in observer mode
  useEffect(() => {
    if (isObserverMode) setJoining(false);
  }, [isObserverMode]);

  // ── Connecting ──
  if (!connected) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">📡</div>
          <h2 className="text-xl font-bold text-white">Connecting...</h2>
          <p className="text-navy-400 mt-2">Establishing connection to game server</p>
        </div>
      </div>
    );
  }

  // ── Phase A: Game Code Entry ──
  if (!isObserverMode) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-navy-900 border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">👁️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Observer Mode</h1>
            <p className="text-navy-400 mb-6">
              Follow along with your team in real-time. See their assets, review bids, and access strategy guides — all from your phone.
            </p>

            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-navy-300 mb-1">Game Code</label>
              <input
                type="text"
                value={gameCodeInput}
                onChange={e => {
                  setGameCodeInput(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="Enter game code"
                className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white text-lg font-mono text-center uppercase tracking-widest focus:border-electric-400 focus:outline-none focus:ring-1 focus:ring-electric-400"
                maxLength={6}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}

            <p className="text-xs text-navy-500 mb-4">
              Ask the host for the game code displayed on their dashboard.
            </p>

            <button
              onClick={handleJoin}
              disabled={gameCodeInput.length < 4 || joining}
              className="w-full py-3 bg-electric-500 hover:bg-electric-400 disabled:bg-navy-700 disabled:text-navy-500 text-white font-bold rounded-xl transition-colors"
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Connecting...
                </span>
              ) : 'Watch Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase B: Team Selection ──
  if (!observedTeamId) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="max-w-lg w-full mx-4">
          <div className="bg-navy-900 border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔭</div>
              <h1 className="text-2xl font-bold text-white mb-1">Choose a Team to Observe</h1>
              <p className="text-navy-400 text-sm">
                Pick your team to follow along with their assets, bids, and results.
              </p>
            </div>

            <div className="space-y-3">
              {observerTeams.map((team, i) => (
                <button
                  key={team.id}
                  onClick={() => selectObservedTeam(team.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white group-hover:text-electric-300 transition-colors">
                      {team.name}
                    </div>
                    <div className="text-xs text-navy-400">
                      {team.rank > 0 ? `Rank #${team.rank}` : 'Not ranked yet'}
                      {team.cumulativeProfitDollars !== 0 && (
                        <span className={`ml-2 ${team.cumulativeProfitDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(team.cumulativeProfitDollars)}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-navy-500 group-hover:text-electric-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            {observerTeams.length === 0 && (
              <div className="text-center py-8 text-navy-500">
                No teams have joined yet. Waiting for players...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase C: Team Observation View ──
  const phase = gameState?.phase || 'lobby';
  const currentRound = gameState?.currentRound || 0;
  const totalRounds = gameState?.totalRounds || 0;
  const roundConfig = gameState?.roundConfig;
  const myTeam = gameState?.myTeam;
  const myAssetDefs = gameState?.myAssetDefs;
  const leaderboard = gameState?.leaderboard || [];
  const fleetInfo = gameState?.fleetInfo;
  const lastRoundResults = gameState?.lastRoundResults;

  return (
    <div className="min-h-screen bg-navy-950 text-white pb-24">
      {/* ── Header ── */}
      <div className="bg-navy-900 border-b border-white/10 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: observerTeams.find(t => t.id === observedTeamId)?.color || '#3182ce' }}
            >
              {observedTeamName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="truncate">{observedTeamName}</span>
                <span className="px-1.5 py-0.5 bg-electric-500/20 text-electric-300 text-[10px] font-semibold rounded uppercase tracking-wider flex-shrink-0">
                  Observer
                </span>
              </div>
              <div className="text-xs text-navy-400">
                {currentRound > 0 && `Round ${currentRound}/${totalRounds} · `}
                {phase === 'lobby' ? 'Waiting' :
                 phase === 'briefing' ? 'Briefing' :
                 phase === 'bidding' ? 'Bidding' :
                 phase === 'dispatching' ? 'Dispatching' :
                 phase === 'results' ? 'Results' :
                 phase === 'final' ? 'Game Over' : phase}
                {roundConfig?.season && ` · ${SEASON_LABELS[roundConfig.season]}`}
              </div>
            </div>
          </div>

          {/* Team switcher */}
          <select
            value={observedTeamId}
            onChange={e => selectObservedTeam(e.target.value)}
            className="bg-navy-800 border border-navy-600 rounded-lg px-2 py-1.5 text-xs text-white focus:border-electric-400 focus:outline-none cursor-pointer"
          >
            {observerTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* ── Lobby Phase ── */}
        {phase === 'lobby' && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-white mb-2">Waiting for Game to Start</h2>
            <p className="text-navy-400">The host will start the game soon. Sit tight!</p>
            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 max-w-sm mx-auto">
              <div className="text-sm font-medium text-navy-300 mb-2">Teams Joined</div>
              <div className="space-y-2">
                {observerTeams.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className={`${t.id === observedTeamId ? 'text-electric-300 font-semibold' : 'text-white'}`}>
                      {t.name}
                    </span>
                    {t.id === observedTeamId && <span className="text-xs text-navy-500">(your team)</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Briefing Phase ── */}
        {phase === 'briefing' && (
          <>
            {/* Round Info */}
            {roundConfig && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
                  Round {currentRound} · {SEASON_LABELS[roundConfig.season]} · Briefing
                </div>
                <h2 className="text-lg font-bold text-white mb-2">{roundConfig.name}</h2>
                <p className="text-sm text-navy-300">{roundConfig.description}</p>
                {roundConfig.learningObjectives.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {roundConfig.learningObjectives.map((obj, i) => (
                      <div key={i} className="text-xs text-navy-400 flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Team Assets */}
            {myTeam?.assets && myTeam.assets.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Your Team's Assets</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myTeam.assets.map(asset => (
                    <div key={asset.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <span className="text-2xl">{ASSET_ICONS[asset.type as AssetType] || '⚡'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white truncate">{asset.name}</div>
                        <div className="text-xs text-navy-400">
                          {asset.nameplateMW} MW · SRMC ${asset.srmcDollarPerMWh}/MWh
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demand Info */}
            {fleetInfo && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Demand Forecast</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(fleetInfo.demandMW).map(([period, mw]) => (
                    <div key={period} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-xs text-navy-400">
                        {TIME_PERIOD_SHORT_LABELS[period as TimePeriod] || period}
                      </div>
                      <div className="text-lg font-bold font-mono text-electric-300">
                        {formatMW(mw as number)}
                      </div>
                      {fleetInfo.demandAsPercentOfFleet?.[period] != null && (
                        <div className="text-xs text-navy-500">
                          {Math.round(fleetInfo.demandAsPercentOfFleet[period])}% of fleet
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Bidding Phase ── */}
        {phase === 'bidding' && (
          <>
            {/* Timer */}
            <div className={`text-center py-4 rounded-xl ${
              biddingTimeRemaining <= 30 ? 'bg-red-500/10 border border-red-500/20' : 'bg-electric-500/10 border border-electric-500/20'
            }`}>
              <div className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-1">Bidding Time Remaining</div>
              <div className={`text-4xl font-bold font-mono ${
                biddingTimeRemaining <= 30 ? 'text-red-400' : 'text-electric-300'
              }`}>
                {Math.floor(biddingTimeRemaining / 60)}:{String(biddingTimeRemaining % 60).padStart(2, '0')}
              </div>
              <div className="text-sm text-navy-400 mt-1">
                Your team is submitting bids now
              </div>
            </div>

            {/* Team Assets for reference */}
            {myTeam?.assets && myTeam.assets.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Team Assets</h3>
                <div className="space-y-2">
                  {myTeam.assets.map(asset => (
                    <div key={asset.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <span className="text-xl">{ASSET_ICONS[asset.type as AssetType] || '⚡'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white">{asset.name}</div>
                        <div className="text-xs text-navy-400">
                          {asset.nameplateMW} MW · SRMC ${asset.srmcDollarPerMWh}/MWh
                        </div>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ASSET_COLORS[asset.type as AssetType] || '#888' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demand reference */}
            {fleetInfo && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-navy-300 mb-2">Demand This Round</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(fleetInfo.demandMW).map(([period, mw]) => (
                    <div key={period} className="text-center">
                      <div className="text-[10px] text-navy-500">
                        {TIME_PERIOD_SHORT_LABELS[period as TimePeriod] || period}
                      </div>
                      <div className="text-sm font-bold font-mono text-white">
                        {formatMW(mw as number)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Educational prompt */}
            <div className="bg-electric-500/5 border border-electric-500/10 rounded-xl p-4 text-center">
              <div className="text-sm text-navy-300 mb-2">
                While your team bids, brush up on strategy 👇
              </div>
            </div>
          </>
        )}

        {/* ── Dispatching Phase ── */}
        {phase === 'dispatching' && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 animate-pulse">⚡</div>
            <h2 className="text-xl font-bold text-white mb-2">Dispatch in Progress</h2>
            <p className="text-navy-400">The market is clearing bids and calculating results...</p>
          </div>
        )}

        {/* ── Results Phase ── */}
        {(phase === 'results' || phase === 'final') && (
          <>
            {/* Leaderboard */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">
                {phase === 'final' ? '🏆 Final Standings' : 'Leaderboard'}
              </h2>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div
                    key={entry.teamId}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${
                      entry.teamId === observedTeamId
                        ? 'bg-electric-500/10 border border-electric-500/20'
                        : 'bg-white/5'
                    }`}
                  >
                    <span className="text-lg w-8">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className={`font-medium flex-1 ${entry.teamId === observedTeamId ? 'text-electric-300' : 'text-white'}`}>
                      {entry.teamName}
                      {entry.teamId === observedTeamId && <span className="text-xs text-navy-500 ml-1">(you)</span>}
                    </span>
                    <span className={`font-mono font-bold ${
                      entry.cumulativeProfitDollars >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(entry.cumulativeProfitDollars)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clearing Prices */}
            {lastRoundResults && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4">
                  Clearing Prices — Round {lastRoundResults.roundNumber}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {lastRoundResults.periodResults.map(pr => (
                    <div key={pr.timePeriod} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-xs text-navy-400">
                        {TIME_PERIOD_SHORT_LABELS[pr.timePeriod as TimePeriod] || pr.timePeriod}
                      </div>
                      <div className="text-xl font-bold font-mono text-electric-300">
                        ${formatNumber(pr.clearingPriceMWh)}
                      </div>
                      <div className="text-xs text-navy-500">
                        {formatMW(pr.demandMW)} demand
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team P&L breakdown */}
            {lastRoundResults && myTeam && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-3">Team Round P&L</h2>
                {(() => {
                  const teamResult = lastRoundResults.teamResults?.find(
                    (tr: any) => tr.teamId === observedTeamId
                  );
                  if (!teamResult) return <p className="text-navy-500 text-sm">No P&L data available</p>;
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-navy-400">Revenue</span>
                        <span className="text-green-400 font-mono">{formatCurrency(teamResult.revenueDollars)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-navy-400">Fuel Costs</span>
                        <span className="text-red-400 font-mono">-{formatCurrency(teamResult.fuelCostDollars)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold">
                        <span className="text-white">Round Profit</span>
                        <span className={`font-mono ${teamResult.profitDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(teamResult.profitDollars)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Game Over banner */}
            {phase === 'final' && (
              <div className="text-center py-6 bg-gradient-to-r from-yellow-500/10 via-electric-500/10 to-purple-500/10 border border-electric-500/20 rounded-xl">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-xl font-bold text-white">Game Complete!</h2>
                <p className="text-navy-400 text-sm mt-1">Thanks for watching. Check the final standings above.</p>
              </div>
            )}
          </>
        )}

        {/* ── Game Info Footer ── */}
        <div className="text-center text-navy-600 text-xs pt-2">
          Observer mode — view only · Game {gameState?.gameId || ''}
        </div>
      </div>

      {/* ── Educational Floating Toolbar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur border-t border-white/10 px-4 py-3 safe-area-pb">
        <div className="max-w-5xl mx-auto">
          <div className="text-[10px] font-semibold text-navy-500 uppercase tracking-wider mb-2 text-center">
            Learn & Explore
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setShowStrategyGuide(true)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5"
            >
              📊 Strategy Guide
            </button>
            <button
              onClick={() => setShowHowToBid(true)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5"
            >
              🎯 How to Bid
            </button>
            <button
              onClick={() => setShowBatteryExplainer(true)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5"
            >
              🔋 Battery Guide
            </button>
            <button
              onClick={() => setShowPortfolioExplainer(true)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5"
            >
              💼 Portfolio Guide
            </button>
          </div>
        </div>
      </div>

      {/* ── Educational Modals ── */}
      {showStrategyGuide && <StrategyGuide onClose={() => setShowStrategyGuide(false)} />}
      {showHowToBid && <HowToBidTutorial onClose={() => setShowHowToBid(false)} />}
      {showBatteryExplainer && <BatteryExplainer onClose={() => setShowBatteryExplainer(false)} />}
      {showPortfolioExplainer && <PortfolioExplainer onClose={() => setShowPortfolioExplainer(false)} />}
    </div>
  );
}
