import type { AssetInfo, BidBand, TimePeriod } from '../../../shared/types';

interface BidPresetsProps {
  assetDef: AssetInfo;
  period: TimePeriod;
  maxMW: number;
  onApplyPreset: (bands: BidBand[]) => void;
}

interface Preset {
  id: string;
  name: string;
  icon: string;
  description: string;
  getBands: (srmc: number, maxMW: number) => BidBand[];
}

const presets: Preset[] = [
  {
    id: 'price_taker',
    name: 'Price Taker',
    icon: '🟢',
    description: 'Bid $0 — guaranteed dispatch, earn whatever the market pays',
    getBands: (srmc, maxMW) => [{ pricePerMWh: 0, quantityMW: maxMW }],
  },
  {
    id: 'cost_recovery',
    name: 'Cost Recovery',
    icon: '🔵',
    description: 'Bid at marginal cost — only dispatch when profitable',
    getBands: (srmc, maxMW) => [{ pricePerMWh: srmc, quantityMW: maxMW }],
  },
  {
    id: 'split_strategy',
    name: 'Split Strategy',
    icon: '🟡',
    description: 'Half at $0 for dispatch + half at higher price to push price up',
    getBands: (srmc, maxMW) => [
      { pricePerMWh: 0, quantityMW: Math.round(maxMW * 0.5) },
      { pricePerMWh: Math.max(srmc * 2, 100), quantityMW: Math.round(maxMW * 0.5) },
    ],
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    icon: '🔴',
    description: 'Bid high to push up clearing price — risk not being dispatched',
    getBands: (srmc, maxMW) => [
      { pricePerMWh: Math.max(srmc * 3, 300), quantityMW: maxMW },
    ],
  },
];

/**
 * Bid Presets (Improvement 6.6)
 * Quick-apply common bidding strategies per asset per period.
 */
export default function BidPresets({ assetDef, period, maxMW, onApplyPreset }: BidPresetsProps) {
  return (
    <div className="flex gap-1 flex-wrap">
      {presets.map(preset => (
        <button
          key={preset.id}
          onClick={() => onApplyPreset(preset.getBands(assetDef.srmcPerMWh, maxMW))}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
          title={preset.description}
        >
          <span>{preset.icon}</span>
          <span>{preset.name}</span>
        </button>
      ))}
    </div>
  );
}
