import { useSocket } from '../../contexts/SocketContext';
import { formatCurrency, formatNumber, formatMW } from '../../lib/formatters';
import type { TimePeriod } from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS, SEASON_LABELS } from '../../../shared/types';

/**
 * Post-Game Report (Improvement 5.8)
 * Printable summary of the entire game session including all rounds,
 * clearing prices, and final standings.
 */
export default function PostGameReport() {
  const { gameState } = useSocket();

  if (!gameState) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800">No Game Data</h1>
          <p className="text-gray-500 mt-2">Connect to a game first to generate a report.</p>
        </div>
      </div>
    );
  }

  const { leaderboard, historicalClearingPrices, totalRounds, teams } = gameState;

  return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto print:p-4">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">GridRival — Post-Game Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' '}&bull; {totalRounds} rounds &bull; {teams?.length || 0} teams
        </p>
      </div>

      {/* Final Standings */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">🏆 Final Standings</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Rank</th>
              <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Team</th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-gray-600">Cumulative Profit</th>
            </tr>
          </thead>
          <tbody>
            {(leaderboard || []).map((entry, i) => (
              <tr key={entry.teamId} className="border-b border-gray-200">
                <td className="py-2.5 px-3">
                  <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full print:border print:border-gray-300" style={{ backgroundColor: entry.color }} />
                    <span className="font-medium text-gray-800">{entry.teamName}</span>
                  </div>
                </td>
                <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                  entry.cumulativeProfitDollars >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(entry.cumulativeProfitDollars)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Price History */}
      {historicalClearingPrices && historicalClearingPrices.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-3">📈 Clearing Prices by Round</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Round</th>
                  {historicalClearingPrices.length > 0 &&
                    Object.keys(historicalClearingPrices[historicalClearingPrices.length - 1].prices).map(period => (
                      <th key={period} className="text-right py-2 px-3 font-semibold text-gray-600">
                        {TIME_PERIOD_SHORT_LABELS[period as TimePeriod] || period}
                      </th>
                    ))
                  }
                </tr>
              </thead>
              <tbody>
                {historicalClearingPrices.map(round => (
                  <tr key={round.roundNumber} className="border-b border-gray-200">
                    <td className="py-2 px-3 font-medium text-gray-700">
                      R{round.roundNumber}: {round.roundName}
                    </td>
                    {Object.entries(round.prices).map(([period, price]) => (
                      <td key={period} className={`py-2 px-3 text-right font-mono ${
                        price > 500 ? 'text-red-600 font-bold' :
                        price < 0 ? 'text-blue-600 font-bold' :
                        'text-gray-700'
                      }`}>
                        ${formatNumber(price)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Print Button */}
      <div className="text-center mt-8 no-print">
        <button
          onClick={() => window.print()}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
        >
          🖨️ Print Report
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        GridRival — National Electricity Market Simulation
      </div>
    </div>
  );
}
