/**
 * StrategyGuide — Full-screen presentation explaining each bidding strategy.
 * Follows the same multi-slide overlay pattern as RoundSummary / HowToBidTutorial.
 *
 * One slide per strategy, each showing:
 *  1) Concept explanation (what it is)
 *  2) Mock bidding UI showing example bids across asset types
 *  3) Why this strategy helps
 *  4) What you're relying on other teams to do
 *
 * Accessible from both team pages and the host dashboard.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSET_ICONS, ASSET_COLORS } from '../../lib/colors';
import { ASSET_TYPE_LABELS } from '../../../shared/types';
import type { AssetType } from '../../../shared/types';

interface StrategyGuideProps {
  onClose: () => void;
}

// ─── Strategy data for presentation ────────────────────────────────────

interface StrategySlide {
  id: string;
  name: string;
  icon: string;
  color: string;         // tailwind accent colour token
  tagline: string;
  conceptParagraphs: string[];
  /** Mock bids shown for each asset type — price per band + MW */
  mockBids: {
    assetType: AssetType;
    assetName: string;
    nameplateMW: number;
    srmcPerMWh: number;
    bands: { pricePerMWh: number; quantityMW: number; label?: string }[];
    note?: string;
  }[];
  whyItHelps: string[];
  gameTheory: {
    reliesOn: string;
    risk: string;
  };
  realWorldAnalogy: string;
}

