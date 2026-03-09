import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleGrid from '../components/landing/ParticleGrid';
import PhotoCarousel from '../components/landing/PhotoCarousel';
import EnergyTicker from '../components/landing/EnergyTicker';
import StatsCounter from '../components/landing/StatsCounter';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-navy-950">
      {/* Layer 0: Particle network */}
      <ParticleGrid />

      {/* Layer 1: Photo carousel (low opacity background) */}
      <PhotoCarousel />

      {/* Layer 2: Scrolling news ticker */}
      <EnergyTicker />

      {/* Layer 3: Main content */}
      <div className="relative z-[5] min-h-screen flex flex-col items-center justify-center px-4 pt-12 pb-8">
        <div className="max-w-2xl w-full text-center">

          {/* Animated Lightning Bolt */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-4"
          >
            <div className="inline-block glow-pulse">
              <svg viewBox="0 0 64 64" className="w-16 h-16 md:w-20 md:h-20 mx-auto" fill="none">
                <path
                  d="M38 4L14 36h14l-4 24 24-32H34l4-24z"
                  fill="url(#bolt-gradient)"
                  stroke="rgba(71,167,255,0.5)"
                  strokeWidth="1"
                />
                <defs>
                  <linearGradient id="bolt-gradient" x1="14" y1="4" x2="48" y2="60">
                    <stop offset="0%" stopColor="#75bdff" />
                    <stop offset="100%" stopColor="#3182ce" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* Title - Terminal / Bloomberg style */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-mono text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-widest mb-1"
            style={{ textShadow: '0 0 40px rgba(71, 167, 255, 0.3), 0 0 80px rgba(71, 167, 255, 0.1)' }}
          >
            GRIDRIVAL
          </motion.h1>

          {/* Subtitle with staggered letter reveal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-4"
          >
            <h2 className="text-xl md:text-3xl font-medium text-electric-300 tracking-[0.3em] font-mono">
              {'BID. DISPATCH. DOMINATE.'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.04, duration: 0.3 }}
                >
                  {char}
                </motion.span>
              ))}
            </h2>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-navy-300 text-sm md:text-base max-w-lg mx-auto mb-10"
          >
            Every Megawatt has its price. Master Australia&apos;s National Electricity
            Market through live bidding simulation.
          </motion.p>

          {/* Demo notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="max-w-lg mx-auto mb-6"
          >
            <div className="bg-white/5 border border-electric-500/20 rounded-xl px-5 py-3 text-xs text-navy-300 text-center">
              Demo showcase &mdash; explore educational content and minigames.
              The multiplayer game requires the full server.
            </div>
          </motion.div>

          {/* Battery Forecast Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.85, duration: 0.6 }}
            className="max-w-lg mx-auto mb-6"
          >
            <motion.button
              onClick={() => navigate('/battery-forecast')}
              className="group relative w-full bg-white/5 hover:bg-white/10 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-5 transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="shimmer-overlay" />
              <div className="relative z-10 flex items-center gap-4">
                <svg className="w-10 h-10 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <div className="text-left">
                  <div className="text-base font-bold text-white">Battery Forecast Challenge</div>
                  <div className="text-xs text-navy-300">
                    Bid a real NEM battery against AEMO price forecasts &bull; Real market data
                  </div>
                </div>
                <div className="flex-shrink-0 text-amber-500/60 text-xs font-mono uppercase tracking-wider">
                  New
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Guides & Background button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1, duration: 0.6 }}
            className="flex items-center justify-center mb-10"
          >
            <motion.button
              onClick={() => navigate('/guides')}
              className="px-6 py-3 text-sm font-medium text-electric-300 border border-electric-500/30 hover:border-electric-400 hover:bg-electric-500/10 rounded-xl transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              📚 Guides &amp; Background
            </motion.button>
          </motion.div>

          {/* Animated stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.8 }}
          >
            <StatsCounter />
          </motion.div>

          {/* Footer tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 0.8 }}
            className="mt-10 text-navy-500 text-xs"
          >
            Up to 15 teams &bull; 6 game modes &bull; Real NEM scenarios &bull; Real AEMO data &bull; Coal to batteries &bull; Dark mode
          </motion.p>
        </div>
      </div>

    </div>
  );
}
