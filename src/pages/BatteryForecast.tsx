import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { simulateBatteryProfit, deriveBatteryDecisions } from '../lib/profitSimulator';
import { calculateOptimalStrategy } from '../lib/optimalSolver';

// ─── Types ───────────────────────────────────────────────────────────────────

type ForecastBatteryMode = 'charge' | 'idle' | 'discharge';
type Phase = 'BROWSE' | 'INTRO' | 'DECIDE' | 'REVEAL' | 'RESULTS';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

interface BatterySpec {
  duid: string;
  name: string;
  region: string;
  maxMW: number;
  maxStorageMWh: number;
  roundTripEfficiency: number;
  durationHours: number;
}

interface MarketInterval {
  timestamp: string;
  hour: number;
  predispatchPrice: number;
  actualPrice: number;
}

interface BatteryDispatchInterval {
  timestamp: string;
  hour: number;
  mwOutput: number;
}

interface ChallengeSummary {
  id: string;
  date: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  battery: { duid: string; name: string; region: string };
  metadata: {
    peakPrice: number;
    minPrice: number;
    avgPrice: number;
    priceSpread: number;
    negativeIntervals: number;
    region: string;
    season: string;
  };
}

interface PlayerChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  battery: BatterySpec;
  initialSOCPercent: number;
  intervals: { timestamp: string; hour: number; predispatchPrice: number }[];
  metadata: ChallengeSummary['metadata'];
}

interface FullChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  battery: BatterySpec;
  initialSOCPercent: number;
  intervals: MarketInterval[];
  batteryActual: BatteryDispatchInterval[];
  metadata: ChallengeSummary['metadata'];
}

interface StrategyResult {
  label: string;
  totalProfit: number;
  socHistory: number[];
  intervalProfits: number[];
  decisions: ForecastBatteryMode[];
  totalChargeMWh: number;
  totalDischargeMWh: number;
  avgChargePrice: number;
  avgDischargePrice: number;
  chargeHours: number;
  dischargeHours: number;
  idleHours: number;
}

