import { MonthlyProjection, RiskFactor, RiskScore, SimulationInput } from '@/types/simulation';

export function calculateRiskScore(
  input: SimulationInput,
  projections: MonthlyProjection[],
  runwayMonths: number,
  breakEvenMonth: number | null
): RiskScore {
  const { investmentAmount, existingCash, monthlyGrowthRate, churnRate, founderSalary, plannedHires } = input;
  const totalCapital = Math.max(1, investmentAmount + existingCash);
  const initialBurn = projections[0]?.netBurn || 1;

  const factors: RiskFactor[] = [];

  // Factor 1: Runway Depletion Risk (40% weight)
  let runwayScore = 10;
  let runwaySeverity: 'info' | 'warning' | 'critical' = 'info';
  let runwayDetail = `Healthy runway buffer of ${runwayMonths.toFixed(1)} months.`;

  if (runwayMonths < 6) {
    runwayScore = 95;
    runwaySeverity = 'critical';
    runwayDetail = `Critical runway shortfall (${runwayMonths.toFixed(1)} months). Immediate capital depletion risk.`;
  } else if (runwayMonths < 12) {
    runwayScore = 75;
    runwaySeverity = 'warning';
    runwayDetail = `Tight runway (${runwayMonths.toFixed(1)} months). High dependence on near-term fundraising.`;
  } else if (runwayMonths < 18) {
    runwayScore = 40;
    runwaySeverity = 'info';
    runwayDetail = `Moderate runway (${runwayMonths.toFixed(1)} months). Safe for 1 year, requires planning.`;
  } else if (runwayMonths < 24) {
    runwayScore = 20;
    runwaySeverity = 'info';
    runwayDetail = `Strong runway (${runwayMonths.toFixed(1)} months). Low short-term risk.`;
  }

  factors.push({
    name: 'Runway Depletion Risk',
    score: runwayScore,
    detail: runwayDetail,
    severity: runwaySeverity,
  });

  // Factor 2: Burn Acceleration & Payroll Multiplier (25% weight)
  const peakNetBurn = Math.max(...projections.map((p) => p.netBurn), 0);
  const burnAccelerationRatio = peakNetBurn / Math.max(1, initialBurn);
  let burnScore = 20;
  let burnSeverity: 'info' | 'warning' | 'critical' = 'info';
  let burnDetail = `Controlled burn trajectory (${burnAccelerationRatio.toFixed(1)}x peak/initial burn ratio).`;

  if (burnAccelerationRatio > 2.5) {
    burnScore = 85;
    burnSeverity = 'warning';
    burnDetail = `Rapid burn escalation (${burnAccelerationRatio.toFixed(1)}x peak vs initial burn) due to aggressive hiring.`;
  } else if (burnAccelerationRatio > 1.5) {
    burnScore = 55;
    burnSeverity = 'info';
    burnDetail = `Moderate burn increase (${burnAccelerationRatio.toFixed(1)}x expansion).`;
  }

  factors.push({
    name: 'Burn Acceleration Rate',
    score: burnScore,
    detail: burnDetail,
    severity: burnSeverity,
  });

  // Factor 3: Net Growth & Revenue Drag (20% weight)
  const netMonthlyGrowth = monthlyGrowthRate - churnRate;
  let growthScore = 15;
  let growthSeverity: 'info' | 'warning' | 'critical' = 'info';
  let growthDetail = `Positive net monthly growth trajectory (+${netMonthlyGrowth.toFixed(1)}%/mo).`;

  if (netMonthlyGrowth < 0) {
    growthScore = 90;
    growthSeverity = 'critical';
    growthDetail = `Negative net growth (${netMonthlyGrowth.toFixed(1)}%/mo). Churn exceeds new revenue growth.`;
  } else if (netMonthlyGrowth === 0 && breakEvenMonth === null) {
    growthScore = 65;
    growthSeverity = 'warning';
    growthDetail = `Flat revenue growth (0%/mo). Startup is stagnant and reliant on remaining cash.`;
  } else if (netMonthlyGrowth < 3) {
    growthScore = 40;
    growthSeverity = 'info';
    growthDetail = `Modest growth (+${netMonthlyGrowth.toFixed(1)}%/mo). May delay break-even point.`;
  }

  factors.push({
    name: 'Growth & Churn Dynamics',
    score: growthScore,
    detail: growthDetail,
    severity: growthSeverity,
  });

  // Factor 4: Founder Overhead & Governance (15% weight)
  const founderSalaryRatio = ((founderSalary * 12) / totalCapital) * 100;
  let governanceScore = 10;
  let governanceSeverity: 'info' | 'warning' | 'critical' = 'info';
  let governanceDetail = `Founder compensation accounts for ${founderSalaryRatio.toFixed(1)}% of capital.`;

  if (founderSalaryRatio > 15) {
    governanceScore = 75;
    governanceSeverity = 'warning';
    governanceDetail = `High founder overhead (${founderSalaryRatio.toFixed(1)}% of capital). May flag investor scrutiny.`;
  } else if (founderSalaryRatio > 10) {
    governanceScore = 40;
    governanceSeverity = 'info';
    governanceDetail = `Moderate founder salary ratio (${founderSalaryRatio.toFixed(1)}% of capital).`;
  }

  factors.push({
    name: 'Governance & Salary Overhead',
    score: governanceScore,
    detail: governanceDetail,
    severity: governanceSeverity,
  });

  // Weighted overall calculation
  let overallScore = Math.round(
    runwayScore * 0.4 + burnScore * 0.25 + growthScore * 0.2 + governanceScore * 0.15
  );

  // Critical runway override: if runway < 6 months, score is minimum 75 (High risk)
  if (runwayMonths < 6) {
    overallScore = Math.max(75, overallScore);
  }

  let level: 'Low' | 'Medium' | 'High' = 'Low';
  if (overallScore >= 70) {
    level = 'High';
  } else if (overallScore >= 35) {
    level = 'Medium';
  }

  return {
    score: overallScore,
    level,
    factors,
  };
}
