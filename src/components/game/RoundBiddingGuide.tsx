import { useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSET_TYPE_LABELS } from '../../../shared/types';
import type { AssetType } from '../../../shared/types';

interface RoundBiddingGuideProps {
  currentRound: number;
  previousRound: number | null;
  periodCount: number;
  previousPeriodCount: number | null;
  newAssetTypes: string[];
  maxBidBands: number;
  previousMaxBidBands: number | null;
  season: string;
  previousSeason: string | null;
  hasScenarioEvents: boolean;
  scenarioEventNames: string[];
  hasBattery: boolean;
  previousHasBattery: boolean;
  onDismiss: () => void;
}

// ---- Change card types ----

interface ChangeCard {
  id: string;
  icon: string;
  heading: string;
  description: string;
  accentColor: string;
}

// ---- Helpers ----

const SEASON_ICONS: Record<string, string> = {
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
  spring: '🌸',
};

const SEASON_NOTES: Record<string, string> = {
  summer:
    'Hot days drive air-conditioning demand higher, especially in the afternoon. Solar output is strong but evening peaks can be extreme.',
  autumn:
    'Moderate demand. Wind picks up and solar fades earlier. A balanced season for portfolio management.',
  winter:
    'Cold mornings and evenings push heating demand. Solar output drops significantly. Gas and coal become more critical.',
  spring:
    'Mild temperatures and strong renewables. Watch for oversupply during the day — negative prices are possible!',
};

const SCENARIO_LABELS: Record<string, string> = {
  drought: 'Drought',
  heatwave: 'Heatwave',
  heatwave_extreme: 'Extreme Heatwave',
  cold_snap: 'Cold Snap',
  plant_outage: 'Plant Outage',
  plant_outage_random: 'Plant Outage',
  dunkelflaute: 'Dunkelflaute',
  fuel_price_spike: 'Fuel Price Spike',
  demand_response: 'Demand Response',
  carbon_price: 'Carbon Price',
  negative_prices: 'Negative Prices',
  balancing_penalty: 'Balancing Penalty',
};

const SCENARIO_DESCRIPTIONS: Record<string, string> = {
  drought:
    'Water scarcity reduces hydro availability. Expect tighter supply and higher prices.',
  heatwave:
    'Extreme heat boosts demand from air conditioning. Afternoon peaks will be intense.',
  heatwave_extreme:
    'Record-breaking heat. Demand spikes sharply — every MW counts. Price cap territory!',
  cold_snap:
    'A cold front drives heating demand up, especially in the morning and evening.',
  plant_outage:
    'A major generator is offline! Less supply means higher clearing prices.',
  plant_outage_random:
    'A major generator has tripped! Less supply means higher clearing prices.',
  dunkelflaute:
    'No wind and no sun. Renewables output drops to near zero. Thermal plants dominate.',
  fuel_price_spike:
    'Gas prices have surged. Marginal costs for gas plants are significantly higher.',
  demand_response:
    'Large consumers are reducing load. Demand drops, which may lower prices.',
  carbon_price:
    'A carbon price is active. Coal and gas costs increase proportionally to emissions.',
  negative_prices:
    'Oversupply risk is high. Prices could go negative — be careful with your bids!',
  balancing_penalty:
    'Penalties apply for capacity that fails to deliver. Bid only what you can supply.',
};

const PERIOD_NAMES: Record<number, string> = {
  1: '1 period (full day)',
  2: '2 periods (day & night)',
  4: '4 periods (overnight, morning, afternoon, evening)',
};

function getAssetCategoryIcon(assetType: string): string {
  const icons: Record<string, string> = {
    coal: '🏭',
    gas_ccgt: '🔥',
    gas_peaker: '⚡',
    hydro: '💧',
    wind: '🌬️',
    solar: '☀️',
    battery: '🔋',
  };
  return icons[assetType] || '⚡';
}

function formatAssetLabel(type: string): string {
  return ASSET_TYPE_LABELS[type as AssetType] || type;
}

const STORAGE_KEY_PREFIX = 'round-bidding-guide-dismissed-';

// ---- Component ----

