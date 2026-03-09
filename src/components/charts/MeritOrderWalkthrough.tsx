import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { TimePeriodDispatchResult, TimePeriod } from '../../../shared/types';
import { TIME_PERIOD_SHORT_LABELS } from '../../../shared/types';
import { formatMW, formatNumber } from '../../lib/formatters';

interface Props {
  periodResults: TimePeriodDispatchResult[];
  initialPeriod?: TimePeriod;
  startAtEnd?: boolean;
  onClose?: () => void;
}

interface WalkthroughBand {
  teamName: string;
  teamId: string;
  assetName: string;
  assetType: string;
  bidPriceMWh: number;
  offeredMW: number;
  dispatchedMW: number;
  isMarginal: boolean;
  isDispatched: boolean;
  color: string;
  cumulativeMW: number;
}

const TEAM_COLORS = [
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#319795',
  '#3182ce', '#5a67d8', '#805ad5', '#d53f8c', '#c05621',
  '#2f855a', '#2b6cb0', '#6b46c1', '#b83280', '#e53e3e',
];

const CHART_HEIGHT = 400;
const MARGIN = { top: 20, right: 30, bottom: 45, left: 60 };
const MIN_BAR_HEIGHT_PX = 6; // minimum visible height for $0 bids
const Y_BREAK = 500; // price threshold where compression starts

/** Adaptive animation speed based on band count */
function getStepInterval(bandCount: number): number {
  if (bandCount <= 20) return 1200;
  if (bandCount <= 40) return 800;
  if (bandCount <= 80) return 400;
  if (bandCount <= 120) return 250;
  return 150;
}

