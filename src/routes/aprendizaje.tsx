import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  Check,
  Compass,
  Layers,
  Lock,
  BarChart3,
  MapPin,
  RotateCcw,
  Zap,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { UnitMasteryDialog } from "@/components/learning/UnitMasteryDialog";
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
  isRecommended,
  isLast,
  canCumulative,
  onOpenDetail,
}: {
  unit: LearningPathUnit;
  isCurrent: boolean;
  isRecommended: boolean;
  isLast: boolean;
  canCumulative: boolean;
  onOpenDetail: () => void;
}) {
  const evaluable = unit.taskIds.length > 0;
  const mastery = unit.masteryPct ?? 0;
  const completed = evaluable && mastery >= 80;

  return (
    <li id={`unidad-${unit.sequence}`} className="relative scroll-mt-24 grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 sm:grid-cols-[2.75rem_minmax(0,1fr)]">
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
        role="button"
        tabIndex={0}
        aria-label={`Ver desglose por tarea ECO de ${unit.title}`}
        onClick={onOpenDetail}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenDetail();
          }
        }}
        className={cn(
          "cursor-pointer rounded-2xl border bg-card p-4 text-left transition-colors hover:bg-secondary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-5",
          isRecommended
            ? "border-primary shadow-panel ring-1 ring-primary/30"
            : isCurrent
              ? "border-accent shadow-panel"
              : "border-border",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <DomainBadges domains={unit.domains} />
          {isRecommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              <Zap className="h-3 w-3" /> Siguiente recomendada
            </span>
          )}
          {isCurrent && !isRecommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
              <MapPin className="h-3 w-3" /> Vas por aquí
            </span>
          )}
        </div>

        <h3 className="mt-2 flex items-start justify-between gap-3 text-base font-semibold leading-snug">
          <span>{unit.title}</span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" /> Detalle
          </span>
        </h3>
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

            <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              <Link
                to="/practica"
                search={{ modo: "unit_quiz", unidad: unit.id, repaso: undefined }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                <BookOpen className="h-4 w-4" /> Practicar esta lección
              </Link>
              <Link
                to="/practica"
                search={{ modo: "unit_quiz", unidad: unit.id, repaso: "errores" }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent bg-warning-soft px-3 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:brightness-95"
              >
                <RotateCcw className="h-4 w-4" /> Repasar mis errores de esta unidad
              </Link>
              {canCumulative ? (
                <Link
                  to="/practica"
                  search={{ modo: "cumulative", unidad: unit.id, repaso: undefined }}
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

  const [detailUnit, setDetailUnit] = useState<LearningPathUnit | null>(null);
  const units = data ?? [];
  const evaluable = units.filter((u) => u.taskIds.length > 0);
  const currentUnit = evaluable.find((u) => (u.masteryPct ?? 0) < 80) ?? null;
  // Recomendada = la lección evaluable más incompleta (menor mastery_pct); a igualdad, la más temprana.
  const recommended =
    [...evaluable]
      .filter((u) => (u.masteryPct ?? 0) < 80)
      .sort((a, b) => (a.masteryPct ?? 0) - (b.masteryPct ?? 0) || a.sequence - b.sequence)[0] ?? null;
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

          {recommended && (
            <div className="mt-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                <Zap className="h-3.5 w-3.5" /> Siguiente recomendada
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug">
                {recommended.sequence}. {recommended.title}
              </p>
              <p className="num mt-0.5 text-xs text-muted-foreground">
                Es tu lección más incompleta: {recommended.masteryPct ?? 0}% de dominio
                {recommended.practisedTasks === 0 ? " · sin practicar todavía" : ""}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/practica"
                  search={{ modo: "unit_quiz", unidad: recommended.id, repaso: undefined }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <BookOpen className="h-4 w-4" /> Continuar por aquí
                </Link>
                <a
                  href={`#unidad-${recommended.sequence}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Ver en el temario
                </a>
              </div>
            </div>
          )}
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
                isRecommended={recommended?.id === u.id}
                onOpenDetail={() => setDetailUnit(u)}
                isLast={i === units.length - 1}
                canCumulative={u.sequence >= 2}
              />
            ))}
          </ol>
        )}
      </div>

      <UnitMasteryDialog unit={detailUnit} onClose={() => setDetailUnit(null)} />
    </AppShell>
  );
}