interface ChallengeEvaluation {
  challengeId: string;
  playerResult: StrategyResult;
  actualBatteryResult: StrategyResult;
  forecastOptimalResult: StrategyResult;
  perfectForesightResult: StrategyResult;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDollar(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatDollarFull(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`;
}

function priceColor(price: number): string {
  if (price < 0) return 'text-purple-400';
  if (price < 30) return 'text-green-400';
  if (price < 60) return 'text-navy-300';
  if (price < 100) return 'text-amber-400';
  return 'text-red-400';
}

function priceBgColor(price: number): string {
  if (price < 0) return 'bg-purple-400';
  if (price < 30) return 'bg-green-400';
  if (price < 60) return 'bg-navy-300';
  if (price < 100) return 'bg-amber-400';
  return 'bg-red-400';
}

function difficultyColor(d: 'easy' | 'medium' | 'hard'): string {
  if (d === 'easy') return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (d === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function modeLabel(mode: ForecastBatteryMode): string {
  if (mode === 'charge') return 'CHG';
  if (mode === 'discharge') return 'DIS';
  return 'IDLE';
}

function modeBadgeColor(mode: ForecastBatteryMode): string {
  if (mode === 'charge') return 'bg-green-500/20 text-green-400 border-green-500/40';
  if (mode === 'discharge') return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
  return 'bg-white/10 text-navy-300 border-white/20';
}

function hourLabel(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function periodForHour(hour: number): 'overnight' | 'morning' | 'midday' | 'evening' {
  if (hour < 6) return 'overnight';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'midday';
  return 'evening';
}

const PERIOD_CONFIG = {
  overnight: { label: 'Overnight (00-05)', accent: 'border-indigo-500/30', textAccent: 'text-indigo-400', bgAccent: 'bg-indigo-500/10' },
  morning: { label: 'Morning (06-11)', accent: 'border-amber-500/30', textAccent: 'text-amber-400', bgAccent: 'bg-amber-500/10' },
  midday: { label: 'Midday (12-17)', accent: 'border-yellow-500/30', textAccent: 'text-yellow-400', bgAccent: 'bg-yellow-500/10' },
  evening: { label: 'Evening (18-23)', accent: 'border-orange-500/30', textAccent: 'text-orange-400', bgAccent: 'bg-orange-500/10' },
} as const;

interface SOCSimResult {
  socHistory: number[];
  profitHistory: number[];
  totalProfit: number;
}

function simulateSOC(
  decisions: ForecastBatteryMode[],
  prices: number[],
  battery: BatterySpec,
  initialSOCPercent: number,
): SOCSimResult {
  const socHistory: number[] = [];
  const profitHistory: number[] = [];
  let currentSOC = (initialSOCPercent / 100) * battery.maxStorageMWh;
  let totalProfit = 0;

  socHistory.push(currentSOC);

  for (let i = 0; i < 24; i++) {
    const mode = decisions[i] ?? 'idle';
    const price = prices[i] ?? 0;
    let intervalProfit = 0;

    if (mode === 'charge') {
      const energyStored = Math.min(
        battery.maxMW * battery.roundTripEfficiency,
        battery.maxStorageMWh - currentSOC,
      );
      const drawMW = energyStored / battery.roundTripEfficiency;
      const cost = drawMW * price;
      currentSOC += energyStored;
      intervalProfit = -cost;
    } else if (mode === 'discharge') {
      const energyRemoved = Math.min(battery.maxMW, currentSOC);
      const revenue = energyRemoved * price;
      currentSOC -= energyRemoved;
      intervalProfit = revenue;
    }

    socHistory.push(currentSOC);
    profitHistory.push(intervalProfit);
    totalProfit += intervalProfit;
  }

  return { socHistory, profitHistory, totalProfit };
}

function canCharge(
  currentSOC: number,
  battery: BatterySpec,
): boolean {
  const potentialStored = Math.min(
    battery.maxMW * battery.roundTripEfficiency,
    battery.maxStorageMWh - currentSOC,
  );
  return potentialStored > 0.01;
}

function canDischarge(currentSOC: number, battery: BatterySpec): boolean {
  const potentialRemoved = Math.min(battery.maxMW, currentSOC);
  return potentialRemoved > 0.01;
}

// ─── SVG Sparkline ───────────────────────────────────────────────────────────

function PriceSparkline({ metadata }: { metadata: ChallengeSummary['metadata'] }) {
  const { peakPrice, minPrice, avgPrice } = metadata;
  const w = 120;
  const h = 40;
  const pad = 2;

  // Generate a synthetic 24-bar sparkline from metadata
  const range = peakPrice - minPrice;
  const bars: number[] = [];
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    // Simple synthetic pattern: dip in middle (solar), peaks at edges
    const base = avgPrice + (range * 0.3) * Math.sin(t * Math.PI * 2 - Math.PI / 2);
    const noise = (Math.sin(i * 7.3) * 0.1 + Math.sin(i * 3.1) * 0.05) * range;
    bars.push(Math.max(minPrice, Math.min(peakPrice, base + noise)));
  }

  const maxVal = Math.max(...bars, 1);
  const minVal = Math.min(...bars, 0);
  const valRange = maxVal - minVal || 1;
  const barW = (w - pad * 2) / 24 - 1;

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      {bars.map((val, i) => {
        const barH = ((val - minVal) / valRange) * (h - pad * 2);
        const x = pad + i * ((w - pad * 2) / 24);
        const y = h - pad - barH;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={Math.max(barW, 2)}
            height={Math.max(barH, 1)}
            rx={1}
            className={
              val < 0 ? 'fill-purple-400/60' :
              val < 30 ? 'fill-green-400/60' :
              val < 60 ? 'fill-navy-300/60' :
              val < 100 ? 'fill-amber-400/60' :
              'fill-red-400/60'
            }
          />
        );
      })}
    </svg>
  );
}

// ─── SVG Bar Chart (Intro Phase) ─────────────────────────────────────────────

function ForecastBarChart({ intervals }: { intervals: { hour: number; predispatchPrice: number }[] }) {
  const w = 600;
  const h = 200;
  const padX = 40;
  const padY = 20;
  const padTop = 10;

  const prices = intervals.map((iv) => iv.predispatchPrice);
  const maxPrice = Math.max(...prices, 50);
  const minPrice = Math.min(...prices, 0);
  const range = maxPrice - minPrice || 1;
  const barW = (w - padX * 2) / 24 - 2;
  const chartH = h - padY - padTop;
  const zeroY = padTop + (maxPrice / range) * chartH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-2xl" preserveAspectRatio="xMidYMid meet">
      {/* Zero line */}
      {minPrice < 0 && (
        <line
          x1={padX}
          y1={zeroY}
          x2={w - padX}
          y2={zeroY}
          stroke="white"
          strokeOpacity={0.2}
          strokeDasharray="4 4"
        />
      )}
      {/* Bars */}
      {prices.map((price, i) => {
        const barX = padX + i * ((w - padX * 2) / 24) + 1;
        let barTop: number;
        let barHeight: number;
        if (price >= 0) {
          barHeight = (price / range) * chartH;
          barTop = zeroY - barHeight;
        } else {
          barHeight = (Math.abs(price) / range) * chartH;
          barTop = zeroY;
        }
        const fill =
          price < 0 ? '#c084fc' :
          price < 30 ? '#4ade80' :
          price < 60 ? '#94a3b8' :
          price < 100 ? '#fbbf24' :
          '#f87171';
        return (
          <g key={i}>
            <rect
              x={barX}
              y={barTop}
              width={Math.max(barW, 4)}
              height={Math.max(barHeight, 1)}
              rx={2}
              fill={fill}
              fillOpacity={0.8}
            />
            {/* Hour label */}
            {i % 3 === 0 && (
              <text
                x={barX + barW / 2}
                y={h - 2}
                textAnchor="middle"
                fill="white"
                fillOpacity={0.5}
                fontSize={10}
              >
                {hourLabel(intervals[i].hour)}
              </text>
            )}
          </g>
        );
      })}
      {/* Y-axis labels */}
      <text x={padX - 5} y={padTop + 4} textAnchor="end" fill="white" fillOpacity={0.5} fontSize={10}>
        ${Math.round(maxPrice)}
      </text>
      <text x={padX - 5} y={h - padY} textAnchor="end" fill="white" fillOpacity={0.5} fontSize={10}>
        ${Math.round(minPrice)}
      </text>
    </svg>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-2 border-electric-500/30 border-t-electric-500 rounded-full animate-spin" />
      <span className="text-navy-400 text-sm">Loading...</span>
    </div>
  );
}

// ─── Error Display ───────────────────────────────────────────────────────────

function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-red-400 text-4xl">!</div>
      <p className="text-red-300 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm text-white transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ value, duration = 1500, prefix = '$' }: { value: number; duration?: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let startTime: number;
    let frameId: number;

    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  const sign = display < 0 ? '-' : '';
  return (
    <span>
      {sign}{prefix}{Math.abs(display).toLocaleString()}
    </span>
  );
}

// ─── Strategy Explainer Section ──────────────────────────────────────────────

const STRATEGIES = [
  {
    name: 'Solar Arbitrage',
    icon: '\u2600\uFE0F',
    desc: 'Charge during midday solar surplus when prices are low, discharge during the evening peak when demand outstrips solar output.',
  },
  {
    name: 'Peak Shaver',
    icon: '\u26A1',
    desc: 'Charge overnight at low prices, then discharge during the morning and evening demand peaks to capture the daily spread.',
  },
  {
    name: 'Forecast Skeptic',
    icon: '\uD83E\uDD14',
    desc: 'Look for extreme forecast prices and bet on mean reversion. If the forecast predicts a spike, it may not materialize; stay idle or go contrarian.',
  },
  {
    name: 'Spread Maximizer',
    icon: '\uD83D\uDCCA',
    desc: 'Only trade when the price spread exceeds the round-trip efficiency loss threshold. If the gap between charge and discharge prices is too thin, stay idle.',
  },
  {
    name: 'Multiple Cycles',
    icon: '\uD83D\uDD04',
    desc: 'With a 1-hour duration battery, you can cycle 2-3 times per day. Look for multiple charge/discharge opportunities rather than a single big trade.',
  },
  {
    name: 'Negative Price Hunter',
    icon: '\uD83D\uDCB0',
    desc: 'Get paid to charge when prices go negative, then discharge at any positive price. Even a small positive price gives profit when you were paid to store energy.',
  },
];

function StrategyExplainer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{'\uD83D\uDCA1'}</span>
          <span className="text-white font-semibold">Strategy Guide</span>
          <span className="text-navy-400 text-sm ml-2">6 approaches to battery trading</span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-navy-400"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 pt-0">
              {STRATEGIES.map((s) => (
                <div key={s.name} className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-white font-medium text-sm">{s.name}</span>
                  </div>
                  <p className="text-navy-400 text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SOC Gauge ───────────────────────────────────────────────────────────────

function SOCGauge({ soc, max, label }: { soc: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (soc / max) * 100)) : 0;
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2 min-w-0">
      {label && <span className="text-navy-400 text-xs whitespace-nowrap">{label}</span>}
      <div className="w-20 h-3 bg-white/10 rounded-full overflow-hidden flex-shrink-0">
        <motion.div
          className={`h-full ${color} rounded-full`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="text-white text-xs font-mono whitespace-nowrap">
        {Math.round(soc)} MWh
      </span>
    </div>
  );
}

// ─── Hour Row (Decide Phase) ─────────────────────────────────────────────────

function HourRow({
  hour,
  forecastPrice,
  mode,
  socBefore,
  battery,
  onSetMode,
}: {
  hour: number;
  forecastPrice: number;
  mode: ForecastBatteryMode;
  socBefore: number;
  battery: BatterySpec;
  onSetMode: (mode: ForecastBatteryMode) => void;
}) {
  const chargeOk = canCharge(socBefore, battery);
  const dischargeOk = canDischarge(socBefore, battery);
  const socPct = battery.maxStorageMWh > 0 ? (socBefore / battery.maxStorageMWh) * 100 : 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
      {/* Hour label */}
      <span className="text-navy-400 text-xs font-mono w-12 flex-shrink-0">{hourLabel(hour)}</span>

      {/* Forecast price */}
      <span className={`text-xs font-mono w-16 text-right flex-shrink-0 ${priceColor(forecastPrice)}`}>
        ${forecastPrice.toFixed(0)}
      </span>

      {/* Mode toggle buttons */}
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => onSetMode('charge')}
          disabled={!chargeOk}
          className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all ${
            mode === 'charge'
              ? 'bg-green-500/30 text-green-300 border-green-500/60'
              : 'bg-white/5 text-navy-400 border-white/10 hover:bg-green-500/10 hover:text-green-400'
          } disabled:opacity-20 disabled:cursor-not-allowed`}
        >
          CHG
        </button>
        <button
          onClick={() => onSetMode('idle')}
          className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all ${
            mode === 'idle'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-white/5 text-navy-400 border-white/10 hover:bg-white/10 hover:text-navy-200'
          }`}
        >
          IDLE
        </button>
        <button
          onClick={() => onSetMode('discharge')}
          disabled={!dischargeOk}
          className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all ${
            mode === 'discharge'
              ? 'bg-blue-500/30 text-blue-300 border-blue-500/60'
              : 'bg-white/5 text-navy-400 border-white/10 hover:bg-blue-500/10 hover:text-blue-400'
          } disabled:opacity-20 disabled:cursor-not-allowed`}
        >
          DIS
        </button>
      </div>

