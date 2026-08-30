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
