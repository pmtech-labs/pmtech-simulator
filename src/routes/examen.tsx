import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  ListChecks,
  Pause,
  Play,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DistractorAnalytics } from "@/components/exam/DistractorAnalytics";
import { EarnedValueChart } from "@/components/exam/EarnedValueChart";
import { ExplanationPanel } from "@/components/exam/ExplanationPanel";
import { MatchingQuestion } from "@/components/exam/MatchingQuestion";
import { FlagButton, OptionList } from "@/components/exam/OptionList";
import { QuestionNavigator } from "@/components/exam/QuestionNavigator";
import { CLUSTER, MOCK_QUESTIONS } from "@/data/mockData";
import { isAnswerCorrect } from "@/services/examService";
import type { AnswerValue } from "@/types/exam";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/examen")({
  head: () => ({
    meta: [
      { title: "Simulación de examen · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Motor de examen PMP con clusters de caso, ítems de emparejamiento y preguntas situacionales, cronómetro y navegador de preguntas.",
      },
      { property: "og:title", content: "Simulación de examen PMP ECO 2026" },
      {
        property: "og:description",
        content: "Practica con casos, drag & drop y preguntas situacionales en formato examen real.",
      },
    ],
  }),
  component: ExamPage,
});

const TOTAL_DISPLAY = 180;

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function ExamPage() {
  const questions = MOCK_QUESTIONS;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [seconds, setSeconds] = useState(240 * 60);
  const [navOpen, setNavOpen] = useState(false);

  const q = questions[index];
  const answer = answers[q.id];
  const isRevealed = Boolean(revealed[q.id]);

  useEffect(() => {
    if (paused || finished) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [paused, finished]);

  const score = useMemo(() => {
    const correct = questions.filter((question) => isAnswerCorrect(question, answers[question.id])).length;
    return { correct, pct: Math.round((correct / questions.length) * 100) };
  }, [answers, questions]);

  const toggleOption = (id: string) => {
    if (isRevealed) return;
    setAnswers((prev) => {
      const current = (prev[q.id] as string[]) ?? [];
      if (q.format === "mc_multi") {
        const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
        return { ...prev, [q.id]: next };
      }
      return { ...prev, [q.id]: [id] };
    });
  };

  const answeredCount = Object.keys(answers).length;

  if (finished) {
    return <Results questions={questions} answers={answers} score={score} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="num truncate text-sm font-semibold">
              Pregunta {index + 1} de {TOTAL_DISPLAY}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (demo de {questions.length})
              </span>
            </p>
            <div className="mt-1.5 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${((index + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                "num flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-semibold",
                seconds < 600 ? "border-destructive text-destructive" : "border-border",
              )}
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">{fmt(seconds)}</span>
              <span className="sm:hidden">{fmt(seconds).slice(0, 5)}</span>
            </div>
            <button
              onClick={() => setPaused((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium hover:bg-secondary"
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              <span className="hidden sm:inline">{paused ? "Reanudar" : "Pausar"}</span>
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Finalizar
            </button>
            <button
              onClick={() => setNavOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border lg:hidden"
              aria-label="Navegador de preguntas"
            >
              <ListChecks className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <main className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-md bg-secondary px-2 py-1 font-semibold text-secondary-foreground">
              {q.taskCode}
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
              {q.approach === "agile" ? "Ágil" : q.approach === "hybrid" ? "Híbrido" : "Predictivo"}
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
              {q.format === "mc_multi"
                ? "Respuesta múltiple"
                : q.format === "matching"
                  ? "Emparejamiento (practicum)"
                  : q.itemType === "case_child"
                    ? "Caso de estudio"
                    : "Situacional"}
            </span>
          </div>

          {q.itemType === "case_child" ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <aside className="space-y-3 rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-24 lg:self-start">
                <h2 className="text-sm font-semibold">{CLUSTER.title}</h2>
                {CLUSTER.scenarioText.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
                <EarnedValueChart chart={CLUSTER.evChart} />
              </aside>
              <div className="space-y-4">
                <QuestionBody />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <QuestionBody />
            </div>
          )}
        </main>

        <aside className="hidden rounded-2xl border border-border bg-card p-4 lg:block lg:sticky lg:top-24 lg:h-fit">
          <QuestionNavigator
            questions={questions}
            current={index}
            answers={answers}
            flagged={flagged}
            onSelect={setIndex}
          />
          <p className="num mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            {answeredCount} de {questions.length} respondidas
          </p>
        </aside>
      </div>

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-foreground/40" onClick={() => setNavOpen(false)} aria-label="Cerrar" />
          <div className="absolute bottom-0 w-full rounded-t-2xl border-t border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Preguntas</p>
              <button onClick={() => setNavOpen(false)} aria-label="Cerrar">
                <X className="h-4 w-4" />
              </button>
            </div>
            <QuestionNavigator
              questions={questions}
              current={index}
              answers={answers}
              flagged={flagged}
              onSelect={(i) => {
                setIndex(i);
                setNavOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {paused && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 px-4">
          <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
            <Pause className="mx-auto h-6 w-6 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">Examen en pausa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              El cronómetro está detenido. En el examen real solo dispones de dos descansos de 10
              minutos.
            </p>
            <button
              onClick={() => setPaused(false)}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Reanudar examen
            </button>
          </div>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
            <AlertTriangle className="h-6 w-6 text-accent" />
            <h2 className="mt-3 text-lg font-semibold">¿Finalizar el examen?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Has respondido {answeredCount} de {questions.length} preguntas. Una vez finalizado no
              podrás modificar tus respuestas.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Seguir respondiendo
              </button>
              <button
                onClick={() => {
                  setConfirming(false);
                  setFinished(true);
                }}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function QuestionBody() {
    return (
      <>
        <p className="text-[15px] font-medium leading-relaxed">{q.stem}</p>

        {q.format === "matching" ? (
          <MatchingQuestion
            payload={q.matching!}
            value={(answer as Record<string, string>) ?? {}}
            reveal={isRevealed}
            disabled={isRevealed}
            onChange={(next) => setAnswers((prev) => ({ ...prev, [q.id]: next }))}
          />
        ) : (
          <OptionList
            options={q.options!}
            selected={(answer as string[]) ?? []}
            multi={q.format === "mc_multi"}
            disabled={isRevealed}
            correctAnswer={isRevealed ? q.correctAnswer : undefined}
            onToggle={toggleOption}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <FlagButton
            flagged={Boolean(flagged[q.id])}
            onToggle={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
          />
          <div className="flex items-center gap-2">
            <button
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            {!isRevealed && answer && (
              <button
                onClick={() => setRevealed((r) => ({ ...r, [q.id]: true }))}
                className="rounded-lg border border-accent bg-warning-soft px-3 py-1.5 text-sm font-semibold text-accent-foreground"
              >
                Comprobar
              </button>
            )}
            <button
              disabled={index === questions.length - 1}
              onClick={() => setIndex((i) => i + 1)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isRevealed && <ExplanationPanel question={q} answer={answer} />}
      </>
    );
  }
}

function Results({
  questions,
  answers,
  score,
}: {
  questions: typeof MOCK_QUESTIONS;
  answers: Record<string, AnswerValue>;
  score: { correct: number; pct: number };
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <CircleCheck className="mx-auto h-7 w-7 text-success" />
          <h1 className="mt-3 font-display text-2xl font-bold">Examen finalizado</h1>
          <p className="num mt-2 font-display text-5xl font-bold">{score.pct}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {score.correct} de {questions.length} respuestas correctas
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              to="/"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Volver al panel
            </Link>
            <Link to="/historial" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
              Ver historial
            </Link>
          </div>
        </div>

        <h2 className="text-base font-semibold">Revisión detallada</h2>
        {questions.map((q, i) => (
          <div key={q.id} className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <p className="text-sm font-medium leading-relaxed">
              <span className="num mr-2 text-muted-foreground">{i + 1}.</span>
              {q.stem}
            </p>
            {q.format === "matching" ? (
              <MatchingQuestion
                payload={q.matching!}
                value={(answers[q.id] as Record<string, string>) ?? {}}
                reveal
                disabled
                onChange={() => {}}
              />
            ) : (
              <OptionList
                options={q.options!}
                selected={(answers[q.id] as string[]) ?? []}
                multi={q.format === "mc_multi"}
                disabled
                correctAnswer={q.correctAnswer}
                onToggle={() => {}}
              />
            )}
            <ExplanationPanel question={q} answer={answers[q.id]} />
          </div>
        ))}
      </div>
    </div>
  );
}
