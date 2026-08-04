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

/** Filtro de enfoque (solo modos de práctica; `full_sim` mantiene su reparto real). */
export type ApproachFilter = "predictive" | "agile" | "hybrid" | "agile_hybrid";

export interface StartExamParams {
  mode: ExamMode;
  domains?: DomainCode[];
  totalQuestions?: number;
  /** Obligatorio en `unit_quiz` (esa lección) y en `cumulative` (hasta esa lección). */
  unitId?: string;
  taskIds?: string[];
  approachFilter?: ApproachFilter;
  /** Filtro por grupo de proceso (solo modos de práctica). */
  processGroupFilter?: string;
  /** Filtro por dominio de desempeño (solo modos de práctica). */
  performanceDomainFilter?: string;
}


export interface ExamSession {
  examId: string;
  mode: ExamMode;
  questions: Question[];
  clusters: Record<string, CaseCluster>;
  /** Reloj global del examen (240 min en full_sim). Único tiempo real. */
  timeLimitSeconds: number;
  /** Descansos ya consumidos (máximo 2 por examen). */
  breaksUsed: number;
  sections: ExamSection[];
}

export interface AnswerFeedback {
  saved: boolean;
  isCorrect?: boolean;
  correctAnswer?: string[];
  explanation?: string;
  errorType?: ErrorType;
  /** El reloj global llegó a 00:00: hay que finalizar el examen de inmediato. */
  timeExpired?: boolean;
}

/** Respuesta autoritativa de la Edge Function `exam_section_control`. */
export interface SectionControlResult {
  sectionClosed?: number;
  nextSection: number | null;
  examComplete: boolean;
  remainingSeconds: number;
  paused: boolean;
  breakAllowanceSeconds?: number;
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
  diploma: DiplomaInfo | null;
  capstoneDiploma: CapstoneDiplomaInfo | null;
}

export interface CapstoneDiplomaInfo {
  id: string;
  issuedAt: string;
  disclaimer: string;
}

export interface DiplomaInfo {
  id: string;
  issuedAt: string;
  thresholdPct: number;
  disclaimer: string;
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
  difficulty?: number | null;
  process_group?: string | null;
  performance_domain?: string | null;
  focus_tags?: string[] | null;
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
    { taskCode: string; taskTitle: string; domain: DomainCode; approach: Question["approach"]; difficulty: Question["difficulty"] }
  >();
  if (!ids.length) return meta;

  const { data } = await supabase
    .from("v_questions_public")
    .select("id, approach, difficulty, task_number, task_title, domain_code")
    .in("id", ids);

  (data ?? []).forEach((row) => {
    if (!row.id) return;
    const domain = toUiDomain(row.domain_code);
    meta.set(row.id, {
      taskCode: `${domain === "people" ? "P" : domain === "process" ? "PR" : "BE"}-${row.task_number ?? "?"}`,
      taskTitle: row.task_title ?? "Tarea ECO",
      domain,
      approach: (row.approach as Question["approach"]) ?? "predictive",
      difficulty: (Math.min(5, Math.max(1, row.difficulty ?? 3)) as Question["difficulty"]),
    });
  });

  return meta;
}

/** Traduce el error de la Edge Function a un mensaje claro para el candidato. */
async function readStartExamError(error: unknown): Promise<string> {
  const generic = "No hemos podido iniciar el examen. Inténtalo de nuevo.";
  const ctx = (error as { context?: Response })?.context;
  if (!ctx || typeof ctx.json !== "function") return generic;
  try {
    const body = (await ctx.clone().json()) as { error?: string };
    if (ctx.status === 404 || /no hay preguntas/i.test(body?.error ?? "")) {
      return (
        body?.error ??
        "No hay preguntas disponibles para estos filtros. Prueba con otro enfoque o añade más dominios."
      );
    }
    return body?.error ?? generic;
  } catch {
    return generic;
  }
}

