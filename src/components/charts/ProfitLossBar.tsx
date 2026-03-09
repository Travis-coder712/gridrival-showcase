import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, LabelList,
} from 'recharts';
import type { TeamRoundResult } from '../../../shared/types';
import { formatCurrency } from '../../lib/formatters';

interface Props {
  teamResults: TeamRoundResult[];
}

const TEAM_COLORS = [
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#319795',
  '#3182ce', '#5a67d8', '#805ad5', '#d53f8c', '#c05621',
  '#2f855a', '#2b6cb0', '#6b46c1', '#b83280', '#e53e3e',
];

export default function ProfitLossBar({ teamResults }: Props) {
  const data = teamResults
    .map((r, i) => ({
      name: r.teamName,
      profit: Math.round(r.totalProfitDollars),
      revenue: Math.round(r.totalRevenueDollars),
      cost: Math.round(r.totalCostDollars),
      color: TEAM_COLORS[i % TEAM_COLORS.length],
    }))
    .sort((a, b) => b.profit - a.profit);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-navy-800 border border-white/20 rounded-lg p-3 shadow-xl text-sm">
        <div className="font-semibold text-white mb-1">{d.name}</div>
        <div className="text-green-400">Revenue: {formatCurrency(d.revenue)}</div>
        <div className="text-red-400">Cost: {formatCurrency(d.cost)}</div>
        <div className={`font-bold mt-1 ${d.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          Profit: {formatCurrency(d.profit)}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 45)}>
      <BarChart data={data} layout="vertical" margin={{ left: 100, right: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: '#a0aec0', fontSize: 11 }}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: '#e2e8f0', fontSize: 12 }}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={0} stroke="rgba(255,255,255,0.3)" />
        <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
          <LabelList
            dataKey="profit"
            position="right"
            formatter={(v: number) => formatCurrency(v)}
            style={{ fill: '#e2e8f0', fontSize: 11, fontFamily: 'monospace' }}
          />
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.profit >= 0 ? '#38a169' : '#e53e3e'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
