'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SimulationInput, SimulationOutput } from '@/types/simulation';
import { PRESET_SCENARIOS } from '@/lib/simulation/presets';
import { runSimulation } from '@/lib/simulation/simulationEngine';
import { Header } from '@/components/Header';
import { MetricsOverview } from '@/components/MetricsOverview';
import { InputForm } from '@/components/InputForm';
import { ChartsView } from '@/components/ChartsView';
import { RiskSuggestionsPanel } from '@/components/RiskSuggestionsPanel';
import { ScenarioComparison } from '@/components/ScenarioComparison';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<SimulationInput[]>([PRESET_SCENARIOS[0]]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [activeTab, setActiveTab] = useState<'simulator' | 'comparison'>('simulator');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = useCallback((title: string, message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper to handle API 401 status
  const checkUnauthorized = useCallback((res: Response) => {
    if (res.status === 401) {
      router.push('/login?reason=session_expired');
      return true;
    }
    return false;
  }, [router]);

  // Load scenarios from Database API on mount or retry
  const loadScenarios = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/scenarios');
      if (checkUnauthorized(res)) return;

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
          await seedInitialScenario();
        }
      } else {
        setFetchError('Failed to fetch scenarios from database. Using default template.');
      }
    } catch (e: any) {
      setFetchError('Network error connecting to financial model server.');
    } finally {
      setIsLoading(false);
    }
  }, [checkUnauthorized]);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  async function seedInitialScenario() {
    try {
      const initial = PRESET_SCENARIOS[0];
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: initial.scenarioName, data: initial }),
      });
      if (checkUnauthorized(res)) return;

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
        const res = await fetch(`/api/scenarios/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: updated.scenarioName,
            data: updated,
          }),
        });

        if (checkUnauthorized(res)) return;

        if (!res.ok) {
          addToast('Save Warning', 'Changes stored locally. Server update pending.', 'error');
        }
      } catch (e) {
        addToast('Connection Loss', 'Network issue. Local changes remain active.', 'error');
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

      if (checkUnauthorized(res)) return;

      if (res.ok) {
        const created = await res.json();
        const newScenario: SimulationInput = {
          ...preset,
          id: created.id,
        };
        setScenarios((prev) => [newScenario, ...prev]);
        setActiveScenarioId(newScenario.id);
        addToast('Preset Loaded', `Created new model from "${preset.scenarioName}"`, 'success');
      } else {
        const newPreset = { ...preset, id: `preset-${Date.now()}` };
        setScenarios((prev) => [newPreset, ...prev]);
        setActiveScenarioId(newPreset.id);
        addToast('Loaded Offline', 'Loaded preset in local memory.', 'info');
      }
    } catch (e) {
      const newPreset = { ...preset, id: `preset-${Date.now()}` };
      setScenarios((prev) => [newPreset, ...prev]);
      setActiveScenarioId(newPreset.id);
      addToast('Loaded Offline', 'Loaded preset in local memory.', 'info');
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

      if (checkUnauthorized(res)) return;

      if (res.ok) {
        const created = await res.json();
        const newScenario: SimulationInput = {
          ...copyData,
          id: created.id,
        };
        setScenarios((prev) => [newScenario, ...prev]);
        setActiveScenarioId(newScenario.id);
        addToast('Scenario Cloned', `Created scenario "${newScenario.scenarioName}"`, 'success');
      } else {
        const newScenario = { ...copyData, id: `scenario-${Date.now()}` };
        setScenarios((prev) => [newScenario, ...prev]);
        setActiveScenarioId(newScenario.id);
      }
    } catch (e) {
      const newScenario = { ...copyData, id: `scenario-${Date.now()}` };
      setScenarios((prev) => [newScenario, ...prev]);
      setActiveScenarioId(newScenario.id);
    }
  };

  // Delete scenario via DELETE /api/scenarios/:id
  const handleDeleteScenario = async (id: string) => {
    if (scenarios.length <= 1) return;
    const target = scenarios.find((s) => s.id === id);
    const filtered = scenarios.filter((s) => s.id !== id);
    setScenarios(filtered);
    if (activeScenarioId === id) {
      setActiveScenarioId(filtered[0].id);
    }

    try {
      const res = await fetch(`/api/scenarios/${id}`, {
        method: 'DELETE',
      });
      if (checkUnauthorized(res)) return;
      if (res.ok) {
        addToast('Deleted', `Removed scenario "${target?.scenarioName || 'model'}"`, 'info');
      }
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
        {fetchError && (
          <div className="bg-[#B4694A]/10 border border-[#B4694A]/40 rounded p-3 text-xs text-[#E8EAF0] flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#B4694A] flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={loadScenarios}
              className="px-3 py-1 bg-[#B4694A] hover:bg-[#a35b3e] text-[#0E1420] font-semibold text-xs rounded transition flex items-center space-x-1 flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3 inline" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-[#161D2C] border border-[#2A3346] rounded p-4 space-y-2">
                  <div className="h-3 w-1/2 bg-[#2A3346] rounded" />
                  <div className="h-6 w-3/4 bg-[#2A3346] rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 h-[380px] bg-[#161D2C] border border-[#2A3346] rounded" />
              <div className="lg:col-span-7 h-[380px] bg-[#161D2C] border border-[#2A3346] rounded" />
            </div>
          </div>
        ) : activeTab === 'simulator' ? (
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

      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <footer className="border-t border-[#2A3346] bg-[#0E1420] py-3 text-center text-xs text-[#8B92A8]">
        <p>Burnly Startup Financial Model • Precision decision sandbox</p>
      </footer>
    </div>
  );
}
