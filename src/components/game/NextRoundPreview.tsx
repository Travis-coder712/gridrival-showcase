import type { RoundConfig, AssetType } from '../../../shared/types';
import { SEASON_LABELS, ASSET_TYPE_LABELS } from '../../../shared/types';
import { ASSET_ICONS } from '../../lib/colors';

interface NextRoundPreviewProps {
  nextRound: RoundConfig;
  nextRoundNumber: number;
}

/**
 * Next Round Preview (Improvement 3.5)
 * Shows a teaser of what's coming in the next round during the results phase.
 */
export default function NextRoundPreview({ nextRound, nextRoundNumber }: NextRoundPreviewProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🔮</span>
        <div>
          <div className="text-xs font-medium text-purple-600">Coming Next</div>
          <div className="text-sm font-bold text-purple-800">Round {nextRoundNumber}: {nextRound.name}</div>
        </div>
      </div>

      <p className="text-xs text-purple-700 mb-3 leading-relaxed">{nextRound.description}</p>

      <div className="flex flex-wrap gap-2">
        {/* Season badge */}
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/60 rounded-full text-[10px] font-medium text-gray-700 border border-purple-100">
          {nextRound.season === 'summer' ? '🔥' : nextRound.season === 'winter' ? '❄️' : nextRound.season === 'autumn' ? '🍂' : '🌱'}
          {SEASON_LABELS[nextRound.season]}
        </span>

        {/* Period count */}
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/60 rounded-full text-[10px] font-medium text-gray-700 border border-purple-100">
          🕐 {nextRound.timePeriods.length} periods
        </span>

        {/* New assets */}
        {nextRound.newAssetsUnlocked.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100/60 rounded-full text-[10px] font-bold text-blue-700 border border-blue-200">
            ✨ New: {nextRound.newAssetsUnlocked.map(a =>
              `${ASSET_ICONS[a as AssetType] || '⚡'} ${ASSET_TYPE_LABELS[a as AssetType] || a}`
            ).join(', ')}
          </span>
        )}

        {/* Scenario events */}
        {nextRound.activeScenarioEvents.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100/60 rounded-full text-[10px] font-bold text-amber-700 border border-amber-200">
            ⚠️ Special event!
          </span>
        )}
      </div>

      {/* Learning objectives teaser */}
      {nextRound.learningObjectives && nextRound.learningObjectives.length > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-200/50">
          <div className="text-[10px] font-semibold text-purple-600 mb-1">You'll learn:</div>
          <ul className="space-y-0.5">
            {nextRound.learningObjectives.slice(0, 2).map((obj, i) => (
              <li key={i} className="text-[10px] text-purple-600 flex items-start gap-1">
                <span className="mt-0.5">→</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
