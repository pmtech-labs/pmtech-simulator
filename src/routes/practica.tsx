import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, Clock, RotateCcw, Target, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { DistractorAnalytics } from "@/components/exam/DistractorAnalytics";
import { ExplanationPanel } from "@/components/exam/ExplanationPanel";
import { MatchingQuestion } from "@/components/exam/MatchingQuestion";
import { OptionList } from "@/components/exam/OptionList";
import { MOCK_QUESTIONS } from "@/data/mockData";
import { ERROR_TYPE_LABELS } from "@/lib/errorTypes";
import { DOMAIN_LABELS } from "@/lib/export";
import { cn } from "@/lib/utils";
import { isAnswerCorrect } from "@/services/examService";
import type { AnswerValue, DomainCode, Question } from "@/types/exam";

export const Route = createFileRoute("/practica")({
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
  component: PracticePage,
});

const ALL_DOMAINS: DomainCode[] = ["people", "process", "business"];
const DRILL_SIZE = 5;

function buildDrill(domains: DomainCode[]): Question[] {
  const pool = MOCK_QUESTIONS.filter((q) => domains.includes(q.domain));
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
  const [selected, setSelected] = useState<DomainCode[]>(["process"]);
  const [drill, setDrill] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [times, setTimes] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!drill || finished) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [drill, finished]);

  const toggleDomain = (d: DomainCode) =>
    setSelected((prev) => (prev.includes(d) ? prev.filter((v) => v !== d) : [...prev, d]));

  const start = () => {
    const built = buildDrill(selected);
    if (!built.length) return;
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
    return (
      <AppShell title="Práctica por dominios" subtitle="Mini-simulación de 5 preguntas enfocada">
        <div className="mx-auto max-w-3xl space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
                <Target className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Selecciona uno o varios dominios</h2>
                <p className="text-xs text-muted-foreground">
                  Generaremos una serie de {DRILL_SIZE} preguntas con métricas de aciertos y tiempo por dominio.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
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
                    <p className="num mt-1 text-xs text-muted-foreground">{available} preguntas disponibles</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={start}
              disabled={!selected.length}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Empezar práctica <ChevronRight className="h-4 w-4" />
            </button>
            {!selected.length && (
              <p className="mt-2 text-xs text-destructive">Selecciona al menos un dominio.</p>
            )}
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

        <p className="text-[15px] font-medium leading-relaxed">{q.stem}</p>

        {q.format === "matching" ? (
          <MatchingQuestion
            payload={q.matching!}
            value={(answer as Record<string, string>) ?? {}}
            reveal={isChecked}
            disabled={isChecked}
            onChange={(next) => setAnswers((prev) => ({ ...prev, [index]: next }))}
          />
        ) : (
          <OptionList
            options={q.options!}
            selected={(answer as string[]) ?? []}
            multi={q.format === "mc_multi"}
            disabled={isChecked}
            correctAnswer={isChecked ? q.correctAnswer : undefined}
            onToggle={(id) =>
              setAnswers((prev) => {
                const current = (prev[index] as string[]) ?? [];
                if (q.format === "mc_multi") {
                  return {
                    ...prev,
                    [index]: current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
                  };
                }
                return { ...prev, [index]: [id] };
              })
            }
          />
        )}

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
