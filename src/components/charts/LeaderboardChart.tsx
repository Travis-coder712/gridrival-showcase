import type { LeaderboardEntry } from '../../../shared/types';
import { formatCurrency } from '../../lib/formatters';

interface Props {
  leaderboard: LeaderboardEntry[];
}

export default function LeaderboardChart({ leaderboard }: Props) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center text-navy-400 py-8">
        No leaderboard data yet
      </div>
    );
  }

  const maxProfit = Math.max(...leaderboard.map(e => Math.abs(e.cumulativeProfitDollars)), 1);

  return (
    <div className="space-y-2">
      {leaderboard.map((entry, i) => {
        const barWidth = Math.abs(entry.cumulativeProfitDollars) / maxProfit * 100;
        const isPositive = entry.cumulativeProfitDollars >= 0;

        return (
          <div
            key={entry.teamId}
            className="flex items-center gap-3 group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Rank */}
            <div className="w-8 text-center">
              {i === 0 ? (
                <span className="text-2xl">🥇</span>
              ) : i === 1 ? (
                <span className="text-2xl">🥈</span>
              ) : i === 2 ? (
                <span className="text-2xl">🥉</span>
              ) : (
                <span className="text-lg font-bold text-navy-400">{i + 1}</span>
              )}
            </div>

            {/* Team color dot */}
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />

            {/* Name */}
            <div className="w-32 text-white text-sm font-medium truncate">{entry.teamName}</div>

            {/* Bar */}
            <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
              <div
                className={`h-full rounded-lg transition-all duration-1000 ease-out ${
                  isPositive ? 'bg-green-500/40' : 'bg-red-500/40'
                }`}
                style={{ width: `${Math.max(barWidth, 2)}%` }}
              />
            </div>

            {/* Value */}
            <div className={`w-24 text-right font-mono font-bold text-sm ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(entry.cumulativeProfitDollars)}
            </div>

            {/* Trend */}
            <div className="w-6 text-center">
              {entry.trend === 'up' ? (
                <span className="text-green-400">↑</span>
              ) : entry.trend === 'down' ? (
                <span className="text-red-400">↓</span>
              ) : (
                <span className="text-navy-500">→</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
