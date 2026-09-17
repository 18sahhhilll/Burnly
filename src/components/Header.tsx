'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus, BarChart2, Layers, LogOut, User, Menu, X } from 'lucide-react';
import { SimulationInput } from '@/types/simulation';
import { PRESET_SCENARIOS } from '@/lib/simulation/presets';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  currentScenario: SimulationInput;
  onSelectPreset: (preset: SimulationInput) => void;
  onNewScenario: () => void;
  onExportJSON: () => void;
  activeTab: 'simulator' | 'comparison';
  setActiveTab: (tab: 'simulator' | 'comparison') => void;
  scenarioCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectPreset,
  onNewScenario,
  onExportJSON,
  activeTab,
  setActiveTab,
  scenarioCount,
}) => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
    fetchUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-[#0E1420] border-b border-[#2A3346] text-[#E8EAF0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg tracking-tight text-[#E8EAF0]">
                Burnly
              </span>
              <span className="text-xs text-[#8B92A8] font-mono border-l border-[#2A3346] pl-2 hidden sm:inline">
                v1.0 / Financial Model Sandbox
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center bg-[#161D2C] p-0.5 rounded border border-[#2A3346]">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                activeTab === 'simulator'
                  ? 'bg-[#2A3346] text-[#E8EAF0]'
                  : 'text-[#8B92A8] hover:text-[#E8EAF0]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#C9A15D]" />
              <span>Model & Projections</span>
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                activeTab === 'comparison'
                  ? 'bg-[#2A3346] text-[#E8EAF0]'
                  : 'text-[#8B92A8] hover:text-[#E8EAF0]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#8B92A8]" />
              <span>Scenario Matrix ({scenarioCount})</span>
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* User Indicator */}
            {userEmail && (
              <div className="flex items-center space-x-1.5 text-xs font-mono text-[#8B92A8] bg-[#161D2C] px-2.5 py-1 rounded border border-[#2A3346]">
                <User className="w-3 h-3 text-[#C9A15D]" />
                <span className="truncate max-w-[140px] text-[#E8EAF0]">{userEmail}</span>
              </div>
            )}

            {/* Presets dropdown */}
            <select
              onChange={(e) => {
                const selected = PRESET_SCENARIOS.find((p) => p.id === e.target.value);
                if (selected) onSelectPreset(selected);
              }}
              value=""
              className="bg-[#161D2C] hover:bg-[#1f283b] text-xs text-[#E8EAF0] border border-[#2A3346] rounded px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-[#C9A15D] h-8"
            >
              <option value="" disabled>
                Load preset scenario...
              </option>
              {PRESET_SCENARIOS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.scenarioName} (₹{(preset.investmentAmount / 1000).toFixed(0)}k)
                </option>
              ))}
            </select>

            {/* Export JSON button */}
            <button
              onClick={onExportJSON}
              title="Export Model JSON"
              className="p-1.5 text-[#8B92A8] hover:text-[#E8EAF0] bg-[#161D2C] hover:bg-[#1f283b] rounded border border-[#2A3346] transition h-8 w-8 flex items-center justify-center"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Primary Action Button - Muted Amber/Gold */}
            <button
              onClick={onNewScenario}
              className="flex items-center space-x-1 bg-[#C9A15D] hover:bg-[#b58e4b] text-[#0E1420] font-semibold text-xs px-3 py-1.5 rounded transition h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Scenario</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="flex items-center space-x-1 p-1.5 text-[#8B92A8] hover:text-[#B4694A] bg-[#161D2C] hover:bg-[#1f283b] rounded border border-[#2A3346] transition text-xs h-8"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </div>

          {/* Mobile Hamburger Button (< md) */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onNewScenario}
              className="bg-[#C9A15D] text-[#0E1420] font-semibold text-xs px-2.5 py-1.5 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#E8EAF0] hover:bg-[#161D2C] rounded border border-[#2A3346]"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#161D2C] border-b border-[#2A3346] px-4 py-3 space-y-3">
          {/* User Account Info */}
          {userEmail && (
            <div className="flex items-center justify-between text-xs font-mono text-[#8B92A8] border-b border-[#2A3346] pb-2">
              <span className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-[#C9A15D]" />
                <span className="text-[#E8EAF0] truncate max-w-[200px]">{userEmail}</span>
              </span>
              <button
                onClick={handleSignOut}
                className="text-[#B4694A] flex items-center space-x-1 font-sans text-xs"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* View Tab Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveTab('simulator');
                setIsMobileMenuOpen(false);
              }}
              className={`py-2 px-3 rounded text-xs font-medium text-center border ${
                activeTab === 'simulator'
                  ? 'bg-[#2A3346] border-[#C9A15D] text-[#E8EAF0]'
                  : 'bg-[#0E1420] border-[#2A3346] text-[#8B92A8]'
              }`}
            >
              Model & Projections
            </button>
            <button
              onClick={() => {
                setActiveTab('comparison');
                setIsMobileMenuOpen(false);
              }}
              className={`py-2 px-3 rounded text-xs font-medium text-center border ${
                activeTab === 'comparison'
                  ? 'bg-[#2A3346] border-[#C9A15D] text-[#E8EAF0]'
                  : 'bg-[#0E1420] border-[#2A3346] text-[#8B92A8]'
              }`}
            >
              Matrix ({scenarioCount})
            </button>
          </div>

          {/* Preset Selector */}
          <div>
            <label className="block text-[11px] text-[#8B92A8] mb-1">Load preset scenario</label>
            <select
              onChange={(e) => {
                const selected = PRESET_SCENARIOS.find((p) => p.id === e.target.value);
                if (selected) {
                  onSelectPreset(selected);
                  setIsMobileMenuOpen(false);
                }
              }}
              value=""
              className="w-full bg-[#0E1420] text-xs text-[#E8EAF0] border border-[#2A3346] rounded px-3 py-2"
            >
              <option value="" disabled>
                Select template preset...
              </option>
              {PRESET_SCENARIOS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.scenarioName} (₹{(preset.investmentAmount / 1000).toFixed(0)}k)
                </option>
              ))}
            </select>
          </div>

          {/* Export JSON */}
          <button
            onClick={() => {
              onExportJSON();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2 bg-[#0E1420] border border-[#2A3346] text-[#E8EAF0] rounded text-xs font-medium flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#C9A15D]" />
            <span>Export Scenario JSON</span>
          </button>
        </div>
      )}
    </header>
  );
};
