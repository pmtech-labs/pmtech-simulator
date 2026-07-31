import { ClipboardList, Clock, Sparkles } from "lucide-react";

import { DOMAIN_LABELS } from "@/lib/export";
import type { StudyPlanStep } from "@/lib/studyPlan";
import { studyPlanSummary } from "@/lib/studyPlan";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<StudyPlanStep["priority"], string> = {
  alta: "border-destructive/40 bg-destructive/10 text-destructive",
  media: "border-accent bg-warning-soft text-accent-foreground",
  baja: "border-border bg-secondary text-secondary-foreground",
};

export function StudyPlanCard({ steps }: { steps: StudyPlanStep[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">Plan de estudio sugerido</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Generado a partir de tu patrón de errores: practica primero las causas que más veces te han
        hecho fallar. {studyPlanSummary(steps)}
      </p>

      {steps.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Todavía no hay fallos suficientes registrados. Completa una simulación para recibir tu plan.
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {steps.map((s, i) => (
            <li key={s.errorType} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="num grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold">{s.short}</span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    PRIORITY_STYLES[s.priority],
                  )}
                >
                  Prioridad {s.priority}
                </span>
                <span className="num ml-auto text-xs text-muted-foreground">
                  {s.occurrences} fallos · {s.sharePct}%
                </span>
              </div>

              <p className="mt-2 text-xs leading-snug text-muted-foreground">{s.meaning}</p>
              <p className="mt-2 text-sm leading-relaxed">{s.action}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium">
                  <Sparkles className="h-3 w-3" /> {s.drill}
                </span>
                <span className="num inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium">
                  <Clock className="h-3 w-3" /> {s.minutes} min
                </span>
                {s.domains.map((d) => (
                  <span key={d} className="rounded-md border border-border px-2 py-1 text-muted-foreground">
                    {DOMAIN_LABELS[d]}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