const STRATEGY_SLIDES: StrategySlide[] = [
  // ─── 1. Price Taker ───────────────────────────────
  {
    id: 'price_taker',
    name: 'Price Taker',
    icon: '🟢',
    color: 'green',
    tagline: 'Bid low to guarantee dispatch — accept whatever the market pays',
    conceptParagraphs: [
      'A Price Taker bids all their capacity at or near $0/MWh. The goal is simple: get dispatched no matter what. You don\'t try to influence the clearing price — you accept it.',
      'This is how most renewable generators bid in real electricity markets. Wind and solar have zero fuel cost, so bidding at $0 ensures they run whenever the wind blows or the sun shines. The market clearing price is set by the most expensive generator needed to meet demand.',
      'Even though you bid $0, you get paid the clearing price — which could be $35, $150, or even $500/MWh depending on supply and demand. Your revenue depends entirely on what OTHER teams bid.',
    ],
    mockBids: [
      {
        assetType: 'coal',
        assetName: 'Coal Plant',
        nameplateMW: 800,
        srmcPerMWh: 35,
        bands: [{ pricePerMWh: 0, quantityMW: 800, label: 'All capacity at $0' }],
        note: 'Bids below marginal cost ($35) — guaranteed dispatch but risky if clearing price is low',
      },
      {
        assetType: 'gas_ccgt',
        assetName: 'Gas CCGT',
        nameplateMW: 350,
        srmcPerMWh: 75,
        bands: [{ pricePerMWh: 0, quantityMW: 350, label: 'All capacity at $0' }],
        note: 'Bids well below marginal cost ($75) — will lose money if price stays below $75',
      },
      {
        assetType: 'wind',
        assetName: 'Wind Farm',
        nameplateMW: 300,
        srmcPerMWh: 0,
        bands: [{ pricePerMWh: 0, quantityMW: 300, label: 'All capacity at $0' }],
        note: 'Zero fuel cost — bidding $0 is the natural strategy for wind',
      },
    ],
    whyItHelps: [
      'Guarantees your plant runs every period — maximum volume',
      'Perfect for renewables with zero fuel cost (nothing to lose)',
      'No risk of being "priced out" of the market',
      'In tight supply periods, you still earn a high clearing price',
    ],
    gameTheory: {
      reliesOn: 'You need OTHER teams to bid higher prices to set a profitable clearing price. If everyone bids $0, the clearing price is $0 and nobody covers their costs. Your strategy only works if some teams are Price Makers or bid at marginal cost.',
      risk: 'If the clearing price ends up below your actual marginal cost (e.g., $35 for coal), you lose money on every MWh dispatched. This strategy is safest for zero-fuel-cost renewables and risky for coal/gas.',
    },
    realWorldAnalogy: 'Most wind and solar farms in Australia bid at $0 or even negative prices. They rely on coal and gas generators bidding higher to set a profitable clearing price.',
  },

  // ─── 2. Marginal Cost Bidder ──────────────────────
  {
    id: 'srmc_bidder',
    name: 'Marginal Cost Bidder',
    icon: '🔵',
    color: 'blue',
    tagline: 'Bid at your actual cost of production — the textbook-rational strategy',
    conceptParagraphs: [
      'A Marginal Cost Bidder (also called SRMC Bidder) bids each asset at its Short-Run Marginal Cost — the actual cost of producing one more MWh of electricity. This is the "economically rational" baseline strategy.',
      'By bidding at cost, you ensure you only get dispatched when the clearing price covers your expenses. You won\'t lose money on any MWh, but you also won\'t earn big margins unless supply is tight.',
      'In competitive economic theory, if all firms bid at marginal cost, the market reaches an efficient outcome. This is the benchmark strategy that regulators hope generators follow.',
    ],
    mockBids: [
      {
        assetType: 'coal',
        assetName: 'Coal Plant',
        nameplateMW: 800,
        srmcPerMWh: 35,
        bands: [{ pricePerMWh: 35, quantityMW: 800, label: 'At marginal cost ($35)' }],
        note: 'Covers fuel + operating costs exactly. Dispatched only when price ≥ $35',
      },
      {
        assetType: 'gas_ccgt',
        assetName: 'Gas CCGT',
        nameplateMW: 350,
        srmcPerMWh: 75,
        bands: [{ pricePerMWh: 75, quantityMW: 350, label: 'At marginal cost ($75)' }],
        note: 'Higher fuel cost means higher bid. Only runs when needed in the merit order',
      },
      {
        assetType: 'gas_peaker',
        assetName: 'Gas Peaker',
        nameplateMW: 150,
        srmcPerMWh: 140,
        bands: [{ pricePerMWh: 140, quantityMW: 150, label: 'At marginal cost ($140)' }],
        note: 'Expensive to run — only dispatched during peak demand when prices are high',
      },
    ],
    whyItHelps: [
      'Never lose money — you only run when the price covers your costs',
      'Economically rational and defensible strategy',
      'Creates a natural merit order: cheapest plants run first',
      'Good baseline before learning more advanced strategies',
    ],
    gameTheory: {
      reliesOn: 'This works well regardless of what others do. However, if supply is loose (lots of $0 bids from renewables), your thermal plants may not get dispatched at all. You earn the most when supply is tight — but you don\'t push prices up yourself.',
      risk: 'You miss opportunities. In tight supply periods where the clearing price is $300+, your coal at $35 earns a huge margin but you don\'t capture any extra by bidding higher. The upside goes to whoever set the high clearing price.',
    },
    realWorldAnalogy: 'This is what regulators expect in a "perfectly competitive" market. In practice, generators often bid slightly above marginal cost to account for start-up costs and risk.',
  },

  // ─── 3. Price Maker ───────────────────────────────
  {
    id: 'price_maker',
    name: 'Price Maker',
    icon: '🟠',
    color: 'amber',
    tagline: 'Split your capacity to guarantee some dispatch while pushing the clearing price higher',
    conceptParagraphs: [
      'A Price Maker splits their capacity into two bid bands: a cheap "dispatch band" and an expensive "price-setting band". The cheap band ensures some of your plant runs, while the high-priced band tries to be the marginal generator that sets the clearing price.',
      'This is the most common strategic bidding approach in real electricity markets. Generators with market power use it to earn above-cost returns, especially during peak demand when every MW is needed.',
      'The key insight: if your expensive band sets the clearing price at $300, ALL your dispatched capacity (including the cheap band) earns $300/MWh. One high bid lifts the revenue of everything below it.',
    ],
    mockBids: [
      {
        assetType: 'coal',
        assetName: 'Coal Plant',
        nameplateMW: 800,
        srmcPerMWh: 35,
        bands: [
          { pricePerMWh: 30, quantityMW: 480, label: 'Band 1: Cheap — guaranteed dispatch' },
          { pricePerMWh: 300, quantityMW: 320, label: 'Band 2: High — aims to set price' },
        ],
        note: '60% at $30 (below SRMC for certainty), 40% at $300 to push clearing price up',
      },
      {
        assetType: 'gas_ccgt',
        assetName: 'Gas CCGT',
        nameplateMW: 350,
        srmcPerMWh: 75,
        bands: [
          { pricePerMWh: 70, quantityMW: 210, label: 'Band 1: Near SRMC' },
          { pricePerMWh: 300, quantityMW: 140, label: 'Band 2: Price-setting' },
        ],
        note: 'Same split approach — cheap band for volume, expensive band for price influence',
      },
      {
        assetType: 'wind',
        assetName: 'Wind Farm',
        nameplateMW: 300,
        srmcPerMWh: 0,
        bands: [{ pricePerMWh: 0, quantityMW: 300, label: 'Renewables still bid $0' }],
        note: 'No fuel cost — always bid $0. Benefits from high clearing prices set by others',
      },
    ],
    whyItHelps: [
      'The cheap band guarantees baseline dispatch revenue',
      'The expensive band can set a high clearing price that benefits ALL your dispatched capacity',
      'Adapts well to different market conditions — more aggressive in tight supply',
      'Mimics how real Australian generators actually bid in the NEM',
    ],
    gameTheory: {
      reliesOn: 'You need demand to be tight enough that your high-priced band gets dispatched. If there\'s abundant cheap supply (lots of renewables + price takers), your $300 band sits idle. Works best when multiple teams adopt this approach — prices rise together. But if TOO many teams do it, demand may not be enough to reach the expensive bands.',
      risk: 'If other teams undercut you with cheaper bids, your high band doesn\'t dispatch and you earn less than a simple marginal-cost approach. Over-bidding risks being priced out entirely.',
    },
    realWorldAnalogy: 'AGL, Origin, and EnergyAustralia regularly split their coal and gas bids in the NEM. Their low bands ensure "must-run" generation, while high bands target price spikes during heatwaves.',
  },

  // ─── 4. Portfolio Optimizer ───────────────────────
  {
    id: 'portfolio_optimizer',
    name: 'Portfolio Optimizer',
    icon: '🟣',
    color: 'purple',
    tagline: 'Each asset type plays its optimal role — like a real "gentailer" portfolio',
    conceptParagraphs: [
      'A Portfolio Optimizer treats each asset type differently based on its characteristics. Renewables bid at $0, coal splits into bands, gas CCGT bids at mid-merit, peakers target price spikes, and batteries arbitrage between off-peak and peak.',
      'This mirrors how real "gentailers" (generator-retailers) like AGL and Origin manage their diverse fleets. Each asset has a role: baseload for volume, peakers for margin, renewables for zero-cost infra-marginal profit.',
      'The hydro asset adds another dimension — it has limited storage (water), so you bid higher during peaks when the value is greatest and conserve water during off-peak periods.',
    ],
    mockBids: [
      {
        assetType: 'coal',
        assetName: 'Coal Plant',
        nameplateMW: 800,
        srmcPerMWh: 35,
        bands: [
          { pricePerMWh: 18, quantityMW: 520, label: 'Band 1: Low for baseload volume' },
          { pricePerMWh: 63, quantityMW: 280, label: 'Band 2: Above SRMC for margin' },
        ],
        note: '65% cheap for guaranteed baseload dispatch, 35% above SRMC',
      },
      {
        assetType: 'gas_ccgt',
        assetName: 'Gas CCGT',
        nameplateMW: 350,
        srmcPerMWh: 75,
        bands: [{ pricePerMWh: 75, quantityMW: 350, label: 'At SRMC — mid-merit role' }],
        note: 'Mid-merit: bids at cost, dispatched when coal isn\'t enough',
      },
      {
        assetType: 'gas_peaker',
        assetName: 'Gas Peaker',
        nameplateMW: 150,
        srmcPerMWh: 140,
        bands: [{ pricePerMWh: 300, quantityMW: 150, label: 'Premium price — peak only' }],
        note: 'Peak-shaving role: only runs when prices are very high',
      },
      {
        assetType: 'hydro',
        assetName: 'Hydro (Peak)',
        nameplateMW: 250,
        srmcPerMWh: 8,
        bands: [{ pricePerMWh: 120, quantityMW: 250, label: 'High value — save water for peaks' }],
        note: 'Despite low marginal cost, bids high due to water opportunity cost',
      },
      {
        assetType: 'wind',
        assetName: 'Wind Farm',
        nameplateMW: 300,
        srmcPerMWh: 0,
        bands: [{ pricePerMWh: 0, quantityMW: 300, label: 'Zero cost — always dispatch' }],
      },
      {
        assetType: 'battery',
        assetName: 'Battery (Peak)',
        nameplateMW: 150,
        srmcPerMWh: 0,
        bands: [{ pricePerMWh: 250, quantityMW: 150, label: 'Discharge at premium' }],
        note: 'Charges off-peak at $0, discharges during peaks at premium',
      },
    ],
    whyItHelps: [
      'Maximises the value of each asset type\'s unique characteristics',
      'Diversified approach — not relying on a single strategy',
      'Hydro and battery storage earn peak premiums with low costs',
      'Renewable fleet provides cost-free volume that benefits from higher clearing prices',
      'Mimics how Australia\'s largest energy companies actually operate',
    ],
    gameTheory: {
      reliesOn: 'Works best when the market has diverse demand periods (off-peak vs peak). Your peakers and batteries need high-price periods to earn their keep. If supply is so abundant that peak prices stay low, your peaker and battery premium bids may not dispatch. A balanced market with real supply tension rewards this approach.',
      risk: 'Complexity is the risk — you need the right conditions for each asset. If there\'s a dunkelflaute (no wind/solar), your zero-cost renewable strategy produces nothing. If peaks aren\'t tight, your peaker and battery premiums go to waste.',
    },
    realWorldAnalogy: 'AGL Energy operates exactly this way: Bayswater coal for baseload, Torrens Island gas for mid-merit, Broken Hill solar at $0, and the Torrens Island battery for peak arbitrage.',
  },

  // ─── 5. Capacity Repricing ──────────────────────
  {
    id: 'capacity_repricing',
    name: 'Capacity Repricing',
    icon: '🔴',
    color: 'red',
    tagline: 'Rebid capacity to higher price bands to tighten effective supply and influence clearing prices',
    conceptParagraphs: [
      'Capacity Repricing is the most aggressive rebidding strategy. You shift a portion of your capacity to the market price cap ($20,000/MWh) — making it unlikely to be dispatched. This tightens the effective supply-demand balance and pushes clearing prices higher for your remaining dispatched capacity.',
      'The economics are simple: if repricing 200 MW to the cap raises the clearing price from $50 to $200/MWh, and your remaining 600 MW dispatches at $200 instead of $50, you earn $120,000 instead of $30,000 — even though you produced less.',
      'In the NEM, rebidding volumes between price bands is a legitimate market mechanism. However, the AER monitors for patterns of "economic withholding" — where generators reprice capacity significantly above cost to exercise market power. Sustained patterns during scarcity attract regulatory scrutiny.',
    ],
    mockBids: [
      {
        assetType: 'coal',
        assetName: 'Coal Plant',
        nameplateMW: 800,
        srmcPerMWh: 35,
        bands: [
          { pricePerMWh: 35, quantityMW: 560, label: 'Band 1: At SRMC — stays in merit order' },
          { pricePerMWh: 20000, quantityMW: 240, label: 'Band 2: Repriced to cap — unlikely to dispatch' },
        ],
        note: '70% bid at cost, 30% repriced to the $20,000 market cap',
      },
      {
        assetType: 'gas_ccgt',
        assetName: 'Gas CCGT',
        nameplateMW: 350,
        srmcPerMWh: 75,
        bands: [
          { pricePerMWh: 75, quantityMW: 245, label: 'Band 1: At SRMC' },
          { pricePerMWh: 20000, quantityMW: 105, label: 'Band 2: Repriced to cap' },
        ],
        note: '30% of gas capacity also repriced to amplify the effect',
      },
      {
        assetType: 'wind',
        assetName: 'Wind Farm',
        nameplateMW: 300,
        srmcPerMWh: 0,
        bands: [{ pricePerMWh: 0, quantityMW: 300, label: 'Renewables still bid $0' }],
        note: 'Only thermal capacity is repriced — renewables always bid in',
      },
    ],
    whyItHelps: [
      'Dramatically tightens effective supply, pushing clearing prices much higher',
      'Your remaining dispatched capacity earns a much larger margin per MWh',
      'Can be more profitable than running 100% at lower prices',
      'Most effective during already-tight supply periods (heatwaves, outages)',
    ],
    gameTheory: {
      reliesOn: 'This ONLY works if supply was already somewhat tight. If there\'s abundant spare capacity from other teams, repricing your MW has no effect — someone else fills the gap. You need the market to be near the tipping point where every MW matters. It\'s most powerful when MULTIPLE teams coordinate (even implicitly) to reprice.',
      risk: 'High risk. If other teams flood the market with cheap capacity, your repriced MW earns nothing AND you dispatched less volume. The AER monitors for economic withholding in real markets. Other teams may retaliate by bidding aggressively cheap to undercut you.',
    },
    realWorldAnalogy: 'The AER\'s Wholesale Electricity Market Performance Reports track patterns of economic withholding — where generators reprice capacity significantly above cost during scarcity. The ACCC has investigated instances where generators repriced capacity during heatwaves, contributing to price spikes.',
  },

  // ─── 6. Battery Arbitrageur ───────────────────────
  {
    id: 'battery_arbitrageur',
    name: 'Battery Arbitrageur',
    icon: '🟡',
    color: 'yellow',
    tagline: 'Charge when power is cheap, discharge when it\'s expensive — pure time-shifting profit',
    conceptParagraphs: [
      'A Battery Arbitrageur focuses on exploiting price differences between time periods. Your 500 MW / 2,000 MWh battery (4-hour duration, 92% round-trip efficiency) toggles between charge and discharge modes each period. Charge during low-price off-peak periods and discharge during high-price peaks.',
      'Use the charge/discharge mode toggle to control your battery each period. In charge mode, the battery absorbs power from the grid — but beware: your 500 MW of charging ADDS to market demand, pushing the clearing price higher for everyone (including you). In discharge mode, it bids power into the market at a premium. Your arbitrage revenue is the spread between discharge earnings and charging cost, minus the 8% efficiency loss.',
      'This mirrors the business model of standalone battery projects like the Hornsdale Power Reserve ("Tesla Big Battery"). They don\'t generate power — they shift it in time from when it\'s cheap to when it\'s valuable. If multiple teams charge simultaneously, the combined load can spike prices dramatically.',
    ],
    mockBids: [
      {
        assetType: 'battery',
        assetName: 'Battery (Off-Peak) — CHARGE mode',
        nameplateMW: 500,
        srmcPerMWh: 0,
        bands: [{ pricePerMWh: 0, quantityMW: 500, label: 'Charging — absorbing 500 MW from grid' }],
        note: 'Off-peak: set mode to CHARGE. Battery draws 500 MW at market price, filling 2,000 MWh storage',
      },
      {
        assetType: 'battery',
        assetName: 'Battery (Peak) — DISCHARGE mode',
        nameplateMW: 500,
        srmcPerMWh: 0,
        bands: [{ pricePerMWh: 200, quantityMW: 500, label: 'Discharging 500 MW at $200 premium' }],
        note: 'Peak: set mode to DISCHARGE. 92% efficiency means 460 MW effective output. Profit = peak price minus charge cost',
      },
      {
        assetType: 'coal',
        assetName: 'Coal Plant',
        nameplateMW: 800,
        srmcPerMWh: 35,
        bands: [{ pricePerMWh: 35, quantityMW: 800, label: 'At marginal cost — steady base' }],
        note: 'Other assets bid at SRMC for reliable background revenue',
      },
      {
        assetType: 'wind',
        assetName: 'Wind Farm',
        nameplateMW: 300,
        srmcPerMWh: 0,
        bands: [{ pricePerMWh: 0, quantityMW: 300, label: 'Zero cost — always dispatch' }],
        note: 'Wind at $0 — helps create cheap off-peak charging opportunities',
      },
    ],
    whyItHelps: [
      'Captures the price spread between cheap off-peak and expensive peak periods',
      '500 MW / 2,000 MWh battery with 92% efficiency maximises arbitrage revenue potential',
      'Charge/discharge toggle gives direct control over battery behaviour each period',
      'Complements renewable generation (store excess solar, release in the evening)',
      'Low risk for the battery itself (buy cheap, sell dear)',
      'Other assets provide stable base revenue alongside battery arbitrage profits',
    ],
    gameTheory: {
      reliesOn: 'You need a significant price spread between off-peak and peak periods. If prices are flat (similar across all periods), there\'s no arbitrage opportunity. You need other teams to be bidding their thermal plants at moderate-to-high prices during peaks, creating the price differential your battery exploits.',
      risk: 'If too many batteries compete (multiple teams running this strategy), they flatten the price spread — buying at slightly higher off-peak prices and selling at slightly lower peak prices. Also, battery charging adds to market demand: if 3 teams charge 500 MW each, that\'s 1,500 MW of extra demand that can spike the very prices you\'re trying to buy cheap. Your charging cost eats into arbitrage revenue.',
    },
    realWorldAnalogy: 'The Hornsdale Power Reserve (150 MW / 194 MWh) in South Australia earns arbitrage revenue by charging from cheap wind power overnight and discharging during evening peaks. Newer projects like the Victorian Big Battery (300 MW / 450 MWh) follow the same model at larger scale, with round-trip efficiencies around 90-92%.',
  },
];

