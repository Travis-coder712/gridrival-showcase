/**
 * BatteryModeToggle — Per-period battery mode toggle component.
 *
 * Replaces the normal bid band inputs for battery assets with a 3-way
 * charge / idle / discharge toggle. Shows SOC bar, mode-specific controls,
 * and contextual hints.
 */
import { useMemo, useState } from 'react';
import { formatNumber } from '../../lib/formatters';
import type { BatteryMode, BidBand, TimePeriod, TeamAssetInstance } from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS } from '../../../shared/types';

// ── Extended AssetInfo with battery-specific fields ──────────────────
// The server-sent AssetInfo may include these optional battery fields.

interface BatteryAssetInfo {
  id: string;
  name: string;
  type: string;
  nameplateMW: number;
  srmcPerMWh: number;
  maxChargeMW?: number;
  maxStorageMWh?: number;
  roundTripEfficiency?: number;
}

// ── Props ────────────────────────────────────────────────────────────

export interface BatteryModeToggleProps {
  asset: TeamAssetInstance;
  assetDef: BatteryAssetInfo;
  period: TimePeriod;
  mode: BatteryMode;
  chargeMW: number;
  bands: BidBand[];
  maxBands: number;
  onModeChange: (mode: BatteryMode) => void;
  onChargeMWChange: (mw: number) => void;
  onUpdateBand: (bandIndex: number, field: 'pricePerMWh' | 'quantityMW', value: number) => void;
  onAddBand: () => void;
  walkthroughExplanation?: string;
  /** Projected SOC at the START of this period, accounting for prior period actions */
  projectedSOCMWh?: number;
  /** All periods in order for the SOC timeline display */
  allPeriods?: TimePeriod[];
  /** Projected SOC for each period (keyed by period) for timeline display */
  projectedSOCByPeriod?: Record<string, number>;
  /** Periods where non-battery supply < demand (grid stress) */
  stressPeriods?: TimePeriod[];
}

// ── Helpers ──────────────────────────────────────────────────────────

