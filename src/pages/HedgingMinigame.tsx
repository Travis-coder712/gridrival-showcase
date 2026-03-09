import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase = 'INTRO' | 'DECIDE' | 'REVEAL' | 'RESULTS';

type HedgeType = 'cap' | 'swap';

interface HedgeProduct {
  id: string;
  name: string;
  type: HedgeType;
  strike?: number;       // cap strike price ($/MWh)
  fixedPrice?: number;   // swap fixed price ($/MWh)
  premium: number;        // cost in $ millions
  coveredGWh: number;     // volume covered in GWh
  description: string;
  color: string;          // tailwind accent color token
  icon: string;
}

interface Scenario {
  id: string;
  label: string;
  description: string;
  clearingPrice: number;  // avg $/MWh
  probability: number;    // 0–1
  color: string;
}

interface ScenarioResult {
  scenario: Scenario;
  unhedgedCost: number;
  retailRevenue: number;
  unhedgedProfit: number;
  hedgePayouts: { productId: string; payout: number }[];
  totalPremiums: number;
  totalPayouts: number;
  hedgedProfit: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const RETAIL_PRICE = 85;      // $/MWh
const TOTAL_LOAD = 800;       // GWh/year
const CUSTOMER_COUNT = 100_000;
const HEDGING_BUDGET = 5_000_000; // $5M

const HEDGE_PRODUCTS: HedgeProduct[] = [
  {
    id: 'standard-cap',
    name: 'Standard Cap',
    type: 'cap',
    strike: 80,
    premium: 2_000_000,
    coveredGWh: 400,
    description: 'Broad protection above $80/MWh. Pays out when clearing price exceeds strike.',
    color: 'blue',
    icon: 'shield',
  },
  {
    id: 'deep-cap',
    name: 'Deep Cap',
    type: 'cap',
    strike: 50,
    premium: 4_000_000,
    coveredGWh: 400,
    description: 'Aggressive protection from $50/MWh. Expensive but covers moderate price rises.',
    color: 'indigo',
    icon: 'shield-double',
  },
  {
    id: 'peaker-cap',
    name: 'Peaker Cap',
    type: 'cap',
    strike: 150,
    premium: 500_000,
    coveredGWh: 400,
    description: 'Cheap insurance for extreme price spikes only. High deductible, low premium.',
    color: 'orange',
    icon: 'fire',
  },
  {
    id: 'baseload-swap',
    name: 'Baseload Swap',
    type: 'swap',
    fixedPrice: 55,
    premium: 1_000_000,
    coveredGWh: 400,
    description: 'Locks in $55/MWh for half your load. You pay if clearing drops below fixed price.',
    color: 'emerald',
    icon: 'arrows',
  },
  {
    id: 'peak-swap',
    name: 'Peak Swap',
    type: 'swap',
    fixedPrice: 90,
    premium: 1_500_000,
    coveredGWh: 200,
    description: 'Locks in $90/MWh for peak periods. Premium priced for peak certainty.',
    color: 'purple',
    icon: 'clock',
  },
];

const SCENARIOS: Scenario[] = [
  {
    id: 'low',
    label: 'Scenario A',
    description: 'Mild summer, abundant renewables',
    clearingPrice: 40,
    probability: 0.33,
    color: 'emerald',
  },
  {
    id: 'medium',
    label: 'Scenario B',
    description: 'Typical conditions, moderate demand',
    clearingPrice: 75,
    probability: 0.34,
    color: 'amber',
  },
  {
    id: 'extreme',
    label: 'Scenario C',
    description: 'Heatwave + generator outages',
    clearingPrice: 180,
    probability: 0.33,
    color: 'red',
  },
];

// ─── Utility Functions ──────────────────────────────────────────────────────

function formatDollars(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatDollarsFull(value: number): string {
  const sign = value < 0 ? '-' : '';
  return sign + '$' + Math.abs(Math.round(value)).toLocaleString();
}

function calcHedgePayout(product: HedgeProduct, clearingPrice: number): number {
  if (product.type === 'cap' && product.strike !== undefined) {
    return Math.max(clearingPrice - product.strike, 0) * product.coveredGWh * 1000;
  }
  if (product.type === 'swap' && product.fixedPrice !== undefined) {
    return (product.fixedPrice - clearingPrice) * product.coveredGWh * 1000;
  }
  return 0;
}

function calcScenarioResult(
  scenario: Scenario,
  selectedProducts: HedgeProduct[],
): ScenarioResult {
  const unhedgedCost = TOTAL_LOAD * 1000 * scenario.clearingPrice; // GWh->MWh
  const retailRevenue = TOTAL_LOAD * 1000 * RETAIL_PRICE;
  const unhedgedProfit = retailRevenue - unhedgedCost;

  const hedgePayouts = selectedProducts.map((p) => ({
    productId: p.id,
    payout: calcHedgePayout(p, scenario.clearingPrice),
  }));
  const totalPremiums = selectedProducts.reduce((s, p) => s + p.premium, 0);
  const totalPayouts = hedgePayouts.reduce((s, h) => s + h.payout, 0);
  const hedgedProfit = unhedgedProfit + totalPayouts - totalPremiums;

  return {
    scenario,
    unhedgedCost,
    retailRevenue,
    unhedgedProfit,
    hedgePayouts,
    totalPremiums,
    totalPayouts,
    hedgedProfit,
  };
}

/** Brute-force optimal portfolio from all 2^5 subsets within budget */
function findOptimalPortfolio(): { products: HedgeProduct[]; ev: number } {
  let bestEV = -Infinity;
  let bestProducts: HedgeProduct[] = [];

  const n = HEDGE_PRODUCTS.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    const selected: HedgeProduct[] = [];
    let cost = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        selected.push(HEDGE_PRODUCTS[i]);
        cost += HEDGE_PRODUCTS[i].premium;
      }
    }
    if (cost > HEDGING_BUDGET) continue;

