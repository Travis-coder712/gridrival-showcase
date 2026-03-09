import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSET_ICONS, ASSET_COLORS } from '../../lib/colors';
import { ASSET_TYPE_LABELS } from '../../../shared/types';

interface HowToBidTutorialProps {
  onClose: () => void;
}

const SLIDE_TITLES = [
  'Your Bidding Screen',
  'Understanding Your Assets',
  'Making a Bid',
  'Bid Bands — Why Split?',
  'Using Strategies',
  'Quick Bid Shortcuts',
  'Review & Submit',
];

const TOTAL_SLIDES = SLIDE_TITLES.length;

export default function HowToBidTutorial({ onClose }: HowToBidTutorialProps) {
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
  //  SLIDE 0: Your Bidding Screen
  // ═══════════════════════════════════════
  const renderSlide0 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">📋 Your Bidding Screen</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Here's what you'll see when bidding opens. There are three key areas.
      </p>

      {/* Mock bidding layout */}
      <div className="max-w-5xl w-full bg-navy-900/50 rounded-2xl border border-white/10 p-6">
        {/* Period tabs mock */}
        <div className="mb-2">
          <div className="flex gap-2">
            {['Overnight', 'Morning', 'Afternoon', 'Evening'].map((p, i) => (
              <div
                key={p}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  i === 2 ? 'bg-electric-500/30 text-electric-300 border border-electric-500/40' : 'bg-white/5 text-navy-400'
                }`}
              >
                {p}
              </div>
            ))}
            {/* Annotation inline */}
            <div className="flex items-center ml-3">
              <div className="text-sm font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                ← ① Period Tabs — switch between time periods
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Asset cards mock */}
          <div className="col-span-2 space-y-3">
            {[
              { icon: '🏭', name: 'Coal Plant', srmc: 35, mw: 800 },
              { icon: '🔥', name: 'Gas CCGT', srmc: 65, mw: 400 },
            ].map(a => (
              <div key={a.name} className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-white font-semibold">{a.name}</span>
                  <span className="ml-auto px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-lg font-mono">
                    SRMC ${a.srmc}/MWh
                  </span>
                  <span className="text-xs text-navy-400 font-mono">{a.mw} MW</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <div className="flex-1 h-8 bg-navy-800 rounded border border-white/10 flex items-center px-3 text-xs text-navy-500">
                    $/MWh
                  </div>
                  <div className="flex-1 h-8 bg-navy-800 rounded border border-white/10 flex items-center px-3 text-xs text-navy-500">
                    MW
                  </div>
                </div>
              </div>
            ))}
            {/* Annotation below the asset cards */}
            <div className="mt-1">
              <div className="text-sm font-semibold text-green-400 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/30 inline-block">
                ↑ ② Asset Cards — one per power plant
              </div>
            </div>
          </div>

          {/* Strategy panel mock */}
          <div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="text-sm font-semibold text-navy-300 mb-3">🧠 Strategy Auto-Fill</div>
              <div className="h-8 bg-navy-800 rounded border border-white/10 mb-2 flex items-center px-3 text-xs text-navy-500">
                Select a strategy...
              </div>
              <div className="flex gap-1 mb-3">
                {['Low', 'Med', 'Max'].map(i => (
                  <div key={i} className="flex-1 h-7 bg-navy-800 rounded text-[10px] flex items-center justify-center text-navy-500">{i}</div>
                ))}
              </div>
              <div className="h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center text-xs text-indigo-300 border border-indigo-500/30">
                Apply Strategy
              </div>
            </div>
            {/* Annotation below the strategy panel */}
            <div className="mt-2">
              <div className="text-sm font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/30 inline-block">
                ↑ ③ Strategy Panel — auto-fill bids
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 1: Understanding Your Assets
  // ═══════════════════════════════════════
  const renderSlide1 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">⚡ Understanding Your Assets</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Each asset is a power plant in your portfolio. Here's what each part means.
      </p>

      {/* Enlarged mock asset card */}
      <div className="max-w-2xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-8 relative">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">🏭</span>
          <div>
            <div className="text-xl font-bold text-white">Mount Arthur Coal</div>
            <div className="text-sm text-navy-400">Coal — Baseload Generator</div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="px-3 py-1.5 bg-blue-500/20 text-blue-300 text-sm rounded-lg font-mono border border-blue-500/30">
              Marginal Cost $35/MWh
            </div>
            <div className="text-lg font-mono text-white font-bold">800 MW</div>
          </div>
        </div>

        {/* Annotation callouts */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <div className="text-amber-400 font-semibold text-sm mb-1">Marginal Cost (SRMC)</div>
            <div className="text-xs text-navy-300">Your cost to generate 1 MWh. Bid above this to make a profit.</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
            <div className="text-green-400 font-semibold text-sm mb-1">Available MW</div>
            <div className="text-xs text-navy-300">Maximum capacity you can bid. You don't have to bid all of it.</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
            <div className="text-purple-400 font-semibold text-sm mb-1">Asset Type</div>
            <div className="text-xs text-navy-300">Determines your cost structure and how the plant operates.</div>
          </div>
        </div>
      </div>

      {/* Asset type reference */}
      <div className="max-w-3xl w-full">
        <div className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-3 text-center">Asset Types You'll See</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['coal', 'gas_ccgt', 'gas_peaker', 'hydro', 'wind', 'solar', 'battery'] as const).map(type => (
            <div key={type} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
              <span className="text-lg">{ASSET_ICONS[type]}</span>
              <div>
                <div className="text-xs text-white font-medium">{ASSET_TYPE_LABELS[type]}</div>
                <div className="text-[10px] text-navy-500">
                  {type === 'coal' ? 'Low cost, always on'
                    : type === 'gas_ccgt' ? 'Mid cost, flexible'
                    : type === 'gas_peaker' ? 'High cost, peak only'
                    : type === 'hydro' ? 'Low cost, limited'
                    : type === 'wind' ? '$0 cost, variable'
                    : type === 'solar' ? '$0 cost, daytime'
                    : '$0 cost, stores energy'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 2: Making a Bid
  // ═══════════════════════════════════════
  const renderSlide2 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">💰 Making a Bid</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        For each asset, enter a price and quantity. Here's what the fields mean.
      </p>

      {/* Mock bid inputs with annotations */}
      <div className="max-w-2xl w-full bg-white/5 rounded-2xl border border-white/10 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🏭</span>
          <span className="text-xl font-bold text-white">Coal Plant</span>
          <span className="text-sm text-navy-400 font-mono ml-auto">Available: 800 MW</span>
        </div>

        <div className="text-xs text-navy-400 uppercase tracking-wide mb-2 font-medium">Band 1</div>
        <div className="flex gap-4 items-stretch">
          {/* Price field */}
          <div className="flex-1 relative">
            <div className="bg-navy-800 rounded-xl border-2 border-electric-500/50 p-4 text-center">
              <div className="text-3xl font-mono font-bold text-electric-300">$50</div>
              <div className="text-xs text-navy-400 mt-1">$/MWh</div>
            </div>
            <div className="mt-2 bg-electric-500/10 border border-electric-500/20 rounded-lg p-2 text-center">
              <div className="text-xs text-electric-300 font-medium">Your asking price per MWh</div>
              <div className="text-[10px] text-navy-400 mt-0.5">But you'll earn the clearing price, not this amount</div>
            </div>
          </div>

          <div className="flex items-center text-2xl text-navy-600 font-bold">×</div>

          {/* Quantity field */}
          <div className="flex-1 relative">
            <div className="bg-navy-800 rounded-xl border-2 border-green-500/50 p-4 text-center">
              <div className="text-3xl font-mono font-bold text-green-300">500</div>
              <div className="text-xs text-navy-400 mt-1">MW</div>
            </div>
            <div className="mt-2 bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
              <div className="text-xs text-green-300 font-medium">How much capacity you offer</div>
              <div className="text-[10px] text-navy-400 mt-0.5">Up to your asset's available MW</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key insight callout */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">💡</div>
        <div className="text-lg text-amber-300 font-semibold mb-1">Key Insight: You Earn the Clearing Price</div>
        <div className="text-base text-navy-200">
          If you bid $50/MWh and the clearing price is $80/MWh, you earn <span className="text-green-400 font-bold">$80</span> per MWh — not $50.
          Your bid price just determines whether you get dispatched.
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 3: Bid Bands — Why Split?
  // ═══════════════════════════════════════
  const renderSlide3 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">📊 Bid Bands — Why Split?</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        You can split your capacity into multiple bands at different prices. This is a powerful strategy tool.
      </p>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Single band example */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <div className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-4 text-center">❌ Single Band (Risky)</div>
          <div className="bg-navy-800 rounded-xl p-4 mb-3">
            <div className="text-xs text-navy-400 mb-1">Band 1</div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-lg text-white">$200/MWh</span>
              <span className="font-mono text-lg text-white">800 MW</span>
            </div>
          </div>
          <div className="text-sm text-navy-300 text-center">
            If the clearing price is below $200, you get <span className="text-red-400 font-bold">NOTHING dispatched</span>
          </div>

          {/* Visual bar */}
          <div className="mt-4 h-24 relative bg-navy-800 rounded-lg overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-full flex items-end px-4">
              <div className="w-full bg-red-500/30 border-2 border-red-500/50 rounded-t-lg" style={{ height: '60%' }}>
                <div className="flex flex-col items-center justify-center h-full text-xs text-red-300 font-mono">
                  <div>$200 × 800 MW</div>
                  <div className="text-[10px] text-red-400">All or nothing</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi band example */}
        <div className="bg-white/5 rounded-2xl border border-green-500/20 p-6">
          <div className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-4 text-center">✅ Two Bands (Smarter)</div>
          <div className="bg-navy-800 rounded-xl p-4 mb-2">
            <div className="text-xs text-navy-400 mb-1">Band 1 — Guaranteed dispatch</div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-lg text-green-300">$30/MWh</span>
              <span className="font-mono text-lg text-white">500 MW</span>
            </div>
          </div>
          <div className="bg-navy-800 rounded-xl p-4 mb-3">
            <div className="text-xs text-navy-400 mb-1">Band 2 — Might set the price</div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-lg text-amber-300">$200/MWh</span>
              <span className="font-mono text-lg text-white">300 MW</span>
            </div>
          </div>
          <div className="text-sm text-navy-300 text-center">
            Band 1 almost always dispatched. Band 2 <span className="text-amber-400 font-bold">could set the clearing price</span> higher.
          </div>

          {/* Visual stacked bar */}
          <div className="mt-4 h-24 relative bg-navy-800 rounded-lg overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-full flex items-end px-4 gap-1">
              <div className="flex-1 bg-green-500/30 border-2 border-green-500/50 rounded-t-lg" style={{ height: '30%' }}>
                <div className="flex items-center justify-center h-full text-[10px] text-green-300 font-mono">$30 × 500 MW</div>
              </div>
              <div className="flex-1 bg-amber-500/30 border-2 border-amber-500/50 rounded-t-lg" style={{ height: '70%' }}>
                <div className="flex items-center justify-center h-full text-[10px] text-amber-300 font-mono">$200 × 300 MW</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add band hint */}
      <div className="mt-6 flex items-center gap-3 bg-white/5 rounded-xl px-5 py-3 border border-white/10">
        <div className="text-lg">➕</div>
        <div className="text-sm text-navy-300">
          Click <span className="font-mono text-electric-300 bg-electric-500/10 px-2 py-0.5 rounded">+ Add Band</span> below any asset to add more bands. Most rounds allow up to 5-10 bands.
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 4: Using Strategies
  // ═══════════════════════════════════════
  const renderSlide4 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🧠 Using Strategies</h2>
      <p className="text-lg text-navy-300 mb-6 max-w-2xl text-center">
        Strategies auto-fill your bids. Pick one, set the intensity, then choose which assets to apply it to.
      </p>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mock strategy panel */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <div className="text-sm font-semibold text-navy-300 mb-4">🧠 Strategy Auto-Fill</div>

          {/* Step 1: Select */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-electric-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span className="text-sm text-navy-300 font-medium">Choose a strategy</span>
            </div>
            <div className="bg-navy-800 rounded-lg border border-electric-500/40 p-3 flex items-center gap-2">
              <span>🟠</span>
              <span className="text-sm text-white font-medium">Price Maker</span>
              <span className="text-[10px] text-navy-400 ml-auto">▼</span>
            </div>
          </div>

          {/* Step 2: Intensity */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-electric-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span className="text-sm text-navy-300 font-medium">Set intensity</span>
            </div>
            <div className="flex gap-2">
              {['Low', 'Medium', 'Max'].map((l, i) => (
                <div
                  key={l}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium text-center ${
                    i === 1 ? 'bg-electric-500/30 text-electric-300 border border-electric-500/40' : 'bg-navy-800 text-navy-500'
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Apply to assets */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-electric-500 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span className="text-sm text-navy-300 font-medium">Select assets to apply</span>
            </div>
            <div className="space-y-1.5 bg-navy-800/50 rounded-lg p-3 border border-white/5">
              <label className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-navy-500 bg-navy-700" />
                <span className="text-xs text-navy-300 font-medium">All Assets</span>
              </label>
              <div className="ml-6 space-y-1 border-l-2 border-navy-700 pl-3">
                {[
                  { icon: '🏭', name: 'Coal Plant', checked: true },
                  { icon: '🔥', name: 'Gas CCGT', checked: true },
                  { icon: '⚡', name: 'Gas Peaker', checked: false },
                ].map(a => (
                  <label key={a.name} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 ${a.checked ? 'bg-electric-500 border-electric-500' : 'border-navy-500 bg-navy-700'}`}>
                      {a.checked && <svg className="w-full h-full text-white" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </div>
                    <span className="text-xs">{a.icon}</span>
                    <span className="text-xs text-navy-300">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Apply button */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-electric-500 text-white text-xs flex items-center justify-center font-bold">4</span>
              <span className="text-sm text-navy-300 font-medium">Click Apply!</span>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg py-3 text-center text-sm text-white font-bold">
              Apply Price Maker (medium) to 2 Assets
            </div>
          </div>
        </div>

        {/* Key points */}
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
            <div className="text-lg text-red-400 font-bold mb-2">⚠️ Important!</div>
            <div className="text-base text-navy-200">
              Just <em>selecting</em> a strategy does nothing. You <strong className="text-white">must click Apply</strong> for it to fill in your bids.
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
            <div className="text-lg text-blue-400 font-bold mb-2">🎯 Per-Asset Control</div>
            <div className="text-base text-navy-200">
              Use the tick boxes to apply a strategy to <strong className="text-white">specific assets only</strong>.
              For example, apply "Price Taker" to wind/solar and "Price Maker" to coal.
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
            <div className="text-lg text-green-400 font-bold mb-2">✏️ You Can Tweak</div>
            <div className="text-base text-navy-200">
              After applying a strategy, you can still <strong className="text-white">manually adjust</strong> any individual bid.
              Strategies are a starting point, not final.
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
            <div className="text-lg text-purple-400 font-bold mb-2">📈 Intensity</div>
            <div className="text-base text-navy-200">
              <strong className="text-white">Low</strong> = conservative, <strong className="text-white">Medium</strong> = balanced, <strong className="text-white">Max</strong> = aggressive.
              Start with Medium if unsure.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 5: Quick Bid Shortcuts
  // ═══════════════════════════════════════
  const renderSlide5 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">⚡ Quick Bid Shortcuts</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Each asset has three quick-bid buttons for fast, one-click bidding. These apply to a single asset in the selected period.
      </p>

      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Bid $0 */}
        <div className="bg-white/5 rounded-2xl border border-green-500/20 p-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-lg font-bold mb-4 border border-green-500/30">
            Bid $0
          </div>
          <div className="text-green-400 font-semibold text-lg mb-2">Guarantee Dispatch</div>
          <div className="text-sm text-navy-300">
            Bid all your capacity at $0/MWh. You'll almost certainly be dispatched and earn whatever the clearing price is.
          </div>
          <div className="mt-3 text-xs text-navy-500">
            Best for: Renewables (wind, solar) with $0 marginal cost
          </div>
        </div>

        {/* Bid SRMC */}
        <div className="bg-white/5 rounded-2xl border border-blue-500/20 p-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-lg font-bold mb-4 border border-blue-500/30">
            Bid Marginal Cost
          </div>
          <div className="text-blue-400 font-semibold text-lg mb-2">Break Even</div>
          <div className="text-sm text-navy-300">
            Bid at your SRMC. Only dispatched if it's profitable. The economically rational starting point.
          </div>
          <div className="mt-3 text-xs text-navy-500">
            Best for: When you want a safe, rational baseline
          </div>
        </div>

        {/* Bid $500 */}
        <div className="bg-white/5 rounded-2xl border border-amber-500/20 p-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg text-lg font-bold mb-4 border border-amber-500/30">
            Bid $500
          </div>
          <div className="text-amber-400 font-semibold text-lg mb-2">High Price Play</div>
          <div className="text-sm text-navy-300">
            Bid at $500/MWh. Unlikely to be dispatched unless demand is very tight, but sets a high clearing price if you are.
          </div>
          <div className="mt-3 text-xs text-navy-500">
            Best for: Peakers or strategic bids in tight markets
          </div>
        </div>
      </div>

      {/* Note about scope */}
      <div className="max-w-2xl w-full bg-white/5 rounded-xl px-6 py-4 border border-white/10 text-center">
        <div className="text-sm text-navy-300">
          💡 Quick bids apply to <strong className="text-white">one asset</strong> in the <strong className="text-white">currently selected period</strong> only.
          Switch periods using the tabs at the top to bid for different times of day.
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 6: Review & Submit
  // ═══════════════════════════════════════
  const mockReviewData = [
    {
      icon: '🏭', name: 'Coal Plant', srmc: 35, avail: 800,
      periods: [
        { bands: [{ p: 0, mw: 500 }], total: 500, warn: '' },
        { bands: [{ p: 0, mw: 300 }, { p: 80, mw: 200 }], total: 500, warn: '' },
        { bands: [{ p: 30, mw: 500 }, { p: 200, mw: 300 }], total: 800, warn: '' },
        { bands: [{ p: 0, mw: 500 }], total: 500, warn: '' },
      ],
    },
    {
      icon: '🔥', name: 'Gas CCGT', srmc: 65, avail: 400,
      periods: [
        { bands: [{ p: 50, mw: 200 }], total: 200, warn: 'srmc' },
        { bands: [{ p: 65, mw: 400 }], total: 400, warn: '' },
        { bands: [{ p: 65, mw: 200 }, { p: 300, mw: 200 }], total: 400, warn: '' },
        { bands: [{ p: 65, mw: 200 }], total: 200, warn: '' },
      ],
    },
    {
      icon: '⚡', name: 'Gas Peaker', srmc: 120, avail: 300,
      periods: [
        { bands: [], total: 0, warn: 'zero' },
        { bands: [], total: 0, warn: 'zero' },
        { bands: [{ p: 200, mw: 300 }], total: 300, warn: '' },
        { bands: [], total: 0, warn: 'zero' },
      ],
    },
  ];
  const periodLabels = ['Overnight', 'Morning', 'Afternoon', 'Evening'];

  const renderSlide6 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">✅ Review & Submit</h2>
      <p className="text-lg text-navy-300 mb-6 max-w-2xl text-center">
        When you're ready, click "Review Bids" at the bottom. Here's what you'll see.
      </p>

      {/* Mock review table — matches BidReviewModal layout */}
      <div className="max-w-4xl w-full bg-white/5 rounded-2xl border border-white/10 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-white">Review Your Bids</div>
          <div className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold">
            4 warnings
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 pr-3 text-navy-500 font-semibold text-xs">Asset</th>
              {periodLabels.map(p => (
                <th key={p} className="text-center py-2 px-1.5 text-navy-500 font-semibold text-xs">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockReviewData.map(row => (
              <tr key={row.name} className="border-b border-white/5">
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{row.icon}</span>
                    <div>
                      <div className="font-medium text-navy-200 text-xs">{row.name}</div>
                      <div className="text-[10px] text-navy-500">{row.avail} MW &bull; SRMC ${row.srmc}</div>
                    </div>
                  </div>
                </td>
                {row.periods.map((pd, pi) => (
                  <td
                    key={pi}
                    className={`py-2 px-1.5 text-center ${
                      pd.warn === 'zero' ? 'bg-red-500/10' :
                      pd.warn === 'srmc' ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    {pd.bands.length === 0 ? (
                      <div>
                        <div className="text-red-400 font-bold text-xs">0 MW</div>
                        <div className="text-[10px] text-red-400/70">No bid</div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {pd.bands.map((band, bi) => (
                          <div key={bi} className={`text-[11px] font-mono ${
                            band.p < row.srmc && row.srmc > 0 ? 'text-amber-300 font-bold' : 'text-navy-200'
                          }`}>
                            ${band.p} &times; {band.mw}MW
                          </div>
                        ))}
                        <div className="text-[10px] font-bold text-navy-400 mt-0.5">
                          = {pd.total} MW
                        </div>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {/* Total row */}
            <tr className="bg-white/5 font-bold">
              <td className="py-2 pr-3 text-xs text-navy-300">Total Bid</td>
              {periodLabels.map((_, pi) => {
                const total = mockReviewData.reduce((s, r) => s + r.periods[pi].total, 0);
                return (
                  <td key={pi} className="py-2 px-1.5 text-center text-xs text-navy-300 font-mono">
                    {total} MW
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>

        {/* Mock footer buttons */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 py-2 bg-white/5 rounded-lg text-center text-xs text-navy-400 border border-white/10">
            Go Back & Edit
          </div>
          <div className="flex-1 py-2 bg-green-500/20 rounded-lg text-center text-xs text-green-300 font-bold border border-green-500/30">
            Confirm & Submit Bids
          </div>
        </div>
      </div>

      {/* Warning types */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-red-400 mb-1">🚫 Zero MW</div>
          <div className="text-xs text-navy-300">
            No capacity bid for this asset/period. You won't earn anything here.
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-amber-400 mb-1">⚠️ Below SRMC</div>
          <div className="text-xs text-navy-300">
            Bid price is below your marginal cost. Can be strategic but you'll lose money if the clearing price is also below your cost.
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-blue-400 mb-1">📊 Below Fair Share</div>
          <div className="text-xs text-navy-300">
            You're bidding less than your pro-rata share of demand. Could be strategic or an oversight.
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-2xl w-full bg-gradient-to-r from-green-500/10 to-electric-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
        <div className="text-2xl mb-2">🏁</div>
        <div className="text-lg text-white font-bold mb-1">Ready to Bid?</div>
        <div className="text-sm text-navy-300">
          Check your warnings, confirm your bids, and wait for the market to clear. <span className="text-electric-300 font-semibold">Good luck!</span>
        </div>
      </div>
    </div>
  );

  const slides = [renderSlide0, renderSlide1, renderSlide2, renderSlide3, renderSlide4, renderSlide5, renderSlide6];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-navy-800 to-navy-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-navy-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">📖</span>
          <div>
            <h1 className="text-white font-bold text-sm">How to Bid</h1>
            <p className="text-navy-400 text-xs">A quick guide to placing your bids</p>
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
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
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
          onClick={currentSlide === TOTAL_SLIDES - 1 ? onClose : goNext}
          className="flex items-center gap-2 px-4 py-2 bg-electric-500 hover:bg-electric-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {currentSlide === TOTAL_SLIDES - 1 ? 'Got it!' : 'Next'}
          {currentSlide < TOTAL_SLIDES - 1 && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
