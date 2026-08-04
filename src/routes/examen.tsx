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
  Loader2,
  Pause,
  Play,
  Flag,
  Sparkles,
  SkipForward,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { ResultReportButton } from "@/components/export/ResultReportButton";
import { DistractorAnalytics } from "@/components/exam/DistractorAnalytics";
import { EarnedValueChart } from "@/components/exam/EarnedValueChart";
import { ExplanationPanel } from "@/components/exam/ExplanationPanel";
import { FlagButton } from "@/components/exam/OptionList";
import { QuestionGraphic, QuestionInput } from "@/components/exam/QuestionInput";
import { QuestionNavigator } from "@/components/exam/QuestionNavigator";
import { ReportIssueButton } from "@/components/exam/ReportIssueButton";
import { ChatbotWidget } from "@/components/support/ChatbotWidget";
import { HelpLinks } from "@/components/support/HelpLinks";

import { BREAK_SECONDS } from "@/data/mockData";
import { ERROR_TYPE_LABELS, ERROR_TYPE_SHORT } from "@/lib/errorTypes";
import {
  FOCUS_TAG_LABELS,
  PERFORMANCE_DOMAIN_LABELS,
  PROCESS_GROUP_LABELS,
} from "@/lib/questionTags";

import {
  clearExamProgress,
  loadExamProgress,
  saveExamProgress,
  type ExamProgress,
} from "@/lib/examResume";

import {
  finalizeSection,
  finishExam,
  resumeBreak,
  startBreak,
  startExam,
  submitAnswer,
  type AnswerFeedback,
  type ExamMode,
  type ExamSession,
  type FinishSummary,
} from "@/services/examService";
import type { AnswerValue, DomainCode, Question } from "@/types/exam";
import { cn } from "@/lib/utils";

/** Intervalo de auto-guardado del progreso de la simulación. */
const AUTOSAVE_INTERVAL_MS = 10_000;


interface ExamSearch {
  modo?: ExamMode;
  dominio?: DomainCode;
  unidad?: string;
  preguntas?: number;
  /** "1" para reanudar la simulación guardada en curso. */
  reanudar?: string;
}

export const Route = createFileRoute("/examen")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): ExamSearch => ({
    modo: typeof search.modo === "string" ? (search.modo as ExamMode) : undefined,
    dominio: typeof search.dominio === "string" ? (search.dominio as DomainCode) : undefined,
    unidad: typeof search.unidad === "string" ? search.unidad : undefined,
    preguntas: typeof search.preguntas === "number" ? search.preguntas : undefined,
    reanudar: typeof search.reanudar === "string" ? search.reanudar : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Simulación de examen · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Motor de examen PMP en secciones cronometradas con descansos, clusters de caso y preguntas situacionales reales.",
      },
      { property: "og:title", content: "Simulación de examen PMP ECO 2026" },
      {
        property: "og:description",
        content: "Secciones cronometradas, descansos y formato de examen real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ExamPage />
    </RequireAuth>
  ),
});

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

function difficultyLabel(d: Question["difficulty"]) {
  if (d <= 2) return "Fácil";
  if (d === 3) return "Media";
  return "Difícil";
}

function ExamPage() {
  const search = Route.useSearch();
  const mode: ExamMode = search.modo ?? "full_sim";
  const startedRef = useRef(false);

  const [session, setSession] = useState<ExamSession | null>(null);
  const [resume, setResume] = useState<ExamProgress | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (search.reanudar === "1") {
      const saved = loadExamProgress();
      if (saved) {
        setResume(saved);
        setSession(saved.session);
        return;
      }
    }

    clearExamProgress();
    startExam({
      mode,
      domains: search.dominio ? [search.dominio] : undefined,
      unitId: search.unidad,
      totalQuestions: search.preguntas,
    })
      .then(setSession)
      .catch((e: Error) => setLoadError(e.message));
  }, [mode, search.dominio, search.unidad, search.preguntas, search.reanudar]);


  if (loadError) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <h1 className="mt-3 text-base font-semibold">No hemos podido iniciar el examen</h1>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Preparando tu examen…
        </div>
      </div>
    );
  }

  if (!session.questions.length) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
          <Info className="mx-auto h-6 w-6 text-muted-foreground" />
          <h1 className="mt-3 text-base font-semibold">Sin preguntas disponibles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No hay ítems publicados para esta configuración todavía. Prueba con otro modo o dominio.
          </p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {import.meta.env.DEV && (
        <p className="bg-warning-soft px-4 py-1.5 text-center text-[11px] text-accent-foreground">
          Entorno de pruebas: el banco de preguntas está en construcción, la variedad de ítems aún
          es limitada.
        </p>
      )}
      <ExamRunner session={session} resume={resume} />
    </>
  );
}

