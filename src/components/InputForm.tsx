'use client';

import React, { useState } from 'react';
import { SimulationInput, BusinessModelType, PlannedHire } from '@/types/simulation';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface InputFormProps {
  input: SimulationInput;
  onChange: (updated: SimulationInput) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ input, onChange }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    capital: true,
    expenses: true,
    hires: true,
    unit: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFieldChange = (field: keyof SimulationInput, value: any) => {
    onChange({
      ...input,
      [field]: value,
    });
  };

  const handleHireAdd = () => {
    const newHire: PlannedHire = {
      id: `hire-${Date.now()}`,
      role: 'Software Engineer',
      monthlySalary: 80000,
      startMonth: 2,
    };
    onChange({
      ...input,
      plannedHires: [...input.plannedHires, newHire],
    });
  };

  const handleHireChange = (id: string, field: keyof PlannedHire, value: any) => {
    const updatedHires = input.plannedHires.map((h) =>
      h.id === id ? { ...h, [field]: value } : h
    );
    onChange({
      ...input,
      plannedHires: updatedHires,
    });
  };

  const handleHireDelete = (id: string) => {
    onChange({
      ...input,
      plannedHires: input.plannedHires.filter((h) => h.id !== id),
    });
  };

  return (
    <div className="bg-[#161D2C] border border-[#2A3346] rounded p-4 text-[#E8EAF0] space-y-4">
      {/* Header & Scenario Title */}
      <div className="border-b border-[#2A3346] pb-3">
        <label className="block text-xs text-[#8B92A8] font-normal mb-1">
          Scenario title
        </label>
        <input
          type="text"
          value={input.scenarioName}
          onChange={(e) => handleFieldChange('scenarioName', e.target.value)}
          className="w-full bg-[#0E1420] border border-[#2A3346] rounded px-3 py-1.5 text-xs font-semibold text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
          placeholder="e.g. Seed Raise — 3 Hire Strategy"
        />
      </div>

      {/* Section 1: Capital & Initial Cash */}
      <div className="border border-[#2A3346] rounded overflow-hidden">
        <button
          onClick={() => toggleSection('capital')}
          className="w-full bg-[#161D2C] hover:bg-[#1a2336] px-3 py-2 flex items-center justify-between text-left text-xs font-medium text-[#E8EAF0]"
        >
          <span>1. Capital & initial revenue</span>
          {openSections.capital ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#8B92A8]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#8B92A8]" />
          )}
        </button>

        {openSections.capital && (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0E1420]/80 border-t border-[#2A3346]">
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Investment amount (₹)</label>
              <input
                type="number"
                value={input.investmentAmount}
                onChange={(e) => handleFieldChange('investmentAmount', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Existing cash in bank (₹)</label>
              <input
                type="number"
                value={input.existingCash}
                onChange={(e) => handleFieldChange('existingCash', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Current monthly revenue (₹)</label>
              <input
                type="number"
                value={input.currentMonthlyRevenue}
                onChange={(e) => handleFieldChange('currentMonthlyRevenue', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Business model type</label>
              <select
                value={input.businessModel}
                onChange={(e) => handleFieldChange('businessModel', e.target.value as BusinessModelType)}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              >
                <option value="SaaS">SaaS (Recurring Subscription)</option>
                <option value="D2C">D2C E-Commerce</option>
                <option value="Marketplace">Marketplace (Take Rate)</option>
                <option value="Services">Services / Agency</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Operating Expenses */}
      <div className="border border-[#2A3346] rounded overflow-hidden">
        <button
          onClick={() => toggleSection('expenses')}
          className="w-full bg-[#161D2C] hover:bg-[#1a2336] px-3 py-2 flex items-center justify-between text-left text-xs font-medium text-[#E8EAF0]"
        >
          <span>2. Fixed monthly operating spend</span>
          {openSections.expenses ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#8B92A8]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#8B92A8]" />
          )}
        </button>

        {openSections.expenses && (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0E1420]/80 border-t border-[#2A3346]">
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Marketing / Ads (₹/mo)</label>
              <input
                type="number"
                value={input.marketingSpend}
                onChange={(e) => handleFieldChange('marketingSpend', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Infra & tools (₹/mo)</label>
              <input
                type="number"
                value={input.infraSpend}
                onChange={(e) => handleFieldChange('infraSpend', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Ops & rent (₹/mo)</label>
              <input
                type="number"
                value={input.opsSpend}
                onChange={(e) => handleFieldChange('opsSpend', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Founder salary (₹/mo total)</label>
              <input
                type="number"
                value={input.founderSalary}
                onChange={(e) => handleFieldChange('founderSalary', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Planned Hires */}
      <div className="border border-[#2A3346] rounded overflow-hidden">
        <button
          onClick={() => toggleSection('hires')}
          className="w-full bg-[#161D2C] hover:bg-[#1a2336] px-3 py-2 flex items-center justify-between text-left text-xs font-medium text-[#E8EAF0]"
        >
          <span>3. Planned team hires ({input.plannedHires.length})</span>
          {openSections.hires ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#8B92A8]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#8B92A8]" />
          )}
        </button>

        {openSections.hires && (
          <div className="p-3 bg-[#0E1420]/80 border-t border-[#2A3346] space-y-2">
            {input.plannedHires.length === 0 ? (
              <p className="text-xs text-[#8B92A8] text-center py-2">
                No hires planned yet.
              </p>
            ) : (
              input.plannedHires.map((hire) => (
                <div
                  key={hire.id}
                  className="grid grid-cols-12 gap-2 items-center bg-[#161D2C] p-2 rounded border border-[#2A3346]"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={hire.role}
                      onChange={(e) => handleHireChange(hire.id, 'role', e.target.value)}
                      placeholder="Role title"
                      className="w-full bg-[#0E1420] border border-[#2A3346] rounded px-2 py-1 text-xs text-[#E8EAF0]"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      value={hire.monthlySalary}
                      onChange={(e) => handleHireChange(hire.id, 'monthlySalary', Number(e.target.value))}
                      placeholder="Monthly ₹"
                      className="w-full bg-[#0E1420] border border-[#2A3346] rounded px-2 py-1 text-xs font-mono text-[#E8EAF0]"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      max={36}
                      value={hire.startMonth}
                      onChange={(e) => handleHireChange(hire.id, 'startMonth', Number(e.target.value))}
                      placeholder="Month #"
                      title="Start Month Number (1-36)"
                      className="w-full bg-[#0E1420] border border-[#2A3346] rounded px-1.5 py-1 text-xs font-mono text-center text-[#E8EAF0]"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleHireDelete(hire.id)}
                      className="text-[#8B92A8] hover:text-[#B4694A] p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={handleHireAdd}
              className="w-full py-1.5 bg-[#161D2C] hover:bg-[#20293d] border border-[#2A3346] text-[#E8EAF0] rounded text-xs font-medium flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#C9A15D]" />
              Add hire
            </button>
          </div>
        )}
      </div>

      {/* Section 4: Growth & Unit Economics */}
      <div className="border border-[#2A3346] rounded overflow-hidden">
        <button
          onClick={() => toggleSection('unit')}
          className="w-full bg-[#161D2C] hover:bg-[#1a2336] px-3 py-2 flex items-center justify-between text-left text-xs font-medium text-[#E8EAF0]"
        >
          <span>4. Growth rate & unit economics</span>
          {openSections.unit ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#8B92A8]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#8B92A8]" />
          )}
        </button>

        {openSections.unit && (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0E1420]/80 border-t border-[#2A3346]">
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Monthly growth rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={input.monthlyGrowthRate}
                onChange={(e) => handleFieldChange('monthlyGrowthRate', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Gross margin (%)</label>
              <input
                type="number"
                step="1"
                value={input.grossMargin}
                onChange={(e) => handleFieldChange('grossMargin', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">CAC (₹ per customer)</label>
              <input
                type="number"
                value={input.cac}
                onChange={(e) => handleFieldChange('cac', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8B92A8] mb-1">Monthly churn rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={input.churnRate}
                onChange={(e) => handleFieldChange('churnRate', Number(e.target.value))}
                className="w-full bg-[#161D2C] border border-[#2A3346] rounded px-2.5 py-1 text-xs font-mono text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
