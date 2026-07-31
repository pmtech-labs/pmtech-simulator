import { useMemo, useState } from "react";
import { Check, ChevronDown, Minus, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ComparisonVerdict = "yes" | "no" | "partial";

export interface ComparisonRow {
  feature: string;
  category: string;
  ours: { verdict: ComparisonVerdict; label: string };
  theirs: { verdict: ComparisonVerdict; label: string };
  detail: string;
}

interface ComparisonMatrixProps {
  title: string;
  ourName: string;
  competitorName: string;
  rows: ComparisonRow[];
}

const VERDICT_STYLES: Record<ComparisonVerdict, string> = {
  yes: "bg-accent/15 text-accent-foreground/90 border-accent/40",
  partial: "bg-secondary text-muted-foreground border-border",
  no: "bg-destructive/10 text-destructive border-destructive/30",
};

function VerdictIcon({ verdict }: { verdict: ComparisonVerdict }) {
  if (verdict === "yes") return <Check className="h-3.5 w-3.5 shrink-0" />;
  if (verdict === "no") return <X className="h-3.5 w-3.5 shrink-0" />;
  return <Minus className="h-3.5 w-3.5 shrink-0" />;
}

function Cell({ verdict, label }: { verdict: ComparisonVerdict; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-start gap-1.5 rounded-md border px-2 py-1 text-left text-[13px] leading-snug",
        VERDICT_STYLES[verdict],
      )}
    >
      <VerdictIcon verdict={verdict} />
      <span>{label}</span>
    </span>
  );
}

export function ComparisonMatrix({
  title,
  ourName,
  competitorName,
  rows,
}: ComparisonMatrixProps) {
  const categories = useMemo(
    () => ["Todo", ...Array.from(new Set(rows.map((r) => r.category)))],
    [rows],
  );
  const [active, setActive] = useState("Todo");
  const [open, setOpen] = useState<string | null>(null);

  const visible = active === "Todo" ? rows : rows.filter((r) => r.category === active);

  return (
    <section className="mb-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Filtra por área y pulsa cualquier fila para ver el detalle de la diferencia.
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Áreas de comparación">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active === cat}
            onClick={() => {
              setActive(cat);
              setOpen(null);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              active === cat
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:border-accent/60 hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <div className="hidden grid-cols-[1.1fr_1fr_1fr] gap-3 border-b border-border bg-secondary/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide sm:grid">
          <span>Criterio</span>
          <span>{ourName}</span>
          <span>{competitorName}</span>
        </div>

        {visible.map((row) => {
          const isOpen = open === row.feature;
          return (
            <div key={row.feature} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : row.feature)}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-1 gap-2 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40 sm:grid-cols-[1.1fr_1fr_1fr] sm:items-start sm:gap-3"
              >
                <span className="flex items-start justify-between gap-2 text-sm font-medium">
                  {row.feature}
                  <ChevronDown
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:hidden">
                    {ourName}
                  </span>
                  <Cell verdict={row.ours.verdict} label={row.ours.label} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:hidden">
                    {competitorName}
                  </span>
                  <Cell verdict={row.theirs.verdict} label={row.theirs.label} />
                </span>
              </button>
              {isOpen && (
                <p className="border-t border-dashed border-border bg-secondary/25 px-4 py-3 text-[14px] leading-relaxed text-muted-foreground">
                  {row.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
