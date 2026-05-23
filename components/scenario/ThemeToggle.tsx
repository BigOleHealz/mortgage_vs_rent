"use client";

import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useScenarioStore, type ThemeMode } from "@/lib/store/scenarioStore";

export function ThemeToggle() {
  const themeMode = useScenarioStore((state) => state.themeMode);
  const setThemeMode = useScenarioStore((state) => state.setThemeMode);

  return (
    <div className="flex items-center rounded-sm border border-primary/25 bg-card/80 p-1 text-xs font-bold uppercase tracking-[0.16em] shadow-[0_0_24px_hsl(var(--primary)/0.08)]">
      <ToggleButton
        active={themeMode === "light"}
        icon={<Sun className="h-4 w-4" />}
        label="Light"
        value="light"
        onClick={setThemeMode}
      />
      <ToggleButton
        active={themeMode === "dark"}
        icon={<Moon className="h-4 w-4" />}
        label="Dark"
        value="dark"
        onClick={setThemeMode}
      />
    </div>
  );
}

function ToggleButton({
  active,
  icon,
  label,
  value,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  value: ThemeMode;
  onClick: (value: ThemeMode) => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
      }`}
      type="button"
      onClick={() => onClick(value)}
    >
      {icon}
      {label}
    </button>
  );
}