const PERIOD_HOURS: Record<TimePeriod, number> = {
  night_offpeak: 6,
  day_offpeak: 6,
  day_peak: 6,
  night_peak: 6,
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ── SOC Bar ──────────────────────────────────────────────────────────

function SOCBar({ currentMWh, maxMWh }: { currentMWh: number; maxMWh: number }) {
  const pct = maxMWh > 0 ? clamp((currentMWh / maxMWh) * 100, 0, 100) : 0;

  const barColor =
    pct > 50 ? 'bg-green-500' :
    pct >= 20 ? 'bg-amber-500' :
    'bg-red-500';

  const textColor =
    pct > 50 ? 'text-green-700' :
    pct >= 20 ? 'text-amber-700' :
    'text-red-700';

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-600">State of Charge</span>
        <span className={`text-xs font-bold font-mono ${textColor}`}>
          {formatNumber(currentMWh)} / {formatNumber(maxMWh)} MWh ({Math.round(pct)}%)
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

// ── Charge Content ───────────────────────────────────────────────────

function ChargeContent({
  chargeMW,
  maxChargeMW,
  headroomMWh,
  efficiency,
  period,
  currentSOCMWh,
  maxStorageMWh,
  onChargeMWChange,
}: {
  chargeMW: number;
  maxChargeMW: number;
  headroomMWh: number;
  efficiency: number;
  period: TimePeriod;
  currentSOCMWh: number;
  maxStorageMWh: number;
  onChargeMWChange: (mw: number) => void;
}) {
  const hours = PERIOD_HOURS[period];
  // Max charge is limited by inverter rating and by remaining headroom
  const maxByHeadroom = headroomMWh > 0 ? headroomMWh / hours : 0;
  const effectiveMax = Math.max(0, Math.min(maxChargeMW, maxByHeadroom));

  const currentPct = maxStorageMWh > 0 ? Math.round((currentSOCMWh / maxStorageMWh) * 100) : 0;

  // Target SOC buttons for charging
  const chargeTargets = [
    { label: 'Charge to 25%', targetPct: 0.25 },
    { label: 'Charge to 50%', targetPct: 0.50 },
    { label: 'Charge to 75%', targetPct: 0.75 },
    { label: 'Charge to 100%', targetPct: 1.00 },
  ];

  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  // Compute charge MW for a given target SOC percentage
  function computeChargeMW(targetPct: number): number {
    const targetMWh = maxStorageMWh * targetPct;
    const energyToStore = targetMWh - currentSOCMWh;
    if (energyToStore <= 0) return 0;
    const gridEnergyNeeded = energyToStore / efficiency;
    const chargeRate = Math.min(maxChargeMW, gridEnergyNeeded / hours);
    return Math.min(chargeRate, effectiveMax);
  }

  // Info text for the selected target
  const targetInfo = selectedTarget !== null ? (() => {
    const targetPct = chargeTargets[selectedTarget].targetPct;
    const computedMW = computeChargeMW(targetPct);
    const targetPctDisplay = Math.round(targetPct * 100);
    return {
      fromPct: currentPct,
      toPct: targetPctDisplay,
      mw: computedMW,
      hours,
    };
  })() : null;

  return (
    <div className="space-y-3">
      {/* Target SOC buttons */}
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
          Charge to Target SOC
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {chargeTargets.map((t, i) => {
            const computedMW = computeChargeMW(t.targetPct);
            const isDisabled = t.targetPct * 100 <= currentPct;
            const isSelected = selectedTarget === i;
            return (
              <button
                key={t.label}
                disabled={isDisabled}
                onClick={() => {
                  setSelectedTarget(i);
                  onChargeMWChange(Math.round(computedMW * 100) / 100);
                }}
                className={`py-1.5 text-xs font-medium rounded border transition-colors ${
                  isDisabled
                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                    : isSelected
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target info text */}
      {targetInfo && targetInfo.mw > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="text-xs text-green-700">
            Will charge from <span className="font-bold">{targetInfo.fromPct}%</span> &rarr;{' '}
            <span className="font-bold">{targetInfo.toPct}%</span>, drawing{' '}
            <span className="font-bold font-mono">{formatNumber(Math.round(targetInfo.mw * 100) / 100)}</span> MW from grid for{' '}
            {targetInfo.hours}h
          </div>
        </div>
      )}

      {/* Manual MW input */}
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">
          Charge Rate (MW)
        </label>
        <input
          type="number"
          value={chargeMW || ''}
          onChange={e => {
            const v = parseFloat(e.target.value) || 0;
            onChargeMWChange(clamp(v, 0, effectiveMax));
            setSelectedTarget(null);
          }}
          onFocus={e => e.target.select()}
          placeholder="0"
          min={0}
          max={effectiveMax}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm font-mono focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Headroom info */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 space-y-1">
        <div className="text-xs text-green-700">
          <span className="font-semibold">Can store:</span>{' '}
          {formatNumber(Math.round(headroomMWh))} more MWh
          {efficiency < 1 && (
            <span className="text-green-600 ml-1">
              (accounting for {Math.round(efficiency * 100)}% round-trip efficiency)
            </span>
          )}
        </div>
        {chargeMW > 0 && (
          <div className="text-xs text-green-600">
            Est. energy drawn: {formatNumber(Math.round(chargeMW * hours))} MWh over {hours}h
          </div>
        )}
      </div>
    </div>
  );
}

// ── Idle Content ─────────────────────────────────────────────────────

function IdleContent() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-6 text-center">
      <p className="text-sm text-gray-500 font-medium">
        Battery will sit idle this period. SOC unchanged.
      </p>
    </div>
  );
}

// ── Discharge Content ────────────────────────────────────────────────

function DischargeContent({
  bands,
  maxBands,
  currentSOCMWh,
  maxStorageMWh,
  maxDischargeMW,
  srmcPerMWh,
  period,
  onUpdateBand,
  onAddBand,
  walkthroughExplanation,
}: {
  bands: BidBand[];
  maxBands: number;
  currentSOCMWh: number;
  maxStorageMWh: number;
  maxDischargeMW: number;
  srmcPerMWh: number;
  period: TimePeriod;
  onUpdateBand: (bandIndex: number, field: 'pricePerMWh' | 'quantityMW', value: number) => void;
  onAddBand: () => void;
  walkthroughExplanation?: string;
}) {
  const hours = PERIOD_HOURS[period];
  // How much MW can be sustained for the full period duration
  const maxMWFromSOC = currentSOCMWh > 0 ? currentSOCMWh / hours : 0;
  const effectiveMaxMW = Math.min(maxDischargeMW, maxMWFromSOC);
  const totalBidMW = bands.reduce((sum, b) => sum + (b.quantityMW || 0), 0);

  const currentPct = maxStorageMWh > 0 ? Math.round((currentSOCMWh / maxStorageMWh) * 100) : 0;

  // Target SOC buttons for discharging
  const dischargeTargets = [
    { label: 'Discharge to 0%', targetPct: 0 },
    { label: 'Discharge to 25%', targetPct: 0.25 },
    { label: 'Discharge to 50%', targetPct: 0.50 },
  ];

  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  // Compute discharge MW for a given target SOC percentage
  function computeDischargeMW(targetPct: number): number {
    const targetMWh = maxStorageMWh * targetPct;
    const energyAvailable = currentSOCMWh - targetMWh;
    if (energyAvailable <= 0) return 0;
    return Math.min(maxDischargeMW, energyAvailable / hours);
  }

  // Info text for the selected target
  const targetInfo = selectedTarget !== null ? (() => {
    const targetPct = dischargeTargets[selectedTarget].targetPct;
    const computedMW = computeDischargeMW(targetPct);
    const targetPctDisplay = Math.round(targetPct * 100);
    return {
      fromPct: currentPct,
      toPct: targetPctDisplay,
      mw: computedMW,
      hours,
    };
  })() : null;

  return (
    <div className="space-y-3">
      {/* SOC capacity info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        <div className="text-xs text-blue-700">
          <span className="font-semibold">Available from SOC:</span>{' '}
          {Math.round(effectiveMaxMW)} MW for {hours}h
          ({formatNumber(Math.round(currentSOCMWh))} MWh stored)
        </div>
        <div className="text-xs text-blue-500 mt-0.5">
          Total bid: {Math.round(totalBidMW)} / {Math.round(effectiveMaxMW)} MW
        </div>
      </div>

      {/* Target SOC discharge buttons */}
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
          Discharge to Target SOC
        </label>
        <div className="flex gap-1.5">
          {dischargeTargets.map((t, i) => {
            const computedMW = computeDischargeMW(t.targetPct);
            const isDisabled = t.targetPct * 100 >= currentPct;
            const isSelected = selectedTarget === i;
            return (
              <button
                key={t.label}
                disabled={isDisabled}
                onClick={() => {
                  setSelectedTarget(i);
                  const mw = Math.round(computedMW * 100) / 100;
                  // Auto-fill the first bid band quantity with this MW
                  if (bands.length > 0) {
                    onUpdateBand(0, 'quantityMW', mw);
                  }
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                  isDisabled
                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                    : isSelected
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target info text */}
      {targetInfo && targetInfo.mw > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <div className="text-xs text-blue-700">
            Will discharge from <span className="font-bold">{targetInfo.fromPct}%</span> &rarr;{' '}
            <span className="font-bold">{targetInfo.toPct}%</span>, generating{' '}
            <span className="font-bold font-mono">{formatNumber(Math.round(targetInfo.mw * 100) / 100)}</span> MW for{' '}
            {targetInfo.hours}h
          </div>
        </div>
      )}

      {/* Quick bid buttons */}
      <div className="flex gap-2 items-center">
        <span className="text-[10px] text-gray-400 mr-1">Quick:</span>
        <button
          onClick={() => {
            if (bands.length > 0) {
              onUpdateBand(0, 'pricePerMWh', 0);
              onUpdateBand(0, 'quantityMW', effectiveMaxMW);
            }
          }}
          className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100 transition-colors"
        >
          $0
        </button>
        <button
          onClick={() => {
            if (bands.length > 0) {
              onUpdateBand(0, 'pricePerMWh', srmcPerMWh);
              onUpdateBand(0, 'quantityMW', effectiveMaxMW);
            }
          }}
          className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 hover:bg-blue-100 font-medium transition-colors"
        >
          ${srmcPerMWh} (SRMC)
        </button>
        <button
          onClick={() => {
            if (bands.length > 0) {
              onUpdateBand(0, 'pricePerMWh', 500);
              onUpdateBand(0, 'quantityMW', effectiveMaxMW);
            }
          }}
          className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          $500
        </button>
      </div>

      {/* Bid band rows */}
      <div className="space-y-2">
        {bands.map((band, i) => (
          <div key={i}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">{i + 1}</span>
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 rounded">Price $/MWh</label>
                  <input
                    type="number"
                    value={band.pricePerMWh ?? ''}
                    onChange={e =>
                      onUpdateBand(i, 'pricePerMWh', parseFloat(e.target.value) || 0)
                    }
                    onFocus={e => e.target.select()}
                    placeholder="Price"
                    className={`w-full px-2 py-1.5 border border-l-2 border-l-blue-400 rounded text-sm font-mono focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                      walkthroughExplanation ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                    }`}
                    min={-1000}
                    max={20000}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-green-600 bg-green-50 px-1 rounded">Quantity MW</label>
                  <input
                    type="number"
                    value={band.quantityMW ?? ''}
                    onChange={e =>
                      onUpdateBand(i, 'quantityMW', parseFloat(e.target.value) || 0)
                    }
                    onFocus={e => e.target.select()}
                    placeholder="MW"
                    className={`w-full px-2 py-1.5 border border-l-2 border-l-green-400 rounded text-sm font-mono focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                      walkthroughExplanation ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                    }`}
                    min={0}
                    max={effectiveMaxMW}
                  />
                </div>
              </div>
            </div>
            {/* Walkthrough explanation on the first band only */}
            {i === 0 && walkthroughExplanation && (
              <div className="ml-6 mt-1 mb-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-500 text-xs mt-0.5">&#x1F4A1;</span>
                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    {walkthroughExplanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {bands.length < maxBands && (
          <button
            onClick={onAddBand}
            className="w-full py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded border border-dashed border-blue-200 transition-colors"
          >
            + Add Bid Band
          </button>
        )}
      </div>
    </div>
  );
}

// ── SOC Timeline ─────────────────────────────────────────────────────

function SOCTimeline({
  allPeriods,
  projectedSOCByPeriod,
  maxStorageMWh,
  currentPeriod,
  stressPeriods,
}: {
  allPeriods: TimePeriod[];
  projectedSOCByPeriod: Record<string, number>;
  maxStorageMWh: number;
  currentPeriod: TimePeriod;
  stressPeriods?: TimePeriod[];
}) {
  const stressSet = new Set(stressPeriods || []);

  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Projected SOC Across Day
      </div>
      <div className="flex items-end gap-1">
        {allPeriods.map((p, idx) => {
          const soc = projectedSOCByPeriod[p] ?? 0;
          const pct = maxStorageMWh > 0 ? clamp((soc / maxStorageMWh) * 100, 0, 100) : 0;
          const isActive = p === currentPeriod;
          const isStress = stressSet.has(p);
          const isDepletedInStress = isStress && pct < 5;

          const barColor =
            pct > 50 ? 'bg-green-400' :
            pct >= 20 ? 'bg-amber-400' :
            'bg-red-400';

          const activeBorder = isActive ? 'ring-2 ring-blue-500 ring-offset-1' :
                               isDepletedInStress ? 'ring-2 ring-red-400 ring-offset-1' : '';

          return (
            <div key={p} className="flex-1 flex flex-col items-center">
              {/* SOC value */}
              <div className={`text-[9px] font-mono mb-1 ${
                isActive ? 'font-bold text-blue-700' :
                isDepletedInStress ? 'font-bold text-red-600' :
                'text-gray-500'
              }`}>
                {Math.round(pct)}%
              </div>
              {/* Bar */}
              <div className={`w-full h-10 bg-gray-200 rounded-sm overflow-hidden relative ${activeBorder}`}>
                <div
                  className={`absolute bottom-0 w-full rounded-sm transition-all duration-300 ${barColor}`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              {/* Stress indicator dot */}
              {isStress && (
                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                  isDepletedInStress ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                }`} title={isDepletedInStress ? 'Battery depleted in stress period!' : 'Grid stress period'} />
              )}
              {/* Period label */}
              <div className={`text-[8px] mt-0.5 truncate w-full text-center ${
                isActive ? 'font-bold text-blue-700' :
                isStress ? 'font-semibold text-amber-600' :
                'text-gray-400'
              }`}>
                {TIME_PERIOD_SHORT_LABELS[p]?.split(' ')[0] || p}
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend for stress indicators */}
      {stressSet.size > 0 && (
        <div className="flex items-center gap-2 mt-1.5 text-[8px] text-gray-400">
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Grid stress
          </span>
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Depleted in stress
          </span>
        </div>
      )}
      <div className="text-[9px] text-gray-400 mt-1 text-center italic">
        SOC updates as you set charge/discharge for each period
      </div>
    </div>
  );
}

// ── Mode Info Hints ──────────────────────────────────────────────────

const MODE_HINTS: Record<BatteryMode, string> = {
  charge: "You'll pay the clearing price for energy drawn from the grid",
  idle: 'No cost, no revenue',
  discharge: "You'll earn the clearing price for energy sent to the grid",
};

// ── Main Component ───────────────────────────────────────────────────

export default function BatteryModeToggle({
  asset,
  assetDef,
  period,
  mode,
  chargeMW,
  bands,
  maxBands,
  onModeChange,
  onChargeMWChange,
  onUpdateBand,
  onAddBand,
  walkthroughExplanation,
  projectedSOCMWh,
  allPeriods,
  projectedSOCByPeriod,
  stressPeriods,
}: BatteryModeToggleProps) {
  // Use projected SOC if provided, otherwise fall back to server value
  const currentSOCMWh = projectedSOCMWh ?? asset.currentStorageMWh ?? 0;
  const maxStorageMWh = asset.maxStorageMWh ?? assetDef.maxStorageMWh ?? 0;
  const maxChargeMW = assetDef.maxChargeMW ?? asset.currentAvailableMW;
  const efficiency = assetDef.roundTripEfficiency ?? 1;

  // Headroom: how much more energy (MWh) we can store, accounting for
  // round-trip efficiency (we lose some on the way in).
  const headroomMWh = useMemo(() => {
    const raw = maxStorageMWh - currentSOCMWh;
    // When charging, the grid energy consumed is divided by sqrt(efficiency)
    // on the way in and sqrt(efficiency) on the way out. We express headroom
    // in terms of what can actually be stored (post-losses).
    return Math.max(0, raw);
  }, [maxStorageMWh, currentSOCMWh]);

  const modes: { key: BatteryMode; label: string; icon: string }[] = [
    { key: 'charge', label: 'Charge', icon: '\u26A1' },
    { key: 'idle', label: 'Idle', icon: '\u23F8' },
    { key: 'discharge', label: 'Discharge', icon: '\uD83D\uDD0B' },
  ];

  const activeStyles: Record<BatteryMode, string> = {
    charge: 'bg-green-500 text-white shadow-sm',
    idle: 'bg-gray-400 text-white shadow-sm',
    discharge: 'bg-blue-500 text-white shadow-sm',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-4 space-y-4">
        {/* ── SOC Bar (this period) ── */}
        <SOCBar currentMWh={currentSOCMWh} maxMWh={maxStorageMWh} />

        {/* ── SOC Timeline (all periods) ── */}
        {allPeriods && allPeriods.length > 1 && projectedSOCByPeriod && (
          <SOCTimeline
            allPeriods={allPeriods}
            projectedSOCByPeriod={projectedSOCByPeriod}
            maxStorageMWh={maxStorageMWh}
            currentPeriod={period}
            stressPeriods={stressPeriods}
          />
        )}

        {/* ── 3-Way Segmented Toggle ── */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {modes.map(m => {
            const isActive = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => onModeChange(m.key)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isActive ? activeStyles[m.key] : 'bg-gray-100 text-gray-600 hover:bg-gray-150'
                }`}
              >
                <span className="text-sm">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Mode-specific Content ── */}
        {mode === 'charge' && (
          <ChargeContent
            chargeMW={chargeMW}
            maxChargeMW={maxChargeMW}
            headroomMWh={headroomMWh}
            efficiency={efficiency}
            period={period}
            currentSOCMWh={currentSOCMWh}
            maxStorageMWh={maxStorageMWh}
            onChargeMWChange={onChargeMWChange}
          />
        )}

        {mode === 'idle' && <IdleContent />}

        {mode === 'discharge' && (
          <DischargeContent
            bands={bands}
            maxBands={maxBands}
            currentSOCMWh={currentSOCMWh}
            maxStorageMWh={maxStorageMWh}
            maxDischargeMW={asset.currentAvailableMW}
            srmcPerMWh={assetDef.srmcPerMWh}
            period={period}
            onUpdateBand={onUpdateBand}
            onAddBand={onAddBand}
            walkthroughExplanation={walkthroughExplanation}
          />
        )}

        {/* ── Info Hint ── */}
        <p className="text-[11px] text-gray-400 leading-relaxed text-center pt-1 border-t border-gray-100">
          {MODE_HINTS[mode]}
        </p>
      </div>
    </div>
  );
}
