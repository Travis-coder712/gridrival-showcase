import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { formatCurrency, formatMW, formatPrice, formatNumber } from '../../lib/formatters';
import { ASSET_ICONS, ASSET_COLORS } from '../../lib/colors';
import type {
  AssetBid, AssetInfo, BidBand, TeamAssetInstance, TimePeriod,
  AssetType, TeamBidSubmission, WalkthroughSuggestedBid,
  TeamAnalysis, RoundAnalysis, AssetPerformanceSummary,
  AssetCategoryBreakdown,
} from '../../../shared/types';
import {
  TIME_PERIOD_SHORT_LABELS, TIME_PERIOD_TIME_RANGES,
  ASSET_TYPE_LABELS, SEASON_LABELS, getPeriodDescriptions,
} from '../../../shared/types';
import {
  STRATEGIES, generateStrategyBids, getAvailableStrategies,
  type StrategyId, type Intensity,
} from '../../lib/bidding-strategies';
import BidReviewModal from '../../components/game/BidReviewModal';
import MeritOrderWalkthrough from '../../components/charts/MeritOrderWalkthrough';
import StrategyGuide from '../../components/game/StrategyGuide';
import HowToBidTutorial from '../../components/game/HowToBidTutorial';
import CommonMistakes from '../../components/game/CommonMistakes';
import RoundBriefing from '../../components/host/RoundBriefing';
import GameStartTransition from '../../components/transitions/GameStartTransition';
import RoundStartTransition from '../../components/transitions/RoundStartTransition';
import GuidedBiddingView from '../../components/game/GuidedBiddingView';
import QuickRecapCard from '../../components/game/QuickRecapCard';
import PriceHistoryChart from '../../components/game/PriceHistoryChart';
import NextRoundPreview from '../../components/game/NextRoundPreview';
import SoundToggle from '../../components/game/SoundToggle';
import DarkModeToggle from '../../components/game/DarkModeToggle';
import AudioManager from '../../lib/AudioManager';
import BatteryExplainer from '../../components/game/BatteryExplainer';
import BatteryArbitrageMiniGame from '../../components/game/BatteryArbitrageMiniGame';
import BatteryBiddingExplainer from '../../components/game/BatteryBiddingExplainer';
import PortfolioExplainer from '../../components/game/PortfolioExplainer';
import ZeroCapacityWarningModal from '../../components/game/ZeroCapacityWarningModal';
import RoundBiddingGuide from '../../components/game/RoundBiddingGuide';
import type { BatteryMode, RoundConfig } from '../../../shared/types';

