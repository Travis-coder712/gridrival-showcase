import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  RoundConfig, FleetInfo, ScenarioEvent, AssetType, TimePeriod,
  SurpriseIncident,
} from '../../../shared/types';
import {
  TIME_PERIOD_SHORT_LABELS, TIME_PERIOD_LABELS, SEASON_LABELS,
  ASSET_TYPE_LABELS,
} from '../../../shared/types';
import { ASSET_ICONS, ASSET_COLORS } from '../../lib/colors';
import { formatMW, formatNumber } from '../../lib/formatters';

interface RoundBriefingProps {
  roundConfig: RoundConfig;
  roundNumber: number;
  totalRounds: number;
  fleetInfo: FleetInfo;
  teamCount: number;
  scenarioEvents?: ScenarioEvent[];
  surpriseIncidents?: SurpriseIncident[];
  preSurpriseDemandMW?: Record<string, number>;
  onClose: () => void;
  onStartBidding?: () => void;
}

const SEASON_CONFIG: Record<string, { icon: string; label: string; color: string; bgGradient: string }> = {
  summer: {
    icon: '🔥', label: 'SUMMER', color: '#f56565',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(245,101,101,0.25) 0%, transparent 60%)',
  },
  autumn: {
    icon: '🍂', label: 'AUTUMN', color: '#d69e2e',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(214,158,46,0.25) 0%, transparent 60%)',
  },
  winter: {
    icon: '❄️', label: 'WINTER', color: '#63b3ed',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(99,179,237,0.25) 0%, transparent 60%)',
  },
  spring: {
    icon: '🌱', label: 'SPRING', color: '#48bb78',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(72,187,120,0.25) 0%, transparent 60%)',
  },
};

const FLEET_CATEGORIES: { label: string; icon: string; types: AssetType[] }[] = [
  { label: 'Baseload', icon: '🏭', types: ['coal', 'gas_ccgt'] },
  { label: 'Peaking',  icon: '⚡', types: ['gas_peaker'] },
  { label: 'Renewables', icon: '🌿', types: ['wind', 'solar'] },
  { label: 'Flexible / Storage', icon: '🔋', types: ['hydro', 'battery'] },
];

const PERIOD_TIME_RANGES: Record<string, string> = {
  night_offpeak: '12am – 6am',
  day_offpeak: '6am – 12pm',
  day_peak: '12pm – 6pm',
  night_peak: '6pm – 12am',
};

const PERIOD_ICONS: Record<string, string> = {
  night_offpeak: '🌙',
  day_offpeak: '🌅',
  day_peak: '☀️',
  night_peak: '🌆',
};