// ─── Component ──────────────────────────────────────────────────────────

const TOTAL_SLIDES = STRATEGY_SLIDES.length;

const STRATEGY_ACCENT: Record<string, {
  bgGradient: string;
  textColor: string;
  badgeBg: string;
  bandHighlight: string;
  ring: string;
}> = {
  green:  { bgGradient: 'from-green-600/20 to-emerald-600/10', textColor: 'text-green-400', badgeBg: 'bg-green-500/20 border-green-500/30', bandHighlight: 'bg-green-500/10 border-green-500/30', ring: 'ring-green-500/30' },
  blue:   { bgGradient: 'from-blue-600/20 to-cyan-600/10', textColor: 'text-blue-400', badgeBg: 'bg-blue-500/20 border-blue-500/30', bandHighlight: 'bg-blue-500/10 border-blue-500/30', ring: 'ring-blue-500/30' },
  amber:  { bgGradient: 'from-amber-600/20 to-orange-600/10', textColor: 'text-amber-400', badgeBg: 'bg-amber-500/20 border-amber-500/30', bandHighlight: 'bg-amber-500/10 border-amber-500/30', ring: 'ring-amber-500/30' },
  purple: { bgGradient: 'from-purple-600/20 to-violet-600/10', textColor: 'text-purple-400', badgeBg: 'bg-purple-500/20 border-purple-500/30', bandHighlight: 'bg-purple-500/10 border-purple-500/30', ring: 'ring-purple-500/30' },
  red:    { bgGradient: 'from-red-600/20 to-rose-600/10', textColor: 'text-red-400', badgeBg: 'bg-red-500/20 border-red-500/30', bandHighlight: 'bg-red-500/10 border-red-500/30', ring: 'ring-red-500/30' },
  yellow: { bgGradient: 'from-yellow-600/20 to-amber-600/10', textColor: 'text-yellow-400', badgeBg: 'bg-yellow-500/20 border-yellow-500/30', bandHighlight: 'bg-yellow-500/10 border-yellow-500/30', ring: 'ring-yellow-500/30' },
};

