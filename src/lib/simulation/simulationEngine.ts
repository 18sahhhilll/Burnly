import { MonthlyProjection, SimulationInput, SimulationOutput } from '@/types/simulation';
import { evaluateRules } from './ruleEngine';
import { calculateRiskScore } from './riskScorer';

export function runSimulation(input: SimulationInput): SimulationOutput {
  const {
    investmentAmount,
    existingCash,
    currentMonthlyRevenue,
    monthlyGrowthRate,
    grossMargin,
    churnRate,
    marketingSpend,
    infraSpend,
    opsSpend,
    founderSalary,
    plannedHires,
    projectionMonths = 36,
  } = input;

  const totalStartingCapital = investmentAmount + existingCash;
  const projections: MonthlyProjection[] = [];

  let currentCash = totalStartingCapital;
  let currentRevenue = currentMonthlyRevenue;
  let breakEvenMonth: number | null = null;
  let runwayMonths = projectionMonths;
  let cashRanOut = false;

  for (let m = 1; m <= projectionMonths; m++) {
    const startingCash = currentCash;

    // Revenue projection
    if (m > 1) {
      const netGrowthFactor = 1 + (monthlyGrowthRate - churnRate) / 100;
      currentRevenue = Math.max(0, currentRevenue * netGrowthFactor);
    }

    const grossProfit = currentRevenue * (grossMargin / 100);

    // Active hires in month m
    const activeHires = plannedHires.filter((h) => h.startMonth <= m);
    const payrollExpense = activeHires.reduce((sum, h) => sum + h.monthlySalary, 0);

    const totalExpenses =
      payrollExpense + marketingSpend + infraSpend + opsSpend + founderSalary;

    const grossBurn = totalExpenses;
    const netBurn = totalExpenses - currentRevenue;

    const isBreakEven = currentRevenue >= totalExpenses;
    if (isBreakEven && breakEvenMonth === null) {
      breakEvenMonth = m;
    }

    let endingCash = startingCash - netBurn;

    if (endingCash <= 0 && !cashRanOut) {
      cashRanOut = true;
      // Fractional runway calculation
      if (netBurn > 0) {
        runwayMonths = (m - 1) + Math.max(0, startingCash) / netBurn;
      } else {
        runwayMonths = m - 1;
      }
      endingCash = 0;
    } else if (cashRanOut) {
      endingCash = 0;
    }

    projections.push({
      month: m,
      monthLabel: `Month ${m}`,
      startingCash: Math.round(startingCash),
      endingCash: Math.round(Math.max(0, endingCash)),
      revenue: Math.round(currentRevenue),
      grossProfit: Math.round(grossProfit),
      payrollExpense: Math.round(payrollExpense),
      marketingExpense: Math.round(marketingSpend),
      infraExpense: Math.round(infraSpend),
      opsExpense: Math.round(opsSpend),
      founderSalaryExpense: Math.round(founderSalary),
      totalExpenses: Math.round(totalExpenses),
      grossBurn: Math.round(grossBurn),
      netBurn: Math.round(netBurn),
      activeHiresCount: activeHires.length,
      isBreakEven,
    });

    currentCash = Math.max(0, endingCash);
  }

  if (!cashRanOut) {
    runwayMonths = projectionMonths;
  }

  const initialNetBurn = projections[0]?.netBurn || 0;
  const peakNetBurn = Math.max(...projections.map((p) => p.netBurn), 0);

  const riskScore = calculateRiskScore(input, projections, runwayMonths, breakEvenMonth);
  const suggestions = evaluateRules(input, projections, runwayMonths, breakEvenMonth);

  return {
    input,
    projections,
    runwayMonths: Number(runwayMonths.toFixed(1)),
    breakEvenMonth,
    initialNetBurn,
    peakNetBurn,
    totalStartingCapital,
    riskScore,
    suggestions,
  };
}