export default function TeamGame() {
  const navigate = useNavigate();
  const {
    gameState, connected, reconnecting, biddingTimeRemaining, timerPaused, roundResults,
    submitBids, notifyMinigameCompleted, requestState, clearSession,
  } = useSocket();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('day_peak');
  const [bids, setBids] = useState<Map<string, AssetBid>>(new Map()); // key: assetId_period
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showBidReview, setShowBidReview] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showStrategyGuide, setShowStrategyGuide] = useState(false);
  const [showHowToBid, setShowHowToBid] = useState(false);
  const [showRoundBriefing, setShowRoundBriefing] = useState(false);
  const [showCommonMistakes, setShowCommonMistakes] = useState(false);
  const [showBatteryExplainer, setShowBatteryExplainer] = useState(false);
  const [showPortfolioExplainer, setShowPortfolioExplainer] = useState(false);
  const [showBatteryMiniGame, setShowBatteryMiniGame] = useState(false);
  const [batteryMiniGameCompleted, setBatteryMiniGameCompleted] = useState(false);
  const [batteryModes, setBatteryModes] = useState<Map<string, BatteryMode>>(new Map()); // key: assetId_period
  const [chargeMWs, setChargeMWs] = useState<Map<string, number>>(new Map()); // key: assetId_period
  const [hydroDispatchPeriods, setHydroDispatchPeriods] = useState<Map<string, TimePeriod | null>>(new Map()); // assetId -> selected period
  const [hydroBidPrices, setHydroBidPrices] = useState<Map<string, number>>(new Map()); // assetId -> bid price
  const [strategyApplyScope, setStrategyApplyScope] = useState<'current_period' | 'all_periods'>('current_period');
  const [showBatteryBiddingExplainer, setShowBatteryBiddingExplainer] = useState(false);
  const [useGuidedView, setUseGuidedView] = useState(true); // default to guided step-by-step view
  const [zeroCapWarning, setZeroCapWarning] = useState<{ assetName: string; period: string }[] | null>(null);

  // Derive these early so hooks below can reference them safely (avoids temporal dead zone)
  const team = gameState?.myTeam;
  const phase = gameState?.phase;
  const roundConfig = gameState?.roundConfig;
  const assets = team?.assets || [];
  const walkthrough = roundConfig?.walkthrough;
  const assetDefs: AssetInfo[] = (gameState as any)?.myAssetDefs || [];

  useEffect(() => {
    // Only redirect to join if we don't have a team AND we're not reconnecting
    // Also check sessionStorage - if we have saved credentials, wait for reconnection
    const savedTeamId = sessionStorage.getItem('nem_team_id');
    if (!gameState?.myTeam && !reconnecting && !savedTeamId) {
      navigate('/team/join');
    }
  }, [gameState, navigate, reconnecting]);

  const [walkthroughApplied, setWalkthroughApplied] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId | ''>('');
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>('medium');
  const [strategyApplyMode, setStrategyApplyMode] = useState<'all' | 'selected'>('all');
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());

  // Transition overlays — driven by watching gameState.phase changes.
  // We track which phase+round combos we've already shown to prevent replays.
  const [showGameStart, setShowGameStart] = useState(false);
  const [showRoundStart, setShowRoundStart] = useState(false);
  const shownTransitionsRef = useRef<Set<string>>(new Set());
  const prevPhaseRef = useRef<string | null>(null);

  // Round Bidding Guide — tracks previous round config to detect changes
  const [showRoundBiddingGuide, setShowRoundBiddingGuide] = useState(false);
  const prevRoundConfigRef = useRef<RoundConfig | null>(null);
  const currentRoundForGuideRef = useRef<number>(0);

  useEffect(() => {
    const phase = gameState?.phase;
    const round = gameState?.currentRound ?? 0;
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = phase ?? null;

    // Skip the very first render (no previous phase to compare)
    if (!prevPhase || !phase || prevPhase === phase) return;

    const key = `${prevPhase}->${phase}:r${round}`;
    if (shownTransitionsRef.current.has(key)) return;
    shownTransitionsRef.current.add(key);

    if (prevPhase === 'lobby' && phase === 'briefing') {
      setShowGameStart(true);
    } else if (prevPhase === 'briefing' && phase === 'bidding') {
      setShowRoundStart(true);
    } else if (prevPhase === 'results' && phase === 'briefing') {
      setShowRoundStart(true);
    }
  }, [gameState?.phase, gameState?.currentRound]);

  // Audio: countdown beeps during last 10 seconds
  const prevTimeRef = useRef<number>(0);
  useEffect(() => {
    if (phase === 'bidding' && biddingTimeRemaining <= 10 && biddingTimeRemaining > 0 && !timerPaused) {
      if (biddingTimeRemaining !== prevTimeRef.current) {
        AudioManager.countdownBeep(biddingTimeRemaining);
        prevTimeRef.current = biddingTimeRemaining;
      }
    }
  }, [biddingTimeRemaining, phase, timerPaused]);

  // Audio: phase change sounds
  useEffect(() => {
    if (phase === 'bidding') AudioManager.roundStart();
    else if (phase === 'results') AudioManager.clearingPriceReveal();
    else if (phase === 'final') AudioManager.gameOver();
  }, [phase]);

  // Show Round Bidding Guide when bidding phase starts
  useEffect(() => {
    const currentRound = gameState?.currentRound ?? 0;
    if (phase === 'bidding' && roundConfig && currentRound !== currentRoundForGuideRef.current) {
      currentRoundForGuideRef.current = currentRound;
      setShowRoundBiddingGuide(true);
    }
    // Update previous round config when leaving bidding/results (for next round comparison)
    if (phase === 'results' && roundConfig) {
      prevRoundConfigRef.current = roundConfig;
    }
  }, [phase, gameState?.currentRound, roundConfig]);

  // Reset bids when new round starts
  useEffect(() => {
    if (gameState?.phase === 'bidding' || gameState?.phase === 'briefing') {
      setBids(new Map());
      setSubmitted(false);
      setShowResults(false);
      setWalkthroughApplied(false);
      setSelectedStrategy('');
      setStrategyOpen(false);
      setStrategyApplyMode('all');
      setSelectedAssetIds(new Set());
      setBatteryModes(new Map());
      setChargeMWs(new Map());
      setHydroDispatchPeriods(new Map());
      setHydroBidPrices(new Map());
      setStrategyApplyScope('current_period');
    }
    if (gameState?.phase === 'results') {
      setShowResults(true);
    }
  }, [gameState?.phase, gameState?.currentRound]);

  // Show battery mini-game at the start of the briefing phase (before normal briefing content)
  useEffect(() => {
    if (gameState?.phase === 'briefing' && roundConfig?.batteryMiniGame && !batteryMiniGameCompleted && !showBatteryMiniGame) {
      setShowBatteryMiniGame(true);
    }
  }, [gameState?.phase, roundConfig?.batteryMiniGame, batteryMiniGameCompleted]);

  // Show portfolio explainer at the start of the briefing phase when round config includes it
  const [portfolioExplainerCompleted, setPortfolioExplainerCompleted] = useState(false);
  useEffect(() => {
    if (gameState?.phase === 'briefing' && roundConfig?.portfolioExplainer && !portfolioExplainerCompleted && !showPortfolioExplainer) {
      setShowPortfolioExplainer(true);
    }
  }, [gameState?.phase, roundConfig?.portfolioExplainer, portfolioExplainerCompleted]);

  // Set default selected period
  useEffect(() => {
    if (gameState?.roundConfig?.timePeriods) {
      const periods = gameState.roundConfig.timePeriods;
      if (!periods.includes(selectedPeriod) && periods.length > 0) {
        setSelectedPeriod(periods[0] as TimePeriod);
      }
    }
  }, [gameState?.roundConfig]);

  // team, phase, roundConfig, assets, walkthrough, assetDefs already derived above for hooks

  // Helper: get asset def info (SRMC, name) for an asset instance
  const getAssetDef = (assetId: string): AssetInfo | undefined =>
    assetDefs.find(d => d.id === assetId);

  // Compute available asset types for period descriptions
  const availableAssetTypes = useMemo(() => {
    const types = new Set<AssetType>();
    for (const a of assets) {
      const def = getAssetDef(a.assetDefinitionId);
      if (def) types.add(def.type);
    }
    return Array.from(types);
  }, [assets, assetDefs]);

  // Check if team has a battery asset
  const hasBattery = useMemo(() => {
    return assets.some(a => {
      const def = getAssetDef(a.assetDefinitionId);
      return def?.type === 'battery';
    });
  }, [assets, assetDefs]);

  // Check if team has 3+ unique asset types (portfolio diversity worth explaining)
  const hasPortfolio = useMemo(() => {
    const types = new Set(assets.map(a => getAssetDef(a.assetDefinitionId)?.type).filter(Boolean));
    return types.size >= 3;
  }, [assets, assetDefs]);

  // Filter strategies to only show ones relevant to the team's current asset types
  const filteredStrategies = useMemo(() => {
    return getAvailableStrategies(availableAssetTypes);
  }, [availableAssetTypes]);

  // Auto-populate walkthrough bids when entering bidding phase
  useEffect(() => {
    if (phase === 'bidding' && walkthrough && team && assets.length > 0 && !walkthroughApplied) {
      setWalkthroughApplied(true);
      const newBids = new Map<string, AssetBid>();

      // Group suggested bids by asset type and period
      const bidsByPeriod = new Map<string, WalkthroughSuggestedBid[]>();
      for (const suggestion of walkthrough.suggestedBids) {
        const key = `${suggestion.assetType}_${suggestion.period}`;
        if (!bidsByPeriod.has(key)) bidsByPeriod.set(key, []);
        bidsByPeriod.get(key)!.push(suggestion);
      }

      for (const asset of assets) {
        const typeKey = asset.assetDefinitionId.split('_')[0] as AssetType;
        const fullTypeKey = asset.assetDefinitionId.includes('ccgt') ? 'gas_ccgt' :
                            asset.assetDefinitionId.includes('peaker') ? 'gas_peaker' : typeKey;

        for (const period of (roundConfig?.timePeriods || [])) {
          const suggestions = bidsByPeriod.get(`${fullTypeKey}_${period}`) || bidsByPeriod.get(`${typeKey}_${period}`);
          if (!suggestions || suggestions.length === 0) continue;

          const bands: BidBand[] = suggestions.map(s => ({
            pricePerMWh: s.suggestedPrice,
            quantityMW: Math.round(asset.currentAvailableMW * s.suggestedQuantityPercent / 100),
          }));

          const bidKey = `${asset.assetDefinitionId}_${period}`;
          newBids.set(bidKey, {
            assetInstanceId: `${asset.assetDefinitionId}_${team.id}`,
            assetDefinitionId: asset.assetDefinitionId,
            teamId: team.id,
            timePeriod: period as TimePeriod,
            bands,
            totalOfferedMW: bands.reduce((s, b) => s + b.quantityMW, 0),
            submittedAt: Date.now(),
          });
        }
      }

      if (newBids.size > 0) {
        setBids(newBids);
      }
    }
  }, [phase, walkthrough, team, assets, walkthroughApplied, roundConfig?.timePeriods]);

  // Auto-populate renewable bids (always $0, capacity-factor-adjusted)
  useEffect(() => {
    if (phase !== 'bidding' || !team || !roundConfig || assetDefs.length === 0) return;

    const newBids = new Map(bids);
    let changed = false;

    for (const asset of assets) {
      const def = getAssetDef(asset.assetDefinitionId);
      if (!def || (def.type !== 'wind' && def.type !== 'solar')) continue;

      for (const period of roundConfig.timePeriods) {
        const availMW = def.availabilityByPeriod?.[period] ?? 0;
        const key = getBidKey(asset.assetDefinitionId, period as TimePeriod);

        // Don't overwrite if walkthrough already set bids
        if (newBids.has(key)) continue;

        newBids.set(key, {
          assetInstanceId: `${asset.assetDefinitionId}_${team.id}`,
          assetDefinitionId: asset.assetDefinitionId,
          teamId: team.id,
          timePeriod: period as TimePeriod,
          bands: availMW > 0 ? [{ pricePerMWh: 0, quantityMW: availMW }] : [],
          totalOfferedMW: availMW,
          isAutoRenewableBid: true,
          renewableCapacityMW: availMW,
          submittedAt: Date.now(),
        });
        changed = true;
      }
    }

    if (changed) setBids(newBids);
  }, [phase, team?.id, roundConfig?.timePeriods, assetDefs.length]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Get or create bids for an asset in a period
  const getBidKey = (assetId: string, period: TimePeriod) => `${assetId}_${period}`;

  const getBidBands = (assetId: string, period: TimePeriod): BidBand[] => {
    const key = getBidKey(assetId, period);
    return bids.get(key)?.bands || [{ pricePerMWh: 0, quantityMW: 0 }];
  };

  const updateBand = (assetId: string, period: TimePeriod, bandIndex: number, field: 'pricePerMWh' | 'quantityMW', value: number) => {
    const key = getBidKey(assetId, period);
    const existing = bids.get(key);
    const bands = existing?.bands ? [...existing.bands] : [{ pricePerMWh: 0, quantityMW: 0 }];

    if (bandIndex >= bands.length) {
      bands.push({ pricePerMWh: 0, quantityMW: 0 });
    }

    bands[bandIndex] = { ...bands[bandIndex], [field]: value };

    const newBid: AssetBid = {
      assetInstanceId: `${assetId}_${team?.id}`,
      assetDefinitionId: assetId,
      teamId: team?.id || '',
      timePeriod: period,
      bands: bands.filter(b => b.quantityMW > 0 || b.pricePerMWh !== 0),
      totalOfferedMW: bands.reduce((sum, b) => sum + (b.quantityMW || 0), 0),
      submittedAt: Date.now(),
    };

    setBids(new Map(bids.set(key, newBid)));
  };

  const addBand = (assetId: string, period: TimePeriod) => {
    const key = getBidKey(assetId, period);
    const existing = bids.get(key);
    const bands = existing?.bands ? [...existing.bands] : [];
    const maxBands = roundConfig?.maxBidBandsPerAsset || 10;
    if (bands.length >= maxBands) return;
    bands.push({ pricePerMWh: 0, quantityMW: 0 });

    const newBid: AssetBid = {
      ...existing!,
      assetInstanceId: `${assetId}_${team?.id}`,
      assetDefinitionId: assetId,
      teamId: team?.id || '',
      timePeriod: period,
      bands,
      totalOfferedMW: bands.reduce((s, b) => s + (b.quantityMW || 0), 0),
      submittedAt: Date.now(),
    };

    setBids(new Map(bids.set(key, newBid)));
  };

  const applyQuickBid = (assetId: string, period: TimePeriod, strategy: 'zero' | 'srmc' | 'high') => {
    const asset = assets.find(a => a.assetDefinitionId === assetId);
    if (!asset) return;

    const maxMW = asset.currentAvailableMW;
    let price = 0;

    if (strategy === 'srmc') {
      // Use actual SRMC from server-provided asset definitions
      const def = getAssetDef(assetId);
      if (def) {
        price = def.srmcPerMWh;
      } else {
        // Fallback if no def available
        const typeDefaults: Record<string, number> = {
          coal: 35, gas_ccgt: 75, gas_peaker: 140, hydro: 8, wind: 0, solar: 0, battery: 0,
        };
        const assetType = assetId.split('_')[0] + (assetId.includes('ccgt') ? '_ccgt' : assetId.includes('peaker') ? '_peaker' : '');
        price = typeDefaults[assetType] || typeDefaults[assetId.split('_')[0]] || 30;
      }
    } else if (strategy === 'high') {
      price = 500;
    }

    const key = getBidKey(assetId, period);
    const newBid: AssetBid = {
      assetInstanceId: `${assetId}_${team?.id}`,
      assetDefinitionId: assetId,
      teamId: team?.id || '',
      timePeriod: period,
      bands: [{ pricePerMWh: price, quantityMW: maxMW }],
      totalOfferedMW: maxMW,
      submittedAt: Date.now(),
    };

    setBids(new Map(bids.set(key, newBid)));
  };

  // Apply a strategy — either to all assets or only selected ones
  // applyMode/assetIdsParam passed from GuidedBiddingView (auto-apply), falls back to local state for classic view
  const applyStrategy = (stratId: StrategyId, intens: Intensity, applyMode?: 'all' | 'selected', assetIdsParam?: Set<string>) => {
    if (!team || !roundConfig) return;
    // Always apply to all periods (guided view shows all periods at once)
    const periods = roundConfig.timePeriods as TimePeriod[];
    const generatedBids = generateStrategyBids(stratId, intens, assets, team.id, periods);

    // Only apply strategy bids for thermal assets — preserve battery/hydro/renewable bids
    const mode = applyMode ?? strategyApplyMode;
    const ids = assetIdsParam ?? selectedAssetIds;
    const mergedBids = new Map(bids);
    for (const [key, bid] of generatedBids) {
      const def = getAssetDef(bid.assetDefinitionId);
      // Skip non-thermal assets
      if (def?.type === 'wind' || def?.type === 'solar' || def?.type === 'battery' || def?.type === 'hydro') continue;

      if (mode === 'all' || ids.has(bid.assetDefinitionId)) {
        mergedBids.set(key, bid);
      }
    }
    setBids(mergedBids);
    setSelectedStrategy(stratId);
    setSelectedIntensity(intens);
  };

  /** Core submission logic — stamps bids and sends to server */
  const proceedWithSubmit = (skipZeroCapCheck?: boolean) => {
    if (!team || !roundConfig) return;

    // Collect all bids — include zero-MW bids so idle assets are submitted correctly
    const allBids: AssetBid[] = [];
    for (const period of roundConfig.timePeriods) {
      for (const asset of assets) {
        const key = getBidKey(asset.assetDefinitionId, period as TimePeriod);
        const bid = bids.get(key);
        if (bid) {
          allBids.push(bid);
        }
      }
    }

    // ALWAYS-ON CHECK: Warn if any thermal asset has 0 MW in any period
    // (This is almost always a mistake that triggers the $20,000 price cap)
    if (!skipZeroCapCheck) {
      const missingBidsList: { assetName: string; period: string }[] = [];
      for (const period of roundConfig.timePeriods) {
        for (const asset of assets) {
          const def = assetDefs.find(d => d.id === asset.assetDefinitionId);
          // Skip batteries — they can charge, discharge, or sit idle
          if (def?.type === 'battery') continue;
          // Skip renewables — they are auto-bid
          if (def?.type === 'wind' || def?.type === 'solar') continue;
          // Skip hydro — only dispatches in ONE period by design
          if (def?.type === 'hydro') continue;
          const key = getBidKey(asset.assetDefinitionId, period as TimePeriod);
          const bid = bids.get(key);
          const totalOffered = bid ? bid.bands.reduce((sum, b) => sum + b.quantityMW, 0) : 0;
          if (totalOffered <= 0) {
            const periodLabel = period === 'night_offpeak' ? 'Overnight' : period === 'day_offpeak' ? 'Morning' : period === 'day_peak' ? 'Afternoon' : 'Evening';
            missingBidsList.push({
              assetName: def?.name || asset.assetDefinitionId,
              period: periodLabel,
            });
          }
        }
      }

      if (missingBidsList.length > 0) {
        setZeroCapWarning(missingBidsList);
        return;
      }
    }

    // GUARDRAILS (only when enabled): warn about risky strategies (soft warnings, not hard blocks)
    if (gameState?.biddingGuardrailEnabled) {
      // Warn if too much capacity bid at $0 (risk of $0 clearing price)
      let totalCapacity = 0;
      let totalAtZero = 0;
      for (const bid of allBids) {
        for (const band of bid.bands) {
          if (band.quantityMW > 0) {
            totalCapacity += band.quantityMW;
            if (band.pricePerMWh <= 0) {
              totalAtZero += band.quantityMW;
            }
          }
        }
      }
      // Don't count renewable auto-bids in the $0 percentage warning
      let renewableZeroMW = 0;
      for (const bid of allBids) {
        if (bid.isAutoRenewableBid) {
          for (const band of bid.bands) {
            if (band.quantityMW > 0 && band.pricePerMWh <= 0) {
              renewableZeroMW += band.quantityMW;
            }
          }
        }
      }
      const adjustedAtZero = totalAtZero - renewableZeroMW;
      const adjustedCapacity = totalCapacity - renewableZeroMW;
      const zeroPercent = adjustedCapacity > 0 ? (adjustedAtZero / adjustedCapacity) * 100 : 0;
      if (zeroPercent > 60) {
        const proceed = window.confirm(
          `Warning: ${Math.round(zeroPercent)}% of your capacity is bid at $0/MWh or less.\n\n` +
          `If all teams do this, the clearing price will be $0 and nobody earns revenue.\n\n` +
          `Consider bidding some capacity at higher prices to set a meaningful clearing price.\n\n` +
          `Submit anyway?`
        );
        if (!proceed) return;
      }
    }

    // Stamp battery mode and charge info onto battery bids
    for (const bid of allBids) {
      const def = assetDefs.find(d => d.id === bid.assetDefinitionId);
      if (def?.type === 'battery') {
        const modeKey = `${bid.assetDefinitionId}_${bid.timePeriod}`;
        const mode = batteryModes.get(modeKey) || 'idle';
        bid.batteryMode = mode;
        if (mode === 'charge') {
          bid.isBatteryCharging = true;
          bid.chargeMW = chargeMWs.get(modeKey) || 0;
          bid.bands = []; // Charging bids don't have dispatch bands
          bid.totalOfferedMW = 0;
        } else if (mode === 'idle') {
          bid.bands = [];
          bid.totalOfferedMW = 0;
        }
        // discharge mode: bid.bands already set from normal bid inputs
      }
    }

    // Stamp hydro dispatch period onto hydro bids
    for (const bid of allBids) {
      const def = assetDefs.find(d => d.id === bid.assetDefinitionId);
      if (def?.type === 'hydro') {
        const selectedPeriod = hydroDispatchPeriods.get(bid.assetDefinitionId);
        bid.hydroDispatchPeriod = selectedPeriod || undefined;

        if (selectedPeriod && bid.timePeriod === selectedPeriod) {
          // This is the dispatch period: set the bid price and quantity
          const price = hydroBidPrices.get(bid.assetDefinitionId) ?? def.srmcPerMWh;
          const asset = assets.find(a => a.assetDefinitionId === bid.assetDefinitionId);
          const maxMW = asset?.currentAvailableMW ?? 0;
          // Cap by storage
          const storageMWh = asset?.currentStorageMWh ?? 0;
          const maxMWFromStorage = storageMWh > 0 ? storageMWh / 6 : maxMW;
          const effectiveMW = Math.min(maxMW, maxMWFromStorage);
          bid.bands = [{ pricePerMWh: price, quantityMW: Math.round(effectiveMW) }];
          bid.totalOfferedMW = Math.round(effectiveMW);
        } else {
          // Not the dispatch period: zero MW
          bid.bands = [];
          bid.totalOfferedMW = 0;
        }
      }
    }

    // Force renewable bid prices to $0 (client-side enforcement)
    for (const bid of allBids) {
      const def = assetDefs.find(d => d.id === bid.assetDefinitionId);
      if (def?.type === 'wind' || def?.type === 'solar') {
        for (const band of bid.bands) {
          band.pricePerMWh = 0;
        }
      }
    }

    const submission: TeamBidSubmission = {
      teamId: team.id,
      roundNumber: gameState?.currentRound || 0,
      bids: allBids,
      isComplete: true,
    };

    submitBids(submission);
    setSubmitted(true);
    setZeroCapWarning(null);
    AudioManager.bidSubmitted();
  };

  /** Entry point for bid submission — validates then calls proceedWithSubmit */
  const handleSubmit = () => {
    if (!team || !roundConfig) return;
    setSubmitError(null);
    proceedWithSubmit();
  };

  // Track how long we've been disconnected to show escalating help
  const [disconnectedSince, setDisconnectedSince] = useState<number | null>(null);
  const [showReconnectHelp, setShowReconnectHelp] = useState(false);

  useEffect(() => {
    if (!connected) {
      const now = Date.now();
      setDisconnectedSince(prev => prev ?? now);
      // After 10 seconds disconnected, show expanded reconnect help
      const timer = setTimeout(() => setShowReconnectHelp(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setDisconnectedSince(null);
      setShowReconnectHelp(false);
    }
  }, [connected]);

  // Show reconnecting state
  if (!team && (reconnecting || sessionStorage.getItem('nem_team_id'))) {
    const savedTeamName = sessionStorage.getItem('nem_team_name');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <div className="text-5xl mb-4 animate-spin">🔄</div>
          <h2 className="text-xl font-bold text-gray-800">Reconnecting...</h2>
          <p className="text-gray-500 mt-2">
            Getting {savedTeamName ? `"${savedTeamName}"` : 'you'} back in the game
          </p>
          {!connected && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Connecting to server...
            </div>
          )}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                if (connected) {
                  const savedTeamId = sessionStorage.getItem('nem_team_id');
                  const savedGameId = sessionStorage.getItem('nem_game_id');
                  if (savedTeamId && savedGameId) {
                    requestState();
                  }
                } else {
                  window.location.reload();
                }
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                clearSession();
                navigate('/team/join');
              }}
              className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
            >
              Rejoin as New Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!team) return null;

  // Team header bar with team color
  const teamColor = team.color;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Disconnected overlay */}
      {!connected && showReconnectHelp && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="text-4xl mb-3">📡</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Connection Lost</h3>
            <p className="text-gray-500 text-sm mb-4">
              We're trying to reconnect you automatically. If it doesn't work, try:
            </p>
            <div className="space-y-3 text-left text-sm">
              <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                <span className="text-lg flex-shrink-0">1️⃣</span>
                <div>
                  <div className="font-medium text-gray-800">Wait a moment</div>
                  <div className="text-gray-500 text-xs">Auto-reconnect usually works within 15 seconds</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                <span className="text-lg flex-shrink-0">2️⃣</span>
                <div>
                  <div className="font-medium text-gray-800">Check your WiFi</div>
                  <div className="text-gray-500 text-xs">Make sure you're still on the venue network</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                <span className="text-lg flex-shrink-0">3️⃣</span>
                <div>
                  <div className="font-medium text-gray-800">Scan the QR code on screen</div>
                  <div className="text-gray-500 text-xs">Ask your host to show the join QR code — scan it to rejoin</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Reload Page
              </button>
              <button
                onClick={() => setShowReconnectHelp(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Simple disconnect banner (shown immediately) */}
      {!connected && !showReconnectHelp && (
        <div className="bg-red-500 text-white text-center py-2 text-sm font-medium animate-pulse">
          ⚠️ Disconnected — reconnecting...
        </div>
      )}

      {/* Team Header */}
      <div className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: teamColor }}>
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Exit game? You will leave the current session.')) {
                  clearSession();
                  navigate('/');
                }
              }}
              className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 text-white/80 hover:text-white rounded text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Exit
            </button>
            <div>
              <div className="text-white font-bold text-sm">{team.name}</div>
              <div className="text-white/70 text-xs flex items-center gap-1 flex-wrap">
                <span className="text-white/50">GridRival</span>
                {phase !== 'lobby' && phase !== 'final' && gameState?.currentRound && gameState.totalRounds && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="font-semibold text-white/90">Round {gameState.currentRound} of {gameState.totalRounds}</span>
                  </>
                )}
                {phase !== 'lobby' && phase !== 'final' && roundConfig?.name && (
                  <>
                    <span className="text-white/30">·</span>
                    <span>{roundConfig.name}</span>
                  </>
                )}
                {phase === 'lobby' && <span>Waiting for game to start...</span>}
                {phase === 'dispatching' && <span>Market clearing...</span>}
                {phase === 'final' && <span className="font-semibold text-white/90">Game Over</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {phase === 'bidding' && (
              <div className={`px-3 py-1 rounded-full font-mono font-bold text-sm ${
                timerPaused ? 'bg-amber-500/80 text-white' :
                biddingTimeRemaining <= 30 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white'
              }`}>
                {timerPaused ? '⏸ ' : ''}{formatTime(biddingTimeRemaining)}
              </div>
            )}
            <div className="text-white/70 text-xs font-mono">
              {formatCurrency(team.cumulativeProfitDollars)}
            </div>
            <SoundToggle />
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-24">
        {/* Lobby */}
        {phase === 'lobby' && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800">Waiting for Game to Start</h2>
            <p className="text-gray-500 mt-2">The host will begin the first round shortly.</p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Connected as {team.name}
            </div>
          </div>
        )}

        {/* Briefing */}
        {phase === 'briefing' && roundConfig && (
          <div className="p-4">
            <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
              <div className="text-xs text-blue-600 font-medium mb-1">Round {gameState?.currentRound}</div>
              <h2 className="text-lg font-bold text-gray-800">{roundConfig.name}</h2>
              <p className="text-gray-600 text-sm mt-2">{roundConfig.description}</p>

              {/* Walkthrough notice in briefing */}
              {roundConfig.walkthrough && (
                <div className="mt-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span>🎓</span>
                    <span className="text-xs font-bold text-purple-800">Guided Round</span>
                  </div>
                  <p className="text-xs text-purple-700">When bidding opens, you'll see suggested bids with explanations. Follow along to learn the basics!</p>
                </div>
              )}
            </div>

            {/* Quick Recap of Last Round (4.6) */}
            {gameState && gameState.lastRoundResults && (
              <div className="mb-4">
                <QuickRecapCard gameState={gameState} teamId={team.id} />
              </div>
            )}

            {/* Seasonal Guidance */}
            {roundConfig.seasonalGuidance && (
              <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">
                    {roundConfig.season === 'summer' ? '🔥' : roundConfig.season === 'winter' ? '❄️' : roundConfig.season === 'autumn' ? '🍂' : '🌱'}
                  </span>
                  <h3 className="text-sm font-bold text-gray-800">{roundConfig.seasonalGuidance.headline}</h3>
                </div>
                <div className="space-y-2.5">
                  <div className="bg-blue-50 rounded-lg px-3 py-2">
                    <div className="text-xs font-semibold text-blue-700 mb-0.5">Demand</div>
                    <p className="text-xs text-blue-900">{roundConfig.seasonalGuidance.demandContext}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg px-3 py-2">
                    <div className="text-xs font-semibold text-amber-700 mb-0.5">Supply</div>
                    <p className="text-xs text-amber-900">{roundConfig.seasonalGuidance.supplyContext}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg px-3 py-2">
                    <div className="text-xs font-semibold text-green-700 mb-0.5">Bidding Strategy</div>
                    <p className="text-xs text-green-900">{roundConfig.seasonalGuidance.biddingAdvice}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Assets Preview */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Assets</h3>
              <div className="space-y-2">
                {assets.map(asset => {
                  const typeKey = asset.assetDefinitionId.split('_')[0] as AssetType;
                  const isNewlyUnlocked = roundConfig.newAssetsUnlocked.includes(typeKey) ||
                    (asset.assetDefinitionId.includes('ccgt') && roundConfig.newAssetsUnlocked.includes('gas_ccgt')) ||
                    (asset.assetDefinitionId.includes('peaker') && roundConfig.newAssetsUnlocked.includes('gas_peaker'));

                  return (
                    <div
                      key={asset.assetDefinitionId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                        isNewlyUnlocked ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      } ${asset.isForceOutage ? 'opacity-60' : ''}`}
                    >
                      <span className="text-lg">{ASSET_ICONS[typeKey] || '🏭'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {getAssetDef(asset.assetDefinitionId)?.name || asset.assetDefinitionId.replace(/_\d+$/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {(() => {
                            const def = getAssetDef(asset.assetDefinitionId);
                            if (!def) return null;
                            return (
                              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border flex-shrink-0 ${
                                def.srmcPerMWh === 0 ? 'bg-green-100 text-green-800 border-green-300' :
                                def.srmcPerMWh < 50 ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                def.srmcPerMWh < 100 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-red-100 text-red-800 border-red-300'
                              }`} title="Short Run Marginal Cost - your cost to generate each MWh">
                                Marginal Cost ${def.srmcPerMWh}/MWh
                              </span>
                            );
                          })()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatMW(asset.currentAvailableMW)}
                          {asset.isForceOutage && <span className="text-red-500 ml-1">(Outage!)</span>}
                        </div>
                      </div>
                      {isNewlyUnlocked && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">NEW</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Demand & Fleet Summary */}
            {gameState?.fleetInfo && roundConfig.baseDemandMW && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mt-4">
                <div className="text-sm font-bold text-blue-800 mb-2">
                  📊 {SEASON_LABELS[roundConfig.season]} — Demand vs Fleet Capacity
                </div>
                <div className={`grid gap-2 ${roundConfig.timePeriods.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                  {roundConfig.timePeriods.map(p => {
                    const demandMW = roundConfig.baseDemandMW[p] || 0;
                    const fleetMW = gameState.fleetInfo!.totalFleetMW[p] || 0;
                    const pct = gameState.fleetInfo!.demandAsPercentOfFleet[p] || 0;
                    const desc = getPeriodDescriptions(p as TimePeriod, roundConfig.season, availableAssetTypes);
                    return (
                      <div key={p} className="bg-white/70 rounded-lg px-3 py-2">
                        <div className="text-xs font-medium text-gray-600">{desc.icon} {desc.label}</div>
                        <div className="text-lg font-bold font-mono text-blue-700">{formatMW(demandMW)}</div>
                        <div className="text-xs text-gray-500">of {formatMW(fleetMW)} fleet</div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          pct >= 90 ? 'bg-red-100 text-red-700' :
                          pct >= 70 ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {pct}% of fleet
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Strategy Guide Button */}
            <button
              onClick={() => setShowStrategyGuide(true)}
              className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>🧠</span> Bidding Strategy Guide
            </button>

            <p className="text-center text-gray-400 text-sm mt-4">
              Waiting for host to open bidding...
            </p>
          </div>
        )}

        {/* Bidding Interface */}
        {phase === 'bidding' && roundConfig && !submitted && useGuidedView && (
          <>
            {/* View Toggle */}
            <div className="px-3 pt-3 pb-0 flex justify-end">
              <button
                onClick={() => setUseGuidedView(false)}
                className="text-[10px] text-gray-400 hover:text-gray-600 underline transition-colors"
              >
                Switch to classic view
              </button>
            </div>
            <GuidedBiddingView
              roundConfig={roundConfig}
              gameState={gameState!}
              assets={assets}
              assetDefs={assetDefs}
              walkthrough={walkthrough}
              bids={bids}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              onUpdateBand={updateBand}
              onAddBand={addBand}
              onQuickBid={applyQuickBid}
              onApplyStrategy={applyStrategy}
              onShowHowToBid={() => setShowHowToBid(true)}
              onShowRoundBriefing={() => setShowRoundBriefing(true)}
              onShowStrategyGuide={() => setShowStrategyGuide(true)}
              onShowCommonMistakes={() => setShowCommonMistakes(true)}
              getAssetDef={getAssetDef}
              getBidBands={getBidBands}
              hasBattery={hasBattery}
              onShowBatteryExplainer={() => setShowBatteryExplainer(true)}
              showPortfolioButton={hasPortfolio}
              onShowPortfolioExplainer={() => setShowPortfolioExplainer(true)}
              batteryModes={batteryModes}
              chargeMWs={chargeMWs}
              onBatteryModeChange={(assetId: string, period: TimePeriod, mode: BatteryMode) => {
                const key = `${assetId}_${period}`;
                setBatteryModes(new Map(batteryModes.set(key, mode)));
              }}
              onChargeMWChange={(assetId: string, period: TimePeriod, mw: number) => {
                const key = `${assetId}_${period}`;
                setChargeMWs(new Map(chargeMWs.set(key, mw)));
              }}
              hydroDispatchPeriods={hydroDispatchPeriods}
              hydroBidPrices={hydroBidPrices}
              onHydroDispatchPeriodChange={(assetId, period) => {
                setHydroDispatchPeriods(new Map(hydroDispatchPeriods.set(assetId, period)));
              }}
              onHydroBidPriceChange={(assetId, price) => {
                setHydroBidPrices(new Map(hydroBidPrices.set(assetId, price)));
              }}
              strategyApplyScope={strategyApplyScope}
              onStrategyApplyScopeChange={setStrategyApplyScope}
            />
          </>
        )}

        {/* Original Bidding Interface (classic view) */}
        {phase === 'bidding' && roundConfig && !submitted && !useGuidedView && (
          <div className="p-3">
            {/* View Toggle */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setUseGuidedView(true)}
                className="text-[10px] text-gray-400 hover:text-gray-600 underline transition-colors"
              >
                Switch to guided view
              </button>
            </div>
            {/* Walkthrough Banner */}
            {walkthrough && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl px-4 py-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎓</span>
                  <span className="text-sm font-bold text-purple-800">Guided Round</span>
                </div>
                <p className="text-xs text-purple-700 leading-relaxed">{walkthrough.introText}</p>
              </div>
            )}

            {/* Help Buttons Bar */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-0.5">
              <button
                onClick={() => setShowHowToBid(true)}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm"
              >
                <span>📖</span> How to Bid
              </button>
              <button
                onClick={() => setShowRoundBriefing(true)}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
              >
                <span>📊</span> Round Overview
              </button>
              <button
                onClick={() => setShowStrategyGuide(true)}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors shadow-sm"
              >
                <span>🧠</span> Strategies
              </button>
              <button
                onClick={() => setShowCommonMistakes(true)}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors shadow-sm"
              >
                <span>⚠️</span> Common Mistakes
              </button>
              {hasBattery && (
                <button
                  onClick={() => setShowBatteryExplainer(true)}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors shadow-sm"
                >
                  <span>🔋</span> Battery Guide
                </button>
              )}
              {hasPortfolio && (
                <button
                  onClick={() => setShowPortfolioExplainer(true)}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors shadow-sm"
                >
                  <span>📊</span> Portfolio
                </button>
              )}
            </div>

            {/* Demand Overview Banner - All Periods */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-xl p-4 mb-3">
              <div className="text-xs font-bold uppercase tracking-wide text-white/80 mb-2">
                📊 Demand This Round — {SEASON_LABELS[roundConfig.season]}
              </div>
              <div className={`grid gap-2 ${roundConfig.timePeriods.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                {roundConfig.timePeriods.map(p => {
                  const desc = getPeriodDescriptions(p as TimePeriod, roundConfig.season, availableAssetTypes);
                  const demandMW = roundConfig.baseDemandMW[p] || 0;
                  const pctOfFleet = gameState?.fleetInfo?.demandAsPercentOfFleet[p] || 0;
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedPeriod(p as TimePeriod)}
                      className={`rounded-lg p-2 text-left transition-all ${
                        selectedPeriod === p ? 'bg-white/25 ring-2 ring-white' : 'bg-white/10 hover:bg-white/15'
                      }`}
                    >
                      <div className="text-xs opacity-80">{desc.icon} {desc.label}</div>
                      <div className="text-lg font-bold font-mono">{formatMW(demandMW)}</div>
                      <div className={`text-xs font-bold ${
                        pctOfFleet >= 90 ? 'text-red-300' : pctOfFleet >= 70 ? 'text-amber-300' : 'text-green-300'
                      }`}>{pctOfFleet}% of fleet</div>
                    </button>
                  );
                })}
              </div>
              {/* Hint for selected period */}
              {(() => {
                const desc = getPeriodDescriptions(selectedPeriod, roundConfig.season, availableAssetTypes);
                return (
                  <div className="mt-2 text-sm text-white/90 bg-white/10 rounded-lg px-3 py-2">
                    <span className="font-semibold">{desc.icon} {desc.label}:</span> {desc.priceContext}
                  </div>
                );
              })()}
            </div>

            {/* Period Tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
              {roundConfig.timePeriods.map(p => {
                const desc = getPeriodDescriptions(p as TimePeriod, roundConfig.season, availableAssetTypes);
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p as TimePeriod)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedPeriod === p
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    {desc.icon} {desc.label}
                    <span className="ml-1 opacity-70">({TIME_PERIOD_TIME_RANGES[p as TimePeriod]})</span>
                  </button>
                );
              })}
            </div>

            {/* Period Description */}
            {(() => {
              const desc = getPeriodDescriptions(selectedPeriod, roundConfig.season, availableAssetTypes);
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{desc.icon}</span>
                    <span className="text-sm font-bold text-gray-800">{desc.label}</span>
                    <span className="text-xs text-gray-400">{desc.timeRange}</span>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      desc.demandLevel === 'Low' ? 'bg-green-100 text-green-700' :
                      desc.demandLevel === 'Moderate' || desc.demandLevel.includes('solar') ? 'bg-blue-100 text-blue-700' :
                      desc.demandLevel === 'High' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {desc.demandLevel} demand
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed mb-1">{desc.typicalDispatch}</p>
                  <p className="text-[11px] text-blue-700 font-medium leading-relaxed">💲 {desc.priceContext}</p>
                </div>
              );
            })()}

            {/* Supply vs Demand Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-800">
                  {TIME_PERIOD_SHORT_LABELS[selectedPeriod]} &bull; {SEASON_LABELS[roundConfig.season]}
                </span>
                {gameState?.fleetInfo && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    (gameState.fleetInfo.demandAsPercentOfFleet[selectedPeriod] || 0) >= 90
                      ? 'bg-red-100 text-red-700'
                      : (gameState.fleetInfo.demandAsPercentOfFleet[selectedPeriod] || 0) >= 70
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {gameState.fleetInfo.demandAsPercentOfFleet[selectedPeriod] || 0}% of fleet
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-white/70 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Demand</div>
                  <div className="text-base font-bold font-mono text-blue-700">
                    {formatMW(roundConfig.baseDemandMW[selectedPeriod] || 0)}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total Fleet Supply</div>
                  <div className="text-base font-bold font-mono text-indigo-700">
                    {formatMW(gameState?.fleetInfo?.totalFleetMW[selectedPeriod] || 0)}
                  </div>
                </div>
              </div>

              {/* Supply/Demand bar */}
              {gameState?.fleetInfo && (() => {
                const demandMW = roundConfig.baseDemandMW[selectedPeriod] || 0;
                const fleetMW = gameState.fleetInfo.totalFleetMW[selectedPeriod] || 1;
                const pct = Math.min(100, (demandMW / fleetMW) * 100);
                return (
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                      <span>0 MW</span>
                      <span>{formatMW(fleetMW)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Educational tip about $0 bidding */}
              {gameState?.fleetInfo && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    <strong>💡 Tip:</strong> If all teams collectively bid enough capacity at $0 to cover
                    the {formatMW(roundConfig.baseDemandMW[selectedPeriod] || 0)} demand,
                    the clearing price will be <strong>$0/MWh</strong> and nobody covers their costs.
                    {(gameState.fleetInfo.demandAsPercentOfFleet[selectedPeriod] || 0) < 70 && (
                      <span> Supply significantly exceeds demand this period — there's plenty of capacity!</span>
                    )}
                    {(gameState.fleetInfo.demandAsPercentOfFleet[selectedPeriod] || 0) >= 90 && (
                      <span> Demand is close to total supply — capacity is tight and prices may be high.</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Strategy Selector Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3 overflow-hidden">
              {/* Toggle Header */}
              <button
                onClick={() => setStrategyOpen(!strategyOpen)}
                className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🧠</span>
                  <span className="text-sm font-semibold text-gray-800">Strategy Auto-Fill</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowStrategyGuide(true); }}
                    className="px-1.5 py-0.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded text-[10px] font-bold transition-colors"
                    title="Open Strategy Guide"
                  >
                    📖 Guide
                  </button>
                  {selectedStrategy && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {STRATEGIES.find(s => s.id === selectedStrategy)?.icon}{' '}
                      {STRATEGIES.find(s => s.id === selectedStrategy)?.name} ({selectedIntensity})
                    </span>
                  )}
                </div>
                <span className={`text-gray-400 transition-transform ${strategyOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Expanded Panel */}
              {strategyOpen && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                  <p className="text-[11px] text-gray-500">
                    Choose a strategy and intensity, then apply to <strong>all assets</strong> or <strong>specific assets</strong>. You can still adjust individual bids after.
                  </p>

                  {/* Strategy Dropdown */}
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Strategy</label>
                    <select
                      value={selectedStrategy}
                      onChange={e => setSelectedStrategy(e.target.value as StrategyId)}
                      className="w-full mt-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em', paddingRight: '2.5rem' }}
                    >
                      <option value="">Select a strategy...</option>
                      {filteredStrategies.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {s.name} — {s.shortDescription}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Strategy Description */}
                  {selectedStrategy && (() => {
                    const strat = STRATEGIES.find(s => s.id === selectedStrategy);
                    if (!strat) return null;
                    return (
                      <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        <p className="text-[11px] text-gray-600 leading-relaxed">{strat.description}</p>
                      </div>
                    );
                  })()}

                  {/* Intensity Selector */}
                  {selectedStrategy && (
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Intensity</label>
                      <div className="flex gap-1.5 mt-1">
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
                              onClick={() => setSelectedIntensity(level)}
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
                    </div>
                  )}

                  {/* Apply to Assets Selection + Button */}
                  {selectedStrategy && (
                    <div className="space-y-3">
                      {/* Apply Mode Selector */}
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Apply to</label>
                        <div className="mt-1.5 space-y-2">
                          {/* All Assets checkbox */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={strategyApplyMode === 'all'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStrategyApplyMode('all');
                                  setSelectedAssetIds(new Set(assets.map(a => a.assetDefinitionId)));
                                } else {
                                  setStrategyApplyMode('selected');
                                  // Pre-check all assets when switching to "selected" mode
                                  setSelectedAssetIds(new Set(assets.map(a => a.assetDefinitionId)));
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">All Assets</span>
                          </label>

                          {/* Individual asset checkboxes (shown when not "all") */}
                          {strategyApplyMode === 'selected' && (
                            <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-3">
                              {assets.map(asset => {
                                const typeKey = asset.assetDefinitionId.includes('ccgt') ? 'gas_ccgt' as AssetType :
                                               asset.assetDefinitionId.includes('peaker') ? 'gas_peaker' as AssetType :
                                               asset.assetDefinitionId.split('_')[0] as AssetType;
                                const def = assetDefs.find((d: AssetInfo) => d.id === asset.assetDefinitionId);
                                const isChecked = selectedAssetIds.has(asset.assetDefinitionId);

                                return (
                                  <label
                                    key={asset.assetDefinitionId}
                                    className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg transition-colors ${
                                      isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'
                                    } ${asset.isForceOutage ? 'opacity-50' : ''}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={asset.isForceOutage}
                                      onChange={(e) => {
                                        const next = new Set(selectedAssetIds);
                                        if (e.target.checked) {
                                          next.add(asset.assetDefinitionId);
                                        } else {
                                          next.delete(asset.assetDefinitionId);
                                        }
                                        setSelectedAssetIds(next);
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm">{ASSET_ICONS[typeKey] || '⚡'}</span>
                                    <span className="text-xs text-gray-700 font-medium truncate">
                                      {def?.name || asset.assetDefinitionId}
                                    </span>
                                    <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap">
                                      {Math.round(asset.currentAvailableMW)} MW
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Apply Button */}
                      <button
                        onClick={() => applyStrategy(selectedStrategy as StrategyId, selectedIntensity)}
                        disabled={strategyApplyMode === 'selected' && selectedAssetIds.size === 0}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold text-sm rounded-lg shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {strategyApplyMode === 'all'
                          ? `Apply ${STRATEGIES.find(s => s.id === selectedStrategy)?.name} (${selectedIntensity}) to All Assets`
                          : `Apply ${STRATEGIES.find(s => s.id === selectedStrategy)?.name} (${selectedIntensity}) to ${selectedAssetIds.size} Asset${selectedAssetIds.size !== 1 ? 's' : ''}`
                        }
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Asset Bid Cards */}
            <div className="space-y-3">
              {assets.map(asset => {
                const typeKey = asset.assetDefinitionId.split('_')[0] as AssetType;
                const fullTypeKey = asset.assetDefinitionId.includes('ccgt') ? 'gas_ccgt' :
                                   asset.assetDefinitionId.includes('peaker') ? 'gas_peaker' : typeKey;
                const bands = getBidBands(asset.assetDefinitionId, selectedPeriod);
                const totalBid = bands.reduce((s, b) => s + (b.quantityMW || 0), 0);
                const maxBands = roundConfig.maxBidBandsPerAsset;

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
                            {getAssetDef(asset.assetDefinitionId)?.name || ASSET_TYPE_LABELS[fullTypeKey as AssetType] || typeKey}
                          </span>
                          {/* SRMC Badge - prominently visible */}
                          {(() => {
                            const def = getAssetDef(asset.assetDefinitionId);
                            if (!def) return null;
                            const srmc = def.srmcPerMWh;
                            return (
                              <span className={`text-sm font-extrabold px-2.5 py-1 rounded-lg border-2 shadow-sm ${
                                srmc === 0 ? 'bg-green-100 text-green-800 border-green-300' :
                                srmc < 50 ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                srmc < 100 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-red-100 text-red-800 border-red-300'
                              }`} title="Short Run Marginal Cost - your cost to generate each MWh">
                                Marginal Cost ${srmc}/MWh
                              </span>
                            );
                          })()}
                        </div>
                        {/* Wind/Solar availability indicator */}
                        {(() => {
                          const def = getAssetDef(asset.assetDefinitionId);
                          if (!def || !def.availabilityByPeriod) return null;
                          const periodMW = def.availabilityByPeriod[selectedPeriod];
                          if (def.type === 'solar') {
                            return (
                              <div className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
                                <span>☀️</span>
                                {periodMW === 0 ? (
                                  <span className="font-medium text-gray-400">No sun this period — 0 MW</span>
                                ) : (
                                  <span><strong>{periodMW} MW</strong> available this period (daytime only)</span>
                                )}
                              </div>
                            );
                          }
                          if (def.type === 'wind') {
                            const periodLabels: Record<string, string> = {
                              night_offpeak: 'Overnight', day_offpeak: 'Morning',
                              day_peak: 'Afternoon', night_peak: 'Evening',
                            };
                            const allPeriods = Object.entries(def.availabilityByPeriod)
                              .map(([p, mw]) => `${periodLabels[p] || p}: ${mw} MW`)
                              .join(' · ');
                            return (
                              <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5" title={allPeriods}>
                                <span>💨</span>
                                <span><strong>{periodMW} MW</strong> this period</span>
                                <span className="text-gray-400 ml-1">({allPeriods})</span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <div className="text-xs text-gray-500">
                          {formatMW(asset.currentAvailableMW)} nameplate
                          {asset.isForceOutage && <span className="text-red-500"> (OUTAGE)</span>}
                        </div>
                      </div>
                      <div className={`text-xs font-mono px-2 py-1 rounded flex-shrink-0 ${
                        totalBid > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {totalBid}/{asset.currentAvailableMW} MW
                      </div>
                    </div>

                    {/* Marginal Cost Reminder */}
                    {(() => {
                      const def = getAssetDef(asset.assetDefinitionId);
                      if (!def) return null;
                      return (
                        <div className="px-4 py-1.5 bg-gray-50 text-[11px] text-gray-500 border-b border-gray-100">
                          Your marginal cost to generate: <strong className="text-gray-700">${formatNumber(def.srmcPerMWh)}/MWh</strong> — bid above this to cover costs
                        </div>
                      );
                    })()}

                    {/* Quick Bid Buttons */}
                    <div className="px-4 py-2 flex gap-2 border-b border-gray-50">
                      <button
                        onClick={() => applyQuickBid(asset.assetDefinitionId, selectedPeriod, 'zero')}
                        className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100"
                      >
                        Bid $0
                      </button>
                      <button
                        onClick={() => applyQuickBid(asset.assetDefinitionId, selectedPeriod, 'srmc')}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 hover:bg-blue-100 font-medium"
                      >
                        Bid Marginal Cost (${getAssetDef(asset.assetDefinitionId)?.srmcPerMWh ?? '?'})
                      </button>
                      <button
                        onClick={() => applyQuickBid(asset.assetDefinitionId, selectedPeriod, 'high')}
                        className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200 hover:bg-amber-100"
                      >
                        Bid $500
                      </button>
                    </div>

                    {/* Bid Bands */}
                    <div className="px-4 py-3 space-y-2">
                      {bands.map((band, i) => {
                        // Find matching walkthrough explanation for this band
                        const walkthroughExplanation = walkthrough?.suggestedBids
                          ?.filter(s => s.period === selectedPeriod && (s.assetType === fullTypeKey || s.assetType === typeKey))
                          ?.[i]?.explanation;

                        return (
                          <div key={i}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                              <div className="flex-1 flex gap-2">
                                <div className="flex-1">
                                  <label className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 rounded">$/MWh</label>
                                  <input
                                    type="number"
                                    value={band.pricePerMWh ?? ''}
                                    onChange={e => updateBand(asset.assetDefinitionId, selectedPeriod, i, 'pricePerMWh', parseFloat(e.target.value) || 0)}
                                    onFocus={e => e.target.select()}
                                    placeholder="Price"
                                    className={`w-full px-2 py-1.5 border border-l-2 border-l-blue-400 rounded text-sm font-mono focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                                      walkthroughExplanation ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                                    }`}
                                    min={-1000}
                                    max={20000}
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] font-semibold text-green-600 bg-green-50 px-1 rounded">MW</label>
                                  <input
                                    type="number"
                                    value={band.quantityMW ?? ''}
                                    onChange={e => updateBand(asset.assetDefinitionId, selectedPeriod, i, 'quantityMW', parseFloat(e.target.value) || 0)}
                                    onFocus={e => e.target.select()}
                                    placeholder="MW"
                                    className={`w-full px-2 py-1.5 border border-l-2 border-l-green-400 rounded text-sm font-mono focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                                      walkthroughExplanation ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                                    }`}
                                    min={0}
                                    max={asset.currentAvailableMW}
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Walkthrough explanation for this band */}
                            {walkthroughExplanation && (
                              <div className="ml-6 mt-1 mb-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                                <div className="flex items-start gap-1.5">
                                  <span className="text-purple-500 text-xs mt-0.5">💡</span>
                                  <p className="text-[11px] text-purple-700 leading-relaxed">{walkthroughExplanation}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {bands.length < maxBands && (
                        <button
                          onClick={() => addBand(asset.assetDefinitionId, selectedPeriod)}
                          className="w-full py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded border border-dashed border-blue-200"
                        >
                          + Add Band
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submitted Confirmation */}
        {phase === 'bidding' && submitted && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800">Bids Submitted!</h2>
            <p className="text-gray-500 mt-2">Waiting for all teams to finish...</p>
            <div className={`mt-4 text-2xl font-mono font-bold ${timerPaused ? 'text-amber-500' : 'text-blue-600'}`}>
              {timerPaused ? '⏸ ' : ''}{formatTime(biddingTimeRemaining)}
            </div>
            {timerPaused && (
              <p className="text-amber-500 text-sm mt-1">Timer paused by game master</p>
            )}
            {/* Walkthrough after-submit explanation */}
            {walkthrough?.afterSubmitExplanation && (
              <div className="mt-6 mx-auto max-w-sm bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👀</span>
                  <span className="text-sm font-bold text-purple-800">What to Watch For</span>
                </div>
                <p className="text-xs text-purple-700 leading-relaxed">{walkthrough.afterSubmitExplanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Dispatching */}
        {phase === 'dispatching' && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4 animate-spin">⚙️</div>
            <h2 className="text-xl font-bold text-gray-800">Running Dispatch...</h2>
            <p className="text-gray-500 mt-2">AEMO is clearing the market</p>
          </div>
        )}

        {/* Results */}
        {(phase === 'results' || showResults) && roundResults && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Round {gameState?.currentRound} Results</h2>

            {/* Your Profit */}
            {(() => {
              const myResult = roundResults.teamResults.find(r => r.teamId === team.id);
              if (!myResult) return null;
              return (
                <div className={`rounded-xl p-5 text-center ${
                  myResult.totalProfitDollars >= 0
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="text-sm text-gray-600">Your Profit This Round</div>
                  <div className={`text-3xl font-bold font-mono mt-1 ${
                    myResult.totalProfitDollars >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(myResult.totalProfitDollars)}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-gray-500">Revenue</div>
                      <div className="font-mono font-bold text-gray-800">{formatCurrency(myResult.totalRevenueDollars)}</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-gray-500">Costs</div>
                      <div className="font-mono font-bold text-gray-800">{formatCurrency(myResult.totalCostDollars)}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Clearing Prices */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Clearing Prices</h3>
              <div className="grid grid-cols-2 gap-2">
                {roundResults.periodResults.map(pr => (
                  <div key={pr.timePeriod} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-700 capitalize">{pr.timePeriod.replace(/_/g, ' ')}</div>
                    <div className="text-2xl font-bold font-mono text-blue-600">${formatNumber(pr.clearingPriceMWh)}<span className="text-sm text-gray-400">/MWh</span></div>
                    <div className="mt-1 text-sm font-mono font-semibold text-gray-600">
                      Demand: {formatMW(pr.demandMW)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Reserve: {pr.reserveMarginPercent.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generation Mix — Asset Category Breakdown */}
            {gameState?.lastRoundAnalysis?.assetCategoryBreakdown &&
             gameState.lastRoundAnalysis.assetCategoryBreakdown.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Generation Mix</h3>

                {/* Stacked bar */}
                {(() => {
                  const cats = gameState.lastRoundAnalysis.assetCategoryBreakdown as AssetCategoryBreakdown[];
                  const totalEnergy = cats.reduce((s, c) => s + c.totalEnergyMWh, 0);
                  if (totalEnergy <= 0) return null;

                  const CAT_COLORS: Record<string, string> = {
                    renewables: '#22c55e',
                    fossil: '#6b7280',
                    hydro: '#3b82f6',
                    battery: '#a855f7',
                  };

                  return (
                    <div className="space-y-3">
                      {/* Proportional bar */}
                      <div className="flex rounded-lg overflow-hidden h-6">
                        {cats.filter(c => c.totalEnergyMWh > 0).map(cat => {
                          const pct = (cat.totalEnergyMWh / totalEnergy) * 100;
                          return (
                            <div
                              key={cat.category}
                              className="flex items-center justify-center text-[9px] font-bold text-white min-w-[24px]"
                              style={{
                                width: `${Math.max(pct, 3)}%`,
                                backgroundColor: CAT_COLORS[cat.category] || '#999',
                              }}
                              title={`${cat.categoryLabel}: ${pct.toFixed(0)}%`}
                            >
                              {pct >= 10 ? `${pct.toFixed(0)}%` : ''}
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend + stats */}
                      <div className="grid grid-cols-2 gap-2">
                        {cats.filter(c => c.totalEnergyMWh > 0 || c.totalProfit !== 0).map(cat => {
                          const pct = totalEnergy > 0 ? (cat.totalEnergyMWh / totalEnergy) * 100 : 0;
                          const myTeamBreakdown = cat.teamBreakdowns.find(tb => tb.teamId === team.id);
                          return (
                            <div key={cat.category} className="bg-gray-50 rounded-lg p-2.5">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-sm flex-shrink-0"
                                  style={{ backgroundColor: CAT_COLORS[cat.category] || '#999' }}
                                />
                                <span className="text-xs font-semibold text-gray-700">
                                  {cat.categoryIcon} {cat.categoryLabel}
                                </span>
                                <span className="text-[10px] text-gray-400 ml-auto font-mono">
                                  {pct.toFixed(0)}%
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-500 ml-5">
                                {formatNumber(Math.round(cat.totalEnergyMWh))} MWh total
                              </div>
                              {myTeamBreakdown && myTeamBreakdown.energyMWh > 0 && (
                                <div className="text-[10px] ml-5 mt-0.5">
                                  <span className="text-gray-500">You: </span>
                                  <span className={`font-mono font-bold ${
                                    myTeamBreakdown.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {myTeamBreakdown.profit >= 0 ? '+' : ''}{formatCurrency(myTeamBreakdown.profit)}
                                  </span>
                                  <span className="text-gray-400"> ({formatNumber(Math.round(myTeamBreakdown.energyMWh))} MWh)</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Walkthrough Button */}
            <button
              onClick={() => setShowWalkthrough(true)}
              className="w-full py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl text-sm font-semibold text-indigo-700 hover:from-indigo-100 hover:to-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <span>🎬</span> See How the Merit Order Set the Price
            </button>

            {/* Leaderboard */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Leaderboard</h3>
              <div className="space-y-1">
                {(gameState?.leaderboard || []).map((entry, i) => (
                  <div
                    key={entry.teamId}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      entry.teamId === team.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm font-bold w-6 ${
                      i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-500'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-gray-800 flex-1 truncate">{entry.teamName}</span>
                    <span className={`text-sm font-mono font-bold ${
                      entry.cumulativeProfitDollars >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(entry.cumulativeProfitDollars)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price History Chart (4.5) */}
            {gameState?.historicalClearingPrices && gameState.historicalClearingPrices.length > 1 && (
              <PriceHistoryChart historicalPrices={gameState.historicalClearingPrices} />
            )}

            {/* Next Round Preview (3.5) */}
            {gameState?.roundConfig && gameState?.currentRound && gameState.totalRounds &&
             gameState.currentRound < gameState.totalRounds && (() => {
              // We need the next round config — it's not directly available, but we can
              // show a simple "next round coming" message based on available data
              const nextRoundNum = gameState.currentRound! + 1;
              // The next round config isn't in gameState during results, so we'll show this
              // only if the game provides it (it will be shown during briefing via RoundBriefing)
              return null;
            })()}

            {/* Team-Specific Round Analysis */}
            {gameState?.lastRoundAnalysis && (() => {
              const analysis: RoundAnalysis = gameState.lastRoundAnalysis;
              const myAnalysis: TeamAnalysis | undefined = analysis.teamAnalyses.find(
                (ta: TeamAnalysis) => ta.teamId === team.id
              );
              if (!myAnalysis) return null;

              return (
                <div className="space-y-3">
                  {/* Your Performance Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🔍</span>
                      <h3 className="text-sm font-bold text-blue-800">Your Round Analysis</h3>
                    </div>

                    {/* Strengths */}
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-green-700 mb-1">What you did well</div>
                      {myAnalysis.strengths.map((s: string, i: number) => (
                        <p key={i} className="text-xs text-gray-700 mb-1 flex items-start gap-1.5">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                          <span>{s}</span>
                        </p>
                      ))}
                    </div>

                    {/* Improvements */}
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-amber-700 mb-1">Where to improve</div>
                      {myAnalysis.improvements.map((s: string, i: number) => (
                        <p key={i} className="text-xs text-gray-700 mb-1 flex items-start gap-1.5">
                          <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                          <span>{s}</span>
                        </p>
                      ))}
                    </div>

                    {/* Asset Performance */}
                    {myAnalysis.assetPerformance.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-700 mb-1.5">Asset Performance</div>
                        <div className="space-y-1.5">
                          {myAnalysis.assetPerformance.map((ap: AssetPerformanceSummary, i: number) => (
                            <div key={i} className="bg-white/60 rounded-lg px-3 py-2 border border-white">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-medium text-gray-800">
                                  {ap.assetType === 'battery' ? '🔋 ' : ''}{ap.assetName}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {ap.assetType === 'battery' && (
                                    <span className="text-[10px] text-gray-500">Arbitrage P&L</span>
                                  )}
                                  <span className={`text-xs font-mono font-bold ${
                                    ap.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {ap.profit >= 0 ? '+' : ''}{formatCurrency(ap.profit)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[11px] text-gray-600 leading-relaxed">{ap.assessment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Round Advice */}
                    <div className="bg-blue-100/50 rounded-lg px-3 py-2 border border-blue-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">💡</span>
                        <span className="text-xs font-bold text-blue-800">Going into next round</span>
                      </div>
                      <p className="text-[11px] text-blue-700 leading-relaxed">{myAnalysis.nextRoundAdvice}</p>
                    </div>
                  </div>

                  {/* Market Summary (compact) */}
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Market Summary</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{analysis.overallSummary}</p>

                    {/* Who set the price */}
                    <div className="space-y-1.5">
                      {analysis.periodAnalyses.map((pa) => (
                        <div key={pa.timePeriod} className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400 w-16 flex-shrink-0">
                            {TIME_PERIOD_SHORT_LABELS[pa.timePeriod]}
                          </span>
                          <span className="font-mono font-bold text-blue-600 w-16 flex-shrink-0">
                            ${formatNumber(pa.clearingPriceMWh)}
                          </span>
                          <span className="text-gray-500 truncate">
                            Set by {pa.priceSetterTeam}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Takeaways */}
                  <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-4">
                    <h3 className="text-sm font-semibold text-amber-800 mb-2">Key Takeaways</h3>
                    {analysis.keyTakeaways.map((t: string, i: number) => (
                      <p key={i} className="text-xs text-amber-700 mb-1 flex items-start gap-1.5">
                        <span className="mt-0.5 flex-shrink-0">•</span>
                        <span>{t}</span>
                      </p>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Game Over */}
        {phase === 'final' && (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-800">Game Over!</h2>

            <div className="mt-6 space-y-2">
              {(gameState?.leaderboard || []).map((entry, i) => (
                <div
                  key={entry.teamId}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    entry.teamId === team.id ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-gray-200'
                  }`}
                >
                  <span className="text-2xl">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="font-semibold text-gray-800 flex-1">{entry.teamName}</span>
                  <span className={`font-mono font-bold ${
                    entry.cumulativeProfitDollars >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(entry.cumulativeProfitDollars)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => {
                  clearSession();
                  navigate('/team/join');
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  clearSession();
                  navigate('/');
                }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Submit Bar (during bidding) */}
      {phase === 'bidding' && !submitted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-3 z-50">
          {submitError && (
            <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs leading-snug">
              {submitError}
            </div>
          )}
          <button
            onClick={() => { setSubmitError(null); setShowBidReview(true); }}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-base rounded-xl shadow-md active:scale-[0.98] transition-transform"
          >
            Review Bids
          </button>
        </div>
      )}

      {/* Zero Capacity Warning Modal (always-on, not gated by guardrails) */}
      {zeroCapWarning && (
        <ZeroCapacityWarningModal
          missingBids={zeroCapWarning}
          onConfirm={() => {
            setZeroCapWarning(null);
            proceedWithSubmit(true); // skip zero-cap check on retry
          }}
          onCancel={() => setZeroCapWarning(null)}
        />
      )}

      {/* Bid Review Modal */}
      {showBidReview && roundConfig && (
        <BidReviewModal
          bids={bids}
          assets={assets}
          assetDefs={assetDefs}
          periods={roundConfig.timePeriods as TimePeriod[]}
          demandPerPeriod={gameState?.fleetInfo?.demandMW || {}}
          teamCount={gameState?.expectedTeamCount || gameState?.teams?.length || 1}
          season={roundConfig.season}
          batteryModes={batteryModes}
          chargeMWs={chargeMWs}
          onConfirm={() => {
            setShowBidReview(false);
            handleSubmit();
          }}
          onCancel={() => setShowBidReview(false)}
        />
      )}

      {/* Merit Order Walkthrough Modal */}
      {showWalkthrough && roundResults && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
          <div className="bg-navy-900 border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Merit Order Walkthrough</h2>
                <p className="text-xs text-navy-400">See how bids stack up and set the clearing price</p>
              </div>
              <button
                onClick={() => setShowWalkthrough(false)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <MeritOrderWalkthrough
                periodResults={roundResults.periodResults}
                onClose={() => setShowWalkthrough(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Strategy Guide */}
      {showStrategyGuide && (
        <StrategyGuide onClose={() => setShowStrategyGuide(false)} />
      )}

      {/* How to Bid Tutorial */}
      {showHowToBid && (
        <HowToBidTutorial onClose={() => setShowHowToBid(false)} />
      )}

      {/* Round Briefing (re-viewable) */}
      {showRoundBriefing && roundConfig && gameState?.fleetInfo && (
        <div className="fixed inset-0 z-[100]">
          <RoundBriefing
            roundConfig={roundConfig}
            roundNumber={gameState.currentRound || 1}
            totalRounds={gameState.totalRounds || 8}
            fleetInfo={gameState.fleetInfo}
            teamCount={gameState.expectedTeamCount || gameState.teams?.length || 1}
            scenarioEvents={gameState.activeScenarioEventDetails}
            surpriseIncidents={gameState.surpriseIncidents}
            preSurpriseDemandMW={gameState.preSurpriseDemandMW}
            onClose={() => setShowRoundBriefing(false)}
          />
        </div>
      )}

      {/* Common Mistakes */}
      {showCommonMistakes && (
        <CommonMistakes onClose={() => setShowCommonMistakes(false)} />
      )}

      {/* Battery Explainer */}
      {showBatteryExplainer && (
        <BatteryExplainer onClose={() => setShowBatteryExplainer(false)} />
      )}

      {/* Portfolio Explainer */}
      {showPortfolioExplainer && (
        <PortfolioExplainer onClose={() => {
          setShowPortfolioExplainer(false);
          if (roundConfig?.portfolioExplainer && !portfolioExplainerCompleted) {
            setPortfolioExplainerCompleted(true);
            notifyMinigameCompleted();
          }
        }} />
      )}

      {/* Battery Arbitrage Mini-Game */}
      {showBatteryMiniGame && (
        <BatteryArbitrageMiniGame
          onComplete={(result) => {
            setShowBatteryMiniGame(false);
            if (roundConfig?.minigameOnlyRound) {
              // Standalone minigame round: send scores directly, skip explainer
              setBatteryMiniGameCompleted(true);
              notifyMinigameCompleted({
                totalProfit: result.totalProfit,
                optimalProfit: result.optimalProfit,
                predispatchOptimalProfit: result.predispatchOptimalProfit,
                decisionsCorrect: result.decisionsCorrect ?? 0,
                decisionsTotal: result.decisionsTotal ?? 24,
              });
            } else {
              setShowBatteryBiddingExplainer(true);
            }
          }}
          onSkip={() => {
            setShowBatteryMiniGame(false);
            if (roundConfig?.minigameOnlyRound) {
              setBatteryMiniGameCompleted(true);
              notifyMinigameCompleted({
                totalProfit: 0,
                optimalProfit: 0,
                decisionsCorrect: 0,
                decisionsTotal: 24,
              });
            } else {
              setShowBatteryBiddingExplainer(true);
            }
          }}
        />
      )}

      {/* Waiting screen for standalone minigame rounds after completion */}
      {roundConfig?.minigameOnlyRound && batteryMiniGameCompleted && gameState?.phase === 'briefing' && (
        <div className="fixed inset-0 z-[80] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">&#9989;</div>
            <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>
            <p className="text-slate-400">Waiting for other teams to finish...</p>
            <div className="mt-4 w-8 h-8 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}

      {showBatteryBiddingExplainer && (
        <BatteryBiddingExplainer
          onComplete={() => {
            setShowBatteryBiddingExplainer(false);
            setBatteryMiniGameCompleted(true);
            notifyMinigameCompleted();
          }}
        />
      )}

      {/* Round Bidding Guide — shows what changed this round */}
      {showRoundBiddingGuide && roundConfig && (
        <RoundBiddingGuide
          currentRound={gameState?.currentRound || 1}
          previousRound={prevRoundConfigRef.current ? (gameState?.currentRound || 1) - 1 : null}
          periodCount={roundConfig.timePeriods.length}
          previousPeriodCount={prevRoundConfigRef.current?.timePeriods.length ?? null}
          newAssetTypes={roundConfig.newAssetsUnlocked || []}
          maxBidBands={roundConfig.maxBidBandsPerAsset || 10}
          previousMaxBidBands={prevRoundConfigRef.current?.maxBidBandsPerAsset ?? null}
          season={roundConfig.season || 'autumn'}
          previousSeason={prevRoundConfigRef.current?.season ?? null}
          hasScenarioEvents={(roundConfig.activeScenarioEvents || []).length > 0}
          scenarioEventNames={roundConfig.activeScenarioEvents || []}
          hasBattery={(assets || []).some(a => a.type === 'battery')}
          previousHasBattery={(assets || []).some(a => a.type === 'battery') && !(roundConfig.newAssetsUnlocked || []).includes('battery')}
          onDismiss={() => setShowRoundBiddingGuide(false)}
        />
      )}

      {/* Cinematic Transitions */}
      <GameStartTransition
        isVisible={showGameStart}
        teamCount={gameState?.teams?.length || 0}
        totalRounds={gameState?.totalRounds || 8}
        gameMode={gameState?.gameMode}
        onComplete={() => setShowGameStart(false)}
      />
      <RoundStartTransition
        isVisible={showRoundStart}
        roundNumber={gameState?.currentRound || 1}
        totalRounds={gameState?.totalRounds || 8}
        roundName={roundConfig?.name || `Round ${gameState?.currentRound || 1}`}
        season={roundConfig?.season || 'summer'}
        onComplete={() => setShowRoundStart(false)}
      />
    </div>
  );
}