export default function StrategyGuide({ onClose }: StrategyGuideProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
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

  const goToSlide = useCallback((idx: number) => {
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
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

  const strategy = STRATEGY_SLIDES[currentSlide];
  const accent = STRATEGY_ACCENT[strategy.color] || STRATEGY_ACCENT.blue;

  return (
    <div className="fixed inset-0 z-[100] bg-navy-950 flex flex-col overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accent.bgGradient} pointer-events-none`} />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-white/10 bg-navy-950/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{strategy.icon}</span>
          <div>
            <div className="text-white font-bold text-lg leading-tight">{strategy.name}</div>
            <div className="text-navy-400 text-xs">Strategy {currentSlide + 1} of {TOTAL_SLIDES}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${accent.badgeBg} ${accent.textColor}`}>
            🧠 Strategy Guide
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg text-sm transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-5">
              {renderStrategySlide(strategy, accent)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-t border-white/10 bg-navy-950/80 backdrop-blur-sm">
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {/* Strategy Dots */}
        <div className="flex gap-2">
          {STRATEGY_SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToSlide(i)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                i === currentSlide
                  ? `bg-white/20 text-white font-medium ring-1 ${accent.ring}`
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
              }`}
              title={s.name}
            >
              <span>{s.icon}</span>
              <span className="hidden md:inline">{s.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentSlide === TOTAL_SLIDES - 1}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Slide Renderer ─────────────────────────────────────────────────────

function renderStrategySlide(
  strategy: StrategySlide,
  accent: typeof STRATEGY_ACCENT[string],
) {
  return (
    <div className="space-y-5">
      {/* Tagline */}
      <div className="text-center">
        <h2 className={`text-2xl md:text-3xl font-bold ${accent.textColor} mb-1`}>
          {strategy.icon} {strategy.name}
        </h2>
        <p className="text-lg text-white/70 max-w-3xl mx-auto">{strategy.tagline}</p>
      </div>

      {/* Two-column layout: Concept + Mock Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Left Column: Concept Explanation */}
        <div className="space-y-4">
          {/* Concept */}
          <div className="bg-navy-900/60 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-base">📖</span> The Concept
            </h3>
            <div className="space-y-3">
              {strategy.conceptParagraphs.map((p, i) => (
                <p key={i} className="text-sm text-navy-300 leading-relaxed">{p}</p>
              ))}
            </div>
          </div>

          {/* Why It Helps */}
          <div className="bg-navy-900/60 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-base">✅</span> Why This Strategy Helps
            </h3>
            <ul className="space-y-2">
              {strategy.whyItHelps.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy-300">
                  <span className={`mt-0.5 text-xs ${accent.textColor}`}>●</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Real World */}
          <div className="bg-navy-900/40 rounded-xl border border-white/5 p-4">
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-base">🌏</span> Real World
            </h3>
            <p className="text-sm text-navy-400 leading-relaxed italic">{strategy.realWorldAnalogy}</p>
          </div>
        </div>

        {/* Right Column: Mock Bidding UI + Game Theory */}
        <div className="space-y-4">
          {/* Mock Bidding UI */}
          <div className="bg-navy-900/60 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-base">🎯</span> Example Bids — What This Looks Like
            </h3>
            <div className="space-y-3">
              {strategy.mockBids.map((mock, i) => (
                <MockBidCard key={i} mock={mock} accent={accent} />
              ))}
            </div>
          </div>

          {/* Game Theory */}
          <div className="bg-navy-900/60 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-base">🎲</span> Game Theory — What Other Teams Need to Do
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">🤝</span>
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">Relies On</span>
                </div>
                <p className="text-sm text-navy-300 leading-relaxed">{strategy.gameTheory.reliesOn}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">⚠️</span>
                  <span className="text-xs font-semibold text-amber-400/80 uppercase tracking-wide">Risk</span>
                </div>
                <p className="text-sm text-amber-300/70 leading-relaxed">{strategy.gameTheory.risk}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mock Bid Card (simulates the bidding interface) ────────────────────

function MockBidCard({
  mock,
  accent,
}: {
  mock: StrategySlide['mockBids'][number];
  accent: typeof STRATEGY_ACCENT[string];
}) {
  const assetColor = ASSET_COLORS[mock.assetType] || '#4a5568';
  const assetIcon = ASSET_ICONS[mock.assetType] || '⚡';
  const totalOffered = mock.bands.reduce((s, b) => s + b.quantityMW, 0);

  return (
    <div
      className="rounded-lg border border-white/10 overflow-hidden"
      style={{ borderLeftColor: assetColor, borderLeftWidth: '3px' }}
    >
      {/* Asset Header */}
      <div className="px-3 py-2 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{assetIcon}</span>
          <span className="text-sm font-semibold text-white/90">{mock.assetName}</span>
          {mock.srmcPerMWh > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-navy-300 font-mono">
              SRMC ${mock.srmcPerMWh}
            </span>
          )}
        </div>
        <div className="text-xs text-navy-400 font-mono">{mock.nameplateMW} MW capacity</div>
      </div>

      {/* Bid Bands */}
      <div className="px-3 py-2 space-y-1.5">
        {mock.bands.map((band, j) => {
          const widthPercent = Math.round((band.quantityMW / mock.nameplateMW) * 100);
          return (
            <div key={j} className="flex items-center gap-2">
              {/* Price input mock */}
              <div className="flex items-center gap-1 min-w-[100px]">
                <div className="px-2 py-1 bg-navy-800 border border-white/10 rounded text-xs font-mono text-white text-center min-w-[56px]">
                  ${band.pricePerMWh.toLocaleString()}
                </div>
                <span className="text-[10px] text-navy-500">/MWh</span>
              </div>

              {/* Capacity bar */}
              <div className="flex-1 relative h-6 bg-navy-800 rounded overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{ backgroundColor: assetColor, opacity: 0.4 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
                <div className="relative z-10 flex items-center h-full px-2 justify-between">
                  <span className="text-[10px] font-mono text-white/80">{band.quantityMW} MW</span>
                  {band.label && (
                    <span className="text-[9px] text-white/50 truncate ml-2">{band.label}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Total + Note */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-[10px] text-navy-500">
            Total: {totalOffered} MW of {mock.nameplateMW} MW ({Math.round(totalOffered / mock.nameplateMW * 100)}%)
          </span>
        </div>
        {mock.note && (
          <p className="text-[10px] text-navy-400 italic leading-snug">{mock.note}</p>
        )}
      </div>
    </div>
  );
}
