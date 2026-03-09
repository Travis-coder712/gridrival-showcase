import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

type WrapperPhase = 'select' | 'game1a' | 'game1b' | 'done';
type GamePhase = 'INTRO' | 'DECIDE' | 'REVEAL' | 'RESULTS';

interface YearDecision {
  retailPrice: number;
  marketingSpend: number;
  retentionSpend: number;
}

interface YearResult {
  year: number;
  startCustomers: number;
  newCustomers: number;
  churnRate: number;
  customersLost: number;
  endCustomers: number;
  revenue: number;
  wholesaleCost: number;
  marketingCost: number;
  retentionCost: number;
  margin: number;
}

interface Game1bPrediction {
  scenario: string;
  clearingPrice: number;
  prediction: 'profit' | 'loss' | null;
  genProfit: number;
  retailProfit: number;
  totalProfit: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AVG_CLEARING_PRICE = 65;
const INITIAL_CUSTOMERS = 50000;
const MWH_PER_CUSTOMER = 8;
const ACQUISITION_COST = 200;

const SCENARIOS: { name: string; price: number }[] = [
  { name: 'Low', price: 30 },
  { name: 'Medium', price: 65 },
  { name: 'High', price: 120 },
  { name: 'Extreme', price: 200 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDollar(n: number): string {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function simulateYear(
  customers: number,
  decision: YearDecision,
): YearResult {
  const { retailPrice, marketingSpend, retentionSpend } = decision;
  const newCustomers = Math.floor((marketingSpend * 1_000_000) / ACQUISITION_COST);
  const churnRate = Math.max(
    0.05,
    0.15 -
      Math.min((retentionSpend * 1_000_000) / (customers * 10), 0.10) +
      Math.max(0, ((retailPrice - 80) / 80) * 0.20),
  );
  const customersLost = Math.floor(customers * churnRate);
  const endCustomers = customers - customersLost + newCustomers;
  const revenue = endCustomers * MWH_PER_CUSTOMER * retailPrice;
  const wholesaleCost = endCustomers * MWH_PER_CUSTOMER * AVG_CLEARING_PRICE;
  const marketingCost = marketingSpend * 1e6;
  const retentionCost = retentionSpend * 1e6;
  const margin = revenue - wholesaleCost - marketingCost - retentionCost;

  return {
    year: 0,
    startCustomers: customers,
    newCustomers,
    churnRate,
    customersLost,
    endCustomers,
    revenue,
    wholesaleCost,
    marketingCost,
    retentionCost,
    margin,
  };
}

function calculateOptimalResults(): YearResult[] {
  const optDecision: YearDecision = {
    retailPrice: 75,
    marketingSpend: 8,
    retentionSpend: 4,
  };
  let customers = INITIAL_CUSTOMERS;
  const results: YearResult[] = [];
  for (let y = 0; y < 3; y++) {
    const r = simulateYear(customers, optDecision);
    r.year = y + 1;
    results.push(r);
    customers = r.endCustomers;
  }
  return results;
}

function calcGame1bScenario(clearingPrice: number): {
  genProfit: number;
  retailProfit: number;
  totalProfit: number;
} {
  const genRevenue = 500 * 4 * clearingPrice;
  const genCost = 500 * 4 * 45;
  const genProfit = genRevenue - genCost;

  const retailRevenue = (800_000 * 80) / 1000;
  const retailCost = (800_000 * clearingPrice) / 1000;
  const retailProfit = retailRevenue - retailCost;

  const totalProfit = genProfit + retailProfit;
  return { genProfit, retailProfit, totalProfit };
}

// ─── Slider Component ────────────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-navy-300">{label}</span>
        <span className="text-sm font-mono font-bold text-electric-300">
          {unit === '$M' ? `$${value}M` : `$${value}/MWh`}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-electric-400
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-electric-500/30
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-electric-300
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:relative
            [&::-webkit-slider-thumb]:z-10"
          style={{
            background: `linear-gradient(to right, #3182ce ${pct}%, #1f3254 ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-navy-500 mt-1">
        <span>{unit === '$M' ? `$${min}M` : `$${min}`}</span>
        <span>{unit === '$M' ? `$${max}M` : `$${max}`}</span>
      </div>
    </div>
  );
}

// ─── Bar Chart Component ─────────────────────────────────────────────────────

function BarChart({
  data,
  maxVal,
  colorFn,
  labelFn,
  height = 160,
}: {
  data: number[];
  maxVal: number;
  colorFn: (v: number, i: number) => string;
  labelFn: (v: number, i: number) => string;
  height?: number;
}) {
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((v, i) => {
        const pct = maxVal > 0 ? Math.max(2, (Math.abs(v) / maxVal) * 100) : 2;
        const isNeg = v < 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-[10px] font-mono text-navy-400 mb-1">{labelFn(v, i)}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`w-full rounded-t-md ${isNeg ? 'opacity-70' : ''}`}
              style={{ backgroundColor: colorFn(v, i) }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RetailMinigame() {
  const navigate = useNavigate();
  const [wrapperPhase, setWrapperPhase] = useState<WrapperPhase>('select');
  const [lastGame, setLastGame] = useState<'1a' | '1b' | null>(null);

  // Game 1a state
  const [game1aPhase, setGame1aPhase] = useState<GamePhase>('INTRO');
  const [currentYear, setCurrentYear] = useState(0);
  const [decisions, setDecisions] = useState<YearDecision[]>([
    { retailPrice: 80, marketingSpend: 5, retentionSpend: 2 },
    { retailPrice: 80, marketingSpend: 5, retentionSpend: 2 },
    { retailPrice: 80, marketingSpend: 5, retentionSpend: 2 },
  ]);
  const [yearResults, setYearResults] = useState<YearResult[]>([]);
  const [revealStep, setRevealStep] = useState(0);

  // Game 1b state
  const [game1bPhase, setGame1bPhase] = useState<GamePhase>('INTRO');
  const [predictions, setPredictions] = useState<('profit' | 'loss' | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [game1bRevealStep, setGame1bRevealStep] = useState(0);

  // Game 1a last results for done screen
  const [game1aProfit, setGame1aProfit] = useState(0);
  const [game1aOptimalProfit, setGame1aOptimalProfit] = useState(0);

  // Game 1b last results for done screen
  const [game1bScore, setGame1bScore] = useState(0);

  // ─── Game 1a derived data ──────────────────────────────────────────────────

  const game1bResults: Game1bPrediction[] = useMemo(() => {
    return SCENARIOS.map((s, i) => {
      const { genProfit, retailProfit, totalProfit } = calcGame1bScenario(s.price);
      return {
        scenario: s.name,
        clearingPrice: s.price,
        prediction: predictions[i],
        genProfit,
        retailProfit,
        totalProfit,
      };
    });
  }, [predictions]);

  // ─── Game 1a Reveal Animation ──────────────────────────────────────────────

  useEffect(() => {
    if (wrapperPhase !== 'game1a' || game1aPhase !== 'REVEAL') return;
    if (revealStep >= yearResults.length) {
      const timer = setTimeout(() => setGame1aPhase('RESULTS'), 800);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setRevealStep((s) => s + 1), 1200);
    return () => clearTimeout(timer);
  }, [wrapperPhase, game1aPhase, revealStep, yearResults.length]);

  // ─── Game 1b Reveal Animation ──────────────────────────────────────────────

  useEffect(() => {
    if (wrapperPhase !== 'game1b' || game1bPhase !== 'REVEAL') return;
    if (game1bRevealStep >= 4) {
      const timer = setTimeout(() => setGame1bPhase('RESULTS'), 800);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setGame1bRevealStep((s) => s + 1), 1500);
    return () => clearTimeout(timer);
  }, [wrapperPhase, game1bPhase, game1bRevealStep]);

  // ─── Reset functions ───────────────────────────────────────────────────────

  function resetGame1a() {
    setGame1aPhase('INTRO');
    setCurrentYear(0);
    setDecisions([
      { retailPrice: 80, marketingSpend: 5, retentionSpend: 2 },
      { retailPrice: 80, marketingSpend: 5, retentionSpend: 2 },
      { retailPrice: 80, marketingSpend: 5, retentionSpend: 2 },
    ]);
    setYearResults([]);
    setRevealStep(0);
  }

  function resetGame1b() {
    setGame1bPhase('INTRO');
    setPredictions([null, null, null, null]);
    setGame1bRevealStep(0);
  }

  // ─── Game 1a: Submit a year ────────────────────────────────────────────────

  function submitYear() {
    const customers =
      yearResults.length > 0
        ? yearResults[yearResults.length - 1].endCustomers
        : INITIAL_CUSTOMERS;
    const result = simulateYear(customers, decisions[currentYear]);
    result.year = currentYear + 1;
    const newResults = [...yearResults, result];
    setYearResults(newResults);

    if (currentYear < 2) {
      setCurrentYear(currentYear + 1);
    } else {
      // All 3 years done - go to reveal
      const totalProfit = newResults.reduce((sum, r) => sum + r.margin, 0);
      const optResults = calculateOptimalResults();
      const optProfit = optResults.reduce((sum, r) => sum + r.margin, 0);
      setGame1aProfit(totalProfit);
      setGame1aOptimalProfit(optProfit);
      setRevealStep(0);
      setGame1aPhase('REVEAL');
    }
  }

  // ─── Game 1b: Submit predictions ───────────────────────────────────────────

  function submitPredictions() {
    const score = game1bResults.reduce((count, r) => {
      if (r.prediction === null) return count;
      const actual = r.totalProfit >= 0 ? 'profit' : 'loss';
      return count + (r.prediction === actual ? 1 : 0);
    }, 0);
    setGame1bScore(score);
    setGame1bRevealStep(0);
    setGame1bPhase('REVEAL');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  SELECT PHASE
  // ═══════════════════════════════════════════════════════════════════════════

  const renderSelect = () => (
    <motion.div
      key="select"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <div className="text-6xl mb-4">&#128176;</div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Electricity Retail Mini-Games
      </h1>
      <p className="text-navy-300 text-center max-w-lg mb-10">
        Explore the economics of electricity retailing through two interactive challenges.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mb-10">
        {/* Game 1a card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetGame1a();
            setWrapperPhase('game1a');
          }}
          className="bg-white/5 border border-white/10 hover:border-electric-500/40 rounded-2xl p-6 text-left transition-all group"
        >
          <div className="text-3xl mb-3">&#128101;</div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-300 transition-colors">
            1a. Customer Acquisition & Retention
          </h3>
          <p className="text-sm text-navy-400 leading-relaxed">
            Manage a retail electricity book over 3 years. Set prices, allocate
            marketing spend, and retain customers to maximise profit.
          </p>
          <div className="mt-4 flex items-center gap-2 text-electric-400 text-sm font-medium">
            <span>Play</span>
            <span>&rarr;</span>
          </div>
        </motion.button>

        {/* Game 1b card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetGame1b();
            setWrapperPhase('game1b');
          }}
          className="bg-white/5 border border-white/10 hover:border-electric-500/40 rounded-2xl p-6 text-left transition-all group"
        >
          <div className="text-3xl mb-3">&#9878;</div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-300 transition-colors">
            1b. Vertical Integration Balance
          </h3>
          <p className="text-sm text-navy-400 leading-relaxed">
            Predict whether a vertically integrated company (gen + retail) profits or
            loses under different wholesale price scenarios.
          </p>
          <div className="mt-4 flex items-center gap-2 text-electric-400 text-sm font-medium">
            <span>Play</span>
            <span>&rarr;</span>
          </div>
        </motion.button>
      </div>

      <button
        onClick={() => navigate('/')}
        className="px-5 py-2.5 text-sm font-medium text-navy-300 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl transition-all"
      >
        Back to Home
      </button>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  GAME 1A: CUSTOMER ACQUISITION & RETENTION
  // ═══════════════════════════════════════════════════════════════════════════

  const renderGame1aIntro = () => (
    <motion.div
      key="game1a-intro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <div className="max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">&#128101;</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Customer Acquisition & Retention
        </h1>
        <p className="text-navy-300 mb-8 max-w-xl mx-auto leading-relaxed">
          You manage an electricity retail book. Each customer costs{' '}
          <span className="text-electric-300 font-bold">$200</span> to acquire and
          uses <span className="text-electric-300 font-bold">8 MWh/year</span>.
          Base churn is <span className="text-amber-300 font-bold">15%</span> per year.
          Higher retail prices increase churn; retention spend reduces it. Your wholesale
          cost is fixed at <span className="text-white font-bold">${AVG_CLEARING_PRICE}/MWh</span>.
        </p>

        {/* Starting specs */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-4">
            Starting Position
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-mono font-bold text-electric-300">50K</div>
              <div className="text-xs text-navy-400 mt-1">Customers</div>
            </div>
            <div>
              <div className="text-2xl font-mono font-bold text-electric-300">$200</div>
              <div className="text-xs text-navy-400 mt-1">Acq. Cost</div>
            </div>
            <div>
              <div className="text-2xl font-mono font-bold text-electric-300">3</div>
              <div className="text-xs text-navy-400 mt-1">Years</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-mono font-bold text-amber-300">15%</div>
              <div className="text-xs text-navy-400 mt-1">Base Churn</div>
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-green-300">8 MWh</div>
              <div className="text-xs text-navy-400 mt-1">Use / Cust / Year</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setGame1aPhase('DECIDE')}
            className="px-8 py-3 bg-electric-500 hover:bg-electric-600 text-white rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-electric-500/20"
          >
            Start Challenge
          </button>
          <button
            onClick={() => setWrapperPhase('select')}
            className="px-6 py-3 text-navy-300 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
          >
            Back
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderGame1aDecide = () => {
    const currentCustomers =
      yearResults.length > 0
        ? yearResults[yearResults.length - 1].endCustomers
        : INITIAL_CUSTOMERS;
    const cumulativeProfit = yearResults.reduce((s, r) => s + r.margin, 0);

    return (
      <motion.div
        key={`game1a-decide-${currentYear}`}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        className="flex flex-col min-h-screen"
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-navy-900/90 backdrop-blur border-b border-white/10 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Year indicator */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((y) => (
                  <div
                    key={y}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      y < currentYear
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : y === currentYear
                          ? 'bg-electric-500/20 text-electric-300 border border-electric-500/40'
                          : 'bg-white/5 text-navy-500 border border-white/10'
                    }`}
                  >
                    {y + 1}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Year {currentYear + 1}</div>
                <div className="text-xs text-navy-400">
                  {currentCustomers.toLocaleString()} customers
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-navy-400">Cumulative P&L</div>
              <div
                className={`text-lg font-mono font-bold ${
                  cumulativeProfit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatDollar(cumulativeProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Controls */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-1">Year {currentYear + 1} Decisions</h3>
                <p className="text-xs text-navy-400 mb-6">
                  Set your retail price and allocate spending
                </p>

                <Slider
                  label="Retail Price"
                  value={decisions[currentYear].retailPrice}
                  min={40}
                  max={120}
                  step={1}
                  unit="$/MWh"
                  onChange={(v) =>
                    setDecisions((prev) => {
                      const next = [...prev];
                      next[currentYear] = { ...next[currentYear], retailPrice: v };
                      return next;
                    })
                  }
                />
                <Slider
                  label="Marketing Spend"
                  value={decisions[currentYear].marketingSpend}
                  min={0}
                  max={20}
                  step={0.5}
                  unit="$M"
                  onChange={(v) =>
                    setDecisions((prev) => {
                      const next = [...prev];
                      next[currentYear] = { ...next[currentYear], marketingSpend: v };
                      return next;
                    })
                  }
                />
                <Slider
                  label="Retention Spend"
                  value={decisions[currentYear].retentionSpend}
                  min={0}
                  max={10}
                  step={0.5}
                  unit="$M"
                  onChange={(v) =>
                    setDecisions((prev) => {
                      const next = [...prev];
                      next[currentYear] = { ...next[currentYear], retentionSpend: v };
                      return next;
                    })
                  }
                />

                {/* Preview calculations */}
                {(() => {
                  const preview = simulateYear(currentCustomers, decisions[currentYear]);
                  return (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-3">
                        Year {currentYear + 1} Preview
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-navy-800/50 rounded-xl p-3">
                          <div className="text-xs text-navy-400">New Customers</div>
                          <div className="text-sm font-mono font-bold text-green-400">
                            +{preview.newCustomers.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-navy-800/50 rounded-xl p-3">
                          <div className="text-xs text-navy-400">Churn Rate</div>
                          <div
                            className={`text-sm font-mono font-bold ${
                              preview.churnRate > 0.15
                                ? 'text-red-400'
                                : preview.churnRate < 0.10
                                  ? 'text-green-400'
                                  : 'text-amber-400'
                            }`}
                          >
                            {(preview.churnRate * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-navy-800/50 rounded-xl p-3">
                          <div className="text-xs text-navy-400">Customers Lost</div>
                          <div className="text-sm font-mono font-bold text-red-400">
                            -{preview.customersLost.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-navy-800/50 rounded-xl p-3">
                          <div className="text-xs text-navy-400">End Customers</div>
                          <div className="text-sm font-mono font-bold text-white">
                            {preview.endCustomers.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 bg-navy-800/50 rounded-xl p-3">
                        <div className="text-xs text-navy-400">Year Margin</div>
                        <div
                          className={`text-lg font-mono font-bold ${
                            preview.margin >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {formatDollar(preview.margin)}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={submitYear}
                  className="mt-6 w-full px-6 py-3 bg-electric-500 hover:bg-electric-600 text-white rounded-xl text-base font-semibold transition-colors shadow-lg shadow-electric-500/20"
                >
                  {currentYear < 2 ? `Submit Year ${currentYear + 1}` : 'Submit Final Year'}
                </button>
              </div>

              {/* Right: Dashboard */}
              <div className="space-y-4">
                {/* Customer count over time */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-4">
                    Customer Count
                  </h4>
                  {yearResults.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-navy-500 text-sm">
                      Submit Year 1 to see results
                    </div>
                  ) : (
                    <div className="flex items-end gap-3 h-32">
                      {/* Starting */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className="text-[10px] font-mono text-navy-400 mb-1">
                          {(INITIAL_CUSTOMERS / 1000).toFixed(0)}K
                        </span>
                        <div
                          className="w-full rounded-t-md bg-navy-600"
                          style={{
                            height: `${Math.max(
                              10,
                              (INITIAL_CUSTOMERS /
                                Math.max(
                                  INITIAL_CUSTOMERS,
                                  ...yearResults.map((r) => r.endCustomers),
                                )) *
                                100,
                            )}%`,
                          }}
                        />
                        <span className="text-[10px] text-navy-500 mt-1">Start</span>
                      </div>
                      {yearResults.map((r, i) => {
                        const maxC = Math.max(
                          INITIAL_CUSTOMERS,
                          ...yearResults.map((yr) => yr.endCustomers),
                        );
                        const pct = Math.max(10, (r.endCustomers / maxC) * 100);
                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center justify-end h-full"
                          >
                            <span className="text-[10px] font-mono text-navy-400 mb-1">
                              {(r.endCustomers / 1000).toFixed(0)}K
                            </span>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${pct}%` }}
                              transition={{ duration: 0.5 }}
                              className="w-full rounded-t-md bg-electric-500"
                            />
                            <span className="text-[10px] text-navy-500 mt-1">Y{r.year}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Revenue/Cost breakdown for completed years */}
                {yearResults.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-4">
                      Revenue & Cost Breakdown
                    </h4>
                    <div className="space-y-3">
                      {yearResults.map((r, i) => (
                        <div key={i} className="bg-navy-800/50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white">Year {r.year}</span>
                            <span
                              className={`text-sm font-mono font-bold ${
                                r.margin >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {formatDollar(r.margin)}
                            </span>
                          </div>
                          {/* Stacked bar */}
                          <div className="h-4 bg-navy-700 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-green-500/70"
                              style={{
                                width: `${(r.revenue / (r.revenue + r.wholesaleCost + r.marketingCost + r.retentionCost)) * 100}%`,
                              }}
                              title={`Revenue: ${formatDollar(r.revenue)}`}
                            />
                            <div
                              className="h-full bg-red-500/50"
                              style={{
                                width: `${(r.wholesaleCost / (r.revenue + r.wholesaleCost + r.marketingCost + r.retentionCost)) * 100}%`,
                              }}
                              title={`Wholesale: ${formatDollar(r.wholesaleCost)}`}
                            />
                            <div
                              className="h-full bg-amber-500/50"
                              style={{
                                width: `${((r.marketingCost + r.retentionCost) / (r.revenue + r.wholesaleCost + r.marketingCost + r.retentionCost)) * 100}%`,
                              }}
                              title={`Marketing + Retention: ${formatDollar(r.marketingCost + r.retentionCost)}`}
                            />
                          </div>
                          <div className="flex gap-4 mt-1.5 text-[10px] text-navy-500">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500/70" />
                              Rev {formatDollar(r.revenue)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500/50" />
                              Wholesale {formatDollar(r.wholesaleCost)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500/50" />
                              Mktg+Ret {formatDollar(r.marketingCost + r.retentionCost)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGame1aReveal = () => (
    <motion.div
      key="game1a-reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <h2 className="text-2xl font-bold text-white mb-8">Year-by-Year Results</h2>
      <div className="max-w-2xl w-full space-y-4">
        {yearResults.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={
              i < revealStep
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0.2, y: 30, scale: 0.95 }
            }
            transition={{ duration: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Year {r.year}</h3>
              <span
                className={`text-xl font-mono font-bold ${
                  r.margin >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatDollar(r.margin)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-xs text-navy-400">Start</div>
                <div className="text-sm font-mono text-white">
                  {r.startCustomers.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-navy-400">Gained</div>
                <div className="text-sm font-mono text-green-400">
                  +{r.newCustomers.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-navy-400">Lost</div>
                <div className="text-sm font-mono text-red-400">
                  -{r.customersLost.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-navy-400">End</div>
                <div className="text-sm font-mono text-white font-bold">
                  {r.endCustomers.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderGame1aResults = () => {
    const totalProfit = game1aProfit;
    const optimalProfit = game1aOptimalProfit;
    const pctOfOptimal =
      optimalProfit !== 0 ? Math.round((totalProfit / optimalProfit) * 100) : 0;

    return (
      <motion.div
        key="game1a-results"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
      >
        <div className="text-5xl mb-4">&#128202;</div>
        <h2 className="text-3xl font-bold text-white mb-2">Final Results</h2>
        <p className="text-navy-400 mb-8">3-Year Retail Performance</p>

        <div className="max-w-md w-full space-y-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-sm text-navy-400 uppercase tracking-wide mb-2">
              Your Total Profit
            </div>
            <div
              className={`text-4xl font-mono font-bold ${
                totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {formatDollar(totalProfit)}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-sm text-navy-400 uppercase tracking-wide mb-2">
              Optimal Strategy Profit
            </div>
            <div className="text-2xl font-mono font-bold text-electric-300">
              {formatDollar(optimalProfit)}
            </div>
            <div className="text-xs text-navy-500 mt-1">
              Price $75/MWh | Marketing $8M | Retention $4M
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-sm text-navy-400 uppercase tracking-wide mb-2">
              Performance vs Optimal
            </div>
            <div className="text-2xl font-mono font-bold text-white">{pctOfOptimal}%</div>
            <div className="mt-3 h-3 bg-navy-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, pctOfOptimal))}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  pctOfOptimal >= 80
                    ? 'bg-green-500'
                    : pctOfOptimal >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => {
              setLastGame('1a');
              setWrapperPhase('done');
            }}
            className="px-6 py-2.5 text-sm font-medium text-electric-300 border border-electric-500/30 hover:border-electric-400 hover:bg-electric-500/10 rounded-xl transition-all"
          >
            Finish
          </button>
          <button
            onClick={() => {
              resetGame1a();
            }}
            className="px-6 py-2.5 text-sm font-medium text-electric-300 border border-electric-500/30 hover:border-electric-400 hover:bg-electric-500/10 rounded-xl transition-all"
          >
            Retry
          </button>
          <button
            onClick={() => setWrapperPhase('select')}
            className="px-6 py-2.5 text-sm font-medium text-navy-300 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl transition-all"
          >
            Back to Menu
          </button>
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  GAME 1B: VERTICAL INTEGRATION BALANCE
  // ═══════════════════════════════════════════════════════════════════════════

  const renderGame1bIntro = () => (
    <motion.div
      key="game1b-intro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <div className="max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">&#9878;</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Vertical Integration Balance
        </h1>
        <p className="text-navy-300 mb-6 max-w-xl mx-auto leading-relaxed">
          A vertically integrated energy company owns both{' '}
          <span className="text-green-400 font-bold">generation</span> and{' '}
          <span className="text-electric-300 font-bold">retail</span>. When wholesale
          clearing prices are high, generation profits but retail suffers. When prices
          are low, retail benefits but generation loses. A balanced portfolio creates
          a <span className="text-amber-300 font-bold">natural hedge</span>.
        </p>

        {/* Portfolio specs */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 max-w-lg mx-auto">
          <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-4">
            Your Company Portfolio
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="text-sm font-bold text-green-400 mb-2">Generation</div>
              <div className="text-2xl font-mono font-bold text-white">500 MW</div>
              <div className="text-xs text-navy-400 mt-1">SRMC: $45/MWh</div>
              <div className="text-xs text-navy-400">4hr representative period</div>
            </div>
            <div className="bg-electric-500/10 border border-electric-500/20 rounded-xl p-4 text-center">
              <div className="text-sm font-bold text-electric-300 mb-2">Retail</div>
              <div className="text-2xl font-mono font-bold text-white">100K</div>
              <div className="text-xs text-navy-400 mt-1">Customers @ $80/MWh</div>
              <div className="text-xs text-navy-400">800,000 MWh demand</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-navy-400 mb-8 max-w-md mx-auto">
          For each clearing price scenario, predict whether the combined company
          makes a <span className="text-green-400">profit</span> or{' '}
          <span className="text-red-400">loss</span>.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setGame1bPhase('DECIDE')}
            className="px-8 py-3 bg-electric-500 hover:bg-electric-600 text-white rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-electric-500/20"
          >
            Start Challenge
          </button>
          <button
            onClick={() => setWrapperPhase('select')}
            className="px-6 py-3 text-navy-300 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
          >
            Back
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderGame1bDecide = () => {
    const allPicked = predictions.every((p) => p !== null);

    return (
      <motion.div
        key="game1b-decide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center min-h-screen px-4 py-12"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Predict the Outcome</h2>
        <p className="text-sm text-navy-400 mb-8">
          Will your vertically integrated company profit or lose at each clearing price?
        </p>

        <div className="max-w-2xl w-full space-y-4 mb-8">
          {SCENARIOS.map((s, i) => {
            const priceColor =
              s.price <= 30
                ? 'text-green-400'
                : s.price <= 65
                  ? 'text-electric-300'
                  : s.price <= 120
                    ? 'text-amber-400'
                    : 'text-red-400';
            const priceBorderColor =
              s.price <= 30
                ? 'border-green-500/20'
                : s.price <= 65
                  ? 'border-electric-500/20'
                  : s.price <= 120
                    ? 'border-amber-500/20'
                    : 'border-red-500/20';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white/5 border ${priceBorderColor} rounded-2xl p-5`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-navy-400 uppercase tracking-wide">
                      Scenario {i + 1}: {s.name}
                    </span>
                    <div className={`text-2xl font-mono font-bold ${priceColor}`}>
                      ${s.price}/MWh
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPredictions((prev) => {
                          const next = [...prev];
                          next[i] = 'profit';
                          return next;
                        })
                      }
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        predictions[i] === 'profit'
                          ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50 shadow-lg shadow-green-500/10'
                          : 'bg-white/5 text-navy-400 border border-white/10 hover:border-green-500/30 hover:text-green-400'
                      }`}
                    >
                      Profit
                    </button>
                    <button
                      onClick={() =>
                        setPredictions((prev) => {
                          const next = [...prev];
                          next[i] = 'loss';
                          return next;
                        })
                      }
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        predictions[i] === 'loss'
                          ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 shadow-lg shadow-red-500/10'
                          : 'bg-white/5 text-navy-400 border border-white/10 hover:border-red-500/30 hover:text-red-400'
                      }`}
                    >
                      Loss
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={submitPredictions}
          disabled={!allPicked}
          className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all ${
            allPicked
              ? 'bg-electric-500 hover:bg-electric-600 text-white shadow-lg shadow-electric-500/20'
              : 'bg-white/5 text-navy-500 border border-white/10 cursor-not-allowed'
          }`}
        >
          Submit Predictions
        </button>
      </motion.div>
    );
  };

  const renderGame1bReveal = () => {
    const maxAbsVal = Math.max(
      ...game1bResults.map((r) =>
        Math.max(Math.abs(r.genProfit), Math.abs(r.retailProfit), Math.abs(r.totalProfit)),
      ),
    );

    return (
      <motion.div
        key="game1b-reveal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Scenario Breakdown</h2>
        <p className="text-sm text-navy-400 mb-8">
          See how generation and retail profits offset each other
        </p>

        <div className="max-w-3xl w-full space-y-5">
          {game1bResults.map((r, i) => {
            const isRevealed = i < game1bRevealStep;
            const actual = r.totalProfit >= 0 ? 'profit' : 'loss';
            const correct = r.prediction === actual;
            const barScale = maxAbsVal > 0 ? 1 / maxAbsVal : 1;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0.15, y: 20 }}
                transition={{ duration: 0.6 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-navy-400 uppercase tracking-wide">
                      {r.scenario} - ${r.clearingPrice}/MWh
                    </span>
                  </div>
                  {isRevealed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        correct
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {correct ? 'Correct' : 'Wrong'}
                    </motion.div>
                  )}
                </div>

                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    {/* Gen profit bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-navy-400 w-16 text-right shrink-0">Gen</span>
                      <div className="flex-1 h-6 bg-navy-800 rounded-md overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.abs(r.genProfit) * barScale * 100}%`,
                          }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className={`h-full rounded-md ${
                            r.genProfit >= 0 ? 'bg-green-500/70' : 'bg-red-500/50'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-mono w-20 text-right shrink-0 ${
                          r.genProfit >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {formatDollar(r.genProfit)}
                      </span>
                    </div>
                    {/* Retail profit bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-navy-400 w-16 text-right shrink-0">Retail</span>
                      <div className="flex-1 h-6 bg-navy-800 rounded-md overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.abs(r.retailProfit) * barScale * 100}%`,
                          }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className={`h-full rounded-md ${
                            r.retailProfit >= 0 ? 'bg-electric-500/70' : 'bg-red-500/50'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-mono w-20 text-right shrink-0 ${
                          r.retailProfit >= 0 ? 'text-electric-300' : 'text-red-400'
                        }`}
                      >
                        {formatDollar(r.retailProfit)}
                      </span>
                    </div>
                    {/* Net total bar */}
                    <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                      <span className="text-xs text-white font-bold w-16 text-right shrink-0">
                        Net
                      </span>
                      <div className="flex-1 h-6 bg-navy-800 rounded-md overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.abs(r.totalProfit) * barScale * 100}%`,
                          }}
                          transition={{ duration: 0.8, delay: 0.7 }}
                          className={`h-full rounded-md ${
                            r.totalProfit >= 0 ? 'bg-amber-500/70' : 'bg-red-500/60'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-mono font-bold w-20 text-right shrink-0 ${
                          r.totalProfit >= 0 ? 'text-amber-300' : 'text-red-400'
                        }`}
                      >
                        {formatDollar(r.totalProfit)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const renderGame1bResults = () => {
    const score = game1bScore;
    const insightMessages = [
      'The natural hedge is key! When gen profits, retail loses and vice versa.',
      'At extreme prices, one side dominates - the hedge has limits.',
      'Vertical integration reduces overall portfolio risk across most scenarios.',
      'The $80 retail price vs $45 gen cost means the company is net-long on low prices.',
    ];

    return (
      <motion.div
        key="game1b-results"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
      >
        <div className="text-5xl mb-4">&#9878;</div>
        <h2 className="text-3xl font-bold text-white mb-2">Prediction Results</h2>
        <p className="text-navy-400 mb-8">Vertical Integration Challenge</p>

        <div className="max-w-md w-full space-y-4 mb-8">
          {/* Score */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-sm text-navy-400 uppercase tracking-wide mb-2">
              Your Score
            </div>
            <div className="text-5xl font-mono font-bold text-white mb-1">
              {score} <span className="text-2xl text-navy-500">/ 4</span>
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {game1bResults.map((r, i) => {
                const actual = r.totalProfit >= 0 ? 'profit' : 'loss';
                const correct = r.prediction === actual;
                return (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      correct
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {correct ? '\u2713' : '\u2717'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insight */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="text-sm font-bold text-amber-300 mb-2">Key Insight</div>
            <p className="text-sm text-navy-300 leading-relaxed">
              {score === 4
                ? 'Perfect score! You understand vertical integration well. ' +
                  insightMessages[0]
                : score >= 2
                  ? 'Good effort! Remember: ' + insightMessages[0] + ' ' + insightMessages[2]
                  : insightMessages[0] + ' ' + insightMessages[1] + ' ' + insightMessages[3]}
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => {
              setLastGame('1b');
              setWrapperPhase('done');
            }}
            className="px-6 py-2.5 text-sm font-medium text-electric-300 border border-electric-500/30 hover:border-electric-400 hover:bg-electric-500/10 rounded-xl transition-all"
          >
            Finish
          </button>
          <button
            onClick={() => {
              resetGame1b();
            }}
            className="px-6 py-2.5 text-sm font-medium text-electric-300 border border-electric-500/30 hover:border-electric-400 hover:bg-electric-500/10 rounded-xl transition-all"
          >
            Retry
          </button>
          <button
            onClick={() => setWrapperPhase('select')}
            className="px-6 py-2.5 text-sm font-medium text-navy-300 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl transition-all"
          >
            Back to Menu
          </button>
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  DONE PHASE
  // ═══════════════════════════════════════════════════════════════════════════

  const renderDone = () => (
    <motion.div
      key="done"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen gap-6 px-4"
    >
      <div className="text-5xl">&#128176;</div>
      <h2 className="text-3xl font-bold text-white">Retail Mini-Games Complete</h2>

      {lastGame === '1a' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center max-w-sm">
          <div className="text-sm text-navy-400 uppercase tracking-wide mb-2">
            Game 1a: Customer Acquisition
          </div>
          <div
            className={`text-2xl font-mono font-bold ${
              game1aProfit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatDollar(game1aProfit)}
          </div>
          <div className="text-xs text-navy-500 mt-1">
            Optimal: {formatDollar(game1aOptimalProfit)}
            {game1aOptimalProfit > 0 && (
              <> ({Math.round((game1aProfit / game1aOptimalProfit) * 100)}% capture)</>
            )}
          </div>
        </div>
      )}

      {lastGame === '1b' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center max-w-sm">
          <div className="text-sm text-navy-400 uppercase tracking-wide mb-2">
            Game 1b: Vertical Integration
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {game1bScore} / 4 Correct
          </div>
          <div className="text-xs text-navy-500 mt-1">
            {game1bScore === 4
              ? 'Perfect understanding of natural hedging!'
              : game1bScore >= 2
                ? 'Good grasp of integration dynamics'
                : 'Review how gen and retail profits offset'}
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => setWrapperPhase('select')}
          className="px-5 py-2.5 text-sm font-medium text-electric-300 border border-electric-500/30 hover:border-electric-400 hover:bg-electric-500/10 rounded-xl transition-all"
        >
          Play Again
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 text-sm font-medium text-navy-300 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl transition-all"
        >
          Back to Home
        </button>
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-navy-950">
      <AnimatePresence mode="wait">
        {wrapperPhase === 'select' && renderSelect()}

        {wrapperPhase === 'game1a' && (
          <>
            {game1aPhase === 'INTRO' && renderGame1aIntro()}
            {game1aPhase === 'DECIDE' && renderGame1aDecide()}
            {game1aPhase === 'REVEAL' && renderGame1aReveal()}
            {game1aPhase === 'RESULTS' && renderGame1aResults()}
          </>
        )}

        {wrapperPhase === 'game1b' && (
          <>
            {game1bPhase === 'INTRO' && renderGame1bIntro()}
            {game1bPhase === 'DECIDE' && renderGame1bDecide()}
            {game1bPhase === 'REVEAL' && renderGame1bReveal()}
            {game1bPhase === 'RESULTS' && renderGame1bResults()}
          </>
        )}

        {wrapperPhase === 'done' && renderDone()}
      </AnimatePresence>
    </div>
  );
}
