import { TIME_PERIOD_SHORT_LABELS } from '../../../shared/types';
import type { TimePeriod } from '../../../shared/types';

interface PriceHistoryChartProps {
  historicalPrices: Array<{
    roundNumber: number;
    roundName: string;
    prices: Record<string, number>;
  }>;
}

const PERIOD_COLORS: Record<string, string> = {
  night_offpeak: '#6366f1', // Indigo
  day_offpeak: '#f59e0b',   // Amber
  day_peak: '#ef4444',      // Red
  night_peak: '#8b5cf6',    // Violet
};

/**
 * Price History Chart (Improvement 4.5)
 * Shows clearing price trends across rounds as a simple inline sparkline chart.
 */
export default function PriceHistoryChart({ historicalPrices }: PriceHistoryChartProps) {
  if (historicalPrices.length === 0) return null;

  // Get all periods that appear across rounds
  const allPeriods = Array.from(
    new Set(historicalPrices.flatMap(r => Object.keys(r.prices)))
  );

  // Calculate scale
  const allValues = historicalPrices.flatMap(r => Object.values(r.prices));
  const maxPrice = Math.max(...allValues, 1);
  const minPrice = Math.min(...allValues, 0);
  const range = maxPrice - minPrice || 1;

  const chartWidth = 280;
  const chartHeight = 100;
  const padding = { top: 10, right: 10, bottom: 25, left: 40 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const xStep = historicalPrices.length > 1 ? innerW / (historicalPrices.length - 1) : innerW / 2;

  const toX = (i: number) => padding.left + i * xStep;
  const toY = (v: number) => padding.top + innerH - ((v - minPrice) / range) * innerH;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📈</span>
          <h3 className="text-sm font-semibold text-gray-700">Price History</h3>
        </div>
        {/* Legend */}
        <div className="flex gap-2">
          {allPeriods.map(p => (
            <div key={p} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PERIOD_COLORS[p] || '#999' }} />
              <span className="text-[9px] text-gray-500">{TIME_PERIOD_SHORT_LABELS[p as TimePeriod] || p}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ maxHeight: '120px' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const val = minPrice + range * pct;
          const y = toY(val);
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
              <text x={padding.left - 4} y={y + 3} textAnchor="end" className="fill-gray-400" fontSize="7">
                ${Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* Lines for each period */}
        {allPeriods.map(period => {
          const points = historicalPrices
            .map((r, i) => ({ x: toX(i), y: toY(r.prices[period] ?? 0), hasValue: period in r.prices }))
            .filter(p => p.hasValue);

          if (points.length < 2) {
            // Single point — show as a dot
            return points.map((pt, i) => (
              <circle key={`${period}-${i}`} cx={pt.x} cy={pt.y} r="3"
                fill={PERIOD_COLORS[period] || '#999'} />
            ));
          }

          const pathData = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');

          return (
            <g key={period}>
              <path d={pathData} fill="none" stroke={PERIOD_COLORS[period] || '#999'} strokeWidth="1.5" strokeLinecap="round" />
              {points.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill={PERIOD_COLORS[period] || '#999'} />
              ))}
            </g>
          );
        })}

        {/* X-axis labels */}
        {historicalPrices.map((r, i) => (
          <text key={i} x={toX(i)} y={chartHeight - 4} textAnchor="middle" className="fill-gray-400" fontSize="7">
            R{r.roundNumber}
          </text>
        ))}
      </svg>
    </div>
  );
}
