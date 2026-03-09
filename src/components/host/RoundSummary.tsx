import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  RoundDispatchResult, RoundAnalysis, LeaderboardEntry,
  RoundConfig, TimePeriod, AssetCategoryBreakdown,
} from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS, SEASON_LABELS, ASSET_TYPE_LABELS } from '../../../shared/types';
import { ASSET_ICONS } from '../../lib/colors';
import { formatCurrency, formatMW, formatMWh, formatNumber } from '../../lib/formatters';
import MeritOrderChart from '../charts/MeritOrderChart';
import StackedMeritOrderChart from '../charts/StackedMeritOrderChart';
import ProfitLossBar from '../charts/ProfitLossBar';

interface RoundSummaryProps {
  roundResults: RoundDispatchResult;
  roundAnalysis: RoundAnalysis;
  leaderboard: LeaderboardEntry[];
  roundConfig: RoundConfig;
  roundNumber: number;
  totalRounds: number;
  nextRoundConfig?: RoundConfig | null;
  onClose: () => void;
}

const SEASON_CONFIG: Record<string, { icon: string; color: string }> = {
  summer: { icon: '🔥', color: '#f56565' },
  autumn: { icon: '🍂', color: '#d69e2e' },
  winter: { icon: '❄️', color: '#63b3ed' },
  spring: { icon: '🌱', color: '#48bb78' },
};

const SLIDE_TITLES = [
  'What Happened',
  'The Merit Order',
  'Performance by Asset Type',
  'Winners & Losers',
  'Key Takeaways',
  'Coming Up Next',
];

