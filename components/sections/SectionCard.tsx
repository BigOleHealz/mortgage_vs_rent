import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <details
      className="group rounded-xl border bg-card shadow-sm"
      open
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
        <div>
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
        </div>
        <span className="text-sm text-muted-foreground group-open:rotate-180">
          ^
        </span>
      </summary>
      <div className="space-y-5 border-t px-4 py-4">{children}</div>
    </details>
  );
}
