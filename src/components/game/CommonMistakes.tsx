import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommonMistakesProps {
  onClose: () => void;
}

interface Mistake {
  icon: string;
  title: string;
  whatHappens: string;
  tip: string;
  category: 'bidding' | 'strategy' | 'assets';
}

const MISTAKES: Mistake[] = [
  {
    icon: '🎯',
    title: 'Everyone Bids $0',
    whatHappens: 'The clearing price is $0 and nobody covers their costs — everyone loses money.',
    tip: 'If everyone is a price-taker, who sets the price? You need someone to bid above zero. Consider splitting your bids across different price levels.',
    category: 'bidding',
  },
  {
    icon: '🚫',
    title: 'Bidding Above Price Cap',
    whatHappens: 'Your asset is not dispatched and earns nothing that period.',
    tip: 'The market price cap is $20,000/MWh. Any bid higher than this means your asset simply won\'t run. Check your bid prices before submitting!',
    category: 'bidding',
  },
  {
    icon: '😴',
    title: 'Forgetting to Bid Some Assets',
    whatHappens: 'Those assets bid 0 MW and sit idle — earning no revenue while you still pay fixed costs. With guardrails on, you\'ll get a warning before submitting.',
    tip: 'Deliberately sitting an asset idle can be a valid strategy (e.g. withdrawing capacity to tighten supply), but make sure it\'s intentional! The review screen highlights any assets with 0 MW bids.',
    category: 'bidding',
  },
  {
    icon: '💰',
    title: 'Bidding Coal at Peaker Prices',
    whatHappens: 'Your coal plant doesn\'t get dispatched because it\'s too expensive compared to other coal bids. You lose money from idle costs.',
    tip: 'Look at your marginal cost badge. Coal costs ~$35/MWh — bidding it at $150 means it won\'t run unless demand is extreme. Bid close to your marginal cost for baseload assets.',
    category: 'strategy',
  },
  {
    icon: '🔋',
    title: 'Not Managing Battery Charge/Discharge',
    whatHappens: 'Your battery sits idle or you forget to toggle between charge and discharge modes. You miss the arbitrage revenue opportunity and earn nothing from it.',
    tip: 'Use the charge/discharge toggle to set your battery mode each period. Charge during cheap periods (overnight, midday solar surplus) and discharge when prices peak (evening). Watch your State of Charge (SOC) — you can\'t discharge an empty battery or charge a full one! Remember: your 500 MW of charging adds to market demand, so charge when there\'s excess supply capacity to avoid driving up the price you pay.',
    category: 'assets',
  },
  {
    icon: '📉',
    title: 'Ignoring Negative Prices',
    whatHappens: 'Your generators are dispatched during oversupply and you PAY to produce electricity. If total supply exceeds demand by 3× or more, the price crashes to -$1,000/MWh — every dispatched MW costs you dearly.',
    tip: 'Watch for oversupply signals: spring season, strong renewables, low demand. When supply massively exceeds demand, bid your thermal assets HIGH to avoid dispatch, and set your battery to CHARGE — you get paid to absorb power! The spread between negative daytime prices and positive evening prices is where the real money is.',
    category: 'strategy',
  },
  {
    icon: '🔄',
    title: 'Same Strategy Every Round',
    whatHappens: 'You miss seasonal opportunities and scenarios that reward adaptive bidding. Other teams who adjust will overtake you.',
    tip: 'Read the round description! Summer and spring have very different dynamics. Adapt your strategy to the season, demand levels, and any scenario events.',
    category: 'strategy',
  },
];

const CATEGORY_COLORS = {
  bidding: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'Bidding Error' },
  strategy: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: 'Strategy Pitfall' },
  assets: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', label: 'Asset Mistake' },
};

export default function CommonMistakes({ onClose }: CommonMistakesProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-3 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-amber-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">⚠️</span> Common Mistakes
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Avoid these pitfalls to maximise your profit</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg text-sm font-medium transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mistakes List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {MISTAKES.map((mistake, idx) => {
            const cat = CATEGORY_COLORS[mistake.category];
            const isExpanded = expandedIdx === idx;

            return (
              <motion.div
                key={idx}
                layout
                className={`rounded-xl border ${cat.border} ${cat.bg} overflow-hidden cursor-pointer`}
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              >
                <div className="px-4 py-3 flex items-start gap-3">
                  <span className="text-2xl mt-0.5 flex-shrink-0">{mistake.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-800">{mistake.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat.badge}`}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      <span className="font-semibold text-gray-700">What happens: </span>
                      {mistake.whatHappens}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 pt-0 ml-9">
                        <div className="bg-white/70 rounded-lg p-3 border border-white/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm">💡</span>
                            <span className="text-xs font-bold text-green-700">How to avoid it</span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">{mistake.tip}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </div>
  );
}