export default function MeritOrderWalkthrough({ periodResults, initialPeriod, startAtEnd, onClose }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    initialPeriod || (periodResults[0]?.timePeriod as TimePeriod) || 'day_peak'
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredBand, setHoveredBand] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(800);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setChartWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const periodResult = useMemo(() =>
    periodResults.find(p => p.timePeriod === selectedPeriod) || periodResults[0],
    [periodResults, selectedPeriod]
  );

  // Build the ordered band list (dispatched + undispatched sorted by price)
  const allBands = useMemo(() => {
    if (!periodResult) return [];

    const teamColorMap = new Map<string, string>();
    let colorIdx = 0;

    const bands: WalkthroughBand[] = [];
    const sorted = [
      ...periodResult.meritOrderStack.map(b => ({ ...b, isDispatched: true })),
      ...periodResult.undispatchedBands.map(b => ({ ...b, isDispatched: false })),
    ]
      .filter(b => b.offeredMW > 0)
      .sort((a, b) => a.bidPriceMWh - b.bidPriceMWh);

    let cumMW = 0;
    for (const band of sorted) {
      if (!teamColorMap.has(band.teamId)) {
        teamColorMap.set(band.teamId, TEAM_COLORS[colorIdx++ % TEAM_COLORS.length]);
      }

      bands.push({
        teamName: band.teamName,
        teamId: band.teamId,
        assetName: band.assetName,
        assetType: band.assetType,
        bidPriceMWh: band.bidPriceMWh,
        offeredMW: band.offeredMW,
        dispatchedMW: band.dispatchedMW,
        isMarginal: band.isMarginal,
        isDispatched: band.dispatchedMW > 0,
        color: teamColorMap.get(band.teamId)!,
        cumulativeMW: cumMW,
      });
      cumMW += band.offeredMW;
    }
    return bands;
  }, [periodResult]);

  // Total steps: 0 (intro) + N bands + 1 (reveal clearing price)
  const totalSteps = allBands.length + 2;

  // When startAtEnd is true, jump to the final step on initial mount
  const startAtEndApplied = useRef(false);
  useEffect(() => {
    if (startAtEnd && !startAtEndApplied.current && totalSteps > 1) {
      startAtEndApplied.current = true;
      setCurrentStep(totalSteps - 1);
    }
  }, [startAtEnd, totalSteps]);

  const isIntroStep = currentStep === 0;
  const isFinalStep = currentStep >= totalSteps - 1;
  const visibleBandCount = isIntroStep ? 0 : Math.min(currentStep, allBands.length);

  // Current visible data
  const chartData = useMemo(() => {
    return allBands.slice(0, visibleBandCount);
  }, [allBands, visibleBandCount]);

  // Cumulative MW so far
  const cumulativeMW = chartData.reduce((s, b) => s + b.offeredMW, 0);

  // Demand and price info
  const demandMW = periodResult?.demandMW || 0;
  const showClearingPrice = isFinalStep || (currentStep > allBands.length);

  // The band being added in this step
  const currentBand = !isIntroStep && currentStep <= allBands.length ? allBands[currentStep - 1] : null;

  // Chart scale calculations
  const totalMW = useMemo(() => {
    const allMW = allBands.reduce((s, b) => s + b.offeredMW, 0);
    return Math.max(allMW * 1.05, demandMW * 1.15, 100);
  }, [allBands, demandMW]);

  const yMax = useMemo(() => {
    const prices = allBands.map(b => b.bidPriceMWh);
    const maxPrice = Math.max(...prices, periodResult?.clearingPriceMWh || 0, 50);
    return Math.ceil(maxPrice * 1.2 / 50) * 50;
  }, [allBands, periodResult]);

  const plotW = chartWidth - MARGIN.left - MARGIN.right;
  const plotH = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  // Whether piecewise scale is active (prices exceed the break threshold)
  const usePiecewise = yMax > Y_BREAK * 1.5;

  // Scale functions
  const xScale = useCallback((mw: number) => MARGIN.left + (mw / totalMW) * plotW, [totalMW, plotW]);
  const yScale = useCallback((price: number) => {
    if (!usePiecewise) {
      // Normal linear scale
      return MARGIN.top + plotH - (price / yMax) * plotH;
    }
    // Piecewise: bottom 80% for $0-500, top 20% for $500-yMax
    const lowerH = plotH * 0.8;
    const upperH = plotH * 0.2;
    if (price <= Y_BREAK) {
      return MARGIN.top + upperH + lowerH - (price / Y_BREAK) * lowerH;
    }
    return MARGIN.top + upperH - ((price - Y_BREAK) / (yMax - Y_BREAK)) * upperH;
  }, [yMax, plotH, usePiecewise]);

  // Y-axis ticks — split between two zones when piecewise
  const yTicks = useMemo(() => {
    if (!usePiecewise) {
      const step = yMax <= 100 ? 20 : yMax <= 300 ? 50 : 100;
      const ticks = [];
      for (let v = 0; v <= yMax; v += step) ticks.push(v);
      return ticks;
    }
    // Zone 1: $0-500 at $100 intervals
    const lower = [0, 100, 200, 300, 400, 500];
    // Zone 2: adaptive ticks above $500
    const upper: number[] = [];
    const upperStep = yMax <= 5000 ? 1000 : yMax <= 15000 ? 2500 : 5000;
    for (let v = upperStep; v <= yMax; v += upperStep) {
      if (v > Y_BREAK) upper.push(v);
    }
    // Always include yMax if it's the price cap
    if (yMax >= 15000 && !upper.includes(yMax)) upper.push(yMax);
    return [...lower, ...upper];
  }, [yMax, usePiecewise]);

  // X-axis ticks
  const xTicks = useMemo(() => {
    const step = totalMW <= 500 ? 100 : totalMW <= 2000 ? 200 : 500;
    const ticks = [];
    for (let v = 0; v <= totalMW; v += step) ticks.push(v);
    return ticks;
  }, [totalMW]);

  // Narrative text
  const narrative = useMemo(() => {
    if (isIntroStep) {
      return {
        title: 'Market Opens',
        text: `The market has ${formatMW(demandMW)} of demand to fill. Bids are sorted from cheapest to most expensive — this is the merit order.`,
        highlight: 'info',
      };
    }

    if (isFinalStep) {
      const clearingPrice = periodResult?.clearingPriceMWh || 0;
      return {
        title: 'Clearing Price Set!',
        text: `The clearing price is $${formatNumber(clearingPrice)}/MWh. Every dispatched generator earns this price — not their bid price. This is how the NEM's uniform pricing works.`,
        highlight: 'success',
      };
    }

    if (currentBand) {
      const priceLabel = currentBand.bidPriceMWh === 0
        ? '$0/MWh (price taker)'
        : `$${formatNumber(currentBand.bidPriceMWh)}/MWh`;

      if (currentBand.isMarginal) {
        return {
          title: `Marginal Unit!`,
          text: `${currentBand.teamName}'s ${currentBand.assetName} (bid ${priceLabel}, ${currentBand.offeredMW} MW) is the marginal unit — it's the last generator needed to meet demand. Its bid price sets the clearing price for ALL generators!`,
          highlight: 'marginal',
        };
      }

      if (currentBand.isDispatched) {
        return {
          title: currentBand.bidPriceMWh === 0 ? 'Price Taker Dispatched' : 'Bid Dispatched',
          text: `${currentBand.teamName}'s ${currentBand.assetName} bids ${priceLabel} for ${currentBand.offeredMW} MW. Cumulative supply: ${formatMW(cumulativeMW)}${demandMW > 0 ? ` (${Math.round((cumulativeMW / demandMW) * 100)}% of demand)` : ''}.`,
          highlight: 'dispatched',
        };
      } else {
        return {
          title: 'Not Dispatched',
          text: `${currentBand.teamName}'s ${currentBand.assetName} bids ${priceLabel} for ${currentBand.offeredMW} MW — but demand is already met. This unit earns nothing.`,
          highlight: 'undispatched',
        };
      }
    }

    return { title: '', text: '', highlight: 'info' };
  }, [currentStep, isIntroStep, isFinalStep, currentBand, cumulativeMW, demandMW, periodResult]);

  // Adaptive step interval based on band count
  const stepInterval = useMemo(() => getStepInterval(allBands.length), [allBands.length]);

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, stepInterval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSteps, stepInterval]);

  // Reset when period changes — jump to end if startAtEnd, otherwise start from beginning
  useEffect(() => {
    setCurrentStep(startAtEnd ? allBands.length + 1 : 0);
    setIsPlaying(false);
  }, [selectedPeriod, startAtEnd, allBands.length]);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1);
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }, [currentStep]);

  const togglePlay = useCallback(() => {
    if (isFinalStep) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(p => !p);
    }
  }, [isFinalStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  if (!periodResult) {
    return <div className="text-navy-400 text-center py-8">No dispatch data available</div>;
  }

  return (
    <div className="space-y-4">
      {/* Period selector */}
      {periodResults.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {periodResults.map(pr => (
            <button
              key={pr.timePeriod}
              onClick={() => setSelectedPeriod(pr.timePeriod as TimePeriod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedPeriod === pr.timePeriod
                  ? 'bg-electric-500/20 text-electric-300 border border-electric-500/30'
                  : 'bg-white/10 text-navy-300 hover:bg-white/20'
              }`}
            >
              {TIME_PERIOD_SHORT_LABELS[pr.timePeriod as TimePeriod] || pr.timePeriod}
            </button>
          ))}
        </div>
      )}

      {/* Info bar */}
      <div className="flex items-center gap-4 text-sm text-navy-300">
        <span>Demand: <strong className="text-red-400 font-mono">{formatMW(demandMW)}</strong></span>
        {showClearingPrice && (
          <span>Clearing Price: <strong className="text-yellow-400 font-mono">${formatNumber(periodResult.clearingPriceMWh)}/MWh</strong></span>
        )}
        <span>Supply shown: <strong className="text-electric-300 font-mono">{formatMW(cumulativeMW)}</strong></span>
      </div>

      {/* Chart - custom SVG */}
      <div ref={containerRef} className="bg-navy-900/50 border border-white/10 rounded-xl p-4">
        <svg width={chartWidth} height={CHART_HEIGHT} className="overflow-visible">
          {/* Grid lines */}
          {yTicks.map(v => (
            <g key={`y-${v}`}>
              <line
                x1={MARGIN.left} y1={yScale(v)}
                x2={MARGIN.left + plotW} y2={yScale(v)}
                stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3"
              />
              <text x={MARGIN.left - 8} y={yScale(v) + 4} textAnchor="end"
                fill="#a0aec0" fontSize={11}>${formatNumber(v)}</text>
            </g>
          ))}
          {xTicks.map(v => (
            <g key={`x-${v}`}>
              <line
                x1={xScale(v)} y1={MARGIN.top}
                x2={xScale(v)} y2={MARGIN.top + plotH}
                stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3"
              />
              <text x={xScale(v)} y={MARGIN.top + plotH + 16} textAnchor="middle"
                fill="#a0aec0" fontSize={11}>{v}</text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={MARGIN.left + plotW / 2} y={CHART_HEIGHT - 4}
            textAnchor="middle" fill="#a0aec0" fontSize={11}>Cumulative MW</text>
          <text x={14} y={MARGIN.top + plotH / 2}
            textAnchor="middle" fill="#a0aec0" fontSize={11}
            transform={`rotate(-90, 14, ${MARGIN.top + plotH / 2})`}>$/MWh</text>

          {/* Axes */}
          <line x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + plotH}
            stroke="rgba(255,255,255,0.2)" />
          <line x1={MARGIN.left} y1={MARGIN.top + plotH} x2={MARGIN.left + plotW} y2={MARGIN.top + plotH}
            stroke="rgba(255,255,255,0.2)" />

          {/* Axis break indicator (zigzag) when piecewise scale is active */}
          {usePiecewise && (() => {
            const breakY = yScale(Y_BREAK);
            const zigW = 8;
            const zigH = 6;
            const x0 = MARGIN.left - zigW;
            const x1 = MARGIN.left + zigW;
            return (
              <g>
                {/* White background to mask the axis line */}
                <rect x={x0 - 2} y={breakY - zigH - 2} width={x1 - x0 + 4} height={zigH * 2 + 4}
                  fill="#0f1729" />
                {/* Zigzag path */}
                <path
                  d={`M${x0},${breakY - zigH} L${MARGIN.left},${breakY - zigH / 2} L${x0},${breakY} L${MARGIN.left},${breakY + zigH / 2} L${x0},${breakY + zigH}`}
                  stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} fill="none"
                />
                {/* Dashed line across the chart at break point */}
                <line x1={MARGIN.left} y1={breakY} x2={MARGIN.left + plotW} y2={breakY}
                  stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" strokeWidth={1} />
                <text x={MARGIN.left + plotW + 4} y={breakY + 3}
                  fill="rgba(255,255,255,0.3)" fontSize={9} textAnchor="start">scale break</text>
              </g>
            );
          })()}

          {/* Team separator labels when many bands */}
          {allBands.length > 30 && (() => {
            // Group visible bands by team and show team name above their group
            const teamGroups: { teamName: string; startMW: number; endMW: number; color: string }[] = [];
            let groupStart = 0;
            let lastTeamId = '';
            for (let i = 0; i < Math.min(visibleBandCount, allBands.length); i++) {
              const band = allBands[i];
              if (band.teamId !== lastTeamId) {
                if (lastTeamId && i > 0) {
                  const prev = allBands[i - 1];
                  teamGroups.push({
                    teamName: prev.teamName,
                    startMW: groupStart,
                    endMW: prev.cumulativeMW + prev.offeredMW,
                    color: prev.color,
                  });
                }
                groupStart = band.cumulativeMW;
                lastTeamId = band.teamId;
              }
            }
            // Push last group
            if (visibleBandCount > 0 && lastTeamId) {
              const last = allBands[Math.min(visibleBandCount - 1, allBands.length - 1)];
              teamGroups.push({
                teamName: last.teamName,
                startMW: groupStart,
                endMW: last.cumulativeMW + last.offeredMW,
                color: last.color,
              });
            }
            return teamGroups.map((g, i) => {
              const midX = xScale((g.startMW + g.endMW) / 2);
              const groupW = xScale(g.endMW) - xScale(g.startMW);
              // Only show label if group is wide enough
              if (groupW < 30) return null;
              return (
                <g key={`team-sep-${i}`}>
                  {/* Separator line at group boundary */}
                  {i > 0 && (
                    <line x1={xScale(g.startMW)} y1={MARGIN.top + plotH - 5}
                      x2={xScale(g.startMW)} y2={MARGIN.top + plotH + 3}
                      stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
                  )}
                  {/* Team name below x-axis */}
                  <text x={midX} y={MARGIN.top + plotH + 30}
                    textAnchor="middle" fill={g.color} fontSize={8} fontWeight="bold"
                    opacity={0.7}
                  >
                    {g.teamName.length > 8 ? g.teamName.slice(0, 7) + '…' : g.teamName}
                  </text>
                </g>
              );
            });
          })()}

          {/* Demand line (always visible) */}
          <line
            x1={xScale(demandMW)} y1={MARGIN.top - 5}
            x2={xScale(demandMW)} y2={MARGIN.top + plotH + 5}
            stroke="#e53e3e" strokeDasharray="5 5" strokeWidth={2}
          />
          <text x={xScale(demandMW)} y={MARGIN.top - 8}
            textAnchor="middle" fill="#fc8181" fontSize={10}>
            Demand {formatMW(demandMW)}
          </text>

          {/* Clearing price line */}
          {showClearingPrice && (
            <>
              <line
                x1={MARGIN.left - 5} y1={yScale(periodResult.clearingPriceMWh)}
                x2={MARGIN.left + plotW + 5} y2={yScale(periodResult.clearingPriceMWh)}
                stroke="#ecc94b" strokeDasharray="5 5" strokeWidth={2}
              />
              <text x={MARGIN.left + plotW + 8} y={yScale(periodResult.clearingPriceMWh) + 4}
                textAnchor="start" fill="#ecc94b" fontSize={11}>
                ${formatNumber(periodResult.clearingPriceMWh)}/MWh
              </text>
            </>
          )}

          {/* Bid bars — width proportional to MW, height proportional to price */}
          {chartData.map((band, idx) => {
            const x = xScale(band.cumulativeMW);
            const w = Math.max((band.offeredMW / totalMW) * plotW, 2); // min 2px width
            const isCurrentBand = idx === visibleBandCount - 1;
            const isZeroPrice = band.bidPriceMWh === 0;

            // For $0 bids: use a minimum visual height so they're visible
            const barBottom = MARGIN.top + plotH;
            const barTop = yScale(band.bidPriceMWh);
            const priceBarH = barBottom - barTop;
            const barH = Math.max(priceBarH, MIN_BAR_HEIGHT_PX);
            const barY = barBottom - barH;

            const fillOpacity = band.isDispatched ? 1 : 0.2;
            const fill = band.color;

            let strokeColor = 'transparent';
            let strokeWidth = 0;
            if (band.isMarginal) { strokeColor = '#ecc94b'; strokeWidth = 3; }
            else if (isCurrentBand) { strokeColor = '#fff'; strokeWidth = 2; }

            return (
              <g key={`band-${idx}`}
                onMouseEnter={() => setHoveredBand(idx)}
                onMouseLeave={() => setHoveredBand(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x} y={barY} width={w} height={barH}
                  fill={fill} fillOpacity={fillOpacity}
                  stroke={strokeColor} strokeWidth={strokeWidth}
                  rx={1}
                />

                {/* $0 bid indicator — dashed top border + label */}
                {isZeroPrice && (
                  <>
                    <line
                      x1={x} y1={barY}
                      x2={x + w} y2={barY}
                      stroke={fill} strokeWidth={2} strokeDasharray="3 2"
                    />
                    {w > 20 && (
                      <text
                        x={x + w / 2} y={barY + barH / 2 + 3}
                        textAnchor="middle" fill="white" fontSize={9} fontWeight="bold"
                      >$0</text>
                    )}
                  </>
                )}

                {/* Label on wide-enough bars */}
                {!isZeroPrice && w > 35 && barH > 18 && (
                  <text
                    x={x + w / 2} y={barY + Math.min(barH / 2 + 4, barH - 4)}
                    textAnchor="middle" fill="white" fontSize={9} fontWeight="bold"
                    opacity={0.9}
                  >
                    ${formatNumber(band.bidPriceMWh)}
                  </text>
                )}

                {/* Marginal star */}
                {band.isMarginal && (
                  <text x={x + w / 2} y={barY - 6} textAnchor="middle" fontSize={14}>⭐</text>
                )}
              </g>
            );
          })}

          {/* Tooltip on hover */}
          {hoveredBand !== null && chartData[hoveredBand] && (() => {
            const d = chartData[hoveredBand];
            const tipX = Math.min(xScale(d.cumulativeMW + d.offeredMW / 2), chartWidth - 180);
            const tipY = Math.max(yScale(d.bidPriceMWh) - 90, 5);
            return (
              <foreignObject x={tipX - 75} y={tipY} width={170} height={90}>
                <div className="bg-navy-800 border border-white/20 rounded-lg p-2 shadow-xl text-xs pointer-events-none">
                  <div className="font-semibold text-white">{d.teamName}</div>
                  <div className="text-navy-300">{d.assetName} ({d.assetType})</div>
                  <div className="text-electric-300 mt-0.5">Bid: <span className="font-mono">${formatNumber(d.bidPriceMWh)}/MWh</span></div>
                  <div className="text-navy-300">Offered: <span className="font-mono">{formatNumber(d.offeredMW)} MW</span></div>
                  {d.isMarginal && <div className="text-amber-400 font-bold">Sets the clearing price!</div>}
                </div>
              </foreignObject>
            );
          })()}
        </svg>
      </div>

      {/* Narrative */}
      <div className={`rounded-xl p-4 border transition-all ${
        narrative.highlight === 'marginal' ? 'bg-amber-500/10 border-amber-500/30' :
        narrative.highlight === 'success' ? 'bg-green-500/10 border-green-500/30' :
        narrative.highlight === 'undispatched' ? 'bg-red-500/10 border-red-500/30' :
        narrative.highlight === 'dispatched' ? 'bg-blue-500/10 border-blue-500/30' :
        'bg-white/5 border-white/10'
      }`}>
        <div className={`text-sm font-bold mb-1 ${
          narrative.highlight === 'marginal' ? 'text-amber-300' :
          narrative.highlight === 'success' ? 'text-green-300' :
          narrative.highlight === 'undispatched' ? 'text-red-300' :
          narrative.highlight === 'dispatched' ? 'text-blue-300' :
          'text-white'
        }`}>
          {narrative.highlight === 'marginal' ? '⭐ ' : ''}{narrative.title}
        </div>
        <p className="text-sm text-navy-200 leading-relaxed">{narrative.text}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={togglePlay}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-electric-500/20 text-electric-300 hover:bg-electric-500/30'
            }`}
          >
            {isPlaying ? '⏸ Pause' : isFinalStep ? '↻ Replay' : '▶ Play'}
          </button>
          <button
            onClick={goNext}
            disabled={isFinalStep}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            onClick={() => { setIsPlaying(false); setCurrentStep(totalSteps - 1); }}
            disabled={isFinalStep}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-navy-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Skip to clearing price reveal"
          >
            Skip to End ⏭
          </button>
        </div>

        <div className="text-xs text-navy-400">
          Step {currentStep + 1} of {totalSteps}
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="w-32 bg-navy-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-electric-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>

          {/* Next Period button */}
          {periodResults.length > 1 && (() => {
            const currentIdx = periodResults.findIndex(pr => pr.timePeriod === selectedPeriod);
            const nextIdx = currentIdx + 1;
            const isLast = nextIdx >= periodResults.length;
            const nextPeriod = !isLast ? periodResults[nextIdx] : null;
            return (
              <button
                onClick={() => {
                  if (nextPeriod) {
                    setIsPlaying(false);
                    setSelectedPeriod(nextPeriod.timePeriod as TimePeriod);
                  }
                }}
                disabled={isLast}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLast
                  ? 'Last Period'
                  : `${TIME_PERIOD_SHORT_LABELS[(nextPeriod!.timePeriod as TimePeriod)] || nextPeriod!.timePeriod} →`}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
