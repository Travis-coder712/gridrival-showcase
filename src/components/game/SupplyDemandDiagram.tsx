/**
 * SupplyDemandDiagram — Visual supply/demand balance for battery decisions.
 *
 * Shows:
 *  1. Market-wide: total fleet capacity vs demand + reserve margin
 *  2. Your team: unified supply stack vs demand reference (single-scale)
 *     — battery's role as gap-bridger is prominently shown
 *  3. Grid stress alerts + collective responsibility messaging
 *
 * Key framing: "Are YOU meeting your share? Every team must contribute.
 * Your battery is critical to bridging the gap."
 */
import { useMemo } from 'react';
import { formatMW } from '../../lib/formatters';
import { TIME_PERIOD_SHORT_LABELS } from '../../../shared/types';
import type { TimePeriod, FleetInfo, AssetType, Season } from '../../../shared/types';

// ── Props ────────────────────────────────────────────────────────────

export interface SupplyDemandDiagramProps {
  /** Current period being viewed in battery section */
  selectedPeriod: TimePeriod;
  /** All periods in the round */
  periods: TimePeriod[];
  /** Fleet info from gameState */
  fleetInfo: FleetInfo;
  /** Number of teams */
  teamCount: number;
  /** Season for period descriptions */
  season: Season;
  /** Available asset types for period descriptions */
  availableAssetTypes: AssetType[];

  // Team's own supply data
  /** Team's total thermal MW bid per period */
  thermalTotalByPeriod: Record<string, number>;
  /** Team's total renewable MW per period */
  renewableTotalByPeriod: Record<string, number>;
  /** Team's hydro MW per period (if dispatching) */
  hydroTotalByPeriod: Record<string, number>;

