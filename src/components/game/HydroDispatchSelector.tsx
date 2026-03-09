/**
 * HydroDispatchSelector — Interactive bidding card for hydro assets.
 *
 * Hydro has limited water storage and can only dispatch in ONE period per round.
 * Teams choose which period to dispatch in, set a bid price (opportunity cost),
 * and see water level constraints and energy calculations.
 */
import { useMemo } from 'react';
import { formatNumber, formatMW } from '../../lib/formatters';
import { ASSET_ICONS, ASSET_COLORS } from '../../lib/colors';
import {
  TIME_PERIOD_SHORT_LABELS,
  TIME_PERIOD_TIME_RANGES,
  getPeriodDescriptions,
} from '../../../shared/types';
import type {
  TimePeriod,
  Season,
  TeamAssetInstance,
  AssetInfo,
} from '../../../shared/types';

// ── Props ────────────────────────────────────────────────────────────

export interface HydroDispatchSelectorProps {
  asset: TeamAssetInstance;
  assetDef: AssetInfo;
  periods: TimePeriod[];
  selectedDispatchPeriod: TimePeriod | null;
  bidPrice: number;
  onDispatchPeriodChange: (period: TimePeriod | null) => void;
  onBidPriceChange: (price: number) => void;
  season: Season;
}

// ── Helpers ──────────────────────────────────────────────────────────

const PERIOD_HOURS = 6;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ── Water Level Bar ──────────────────────────────────────────────────

