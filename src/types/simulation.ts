export type BusinessModelType = 'SaaS' | 'D2C' | 'Marketplace' | 'Services';

export type RiskSeverity = 'info' | 'warning' | 'critical';

export interface PlannedHire {
  id: string;
  role: string;
  monthlySalary: number;
  startMonth: number; // 1-indexed (1 means month 1)
}

export interface SimulationInput {
  id: string;
  scenarioName: string;
  investmentAmount: number;
  existingCash: number;
  currentMonthlyRevenue: number;
  businessModel: BusinessModelType;
  monthlyGrowthRate: number; // percentage e.g. 5 for 5%
  grossMargin: number; // percentage e.g. 80 for 80%
  cac: number; // $ per acquired customer
  churnRate: number; // percentage e.g. 3 for 3%
  marketingSpend: number; // $ monthly spend
  infraSpend: number; // $ monthly spend
  opsSpend: number; // $ monthly spend
  founderSalary: number; // $ monthly founder salary
  plannedHires: PlannedHire[];
  projectionMonths: number; // e.g. 36
}

export interface MonthlyProjection {
  month: number;
  monthLabel: string;
  startingCash: number;
  endingCash: number;
  revenue: number;
  grossProfit: number;
  payrollExpense: number;
  marketingExpense: number;
  infraExpense: number;
  opsExpense: number;
  founderSalaryExpense: number;
  totalExpenses: number;
  grossBurn: number;
  netBurn: number;
  activeHiresCount: number;
  isBreakEven: boolean;
}

export interface RiskFactor {
  name: string;
  score: number; // 0-100 scale for factor
  detail: string;
  severity: RiskSeverity;
}

export interface RiskScore {
  score: number; // 0 (safest) - 100 (highest risk)
  level: 'Low' | 'Medium' | 'High';
  factors: RiskFactor[];
}

export interface Suggestion {
  id: string;
  category: 'Runway' | 'Hiring' | 'Marketing' | 'Unit Economics' | 'Governance';
  title: string;
  condition: string;
  insight: string;
  suggestion: string;
  severity: RiskSeverity;
  benchmarkSource?: string;
}

export interface SimulationOutput {
  input: SimulationInput;
  projections: MonthlyProjection[];
  runwayMonths: number;
  breakEvenMonth: number | null;
  initialNetBurn: number;
  peakNetBurn: number;
  totalStartingCapital: number;
  riskScore: RiskScore;
  suggestions: Suggestion[];
}
