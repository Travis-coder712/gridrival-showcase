import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, Legend
} from 'recharts';
import type { TimePeriodDispatchResult, DispatchedBand } from '../../../shared/types';
import { formatMW, formatPrice, formatNumber } from '../../lib/formatters';

interface Props {
  periodResult: TimePeriodDispatchResult;
  height?: number;
}

interface MeritOrderDataPoint {
  cumulativeMW: number;
  widthMW: number;
  bidPrice: number;
  actualBidPrice: number;
  teamName: string;
  teamId: string;
  assetName: string;
  assetType: string;
  dispatchedMW: number;
  isMarginal: boolean;
  isDispatched: boolean;
  color: string;
}

// Team colors for the chart
const getTeamColor = (teamName: string, index: number): string => {
  const colors = [
    '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#319795',
    '#3182ce', '#5a67d8', '#805ad5', '#d53f8c', '#c05621',
    '#2f855a', '#2b6cb0', '#6b46c1', '#b83280', '#e53e3e',
  ];
  return colors[index % colors.length];
};

type YRange = { min: number; max: number; label: string };

const Y_RANGE_PRESETS: YRange[] = [
  { min: 0, max: 500, label: '$0–$500' },
  { min: -100, max: 500, label: '-$100–$500' },
  { min: -1000, max: 500, label: '-$1k–$500' },
];

export default function MeritOrderChart({ periodResult, height = 400 }: Props) {
  const [yRange, setYRange] = useState<YRange>(Y_RANGE_PRESETS[0]);
  const [autoRange, setAutoRange] = useState(false);

  const chartData = useMemo(() => {
    if (!periodResult) return [];

    // Combine dispatched and undispatched bands
    const allBands = [
      ...periodResult.meritOrderStack.map(b => ({ ...b, isDispatched: true })),
      ...periodResult.undispatchedBands.map(b => ({ ...b, isDispatched: false })),
    ].sort((a, b) => a.bidPriceMWh - b.bidPriceMWh);

    // Track unique teams for coloring
    const teamColorMap = new Map<string, string>();
    let colorIdx = 0;

    let cumulativeMW = 0;
    return allBands
      .filter(b => b.offeredMW > 0)
      .map(band => {
        if (!teamColorMap.has(band.teamId)) {
          teamColorMap.set(band.teamId, getTeamColor(band.teamName, colorIdx++));
        }

        const point: MeritOrderDataPoint = {
          cumulativeMW,
          widthMW: band.offeredMW,
          bidPrice: band.bidPriceMWh,
          actualBidPrice: band.bidPriceMWh,
          teamName: band.teamName,
          teamId: band.teamId,
          assetName: band.assetName,
          assetType: band.assetType,
          dispatchedMW: band.dispatchedMW,
          isMarginal: band.isMarginal,
          isDispatched: band.dispatchedMW > 0,
          color: teamColorMap.get(band.teamId)!,
        };

        cumulativeMW += band.offeredMW;
        return point;
      });
  }, [periodResult]);

  // Compute actual data range for auto mode
  const priceRange = useMemo(() => {
    if (!chartData.length) return { min: 0, max: 500 };
    const prices = chartData.map(d => d.bidPrice);
    return {
      min: Math.min(...prices, periodResult.clearingPriceMWh),
      max: Math.max(...prices, periodResult.clearingPriceMWh),
    };
  }, [chartData, periodResult]);

  if (!periodResult || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-navy-400">
        No dispatch data available
      </div>
    );
  }

  const effectiveYMin = autoRange ? Math.min(priceRange.min, 0) : yRange.min;
  const effectiveYMax = autoRange ? Math.max(priceRange.max * 1.1, 100) : yRange.max;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-navy-800 border border-white/20 rounded-lg p-3 shadow-xl text-sm">
        <div className="font-semibold text-white">{data.teamName}</div>
        <div className="text-navy-300 text-xs">{data.assetName} ({data.assetType})</div>
        <div className="mt-1 space-y-0.5">
          <div className="text-electric-300">
            Bid: <span className="font-mono">${formatNumber(data.actualBidPrice)}/MWh</span>
          </div>
          <div className="text-navy-300">
            Offered: <span className="font-mono">{formatNumber(data.widthMW)} MW</span>
          </div>
          <div className={data.isDispatched ? 'text-green-400' : 'text-red-400'}>
            {data.isDispatched ? `Dispatched: ${formatNumber(data.dispatchedMW)} MW` : 'Not dispatched'}
          </div>
          {data.isMarginal && (
            <div className="text-amber-400 font-semibold">★ Marginal Unit (sets price)</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Summary header */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="text-navy-300">
          Clearing Price: <span className="text-electric-300 font-mono font-bold text-lg">
            ${formatNumber(periodResult.clearingPriceMWh)}/MWh
          </span>
        </div>
        <div className="text-navy-400">
          Demand: <span className="font-mono">{formatMW(periodResult.demandMW)}</span>
        </div>
        <div className="text-navy-400">
          Reserve: <span className="font-mono">{periodResult.reserveMarginPercent.toFixed(0)}%</span>
        </div>
      </div>

      {/* Y-axis range controls */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        <span className="text-navy-400">Y-axis:</span>
        {Y_RANGE_PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => { setYRange(preset); setAutoRange(false); }}
            className={`px-2 py-1 rounded transition-colors ${
              !autoRange && yRange.label === preset.label
                ? 'bg-electric-500/20 text-electric-300'
                : 'bg-white/10 text-navy-300 hover:bg-white/20'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setAutoRange(true)}
          className={`px-2 py-1 rounded transition-colors ${
            autoRange ? 'bg-electric-500/20 text-electric-300' : 'bg-white/10 text-navy-300 hover:bg-white/20'
          }`}
        >
          Auto
        </button>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} barCategoryGap={0} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="cumulativeMW"
            type="number"
            domain={[0, 'auto']}
            tick={{ fill: '#a0aec0', fontSize: 11 }}
            label={{ value: 'Cumulative MW', position: 'bottom', fill: '#a0aec0', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#a0aec0', fontSize: 11 }}
            label={{ value: '$/MWh', angle: -90, position: 'insideLeft', fill: '#a0aec0', fontSize: 12 }}
            domain={[effectiveYMin, effectiveYMax]}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Demand line */}
          <ReferenceLine
            x={periodResult.demandMW}
            stroke="#e53e3e"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: `Demand ${formatMW(periodResult.demandMW)}`, fill: '#fc8181', fontSize: 11, position: 'top' }}
          />

          {/* Clearing price line */}
          <ReferenceLine
            y={periodResult.clearingPriceMWh}
            stroke="#ecc94b"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: `$${formatNumber(periodResult.clearingPriceMWh)}/MWh`, fill: '#ecc94b', fontSize: 11, position: 'right' }}
          />

          <Bar dataKey="bidPrice" name="Bid Price">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isDispatched ? entry.color : `${entry.color}33`}
                stroke={entry.isMarginal ? '#ecc94b' : 'transparent'}
                strokeWidth={entry.isMarginal ? 3 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