      {/* SOC mini bar */}
      <div className="hidden sm:flex items-center gap-1 flex-1 min-w-0">
        <div className="w-full max-w-[60px] h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              socPct > 60 ? 'bg-green-500/60' : socPct > 30 ? 'bg-amber-500/60' : 'bg-red-500/60'
            }`}
            style={{ width: `${socPct}%` }}
          />
        </div>
        <span className="text-navy-500 text-[10px] font-mono">{Math.round(socPct)}%</span>
      </div>
    </div>
  );
}

// ─── Reveal Row ──────────────────────────────────────────────────────────────

function RevealRow({
  hour,
  forecastPrice,
  actualPrice,
  playerMode,
  batteryMode,
  profit,
  visible,
}: {
  hour: number;
  forecastPrice: number;
  actualPrice: number;
  playerMode: ForecastBatteryMode;
  batteryMode: ForecastBatteryMode;
  profit: number;
  visible: boolean;
}) {
  const priceDiff = actualPrice - forecastPrice;
  const divergenceColor = Math.abs(priceDiff) > 20
    ? 'text-red-400'
    : Math.abs(priceDiff) > 10
      ? 'text-amber-400'
      : 'text-green-400';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
      className="border-b border-white/5"
    >
      <td className="py-1.5 px-2 text-xs font-mono text-navy-400">{hourLabel(hour)}</td>
      <td className={`py-1.5 px-2 text-xs font-mono text-right ${priceColor(forecastPrice)}`}>
        ${forecastPrice.toFixed(0)}
      </td>
      <td className={`py-1.5 px-2 text-xs font-mono text-right ${priceColor(actualPrice)}`}>
        ${actualPrice.toFixed(0)}
      </td>
      <td className={`py-1.5 px-2 text-xs font-mono text-right ${divergenceColor}`}>
        {priceDiff >= 0 ? '+' : ''}{priceDiff.toFixed(0)}
      </td>
      <td className="py-1.5 px-2">
        <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded border ${modeBadgeColor(playerMode)}`}>
          {modeLabel(playerMode)}
        </span>
      </td>
      <td className="py-1.5 px-2">
        <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded border ${modeBadgeColor(batteryMode)}`}>
          {modeLabel(batteryMode)}
        </span>
      </td>
      <td className={`py-1.5 px-2 text-xs font-mono text-right ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {profit >= 0 ? '+' : ''}{formatDollar(profit)}
      </td>
    </motion.tr>
  );
}

// ─── Comparison Bar ──────────────────────────────────────────────────────────

