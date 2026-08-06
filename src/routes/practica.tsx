import { createFileRoute, Link } from "@tanstack/react-router";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, ChevronRight, Clock, Info, Layers, RotateCcw, Target, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { HelpLinks } from "@/components/support/HelpLinks";
import { ResultReportButton } from "@/components/export/ResultReportButton";
import { DistractorAnalytics } from "@/components/exam/DistractorAnalytics";
import { ExplanationPanel } from "@/components/exam/ExplanationPanel";
import { QuestionGraphic, QuestionInput } from "@/components/exam/QuestionInput";
import { MOCK_ERROR_TYPE_STATS, MOCK_FINISH_SUMMARY, MOCK_QUESTIONS, MOCK_UNIT_PROGRESS } from "@/data/mockData";
import { ERROR_TYPE_LABELS } from "@/lib/errorTypes";
import { PERFORMANCE_DOMAIN_LABELS, PROCESS_GROUP_LABELS } from "@/lib/questionTags";

import { DOMAIN_LABELS } from "@/lib/export";
import { cn } from "@/lib/utils";
import { isAnswerCorrect } from "@/services/examService";
import { listPublishedUnits } from "@/services/curriculumService";
import type { AnswerValue, DomainCode, ErrorType, Question } from "@/types/exam";

export const Route = createFileRoute("/practica")({
  validateSearch: (search: Record<string, unknown>) => ({
    modo:
      search.modo === "unit_quiz" || search.modo === "cumulative" || search.modo === "domain_drill"
        ? (search.modo as "unit_quiz" | "cumulative" | "domain_drill")
        : undefined,
    unidad: typeof search.unidad === "string" ? search.unidad : undefined,
    repaso: search.repaso === "errores" ? ("errores" as const) : undefined,
    dominio: typeof search.dominio === "string" ? search.dominio : undefined,
    enfoque: typeof search.enfoque === "string" ? search.enfoque : undefined,
    desempeno: typeof search.desempeno === "string" ? search.desempeno : undefined,
    foco: typeof search.foco === "string" ? search.foco : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Práctica por dominios · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Mini-simulaciones de 5 preguntas filtradas por dominio del ECO 2026 con métricas de aciertos y tiempo por dominio.",
      },
      { property: "og:title", content: "Práctica por dominios PMP" },
      {
        property: "og:description",
        content: "Entrena Personas, Procesos o Entorno de negocio con métricas de precisión y tiempo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: () => (
    <RequireAuth>
      <PracticePage />
    </RequireAuth>
  ),
});

const ALL_DOMAINS: DomainCode[] = ["people", "process", "business"];

type PracticeMode = "domain_drill" | "unit_quiz" | "cumulative";

const MODE_LABELS: Record<PracticeMode, string> = {
  domain_drill: "Práctica por dominios",
  unit_quiz: "Practicar esta lección",
  cumulative: "Simulacro acumulativo (todo lo visto hasta aquí)",
};
const DRILL_SIZE = 5;

/** Opciones del filtro de enfoque (se envían a `start_exam` como `approach_filter`). */
export type ApproachOption = "all" | "predictive" | "agile_hybrid" | "agile" | "hybrid";

const APPROACH_LABELS: Record<ApproachOption, string> = {
  all: "Todos los enfoques",
  predictive: "Predictivo",
  agile_hybrid: "Ágil + Híbrido",
  agile: "Solo Ágil",
  hybrid: "Solo Híbrido",
};

const NO_QUESTIONS_MESSAGE =
  "No hay preguntas disponibles para estos filtros. Prueba con otro enfoque o amplía los dominios seleccionados.";

function matchesApproach(approach: Question["approach"], filter: ApproachOption) {
  if (filter === "all") return true;
  if (filter === "agile_hybrid") return approach === "agile" || approach === "hybrid";
  return approach === filter;
}

/** Tipos de error recientes del candidato en una lección (fallback: patrón global). */
export function recentErrorTypes(sequence?: number): ErrorType[] {
  const unit = sequence ? MOCK_UNIT_PROGRESS.find((u) => u.sequence === sequence) : undefined;
  const source = unit?.errorTypes?.length
    ? unit.errorTypes
    : MOCK_ERROR_TYPE_STATS.slice(0, 3);
  return [...source]
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 3)
    .map((e) => e.errorType);
}