function ExamRunner({ session, resume }: { session: ExamSession; resume?: ExamProgress | null }) {
  const formative = session.mode !== "full_sim";
  const questions = session.questions;
  const sections = session.sections;

  /**
   * Restauración exacta: volvemos a la pregunta en la que se salió y sincronizamos
   * la sección con esa pregunta para que el temporizador y el navegador coincidan.
   */
  const restored = useMemo(() => {
    const idx = Math.min(Math.max(resume?.index ?? 0, 0), questions.length - 1);
    const savedSection = Math.min(Math.max(resume?.sectionIdx ?? 0, 0), sections.length - 1);
    if (!resume) return { index: idx, sectionIdx: savedSection };
    const sectionNumber = questions[idx]?.sectionNumber ?? sections[savedSection].sectionNumber;
    const bySection = sections.findIndex((s) => s.sectionNumber === sectionNumber);
    return { index: idx, sectionIdx: bySection >= 0 ? bySection : savedSection };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialSection = restored.sectionIdx;

  const [index, setIndex] = useState(restored.index);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(resume?.answers ?? {});
  const [feedback, setFeedback] = useState<Record<string, AnswerFeedback>>(resume?.feedback ?? {});
  const [checking, setChecking] = useState(false);
  const [flagged, setFlagged] = useState<Record<string, boolean>>(resume?.flagged ?? {});
  const [paused, setPaused] = useState(false);
  const [summary, setSummary] = useState<FinishSummary | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const [sectionIdx, setSectionIdx] = useState(initialSection);
  const section = sections[sectionIdx];

  /**
   * Reloj ÚNICO del examen (240 min en la simulación completa) compartido por
   * los 3 bloques. Los descansos lo pausan en el backend; aquí lo resincronizamos
   * con el `remaining_seconds` autoritativo que devuelve `exam_section_control`.
   */
  const [seconds, setSeconds] = useState(
    resume?.secondsLeft && resume.secondsLeft > 0
      ? Math.min(resume.secondsLeft, session.timeLimitSeconds)
      : session.timeLimitSeconds,
  );
  const [clockEpoch, setClockEpoch] = useState(0);
  const syncClock = useCallback((remaining: number) => {
    setSeconds(Math.max(0, Math.round(remaining)));
    setClockEpoch((e) => e + 1);
  }, []);

  /** Secciones finalizadas: bloqueadas de forma permanente. */
  const [closedSections, setClosedSections] = useState<number[]>(resume?.closedSections ?? []);
  /** Pantallas del flujo: examen, revisión de bloque, oferta de descanso y descanso. */
  const [phase, setPhase] = useState<"exam" | "review" | "break_offer" | "break">("exam");
  const [pendingNextSection, setPendingNextSection] = useState<number | null>(null);
  const [breaksUsed, setBreaksUsed] = useState(resume?.breaksUsed ?? session.breaksUsed ?? 0);
  const [closingSection, setClosingSection] = useState(false);
  const [confirmCloseSectionOpen, setConfirmCloseSectionOpen] = useState(false);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [breakSeconds, setBreakSeconds] = useState(BREAK_SECONDS);
  const questionStart = useRef(Date.now());
  /** Marca de tiempo de fin del examen (ms). Evita desfases si la pestaña se suspende. */
  const deadline = useRef<number>(Date.now() + seconds * 1000);

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
  const qFeedback = feedback[q.id];

  useEffect(() => {
    questionStart.current = Date.now();
  }, [index]);

  useEffect(() => {
    if (summary || phase === "break") return;
    if (paused) return;
    deadline.current = Date.now() + seconds * 1000;
    const tick = () => {
      setSeconds(Math.max(0, Math.round((deadline.current - Date.now()) / 1000)));
    };
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, summary, phase, clockEpoch]);

  // Cuenta atrás informativa del descanso (no afecta al reloj principal).
  useEffect(() => {
    if (phase !== "break") return;
    const end = Date.now() + breakSeconds * 1000;
    const t = setInterval(
      () => setBreakSeconds(Math.max(0, Math.round((end - Date.now()) / 1000))),
      500,
    );
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const send = useCallback(
    async (question: Question, value: AnswerValue) => {
      const spent = Math.round((Date.now() - questionStart.current) / 1000);
      const res = await submitAnswer(session.examId, question.id, value, spent);
      if (res.timeExpired) {
        setSeconds(0);
        return res;
      }
      if (res.isCorrect !== undefined) {
        setFeedback((prev) => ({ ...prev, [question.id]: res }));
      }
      return res;
    },
    [session.examId],
  );

  const toggleOption = (id: string) => {
    if (qFeedback) return;
    setAnswers((prev) => {
      const current = (prev[q.id] as string[]) ?? [];
      if (q.format === "mc_multi") {
        const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
        return { ...prev, [q.id]: next };
      }
      return { ...prev, [q.id]: [id] };
    });
  };

  const check = async () => {
    if (!answer) return;
    setChecking(true);
    await send(q, answer);
    setChecking(false);
  };

  const saveSilently = async () => {
    if (!answer || feedback[q.id]) return;
    await send(q, answer);
  };

  async function finalize() {
    setFinishing(true);
    if (!formative) await saveSilently();
    try {
      const result = await finishExam(session.examId);
      setSummary(result);
    } catch (e) {
      setSummary({
        examId: session.examId,
        scorePct: 0,
        scoreByDomain: {},
        scoreByApproach: {},
        newItemsCount: 0,
        repeatedItemsCount: 0,
        disclaimer: e instanceof Error ? e.message : "",
        interpretationNote: null,
        diploma: null,
        capstoneDiploma: null,

      });
    } finally {
      setFinishing(false);
    }
  }

  const goToSection = useCallback(
    (sectionNumber: number) => {
      const idx = sections.findIndex((sec) => sec.sectionNumber === sectionNumber);
      const targetIdx = idx >= 0 ? idx : Math.min(sectionIdx + 1, sections.length - 1);
      setSectionIdx(targetIdx);
      const first = questions.findIndex(
        (item) => (item.sectionNumber ?? 1) === sections[targetIdx].sectionNumber,
      );
      setIndex(first === -1 ? 0 : first);
      setOnlyFlagged(false);
      setPhase("exam");
    },
    [questions, sectionIdx, sections],
  );

  /** Cierra el bloque actual contra el backend (R6). */
  async function confirmCloseSection() {
    setConfirmCloseSectionOpen(false);
    setClosingSection(true);
    setSectionError(null);
    await saveSilently();
    try {
      const res = await finalizeSection(session.examId, section.sectionNumber);
      setClosedSections((prev) =>
        prev.includes(section.sectionNumber) ? prev : [...prev, section.sectionNumber],
      );
      syncClock(res.remainingSeconds);
      if (res.examComplete || res.nextSection === null) {
        await finalize();
        return;
      }
      setPendingNextSection(res.nextSection);
      setPhase("break_offer");
    } catch (e) {
      setSectionError(e instanceof Error ? e.message : "No hemos podido cerrar la sección.");
    } finally {
      setClosingSection(false);
    }
  }

  async function beginBreak() {
    setSectionError(null);
    try {
      const res = await startBreak(session.examId);
      syncClock(res.remainingSeconds);
      setBreakSeconds(res.breakAllowanceSeconds ?? BREAK_SECONDS);
      setBreaksUsed((n) => n + 1);
      setPhase("break");
    } catch (e) {
      setSectionError(e instanceof Error ? e.message : "No hemos podido iniciar el descanso.");
    }
  }

  const [resuming, setResuming] = useState(false);
  async function endBreak() {
    setResuming(true);
    setSectionError(null);
    try {
      const res = await resumeBreak(session.examId);
      syncClock(res.remainingSeconds);
    } catch (e) {
      setSectionError(e instanceof Error ? e.message : "No hemos podido reanudar el examen.");
    } finally {
      setResuming(false);
    }
    if (pendingNextSection !== null) goToSection(pendingNextSection);
    else setPhase("exam");
  }

  // Descanso agotado: se reanuda automáticamente.
  useEffect(() => {
    if (phase === "break" && breakSeconds === 0 && !resuming) void endBreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, breakSeconds]);

  // R6 — Corte automático a los 00:00 del reloj global.
  const timeUp = useRef(false);
  useEffect(() => {
    if (summary || finishing || phase === "break") return;
    if (seconds > 0) {
      timeUp.current = false;
      return;
    }
    if (timeUp.current) return;
    timeUp.current = true;
    void finalize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, summary, finishing, phase]);

  // Auto-guardado local del progreso (respuestas, marcadas y tiempo restante).
  const snapshot = useRef({
    session,
    index,
    answers,
    feedback,
    flagged,
    sectionIdx,
    seconds,
    closedSections,
    breaksUsed,
  });
  snapshot.current = {
    session,
    index,
    answers,
    feedback,
    flagged,
    sectionIdx,
    seconds,
    closedSections,
    breaksUsed,
  };

  const persist = useCallback(() => {
    const s = snapshot.current;
    saveExamProgress({
      mode: s.session.mode,
      session: s.session,
      index: s.index,
      answers: s.answers,
      feedback: s.feedback,
      flagged: s.flagged,
      sectionIdx: s.sectionIdx,
      secondsLeft: s.seconds,
      closedSections: s.closedSections,
      breaksUsed: s.breaksUsed,
    });
  }, []);

  // Intervalo de auto-guardado cada 10 s mientras la simulación está activa.
  useEffect(() => {
    if (summary) {
      clearExamProgress();
      return;
    }
    persist();
    const t = setInterval(persist, AUTOSAVE_INTERVAL_MS);
    const onHide = () => {
      if (document.visibilityState === "hidden") persist();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", persist);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", persist);
      if (!summary) persist();
    };
  }, [summary, persist]);

  // Guardado inmediato ante cambios relevantes (sin esperar al intervalo).
  useEffect(() => {
    if (summary) return;
    persist();
  }, [answers, feedback, flagged, index, sectionIdx, phase, summary, persist]);


  const answeredCount = Object.keys(answers).length;


  if (summary) {
    return (
      <Results
        examId={session.examId}
        questions={questions.map((question) => {

          const f = feedback[question.id];
          if (!f) return question;
          return {
            ...question,
            correctAnswer: f.correctAnswer ?? [],
            errorType: f.errorType,
            explanation: {
              correct: f.explanation ?? "",
              distractors: [],
              reference: f.errorType
                ? `Tipo de error: ${ERROR_TYPE_SHORT[f.errorType]} · ${ERROR_TYPE_LABELS[f.errorType]}`
                : "Explicación del banco ECO 2026",
            },
          };
        })}
        answers={answers}
        summary={summary}
        reviewAvailable={Object.keys(feedback).length > 0}
      />
    );
  }

  if (finishing) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Calculando tu resultado…
        </div>
      </div>
    );
  }

  // R7 — Oferta de descanso tras cerrar el bloque 1 o 2.
  if (phase === "break_offer") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center">
          <CircleCheck className="mx-auto h-7 w-7 text-success" />
          <h1 className="mt-3 font-display text-xl font-bold">
            Sección {section.sectionNumber} finalizada
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ya no puedes volver a esta sección. Puedes tomar un descanso opcional de 10 minutos
            antes de continuar con la sección {pendingNextSection}: el reloj del examen se detiene
            mientras descansas.
          </p>
          <p className="num mt-3 text-xs text-muted-foreground">
            Tiempo restante del examen: {fmt(seconds)} · Descansos usados: {breaksUsed} de 2
          </p>
          {sectionError && (
            <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {sectionError}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {breaksUsed < 2 && (
              <button
                onClick={() => void beginBreak()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
              >
                <Coffee className="h-4 w-4" /> Tomar descanso (10 min)
              </button>
            )}
            <button
              onClick={() => pendingNextSection !== null && goToSection(pendingNextSection)}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Continuar sin descanso
            </button>
          </div>
        </div>
      </div>
    );
  }

  // R7 — Pantalla de descanso con reloj propio (informativo).
  if (phase === "break") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center">
          <Coffee className="mx-auto h-7 w-7 text-accent" />
          <h1 className="mt-3 font-display text-xl font-bold">Descanso en curso</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            El reloj del examen está detenido. Puedes reanudar cuando quieras, sin esperar a que
            termine el descanso.
          </p>
          <p className="num mt-4 font-display text-4xl font-bold">{fmtShort(breakSeconds)}</p>
          <p className="num mt-2 text-xs text-muted-foreground">
            Tiempo restante del examen: {fmt(seconds)}
          </p>
          {sectionError && (
            <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {sectionError}
            </p>
          )}
          <button
            onClick={() => void endBreak()}
            disabled={resuming}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {resuming && <Loader2 className="h-4 w-4 animate-spin" />} Reanudar examen
          </button>
        </div>
      </div>
    );
  }

  // R6 — Pantalla de revisión obligatoria al final de cada bloque.
  if (phase === "review") {
    const pending = sectionQuestions.filter((item) => !answers[item.id]).length;
    const marked = sectionQuestions.filter((item) => flagged[item.id]).length;
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h1 className="font-display text-xl font-bold">
              Revisión de la sección {section.sectionNumber}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa tus respuestas antes de cerrar la sección. Pulsa cualquier pregunta para
              volver a ella y modificar tu respuesta.
            </p>
            <div className="num mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{sectionQuestions.length - pending} respondidas</span>
              <span>{pending} sin responder</span>
              <span>{marked} marcadas</span>
              <span>Tiempo restante: {fmt(seconds)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <ul className="divide-y divide-border">
              {sectionQuestions.map((item) => {
                const globalIdx = questions.findIndex((x) => x.id === item.id);
                const answered = Boolean(answers[item.id]);
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setIndex(globalIdx);
                        setPhase("exam");
                      }}
                      className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-secondary/60"
                    >
                      <span className="num w-10 shrink-0 text-xs font-semibold text-muted-foreground">
                        {globalIdx + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">{item.stem}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                            answered
                              ? "bg-primary text-primary-foreground"
                              : "border border-border text-muted-foreground",
                          )}
                        >
                          {answered ? "Respondida" : "Sin responder"}
                        </span>
                        {flagged[item.id] && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                            <Flag className="h-3 w-3" /> Marcada
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {sectionError && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {sectionError}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={() => setPhase("exam")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Seguir revisando
            </button>
            <button
              onClick={() => setConfirmCloseSectionOpen(true)}
              disabled={closingSection}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {closingSection && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLastSection ? "Finalizar examen" : "Finalizar sección"}
            </button>
          </div>
        </div>

        {confirmCloseSectionOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
              <AlertTriangle className="h-6 w-6 text-accent" />
              <h2 className="mt-3 text-lg font-semibold">¿Seguro que quieres finalizar?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                No podrás volver a esta sección ni modificar sus respuestas.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setConfirmCloseSectionOpen(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void confirmCloseSection()}
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
  }

  const cluster = q.clusterId ? session.clusters[q.clusterId] : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="num truncate text-sm font-semibold">
              {sections.length > 1 && `Sección ${section.sectionNumber} de ${sections.length} · `}
              Pregunta {index + 1} de {questions.length}
            </p>
            <div className="mt-1.5 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{
                  width: `${((index - firstIndexOfSection + 1) / Math.max(1, sectionQuestions.length)) * 100}%`,
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
          {index === 0 && !Object.keys(answers).length && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                ¿Primera vez? Repasa cómo funciona el simulacro antes de responder.
              </p>
              <HelpLinks />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">

            <span className="rounded-md bg-secondary px-2 py-1 font-semibold text-secondary-foreground">
              {q.taskCode}
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
              {q.approach === "agile" ? "Ágil" : q.approach === "hybrid" ? "Híbrido" : "Predictivo"}
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
              {difficultyLabel(q.difficulty)}
            </span>
            {q.processGroup && PROCESS_GROUP_LABELS[q.processGroup] && (
              <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
                {PROCESS_GROUP_LABELS[q.processGroup]}
              </span>
            )}
            {q.performanceDomain && PERFORMANCE_DOMAIN_LABELS[q.performanceDomain] && (
              <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
                {PERFORMANCE_DOMAIN_LABELS[q.performanceDomain]}
              </span>
            )}
            {(q.focusTags ?? []).map((tag) => (
              <span key={tag} className="rounded-md border border-primary/40 px-2 py-1 text-primary">
                {FOCUS_TAG_LABELS[tag] ?? tag}
              </span>
            ))}

            <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
              {q.format === "mc_multi"
                ? "Respuesta múltiple"
                : q.format === "enhanced_matching"
                  ? "Emparejamiento mejorado"
                : q.format === "matching"
                  ? "Emparejamiento (practicum)"
                  : q.format === "hotspot"
                    ? "Diagrama interactivo"
                  : q.format === "pulldown"
                    ? "Desplegable"
                  : q.format === "graphic_based"
                    ? "Basada en gráfico"
                  : q.itemType === "case_child"
                    ? "Caso de estudio"
                    : "Situacional"}
            </span>
          </div>

          {cluster ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <aside className="space-y-3 rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-24 lg:self-start">
                <h2 className="text-sm font-semibold">{cluster.title}</h2>
                {cluster.scenarioText.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
                <EarnedValueChart chart={cluster.evChart} />
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
            clusters={session.clusters}
            current={index}
            answers={answers}
            flagged={flagged}
            onSelect={setIndex}
            activeSection={sections.length > 1 ? section.sectionNumber : undefined}
          />
          <p className="num mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            {answeredCount} de {questions.length} respondidas
          </p>
        </aside>
      </div>

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setNavOpen(false)}
            aria-label="Cerrar"
          />
          <div className="absolute bottom-0 w-full rounded-t-2xl border-t border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Preguntas</p>
              <button onClick={() => setNavOpen(false)} aria-label="Cerrar">
                <X className="h-4 w-4" />
              </button>
            </div>
            <QuestionNavigator
              questions={questions}
              clusters={session.clusters}
              current={index}
              answers={answers}
              flagged={flagged}
              activeSection={sections.length > 1 ? section.sectionNumber : undefined}
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
                  void finalize();
                }}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatbotWidget />
    </div>

  );

  function QuestionBody() {
    const isLastOfSection = index === lastIndexOfSection;
    return (
      <>
        <QuestionGraphic question={q} />
        <p className="text-[15px] font-medium leading-relaxed">{q.stem}</p>

        <QuestionInput
          question={q}
          answer={answer}
          disabled={Boolean(qFeedback)}
          correctAnswer={qFeedback?.correctAnswer}
          onChange={(next) => setAnswers((prev) => ({ ...prev, [q.id]: next }))}
        />


        {formative ? (
          qFeedback ? (
            <ExplanationPanel
              question={{
                ...q,
                correctAnswer: qFeedback.correctAnswer ?? [],
                explanation: {
                  correct: qFeedback.explanation ?? "",
                  distractors: [],
                  reference: qFeedback.errorType
                    ? `Tipo de error: ${ERROR_TYPE_SHORT[qFeedback.errorType]} · ${ERROR_TYPE_LABELS[qFeedback.errorType]}`
                    : "Explicación del banco ECO 2026",
                },
              }}
              answer={answer}
            />
          ) : (
            <button
              onClick={check}
              disabled={!answer || checking}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
            >
              {checking && <Loader2 className="h-4 w-4 animate-spin" />} Comprobar respuesta
            </button>
          )
        ) : (
          <p className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            En la simulación completa no se muestra si aciertas o fallas: verás la corrección al
            terminar el examen, igual que en el examen oficial.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <FlagButton
              flagged={Boolean(flagged[q.id])}
              onToggle={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
            />
            <ReportIssueButton questionId={q.id} examId={session.examId} />
          </div>

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
                onClick={() => void closeSection()}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
              >
                {sectionIdx === sections.length - 1
                  ? "Finalizar examen"
                  : `Cerrar sección ${section.sectionNumber}`}
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  void saveSilently();
                  setIndex((i) => i + 1);
                }}
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
  examId,
  questions,
  answers,
  summary,
  reviewAvailable,
}: {
  examId: string;
  questions: Question[];
  answers: Record<string, AnswerValue>;
  summary: FinishSummary;
  reviewAvailable: boolean;
}) {

  const totalItems = summary.newItemsCount + summary.repeatedItemsCount;
  const correct = Math.round((summary.scorePct / 100) * questions.length);
  const reviewable = questions.filter((q) => q.correctAnswer.length);

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <CircleCheck className="mx-auto h-7 w-7 text-success" />
          <h1 className="mt-3 font-display text-2xl font-bold">Examen finalizado</h1>
          <p className="num mt-2 font-display text-5xl font-bold">{summary.scorePct}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {correct} de {questions.length} respuestas correctas
          </p>
          {totalItems > 0 && (
            <p className="num mt-2 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {summary.newItemsCount} de {totalItems} preguntas eran nuevas para ti
            </p>
          )}

          {summary.disclaimer && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-left text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {summary.disclaimer}
            </p>
          )}

          {summary.interpretationNote && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-accent bg-warning-soft p-3 text-left text-xs leading-relaxed text-accent-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {summary.interpretationNote}
            </p>
          )}

          {summary.capstoneDiploma && (
            <div className="mt-4 rounded-2xl border-2 border-accent bg-gradient-to-br from-accent/20 to-warning-soft p-5 text-left shadow-panel">
              <p className="font-display text-lg font-bold text-accent-foreground">
                🏆 ¡Programa completo!
              </p>
              <p className="mt-1 text-sm leading-relaxed text-accent-foreground">
                Has aprobado todas las lecciones del temario y completado un simulacro completo con
                buen desempeño.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Emitido el{" "}
                {new Date(summary.capstoneDiploma.issuedAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mt-3 rounded-lg border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                {summary.capstoneDiploma.disclaimer ||
                  "PMI no publica una nota de corte oficial para el examen PMP. Este diploma reconoce tu progreso según un criterio de referencia propio de PMTech Simulator, no una nota de aprobado oficial de PMI."}
              </p>
              <Link
                to="/perfil"
                className="mt-3 inline-flex text-xs font-semibold underline-offset-4 hover:underline"
              >
                Ver mis diplomas
              </Link>
            </div>
          )}

          {summary.diploma && (
            <div className="mt-4 rounded-xl border border-accent bg-accent/10 p-4 text-left">
              <p className="font-display text-base font-semibold">🎓 ¡Diploma desbloqueado!</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Emitido el{" "}
                {new Date(summary.diploma.issuedAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · umbral de referencia {Math.round(summary.diploma.thresholdPct)}%
              </p>
              <p className="mt-3 rounded-lg border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                {summary.diploma.disclaimer ||
                  "PMI no publica una nota de corte oficial para el examen PMP. Este diploma reconoce tu desempeño según un criterio de referencia propio de PMTech Simulator, no una nota de aprobado oficial de PMI."}
              </p>
              <Link
                to="/perfil"
                className="mt-3 inline-flex text-xs font-semibold underline-offset-4 hover:underline"
              >
                Ver mis diplomas
              </Link>
            </div>
          )}



          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              to="/dashboard"
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
                subtitle: `Puntuación ${summary.scorePct}% · ${correct} de ${questions.length} correctas`,
                scorePct: summary.scorePct,
                correct,
                total: questions.length,
                extraRows: [
                  { label: "Preguntas nuevas", value: `${summary.newItemsCount} de ${totalItems}` },
                  { label: "Preguntas repetidas", value: String(summary.repeatedItemsCount) },
                  ...(summary.interpretationNote
                    ? [{ label: "Nota de interpretación", value: summary.interpretationNote }]
                    : []),
                ],
                items: reviewable.map((q) => ({ question: q, answer: answers[q.id] })),
              }}
            />
          </div>
        </div>

        {reviewAvailable ? (
          <>
            <DistractorAnalytics
              items={reviewable.map((q) => ({ question: q, answer: answers[q.id] }))}
            />

            <h2 className="text-base font-semibold">Revisión detallada</h2>
            {reviewable.map((q, i) => (
              <div key={q.id} className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-relaxed">
                    <span className="num mr-2 text-muted-foreground">{i + 1}.</span>
                    {q.stem}
                  </p>
                  <ReportIssueButton questionId={q.id} examId={examId} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground" />
                </div>
                <QuestionGraphic question={q} />

                <QuestionInput
                  question={q}
                  answer={answers[q.id]}
                  reveal
                  disabled
                  correctAnswer={q.correctAnswer}
                  onChange={() => {}}
                />
                <ExplanationPanel question={q} answer={answers[q.id]} />
              </div>
            ))}
          </>
        ) : (
          <div className="flex items-start gap-2 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              En la simulación completa la corrección pregunta a pregunta no se muestra en pantalla.
              Consulta tu desglose por dominio en{" "}
              <Link
                to="/progreso"
                className="font-semibold text-primary underline underline-offset-2 hover:opacity-80"
              >
                Mi progreso
              </Link>{" "}
              y repasa tus fallos en los modos de práctica formativa.
            </p>
          </div>

        )}
      </div>
      <ChatbotWidget />
    </div>

  );
}
