import { describe, it, expect } from 'vitest';
import { runSimulation } from '../src/lib/simulation/simulationEngine';
import { SimulationInput } from '../src/types/simulation';

describe('Burnly Financial Simulation Engine', () => {
  const baseInput: SimulationInput = {
    id: 'test-1',
    scenarioName: 'Test Scenario',
    investmentAmount: 500000,
    existingCash: 50000,
    currentMonthlyRevenue: 10000,
    businessModel: 'SaaS',
    monthlyGrowthRate: 10,
    grossMargin: 80,
    cac: 500,
    churnRate: 2,
    marketingSpend: 10000,
    infraSpend: 2000,
    opsSpend: 3000,
    founderSalary: 8000,
    plannedHires: [
      { id: 'h1', role: 'Dev 1', monthlySalary: 8000, startMonth: 2 },
    ],
    projectionMonths: 36,
  };

  it('calculates total starting capital correctly', () => {
    const sim = runSimulation(baseInput);
    expect(sim.totalStartingCapital).toBe(550000);
  });

  it('detects short runway and triggers critical rule alert', () => {
    const highBurnInput: SimulationInput = {
      ...baseInput,
      investmentAmount: 100000,
      existingCash: 0,
      marketingSpend: 30000,
    };

    const sim = runSimulation(highBurnInput);
    expect(sim.runwayMonths).toBeLessThan(6);
    expect(sim.riskScore.level).toBe('High');

    const criticalRunwaySug = sim.suggestions.find((s) => s.id === 'rule-runway-critical');
    expect(criticalRunwaySug).toBeDefined();
    expect(criticalRunwaySug?.severity).toBe('critical');
  });

  it('correctly calculates break-even month when revenue exceeds expenses', () => {
    const highGrowthInput: SimulationInput = {
      ...baseInput,
      currentMonthlyRevenue: 20000,
      monthlyGrowthRate: 15,
      churnRate: 1,
    };

    const sim = runSimulation(highGrowthInput);
    expect(sim.breakEvenMonth).not.toBeNull();
    expect(sim.breakEvenMonth!).toBeGreaterThan(0);
    expect(sim.breakEvenMonth!).toBeLessThanOrEqual(36);
  });

  it('flags aggressive Month 1 hiring velocity', () => {
    const aggressiveHiresInput: SimulationInput = {
      ...baseInput,
      plannedHires: [
        { id: 'h1', role: 'Dev 1', monthlySalary: 8000, startMonth: 1 },
        { id: 'h2', role: 'Dev 2', monthlySalary: 8000, startMonth: 1 },
        { id: 'h3', role: 'Dev 3', monthlySalary: 8000, startMonth: 1 },
      ],
    };

    const sim = runSimulation(aggressiveHiresInput);
    const hiringSug = sim.suggestions.find((s) => s.id === 'rule-hiring-velocity');
    expect(hiringSug).toBeDefined();
    expect(hiringSug?.severity).toBe('warning');
  });
});
