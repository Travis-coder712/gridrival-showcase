/**
 * Client-side bidding strategy generator.
 * Generates bid bands with asset-type-differentiated strategies:
 * - battery_arbitrageur: Only generates bids for battery assets
 * - All other strategies: Only generate bids for thermal (coal, gas_ccgt, gas_peaker) and hydro assets
 * - Wind/solar are never touched by strategies (handled separately as auto-bids)
 */
import type { AssetBid, AssetType, BatteryMode, BidBand, TeamAssetInstance, TimePeriod, Season } from '../../shared/types';

export type StrategyId =
  | 'price_taker'
  | 'srmc_bidder'
  | 'price_maker'
  | 'portfolio_optimizer'
  | 'capacity_repricing'
  | 'battery_arbitrageur';

export type Intensity = 'low' | 'medium' | 'max';

export interface StrategyDefinition {
  id: StrategyId;
  name: string;
  icon: string;
  shortDescription: string;
  description: string;
  intensityLabels: Record<Intensity, string>;
}

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: 'price_taker',
    name: 'Price Taker',
    icon: '🟢',
    shortDescription: 'Bid low to guarantee dispatch',
    description: 'Bid all capacity at or near $0/MWh to ensure maximum dispatch. You accept the market clearing price.',
    intensityLabels: {
      low: 'Bid at $0, 60% capacity',
      medium: 'Bid at $0, 80% capacity',
      max: 'Bid at $0, 100% capacity',
    },
  },
  {
    id: 'srmc_bidder',
    name: 'Marginal Cost Bidder',
    icon: '🔵',
    shortDescription: 'Bid at marginal cost - safe & rational',
    description: 'Bid at your Short Run Marginal Cost. Economically rational baseline - you only run when it covers costs.',
    intensityLabels: {
      low: 'Bid at 80% of marginal cost',
      medium: 'Bid at marginal cost',
      max: 'Bid at 120% of marginal cost',
    },
  },
  {
    id: 'price_maker',
    name: 'Price Maker',
    icon: '🟠',
    shortDescription: 'Bid high on some capacity to push up prices',
    description: 'Split capacity: bid part cheap for guaranteed dispatch, rest high to try to set the clearing price.',
    intensityLabels: {
      low: 'Split 70/30, high band at $150',
      medium: 'Split 60/40, high band at $300',
      max: 'Split 40/60, high band at $500',
    },
  },
  {
    id: 'portfolio_optimizer',
    name: 'Portfolio Optimizer',
    icon: '🟣',
    shortDescription: 'Smart per-asset bidding like a real gentailer',
    description: 'Each asset type uses its optimal strategy: renewables at $0, coal split, gas mid-merit, peakers at premium.',
    intensityLabels: {
      low: 'Conservative spreads, lower premiums',
      medium: 'Balanced spreads & premiums',
      max: 'Aggressive premiums on all assets',
    },
  },
  {
    id: 'capacity_repricing',
    name: 'Capacity Repricing',
    icon: '🔴',
    shortDescription: 'Reprice capacity to higher bands to influence clearing prices',
    description: 'Rebid a portion of capacity to the market cap ($20,000/MWh), making it unlikely to be dispatched. This tightens effective supply and may push clearing prices higher — a legitimate rebidding strategy monitored by the AER.',
    intensityLabels: {
      low: 'Reprice 15% of thermal to cap',
      medium: 'Reprice 30% of thermal to cap',
      max: 'Reprice 50% of thermal to cap',
    },
  },
  {
    id: 'battery_arbitrageur',
    name: 'Battery Arbitrageur',
    icon: '🟡',
    shortDescription: 'Charge cheap, discharge at premium',
    description: 'Battery charges in off-peak and discharges at peak. 6-hour battery can fully charge in one period.',
    intensityLabels: {
      low: 'Discharge at $100, charge overnight & morning',
      medium: 'Discharge at $200, charge overnight & morning',
      max: 'Discharge at $400, charge overnight & morning',
    },
  },
];

/**
 * Filter available strategies based on what asset types the team currently has.
 * - battery_arbitrageur: requires battery
 * - All other strategies: based on thermal/hydro assets (not counting renewables or battery)
 * - portfolio_optimizer: requires 2+ distinct thermal/hydro asset types
 */