function ComparisonBar({
  label,
  value,
  maxValue,
  color,
  delay,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  delay: number;
}) {
  const pct = maxValue > 0 ? Math.max(3, Math.min(100, (Math.abs(value) / maxValue) * 100)) : 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-navy-300">{label}</span>
        <span className={`text-sm font-mono font-bold ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatDollarFull(value)}
        </span>
      </div>
      <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BatteryForecast() {
  const navigate = useNavigate();

  // ── Phase state ──
  const [phase, setPhase] = useState<Phase>('BROWSE');

  // ── BROWSE state ──
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [challengesError, setChallengesError] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');

  // ── INTRO / DECIDE state ──
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [playerChallenge, setPlayerChallenge] = useState<PlayerChallenge | null>(null);
  const [playerChallengeLoading, setPlayerChallengeLoading] = useState(false);
  const [playerChallengeError, setPlayerChallengeError] = useState<string | null>(null);

  // ── DECIDE state ──
  const [decisions, setDecisions] = useState<ForecastBatteryMode[]>(Array(24).fill('idle'));

  // ── REVEAL / RESULTS state ──
  const [evaluation, setEvaluation] = useState<ChallengeEvaluation | null>(null);
  const [fullChallenge, setFullChallenge] = useState<FullChallenge | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [revealedRows, setRevealedRows] = useState(0);
  const [revealComplete, setRevealComplete] = useState(false);

  // ── Fetch challenges ──
  const fetchChallenges = useCallback(async () => {
    setChallengesLoading(true);
    setChallengesError(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/battery-forecast/challenges/index.json`);
      if (!res.ok) throw new Error(`Failed to load challenges (${res.status})`);
      const data: ChallengeSummary[] = await res.json();
      setChallenges(data);
    } catch (err) {
      setChallengesError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setChallengesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // ── Filtered challenges ──
  const filteredChallenges = useMemo(() => {
    if (difficultyFilter === 'all') return challenges;
    return challenges.filter((c) => c.difficulty === difficultyFilter);
  }, [challenges, difficultyFilter]);

  // ── Select challenge ──
  const selectChallenge = useCallback(async (id: string) => {
    setSelectedChallengeId(id);
    setPlayerChallengeLoading(true);
    setPlayerChallengeError(null);
    setPhase('INTRO');
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/battery-forecast/challenges/${id}.json`);
      if (!res.ok) throw new Error(`Failed to load challenge (${res.status})`);
      const data: PlayerChallenge = await res.json();
      setPlayerChallenge(data);
    } catch (err) {
      setPlayerChallengeError(err instanceof Error ? err.message : 'Failed to load challenge');
    } finally {
      setPlayerChallengeLoading(false);
    }
  }, []);

  // ── SOC simulation for DECIDE phase ──
  const decideSim = useMemo(() => {
    if (!playerChallenge) return null;
    const prices = playerChallenge.intervals.map((iv) => iv.predispatchPrice);
    return simulateSOC(decisions, prices, playerChallenge.battery, playerChallenge.initialSOCPercent);
  }, [decisions, playerChallenge]);

  // ── Submit decisions ──
  const submitDecisions = useCallback(async () => {
    if (!selectedChallengeId) return;
    setSubmitLoading(true);
    setSubmitError(null);
    setRevealedRows(0);
    setRevealComplete(false);

    try {
      // Fetch full challenge data (with actual prices)
      const fullRes = await fetch(`${import.meta.env.BASE_URL}api/battery-forecast/challenges/${selectedChallengeId}-full.json`);
      if (!fullRes.ok) throw new Error(`Failed to load full challenge (${fullRes.status})`);
      const fullData: FullChallenge = await fullRes.json();

      // Evaluate client-side
      const battery = fullData.battery;
      const initialSOCMWh = battery.maxStorageMWh * fullData.initialSOCPercent / 100;
      const actualPrices = fullData.intervals.map(i => i.actualPrice);
      const predispatchPrices = fullData.intervals.map(i => i.predispatchPrice);

      // 1. Player's result (their decisions applied to actual prices)
      const playerResult = simulateBatteryProfit(
        decisions, actualPrices, battery, initialSOCMWh, 'Your Strategy'
      );

      // 2. What the real battery actually did
      const actualDecisions = deriveBatteryDecisions(fullData.batteryActual, battery.maxMW);
      const actualBatteryResult = simulateBatteryProfit(
        actualDecisions, actualPrices, battery, initialSOCMWh, `${battery.name} Actual`
      );

      // 3. Optimal strategy using only forecast info (evaluated on actual prices)
      const forecastOptimal = calculateOptimalStrategy(
        predispatchPrices, battery, initialSOCMWh, 'Forecast Optimal'
      );
      const forecastOptimalResult = simulateBatteryProfit(
        forecastOptimal.decisions, actualPrices, battery, initialSOCMWh, 'Best with Forecast'
      );

      // 4. Perfect foresight (optimal on actual prices)
      const perfectForesightResult = calculateOptimalStrategy(
        actualPrices, battery, initialSOCMWh, 'Perfect Foresight'
      );

      const evalData: ChallengeEvaluation = {
        challengeId: fullData.id,
        playerResult,
        actualBatteryResult,
        forecastOptimalResult,
        perfectForesightResult,
      };

      setEvaluation(evalData);
      setFullChallenge(fullData);
      setPhase('REVEAL');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitLoading(false);
    }
  }, [selectedChallengeId, decisions]);

  // ── Reveal animation ──
  useEffect(() => {
    if (phase !== 'REVEAL' || !evaluation) return;
    if (revealedRows >= 24) {
      const timer = setTimeout(() => setRevealComplete(true), 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setRevealedRows((prev) => prev + 1);
    }, 120);
    return () => clearTimeout(timer);
  }, [phase, evaluation, revealedRows]);

  // ── Derive actual battery modes from dispatch data ──
  const actualBatteryModes = useMemo((): ForecastBatteryMode[] => {
    if (!fullChallenge) return Array(24).fill('idle');
    return fullChallenge.batteryActual.map((iv) => {
      if (iv.mwOutput > 5) return 'discharge';
      if (iv.mwOutput < -5) return 'charge';
      return 'idle';
    });
  }, [fullChallenge]);

  // ── Results computations ──
  const resultsData = useMemo(() => {
    if (!evaluation || !fullChallenge) return null;

    const { playerResult, actualBatteryResult, forecastOptimalResult, perfectForesightResult } = evaluation;

    // Decision match count
    const matchCount = playerResult.decisions.reduce((count, d, i) => {
      return count + (d === actualBatteryResult.decisions[i] ? 1 : 0);
    }, 0);

    // Forecast error
    const forecastErrors = fullChallenge.intervals.map((iv) =>
      Math.abs(iv.actualPrice - iv.predispatchPrice),
    );
    const avgForecastError = forecastErrors.reduce((s, e) => s + e, 0) / forecastErrors.length;

    // Performance rating
    const playerProfit = playerResult.totalProfit;
    const perfectProfit = perfectForesightResult.totalProfit;
    const profitRatio = perfectProfit > 0 ? playerProfit / perfectProfit : 0;
    let rating: string;
    let ratingColor: string;
    if (profitRatio >= 0.8) { rating = 'Excellent'; ratingColor = 'text-green-400'; }
    else if (profitRatio >= 0.6) { rating = 'Good'; ratingColor = 'text-blue-400'; }
    else if (profitRatio >= 0.4) { rating = 'Getting There'; ratingColor = 'text-amber-400'; }
    else { rating = 'Room for Improvement'; ratingColor = 'text-orange-400'; }

    // Max value for comparison bars
    const allProfits = [
      playerProfit,
      actualBatteryResult.totalProfit,
      forecastOptimalResult.totalProfit,
      perfectForesightResult.totalProfit,
    ];
    const maxProfit = Math.max(...allProfits.map(Math.abs), 1);

    return {
      playerResult,
      actualBatteryResult,
      forecastOptimalResult,
      perfectForesightResult,
      matchCount,
      avgForecastError,
      rating,
      ratingColor,
      profitRatio,
      maxProfit,
    };
  }, [evaluation, fullChallenge]);

  // ── Phase transition helpers ──
  const goToBrowse = useCallback(() => {
    setPhase('BROWSE');
    setPlayerChallenge(null);
    setSelectedChallengeId(null);
    setEvaluation(null);
    setFullChallenge(null);
    setDecisions(Array(24).fill('idle'));
    setRevealedRows(0);
    setRevealComplete(false);
    setSubmitError(null);
  }, []);

  const startDecide = useCallback(() => {
    setDecisions(Array(24).fill('idle'));
    setPhase('DECIDE');
  }, []);

  const setDecision = useCallback((hour: number, mode: ForecastBatteryMode) => {
    setDecisions((prev) => {
      const next = [...prev];
      next[hour] = mode;
      return next;
    });
  }, []);

  const playAgain = useCallback(() => {
    setDecisions(Array(24).fill('idle'));
    setEvaluation(null);
    setFullChallenge(null);
    setRevealedRows(0);
    setRevealComplete(false);
    setPhase('DECIDE');
  }, []);

  // ── Running totals for reveal ──
  const revealRunningTotal = useMemo(() => {
    if (!evaluation) return 0;
    return evaluation.playerResult.intervalProfits
      .slice(0, revealedRows)
      .reduce((s, p) => s + p, 0);
  }, [evaluation, revealedRows]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <AnimatePresence mode="wait">
        {/* ════════════════════════════════════════════════════════════════════
            BROWSE PHASE
            ════════════════════════════════════════════════════════════════════ */}
        {phase === 'BROWSE' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto px-4 py-8"
          >
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-navy-400 hover:text-white text-sm mb-4 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Home
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{'\uD83D\uDD0B'}</span>
                <h1 className="text-3xl sm:text-4xl font-bold">Battery Forecast Challenge</h1>
              </div>
              <p className="text-navy-400 max-w-2xl">
                Can you out-trade a real NEM battery? Use the pre-dispatch price forecast to plan
                your charge/discharge strategy, then see how you compare against what the battery
                actually did and the mathematically optimal approach.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setDifficultyFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    difficultyFilter === f
                      ? 'bg-electric-500/20 text-electric-300 border-electric-500/40'
                      : 'bg-white/5 text-navy-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Challenges Grid */}
            {challengesLoading ? (
              <Spinner />
            ) : challengesError ? (
              <ErrorMessage message={challengesError} onRetry={fetchChallenges} />
            ) : filteredChallenges.length === 0 ? (
              <div className="text-center py-20 text-navy-400">
                <p className="text-lg mb-2">No challenges found</p>
                <p className="text-sm">Try a different difficulty filter or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredChallenges.map((challenge, i) => (
                  <motion.button
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    onClick={() => selectChallenge(challenge.id)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/[0.08] hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty.toUpperCase()}
                          </span>
                          <span className="text-navy-500 text-xs">{challenge.date}</span>
                        </div>
                        <h3 className="text-white font-semibold text-base group-hover:text-electric-300 transition-colors truncate">
                          {challenge.title}
                        </h3>
                      </div>
                      <PriceSparkline metadata={challenge.metadata} />
                    </div>

                    <p className="text-navy-400 text-sm mb-3 line-clamp-2">{challenge.description}</p>

                    {/* Tags */}
                    {challenge.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {challenge.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-navy-400 border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-navy-400">
                      <span>
                        Peak: <span className="text-red-400 font-mono">${Math.round(challenge.metadata.peakPrice)}</span>
                      </span>
                      <span>
                        Min: <span className={`${challenge.metadata.minPrice < 0 ? 'text-purple-400' : 'text-green-400'} font-mono`}>
                          ${Math.round(challenge.metadata.minPrice)}
                        </span>
                      </span>
                      {challenge.metadata.negativeIntervals > 0 && (
                        <span>
                          <span className="text-purple-400 font-mono">{challenge.metadata.negativeIntervals}</span> neg hrs
                        </span>
                      )}
                      <span className="text-navy-500">{challenge.battery.region}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            INTRO PHASE
            ════════════════════════════════════════════════════════════════════ */}
        {phase === 'INTRO' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto px-4 py-8"
          >
            <button
              onClick={goToBrowse}
              className="flex items-center gap-2 text-navy-400 hover:text-white text-sm mb-6 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Challenges
            </button>

            {playerChallengeLoading ? (
              <Spinner />
            ) : playerChallengeError ? (
              <ErrorMessage message={playerChallengeError} onRetry={() => selectedChallengeId && selectChallenge(selectedChallengeId)} />
            ) : playerChallenge ? (
              <div className="space-y-6">
                {/* Challenge Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColor(playerChallenge.difficulty)}`}>
                      {playerChallenge.difficulty.toUpperCase()}
                    </span>
                    <span className="text-navy-500 text-sm">{playerChallenge.date}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">{playerChallenge.title}</h2>
                  <p className="text-navy-400">{playerChallenge.description}</p>
                </div>

                {/* Battery Specs */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <span>{'\uD83D\uDD0B'}</span> Battery Specifications
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-navy-400 text-xs mb-1">Name</div>
                      <div className="text-white font-semibold text-sm">{playerChallenge.battery.name}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-navy-400 text-xs mb-1">Capacity</div>
                      <div className="text-white font-mono font-bold">
                        {playerChallenge.battery.maxMW} MW / {playerChallenge.battery.maxStorageMWh} MWh
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-navy-400 text-xs mb-1">Round-Trip Efficiency</div>
                      <div className="text-electric-400 font-mono font-bold">
                        {Math.round(playerChallenge.battery.roundTripEfficiency * 100)}%
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-navy-400 text-xs mb-1">Duration</div>
                      <div className="text-white font-mono font-bold">
                        {playerChallenge.battery.durationHours}hr
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-navy-400 text-xs mb-1">Region</div>
                      <div className="text-white font-mono font-bold">
                        {playerChallenge.battery.region}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Starting SOC */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">Starting State of Charge</h3>
                    <span className="text-electric-400 font-mono font-bold text-lg">
                      {playerChallenge.initialSOCPercent}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-electric-500 rounded-full transition-all"
                      style={{ width: `${playerChallenge.initialSOCPercent}%` }}
                    />
                  </div>
                  <p className="text-navy-400 text-sm mt-2">
                    {Math.round((playerChallenge.initialSOCPercent / 100) * playerChallenge.battery.maxStorageMWh)} MWh
                    of {playerChallenge.battery.maxStorageMWh} MWh stored
                  </p>
                </div>

                {/* Pre-dispatch Price Forecast */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                    <span>{'\uD83D\uDCC8'}</span> Pre-dispatch Price Forecast ($/MWh)
                  </h3>
                  <div className="overflow-x-auto">
                    <ForecastBarChart intervals={playerChallenge.intervals} />
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-navy-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400" /> Negative
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400" /> Low (&lt;$30)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-navy-300" /> Mid ($30-60)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> High ($60-100)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400" /> Spike ({'\u2265'}$100)
                    </span>
                  </div>
                </div>

                {/* Strategy Explainer */}
                <StrategyExplainer />

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={startDecide}
                    className="bg-electric-500 hover:bg-electric-600 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
                  >
                    Start Challenge
                  </button>
                  <button
                    onClick={goToBrowse}
                    className="border border-white/20 hover:bg-white/10 text-white rounded-xl px-6 py-3 transition-colors"
                  >
                    Back to Challenges
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            DECIDE PHASE
            ════════════════════════════════════════════════════════════════════ */}
        {phase === 'DECIDE' && playerChallenge && (
          <motion.div
            key="decide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto px-4 pb-24"
          >
            {/* Sticky top bar */}
            <div className="sticky top-0 z-30 bg-navy-950/95 backdrop-blur-sm border-b border-white/10 py-3 mb-4 -mx-4 px-4">
              <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4 sm:gap-6">
                <SOCGauge
                  soc={decideSim ? decideSim.socHistory[decideSim.socHistory.length - 1] : 0}
                  max={playerChallenge.battery.maxStorageMWh}
                  label="SOC"
                />
                <div className="flex items-center gap-2">
                  <span className="text-navy-400 text-xs">Est. P&L</span>
                  <span className={`font-mono font-bold text-sm ${
                    (decideSim?.totalProfit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatDollar(decideSim?.totalProfit ?? 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-navy-400 text-xs">Hours Set</span>
                  <span className="text-white font-mono text-sm">24/24</span>
                </div>
                <div className="text-navy-500 text-xs hidden sm:block">
                  {playerChallenge.title}
                </div>
              </div>
            </div>

            {/* Period Columns - desktop: 4 columns, mobile: vertical */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-4">
              {(['overnight', 'morning', 'midday', 'evening'] as const).map((period) => {
                const config = PERIOD_CONFIG[period];
                const hours = playerChallenge.intervals.filter(
                  (iv) => periodForHour(iv.hour) === period,
                );
                return (
                  <div key={period} className={`bg-white/5 border ${config.accent} rounded-2xl p-3`}>
                    <h3 className={`text-sm font-semibold mb-2 ${config.textAccent}`}>
                      {config.label}
                    </h3>
                    <div className="space-y-0.5">
                      {hours.map((iv) => (
                        <HourRow
                          key={iv.hour}
                          hour={iv.hour}
                          forecastPrice={iv.predispatchPrice}
                          mode={decisions[iv.hour]}
                          socBefore={decideSim ? decideSim.socHistory[iv.hour] : 0}
                          battery={playerChallenge.battery}
                          onSetMode={(mode) => setDecision(iv.hour, mode)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile layout */}
            <div className="lg:hidden space-y-4">
              {(['overnight', 'morning', 'midday', 'evening'] as const).map((period) => {
                const config = PERIOD_CONFIG[period];
                const hours = playerChallenge.intervals.filter(
                  (iv) => periodForHour(iv.hour) === period,
                );
                return (
                  <div key={period}>
                    <h3 className={`text-sm font-semibold mb-2 ${config.textAccent}`}>
                      {config.label}
                    </h3>
                    <div className={`bg-white/5 border ${config.accent} rounded-2xl p-3 space-y-0.5`}>
                      {hours.map((iv) => (
                        <HourRow
                          key={iv.hour}
                          hour={iv.hour}
                          forecastPrice={iv.predispatchPrice}
                          mode={decisions[iv.hour]}
                          socBefore={decideSim ? decideSim.socHistory[iv.hour] : 0}
                          battery={playerChallenge.battery}
                          onSetMode={(mode) => setDecision(iv.hour, mode)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky bottom submit bar */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-navy-950/95 backdrop-blur-sm border-t border-white/10 py-3 px-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <button
                  onClick={() => setPhase('INTRO')}
                  className="text-navy-400 hover:text-white text-sm transition-colors"
                >
                  Back
                </button>
                <div className="flex items-center gap-4">
                  {submitError && (
                    <span className="text-red-400 text-xs">{submitError}</span>
                  )}
                  <button
                    onClick={submitDecisions}
                    disabled={submitLoading}
                    className="bg-electric-500 hover:bg-electric-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-2.5 transition-colors flex items-center gap-2"
                  >
                    {submitLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      'Submit Decisions'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            REVEAL PHASE
            ════════════════════════════════════════════════════════════════════ */}
        {phase === 'REVEAL' && evaluation && fullChallenge && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto px-4 py-8"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span>{'\uD83C\uDFAC'}</span> Hour-by-Hour Reveal
            </h2>
            <p className="text-navy-400 mb-6 text-sm">
              Watch how your decisions played out against actual market prices and the real battery's strategy.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-navy-400">
                      <th className="text-left py-2 px-2 text-xs font-medium">Hour</th>
                      <th className="text-right py-2 px-2 text-xs font-medium">Forecast</th>
                      <th className="text-right py-2 px-2 text-xs font-medium">Actual</th>
                      <th className="text-right py-2 px-2 text-xs font-medium">Diff</th>
                      <th className="text-left py-2 px-2 text-xs font-medium">You</th>
                      <th className="text-left py-2 px-2 text-xs font-medium">{playerChallenge?.battery.duid ?? 'Battery'}</th>
                      <th className="text-right py-2 px-2 text-xs font-medium">Your P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullChallenge.intervals.map((iv, i) => (
                      <RevealRow
                        key={iv.hour}
                        hour={iv.hour}
                        forecastPrice={iv.predispatchPrice}
                        actualPrice={iv.actualPrice}
                        playerMode={evaluation.playerResult.decisions[i] ?? 'idle'}
                        batteryMode={actualBatteryModes[i]}
                        profit={evaluation.playerResult.intervalProfits[i] ?? 0}
                        visible={i < revealedRows}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Running total */}
              <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between">
                <span className="text-navy-400 text-sm">Running Total</span>
                <motion.span
                  className={`font-mono font-bold text-lg ${revealRunningTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  key={revealedRows}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {revealRunningTotal >= 0 ? '+' : ''}{formatDollar(revealRunningTotal)}
                </motion.span>
              </div>
            </div>

            {/* View Results button */}
            <AnimatePresence>
              {revealComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <button
                    onClick={() => setPhase('RESULTS')}
                    className="bg-electric-500 hover:bg-electric-600 text-white font-semibold rounded-xl px-8 py-3 transition-colors text-lg"
                  >
                    View Results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            RESULTS PHASE
            ════════════════════════════════════════════════════════════════════ */}
        {phase === 'RESULTS' && resultsData && evaluation && fullChallenge && playerChallenge && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto px-4 py-8 space-y-6"
          >
            {/* Profit Hero Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`text-center py-10 rounded-2xl border ${
                resultsData.playerResult.totalProfit >= 0
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="text-navy-400 text-sm mb-2">Your Total Profit</div>
              <div className={`text-4xl sm:text-5xl font-bold font-mono ${
                resultsData.playerResult.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <AnimatedCounter value={resultsData.playerResult.totalProfit} />
              </div>
              <div className={`text-sm mt-2 font-medium ${resultsData.ratingColor}`}>
                {resultsData.rating}
              </div>
              <div className="text-navy-500 text-xs mt-1">
                {Math.round(resultsData.profitRatio * 100)}% of perfect foresight profit
              </div>
            </motion.div>

            {/* 4-Level Comparison */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-lg mb-4">Strategy Comparison</h3>
              <div className="space-y-4">
                <ComparisonBar
                  label="Your Strategy"
                  value={resultsData.playerResult.totalProfit}
                  maxValue={resultsData.maxProfit}
                  color="bg-electric-400"
                  delay={0}
                />
                <ComparisonBar
                  label={`${playerChallenge.battery.duid} (Actual)`}
                  value={resultsData.actualBatteryResult.totalProfit}
                  maxValue={resultsData.maxProfit}
                  color="bg-purple-400"
                  delay={0.15}
                />
                <ComparisonBar
                  label="Best with Forecast"
                  value={resultsData.forecastOptimalResult.totalProfit}
                  maxValue={resultsData.maxProfit}
                  color="bg-amber-400"
                  delay={0.3}
                />
                <ComparisonBar
                  label="Perfect Foresight"
                  value={resultsData.perfectForesightResult.totalProfit}
                  maxValue={resultsData.maxProfit}
                  color="bg-green-400"
                  delay={0.45}
                />
              </div>
            </div>

            {/* Decision Match */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">
                  Decision Match vs {playerChallenge.battery.duid}
                </h3>
                <span className="text-electric-400 font-mono font-bold text-lg">
                  {resultsData.matchCount}/24
                </span>
              </div>
              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(resultsData.matchCount / 24) * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-electric-500 rounded-full"
                />
              </div>
              <p className="text-navy-400 text-sm mt-2">
                You matched the real battery's decisions {resultsData.matchCount} out of 24 hours
              </p>
            </motion.div>

            {/* Charging & Discharging Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5"
              >
                <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 12V4M5 7L8 4L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Charging Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400">Hours Charged</span>
                    <span className="text-white font-mono">{resultsData.playerResult.chargeHours}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400">Total Energy Stored</span>
                    <span className="text-white font-mono">{resultsData.playerResult.totalChargeMWh.toFixed(1)} MWh</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400">Avg Charge Price</span>
                    <span className="text-green-400 font-mono">${resultsData.playerResult.avgChargePrice.toFixed(1)}/MWh</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5"
              >
                <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 4V12M11 9L8 12L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Discharging Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400">Hours Discharged</span>
                    <span className="text-white font-mono">{resultsData.playerResult.dischargeHours}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400">Total Energy Sold</span>
                    <span className="text-white font-mono">{resultsData.playerResult.totalDischargeMWh.toFixed(1)} MWh</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400">Avg Discharge Price</span>
                    <span className="text-blue-400 font-mono">${resultsData.playerResult.avgDischargePrice.toFixed(1)}/MWh</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Price Spread Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <h3 className="text-white font-semibold mb-3">Price Spread Captured</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <span className="text-navy-400 text-sm">Avg Sell Price</span>
                  <div className="text-blue-400 font-mono font-bold text-lg">
                    ${resultsData.playerResult.avgDischargePrice.toFixed(1)}
                  </div>
                </div>
                <span className="text-navy-500 text-2xl">-</span>
                <div>
                  <span className="text-navy-400 text-sm">Avg Buy Price</span>
                  <div className="text-green-400 font-mono font-bold text-lg">
                    ${resultsData.playerResult.avgChargePrice.toFixed(1)}
                  </div>
                </div>
                <span className="text-navy-500 text-2xl">=</span>
                <div>
                  <span className="text-navy-400 text-sm">Spread</span>
                  <div className={`font-mono font-bold text-lg ${
                    (resultsData.playerResult.avgDischargePrice - resultsData.playerResult.avgChargePrice) >= 0
                      ? 'text-electric-400'
                      : 'text-red-400'
                  }`}>
                    ${(resultsData.playerResult.avgDischargePrice - resultsData.playerResult.avgChargePrice).toFixed(1)}/MWh
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Market Uncertainty
                </div>
                <div className="text-white font-mono font-bold text-lg mb-1">
                  ${resultsData.avgForecastError.toFixed(0)}/MWh
                </div>
                <p className="text-navy-400 text-xs">
                  Average forecast error. The pre-dispatch was off by this much on average.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <div className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  {playerChallenge.battery.duid} Insight
                </div>
                <div className="text-white text-sm mb-1">
                  {resultsData.actualBatteryResult.chargeHours > resultsData.actualBatteryResult.dischargeHours
                    ? 'Net charger today'
                    : resultsData.actualBatteryResult.dischargeHours > resultsData.actualBatteryResult.chargeHours
                      ? 'Net discharger today'
                      : 'Balanced cycling today'}
                </div>
                <p className="text-navy-400 text-xs">
                  {resultsData.actualBatteryResult.chargeHours} hrs charging,{' '}
                  {resultsData.actualBatteryResult.dischargeHours} hrs discharging,{' '}
                  {resultsData.actualBatteryResult.idleHours} hrs idle
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${resultsData.ratingColor}`}>
                  Performance Rating
                </div>
                <div className={`font-bold text-lg mb-1 ${resultsData.ratingColor}`}>
                  {resultsData.rating}
                </div>
                <p className="text-navy-400 text-xs">
                  You captured {Math.round(resultsData.profitRatio * 100)}% of the
                  maximum possible profit with perfect foresight.
                </p>
              </motion.div>
            </div>

            {/* Collapsible 24-Hour Breakdown */}
            <DetailedBreakdown
              evaluation={evaluation}
              fullChallenge={fullChallenge}
              actualBatteryModes={actualBatteryModes}
            />

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <button
                onClick={playAgain}
                className="bg-electric-500 hover:bg-electric-600 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={goToBrowse}
                className="border border-white/20 hover:bg-white/10 text-white rounded-xl px-6 py-3 transition-colors"
              >
                Try Another Challenge
              </button>
              <button
                onClick={() => navigate('/')}
                className="border border-white/20 hover:bg-white/10 text-navy-400 hover:text-white rounded-xl px-6 py-3 transition-colors"
              >
                Back to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Detailed Breakdown (Collapsible) ────────────────────────────────────────

function DetailedBreakdown({
  evaluation,
  fullChallenge,
  actualBatteryModes,
}: {
  evaluation: ChallengeEvaluation;
  fullChallenge: FullChallenge;
  actualBatteryModes: ForecastBatteryMode[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-semibold">24-Hour Breakdown</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-navy-400"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-white/10 text-navy-400">
                    <th className="text-left py-2 px-3 text-xs font-medium">Hour</th>
                    <th className="text-right py-2 px-3 text-xs font-medium">Forecast $</th>
                    <th className="text-right py-2 px-3 text-xs font-medium">Actual $</th>
                    <th className="text-center py-2 px-3 text-xs font-medium">You</th>
                    <th className="text-center py-2 px-3 text-xs font-medium">{fullChallenge.battery.duid}</th>
                    <th className="text-right py-2 px-3 text-xs font-medium">Your P&L</th>
                    <th className="text-right py-2 px-3 text-xs font-medium">{fullChallenge.battery.duid} P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {fullChallenge.intervals.map((iv, i) => (
                    <tr key={iv.hour} className="border-t border-white/5 hover:bg-white/5">
                      <td className="py-1.5 px-3 text-xs font-mono text-navy-400">{hourLabel(iv.hour)}</td>
                      <td className={`py-1.5 px-3 text-xs font-mono text-right ${priceColor(iv.predispatchPrice)}`}>
                        ${iv.predispatchPrice.toFixed(0)}
                      </td>
                      <td className={`py-1.5 px-3 text-xs font-mono text-right ${priceColor(iv.actualPrice)}`}>
                        ${iv.actualPrice.toFixed(0)}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded border ${modeBadgeColor(evaluation.playerResult.decisions[i])}`}>
                          {modeLabel(evaluation.playerResult.decisions[i])}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded border ${modeBadgeColor(actualBatteryModes[i])}`}>
                          {modeLabel(actualBatteryModes[i])}
                        </span>
                      </td>
                      <td className={`py-1.5 px-3 text-xs font-mono text-right ${
                        evaluation.playerResult.intervalProfits[i] >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {evaluation.playerResult.intervalProfits[i] >= 0 ? '+' : ''}
                        {formatDollar(evaluation.playerResult.intervalProfits[i])}
                      </td>
                      <td className={`py-1.5 px-3 text-xs font-mono text-right ${
                        evaluation.actualBatteryResult.intervalProfits[i] >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {evaluation.actualBatteryResult.intervalProfits[i] >= 0 ? '+' : ''}
                        {formatDollar(evaluation.actualBatteryResult.intervalProfits[i])}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 font-semibold">
                    <td colSpan={5} className="py-2 px-3 text-sm text-navy-400">Total</td>
                    <td className={`py-2 px-3 text-sm font-mono text-right ${
                      evaluation.playerResult.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatDollarFull(evaluation.playerResult.totalProfit)}
                    </td>
                    <td className={`py-2 px-3 text-sm font-mono text-right ${
                      evaluation.actualBatteryResult.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatDollarFull(evaluation.actualBatteryResult.totalProfit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
