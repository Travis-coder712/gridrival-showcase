/**
 * GuidedBiddingView — Step-by-step guided bidding interface.
 *
 * Replaces the original "wall of information" bidding layout with a clear
 * 3-step flow: (1) Know Your Assets → (2) Understand Demand → (3) Place Your Bids.
 *
 * All props/callbacks are identical to what the original bidding section uses in
 * TeamGame.tsx so the two can be swapped with a single boolean toggle.
 */
import { useState, useMemo } from 'react';
import { ASSET_ICONS, ASSET_COLORS } from '../../lib/colors';
import { formatCurrency, formatMW, formatPrice, formatNumber } from '../../lib/formatters';
import {
  TIME_PERIOD_SHORT_LABELS, TIME_PERIOD_TIME_RANGES,
  ASSET_TYPE_LABELS, SEASON_LABELS, getPeriodDescriptions,
} from '../../../shared/types';
import {
  STRATEGIES, getAvailableStrategies,
  type StrategyId, type Intensity,
} from '../../lib/bidding-strategies';
import type {
  AssetBid, AssetInfo, BidBand, TeamAssetInstance, TimePeriod,
  AssetType, RoundConfig, GameStateSnapshot, WalkthroughSuggestedBid,
} from '../../../shared/types';
import BatteryModeToggle from './BatteryModeToggle';
import type { BatteryMode } from '../../../shared/types';
import RenewableInfoCard from './RenewableInfoCard';
import HydroDispatchSelector from './HydroDispatchSelector';
import SupplyDemandDiagram from './SupplyDemandDiagram';
import type { Season } from '../../../shared/types';

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════

export interface GuidedBiddingProps {
  // Game data
  roundConfig: RoundConfig;
  gameState: GameStateSnapshot;
  assets: TeamAssetInstance[];
  assetDefs: AssetInfo[];
  walkthrough: RoundConfig['walkthrough'];

  // Bid state
  bids: Map<string, AssetBid>;
  selectedPeriod: TimePeriod;
  onPeriodChange: (p: TimePeriod) => void;

  // Bid actions
  onUpdateBand: (assetId: string, period: TimePeriod, bandIndex: number, field: 'pricePerMWh' | 'quantityMW', value: number) => void;
  onAddBand: (assetId: string, period: TimePeriod) => void;
  onQuickBid: (assetId: string, period: TimePeriod, strategy: 'zero' | 'srmc' | 'high') => void;
  onApplyStrategy: (stratId: StrategyId, intensity: Intensity, applyMode?: 'all' | 'selected', assetIds?: Set<string>) => void;

  // Help modals
  onShowHowToBid: () => void;
  onShowRoundBriefing: () => void;
  onShowStrategyGuide: () => void;
  onShowCommonMistakes: () => void;

  // Helpers
  getAssetDef: (assetId: string) => AssetInfo | undefined;
  getBidBands: (assetId: string, period: TimePeriod) => BidBand[];

  // Battery-specific
  hasBattery?: boolean;

  // Portfolio explainer
  showPortfolioButton?: boolean;
  onShowPortfolioExplainer?: () => void;
  onShowBatteryExplainer?: () => void;
  batteryModes?: Map<string, BatteryMode>;
  chargeMWs?: Map<string, number>;
  onBatteryModeChange?: (assetId: string, period: TimePeriod, mode: BatteryMode) => void;
  onChargeMWChange?: (assetId: string, period: TimePeriod, mw: number) => void;

  // Hydro-specific
  hydroDispatchPeriods?: Map<string, TimePeriod | null>;
  hydroBidPrices?: Map<string, number>;
  onHydroDispatchPeriodChange?: (assetId: string, period: TimePeriod | null) => void;
  onHydroBidPriceChange?: (assetId: string, price: number) => void;

  // Strategy per-period toggle (kept for classic view compatibility)
  strategyApplyScope?: 'current_period' | 'all_periods';
  onStrategyApplyScopeChange?: (scope: 'current_period' | 'all_periods') => void;
}

// ═══════════════════════════════════════════════════════
//  STEP INDICATOR
// ═══════════════════════════════════════════════════════

