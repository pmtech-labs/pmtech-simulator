import type { AnswerFeedback, ExamMode, ExamSession } from "@/services/examService";
import type { AnswerValue } from "@/types/exam";

/**
 * Persistencia local del progreso de una simulación en curso, para poder
 * reanudarla si el candidato sale de la pantalla del examen sin terminarla.
 */

const STORAGE_KEY = "pmtech:exam-in-progress";
/** Caducidad del progreso guardado (12 h). */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export interface ExamProgress {
  savedAt: number;
  mode: ExamMode;
  session: ExamSession;
  index: number;
  answers: Record<string, AnswerValue>;
  feedback: Record<string, AnswerFeedback>;
  flagged: Record<string, boolean>;
  sectionIdx: number;
  secondsLeft: number;
}

export function saveExamProgress(progress: Omit<ExamProgress, "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...progress, savedAt: Date.now() } satisfies ExamProgress),
    );
  } catch {
    /* almacenamiento no disponible: el examen sigue funcionando sin reanudación */
  }
}

export function loadExamProgress(): ExamProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExamProgress;
    if (
      !parsed?.session?.examId ||
      !Array.isArray(parsed.session.questions) ||
      !parsed.session.questions.length
    ) {
      return null;
    }
    if (Date.now() - (parsed.savedAt ?? 0) > MAX_AGE_MS) {
      clearExamProgress();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearExamProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

const MODE_LABELS: Record<ExamMode, string> = {
  full_sim: "Simulación completa",
  domain_drill: "Práctica por dominios",
  case_only: "Práctica de casos",
  custom: "Práctica personalizada",
  unit_quiz: "Práctica de lección",
  cumulative: "Simulacro acumulativo",
};

export function describeProgress(progress: ExamProgress) {
  const answered = Object.keys(progress.answers).length;
  return {
    label: MODE_LABELS[progress.mode] ?? "Simulación",
    answered,
    total: progress.session.questions.length,
  };
}
