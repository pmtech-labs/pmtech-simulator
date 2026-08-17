import { supabase } from "@/integrations/supabase/client";
import type { DomainCode, ErrorType } from "@/types/exam";

/** Mapea el código de dominio del ECO en base de datos al código usado en la UI. */
export function toUiDomain(code: string | null | undefined): DomainCode {
  if (code === "people") return "people";
  if (code === "business_environment" || code === "business") return "business";
  return "process";
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  plan: "free" | "basica_3m" | "premium_1m" | "premium_6m" | null;
  planName: string;
  freeHalfSimUsed: boolean;
  fullSimLimit: number | null;
  fullSimUsed: number;
  monthsRemaining: number;
  expiresAt: string | null;
  readiness: number;
  examsTaken: number;
  hoursTrained: number;
  questionsAnswered: number;
  streakDays: number;
  masteryByDomain: Record<DomainCode, number>;
}

export interface TaskMasteryRow {
  taskId: string;
  code: string;
  title: string;
  domain: DomainCode;
  mastery: number;
  attempts: number;
}

export interface ErrorTypeRow {
  errorType: ErrorType;
  occurrences: number;
}

export interface ExamHistoryRow {
  id: string;
  date: string;
  mode: string;
  questions: number;
  score: number;
  duration: string;
  status: string;
  domains: DomainCode[];
  scoreByDomain: Partial<Record<DomainCode, number>>;
}

const MODE_LABELS: Record<string, string> = {
  full_sim: "Simulación completa",
  half_sim: "Medio examen",
  domain_drill: "Práctica por dominios",
  case_only: "Solo casos",
  custom: "Personalizado",
  unit_quiz: "Práctica de lección",
  cumulative: "Simulacro acumulativo",
};

function initialsFrom(name: string, email: string) {
  const base = name.trim() || email;
  const parts = base.split(/[\s.@_-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(startedAt: string | null, finishedAt: string | null) {
  if (!startedAt || !finishedAt) return "—";
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (ms <= 0) return "—";
  const total = Math.round(ms / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

/** Dominio por tarea ECO del usuario autenticado (RLS filtra por auth.uid()). */
export async function getTaskMastery(): Promise<TaskMasteryRow[]> {
  const { data, error } = await supabase
    .from("user_task_mastery")
    .select(
      "task_id, attempts, correct, mastery_pct, eco_tasks(task_number, title, eco_domains(code))",
    );
  if (error || !data) return [];

  return data.map((row) => {
    const task = row.eco_tasks as
      | { task_number: number; title: string; eco_domains: { code: string } | null }
      | null;
    const attempts = row.attempts ?? 0;
    const pct =
      row.mastery_pct != null
        ? Number(row.mastery_pct)
        : attempts
          ? Math.round(((row.correct ?? 0) / attempts) * 100)
          : 0;
    const domain = toUiDomain(task?.eco_domains?.code);
    return {
      taskId: row.task_id,
      code: `${domain === "people" ? "P" : domain === "process" ? "PR" : "BE"}-${task?.task_number ?? "?"}`,
      title: task?.title ?? "Tarea ECO",
      domain,
      mastery: Math.round(pct),
      attempts,
    };
  });
}

export async function getErrorTypeStats(): Promise<ErrorTypeRow[]> {
  const { data, error } = await supabase
    .from("user_error_type_stats")
    .select("error_type, occurrences");
  if (error || !data) return [];
  return data.map((r) => ({
    errorType: r.error_type as ErrorType,
    occurrences: r.occurrences ?? 0,
  }));
}

export async function getExamHistory(): Promise<ExamHistoryRow[]> {
  const { data, error } = await supabase
    .from("exams")
    .select("id, mode, total_questions, score_pct, score_by_domain, started_at, finished_at, status")
    .order("started_at", { ascending: false });
  if (error || !data) return [];

  return data.map((e) => {
    const raw = (e.score_by_domain ?? {}) as Record<string, number>;
    const scoreByDomain: Partial<Record<DomainCode, number>> = {};
    Object.entries(raw).forEach(([code, value]) => {
      scoreByDomain[toUiDomain(code)] = Math.round(Number(value) || 0);
    });
    const score = Math.round(Number(e.score_pct) || 0);
    return {
      id: e.id,
      date: formatDate(e.started_at),
      mode: MODE_LABELS[e.mode] ?? e.mode,
      questions: e.total_questions ?? 0,
      score,
      duration: formatDuration(e.started_at, e.finished_at),
      status:
        e.status !== "finished" && !e.finished_at
          ? "En curso"
          : score >= 70
            ? "Aprobado"
            : score >= 62
              ? "Ajustado"
              : "Por debajo",
      domains: (Object.keys(scoreByDomain) as DomainCode[]).length
        ? (Object.keys(scoreByDomain) as DomainCode[])
        : (["people", "process", "business"] as DomainCode[]),
      scoreByDomain,
    };
  });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const [licenseRes, masteryRows, history] = await Promise.all([
    supabase
      .from("licenses")
      .select("expires_at, status, free_half_sim_used, full_sim_limit, plans(code, name, duration_months)")
      .eq("status", "active")
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getTaskMastery(),
    getExamHistory(),
  ]);

  const license = licenseRes.data as
    | {
        expires_at: string;
        free_half_sim_used: boolean | null;
        full_sim_limit: number | null;
        plans: { code: string; name: string; duration_months: number } | null;
      }
    | null;

  const masteryByDomain: Record<DomainCode, number> = { people: 0, process: 0, business: 0 };
  (["people", "process", "business"] as DomainCode[]).forEach((d) => {
    const rows = masteryRows.filter((r) => r.domain === d);
    masteryByDomain[d] = rows.length
      ? Math.round(rows.reduce((acc, r) => acc + r.mastery, 0) / rows.length)
      : 0;
  });

  const finished = history.filter((h) => h.status !== "En curso");
  const questionsAnswered = finished.reduce((acc, h) => acc + h.questions, 0);
  const fullSimUsed = finished.filter((h) => h.mode === "Simulación completa").length;
  const readiness = Math.round(
    masteryByDomain.people * 0.33 + masteryByDomain.process * 0.41 + masteryByDomain.business * 0.26,
  );

  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Candidato";
  const expires = license?.expires_at ? new Date(license.expires_at) : null;
  const monthsRemaining = expires
    ? Math.max(0, Math.round((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
    : 0;

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    initials: initialsFrom(name, user.email ?? ""),
    plan: (license?.plans?.code as CurrentUser["plan"]) ?? null,
    planName:
      license?.plans?.code === "free"
        ? "Plan gratuito"
        : license?.plans?.name
          ? `Licencia ${license.plans.name}`
          : "Sin licencia activa",
    freeHalfSimUsed: Boolean(license?.free_half_sim_used),
    fullSimLimit: license?.full_sim_limit ?? null,
    fullSimUsed,
    monthsRemaining,
    expiresAt: license?.expires_at ? formatDate(license.expires_at) : null,
    readiness,
    examsTaken: finished.length,
    hoursTrained: Math.round((questionsAnswered * 1.5) / 60),
    questionsAnswered,
    streakDays: 0,
    masteryByDomain,
  };
}
