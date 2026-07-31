import { supabase } from "@/integrations/supabase/client";
import { toUiDomain } from "@/services/userService";
import type {
  AnswerValue,
  CaseCluster,
  DomainCode,
  ErrorType,
  ExamSection,
  Question,
} from "@/types/exam";

/**
 * Capa de servicios del examen: llama a las Edge Functions reales
 * `start_exam`, `submit_answer` y `finish_exam` (RLS + auth de Supabase).
 */

export type ExamMode =
  | "full_sim"
  | "domain_drill"
  | "case_only"
  | "custom"
  | "unit_quiz"
  | "cumulative";

export interface StartExamParams {
  mode: ExamMode;
  domains?: DomainCode[];
  totalQuestions?: number;
  /** Obligatorio en `unit_quiz` (esa lección) y en `cumulative` (hasta esa lección). */
  unitId?: string;
  taskIds?: string[];
}

export interface ExamSession {
  examId: string;
  mode: ExamMode;
  questions: Question[];
  clusters: Record<string, CaseCluster>;
  timeLimitSeconds: number;
  sections: ExamSection[];
}

export interface AnswerFeedback {
  saved: boolean;
  isCorrect?: boolean;
  correctAnswer?: string[];
  explanation?: string;
  errorType?: ErrorType;
}

export interface FinishSummary {
  examId: string;
  scorePct: number;
  scoreByDomain: Partial<Record<DomainCode, number>>;
  scoreByApproach: Record<string, number>;
  newItemsCount: number;
  repeatedItemsCount: number;
  disclaimer: string;
  interpretationNote: string | null;
}

interface RawOption {
  id: string;
  text: string;
  error_type?: ErrorType;
}

interface RawItem {
  id: string;
  item_type: "standalone" | "case_child" | "practicum";
  format: string;
  cluster_id: string | null;
  stem: string;
  options: RawOption[] | null;
  practicum_payload: unknown;
  case_clusters: { id: string; title: string; scenario_text: string } | null;
  section_number: number | null;
  previously_seen?: boolean;
}

const DB_DOMAIN_CODE: Record<DomainCode, string> = {
  people: "people",
  process: "process",
  business: "business_environment",
};

async function taskIdsForDomains(domains: DomainCode[]): Promise<string[]> {
  const codes = domains.map((d) => DB_DOMAIN_CODE[d]);
  const { data } = await supabase
    .from("eco_tasks")
    .select("id, eco_domains!inner(code)")
    .in("eco_domains.code", codes);
  return (data ?? []).map((r) => r.id);
}

/** Metadatos públicos (tarea, dominio, enfoque) de las preguntas devueltas. */
async function fetchQuestionMeta(ids: string[]) {
  const meta = new Map<
    string,
    { taskCode: string; taskTitle: string; domain: DomainCode; approach: Question["approach"]; difficulty: 1 | 2 | 3 }
  >();
  if (!ids.length) return meta;

  const { data } = await supabase
    .from("questions")
    .select("id, approach, difficulty, eco_tasks(task_number, title, eco_domains(code))")
    .in("id", ids);

  (data ?? []).forEach((row) => {
    const task = row.eco_tasks as
      | { task_number: number; title: string; eco_domains: { code: string } | null }
      | null;
    const domain = toUiDomain(task?.eco_domains?.code);
    meta.set(row.id, {
      taskCode: `${domain === "people" ? "P" : domain === "process" ? "PR" : "BE"}-${task?.task_number ?? "?"}`,
      taskTitle: task?.title ?? "Tarea ECO",
      domain,
      approach: (row.approach as Question["approach"]) ?? "predictive",
      difficulty: (Math.min(3, Math.max(1, row.difficulty ?? 3)) as 1 | 2 | 3),
    });
  });

  return meta;
}