function buildDrill(
  domains: DomainCode[],
  approach: ApproachOption,
  errorTypes?: ErrorType[],
  processGroup?: string,
  performanceDomain?: string,
  focusTag?: string,
): Question[] {
  const base = MOCK_QUESTIONS.filter(
    (q) =>
      domains.includes(q.domain) &&
      matchesApproach(q.approach, approach) &&
      (!processGroup || !q.processGroup || q.processGroup === processGroup) &&
      (!performanceDomain || !q.performanceDomain || q.performanceDomain === performanceDomain) &&
      (!focusTag || (q.focusTags ?? []).some((t) => t === focusTag)),
  );


  const pool = errorTypes?.length
    ? (base.filter((q) => q.errorType && errorTypes.includes(q.errorType)).length
        ? base.filter((q) => q.errorType && errorTypes.includes(q.errorType))
        : base)
    : base;
  if (!pool.length) return [];
  const out: Question[] = [];
  for (let i = 0; i < DRILL_SIZE; i++) out.push(pool[i % pool.length]);
  return out;
}

function fmtTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function PracticePage() {
  const search = Route.useSearch();
  const [selected, setSelected] = useState<DomainCode[]>(
    search.dominio && ALL_DOMAINS.includes(search.dominio as DomainCode)
      ? [search.dominio as DomainCode]
      : ["process"],
  );
  const [mode, setMode] = useState<PracticeMode>(search.modo ?? "domain_drill");
  const [unitId, setUnitId] = useState<string>(search.unidad ?? "");
  const [errorReview, setErrorReview] = useState<boolean>(search.repaso === "errores");
  const [approachFilter, setApproachFilter] = useState<ApproachOption>(
    search.enfoque === "predictive" || search.enfoque === "agile" || search.enfoque === "hybrid"
      ? (search.enfoque as ApproachOption)
      : "all",
  );
  const [processGroupFilter, setProcessGroupFilter] = useState<string>("");
  const [performanceDomainFilter, setPerformanceDomainFilter] = useState<string>(
    search.desempeno && search.desempeno in PERFORMANCE_DOMAIN_LABELS ? search.desempeno : "",
  );

  const [startError, setStartError] = useState<string | null>(null);
  const [drill, setDrill] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [times, setTimes] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  const unitsQuery = useQuery({
    queryKey: ["published-units"],
    queryFn: listPublishedUnits,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!drill || finished) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [drill, finished]);

  const toggleDomain = (d: DomainCode) =>
    setSelected((prev) => (prev.includes(d) ? prev.filter((v) => v !== d) : [...prev, d]));

  const start = () => {
    const sequence = unitsQuery.data?.find((u) => u.id === unitId)?.sequence;
    const built = buildDrill(
      mode === "domain_drill" ? selected : ALL_DOMAINS,
      approachFilter,
      errorReview && mode === "unit_quiz" ? recentErrorTypes(sequence) : undefined,
      processGroupFilter || undefined,
      performanceDomainFilter || undefined,
    );

    if (!built.length) {
      setStartError(NO_QUESTIONS_MESSAGE);
      return;
    }
    setStartError(null);
    setDrill(built);
    setIndex(0);
    setAnswers({});
    setTimes({});
    setChecked({});
    setFinished(false);
    setElapsed(0);
    startRef.current = Date.now();
  };

  const reset = () => {
    setDrill(null);
    setFinished(false);
  };

  const commitTime = () => {
    const spent = Math.max(1, Math.floor((Date.now() - startRef.current) / 1000) - Object.values(times).reduce((a, b) => a + b, 0));
    setTimes((prev) => ({ ...prev, [index]: (prev[index] ?? 0) + spent }));
  };

  const next = () => {
    commitTime();
    if (index === DRILL_SIZE - 1) setFinished(true);
    else setIndex((i) => i + 1);
  };

  const stats = useMemo(() => {
    if (!drill) return null;
    const byDomain = new Map<DomainCode, { total: number; correct: number; seconds: number }>();
    let correct = 0;
    let seconds = 0;
    drill.forEach((q, i) => {
      const ok = isAnswerCorrect(q, answers[i]);
      const t = times[i] ?? 0;
      if (ok) correct++;
      seconds += t;
      const entry = byDomain.get(q.domain) ?? { total: 0, correct: 0, seconds: 0 };
      entry.total++;
      if (ok) entry.correct++;
      entry.seconds += t;
      byDomain.set(q.domain, entry);
    });
    return { correct, seconds, pct: Math.round((correct / drill.length) * 100), byDomain: [...byDomain.entries()] };
  }, [drill, answers, times]);

  if (!drill) {
    const units = unitsQuery.data ?? [];
    const hasUnits = units.length > 0;
    const currentUnit = units.find((u) => u.id === unitId);
    const canStart =
      mode === "domain_drill" ? selected.length > 0 : Boolean(unitId);

    return (
      <AppShell title="Práctica" subtitle="Mini-simulación de 5 preguntas enfocada">
        <div className="mx-auto max-w-3xl space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
                <Target className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Elige el modo de práctica</h2>
                <p className="text-xs text-muted-foreground">
                  Generaremos una serie de {DRILL_SIZE} preguntas con métricas de aciertos y tiempo por dominio.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {(["domain_drill", "unit_quiz", "cumulative"] as PracticeMode[])
                .filter((m) => m === "domain_drill" || hasUnits)
                .map((m) => {
                  const active = mode === m;
                  const Icon = m === "domain_drill" ? Target : m === "unit_quiz" ? BookOpen : Layers;
                  return (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary",
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <p className="mt-2 text-sm font-semibold leading-snug">{MODE_LABELS[m]}</p>
                    </button>
                  );
                })}
            </div>

            {mode === "domain_drill" ? (
              <>
                <p className="mt-5 text-xs font-medium">Selecciona uno o varios dominios</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {ALL_DOMAINS.map((d) => {
                    const active = selected.includes(d);
                    const available = MOCK_QUESTIONS.filter((q) => q.domain === d).length;
                    return (
                      <button
                        key={d}
                        onClick={() => toggleDomain(d)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-colors",
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:bg-secondary",
                        )}
                      >
                        <p className="text-sm font-semibold">{DOMAIN_LABELS[d]}</p>
                        <p className="num mt-1 text-xs text-muted-foreground">
                          {available} preguntas disponibles
                        </p>
                      </button>
                    );
                  })}
                </div>
                {!selected.length && (
                  <p className="mt-2 text-xs text-destructive">Selecciona al menos un dominio.</p>
                )}
              </>
            ) : (
              <>
                <label className="mt-5 block text-xs font-medium">
                  {mode === "unit_quiz" ? "Lección a practicar" : "Acumular hasta la lección"}
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecciona una lección…</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.sequence}. {u.title}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Nuestro temario propio — mapeado a las tareas ECO 2026, no un concepto oficial de PMI.</span>
                </p>
                {mode === "unit_quiz" && (
                  <label className="mt-3 flex items-start gap-2 rounded-xl border border-border p-3 text-xs">
                    <input
                      type="checkbox"
                      checked={errorReview}
                      onChange={(e) => setErrorReview(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">Repasar solo mis errores</span>
                      <span className="text-muted-foreground">
                        Prioriza preguntas asociadas a tus fallos recientes
                        {currentUnit
                          ? `: ${recentErrorTypes(currentUnit.sequence).map((t) => ERROR_TYPE_LABELS[t]).join(", ")}`
                          : ""}
                        .
                      </span>
                    </span>
                  </label>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {mode === "unit_quiz"
                    ? errorReview
                      ? "Serie centrada en las tareas ECO de esa lección donde has fallado recientemente."
                      : "Solo entrarán preguntas de las tareas ECO asociadas a esa lección."
                    : currentUnit
                      ? `Incluirá el contenido de las lecciones 1 a ${currentUnit.sequence}, no solo la última.`
                      : "Incluirá el contenido de todas las lecciones publicadas hasta la que elijas."}
                </p>
              </>
            )}

            <label className="mt-5 block text-xs font-medium">
              Enfoque
              <select
                value={approachFilter}
                onChange={(e) => {
                  setApproachFilter(e.target.value as ApproachOption);
                  setStartError(null);
                }}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {(Object.keys(APPROACH_LABELS) as ApproachOption[]).map((opt) => (
                  <option key={opt} value={opt}>
                    {APPROACH_LABELS[opt]}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block text-xs font-medium">
              Área de enfoque
              <select
                value={processGroupFilter}
                onChange={(e) => {
                  setProcessGroupFilter(e.target.value);
                  setStartError(null);
                }}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas las áreas</option>
                {Object.entries(PROCESS_GROUP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block text-xs font-medium">
              Dominio de desempeño
              <select
                value={performanceDomainFilter}
                onChange={(e) => {
                  setPerformanceDomainFilter(e.target.value);
                  setStartError(null);
                }}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los dominios</option>
                {Object.entries(PERFORMANCE_DOMAIN_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <p className="mt-1 text-xs text-muted-foreground">
              El enfoque solo se aplica a los modos de práctica; el simulacro completo mantiene su reparto real.
            </p>

            {startError && (
              <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {startError}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={start}
                disabled={!canStart}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                Empezar práctica <ChevronRight className="h-4 w-4" />
              </button>
              <HelpLinks />
            </div>


          </section>
        </div>
      </AppShell>
    );
  }

  if (finished && stats) {
    return (
      <AppShell title="Resultado de la práctica" subtitle={`${DRILL_SIZE} preguntas · ${fmtTime(stats.seconds)}`}>
        <div className="mx-auto max-w-3xl space-y-5">
          <section className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="num font-display text-5xl font-bold">{stats.pct}%</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.correct} de {DRILL_SIZE} correctas · tiempo total {fmtTime(stats.seconds)}
            </p>
            <p className="mx-auto mt-4 flex max-w-xl items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-left text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {MOCK_FINISH_SUMMARY.disclaimer}
            </p>

            <div className="mt-4 flex justify-center">
              <ResultReportButton
                report={{
                  title: "Informe de práctica por dominios · PMP",
                  subtitle: `Puntuación ${stats.pct}% · ${stats.correct} de ${DRILL_SIZE} correctas · tiempo total ${fmtTime(stats.seconds)}`,
                  scorePct: stats.pct,
                  correct: stats.correct,
                  total: DRILL_SIZE,
                  extraRows: [
                    { label: "Tiempo total", value: fmtTime(stats.seconds) },
                    ...stats.byDomain.map(([domain, m]) => ({
                      label: DOMAIN_LABELS[domain],
                      value: `${m.correct}/${m.total} aciertos · ${fmtTime(m.seconds)}`,
                    })),
                  ],
                  items: drill.map((q, i) => ({ question: q, answer: answers[i] })),
                }}
              />
            </div>
          </section>


          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Métricas por dominio</h2>
            <div className="mt-3 space-y-3">
              {stats.byDomain.map(([domain, m]) => (
                <div key={domain} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{DOMAIN_LABELS[domain]}</span>
                    <span className="num text-xs text-muted-foreground">
                      {m.correct}/{m.total} aciertos · {fmtTime(m.seconds)} · {fmtTime(Math.round(m.seconds / m.total))} por pregunta
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round((m.correct / m.total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <DistractorAnalytics
            items={drill.map((q, i) => ({ question: q, answer: answers[i] }))}
          />

          <section className="space-y-4">
            <h2 className="text-sm font-semibold">Revisión</h2>
            {drill.map((q, i) => {
              const ok = isAnswerCorrect(q, answers[i]);
              return (
                <div key={`${q.id}-${i}`} className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <div className="flex items-start gap-2">
                    {ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <p className="text-sm font-medium leading-relaxed">{q.stem}</p>
                  </div>
                  <p className="num text-xs text-muted-foreground">
                    {DOMAIN_LABELS[q.domain]} · {fmtTime(times[i] ?? 0)}
                  </p>
                  {!ok && q.errorType && (
                    <p className="rounded-lg bg-destructive/10 p-2.5 text-xs leading-relaxed text-foreground">
                      <span className="font-semibold">Tipo de error: </span>
                      {ERROR_TYPE_LABELS[q.errorType]}
                    </p>
                  )}
                  <ExplanationPanel question={q} answer={answers[i]} />
                </div>
              );
            })}
          </section>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <RotateCcw className="h-4 w-4" /> Nueva práctica
            </button>
            <Link to="/historial" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
              Ver historial
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const q = drill[index];
  const answer = answers[index];
  const isChecked = Boolean(checked[index]);
  const currentOk = isAnswerCorrect(q, answer);

  return (
    <AppShell
      title="Práctica por dominios"
      subtitle={`Pregunta ${index + 1} de ${DRILL_SIZE}`}
      actions={
        <span className="num hidden items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm font-semibold sm:inline-flex">
          <Clock className="h-4 w-4" /> {fmtTime(elapsed)}
        </span>
      }
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${((index + 1) / DRILL_SIZE) * 100}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-md bg-secondary px-2 py-1 font-semibold text-secondary-foreground">
            {DOMAIN_LABELS[q.domain]}
          </span>
          <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">{q.taskCode}</span>
        </div>

        <QuestionGraphic question={q} />
        <p className="text-[15px] font-medium leading-relaxed">{q.stem}</p>

        <QuestionInput
          question={q}
          answer={answer}
          disabled={isChecked}
          reveal={isChecked}
          correctAnswer={isChecked ? q.correctAnswer : undefined}
          onChange={(next) => setAnswers((prev) => ({ ...prev, [index]: next }))}
        />

        {isChecked && (
          <div className="space-y-4">
            <div
              className={cn(
                "flex items-start gap-2 rounded-xl border p-3",
                currentOk ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10",
              )}
            >
              {currentOk ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {currentOk ? "Respuesta correcta" : "Respuesta incorrecta"}
                </p>
                {!currentOk && q.errorType && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Tipo de error: </span>
                    {ERROR_TYPE_LABELS[q.errorType]}
                  </p>
                )}
              </div>
            </div>
            <ExplanationPanel question={q} answer={answer} />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <button onClick={reset} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Salir
          </button>
          <div className="flex items-center gap-2">
            {!isChecked && (
              <button
                onClick={() => setChecked((c) => ({ ...c, [index]: true }))}
                disabled={!answer}
                className="rounded-lg border border-accent bg-warning-soft px-3 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-40"
              >
                Comprobar
              </button>
            )}
            <button
              onClick={next}
              disabled={!answer}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {index === DRILL_SIZE - 1 ? "Ver resultados" : "Siguiente"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