export async function startExam(params: StartExamParams): Promise<ExamSession> {
  const taskIds =
    params.taskIds ??
    (params.domains?.length ? await taskIdsForDomains(params.domains) : undefined);

  const { data, error } = await supabase.functions.invoke("start_exam", {
    method: "POST",
    body: {
      mode: params.mode,
      task_ids: taskIds,
      question_count: params.totalQuestions,
      unit_id: params.unitId,
      ...(params.approachFilter && params.mode !== "full_sim"
        ? { approach_filter: params.approachFilter }
        : {}),
      ...(params.processGroupFilter && params.mode !== "full_sim"
        ? { process_group_filter: params.processGroupFilter }
        : {}),
      ...(params.performanceDomainFilter && params.mode !== "full_sim"
        ? { performance_domain_filter: params.performanceDomainFilter }
        : {}),

    },
  });
  if (error) throw new Error(await readStartExamError(error));

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
    const raw = item.practicum_payload as Record<string, unknown> | null;
    const difficulty = (Math.min(
      5,
      Math.max(1, item.difficulty ?? m?.difficulty ?? 3),
    ) as Question["difficulty"]);
    const format = ([
      "mc_multi",
      "matching",
      "enhanced_matching",
      "pulldown",
      "graphic_based",
      "hotspot",
    ].includes(item.format)
      ? item.format
      : "mc_single") as Question["format"];
    return {
      id: item.id,
      itemType: item.item_type,
      format,
      clusterId: item.cluster_id ?? undefined,
      stem: item.stem,
      options: (item.options ?? []).map((o) => ({ id: o.id, label: o.text })),
      matching:
        (format === "matching" || format === "enhanced_matching") && raw
          ? (raw as unknown as Question["matching"])
          : undefined,
      graphic: format === "graphic_based" && raw ? (raw as unknown as Question["graphic"]) : undefined,
      hotspot:
        format === "hotspot" && raw && Array.isArray(raw.hotspots)
          ? (raw as unknown as Question["hotspot"])
          : undefined,
      // El backend no revela la clave hasta corregir: se rellena con el feedback.
      correctAnswer: [],
      taskCode: m?.taskCode ?? "ECO",
      taskTitle: m?.taskTitle ?? "Tarea ECO",
      domain: m?.domain ?? "process",
      approach: m?.approach ?? "predictive",
      difficulty,
      processGroup: (item.process_group ?? undefined) as Question["processGroup"],
      performanceDomain: (item.performance_domain ?? undefined) as Question["performanceDomain"],
      focusTags: (item.focus_tags ?? []) as Question["focusTags"],
      sectionNumber: item.section_number ?? 1,

      explanation: { correct: "", distractors: [], reference: "Explicación disponible al corregir." },
    };
  });

  const rawSections = (data.sections ?? null) as
    | Record<string, unknown>[]
    | null;

  const fallbackFor = (count: number) => Math.max(300, count * 90);

  const sections: ExamSection[] = rawSections?.length
    ? rawSections
        .map((s, idx) => {
          // El backend puede devolver snake_case o camelCase; normalizamos.
          const number =
            Number(s.section_number ?? s.sectionNumber ?? s.section ?? s.number) || idx + 1;
          const count =
            Number(s.total_questions ?? s.totalQuestions ?? s.count) ||
            questions.filter((q) => (q.sectionNumber ?? 1) === number).length ||
            1;
          const seconds = Number(s.time_limit_seconds ?? s.timeLimitSeconds ?? s.seconds);
          return {
            sectionNumber: number,
            count,
            seconds: Number.isFinite(seconds) && seconds > 0 ? seconds : fallbackFor(count),
          };
        })
        .sort((a, b) => a.sectionNumber - b.sectionNumber)

    : [
        {
          sectionNumber: 1,
          count: questions.length,
          seconds:
            Number(data.time_limit_seconds) > 0
              ? Number(data.time_limit_seconds)
              : fallbackFor(questions.length),
        },
      ];

  return {
    examId: data.exam_id,
    mode: params.mode,
    questions,
    clusters,
    timeLimitSeconds: sections.reduce((a, s) => a + s.seconds, 0),

    sections,
  };
}

/**
 * `submit_answer` compara conjuntos de ids. En matching enviamos los pares
 * serializados como "idIzquierda:idDerecha" para que la comparación funcione.
 */
function serializeAnswer(answer: AnswerValue): string[] {
  if (Array.isArray(answer)) return answer;
  return Object.entries(answer).map(([l, r]) => `${l}:${r}`);
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
      user_answer: serializeAnswer(answer),
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
    diploma: data.diploma
      ? {
          id: String(data.diploma.id),
          issuedAt: String(data.diploma.issued_at),
          thresholdPct: Number(data.diploma.threshold_pct) || 0,
          disclaimer: String(data.diploma.disclaimer ?? ""),
        }
      : null,
    capstoneDiploma: data.capstone_diploma
      ? {
          id: String(data.capstone_diploma.id),
          issuedAt: String(data.capstone_diploma.issued_at),
          disclaimer: String(data.capstone_diploma.disclaimer ?? ""),
        }
      : null,
  };
}

/** Corrección local para la revisión (usa la clave devuelta por submit_answer). */
export function isAnswerCorrect(question: Question, answer: AnswerValue | undefined): boolean {
  if (!answer) return false;
  if (question.format === "matching" || question.format === "enhanced_matching") {
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
