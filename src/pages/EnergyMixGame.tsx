import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'LEARN' | 'EXPLORE' | 'SCENARIO' | 'RESULTS';

type Season = 'summer' | 'annual' | 'winter';

interface HourlyData {
  hour: number;
  demand: number;
  solar: number;
  wind: number;
  charge: number;
  discharge: number;
  gas: number;
  curtailed: number;
  soc: number;
}

interface DispatchResult {
  solarGW: number;
  windGW: number;
  bessGW: number;
  bessGWh: number;
  gasGW: number;
  targetEnergy_TWh: number;
  costB: number;
  co2_Mt: number;
  totalNewGW: number;
  hourlyData: HourlyData[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SOLAR_PROFILE = [0, 0, 0, 0, 0, 0.05, 0.2, 0.5, 0.75, 0.9, 0.97, 1.0, 0.98, 0.92, 0.8, 0.6, 0.35, 0.1, 0, 0, 0, 0, 0, 0];
const WIND_PROFILE = [0.42, 0.44, 0.45, 0.44, 0.42, 0.38, 0.34, 0.30, 0.28, 0.27, 0.28, 0.30, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.40, 0.41, 0.42, 0.42];
const DEMAND_PROFILE = [0.65, 0.60, 0.58, 0.57, 0.58, 0.62, 0.72, 0.85, 0.92, 0.95, 0.93, 0.90, 0.88, 0.87, 0.88, 0.92, 0.97, 1.00, 0.98, 0.92, 0.85, 0.78, 0.72, 0.68];

const CF = {
  solar_summer: 0.28,
  solar_winter: 0.16,
  solar_annual: 0.22,
  wind_annual: 0.33,
  wind_drought: 0.08,
  bess_rte: 0.87,
};

const CAPEX = {
  solar_per_GW: 1.2,    // $B per GW
  wind_per_GW: 2.0,
  bess_power_per_GW: 0.8,
  bess_energy_per_GWh: 0.4,
  gas_per_GW: 0.9,
};

const NEM_MIX = [
  { label: 'Coal', pct: 45, color: '#4a5568' },
  { label: 'Gas', pct: 17, color: '#ed8936' },
  { label: 'Solar', pct: 18, color: '#ecc94b' },
  { label: 'Wind', pct: 12, color: '#48bb78' },
  { label: 'Hydro', pct: 5, color: '#4299e1' },
  { label: 'Other', pct: 3, color: '#a0aec0' },
];

const AEMO_ISP = {
  solarGW: 46,
  windGW: 32,
  bessGW: 18,
  label: 'AEMO ISP 2050',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtGW(v: number): string {
  return v < 1 ? `${(v * 1000).toFixed(0)} MW` : `${v.toFixed(1)} GW`;
}

function fmtGWh(v: number): string {
  return v < 1 ? `${(v * 1000).toFixed(0)} MWh` : `${v.toFixed(1)} GWh`;
}

function fmtTWh(v: number): string {
  return `${v.toFixed(1)} TWh`;
}

function fmtCost(v: number): string {
  return `$${v.toFixed(1)}B`;
}

function fmtMt(v: number): string {
  return `${v.toFixed(1)} Mt`;
}

// ─── Dispatch Simulation ─────────────────────────────────────────────────────

function simulateDispatch(
  coalGW: number,
  solarPct: number,
  season: Season,
  windDrought: boolean,
): DispatchResult {
  const targetEnergy_TWh = coalGW * 0.70 * 8.76;
  const solarCF = season === 'summer' ? CF.solar_summer : season === 'winter' ? CF.solar_winter : CF.solar_annual;
  const windCF = windDrought ? CF.wind_drought : CF.wind_annual;
  const windPct = 1 - solarPct;

  const solarGW = solarPct > 0 ? (targetEnergy_TWh * solarPct) / (solarCF * 8.76) : 0;
  const windGW = windPct > 0 ? (targetEnergy_TWh * windPct) / (windCF * 8.76) : 0;

  const avgDemand = coalGW * 0.70;
  const demandAvg = DEMAND_PROFILE.reduce((a, b) => a + b, 0) / 24;

  let maxCharge = 0;
  let maxDischarge = 0;
  let maxGas = 0;
  let soc = 0;
  let maxSOC = 0;
  const hourlyData: HourlyData[] = [];

  for (let h = 0; h < 24; h++) {
    const demand = avgDemand * DEMAND_PROFILE[h] / demandAvg;
    const solar = solarGW * SOLAR_PROFILE[h] * (solarCF / CF.solar_annual);
    const wind = windGW * WIND_PROFILE[h] * (windCF / CF.wind_annual);
    const renewable = solar + wind;
    const surplus = renewable - demand;

    let charge = 0;
    let discharge = 0;
    let gas = 0;
    let curtailed = 0;

    if (surplus > 0) {
      const maxChargeRate = Math.max(solarGW * 0.5, 0.5);
      charge = Math.min(surplus, maxChargeRate);
      soc += charge * CF.bess_rte;
      curtailed = Math.max(0, surplus - charge);
      maxCharge = Math.max(maxCharge, charge);
      maxSOC = Math.max(maxSOC, soc);
    } else {
      const deficit = -surplus;
      const maxDischargeRate = maxCharge > 0 ? maxCharge : 0.5;
      discharge = Math.min(deficit, soc, maxDischargeRate);
      soc -= discharge;
      maxDischarge = Math.max(maxDischarge, discharge);
      gas = deficit - discharge;
      maxGas = Math.max(maxGas, gas);
    }

    hourlyData.push({ hour: h, demand, solar, wind, charge, discharge, gas, curtailed, soc });
  }

  const bessGW = Math.max(maxCharge, maxDischarge);
  const bessGWh = maxSOC * 1.15;
  const gasGW = maxGas * 1.1;

  const costB =
    solarGW * CAPEX.solar_per_GW +
    windGW * CAPEX.wind_per_GW +
    bessGW * CAPEX.bess_power_per_GW +
    bessGWh * CAPEX.bess_energy_per_GWh +
    gasGW * CAPEX.gas_per_GW;

  const co2_Mt = targetEnergy_TWh * 0.9;
  const totalNewGW = solarGW + windGW + bessGW + gasGW;

  return { solarGW, windGW, bessGW, bessGWh, gasGW, targetEnergy_TWh, costB, co2_Mt, totalNewGW, hourlyData };
}

// Simulate for seasonal comparison
function simulateForSeason(coalGW: number, solarPct: number, s: Season): HourlyData[] {
  return simulateDispatch(coalGW, solarPct, s, false).hourlyData;
}

// Simulate wind drought over 7 days
function simulateWindDroughtWeek(coalGW: number, solarPct: number): HourlyData[][] {
  const days: HourlyData[][] = [];
  for (let d = 0; d < 7; d++) {
    const dayData = simulateDispatch(coalGW, solarPct, 'annual', true).hourlyData;
    days.push(dayData);
  }
  return days;
}

// ─── SVG Chart Components ────────────────────────────────────────────────────

function StackedAreaChart({
  hourlyData,
  width = 800,
  height = 400,
  showLabels = true,
  compact = false,
}: {
  hourlyData: HourlyData[];
  width?: number;
  height?: number;
  showLabels?: boolean;
  compact?: boolean;
}) {
  if (!hourlyData || hourlyData.length === 0) return null;

  const padL = compact ? 35 : 50;
  const padR = compact ? 10 : 20;
  const padT = compact ? 15 : 25;
  const padB = compact ? 25 : 40;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // Compute max values for scaling
  const maxGenStack = Math.max(
    ...hourlyData.map(d => d.wind + d.solar + d.discharge + d.gas),
    ...hourlyData.map(d => d.demand),
  );
  const maxCharge = Math.max(...hourlyData.map(d => d.charge));
  const yMax = Math.max(maxGenStack, 1) * 1.1;
  const yMin = maxCharge > 0 ? -maxCharge * 1.15 : 0;
  const yRange = yMax - yMin;

  function xPos(h: number): number {
    return padL + (h / 23) * chartW;
  }
  function yPos(v: number): number {
    return padT + chartH * (1 - (v - yMin) / yRange);
  }

  // Build stacked area paths
  const windY = hourlyData.map(d => d.wind);
  const solarY = hourlyData.map(d => d.wind + d.solar);
  const batteryY = hourlyData.map(d => d.wind + d.solar + d.discharge);
  const gasY = hourlyData.map(d => d.wind + d.solar + d.discharge + d.gas);

  function areaPath(topVals: number[], bottomVals: number[]): string {
    let path = '';
    for (let i = 0; i < 24; i++) {
      const x = xPos(i);
      const y = yPos(topVals[i]);
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    for (let i = 23; i >= 0; i--) {
      const x = xPos(i);
      const y = yPos(bottomVals[i]);
      path += ` L ${x} ${y}`;
    }
    path += ' Z';
    return path;
  }

  function linePath(vals: number[]): string {
    let path = '';
    for (let i = 0; i < 24; i++) {
      const x = xPos(i);
      const y = yPos(vals[i]);
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return path;
  }

  const zeros = new Array(24).fill(0);
  const chargeVals = hourlyData.map(d => -d.charge);

  // Demand line
  const demandVals = hourlyData.map(d => d.demand);

  // Y-axis ticks
  const yTickCount = compact ? 3 : 5;
  const yStep = yMax / yTickCount;
  const yTicks: number[] = [];
  for (let i = 0; i <= yTickCount; i++) {
    yTicks.push(Math.round(yStep * i * 10) / 10);
  }

  // X-axis labels
  const xLabels = compact
    ? [0, 6, 12, 18, 23]
    : [0, 3, 6, 9, 12, 15, 18, 21];
  const hourLabels: Record<number, string> = {
    0: '12am', 3: '3am', 6: '6am', 9: '9am',
    12: '12pm', 15: '3pm', 18: '6pm', 21: '9pm', 23: '11pm',
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTicks.map((tick) => (
        <line
          key={tick}
          x1={padL}
          x2={width - padR}
          y1={yPos(tick)}
          y2={yPos(tick)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* Zero line */}
      {yMin < 0 && (
        <line
          x1={padL}
          x2={width - padR}
          y1={yPos(0)}
          y2={yPos(0)}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
      )}

      {/* Stacked areas */}
      <path d={areaPath(windY, zeros)} fill="#48bb78" opacity={0.8} />
      <path d={areaPath(solarY, windY)} fill="#ecc94b" opacity={0.8} />
      <path d={areaPath(batteryY, solarY)} fill="#9f7aea" opacity={0.8} />
      <path d={areaPath(gasY, batteryY)} fill="#ed8936" opacity={0.8} />

      {/* Battery charging (below zero) */}
      {maxCharge > 0 && (
        <path d={areaPath(zeros, chargeVals)} fill="#9f7aea" opacity={0.4} />
      )}

      {/* Demand line */}
      <path d={linePath(demandVals)} fill="none" stroke="white" strokeWidth={2} strokeDasharray="6 3" />

      {/* Y-axis labels */}
      {yTicks.map((tick) => (
        <text
          key={tick}
          x={padL - 6}
          y={yPos(tick) + 4}
          textAnchor="end"
          fill="rgba(255,255,255,0.4)"
          fontSize={compact ? 9 : 11}
          fontFamily="monospace"
        >
          {tick.toFixed(1)}
        </text>
      ))}

      {/* Y-axis title */}
      {showLabels && (
        <text
          x={12}
          y={padT + chartH / 2}
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize={11}
          fontFamily="monospace"
          transform={`rotate(-90, 12, ${padT + chartH / 2})`}
        >
          GW
        </text>
      )}

      {/* X-axis labels */}
      {xLabels.map((h) => (
        <text
          key={h}
          x={xPos(h)}
          y={height - (compact ? 5 : 10)}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={compact ? 9 : 11}
          fontFamily="monospace"
        >
          {hourLabels[h] || `${h}`}
        </text>
      ))}

      {/* Legend */}
      {showLabels && (
        <g transform={`translate(${padL + 10}, ${padT + 5})`}>
          {[
            { label: 'Wind', color: '#48bb78' },
            { label: 'Solar', color: '#ecc94b' },
            { label: 'Battery', color: '#9f7aea' },
            { label: 'Gas', color: '#ed8936' },
            { label: 'Demand', color: '#ffffff', dashed: true },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(${i * 90}, 0)`}>
              {item.dashed ? (
                <line x1={0} y1={6} x2={14} y2={6} stroke={item.color} strokeWidth={2} strokeDasharray="4 2" />
              ) : (
                <rect x={0} y={1} width={14} height={10} fill={item.color} rx={2} opacity={0.8} />
              )}
              <text x={18} y={10} fill="rgba(255,255,255,0.6)" fontSize={10} fontFamily="monospace">
                {item.label}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* Charge label */}
      {maxCharge > 0 && showLabels && (
        <text
          x={padL + chartW / 2}
          y={yPos(-maxCharge / 2) + 4}
          textAnchor="middle"
          fill="#9f7aea"
          fontSize={10}
          fontFamily="monospace"
          opacity={0.7}
        >
          Charging
        </text>
      )}
    </svg>
  );
}

function SolarProfileMini() {
  const w = 280;
  const h = 100;
  const pad = { l: 30, r: 10, t: 10, b: 20 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;

  let path = '';
  for (let i = 0; i < 24; i++) {
    const x = pad.l + (i / 23) * cw;
    const y = pad.t + ch * (1 - SOLAR_PROFILE[i]);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  const areaPathD = path + ` L ${pad.l + cw} ${pad.t + ch} L ${pad.l} ${pad.t + ch} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[280px] h-auto">
      <path d={areaPathD} fill="#ecc94b" opacity={0.3} />
      <path d={path} fill="none" stroke="#ecc94b" strokeWidth={2} />
      {[0, 6, 12, 18].map(hr => (
        <text
          key={hr}
          x={pad.l + (hr / 23) * cw}
          y={h - 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={9}
          fontFamily="monospace"
        >
          {hr === 0 ? '12am' : hr === 6 ? '6am' : hr === 12 ? '12pm' : '6pm'}
        </text>
      ))}
      <text x={pad.l - 4} y={pad.t + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="monospace">1.0</text>
      <text x={pad.l - 4} y={pad.t + ch + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="monospace">0</text>
    </svg>
  );
}

function WindProfileMini() {
  const w = 280;
  const h = 100;
  const pad = { l: 30, r: 10, t: 10, b: 20 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;

  let path = '';
  for (let i = 0; i < 24; i++) {
    const x = pad.l + (i / 23) * cw;
    const y = pad.t + ch * (1 - WIND_PROFILE[i]);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  const areaPathD = path + ` L ${pad.l + cw} ${pad.t + ch} L ${pad.l} ${pad.t + ch} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[280px] h-auto">
      <path d={areaPathD} fill="#48bb78" opacity={0.3} />
      <path d={path} fill="none" stroke="#48bb78" strokeWidth={2} />
      {[0, 6, 12, 18].map(hr => (
        <text
          key={hr}
          x={pad.l + (hr / 23) * cw}
          y={h - 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={9}
          fontFamily="monospace"
        >
          {hr === 0 ? '12am' : hr === 6 ? '6am' : hr === 12 ? '12pm' : '6pm'}
        </text>
      ))}
      <text x={pad.l - 4} y={pad.t + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="monospace">0.5</text>
      <text x={pad.l - 4} y={pad.t + ch + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="monospace">0</text>
    </svg>
  );
}

function EnergyFlowBar({ gwIn, twhOut }: { gwIn: number; twhOut: number }) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <div className="flex-1 bg-white/5 rounded-lg p-2 text-center border border-white/10">
        <div className="text-white font-mono font-bold text-lg">{gwIn} GW</div>
        <div className="text-navy-400 text-xs">Capacity</div>
      </div>
      <div className="text-navy-400 text-xl">&rarr;</div>
      <div className="flex items-center gap-1">
        <div className="w-24 h-2 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full" />
      </div>
      <div className="text-navy-400 text-xl">&rarr;</div>
      <div className="flex-1 bg-white/5 rounded-lg p-2 text-center border border-white/10">
        <div className="text-white font-mono font-bold text-lg">~{twhOut} TWh</div>
        <div className="text-navy-400 text-xs">Energy / year</div>
      </div>
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 85;
  const innerR = 55;

  let cumAngle = -90; // start at top
  const paths: { d: string; color: string; label: string; pct: number; midAngle: number }[] = [];

  for (const seg of segments) {
    const startAngle = cumAngle;
    const sweep = (seg.pct / 100) * 360;
    const endAngle = startAngle + sweep;
    const midAngle = startAngle + sweep / 2;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1o = cx + outerR * Math.cos(startRad);
    const y1o = cy + outerR * Math.sin(startRad);
    const x2o = cx + outerR * Math.cos(endRad);
    const y2o = cy + outerR * Math.sin(endRad);
    const x1i = cx + innerR * Math.cos(endRad);
    const y1i = cy + innerR * Math.sin(endRad);
    const x2i = cx + innerR * Math.cos(startRad);
    const y2i = cy + innerR * Math.sin(startRad);

    const largeArc = sweep > 180 ? 1 : 0;

    const d = [
      `M ${x1o} ${y1o}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i}`,
      'Z',
    ].join(' ');

    paths.push({ d, color: seg.color, label: seg.label, pct: seg.pct, midAngle });
    cumAngle = endAngle;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-48 h-48">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold" fontFamily="monospace">
          NEM
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={10} fontFamily="monospace">
          284 TWh
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-navy-300">{seg.label}</span>
            <span className="text-white font-mono font-medium">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonBarChart({
  playerSolar,
  playerWind,
  playerBESS,
}: {
  playerSolar: number;
  playerWind: number;
  playerBESS: number;
}) {
  const categories = [
    { label: 'Solar', player: playerSolar, aemo: AEMO_ISP.solarGW, color: '#ecc94b' },
    { label: 'Wind', player: playerWind, aemo: AEMO_ISP.windGW, color: '#48bb78' },
    { label: 'BESS', player: playerBESS, aemo: AEMO_ISP.bessGW, color: '#9f7aea' },
  ];

  const maxVal = Math.max(
    ...categories.map(c => Math.max(c.player, c.aemo)),
  );

  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <div key={cat.label} className="space-y-1.5">
          <div className="text-sm text-navy-300 font-medium">{cat.label}</div>
          {/* Player bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-400 w-14 shrink-0">You</span>
            <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: cat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((cat.player / maxVal) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-white font-mono text-xs w-14 text-right">{cat.player.toFixed(1)} GW</span>
          </div>
          {/* AEMO bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-400 w-14 shrink-0">AEMO</span>
            <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full opacity-50"
                style={{ backgroundColor: cat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((cat.aemo / maxVal) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <span className="text-navy-300 font-mono text-xs w-14 text-right">{cat.aemo.toFixed(0)} GW</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WindDroughtChart({
  coalGW,
  solarPct,
}: {
  coalGW: number;
  solarPct: number;
}) {
  const weekData = useMemo(
    () => simulateWindDroughtWeek(coalGW, solarPct),
    [coalGW, solarPct],
  );

  const w = 800;
  const h = 300;
  const padL = 50;
  const padR = 20;
  const padT = 25;
  const padB = 35;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const totalHours = 7 * 24;

  // Flatten week data
  const flatData: HourlyData[] = [];
  for (const day of weekData) {
    for (const hourData of day) {
      flatData.push(hourData);
    }
  }

  const maxStack = Math.max(
    ...flatData.map(d => d.wind + d.solar + d.discharge + d.gas),
    ...flatData.map(d => d.demand),
  );
  const yMax = Math.max(maxStack, 1) * 1.1;

  function xPos(idx: number): number {
    return padL + (idx / (totalHours - 1)) * chartW;
  }
  function yPos(v: number): number {
    return padT + chartH * (1 - v / yMax);
  }

  function buildArea(topFn: (d: HourlyData) => number, bottomFn: (d: HourlyData) => number): string {
    let path = '';
    for (let i = 0; i < flatData.length; i++) {
      const x = xPos(i);
      const y = yPos(topFn(flatData[i]));
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    for (let i = flatData.length - 1; i >= 0; i--) {
      const x = xPos(i);
      const y = yPos(bottomFn(flatData[i]));
      path += ` L ${x} ${y}`;
    }
    path += ' Z';
    return path;
  }

  function buildLine(fn: (d: HourlyData) => number): string {
    let path = '';
    for (let i = 0; i < flatData.length; i++) {
      const x = xPos(i);
      const y = yPos(fn(flatData[i]));
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return path;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Day separator lines */}
      {[1, 2, 3, 4, 5, 6].map(d => (
        <line
          key={d}
          x1={xPos(d * 24)}
          x2={xPos(d * 24)}
          y1={padT}
          y2={padT + chartH}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}

      {/* Stacked areas */}
      <path
        d={buildArea(d => d.wind, () => 0)}
        fill="#48bb78"
        opacity={0.5}
      />
      <path
        d={buildArea(d => d.wind + d.solar, d => d.wind)}
        fill="#ecc94b"
        opacity={0.8}
      />
      <path
        d={buildArea(d => d.wind + d.solar + d.discharge, d => d.wind + d.solar)}
        fill="#9f7aea"
        opacity={0.8}
      />
      <path
        d={buildArea(d => d.wind + d.solar + d.discharge + d.gas, d => d.wind + d.solar + d.discharge)}
        fill="#ed8936"
        opacity={0.8}
      />

      {/* Demand line */}
      <path d={buildLine(d => d.demand)} fill="none" stroke="white" strokeWidth={1.5} strokeDasharray="6 3" />

      {/* Day labels */}
      {[0, 1, 2, 3, 4, 5, 6].map(d => (
        <text
          key={d}
          x={xPos(d * 24 + 12)}
          y={h - 8}
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize={11}
          fontFamily="monospace"
        >
          Day {d + 1}
        </text>
      ))}

      {/* Y-axis */}
      {[0, 0.25, 0.5, 0.75, 1].map(frac => {
        const val = frac * yMax;
        return (
          <g key={frac}>
            <line
              x1={padL}
              x2={w - padR}
              y1={yPos(val)}
              y2={yPos(val)}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
            <text
              x={padL - 6}
              y={yPos(val) + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.4)"
              fontSize={10}
              fontFamily="monospace"
            >
              {val.toFixed(1)}
            </text>
          </g>
        );
      })}

      <text
        x={12}
        y={padT + chartH / 2}
        textAnchor="middle"
        fill="rgba(255,255,255,0.5)"
        fontSize={10}
        fontFamily="monospace"
        transform={`rotate(-90, 12, ${padT + chartH / 2})`}
      >
        GW
      </text>

      {/* Wind drought warning label */}
      <text
        x={padL + chartW / 2}
        y={padT + 16}
        textAnchor="middle"
        fill="#f56565"
        fontSize={12}
        fontWeight="bold"
        fontFamily="monospace"
      >
        Wind Drought: Wind CF at 8%
      </text>
    </svg>
  );
}

// ─── Icon SVG Sub-components ─────────────────────────────────────────────────

function FactoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="6" y="24" width="12" height="18" rx="1" fill="currentColor" opacity={0.2} />
      <rect x="20" y="18" width="12" height="24" rx="1" fill="currentColor" opacity={0.2} />
      <rect x="34" y="24" width="8" height="18" rx="1" fill="currentColor" opacity={0.2} />
      {/* Smokestacks */}
      <line x1="12" y1="24" x2="12" y2="10" strokeWidth={3} strokeLinecap="round" />
      <line x1="26" y1="18" x2="26" y2="6" strokeWidth={3} strokeLinecap="round" />
      {/* Smoke */}
      <path d="M12 10 C10 7, 14 5, 12 2" strokeWidth={2} opacity={0.5} fill="none" />
      <path d="M26 6 C24 3, 28 1, 26 -2" strokeWidth={2} opacity={0.5} fill="none" />
      <line x1="6" y1="42" x2="42" y2="42" strokeWidth={2} />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="10" fill="#ecc94b" opacity={0.3} stroke="#ecc94b" strokeWidth={2} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 24 + 14 * Math.cos(rad);
        const y1 = 24 + 14 * Math.sin(rad);
        const x2 = 24 + 19 * Math.cos(rad);
        const y2 = 24 + 19 * Math.sin(rad);
        return (
          <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ecc94b" strokeWidth={2} strokeLinecap="round" />
        );
      })}
    </svg>
  );
}

function WindTurbineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="#48bb78" strokeWidth={2}>
      <line x1="24" y1="20" x2="24" y2="44" strokeWidth={3} strokeLinecap="round" />
      <circle cx="24" cy="18" r="3" fill="#48bb78" opacity={0.4} />
      {/* Blades */}
      <path d="M24 18 L24 4 L28 14 Z" fill="#48bb78" opacity={0.6} />
      <path d="M24 18 L36 26 L28 20 Z" fill="#48bb78" opacity={0.6} />
      <path d="M24 18 L12 26 L20 20 Z" fill="#48bb78" opacity={0.6} />
      <line x1="18" y1="44" x2="30" y2="44" strokeWidth={2} />
    </svg>
  );
}

function BalanceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="24" y1="6" x2="24" y2="42" strokeWidth={2} />
      <line x1="8" y1="16" x2="40" y2="16" strokeWidth={2} />
      {/* Left pan */}
      <path d="M8 16 L4 28 L16 28 Z" fill="currentColor" opacity={0.15} />
      {/* Right pan */}
      <path d="M40 16 L36 28 L44 28 Z" fill="currentColor" opacity={0.15} />
      <line x1="16" y1="42" x2="32" y2="42" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function BatteryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="4" y="8" width="22" height="16" rx="2" />
      <rect x="26" y="13" width="3" height="6" rx="1" />
      <rect x="7" y="11" width="6" height="10" rx="1" fill="#9f7aea" opacity={0.5} />
      <rect x="14" y="11" width="6" height="10" rx="1" fill="#9f7aea" opacity={0.3} />
    </svg>
  );
}

function GasFlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        d="M16 4 C16 4, 24 12, 24 20 C24 24.4 20.4 28 16 28 C11.6 28 8 24.4 8 20 C8 12 16 4 16 4Z"
        fill="#ed8936"
        opacity={0.3}
      />
      <path
        d="M16 14 C16 14, 20 18, 20 22 C20 24.2 18.2 26 16 26 C13.8 26 12 24.2 12 22 C12 18 16 14 16 14Z"
        fill="#ed8936"
        opacity={0.5}
      />
    </svg>
  );
}

// ─── Stat Card Component ─────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  subValue,
  accent,
}: {
  label: string;
  value: string;
  subValue?: string;
  accent: string;
}) {
  const accentColors: Record<string, string> = {
    yellow: 'border-yellow-500/30 text-yellow-400',
    green: 'border-green-500/30 text-green-400',
    purple: 'border-purple-500/30 text-purple-400',
    orange: 'border-orange-500/30 text-orange-400',
    blue: 'border-blue-500/30 text-blue-400',
    white: 'border-white/20 text-white',
  };

  const cls = accentColors[accent] || accentColors.white;
  const [borderCls, textCls] = cls.split(' ');

  return (
    <div className={`bg-white/5 border ${borderCls} rounded-xl p-3`}>
      <div className="text-navy-400 text-xs mb-1">{label}</div>
      <div className={`${textCls} font-mono font-bold text-lg leading-tight`}>{value}</div>
      {subValue && (
        <div className="text-navy-400 text-xs mt-0.5 font-mono">{subValue}</div>
      )}
    </div>
  );
}

// ─── Insight Card Component ──────────────────────────────────────────────────

function InsightCard({
  icon,
  title,
  body,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
          <p className="text-navy-300 text-sm leading-relaxed">{body}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Gradient Slider Component ───────────────────────────────────────────────

function GradientSlider({
  value,
  onChange,
  min,
  max,
  step,
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-navy-400">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative">
        <div
          className="w-full h-3 rounded-full"
          style={{
            background: `linear-gradient(to right, ${leftColor}, ${rightColor})`,
            opacity: 0.4,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-white/80 pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
    </div>
  );
}

// ─── Step Dots Component ─────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            i === current
              ? 'bg-electric-400 scale-125'
              : i < current
                ? 'bg-electric-400/50'
                : 'bg-white/15'
          }`}
        />
      ))}
      <span className="text-navy-400 text-xs ml-2 font-mono">
        {current + 1} of {total}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Component ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function EnergyMixGame() {
  const navigate = useNavigate();

  // ── Phase state ──
  const [phase, setPhase] = useState<Phase>('LEARN');

  // ── LEARN state ──
  const [learnStep, setLearnStep] = useState(0);

  // ── EXPLORE state ──
  const [coalGW, setCoalGW] = useState(10);
  const [solarPct, setSolarPct] = useState(0.60);
  const [season, setSeason] = useState<Season>('annual');
  const [windDrought, setWindDrought] = useState(false);

  // ── Simulation ──
  const dispatch = useMemo(
    () => simulateDispatch(coalGW, solarPct, season, windDrought),
    [coalGW, solarPct, season, windDrought],
  );

  // Seasonal comparison data
  const summerData = useMemo(
    () => simulateForSeason(coalGW, solarPct, 'summer'),
    [coalGW, solarPct],
  );
  const winterData = useMemo(
    () => simulateForSeason(coalGW, solarPct, 'winter'),
    [coalGW, solarPct],
  );

  // ── LEARN phase navigation ──
  const advanceLearn = useCallback(() => {
    if (learnStep < 3) {
      setLearnStep(s => s + 1);
    } else {
      setPhase('EXPLORE');
    }
  }, [learnStep]);

  // ── Dynamic insight based on solarPct ──
  const insight = useMemo(() => {
    if (solarPct > 0.70) {
      return {
        type: 'solar-heavy' as const,
        text: `Heavy solar mix requires ${fmtGW(dispatch.bessGW)} of batteries for daily shifting. That's ${(dispatch.bessGW / 1.4).toFixed(0)}x the current NEM battery fleet.`,
        color: 'text-yellow-400',
      };
    }
    if (solarPct < 0.30) {
      return {
        type: 'wind-heavy' as const,
        text: `Wind-heavy mix cuts battery needs but requires ${fmtGW(dispatch.gasGW)} of gas backup for drought events. Wind droughts can last days-to-weeks.`,
        color: 'text-green-400',
      };
    }
    return {
      type: 'balanced' as const,
      text: `Balanced mix minimises total system cost. Solar and wind complement each other: solar handles daytime, wind fills the gaps at night.`,
      color: 'text-electric-300',
    };
  }, [solarPct, dispatch.bessGW, dispatch.gasGW]);

  // ── SCENARIO calculations ──
  const scenarioTable = useMemo(() => {
    const sGW = dispatch.solarGW;
    const wGW = dispatch.windGW;
    const bGW = dispatch.bessGW;
    const gGW = dispatch.gasGW;

    return {
      solar: { required: sGW, built: 18, needed: Math.max(0, sGW - 18) },
      wind: { required: wGW, built: 14, needed: Math.max(0, wGW - 14) },
      bess: { required: bGW, built: 1.4, needed: Math.max(0, bGW - 1.4) },
      gas: { required: gGW, built: 14, needed: Math.max(0, gGW - 14) },
    };
  }, [dispatch]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-navy-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-electric-400 hover:text-electric-300 text-sm font-medium transition-colors"
          >
            &larr; Back to Home
          </button>
          <span className="text-navy-400 text-xs font-mono tracking-wide">ENERGY TRANSITION SIMULATOR</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-16">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ── PHASE 1: LEARN ─────────────────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {phase === 'LEARN' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Title */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="text-5xl mb-4"
                >
                  ⚡
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Energy Transition Simulator
                </h1>
                <p className="text-navy-300 text-lg max-w-2xl mx-auto">
                  Learn how Australia can replace coal with renewables — and why the mix matters.
                </p>
              </div>

              {/* Card Content */}
              <AnimatePresence mode="wait">
                {/* ── Card 1: Australia's Coal Fleet ── */}
                {learnStep === 0 && (
                  <motion.div
                    key="coal"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-2xl mx-auto"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <FactoryIcon className="w-12 h-12 text-gray-400" />
                        <h2 className="text-xl font-bold text-white">Australia&apos;s Coal Fleet</h2>
                      </div>

                      <div className="text-center my-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                          className="text-5xl font-mono font-bold text-white"
                        >
                          21 GW
                        </motion.div>
                        <div className="text-navy-300 mt-1">of coal capacity</div>
                      </div>

                      <div className="space-y-3 text-navy-300 text-sm">
                        <p>
                          At ~70% capacity factor, produces <span className="text-white font-mono font-medium">~128 TWh/year</span>
                        </p>
                        <p>
                          That&apos;s enough to power <span className="text-white font-mono font-medium">~15 million homes</span>
                        </p>
                      </div>

                      <EnergyFlowBar gwIn={21} twhOut={128} />
                    </div>
                  </motion.div>
                )}

                {/* ── Card 2: Solar ── */}
                {learnStep === 1 && (
                  <motion.div
                    key="solar"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-2xl mx-auto"
                  >
                    <div className="bg-white/5 border border-yellow-500/20 rounded-2xl p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <SunIcon className="w-12 h-12" />
                        <h2 className="text-xl font-bold" style={{ color: '#ecc94b' }}>
                          Solar: Predictable but Daytime Only
                        </h2>
                      </div>

                      <div className="mb-4">
                        <SolarProfileMini />
                        <div className="text-center text-navy-400 text-xs mt-1 font-mono">
                          Typical daily solar output profile (normalised)
                        </div>
                      </div>

                      <ul className="space-y-2 text-sm text-navy-300">
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#ecc94b' }}>&#x25CF;</span>
                          <span>Generates every day &mdash; highly predictable</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#ecc94b' }}>&#x25CF;</span>
                          <span>Peak output 10am&ndash;4pm, zero overnight</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#ecc94b' }}>&#x25CF;</span>
                          <span>~22% average capacity factor nationally</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#ecc94b' }}>&#x25CF;</span>
                          <span>Winter output ~40% less than summer</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#ecc94b' }}>&#x25CF;</span>
                          <span>Needs batteries to shift midday surplus to evening peak</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* ── Card 3: Wind ── */}
                {learnStep === 2 && (
                  <motion.div
                    key="wind"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-2xl mx-auto"
                  >
                    <div className="bg-white/5 border border-green-500/20 rounded-2xl p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <WindTurbineIcon className="w-12 h-12" />
                        <h2 className="text-xl font-bold" style={{ color: '#48bb78' }}>
                          Wind: Day and Night, but Droughts
                        </h2>
                      </div>

                      <div className="mb-4">
                        <WindProfileMini />
                        <div className="text-center text-navy-400 text-xs mt-1 font-mono">
                          Typical daily wind output profile (normalised)
                        </div>
                      </div>

                      <ul className="space-y-2 text-sm text-navy-300">
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#48bb78' }}>&#x25CF;</span>
                          <span>Generates day AND night &mdash; complements solar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#48bb78' }}>&#x25CF;</span>
                          <span>~33% average capacity factor nationally</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#48bb78' }}>&#x25CF;</span>
                          <span>Less seasonal variation than solar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#48bb78' }}>&#x25CF;</span>
                          <span>But: wind droughts last days-to-weeks (May&ndash;August risk)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span style={{ color: '#48bb78' }}>&#x25CF;</span>
                          <span>Needs gas or pumped hydro for extended calm periods</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* ── Card 4: The Balancing Act ── */}
                {learnStep === 3 && (
                  <motion.div
                    key="balance"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-2xl mx-auto"
                  >
                    <div className="bg-white/5 border border-electric-500/20 rounded-2xl p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <BalanceIcon className="w-12 h-12 text-electric-400" />
                        <h2 className="text-xl font-bold text-electric-300">The Balancing Act</h2>
                      </div>

                      <div className="space-y-5">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                            <BatteryIcon className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">More solar → more batteries</div>
                            <div className="text-navy-300 text-sm">Daily cycling, high utilisation</div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                            <GasFlameIcon className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">More wind → less batteries, but more gas</div>
                            <div className="text-navy-300 text-sm">Wind drought insurance</div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                            <BalanceIcon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">Best mix = diversified portfolio with optionality</div>
                            <div className="text-navy-300 text-sm">Like a financial portfolio, spreading reduces risk</div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="mt-8 text-center">
                        <button
                          onClick={() => setPhase('EXPLORE')}
                          className="px-8 py-3 bg-electric-500 hover:bg-electric-400 text-white font-bold rounded-xl transition-colors text-lg"
                        >
                          Let&apos;s Explore &rarr;
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-8 flex flex-col items-center gap-4">
                <StepDots current={learnStep} total={4} />

                <div className="flex items-center gap-3">
                  {learnStep > 0 && (
                    <button
                      onClick={() => setLearnStep(s => s - 1)}
                      className="px-5 py-2 text-sm font-medium rounded-xl
                        bg-white/5 text-navy-300 border border-white/10
                        hover:bg-white/10 hover:text-white transition-all"
                    >
                      Back
                    </button>
                  )}
                  {learnStep < 3 && (
                    <button
                      onClick={advanceLearn}
                      className="px-6 py-2 text-sm font-medium rounded-xl
                        bg-electric-500/20 text-electric-300 border border-electric-500/30
                        hover:bg-electric-500/30 hover:border-electric-400 transition-all"
                    >
                      Next
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setPhase('EXPLORE')}
                  className="text-navy-400 hover:text-navy-300 text-xs transition-colors underline underline-offset-2"
                >
                  Skip to Simulator &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ── PHASE 2: EXPLORE ───────────────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {phase === 'EXPLORE' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  ⚡ Energy Transition Simulator
                </h1>
                <p className="text-navy-300 text-sm">
                  Adjust the sliders to design your coal replacement strategy
                </p>
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── Left: Controls ── */}
                <div className="lg:col-span-4 space-y-5">

                  {/* Coal to Replace */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-white">Coal to Replace</label>
                      <span className="text-electric-300 font-mono font-bold text-lg">{coalGW} GW</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={21}
                      step={1}
                      value={coalGW}
                      onChange={(e) => setCoalGW(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-electric-400"
                    />
                    <div className="flex justify-between text-xs text-navy-400 mt-1">
                      <span>1 GW</span>
                      <span>21 GW</span>
                    </div>
                    <div className="mt-2 text-navy-300 text-xs font-mono">
                      Equivalent to {fmtTWh(coalGW * 0.70 * 8.76)} / year
                    </div>
                  </div>

                  {/* Solar/Wind Mix */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-semibold text-white">Solar / Wind Mix</label>
                    </div>
                    <div className="text-center mb-3">
                      <span className="font-mono font-bold text-lg">
                        <span style={{ color: '#ecc94b' }}>{Math.round(solarPct * 100)}% Solar</span>
                        {' / '}
                        <span style={{ color: '#48bb78' }}>{Math.round((1 - solarPct) * 100)}% Wind</span>
                      </span>
                    </div>
                    <GradientSlider
                      value={solarPct * 100}
                      onChange={(v) => setSolarPct(v / 100)}
                      min={0}
                      max={100}
                      step={5}
                      leftLabel="All Wind"
                      rightLabel="All Solar"
                      leftColor="#48bb78"
                      rightColor="#ecc94b"
                    />
                  </div>

                  {/* Season Toggle */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <label className="text-sm font-semibold text-white mb-3 block">Season</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['summer', 'annual', 'winter'] as Season[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSeason(s)}
                          className={`px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                            season === s
                              ? 'bg-electric-500/20 text-electric-300 border border-electric-500/40'
                              : 'bg-white/5 text-navy-400 border border-white/10 hover:bg-white/10 hover:text-navy-200'
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wind Drought Toggle */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white">Wind Drought</label>
                      {windDrought && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium animate-pulse">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-navy-400 text-xs mt-1 mb-3">Reduces wind CF to 8% — simulating a multi-day calm</p>
                    <button
                      onClick={() => setWindDrought(!windDrought)}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                        windDrought
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                          : 'bg-white/5 text-navy-300 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {windDrought ? 'Disable Wind Drought' : 'Simulate Wind Drought'}
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Solar Required" value={fmtGW(dispatch.solarGW)} accent="yellow" />
                    <StatCard label="Wind Required" value={fmtGW(dispatch.windGW)} accent="green" />
                    <StatCard label="Battery Storage" value={fmtGW(dispatch.bessGW)} subValue={fmtGWh(dispatch.bessGWh)} accent="purple" />
                    <StatCard label="Gas Backup" value={fmtGW(dispatch.gasGW)} accent="orange" />
                    <StatCard label="Total New Capacity" value={fmtGW(dispatch.totalNewGW)} accent="white" />
                    <StatCard label="Estimated Cost" value={fmtCost(dispatch.costB)} accent="blue" />
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                    <div className="text-navy-400 text-xs">CO2 Avoided</div>
                    <div className="text-green-400 font-mono font-bold text-xl">{fmtMt(dispatch.co2_Mt)} / year</div>
                  </div>
                </div>

                {/* ── Right: Charts ── */}
                <div className="lg:col-span-8 space-y-6">

                  {/* Main 24-hour chart */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                    <h3 className="text-white font-bold text-lg mb-1">24-Hour Generation Profile</h3>
                    <p className="text-navy-400 text-xs mb-4 font-mono">
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                      {windDrought ? ' | Wind Drought Active' : ''}
                      {' | Replacing '}{coalGW} GW coal
                    </p>
                    <StackedAreaChart hourlyData={dispatch.hourlyData} />
                  </div>

                  {/* Seasonal Comparison */}
                  {!windDrought && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                      <h3 className="text-white font-bold text-sm mb-3">Seasonal Comparison</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-center text-xs text-navy-400 font-mono mb-1">Summer (CF: 28%)</div>
                          <StackedAreaChart hourlyData={summerData} width={400} height={220} showLabels={false} compact />
                        </div>
                        <div>
                          <div className="text-center text-xs text-navy-400 font-mono mb-1">Winter (CF: 16%)</div>
                          <StackedAreaChart hourlyData={winterData} width={400} height={220} showLabels={false} compact />
                        </div>
                      </div>
                      <div className="text-center text-navy-400 text-xs mt-2">
                        Notice: winter needs more gas backup due to lower solar output
                      </div>
                    </div>
                  )}

                  {/* Wind Drought View */}
                  {windDrought && (
                    <div className="bg-white/5 border border-red-500/20 rounded-2xl p-4 md:p-6">
                      <h3 className="text-white font-bold text-sm mb-1">7-Day Wind Drought</h3>
                      <p className="text-navy-400 text-xs mb-3">
                        Wind output collapses to 8% CF. Solar still produces daily, but gas fills the massive gap.
                      </p>
                      <WindDroughtChart coalGW={coalGW} solarPct={solarPct} />
                    </div>
                  )}

                  {/* Dynamic Insight */}
                  <motion.div
                    key={insight.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl shrink-0">
                        {insight.type === 'solar-heavy' ? '☀️' : insight.type === 'wind-heavy' ? '💨' : '⚖️'}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${insight.color} mb-0.5`}>
                          {insight.type === 'solar-heavy'
                            ? 'Solar-Heavy Mix'
                            : insight.type === 'wind-heavy'
                              ? 'Wind-Heavy Mix'
                              : 'Balanced Mix'}
                        </div>
                        <p className="text-navy-300 text-sm">{insight.text}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Continue Button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setPhase('LEARN')}
                      className="px-5 py-2 text-sm font-medium rounded-xl
                        bg-white/5 text-navy-300 border border-white/10
                        hover:bg-white/10 hover:text-white transition-all"
                    >
                      &larr; Back to Learn
                    </button>
                    <button
                      onClick={() => setPhase('SCENARIO')}
                      className="px-6 py-2.5 text-sm font-bold rounded-xl
                        bg-electric-500/20 text-electric-300 border border-electric-500/30
                        hover:bg-electric-500/30 hover:border-electric-400 transition-all"
                    >
                      NEM Reality Check &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ── PHASE 3: SCENARIO ──────────────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {phase === 'SCENARIO' && (
            <motion.div
              key="scenario"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  NEM Reality Check
                </h1>
                <p className="text-navy-300 text-sm">
                  How does your plan compare to the real NEM?
                </p>
              </div>

              <div className="space-y-8 max-w-4xl mx-auto">

                {/* ── Section A: The NEM Today ── */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">The NEM Today</h2>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <DonutChart segments={NEM_MIX} />
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-white font-mono font-bold text-lg">284</div>
                          <div className="text-navy-400 text-xs">TWh total</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-white font-mono font-bold text-lg">21</div>
                          <div className="text-navy-400 text-xs">GW coal</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-red-400 font-mono font-bold text-lg">6</div>
                          <div className="text-navy-400 text-xs">GW retiring in 3yr</div>
                        </div>
                      </div>
                      <p className="text-navy-300 text-sm">
                        The NEM supplies ~10 million customers across QLD, NSW, VIC, SA, TAS and ACT.
                        Coal still provides the largest share, but it&apos;s aging fast.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Section B: Your Replacement Plan ── */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-2">Your Replacement Plan</h2>
                  <p className="text-navy-400 text-xs mb-4 font-mono">
                    Replacing {coalGW} GW coal | {Math.round(solarPct * 100)}% Solar / {Math.round((1 - solarPct) * 100)}% Wind
                  </p>

                  {/* Quick slider for adjustments */}
                  <div className="mb-5 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-navy-400 mb-2">Adjust your mix:</div>
                    <GradientSlider
                      value={solarPct * 100}
                      onChange={(v) => setSolarPct(v / 100)}
                      min={0}
                      max={100}
                      step={5}
                      leftLabel="All Wind"
                      rightLabel="All Solar"
                      leftColor="#48bb78"
                      rightColor="#ecc94b"
                    />
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-navy-400 font-medium py-2 pr-4">Technology</th>
                          <th className="text-right text-navy-400 font-medium py-2 px-4">Required</th>
                          <th className="text-right text-navy-400 font-medium py-2 px-4">Already Built</th>
                          <th className="text-right text-navy-400 font-medium py-2 px-4">Still Needed</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="py-2.5 pr-4">
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ecc94b' }} />
                              <span className="text-white">Solar</span>
                            </span>
                          </td>
                          <td className="text-right font-mono text-white py-2.5 px-4">{dispatch.solarGW.toFixed(1)} GW</td>
                          <td className="text-right font-mono text-navy-300 py-2.5 px-4">18 GW</td>
                          <td className="text-right font-mono py-2.5 px-4">
                            <span className={scenarioTable.solar.needed > 0 ? 'text-yellow-400' : 'text-green-400'}>
                              {scenarioTable.solar.needed > 0 ? `${scenarioTable.solar.needed.toFixed(1)} GW` : 'Covered'}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2.5 pr-4">
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#48bb78' }} />
                              <span className="text-white">Wind</span>
                            </span>
                          </td>
                          <td className="text-right font-mono text-white py-2.5 px-4">{dispatch.windGW.toFixed(1)} GW</td>
                          <td className="text-right font-mono text-navy-300 py-2.5 px-4">14 GW</td>
                          <td className="text-right font-mono py-2.5 px-4">
                            <span className={scenarioTable.wind.needed > 0 ? 'text-green-400' : 'text-green-400'}>
                              {scenarioTable.wind.needed > 0 ? `${scenarioTable.wind.needed.toFixed(1)} GW` : 'Covered'}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2.5 pr-4">
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#9f7aea' }} />
                              <span className="text-white">BESS</span>
                            </span>
                          </td>
                          <td className="text-right font-mono text-white py-2.5 px-4">{dispatch.bessGW.toFixed(1)} GW</td>
                          <td className="text-right font-mono text-navy-300 py-2.5 px-4">1.4 GW</td>
                          <td className="text-right font-mono py-2.5 px-4">
                            <span className={scenarioTable.bess.needed > 0 ? 'text-purple-400' : 'text-green-400'}>
                              {scenarioTable.bess.needed > 0 ? `${scenarioTable.bess.needed.toFixed(1)} GW` : 'Covered'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4">
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ed8936' }} />
                              <span className="text-white">Gas backup</span>
                            </span>
                          </td>
                          <td className="text-right font-mono text-white py-2.5 px-4">{dispatch.gasGW.toFixed(1)} GW</td>
                          <td className="text-right font-mono text-navy-300 py-2.5 px-4">14 GW*</td>
                          <td className="text-right font-mono py-2.5 px-4">
                            <span className={scenarioTable.gas.needed > 0 ? 'text-orange-400' : 'text-green-400'}>
                              {scenarioTable.gas.needed > 0 ? `${scenarioTable.gas.needed.toFixed(1)} GW` : 'Covered'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="text-navy-400 text-xs mt-3">
                    <p>* Existing gas fleet may cover backup needs</p>
                  </div>
                </div>

                {/* ── Section B2: Storage Reality Check ── */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-1">Storage: Where We Stand</h2>
                  <p className="text-navy-400 text-xs mb-5">Grid-scale batteries, pumped hydro, and behind-the-meter</p>

                  {/* Snowy 2.0 */}
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">🏔️</div>
                      <div>
                        <div className="text-white font-bold text-sm mb-1">Snowy 2.0 Pumped Hydro</div>
                        <div className="grid grid-cols-3 gap-3 mb-2">
                          <div><div className="text-blue-400 font-mono font-bold">2.2 GW</div><div className="text-navy-500 text-[10px]">Power</div></div>
                          <div><div className="text-blue-400 font-mono font-bold">350 GWh</div><div className="text-navy-500 text-[10px]">Storage</div></div>
                          <div><div className="text-blue-400 font-mono font-bold">~175 hrs</div><div className="text-navy-500 text-[10px]">Duration</div></div>
                        </div>
                        <p className="text-navy-300 text-xs leading-relaxed">
                          Commissioning from late 2027. Snowy 2.0 provides <span className="text-white">long-duration storage</span> that
                          batteries cannot — able to sustain output for days, not hours. Critical for covering multi-day
                          wind droughts and seasonal shortfalls. But even at 2.2 GW, it covers only a fraction of what&apos;s
                          needed to replace 21 GW of coal. The grid needs Snowy 2.0 <span className="text-white">and</span> many
                          more GW of batteries.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid-scale battery stats */}
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">🔋</div>
                      <div className="w-full">
                        <div className="text-white font-bold text-sm mb-2">Grid-Scale Batteries</div>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <div className="text-purple-400 font-mono font-bold text-lg">1.4 GW</div>
                            <div className="text-navy-500 text-[10px]">Operational Today</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <div className="text-purple-300 font-mono font-bold text-lg">7.8 GW</div>
                            <div className="text-navy-500 text-[10px]">Under Construction</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <div className="text-purple-200 font-mono font-bold text-lg">26.1 GW</div>
                            <div className="text-navy-500 text-[10px]">In Pipeline</div>
                          </div>
                        </div>
                        <p className="text-navy-300 text-xs leading-relaxed">
                          Grid battery deployment is accelerating fast — capacity grew <span className="text-white">2.5× in 2024 alone</span>.
                          Average duration is shifting from 2-hour to 4-hour systems. Major projects include
                          Woreen BESS (350 MW / 1.4 GWh) in Victoria and Liddell Battery (500 MW) in NSW.
                          By 2035, AEMO projects ~18 GW of grid batteries will be needed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Home batteries */}
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">🏠</div>
                      <div>
                        <div className="text-white font-bold text-sm mb-1">Home Battery Scheme</div>
                        <p className="text-navy-300 text-xs leading-relaxed mb-2">
                          Australia leads the world in residential battery adoption. Over <span className="text-white">350,000 home batteries</span> installed
                          nationally, with South Australia&apos;s Home Battery Scheme alone subsidising 40,000+ systems.
                          Combined residential storage exceeds <span className="text-white">3 GWh</span> of capacity.
                        </p>
                        <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                          <div className="text-amber-400 text-xs font-medium mb-1">Important context:</div>
                          <p className="text-navy-400 text-[11px] leading-relaxed">
                            Home batteries are valuable for self-consumption, backup power, and reducing individual bills —
                            but they operate <span className="text-navy-200">behind the meter</span> and aren&apos;t centrally dispatched.
                            To replace coal at grid scale, we need <span className="text-navy-200">grid-scale batteries</span> that
                            can be dispatched in the wholesale market at precise times. A single 350 MW grid battery
                            equals the output of ~25,000 home batteries. Both matter, but grid-scale BESS is what
                            drives the energy transition at the pace required.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section C: AEMO's Plan ── */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-1">AEMO&apos;s Integrated System Plan</h2>
                  <p className="text-navy-400 text-xs mb-5">Your mix vs the official projection for 2050</p>
                  <ComparisonBarChart
                    playerSolar={dispatch.solarGW}
                    playerWind={dispatch.windGW}
                    playerBESS={dispatch.bessGW}
                  />
                  <div className="mt-4 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <div className="text-navy-400 text-xs leading-relaxed">
                      AEMO&apos;s ISP projects approximately 60% solar / 40% wind by 2050, with ~46 GW solar, ~32 GW wind,
                      and ~18 GW of battery storage. The optimal mix balances daily solar shifting with overnight
                      wind generation.
                    </div>
                  </div>
                </div>

                {/* Continue */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setPhase('EXPLORE')}
                    className="px-5 py-2 text-sm font-medium rounded-xl
                      bg-white/5 text-navy-300 border border-white/10
                      hover:bg-white/10 hover:text-white transition-all"
                  >
                    &larr; Back to Simulator
                  </button>
                  <button
                    onClick={() => setPhase('RESULTS')}
                    className="px-6 py-2.5 text-sm font-bold rounded-xl
                      bg-electric-500/20 text-electric-300 border border-electric-500/30
                      hover:bg-electric-500/30 hover:border-electric-400 transition-all"
                  >
                    See What You Learned &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ── PHASE 4: RESULTS ───────────────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {phase === 'RESULTS' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="text-5xl mb-4"
                >
                  🎓
                </motion.div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Key Insights</h1>
                <p className="text-navy-300 text-sm">
                  What the energy transition teaches us about portfolio design
                </p>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                <InsightCard
                  delay={0.1}
                  icon={
                    <svg className="w-5 h-5 text-electric-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                    </svg>
                  }
                  title="Variability Requires Optionality"
                  body="No single technology solves everything. A mix provides resilience against weather, seasons, and uncertainty."
                />

                <InsightCard
                  delay={0.2}
                  icon={
                    <div className="flex items-center -space-x-1">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="5" fill="#ecc94b" opacity={0.6} />
                      </svg>
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="4" width="10" height="8" rx="1" fill="#9f7aea" opacity={0.6} />
                      </svg>
                    </div>
                  }
                  title="Solar + Batteries = Daily Dance"
                  body="Solar is predictable and generates every day. Batteries shift the midday surplus to evening peak — high utilisation, every single day."
                />

                <InsightCard
                  delay={0.3}
                  icon={
                    <div className="flex items-center -space-x-1">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2 L12 8 L8 6 L4 8 Z" fill="#48bb78" opacity={0.6} />
                      </svg>
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3 C8 3 12 7 12 10 C12 12.2 10.2 14 8 14 C5.8 14 4 12.2 4 10 C4 7 8 3 8 3Z" fill="#ed8936" opacity={0.6} />
                      </svg>
                    </div>
                  }
                  title="Wind + Gas = Weather Insurance"
                  body="Wind generates day and night, reducing battery needs. But wind droughts lasting days-to-weeks need firm gas or pumped hydro backup."
                />

                <InsightCard
                  delay={0.4}
                  icon={
                    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                    </svg>
                  }
                  title="Diversification Wins"
                  body="Like a financial portfolio, spreading generation across solar and wind reduces total system cost and risk."
                />

                <InsightCard
                  delay={0.5}
                  icon={
                    <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                    </svg>
                  }
                  title="The Scale Challenge"
                  body="Replacing 21 GW of coal requires 60-80 GW of new capacity. Today only 1.4 GW of grid batteries are operational — but 26 GW are in the pipeline. Snowy 2.0 adds 2.2 GW of long-duration storage, yet the grid needs far more."
                />

                <InsightCard
                  delay={0.6}
                  icon={
                    <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  }
                  title="Already Underway"
                  body="56.6 GW is in the NEM pipeline — including 26 GW of batteries. Grid battery capacity grew 2.5× in 2024. Add 350,000+ home batteries and Snowy 2.0's 350 GWh. The transition is accelerating."
                />
              </div>

              {/* Summary of player's build */}
              <div className="max-w-3xl mx-auto mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white/5 border border-electric-500/20 rounded-2xl p-6"
                >
                  <h3 className="text-white font-bold text-sm mb-3">Your Build Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-yellow-400 font-mono font-bold text-lg">{fmtGW(dispatch.solarGW)}</div>
                      <div className="text-navy-400 text-xs">Solar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-mono font-bold text-lg">{fmtGW(dispatch.windGW)}</div>
                      <div className="text-navy-400 text-xs">Wind</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-mono font-bold text-lg">{fmtGW(dispatch.bessGW)}</div>
                      <div className="text-navy-400 text-xs">Battery</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-400 font-mono font-bold text-lg">{fmtGW(dispatch.gasGW)}</div>
                      <div className="text-navy-400 text-xs">Gas</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/5">
                    <div className="text-center">
                      <div className="text-white font-mono font-bold">{fmtCost(dispatch.costB)}</div>
                      <div className="text-navy-400 text-xs">Total Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-mono font-bold">{fmtMt(dispatch.co2_Mt)}/yr</div>
                      <div className="text-navy-400 text-xs">CO2 Avoided</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-mono font-bold">{coalGW} GW</div>
                      <div className="text-navy-400 text-xs">Coal Replaced</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Actions */}
              <div className="max-w-3xl mx-auto mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setPhase('EXPLORE')}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl
                    bg-electric-500/20 text-electric-300 border border-electric-500/30
                    hover:bg-electric-500/30 hover:border-electric-400 transition-all"
                >
                  Explore Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 text-sm font-medium rounded-xl
                    bg-white/5 text-navy-300 border border-white/10
                    hover:bg-white/10 hover:text-white transition-all"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