function WaterLevelBar({
  currentMWh,
  maxMWh,
}: {
  currentMWh: number;
  maxMWh: number;
}) {
  const pct = maxMWh > 0 ? clamp((currentMWh / maxMWh) * 100, 0, 100) : 0;

  const barColor =
    pct > 50
      ? 'bg-gradient-to-r from-blue-400 to-blue-500'
      : pct >= 20
        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
        : 'bg-gradient-to-r from-red-400 to-red-500';

  const textColor =
    pct > 50
      ? 'text-blue-700'
      : pct >= 20
        ? 'text-amber-700'
        : 'text-red-700';

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-600">
          Water Storage
        </span>
        <span className={`text-xs font-bold font-mono ${textColor}`}>
          {formatNumber(currentMWh)} / {formatNumber(maxMWh)} MWh (
          {Math.round(pct)}%)
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Period Option Button ─────────────────────────────────────────────

function PeriodOption({
  period,
  season,
  isSelected,
  onSelect,
}: {
  period: TimePeriod;
  season: Season;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const desc = getPeriodDescriptions(period, season, []);

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all text-left ${
        isSelected
          ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300 shadow-sm'
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      {/* Radio indicator */}
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? 'border-blue-500' : 'border-gray-300'
        }`}
      >
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        )}
      </div>

      {/* Period info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{desc.icon}</span>
          <span
            className={`text-sm font-semibold ${
              isSelected ? 'text-blue-800' : 'text-gray-700'
            }`}
          >
            {desc.label}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            {TIME_PERIOD_TIME_RANGES[period]}
          </span>
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5 truncate">
          {desc.demandLevel} demand &middot; {desc.priceContext.slice(0, 60)}
          {desc.priceContext.length > 60 ? '...' : ''}
        </div>
      </div>
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function HydroDispatchSelector({
  asset,
  assetDef,
  periods,
  selectedDispatchPeriod,
  bidPrice,
  onDispatchPeriodChange,
  onBidPriceChange,
  season,
}: HydroDispatchSelectorProps) {
  const currentStorageMWh = asset.currentStorageMWh ?? 0;
  const maxStorageMWh = asset.maxStorageMWh ?? assetDef.maxStorageMWh ?? 0;
  const nameplateMW = assetDef.nameplateMW;
  const srmcPerMWh = assetDef.srmcPerMWh;

  // Energy calculation
  const energyCalc = useMemo(() => {
    const requestedEnergyMWh = nameplateMW * PERIOD_HOURS;
    const storageConstrained = requestedEnergyMWh > currentStorageMWh;
    const effectiveMaxMW = storageConstrained
      ? currentStorageMWh / PERIOD_HOURS
      : nameplateMW;
    const actualEnergyMWh = effectiveMaxMW * PERIOD_HOURS;
    const remainingMWh = Math.max(0, currentStorageMWh - actualEnergyMWh);
    const remainingPct =
      maxStorageMWh > 0
        ? Math.round((remainingMWh / maxStorageMWh) * 100)
        : 0;

    return {
      requestedEnergyMWh,
      storageConstrained,
      effectiveMaxMW: Math.round(effectiveMaxMW),
      actualEnergyMWh: Math.round(actualEnergyMWh),
      remainingMWh: Math.round(remainingMWh),
      remainingPct,
    };
  }, [nameplateMW, currentStorageMWh, maxStorageMWh]);

  // Quick price presets
  const quickPrices = useMemo(
    () => [
      { label: '$0', value: 0 },
      { label: `$${srmcPerMWh}`, subtitle: 'SRMC', value: srmcPerMWh },
      { label: '$100', value: 100 },
      { label: '$500', value: 500 },
    ],
    [srmcPerMWh],
  );

  // ── Force outage state ──
  if (asset.isForceOutage) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">{ASSET_ICONS.hydro}</span>
            <h3 className="text-sm font-bold text-red-800">{assetDef.name}</h3>
          </div>
        </div>
        <div className="px-4 py-8 text-center">
          <div className="text-3xl mb-2">&#x1F6A7;</div>
          <p className="text-sm font-semibold text-red-700">FORCED OUTAGE</p>
          <p className="text-xs text-red-500 mt-1">
            This asset is unavailable this round
          </p>
        </div>
      </div>
    );
  }

  // ── No storage available ──
  if (currentStorageMWh <= 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">{ASSET_ICONS.hydro}</span>
            <h3 className="text-sm font-bold text-gray-800">{assetDef.name}</h3>
            <span className="ml-auto text-[10px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
              ${srmcPerMWh}/MWh
            </span>
          </div>
        </div>
        <WaterLevelBar currentMWh={0} maxMWh={maxStorageMWh} />
        <div className="px-4 py-6 text-center">
          <p className="text-sm font-semibold text-gray-500">
            Reservoir empty — cannot dispatch
          </p>
          <p className="text-xs text-gray-400 mt-1">
            0 MWh remaining in storage
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">{ASSET_ICONS.hydro}</span>
          <h3 className="text-sm font-bold text-gray-800">{assetDef.name}</h3>
          <span className="ml-auto text-[10px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
            ${srmcPerMWh}/MWh
          </span>
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">
          {formatMW(nameplateMW)} nameplate &middot; Dispatch in ONE period per
          round
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ── Water Level Bar ── */}
        <WaterLevelBar
          currentMWh={currentStorageMWh}
          maxMWh={maxStorageMWh}
        />

        {/* ── Period Selector ── */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            Choose Dispatch Period
          </label>
          <div className="space-y-1.5">
            {periods.map((period) => (
              <PeriodOption
                key={period}
                period={period}
                season={season}
                isSelected={selectedDispatchPeriod === period}
                onSelect={() =>
                  onDispatchPeriodChange(
                    selectedDispatchPeriod === period ? null : period,
                  )
                }
              />
            ))}

            {/* Hold option */}
            <button
              onClick={() => onDispatchPeriodChange(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all text-left ${
                selectedDispatchPeriod === null
                  ? 'bg-gray-100 border-gray-400 ring-1 ring-gray-300 shadow-sm'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {/* Radio indicator */}
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedDispatchPeriod === null
                    ? 'border-gray-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedDispatchPeriod === null && (
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">&#x1F6D1;</span>
                  <span
                    className={`text-sm font-semibold ${
                      selectedDispatchPeriod === null
                        ? 'text-gray-800'
                        : 'text-gray-500'
                    }`}
                  >
                    Hold (don't dispatch)
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Conserve water for a future round
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── Bid Price Input (only when a period is selected) ── */}
        {selectedDispatchPeriod !== null && (
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Bid Price (opportunity cost)
            </label>
            <input
              type="number"
              value={bidPrice ?? ''}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                onBidPriceChange(v);
              }}
              onFocus={(e) => e.target.select()}
              placeholder="$/MWh"
              min={-1000}
              max={20000}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />

            {/* Quick price buttons */}
            <div className="flex gap-1.5 mt-2">
              {quickPrices.map((qp) => (
                <button
                  key={qp.value}
                  onClick={() => onBidPriceChange(qp.value)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                    bidPrice === qp.value
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                  }`}
                >
                  <div>{qp.label}</div>
                  {qp.subtitle && (
                    <div className="text-[9px] opacity-70">{qp.subtitle}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Energy Calculation (only when a period is selected) ── */}
        {selectedDispatchPeriod !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 space-y-1.5">
            <div className="text-xs text-blue-800">
              <span className="font-semibold">Dispatching:</span>{' '}
              {energyCalc.storageConstrained
                ? `${energyCalc.effectiveMaxMW} MW`
                : `${nameplateMW} MW`}{' '}
              x {PERIOD_HOURS}h ={' '}
              {formatNumber(energyCalc.actualEnergyMWh)} MWh
            </div>

            {/* Storage constraint warning */}
            {energyCalc.storageConstrained && (
              <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded px-2.5 py-2">
                <span className="text-amber-500 text-xs shrink-0 mt-0.5">
                  &#x26A0;&#xFE0F;
                </span>
                <div className="text-[11px] text-amber-700 leading-relaxed">
                  Only {formatNumber(currentStorageMWh)} MWh available — max
                  dispatch {energyCalc.effectiveMaxMW} MW (capped by storage)
                </div>
              </div>
            )}

            {/* Effective dispatch */}
            <div className="text-xs text-blue-600">
              <span className="font-semibold">Effective dispatch:</span>{' '}
              {formatMW(energyCalc.effectiveMaxMW)}
            </div>

            {/* Water level after dispatch */}
            <div className="text-xs text-blue-600 pt-1 border-t border-blue-200">
              <span className="font-semibold">
                Water level after dispatch:
              </span>{' '}
              {formatNumber(energyCalc.remainingMWh)} MWh (
              {energyCalc.remainingPct}%)
            </div>
          </div>
        )}

        {/* ── Idle state hint (when Hold is selected) ── */}
        {selectedDispatchPeriod === null && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-5 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Hydro will not dispatch this round.
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Water conserved: {formatNumber(currentStorageMWh)} MWh remains in
              storage
            </p>
          </div>
        )}

        {/* ── Info hint ── */}
        <p className="text-[11px] text-gray-400 leading-relaxed text-center pt-1 border-t border-gray-100">
          Hydro dispatches in one period per round — choose the period where
          your water is most valuable
        </p>
      </div>
    </div>
  );
}
