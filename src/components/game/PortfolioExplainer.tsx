import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioExplainerProps {
  onClose: () => void;
}

const SLIDE_TITLES = [
  'Why Portfolio Diversity Matters',
  'The Portfolio Effect',
  'Real NEM Portfolio Thinking',
  'Strategy 1: Baseload + Peaker Squeeze',
  'Strategy 2: The Renewable Shield',
  'Strategy 3: The Battery Amplifier',
];

const TOTAL_SLIDES = SLIDE_TITLES.length;

export default function PortfolioExplainer({ onClose }: PortfolioExplainerProps) {
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
  //  SLIDE 0: Why Portfolio Diversity Matters
  // ═══════════════════════════════════════
  const renderSlide0 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">📊 Why Portfolio Diversity Matters</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        A team with one asset type is at the mercy of a single market outcome. A <strong className="text-white">diversified portfolio</strong> hedges across conditions — just like in real electricity markets.
      </p>

      {/* Comparison: Single asset vs Portfolio */}
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Single asset team */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">🏭</div>
            <div>
              <div className="text-lg font-bold text-red-300">Single Asset Team</div>
              <div className="text-xs text-navy-400">Coal plant only</div>
            </div>
          </div>

          {/* Scenario bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-navy-400">Low demand (spring)</span>
                <span className="text-red-400 font-mono">-$120k</span>
              </div>
              <div className="h-4 bg-navy-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-red-500/60 rounded-full" initial={{ width: 0 }} animate={{ width: '30%' }} transition={{ delay: 0.3, duration: 0.6 }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-navy-400">High demand (summer)</span>
                <span className="text-green-400 font-mono">+$200k</span>
              </div>
              <div className="h-4 bg-navy-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-green-500/60 rounded-full" initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ delay: 0.5, duration: 0.6 }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-navy-400">Solar flood (midday)</span>
                <span className="text-red-400 font-mono">-$80k</span>
              </div>
              <div className="h-4 bg-navy-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-red-500/60 rounded-full" initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ delay: 0.7, duration: 0.6 }} />
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm font-bold text-red-300">Volatile, unpredictable returns</div>
        </div>

        {/* Portfolio team */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">🏢</div>
            <div>
              <div className="text-lg font-bold text-green-300">Portfolio Team</div>
              <div className="text-xs text-navy-400">Coal + Gas + Solar + Battery</div>
            </div>
          </div>

          {/* Scenario bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-navy-400">Low demand (spring)</span>
                <span className="text-green-400 font-mono">+$40k</span>
              </div>
              <div className="h-4 bg-navy-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-green-500/60 rounded-full" initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ delay: 0.3, duration: 0.6 }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-navy-400">High demand (summer)</span>
                <span className="text-green-400 font-mono">+$310k</span>
              </div>
              <div className="h-4 bg-navy-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-green-500/60 rounded-full" initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ delay: 0.5, duration: 0.6 }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-navy-400">Solar flood (midday)</span>
                <span className="text-green-400 font-mono">+$60k</span>
              </div>
              <div className="h-4 bg-navy-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-green-500/60 rounded-full" initial={{ width: 0 }} animate={{ width: '50%' }} transition={{ delay: 0.7, duration: 0.6 }} />
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm font-bold text-green-300">Consistent, resilient returns</div>
        </div>
      </div>

      {/* Key insight */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">🏢</div>
        <div className="text-lg text-amber-300 font-semibold mb-1">The Gentailer Model</div>
        <div className="text-sm text-navy-200">
          In the real NEM, the &ldquo;Big 3&rdquo; &mdash; <strong className="text-white">AGL</strong>, <strong className="text-white">Origin</strong>, and <strong className="text-white">EnergyAustralia</strong> &mdash; all operate diversified generation portfolios spanning coal, gas, wind, solar, hydro, and batteries. This isn&rsquo;t accidental &mdash; it&rsquo;s a deliberate hedge against market volatility.
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 1: The Portfolio Effect
  // ═══════════════════════════════════════
  const renderSlide1 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🔄 The Portfolio Effect</h2>
      <p className="text-lg text-navy-300 mb-2 max-w-2xl text-center">
        When one asset loses, another wins. That&rsquo;s the power of portfolio thinking.
      </p>
      <p className="text-xl font-bold text-electric-300 mb-8">
        &ldquo;Don&rsquo;t optimise each asset in isolation &mdash; optimise the portfolio&rdquo;
      </p>

      {/* Revenue contribution by period */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="text-sm font-semibold text-navy-300 mb-4 text-center">Revenue Contribution by Asset &amp; Period</div>

        {/* Stacked bar chart - simplified */}
        <div className="space-y-4">
          {[
            { period: '🌙 Overnight', coal: 35, gas: 10, wind: 20, solar: 0, battery: -15, total: '+$50k' },
            { period: '🌅 Morning', coal: 30, gas: 15, wind: 15, solar: 25, battery: -10, total: '+$75k' },
            { period: '☀️ Afternoon', coal: 10, gas: 5, wind: 10, solar: 40, battery: -20, total: '+$45k' },
            { period: '🌆 Evening', coal: 25, gas: 30, wind: 15, solar: 0, battery: 35, total: '+$105k' },
          ].map((row, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-navy-400 w-28">{row.period}</span>
                <span className="text-electric-300 font-mono font-bold">{row.total}</span>
              </div>
              <div className="flex h-6 rounded-lg overflow-hidden bg-navy-800">
                {row.coal > 0 && (
                  <motion.div
                    className="bg-gray-500/70 flex items-center justify-center"
                    initial={{ width: 0 }} animate={{ width: `${row.coal}%` }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                    title="Coal"
                  >
                    <span className="text-[9px] font-bold text-white/80">Coal</span>
                  </motion.div>
                )}
                {row.gas > 0 && (
                  <motion.div
                    className="bg-orange-500/70 flex items-center justify-center"
                    initial={{ width: 0 }} animate={{ width: `${row.gas}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    title="Gas"
                  >
                    <span className="text-[9px] font-bold text-white/80">Gas</span>
                  </motion.div>
                )}
                {row.wind > 0 && (
                  <motion.div
                    className="bg-teal-500/70 flex items-center justify-center"
                    initial={{ width: 0 }} animate={{ width: `${row.wind}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    title="Wind"
                  >
                    <span className="text-[9px] font-bold text-white/80">Wind</span>
                  </motion.div>
                )}
                {row.solar > 0 && (
                  <motion.div
                    className="bg-yellow-500/70 flex items-center justify-center"
                    initial={{ width: 0 }} animate={{ width: `${row.solar}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    title="Solar"
                  >
                    <span className="text-[9px] font-bold text-white/80">Solar</span>
                  </motion.div>
                )}
                {row.battery !== 0 && (
                  <motion.div
                    className={`${row.battery > 0 ? 'bg-green-500/70' : 'bg-red-500/40'} flex items-center justify-center`}
                    initial={{ width: 0 }} animate={{ width: `${Math.abs(row.battery)}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                    title="Battery"
                  >
                    <span className="text-[9px] font-bold text-white/80">{row.battery > 0 ? '🔋+' : '🔋-'}</span>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {[
            { label: 'Coal', color: 'bg-gray-500/70' },
            { label: 'Gas', color: 'bg-orange-500/70' },
            { label: 'Wind', color: 'bg-teal-500/70' },
            { label: 'Solar', color: 'bg-yellow-500/70' },
            { label: 'Battery (+)', color: 'bg-green-500/70' },
            { label: 'Battery (charge)', color: 'bg-red-500/40' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="text-[10px] text-navy-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key points */}
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-blue-400 mb-1">📉 Low Clearing Price?</div>
          <div className="text-xs text-navy-300">
            Your coal earns less &mdash; but your <strong className="text-white">renewables still profit</strong> (zero cost) and your <strong className="text-white">battery charges cheap</strong>.
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-red-400 mb-1">📈 High Clearing Price?</div>
          <div className="text-xs text-navy-300">
            Your peaker and gas <strong className="text-white">earn premium margins</strong>. Your battery <strong className="text-white">discharges at peak rates</strong>. Renewables still profit.
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 2: Real NEM Portfolio Thinking
  // ═══════════════════════════════════════
  const renderSlide2 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🇦🇺 Real NEM Portfolio Thinking</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Australia&rsquo;s biggest electricity companies don&rsquo;t bet on one technology. They build <strong className="text-white">diversified portfolios</strong> &mdash; just like you&rsquo;re doing in this game.
      </p>

      {/* Gentailer cards */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* AGL */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <div className="text-center mb-3">
            <div className="text-3xl mb-1">⚡</div>
            <div className="text-lg font-bold text-white">AGL Energy</div>
            <div className="text-xs text-navy-400">Australia&rsquo;s largest generator</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
              <span>Coal: Bayswater, Loy Yang A</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              <span>Gas: Torrens Island, Barker Inlet</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
              <span>Wind: Coopers Gap, Macarthur</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
              <span>Solar: Broken Hill, Nyngan</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <span>Battery: Torrens Island BESS</span>
            </div>
          </div>
        </div>

        {/* Origin */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <div className="text-center mb-3">
            <div className="text-3xl mb-1">🔆</div>
            <div className="text-lg font-bold text-white">Origin Energy</div>
            <div className="text-xs text-navy-400">Generation + retail</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
              <span>Coal: Eraring (scheduled closure)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              <span>Gas: Mortlake, Darling Downs</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              <span>Hydro: Shoalhaven pumped hydro</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
              <span>Solar: 1.4 GW pipeline</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <span>Battery: Eraring BESS (700 MW)</span>
            </div>
          </div>
        </div>

        {/* EnergyAustralia */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <div className="text-center mb-3">
            <div className="text-3xl mb-1">🌊</div>
            <div className="text-lg font-bold text-white">EnergyAustralia</div>
            <div className="text-xs text-navy-400">CLP Group owned</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
              <span>Coal: Mt Piper, Yallourn</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              <span>Gas: Tallawarra, Hallett</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
              <span>Wind: Waterloo, Cathedral Rocks</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <span>Battery: Wooreen BESS (350 MW)</span>
            </div>
          </div>
        </div>
      </div>

      {/* The natural hedge concept */}
      <div className="max-w-3xl w-full bg-electric-500/10 border border-electric-500/30 rounded-2xl p-6">
        <div className="text-center mb-4">
          <div className="text-2xl mb-1">💡</div>
          <div className="text-lg text-electric-300 font-semibold">The &ldquo;Natural Hedge&rdquo;</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-navy-200">
          <div className="bg-navy-800/50 rounded-xl p-4">
            <div className="font-semibold text-electric-400 mb-2">When wholesale prices are LOW:</div>
            <div className="text-xs space-y-1">
              <div>&bull; Generation revenue drops</div>
              <div>&bull; But batteries <strong className="text-green-300">charge cheaply</strong></div>
              <div>&bull; Renewables still earn at $0 cost</div>
              <div>&bull; Portfolio stays profitable</div>
            </div>
          </div>
          <div className="bg-navy-800/50 rounded-xl p-4">
            <div className="font-semibold text-amber-400 mb-2">When wholesale prices are HIGH:</div>
            <div className="text-xs space-y-1">
              <div>&bull; Peakers + gas earn <strong className="text-green-300">premium margins</strong></div>
              <div>&bull; Battery discharges at peak rates</div>
              <div>&bull; Coal earns strong revenue on volume</div>
              <div>&bull; Portfolio captures the spike</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 3: Strategy 1 — Baseload + Peaker Squeeze
  // ═══════════════════════════════════════
  const renderSlide3 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🏭⚡ Strategy 1: Baseload + Peaker Squeeze</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Use your <strong className="text-white">coal for volume</strong> and your <strong className="text-white">peaker for margin</strong>. The classic portfolio play.
      </p>

      {/* Strategy breakdown */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="text-sm font-semibold text-navy-300 mb-4 text-center">How It Works</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coal role */}
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center text-xl">🏭</div>
              <div>
                <div className="text-base font-bold text-gray-300">Coal: The Anchor</div>
                <div className="text-xs text-navy-400">Bid at $0 or near marginal cost</div>
              </div>
            </div>
            <div className="space-y-2 text-xs text-navy-300">
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                <span>Guaranteed dispatch in almost all conditions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                <span>Provides stable, predictable revenue</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                <span>Earns whatever clearing price other teams set</span>
              </div>
            </div>
          </div>

          {/* Peaker role */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">🔥</div>
              <div>
                <div className="text-base font-bold text-red-300">Peaker: The Spike Catcher</div>
                <div className="text-xs text-navy-400">Bid at $500 &ndash; $5,000+</div>
              </div>
            </div>
            <div className="space-y-2 text-xs text-navy-300">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold mt-0.5">→</span>
                <span>Only dispatched when demand is very high</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold mt-0.5">→</span>
                <span>When it runs, it may <strong className="text-white">set the clearing price</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold mt-0.5">→</span>
                <span>That high price flows to ALL your dispatched assets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Worked example */}
      <div className="max-w-3xl w-full bg-navy-800/50 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="text-sm font-bold text-white mb-3 text-center">Example: Evening Peak Period</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-3">
            <div className="text-xs text-navy-400 mb-1">Coal @ $0/MWh</div>
            <div className="text-sm font-mono text-white">1,000 MW dispatched</div>
            <div className="text-lg font-bold font-mono text-green-300">+$2.5M</div>
            <div className="text-[10px] text-navy-500">earns clearing price</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="text-xs text-navy-400 mb-1">Peaker @ $2,500/MWh</div>
            <div className="text-sm font-mono text-white">150 MW dispatched</div>
            <div className="text-lg font-bold font-mono text-green-300">+$375k</div>
            <div className="text-[10px] text-red-400 font-bold">SETS clearing price!</div>
          </div>
          <div className="bg-electric-500/10 border border-electric-500/20 rounded-lg p-3">
            <div className="text-xs text-navy-400 mb-1">Total Portfolio</div>
            <div className="text-sm font-mono text-white">1,150 MW dispatched</div>
            <div className="text-lg font-bold font-mono text-electric-300">+$2.88M</div>
            <div className="text-[10px] text-electric-400 font-bold">Clearing: $2,500/MWh</div>
          </div>
        </div>
      </div>

      {/* Best for */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
        <div className="text-sm text-amber-300 font-semibold">🎯 Best in: High-demand summer/winter rounds where peakers are likely to be dispatched</div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 4: Strategy 2 — The Renewable Shield
  // ═══════════════════════════════════════
  const renderSlide4 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">☀️🛡️ Strategy 2: The Renewable Shield</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Let your <strong className="text-white">renewables absorb the cheap periods</strong> while your <strong className="text-white">thermal assets target the expensive ones</strong>.
      </p>

      {/* Period-by-period strategy */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="text-sm font-semibold text-navy-300 mb-4 text-center">Day Strategy Map</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Overnight */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-center">
            <div className="text-lg mb-1">🌙</div>
            <div className="text-xs font-bold text-indigo-300 mb-2">Overnight</div>
            <div className="space-y-1 text-[10px] text-navy-300">
              <div className="bg-teal-500/20 rounded px-2 py-0.5">🌬️ Wind: $0 bid</div>
              <div className="bg-gray-500/20 rounded px-2 py-0.5">🏭 Coal: $0 bid</div>
              <div className="bg-navy-700/50 rounded px-2 py-0.5 text-navy-500">☀️ Solar: offline</div>
            </div>
            <div className="text-[10px] text-indigo-400 mt-2 font-medium">Steady revenue</div>
          </div>

          {/* Morning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <div className="text-lg mb-1">🌅</div>
            <div className="text-xs font-bold text-amber-300 mb-2">Morning</div>
            <div className="space-y-1 text-[10px] text-navy-300">
              <div className="bg-yellow-500/20 rounded px-2 py-0.5">☀️ Solar: $0 bid</div>
              <div className="bg-teal-500/20 rounded px-2 py-0.5">🌬️ Wind: $0 bid</div>
              <div className="bg-gray-500/20 rounded px-2 py-0.5">🏭 Coal: marginal</div>
            </div>
            <div className="text-[10px] text-amber-400 mt-2 font-medium">Renewables ramp</div>
          </div>

          {/* Afternoon */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
            <div className="text-lg mb-1">☀️</div>
            <div className="text-xs font-bold text-green-300 mb-2">Afternoon</div>
            <div className="space-y-1 text-[10px] text-navy-300">
              <div className="bg-yellow-500/20 rounded px-2 py-0.5 font-bold">☀️ Solar: THE SHIELD</div>
              <div className="bg-teal-500/20 rounded px-2 py-0.5">🌬️ Wind: $0 bid</div>
              <div className="bg-navy-700/50 rounded px-2 py-0.5 text-navy-500">🔥 Peaker: idle</div>
            </div>
            <div className="text-[10px] text-green-400 mt-2 font-medium">Solar covers you</div>
          </div>

          {/* Evening */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
            <div className="text-lg mb-1">🌆</div>
            <div className="text-xs font-bold text-red-300 mb-2">Evening</div>
            <div className="space-y-1 text-[10px] text-navy-300">
              <div className="bg-gray-500/20 rounded px-2 py-0.5">🏭 Coal: marginal</div>
              <div className="bg-orange-500/20 rounded px-2 py-0.5">⛽ Gas: high bid</div>
              <div className="bg-red-500/20 rounded px-2 py-0.5 font-bold">🔥 Peaker: MAX BID</div>
            </div>
            <div className="text-[10px] text-red-400 mt-2 font-medium">Thermals cash in</div>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-green-400 mb-1">☀️ The Shield Effect</div>
          <div className="text-xs text-navy-300">
            During solar-flooded afternoons, clearing prices collapse. But your solar at <strong className="text-white">$0 cost still earns revenue</strong> (even if it&rsquo;s small). Your portfolio stays in the green while single-technology teams struggle.
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-red-400 mb-1">🔥 The Evening Payoff</div>
          <div className="text-xs text-navy-300">
            When solar drops off and demand peaks, your thermal assets are positioned to <strong className="text-white">capture premium prices</strong>. The profits from one evening peak can dwarf a whole day of cheap periods.
          </div>
        </div>
      </div>

      {/* Best for */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
        <div className="text-sm text-amber-300 font-semibold">🎯 Best in: Spring/autumn rounds with strong solar periods and moderate evening demand</div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 5: Strategy 3 — The Battery Amplifier
  // ═══════════════════════════════════════
  const renderSlide5 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🔋🚀 Strategy 3: The Battery Amplifier</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Your portfolio creates its own <strong className="text-white">internal arbitrage loop</strong>. Renewables push prices down &rarr; battery charges cheap &rarr; battery discharges at peak &rarr; <strong className="text-green-400">profit amplified</strong>.
      </p>

      {/* The cycle diagram */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="text-sm font-semibold text-navy-300 mb-4 text-center">The Amplifier Cycle</div>

        {/* Flow steps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
          <motion.div
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3 text-center w-full md:w-auto"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <div className="text-lg">☀️</div>
            <div className="text-xs font-bold text-yellow-300">Solar Floods</div>
            <div className="text-[10px] text-navy-400">Price drops to $20</div>
          </motion.div>

          <motion.div className="text-xl text-navy-500 font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            →
          </motion.div>

          <motion.div
            className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 text-center w-full md:w-auto"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            <div className="text-lg">🔋⬇️</div>
            <div className="text-xs font-bold text-green-300">Battery Charges</div>
            <div className="text-[10px] text-navy-400">Buy @ $20/MWh</div>
          </motion.div>

          <motion.div className="text-xl text-navy-500 font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            →
          </motion.div>

          <motion.div
            className="bg-navy-700/50 border border-white/10 rounded-xl p-3 text-center w-full md:w-auto"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          >
            <div className="text-lg">🌆</div>
            <div className="text-xs font-bold text-navy-300">Evening Arrives</div>
            <div className="text-[10px] text-navy-400">Solar drops to zero</div>
          </motion.div>

          <motion.div className="text-xl text-navy-500 font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
            →
          </motion.div>

          <motion.div
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-center w-full md:w-auto"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          >
            <div className="text-lg">🔋⬆️</div>
            <div className="text-xs font-bold text-red-300">Battery Discharges</div>
            <div className="text-[10px] text-navy-400">Sell @ $300/MWh</div>
          </motion.div>
        </div>

        {/* Profit calculation */}
        <motion.div
          className="mt-6 bg-electric-500/10 border border-electric-500/30 rounded-xl p-4 text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        >
          <div className="text-xs text-navy-400 mb-1">Battery Arbitrage Profit</div>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-red-300 font-mono">Charge: -$60k</span>
            <span className="text-navy-500">+</span>
            <span className="text-green-300 font-mono">Discharge: +$828k</span>
            <span className="text-navy-500">=</span>
            <span className="text-electric-300 font-mono font-bold text-lg">+$768k</span>
          </div>
          <div className="text-[10px] text-navy-500 mt-1">(500 MW &times; 6 hrs &times; $20 charge, 460 MWh effective &times; $300 discharge, after 92% efficiency)</div>
        </motion.div>
      </div>

      {/* Supporting assets */}
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-3 text-center">
          <div className="text-sm font-semibold text-gray-400 mb-1">🏭 Coal + Gas</div>
          <div className="text-xs text-navy-300">
            Bid at marginal cost for <strong className="text-white">steady baseline revenue</strong> across all periods
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
          <div className="text-sm font-semibold text-yellow-400 mb-1">☀️ Renewables</div>
          <div className="text-xs text-navy-300">
            $0 bids = guaranteed dispatch. They <strong className="text-white">suppress prices</strong> to help your battery charge cheaply
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <div className="text-sm font-semibold text-red-400 mb-1">🔥 Peaker</div>
          <div className="text-xs text-navy-300">
            Double revenue stream at evening: battery + peaker both <strong className="text-white">capture peak prices</strong>
          </div>
        </div>
      </div>

      {/* Best for + closing */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center mb-4">
        <div className="text-sm text-amber-300 font-semibold">🎯 Best in: Any round with battery, especially spring where solar creates deep midday troughs</div>
      </div>

      <div className="max-w-2xl w-full text-center">
        <div className="text-xl text-white font-bold">
          Think portfolio, not individual assets! 🏢📊
        </div>
        <div className="text-sm text-navy-400 mt-1">
          The best teams in the NEM &mdash; and in this game &mdash; manage their whole fleet as one coordinated system.
        </div>
      </div>
    </div>
  );

  const slides = [renderSlide0, renderSlide1, renderSlide2, renderSlide3, renderSlide4, renderSlide5];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-navy-800 to-navy-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-navy-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">📊</span>
          <div>
            <h1 className="text-white font-bold text-sm">Portfolio Strategy Guide</h1>
            <p className="text-navy-400 text-xs">Learn how portfolio diversity drives winning strategies</p>
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
                  ? 'w-8 h-2.5 rounded-full bg-amber-400'
                  : 'w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/40'
              }`}
              title={SLIDE_TITLES[i]}
            />
          ))}
        </div>

        <button
          onClick={currentSlide === TOTAL_SLIDES - 1 ? onClose : goNext}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors"
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
