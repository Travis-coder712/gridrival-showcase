import { formatCurrency, formatNumber } from '../../lib/formatters';
import type { GameStateSnapshot, TimePeriod } from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS } from '../../../shared/types';

interface QuickRecapCardProps {
  gameState: GameStateSnapshot;
  teamId: string;
}

/**
 * Quick Recap Card (Improvement 4.6)
 * Shows a brief summary of the last round's key outcomes at the start of each new round.
 */
export default function QuickRecapCard({ gameState, teamId }: QuickRecapCardProps) {
  const lastResults = gameState.lastRoundResults;
  const lastAnalysis = gameState.lastRoundAnalysis;
  if (!lastResults) return null;

  const myResult = lastResults.teamResults.find(r => r.teamId === teamId);
  const myRank = gameState.leaderboard.find(e => e.teamId === teamId);
  const myAnalysis = lastAnalysis?.teamAnalyses.find(ta => ta.teamId === teamId);

  // Get clearing prices
  const prices = lastResults.periodResults.map(pr => ({
    period: pr.timePeriod,
    price: pr.clearingPriceMWh,
  }));
  const avgPrice = prices.reduce((s, p) => s + p.price, 0) / prices.length;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span className="text-sm font-bold text-indigo-800">Last Round Recap</span>
        </div>
        {myRank && (
          <span className="text-xs font-medium text-indigo-600">
            Rank #{myRank.rank} of {gameState.leaderboard.length}
          </span>
        )}
      </div>

      {/* Profit and Prices */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] text-gray-500">Your Last Round</div>
          <div className={`text-lg font-bold font-mono ${
            (myResult?.totalProfitDollars || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(myResult?.totalProfitDollars || 0)}
          </div>
        </div>
        <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] text-gray-500">Avg Clearing Price</div>
          <div className="text-lg font-bold font-mono text-blue-600">
            ${formatNumber(avgPrice)}<span className="text-xs text-gray-400">/MWh</span>
          </div>
        </div>
      </div>

      {/* Per-period prices inline */}
      <div className="flex gap-1 mb-3">
        {lastResults.periodResults.map(pr => (
          <div key={pr.timePeriod} className={`flex-1 rounded px-2 py-1 text-center ${
            pr.oversupplyNegativePriceTriggered ? 'bg-red-50 border border-red-200' : 'bg-white/50'
          }`}>
            <div className="text-[9px] text-gray-400">{TIME_PERIOD_SHORT_LABELS[pr.timePeriod as TimePeriod] || pr.timePeriod}</div>
            <div className={`text-xs font-mono font-bold ${pr.clearingPriceMWh < 0 ? 'text-red-600' : 'text-gray-700'}`}>
              ${formatNumber(pr.clearingPriceMWh)}
            </div>
            {pr.oversupplyNegativePriceTriggered && (
              <div className="text-[8px] text-red-500 font-medium">⚡ Oversupply</div>
            )}
          </div>
        ))}
      </div>

      {/* Quick advice for next round */}
      {myAnalysis?.nextRoundAdvice && (
        <div className="bg-white/60 rounded-lg px-3 py-2 border border-indigo-100">
          <div className="flex items-start gap-1.5">
            <span className="text-xs mt-0.5">💡</span>
            <p className="text-[11px] text-indigo-700 leading-relaxed">{myAnalysis.nextRoundAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );
}