  // Battery state for current period
  /** Battery net MW for current period: positive = discharge (adds supply), negative = charge (adds demand) */
  batteryNetMW: number;
  /** Battery nameplate MW (max charge/discharge capacity) for reference */
  batteryCapacityMW: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function pctLabel(pct: number): string {
  return `${Math.round(pct)}%`;
}

// ── Color helpers ────────────────────────────────────────────────────

function reserveColor(reservePct: number): { text: string; bg: string; border: string } {
  if (reservePct < 5) return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
  if (reservePct < 15) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
}

function supplyPctColor(pct: number): string {
  if (pct >= 100) return 'text-green-700';
  if (pct >= 80) return 'text-amber-700';
  return 'text-red-700';
}

function supplyPctBgColor(pct: number): string {
  if (pct >= 100) return 'bg-green-50 border-green-200';
  if (pct >= 80) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

// ── Bar Segment ──────────────────────────────────────────────────────

function BarSegment({ widthPct, color, label, className = '' }: {
  widthPct: number;
  color: string;
  label?: string;
  className?: string;
}) {
  if (widthPct <= 0) return null;
  return (
    <div
      className={`h-full flex items-center justify-center overflow-hidden transition-all duration-300 ${color} ${className}`}
      style={{ width: `${clamp(widthPct, 0, 100)}%`, minWidth: widthPct > 0 ? '2px' : 0 }}
    >
      {widthPct > 10 && label && (
        <span className="text-[9px] font-bold text-white truncate px-0.5 leading-tight text-center">
          {label}
        </span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function SupplyDemandDiagram({
  selectedPeriod,
  periods,
  fleetInfo,
  teamCount,
  season,
  availableAssetTypes,
  thermalTotalByPeriod,
  renewableTotalByPeriod,
  hydroTotalByPeriod,
  batteryNetMW,
  batteryCapacityMW,
}: SupplyDemandDiagramProps) {
  const p = selectedPeriod;

  // ── Market-wide data ──
  const fleetMW = fleetInfo.totalFleetMW[p] || 0;
  const demandMW = fleetInfo.demandMW[p] || 0;
  const reserveMW = fleetMW - demandMW;
  const reservePct = fleetMW > 0 ? (reserveMW / fleetMW) * 100 : 0;
  const tightness = fleetInfo.demandAsPercentOfFleet[p] || 0;
  const resColors = reserveColor(reservePct);

  // ── Team data ──
  const proRataDemand = teamCount > 0 ? Math.round(demandMW / teamCount) : 0;
  const teamRenewable = renewableTotalByPeriod[p] || 0;
  const teamThermal = thermalTotalByPeriod[p] || 0;
  const teamHydro = hydroTotalByPeriod[p] || 0;
  const teamSupplyBeforeBattery = teamRenewable + teamThermal + teamHydro;

  // ── Battery impact ──
  const batteryDischargeMW = Math.max(0, batteryNetMW);
  const batteryChargeMW = Math.abs(Math.min(0, batteryNetMW));

  const teamTotalSupply = teamSupplyBeforeBattery + batteryDischargeMW;
  const teamEffectiveDemand = proRataDemand + batteryChargeMW;
  const teamSupplyPct = teamEffectiveDemand > 0 ? Math.round((teamTotalSupply / teamEffectiveDemand) * 100) : 0;

  // ── Gap analysis (key for battery-critical messaging) ──
  const gapMW = Math.max(0, proRataDemand - teamSupplyBeforeBattery);
  const gapFilledByBattery = Math.min(gapMW, batteryDischargeMW);
  const remainingGap = Math.max(0, gapMW - batteryDischargeMW);
  const isShortfall = gapMW > 0;
  const batteryBridgesGap = isShortfall && batteryDischargeMW >= gapMW;
  const batteryPartiallyBridgesGap = isShortfall && batteryDischargeMW > 0 && batteryDischargeMW < gapMW;

  // Stress severity: how much of battery capacity is needed to bridge gap
  const gapAsPctOfBattery = batteryCapacityMW > 0 ? (gapMW / batteryCapacityMW) * 100 : 0;

  // ── Price signal hint ──
  const priceSignal = useMemo(() => {
    if (tightness >= 90) return { label: 'Tight supply — prices likely HIGH', color: 'text-red-600', hint: 'Discharge to sell at high prices', icon: '🔥' };
    if (tightness >= 75) return { label: 'Moderate supply — prices moderate', color: 'text-amber-600', hint: 'Consider idle or strategic discharge', icon: '⚡' };
    return { label: 'Surplus supply — prices likely LOW', color: 'text-green-600', hint: 'Charge cheaply to sell later', icon: '🌿' };
  }, [tightness]);

  // ── Unified scale for the supply-vs-demand bar ──
  // Use max of (total supply including battery, effective demand) so both fit on same axis
  const unifiedScale = Math.max(teamTotalSupply, teamEffectiveDemand, proRataDemand, 1);
  const marketScaleMax = Math.max(fleetMW, demandMW, 1);

  // Demand marker position as percentage of the unified scale
  const demandMarkerPct = (proRataDemand / unifiedScale) * 100;
  // Effective demand (with charging) marker
  const effectiveDemandMarkerPct = batteryChargeMW > 0 ? (teamEffectiveDemand / unifiedScale) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* ═══ Price Signal Banner ═══ */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${resColors.bg} ${resColors.border}`}>
        <span className="text-base">{priceSignal.icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-bold ${priceSignal.color}`}>
            {priceSignal.label}
          </div>
          <div className="text-[10px] text-gray-500">{priceSignal.hint}</div>
        </div>
        <div className={`text-xs font-bold font-mono ${resColors.text}`}>
          {pctLabel(reservePct)} reserve
        </div>
      </div>

      {/* ═══ 1. Market Overview ═══ */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Market Supply / Demand</h5>
          <span className="text-[10px] text-gray-400">{TIME_PERIOD_SHORT_LABELS[p]}</span>
        </div>

        {/* Fleet capacity bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-gray-500">Fleet Capacity</span>
            <span className="font-mono font-semibold text-gray-700">{formatMW(fleetMW)}</span>
          </div>
          <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-200 rounded-full transition-all duration-300"
              style={{ width: `${(fleetMW / marketScaleMax) * 100}%` }}
            />
          </div>
        </div>

        {/* Demand bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-gray-500">Market Demand</span>
            <span className="font-mono font-semibold text-gray-700">{formatMW(demandMW)}</span>
          </div>
          <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                tightness >= 90 ? 'bg-red-400' : tightness >= 75 ? 'bg-amber-400' : 'bg-green-400'
              }`}
              style={{ width: `${(demandMW / marketScaleMax) * 100}%` }}
            />
          </div>
        </div>

        {/* Reserve margin */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-400">Reserve margin</span>
          <span className={`font-mono font-bold ${resColors.text}`}>
            {formatMW(Math.round(reserveMW))} ({pctLabel(reservePct)})
          </span>
        </div>
      </div>

      {/* ═══ 2. Your Contribution to Grid Balance ═══ */}
      <div className={`rounded-lg border p-3 space-y-3 ${supplyPctBgColor(teamSupplyPct)}`}>
        <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
            Your Contribution to Grid Balance
          </h5>
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
            teamSupplyPct >= 100 ? 'bg-green-100 text-green-700' :
            teamSupplyPct >= 80 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {teamSupplyPct}%
          </span>
        </div>

        {/* ── Unified Supply Stack vs Demand Line ── */}
        <div className="relative">
          {/* Supply label row */}
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-gray-600 font-semibold">Your supply</span>
            <span className="font-mono font-bold text-gray-700">{formatMW(Math.round(teamTotalSupply))}</span>
          </div>

          {/* The unified bar */}
          <div className="relative">
            {/* Supply segments stacked */}
            <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden flex relative">
              {/* Renewable */}
              <BarSegment
                widthPct={(teamRenewable / unifiedScale) * 100}
                color="bg-emerald-400"
                label={teamRenewable > 0 ? `${Math.round(teamRenewable)}` : undefined}
              />
              {/* Thermal */}
              <BarSegment
                widthPct={(teamThermal / unifiedScale) * 100}
                color="bg-orange-400"
                label={teamThermal > 0 ? `${Math.round(teamThermal)}` : undefined}
              />
              {/* Hydro */}
              {teamHydro > 0 && (
                <BarSegment
                  widthPct={(teamHydro / unifiedScale) * 100}
                  color="bg-sky-400"
                  label={`${Math.round(teamHydro)}`}
                />
              )}

              {/* Gap zone (red) — visible when supply-before-battery < demand */}
              {isShortfall && batteryDischargeMW === 0 && (
                <div
                  className="h-full bg-red-200 border-l-2 border-red-300 border-dashed flex items-center justify-center overflow-hidden animate-pulse"
                  style={{ width: `${clamp((gapMW / unifiedScale) * 100, 0, 100)}%`, minWidth: '4px' }}
                >
                  {(gapMW / unifiedScale) * 100 > 12 && (
                    <span className="text-[9px] font-bold text-red-600 px-0.5">
                      -{Math.round(gapMW)} MW
                    </span>
                  )}
                </div>
              )}

              {/* Battery discharge — fills the gap and/or adds surplus supply */}
              {batteryDischargeMW > 0 && (
                <>
                  {/* Gap-filling portion (turns the red gap green) */}
                  {isShortfall && gapFilledByBattery > 0 && (
                    <div
                      className="h-full bg-lime-400 border-l-2 border-white flex items-center justify-center overflow-hidden"
                      style={{ width: `${clamp((gapFilledByBattery / unifiedScale) * 100, 0, 100)}%`, minWidth: '2px' }}
                    >
                      {(gapFilledByBattery / unifiedScale) * 100 > 12 && (
                        <span className="text-[9px] font-bold text-white px-0.5">
                          +{Math.round(gapFilledByBattery)}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Remaining gap still unfilled */}
                  {remainingGap > 0 && (
                    <div
                      className="h-full bg-red-200 border-l border-red-300 border-dashed flex items-center justify-center overflow-hidden animate-pulse"
                      style={{ width: `${clamp((remainingGap / unifiedScale) * 100, 0, 100)}%`, minWidth: '2px' }}
                    >
                      {(remainingGap / unifiedScale) * 100 > 10 && (
                        <span className="text-[9px] font-bold text-red-600 px-0.5">
                          -{Math.round(remainingGap)}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Surplus battery beyond gap */}
                  {!isShortfall && (
                    <BarSegment
                      widthPct={(batteryDischargeMW / unifiedScale) * 100}
                      color="bg-lime-500"
                      label={`+${Math.round(batteryDischargeMW)}`}
                      className="border-l-2 border-white"
                    />
                  )}
                  {batteryBridgesGap && (batteryDischargeMW - gapMW) > 0 && (
                    <BarSegment
                      widthPct={((batteryDischargeMW - gapMW) / unifiedScale) * 100}
                      color="bg-lime-500"
                      label={(batteryDischargeMW - gapMW) > 0 ? `+${Math.round(batteryDischargeMW - gapMW)}` : undefined}
                    />
                  )}
                </>
              )}
            </div>

            {/* Demand marker line — vertical overlay */}
            <div
              className="absolute top-0 h-8 flex flex-col items-center pointer-events-none"
              style={{ left: `${clamp(demandMarkerPct, 0, 99)}%` }}
            >
              <div className={`w-0.5 h-full ${
                teamTotalSupply >= proRataDemand ? 'bg-gray-500' : 'bg-red-500'
              }`} />
            </div>

            {/* Demand label below the bar */}
            <div className="relative h-5 mt-0.5">
              <div
                className="absolute flex flex-col items-center pointer-events-none"
                style={{ left: `${clamp(demandMarkerPct, 2, 95)}%`, transform: 'translateX(-50%)' }}
              >
                <div className="text-[8px] font-bold text-gray-600 whitespace-nowrap bg-white/80 px-1 rounded">
                  ▲ Demand: {formatMW(proRataDemand)}
                </div>
              </div>

              {/* Effective demand label (when charging adds to demand) */}
              {batteryChargeMW > 0 && effectiveDemandMarkerPct > demandMarkerPct + 3 && (
                <div
                  className="absolute flex flex-col items-center pointer-events-none"
                  style={{ left: `${clamp(effectiveDemandMarkerPct, 2, 95)}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="text-[8px] font-bold text-amber-600 whitespace-nowrap bg-amber-50 px-1 rounded">
                    ▲ +{Math.round(batteryChargeMW)} charging
                  </div>
                </div>
              )}
            </div>

            {/* Charging extends demand — amber zone on demand side */}
            {batteryChargeMW > 0 && (
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex mt-0.5">
                <div
                  className="h-full bg-gray-300 rounded-l-full transition-all duration-300"
                  style={{ width: `${(proRataDemand / unifiedScale) * 100}%` }}
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-300 animate-pulse"
                  style={{ width: `${(batteryChargeMW / unifiedScale) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
            {teamRenewable > 0 && (
              <span className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Renewable
              </span>
            )}
            {teamThermal > 0 && (
              <span className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Thermal
              </span>
            )}
            {teamHydro > 0 && (
              <span className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Hydro
              </span>
            )}
            {(batteryDischargeMW > 0 || isShortfall) && (
              <span className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" /> Battery
              </span>
            )}
            {isShortfall && (
              <span className="flex items-center gap-1 text-[9px] text-red-500 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-300 inline-block" /> Shortfall
              </span>
            )}
            {batteryChargeMW > 0 && (
              <span className="flex items-center gap-1 text-[9px] text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Charging load
              </span>
            )}
            <span className="flex items-center gap-1 text-[9px] text-gray-400 ml-auto">
              <span className="w-3 h-0.5 bg-gray-500 inline-block" /> Demand line
            </span>
          </div>
        </div>

        {/* ── Collective Responsibility + Battery Critical Message ── */}
        <div className={`rounded-lg px-3 py-2 border ${
          !isShortfall && teamSupplyPct >= 100
            ? 'bg-green-50 border-green-200'
            : isShortfall && batteryBridgesGap
              ? 'bg-lime-50 border-lime-200'
              : isShortfall && batteryPartiallyBridgesGap
                ? 'bg-amber-50 border-amber-200'
                : isShortfall && batteryNetMW <= 0
                  ? 'bg-red-50 border-red-300'
                  : 'bg-gray-50 border-gray-200'
        }`}>
          {/* Supply meets demand comfortably */}
          {!isShortfall && teamSupplyPct >= 100 && (
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">✅</span>
              <div className="text-[11px] text-green-700 leading-relaxed">
                <span className="font-bold">You're meeting your share.</span> If all teams do the same, the grid stays balanced.
              </div>
            </div>
          )}

          {/* Shortfall exists but battery bridges the gap */}
          {isShortfall && batteryBridgesGap && (
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">🔋</span>
              <div className="text-[11px] text-lime-800 leading-relaxed">
                <span className="font-bold">Your battery is bridging a {Math.round(gapFilledByBattery)} MW shortfall.</span>{' '}
                Without battery storage, the grid can't cope. Every team must contribute.
              </div>
            </div>
          )}

          {/* Battery partially bridges the gap */}
          {batteryPartiallyBridgesGap && (
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">⚠️</span>
              <div className="text-[11px] text-amber-800 leading-relaxed">
                <span className="font-bold">Your battery provides {Math.round(batteryDischargeMW)} MW but you're still {Math.round(remainingGap)} MW short.</span>{' '}
                Batteries across all teams are critical to avoiding a grid emergency.
              </div>
            </div>
          )}

          {/* Shortfall exists but battery is idle */}
          {isShortfall && batteryNetMW === 0 && (
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">🚨</span>
              <div className="text-[11px] text-red-700 leading-relaxed">
                <span className="font-bold">Without your battery, you're {Math.round(gapMW)} MW short.</span>{' '}
                Your battery is the key to bridging this gap — and every team needs to do the same to keep the grid balanced.
              </div>
            </div>
          )}

          {/* Shortfall exists but battery is CHARGING (worst case) */}
          {isShortfall && batteryNetMW < 0 && (
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">🚨</span>
              <div className="text-[11px] text-red-700 leading-relaxed">
                <span className="font-bold">Charging during a shortfall adds {Math.round(batteryChargeMW)} MW to demand pressure.</span>{' '}
                Your battery is needed on the supply side — consider switching to Discharge.
              </div>
            </div>
          )}

          {/* No shortfall but supply is tight (80-99%) */}
          {!isShortfall && teamSupplyPct < 100 && teamSupplyPct >= 80 && (
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">⚡</span>
              <div className="text-[11px] text-amber-700 leading-relaxed">
                <span className="font-bold">Supply is close but not quite meeting your share.</span>{' '}
                Every team needs to contribute their full capacity to keep the grid balanced.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ 3. Grid Stress Alert (when shortfall exists) ═══ */}
      {isShortfall && (
        <div className={`rounded-lg border p-3 ${
          gapAsPctOfBattery > 100
            ? 'bg-red-100 border-red-400'
            : gapAsPctOfBattery > 50
              ? 'bg-red-50 border-red-300'
              : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start gap-2">
            <span className={`text-lg ${gapAsPctOfBattery > 50 ? 'animate-pulse' : ''}`}>
              {gapAsPctOfBattery > 100 ? '🔴' : gapAsPctOfBattery > 50 ? '🟠' : '🟡'}
            </span>
            <div className="flex-1">
              {gapAsPctOfBattery > 100 ? (
                <div>
                  <div className="text-xs font-bold text-red-800">
                    SUPPLY EMERGENCY
                  </div>
                  <div className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                    Even full battery discharge can't cover the <span className="font-bold font-mono">{Math.round(gapMW)} MW</span> shortfall.
                    Expect very high prices. Every team faces this — batteries are critical to keeping the grid balanced.
                  </div>
                </div>
              ) : gapAsPctOfBattery > 50 ? (
                <div>
                  <div className="text-xs font-bold text-red-700">
                    GRID STRESS — Battery discharge essential
                  </div>
                  <div className="text-[11px] text-red-600 mt-0.5 leading-relaxed">
                    Your non-battery supply falls <span className="font-bold font-mono">{Math.round(gapMW)} MW</span> short.
                    Battery discharge is essential. All teams must contribute to keep the grid balanced.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-amber-700">
                    Supply is tight — battery discharge recommended
                  </div>
                  <div className="text-[11px] text-amber-600 mt-0.5 leading-relaxed">
                    You have a <span className="font-bold font-mono">{Math.round(gapMW)} MW</span> shortfall without battery.
                    Discharge to meet your share and help the grid stay balanced.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ 4. Battery Impact Summary ═══ */}
      <div className={`rounded-lg border p-3 ${
        batteryNetMW > 0
          ? isShortfall ? 'bg-lime-50 border-lime-300' : 'bg-blue-50 border-blue-200'
          : batteryNetMW < 0
            ? isShortfall ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-200'
            : isShortfall ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {batteryNetMW > 0 ? '🔋→⚡' : batteryNetMW < 0 ? '⚡→🔋' : '⏸'}
          </span>
          <div className="flex-1">
            {batteryNetMW > 0 ? (
              <div className="text-xs">
                <span className={`font-bold ${isShortfall ? 'text-lime-700' : 'text-blue-700'}`}>
                  Discharging {Math.round(batteryNetMW)} MW
                </span>
                <span className={`ml-1 ${isShortfall ? 'text-lime-600' : 'text-blue-600'}`}>
                  {isShortfall
                    ? batteryBridgesGap
                      ? '— bridging the supply gap'
                      : `— helping but ${Math.round(remainingGap)} MW gap remains`
                    : '— adding to supply surplus'}
                </span>
              </div>
            ) : batteryNetMW < 0 ? (
              <div className="text-xs">
                <span className={`font-bold ${isShortfall ? 'text-red-700' : 'text-amber-700'}`}>
                  Charging {Math.round(Math.abs(batteryNetMW))} MW
                </span>
                <span className={`ml-1 ${isShortfall ? 'text-red-600' : 'text-amber-600'}`}>
                  {isShortfall
                    ? '— adding to demand during a shortfall!'
                    : '— drawing from grid (adding to demand)'}
                </span>
              </div>
            ) : (
              <div className={`text-xs ${isShortfall ? 'text-red-600' : 'text-gray-500'}`}>
                <span className="font-bold">Battery idle</span>
                <span className="ml-1">
                  {isShortfall
                    ? `— ${Math.round(gapMW)} MW shortfall. Switch to Discharge!`
                    : '— no effect on supply/demand balance'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Net position summary */}
        <div className="mt-2 pt-2 border-t border-gray-200/50 flex items-center justify-between text-[10px]">
          <span className="text-gray-500">
            Net: {formatMW(Math.round(teamTotalSupply))} supply vs {formatMW(Math.round(teamEffectiveDemand))} demand
          </span>
          <span className={`font-mono font-bold ${supplyPctColor(teamSupplyPct)}`}>
            {teamSupplyPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
