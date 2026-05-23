"use client";

import { useScenarioStore, type DisplayMode } from "@/lib/store/scenarioStore";

export function DisplayModeToggle() {
  const displayMode = useScenarioStore((state) => state.displayMode);
  const setDisplayMode = useScenarioStore((state) => state.setDisplayMode);

  return (
    <div className="flex items-center rounded-sm border border-primary/25 bg-card/80 p-1 text-xs font-bold uppercase tracking-[0.16em] shadow-[0_0_24px_hsl(var(--primary)/0.08)]">
      <ToggleButton
        active={displayMode === "nominal"}
        label="Nominal"
        value="nominal"
        onClick={setDisplayMode}
      />
      <ToggleButton
        active={displayMode === "real"}
        label="Real"
        value="real"
        onClick={setDisplayMode}
      />
    </div>
  );
}

function ToggleButton({
  active,
  label,
  value,
  onClick,
}: {
  active: boolean;
  label: string;
  value: DisplayMode;
  onClick: (value: DisplayMode) => void;
}) {
  return (
    <button
      className={`rounded-sm px-4 py-1.5 transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
      }`}
      type="button"
      onClick={() => onClick(value)}
    >
      {label}
    </button>
  );
}
