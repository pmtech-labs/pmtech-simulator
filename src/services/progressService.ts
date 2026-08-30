import { supabase } from "@/integrations/supabase/client";

import { PROGRESS_TREND_LABELS, type UnitModeStats, type UnitProgress } from "@/data/mockData";
import type { DomainCode, ErrorType } from "@/types/exam";

/**
 * Analítica real de progreso del candidato: agrega `exam_items` (RLS filtra por
 * auth.uid()) por lección del currículo, distinguiendo prácticas parciales de
 * simulacros completos.
 */

const WEEKS = PROGRESS_TREND_LABELS.length;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Modos que cuentan como simulacro (completo, medio o acumulativo). */
const SIM_MODES = new Set(["full_sim", "half_sim", "cumulative"]);

type ActivityKey = "unitQuiz" | "cumulative";

function toUiDomain(code: string | null | undefined): DomainCode {
  if (code === "people") return "people";
  if (code === "business_environment" || code === "business") return "business";
  return "process";
}

interface ItemRow {
  exam_id: string | null;
  is_correct: boolean | null;
  time_spent_seconds: number | null;
  error_type_chosen: ErrorType | null;
  questions: { task_id: string | null } | null;
  exams: { mode: string | null; started_at: string | null } | null;
}

interface Acc {
  answered: number;
  correct: number;
  seconds: number;
  exams: Set<string>;
  weeks: { answered: number; correct: number }[];
}

function newAcc(): Acc {
  return {
    answered: 0,
    correct: 0,
    seconds: 0,
    exams: new Set(),
    weeks: Array.from({ length: WEEKS }, () => ({ answered: 0, correct: 0 })),
  };
}

function toStats(acc: Acc): UnitModeStats {
  return {
    attempts: acc.exams.size,
    answered: acc.answered,
    accuracy: acc.answered ? Math.round((acc.correct / acc.answered) * 100) : 0,
    avgSeconds: acc.answered ? Math.round(acc.seconds / acc.answered) : 0,
  };
}

function toTrend(acc: Acc): (number | null)[] {
  return acc.weeks.map((w) => (w.answered ? Math.round((w.correct / w.answered) * 100) : null));
}

/** Índice de semana (0 = hace 5 semanas … 5 = semana actual); null si queda fuera. */
function weekIndex(startedAt: string | null | undefined, now: number): number | null {
  if (!startedAt) return null;
  const diff = now - new Date(startedAt).getTime();
  if (diff < 0) return WEEKS - 1;
  const idx = WEEKS - 1 - Math.floor(diff / WEEK_MS);
  return idx >= 0 ? idx : null;
}

export async function getUnitProgress(): Promise<UnitProgress[]> {
  const [unitsRes, mapRes, domainsRes, itemsRes] = await Promise.all([
    supabase
      .from("course_units")
      .select("id, title, sequence")
      .eq("status", "published")
      .order("sequence"),
    supabase.from("course_unit_tasks").select("course_unit_id, task_id, eco_tasks(domain_id)"),
    supabase.from("eco_domains").select("id, code"),
    supabase
      .from("exam_items")
      .select(
        "exam_id, is_correct, time_spent_seconds, error_type_chosen, questions(task_id), exams(mode, started_at)",
      )
      .not("is_correct", "is", null)
      .limit(5000),
  ]);

  if (unitsRes.error) throw new Error(unitsRes.error.message);
  if (mapRes.error) throw new Error(mapRes.error.message);
  if (itemsRes.error) throw new Error(itemsRes.error.message);

  const domainCodeById = new Map<string, string>(
    (domainsRes.data ?? []).map((d) => [d.id as string, d.code as string]),
  );

  const unitByTask = new Map<string, string>();
  const domainsByUnit = new Map<string, DomainCode[]>();
  for (const row of (mapRes.data ?? []) as {
    course_unit_id: string;
    task_id: string;
    eco_tasks: { domain_id: string | null } | null;
  }[]) {
    unitByTask.set(row.task_id, row.course_unit_id);
    const code = row.eco_tasks?.domain_id ? domainCodeById.get(row.eco_tasks.domain_id) : undefined;
    const list = domainsByUnit.get(row.course_unit_id) ?? [];
    list.push(toUiDomain(code));
    domainsByUnit.set(row.course_unit_id, list);
  }

  const stats = new Map<string, Record<ActivityKey, Acc>>();
  const errors = new Map<string, Map<ErrorType, number>>();
  const now = Date.now();

  for (const raw of (itemsRes.data ?? []) as unknown as ItemRow[]) {
    const taskId = raw.questions?.task_id;
    if (!taskId) continue;
    const unitId = unitByTask.get(taskId);
    if (!unitId) continue;

    const key: ActivityKey = SIM_MODES.has(raw.exams?.mode ?? "") ? "cumulative" : "unitQuiz";
    const bucket = stats.get(unitId) ?? { unitQuiz: newAcc(), cumulative: newAcc() };
    const acc = bucket[key];
    const ok = raw.is_correct === true;
    acc.answered += 1;
    if (ok) acc.correct += 1;
    acc.seconds += raw.time_spent_seconds ?? 0;
    if (raw.exam_id) acc.exams.add(raw.exam_id);
    const wi = weekIndex(raw.exams?.started_at, now);
    if (wi != null) {
      acc.weeks[wi].answered += 1;
      if (ok) acc.weeks[wi].correct += 1;
    }
    stats.set(unitId, bucket);

    if (!ok && raw.error_type_chosen) {
      const m = errors.get(unitId) ?? new Map<ErrorType, number>();
      m.set(raw.error_type_chosen, (m.get(raw.error_type_chosen) ?? 0) + 1);
      errors.set(unitId, m);
    }
  }

  return ((unitsRes.data ?? []) as { id: string; title: string; sequence: number }[]).map((u) => {
    const bucket = stats.get(u.id) ?? { unitQuiz: newAcc(), cumulative: newAcc() };
    const unitDomains = domainsByUnit.get(u.id) ?? [];
    const counts = new Map<DomainCode, number>();
    unitDomains.forEach((d) => counts.set(d, (counts.get(d) ?? 0) + 1));
    const domain = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "process";

    return {
      sequence: u.sequence,
      title: u.title,
      domain,
      unitQuiz: toStats(bucket.unitQuiz),
      cumulative: toStats(bucket.cumulative),
      trend: { unitQuiz: toTrend(bucket.unitQuiz), cumulative: toTrend(bucket.cumulative) },
      errorTypes: [...(errors.get(u.id) ?? new Map<ErrorType, number>()).entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([errorType, occurrences]) => ({ errorType, occurrences })),
    } satisfies UnitProgress;
  });
}

