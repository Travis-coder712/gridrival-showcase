import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatNumber } from '../../lib/formatters';

// ─── Types ───────────────────────────────────────────────────────────────────

type BatteryMode = 'charge' | 'idle' | 'discharge';
type Phase = 'INTRO' | 'DECIDE' | 'REVEAL' | 'RESULTS';

interface BatteryArbitrageMiniGameProps {
  onComplete: (result: {
    totalProfit: number;
    optimalProfit: number;
    predispatchOptimalProfit?: number;
    decisionsCorrect?: number;
    decisionsTotal?: number;
  }) => void;
  onSkip: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_MW = 500;
const MAX_STORAGE = 3000;
const EFFICIENCY = 0.92;
const HOURS = 24;
const SOC_STEP = 50; // MWh step for DP discretization
const SOC_BUCKETS = MAX_STORAGE / SOC_STEP + 1; // 61 buckets

// ─── Price Generation ────────────────────────────────────────────────────────

function generatePrices(): { predispatch: number[]; actuals: number[] } {
  const baseProfile = [
    35, 32, 28, 25, 24, 26,      // 00-05: overnight low
    38, 55, 72, 65, 48, 35,      // 06-11: morning ramp, then solar pushes down
    25, 18, 15, 20, 35, 65,      // 12-17: solar glut midday, then ramp up
    120, 145, 130, 95, 65, 45,   // 18-23: evening peak then decline
  ];

  const predispatch = baseProfile.map(p => {
    const variation = 1 + (Math.random() - 0.5) * 0.30;
    return Math.round(p * variation);
  });

  const actuals = predispatch.map(p => {
    const variation = 1 + (Math.random() - 0.5) * 0.40;
    return Math.max(0, Math.round(p * variation));
  });

  return { predispatch, actuals };
}

// ─── Profit Simulation ───────────────────────────────────────────────────────

function simulateProfit(
  decisions: BatteryMode[],
  prices: number[],
  initialSOC: number,
): { profit: number; socHistory: number[] } {
  let soc = initialSOC;
  let profit = 0;
  const socHistory: number[] = [soc];

  for (let h = 0; h < HOURS; h++) {
    const price = prices[h];
    if (decisions[h] === 'charge') {
      const roomForCharge = (MAX_STORAGE - soc) / EFFICIENCY;
      const chargeAmount = Math.min(MAX_MW, roomForCharge);
      if (chargeAmount > 0) {
        soc += chargeAmount * EFFICIENCY;
        profit -= price * chargeAmount;
      }
    } else if (decisions[h] === 'discharge') {
      const dischargeAmount = Math.min(MAX_MW, soc);
      if (dischargeAmount > 0) {
        soc -= dischargeAmount;
        profit += price * dischargeAmount;
      }
    }
    socHistory.push(soc);
  }

  return { profit, socHistory };
}

// ─── Optimal Strategy (DP) ───────────────────────────────────────────────────

interface OptimalResult {
  profit: number;
  decisions: BatteryMode[];
  socHistory: number[];
}

function calculateOptimalStrategy(prices: number[], initialSOC: number): OptimalResult {
  // DP over discretized SOC states: dp[h][bucket] = max profit from hour h to end
  // SOC_STEP = 50 MWh, buckets 0..60 (for 0..3000 MWh)
  const NEG_INF = -1e15;
  const actions: (0 | 1 | 2)[] = [0, 1, 2]; // 0=charge, 1=idle, 2=discharge

  // dp[bucket] = max profit achievable from this hour onward when starting at that SOC
  // We build bottom-up: start from last hour, work backward
  const dp: Float64Array[] = [];
  const bestAction: Uint8Array[] = [];
  for (let h = 0; h <= HOURS; h++) {
    dp.push(new Float64Array(SOC_BUCKETS).fill(NEG_INF));
    bestAction.push(new Uint8Array(SOC_BUCKETS));
  }

  // Base case: at hour 24, any SOC is valid with 0 future profit
  for (let b = 0; b < SOC_BUCKETS; b++) {
    dp[HOURS][b] = 0;
  }

  // Fill backward
  for (let h = HOURS - 1; h >= 0; h--) {
    const price = prices[h];
    for (let b = 0; b < SOC_BUCKETS; b++) {
      const soc = b * SOC_STEP;

      for (const action of actions) {
        let newSoc = soc;
        let hourProfit = 0;

        if (action === 0) {
          // Charge
          const roomForCharge = (MAX_STORAGE - soc) / EFFICIENCY;
          const chargeAmount = Math.min(MAX_MW, roomForCharge);
          if (chargeAmount < 0.01) continue; // Can't charge
          newSoc = soc + chargeAmount * EFFICIENCY;
          hourProfit = -price * chargeAmount;
        } else if (action === 2) {
          // Discharge
          const dischargeAmount = Math.min(MAX_MW, soc);
          if (dischargeAmount < 0.01) continue; // Can't discharge
          newSoc = soc - dischargeAmount;
          hourProfit = price * dischargeAmount;
        }
        // action === 1: idle, soc unchanged, profit 0

        // Snap to nearest bucket
        const newBucket = Math.round(newSoc / SOC_STEP);
        if (newBucket < 0 || newBucket >= SOC_BUCKETS) continue;

        const totalProfit = hourProfit + dp[h + 1][newBucket];
        if (totalProfit > dp[h][b]) {
          dp[h][b] = totalProfit;
          bestAction[h][b] = action;
        }
      }
    }
  }

  // Reconstruct decisions forward from initial SOC
  const initBucket = Math.round(initialSOC / SOC_STEP);
  const dpDecisions: BatteryMode[] = [];
  let currentBucket = initBucket;

  for (let h = 0; h < HOURS; h++) {
    const action = bestAction[h][currentBucket];
    const soc = currentBucket * SOC_STEP;

    if (action === 0) {
      dpDecisions.push('charge');
      const roomForCharge = (MAX_STORAGE - soc) / EFFICIENCY;
      const chargeAmount = Math.min(MAX_MW, roomForCharge);
      const newSoc = soc + chargeAmount * EFFICIENCY;
      currentBucket = Math.round(newSoc / SOC_STEP);
    } else if (action === 2) {
      dpDecisions.push('discharge');
      const dischargeAmount = Math.min(MAX_MW, soc);
      const newSoc = soc - dischargeAmount;
      currentBucket = Math.round(newSoc / SOC_STEP);
    } else {
      dpDecisions.push('idle');
    }
  }

  // Run through continuous simulation for exact profit (avoids discretization rounding)
  const result = simulateProfit(dpDecisions, prices, initialSOC);

  return {
    profit: result.profit,
    decisions: dpDecisions,
    socHistory: result.socHistory,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatHour(h: number): string {
  return `${h.toString().padStart(2, '0')}:00`;
}

// formatCurrency imported from ../../lib/formatters

function priceColor(price: number): string {
  if (price >= 100) return 'text-red-600 font-semibold';
  if (price >= 60) return 'text-amber-600';
  if (price >= 30) return 'text-gray-700';
  return 'text-green-600';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BatteryArbitrageMiniGame({
  onComplete,
  onSkip,
}: BatteryArbitrageMiniGameProps) {
  const [phase, setPhase] = useState<Phase>('INTRO');
  const [decisions, setDecisions] = useState<BatteryMode[]>(
    () => new Array(HOURS).fill('idle') as BatteryMode[],
  );
  const [prices, setPrices] = useState<{
    predispatch: number[];
    actuals: number[];
  }>(() => generatePrices());
  const [initialSOC, setInitialSOC] = useState<number>(() =>
    Math.round(MAX_STORAGE * (0.2 + Math.random() * 0.6)),
  );
  const [revealProgress, setRevealProgress] = useState(0);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  // Generate prices on mount
  useEffect(() => {
    setPrices(generatePrices());
    setInitialSOC(Math.round(MAX_STORAGE * (0.2 + Math.random() * 0.6)));
  }, []);

  // ─── Derived state ──────────────────────────────────────────────────────

  const predispatchResult = useMemo(
    () => simulateProfit(decisions, prices.predispatch, initialSOC),
    [decisions, prices.predispatch, initialSOC],
  );

  const actualResult = useMemo(
    () => simulateProfit(decisions, prices.actuals, initialSOC),
    [decisions, prices.actuals, initialSOC],
  );

  // What was optimal given the prices you could see (predispatch)
  const predispatchOptimal = useMemo(
    () => calculateOptimalStrategy(prices.predispatch, initialSOC),
    [prices.predispatch, initialSOC],
  );

  // What was optimal with perfect hindsight (actual prices)
  const actualOptimal = useMemo(
    () => calculateOptimalStrategy(prices.actuals, initialSOC),
    [prices.actuals, initialSOC],
  );

  // Score predispatch-optimal decisions against actual prices
  const predispatchOptimalActualResult = useMemo(
    () => simulateProfit(predispatchOptimal.decisions, prices.actuals, initialSOC),
    [predispatchOptimal.decisions, prices.actuals, initialSOC],
  );

  // How many user decisions matched predispatch-optimal
  const decisionsMatchingOptimal = useMemo(
    () =>
      decisions.reduce(
        (count, d, h) => count + (d === predispatchOptimal.decisions[h] ? 1 : 0),
        0,
      ),
    [decisions, predispatchOptimal.decisions],
  );

  // Backward compat alias
  const optimalProfit = actualOptimal.profit;

  const currentSOC = predispatchResult.socHistory[predispatchResult.socHistory.length - 1];

  // ─── Actions ────────────────────────────────────────────────────────────

  const setDecision = useCallback((hour: number, mode: BatteryMode) => {
    setDecisions(prev => {
      const next = [...prev];
      next[hour] = mode;
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    const newPrices = generatePrices();
    const newSOC = Math.round(MAX_STORAGE * (0.2 + Math.random() * 0.6));
    setPrices(newPrices);
    setInitialSOC(newSOC);
    setDecisions(new Array(HOURS).fill('idle') as BatteryMode[]);
    setRevealProgress(0);
    setShowDetailedBreakdown(false);
    setPhase('INTRO');
  }, []);

  const handleSubmitDecisions = useCallback(() => {
    setRevealProgress(0);
    setPhase('REVEAL');
  }, []);

  // Reveal animation
  useEffect(() => {
    if (phase !== 'REVEAL') return;
    if (revealProgress >= HOURS) return;
    const timer = setTimeout(() => {
      setRevealProgress(prev => prev + 1);
    }, 80);
    return () => clearTimeout(timer);
  }, [phase, revealProgress]);

  // ─── Phase content rendering ────────────────────────────────────────────

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  //  INTRO PHASE
  // ═══════════════════════════════════════════════════════════════════════════

  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">&#9889;</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Battery Arbitrage Challenge
        </h1>
        <p className="text-base text-gray-500 mb-3 font-medium">
          Select <span className="text-green-600 font-bold">Charge</span>, <span className="text-gray-600 font-bold">Idle</span> or <span className="text-blue-600 font-bold">Discharge</span> for 24 one-hour periods to maximise profit
        </p>
        <p className="text-sm text-gray-500 mb-8 max-w-xl mx-auto">
          You have a 500 MW / 3,000 MWh battery (6-hour duration). Charge when electricity is cheap,
          discharge when it's expensive, and account for the 8% round-trip efficiency loss.
        </p>

        {/* Battery specs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Battery Specifications
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-800">500</div>
              <div className="text-xs text-gray-500">MW Power</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">3,000</div>
              <div className="text-xs text-gray-500">MWh Storage</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">92%</div>
              <div className="text-xs text-gray-500">Round-trip Eff.</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Starting State of Charge:{' '}
              <span className="font-bold text-gray-800">
                {initialSOC.toLocaleString()} MWh
              </span>{' '}
              <span className="text-gray-400">
                ({((initialSOC / MAX_STORAGE) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Pre-dispatch price preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Pre-dispatch Price Forecast
          </h3>
          <div className="flex items-end gap-[2px] h-16">
            {prices.predispatch.map((p, i) => {
              const maxP = Math.max(...prices.predispatch);
              const height = Math.max(4, (p / maxP) * 100);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${height}%`,
                    backgroundColor:
                      p >= 100
                        ? '#ef4444'
                        : p >= 60
                          ? '#f59e0b'
                          : p >= 30
                            ? '#6b7280'
                            : '#22c55e',
                  }}
                  title={`${formatHour(i)}: $${p}/MWh`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPhase('DECIDE')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-semibold transition-colors shadow-sm"
          >
            Start Challenge
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  DECIDE PHASE
  // ═══════════════════════════════════════════════════════════════════════════

  const renderDecide = () => {
    // Check if current decisions are valid (no SOC constraint violations)
    const socSteps = predispatchResult.socHistory;
    const hasViolation = socSteps.some(s => s < -0.01 || s > MAX_STORAGE + 0.01);

    return (
      <div className="flex flex-col min-h-full">
        {/* Sticky top bar with SOC + P&L */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* SOC bar */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">
                  State of Charge
                </span>
                <span className="text-xs font-mono text-gray-700">
                  {Math.round(currentSOC).toLocaleString()} / {MAX_STORAGE.toLocaleString()} MWh
                  ({((currentSOC / MAX_STORAGE) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentSOC / MAX_STORAGE) * 100))}%`,
                    backgroundColor:
                      currentSOC / MAX_STORAGE > 0.7
                        ? '#22c55e'
                        : currentSOC / MAX_STORAGE > 0.3
                          ? '#3b82f6'
                          : '#ef4444',
                  }}
                />
              </div>
            </div>

            {/* P&L display */}
            <div className="text-right shrink-0">
              <div className="text-xs font-medium text-gray-500 mb-0.5">
                Estimated P&L
              </div>
              <div
                className={`text-xl font-bold font-mono ${
                  predispatchResult.profit >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(predispatchResult.profit)}
              </div>
            </div>
          </div>
        </div>

        {/* Hour grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-5xl mx-auto">
            {/* Task description */}
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                ⚡ Battery Minigame — Select <span className="text-green-600">Charge</span>, <span className="text-gray-500">Idle</span> or <span className="text-blue-600">Discharge</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                For each of the 24 one-hour periods below, decide what your battery does to maximise arbitrage profit
              </p>
            </div>

            {/* Desktop: 4-column grid */}
            <div className="hidden md:grid grid-cols-4 gap-4">
              {[0, 1, 2, 3].map(col => (
                <div key={col}>
                  <div className="text-center mb-3">
                    <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      col === 0
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : col === 1
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : col === 2
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {col === 0
                        ? '🌙 Overnight (00–05)'
                        : col === 1
                          ? '🌅 Morning (06–11)'
                          : col === 2
                            ? '☀️ Midday (12–17)'
                            : '🌆 Evening (18–23)'}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {Array.from({ length: 6 }, (_, i) => col * 6 + i).map(h => (
                      <HourRow
                        key={h}
                        hour={h}
                        price={prices.predispatch[h]}
                        mode={decisions[h]}
                        onSetMode={mode => setDecision(h, mode)}
                        socBefore={predispatchResult.socHistory[h]}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: vertical list with period headings */}
            <div className="md:hidden space-y-1">
              {[
                { label: '🌙 Overnight (00–05)', start: 0, end: 6, colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                { label: '🌅 Morning (06–11)', start: 6, end: 12, colorClass: 'bg-amber-50 text-amber-700 border-amber-200' },
                { label: '☀️ Midday (12–17)', start: 12, end: 18, colorClass: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                { label: '🌆 Evening (18–23)', start: 18, end: 24, colorClass: 'bg-orange-50 text-orange-700 border-orange-200' },
              ].map(period => (
                <div key={period.label}>
                  <div className="text-center my-2">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${period.colorClass}`}>
                      {period.label}
                    </span>
                  </div>
                  {Array.from({ length: period.end - period.start }, (_, i) => period.start + i).map(h => (
                    <HourRow
                      key={h}
                      hour={h}
                      price={prices.predispatch[h]}
                      mode={decisions[h]}
                      onSetMode={mode => setDecision(h, mode)}
                      socBefore={predispatchResult.socHistory[h]}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setPhase('INTRO')}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              &larr; Back
            </button>
            {hasViolation && (
              <span className="text-xs text-red-500">
                SOC constraint violated &mdash; adjust decisions
              </span>
            )}
            <button
              onClick={handleSubmitDecisions}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
            >
              Submit Decisions
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  REVEAL PHASE
  // ═══════════════════════════════════════════════════════════════════════════

  const renderReveal = () => {
    const allRevealed = revealProgress >= HOURS;

    return (
      <div className="flex flex-col min-h-full">
        {/* Dramatic comparison header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Market Prices Revealed
            </h2>
            {allRevealed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-4 flex-wrap"
              >
                <div className="text-sm text-gray-500">
                  Expected Profit:{' '}
                  <span
                    className={`font-bold font-mono ${
                      predispatchResult.profit >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(predispatchResult.profit)}
                  </span>
                </div>
                <div className="text-xl text-gray-400">&rarr;</div>
                <div className="text-sm text-gray-500">
                  Actual Profit:{' '}
                  <span
                    className={`font-bold font-mono text-lg ${
                      actualResult.profit >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(actualResult.profit)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Reveal grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-5xl mx-auto">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-2 text-[10px] text-gray-500 px-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-4 bg-green-500 rounded-sm" />
                <span>Matches optimal for forecast prices</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-4 bg-red-500 rounded-sm" />
                <span>Differs from optimal</span>
              </div>
            </div>

            {/* Table header */}
            <div className="bg-gray-100 rounded-t-xl px-4 py-2 grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-2">Hour</div>
              <div className="col-span-2 text-right">Forecast</div>
              <div className="col-span-2 text-right">Actual</div>
              <div className="col-span-2 text-center">Action</div>
              <div className="col-span-2 text-center">Optimal</div>
              <div className="col-span-2 text-right">P&L</div>
            </div>

            {/* Rows */}
            <div className="bg-white rounded-b-xl border border-gray-200 divide-y divide-gray-100">
              {Array.from({ length: HOURS }, (_, h) => {
                const revealed = h < revealProgress;
                const predPrice = prices.predispatch[h];
                const actPrice = prices.actuals[h];
                const mode = decisions[h];
                const optimalMode = predispatchOptimal.decisions[h];
                const matchesOptimal = mode === optimalMode;

                let hourPL = 0;
                if (revealed) {
                  if (mode === 'charge') {
                    const roomForCharge =
                      (MAX_STORAGE - actualResult.socHistory[h]) / EFFICIENCY;
                    const amt = Math.min(MAX_MW, Math.max(0, roomForCharge));
                    hourPL = -actPrice * amt;
                  } else if (mode === 'discharge') {
                    const amt = Math.min(MAX_MW, actualResult.socHistory[h]);
                    hourPL = actPrice * amt;
                  }
                }

                return (
                  <motion.div
                    key={h}
                    initial={false}
                    animate={{
                      backgroundColor: revealed
                        ? h % 2 === 0
                          ? '#ffffff'
                          : '#f9fafb'
                        : '#f3f4f6',
                    }}
                    className="grid grid-cols-12 px-4 py-2 items-center text-sm"
                    style={{
                      borderLeft: revealed
                        ? matchesOptimal
                          ? '3px solid #22c55e'
                          : '3px solid #ef4444'
                        : '3px solid transparent',
                    }}
                  >
                    <div className="col-span-2 font-mono text-gray-700 text-xs">
                      {formatHour(h)}
                    </div>
                    <div
                      className={`col-span-2 text-right font-mono text-xs ${priceColor(predPrice)}`}
                    >
                      ${predPrice}
                    </div>
                    <div
                      className={`col-span-2 text-right font-mono text-xs ${
                        revealed ? priceColor(actPrice) : 'text-gray-300'
                      }`}
                    >
                      {revealed ? `$${actPrice}` : '---'}
                    </div>
                    <div className="col-span-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          mode === 'charge'
                            ? 'bg-green-100 text-green-700'
                            : mode === 'discharge'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {mode === 'charge'
                          ? 'CHG'
                          : mode === 'discharge'
                            ? 'DIS'
                            : 'IDLE'}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      {revealed ? (
                        <span className="flex items-center justify-center gap-1">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              optimalMode === 'charge'
                                ? 'bg-green-50 text-green-600'
                                : optimalMode === 'discharge'
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-gray-50 text-gray-400'
                            }`}
                          >
                            {optimalMode === 'charge'
                              ? 'CHG'
                              : optimalMode === 'discharge'
                                ? 'DIS'
                                : 'IDLE'}
                          </span>
                          <span className="text-xs">
                            {matchesOptimal ? '✓' : '✗'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">---</span>
                      )}
                    </div>
                    <div
                      className={`col-span-2 text-right font-mono text-xs ${
                        revealed
                          ? hourPL > 0
                            ? 'text-green-600 font-semibold'
                            : hourPL < 0
                              ? 'text-red-600'
                              : 'text-gray-400'
                          : 'text-gray-300'
                      }`}
                    >
                      {revealed
                        ? hourPL !== 0
                          ? formatCurrency(hourPL)
                          : '-'
                        : '---'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-5xl mx-auto text-center">
            {allRevealed ? (
              <button
                onClick={() => setPhase('RESULTS')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
              >
                See Results
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                Revealing prices... ({revealProgress}/{HOURS})
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  RESULTS PHASE
  // ═══════════════════════════════════════════════════════════════════════════

  const renderResults = () => {
    const profit = actualResult.profit;
    const decisionQuality = decisionsMatchingOptimal / HOURS;
    const predispatchOptimalActualProfit = predispatchOptimalActualResult.profit;
    const perfectForesightProfit = optimalProfit;

    // Insight based on decision quality (not just raw profit)
    let insightTitle: string;
    let insightText: string;
    let insightColor: string;

    if (decisionQuality >= 0.83) {
      // 20+ / 24
      insightTitle = 'Excellent Decision Making!';
      insightText = `You made the right call in ${decisionsMatchingOptimal}/${HOURS} hours based on the forecast data. ${
        profit < predispatchOptimalActualProfit * 0.8
          ? 'Market uncertainty reduced your returns, but your strategy was sound.'
          : 'Your strategy and execution were both strong.'
      }`;
      insightColor = 'border-green-200 bg-green-50 text-green-800';
    } else if (decisionQuality >= 0.67) {
      // 16+ / 24
      insightTitle = 'Good Strategy!';
      insightText = `You matched the optimal decision in ${decisionsMatchingOptimal}/${HOURS} hours. Look at the red rows above to see where you could improve.`;
      insightColor = 'border-blue-200 bg-blue-50 text-blue-800';
    } else if (decisionQuality >= 0.5) {
      // 12+ / 24
      insightTitle = 'Getting There';
      insightText = `You got ${decisionsMatchingOptimal}/${HOURS} decisions right. Tip: charge during the lowest forecast prices and discharge during the highest.`;
      insightColor = 'border-amber-200 bg-amber-50 text-amber-800';
    } else {
      insightTitle = 'Room for Improvement';
      insightText = `Only ${decisionsMatchingOptimal}/${HOURS} decisions matched optimal. Focus on the price pattern: charge LOW, discharge HIGH, accounting for the 8% efficiency loss.`;
      insightColor = 'border-red-200 bg-red-50 text-red-800';
    }

    // Market uncertainty: gap between forecast-optimal and actual-optimal
    const uncertaintyGap = perfectForesightProfit > 0
      ? ((perfectForesightProfit - predispatchOptimalActualProfit) / perfectForesightProfit * 100).toFixed(0)
      : '0';

    // Compute average charging cost and discharge revenue per hour
    let totalChargeCost = 0;
    let totalChargeHours = 0;
    let totalDischargeRevenue = 0;
    let totalDischargeHours = 0;
    let totalChargeMWh = 0;
    let totalDischargeMWh = 0;
    for (let h = 0; h < HOURS; h++) {
      if (decisions[h] === 'charge') {
        const roomForCharge = (MAX_STORAGE - actualResult.socHistory[h]) / EFFICIENCY;
        const amt = Math.min(MAX_MW, Math.max(0, roomForCharge));
        if (amt > 0.01) {
          totalChargeCost += prices.actuals[h] * amt;
          totalChargeMWh += amt;
          totalChargeHours++;
        }
      } else if (decisions[h] === 'discharge') {
        const amt = Math.min(MAX_MW, actualResult.socHistory[h]);
        if (amt > 0.01) {
          totalDischargeRevenue += prices.actuals[h] * amt;
          totalDischargeMWh += amt;
          totalDischargeHours++;
        }
      }
    }
    const avgChargePricePerMWh = totalChargeMWh > 0 ? totalChargeCost / totalChargeMWh : 0;
    const avgDischargePricePerMWh = totalDischargeMWh > 0 ? totalDischargeRevenue / totalDischargeMWh : 0;
    const idleHours = HOURS - totalChargeHours - totalDischargeHours;

    return (
      <div className="flex flex-col items-center min-h-full px-4 py-8 overflow-y-auto">
        <div className="max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Your Results
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center">
            How your battery strategy performed — judged against what was optimal given the forecast prices you could see.
          </p>

          {/* ── Section A: Profit Hero Card ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 text-center">
            <div className="text-sm text-gray-500 mb-1">Your Actual Profit</div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className={`text-5xl font-bold font-mono ${
                profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(profit)}
            </motion.div>
            <div className="mt-2 text-sm text-gray-400">
              Decision quality: <span className="font-semibold text-gray-700">{decisionsMatchingOptimal}/{HOURS}</span> matched optimal
            </div>
          </div>

          {/* ── Section A2: 3-Level Comparison ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Profit Comparison
            </h3>

            {/* Your profit */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm text-gray-700">Your profit</span>
                <span className="text-xs text-gray-400 ml-1">(actual prices)</span>
              </div>
              <span
                className={`font-mono font-bold ${
                  profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(profit)}
              </span>
            </div>

            {/* Best with forecast */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm text-gray-700">Best with forecast info</span>
                <span className="text-xs text-gray-400 ml-1">(fair benchmark)</span>
              </div>
              <span className="font-mono font-bold text-gray-600">
                {formatCurrency(predispatchOptimalActualProfit)}
              </span>
            </div>

            {/* Perfect foresight */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm text-gray-700">Perfect foresight</span>
                <span className="text-xs text-gray-400 ml-1">(hindsight optimal)</span>
              </div>
              <span className="font-mono font-bold text-gray-400">
                {formatCurrency(perfectForesightProfit)}
              </span>
            </div>

            <div className="h-px bg-gray-200 my-3" />

            {/* Decision quality bar */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Decision quality
              </span>
              <span className="text-lg font-bold text-gray-800">
                {(decisionQuality * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, Math.max(0, decisionQuality * 100))}%`,
                }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor:
                    decisionQuality >= 0.83
                      ? '#22c55e'
                      : decisionQuality >= 0.67
                        ? '#3b82f6'
                        : decisionQuality >= 0.5
                          ? '#f59e0b'
                          : '#ef4444',
                }}
              />
            </div>
          </div>

          {/* ── Section A3: Charging & Discharging Stats ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Charging &amp; Discharging Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Charging stats */}
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-green-600 text-sm font-bold">⬇ Charging</span>
                  <span className="text-[10px] text-green-500 bg-green-100 px-1.5 py-0.5 rounded font-semibold">
                    {totalChargeHours} hr{totalChargeHours !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-green-700 mb-1">
                  ${Math.round(avgChargePricePerMWh)}<span className="text-sm font-normal text-green-500">/MWh</span>
                </div>
                <div className="text-[11px] text-green-600">
                  Avg. price paid &middot; {formatCurrency(totalChargeCost)} total cost
                </div>
                {totalChargeMWh > 0 && (
                  <div className="text-[10px] text-green-500 mt-1">
                    {Math.round(totalChargeMWh).toLocaleString()} MWh purchased
                  </div>
                )}
              </div>

              {/* Discharging stats */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-blue-600 text-sm font-bold">⬆ Discharging</span>
                  <span className="text-[10px] text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded font-semibold">
                    {totalDischargeHours} hr{totalDischargeHours !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-blue-700 mb-1">
                  ${Math.round(avgDischargePricePerMWh)}<span className="text-sm font-normal text-blue-500">/MWh</span>
                </div>
                <div className="text-[11px] text-blue-600">
                  Avg. price received &middot; {formatCurrency(totalDischargeRevenue)} total revenue
                </div>
                {totalDischargeMWh > 0 && (
                  <div className="text-[10px] text-blue-500 mt-1">
                    {Math.round(totalDischargeMWh).toLocaleString()} MWh sold
                  </div>
                )}
              </div>
            </div>

            {/* Spread + idle summary */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div>
                Price spread: <span className="font-bold font-mono text-gray-700">
                  ${Math.round(avgDischargePricePerMWh - avgChargePricePerMWh)}/MWh
                </span>
                {avgChargePricePerMWh > 0 && avgDischargePricePerMWh > avgChargePricePerMWh && (
                  <span className="text-gray-400 ml-1">
                    ({((avgDischargePricePerMWh / avgChargePricePerMWh - 1) * 100).toFixed(0)}% markup)
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-400">Idle: {idleHours} hr{idleHours !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* ── Section B: Detailed 24-Hour Breakdown (collapsible) ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <button
              onClick={() => setShowDetailedBreakdown(prev => !prev)}
              className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>Detailed 24-Hour Breakdown</span>
              <span className="text-gray-400 text-xs">
                {showDetailedBreakdown ? '▲ Hide' : '▼ Show'}
              </span>
            </button>

            {showDetailedBreakdown && (
              <div className="border-t border-gray-200">
                {/* Table header */}
                <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  <div className="col-span-1">Hr</div>
                  <div className="col-span-2 text-right">Forecast</div>
                  <div className="col-span-2 text-right">Actual</div>
                  <div className="col-span-2 text-center">Yours</div>
                  <div className="col-span-2 text-center">Optimal*</div>
                  <div className="col-span-2 text-center">Match</div>
                  <div className="col-span-1 text-right">P&L</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {Array.from({ length: HOURS }, (_, h) => {
                    const predPrice = prices.predispatch[h];
                    const actPrice = prices.actuals[h];
                    const mode = decisions[h];
                    const optMode = predispatchOptimal.decisions[h];
                    const match = mode === optMode;

                    let hourPL = 0;
                    if (mode === 'charge') {
                      const roomForCharge = (MAX_STORAGE - actualResult.socHistory[h]) / EFFICIENCY;
                      const amt = Math.min(MAX_MW, Math.max(0, roomForCharge));
                      hourPL = -actPrice * amt;
                    } else if (mode === 'discharge') {
                      const amt = Math.min(MAX_MW, actualResult.socHistory[h]);
                      hourPL = actPrice * amt;
                    }

                    return (
                      <div
                        key={h}
                        className={`grid grid-cols-12 px-4 py-1.5 items-center text-xs ${
                          h % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                        style={{
                          borderLeft: match ? '3px solid #22c55e' : '3px solid #ef4444',
                        }}
                      >
                        <div className="col-span-1 font-mono text-gray-500">
                          {h.toString().padStart(2, '0')}
                        </div>
                        <div className={`col-span-2 text-right font-mono ${priceColor(predPrice)}`}>
                          ${predPrice}
                        </div>
                        <div className={`col-span-2 text-right font-mono ${priceColor(actPrice)}`}>
                          ${actPrice}
                        </div>
                        <div className="col-span-2 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              mode === 'charge'
                                ? 'bg-green-100 text-green-700'
                                : mode === 'discharge'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {mode === 'charge' ? 'CHG' : mode === 'discharge' ? 'DIS' : 'IDLE'}
                          </span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              optMode === 'charge'
                                ? 'bg-green-50 text-green-600'
                                : optMode === 'discharge'
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-gray-50 text-gray-400'
                            }`}
                          >
                            {optMode === 'charge' ? 'CHG' : optMode === 'discharge' ? 'DIS' : 'IDLE'}
                          </span>
                        </div>
                        <div className="col-span-2 text-center">
                          {match ? (
                            <span className="text-green-500 font-semibold">✓</span>
                          ) : (
                            <span className="text-red-400 font-semibold">✗</span>
                          )}
                        </div>
                        <div
                          className={`col-span-1 text-right font-mono ${
                            hourPL > 0
                              ? 'text-green-600'
                              : hourPL < 0
                                ? 'text-red-500'
                                : 'text-gray-300'
                          }`}
                        >
                          {hourPL !== 0 ? formatCurrency(hourPL) : '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 py-2 bg-gray-50 text-[10px] text-gray-400">
                  *Optimal = best strategy given the forecast prices you could see
                </div>
              </div>
            )}
          </div>

          {/* ── Section C: Insight Cards ── */}

          {/* Decision quality insight */}
          <div
            className={`rounded-xl border p-5 mb-4 text-left ${insightColor}`}
          >
            <div className="font-semibold mb-1">{insightTitle}</div>
            <div className="text-sm">{insightText}</div>
          </div>

          {/* Market uncertainty insight */}
          <div className="rounded-xl border border-purple-200 bg-purple-50 text-purple-800 p-5 mb-4 text-left">
            <div className="font-semibold mb-1">📊 Market Uncertainty</div>
            <div className="text-sm">
              Even perfect forecast-based decisions would have earned{' '}
              <strong>{formatCurrency(predispatchOptimalActualProfit)}</strong> against actual prices —{' '}
              {perfectForesightProfit > 0 ? (
                <>
                  capturing {((predispatchOptimalActualProfit / perfectForesightProfit) * 100).toFixed(0)}% of
                  the theoretical maximum. The remaining {uncertaintyGap}% gap is market uncertainty
                  that no forecast can predict.
                </>
              ) : (
                'the market was volatile.'
              )}
            </div>
          </div>

          {/* Market impact insight */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 p-5 mb-8 text-left">
            <div className="font-semibold mb-1">⚡ In the Real Game: Charging Moves the Market</div>
            <div className="text-sm space-y-2">
              <p>
                Notice how actual prices differed from the forecast? In the multiplayer game, a similar
                effect happens when batteries charge — your 500 MW of charging <strong>adds to market demand</strong>,
                pushing the clearing price higher for everyone.
              </p>
              <p>
                If multiple teams charge at once, the combined load can spike prices dramatically. Plan
                your charging for periods with excess supply capacity, and watch your SOC carefully.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() =>
                onComplete({
                  totalProfit: Math.round(profit),
                  optimalProfit: Math.round(optimalProfit),
                  predispatchOptimalProfit: Math.round(predispatchOptimalActualProfit),
                  decisionsCorrect: decisionsMatchingOptimal,
                  decisionsTotal: HOURS,
                })
              }
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
            >
              Continue to Round
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  Main render
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="fixed inset-0 z-[90] bg-gray-50 overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="min-h-full"
        >
          {phase === 'INTRO' && renderIntro()}
          {phase === 'DECIDE' && renderDecide()}
          {phase === 'REVEAL' && renderReveal()}
          {phase === 'RESULTS' && renderResults()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface HourRowProps {
  hour: number;
  price: number;
  mode: BatteryMode;
  onSetMode: (mode: BatteryMode) => void;
  socBefore: number;
}

function HourRow({ hour, price, mode, onSetMode, socBefore }: HourRowProps) {
  // Allow partial charge/discharge — simulation handles clamping via Math.min()
  const canCharge = socBefore < MAX_STORAGE - 0.01;
  const canDischarge = socBefore > 0.01;

  // Compute effective MW for partial operations
  const effectiveChargeMW = Math.min(MAX_MW, (MAX_STORAGE - socBefore) / EFFICIENCY);
  const effectiveDischargeMW = Math.min(MAX_MW, socBefore);
  const isPartialCharge = effectiveChargeMW < MAX_MW - 0.01;
  const isPartialDischarge = effectiveDischargeMW < MAX_MW - 0.01;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
        mode === 'charge'
          ? 'bg-green-50 border-green-200'
          : mode === 'discharge'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-white border-gray-200'
      }`}
    >
      {/* Time */}
      <div className="w-12 text-xs font-mono text-gray-600 shrink-0">
        {formatHour(hour)}
      </div>

      {/* Price */}
      <div
        className={`w-14 text-right text-xs font-mono shrink-0 ${priceColor(price)}`}
      >
        ${price}
      </div>

      {/* Toggle buttons */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <div className="flex gap-0.5">
          <button
            onClick={() => onSetMode(mode === 'charge' ? 'idle' : 'charge')}
            disabled={!canCharge && mode !== 'charge'}
            className={`px-2 py-1 text-[10px] font-semibold rounded-l-md transition-colors ${
              mode === 'charge'
                ? 'bg-green-500 text-white'
                : canCharge
                  ? 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
            title="Charge"
          >
            CHG
          </button>
          <button
            onClick={() => onSetMode('idle')}
            className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
              mode === 'idle'
                ? 'bg-gray-400 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title="Idle"
          >
            IDLE
          </button>
          <button
            onClick={() => onSetMode(mode === 'discharge' ? 'idle' : 'discharge')}
            disabled={!canDischarge && mode !== 'discharge'}
            className={`px-2 py-1 text-[10px] font-semibold rounded-r-md transition-colors ${
              mode === 'discharge'
                ? 'bg-blue-500 text-white'
                : canDischarge
                  ? 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
            title="Discharge"
          >
            DIS
          </button>
        </div>
        {/* Partial amount indicator */}
        {mode === 'charge' && isPartialCharge && (
          <span className="text-[9px] text-green-600 font-mono w-10 text-right">
            {Math.round(effectiveChargeMW)}MW
          </span>
        )}
        {mode === 'discharge' && isPartialDischarge && (
          <span className="text-[9px] text-blue-600 font-mono w-10 text-right">
            {Math.round(effectiveDischargeMW)}MW
          </span>
        )}
      </div>
    </div>
  );
}
