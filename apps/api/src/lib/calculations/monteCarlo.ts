export interface MonteCarloParams {
  monthlyInvestment: number;
  lumpSum: number;
  timePeriodYears: number;
  expectedCAGR: number; // annual decimal e.g. 0.12 for 12%
  stdDev: number; // annual volatility decimal e.g. 0.15 for 15%
  simulations?: number; // default 10,000
  seed?: number; // optional seed for deterministic reproducibility
}

export interface MonteCarloResult {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  projectedCorpus: number;
}

/**
 * Creates a mulberry32 pseudo-random number generator.
 */
function createMulberry32(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates standard normal random variate using Box-Muller transform.
 */
function sampleNormal(randomFn: () => number): number {
  let u1 = randomFn();
  const u2 = randomFn();

  while (u1 <= 1e-15) {
    u1 = randomFn();
  }

  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Runs a Monte Carlo wealth simulation across thousands of market scenarios.
 *
 * @param params - Simulation configuration
 * @returns Statistical distribution of projected wealth corpus
 */
export function runMonteCarloSimulation(params: MonteCarloParams): MonteCarloResult {
  const {
    monthlyInvestment,
    lumpSum,
    timePeriodYears,
    expectedCAGR,
    stdDev,
    simulations = 10000,
    seed,
  } = params;

  const totalMonths = Math.round(timePeriodYears * 12);
  const randomFn = seed !== undefined ? createMulberry32(seed) : Math.random;

  // Monthly expected return and monthly volatility parameters
  const monthlyMean = Math.pow(1 + expectedCAGR, 1 / 12) - 1;
  const monthlyStdDev = stdDev / Math.sqrt(12);

  const finalValues: number[] = new Array(simulations);

  for (let sim = 0; sim < simulations; sim++) {
    let corpus = lumpSum;

    for (let m = 0; m < totalMonths; m++) {
      // Add monthly SIP contribution at the start of each month
      corpus += monthlyInvestment;

      // Sample monthly market return
      const z = sampleNormal(randomFn);
      const monthlyReturn = monthlyMean + monthlyStdDev * z;

      corpus *= 1 + monthlyReturn;
      if (corpus < 0) corpus = 0;
    }

    finalValues[sim] = corpus;
  }

  // Sort ascending for percentile computation
  finalValues.sort((a, b) => a - b);

  const getPercentile = (p: number): number => {
    const idx = Math.min(
      Math.floor((p / 100) * (simulations - 1)),
      simulations - 1,
    );
    return Math.round(finalValues[idx]!);
  };

  const p10 = getPercentile(10);
  const p25 = getPercentile(25);
  const p50 = getPercentile(50);
  const p75 = getPercentile(75);
  const p90 = getPercentile(90);

  return {
    p10,
    p25,
    p50,
    p75,
    p90,
    projectedCorpus: p50,
  };
}