export default function RoundSummary({
  roundResults,
  roundAnalysis,
  leaderboard,
  roundConfig,
  roundNumber,
  totalRounds,
  nextRoundConfig,
  onClose,
}: RoundSummaryProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [chartTab, setChartTab] = useState<'stacked' | 'merit'>('stacked');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('day_peak');
  const totalSlides = 6;

  const seasonCfg = SEASON_CONFIG[roundConfig.season] || SEASON_CONFIG.summer;
  const isLastRound = roundNumber >= totalRounds;

  const goNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setDirection(1);
      setCurrentSlide(s => s + 1);
    }
  }, [currentSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(s => s - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80 }),
  };

  // ═══════════════════════════════════════
  //  SLIDE 0: What Happened
  // ═══════════════════════════════════════
  const renderSlide0 = () => (
    <div className="flex flex-col items-center justify-center h-full px-12 py-8">
      {/* Round header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-4xl">{seasonCfg.icon}</span>
          <span
            className="text-sm font-mono uppercase tracking-[0.3em] font-bold"
            style={{ color: seasonCfg.color }}
          >
            {SEASON_LABELS[roundConfig.season]}
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Round {roundNumber}: {roundConfig.name}
        </h2>

        {/* Active scenarios */}
        {roundConfig.activeScenarioEvents.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {roundConfig.activeScenarioEvents.map(event => (
              <span
                key={event}
                className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm rounded-full"
              >
                ⚠️ {event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Clearing price cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
        {roundResults.periodResults.map(pr => {
          const label = TIME_PERIOD_SHORT_LABELS[pr.timePeriod as TimePeriod] || pr.timePeriod;
          return (
            <div
              key={pr.timePeriod}
              className={`border rounded-2xl p-5 text-center ${
                pr.oversupplyNegativePriceTriggered
                  ? 'bg-red-500/10 border-red-500/30'
                  : pr.aemoInterventionTriggered
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="text-sm text-navy-400 mb-1 uppercase tracking-wide">{label}</div>
              <div className={`text-4xl md:text-5xl font-bold font-mono ${
                pr.clearingPriceMWh < 0 ? 'text-red-400' : 'text-electric-300'
              }`}>
                ${formatNumber(pr.clearingPriceMWh)}
              </div>
              <div className="text-xs text-navy-500 mt-1">/MWh</div>
              <div className="text-xs text-navy-400 mt-2">
                {formatMW(pr.demandMW)} demand &bull; {pr.reserveMarginPercent.toFixed(0)}% reserve
              </div>
              {pr.oversupplyNegativePriceTriggered && (
                <div className="mt-2 px-2 py-1 bg-red-500/20 rounded-lg text-xs text-red-300 font-medium">
                  ⚡ Oversupply! Supply {'>'} 3× demand → price floor
                </div>
              )}
              {pr.aemoInterventionTriggered && (
                <div className="mt-2 px-2 py-1 bg-amber-500/20 rounded-lg text-xs text-amber-300 font-medium">
                  🚨 AEMO Intervention: Emergency gen after 1hr
                  <div className="text-amber-400 font-mono mt-0.5">
                    Effective: ${formatNumber(pr.aemoEffectivePriceMWh || 0)}/MWh
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall summary */}
      <div className="max-w-3xl text-center">
        <p className="text-lg text-navy-200 leading-relaxed">
          {roundAnalysis.overallSummary}
        </p>
      </div>

      {/* Economic withholding warnings (AER monitoring) */}
      {roundAnalysis.economicWithholdingWarnings && roundAnalysis.economicWithholdingWarnings.length > 0 && (
        <div className="max-w-3xl w-full mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <div className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-2">
            ⚠️ Economic Withholding Detected
          </div>
          {roundAnalysis.economicWithholdingWarnings.map((w, i) => (
            <p key={i} className="text-sm text-navy-200 mb-1">{w.explanation}</p>
          ))}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 1: The Merit Order
  // ═══════════════════════════════════════
  const renderSlide1 = () => {
    const selectedResult = roundResults.periodResults.find(r => r.timePeriod === selectedPeriod)
      || roundResults.periodResults[0];
    const selectedAnalysis = roundAnalysis.periodAnalyses.find(a => a.timePeriod === selectedPeriod)
      || roundAnalysis.periodAnalyses[0];

    return (
      <div className="flex flex-col h-full px-8 py-6">
        {/* Chart type toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setChartTab('stacked')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartTab === 'stacked'
                  ? 'bg-electric-500/20 text-electric-300 border border-electric-500/30'
                  : 'bg-white/5 text-navy-300 hover:bg-white/10'
              }`}
            >
              📊 Generation Mix
            </button>
            <button
              onClick={() => setChartTab('merit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartTab === 'merit'
                  ? 'bg-electric-500/20 text-electric-300 border border-electric-500/30'
                  : 'bg-white/5 text-navy-300 hover:bg-white/10'
              }`}
            >
              📈 Merit Order Stack
            </button>
          </div>

          {/* Period selector (only for merit order view) */}
          {chartTab === 'merit' && (
            <div className="flex gap-2">
              {roundResults.periodResults.map(pr => (
                <button
                  key={pr.timePeriod}
                  onClick={() => setSelectedPeriod(pr.timePeriod as TimePeriod)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === pr.timePeriod
                      ? 'bg-electric-500 text-white'
                      : 'bg-white/10 text-navy-300 hover:bg-white/20'
                  }`}
                >
                  {TIME_PERIOD_SHORT_LABELS[pr.timePeriod as TimePeriod] || pr.timePeriod}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 min-h-0">
          {chartTab === 'stacked' ? (
            <StackedMeritOrderChart
              periodResults={roundResults.periodResults}
              height={Math.min(480, window.innerHeight - 280)}
              projectorMode
            />
          ) : (
            <MeritOrderChart
              periodResult={selectedResult}
              height={Math.min(480, window.innerHeight - 280)}
            />
          )}
        </div>

        {/* Price setter callout */}
        {chartTab === 'merit' && selectedAnalysis && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="text-amber-300 font-medium">
              ⚡ Price setter: {selectedAnalysis.priceSetterTeam} — {selectedAnalysis.priceSetterAsset}
              <span className="font-mono ml-2">(bid ${formatNumber(selectedAnalysis.priceSetterBidPrice)}/MWh)</span>
            </div>
          </div>
        )}
        {chartTab === 'stacked' && (
          <div className="mt-3 text-sm text-navy-300 text-center">
            Showing total dispatched generation by fuel type across all periods, with demand overlay
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  SLIDE 2: Performance by Asset Type
  // ═══════════════════════════════════════
  const renderSlideAssetCategory = () => {
    const breakdown = roundAnalysis.assetCategoryBreakdown;
    if (!breakdown || breakdown.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full px-12 py-8">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-2">Performance by Asset Type</h2>
          <p className="text-navy-300">No asset category data available for this round.</p>
        </div>
      );
    }

    // Category-specific card styling
    const categoryStyles: Record<string, { bg: string; border: string; accent: string }> = {
      renewables: { bg: 'bg-green-500/5', border: 'border-green-500/20', accent: 'text-green-400' },
      battery:    { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', accent: 'text-emerald-400' },
      hydro:      { bg: 'bg-sky-500/5', border: 'border-sky-500/20', accent: 'text-sky-400' },
      fossil:     { bg: 'bg-amber-500/5', border: 'border-amber-500/20', accent: 'text-amber-400' },
    };

    // Responsive grid: 2x2 on mobile, up to 4 columns on desktop
    const gridCols = breakdown.length >= 4
      ? 'grid-cols-2 md:grid-cols-4'
      : breakdown.length === 3
        ? 'grid-cols-2 md:grid-cols-3'
        : breakdown.length === 2
          ? 'grid-cols-1 md:grid-cols-2'
          : '';

    return (
      <div className="flex flex-col h-full px-8 py-6">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          📊 Performance by Asset Type
        </h2>

        <div className={`grid ${gridCols} gap-4 flex-1`}>
          {breakdown.map(cat => {
            const style = categoryStyles[cat.category] || categoryStyles.fossil;
            return (
              <div key={cat.category} className={`${style.bg} ${style.border} border rounded-2xl p-5 flex flex-col`}>
                <div className="text-center mb-4">
                  <span className="text-3xl">{cat.categoryIcon}</span>
                  <h3 className={`text-lg font-bold mt-2 ${style.accent}`}>{cat.categoryLabel}</h3>
                  <div className={`text-2xl font-mono font-bold mt-1 ${
                    cat.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(cat.totalProfit)}
                  </div>
                  <div className="text-xs text-navy-400 mt-1">
                    {formatMWh(cat.totalEnergyMWh)} generated
                  </div>
                  {cat.totalRevenue > 0 && (
                    <div className="text-xs text-navy-500 mt-0.5">
                      Revenue: {formatCurrency(cat.totalRevenue)} | Cost: {formatCurrency(cat.totalCost)}
                    </div>
                  )}
                </div>

                {/* Per-team bars */}
                <div className="space-y-2 mt-auto">
                  {cat.teamBreakdowns.map(tb => (
                    <div key={tb.teamId} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tb.color }} />
                      <span className="text-xs text-navy-300 flex-1 truncate">{tb.teamName}</span>
                      <span className={`text-xs font-mono font-medium ${
                        tb.profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(tb.profit)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  SLIDE 3: Winners & Losers
  // ═══════════════════════════════════════
  const renderSlide2 = () => {
    const top3 = leaderboard.slice(0, 3);
    const winnerAnalysis = roundAnalysis.teamAnalyses[0];
    const loserAnalysis = roundAnalysis.teamAnalyses[roundAnalysis.teamAnalyses.length - 1];

    return (
      <div className="flex flex-col h-full px-8 py-6">
        {/* Podium */}
        <div className="flex justify-center items-end gap-6 mb-8">
          {/* 2nd place */}
          {top3[1] && (
            <div className="text-center">
              <div className="text-4xl mb-2">🥈</div>
              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: top3[1].color }} />
              <div className="text-white font-semibold text-lg">{top3[1].teamName}</div>
              <div className={`font-mono font-bold text-lg ${top3[1].cumulativeProfitDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(top3[1].cumulativeProfitDollars)}
              </div>
              <div className="w-24 h-20 bg-white/5 border border-white/10 rounded-t-lg mt-2" />
            </div>
          )}

          {/* 1st place */}
          {top3[0] && (
            <div className="text-center">
              <div className="text-5xl mb-2">🥇</div>
              <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: top3[0].color }} />
              <div className="text-white font-bold text-xl">{top3[0].teamName}</div>
              <div className={`font-mono font-bold text-2xl ${top3[0].cumulativeProfitDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(top3[0].cumulativeProfitDollars)}
              </div>
              <div className="w-28 h-28 bg-electric-500/10 border border-electric-500/30 rounded-t-lg mt-2" />
            </div>
          )}

          {/* 3rd place */}
          {top3[2] && (
            <div className="text-center">
              <div className="text-4xl mb-2">🥉</div>
              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: top3[2].color }} />
              <div className="text-white font-semibold text-lg">{top3[2].teamName}</div>
              <div className={`font-mono font-bold text-lg ${top3[2].cumulativeProfitDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(top3[2].cumulativeProfitDollars)}
              </div>
              <div className="w-24 h-14 bg-white/5 border border-white/10 rounded-t-lg mt-2" />
            </div>
          )}
        </div>

        {/* Round Profit chart */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 min-h-0">
          <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-2">Round {roundNumber} Profit/Loss</h3>
          <ProfitLossBar teamResults={roundResults.teamResults} />
        </div>

        {/* Winner / Loser insights */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {winnerAnalysis && winnerAnalysis.strengths[0] && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">
                🏆 {winnerAnalysis.teamName}
              </div>
              <p className="text-sm text-navy-200">{winnerAnalysis.strengths[0]}</p>
            </div>
          )}
          {loserAnalysis && loserAnalysis.improvements[0] && loserAnalysis.teamId !== winnerAnalysis?.teamId && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">
                💡 {loserAnalysis.teamName}
              </div>
              <p className="text-sm text-navy-200">{loserAnalysis.improvements[0]}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  SLIDE 3: Key Takeaways
  // ═══════════════════════════════════════
  const renderSlide3 = () => (
    <div className="flex flex-col items-center justify-center h-full px-12 py-8">
      <h2 className="text-2xl font-bold text-white mb-8">📝 Key Takeaways</h2>

      <div className="max-w-3xl w-full space-y-5 mb-8">
        {roundAnalysis.keyTakeaways.map((takeaway, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-electric-500/20 flex items-center justify-center">
              <span className="text-electric-300 font-bold text-sm">{i + 1}</span>
            </div>
            <p className="text-lg text-navy-200 leading-relaxed pt-1">{takeaway}</p>
          </div>
        ))}
      </div>

      {/* Collective insight */}
      {roundAnalysis.collectiveInsight && (
        <div className="max-w-3xl w-full bg-electric-500/10 border border-electric-500/20 rounded-2xl p-6">
          <div className="text-sm font-semibold text-electric-300 mb-2">💡 Market Insight</div>
          <p className="text-lg text-navy-200 leading-relaxed">{roundAnalysis.collectiveInsight}</p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 4: Coming Up Next
  // ═══════════════════════════════════════
  const renderSlide4 = () => {
    if (isLastRound) {
      // Final round — show congratulations
      return (
        <div className="flex flex-col items-center justify-center h-full px-12 py-8">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-4xl font-bold text-white mb-4">Game Complete!</h2>
          <p className="text-xl text-navy-300 mb-8">Final Standings</p>

          <div className="max-w-lg w-full space-y-3">
            {leaderboard.map((entry, i) => (
              <div key={entry.teamId} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                <div className="text-2xl w-10 text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                <div className="flex-1 text-white font-semibold text-lg">{entry.teamName}</div>
                <div className={`font-mono font-bold text-lg ${entry.cumulativeProfitDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(entry.cumulativeProfitDollars)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!nextRoundConfig) {
      return (
        <div className="flex flex-col items-center justify-center h-full px-12 py-8">
          <div className="text-5xl mb-4">🔮</div>
          <h2 className="text-3xl font-bold text-white mb-4">Get Ready for Round {roundNumber + 1}</h2>
          <p className="text-lg text-navy-300">More challenges await...</p>
        </div>
      );
    }

    const nextSeason = SEASON_CONFIG[nextRoundConfig.season] || SEASON_CONFIG.summer;

    return (
      <div className="flex flex-col items-center justify-center h-full px-12 py-8">
        {/* What we learned */}
        {roundConfig.learningObjectives.length > 0 && (
          <div className="max-w-3xl w-full mb-10">
            <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-3 text-center">What We Learned This Round</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {roundConfig.learningObjectives.map((obj, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 text-sm text-navy-300 rounded-lg">
                  ✓ {obj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Next round preview */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">{nextSeason.icon}</span>
            <span
              className="text-sm font-mono uppercase tracking-[0.3em] font-bold"
              style={{ color: nextSeason.color }}
            >
              {SEASON_LABELS[nextRoundConfig.season]}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Round {roundNumber + 1}: {nextRoundConfig.name}
          </h2>
          <p className="text-lg text-navy-300 max-w-2xl mx-auto">{nextRoundConfig.description}</p>
        </div>

        {/* Key changes for next round */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
          {/* New assets */}
          {nextRoundConfig.newAssetsUnlocked.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
              <div className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">🆕 New Assets</div>
              <div className="space-y-2">
                {nextRoundConfig.newAssetsUnlocked.map(type => (
                  <div key={type} className="text-lg text-white">
                    {ASSET_ICONS[type]} {ASSET_TYPE_LABELS[type]}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenario events */}
          {nextRoundConfig.activeScenarioEvents.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-center">
              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">⚠️ Scenario Events</div>
              <div className="space-y-2">
                {nextRoundConfig.activeScenarioEvents.map(event => (
                  <div key={event} className="text-base text-navy-200">
                    {event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic hint */}
          <div className="bg-electric-500/10 border border-electric-500/20 rounded-2xl p-5 text-center">
            <div className="text-sm font-semibold text-electric-300 uppercase tracking-wide mb-3">🧠 Think About</div>
            {nextRoundConfig.learningObjectives.length > 0 ? (
              <p className="text-base text-navy-200">{nextRoundConfig.learningObjectives[0]}</p>
            ) : (
              <p className="text-base text-navy-200">How will the changing conditions affect your bidding strategy?</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const slides = [renderSlide0, renderSlide1, renderSlideAssetCategory, renderSlide2, renderSlide3, renderSlide4];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-navy-800 to-navy-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-navy-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">{seasonCfg.icon}</span>
          <div>
            <h1 className="text-white font-bold text-sm">Round {roundNumber} Summary</h1>
            <p className="text-navy-400 text-xs">{roundConfig.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-navy-400">
            {SLIDE_TITLES[currentSlide]}
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg text-xs transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 overflow-y-auto"
          >
            {slides[currentSlide]()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation bar */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-navy-900/50 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
              className={`transition-all ${
                i === currentSlide
                  ? 'w-8 h-2.5 rounded-full bg-electric-400'
                  : 'w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/40'
              }`}
              title={SLIDE_TITLES[i]}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentSlide === totalSlides - 1}
          className="flex items-center gap-2 px-4 py-2 bg-electric-500 hover:bg-electric-400 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
