import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

import {
  buildRecommendations,
  type PerformanceBreakdown,
  type PerformanceDimension,
  type PerformanceSlice,
} from "@/services/performanceService";
import { usePerformanceBreakdown } from "@/hooks/useCandidateData";
import { cn } from "@/lib/utils";
import type { DomainCode } from "@/types/exam";

const PRIORITY_STYLES: Record<"alta" | "media" | "baja", string> = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-warning-soft text-accent-foreground",
  baja: "bg-secondary text-secondary-foreground",
};

const DIMENSION_ORDER: { key: PerformanceDimension; title: string }[] = [
  { key: "domain", title: "Por dominio ECO" },
  { key: "approach", title: "Por enfoque" },
  { key: "focus", title: "Por área de enfoque" },
  { key: "performance_domain", title: "Por dominio de desempeño" },
];

function SliceBar({ slice }: { slice: PerformanceSlice }) {
  const tone =
    slice.accuracy < 55 ? "bg-destructive" : slice.accuracy < 70 ? "bg-accent" : "bg-primary";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="min-w-0 truncate font-medium">{slice.label}</span>
        <span className="num shrink-0 text-muted-foreground">
          {slice.accuracy}% · {slice.total} pr.
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${slice.accuracy}%` }} />
      </div>
    </div>
  );
}

/**
 * Recomendaciones de práctica para hoy a partir del rendimiento real por
 * dominio, enfoque, área de enfoque y dominio de desempeño.
 */
export function RecommendationsCard({
  masteryByDomain,
}: {
  masteryByDomain: Record<DomainCode, number>;
}) {
  const { data, isLoading } = usePerformanceBreakdown();

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />;
  }

  const breakdown: PerformanceBreakdown = data ?? {
    answered: 0,
    byDimension: { domain: [], approach: [], focus: [], performance_domain: [] },
  };
  const recommendations = buildRecommendations(breakdown, masteryByDomain).slice(0, 4);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Qué practicar hoy</h3>
            <p className="text-xs text-muted-foreground">
              {breakdown.answered
                ? `Recomendaciones calculadas sobre tus ${breakdown.answered} respuestas registradas.`
                : "Aún no hay respuestas suficientes: empezamos por tu dominio más flojo."}
            </p>
          </div>
        </div>
        <Link
          to="/progreso"
          className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Ver analítica
        </Link>
      </div>

      <ul className="mt-4 space-y-2">
        {recommendations.map((r) => (
          <li key={r.id}>
            <Link
              to="/practica"
              search={r.search}
              className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{r.title}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {r.dimensionLabel}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      PRIORITY_STYLES[r.priority],
                    )}
                  >
                    Prioridad {r.priority}
                  </span>
                </div>
                <p className="num mt-1 text-xs text-muted-foreground">{r.reason}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
                Practicar {r.minutes} min
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
        {!recommendations.length && (
          <li className="flex items-start gap-2 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
            <Compass className="mt-0.5 h-4 w-4 shrink-0" />
            Tu rendimiento está por encima del 85 % en todas las dimensiones medidas. Mantén el
            nivel con un simulacro completo.
          </li>
        )}
      </ul>

      {breakdown.answered > 0 && (
        <div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIMENSION_ORDER.map(({ key, title }) => {
            const slices = breakdown.byDimension[key].slice(0, 4);
            return (
              <div key={key}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {title}
                </p>
                <div className="mt-2 space-y-2.5">
                  {slices.length ? (
                    slices.map((s) => <SliceBar key={s.key} slice={s} />)
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin datos todavía.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