export default function RoundBiddingGuide({
  currentRound,
  previousRound,
  periodCount,
  previousPeriodCount,
  newAssetTypes,
  maxBidBands,
  previousMaxBidBands,
  season,
  previousSeason,
  hasScenarioEvents,
  scenarioEventNames,
  hasBattery,
  previousHasBattery,
  onDismiss,
}: RoundBiddingGuideProps) {
  // ---- Dismissed state via sessionStorage ----

  const storageKey = `${STORAGE_KEY_PREFIX}${currentRound}`;

  const wasDismissed = useMemo(() => {
    try {
      return sessionStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  }, [storageKey]);

  const handleDismiss = useCallback(() => {
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // sessionStorage may be unavailable
    }
    onDismiss();
  }, [storageKey, onDismiss]);

  // ---- Build change cards ----

  const cards = useMemo<ChangeCard[]>(() => {
    const result: ChangeCard[] = [];
    const isFirstRound = previousRound === null;

    // 1. First round welcome
    if (isFirstRound) {
      result.push({
        id: 'welcome',
        icon: '🎯',
        heading: 'Your First Round',
        description:
          "Review your assets, check demand, set your bids. Use the strategy presets if you're unsure!",
        accentColor: 'electric',
      });
    }

    // 2. More periods
    if (previousPeriodCount !== null && periodCount > previousPeriodCount) {
      const periodDescription =
        PERIOD_NAMES[periodCount] || `${periodCount} time periods`;
      result.push({
        id: 'periods',
        icon: '⏰',
        heading: `NEW: ${periodCount} Time Periods`,
        description: `You now bid for ${periodDescription}. Each has different demand — check the demand % indicator.`,
        accentColor: 'amber',
      });
    }

    // 3. New assets
    for (const assetType of newAssetTypes) {
      if (assetType === 'wind') {
        result.push({
          id: `asset-${assetType}`,
          icon: '🌬️',
          heading: 'NEW: Wind Farm',
          description:
            'Zero cost, auto-bids at $0. Output varies by period — check your available MW. No action needed!',
          accentColor: 'green',
        });
      } else if (assetType === 'solar') {
        result.push({
          id: `asset-${assetType}`,
          icon: '☀️',
          heading: 'NEW: Solar Farm',
          description:
            'Zero cost, daytime only. Zero output overnight, strongest in the afternoon. Auto-bids at $0.',
          accentColor: 'yellow',
        });
      } else if (assetType === 'hydro') {
        result.push({
          id: `asset-${assetType}`,
          icon: '💧',
          heading: 'NEW: Hydro Plant',
          description:
            'Limited water! Pick ONE period to dispatch — choose the highest-price period.',
          accentColor: 'blue',
        });
      } else if (['coal', 'gas_ccgt', 'gas_peaker'].includes(assetType)) {
        result.push({
          id: `asset-${assetType}`,
          icon: getAssetCategoryIcon(assetType),
          heading: `NEW: ${formatAssetLabel(assetType)}`,
          description: `A new ${formatAssetLabel(assetType).toLowerCase()} plant has been added to your portfolio. Check its Marginal Cost badge — it costs more than coal!`,
          accentColor: 'orange',
        });
      } else {
        result.push({
          id: `asset-${assetType}`,
          icon: getAssetCategoryIcon(assetType),
          heading: `NEW: ${formatAssetLabel(assetType)}`,
          description: `A new ${formatAssetLabel(assetType).toLowerCase()} asset has been added to your portfolio.`,
          accentColor: 'purple',
        });
      }
    }

    // 4. Battery introduced
    if (hasBattery && !previousHasBattery) {
      result.push({
        id: 'battery',
        icon: '🔋',
        heading: 'NEW: Battery Storage',
        description:
          'Toggle Charge/Idle/Discharge each period. Charge low, discharge high. Watch your SOC bar!',
        accentColor: 'purple',
      });
    }

    // 5. More bid bands
    if (previousMaxBidBands !== null && maxBidBands > previousMaxBidBands) {
      result.push({
        id: 'bid-bands',
        icon: '📊',
        heading: `More Bid Bands: ${maxBidBands}`,
        description: `You can now split your capacity across ${maxBidBands} bands per asset. More bands = more strategic flexibility.`,
        accentColor: 'indigo',
      });
    }

    // 6. Season changed
    if (previousSeason !== null && season !== previousSeason) {
      const seasonIcon = SEASON_ICONS[season] || '🌍';
      const seasonLabel = season.charAt(0).toUpperCase() + season.slice(1);
      const seasonNote =
        SEASON_NOTES[season] ||
        'A new season brings different demand patterns and renewable output.';
      result.push({
        id: 'season',
        icon: seasonIcon,
        heading: `Season: ${seasonLabel}`,
        description: seasonNote,
        accentColor:
          season === 'winter'
            ? 'blue'
            : season === 'summer'
              ? 'amber'
              : season === 'autumn'
                ? 'orange'
                : 'green',
      });
    }

    // 7. Scenario events
    if (hasScenarioEvents && scenarioEventNames.length > 0) {
      for (const eventName of scenarioEventNames) {
        const label =
          SCENARIO_LABELS[eventName] ||
          eventName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
        const description =
          SCENARIO_DESCRIPTIONS[eventName] ||
          'A special scenario event is active this round. Adjust your strategy accordingly.';
        result.push({
          id: `scenario-${eventName}`,
          icon: '⚠️',
          heading: `SCENARIO: ${label}`,
          description,
          accentColor: 'red',
        });
      }
    }

    return result;
  }, [
    previousRound,
    periodCount,
    previousPeriodCount,
    newAssetTypes,
    maxBidBands,
    previousMaxBidBands,
    season,
    previousSeason,
    hasScenarioEvents,
    scenarioEventNames,
    hasBattery,
    previousHasBattery,
  ]);

  // ---- Auto-dismiss if nothing to show ----

  useEffect(() => {
    if (cards.length === 0 || wasDismissed) {
      onDismiss();
    }
  }, [cards.length, wasDismissed, onDismiss]);

  // ---- Prevent body scroll ----

  useEffect(() => {
    if (cards.length === 0 || wasDismissed) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [cards.length, wasDismissed]);

  // ---- Keyboard dismiss ----

  useEffect(() => {
    if (cards.length === 0 || wasDismissed) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cards.length, wasDismissed, handleDismiss]);

  // ---- Don't render if dismissed or nothing to show ----

  if (cards.length === 0 || wasDismissed) {
    return null;
  }

  // ---- Accent color mapping for card borders/backgrounds ----

  const accentStyles: Record<
    string,
    { border: string; bg: string; iconBg: string; headingText: string }
  > = {
    electric: {
      border: 'border-electric-500/30',
      bg: 'bg-electric-500/5',
      iconBg: 'bg-electric-500/15',
      headingText: 'text-electric-300',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      iconBg: 'bg-amber-500/15',
      headingText: 'text-amber-300',
    },
    green: {
      border: 'border-green-500/30',
      bg: 'bg-green-500/5',
      iconBg: 'bg-green-500/15',
      headingText: 'text-green-300',
    },
    yellow: {
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/5',
      iconBg: 'bg-yellow-500/15',
      headingText: 'text-yellow-300',
    },
    blue: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      iconBg: 'bg-blue-500/15',
      headingText: 'text-blue-300',
    },
    orange: {
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/5',
      iconBg: 'bg-orange-500/15',
      headingText: 'text-orange-300',
    },
    purple: {
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/5',
      iconBg: 'bg-purple-500/15',
      headingText: 'text-purple-300',
    },
    indigo: {
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-500/5',
      iconBg: 'bg-indigo-500/15',
      headingText: 'text-indigo-300',
    },
    red: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      iconBg: 'bg-red-500/15',
      headingText: 'text-red-300',
    },
  };

  const fallbackAccent = accentStyles.electric;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
          onClick={handleDismiss}
        />

        {/* Card container */}
        <motion.div
          className="relative z-10 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="bg-navy-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-500/15 flex items-center justify-center text-xl">
                  📋
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Round {currentRound} — What's New
                  </h2>
                  <p className="text-xs text-navy-400 mt-0.5">
                    {cards.length === 1
                      ? '1 change this round'
                      : `${cards.length} changes this round`}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable card stack */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cards.map((card, index) => {
                const accent =
                  accentStyles[card.accentColor] || fallbackAccent;
                return (
                  <motion.div
                    key={card.id}
                    className={`rounded-xl border ${accent.border} ${accent.bg} p-4`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.08 }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg ${accent.iconBg} flex items-center justify-center text-lg flex-shrink-0`}
                      >
                        {card.icon}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className={`text-sm font-bold ${accent.headingText}`}
                        >
                          {card.heading}
                        </h3>
                        <p className="text-xs text-navy-200 mt-1 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer with dismiss button */}
            <div className="px-6 pb-6 pt-3 border-t border-white/5">
              <button
                onClick={handleDismiss}
                className="w-full py-3 bg-electric-500 hover:bg-electric-400 active:bg-electric-600 text-white font-bold text-sm rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-electric-400 focus:ring-offset-2 focus:ring-offset-navy-900"
              >
                Got it!
              </button>
              <p className="text-center text-[10px] text-navy-500 mt-2">
                Press{' '}
                <kbd className="px-1 py-0.5 bg-white/10 rounded text-navy-400">
                  Enter
                </kbd>{' '}
                or{' '}
                <kbd className="px-1 py-0.5 bg-white/10 rounded text-navy-400">
                  Esc
                </kbd>{' '}
                to dismiss
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
