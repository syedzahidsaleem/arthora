/**
 * Calculates Extended Internal Rate of Return (XIRR) using the Newton-Raphson method.
 *
 * @param cashflows - Array of cashflow objects: negative amount = outflow (investment), positive amount = inflow (redemption/current value)
 * @param guess - Initial discount rate guess (default 0.1 for 10%)
 * @returns Annualized internal rate of return as decimal (e.g. 0.165 for 16.5%)
 */
export function calculateXIRR(
  cashflows: Array<{ date: Date; amount: number }>,
  guess = 0.1,
): number {
  if (!cashflows || cashflows.length < 2) {
    throw new Error('XIRR requires at least 2 cashflow transactions');
  }

  // Verify at least one positive and one negative cashflow
  let hasPositive = false;
  let hasNegative = false;
  for (const cf of cashflows) {
    if (cf.amount > 0) hasPositive = true;
    if (cf.amount < 0) hasNegative = true;
  }
  if (!hasPositive || !hasNegative) {
    throw new Error('XIRR requires at least one positive and one negative cashflow');
  }

  // Sort cashflows chronologically
  const sorted = [...cashflows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const d0 = new Date(sorted[0]!.date).getTime();

  let rate = guess;
  const maxIterations = 100;
  const tolerance = 0.00001;

  for (let iter = 0; iter < maxIterations; iter++) {
    let fValue = 0;
    let fDerivative = 0;

    for (const cf of sorted) {
      const dt = (new Date(cf.date).getTime() - d0) / (1000 * 60 * 60 * 24 * 365.0);
      const denominator = Math.pow(1 + rate, dt);

      if (denominator === 0 || !isFinite(denominator)) {
        break;
      }

      fValue += cf.amount / denominator;
      fDerivative -= (dt * cf.amount) / (denominator * (1 + rate));
    }

    if (Math.abs(fValue) < tolerance) {
      return rate;
    }

    if (Math.abs(fDerivative) < 1e-12) {
      break;
    }

    const newRate = rate - fValue / fDerivative;

    // Constrain rate boundaries to prevent wild divergence
    if (newRate <= -0.999) {
      rate = (rate - 0.999) / 2;
    } else {
      rate = newRate;
    }

    if (Math.abs(newRate - rate) < tolerance) {
      return rate;
    }
  }

  // Return the closest approximate solution or throw if invalid
  if (isFinite(rate)) {
    return rate;
  }

  throw new Error('XIRR computation failed to converge within maximum iterations');
}