export async function startExam(params: StartExamParams): Promise<ExamSession> {
  const taskIds =
    params.taskIds ??
    (params.domains?.length ? await taskIdsForDomains(params.domains) : undefined);

  const { data, error } = await supabase.functions.invoke("start_exam", {
    body: {
      mode: params.mode,
      task_ids: taskIds,
      question_count: params.totalQuestions,
      unit_id: params.unitId,
    },
  });
  if (error) throw new Error("No hemos podido iniciar el examen. Inténtalo de nuevo.");

  const items = (data.items ?? []) as RawItem[];
  const meta = await fetchQuestionMeta(items.map((i) => i.id));
  const clusters: Record<string, CaseCluster> = {};

  const questions: Question[] = items.map((item) => {
    if (item.case_clusters) {
      clusters[item.case_clusters.id] = {
        id: item.case_clusters.id,
        title: item.case_clusters.title,
        scenarioText: item.case_clusters.scenario_text.split(/\n{1,}/).filter(Boolean),
      };
    }
    const m = meta.get(item.id);
    const payload = item.practicum_payload as Question["matching"] | null;
    return {
      id: item.id,
      itemType: item.item_type,
      format: (item.format === "mc_multi"
        ? "mc_multi"
        : item.format === "matching"
          ? "matching"
          : "mc_single") as Question["format"],
      clusterId: item.cluster_id ?? undefined,
      stem: item.stem,
      options: (item.options ?? []).map((o) => ({ id: o.id, label: o.text })),
      matching: item.format === "matching" && payload ? payload : undefined,
      // El backend no revela la clave hasta corregir: se rellena con el feedback.
      correctAnswer: [],
      taskCode: m?.taskCode ?? "ECO",
      taskTitle: m?.taskTitle ?? "Tarea ECO",
      domain: m?.domain ?? "process",
      approach: m?.approach ?? "predictive",
      difficulty: m?.difficulty ?? 3,
      sectionNumber: item.section_number ?? 1,
      explanation: { correct: "", distractors: [], reference: "Explicación disponible al corregir." },
    };
  });

  const rawSections = (data.sections ?? null) as
    | { section_number: number; total_questions: number; time_limit_seconds: number }[]
    | null;

  const sections: ExamSection[] = rawSections?.length
    ? rawSections.map((s) => ({
        sectionNumber: s.section_number,
        count: s.total_questions,
        seconds: s.time_limit_seconds,
      }))
    : [
        {
          sectionNumber: 1,
          count: questions.length,
          seconds: data.time_limit_seconds ?? Math.max(300, questions.length * 90),
        },
      ];

  return {
    examId: data.exam_id,
    mode: params.mode,
    questions,
    clusters,
    timeLimitSeconds: data.time_limit_seconds ?? sections.reduce((a, s) => a + s.seconds, 0),
    sections,
  };
}

export async function submitAnswer(
  examId: string,
  questionId: string,
  answer: AnswerValue,
  timeSpentSeconds = 0,
): Promise<AnswerFeedback> {
  const { data, error } = await supabase.functions.invoke("submit_answer", {
    body: {
      exam_id: examId,
      question_id: questionId,
      user_answer: answer,
      time_spent_seconds: timeSpentSeconds,
    },
  });
  if (error) return { saved: false };

  if (data?.is_correct === undefined) return { saved: true };
  return {
    saved: true,
    isCorrect: Boolean(data.is_correct),
    correctAnswer: (data.correct_answer ?? []) as string[],
    explanation: data.explanation as string,
    errorType: data.error_type as ErrorType | undefined,
  };
}

export async function finishExam(examId: string): Promise<FinishSummary> {
  const { data, error } = await supabase.functions.invoke("finish_exam", {
    body: { exam_id: examId },
  });
  if (error) throw new Error("No hemos podido cerrar el examen. Inténtalo de nuevo.");

  const scoreByDomain: Partial<Record<DomainCode, number>> = {};
  Object.entries((data.score_by_domain ?? {}) as Record<string, number>).forEach(([code, v]) => {
    scoreByDomain[toUiDomain(code)] = Math.round(Number(v) || 0);
  });

  return {
    examId: data.exam_id,
    scorePct: Math.round(Number(data.score_pct) || 0),
    scoreByDomain,
    scoreByApproach: (data.score_by_approach ?? {}) as Record<string, number>,
    newItemsCount: data.new_items_count ?? 0,
    repeatedItemsCount: data.repeated_items_count ?? 0,
    disclaimer: data.disclaimer ?? "",
    interpretationNote: data.interpretation_note ?? null,
  };
}

/** Corrección local para la revisión (usa la clave devuelta por submit_answer). */
export function isAnswerCorrect(question: Question, answer: AnswerValue | undefined): boolean {
  if (!answer) return false;
  if (question.format === "matching") {
    if (!question.matching) return false;
    const pairs = answer as Record<string, string>;
    return question.matching.correctPairs.every(([l, r]) => pairs[l] === r);
  }
  if (!question.correctAnswer.length) return false;
  const selected = [...(answer as string[])].sort();
  const correct = [...question.correctAnswer].sort();
  return selected.length === correct.length && selected.every((v, i) => v === correct[i]);
}

export { getExamHistory, getCurrentUser } from "@/services/userService";
