import type {
  AssetBid, AssetInfo, TeamAssetInstance, TimePeriod, AssetType, Season, BatteryMode,
} from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS, ASSET_TYPE_LABELS } from '../../../shared/types';
import { ASSET_ICONS } from '../../lib/colors';
import { formatMW, formatPrice, formatNumber } from '../../lib/formatters';

interface Props {
  bids: Map<string, AssetBid>;
  assets: TeamAssetInstance[];
  assetDefs: AssetInfo[];
  periods: TimePeriod[];
  demandPerPeriod: Record<string, number>;
  teamCount: number;
  season: Season;
  /** Battery mode selections per asset+period (key: assetId_period) */
  batteryModes?: Map<string, BatteryMode>;
  /** Battery charge MW per asset+period (key: assetId_period) */
  chargeMWs?: Map<string, number>;
  onConfirm: () => void;
  onCancel: () => void;
}

interface Warning {
  type: 'zero_mw' | 'below_srmc' | 'low_share';
  asset?: string;
  period?: TimePeriod;
  message: string;
}

export default function BidReviewModal({
  bids, assets, assetDefs, periods, demandPerPeriod, teamCount, season, batteryModes, chargeMWs, onConfirm, onCancel,
}: Props) {
  const getAssetDef = (assetId: string): AssetInfo | undefined =>
    assetDefs.find(d => d.id === assetId);

  const getFullTypeKey = (assetDefId: string): AssetType => {
    if (assetDefId.includes('ccgt')) return 'gas_ccgt';
    if (assetDefId.includes('peaker')) return 'gas_peaker';
    return assetDefId.split('_')[0] as AssetType;
  };

  const getBidKey = (assetId: string, period: TimePeriod) => `${assetId}_${period}`;

  // Collect all warnings
  const warnings: Warning[] = [];

  // Build summary data
  const summaryData: {
    asset: TeamAssetInstance;
    def: AssetInfo | undefined;
    typeKey: AssetType;
    periodBids: Record<TimePeriod, { bands: { price: number; mw: number }[]; totalMW: number; batteryMode?: BatteryMode; chargeMW?: number }>;
  }[] = assets.map(asset => {
    const def = getAssetDef(asset.assetDefinitionId);
    const typeKey = getFullTypeKey(asset.assetDefinitionId);
    const periodBids: Record<string, { bands: { price: number; mw: number }[]; totalMW: number; batteryMode?: BatteryMode; chargeMW?: number }> = {};

    for (const period of periods) {
      const key = getBidKey(asset.assetDefinitionId, period);
      const bid = bids.get(key);
      const bands = bid?.bands?.filter(b => b.quantityMW > 0) || [];
      const totalMW = bands.reduce((s, b) => s + b.quantityMW, 0);

      // Resolve battery mode from the live state maps (preferred) or the stamped bid value (fallback)
      const resolvedBatteryMode = (typeKey === 'battery' && batteryModes)
        ? (batteryModes.get(key) || bid?.batteryMode)
        : bid?.batteryMode;
      const resolvedChargeMW = (typeKey === 'battery' && chargeMWs)
        ? (chargeMWs.get(key) ?? bid?.chargeMW)
        : bid?.chargeMW;

      periodBids[period] = {
        bands: bands.map(b => ({ price: b.pricePerMWh, mw: b.quantityMW })),
        totalMW,
        batteryMode: resolvedBatteryMode,
        chargeMW: resolvedChargeMW,
      };

      // Zero MW info — let players know an asset will sit idle (not a restriction, just info)
      // Skip batteries in charge/idle mode — those are intentional zero-dispatch states
      const isBatteryNonDispatch = typeKey === 'battery' && (resolvedBatteryMode === 'charge' || resolvedBatteryMode === 'idle');
      if (totalMW === 0 && !asset.isForceOutage && !isBatteryNonDispatch) {
        warnings.push({
          type: 'zero_mw',
          asset: def?.name || typeKey,
          period,
          message: `${def?.name || ASSET_TYPE_LABELS[typeKey]} will sit idle (0 MW) in ${TIME_PERIOD_SHORT_LABELS[period]}`,
        });
      }

      // Below SRMC warning
      if (def && def.srmcPerMWh > 0) {
        for (const band of bands) {
          if (band.pricePerMWh < def.srmcPerMWh && band.quantityMW > 0) {
            warnings.push({
              type: 'below_srmc',
              asset: def.name,
              period,
              message: `${def.name} bid at $${formatNumber(band.pricePerMWh)}/MWh is below marginal cost ($${formatNumber(def.srmcPerMWh)}/MWh) in ${TIME_PERIOD_SHORT_LABELS[period]}`,
            });
            break; // only warn once per asset per period
          }
        }
      }
    }

    return { asset, def, typeKey, periodBids: periodBids as any };
  });

  // Pro-rata demand share warnings
  const periodTotals: Record<string, number> = {};
  for (const period of periods) {
    let total = 0;
    for (const row of summaryData) {
      total += row.periodBids[period]?.totalMW || 0;
    }
    periodTotals[period] = total;

    const demand = demandPerPeriod[period] || 0;
    const proRataShare = teamCount > 0 ? Math.round(demand / teamCount) : 0;

    if (total < proRataShare && proRataShare > 0) {
      warnings.push({
        type: 'low_share',
        period,
        message: `${TIME_PERIOD_SHORT_LABELS[period]}: bidding ${formatMW(total)} vs ${formatMW(proRataShare)} pro-rata share (${Math.round((total / proRataShare) * 100)}%)`,
      });
    }
  }

  const zeroWarnings = warnings.filter(w => w.type === 'zero_mw');
  const srmcWarnings = warnings.filter(w => w.type === 'below_srmc');
  const shareWarnings = warnings.filter(w => w.type === 'low_share');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Review Your Bids</h2>
            <p className="text-xs text-gray-500">Check everything before submitting</p>
          </div>
          {warnings.length > 0 && (
            <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </div>
          )}
          {warnings.length === 0 && (
            <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold">
              All looks good
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Bid Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 pr-3 text-gray-600 font-semibold text-xs">Asset</th>
                  {periods.map(p => (
                    <th key={p} className="text-center py-2 px-2 text-gray-600 font-semibold text-xs">
                      {TIME_PERIOD_SHORT_LABELS[p]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryData.map(({ asset, def, typeKey, periodBids }) => {
                  const srmc = def?.srmcPerMWh ?? 0;
                  return (
                    <tr key={asset.assetDefinitionId} className="border-b border-gray-100">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{ASSET_ICONS[typeKey] || '🏭'}</span>
                          <div>
                            <div className="font-medium text-gray-800 text-xs">
                              {def?.name || ASSET_TYPE_LABELS[typeKey]}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {formatMW(asset.currentAvailableMW)} avail &bull; Marginal Cost ${srmc}
                              {asset.isForceOutage && <span className="text-red-500 ml-1">OUTAGE</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      {periods.map(period => {
                        const pb = periodBids[period];
                        const isZero = pb.totalMW === 0 && !asset.isForceOutage;
                        const hasBelowSrmc = srmc > 0 && pb.bands.some(b => b.price < srmc && b.mw > 0);

                        return (
                          <td key={period} className={`py-2.5 px-2 text-center ${
                            asset.isForceOutage ? 'bg-gray-50 opacity-50' :
                            isZero ? 'bg-red-50' :
                            hasBelowSrmc ? 'bg-amber-50' : ''
                          }`}>
                            {asset.isForceOutage ? (
                              <span className="text-[10px] text-red-400">OUTAGE</span>
                            ) : typeKey === 'battery' && pb.batteryMode ? (
                              <div className="space-y-0.5">
                                {pb.batteryMode === 'charge' ? (
                                  <>
                                    <div className="text-[11px] font-bold text-blue-600">CHARGE</div>
                                    <div className="text-[10px] text-blue-500">{pb.chargeMW ?? 0} MW</div>
                                  </>
                                ) : pb.batteryMode === 'discharge' ? (
                                  <>
                                    <div className="text-[11px] font-bold text-green-600">DISCHARGE</div>
                                    {pb.bands.map((band, i) => (
                                      <div key={i} className="text-[11px] font-mono text-gray-700">
                                        ${band.price} &times; {band.mw}MW
                                      </div>
                                    ))}
                                    <div className="text-[10px] font-bold mt-0.5 text-gray-500">
                                      = {pb.totalMW} MW
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-[11px] font-bold text-gray-400">IDLE</div>
                                )}
                              </div>
                            ) : pb.bands.length === 0 ? (
                              <div>
                                <div className="text-red-500 font-bold text-xs">0 MW</div>
                                <div className="text-[10px] text-red-400">No bid</div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                {pb.bands.map((band, i) => (
                                  <div key={i} className={`text-[11px] font-mono ${
                                    srmc > 0 && band.price < srmc ? 'text-amber-700 font-bold' : 'text-gray-700'
                                  }`}>
                                    ${band.price} &times; {band.mw}MW
                                  </div>
                                ))}
                                <div className={`text-[10px] font-bold mt-0.5 ${
                                  isZero ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                  = {pb.totalMW} MW
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Period Totals Row */}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-2.5 pr-3 text-xs text-gray-700">Total Bid</td>
                  {periods.map(period => {
                    const total = periodTotals[period] || 0;
                    const demand = demandPerPeriod[period] || 0;
                    const proRata = teamCount > 0 ? Math.round(demand / teamCount) : 0;
                    const isLow = total < proRata && proRata > 0;

                    return (
                      <td key={period} className={`py-2.5 px-2 text-center text-xs ${
                        isLow ? 'text-amber-700 bg-amber-50' : 'text-gray-700'
                      }`}>
                        {formatMW(total)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pro-Rata Demand Share Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-blue-800 mb-2">Demand Share Analysis</h3>
            <div className="grid grid-cols-2 gap-2">
              {periods.map(period => {
                const total = periodTotals[period] || 0;
                const demand = demandPerPeriod[period] || 0;
                const proRata = teamCount > 0 ? Math.round(demand / teamCount) : 0;
                const pct = proRata > 0 ? Math.round((total / proRata) * 100) : 0;
                const isLow = total < proRata && proRata > 0;

                return (
                  <div key={period} className={`rounded-lg px-3 py-2 text-xs ${
                    isLow ? 'bg-amber-100 border border-amber-300' : 'bg-white border border-blue-100'
                  }`}>
                    <div className="font-semibold text-gray-800">{TIME_PERIOD_SHORT_LABELS[period]}</div>
                    <div className="text-gray-600 mt-0.5">
                      Your bid: <strong>{formatMW(total)}</strong> / Pro-rata: <strong>{formatMW(proRata)}</strong>
                    </div>
                    <div className={`font-bold mt-0.5 ${
                      isLow ? 'text-amber-700' : pct >= 100 ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {pct}% of fair share
                      {isLow && ' — below share'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warnings Summary */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              {zeroWarnings.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm">🚫</span>
                    <span className="text-xs font-bold text-red-800">Zero MW Bids ({zeroWarnings.length})</span>
                  </div>
                  <ul className="space-y-0.5">
                    {zeroWarnings.map((w, i) => (
                      <li key={i} className="text-[11px] text-red-700">{w.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {srmcWarnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm">⚠️</span>
                    <span className="text-xs font-bold text-amber-800">Below Marginal Cost ({srmcWarnings.length})</span>
                  </div>
                  <ul className="space-y-0.5">
                    {srmcWarnings.map((w, i) => (
                      <li key={i} className="text-[11px] text-amber-700">{w.message}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-600 mt-1.5 italic">
                    Bidding below marginal cost means you'll lose money if dispatched at that price. This can be strategic (to guarantee dispatch when clearing price is higher) but make sure it's intentional.
                  </p>
                </div>
              )}
              {shareWarnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm">📊</span>
                    <span className="text-xs font-bold text-amber-800">Below Pro-Rata Share ({shareWarnings.length})</span>
                  </div>
                  <ul className="space-y-0.5">
                    {shareWarnings.map((w, i) => (
                      <li key={i} className="text-[11px] text-amber-700">{w.message}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-600 mt-1.5 italic">
                    Bidding less than your pro-rata share of demand means other teams will fill the gap. This could be capacity repricing (economic withholding), or it could be an oversight.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
          >
            Go Back & Edit
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-xl transition-all shadow-md text-sm"
          >
            Confirm & Submit Bids
          </button>
        </div>
      </div>
    </div>
  );
}
