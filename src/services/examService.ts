import { CLUSTER, MOCK_EXAM_HISTORY, MOCK_QUESTIONS, MOCK_USER } from "@/data/mockData";
import type { AnswerValue, CaseCluster, Question } from "@/types/exam";

/**
 * Capa de servicios: único punto de integración con el backend.
 * Hoy devuelve datos simulados; en producción cada función llamará a
 * Supabase (tablas con RLS) o a las Edge Functions `start_exam` / `submit_answer`.
 */

export interface StartExamParams {
  mode: "full_sim" | "domain_drill" | "case_only" | "custom";
  domains?: string[];
  totalQuestions?: number;
}

export interface ExamSession {
  examId: string;
  mode: StartExamParams["mode"];
  questions: Question[];
  clusters: Record<string, CaseCluster>;
  timeLimitSeconds: number;
}

export async function startExam(params: StartExamParams): Promise<ExamSession> {
  // TODO: backend — invocar Edge Function `start_exam` (genera exams + exam_items)
  return {
    examId: `mock-${Date.now()}`,
    mode: params.mode,
    questions: MOCK_QUESTIONS,
    clusters: { [CLUSTER.id]: CLUSTER },
    timeLimitSeconds: params.mode === "full_sim" ? 240 * 60 : 12 * 60,
  };
}

export function isAnswerCorrect(question: Question, answer: AnswerValue | undefined): boolean {
  if (!answer) return false;
  if (question.format === "matching") {
    const pairs = answer as Record<string, string>;
    return question.matching!.correctPairs.every(([l, r]) => pairs[l] === r);
  }
  const selected = [...(answer as string[])].sort();
  const correct = [...question.correctAnswer].sort();
  return selected.length === correct.length && selected.every((v, i) => v === correct[i]);
}

export async function submitAnswer(examId: string, questionId: string, answer: AnswerValue) {
  // TODO: backend — invocar Edge Function `submit_answer` (corrige y actualiza user_task_mastery)
  const question = MOCK_QUESTIONS.find((q) => q.id === questionId)!;
  return { examId, questionId, isCorrect: isAnswerCorrect(question, answer) };
}

export async function getExamHistory() {
  // TODO: backend — select sobre `exams` filtrado por RLS del usuario
  return MOCK_EXAM_HISTORY;
}

export async function getCurrentUser() {
  // TODO: backend — Supabase Auth + tablas `licenses` / `user_task_mastery`
  return MOCK_USER;
}
