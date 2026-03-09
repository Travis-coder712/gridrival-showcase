import type { RoundDispatchResult, TimePeriod } from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS } from '../../../shared/types';
import { formatCurrency, formatMW, formatNumber } from '../../lib/formatters';

interface MarketSnapshotCardProps {
  roundResults: RoundDispatchResult;
  roundNumber: number;
  roundName: string;
}

/**
 * Market Snapshot Card (Improvement 4.3)
 * A compact infographic summarising the round's market outcomes.
 * Shows clearing prices, supply/demand balance, and key metrics at a glance.
 */
export default function MarketSnapshotCard({ roundResults, roundNumber, roundName }: MarketSnapshotCardProps) {
  const periods = roundResults.periodResults;
  const maxPrice = Math.max(...periods.map(p => p.clearingPriceMWh));
  const minPrice = Math.min(...periods.map(p => p.clearingPriceMWh));
  const avgPrice = periods.reduce((s, p) => s + p.clearingPriceMWh, 0) / periods.length;
  const avgReserve = periods.reduce((s, p) => s + p.reserveMarginPercent, 0) / periods.length;
  const totalDemand = periods.reduce((s, p) => s + p.demandMW, 0);

  // Find the tightest period (lowest reserve margin)
  const tightestPeriod = periods.reduce((a, b) =>
    a.reserveMarginPercent < b.reserveMarginPercent ? a : b
  );

  // Price condition
  const priceCondition = maxPrice > 500 ? 'extreme' : maxPrice > 200 ? 'high' : minPrice < 0 ? 'negative' : avgPrice < 50 ? 'low' : 'moderate';
  const conditionLabel = {
    extreme: '🔥 Extreme Prices',
    high: '📈 High Prices',
    negative: '📉 Negative Prices',
    low: '💤 Low Prices',
    moderate: '📊 Moderate Prices',
  }[priceCondition];

  const conditionColor = {
    extreme: 'text-red-400 bg-red-500/10 border-red-500/20',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    negative: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    low: 'text-navy-300 bg-navy-500/10 border-navy-500/20',
    moderate: 'text-electric-300 bg-electric-500/10 border-electric-500/20',
  }[priceCondition];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="text-sm font-semibold text-white">Market Snapshot</span>
          <span className="text-xs text-navy-400">Round {roundNumber}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${conditionColor}`}>
          {conditionLabel}
        </div>
      </div>

      {/* Price Bar Chart */}
      <div className="px-4 pt-4 pb-2">
        <div className="text-xs text-navy-400 mb-2">Clearing Prices ($/MWh)</div>
        <div className="flex items-end gap-2" style={{ height: '80px' }}>
          {periods.map(p => {
            const maxForScale = Math.max(maxPrice, 1);
            const height = maxPrice > 0
              ? Math.max(4, (Math.abs(p.clearingPriceMWh) / maxForScale) * 70)
              : 20;
            const isNeg = p.clearingPriceMWh < 0;
            return (
              <div key={p.timePeriod} className="flex-1 flex flex-col items-center">
                <div className={`text-[10px] font-mono font-bold mb-1 ${isNeg ? 'text-red-400' : 'text-electric-300'}`}>
                  ${formatNumber(p.clearingPriceMWh)}
                </div>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isNeg ? 'bg-blue-500/40' : p.clearingPriceMWh > 500 ? 'bg-red-500/40' : 'bg-electric-500/40'
                  }`}
                  style={{ height: `${height}px` }}
                />
                <div className="text-[10px] text-navy-500 mt-1 truncate w-full text-center">
                  {TIME_PERIOD_SHORT_LABELS[p.timePeriod as TimePeriod] || p.timePeriod}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-px bg-white/5 mt-2">
        <div className="bg-navy-900 px-3 py-2.5 text-center">
          <div className="text-[10px] text-navy-400">Avg Price</div>
          <div className="text-sm font-mono font-bold text-electric-300">${formatNumber(avgPrice)}</div>
        </div>
        <div className="bg-navy-900 px-3 py-2.5 text-center">
          <div className="text-[10px] text-navy-400">Peak Price</div>
          <div className="text-sm font-mono font-bold text-amber-300">${formatNumber(maxPrice)}</div>
        </div>
        <div className="bg-navy-900 px-3 py-2.5 text-center">
          <div className="text-[10px] text-navy-400">Avg Reserve</div>
          <div className={`text-sm font-mono font-bold ${
            avgReserve < 10 ? 'text-red-400' : avgReserve < 20 ? 'text-amber-300' : 'text-green-400'
          }`}>
            {avgReserve.toFixed(0)}%
          </div>
        </div>
        <div className="bg-navy-900 px-3 py-2.5 text-center">
          <div className="text-[10px] text-navy-400">Tightest</div>
          <div className="text-sm font-medium text-navy-200 truncate">
            {TIME_PERIOD_SHORT_LABELS[tightestPeriod.timePeriod as TimePeriod] || tightestPeriod.timePeriod}
          </div>
        </div>
      </div>

      {/* Reserve Margin Bars */}
      <div className="px-4 py-3">
        <div className="text-xs text-navy-400 mb-2">Reserve Margin by Period</div>
        <div className="space-y-1.5">
          {periods.map(p => (
            <div key={p.timePeriod} className="flex items-center gap-2">
              <div className="w-16 text-[10px] text-navy-400 truncate">
                {TIME_PERIOD_SHORT_LABELS[p.timePeriod as TimePeriod] || p.timePeriod}
              </div>
              <div className="flex-1 h-3 bg-navy-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    p.reserveMarginPercent < 10 ? 'bg-red-500' :
                    p.reserveMarginPercent < 20 ? 'bg-amber-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, p.reserveMarginPercent))}%` }}
                />
              </div>
              <div className="w-10 text-right text-[10px] font-mono text-navy-300">
                {p.reserveMarginPercent.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