export interface RecommendedTask {
  taskId: string;
  code: string;
  title: string;
  domain: DomainCode;
  mastery: number;
  /** Motivos que explican por qué se prioriza la tarea. */
  reasons: string[];
  score: number;
}

export interface RecommendedSession {
  tasks: RecommendedTask[];
  questionCount: number;
  estimatedMinutes: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Tabla de registro de tareas recomendadas completadas (fuera de los tipos generados). */
const RECOMMENDED_COMPLETIONS_TABLE = "recommended_task_completions";

interface RecommendedCompletionRow {
  task_id: string;
  completed_at: string;
  questions_answered: number;
  questions_correct: number;
}

/** Cliente sin tipar para la tabla de registro (los tipos generados aún no la incluyen). */
function untypedDb() {
  return supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        gte: (
          col: string,
          value: string,
        ) => Promise<{ data: RecommendedCompletionRow[] | null; error: { message: string } | null }>;
      };
      insert: (rows: Record<string, unknown>[]) => Promise<{ error: { message: string } | null }>;
    };
  };
}

export interface RecordRecommendedCompletionInput {
  taskIds: string[];
  examId?: string | null;
  questionsAnswered: number;
  questionsCorrect: number;
}

/**
 * Registra que el candidato ha completado una sesión iniciada desde la
 * recomendación de /progreso. Se usa para no volver a recomendar de inmediato
 * la misma tarea y para mostrar el histórico de sesiones recomendadas.
 */
export async function recordRecommendedTaskCompletion(
  input: RecordRecommendedCompletionInput,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId || input.taskIds.length === 0) return;

  const { error } = await untypedDb()
    .from(RECOMMENDED_COMPLETIONS_TABLE)
    .insert(
      input.taskIds.map((taskId) => ({
        user_id: userId,
        task_id: taskId,
        exam_id: input.examId ?? null,
        questions_answered: input.questionsAnswered,
        questions_correct: input.questionsCorrect,
      })),
    );
  if (error) throw new Error(error.message);
}

