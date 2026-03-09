import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BatteryExplainerProps {
  onClose: () => void;
}

const SLIDE_TITLES = [
  'What is a Grid-Scale Battery?',
  'State of Charge (SOC)',
  'Round-Trip Efficiency',
  'Charge vs Discharge',
  'Battery Arbitrage',
  'Charging Risk: You ARE the Demand',
  'The Diurnal Price Pattern',
  'Negative Prices: Get Paid to Charge!',
  'Your Battery Controls',
];

const TOTAL_SLIDES = SLIDE_TITLES.length;

export default function BatteryExplainer({ onClose }: BatteryExplainerProps) {
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
  //  SLIDE 0: What is a Grid-Scale Battery?
  // ═══════════════════════════════════════
  const renderSlide0 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🔋 What is a Grid-Scale Battery?</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Grid-scale batteries store electricity and release it later. They act as both <strong className="text-white">demand</strong> (when charging) and <strong className="text-white">supply</strong> (when discharging).
      </p>

      {/* Battery specs card */}
      <div className="max-w-2xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          {/* Battery graphic */}
          <div className="relative w-24 h-14 bg-navy-800 rounded-xl border-2 border-green-500/60 overflow-hidden flex-shrink-0">
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-6 bg-green-500/60 rounded-r-md" />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500/60 to-green-400/40"
              initial={{ height: '20%' }}
              animate={{ height: '75%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs z-10">
              500 MW
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">Grid-Scale Battery</div>
            <div className="text-sm text-navy-400">Big Lithium Storage Facility</div>
          </div>
        </div>

        {/* Spec grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-navy-800 rounded-xl p-4 text-center border border-green-500/20">
            <div className="text-3xl font-mono font-bold text-green-300">500</div>
            <div className="text-xs text-navy-400 mt-1">MW (Power)</div>
          </div>
          <div className="bg-navy-800 rounded-xl p-4 text-center border border-green-500/20">
            <div className="text-3xl font-mono font-bold text-green-300">2,000</div>
            <div className="text-xs text-navy-400 mt-1">MWh (Energy)</div>
          </div>
          <div className="bg-navy-800 rounded-xl p-4 text-center border border-green-500/20">
            <div className="text-3xl font-mono font-bold text-green-300">4 hr</div>
            <div className="text-xs text-navy-400 mt-1">Duration</div>
          </div>
        </div>
      </div>

      {/* Explanations */}
      <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-green-400 mb-1">⚡ 500 MW (Power Rating)</div>
          <div className="text-xs text-navy-300">
            It can charge or discharge at up to <strong className="text-white">500 MW</strong> at any moment. Think of this as the width of the pipe.
          </div>
        </div>
        <div className="bg-electric-500/10 border border-electric-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-electric-400 mb-1">🔋 2,000 MWh (Energy Capacity)</div>
          <div className="text-xs text-navy-300">
            It can store enough energy to run at full power for <strong className="text-white">4 hours</strong>. Think of this as the size of the tank.
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 1: State of Charge (SOC)
  // ═══════════════════════════════════════
  const renderSlide1 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🔋📊 State of Charge (SOC)</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        SOC is the amount of energy currently stored in the battery, shown as a percentage of total capacity.
      </p>

      {/* Animated SOC bar */}
      <div className="max-w-2xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-white">State of Charge</div>
          <div className="text-sm font-mono text-electric-300">1,200 / 2,000 MWh</div>
        </div>

        {/* SOC bar */}
        <div className="relative h-12 bg-navy-800 rounded-xl border border-white/10 overflow-hidden mb-3">
          <motion.div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-green-500/70 to-green-400/50 rounded-xl"
            initial={{ width: '10%' }}
            animate={{ width: '60%' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-white font-bold text-lg font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              60%
            </motion.span>
          </div>
          {/* Tick marks */}
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/10" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />
          <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/10" />
        </div>

        <div className="flex justify-between text-[10px] text-navy-500 font-mono px-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Key points */}
      <div className="max-w-2xl w-full space-y-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="text-lg flex-shrink-0">🎲</div>
          <div>
            <div className="text-sm font-semibold text-amber-400 mb-0.5">Random Start</div>
            <div className="text-xs text-navy-300">SOC starts randomly each round (20-80%). You need to check it before deciding your strategy.</div>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="text-lg flex-shrink-0">🔄</div>
          <div>
            <div className="text-sm font-semibold text-blue-400 mb-0.5">Changes Over Time</div>
            <div className="text-xs text-navy-300">SOC changes as you charge and discharge throughout the round. Plan ahead across all periods.</div>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="text-lg flex-shrink-0">🚫</div>
          <div>
            <div className="text-sm font-semibold text-red-400 mb-0.5">Hard Limits</div>
            <div className="text-xs text-navy-300">Can't discharge below 0% or charge above 100%. If you hit a limit, your battery is capped automatically.</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 2: Round-Trip Efficiency
  // ═══════════════════════════════════════
  const renderSlide2 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">⚡📉 Round-Trip Efficiency</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        When you charge 100 MWh from the grid, only <strong className="text-white">92 MWh</strong> is stored. The other 8% is lost as heat.
      </p>

      {/* Flow diagram */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          {/* Grid */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🏗️</div>
            <div className="text-sm font-semibold text-blue-300">Grid</div>
          </div>

          {/* Arrow with MWh */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono text-green-300 font-bold">100 MWh</div>
            <div className="text-xl text-navy-500">→</div>
          </div>

          {/* Battery */}
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🔋</div>
            <div className="text-sm font-semibold text-green-300">Battery</div>
          </div>

          {/* Arrow with stored MWh */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono text-electric-300 font-bold">92 MWh stored</div>
            <div className="text-xl text-navy-500">→</div>
          </div>

          {/* Stored indicator */}
          <div className="bg-electric-500/20 border border-electric-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-sm font-semibold text-electric-300">Usable</div>
          </div>

          {/* Loss indicator */}
          <div className="flex flex-col items-center ml-2">
            <div className="text-xl text-navy-500">↗</div>
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 text-center">
              <div className="text-xs font-mono text-red-300 font-bold">8 MWh lost</div>
              <div className="text-[10px] text-red-400">as heat</div>
            </div>
          </div>
        </div>

        {/* Efficiency bar */}
        <div className="mt-6 flex items-center gap-3">
          <div className="text-xs text-navy-400 font-medium w-24 text-right">Efficiency:</div>
          <div className="flex-1 h-6 bg-navy-800 rounded-lg overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-green-500/60 to-green-400/40 rounded-lg"
              initial={{ width: '0%' }}
              animate={{ width: '92%' }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
            <div className="absolute top-0 left-[92%] bottom-0 w-[8%] bg-red-500/30 rounded-r-lg" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white font-mono">
              92%
            </div>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center mb-6">
        <div className="text-2xl mb-2">💡</div>
        <div className="text-lg text-amber-300 font-semibold mb-1">Break-Even Spread</div>
        <div className="text-base text-navy-200">
          You need at least a <strong className="text-white">~9% price spread</strong> between charging and discharging to break even on round-trip losses.
        </div>
      </div>

      {/* Worked example */}
      <div className="max-w-2xl w-full bg-white/5 rounded-xl border border-white/10 p-5">
        <div className="text-sm font-semibold text-navy-300 mb-3 text-center">Worked Example</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="text-xs text-red-400 mb-1">Charge Cost</div>
            <div className="text-sm font-mono text-white">100 MWh @ $50</div>
            <div className="text-lg font-bold font-mono text-red-300">-$5,000</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="text-xs text-green-400 mb-1">Discharge Revenue</div>
            <div className="text-sm font-mono text-white">92 MWh @ $55</div>
            <div className="text-lg font-bold font-mono text-green-300">+$5,060</div>
          </div>
          <div className="bg-electric-500/10 border border-electric-500/20 rounded-lg p-3">
            <div className="text-xs text-electric-400 mb-1">Profit</div>
            <div className="text-sm font-mono text-white">&nbsp;</div>
            <div className="text-lg font-bold font-mono text-electric-300">$60</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 3: Charge vs Discharge
  // ═══════════════════════════════════════
  const renderSlide3 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">⚡🔄 Charge vs Discharge</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        Your battery has three modes. Understanding each is critical to making money.
      </p>

      {/* Two main mode cards side by side */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Charge mode */}
        <div className="bg-white/5 rounded-2xl border border-green-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">⬇️</div>
            <div>
              <div className="text-lg font-bold text-green-400">Charge Mode</div>
              <div className="text-xs text-navy-400">Battery draws power FROM the grid</div>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-navy-200">
              <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold">$</span>
              <span>You <strong className="text-red-300">PAY</strong> the clearing price</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-navy-200">
              <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">↑</span>
              <span>SOC goes <strong className="text-green-300">UP</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-navy-200">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">+</span>
              <span>You're adding to <strong className="text-blue-300">demand</strong></span>
            </div>
          </div>
        </div>

        {/* Discharge mode */}
        <div className="bg-white/5 rounded-2xl border border-blue-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">⬆️</div>
            <div>
              <div className="text-lg font-bold text-blue-400">Discharge Mode</div>
              <div className="text-xs text-navy-400">Battery sends power TO the grid</div>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-navy-200">
              <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">$</span>
              <span>You <strong className="text-green-300">EARN</strong> the clearing price</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-navy-200">
              <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold">↓</span>
              <span>SOC goes <strong className="text-red-300">DOWN</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-navy-200">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">+</span>
              <span>You're adding to <strong className="text-amber-300">supply</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Idle mode card */}
      <div className="max-w-4xl w-full bg-white/5 rounded-2xl border border-white/10 p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">⏸️</div>
          <div>
            <div className="text-lg font-bold text-navy-300">Idle Mode</div>
            <div className="text-xs text-navy-400">Battery does nothing this period</div>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm text-navy-400">
            <span>SOC unchanged</span>
            <span>No cost</span>
            <span>No revenue</span>
          </div>
        </div>
      </div>

      {/* Key point */}
      <div className="max-w-3xl w-full bg-white/5 rounded-xl px-6 py-4 border border-white/10 text-center">
        <div className="text-sm text-navy-300">
          💡 In the NEM, your battery <strong className="text-white">competes with other generators</strong> when discharging, and <strong className="text-white">pays the same price everyone else earns</strong> when charging.
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 4: Battery Arbitrage
  // ═══════════════════════════════════════
  const renderSlide4 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">💰📈 Battery Arbitrage</h2>
      <p className="text-lg text-navy-300 mb-2 max-w-2xl text-center">
        The core concept:
      </p>
      <p className="text-2xl font-bold text-electric-300 mb-6">
        "Buy low, sell high — with electrons"
      </p>

      {/* Combined price + action visualization */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="text-sm font-semibold text-navy-300 mb-4 text-center">Typical Daily Strategy</div>

        {/* Price bar chart with action indicators below */}
        <div className="flex items-end gap-1 h-32 px-4">
          {[
            { label: '12am', h: 20, color: 'bg-green-500/50', action: 'charge' as const },
            { label: '2am', h: 15, color: 'bg-green-500/50', action: 'charge' as const },
            { label: '4am', h: 18, color: 'bg-green-500/50', action: 'charge' as const },
            { label: '6am', h: 35, color: 'bg-navy-500/50', action: 'idle' as const },
            { label: '8am', h: 50, color: 'bg-amber-500/50', action: 'discharge' as const },
            { label: '10am', h: 40, color: 'bg-navy-500/50', action: 'idle' as const },
            { label: '12pm', h: 22, color: 'bg-green-500/50', action: 'charge' as const },
            { label: '2pm', h: 18, color: 'bg-green-500/50', action: 'charge' as const },
            { label: '4pm', h: 45, color: 'bg-amber-500/50', action: 'idle' as const },
            { label: '6pm', h: 85, color: 'bg-red-500/50', action: 'discharge' as const },
            { label: '8pm', h: 95, color: 'bg-red-500/50', action: 'discharge' as const },
            { label: '10pm', h: 55, color: 'bg-amber-500/50', action: 'discharge' as const },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full ${bar.color} rounded-t-md border border-white/10 transition-all`}
                style={{ height: `${bar.h}%` }}
              />
              <div className="text-[9px] text-navy-500 font-mono">{bar.label}</div>
            </div>
          ))}
        </div>

        {/* Action row beneath bars — shows charge/idle/discharge pattern */}
        <div className="flex gap-1 px-4 mt-2">
          {[
            { action: 'charge' as const },
            { action: 'charge' as const },
            { action: 'charge' as const },
            { action: 'idle' as const },
            { action: 'discharge' as const },
            { action: 'idle' as const },
            { action: 'charge' as const },
            { action: 'charge' as const },
            { action: 'idle' as const },
            { action: 'discharge' as const },
            { action: 'discharge' as const },
            { action: 'discharge' as const },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex-1 h-5 rounded-sm flex items-center justify-center text-[7px] font-bold tracking-tight ${
                item.action === 'charge'
                  ? 'bg-green-500/30 text-green-300 border border-green-500/30'
                  : item.action === 'discharge'
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/20'
              }`}
            >
              {item.action === 'charge' ? 'CHG' : item.action === 'discharge' ? 'DIS' : 'IDLE'}
            </div>
          ))}
        </div>

        {/* Annotations with flow arrows */}
        <div className="flex items-center justify-between mt-3 px-2">
          <div className="text-center flex-1">
            <div className="text-[10px] text-green-400 font-semibold">⬇ Charge overnight</div>
          </div>
          <div className="text-navy-600 text-xs">→</div>
          <div className="text-center flex-1">
            <div className="text-[10px] text-blue-400 font-semibold">⬆ Discharge AM peak</div>
          </div>
          <div className="text-navy-600 text-xs">→</div>
          <div className="text-center flex-1">
            <div className="text-[10px] text-green-400 font-semibold">⬇ Top-up midday</div>
          </div>
          <div className="text-navy-600 text-xs">→</div>
          <div className="text-center flex-1">
            <div className="text-[10px] text-blue-400 font-semibold">⬆ Discharge PM peak</div>
          </div>
        </div>
      </div>

      {/* Strategy cards — now 4 cards including IDLE */}
      <div className="max-w-3xl w-full grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
          <div className="text-sm font-semibold text-green-400 mb-1">⬇️ Charge</div>
          <div className="text-xs text-navy-300">
            Buy when prices are <strong className="text-white">LOW</strong>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <div className="text-sm font-semibold text-blue-400 mb-1">⬆️ Discharge</div>
          <div className="text-xs text-navy-300">
            Sell when prices are <strong className="text-white">HIGH</strong>
          </div>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-3">
          <div className="text-sm font-semibold text-gray-400 mb-1">⏸️ Idle</div>
          <div className="text-xs text-navy-300">
            Wait when prices are <strong className="text-white">MID-RANGE</strong>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <div className="text-sm font-semibold text-amber-400 mb-1">💰 Profit</div>
          <div className="text-xs text-navy-300">
            Revenue − cost − <strong className="text-white">8% losses</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 5: Charging Risk — You ARE the Demand
  // ═══════════════════════════════════════
  const renderSlide5 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">⚠️🔌 Charging Risk: You ARE the Demand</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        When your battery charges, it <strong className="text-white">adds to market demand</strong>. At 500 MW, that's enormous — and if multiple teams charge at once, prices can spike.
      </p>

      {/* Visual: supply/demand stack */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="text-sm font-semibold text-navy-300 mb-4 text-center">How Battery Charging Affects the Market</div>

        <div className="flex items-end justify-center gap-3 mb-6">
          {/* Normal demand bar */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-navy-400 mb-2 font-medium">Consumer Demand</div>
            <motion.div
              className="w-20 bg-gradient-to-t from-blue-500/50 to-blue-400/30 rounded-t-xl border border-blue-500/30 flex items-end justify-center pb-2"
              initial={{ height: 0 }}
              animate={{ height: 120 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-xs font-mono font-bold text-blue-300">5,000<br/><span className="text-[10px] font-normal">MW</span></div>
            </motion.div>
          </div>

          {/* Plus sign */}
          <div className="text-2xl text-navy-500 font-bold pb-8">+</div>

          {/* Battery charging demand */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-navy-400 mb-2 font-medium">Battery Charging</div>
            <motion.div
              className="w-20 bg-gradient-to-t from-green-500/50 to-green-400/30 rounded-t-xl border border-green-500/30 flex items-end justify-center pb-2"
              initial={{ height: 0 }}
              animate={{ height: 60 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="text-xs font-mono font-bold text-green-300">1,500<br/><span className="text-[10px] font-normal">MW</span></div>
            </motion.div>
          </div>

          {/* Equals sign */}
          <div className="text-2xl text-navy-500 font-bold pb-8">=</div>

          {/* Total demand bar */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-navy-400 mb-2 font-medium">Total Demand</div>
            <motion.div
              className="w-20 bg-gradient-to-t from-red-500/50 to-red-400/30 rounded-t-xl border border-red-500/30 flex items-end justify-center pb-2"
              initial={{ height: 0 }}
              animate={{ height: 180 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="text-xs font-mono font-bold text-red-300">6,500<br/><span className="text-[10px] font-normal">MW</span></div>
            </motion.div>
          </div>
        </div>

        <div className="text-center text-sm text-navy-300">
          More demand = the merit order stack is dispatched <strong className="text-white">further up</strong> = <strong className="text-red-300">higher clearing price</strong>
        </div>
      </div>

      {/* Scenario comparison */}
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-green-400 mb-2">✅ Smart Charging</div>
          <div className="text-xs text-navy-300 space-y-1.5">
            <div>• Charge when market has <strong className="text-white">excess capacity</strong></div>
            <div>• Overnight lulls and midday solar glut</div>
            <div>• Your 500 MW is absorbed easily</div>
            <div>• Clearing price stays <strong className="text-green-300">low</strong></div>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="text-sm font-semibold text-red-400 mb-2">❌ Reckless Charging</div>
          <div className="text-xs text-navy-300 space-y-1.5">
            <div>• 3 teams charge 500 MW at the same time</div>
            <div>• That's <strong className="text-white">+1,500 MW</strong> of extra demand</div>
            <div>• Expensive peakers get dispatched</div>
            <div>• Clearing price <strong className="text-red-300">spikes</strong> — and you pay it!</div>
          </div>
        </div>
      </div>

      {/* Key insight callout */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">💡</div>
        <div className="text-lg text-amber-300 font-semibold mb-1">Watch the SOC, Watch the Market</div>
        <div className="text-base text-navy-200">
          Plan your charging for periods with <strong className="text-white">lots of excess capacity</strong>. If you suspect other teams are also charging, consider waiting — you don't want to be the one driving the price up and then paying that inflated price.
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 6: The Diurnal Price Pattern
  // ═══════════════════════════════════════
  const renderSlide6 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">📊🌅 The Diurnal Price Pattern</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        NEM prices follow a predictable daily pattern driven by demand and renewable generation.
      </p>

      {/* Period chart */}
      <div className="max-w-3xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
        <div className="grid grid-cols-4 gap-3 items-end h-56">
          {/* Overnight */}
          <div className="flex flex-col items-center h-full justify-end">
            <motion.div
              className="w-full bg-gradient-to-t from-indigo-500/40 to-indigo-400/20 rounded-t-xl border border-indigo-500/30 flex flex-col items-center justify-end p-3"
              initial={{ height: 0 }}
              animate={{ height: '30%' }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-lg">🌙</div>
              <div className="text-xs font-bold text-indigo-300 mt-1">$30-50</div>
            </motion.div>
            <div className="mt-2 text-center">
              <div className="text-xs font-bold text-indigo-300">Overnight</div>
              <div className="text-[10px] text-navy-500">00:00 - 06:00</div>
              <div className="text-[10px] text-navy-400 mt-1">Low demand, cheap generation</div>
            </div>
          </div>

          {/* Morning */}
          <div className="flex flex-col items-center h-full justify-end">
            <motion.div
              className="w-full bg-gradient-to-t from-amber-500/40 to-amber-400/20 rounded-t-xl border border-amber-500/30 flex flex-col items-center justify-end p-3"
              initial={{ height: 0 }}
              animate={{ height: '55%' }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-lg">🌤️</div>
              <div className="text-xs font-bold text-amber-300 mt-1">$60-90</div>
            </motion.div>
            <div className="mt-2 text-center">
              <div className="text-xs font-bold text-amber-300">Morning</div>
              <div className="text-[10px] text-navy-500">06:00 - 12:00</div>
              <div className="text-[10px] text-navy-400 mt-1">Solar ramps up, prices moderate</div>
            </div>
          </div>

          {/* Afternoon */}
          <div className="flex flex-col items-center h-full justify-end">
            <motion.div
              className="w-full bg-gradient-to-t from-green-500/40 to-green-400/20 rounded-t-xl border border-green-500/30 flex flex-col items-center justify-end p-3"
              initial={{ height: 0 }}
              animate={{ height: '25%' }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="text-lg">☀️</div>
              <div className="text-xs font-bold text-green-300 mt-1">$10-40</div>
            </motion.div>
            <div className="mt-2 text-center">
              <div className="text-xs font-bold text-green-300">Afternoon</div>
              <div className="text-[10px] text-navy-500">12:00 - 18:00</div>
              <div className="text-[10px] text-navy-400 mt-1">Solar flood pushes prices down</div>
            </div>
          </div>

          {/* Evening */}
          <div className="flex flex-col items-center h-full justify-end">
            <motion.div
              className="w-full bg-gradient-to-t from-red-500/40 to-red-400/20 rounded-t-xl border border-red-500/30 flex flex-col items-center justify-end p-3"
              initial={{ height: 0 }}
              animate={{ height: '90%' }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="text-lg">🌆</div>
              <div className="text-xs font-bold text-red-300 mt-1">$100-300+</div>
            </motion.div>
            <div className="mt-2 text-center">
              <div className="text-xs font-bold text-red-300">Evening</div>
              <div className="text-[10px] text-navy-500">18:00 - 24:00</div>
              <div className="text-[10px] text-navy-400 mt-1">Solar gone + high demand = PEAK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Callout */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">💡</div>
        <div className="text-lg text-amber-300 font-semibold mb-1">The Battery Playbook</div>
        <div className="text-base text-navy-200">
          This is why batteries <strong className="text-white">charge overnight and at midday</strong>, then <strong className="text-white">discharge in the evening</strong>. The bigger the price spread, the more profit you make.
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 7: Negative Prices
  // ═══════════════════════════════════════
  const renderSlide7 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">📉💰 Negative Prices</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        When supply massively exceeds demand, prices go <strong className="text-red-400">negative</strong>. This is your battery's <strong className="text-green-400">golden opportunity</strong>.
      </p>

      {/* Negative price mechanics */}
      <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Why prices go negative */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <div className="text-xl mb-2">⚠️</div>
          <div className="text-sm font-bold text-red-300 mb-2">When Supply {'>'} 3× Demand</div>
          <div className="text-sm text-navy-200 space-y-2">
            <p>If total supply offered is <strong className="text-white">3× or more</strong> than demand, the price crashes to <strong className="text-red-400">-$1,000/MWh</strong>.</p>
            <p className="text-xs text-navy-400">This happens when: too many batteries discharge at once, renewables flood low-demand periods, or everyone bids aggressively into an oversupplied market.</p>
          </div>
        </div>

        {/* Battery opportunity */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
          <div className="text-xl mb-2">🤑</div>
          <div className="text-sm font-bold text-green-300 mb-2">Battery: Get PAID to Charge</div>
          <div className="text-sm text-navy-200 space-y-2">
            <p>When the clearing price is <strong className="text-red-400">-$100/MWh</strong>, charging 500 MW for 6 hours means:</p>
            <p className="font-mono text-green-400 text-center text-lg">+$300,000</p>
            <p className="text-xs text-navy-400">You're literally paid to absorb excess power. Then discharge at evening peak prices for double profit!</p>
          </div>
        </div>
      </div>

      {/* Example scenario */}
      <div className="max-w-2xl w-full bg-navy-800/50 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="text-sm font-bold text-white mb-3">Example: Spring Afternoon Oversupply</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-navy-400 mb-1">Demand</div>
            <div className="text-lg font-mono font-bold text-amber-400">1,500 MW</div>
          </div>
          <div>
            <div className="text-xs text-navy-400 mb-1">Supply Offered</div>
            <div className="text-lg font-mono font-bold text-red-400">5,000 MW</div>
          </div>
          <div>
            <div className="text-xs text-navy-400 mb-1">Clearing Price</div>
            <div className="text-lg font-mono font-bold text-red-500">-$1,000/MWh</div>
          </div>
        </div>
        <div className="text-xs text-navy-400 mt-3 text-center">
          Supply is 3.3× demand → oversupply trigger → price floor hit. Every dispatched generator <strong className="text-red-400">loses money</strong>.
        </div>
      </div>

      {/* Callout */}
      <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">💡</div>
        <div className="text-lg text-amber-300 font-semibold mb-1">The Smart Play</div>
        <div className="text-base text-navy-200">
          During oversupply: set thermal assets to <strong className="text-white">idle or bid very high</strong> (so they're not dispatched). Set your battery to <strong className="text-green-400">CHARGE</strong>. Then <strong className="text-white">discharge in the evening</strong> when prices spike. This is exactly what happens in the real NEM.
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  SLIDE 8: Your Battery Controls
  // ═══════════════════════════════════════
  const renderSlide8 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🎮⚡ Your Battery Controls</h2>
      <p className="text-lg text-navy-300 mb-8 max-w-2xl text-center">
        In the bidding screen, you'll see a special control for your battery.
      </p>

      {/* Mock battery control panel */}
      <div className="max-w-2xl w-full bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">🔋</span>
          <div>
            <div className="text-xl font-bold text-white">Big Lithium Battery</div>
            <div className="text-sm text-navy-400">500 MW / 2,000 MWh</div>
          </div>
        </div>

        {/* 3-way toggle */}
        <div className="mb-5">
          <div className="text-xs text-navy-400 uppercase tracking-wide mb-2 font-medium">Mode Select</div>
          <div className="flex bg-navy-800 rounded-xl p-1 border border-white/10">
            <div className="flex-1 py-2.5 rounded-lg text-center text-sm font-medium text-navy-500 transition-colors">
              Charge
            </div>
            <div className="flex-1 py-2.5 rounded-lg text-center text-sm font-medium text-navy-500 transition-colors">
              Idle
            </div>
            <div className="flex-1 py-2.5 rounded-lg bg-blue-500/30 text-blue-300 text-center text-sm font-bold border border-blue-500/40 transition-colors">
              Discharge
            </div>
          </div>
        </div>

        {/* Discharge fields (since Discharge is selected) */}
        <div className="mb-5 bg-navy-800/50 rounded-xl p-4 border border-blue-500/20">
          <div className="text-xs text-blue-300 font-medium mb-3">Discharge Settings</div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-[10px] text-navy-400 mb-1 uppercase tracking-wide">Price $/MWh</div>
              <div className="bg-navy-800 rounded-lg border-2 border-blue-500/40 p-3 text-center">
                <div className="text-xl font-mono font-bold text-blue-300">$120</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-navy-400 mb-1 uppercase tracking-wide">Quantity MW</div>
              <div className="bg-navy-800 rounded-lg border-2 border-blue-500/40 p-3 text-center">
                <div className="text-xl font-mono font-bold text-blue-300">500</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charge mode example (dimmed) */}
        <div className="mb-5 bg-navy-800/30 rounded-xl p-4 border border-white/5 opacity-50">
          <div className="text-xs text-green-400/70 font-medium mb-2">When Charge is selected:</div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-[10px] text-navy-500 mb-1 uppercase tracking-wide">Charge MW</div>
              <div className="bg-navy-800 rounded-lg border border-white/10 p-3 text-center">
                <div className="text-xl font-mono font-bold text-green-400/50">300</div>
              </div>
            </div>
          </div>
        </div>

        {/* SOC bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-navy-400 font-medium">State of Charge</div>
            <div className="text-xs font-mono text-electric-300">1,200 / 2,000 MWh (60%)</div>
          </div>
          <div className="h-8 bg-navy-800 rounded-lg border border-white/10 overflow-hidden relative">
            <div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-green-500/60 to-green-400/40 rounded-lg"
              style={{ width: '60%' }}
            />
            <div className="absolute inset-0 flex items-center px-3">
              <div className="flex items-center gap-0.5 w-full">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-4 rounded-sm ${i < 6 ? 'bg-green-400/60' : 'bg-navy-700'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final insight */}
      <div className="max-w-2xl w-full bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center mb-4">
        <div className="text-2xl mb-2">💡</div>
        <div className="text-lg text-green-300 font-semibold mb-1">Different Modes for Different Periods!</div>
        <div className="text-base text-navy-200">
          Set <strong className="text-white">Charge</strong> for overnight and afternoon periods, then switch to <strong className="text-white">Discharge</strong> for the evening peak. Plan your whole day!
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl w-full text-center">
        <div className="text-xl text-white font-bold">
          You're ready to manage your battery! 🎉
        </div>
      </div>
    </div>
  );

  const slides = [renderSlide0, renderSlide1, renderSlide2, renderSlide3, renderSlide4, renderSlide5, renderSlide6, renderSlide7, renderSlide8];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-navy-800 to-navy-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-navy-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔋</span>
          <div>
            <h1 className="text-white font-bold text-sm">Battery Guide</h1>
            <p className="text-navy-400 text-xs">Learn how to operate your grid-scale battery</p>
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
