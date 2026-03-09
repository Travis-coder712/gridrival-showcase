// ─── Battery Forecast Challenge Types ────────────────────────────────────

export type BatteryForecastPhase = 'BROWSE' | 'INTRO' | 'DECIDE' | 'REVEAL' | 'RESULTS';

export type ForecastBatteryMode = 'charge' | 'idle' | 'discharge';

/** A single hourly interval of market data */
export interface MarketInterval {
  timestamp: string;           // ISO 8601, e.g. "2024-01-15T14:00:00+10:30"
  hour: number;                // 0-23
  predispatchPrice: number;    // $/MWh from pre-dispatch forecast
  actualPrice: number;         // $/MWh actual dispatch price
}

/** Actual battery dispatch data for a DUID (hourly) */
export interface BatteryDispatchInterval {
  timestamp: string;
  hour: number;
  mwOutput: number;            // Positive = discharging, Negative = charging, ~0 = idle
}

/** Battery specification (expandable to any DUID) */
export interface BatterySpec {
  duid: string;                // e.g. "TORRB1"
  name: string;                // e.g. "Torrens Island Battery"
  region: string;              // NEM region, e.g. "SA1"
  maxMW: number;               // Max charge/discharge power
  maxStorageMWh: number;       // Total energy capacity
  roundTripEfficiency: number; // e.g. 0.87
  durationHours: number;       // maxStorageMWh / maxMW
}

/** A curated challenge day (stored as JSON) */
export interface BatteryForecastChallenge {
  id: string;                     // e.g. "2024-01-15-sa1-summer-spike"
  date: string;                   // "2024-01-15"
  title: string;                  // "Summer Evening Price Spike"
  description: string;            // What made this day interesting
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];                 // e.g. ["evening_spike", "heatwave"]
  battery: BatterySpec;
  initialSOCPercent: number;      // Starting SOC as % (0-100)
  intervals: MarketInterval[];    // 24 hourly intervals
  batteryActual: BatteryDispatchInterval[]; // What the real battery did
  metadata: {
    peakPrice: number;
    minPrice: number;
    avgPrice: number;
    priceSpread: number;          // max - min
    negativeIntervals: number;    // count of hours with price < 0
    region: string;
    season: string;
  };
}

/** Metadata-only version for challenge listing (no interval data) */
export interface ChallengeSummary {
  id: string;
  date: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  battery: { duid: string; name: string; region: string };
  metadata: BatteryForecastChallenge['metadata'];
}

/** Player's submitted strategy */
export interface PlayerStrategy {
  playerId: string;
  playerName: string;
  challengeId: string;
  decisions: ForecastBatteryMode[];  // One per interval (24)
  submittedAt: number;
}

/** Computed result for a strategy */
export interface StrategyResult {
  label: string;                     // "Your Strategy", "TORRB1 Actual", "Optimal"
  totalProfit: number;
  socHistory: number[];              // SOC (MWh) after each interval (25 entries: initial + 24)
  intervalProfits: number[];         // Profit per interval (24)
  decisions: ForecastBatteryMode[];  // 24 decisions
  totalChargeMWh: number;
  totalDischargeMWh: number;
  avgChargePrice: number;
  avgDischargePrice: number;
  chargeHours: number;
  dischargeHours: number;
  idleHours: number;
}

/** Full evaluation response from the /evaluate endpoint */
export interface ChallengeEvaluation {
  challengeId: string;
  playerResult: StrategyResult;
  actualBatteryResult: StrategyResult;
  forecastOptimalResult: StrategyResult;  // Best possible with forecast info only
  perfectForesightResult: StrategyResult; // Hindsight optimal on actual prices
}

// ─── Constants ──────────────────────────────────────────────────────────

export const TORRB1_SPEC: BatterySpec = {
  duid: 'TORRB1',
  name: 'Torrens Island Battery',
  region: 'SA1',
  maxMW: 250,
  maxStorageMWh: 250,
  roundTripEfficiency: 0.87,
  durationHours: 1,
};
