'use client';

import React, { useState } from 'react';
import { SimulationOutput, RiskSeverity } from '@/types/simulation';

interface RiskSuggestionsPanelProps {
  simulation: SimulationOutput;
}

export const RiskSuggestionsPanel: React.FC<RiskSuggestionsPanelProps> = ({ simulation }) => {
  const { riskScore, suggestions } = simulation;
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredSuggestions = suggestions.filter((s) => {
    if (filterSeverity === 'all') return true;
    return s.severity === filterSeverity;
  });

  const getStatusIndicator = (severity: RiskSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="flex items-center space-x-1.5 text-[11px] text-[#B4694A] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B4694A]" />
            <span>Critical</span>
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center space-x-1.5 text-[11px] text-[#C9A15D] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A15D]" />
            <span>Warning</span>
          </span>
        );
      case 'info':
        return (
          <span className="flex items-center space-x-1.5 text-[11px] text-[#8B92A8] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B92A8]" />
            <span>Insight</span>
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      {/* Panel 1: Risk Factors Breakdown */}
      <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-[#2A3346] pb-2.5 mb-3">
            <h3 className="text-sm font-semibold text-[#E8EAF0]">
              Risk analysis &amp; contributing factors
            </h3>
            <span className="text-xs text-[#8B92A8] font-mono">
              Score: {riskScore.score}/100
            </span>
          </div>

          <p className="text-xs text-[#8B92A8] mb-3">
            Factor contributions based on model inputs:
          </p>

          <div className="space-y-3">
            {riskScore.factors.map((factor, idx) => (
              <div
                key={idx}
                className="bg-[#0E1420]/80 border border-[#2A3346] rounded p-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs text-[#E8EAF0]">
                  <span className="font-medium">{factor.name}</span>
                  <span className="font-mono text-[#8B92A8]">{factor.score} / 100</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#161D2C] h-1.5 rounded-sm overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      factor.score >= 70
                        ? 'bg-[#B4694A]'
                        : factor.score >= 40
                        ? 'bg-[#C9A15D]'
                        : 'bg-[#4A7C64]'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>

                <p className="text-xs text-[#8B92A8] leading-normal">{factor.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-[#2A3346] text-[11px] text-[#8B92A8]">
          * Transparent calculation derived directly from financial state variables.
        </div>
      </div>

      {/* Panel 2: Rule-Based Advisory Suggestions */}
      <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0] flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#2A3346] pb-2.5 mb-3 gap-2">
            <h3 className="text-sm font-semibold text-[#E8EAF0]">
              Advisory &amp; rule-based guidance ({filteredSuggestions.length})
            </h3>

            {/* Filter buttons */}
            <div className="flex bg-[#0E1420] p-0.5 rounded border border-[#2A3346]">
              <button
                onClick={() => setFilterSeverity('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  filterSeverity === 'all' ? 'bg-[#2A3346] text-[#E8EAF0]' : 'text-[#8B92A8]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSeverity('critical')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  filterSeverity === 'critical' ? 'bg-[#2A3346] text-[#B4694A]' : 'text-[#8B92A8]'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterSeverity('warning')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  filterSeverity === 'warning' ? 'bg-[#2A3346] text-[#C9A15D]' : 'text-[#8B92A8]'
                }`}
              >
                Warnings
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 text-[#8B92A8] space-y-1">
                <p className="text-xs font-medium text-[#E8EAF0]">No advisory triggers flagged</p>
                <p className="text-[11px]">Plan aligns with standard financial benchmarks.</p>
              </div>
            ) : (
              filteredSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="bg-[#0E1420]/80 border border-[#2A3346] rounded p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-[#8B92A8] uppercase tracking-wider font-mono">
                        {sug.category}
                      </span>
                      <h4 className="text-xs font-semibold text-[#E8EAF0]">{sug.title}</h4>
                    </div>
                    {getStatusIndicator(sug.severity)}
                  </div>

                  <div className="text-[11px] font-mono bg-[#161D2C] border border-[#2A3346] px-2 py-0.5 rounded text-[#8B92A8]">
                    Trigger: {sug.condition}
                  </div>

                  <div className="space-y-0.5 text-xs text-[#8B92A8]">
                    <p>
                      <strong className="text-[#E8EAF0] font-medium">Insight:</strong> {sug.insight}
                    </p>
                    <p className="text-[#E8EAF0]">
                      <strong className="text-[#C9A15D] font-medium">Consider:</strong> {sug.suggestion}
                    </p>
                  </div>

                  {sug.benchmarkSource && (
                    <div className="text-[10px] text-[#8B92A8] pt-1 border-t border-[#2A3346]/60">
                      Source: {sug.benchmarkSource}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-[#2A3346] text-[10px] text-[#8B92A8]">
          * Advisory guidance is decision-support only; consult financial advisors for regulated guidance.
        </div>
      </div>
    </div>
  );
};
