// ─── Battery Profit Simulator ────────────────────────────────────────────────
//
// Simulates a battery operating over 24 hourly intervals, computing profit,
// SOC history, and per-interval breakdowns.
//
// Efficiency model (matches BatteryArbitrageMiniGame.tsx):
//   Charge:    draws maxMW from grid, stores maxMW * RTE in battery.
//              Cost = maxMW * price. Limited by headroom / RTE.
//   Discharge: depletes min(maxMW, SOC) from battery, injects that to grid.
//              Revenue = discharged * price.
//   Idle:      no change to SOC or profit.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ForecastBatteryMode,
  BatterySpec,
  StrategyResult,
  BatteryDispatchInterval,
} from '@shared/battery-forecast-types';

const HOURS = 24;

/**
 * Simulate a battery operating over 24 hourly intervals.
 *
 * @param decisions  - Array of 24 charge/idle/discharge decisions
 * @param prices     - Array of 24 hourly prices ($/MWh)
 * @param battery    - Battery specification (capacity, power, efficiency)
 * @param initialSOCMWh - Starting state of charge in MWh
 * @param label      - Human-readable label for this strategy result
 * @returns Full StrategyResult with profit breakdown and SOC history
 */
export function simulateBatteryProfit(
  decisions: ForecastBatteryMode[],
  prices: number[],
  battery: BatterySpec,
  initialSOCMWh: number,
  label: string,
): StrategyResult {
  if (decisions.length !== HOURS) {
    throw new Error(`Expected ${HOURS} decisions, got ${decisions.length}`);
  }
  if (prices.length !== HOURS) {
    throw new Error(`Expected ${HOURS} prices, got ${prices.length}`);
  }

  const { maxMW, maxStorageMWh, roundTripEfficiency } = battery;

  let soc = Math.max(0, Math.min(maxStorageMWh, initialSOCMWh));
  let totalProfit = 0;
  let totalChargeMWh = 0;
  let totalDischargeMWh = 0;
  let chargeSpend = 0;       // Total $ spent charging
  let dischargeRevenue = 0;  // Total $ earned discharging
  let chargeHours = 0;
  let dischargeHours = 0;
  let idleHours = 0;

  const socHistory: number[] = [soc];
  const intervalProfits: number[] = [];

  for (let h = 0; h < HOURS; h++) {
    const price = prices[h];
    const decision = decisions[h];
    let hourProfit = 0;

    if (decision === 'charge') {
      // How much grid energy can we draw before storage is full?
      // Storage headroom / efficiency = max grid draw that fills remaining capacity
      const roomForCharge = (maxStorageMWh - soc) / roundTripEfficiency;
      const chargeAmount = Math.min(maxMW, roomForCharge);

      if (chargeAmount > 0.001) {
        const energyStored = chargeAmount * roundTripEfficiency;
        soc += energyStored;
        hourProfit = -(price * chargeAmount);

        totalChargeMWh += chargeAmount;
        chargeSpend += price * chargeAmount;
        chargeHours++;
      } else {
        // Battery full, effectively idle
        idleHours++;
      }
    } else if (decision === 'discharge') {
      const dischargeAmount = Math.min(maxMW, soc);

      if (dischargeAmount > 0.001) {
        soc -= dischargeAmount;
        hourProfit = price * dischargeAmount;

        totalDischargeMWh += dischargeAmount;
        dischargeRevenue += price * dischargeAmount;
        dischargeHours++;
      } else {
        // Battery empty, effectively idle
        idleHours++;
      }
    } else {
      // idle
      idleHours++;
    }

    totalProfit += hourProfit;
    intervalProfits.push(Math.round(hourProfit * 100) / 100);
    socHistory.push(Math.round(soc * 1000) / 1000); // sub-kWh precision
  }

  return {
    label,
    totalProfit: Math.round(totalProfit * 100) / 100,
    socHistory,
    intervalProfits,
    decisions: [...decisions],
    totalChargeMWh: Math.round(totalChargeMWh * 100) / 100,
    totalDischargeMWh: Math.round(totalDischargeMWh * 100) / 100,
    avgChargePrice: chargeHours > 0
      ? Math.round((chargeSpend / totalChargeMWh) * 100) / 100
      : 0,
    avgDischargePrice: dischargeHours > 0
      ? Math.round((dischargeRevenue / totalDischargeMWh) * 100) / 100
      : 0,
    chargeHours,
    dischargeHours,
    idleHours,
  };
}

/** Derive charge/idle/discharge decisions from actual MW output data */
export function deriveBatteryDecisions(
  batteryActual: BatteryDispatchInterval[],
  maxMW: number,
): ForecastBatteryMode[] {
  const decisions: ForecastBatteryMode[] = [];
  const threshold = maxMW * 0.1; // 10% of max as noise threshold

  for (let h = 0; h < 24; h++) {
    const interval = batteryActual.find(b => b.hour === h);
    if (!interval) {
      decisions.push('idle');
      continue;
    }

    if (interval.mwOutput < -threshold) {
      decisions.push('charge');
    } else if (interval.mwOutput > threshold) {
      decisions.push('discharge');
    } else {
      decisions.push('idle');
    }
  }

  return decisions;
}
