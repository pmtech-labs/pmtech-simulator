import { supabase } from "@/integrations/supabase/client";

/** Códigos de dominio tal y como están en `eco_domains.code`. */
export type EcoDomainCode = "people" | "process" | "business_environment";

export const ECO_DOMAIN_LABELS: Record<EcoDomainCode, string> = {
  people: "Personas",
  process: "Procesos",
  business_environment: "Entorno de negocio",
};

/** Token de color del design system para cada dominio ECO. */
export const ECO_DOMAIN_TOKENS: Record<EcoDomainCode, string> = {
  people: "people",
  process: "process",
  business_environment: "business",
};

export interface LearningPathUnit {
  id: string;
  sequence: number;
  title: string;
  description: string | null;
  taskIds: string[];
  domains: EcoDomainCode[];
  /** Promedio simple de mastery_pct sobre las tareas de la unidad; null si no hay datos. */
  masteryPct: number | null;
  /** Tareas de la unidad con al menos un intento registrado. */
  practisedTasks: number;
}

interface UnitTaskRow {
  course_unit_id: string;
  task_id: string;
  eco_tasks: { domain_id: string | null } | null;
}

export async function getLearningPath(): Promise<LearningPathUnit[]> {
  const [unitsRes, mapRes, domainsRes] = await Promise.all([
    supabase
      .from("course_units")
      .select("id, title, description, sequence")
      .eq("status", "published")
      .order("sequence"),
    supabase
      .from("course_unit_tasks")
      .select("course_unit_id, task_id, eco_tasks(domain_id)")
      .returns<UnitTaskRow[]>(),
    supabase.from("eco_domains").select("id, code"),
  ]);

  if (unitsRes.error) throw new Error(unitsRes.error.message);
  if (mapRes.error) throw new Error(mapRes.error.message);
  if (domainsRes.error) throw new Error(domainsRes.error.message);

  const domainCodeById = new Map<string, EcoDomainCode>(
    (domainsRes.data ?? []).map((d) => [d.id as string, d.code as EcoDomainCode]),
  );

  // Mastery del usuario autenticado (RLS ya filtra por auth.uid()).
  const masteryByTask = new Map<string, { pct: number; attempts: number }>();
  const { data: mastery } = await supabase
    .from("user_task_mastery")
    .select("task_id, mastery_pct, attempts, correct");
  for (const row of mastery ?? []) {
    const attempts = row.attempts ?? 0;
    const pct =
      row.mastery_pct != null
        ? Number(row.mastery_pct)
        : attempts > 0
          ? Math.round(((row.correct ?? 0) / attempts) * 100)
          : 0;
    masteryByTask.set(row.task_id as string, { pct, attempts });
  }

  const byUnit = new Map<string, UnitTaskRow[]>();
  for (const row of mapRes.data ?? []) {
    const list = byUnit.get(row.course_unit_id) ?? [];
    list.push(row);
    byUnit.set(row.course_unit_id, list);
  }

  return (unitsRes.data ?? []).map((u) => {
    const rows = byUnit.get(u.id as string) ?? [];
    const taskIds = rows.map((r) => r.task_id);
    const domains = Array.from(
      new Set(
        rows
          .map((r) => (r.eco_tasks?.domain_id ? domainCodeById.get(r.eco_tasks.domain_id) : undefined))
          .filter((c): c is EcoDomainCode => Boolean(c)),
      ),
    );

    const known = taskIds.map((id) => masteryByTask.get(id)).filter((m): m is { pct: number; attempts: number } => Boolean(m));
    const masteryPct = taskIds.length
      ? Math.round(taskIds.reduce((acc, id) => acc + (masteryByTask.get(id)?.pct ?? 0), 0) / taskIds.length)
      : null;

    return {
      id: u.id as string,
      sequence: u.sequence as number,
      title: u.title as string,
      description: (u.description as string | null) ?? null,
      taskIds,
      domains,
      masteryPct,
      practisedTasks: known.filter((m) => m.attempts > 0).length,
    };
  });
}
