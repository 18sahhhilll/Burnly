'use client';

import React from 'react';
import { SimulationInput, SimulationOutput } from '@/types/simulation';
import { runSimulation } from '@/lib/simulation/simulationEngine';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Trash2 } from 'lucide-react';

interface ScenarioComparisonProps {
  scenarios: SimulationInput[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onDeleteScenario: (id: string) => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onDeleteScenario,
}) => {
  const simulations: { input: SimulationInput; sim: SimulationOutput }[] = scenarios.map((input) => ({
    input,
    sim: runSimulation(input),
  }));

  const fmt = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Combine monthly projections for Recharts multi-line chart
  const combinedChartData = Array.from({ length: 36 }).map((_, idx) => {
    const monthLabel = `Month ${idx + 1}`;
    const entry: any = { monthLabel };
    simulations.forEach(({ input, sim }) => {
      const proj = sim.projections[idx];
      entry[input.id] = proj ? proj.endingCash : 0;
    });
    return entry;
  });

  const colors = ['#C9A15D', '#4A7C64', '#3B5998', '#B4694A', '#8B92A8'];

  return (
    <div className="space-y-4">
      {/* Table Comparison Card */}
      <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#2A3346] pb-2.5 mb-3 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#E8EAF0]">
              Side-by-side scenario matrix
            </h3>
            <p className="text-xs text-[#8B92A8]">
              Comparing financial metrics and burn trajectory across saved models
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="sm:hidden text-[11px] text-[#C9A15D]">Scroll right →</span>
            <span className="text-xs font-mono text-[#8B92A8] bg-[#0E1420] px-2.5 py-0.5 rounded border border-[#2A3346]">
              {scenarios.length} scenarios
            </span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs text-[#E8EAF0] min-w-[640px]">
            <thead className="bg-[#0E1420] text-[#8B92A8] font-normal border-b border-[#2A3346]">
              <tr>
                <th className="py-2.5 px-3">Scenario name</th>
                <th className="py-2.5 px-3">Starting capital</th>
                <th className="py-2.5 px-3">Initial net burn</th>
                <th className="py-2.5 px-3">Runway</th>
                <th className="py-2.5 px-3">Break-even</th>
                <th className="py-2.5 px-3">Risk score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3346]/60 font-mono">
              {simulations.map(({ input, sim }, idx) => {
                const isActive = input.id === activeScenarioId;
                return (
                  <tr
                    key={input.id}
                    className={`hover:bg-[#1a2336] transition ${
                      isActive ? 'bg-[#1f293d]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-medium text-[#E8EAF0] flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      />
                      {input.scenarioName}
                      {isActive && (
                        <span className="text-[10px] bg-[#2A3346] text-[#C9A15D] px-1.5 py-0.2 rounded border border-[#C9A15D]/40 font-mono">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#E8EAF0]">
                      {fmt(sim.totalStartingCapital)}
                    </td>
                    <td className="py-2.5 px-3 text-[#B4694A]">
                      {fmt(sim.initialNetBurn)}/mo
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="flex items-center space-x-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sim.runwayMonths < 6
                              ? 'bg-[#B4694A]'
                              : sim.runwayMonths < 12
                              ? 'bg-[#C9A15D]'
                              : 'bg-[#4A7C64]'
                          }`}
                        />
                        <span>
                          {sim.runwayMonths >= 36 ? '36+ mos' : `${sim.runwayMonths.toFixed(1)} mos`}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#8B92A8]">
                      {sim.breakEvenMonth !== null ? `Month ${sim.breakEvenMonth}` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="flex items-center space-x-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sim.riskScore.level === 'High'
                              ? 'bg-[#B4694A]'
                              : sim.riskScore.level === 'Medium'
                              ? 'bg-[#C9A15D]'
                              : 'bg-[#4A7C64]'
                          }`}
                        />
                        <span>{sim.riskScore.score} / 100</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans space-x-2">
                      {!isActive && (
                        <button
                          onClick={() => onSelectScenario(input.id)}
                          className="px-2 py-0.5 bg-[#0E1420] hover:bg-[#161D2C] text-[#E8EAF0] text-xs rounded border border-[#2A3346] transition"
                        >
                          Load
                        </button>
                      )}
                      {scenarios.length > 1 && (
                        <button
                          onClick={() => onDeleteScenario(input.id)}
                          className="p-1 text-[#8B92A8] hover:text-[#B4694A] transition"
                          title="Delete scenario"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trajectory Overlay Chart */}
      <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0]">
        <h4 className="text-xs font-semibold text-[#E8EAF0] mb-1">
          Cash balance comparison timeline (36 months)
        </h4>
        <p className="text-xs text-[#8B92A8] mb-3">
          Overlaying ending cash balances across scenarios over time
        </p>

        <div className="h-[300px] sm:h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3346" />
              <XAxis
                dataKey="monthLabel"
                stroke="#8B92A8"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={20}
                tickFormatter={(val) => val.replace('Month ', 'M')}
              />
              <YAxis
                stroke="#8B92A8"
                tick={{ fontSize: 10 }}
                width={45}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0E1420', borderColor: '#2A3346', borderRadius: '4px', fontSize: '12px' }}
                formatter={(val: number) => [fmt(val)]}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              {simulations.map(({ input }, idx) => (
                <Line
                  key={input.id}
                  type="monotone"
                  dataKey={input.id}
                  name={input.scenarioName}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
