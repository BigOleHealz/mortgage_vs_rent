"use client";

import { useState } from "react";
import { type ScenarioId, useScenarioStore } from "@/lib/store/scenarioStore";

export function ScenarioPicker() {
  const [name, setName] = useState("");
  const [savedOpen, setSavedOpen] = useState(false);
  const activeScenarioId = useScenarioStore((state) => state.activeScenarioId);
  const compareMode = useScenarioStore((state) => state.compareMode);
  const savedScenarios = useScenarioStore((state) => state.savedScenarios);
  const setActiveScenarioId = useScenarioStore((state) => state.setActiveScenarioId);
  const setCompareMode = useScenarioStore((state) => state.setCompareMode);
  const saveNamedScenario = useScenarioStore((state) => state.saveNamedScenario);
  const loadSavedScenario = useScenarioStore((state) => state.loadSavedScenario);
  const duplicateSavedScenario = useScenarioStore(
    (state) => state.duplicateSavedScenario,
  );
  const deleteSavedScenario = useScenarioStore((state) => state.deleteSavedScenario);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="rounded-sm border border-primary/25 bg-card/80 p-1 text-xs font-bold uppercase tracking-[0.16em] shadow-[0_0_24px_hsl(var(--primary)/0.08)]">
        {(["A", "B"] as ScenarioId[]).map((scenarioId) => (
          <button
            className={`rounded-sm px-3 py-1.5 transition ${
              activeScenarioId === scenarioId
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            key={scenarioId}
            type="button"
            onClick={() => setActiveScenarioId(scenarioId)}
          >
            Scenario_{scenarioId}
          </button>
        ))}
      </div>
      <button
        className={`rounded-sm border border-primary/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] shadow-[0_0_24px_hsl(var(--primary)/0.08)] ${
          compareMode
            ? "bg-primary text-primary-foreground"
            : "bg-card/80 text-primary"
        }`}
        type="button"
        onClick={() => setCompareMode(!compareMode)}
      >
        Compare
      </button>
      <div className="relative">
        <button
          className="rounded-sm border border-primary/25 bg-card/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-[0_0_24px_hsl(var(--primary)/0.08)]"
          type="button"
          onClick={() => setSavedOpen((isOpen) => !isOpen)}
        >
          Saved
        </button>
        {savedOpen ? (
        <div className="fixed right-6 top-24 z-50 w-80 rounded-sm border border-primary/25 bg-card/95 p-3 shadow-[0_0_32px_hsl(var(--primary)/0.18)] backdrop-blur">
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-sm border-primary/15 bg-background/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em]"
              placeholder={`Name Scenario ${activeScenarioId}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button
              className="rounded-sm bg-primary px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground"
              type="button"
              onClick={() => {
                saveNamedScenario(name || `Scenario ${activeScenarioId}`);
                setName("");
              }}
            >
              Save
            </button>
          </div>
          <div className="mt-3 max-h-72 space-y-2 overflow-auto">
            {savedScenarios.length === 0 ? (
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                No saved scenarios yet.
              </p>
            ) : null}
            {savedScenarios.map((savedScenario) => (
              <div
                className="rounded-sm border border-primary/10 bg-secondary/40 p-2"
                key={savedScenario.id}
              >
                <p className="font-bold uppercase tracking-[0.12em]">
                  {savedScenario.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.12em]">
                  <button type="button" onClick={() => loadSavedScenario(savedScenario.id, activeScenarioId)}>
                    Load {activeScenarioId}
                  </button>
                  <button type="button" onClick={() => duplicateSavedScenario(savedScenario.id)}>
                    Duplicate
                  </button>
                  <button type="button" onClick={() => deleteSavedScenario(savedScenario.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}
