import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Check,
  Compass,
  Layers,
  Lock,
  MapPin,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import {
  ECO_DOMAIN_LABELS,
  ECO_DOMAIN_TOKENS,
  getLearningPath,
  type LearningPathUnit,
} from "@/services/learningPathService";

export const Route = createFileRoute("/aprendizaje")({
  head: () => ({
    meta: [
      { title: "Ruta de aprendizaje PMP · Temario por lecciones" },
      {
        name: "description",
        content:
          "Recorre el temario del programa PMP lección a lección, con tu dominio por unidad y práctica dirigida por lección o simulacro acumulativo.",
      },
      { property: "og:title", content: "Ruta de aprendizaje PMP" },
      {
        property: "og:description",
        content: "Temario secuencial con progreso por lección y práctica dirigida.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearningPathPage,
});

function DomainBadges({ domains }: { domains: LearningPathUnit["domains"] }) {
  if (!domains.length) {
    return (
      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        Orientación
      </span>
    );
  }
  return (
    <>
      {domains.map((d) => (
        <span
          key={d}
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
          style={{ background: `var(--${ECO_DOMAIN_TOKENS[d]})` }}
        >
          {ECO_DOMAIN_LABELS[d]}
        </span>
      ))}
    </>
  );
}

function UnitRow({
  unit,
  isCurrent,
  isLast,
  canCumulative,
}: {
  unit: LearningPathUnit;
  isCurrent: boolean;
  isLast: boolean;
  canCumulative: boolean;
}) {
  const evaluable = unit.taskIds.length > 0;
  const mastery = unit.masteryPct ?? 0;
  const completed = evaluable && mastery >= 80;

  return (
    <li className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 sm:grid-cols-[2.75rem_minmax(0,1fr)]">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[1.05rem] top-10 h-[calc(100%-1rem)] w-px bg-border sm:left-[1.3rem]"
        />
      )}
      <div
        className={cn(
          "num relative z-10 grid h-9 w-9 place-items-center rounded-full border text-sm font-bold sm:h-11 sm:w-11",
          completed
            ? "border-transparent bg-primary text-primary-foreground"
            : isCurrent
              ? "border-accent bg-warning-soft text-accent-foreground"
              : "border-border bg-card text-muted-foreground",
        )}
      >
        {completed ? <Check className="h-4 w-4" /> : unit.sequence}
      </div>

      <div
        className={cn(
          "rounded-2xl border bg-card p-4 transition-colors sm:p-5",
          isCurrent ? "border-accent shadow-panel" : "border-border",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <DomainBadges domains={unit.domains} />
          {isCurrent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
              <MapPin className="h-3 w-3" /> Vas por aquí
            </span>
          )}
        </div>

        <h3 className="mt-2 text-base font-semibold leading-snug">{unit.title}</h3>
        {unit.description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{unit.description}</p>
        )}

        {evaluable ? (
          <>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Tu dominio en esta lección</span>
                <span className="num text-muted-foreground">
                  {unit.masteryPct ?? 0}% · {unit.taskIds.length} tarea{unit.taskIds.length === 1 ? "" : "s"} ECO
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{
                    width: `${mastery}%`,
                    background: `var(--${ECO_DOMAIN_TOKENS[unit.domains[0] ?? "process"]})`,
                  }}
                />
              </div>
              {unit.practisedTasks === 0 && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Aún no has practicado ninguna tarea de esta lección.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/practica"
                search={{ modo: "unit_quiz", unidad: unit.id }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                <BookOpen className="h-4 w-4" /> Practicar esta lección
              </Link>
              {canCumulative ? (
                <Link
                  to="/practica"
                  search={{ modo: "cumulative", unidad: unit.id }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  <Layers className="h-4 w-4" /> Simulacro acumulativo hasta aquí
                </Link>
              ) : (
                <span
                  className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground"
                  title="El acumulativo se activa a partir de la lección 2"
                >
                  <Lock className="h-4 w-4" /> Acumulativo no disponible
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-xs leading-relaxed text-accent-foreground">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
            Unidad de orientación: no tiene tareas ECO asociadas, por lo que no se evalúa con
            preguntas. Léela antes de empezar el temario.
          </p>
        )}
      </div>
    </li>
  );
}

function LearningPathPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["learning-path"],
    queryFn: getLearningPath,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const units = data ?? [];
  const evaluable = units.filter((u) => u.taskIds.length > 0);
  const currentUnit = evaluable.find((u) => (u.masteryPct ?? 0) < 80) ?? null;
  const globalMastery = evaluable.length
    ? Math.round(evaluable.reduce((a, u) => a + (u.masteryPct ?? 0), 0) / evaluable.length)
    : 0;

  return (
    <AppShell
      title="Ruta de aprendizaje"
      subtitle="El temario completo, lección a lección, con tu progreso real"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
              <Compass className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Tu progreso en el temario</h2>
              <p className="text-xs text-muted-foreground">
                {evaluable.length} lecciones evaluables · dominio medio {globalMastery}%
                {currentUnit ? ` · siguiente: lección ${currentUnit.sequence}` : " · temario completado"}
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${globalMastery}%` }} />
          </div>
        </section>

        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))}
          </div>
        )}

        {isError && (
          <p className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            No hemos podido cargar el temario: {(error as Error).message}
          </p>
        )}

        {!isLoading && !isError && !units.length && (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Todavía no hay lecciones publicadas en el programa.
          </p>
        )}

        {!!units.length && (
          <ol className="space-y-4">
            {units.map((u, i) => (
              <UnitRow
                key={u.id}
                unit={u}
                isCurrent={currentUnit?.id === u.id}
                isLast={i === units.length - 1}
                canCumulative={u.sequence >= 2}
              />
            ))}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