function StepIndicator({ currentStep, onStepClick, bidsFilled }: {
  currentStep: number;
  onStepClick: (step: number) => void;
  bidsFilled: boolean;
}) {
  const steps = [
    { num: 1, label: 'Your Assets', icon: '⚡' },
    { num: 2, label: 'Market Demand', icon: '📊' },
    { num: 3, label: 'Place Bids', icon: '💰' },
  ];

  return (
    <div className="flex items-center justify-between mb-4 px-1">
      {steps.map((step, i) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num || (step.num === 3 && bidsFilled);
        return (
          <div key={step.num} className="flex items-center flex-1">
            <button
              onClick={() => onStepClick(step.num)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all w-full justify-center ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                  : isCompleted
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              <span className="text-sm">
                {isCompleted && !isActive ? '✓' : step.icon}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">Step {step.num}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-4 h-0.5 mx-1 flex-shrink-0 ${
                currentStep > step.num ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  STEP 1: YOUR ASSETS
// ═══════════════════════════════════════════════════════

function Step1Assets({ assets, assetDefs, getAssetDef, onNext }: {
  assets: TeamAssetInstance[];
  assetDefs: AssetInfo[];
  getAssetDef: (id: string) => AssetInfo | undefined;
  onNext: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <h3 className="text-sm font-bold text-blue-800 mb-1">
          Step 1 — Know Your Assets
        </h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          These are the power plants you control this round. Each has a <strong>capacity</strong> (MW you can offer) and a <strong>marginal cost</strong> (what it costs you to generate each MWh). You want to bid <em>above</em> your marginal cost to make a profit.
        </p>
      </div>

      <div className="space-y-2">
        {assets.map(asset => {
          const typeKey = asset.assetDefinitionId.split('_')[0] as AssetType;
          const fullTypeKey = asset.assetDefinitionId.includes('ccgt') ? 'gas_ccgt' as AssetType :
                              asset.assetDefinitionId.includes('peaker') ? 'gas_peaker' as AssetType : typeKey;
          const def = getAssetDef(asset.assetDefinitionId);
          if (!def) return null;

          return (
            <div
              key={asset.assetDefinitionId}
              className={`bg-white rounded-xl border overflow-hidden ${
                asset.isForceOutage ? 'border-red-300 opacity-70' : 'border-gray-200'
              }`}
              style={{ borderLeft: `4px solid ${ASSET_COLORS[fullTypeKey] || '#999'}` }}
            >
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ASSET_ICONS[fullTypeKey] || '🏭'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800">{def.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-gray-600">
                        {formatMW(asset.currentAvailableMW)} capacity
                      </span>
                      {asset.isForceOutage && (
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">OUTAGE</span>
                      )}
                    </div>
                  </div>
                  <div className={`text-right px-3 py-1.5 rounded-lg border-2 ${
                    def.srmcPerMWh === 0 ? 'bg-green-50 border-green-300' :
                    def.srmcPerMWh < 50 ? 'bg-blue-50 border-blue-300' :
                    def.srmcPerMWh < 100 ? 'bg-amber-50 border-amber-300' :
                    'bg-red-50 border-red-300'
                  }`}>
                    <div className="text-[10px] text-gray-500 uppercase">Cost</div>
                    <div className={`text-sm font-extrabold ${
                      def.srmcPerMWh === 0 ? 'text-green-800' :
                      def.srmcPerMWh < 50 ? 'text-blue-800' :
                      def.srmcPerMWh < 100 ? 'text-amber-800' :
                      'text-red-800'
                    }`}>
                      ${def.srmcPerMWh}/MWh
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Next: See Market Demand →
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  STEP 2: MARKET DEMAND
// ═══════════════════════════════════════════════════════

function Step2Demand({ roundConfig, gameState, assets, assetDefs, selectedPeriod, onPeriodChange, onNext, onBack }: {
  roundConfig: RoundConfig;
  gameState: GameStateSnapshot;
  assets: TeamAssetInstance[];
  assetDefs: AssetInfo[];
  selectedPeriod: TimePeriod;
  onPeriodChange: (p: TimePeriod) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const availableAssetTypes = useMemo(() => {
    const types = new Set<AssetType>();
    for (const a of assets) {
      const def = assetDefs.find(d => d.id === a.assetDefinitionId);
      if (def) types.add(def.type);
    }
    return Array.from(types);
  }, [assets, assetDefs]);

  return (
    <div className="space-y-3">
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
        <h3 className="text-sm font-bold text-indigo-800 mb-1">
          Step 2 — Understand Market Demand
        </h3>
        <p className="text-xs text-indigo-700 leading-relaxed">
          Demand varies across the day. <strong>Higher demand = tighter market = higher prices.</strong> Tap each period to see details. You will bid for each period separately in Step 3.
        </p>
      </div>

      {/* Period Cards */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-white/80 mb-2">
          {SEASON_LABELS[roundConfig.season]} — Demand by Period
        </div>
        <div className={`grid gap-2 ${roundConfig.timePeriods.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {roundConfig.timePeriods.map(p => {
            const desc = getPeriodDescriptions(p as TimePeriod, roundConfig.season, availableAssetTypes);
            const demandMW = roundConfig.baseDemandMW[p] || 0;
            const pctOfFleet = gameState?.fleetInfo?.demandAsPercentOfFleet[p] || 0;

            return (
              <button
                key={p}
                onClick={() => onPeriodChange(p as TimePeriod)}
                className={`rounded-lg p-3 text-left transition-all ${
                  selectedPeriod === p ? 'bg-white/25 ring-2 ring-white' : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <div className="text-xs opacity-80">{desc.icon} {desc.label}</div>
                <div className="text-[10px] opacity-60">{TIME_PERIOD_TIME_RANGES[p as TimePeriod]}</div>
                <div className="text-xl font-bold font-mono mt-1">{formatMW(demandMW)}</div>
                <div className={`text-xs font-bold ${
                  pctOfFleet >= 90 ? 'text-red-300' : pctOfFleet >= 70 ? 'text-amber-300' : 'text-green-300'
                }`}>{pctOfFleet}% of fleet needed</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected period detail */}
      {(() => {
        const desc = getPeriodDescriptions(selectedPeriod, roundConfig.season, availableAssetTypes);
        const demandMW = roundConfig.baseDemandMW[selectedPeriod] || 0;
        const fleetMW = gameState?.fleetInfo?.totalFleetMW[selectedPeriod] || 1;
        const pct = Math.min(100, (demandMW / fleetMW) * 100);

        return (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{desc.icon}</span>
              <span className="text-sm font-bold text-gray-800">{desc.label}</span>
              <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                desc.demandLevel === 'Low' ? 'bg-green-100 text-green-700' :
                desc.demandLevel === 'Moderate' || desc.demandLevel.includes('solar') ? 'bg-blue-100 text-blue-700' :
                desc.demandLevel === 'High' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {desc.demandLevel} demand
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg px-3 py-2">
                <div className="text-[10px] text-gray-500 uppercase">Demand</div>
                <div className="text-base font-bold font-mono text-blue-700">{formatMW(demandMW)}</div>
              </div>
              <div className="bg-indigo-50 rounded-lg px-3 py-2">
                <div className="text-[10px] text-gray-500 uppercase">Total Supply</div>
                <div className="text-base font-bold font-mono text-indigo-700">{formatMW(fleetMW)}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>Loose market</span>
                <span>Tight market</span>
              </div>
            </div>

            <p className="text-[11px] text-blue-700 leading-relaxed">
              <strong>💲</strong> {desc.priceContext}
            </p>
          </div>
        );
      })()}

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
        >
          Next: Place Your Bids →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  STEP 3: PLACE BIDS (main bidding interface)
// ═══════════════════════════════════════════════════════

function Step3Bids(props: GuidedBiddingProps & { onBack: () => void }) {
  const {
    roundConfig, gameState, assets, assetDefs, walkthrough,
    bids, selectedPeriod, onPeriodChange,
    onUpdateBand, onAddBand, onQuickBid, onApplyStrategy,
    onShowStrategyGuide, getAssetDef, getBidBands, onBack,
    batteryModes, onBatteryModeChange, onChargeMWChange, chargeMWs,
    hydroDispatchPeriods, hydroBidPrices,
    onHydroDispatchPeriodChange, onHydroBidPriceChange,
    strategyApplyScope, onStrategyApplyScopeChange,
  } = props;

  const [strategyOpen, setStrategyOpen] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId | ''>('');
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>('medium');
  const [strategyApplyMode, setStrategyApplyMode] = useState<'all' | 'selected'>('all');
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());

  const availableAssetTypes = useMemo(() => {
    const types = new Set<AssetType>();
    for (const a of assets) {
      const def = assetDefs.find(d => d.id === a.assetDefinitionId);
      if (def) types.add(def.type);
    }
    return Array.from(types);
  }, [assets, assetDefs]);

  const filteredStrategies = useMemo(() => {
    return getAvailableStrategies(availableAssetTypes);
  }, [availableAssetTypes]);

  // ── Group assets by category ──
  const renewableAssets = useMemo(() => assets.filter(a => {
    const def = getAssetDef(a.assetDefinitionId);
    return def?.type === 'wind' || def?.type === 'solar';
  }), [assets, getAssetDef]);

  const batteryAssets = useMemo(() => assets.filter(a => {
    const def = getAssetDef(a.assetDefinitionId);
    return def?.type === 'battery';
  }), [assets, getAssetDef]);

  const hydroAssets = useMemo(() => assets.filter(a => {
    const def = getAssetDef(a.assetDefinitionId);
    return def?.type === 'hydro';
  }), [assets, getAssetDef]);

  const thermalAssets = useMemo(() => assets.filter(a => {
    const def = getAssetDef(a.assetDefinitionId);
    return def && def.type !== 'wind' && def.type !== 'solar' && def.type !== 'battery' && def.type !== 'hydro';
  }), [assets, getAssetDef]);

  // Helper to get full type key for an asset
  const getFullTypeKey = (assetDefId: string): AssetType => {
    if (assetDefId.includes('ccgt')) return 'gas_ccgt';
    if (assetDefId.includes('peaker')) return 'gas_peaker';
    return assetDefId.split('_')[0] as AssetType;
  };

  // ── Supply totals per period (shared by thermal table & battery diagram) ──
  const periods = roundConfig.timePeriods;
  const teamCount = gameState.expectedTeamCount || gameState.teams?.length || 1;

  const thermalTotalByPeriod = useMemo(() => {
    const result: Record<string, number> = {};
    for (const p of periods) {
      result[p] = thermalAssets.reduce((sum, asset) => {
        const bands = getBidBands(asset.assetDefinitionId, p as TimePeriod);
        return sum + bands.reduce((s, b) => s + (b.quantityMW || 0), 0);
      }, 0);
    }
    return result;
  }, [periods, thermalAssets, getBidBands]);

  const renewableTotalByPeriod = useMemo(() => {
    const result: Record<string, number> = {};
    for (const p of periods) {
      result[p] = renewableAssets.reduce((sum, asset) => {
        const def = getAssetDef(asset.assetDefinitionId);
        return sum + (def?.availabilityByPeriod?.[p] ?? asset.currentAvailableMW);
      }, 0);
    }
    return result;
  }, [periods, renewableAssets, getAssetDef]);

  const hydroTotalByPeriod = useMemo(() => {
    const result: Record<string, number> = {};
    for (const p of periods) {
      result[p] = hydroAssets.reduce((sum, asset) => {
        const dispatchPeriod = hydroDispatchPeriods?.get(asset.assetDefinitionId);
        if (dispatchPeriod === p) {
          return sum + asset.currentAvailableMW;
        }
        return sum;
      }, 0);
    }
    return result;
  }, [periods, hydroAssets, hydroDispatchPeriods]);

  // ── Projected SOC per period per battery asset ──
  // Iterates through periods in order, applying charge/discharge/idle effects
  // to compute what the SOC will be at the START of each period.
  const projectedSOCByAssetPeriod = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};

    for (const asset of batteryAssets) {
      const assetId = asset.assetDefinitionId;
      const def = getAssetDef(assetId);
      if (!def) continue;

      const maxStorage = asset.maxStorageMWh ?? def.maxStorageMWh ?? 0;
      const efficiency = (def as any).roundTripEfficiency ?? 1;
      const startSOC = asset.currentStorageMWh ?? 0;

      const assetSOC: Record<string, number> = {};
      let runningSOC = startSOC;

      for (const p of periods) {
        const period = p as TimePeriod;
        const key = `${assetId}_${period}`;
        const hours = 6; // All periods are 6 hours

        // This period starts with the running SOC
        assetSOC[period] = runningSOC;

        const mode = batteryModes?.get(key) || 'idle';

        if (mode === 'charge') {
          const chargeMW = chargeMWs?.get(key) || 0;
          // Energy stored = grid draw × efficiency × hours
          const energyStored = chargeMW * efficiency * hours;
          runningSOC = Math.min(maxStorage, runningSOC + energyStored);
        } else if (mode === 'discharge') {
          const bands = getBidBands(assetId, period);
          const totalDischargeMW = bands.reduce((s, b) => s + (b.quantityMW || 0), 0);
          const energyDischarged = totalDischargeMW * hours;
          runningSOC = Math.max(0, runningSOC - energyDischarged);
        }
        // idle: no change
      }

      result[assetId] = assetSOC;
    }

    return result;
  }, [batteryAssets, periods, batteryModes, chargeMWs, getBidBands, getAssetDef]);

  // Battery net MW for current period: sum of discharge (positive) and charge (negative)
  const batteryNetMW = useMemo(() => {
    let net = 0;
    for (const asset of batteryAssets) {
      const key = `${asset.assetDefinitionId}_${selectedPeriod}`;
      const mode = batteryModes?.get(key) || 'idle';
      if (mode === 'discharge') {
        const bands = getBidBands(asset.assetDefinitionId, selectedPeriod);
        net += bands.reduce((s, b) => s + (b.quantityMW || 0), 0);
      } else if (mode === 'charge') {
        const chargeMW = chargeMWs?.get(key) || 0;
        net -= chargeMW;
      }
    }
    return net;
  }, [batteryAssets, selectedPeriod, batteryModes, chargeMWs, getBidBands]);

  const batteryCapacityMW = useMemo(() => {
    return batteryAssets.reduce((sum, a) => sum + a.currentAvailableMW, 0);
  }, [batteryAssets]);

  // ── Stress period detection ──
  // Identify periods where non-battery supply < pro-rata demand share
  const stressPeriods = useMemo(() => {
    if (!gameState.fleetInfo) return [] as TimePeriod[];
    return (periods as TimePeriod[]).filter(p => {
      const supply = (thermalTotalByPeriod[p] || 0) + (renewableTotalByPeriod[p] || 0) + (hydroTotalByPeriod[p] || 0);
      const demand = teamCount > 0 ? Math.round((gameState.fleetInfo!.demandMW[p] || 0) / teamCount) : 0;
      return supply < demand;
    });
  }, [periods, thermalTotalByPeriod, renewableTotalByPeriod, hydroTotalByPeriod, gameState.fleetInfo, teamCount]);

  // Is the currently selected period a stress period?
  const isCurrentPeriodStress = stressPeriods.includes(selectedPeriod);

  // Current period gap info for smart warnings
  const currentPeriodGap = useMemo(() => {
    if (!gameState.fleetInfo) return 0;
    const supply = (thermalTotalByPeriod[selectedPeriod] || 0) + (renewableTotalByPeriod[selectedPeriod] || 0) + (hydroTotalByPeriod[selectedPeriod] || 0);
    const demand = teamCount > 0 ? Math.round((gameState.fleetInfo.demandMW[selectedPeriod] || 0) / teamCount) : 0;
    return Math.max(0, demand - supply);
  }, [selectedPeriod, thermalTotalByPeriod, renewableTotalByPeriod, hydroTotalByPeriod, gameState.fleetInfo, teamCount]);

  return (
    <div className="space-y-3">
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <h3 className="text-sm font-bold text-green-800 mb-1">
          Step 3 — Place Your Bids
        </h3>
        <p className="text-xs text-green-700 leading-relaxed">
          For each asset, set a <strong>price</strong> ($/MWh you want to be paid) and <strong>quantity</strong> (MW you are offering). Use the period tabs to bid for each time period. Use a <strong>strategy</strong> to auto-fill, or set bids manually.
        </p>
      </div>

      {/* Walkthrough Banner */}
      {walkthrough && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎓</span>
            <span className="text-sm font-bold text-purple-800">Guided Round</span>
          </div>
          <p className="text-xs text-purple-700 leading-relaxed">{walkthrough.introText}</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/*  Section A: Renewables                           */}
      {/* ══════════════════════════════════════════════════ */}
      {renewableAssets.length > 0 && (
        <div className="space-y-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <h4 className="text-sm font-bold text-emerald-800 mb-0.5">
              ☀️💨 Renewables — Generation Pattern Already Set
            </h4>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              The MW values below reflect each asset's <strong>expected generation pattern</strong> based on weather and time of day.
              Renewables always bid at $0/MWh (matching AEMO rules), so dispatch is already determined — <strong>no action needed from you</strong>.
            </p>
          </div>
          {renewableAssets.map(asset => {
            const def = getAssetDef(asset.assetDefinitionId);
            if (!def) return null;
            return (
              <RenewableInfoCard
                key={asset.assetDefinitionId}
                asset={asset}
                assetDef={def}
                periods={roundConfig.timePeriods}
                selectedPeriod={selectedPeriod}
                season={roundConfig.season}
              />
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/*  Section B: Hydro                                */}
      {/* ══════════════════════════════════════════════════ */}
      {hydroAssets.length > 0 && (
        <div className="space-y-2">
          <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
            <h4 className="text-sm font-bold text-sky-800 mb-0.5">
              💧 Hydro — Strategic Dispatch
            </h4>
            <p className="text-[11px] text-sky-700 leading-relaxed">
              Choose ONE period to dispatch. Hydro has limited water storage — pick your best opportunity.
            </p>
          </div>
          {hydroAssets.map(asset => {
            const def = getAssetDef(asset.assetDefinitionId);
            if (!def) return null;
            const assetId = asset.assetDefinitionId;

            return (
              <HydroDispatchSelector
                key={assetId}
                asset={asset}
                assetDef={def}
                periods={roundConfig.timePeriods}
                selectedDispatchPeriod={hydroDispatchPeriods?.get(assetId) ?? null}
                bidPrice={hydroBidPrices?.get(assetId) ?? 8}
                onDispatchPeriodChange={(period) => onHydroDispatchPeriodChange?.(assetId, period)}
                onBidPriceChange={(price) => onHydroBidPriceChange?.(assetId, price)}
                season={roundConfig.season}
              />
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/*  Section C: Thermal — Strategy + Bid Table       */}
      {/* ══════════════════════════════════════════════════ */}
      {thermalAssets.length > 0 && (
        <div className="space-y-3">
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
            <h4 className="text-sm font-bold text-orange-800 mb-0.5">
              🏭 Thermal — Place Your Bids
            </h4>
          </div>

          {/* Strategy Auto-Fill — auto-applies on selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setStrategyOpen(!strategyOpen)}
              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🧠</span>
                <span className="text-xs font-semibold text-gray-800">Auto-Fill with Strategy</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onShowStrategyGuide(); }}
                  className="px-1.5 py-0.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded text-[10px] font-bold transition-colors"
                >
                  📖
                </button>
                {selectedStrategy && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {STRATEGIES.find(s => s.id === selectedStrategy)?.icon}{' '}
                    {STRATEGIES.find(s => s.id === selectedStrategy)?.name} ({selectedIntensity})
                  </span>
                )}
              </div>
              <span className={`text-gray-400 text-xs transition-transform ${strategyOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {strategyOpen && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                <p className="text-[11px] text-gray-500">
                  Select a strategy below — bids auto-populate immediately. Change intensity to see different bid levels.
                </p>

                <select
                  value={selectedStrategy}
                  onChange={e => {
                    const newStrat = e.target.value as StrategyId;
                    setSelectedStrategy(newStrat);
                    if (newStrat) {
                      onApplyStrategy(newStrat, selectedIntensity, strategyApplyMode, selectedAssetIds);
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="">Select a strategy...</option>
                  {filteredStrategies.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name} — {s.shortDescription}</option>
                  ))}
                </select>

                {selectedStrategy && (
                  <>
                    {/* Strategy description */}
                    {(() => {
                      const strat = STRATEGIES.find(s => s.id === selectedStrategy);
                      if (!strat) return null;
                      return (
                        <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                          <p className="text-[11px] text-gray-600 leading-relaxed">{strat.description}</p>
                        </div>
                      );
                    })()}

                    {/* Intensity — auto-applies on click */}
                    <div className="flex gap-1.5">
                      {(['low', 'medium', 'max'] as Intensity[]).map(level => {
                        const strat = STRATEGIES.find(s => s.id === selectedStrategy);
                        const isActive = selectedIntensity === level;
                        const colors = level === 'low'
                          ? 'bg-green-50 text-green-700 border-green-300'
                          : level === 'medium'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-red-50 text-red-700 border-red-300';
                        const activeColors = level === 'low'
                          ? 'bg-green-500 text-white border-green-500'
                          : level === 'medium'
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-red-500 text-white border-red-500';

                        return (
                          <button
                            key={level}
                            onClick={() => {
                              setSelectedIntensity(level);
                              if (selectedStrategy) {
                                onApplyStrategy(selectedStrategy as StrategyId, level, strategyApplyMode, selectedAssetIds);
                              }
                            }}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                              isActive ? activeColors : `${colors} hover:opacity-80`
                            }`}
                          >
                            <div className="font-bold capitalize">{level}</div>
                            <div className={`text-[10px] mt-0.5 ${isActive ? 'text-white/80' : 'opacity-70'}`}>
                              {strat?.intensityLabels[level]}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Asset selection (only show if >1 thermal asset) */}
                    {thermalAssets.length > 1 && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={strategyApplyMode === 'all'}
                            onChange={(e) => {
                              const newMode = e.target.checked ? 'all' as const : 'selected' as const;
                              const newIds = new Set(thermalAssets.map(a => a.assetDefinitionId));
                              setStrategyApplyMode(newMode);
                              setSelectedAssetIds(newIds);
                              if (selectedStrategy) {
                                onApplyStrategy(selectedStrategy as StrategyId, selectedIntensity, newMode, newIds);
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">All Thermal Assets</span>
                        </label>

                        {strategyApplyMode === 'selected' && (
                          <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-3">
                            {thermalAssets.map(asset => {
                              const typeKey = getFullTypeKey(asset.assetDefinitionId);
                              const def = assetDefs.find((d: AssetInfo) => d.id === asset.assetDefinitionId);
                              const isChecked = selectedAssetIds.has(asset.assetDefinitionId);
                              return (
                                <label
                                  key={asset.assetDefinitionId}
                                  className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg transition-colors ${
                                    isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={asset.isForceOutage}
                                    onChange={(e) => {
                                      const next = new Set(selectedAssetIds);
                                      if (e.target.checked) next.add(asset.assetDefinitionId);
                                      else next.delete(asset.assetDefinitionId);
                                      setSelectedAssetIds(next);
                                      if (selectedStrategy) {
                                        onApplyStrategy(selectedStrategy as StrategyId, selectedIntensity, strategyApplyMode, next);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm">{ASSET_ICONS[typeKey] || '⚡'}</span>
                                  <span className="text-xs text-gray-700 font-medium truncate">{def?.name || asset.assetDefinitionId}</span>
                                  <span className="text-[10px] text-gray-400 ml-auto">{Math.round(asset.currentAvailableMW)} MW</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Thermal Bid Table ── */}
          {(() => {
            const maxBands = roundConfig.maxBidBandsPerAsset;

            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="text-left py-2 pl-3 pr-2 text-gray-600 font-semibold text-xs sticky left-0 bg-gray-50 z-10 min-w-[140px]">Asset</th>
                        {periods.map(p => {
                          const desc = getPeriodDescriptions(p as TimePeriod, roundConfig.season, availableAssetTypes);
                          return (
                            <th key={p} className="text-center py-2 px-1 text-gray-600 font-semibold text-xs min-w-[120px]">
                              <div>{desc.icon} {desc.label}</div>
                              <div className="text-[9px] font-normal text-gray-400">{formatMW(roundConfig.baseDemandMW[p] || 0)} demand</div>
                            </th>
                          );
                        })}
                      </tr>
                      {/* Sub-header row: $/MWh and MW column labels */}
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="sticky left-0 bg-gray-50/50 z-10"></th>
                        {periods.map(p => (
                          <th key={`sub-${p}`} className="py-0.5 px-1">
                            <div className="flex gap-0.5 justify-center">
                              <span className="text-[8px] font-semibold text-blue-500 w-14 text-center">$/MWh</span>
                              <span className="text-[8px] font-semibold text-green-500 w-14 text-center">MW</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* ── Renewable rows (read-only — generation pattern) ── */}
                      {renewableAssets.map(asset => {
                        const def = getAssetDef(asset.assetDefinitionId);
                        const typeKey = getFullTypeKey(asset.assetDefinitionId);
                        return (
                          <tr key={asset.assetDefinitionId} className="border-b border-gray-100 bg-green-50/30">
                            <td className="py-2 pl-3 pr-2 sticky left-0 bg-green-50/30 z-10">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{ASSET_ICONS[typeKey] || '⚡'}</span>
                                <div>
                                  <div className="text-xs font-medium text-gray-700">{def?.name || typeKey}</div>
                                  <div className="text-[10px] text-green-600 italic">Generation forecast · $0/MWh</div>
                                </div>
                              </div>
                            </td>
                            {periods.map(p => {
                              const mw = def?.availabilityByPeriod?.[p] ?? asset.currentAvailableMW;
                              return (
                                <td key={p} className="py-2 px-1 text-center">
                                  <div className={`text-xs font-mono ${mw > 0 ? 'text-green-700' : 'text-gray-300'}`}>
                                    {mw > 0 ? `${Math.round(mw)} MW` : '—'}
                                  </div>
                                  {mw > 0 && <div className="text-[8px] text-green-500">auto</div>}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {/* ── Thermal rows (editable) ── */}
                      {thermalAssets.map(asset => {
                        const typeKey = getFullTypeKey(asset.assetDefinitionId);
                        const def = getAssetDef(asset.assetDefinitionId);
                        return (
                          <tr key={asset.assetDefinitionId} className={`border-b border-gray-100 ${
                            asset.isForceOutage ? 'opacity-50' : ''
                          }`}>
                            <td className="py-2 pl-3 pr-2 sticky left-0 bg-white z-10">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{ASSET_ICONS[typeKey] || '🏭'}</span>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-gray-800 truncate">{def?.name || typeKey}</div>
                                  <div className="text-[10px] text-gray-400">
                                    ${def?.srmcPerMWh}/MWh · {Math.round(asset.currentAvailableMW)} MW
                                    {asset.isForceOutage && <span className="text-red-500 ml-1">OUTAGE</span>}
                                  </div>
                                </div>
                              </div>
                              {/* Quick bid row — applies to all periods */}
                              {!asset.isForceOutage && (
                                <div className="flex gap-1 mt-1">
                                  <button
                                    onClick={() => periods.forEach(p => onQuickBid(asset.assetDefinitionId, p as TimePeriod, 'zero'))}
                                    className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] rounded border border-green-200 hover:bg-green-100"
                                  >$0 all</button>
                                  <button
                                    onClick={() => periods.forEach(p => onQuickBid(asset.assetDefinitionId, p as TimePeriod, 'srmc'))}
                                    className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] rounded border border-blue-200 hover:bg-blue-100 font-medium"
                                  >${def?.srmcPerMWh} all</button>
                                  <button
                                    onClick={() => periods.forEach(p => onQuickBid(asset.assetDefinitionId, p as TimePeriod, 'high'))}
                                    className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] rounded border border-amber-200 hover:bg-amber-100"
                                  >$500 all</button>
                                </div>
                              )}
                            </td>
                            {periods.map(p => {
                              const period = p as TimePeriod;
                              const bands = getBidBands(asset.assetDefinitionId, period);
                              return (
                                <td key={p} className="py-2 px-1 align-top">
                                  <div className="flex flex-col items-center space-y-1">
                                    {bands.map((band, i) => {
                                      const walkthroughExpl = walkthrough?.suggestedBids
                                        ?.filter(s => s.period === period && (s.assetType === typeKey || s.assetType === asset.assetDefinitionId.split('_')[0]))
                                        ?.[i]?.explanation;
                                      return (
                                        <div key={i} className="flex gap-0.5">
                                          <input
                                            type="number"
                                            value={band.pricePerMWh ?? ''}
                                            onChange={e => onUpdateBand(asset.assetDefinitionId, period, i, 'pricePerMWh', parseFloat(e.target.value) || 0)}
                                            onFocus={e => e.target.select()}
                                            placeholder="$"
                                            className={`w-14 px-1 py-0.5 border border-l-2 border-l-blue-400 rounded text-[11px] font-mono focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                                              walkthroughExpl ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                                            }`}
                                            min={-1000}
                                            max={20000}
                                          />
                                          <input
                                            type="number"
                                            value={band.quantityMW ?? ''}
                                            onChange={e => onUpdateBand(asset.assetDefinitionId, period, i, 'quantityMW', parseFloat(e.target.value) || 0)}
                                            onFocus={e => e.target.select()}
                                            placeholder="MW"
                                            className={`w-14 px-1 py-0.5 border border-l-2 border-l-green-400 rounded text-[11px] font-mono focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                                              walkthroughExpl ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                                            }`}
                                            min={0}
                                            max={asset.currentAvailableMW}
                                          />
                                        </div>
                                      );
                                    })}
                                    {bands.length < maxBands && !asset.isForceOutage && (
                                      <button
                                        onClick={() => onAddBand(asset.assetDefinitionId, period)}
                                        className="text-[9px] text-blue-500 hover:text-blue-700 hover:underline"
                                      >
                                        + band
                                      </button>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {/* ── Summary rows ── */}
                      <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                        <td className="py-2 pl-3 pr-2 text-xs text-gray-700 sticky left-0 bg-gray-50 z-10">Thermal Total</td>
                        {periods.map(p => (
                          <td key={p} className="py-2 px-1 text-center text-xs text-gray-700">
                            {formatMW(thermalTotalByPeriod[p] || 0)}
                          </td>
                        ))}
                      </tr>
                      {renewableAssets.length > 0 && (
                        <tr className="bg-green-50/50">
                          <td className="py-1.5 pl-3 pr-2 text-xs text-green-700 sticky left-0 bg-green-50/50 z-10">+ Renewables</td>
                          {periods.map(p => (
                            <td key={p} className="py-1.5 px-1 text-center text-xs text-green-700">
                              {formatMW(renewableTotalByPeriod[p] || 0)}
                            </td>
                          ))}
                        </tr>
                      )}
                      <tr className="bg-blue-50 font-bold">
                        <td className="py-2 pl-3 pr-2 text-xs text-blue-800 sticky left-0 bg-blue-50 z-10">= Total Offered</td>
                        {periods.map(p => {
                          const total = (thermalTotalByPeriod[p] || 0) + (renewableTotalByPeriod[p] || 0);
                          return (
                            <td key={p} className="py-2 px-1 text-center text-xs text-blue-800">
                              {formatMW(total)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="py-1.5 pl-3 pr-2 text-xs text-gray-500 sticky left-0 bg-white z-10">Demand (your share)</td>
                        {periods.map(p => {
                          const demand = roundConfig.baseDemandMW[p] || 0;
                          const proRata = Math.round(demand / teamCount);
                          return (
                            <td key={p} className="py-1.5 px-1 text-center text-xs text-gray-500">
                              {formatMW(proRata)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-2 pl-3 pr-2 text-xs font-bold text-gray-700 sticky left-0 bg-white z-10">% of Demand</td>
                        {periods.map(p => {
                          const totalOffered = (thermalTotalByPeriod[p] || 0) + (renewableTotalByPeriod[p] || 0);
                          const demand = roundConfig.baseDemandMW[p] || 0;
                          const proRata = Math.round(demand / teamCount);
                          const pct = proRata > 0 ? Math.round((totalOffered / proRata) * 100) : 0;
                          const colorCls = pct >= 100
                            ? 'text-green-700 bg-green-50'
                            : pct >= 80
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-red-700 bg-red-50';
                          return (
                            <td key={p} className={`py-2 px-1 text-center text-xs font-bold rounded ${colorCls}`}>
                              {pct}%
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/*  Section D: Battery                              */}
      {/* ══════════════════════════════════════════════════ */}
      {batteryAssets.length > 0 && (
        <div className="space-y-2">
          {stressPeriods.length > 0 ? (
            <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3">
              <h4 className="text-sm font-bold text-red-800 mb-0.5">
                🔋⚠️ Battery is CRITICAL This Round
              </h4>
              <p className="text-[11px] text-red-700 leading-relaxed">
                Without battery discharge, supply can't meet demand in <strong>{stressPeriods.length} period{stressPeriods.length > 1 ? 's' : ''}</strong>. Every team's battery must contribute to keep the grid balanced.
              </p>
            </div>
          ) : (
            <div className="bg-lime-50 border border-lime-200 rounded-xl px-4 py-3">
              <h4 className="text-sm font-bold text-lime-800 mb-0.5">
                🔋 Battery — Choose Based on Supply/Demand Balance
              </h4>
              <p className="text-[11px] text-lime-700 leading-relaxed">
                Use the supply/demand balance below to decide: <strong>charge</strong> when supply is surplus (cheap prices), <strong>discharge</strong> when supply is tight (high prices), or <strong>idle</strong> to hold.
              </p>
            </div>
          )}

          {/* Battery Arbitrageur Quick-Apply */}
          {(() => {
            const batteryStratAvailable = filteredStrategies.some(s => s.id === 'battery_arbitrageur');
            if (!batteryStratAvailable) return null;
            const isActive = selectedStrategy === 'battery_arbitrageur';
            return (
              <div className={`rounded-xl border overflow-hidden ${
                isActive ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'
              }`}>
                <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base">🟡</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-800">Battery Arbitrageur</div>
                      <div className="text-[10px] text-gray-500">
                        {isActive
                          ? `Applied at ${selectedIntensity} intensity — adjust modes below`
                          : 'Auto-set charge/discharge across all periods'}
                      </div>
                    </div>
                  </div>
                  {!isActive ? (
                    <div className="flex gap-1 flex-shrink-0">
                      {(['low', 'medium', 'max'] as Intensity[]).map(level => {
                        const colors = level === 'low'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : level === 'medium'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200';
                        return (
                          <button
                            key={level}
                            onClick={() => {
                              setSelectedStrategy('battery_arbitrageur' as StrategyId);
                              setSelectedIntensity(level);
                              onApplyStrategy('battery_arbitrageur' as StrategyId, level, strategyApplyMode, selectedAssetIds);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${colors}`}
                          >
                            {level === 'low' ? '$100' : level === 'medium' ? '$200' : '$400'}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedStrategy('' as StrategyId)}
                      className="px-2 py-1 rounded-lg text-[10px] font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors flex-shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Period Tabs — battery mode is per-period */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {roundConfig.timePeriods.map(p => {
              const desc = getPeriodDescriptions(p as TimePeriod, roundConfig.season, availableAssetTypes);
              const demandMW = roundConfig.baseDemandMW[p] || 0;
              return (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p as TimePeriod)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedPeriod === p
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  <div>{desc.icon} {desc.label}</div>
                  <div className={`text-[10px] font-mono mt-0.5 ${selectedPeriod === p ? 'text-white/70' : 'text-gray-400'}`}>
                    {formatMW(demandMW)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Supply/Demand Balance Diagram ── */}
          {gameState.fleetInfo && (
            <SupplyDemandDiagram
              selectedPeriod={selectedPeriod}
              periods={periods as TimePeriod[]}
              fleetInfo={gameState.fleetInfo}
              teamCount={teamCount}
              season={roundConfig.season}
              availableAssetTypes={availableAssetTypes}
              thermalTotalByPeriod={thermalTotalByPeriod}
              renewableTotalByPeriod={renewableTotalByPeriod}
              hydroTotalByPeriod={hydroTotalByPeriod}
              batteryNetMW={batteryNetMW}
              batteryCapacityMW={batteryCapacityMW}
            />
          )}

          {/* ── Smart Battery Warning (stress period + battery not discharging) ── */}
          {isCurrentPeriodStress && batteryNetMW <= 0 && batteryCapacityMW > 0 && onBatteryModeChange && (
            <div className={`rounded-xl border-2 px-4 py-3 ${
              batteryNetMW < 0 ? 'bg-red-50 border-red-400' : 'bg-amber-50 border-amber-300'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-lg animate-pulse">
                  {batteryNetMW < 0 ? '🚨' : '⚠️'}
                </span>
                <div className="flex-1">
                  {batteryNetMW < 0 ? (
                    <div className="text-xs text-red-800 leading-relaxed">
                      <span className="font-bold">Charging adds {Math.round(Math.abs(batteryNetMW))} MW to your demand during a supply shortfall.</span>{' '}
                      Your effective shortfall is {Math.round(currentPeriodGap + Math.abs(batteryNetMW))} MW. Switch to Discharge to help the grid.
                    </div>
                  ) : (
                    <div className="text-xs text-amber-800 leading-relaxed">
                      <span className="font-bold">Your supply doesn't meet your demand share — {Math.round(currentPeriodGap)} MW shortfall.</span>{' '}
                      Switch to Discharge to contribute up to {Math.round(Math.min(currentPeriodGap, batteryCapacityMW))} MW and help the grid stay balanced.
                    </div>
                  )}
                  <button
                    onClick={() => {
                      batteryAssets.forEach(a => {
                        onBatteryModeChange(a.assetDefinitionId, selectedPeriod, 'discharge');
                      });
                    }}
                    className="mt-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    🔋 Switch to Discharge
                  </button>
                </div>
              </div>
            </div>
          )}

          {batteryAssets.map(asset => {
            const typeKey = asset.assetDefinitionId.split('_')[0] as AssetType;
            const fullTypeKey = asset.assetDefinitionId.includes('ccgt') ? 'gas_ccgt' :
                                asset.assetDefinitionId.includes('peaker') ? 'gas_peaker' : typeKey;
            const bands = getBidBands(asset.assetDefinitionId, selectedPeriod);
            const totalBid = bands.reduce((s, b) => s + (b.quantityMW || 0), 0);
            const maxBands = roundConfig.maxBidBandsPerAsset;
            const def = getAssetDef(asset.assetDefinitionId);
            if (!def) return null;

            return (
              <div key={asset.assetDefinitionId} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                asset.isForceOutage ? 'border-red-300 opacity-70' : 'border-gray-200'
              }`}>
                {/* Asset Header */}
                <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100"
                     style={{ borderLeft: `4px solid ${ASSET_COLORS[fullTypeKey as AssetType] || '#999'}` }}>
                  <span className="text-lg">{ASSET_ICONS[fullTypeKey as AssetType] || '🏭'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {def.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatMW(asset.currentAvailableMW)} available
                      {asset.isForceOutage && <span className="text-red-500"> (OUTAGE)</span>}
                    </div>
                  </div>
                  <div className={`text-xs font-mono px-2 py-1 rounded flex-shrink-0 ${
                    totalBid > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {totalBid}/{asset.currentAvailableMW} MW
                  </div>
                </div>

                {/* Mini period tabs — quick switch without scrolling to top */}
                <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-1 overflow-x-auto">
                    {roundConfig.timePeriods.map(p => {
                      const period = p as TimePeriod;
                      const desc = getPeriodDescriptions(period, roundConfig.season, availableAssetTypes);
                      return (
                        <button
                          key={p}
                          onClick={() => onPeriodChange(period)}
                          className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                            selectedPeriod === p
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {desc.icon} {desc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Battery Mode Toggle */}
                {batteryModes && onBatteryModeChange && onChargeMWChange ? (
                  <div className="px-4 py-3">
                    <BatteryModeToggle
                      asset={asset}
                      assetDef={def as any}
                      period={selectedPeriod}
                      mode={batteryModes.get(`${asset.assetDefinitionId}_${selectedPeriod}`) || 'idle'}
                      chargeMW={chargeMWs?.get(`${asset.assetDefinitionId}_${selectedPeriod}`) || 0}
                      bands={bands}
                      maxBands={maxBands}
                      onModeChange={(mode) => onBatteryModeChange(asset.assetDefinitionId, selectedPeriod, mode)}
                      onChargeMWChange={(mw) => onChargeMWChange(asset.assetDefinitionId, selectedPeriod, mw)}
                      onUpdateBand={(bandIndex, field, value) => onUpdateBand(asset.assetDefinitionId, selectedPeriod, bandIndex, field, value)}
                      onAddBand={() => onAddBand(asset.assetDefinitionId, selectedPeriod)}
                      walkthroughExplanation={walkthrough?.suggestedBids
                        ?.filter(s => s.period === selectedPeriod && (s.assetType === fullTypeKey || s.assetType === typeKey))
                        ?.[0]?.explanation}
                      projectedSOCMWh={projectedSOCByAssetPeriod[asset.assetDefinitionId]?.[selectedPeriod]}
                      allPeriods={periods as TimePeriod[]}
                      projectedSOCByPeriod={projectedSOCByAssetPeriod[asset.assetDefinitionId]}
                      stressPeriods={stressPeriods}
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 text-xs text-gray-400">Battery controls unavailable</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl text-sm transition-all"
      >
        ← Back to Demand Overview
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export default function GuidedBiddingView(props: GuidedBiddingProps) {
  const [step, setStep] = useState(1);

  // Check if any bids have been filled
  const hasBids = props.bids.size > 0 && Array.from(props.bids.values()).some(
    b => b.bands.some(band => band.quantityMW > 0)
  );

  return (
    <div className="p-3">
      {/* Help Buttons — always visible, compact */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-0.5">
        <button onClick={props.onShowHowToBid} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm">
          <span>📖</span> How to Bid
        </button>
        <button onClick={props.onShowRoundBriefing} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm">
          <span>📊</span> Round
        </button>
        <button onClick={props.onShowStrategyGuide} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors shadow-sm">
          <span>🧠</span> Strategies
        </button>
        <button onClick={props.onShowCommonMistakes} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors shadow-sm">
          <span>⚠️</span> Mistakes
        </button>
        {props.hasBattery && props.onShowBatteryExplainer && (
          <button onClick={props.onShowBatteryExplainer} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors shadow-sm">
            <span>🔋</span> Battery
          </button>
        )}
        {props.showPortfolioButton && props.onShowPortfolioExplainer && (
          <button onClick={props.onShowPortfolioExplainer} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors shadow-sm">
            <span>📊</span> Portfolio
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} onStepClick={setStep} bidsFilled={hasBids} />

      {/* Steps */}
      {step === 1 && (
        <Step1Assets
          assets={props.assets}
          assetDefs={props.assetDefs}
          getAssetDef={props.getAssetDef}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2Demand
          roundConfig={props.roundConfig}
          gameState={props.gameState}
          assets={props.assets}
          assetDefs={props.assetDefs}
          selectedPeriod={props.selectedPeriod}
          onPeriodChange={props.onPeriodChange}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step3Bids
          {...props}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
}