    let ev = 0;
    for (const scenario of SCENARIOS) {
      const result = calcScenarioResult(scenario, selected);
      ev += result.hedgedProfit * scenario.probability;
    }
    if (ev > bestEV) {
      bestEV = ev;
      bestProducts = selected;
    }
  }

  return { products: bestProducts, ev: bestEV };
}

// ─── Icon Components ────────────────────────────────────────────────────────

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function DoubleShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-1.892 1.476-4.246 2.463-6.825 2.756" opacity={0.4} />
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
    </svg>
  );
}

function ArrowsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function getProductIcon(icon: string, className?: string) {
  switch (icon) {
    case 'shield': return <ShieldIcon className={className} />;
    case 'shield-double': return <DoubleShieldIcon className={className} />;
    case 'fire': return <FireIcon className={className} />;
    case 'arrows': return <ArrowsIcon className={className} />;
    case 'clock': return <ClockIcon className={className} />;
    default: return <ShieldIcon className={className} />;
  }
}

function getColorClasses(color: string) {
  const map: Record<string, { border: string; bg: string; text: string; ring: string; hoverBorder: string; glow: string }> = {
    blue:    { border: 'border-blue-500/30',    bg: 'bg-blue-500/10',    text: 'text-blue-400',    ring: 'ring-blue-500/40',    hoverBorder: 'hover:border-blue-400/60',    glow: 'shadow-blue-500/20' },
    indigo:  { border: 'border-indigo-500/30',  bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  ring: 'ring-indigo-500/40',  hoverBorder: 'hover:border-indigo-400/60',  glow: 'shadow-indigo-500/20' },
    orange:  { border: 'border-orange-500/30',  bg: 'bg-orange-500/10',  text: 'text-orange-400',  ring: 'ring-orange-500/40',  hoverBorder: 'hover:border-orange-400/60',  glow: 'shadow-orange-500/20' },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/40', hoverBorder: 'hover:border-emerald-400/60', glow: 'shadow-emerald-500/20' },
    purple:  { border: 'border-purple-500/30',  bg: 'bg-purple-500/10',  text: 'text-purple-400',  ring: 'ring-purple-500/40',  hoverBorder: 'hover:border-purple-400/60',  glow: 'shadow-purple-500/20' },
    amber:   { border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   text: 'text-amber-400',   ring: 'ring-amber-500/40',   hoverBorder: 'hover:border-amber-400/60',   glow: 'shadow-amber-500/20' },
    red:     { border: 'border-red-500/30',     bg: 'bg-red-500/10',     text: 'text-red-400',     ring: 'ring-red-500/40',     hoverBorder: 'hover:border-red-400/60',     glow: 'shadow-red-500/20' },
  };
  return map[color] || map.blue;
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function CapDiagram() {
  const barData = [
    { price: 30, label: '$30' },
    { price: 60, label: '$60' },
    { price: 100, label: '$100' },
    { price: 160, label: '$160' },
  ];
  const strike = 80;
  const maxPrice = 180;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <div className="text-sm font-semibold text-white mb-1">Cap Contract</div>
      <div className="text-xs text-navy-400 mb-3">Pays out when clearing price exceeds the strike price</div>
      <div className="relative h-36 flex items-end gap-2 pl-8">
        {/* Y-axis label */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-navy-500 pr-1">
          <span>${maxPrice}</span>
          <span>${strike}</span>
          <span>$0</span>
        </div>
        {/* Strike line */}
        <div
          className="absolute left-8 right-0 border-t-2 border-dashed border-amber-500/60"
          style={{ bottom: `${(strike / maxPrice) * 100}%` }}
        >
          <span className="absolute -top-4 right-0 text-[9px] text-amber-400 font-medium">Strike ${strike}</span>
        </div>
        {/* Bars */}
        {barData.map((d, i) => {
          const heightPct = (d.price / maxPrice) * 100;
          const aboveStrike = Math.max(d.price - strike, 0);
          const abovePct = (aboveStrike / maxPrice) * 100;
          const belowPct = heightPct - abovePct;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="w-full max-w-[36px] flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                {abovePct > 0 && (
                  <div
                    className="bg-green-500/70 rounded-t-sm border border-green-400/40"
                    style={{ height: `${(abovePct / heightPct) * 100}%` }}
                  />
                )}
                <div
                  className="bg-navy-600/60 rounded-b-sm border border-white/10"
                  style={{ height: `${(belowPct / heightPct) * 100}%` }}
                />
              </div>
              <div className="text-[9px] text-navy-400 mt-1">{d.label}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500/70" /> Payout zone</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-navy-600/60" /> No payout</span>
      </div>
    </div>
  );
}

function SwapDiagram() {
  const fixedPrice = 55;
  const scenarios = [
    { clearing: 30, label: '$30' },
    { clearing: 55, label: '$55' },
    { clearing: 80, label: '$80' },
    { clearing: 130, label: '$130' },
  ];
  const maxVal = 80;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <div className="text-sm font-semibold text-white mb-1">Swap Contract</div>
      <div className="text-xs text-navy-400 mb-3">Settlement = (fixed - clearing) x MW. Can be positive or negative.</div>
      <div className="relative h-36 flex items-end gap-2 pl-8">
        {/* Y-axis */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-navy-500 pr-1">
          <span>+${maxVal}</span>
          <span>$0</span>
          <span>-${maxVal}</span>
        </div>
        {/* Zero line */}
        <div className="absolute left-8 right-0 border-t border-white/20" style={{ top: '50%' }} />
        {/* Bars */}
        {scenarios.map((s, i) => {
          const settlement = fixedPrice - s.clearing;
          const barPct = Math.min(Math.abs(settlement) / maxVal, 1) * 50; // % of half-height
          const isPositive = settlement >= 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-[36px] relative" style={{ height: '100%' }}>
                  {isPositive ? (
                    <div
                      className="absolute left-0 right-0 bg-green-500/70 rounded-t-sm border border-green-400/40"
                      style={{ bottom: '50%', height: `${barPct}%` }}
                    />
                  ) : (
                    <div
                      className="absolute left-0 right-0 bg-red-500/70 rounded-b-sm border border-red-400/40"
                      style={{ top: '50%', height: `${barPct}%` }}
                    />
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 text-[9px] text-navy-400">{s.label}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500/70" /> You receive</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/70" /> You pay</span>
        <span className="text-navy-500">Fixed: ${fixedPrice}/MWh</span>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  isSelected,
  canAfford,
  onToggle,
}: {
  product: HedgeProduct;
  isSelected: boolean;
  canAfford: boolean;
  onToggle: () => void;
}) {
  const colors = getColorClasses(product.color);
  const disabled = !isSelected && !canAfford;

  return (
    <motion.button
      onClick={disabled ? undefined : onToggle}
      className={`
        relative text-left w-full rounded-xl border p-4 transition-all duration-200 overflow-hidden
        ${isSelected
          ? `${colors.border} ${colors.bg} ring-2 ${colors.ring}`
          : disabled
            ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
            : `border-white/10 bg-white/[0.03] ${colors.hoverBorder} hover:bg-white/[0.05] cursor-pointer`
        }
      `}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      layout
    >
      {/* Selected check */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
          {getProductIcon(product.icon, `w-5 h-5 ${colors.text}`)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm font-bold ${colors.text}`}>{product.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-navy-300 font-medium uppercase tracking-wide">
              {product.type}
            </span>
          </div>
          <p className="text-xs text-navy-400 leading-relaxed mb-2">{product.description}</p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <div className="text-navy-500 mb-0.5">
                {product.type === 'cap' ? 'Strike' : 'Fixed'}
              </div>
              <div className="text-white font-mono font-semibold">
                ${product.type === 'cap' ? product.strike : product.fixedPrice}/MWh
              </div>
            </div>
            <div>
              <div className="text-navy-500 mb-0.5">Premium</div>
              <div className="text-white font-mono font-semibold">{formatDollars(product.premium)}</div>
            </div>
            <div>
              <div className="text-navy-500 mb-0.5">Coverage</div>
              <div className="text-white font-mono font-semibold">{product.coveredGWh} GWh</div>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function AnimatedBar({
  value,
  maxValue,
  color,
  label,
  delay = 0,
}: {
  value: number;
  maxValue: number;
  color: string;
  label: string;
  delay?: number;
}) {
  const pct = Math.min(Math.abs(value) / maxValue * 100, 100);
  const isNegative = value < 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-navy-300">{label}</span>
        <span className={`font-mono font-bold ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
          {formatDollarsFull(value)}
        </span>
      </div>
      <div className="h-6 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isNegative
              ? 'bg-gradient-to-r from-red-600 to-red-500'
              : `bg-gradient-to-r ${
                  color === 'green' ? 'from-green-600 to-green-400'
                  : color === 'blue' ? 'from-blue-600 to-blue-400'
                  : 'from-amber-600 to-amber-400'
                }`
          }`}
        />
      </div>
    </div>
  );
}

function SpinnerReveal({
  scenarios,
  selectedIndex,
  onComplete,
}: {
  scenarios: Scenario[];
  selectedIndex: number;
  onComplete: () => void;
}) {
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [speed, setSpeed] = useState(80);

  useState(() => {
    let step = 0;
    let currentSpeed = 80;
    const totalSteps = 20 + selectedIndex; // Ensure we land on the right one

    const tick = () => {
      if (step >= totalSteps) {
        setIsSpinning(false);
        setTimeout(onComplete, 800);
        return;
      }
      setCurrentHighlight((prev) => (prev + 1) % scenarios.length);
      step++;
      // Decelerate
      if (step > totalSteps - 8) {
        currentSpeed = currentSpeed + 60;
      } else if (step > totalSteps - 14) {
        currentSpeed = currentSpeed + 20;
      }
      setSpeed(currentSpeed);
      setTimeout(tick, currentSpeed);
    };

    setTimeout(tick, currentSpeed);
  });

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-sm text-navy-400 uppercase tracking-widest mb-2">
          {isSpinning ? 'Determining market conditions...' : 'Market outcome revealed!'}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((s, i) => {
          const colors = getColorClasses(s.color);
          const isHighlighted = currentHighlight === i;
          const isFinal = !isSpinning && currentHighlight === i;
          return (
            <motion.div
              key={s.id}
              animate={{
                scale: isHighlighted ? 1.05 : 1,
                opacity: isSpinning ? (isHighlighted ? 1 : 0.4) : (isFinal ? 1 : 0.25),
              }}
              transition={{ duration: 0.15 }}
              className={`
                rounded-xl border p-4 text-center transition-all
                ${isFinal ? `${colors.border} ${colors.bg} ring-2 ${colors.ring}` : 'border-white/10 bg-white/[0.03]'}
              `}
            >
              <div className={`text-lg font-bold ${isFinal ? colors.text : 'text-white'}`}>{s.label}</div>
              <div className="text-xs text-navy-400 mt-1">{s.description}</div>
              <div className={`text-2xl font-mono font-bold mt-2 ${isFinal ? colors.text : 'text-white'}`}>
                ${s.clearingPrice}/MWh
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function HedgingMinigame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('INTRO');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revealedScenarioIndex, setRevealedScenarioIndex] = useState<number | null>(null);
  const [spinnerDone, setSpinnerDone] = useState(false);

  // Derived
  const selectedProducts = useMemo(
    () => HEDGE_PRODUCTS.filter((p) => selectedIds.has(p.id)),
    [selectedIds],
  );

  const totalPremiums = useMemo(
    () => selectedProducts.reduce((s, p) => s + p.premium, 0),
    [selectedProducts],
  );

  const remainingBudget = HEDGING_BUDGET - totalPremiums;

  const toggleProduct = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // All scenario results
  const allResults = useMemo(
    () => SCENARIOS.map((s) => calcScenarioResult(s, selectedProducts)),
    [selectedProducts],
  );

  const unhedgedEV = useMemo(
    () => SCENARIOS.reduce((sum, s) => {
      const result = calcScenarioResult(s, []);
      return sum + result.unhedgedProfit * s.probability;
    }, 0),
    [],
  );

  const hedgedEV = useMemo(
    () => allResults.reduce((sum, r) => sum + r.hedgedProfit * r.scenario.probability, 0),
    [allResults],
  );

  const optimal = useMemo(() => findOptimalPortfolio(), []);

  const handleStartDecide = useCallback(() => {
    setSelectedIds(new Set());
    setRevealedScenarioIndex(null);
    setSpinnerDone(false);
    setPhase('DECIDE');
  }, []);

  const handleConfirmHedges = useCallback(() => {
    // Pick random scenario weighted by probability
    const rand = Math.random();
    let cum = 0;
    let idx = 0;
    for (let i = 0; i < SCENARIOS.length; i++) {
      cum += SCENARIOS[i].probability;
      if (rand <= cum) {
        idx = i;
        break;
      }
    }
    setRevealedScenarioIndex(idx);
    setSpinnerDone(false);
    setPhase('REVEAL');
  }, []);

  const handleSpinnerDone = useCallback(() => {
    setSpinnerDone(true);
  }, []);

  // ─── Render Phases ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-navy-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-electric-400 hover:text-electric-300 text-sm font-medium transition-colors"
          >
            &larr; Back to Home
          </button>
          <span className="text-navy-400 text-xs font-mono tracking-wide">HEDGING CHALLENGE</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-16">
        <AnimatePresence mode="wait">
          {/* ── INTRO Phase ─────────────────────────────────────────── */}
          {phase === 'INTRO' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mb-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-500/20 to-purple-500/20 border border-electric-500/30 flex items-center justify-center">
                    <ShieldIcon className="w-8 h-8 text-electric-400" />
                  </div>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Hedging in Electricity Markets
                </h1>
                <p className="text-navy-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                  Electricity retailers buy power at volatile wholesale prices but sell to customers at
                  fixed retail rates. Hedging contracts help manage this price risk &mdash; but they come at a cost.
                </p>
              </div>

              {/* Contract Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Cap Contract */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <div className="bg-white/[0.03] border border-blue-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <ShieldIcon className="w-4 h-4 text-blue-400" />
                      </div>
                      <h3 className="text-base font-bold text-blue-400">Cap Contracts</h3>
                    </div>
                    <p className="text-xs text-navy-300 leading-relaxed mb-3">
                      Insurance against high prices. You pay an upfront premium for the right to be
                      compensated when the clearing price exceeds a &ldquo;strike&rdquo; price.
                    </p>
                    <div className="bg-navy-900/50 rounded-lg p-3 font-mono text-[11px] text-navy-300">
                      <div className="text-blue-400 mb-1">// Cap Payout Formula</div>
                      <div>payout = max(clearingPrice - strike, 0)</div>
                      <div className="pl-10">&times; covered MW</div>
                    </div>
                    <div className="mt-3 text-[10px] text-navy-500">
                      If clearing = $120 and strike = $80, you get ($120 - $80) per MWh covered.
                    </div>
                  </div>
                </motion.div>

                {/* Swap Contract */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div className="bg-white/[0.03] border border-emerald-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <ArrowsIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="text-base font-bold text-emerald-400">Swap Contracts</h3>
                    </div>
                    <p className="text-xs text-navy-300 leading-relaxed mb-3">
                      Locks in a fixed price. If the clearing price goes above your fixed price,
                      you receive money. If it drops below, you pay the difference.
                    </p>
                    <div className="bg-navy-900/50 rounded-lg p-3 font-mono text-[11px] text-navy-300">
                      <div className="text-emerald-400 mb-1">// Swap Settlement Formula</div>
                      <div>settlement = (fixedPrice - clearingPrice)</div>
                      <div className="pl-14">&times; covered MW</div>
                    </div>
                    <div className="mt-3 text-[10px] text-navy-500">
                      If fixed = $55 and clearing = $80, you receive ($55 - $80) = -$25 per MWh (you pay).
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Visual Diagrams */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
              >
                <CapDiagram />
                <SwapDiagram />
              </motion.div>

              {/* Key Insight */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="bg-gradient-to-r from-electric-500/10 to-purple-500/10 border border-electric-500/20 rounded-xl p-5 mb-8 text-center"
              >
                <div className="text-sm font-semibold text-electric-300 mb-1">The Hedging Dilemma</div>
                <p className="text-xs text-navy-300 max-w-xl mx-auto leading-relaxed">
                  Hedging costs money upfront and can reduce profits in mild scenarios.
                  But without hedging, a single extreme price event can wipe out an entire year&apos;s margin.
                  Can you find the right balance?
                </p>
              </motion.div>

              {/* Start Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="text-center"
              >
                <motion.button
                  onClick={handleStartDecide}
                  className="px-8 py-4 bg-gradient-to-r from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500 text-white font-bold text-base rounded-xl shadow-lg shadow-electric-500/25 transition-all"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Hedging Challenge
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ── DECIDE Phase ────────────────────────────────────────── */}
          {phase === 'DECIDE' && (
            <motion.div
              key="decide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Situation Briefing */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Your Situation</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-[10px] text-navy-500 uppercase tracking-wider mb-1">Customers</div>
                    <div className="text-xl font-mono font-bold text-white">{(CUSTOMER_COUNT / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-navy-500 uppercase tracking-wider mb-1">Retail Price</div>
                    <div className="text-xl font-mono font-bold text-electric-400">${RETAIL_PRICE}/MWh</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-navy-500 uppercase tracking-wider mb-1">Annual Load</div>
                    <div className="text-xl font-mono font-bold text-white">{TOTAL_LOAD} GWh</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-navy-500 uppercase tracking-wider mb-1">Retail Revenue</div>
                    <div className="text-xl font-mono font-bold text-green-400">{formatDollars(TOTAL_LOAD * 1000 * RETAIL_PRICE)}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-navy-400 text-center">
                  You must buy wholesale electricity to serve your customers. Market prices are uncertain.
                </div>
              </div>

              {/* Budget Bar */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Hedging Budget</span>
                  <span className={`font-mono text-sm font-bold ${remainingBudget < 0 ? 'text-red-400' : remainingBudget === 0 ? 'text-amber-400' : 'text-green-400'}`}>
                    {formatDollars(remainingBudget)} remaining
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-colors ${
                      remainingBudget < 0 ? 'bg-red-500'
                      : remainingBudget < 1_000_000 ? 'bg-amber-500'
                      : 'bg-electric-500'
                    }`}
                    animate={{ width: `${Math.max(0, Math.min(100, ((HEDGING_BUDGET - remainingBudget) / HEDGING_BUDGET) * 100))}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-navy-500">
                  <span>$0</span>
                  <span>{formatDollars(HEDGING_BUDGET)} total</span>
                </div>
              </div>

              {/* Product Cards */}
              <div className="mb-4">
                <h3 className="text-base font-bold text-white mb-3">Available Hedge Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HEDGE_PRODUCTS.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSelected={selectedIds.has(product.id)}
                      canAfford={remainingBudget >= product.premium}
                      onToggle={() => toggleProduct(product.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Selected Summary */}
              {selectedProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white/[0.03] border border-electric-500/20 rounded-xl p-4 mb-6"
                >
                  <div className="text-sm font-semibold text-electric-300 mb-2">Your Portfolio</div>
                  <div className="space-y-1.5">
                    {selectedProducts.map((p) => {
                      const colors = getColorClasses(p.color);
                      return (
                        <div key={p.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${colors.bg} ring-1 ${colors.ring}`} />
                            <span className="text-navy-300">{p.name}</span>
                          </div>
                          <span className="text-navy-400 font-mono">{formatDollars(p.premium)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-xs">
                    <span className="text-navy-400">Total Premiums</span>
                    <span className="text-white font-mono font-semibold">{formatDollars(totalPremiums)}</span>
                  </div>
                </motion.div>
              )}

              {/* Scenarios Preview */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6">
                <div className="text-sm font-semibold text-white mb-2">Possible Market Scenarios</div>
                <div className="text-xs text-navy-400 mb-3">
                  One of these will be randomly selected to determine the year&apos;s outcome.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SCENARIOS.map((s) => {
                    const colors = getColorClasses(s.color);
                    return (
                      <div key={s.id} className={`rounded-lg border ${colors.border} ${colors.bg} p-3 text-center`}>
                        <div className={`text-xs font-bold ${colors.text} mb-0.5`}>{s.label}</div>
                        <div className="text-[10px] text-navy-400 mb-1">{s.description}</div>
                        <div className={`text-lg font-mono font-bold ${colors.text}`}>${s.clearingPrice}/MWh</div>
                        <div className="text-[10px] text-navy-500 mt-0.5">{Math.round(s.probability * 100)}% chance</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  onClick={() => setPhase('INTRO')}
                  className="px-5 py-2.5 text-sm font-medium text-navy-300 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleConfirmHedges}
                  className="px-8 py-3 bg-gradient-to-r from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-electric-500/25 transition-all"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selectedProducts.length === 0 ? 'Go Unhedged' : `Confirm ${selectedProducts.length} Hedge${selectedProducts.length > 1 ? 's' : ''}`}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── REVEAL Phase ────────────────────────────────────────── */}
          {phase === 'REVEAL' && revealedScenarioIndex !== null && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Market Reveal</h2>
                <p className="text-sm text-navy-400">What happened in the electricity market this year?</p>
              </div>

              <SpinnerReveal
                scenarios={SCENARIOS}
                selectedIndex={revealedScenarioIndex}
                onComplete={handleSpinnerDone}
              />

              {/* Results after spinner */}
              <AnimatePresence>
                {spinnerDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-8"
                  >
                    {(() => {
                      const result = allResults[revealedScenarioIndex];
                      const maxBar = Math.max(
                        Math.abs(result.unhedgedProfit),
                        Math.abs(result.hedgedProfit),
                        1,
                      );
                      return (
                        <>
                          {/* Side by side comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Without Hedging */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                              <div className="text-xs text-navy-500 uppercase tracking-wider mb-1">Without Hedging</div>
                              <div className={`text-3xl font-mono font-bold ${result.unhedgedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatDollarsFull(result.unhedgedProfit)}
                              </div>
                              <div className="mt-3 space-y-2">
                                <AnimatedBar value={result.retailRevenue} maxValue={result.retailRevenue} color="blue" label="Revenue" delay={0.2} />
                                <AnimatedBar value={-result.unhedgedCost} maxValue={result.retailRevenue} color="green" label="Wholesale Cost" delay={0.4} />
                              </div>
                            </div>

                            {/* With Hedging */}
                            <div className={`bg-white/[0.03] border rounded-xl p-5 ${
                              result.hedgedProfit > result.unhedgedProfit ? 'border-green-500/30' : 'border-red-500/30'
                            }`}>
                              <div className="text-xs text-navy-500 uppercase tracking-wider mb-1">With Your Hedges</div>
                              <div className={`text-3xl font-mono font-bold ${result.hedgedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatDollarsFull(result.hedgedProfit)}
                              </div>
                              {selectedProducts.length > 0 ? (
                                <div className="mt-3 space-y-2">
                                  {result.hedgePayouts.map((hp, idx) => {
                                    const prod = HEDGE_PRODUCTS.find((p) => p.id === hp.productId);
                                    if (!prod) return null;
                                    return (
                                      <div key={hp.productId} className="flex items-center justify-between text-xs">
                                        <span className="text-navy-300">{prod.name}</span>
                                        <span className={`font-mono font-semibold ${hp.payout >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {hp.payout >= 0 ? '+' : ''}{formatDollarsFull(hp.payout)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  <div className="pt-2 border-t border-white/5 flex justify-between text-xs">
                                    <span className="text-navy-400">Premiums Paid</span>
                                    <span className="text-red-400 font-mono">-{formatDollarsFull(result.totalPremiums)}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-3 text-xs text-navy-500">No hedges selected &mdash; same as unhedged.</div>
                              )}
                            </div>
                          </div>

                          {/* Comparison Bar */}
                          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-6">
                            <div className="text-sm font-semibold text-white mb-3">Profit Comparison</div>
                            <div className="space-y-4">
                              <AnimatedBar
                                value={result.unhedgedProfit}
                                maxValue={maxBar}
                                color="amber"
                                label="Unhedged Profit"
                                delay={0.3}
                              />
                              <AnimatedBar
                                value={result.hedgedProfit}
                                maxValue={maxBar}
                                color="green"
                                label="Hedged Profit"
                                delay={0.5}
                              />
                            </div>
                            {result.hedgedProfit !== result.unhedgedProfit && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className={`mt-3 pt-3 border-t border-white/5 text-center text-sm font-semibold ${
                                  result.hedgedProfit > result.unhedgedProfit ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                Hedging {result.hedgedProfit > result.unhedgedProfit ? 'improved' : 'reduced'} your profit by{' '}
                                {formatDollarsFull(Math.abs(result.hedgedProfit - result.unhedgedProfit))}
                              </motion.div>
                            )}
                          </div>

                          <div className="text-center">
                            <motion.button
                              onClick={() => setPhase('RESULTS')}
                              className="px-8 py-3 bg-gradient-to-r from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-electric-500/25 transition-all"
                              whileHover={{ scale: 1.03, y: -1 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              View Full Analysis
                            </motion.button>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── RESULTS Phase ───────────────────────────────────────── */}
          {phase === 'RESULTS' && revealedScenarioIndex !== null && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Full Analysis</h2>
                <p className="text-sm text-navy-400">Performance across all market scenarios</p>
              </div>

              {/* All 3 Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {allResults.map((result, idx) => {
                  const isRevealed = idx === revealedScenarioIndex;
                  const colors = getColorClasses(result.scenario.color);
                  return (
                    <motion.div
                      key={result.scenario.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15, duration: 0.4 }}
                      className={`rounded-xl border p-4 ${
                        isRevealed
                          ? `${colors.border} ${colors.bg} ring-2 ${colors.ring}`
                          : 'border-white/10 bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-sm font-bold ${isRevealed ? colors.text : 'text-white'}`}>
                          {result.scenario.label}
                        </div>
                        {isRevealed && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white font-semibold uppercase tracking-wider">
                            Actual
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-navy-400 mb-1">{result.scenario.description}</div>
                      <div className={`text-lg font-mono font-bold ${isRevealed ? colors.text : 'text-navy-300'} mb-3`}>
                        ${result.scenario.clearingPrice}/MWh
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-navy-400">Unhedged</span>
                          <span className={`font-mono font-semibold ${result.unhedgedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatDollarsFull(result.unhedgedProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-navy-400">Hedged</span>
                          <span className={`font-mono font-semibold ${result.hedgedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatDollarsFull(result.hedgedProfit)}
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-white/5 flex justify-between text-[11px]">
                          <span className="text-navy-500">Difference</span>
                          <span className={`font-mono font-semibold ${
                            result.hedgedProfit - result.unhedgedProfit >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {result.hedgedProfit - result.unhedgedProfit >= 0 ? '+' : ''}
                            {formatDollarsFull(result.hedgedProfit - result.unhedgedProfit)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Expected Value Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-6"
              >
                <div className="text-sm font-semibold text-white mb-4">Expected Value (Probability-Weighted)</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-[10px] text-navy-500 uppercase tracking-wider mb-1">Unhedged EV</div>
                    <div className={`text-2xl font-mono font-bold ${unhedgedEV >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatDollarsFull(unhedgedEV)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-navy-500 uppercase tracking-wider mb-1">Your Hedged EV</div>
                    <div className={`text-2xl font-mono font-bold ${hedgedEV >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatDollarsFull(hedgedEV)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-navy-500 uppercase tracking-wider mb-1">EV Change</div>
                    {(() => {
                      const diff = hedgedEV - unhedgedEV;
                      const pctChange = unhedgedEV !== 0 ? (diff / Math.abs(unhedgedEV)) * 100 : 0;
                      return (
                        <div>
                          <div className={`text-2xl font-mono font-bold ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {diff >= 0 ? '+' : ''}{pctChange.toFixed(1)}%
                          </div>
                          <div className={`text-xs font-mono ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({diff >= 0 ? '+' : ''}{formatDollarsFull(diff)})
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>

              {/* Score Assessment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className={`rounded-xl border p-5 mb-6 ${
                  hedgedEV >= unhedgedEV
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {hedgedEV >= optimal.ev * 0.95
                      ? '&#9733;&#9733;&#9733;'
                      : hedgedEV >= optimal.ev * 0.7
                      ? '&#9733;&#9733;'
                      : hedgedEV >= unhedgedEV
                      ? '&#9733;'
                      : ''}
                  </div>
                  <div className="text-lg font-bold text-white mb-1">
                    {hedgedEV >= optimal.ev * 0.95
                      ? 'Excellent Hedging Strategy!'
                      : hedgedEV >= optimal.ev * 0.7
                      ? 'Good Hedging Strategy'
                      : hedgedEV >= unhedgedEV
                      ? 'Hedging Helped'
                      : 'Hedging Hurt This Time'}
                  </div>
                  <p className="text-xs text-navy-400 max-w-md mx-auto">
                    {hedgedEV >= optimal.ev * 0.95
                      ? 'Your portfolio is near-optimal. You balanced premium costs against downside protection expertly.'
                      : hedgedEV >= unhedgedEV
                      ? 'Your hedges improved expected value, but there is room to optimize your portfolio further.'
                      : 'Your hedge premiums outweighed the protection they provided. Consider different product combinations.'}
                  </p>
                </div>
              </motion.div>

              {/* Optimal Portfolio */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="bg-white/[0.03] border border-purple-500/20 rounded-xl p-5 mb-8"
              >
                <div className="text-sm font-semibold text-purple-400 mb-1">Optimal Portfolio</div>
                <div className="text-xs text-navy-400 mb-3">
                  The best combination within the $5M budget, maximising expected value across all scenarios.
                </div>
                {optimal.products.length === 0 ? (
                  <div className="text-xs text-navy-500">Going fully unhedged was optimal for these products and scenarios.</div>
                ) : (
                  <div className="space-y-1.5 mb-3">
                    {optimal.products.map((p) => {
                      const colors = getColorClasses(p.color);
                      return (
                        <div key={p.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${colors.bg} ring-1 ${colors.ring}`} />
                            <span className="text-navy-300">{p.name}</span>
                            <span className="text-navy-600">({p.type})</span>
                          </div>
                          <span className="text-navy-400 font-mono">{formatDollars(p.premium)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="pt-2 border-t border-white/5 flex justify-between text-xs">
                  <span className="text-navy-400">Optimal EV</span>
                  <span className="text-purple-400 font-mono font-semibold">{formatDollarsFull(optimal.ev)}</span>
                </div>
                {/* Show how yours compared */}
                {selectedProducts.length > 0 && (
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-navy-400">Your EV</span>
                    <span className={`font-mono font-semibold ${hedgedEV >= optimal.ev ? 'text-green-400' : 'text-amber-400'}`}>
                      {formatDollarsFull(hedgedEV)}
                      {optimal.ev !== 0 && (
                        <span className="text-navy-500 ml-1">
                          ({Math.round((hedgedEV / optimal.ev) * 100)}% of optimal)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="flex items-center justify-center gap-4"
              >
                <motion.button
                  onClick={handleStartDecide}
                  className="px-6 py-3 text-sm font-medium text-electric-300 border border-electric-500/30 hover:border-electric-400 hover:bg-electric-500/10 rounded-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Play Again
                </motion.button>
                <motion.button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 text-sm font-medium text-navy-300 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to Home
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
