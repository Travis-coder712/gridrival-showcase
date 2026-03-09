import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BatteryBiddingExplainerProps {
  onComplete: () => void;
}

const SLIDE_TITLES = [
  'From Minigame to Real Rounds',
  'Your Battery Controls',
  'Charge = Demand, Discharge = Supply',
  'Strategy Tips',
];

const TOTAL_SLIDES = SLIDE_TITLES.length;

export default function BatteryBiddingExplainer({ onComplete }: BatteryBiddingExplainerProps) {
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
      else if (e.key === 'Escape') { e.preventDefault(); onComplete(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onComplete]);

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
  //  SLIDE 0: From Minigame to Real Rounds
  // ═══════════════════════════════════════
  const renderSlide0 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">⚡→🔋 From Minigame to Real Rounds</h2>
      <p className="text-lg text-navy-300 mb-4 max-w-2xl text-center">
        Great job with the battery minigame! In the actual game, the same principles apply — charge when prices are low, discharge when prices are high.
      </p>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        The difference: instead of making hourly decisions, each round has <strong className="text-white">4 periods of 6 hours each</strong>.
      </p>

      {/* 4-period visual */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
        <div className="text-sm font-semibold text-navy-300 mb-4 text-center">Your Day at a Glance</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Overnight */}
          <motion.div
            className="bg-indigo-500/15 border border-indigo-500/30 rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-2xl mb-2">🌙</div>
            <div className="text-sm font-bold text-indigo-300">Overnight</div>
            <div className="text-xs text-navy-400 mt-1">12am - 6am</div>
            <div className="text-[10px] text-navy-500 mt-2">6 hours</div>
          </motion.div>

          {/* Morning */}
          <motion.div
            className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-2xl mb-2">🌤️</div>
            <div className="text-sm font-bold text-amber-300">Morning</div>
            <div className="text-xs text-navy-400 mt-1">6am - 12pm</div>
            <div className="text-[10px] text-navy-500 mt-2">6 hours</div>
          </motion.div>

          {/* Afternoon */}
          <motion.div
            className="bg-green-500/15 border border-green-500/30 rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-2xl mb-2">☀️</div>
            <div className="text-sm font-bold text-green-300">Afternoon</div>
            <div className="text-xs text-navy-400 mt-1">12pm - 6pm</div>
            <div className="text-[10px] text-navy-500 mt-2">6 hours</div>
          </motion.div>

          {/* Evening */}
          <motion.div
            className="bg-red-500/15 border border-red-500/30 rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-2xl mb-2">🌆</div>
            <div className="text-sm font-bold text-red-300">Evening</div>
            <div className="text-xs text-navy-400 mt-1">6pm - 12am</div>
            <div className="text-[10px] text-navy-500 mt-2">6 hours</div>
          </motion.div>
        </div>
      </div>

      {/* Key callout */}
      <div className="max-w-2xl w-full bg-electric-500/10 border border-electric-500/30 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">💡</div>
        <div className="text-base text-navy-200">
          You'll set your battery strategy for <strong className="text-white">each of these 4 periods</strong> before the round begins. Plan ahead!
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 1: Your Battery Controls
  // ═══════════════════════════════════════
  const renderSlide1 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🎛️ Your Battery Controls</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        For each period, you'll choose one of three modes:
      </p>

      {/* Three mode cards */}
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Charge */}
        <motion.div
          className="bg-white/5 rounded-2xl border border-green-500/30 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">⚡</div>
            <div className="text-lg font-bold text-green-400">Charge</div>
          </div>
          <div className="text-sm text-navy-200 space-y-2">
            <p>Draw power from the grid, filling your battery.</p>
            <p className="text-red-300 text-xs font-medium">You pay the clearing price.</p>
          </div>
        </motion.div>

        {/* Idle */}
        <motion.div
          className="bg-white/5 rounded-2xl border border-white/10 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">⏸</div>
            <div className="text-lg font-bold text-navy-300">Idle</div>
          </div>
          <div className="text-sm text-navy-200 space-y-2">
            <p>Do nothing. SOC stays the same.</p>
            <p className="text-navy-400 text-xs font-medium">No cost, no revenue.</p>
          </div>
        </motion.div>

        {/* Discharge */}
        <motion.div
          className="bg-white/5 rounded-2xl border border-blue-500/30 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">🔋</div>
            <div className="text-lg font-bold text-blue-400">Discharge</div>
          </div>
          <div className="text-sm text-navy-200 space-y-2">
            <p>Send power to the grid as a generator.</p>
            <p className="text-green-300 text-xs font-medium">You earn the clearing price.</p>
          </div>
        </motion.div>
      </div>

      {/* Target level explanation */}
      <div className="max-w-2xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-xl flex-shrink-0">🎯</div>
          <div>
            <div className="text-sm font-semibold text-white mb-1">Set a Target Level</div>
            <div className="text-sm text-navy-300">
              You can also set a <strong className="text-white">target level</strong>: "Charge to 75%" or "Discharge to 0%". This controls how much energy your battery moves in that period.
            </div>
          </div>
        </div>
      </div>

      {/* 6-hour battery note */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">⏱️</div>
        <div className="text-lg text-amber-300 font-semibold mb-1">6-Hour Battery</div>
        <div className="text-base text-navy-200">
          Your battery is a <strong className="text-white">6-hour battery</strong> — it can fully charge or discharge in a single period.
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 2: Charge = Demand, Discharge = Supply
  // ═══════════════════════════════════════
  const renderSlide2 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">⚖️ Charge = Demand, Discharge = Supply</h2>

      {/* Charging impact */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-green-500/20 p-6 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl flex-shrink-0">⬇️</div>
          <div>
            <div className="text-lg font-bold text-green-400 mb-1">When You Charge</div>
            <div className="text-sm text-navy-200">
              Your battery adds to <strong className="text-white">total demand</strong> — other generators must serve your load too.
            </div>
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-navy-400">Many teams charge</span>
              <span className="text-navy-500">→</span>
              <span className="text-xs text-navy-400">Demand rises</span>
              <span className="text-navy-500">→</span>
            </div>
            <motion.div
              className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1.5"
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1.05, 1] }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <span className="text-sm font-bold text-red-300">Prices UP</span>
              <span className="text-red-400">↑</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Discharging impact */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-blue-500/20 p-6 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl flex-shrink-0">⬆️</div>
          <div>
            <div className="text-lg font-bold text-blue-400 mb-1">When You Discharge</div>
            <div className="text-sm text-navy-200">
              Your battery acts as a <strong className="text-white">generator</strong> competing in the merit order.
            </div>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-navy-400">Many teams discharge</span>
              <span className="text-navy-500">→</span>
              <span className="text-xs text-navy-400">Supply rises</span>
              <span className="text-navy-500">→</span>
            </div>
            <motion.div
              className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1.5"
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1.05, 1] }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <span className="text-sm font-bold text-green-300">Prices DROP</span>
              <span className="text-green-400">↓</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Efficiency callout */}
      <div className="max-w-3xl w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">⚡</div>
        <div className="text-lg text-amber-300 font-semibold mb-1">92% Round-Trip Efficiency</div>
        <div className="text-base text-navy-200">
          You lose <strong className="text-white">8% of energy</strong> in the round trip. You need to earn more discharging than you paid to charge!
        </div>

        {/* Mini worked example */}
        <div className="mt-4 grid grid-cols-3 gap-3 max-w-lg mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
            <div className="text-[10px] text-red-400 mb-1">Charge Cost</div>
            <div className="text-sm font-mono font-bold text-red-300">$50/MWh</div>
          </div>
          <div className="bg-navy-800/50 border border-white/10 rounded-lg p-3 text-center">
            <div className="text-[10px] text-navy-400 mb-1">Break-Even</div>
            <div className="text-sm font-mono font-bold text-white">$54.35/MWh</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
            <div className="text-[10px] text-green-400 mb-1">Need to Earn</div>
            <div className="text-sm font-mono font-bold text-green-300">{'>'}$54.35</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 3: Strategy Tips
  // ═══════════════════════════════════════
  const renderSlide3 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🧠 Strategy Tips</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Keep these principles in mind as you plan your battery strategy.
      </p>

      {/* Tips grid */}
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Tip 1 */}
        <motion.div
          className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">🌙</div>
            <div>
              <div className="text-sm font-semibold text-indigo-300 mb-1">Charge Overnight</div>
              <div className="text-sm text-navy-200">
                Lowest demand, lowest prices. The overnight period is usually the cheapest time to fill your battery.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tip 2 */}
        <motion.div
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">☀️</div>
            <div>
              <div className="text-sm font-semibold text-amber-300 mb-1">Discharge in Afternoon/Evening</div>
              <div className="text-sm text-navy-200">
                Highest demand, highest prices. Sell your stored energy when the grid needs it most and you'll earn top dollar.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tip 3 */}
        <motion.div
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">⚠️</div>
            <div>
              <div className="text-sm font-semibold text-red-300 mb-1">Watch Out for Herd Behavior</div>
              <div className="text-sm text-navy-200">
                If everyone charges at the same time, it raises prices. If everyone discharges together, prices crash. Think about what other teams might do.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tip 4 */}
        <motion.div
          className="bg-electric-500/10 border border-electric-500/20 rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">💡</div>
            <div>
              <div className="text-sm font-semibold text-electric-300 mb-1">Consider Idling</div>
              <div className="text-sm text-navy-200">
                Sometimes the best move is to do nothing. Idle in some periods to wait for better opportunities rather than forcing a trade.
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Final CTA */}
      <div className="max-w-2xl w-full text-center">
        <motion.button
          onClick={onComplete}
          className="px-8 py-4 bg-gradient-to-r from-electric-500 to-green-500 hover:from-electric-400 hover:to-green-400 text-white rounded-2xl text-lg font-bold transition-all shadow-lg shadow-electric-500/25 hover:shadow-electric-500/40"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Got it — Start Bidding! →
        </motion.button>
        <div className="text-xs text-navy-500 mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-navy-400 text-[10px]">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-navy-400 text-[10px]">Esc</kbd> to continue
        </div>
      </div>
    </div>
  );

  const slides = [renderSlide0, renderSlide1, renderSlide2, renderSlide3];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-navy-800 to-navy-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-navy-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚡🔋</span>
          <div>
            <h1 className="text-white font-bold text-sm">Battery Bidding Guide</h1>
            <p className="text-navy-400 text-xs">From minigame to real rounds</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-navy-400">
            {SLIDE_TITLES[currentSlide]}
          </div>
          <button
            onClick={onComplete}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg text-xs transition-colors"
          >
            Skip
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
          onClick={currentSlide === TOTAL_SLIDES - 1 ? onComplete : goNext}
          className="flex items-center gap-2 px-4 py-2 bg-electric-500 hover:bg-electric-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {currentSlide === TOTAL_SLIDES - 1 ? 'Start Bidding!' : 'Next'}
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
