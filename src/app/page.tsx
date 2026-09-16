'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SimulationInput, SimulationOutput } from '@/types/simulation';
import { PRESET_SCENARIOS } from '@/lib/simulation/presets';
import { runSimulation } from '@/lib/simulation/simulationEngine';
import { Header } from '@/components/Header';
import { MetricsOverview } from '@/components/MetricsOverview';
import { InputForm } from '@/components/InputForm';
import { ChartsView } from '@/components/ChartsView';
import { RiskSuggestionsPanel } from '@/components/RiskSuggestionsPanel';
import { ScenarioComparison } from '@/components/ScenarioComparison';

export default function Home() {
  const [scenarios, setScenarios] = useState<SimulationInput[]>([PRESET_SCENARIOS[0]]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [activeTab, setActiveTab] = useState<'simulator' | 'comparison'>('simulator');
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load scenarios from Database API on mount
  useEffect(() => {
    async function loadScenarios() {
      try {
        const res = await fetch('/api/scenarios');
        if (res.ok) {
          const dbScenarios = await res.json();
          if (Array.isArray(dbScenarios) && dbScenarios.length > 0) {
            const mapped: SimulationInput[] = dbScenarios.map((item: any) => ({
              ...(item.data || {}),
              id: item.id,
              scenarioName: item.title || item.data?.scenarioName || 'Untitled Scenario',
            }));
            setScenarios(mapped);
            setActiveScenarioId(mapped[0].id);
          } else {
            // Seed DB with initial preset scenario
            await seedInitialScenario();
          }
        } else {
          console.warn('API returned non-ok status, using default presets');
        }
      } catch (e) {
        console.warn('Could not connect to database API, using in-memory state', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadScenarios();
  }, []);

  async function seedInitialScenario() {
    try {
      const initial = PRESET_SCENARIOS[0];
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: initial.scenarioName, data: initial }),
      });
      if (res.ok) {
        const created = await res.json();
        const mapped: SimulationInput = {
          ...initial,
          id: created.id,
        };
        setScenarios([mapped]);
        setActiveScenarioId(mapped.id);
      }
    } catch (e) {
      console.warn('Failed to seed initial scenario to DB', e);
    }
  }

  const activeInput =
    scenarios.find((s) => s.id === activeScenarioId) || scenarios[0] || PRESET_SCENARIOS[0];

  const currentSimulation: SimulationOutput = runSimulation(activeInput);

  // Update input state and sync to database via PUT API handler
  const handleInputChange = (updated: SimulationInput) => {
    setScenarios((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

    // Debounce DB updates
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/scenarios/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: updated.scenarioName,
            data: updated,
          }),
        });
      } catch (e) {
        console.warn(`Failed to save scenario ${updated.id} to database`, e);
      }
    }, 400);
  };

  // Load a preset template by saving it to DB via POST /api/scenarios
  const handleSelectPreset = async (preset: SimulationInput) => {
    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: preset.scenarioName,
          data: preset,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const newScenario: SimulationInput = {
          ...preset,
          id: created.id,
        };
        setScenarios((prev) => [newScenario, ...prev]);
        setActiveScenarioId(newScenario.id);
      } else {
        // Fallback for offline/no-db mode
        const newPreset = { ...preset, id: `preset-${Date.now()}` };
        setScenarios((prev) => [newPreset, ...prev]);
        setActiveScenarioId(newPreset.id);
      }
    } catch (e) {
      console.warn('Failed to save preset to database', e);
      const newPreset = { ...preset, id: `preset-${Date.now()}` };
      setScenarios((prev) => [newPreset, ...prev]);
      setActiveScenarioId(newPreset.id);
    }
  };

  // Create a new scenario copy in DB via POST /api/scenarios
  const handleNewScenario = async () => {
    const copyData: SimulationInput = {
      ...activeInput,
      scenarioName: `${activeInput.scenarioName} (Copy)`,
    };

    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: copyData.scenarioName,
          data: copyData,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const newScenario: SimulationInput = {
          ...copyData,
          id: created.id,
        };
        setScenarios((prev) => [newScenario, ...prev]);
        setActiveScenarioId(newScenario.id);
      } else {
        const newScenario = { ...copyData, id: `scenario-${Date.now()}` };
        setScenarios((prev) => [newScenario, ...prev]);
        setActiveScenarioId(newScenario.id);
      }
    } catch (e) {
      console.warn('Failed to create new scenario in database', e);
      const newScenario = { ...copyData, id: `scenario-${Date.now()}` };
      setScenarios((prev) => [newScenario, ...prev]);
      setActiveScenarioId(newScenario.id);
    }
  };

  // Delete scenario via DELETE /api/scenarios/:id
  const handleDeleteScenario = async (id: string) => {
    if (scenarios.length <= 1) return;
    const filtered = scenarios.filter((s) => s.id !== id);
    setScenarios(filtered);
    if (activeScenarioId === id) {
      setActiveScenarioId(filtered[0].id);
    }

    try {
      await fetch(`/api/scenarios/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn(`Failed to delete scenario ${id} from database`, e);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeInput, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeInput.scenarioName.toLowerCase().replace(/\s+/g, '_')}_scenario.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#0E1420] text-[#E8EAF0] flex flex-col font-sans">
      <Header
        currentScenario={activeInput}
        onSelectPreset={handleSelectPreset}
        onNewScenario={handleNewScenario}
        onExportJSON={handleExportJSON}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenarioCount={scenarios.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'simulator' ? (
          <div className="space-y-4">
            {/* 1. Metrics Overview */}
            <MetricsOverview simulation={currentSimulation} />

            {/* 2. Main Simulator Grid: Inputs on Left, Charts & Suggestions on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Inputs Form */}
              <div className="lg:col-span-5">
                <InputForm input={activeInput} onChange={handleInputChange} />
              </div>

              {/* Charts & Suggestions */}
              <div className="lg:col-span-7 space-y-4">
                <ChartsView simulation={currentSimulation} />
              </div>
            </div>

            {/* 3. Transparent Advisory & Risk Breakdown Section */}
            <RiskSuggestionsPanel simulation={currentSimulation} />
          </div>
        ) : (
          /* 4. Scenario Comparison Tab */
          <ScenarioComparison
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onSelectScenario={(id) => {
              setActiveScenarioId(id);
              setActiveTab('simulator');
            }}
            onDeleteScenario={handleDeleteScenario}
          />
        )}
      </main>

      <footer className="border-t border-[#2A3346] bg-[#0E1420] py-3 text-center text-xs text-[#8B92A8]">
        <p>Burnly Startup Financial Model • Precision decision sandbox</p>
      </footer>
    </div>
  );
}
