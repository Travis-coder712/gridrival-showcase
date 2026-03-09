import { formatMW } from '../../lib/formatters';
import { ASSET_ICONS, ASSET_COLORS } from '../../lib/colors';
import { TIME_PERIOD_SHORT_LABELS, TIME_PERIOD_TIME_RANGES, ASSET_TYPE_LABELS } from '../../../shared/types';
import type { AssetInfo, TeamAssetInstance, TimePeriod, Season } from '../../../shared/types';

interface RenewableInfoCardProps {
  asset: TeamAssetInstance;
  assetDef: AssetInfo;
  periods: TimePeriod[];
  selectedPeriod: TimePeriod;
  season: Season;
}

/**
 * RenewableInfoCard -- Read-only informational card for wind/solar assets.
 *
 * Renewables always auto-bid at $0/MWh so there is nothing for the player
 * to edit. This card shows the asset's per-period capacity, highlights the
 * selected period, and surfaces contextual notes (wind profile, solar
 * overnight message, force outage badge).
 */
export default function RenewableInfoCard({
  asset,
  assetDef,
  periods,
  selectedPeriod,
  season,
}: RenewableInfoCardProps) {
  const isWind = assetDef.type === 'wind';
  const isSolar = assetDef.type === 'solar';
  const isOutage = asset.isForceOutage;

  const icon = ASSET_ICONS[assetDef.type];
  const borderColor = ASSET_COLORS[assetDef.type];

  // Resolve MW for the selected period
  const selectedMW = assetDef.availabilityByPeriod
    ? assetDef.availabilityByPeriod[selectedPeriod] ?? 0
    : asset.currentAvailableMW;

  // Check if solar has no generation overnight
  const isSolarNight = isSolar && selectedPeriod === 'night_offpeak';

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-opacity ${
        isOutage ? 'opacity-50 grayscale' : ''
      }`}
      style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-800 truncate">
              {assetDef.name}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${borderColor}20`,
                  color: borderColor,
                }}
              >
                {ASSET_TYPE_LABELS[assetDef.type]}
              </span>
              {isWind && assetDef.windProfileName && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  {assetDef.windProfileName} profile
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Auto-dispatch badge */}
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
            Auto-dispatch · $0/MWh
          </span>

          {/* Outage badge */}
          {isOutage && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-300 uppercase tracking-wide">
              Outage
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-3 space-y-3">
        {/* Selected period MW -- prominent display */}
        <div className="text-center">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
            {TIME_PERIOD_SHORT_LABELS[selectedPeriod]} ({TIME_PERIOD_TIME_RANGES[selectedPeriod]})
          </div>
          {isOutage ? (
            <div className="text-lg font-bold text-red-500">OFFLINE</div>
          ) : selectedMW === 0 ? (
            <div className="text-lg font-bold text-gray-300">No generation</div>
          ) : (
            <div className="text-2xl font-bold font-mono text-gray-800">
              {formatMW(selectedMW)}
            </div>
          )}
        </div>

        {/* Solar overnight message */}
        {isSolarNight && !isOutage && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <span>{ASSET_ICONS.solar}</span>
            <span>No generation overnight</span>
          </div>
        )}

        {/* ── Period grid ── */}
        <div className="grid grid-cols-4 gap-1.5">
          {periods.map((period) => {
            const periodMW = assetDef.availabilityByPeriod
              ? assetDef.availabilityByPeriod[period] ?? 0
              : asset.currentAvailableMW;
            const isSelected = period === selectedPeriod;
            const isZero = periodMW === 0 || isOutage;

            return (
              <div
                key={period}
                className={`rounded-lg px-2 py-1.5 text-center transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-400 ring-1 ring-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                } ${isZero && !isSelected ? 'opacity-40' : ''}`}
              >
                <div className={`text-[9px] font-medium truncate ${
                  isSelected ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {TIME_PERIOD_SHORT_LABELS[period]}
                </div>
                <div className={`text-xs font-bold font-mono ${
                  isZero
                    ? 'text-gray-300'
                    : isSelected
                      ? 'text-blue-700'
                      : 'text-gray-600'
                }`}>
                  {isOutage ? '--' : `${Math.round(periodMW)}`}
                </div>
                <div className={`text-[8px] ${
                  isSelected ? 'text-blue-400' : 'text-gray-300'
                }`}>
                  MW
                </div>
              </div>
            );
          })}
        </div>

        {/* Nameplate capacity reference + explanation */}
        <div className="text-[10px] text-gray-400 text-center">
          Nameplate: {formatMW(assetDef.nameplateMW)} — MW varies by weather &amp; time of day
        </div>
      </div>
    </div>
  );
}
