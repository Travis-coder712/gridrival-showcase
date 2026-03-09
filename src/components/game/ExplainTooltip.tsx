import { useState, useRef, useEffect } from 'react';

interface ExplainTooltipProps {
  term: string;
  explanation: string;
  children: React.ReactNode;
}

/**
 * Explain Tooltip (Improvement 5.3)
 * Wraps any content with a "?" icon that shows a plain-English explanation on tap/hover.
 */
export default function ExplainTooltip({ term, explanation, children }: ExplainTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <span className="relative inline-flex items-center gap-0.5" ref={tooltipRef}>
      {children}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200 text-[9px] font-bold leading-none transition-colors flex-shrink-0"
        aria-label={`Explain: ${term}`}
      >
        ?
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[200] w-64 bg-gray-900 text-white rounded-lg shadow-xl px-3 py-2.5 text-xs leading-relaxed animate-fade-in">
          <div className="font-bold text-electric-300 mb-1">{term}</div>
          <div className="text-gray-200">{explanation}</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
        </div>
      )}
    </span>
  );
}

/**
 * Common NEM term explanations for reuse throughout the app.
 */
export const NEM_TERMS = {
  clearingPrice: {
    term: 'Clearing Price',
    explanation: 'The price of the last (most expensive) generator dispatched to meet demand. ALL dispatched generators earn this same price, regardless of what they bid.',
  },
  meritOrder: {
    term: 'Merit Order',
    explanation: 'The way AEMO stacks all bids from cheapest to most expensive. The cheapest generators run first. The most expensive generator needed to meet demand sets the price for everyone. When multiple generators bid the same price at the margin, dispatch is split pro-rata (proportionally).',
  },
  srmc: {
    term: 'Short Run Marginal Cost (SRMC)',
    explanation: 'The cost of producing one extra MWh of electricity. Includes fuel costs, but not fixed costs like building the plant. You need to bid above this to make a profit.',
  },
  reserveMargin: {
    term: 'Reserve Margin',
    explanation: 'The percentage of extra supply available beyond what demand requires. Low reserve margins mean the system is tight and prices are likely to be high.',
  },
  dispatch: {
    term: 'Dispatch',
    explanation: 'When AEMO chooses to run your generator because your bid was low enough. Dispatched generators earn revenue. Non-dispatched generators earn nothing.',
  },
  capacityFactor: {
    term: 'Capacity Factor',
    explanation: 'The percentage of a generator\'s maximum output that\'s actually available. Wind and solar have variable capacity factors depending on weather conditions.',
  },
  arbitrage: {
    term: 'Arbitrage',
    explanation: 'Making money by buying low and selling high. Batteries earn arbitrage revenue by charging when prices are low and discharging when prices are high. The profit is the spread minus efficiency losses. Note: battery charging adds to market demand, which can push prices higher.',
  },
  priceTaker: {
    term: 'Price Taker',
    explanation: 'A bidding strategy where you bid at $0 to guarantee dispatch. You "take" whatever price the market sets. Good for low-cost generators that always want to run.',
  },
  priceMaker: {
    term: 'Price Maker',
    explanation: 'When your bid sets the clearing price for the market. If you\'re the last generator dispatched, your bid price becomes the clearing price that ALL generators receive.',
  },
  negativePrices: {
    term: 'Negative Prices',
    explanation: 'When supply massively exceeds demand (3× or more), the clearing price crashes to -$1,000/MWh. Dispatched generators PAY to produce. This happens in the real NEM during spring midday when solar and wind flood the market. Batteries profit by charging during negative prices (getting paid to absorb power) and discharging later when prices recover.',
  },
} as const;
