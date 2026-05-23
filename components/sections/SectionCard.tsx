import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <details
      className="operator-panel group rounded-sm"
      open
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-primary/15 px-4 py-3">
        <div>
          {eyebrow ? (
            <p className="operator-kicker">{"// "}{eyebrow}</p>
          ) : null}
          <h2 className="operator-title text-2xl">{title}</h2>
        </div>
        <span className="text-sm font-bold text-primary transition group-open:rotate-180">
          +
        </span>
      </summary>
      <div className="space-y-5 px-4 py-4">{children}</div>
    </details>
  );
}
