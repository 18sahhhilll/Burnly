'use client';

import React, { useState } from 'react';
import { SimulationOutput } from '@/types/simulation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

interface ChartsViewProps {
  simulation: SimulationOutput;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ simulation }) => {
  const [activeChartTab, setActiveChartTab] = useState<'runway' | 'breakeven' | 'breakdown'>('runway');

  const { projections, breakEvenMonth } = simulation;

  // Custom Currency Formatter (Indian Rupee en-IN)
  const fmt = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0]">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#2A3346] pb-3 mb-4 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#E8EAF0]">
            Financial trajectory &amp; model output
          </h3>
          <p className="text-xs text-[#8B92A8]">
            Projections across 36-month timeline
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#0E1420] p-0.5 rounded border border-[#2A3346]">
          <button
            onClick={() => setActiveChartTab('runway')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              activeChartTab === 'runway'
                ? 'bg-[#2A3346] text-[#E8EAF0]'
                : 'text-[#8B92A8] hover:text-[#E8EAF0]'
            }`}
          >
            Cash trajectory
          </button>
          <button
            onClick={() => setActiveChartTab('breakeven')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              activeChartTab === 'breakeven'
                ? 'bg-[#2A3346] text-[#E8EAF0]'
                : 'text-[#8B92A8] hover:text-[#E8EAF0]'
            }`}
          >
            Revenue vs spend
          </button>
          <button
            onClick={() => setActiveChartTab('breakdown')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              activeChartTab === 'breakdown'
                ? 'bg-[#2A3346] text-[#E8EAF0]'
                : 'text-[#8B92A8] hover:text-[#E8EAF0]'
            }`}
          >
            Burn breakdown
          </button>
        </div>
      </div>

      {/* Chart 1: Cash Balance Clean Line Chart */}
      {activeChartTab === 'runway' && (
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projections} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3346" />
              <XAxis dataKey="monthLabel" stroke="#8B92A8" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#8B92A8"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0E1420', borderColor: '#2A3346', borderRadius: '4px', fontSize: '12px' }}
                formatter={(val: number) => [fmt(val), 'Ending cash balance']}
              />
              <ReferenceLine y={0} stroke="#B4694A" strokeDasharray="3 3" label={{ value: 'Cash depletion (₹0)', fill: '#B4694A', fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="endingCash"
                stroke="#C9A15D"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Chart 2: Revenue vs Expenses (Break-Even) */}
      {activeChartTab === 'breakeven' && (
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projections} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3346" />
              <XAxis dataKey="monthLabel" stroke="#8B92A8" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#8B92A8"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0E1420', borderColor: '#2A3346', borderRadius: '4px', fontSize: '12px' }}
                formatter={(val: number, name: string) => [
                  fmt(val),
                  name === 'revenue' ? 'Monthly revenue' : 'Total expenses',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Monthly revenue"
                stroke="#4A7C64"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="totalExpenses"
                name="Total expenses"
                stroke="#B4694A"
                strokeWidth={2}
                dot={false}
              />
              {breakEvenMonth !== null && (
                <ReferenceLine
                  x={`Month ${breakEvenMonth}`}
                  stroke="#4A7C64"
                  strokeDasharray="3 3"
                  label={{ value: `Break-even (M${breakEvenMonth})`, fill: '#4A7C64', fontSize: 11 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Chart 3: Expense Category Breakdown */}
      {activeChartTab === 'breakdown' && (
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projections} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3346" />
              <XAxis dataKey="monthLabel" stroke="#8B92A8" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#8B92A8"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0E1420', borderColor: '#2A3346', borderRadius: '4px', fontSize: '12px' }}
                formatter={(val: number) => [fmt(val)]}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Bar dataKey="payrollExpense" name="Payroll" stackId="a" fill="#3B5998" />
              <Bar dataKey="marketingExpense" name="Marketing" stackId="a" fill="#C9A15D" />
              <Bar dataKey="infraExpense" name="Infra & tools" stackId="a" fill="#6B7280" />
              <Bar dataKey="opsExpense" name="Ops & rent" stackId="a" fill="#4B5563" />
              <Bar dataKey="founderSalaryExpense" name="Founder salary" stackId="a" fill="#8B92A8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
