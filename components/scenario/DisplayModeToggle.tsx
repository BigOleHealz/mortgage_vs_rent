"use client";

import { useScenarioStore, type DisplayMode } from "@/lib/store/scenarioStore";

export function DisplayModeToggle() {
  const displayMode = useScenarioStore((state) => state.displayMode);
  const setDisplayMode = useScenarioStore((state) => state.setDisplayMode);

  return (
    <div className="flex items-center rounded-full border bg-card p-1 text-sm font-semibold shadow-sm">
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
      className={`rounded-full px-4 py-1.5 ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
      }`}
      type="button"
      onClick={() => onClick(value)}
    >
      {label}
    </button>
  );
}
