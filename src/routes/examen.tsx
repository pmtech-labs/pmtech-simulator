import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Coffee,
  Info,
  ListChecks,
  Pause,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DistractorAnalytics } from "@/components/exam/DistractorAnalytics";
import { EarnedValueChart } from "@/components/exam/EarnedValueChart";
import { ExplanationPanel } from "@/components/exam/ExplanationPanel";
import { MatchingQuestion } from "@/components/exam/MatchingQuestion";
import { FlagButton, OptionList } from "@/components/exam/OptionList";
import { QuestionNavigator } from "@/components/exam/QuestionNavigator";
import {
  BREAK_SECONDS,
  CLUSTER,
  EXAM_SECTIONS,
  MOCK_FINISH_SUMMARY,
  MOCK_QUESTIONS,
} from "@/data/mockData";
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
          "Motor de examen PMP en 3 secciones cronometradas con descansos, clusters de caso, ítems de emparejamiento y preguntas situacionales.",
      },
      { property: "og:title", content: "Simulación de examen PMP ECO 2026" },
      {
        property: "og:description",
        content: "Tres secciones cronometradas, descansos de 10 minutos y formato de examen real.",
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

function fmtShort(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function ExamPage() {
  const questions = MOCK_QUESTIONS;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // --- Secciones cronometradas independientes (full_sim) ---
  const [sectionIdx, setSectionIdx] = useState(0);
  const section = EXAM_SECTIONS[sectionIdx];
  const [seconds, setSeconds] = useState(EXAM_SECTIONS[0].seconds);
  const [onBreak, setOnBreak] = useState(false);
  const [breakSeconds, setBreakSeconds] = useState(BREAK_SECONDS);

  const sectionQuestions = useMemo(
    () => questions.filter((q) => (q.sectionNumber ?? 1) === section.sectionNumber),
    [questions, section.sectionNumber],
  );
  const firstIndexOfSection = questions.findIndex(
    (q) => (q.sectionNumber ?? 1) === section.sectionNumber,
  );
  const lastIndexOfSection = firstIndexOfSection + sectionQuestions.length - 1;

  const q = questions[index];
  const answer = answers[q.id];

  useEffect(() => {
    if (paused || finished || onBreak) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [paused, finished, onBreak]);

  useEffect(() => {
    if (!onBreak) return;
    const t = setInterval(() => setBreakSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [onBreak]);

  useEffect(() => {
    if (onBreak && breakSeconds === 0) endBreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBreak, breakSeconds]);

  const score = useMemo(() => {
    const correct = questions.filter((question) => isAnswerCorrect(question, answers[question.id])).length;
    return { correct, pct: Math.round((correct / questions.length) * 100) };
  }, [answers, questions]);

  const toggleOption = (id: string) => {
    setAnswers((prev) => {
      const current = (prev[q.id] as string[]) ?? [];
      if (q.format === "mc_multi") {
        const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
        return { ...prev, [q.id]: next };
      }
      return { ...prev, [q.id]: [id] };
    });
  };

  function closeSection() {
    if (sectionIdx === EXAM_SECTIONS.length - 1) {
      setFinished(true);
      return;
    }
    setBreakSeconds(BREAK_SECONDS);
    setOnBreak(true);
  }

  function endBreak() {
    const nextIdx = sectionIdx + 1;
    if (nextIdx >= EXAM_SECTIONS.length) {
      setOnBreak(false);
      setFinished(true);
      return;
    }
    setOnBreak(false);
    setSectionIdx(nextIdx);
    setSeconds(EXAM_SECTIONS[nextIdx].seconds);
    const first = questions.findIndex(
      (item) => (item.sectionNumber ?? 1) === EXAM_SECTIONS[nextIdx].sectionNumber,
    );
    setIndex(first === -1 ? 0 : first);
  }

  const answeredCount = Object.keys(answers).length;

  if (finished) {
    return <Results questions={questions} answers={answers} score={score} />;
  }

  if (onBreak) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center">
          <Coffee className="mx-auto h-7 w-7 text-accent" />
          <h1 className="mt-3 font-display text-xl font-bold">
            Sección {section.sectionNumber} completada
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dispones de un descanso opcional de 10 minutos antes de la sección{" "}
            {section.sectionNumber + 1}. El cronómetro de la siguiente sección no empieza hasta que
            continúes.
          </p>
          <p className="num mt-4 font-display text-4xl font-bold">{fmtShort(breakSeconds)}</p>
          <button
            onClick={endBreak}
            className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Omitir descanso y continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="num truncate text-sm font-semibold">
              Sección {section.sectionNumber} de {EXAM_SECTIONS.length} · Pregunta {index + 1} de{" "}
              {TOTAL_DISPLAY}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (demo de {questions.length})
              </span>
            </p>
            <div className="mt-1.5 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{
                  width: `${((index - firstIndexOfSection + 1) / sectionQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                "num flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-semibold",
                seconds < 600 ? "border-destructive text-destructive" : "border-border",
              )}
              title={`Tiempo restante de la sección ${section.sectionNumber}`}
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
            activeSection={section.sectionNumber}
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
              activeSection={section.sectionNumber}
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
              El cronómetro de la sección está detenido. En el examen real solo dispones de dos
              descansos de 10 minutos entre secciones.
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
    const isLastOfSection = index === lastIndexOfSection;
    return (
      <>
        <p className="text-[15px] font-medium leading-relaxed">{q.stem}</p>

        {q.format === "matching" ? (
          <MatchingQuestion
            payload={q.matching!}
            value={(answer as Record<string, string>) ?? {}}
            onChange={(next) => setAnswers((prev) => ({ ...prev, [q.id]: next }))}
          />
        ) : (
          <OptionList
            options={q.options!}
            selected={(answer as string[]) ?? []}
            multi={q.format === "mc_multi"}
            onToggle={toggleOption}
          />
        )}

        <p className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          En la simulación completa no se muestra si aciertas o fallas: verás la corrección y las
          explicaciones al terminar el examen, igual que en el examen oficial.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <FlagButton
            flagged={Boolean(flagged[q.id])}
            onToggle={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
          />
          <div className="flex items-center gap-2">
            <button
              disabled={index <= firstIndexOfSection}
              onClick={() => setIndex((i) => i - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            {isLastOfSection ? (
              <button
                onClick={closeSection}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
              >
                {sectionIdx === EXAM_SECTIONS.length - 1
                  ? "Finalizar examen"
                  : `Cerrar sección ${section.sectionNumber}`}
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setIndex((i) => i + 1)}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
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
  const { newItemsCount, repeatedItemsCount, interpretationNote } = MOCK_FINISH_SUMMARY;
  const totalItems = newItemsCount + repeatedItemsCount;

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
          <p className="num mt-2 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {newItemsCount} de {totalItems} preguntas eran nuevas para ti
          </p>

          {interpretationNote && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-accent bg-warning-soft p-3 text-left text-xs leading-relaxed text-accent-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {interpretationNote}
            </p>
          )}

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
            <ResultReportButton
              report={{
                title: "Informe de resultado · Simulación PMP",
                subtitle: `Puntuación ${score.pct}% · ${score.correct} de ${questions.length} correctas · ${newItemsCount} de ${totalItems} preguntas nuevas`,
                scorePct: score.pct,
                correct: score.correct,
                total: questions.length,
                extraRows: [
                  { label: "Preguntas nuevas", value: `${newItemsCount} de ${totalItems}` },
                  { label: "Preguntas repetidas", value: String(repeatedItemsCount) },
                  ...(interpretationNote ? [{ label: "Nota de interpretación", value: interpretationNote }] : []),
                ],
                items: questions.map((q) => ({ question: q, answer: answers[q.id] })),
              }}
            />
          </div>

        </div>

        <DistractorAnalytics
          items={questions.map((q) => ({ question: q, answer: answers[q.id] }))}
        />

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
