'use client';

import React from 'react';
import { SimulationOutput } from '@/types/simulation';

interface MetricsOverviewProps {
  simulation: SimulationOutput;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ simulation }) => {
  const { runwayMonths, breakEvenMonth, initialNetBurn, peakNetBurn, totalStartingCapital, riskScore } = simulation;

  // Format currency helper (Indian Rupee en-IN)
  const fmt = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Status Indicator Dots (No pill chips)
  let runwayDotColor = 'bg-[#4A7C64]'; // Forest green
  let runwayLabel = 'Healthy buffer';
  if (runwayMonths < 6) {
    runwayDotColor = 'bg-[#B4694A]'; // Muted rust
    runwayLabel = 'Critical (< 6 mos)';
  } else if (runwayMonths < 12) {
    runwayDotColor = 'bg-[#C9A15D]'; // Muted amber
    runwayLabel = 'Tight (< 12 mos)';
  } else if (runwayMonths < 18) {
    runwayDotColor = 'bg-[#C9A15D]';
    runwayLabel = 'Moderate (12-18 mos)';
  }

  let riskDotColor = 'bg-[#4A7C64]';
  if (riskScore.level === 'High') {
    riskDotColor = 'bg-[#B4694A]';
  } else if (riskScore.level === 'Medium') {
    riskDotColor = 'bg-[#C9A15D]';
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {/* 1. Runway Metric */}
      <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#8B92A8] font-normal">Projected runway</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${runwayDotColor}`} />
            <span className="text-[11px] text-[#8B92A8]">{runwayLabel}</span>
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl font-bold font-mono text-[#E8EAF0]">
            {runwayMonths >= 36 ? '36+' : runwayMonths.toFixed(1)}
          </span>
          <span className="text-xs text-[#8B92A8]">months</span>
        </div>
        <div className="text-[11px] text-[#8B92A8] mt-1 pt-2 border-t border-[#2A3346]/60">
          Starting capital: <span className="font-mono text-[#E8EAF0]">{fmt(totalStartingCapital)}</span>
        </div>
      </div>

      {/* 2. Monthly Net Burn */}
      <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#8B92A8] font-normal">Monthly net burn</span>
          <span className="text-[11px] text-[#8B92A8] font-mono">Month 1</span>
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl font-bold font-mono text-[#E8EAF0]">
            {fmt(initialNetBurn)}
          </span>
          <span className="text-xs text-[#8B92A8]">/mo</span>
        </div>
        <div className="text-[11px] text-[#8B92A8] mt-1 pt-2 border-t border-[#2A3346]/60">
          Peak net burn: <span className="font-mono text-[#B4694A]">{fmt(peakNetBurn)}/mo</span>
        </div>
      </div>

      {/* 3. Break-Even Point */}
      <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#8B92A8] font-normal">Break-even point</span>
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                breakEvenMonth !== null ? 'bg-[#4A7C64]' : 'bg-[#B4694A]'
              }`}
            />
            <span className="text-[11px] text-[#8B92A8]">
              {breakEvenMonth !== null ? 'Default alive' : 'Default dead'}
            </span>
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl font-bold font-mono text-[#E8EAF0]">
            {breakEvenMonth !== null ? `Month ${breakEvenMonth}` : 'N/A'}
          </span>
        </div>
        <div className="text-[11px] text-[#8B92A8] mt-1 pt-2 border-t border-[#2A3346]/60">
          {breakEvenMonth !== null ? 'Revenue covers expenses' : 'Requires additional capital'}
        </div>
      </div>

      {/* 4. Risk Score */}
      <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#8B92A8] font-normal">Risk assessment</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${riskDotColor}`} />
            <span className="text-[11px] text-[#8B92A8]">{riskScore.level} risk</span>
          </div>
        </div>
        <div className="flex items-baseline space-x-1 my-1">
          <span className="text-2xl font-bold font-mono text-[#C9A15D]">
            {riskScore.score}
          </span>
          <span className="text-xs text-[#8B92A8]">/ 100</span>
        </div>
        <div className="text-[11px] text-[#8B92A8] mt-1 pt-2 border-t border-[#2A3346]/60 truncate">
          Key driver:{' '}
          <span className="text-[#E8EAF0]">
            {riskScore.factors.sort((a, b) => b.score - a.score)[0]?.name || 'Runway safety'}
          </span>
        </div>
      </div>
    </div>
  );
};