export function getAvailableStrategies(assetTypes: AssetType[]): StrategyDefinition[] {
  const typeSet = new Set(assetTypes);
  const hasBattery = typeSet.has('battery');
  const thermalHydroTypes = ['coal', 'gas_ccgt', 'gas_peaker', 'hydro'].filter(t => typeSet.has(t as AssetType));
  const hasThermalOrHydro = thermalHydroTypes.length > 0;
  const hasThermal = typeSet.has('coal') || typeSet.has('gas_ccgt') || typeSet.has('gas_peaker');

  return STRATEGIES.filter(s => {
    switch (s.id) {
      case 'battery_arbitrageur':
        return hasBattery;
      case 'portfolio_optimizer':
        // Requires 2+ distinct thermal/hydro asset types (not counting renewables or battery)
        return thermalHydroTypes.length >= 2;
      case 'capacity_repricing':
      case 'price_maker':
        return hasThermal || typeSet.has('hydro');
      case 'price_taker':
      case 'srmc_bidder':
        // Available if team has any thermal or hydro assets
        return hasThermalOrHydro;
      default:
        return hasThermalOrHydro;
    }
  });
}

// Approximate SRMC by asset type (client-side doesn't have exact per-team values)
const SRMC_DEFAULTS: Record<string, number> = {
  coal: 35,
  gas_ccgt: 75,
  gas_peaker: 140,
  hydro: 8,
  wind: 0,
  solar: 0,
  battery: 0,
};

function getAssetType(assetId: string): AssetType {
  if (assetId.includes('ccgt')) return 'gas_ccgt';
  if (assetId.includes('peaker')) return 'gas_peaker';
  const base = assetId.split('_')[0];
  return base as AssetType;
}

function getSrmc(assetId: string): number {
  const type = getAssetType(assetId);
  return SRMC_DEFAULTS[type] ?? 30;
}

function isRenewable(assetId: string): boolean {
  const type = getAssetType(assetId);
  return type === 'wind' || type === 'solar';
}

function isHydro(assetId: string): boolean {
  return getAssetType(assetId) === 'hydro';
}

function isThermal(assetId: string): boolean {
  const type = getAssetType(assetId);
  return ['coal', 'gas_ccgt', 'gas_peaker'].includes(type);
}

function isThermalOrHydro(assetId: string): boolean {
  return isThermal(assetId) || isHydro(assetId);
}

/**
 * Determine the highest-demand period.
 * Uses a fixed priority: day_peak > night_peak > day_offpeak > night_offpeak.
 * If only one period is provided, that period is used.
 */
const PERIOD_DEMAND_PRIORITY: TimePeriod[] = ['day_peak', 'night_peak', 'day_offpeak', 'night_offpeak'];

function getHighestDemandPeriod(periods: TimePeriod[]): TimePeriod {
  if (periods.length === 1) return periods[0];
  for (const p of PERIOD_DEMAND_PRIORITY) {
    if (periods.includes(p)) return p;
  }
  return periods[0];
}

/**
 * Generate bids for assets across periods for a given strategy+intensity.
 *
 * Strategy layering:
 * - battery_arbitrageur: Only generates bids for battery assets. Skips everything else.
 * - All other strategies: Only generate bids for thermal (coal, gas_ccgt, gas_peaker) and hydro.
 *   Wind, solar, and battery are skipped (handled separately).
 *
 * Hydro handling:
 * - Hydro only dispatches in ONE period (the highest-demand period).
 * - In all other periods, hydro gets zero-MW bands so the caller sees the asset was considered.
 *
 * Per-period support:
 * - When called with a single period, generates for that period only.
 * - For hydro with a single period, that period becomes the dispatch period.
 */