export default function RoundBriefing({
  roundConfig,
  roundNumber,
  totalRounds,
  fleetInfo,
  teamCount,
  scenarioEvents,
  surpriseIncidents,
  preSurpriseDemandMW,
  onClose,
  onStartBidding,
}: RoundBriefingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const seasonCfg = SEASON_CONFIG[roundConfig.season] || SEASON_CONFIG.summer;

  // Build dynamic slide list
  const hasScenarios = scenarioEvents && scenarioEvents.length > 0;
  const hasGuidance = !!roundConfig.seasonalGuidance;
  const showConditionsSlide = hasScenarios || hasGuidance;
  const hasSurprises = surpriseIncidents && surpriseIncidents.length > 0;

  const slides = useMemo(() => {
    const s: { title: string; render: () => JSX.Element }[] = [
      { title: 'Season & Theme', render: renderSlide0 },
      { title: 'Demand Profile', render: renderSlide1 },
      { title: 'Generation Fleet', render: renderSlide2 },
    ];
    if (showConditionsSlide) {
      s.push({ title: 'Market Conditions', render: renderSlide3 });
    }
    if (hasSurprises) {
      s.push({ title: 'Incident Report', render: renderSurpriseSlide });
    }
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConditionsSlide, hasSurprises]);

  const totalSlides = slides.length;

  const goNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setDirection(1);
      setCurrentSlide(s => s + 1);
    }
  }, [currentSlide, totalSlides]);

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

  // Helper: is this the last slide?
  const isLastSlide = currentSlide === totalSlides - 1;

  // ═══════════════════════════════════════
  //  SLIDE 0: Season & Theme
  // ═══════════════════════════════════════
  function renderSlide0() {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 py-8 relative overflow-hidden">
        {/* Season gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: seasonCfg.bgGradient }} />

        {/* Subtle animated vertical light lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className="absolute h-full w-0.5 pointer-events-none"
            style={{
              left: `${10 + i * 20}%`,
              background: `linear-gradient(to bottom, transparent 20%, ${seasonCfg.color}15 50%, transparent 80%)`,
              transform: 'skewX(-15deg)',
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 0.5, scaleY: 1 }}
            transition={{ duration: 1.2, delay: 0.15 * i, ease: 'easeOut' }}
          />
        ))}

        {/* Round number */}
        <motion.div
          className="relative z-10 mb-2"
          initial={{ scale: 3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', damping: 15 }}
        >
          <div className="text-sm font-mono uppercase tracking-[0.4em] text-navy-400 mb-2 text-center">Round</div>
          <div
            className="font-mono text-8xl md:text-9xl font-black text-center leading-none"
            style={{ color: seasonCfg.color, textShadow: `0 0 80px ${seasonCfg.color}60, 0 0 160px ${seasonCfg.color}20` }}
          >
            {roundNumber}
          </div>
        </motion.div>

        {/* Horizontal divider */}
        <motion.div
          className="h-px w-64 mx-auto my-5 relative z-10"
          style={{ background: `linear-gradient(to right, transparent, ${seasonCfg.color}80, transparent)` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />

        {/* Round name */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white text-center relative z-10 mb-3"
          style={{ textShadow: '0 0 40px rgba(255,255,255,0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {roundConfig.name}
        </motion.h2>

        {/* Round description */}
        <motion.p
          className="text-lg text-navy-300 text-center max-w-2xl relative z-10 mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65 }}
        >
          {roundConfig.description}
        </motion.p>

        {/* Season badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border relative z-10 mb-6"
          style={{ borderColor: `${seasonCfg.color}40`, backgroundColor: `${seasonCfg.color}10` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.8, type: 'spring', damping: 12 }}
        >
          <span className="text-xl">{seasonCfg.icon}</span>
          <span className="text-sm font-mono font-bold tracking-widest" style={{ color: seasonCfg.color }}>
            {seasonCfg.label}
          </span>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="max-w-xs w-full relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.95 }}
        >
          <div className="flex justify-between text-[10px] font-mono text-navy-500 mb-1.5">
            <span>ROUND {roundNumber}</span>
            <span>OF {totalRounds}</span>
          </div>
          <div className="w-full h-1.5 bg-navy-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: seasonCfg.color }}
              initial={{ width: `${((roundNumber - 1) / totalRounds) * 100}%` }}
              animate={{ width: `${(roundNumber / totalRounds) * 100}%` }}
              transition={{ duration: 0.8, delay: 1.0, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  SLIDE 1: Demand Profile
  // ═══════════════════════════════════════
  function renderSlide1() {
    const periods = roundConfig.timePeriods;
    const maxFleet = Math.max(...periods.map(p => fleetInfo.totalFleetMW[p] || 0), 1);
    const chartHeight = 320;

    const bars = periods.map(p => ({
      period: p,
      label: TIME_PERIOD_SHORT_LABELS[p as TimePeriod] || p,
      timeRange: PERIOD_TIME_RANGES[p] || '',
      icon: PERIOD_ICONS[p] || '⏰',
      demandMW: fleetInfo.demandMW[p] || 0,
      fleetMW: fleetInfo.totalFleetMW[p] || 0,
      pct: fleetInfo.demandAsPercentOfFleet[p] || 0,
    }));

    // Find tightest period for subtitle
    const tightest = bars.reduce((a, b) => a.pct > b.pct ? a : b, bars[0]);

    return (
      <div className="flex flex-col items-center h-full px-8 py-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          📊 Demand Profile
        </motion.h2>
        <motion.p
          className="text-lg text-navy-300 mb-2 text-center max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Electricity demand across the day — {SEASON_LABELS[roundConfig.season]}
        </motion.p>
        {tightest && (
          <motion.p
            className="text-sm mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {tightest.pct >= 85 ? (
              <span className="text-red-400 font-semibold">
                ⚠️ {tightest.label} demand is {tightest.pct}% of fleet — expect tight supply
              </span>
            ) : tightest.pct >= 70 ? (
              <span className="text-amber-400">
                {tightest.label} demand is {tightest.pct}% of fleet — moderate reserve margin
              </span>
            ) : (
              <span className="text-green-400">
                Peak demand at {tightest.pct}% of fleet — comfortable reserve margins
              </span>
            )}
          </motion.p>
        )}

        {/* Bar chart */}
        <div className="flex-1 flex items-end justify-center gap-6 md:gap-10 w-full max-w-4xl min-h-0 pb-2">
          {bars.map((bar, i) => {
            const demandH = (bar.demandMW / maxFleet) * chartHeight;
            const fleetH = (bar.fleetMW / maxFleet) * chartHeight;
            const reserveH = fleetH - demandH;
            const tightness = bar.pct;

            // Color based on tightness
            const barColor = tightness >= 85
              ? '#f56565'   // red — tight
              : tightness >= 70
                ? seasonCfg.color  // season accent — moderate
                : '#48bb78'; // green — comfortable

            return (
              <div key={bar.period} className="flex flex-col items-center flex-1 max-w-36">
                {/* Bar container */}
                <div
                  className="w-full relative flex flex-col items-stretch justify-end"
                  style={{ height: chartHeight }}
                >
                  {/* Fleet capacity outline */}
                  <div
                    className="absolute bottom-0 left-0 right-0 border-2 border-dashed rounded-t-lg"
                    style={{
                      height: fleetH,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {/* Fleet capacity MW label — above dashed box */}
                    <motion.div
                      className="absolute left-0 right-0 flex items-center justify-center"
                      style={{ top: -22 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.12 }}
                    >
                      <span className="text-xs font-mono font-semibold text-navy-300 bg-navy-900/80 px-1.5 py-0.5 rounded">
                        {formatNumber(bar.fleetMW)} MW
                      </span>
                    </motion.div>

                    {/* Reserve margin badge — centred in the gap between fleet and demand */}
                    {reserveH > 20 && (
                      <motion.div
                        className="absolute left-0 right-0 flex items-center justify-center"
                        style={{ bottom: demandH + Math.max((reserveH - demandH) * 0.3, 4) }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.12 }}
                      >
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                          tightness >= 85
                            ? 'text-red-300 bg-red-500/15 border-red-500/30'
                            : tightness >= 70
                              ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                              : 'text-green-300 bg-green-500/15 border-green-500/30'
                        }`}>
                          {Math.round(100 - tightness)}% reserve
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Demand bar */}
                  <motion.div
                    className="relative rounded-t-lg"
                    style={{ backgroundColor: barColor }}
                    initial={{ height: 0 }}
                    animate={{ height: demandH }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.12, ease: 'easeOut' }}
                  >
                    {/* Demand MW label inside bar */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg md:text-xl font-bold font-mono text-white leading-none">
                        {formatNumber(bar.demandMW)}
                      </span>
                      <span className="text-[10px] font-mono text-white/70 mt-0.5">
                        MW
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Period labels */}
                <motion.div
                  className="mt-3 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-lg mb-0.5">{bar.icon}</div>
                  <div className="text-sm font-semibold text-white">{bar.label}</div>
                  <div className="text-[10px] text-navy-500">{bar.timeRange}</div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <motion.div
          className="flex items-center gap-6 mt-4 text-sm text-navy-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 rounded" style={{ backgroundColor: seasonCfg.color }} />
            <span>Demand (MW)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 rounded border-2 border-dashed border-white/30 bg-transparent" />
            <span>Fleet Capacity (MW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-full border text-green-300 bg-green-500/15 border-green-500/30">%</span>
            <span>Reserve Margin</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  SLIDE 2: Generation Fleet
  // ═══════════════════════════════════════
  function renderSlide2() {
    const fleetByType = fleetInfo.fleetByAssetType || {};
    const maxMW = Math.max(
      ...Object.values(fleetByType).map(t => t.nameplateMW),
      1,
    );

    // Filter categories to only show types that exist
    const visibleCategories = FLEET_CATEGORIES
      .map(cat => ({
        ...cat,
        types: cat.types.filter(t => fleetByType[t]),
      }))
      .filter(cat => cat.types.length > 0);

    return (
      <div className="flex flex-col items-center h-full px-8 py-6 overflow-y-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚡ Generation Fleet
        </motion.h2>
        <motion.p
          className="text-lg text-navy-300 mb-6 text-center max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Available generation across {teamCount} teams
        </motion.p>

        <div className="w-full max-w-4xl space-y-6">
          {visibleCategories.map((cat, ci) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + ci * 0.15 }}
            >
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{cat.icon}</span>
                <h3 className="text-sm font-bold text-navy-300 uppercase tracking-wider">{cat.label}</h3>
              </div>

              {/* Asset type cards */}
              <div className="space-y-2">
                {cat.types.map((type, ti) => {
                  const info = fleetByType[type]!;
                  const barWidth = (info.nameplateMW / maxMW) * 100;
                  const isRenewable = type === 'wind' || type === 'solar';
                  const srmcText = info.srmcRange[0] === 0 && info.srmcRange[1] === 0
                    ? '$0'
                    : info.srmcRange[0] === info.srmcRange[1]
                      ? `$${formatNumber(info.srmcRange[0])}`
                      : `$${formatNumber(info.srmcRange[0])}–$${formatNumber(info.srmcRange[1])}`;
                  const perTeamMW = info.teamCount > 0 ? Math.round(info.nameplateMW / info.teamCount) : 0;

                  return (
                    <motion.div
                      key={type}
                      className="rounded-xl p-4 border transition-all"
                      style={{
                        backgroundColor: `${ASSET_COLORS[type]}10`,
                        borderColor: `${ASSET_COLORS[type]}30`,
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + ci * 0.15 + ti * 0.08 }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon & name */}
                        <div className="flex items-center gap-2 min-w-[160px]">
                          <span className="text-2xl">{ASSET_ICONS[type]}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">{ASSET_TYPE_LABELS[type]}</span>
                              {info.isNew && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-navy-500">
                              SRMC {srmcText}/MWh
                            </div>
                          </div>
                        </div>

                        {/* Capacity bar */}
                        <div className="flex-1">
                          <div className="w-full h-8 bg-navy-800/50 rounded-lg overflow-hidden relative">
                            <motion.div
                              className="h-full rounded-lg flex items-center px-3"
                              style={{ backgroundColor: `${ASSET_COLORS[type]}50` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.6, delay: 0.4 + ci * 0.15 + ti * 0.08 }}
                            >
                              <span className="text-sm font-bold font-mono text-white whitespace-nowrap">
                                {formatNumber(info.nameplateMW)} MW
                              </span>
                            </motion.div>
                          </div>
                        </div>

                        {/* Per-team info */}
                        <div className="text-right min-w-[120px]">
                          <div className="text-sm text-navy-300">
                            {info.teamCount} teams × {formatNumber(perTeamMW)} MW
                          </div>
                          {isRenewable && (
                            <div className="text-[10px] text-navy-500 mt-0.5">
                              Varies by period (capacity factors)
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Total fleet summary */}
          <motion.div
            className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-navy-400">
                Total Fleet Capacity (peak)
              </div>
              <div className="text-xl font-bold font-mono text-electric-300">
                {formatMW(Math.max(...Object.values(fleetInfo.totalFleetMW)))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  SLIDE 3: Market Conditions (conditional)
  // ═══════════════════════════════════════
  function renderSlide3() {
    const guidance = roundConfig.seasonalGuidance;

    return (
      <div className="flex flex-col items-center h-full px-8 py-6 overflow-y-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {hasScenarios ? '🚨 Market Alert' : '🌤️ Market Conditions'}
        </motion.h2>
        <motion.p
          className="text-lg text-navy-300 mb-8 text-center max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {hasScenarios
            ? 'Special conditions are in play this round'
            : `What to expect this ${SEASON_LABELS[roundConfig.season].toLowerCase()}`
          }
        </motion.p>

        <div className="w-full max-w-4xl space-y-6">
          {/* Scenario Events */}
          {hasScenarios && scenarioEvents!.map((event, i) => (
            <motion.div
              key={event.id}
              className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.15 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-300 mb-2">{event.name}</h3>
                  <p className="text-navy-200 mb-4">{event.description}</p>

                  {/* Effects summary */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.effects.map((effect, ei) => {
                      let label = '';
                      let color = 'text-amber-300 bg-amber-500/20';

                      if (effect.type === 'modify_demand' && effect.targetTimePeriod && effect.multiplier) {
                        const pctChange = Math.round((effect.multiplier - 1) * 100);
                        const periodLabel = TIME_PERIOD_SHORT_LABELS[effect.targetTimePeriod as TimePeriod] || effect.targetTimePeriod;
                        label = `${pctChange > 0 ? '+' : ''}${pctChange}% demand ${periodLabel}`;
                        color = pctChange > 0 ? 'text-red-300 bg-red-500/20' : 'text-green-300 bg-green-500/20';
                      } else if (effect.type === 'modify_asset_availability' && effect.targetAssetType && effect.multiplier) {
                        const pctChange = Math.round((effect.multiplier - 1) * 100);
                        label = `${ASSET_TYPE_LABELS[effect.targetAssetType]} capacity ${pctChange}%`;
                        color = pctChange < 0 ? 'text-red-300 bg-red-500/20' : 'text-green-300 bg-green-500/20';
                      } else if (effect.type === 'modify_srmc' && effect.targetAssetType && effect.multiplier) {
                        const pctChange = Math.round((effect.multiplier - 1) * 100);
                        label = `${ASSET_TYPE_LABELS[effect.targetAssetType]} costs +${pctChange}%`;
                        color = 'text-red-300 bg-red-500/20';
                      } else if (effect.type === 'modify_capacity_factor' && effect.targetAssetType && effect.multiplier) {
                        const pctChange = Math.round((effect.multiplier - 1) * 100);
                        label = `${ASSET_TYPE_LABELS[effect.targetAssetType]} output ${pctChange > 0 ? '+' : ''}${pctChange}%`;
                        color = pctChange > 0 ? 'text-green-300 bg-green-500/20' : 'text-red-300 bg-red-500/20';
                      } else if (effect.type === 'force_outage' && effect.targetAssetType) {
                        label = `${ASSET_TYPE_LABELS[effect.targetAssetType]} plant forced offline`;
                        color = 'text-red-300 bg-red-500/20';
                      } else if (effect.type === 'add_carbon_cost' && effect.targetAssetType && effect.absoluteChange) {
                        label = `${ASSET_TYPE_LABELS[effect.targetAssetType]} +$${effect.absoluteChange}/MWh`;
                        color = 'text-amber-300 bg-amber-500/20';
                      }

                      return label ? (
                        <span
                          key={ei}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}
                        >
                          {label}
                        </span>
                      ) : null;
                    })}
                  </div>

                  {/* Learning objective */}
                  <div className="bg-navy-800/50 rounded-lg p-3 border border-white/5">
                    <div className="text-[10px] text-navy-500 uppercase tracking-wider mb-1">💡 What to learn</div>
                    <div className="text-sm text-navy-300">{event.learningObjective}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Seasonal Guidance */}
          {guidance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: hasScenarios ? 0.5 : 0.25 }}
            >
              {/* Headline */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <span className="text-lg">{seasonCfg.icon}</span>
                  <span className="text-sm font-semibold text-navy-200">{guidance.headline}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Demand Context */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📊</span>
                    <h4 className="text-sm font-bold text-blue-300">Demand Context</h4>
                  </div>
                  <p className="text-sm text-navy-300">{guidance.demandContext}</p>
                </div>

                {/* Supply Context */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">⚡</span>
                    <h4 className="text-sm font-bold text-amber-300">Supply Context</h4>
                  </div>
                  <p className="text-sm text-navy-300">{guidance.supplyContext}</p>
                </div>

                {/* Bidding Advice */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💡</span>
                    <h4 className="text-sm font-bold text-green-300">Bidding Advice</h4>
                  </div>
                  <p className="text-sm text-navy-300">{guidance.biddingAdvice}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Learning Objectives */}
          {roundConfig.learningObjectives && roundConfig.learningObjectives.length > 0 && (
            <motion.div
              className="bg-white/5 border border-white/10 rounded-xl p-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <h4 className="text-sm font-bold text-navy-200">Think About</h4>
              </div>
              <div className="space-y-2">
                {roundConfig.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${seasonCfg.color}20`, color: seasonCfg.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-navy-300 pt-0.5">{obj}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  SURPRISE INCIDENT SLIDE
  // ═══════════════════════════════════════
  function renderSurpriseSlide() {
    if (!surpriseIncidents || surpriseIncidents.length === 0) return <div />;

    const CATEGORY_STYLES: Record<string, { border: string; bg: string; glow: string }> = {
      supply: { border: 'border-red-500/40', bg: 'bg-red-500/10', glow: 'shadow-red-500/20' },
      demand: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' },
      cost: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' },
    };

    return (
      <div className="flex flex-col items-center h-full px-8 py-6 overflow-y-auto">
        {/* Dramatic header with pulsing effect */}
        <motion.div
          className="mb-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
            <motion.span
              className="text-2xl"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🚨
            </motion.span>
            <span className="text-sm font-bold text-red-300 tracking-wider uppercase">Developing Situation</span>
            <motion.span
              className="text-2xl"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.75 }}
            >
              🚨
            </motion.span>
          </div>
        </motion.div>

        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Market Conditions Have Changed
        </motion.h2>
        <motion.p
          className="text-lg text-navy-300 mb-8 text-center max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Incoming reports suggest conditions have shifted since the initial forecast. Adjust your strategy accordingly.
        </motion.p>

        <div className="w-full max-w-4xl space-y-5">
          {/* Incident cards */}
          {surpriseIncidents.map((incident, i) => {
            const style = CATEGORY_STYLES[incident.category] || CATEGORY_STYLES.demand;
            return (
              <motion.div
                key={i}
                className={`${style.bg} border-2 ${style.border} rounded-2xl p-6 shadow-lg ${style.glow}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{incident.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{incident.headline}</h3>
                    <p className="text-sm text-navy-200 leading-relaxed">{incident.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Demand comparison — forecast vs actual */}
          {preSurpriseDemandMW && (
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (surpriseIncidents.length) * 0.2 + 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📊</span>
                <h4 className="text-sm font-bold text-navy-200 uppercase tracking-wider">Demand: Forecast vs Actual</h4>
              </div>
              <div className={`grid gap-3 ${roundConfig.timePeriods.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                {roundConfig.timePeriods.map((period, i) => {
                  const forecast = preSurpriseDemandMW[period] || 0;
                  const actual = roundConfig.baseDemandMW[period] || 0;
                  const diff = actual - forecast;
                  const pctChange = forecast > 0 ? Math.round((diff / forecast) * 100) : 0;
                  const changed = Math.abs(diff) > 0;
                  const periodIcon = PERIOD_ICONS[period] || '⏰';
                  const periodLabel = TIME_PERIOD_SHORT_LABELS[period as TimePeriod] || period;

                  return (
                    <motion.div
                      key={period}
                      className={`rounded-xl p-4 ${changed ? (diff > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20') : 'bg-white/5 border border-white/5'}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <div className="text-xs text-navy-400 mb-1">{periodIcon} {periodLabel}</div>
                      {changed ? (
                        <>
                          <div className="text-xs text-navy-500 line-through font-mono">{formatNumber(forecast)} MW</div>
                          <div className={`text-xl font-bold font-mono ${diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {formatNumber(actual)} MW
                          </div>
                          <div className={`text-xs font-bold mt-1 ${diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {diff > 0 ? '▲' : '▼'} {Math.abs(pctChange)}% {diff > 0 ? 'above' : 'below'} forecast
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-bold font-mono text-navy-200">{formatNumber(actual)} MW</div>
                          <div className="text-xs text-navy-500 mt-1">As forecast</div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Dramatic footer message */}
          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-sm text-navy-400 italic">
              &ldquo;The market doesn&rsquo;t always go to plan. The best traders adapt.&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-navy-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">{seasonCfg.icon}</span>
          <div>
            <h1 className="text-white font-bold text-sm">Round {roundNumber} Briefing</h1>
            <p className="text-navy-400 text-xs">{roundConfig.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-navy-400">
            {slides[currentSlide]?.title}
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
            {slides[currentSlide]?.render()}
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
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
              className={`transition-all ${
                i === currentSlide
                  ? 'w-8 h-2.5 rounded-full'
                  : 'w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/40'
              }`}
              style={i === currentSlide ? { backgroundColor: seasonCfg.color } : undefined}
              title={s.title}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Open Bidding CTA on last slide */}
          {isLastSlide && onStartBidding && (
            <button
              onClick={onStartBidding}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg text-sm font-bold transition-colors animate-pulse-glow"
            >
              Open Bidding 💰
            </button>
          )}
          <button
            onClick={goNext}
            disabled={isLastSlide}
            className="flex items-center gap-2 px-4 py-2 bg-electric-500 hover:bg-electric-400 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