export async function getRecommendedSession(): Promise<RecommendedSession | null> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;


  const [masteryRes, itemsRes] = await Promise.all([
    supabase
      .from("user_task_mastery")
      .select(
        "task_id, attempts, correct, mastery_pct, last_attempt_at, eco_tasks(task_number, title, eco_domains(code))",
      ),
    supabase
      .from("exam_items")
      .select("is_correct, questions(task_id), exams(started_at)")
      .not("is_correct", "is", null)
      .limit(5000),
  ]);

  if (masteryRes.error) throw new Error(masteryRes.error.message);
  if (itemsRes.error) throw new Error(itemsRes.error.message);

  // Sesiones recomendadas completadas recientemente: bajan de prioridad.
  const completionsRes = await untypedDb()
    .from(RECOMMENDED_COMPLETIONS_TABLE)
    .select("task_id, completed_at, questions_answered, questions_correct")
    .gte("completed_at", new Date(Date.now() - 7 * DAY_MS).toISOString());
  const completedRecently = new Map<string, string>();
  for (const row of completionsRes.data ?? []) {
    const prev = completedRecently.get(row.task_id);
    if (!prev || new Date(row.completed_at) > new Date(prev)) {
      completedRecently.set(row.task_id, row.completed_at);
    }
  }



  const now = Date.now();

  interface TaskStats {
    recentFails: number; // fallos últimos 14 días
    recentAnswered: number;
    thisWeek: { answered: number; correct: number };
    prevWeeks: { answered: number; correct: number };
  }
  const statsByTask = new Map<string, TaskStats>();

  for (const raw of (itemsRes.data ?? []) as unknown as {
    is_correct: boolean | null;
    questions: { task_id: string | null } | null;
    exams: { started_at: string | null } | null;
  }[]) {
    const taskId = raw.questions?.task_id;
    const startedAt = raw.exams?.started_at;
    if (!taskId || !startedAt) continue;
    const ageDays = (now - new Date(startedAt).getTime()) / DAY_MS;
    const s = statsByTask.get(taskId) ?? {
      recentFails: 0,
      recentAnswered: 0,
      thisWeek: { answered: 0, correct: 0 },
      prevWeeks: { answered: 0, correct: 0 },
    };
    const ok = raw.is_correct === true;
    if (ageDays <= 14) {
      s.recentAnswered += 1;
      if (!ok) s.recentFails += 1;
    }
    if (ageDays <= 7) {
      s.thisWeek.answered += 1;
      if (ok) s.thisWeek.correct += 1;
    } else if (ageDays <= 21) {
      s.prevWeeks.answered += 1;
      if (ok) s.prevWeeks.correct += 1;
    }
    statsByTask.set(taskId, s);
  }

  const scored: RecommendedTask[] = [];
  for (const row of (masteryRes.data ?? []) as {
    task_id: string;
    attempts: number | null;
    correct: number | null;
    mastery_pct: number | null;
    last_attempt_at: string | null;
    eco_tasks: { task_number: number; title: string; eco_domains: { code: string } | null } | null;
  }[]) {
    const attempts = row.attempts ?? 0;
    if (attempts === 0) continue;
    const mastery = Math.round(
      row.mastery_pct != null
        ? Number(row.mastery_pct)
        : attempts
          ? ((row.correct ?? 0) / attempts) * 100
          : 0,
    );

    const s = statsByTask.get(row.task_id);
    const daysSince = row.last_attempt_at
      ? (now - new Date(row.last_attempt_at).getTime()) / DAY_MS
      : 30;

    // Tendencia semanal: compara esta semana con las dos anteriores.
    let trendDelta: number | null = null;
    if (s && s.thisWeek.answered >= 3 && s.prevWeeks.answered >= 3) {
      trendDelta =
        (s.thisWeek.correct / s.thisWeek.answered - s.prevWeeks.correct / s.prevWeeks.answered) * 100;
    }

    // Puntuación de prioridad (mayor = más urgente).
    let score = (100 - mastery) * 1.0;
    const reasons: string[] = [`Dominio actual ${mastery} %`];

    if (s && s.recentFails > 0) {
      score += Math.min(s.recentFails, 8) * 4;
      reasons.push(
        `${s.recentFails} fallo${s.recentFails === 1 ? "" : "s"} en los últimos 14 días`,
      );
    }
    if (trendDelta != null && trendDelta < -5) {
      score += Math.min(Math.abs(trendDelta), 30);
      reasons.push(`Tendencia a la baja esta semana (${Math.round(trendDelta)} pts)`);
    }
    if (daysSince >= 7) {
      const recencyBoost = Math.min(daysSince, 30) * 0.8;
      score += recencyBoost;
      reasons.push(
        daysSince >= 21
          ? "Sin repasar desde hace más de 3 semanas"
          : `Sin repasar desde hace ${Math.floor(daysSince)} días`,
      );
    }

    const task = row.eco_tasks;
    const domain = toUiDomain(task?.eco_domains?.code);
    scored.push({
      taskId: row.task_id,
      code: `${domain === "people" ? "P" : domain === "process" ? "PR" : "BE"}-${task?.task_number ?? "?"}`,
      title: task?.title ?? "Tarea ECO",
      domain,
      mastery,
      reasons,
      score,
    });
  }

  if (scored.length === 0) return null;

  const tasks = scored.sort((a, b) => b.score - a.score).slice(0, 3);
  return {
    tasks,
    questionCount: tasks.length * 5,
    estimatedMinutes: tasks.length * 8,
  };
}

export interface ScoreTrendPoint {
  label: string;
  score: number;
}

/** Evolución real: puntuación de los últimos exámenes finalizados, en orden cronológico. */
export async function getScoreTrend(limit = 8): Promise<ScoreTrendPoint[]> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("exams")
    .select("score_pct, finished_at, mode")
    .eq("user_id", userId)
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  return (data ?? [])
    .slice()
    .reverse()
    .map((e) => ({
      label: new Date(e.finished_at as string).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      }),
      score: Math.round(Number(e.score_pct) || 0),
    }));
}