export function generateStrategyBids(
  strategyId: StrategyId,
  intensity: Intensity,
  assets: TeamAssetInstance[],
  teamId: string,
  periods: TimePeriod[],
): Map<string, AssetBid> {
  const newBids = new Map<string, AssetBid>();
  const isBatteryStrategy = strategyId === 'battery_arbitrageur';

  // Determine the hydro dispatch period (highest-demand period among provided periods)
  const hydroDispatchPeriod = getHighestDemandPeriod(periods);

  for (const period of periods) {
    for (const asset of assets) {
      const assetId = asset.assetDefinitionId;
      const type = getAssetType(assetId);

      // Strategy layering: filter assets based on strategy type
      if (isBatteryStrategy) {
        // battery_arbitrageur only touches battery assets
        if (type !== 'battery') continue;
      } else {
        // All other strategies only touch thermal and hydro — skip wind, solar, battery
        if (!isThermalOrHydro(assetId)) continue;
      }

      // Hydro single-period dispatch logic for non-battery strategies
      if (!isBatteryStrategy && type === 'hydro') {
        const key = `${assetId}_${period}`;
        if (period === hydroDispatchPeriod) {
          // This is the dispatch period — generate real bids
          const bands = generateBandsForAsset(strategyId, intensity, asset, period);
          const bid: AssetBid = {
            assetInstanceId: `${assetId}_${teamId}`,
            assetDefinitionId: assetId,
            teamId,
            timePeriod: period,
            bands,
            totalOfferedMW: bands.reduce((s, b) => s + b.quantityMW, 0),
            submittedAt: Date.now(),
            hydroDispatchPeriod,
          };
          newBids.set(key, bid);
        } else {
          // Non-dispatch period: zero MW bid
          const bid: AssetBid = {
            assetInstanceId: `${assetId}_${teamId}`,
            assetDefinitionId: assetId,
            teamId,
            timePeriod: period,
            bands: [],
            totalOfferedMW: 0,
            submittedAt: Date.now(),
            hydroDispatchPeriod,
          };
          newBids.set(key, bid);
        }
        continue;
      }

      const bands = generateBandsForAsset(strategyId, intensity, asset, period);
      if (bands.length === 0 && !isBatteryStrategy) continue;

      const key = `${assetId}_${period}`;
      const bid: AssetBid = {
        assetInstanceId: `${assetId}_${teamId}`,
        assetDefinitionId: assetId,
        teamId,
        timePeriod: period,
        bands,
        totalOfferedMW: bands.reduce((s, b) => s + b.quantityMW, 0),
        submittedAt: Date.now(),
      };

      // Set battery mode metadata for battery_arbitrageur strategy
      if (isBatteryStrategy && type === 'battery') {
        const isPeak = period === 'day_peak' || period === 'night_peak';
        if (isPeak) {
          bid.batteryMode = 'discharge';
        } else {
          bid.batteryMode = 'charge';
          bid.isBatteryCharging = true;
          bid.chargeMW = asset.currentAvailableMW;
          bid.bands = [];
          bid.totalOfferedMW = 0;
        }
      }

      newBids.set(key, bid);
    }
  }

  return newBids;
}

function generateBandsForAsset(
  strategyId: StrategyId,
  intensity: Intensity,
  asset: TeamAssetInstance,
  period: TimePeriod,
): BidBand[] {
  const mw = asset.currentAvailableMW;
  if (mw <= 0) return [];

  const type = getAssetType(asset.assetDefinitionId);
  const srmc = getSrmc(asset.assetDefinitionId);

  switch (strategyId) {
    case 'price_taker':
      return priceTakerBands(mw, intensity, type);
    case 'srmc_bidder':
      return srmcBidderBands(mw, srmc, intensity, type);
    case 'price_maker':
      return priceMakerBands(mw, srmc, intensity, type);
    case 'portfolio_optimizer':
      return portfolioOptimizerBands(mw, srmc, intensity, type);
    case 'capacity_repricing':
      return capacityRepricingBands(mw, srmc, intensity, type);
    case 'battery_arbitrageur':
      return batteryArbitrageurBands(mw, intensity, period);
    default:
      return [{ pricePerMWh: srmc, quantityMW: mw }];
  }
}

// ──────────────────────────────────────────────
// Individual strategy implementations
// ──────────────────────────────────────────────

function priceTakerBands(mw: number, intensity: Intensity, type: AssetType): BidBand[] {
  // Hydro: bid at $0 in the dispatch period (caller ensures this is only called for the dispatch period)
  if (type === 'hydro') {
    return [{ pricePerMWh: 0, quantityMW: mw }];
  }

  // Thermal assets
  const capPercent = intensity === 'low' ? 0.6 : intensity === 'medium' ? 0.8 : 1.0;
  const offered = Math.round(mw * capPercent);
  if (offered <= 0) return [];
  return [{ pricePerMWh: 0, quantityMW: offered }];
}

function srmcBidderBands(mw: number, srmc: number, intensity: Intensity, type: AssetType): BidBand[] {
  // Hydro: bid at SRMC ($8) in the dispatch period
  if (type === 'hydro') {
    const multiplier = intensity === 'low' ? 0.8 : intensity === 'medium' ? 1.0 : 1.2;
    return [{ pricePerMWh: Math.round(srmc * multiplier), quantityMW: mw }];
  }

  // Thermal assets
  const multiplier = intensity === 'low' ? 0.8 : intensity === 'medium' ? 1.0 : 1.2;
  const price = Math.round(srmc * multiplier);
  return [{ pricePerMWh: price, quantityMW: mw }];
}

