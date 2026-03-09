// ─── Optimal Battery Strategy Solver (Dynamic Programming) ───────────────────
//
// Finds the profit-maximizing charge/idle/discharge schedule over 24 hours
// using backward-induction DP on discretized SOC states.
//
// Approach:
//   1. Discretize SOC into buckets of SOC_STEP MWh
//   2. Build value table backward from hour 23 to hour 0
//   3. For each (hour, SOC bucket), evaluate all 3 actions
//   4. Reconstruct optimal decisions forward from initial SOC
//   5. Run through simulateBatteryProfit for exact continuous results
//
// The DP handles the discretization; final profit uses the continuous
// simulator to avoid rounding artifacts from bucket snapping.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ForecastBatteryMode,
  BatterySpec,
  StrategyResult,
} from '@shared/battery-forecast-types';
import { simulateBatteryProfit } from './profitSimulator';

const HOURS = 24;
const NEG_INF = -1e15;

/** Actions encoded as integers for typed array storage */
const ACTION_CHARGE = 0;
const ACTION_IDLE = 1;
const ACTION_DISCHARGE = 2;

const ACTION_MAP: ForecastBatteryMode[] = ['charge', 'idle', 'discharge'];

/**
 * Choose an appropriate SOC discretization step for a given battery.
 *
 * Aims for ~25-50 buckets to balance accuracy and performance.
 * For TORRB1 (250 MWh): step = 10 -> 26 buckets.
 * For the tutorial battery (3000 MWh): step = 50 -> 61 buckets.
 */
function chooseSocStep(battery: BatterySpec): number {
  const { maxStorageMWh } = battery;

  // Target roughly 25-60 buckets
  if (maxStorageMWh <= 100) return 5;
  if (maxStorageMWh <= 500) return 10;
  if (maxStorageMWh <= 2000) return 25;
  return 50;
}

/**
 * Find the optimal charge/idle/discharge schedule using backward induction DP.
 *
 * @param prices        - Array of 24 hourly prices ($/MWh)
 * @param battery       - Battery specification
 * @param initialSOCMWh - Starting state of charge in MWh
 * @param label         - Human-readable label for the result
 * @returns StrategyResult with optimal decisions and exact profit
 */
export function calculateOptimalStrategy(
  prices: number[],
  battery: BatterySpec,
  initialSOCMWh: number,
  label: string,
): StrategyResult {
  if (prices.length !== HOURS) {
    throw new Error(`Expected ${HOURS} prices, got ${prices.length}`);
  }

  const { maxMW, maxStorageMWh, roundTripEfficiency } = battery;
  const socStep = chooseSocStep(battery);
  const numBuckets = Math.floor(maxStorageMWh / socStep) + 1;

  // ─── Allocate DP tables ──────────────────────────────────────────────────
  // dp[h][bucket] = max profit achievable from hour h onward when starting
  //                 at SOC = bucket * socStep
  // bestAction[h][bucket] = which action achieves that max

  const dp: Float64Array[] = [];
  const bestAction: Uint8Array[] = [];

  for (let h = 0; h <= HOURS; h++) {
    dp.push(new Float64Array(numBuckets).fill(NEG_INF));
    bestAction.push(new Uint8Array(numBuckets));
  }

  // Base case: at hour 24 (past the end), any SOC state has 0 future profit
  for (let b = 0; b < numBuckets; b++) {
    dp[HOURS][b] = 0;
  }

  // ─── Backward induction ──────────────────────────────────────────────────

  for (let h = HOURS - 1; h >= 0; h--) {
    const price = prices[h];

    for (let b = 0; b < numBuckets; b++) {
      const soc = b * socStep;

      // --- Evaluate CHARGE ---
      {
        const roomForCharge = (maxStorageMWh - soc) / roundTripEfficiency;
        const chargeAmount = Math.min(maxMW, roomForCharge);

        if (chargeAmount > 0.01) {
          const newSoc = soc + chargeAmount * roundTripEfficiency;
          const hourProfit = -(price * chargeAmount);
          const newBucket = Math.round(newSoc / socStep);

          if (newBucket >= 0 && newBucket < numBuckets) {
            const totalValue = hourProfit + dp[h + 1][newBucket];
            if (totalValue > dp[h][b]) {
              dp[h][b] = totalValue;
              bestAction[h][b] = ACTION_CHARGE;
            }
          }
        }
      }

      // --- Evaluate IDLE ---
      {
        const totalValue = 0 + dp[h + 1][b]; // SOC unchanged, 0 profit
        if (totalValue > dp[h][b]) {
          dp[h][b] = totalValue;
          bestAction[h][b] = ACTION_IDLE;
        }
      }

      // --- Evaluate DISCHARGE ---
      {
        const dischargeAmount = Math.min(maxMW, soc);

        if (dischargeAmount > 0.01) {
          const newSoc = soc - dischargeAmount;
          const hourProfit = price * dischargeAmount;
          const newBucket = Math.round(newSoc / socStep);

          if (newBucket >= 0 && newBucket < numBuckets) {
            const totalValue = hourProfit + dp[h + 1][newBucket];
            if (totalValue > dp[h][b]) {
              dp[h][b] = totalValue;
              bestAction[h][b] = ACTION_DISCHARGE;
            }
          }
        }
      }
    }
  }

  // ─── Reconstruct decisions forward ───────────────────────────────────────

  const initBucket = Math.min(
    numBuckets - 1,
    Math.max(0, Math.round(initialSOCMWh / socStep)),
  );

  const decisions: ForecastBatteryMode[] = [];
  let currentBucket = initBucket;

  for (let h = 0; h < HOURS; h++) {
    const action = bestAction[h][currentBucket];
    const soc = currentBucket * socStep;

    decisions.push(ACTION_MAP[action]);

    if (action === ACTION_CHARGE) {
      const roomForCharge = (maxStorageMWh - soc) / roundTripEfficiency;
      const chargeAmount = Math.min(maxMW, roomForCharge);
      const newSoc = soc + chargeAmount * roundTripEfficiency;
      currentBucket = Math.round(newSoc / socStep);
    } else if (action === ACTION_DISCHARGE) {
      const dischargeAmount = Math.min(maxMW, soc);
      const newSoc = soc - dischargeAmount;
      currentBucket = Math.round(newSoc / socStep);
    }
    // idle: currentBucket unchanged
  }

  // ─── Run through continuous simulator for exact results ──────────────────
  // The DP uses discretized SOC buckets which can introduce small rounding
  // errors. Running the reconstructed decisions through the continuous
  // simulator gives exact profit numbers.

  return simulateBatteryProfit(decisions, prices, battery, initialSOCMWh, label);
}
