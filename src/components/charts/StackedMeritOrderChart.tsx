import { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TimePeriodDispatchResult, AssetType, TimePeriod } from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS, ASSET_TYPE_LABELS } from '../../../shared/types';
import { ASSET_COLORS, ASSET_ICONS } from '../../lib/colors';
import { formatNumber } from '../../lib/formatters';

interface Props {
  periodResults: TimePeriodDispatchResult[];
  height?: number;
  /** Show large labels suitable for projector display */
  projectorMode?: boolean;
}

// Stack order: baseload at bottom, flexible at top
const ASSET_TYPE_ORDER: AssetType[] = [
  'coal', 'gas_ccgt', 'gas_peaker', 'hydro', 'wind', 'solar', 'battery',
];

interface StackedDataPoint {
  period: string;
  timePeriod: TimePeriod;
  demandMW: number;
  clearingPriceMWh: number;
  reserveMarginPercent: number;
  coal: number;
  gas_ccgt: number;
  gas_peaker: number;
  hydro: number;
  wind: number;
  solar: number;
  battery: number;
  total: number;
}

export default function StackedMeritOrderChart({ periodResults, height = 400, projectorMode = false }: Props) {
  const chartData = useMemo(() => {
    if (!periodResults?.length) return [];

    return periodResults.map(pr => {
      const byType: Record<AssetType, number> = {
        coal: 0, gas_ccgt: 0, gas_peaker: 0, hydro: 0, wind: 0, solar: 0, battery: 0,
      };

      for (const band of pr.meritOrderStack) {
        if (band.dispatchedMW > 0 && byType[band.assetType] !== undefined) {
          byType[band.assetType] += band.dispatchedMW;
        }
      }

      const total = Object.values(byType).reduce((s, v) => s + v, 0);

      return {
        period: TIME_PERIOD_SHORT_LABELS[pr.timePeriod as TimePeriod] || pr.timePeriod,
        timePeriod: pr.timePeriod as TimePeriod,
        demandMW: pr.demandMW,
        clearingPriceMWh: pr.clearingPriceMWh,
        reserveMarginPercent: pr.reserveMarginPercent,
        ...byType,
        total,
      } as StackedDataPoint;
    });
  }, [periodResults]);

  // Determine which asset types actually have data
  const activeTypes = useMemo(() => {
    return ASSET_TYPE_ORDER.filter(type =>
      chartData.some(d => d[type] > 0)
    );
  }, [chartData]);

  if (!periodResults?.length || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-navy-400">
        No dispatch data available
      </div>
    );
  }

  const fontSize = projectorMode ? 14 : 12;
  const labelFontSize = projectorMode ? 16 : 13;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload as StackedDataPoint;
    if (!data) return null;

    return (
      <div className="bg-navy-800 border border-white/20 rounded-lg p-4 shadow-xl text-sm min-w-[200px]">
        <div className="font-semibold text-white text-base mb-2">{label}</div>
        <div className="space-y-1">
          {ASSET_TYPE_ORDER.filter(type => data[type] > 0).map(type => (
            <div key={type} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: ASSET_COLORS[type] }} />
                <span className="text-navy-300">{ASSET_ICONS[type]} {ASSET_TYPE_LABELS[type]}</span>
              </div>
              <span className="font-mono text-white">{formatNumber(data[type])} MW</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-2 pt-2 space-y-1">
          <div className="flex justify-between text-electric-300">
            <span>Total Dispatched</span>
            <span className="font-mono font-bold">{formatNumber(data.total)} MW</span>
          </div>
          <div className="flex justify-between text-amber-300">
            <span>Demand</span>
            <span className="font-mono font-bold">{formatNumber(data.demandMW)} MW</span>
          </div>
          <div className="flex justify-between text-electric-300">
            <span>Clearing Price</span>
            <span className="font-mono font-bold">${formatNumber(data.clearingPriceMWh)}/MWh</span>
          </div>
        </div>
      </div>
    );
  };

  // Custom legend
  const renderLegend = () => (
    <div className={`flex flex-wrap justify-center gap-x-5 gap-y-1 mt-3 ${projectorMode ? 'text-base' : 'text-sm'}`}>
      {activeTypes.map(type => (
        <div key={type} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: ASSET_COLORS[type] }} />
          <span className="text-navy-300">{ASSET_ICONS[type]} {ASSET_TYPE_LABELS[type]}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-0 border-t-2 border-dashed border-red-400" />
        <span className="text-navy-300">Demand</span>
      </div>
    </div>
  );

  // Custom tick that shows clearing price below the period label
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const data = chartData.find(d => d.period === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0} y={0} dy={16}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize={fontSize}
          fontWeight={600}
        >
          {payload.value}
        </text>
        {data && (
          <text
            x={0} y={0} dy={34}
            textAnchor="middle"
            fill="#7dd3fc"
            fontSize={labelFontSize}
            fontWeight={700}
            fontFamily="monospace"
          >
            ${formatNumber(data.clearingPriceMWh)}/MWh
          </text>
        )}
      </g>
    );
  };

  const maxValue = Math.max(
    ...chartData.map(d => d.total),
    ...chartData.map(d => d.demandMW),
  );

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: projectorMode ? 50 : 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="period"
            tick={<CustomXAxisTick />}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
            height={projectorMode ? 60 : 50}
          />
          <YAxis
            tick={{ fill: '#a0aec0', fontSize }}
            label={{
              value: 'MW',
              angle: -90,
              position: 'insideLeft',
              fill: '#a0aec0',
              fontSize: labelFontSize,
            }}
            domain={[0, Math.ceil(maxValue * 1.15)]}
            tickFormatter={(v) => formatNumber(v)}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Stacked bars — one per asset type */}
          {activeTypes.map((type) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="generation"
              fill={ASSET_COLORS[type]}
              radius={type === activeTypes[activeTypes.length - 1] ? [4, 4, 0, 0] : undefined}
              barSize={projectorMode ? 80 : 60}
            />
          ))}

          {/* Demand line overlay */}
          <Line
            dataKey="demandMW"
            type="monotone"
            stroke="#e53e3e"
            strokeWidth={3}
            strokeDasharray="8 4"
            dot={{ r: 6, fill: '#e53e3e', stroke: '#fff', strokeWidth: 2 }}
            name="Demand"
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
      {renderLegend()}
    </div>
  );
}
