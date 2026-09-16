import { MonthlyProjection, SimulationInput, Suggestion } from '@/types/simulation';

export function evaluateRules(
  input: SimulationInput,
  projections: MonthlyProjection[],
  runwayMonths: number,
  breakEvenMonth: number | null
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const {
    investmentAmount,
    existingCash,
    currentMonthlyRevenue,
    monthlyGrowthRate,
    grossMargin,
    cac,
    churnRate,
    marketingSpend,
    founderSalary,
    plannedHires,
  } = input;

  const totalCapital = investmentAmount + existingCash;
  const initialExpenses = projections[0]?.totalExpenses || 1;

  // Rule 1: Short Runway (< 6 Months)
  if (runwayMonths < 6) {
    suggestions.push({
      id: 'rule-runway-critical',
      category: 'Runway',
      title: 'Critical Runway Alert (< 6 Months)',
      condition: `Projected runway is ${runwayMonths.toFixed(1)} months`,
      insight:
        'Your cash buffer is dangerously short. Raising new capital typically takes 3 to 6 months, leaving zero safety margin.',
      suggestion:
        'Consider delaying upcoming hires, reducing non-essential marketing spend, or lowering overhead to push runway past 12+ months.',
      severity: 'critical',
      benchmarkSource: 'a16z & SaaS Capital Runway Guidelines',
    });
  } else if (runwayMonths >= 6 && runwayMonths < 12) {
    suggestions.push({
      id: 'rule-runway-warning',
      category: 'Runway',
      title: 'Tight Runway Warning (6–12 Months)',
      condition: `Projected runway is ${runwayMonths.toFixed(1)} months`,
      insight:
        'Runway is below the recommended 18-month standard for early-stage startups.',
      suggestion:
        'Start preparing fundraising materials or optimize monthly burn to ensure you have sufficient time to hit growth milestones.',
      severity: 'warning',
      benchmarkSource: 'Y Combinator Runway Benchmarks',
    });
  }

  // Rule 2: Capital Under-deployment (> 24 Months, Low Growth)
  if (runwayMonths >= 24 && monthlyGrowthRate < 5 && currentMonthlyRevenue > 0) {
    suggestions.push({
      id: 'rule-under-deployment',
      category: 'Runway',
      title: 'Capital Under-Deployment Flag',
      condition: `Runway is ${runwayMonths.toFixed(1)}+ months with low growth (${monthlyGrowthRate}%/mo)`,
      insight:
        'Holding excessive cash without aggressive reinvestment risks losing market velocity to competitors.',
      suggestion:
        'Consider deploying surplus capital into high-ROI growth channels, key engineering hires, or customer acquisition.',
      severity: 'info',
      benchmarkSource: 'a16z Growth & Capital Efficiency Benchmarks',
    });
  }

  // Rule 3: Hiring Pace (3+ hires in Month 1)
  const month1Hires = plannedHires.filter((h) => h.startMonth === 1);
  if (month1Hires.length >= 3) {
    suggestions.push({
      id: 'rule-hiring-velocity',
      category: 'Hiring',
      title: 'Aggressive Month-1 Hiring Pace',
      condition: `${month1Hires.length} new hires planned in Month 1`,
      insight:
        'Onboarding multiple key hires simultaneously strains founder management bandwidth and increases fixed burn before productivity is proven.',
      suggestion:
        'Consider staggering start dates across Months 1 to 4 to streamline onboarding and preserve cash.',
      severity: 'warning',
      benchmarkSource: 'First Round Capital Hiring Playbook',
    });
  }

  // Rule 4: Marketing Spend > 40% of Budget pre-PMF / low rev
  const marketingShare = (marketingSpend / initialExpenses) * 100;
  if (marketingShare > 40 && currentMonthlyRevenue < 20000) {
    suggestions.push({
      id: 'rule-marketing-overspend',
      category: 'Marketing',
      title: 'High Paid Acquisition Pre-PMF',
      condition: `Marketing represents ${marketingShare.toFixed(0)}% of initial monthly spend`,
      insight:
        'Heavy marketing spending prior to solid product-market fit (or <₹20,000 MRR) often leads to acquiring churn-prone users.',
      suggestion:
        'Shift budget towards product refinement, organic customer discovery, and retention before scaling ad campaigns.',
      severity: 'warning',
      benchmarkSource: 'Reforge Product-Market Fit Benchmarks',
    });
  }

  // Rule 5: CAC vs LTV Economics
  // Estimated ARPU assuming average revenue divided by estimated customers, or unit check
  if (cac > 0 && churnRate > 0) {
    // Basic LTV estimate assuming average monthly revenue per customer is approx 100 if unknown, or ratio check
    const avgMonthlyRevPerCustomer = 100; // placeholder check or CAC Payback
    const grossMarginFrac = grossMargin / 100;
    const estimatedLTV = (avgMonthlyRevPerCustomer * grossMarginFrac) / (churnRate / 100);
    const cacPaybackMonths = cac / (avgMonthlyRevPerCustomer * grossMarginFrac);

    if (cacPaybackMonths > 18) {
      suggestions.push({
        id: 'rule-cac-payback',
        category: 'Unit Economics',
        title: 'Extended CAC Payback Period (>18 Months)',
        condition: `Estimated CAC payback is ~${cacPaybackMonths.toFixed(1)} months (₹${cac} CAC)`,
        insight:
          'Long CAC payback periods severely lock up working capital and increase refinancing risk.',
        suggestion:
          'Focus on improving customer retention, increasing initial contract value, or reducing acquisition cost per lead.',
        severity: 'critical',
        benchmarkSource: 'Bessemer Venture Partners Cloud Index',
      });
    }
  }

  // Rule 6: Founder Salary Ratio
  const annualFounderSalary = founderSalary * 12;
  const founderSalaryRatio = (annualFounderSalary / Math.max(1, totalCapital)) * 100;

  if (founderSalaryRatio > 15 || founderSalary > 15000) {
    suggestions.push({
      id: 'rule-founder-salary',
      category: 'Governance',
      title: 'Elevated Founder Salary Ratio',
      condition: `Founder salary accounts for ${founderSalaryRatio.toFixed(1)}% of initial investment capital`,
      insight:
        'Early-stage investors typically expect founder compensation to be reinvested into runway preservation (₹10L–₹15L ARR typical benchmark).',
      suggestion:
        'Consider aligning salary closer to seed-stage market norms (₹80,000–₹1,10,000/month) to extend runway.',
      severity: 'warning',
      benchmarkSource: 'Kruze Consulting Seed Founder Compensation Benchmark',
    });
  }

  // Rule 7: Break-even achievement celebration/insight
  if (breakEvenMonth !== null && breakEvenMonth <= 24) {
    suggestions.push({
      id: 'rule-breakeven-achieved',
      category: 'Runway',
      title: 'Default Alive Trajectory',
      condition: `Projected break-even reached in Month ${breakEvenMonth}`,
      insight:
        'Your spending and revenue growth trajectory achieves self-sustainability ("Default Alive") within 2 years.',
      suggestion:
        'Maintain financial discipline as growth accelerates to build cash reserves for future strategic opportunities.',
      severity: 'info',
      benchmarkSource: 'Paul Graham (Y Combinator) Default Alive Framework',
    });
  }

  return suggestions;
}