function priceMakerBands(mw: number, srmc: number, intensity: Intensity, type: AssetType): BidBand[] {
  // Hydro: bid at a premium price ($200) in the peak/dispatch period
  if (type === 'hydro') {
    const hydroPrice = intensity === 'low' ? 150 : intensity === 'medium' ? 200 : 300;
    return [{ pricePerMWh: hydroPrice, quantityMW: mw }];
  }

  // Thermal assets: split into low and high bands
  const lowSplit = intensity === 'low' ? 0.70 : intensity === 'medium' ? 0.60 : 0.40;
  const highPrice = intensity === 'low' ? 150 : intensity === 'medium' ? 300 : 500;

  const lowMW = Math.round(mw * lowSplit);
  const highMW = mw - lowMW;

  const bands: BidBand[] = [
    { pricePerMWh: Math.max(0, srmc - 5), quantityMW: lowMW },
  ];
  if (highMW > 0) {
    bands.push({ pricePerMWh: highPrice, quantityMW: highMW });
  }
  return bands;
}

function portfolioOptimizerBands(mw: number, srmc: number, intensity: Intensity, type: AssetType): BidBand[] {
  const mult = intensity === 'low' ? 0.8 : intensity === 'medium' ? 1.0 : 1.4;

  switch (type) {
    case 'coal': {
      const lowMW = Math.round(mw * 0.65);
      const highMW = mw - lowMW;
      return [
        { pricePerMWh: Math.round(srmc * 0.5 * mult), quantityMW: lowMW },
        { pricePerMWh: Math.round(srmc * 1.8 * mult), quantityMW: highMW },
      ];
    }
    case 'gas_ccgt':
      return [
        { pricePerMWh: Math.round(srmc * mult), quantityMW: mw },
      ];

    case 'gas_peaker': {
      const premiumPrice = intensity === 'low' ? 200 : intensity === 'medium' ? 300 : 500;
      return [{ pricePerMWh: premiumPrice, quantityMW: mw }];
    }
    case 'hydro': {
      // Hydro bids strategically at $100 in the dispatch period (caller ensures single-period dispatch)
      const hydroPrice = intensity === 'low' ? 70 : intensity === 'medium' ? 100 : 150;
      return [{ pricePerMWh: Math.round(hydroPrice * mult), quantityMW: mw }];
    }
    default:
      return [{ pricePerMWh: srmc, quantityMW: mw }];
  }
}

function capacityRepricingBands(mw: number, srmc: number, intensity: Intensity, type: AssetType): BidBand[] {
  // Hydro: not repriced — no dispatch period selected (return empty bands)
  if (type === 'hydro') {
    return [];
  }

  // Thermal assets: reprice a portion to the market cap (economic withholding)
  const repricePercent = intensity === 'low' ? 0.15 : intensity === 'medium' ? 0.30 : 0.50;
  const activeMW = Math.round(mw * (1 - repricePercent));
  const repricedMW = mw - activeMW;

  const bands: BidBand[] = [
    { pricePerMWh: srmc, quantityMW: activeMW },
  ];
  if (repricedMW > 0) {
    bands.push({ pricePerMWh: 20000, quantityMW: repricedMW });
  }
  return bands;
}

/**
 * Battery arbitrageur — only for battery assets (6-hour storage).
 *
 * Schedule:
 * - night_offpeak (00:00-06:00): Charge at full rate — battery can fully charge in one 6h period
 * - day_offpeak (06:00-12:00): Charge at full rate (secondary charge window)
 * - day_peak (12:00-18:00): Discharge at full rate at premium price
 * - night_peak (18:00-24:00): Discharge at full rate at premium price
 *
 * The 6-hour battery can fully charge in a single period, so both off-peak periods
 * are charge windows and both peak periods are discharge windows.
 */
function batteryArbitrageurBands(mw: number, intensity: Intensity, period: TimePeriod): BidBand[] {
  const isPeak = period === 'day_peak' || period === 'night_peak';

  if (isPeak) {
    // Discharge at premium price during peak periods
    const dischargePrice = intensity === 'low' ? 100 : intensity === 'medium' ? 200 : 400;
    return [{ pricePerMWh: dischargePrice, quantityMW: mw }];
  } else {
    // Charge during off-peak periods (night_offpeak and day_offpeak)
    // With 6h storage, battery can fully charge in one period
    const chargePrice = intensity === 'max' ? -30 : intensity === 'medium' ? -10 : 0;
    return [{ pricePerMWh: chargePrice, quantityMW: mw }];
  }
}
