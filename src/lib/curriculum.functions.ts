import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Gestión del currículo propio (course_units + course_unit_tasks).
 * Las operaciones se ejecutan como el usuario autenticado. La RLS comprueba
 * `is_admin(auth.uid())`, evitando depender de una credencial service_role.
 */

export interface AdminCourseUnit {
  id: string;
  title: string;
  description: string | null;
  sequence: number;
  status: "draft" | "published";
  taskIds: string[];
}

export const listAdminCourseUnits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminCourseUnit[]> => {
    const admin = await context.supabase.rpc("is_admin", { p_user_id: context.userId });
    if (admin.error || !admin.data) throw new Error("No autorizado: se requiere rol de administrador.");
    const { data: units, error } = await context.supabase
      .from("course_units")
      .select("id, title, description, sequence, status")
      .order("sequence");
    if (error) throw new Error(error.message);

    const { data: links, error: linkError } = await context.supabase
      .from("course_unit_tasks")
      .select("course_unit_id, task_id");
    if (linkError) throw new Error(linkError.message);

    return (units ?? []).map((u) => ({
      id: u.id,
      title: u.title,
      description: u.description,
      sequence: u.sequence,
      status: (u.status === "published" ? "published" : "draft") as "draft" | "published",
      taskIds: (links ?? []).filter((l) => l.course_unit_id === u.id).map((l) => l.task_id),
    }));
  });

export const saveCourseUnit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id?: string;
    title: string;
    description: string;
    sequence: number;
    taskIds: string[];
  }) => {
    if (!input.title.trim()) throw new Error("El título es obligatorio.");
    if (!Number.isFinite(input.sequence)) throw new Error("La secuencia debe ser un número.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const admin = await context.supabase.rpc("is_admin", { p_user_id: context.userId });
    if (admin.error || !admin.data) throw new Error("No autorizado: se requiere rol de administrador.");
    let unitId = data.id;
    if (unitId) {
      const { error } = await context.supabase
        .from("course_units")
        .update({
          title: data.title.trim(),
          description: data.description.trim() || null,
          sequence: data.sequence,
        })
        .eq("id", unitId);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await context.supabase
        .from("course_units")
        .insert({
          title: data.title.trim(),
          description: data.description.trim() || null,
          sequence: data.sequence,
          status: "draft",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      unitId = created.id;
    }

    if (!unitId) throw new Error("No se pudo determinar la unidad que se está guardando.");

    const { error: delError } = await context.supabase
      .from("course_unit_tasks")
      .delete()
      .eq("course_unit_id", unitId);
    if (delError) throw new Error(delError.message);

    if (data.taskIds.length) {
      const { error: insError } = await context.supabase
        .from("course_unit_tasks")
        .insert(data.taskIds.map((task_id) => ({ course_unit_id: unitId, task_id })));
      if (insError) throw new Error(insError.message);
    }

    return { id: unitId };
  });

export const setCourseUnitStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "draft" | "published" }) => input)
  .handler(async ({ data, context }) => {
    const admin = await context.supabase.rpc("is_admin", { p_user_id: context.userId });
    if (admin.error || !admin.data) throw new Error("No autorizado: se requiere rol de administrador.");
    if (data.status === "published") {
      const { count, error: countError } = await context.supabase
        .from("course_unit_tasks")
        .select("task_id", { count: "exact", head: true })
        .eq("course_unit_id", data.id);
      if (countError) throw new Error(countError.message);
      if (!count) {
        throw new Error(
          "No puedes publicar una unidad sin tareas ECO mapeadas: los modos de práctica fallarían.",
        );
      }
    }

    const { error } = await context.supabase
      .from("course_units")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCourseUnit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const admin = await context.supabase.rpc("is_admin", { p_user_id: context.userId });
    if (admin.error || !admin.data) throw new Error("No autorizado: se requiere rol de administrador.");
    await context.supabase.from("course_unit_tasks").delete().eq("course_unit_id", data.id);
    const { error } = await context.supabase.from("course_units").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export interface UnitPreview {
  unitId: string;
  unitTitle: string;
  sequence: number;
  unitQuiz: { taskCount: number; questionCount: number; tasksWithoutQuestions: string[] };
  cumulative: { unitCount: number; taskCount: number; questionCount: number };
}

/** Cuenta cuántas preguntas publicadas alimentarían `unit_quiz` y `cumulative` para una unidad. */
export const previewUnitCoverage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }): Promise<UnitPreview> => {
    const admin = await context.supabase.rpc("is_admin", { p_user_id: context.userId });
    if (admin.error || !admin.data) throw new Error("No autorizado: se requiere rol de administrador.");
    const { data: unit, error: unitError } = await context.supabase
      .from("course_units")
      .select("id, title, sequence")
      .eq("id", data.id)
      .single();
    if (unitError) throw new Error(unitError.message);

    const { data: allUnits, error: unitsError } = await context.supabase
      .from("course_units")
      .select("id, sequence, status")
      .lte("sequence", unit.sequence)
      .eq("status", "published");
    if (unitsError) throw new Error(unitsError.message);

    const cumulativeUnitIds = Array.from(new Set([...(allUnits ?? []).map((u) => u.id), unit.id]));

    const { data: links, error: linkError } = await context.supabase
      .from("course_unit_tasks")
      .select("course_unit_id, task_id")
      .in("course_unit_id", cumulativeUnitIds);
    if (linkError) throw new Error(linkError.message);

    const unitTaskIds = Array.from(
      new Set((links ?? []).filter((l) => l.course_unit_id === unit.id).map((l) => l.task_id)),
    );
    const cumulativeTaskIds = Array.from(new Set((links ?? []).map((l) => l.task_id)));

    const countQuestions = async (taskIds: string[]) => {
      if (!taskIds.length) return 0;
      const { count, error } = await context.supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("status", "published")
        .in("task_id", taskIds);
      if (error) throw new Error(error.message);
      return count ?? 0;
    };

    const [unitQuestionCount, cumulativeQuestionCount] = await Promise.all([
      countQuestions(unitTaskIds),
      countQuestions(cumulativeTaskIds),
    ]);

    let tasksWithoutQuestions: string[] = [];
    if (unitTaskIds.length) {
      const { data: tasks, error: tasksError } = await context.supabase
        .from("eco_tasks")
        .select("id, task_number, title")
        .in("id", unitTaskIds);
      if (tasksError) throw new Error(tasksError.message);

      const { data: published, error: pubError } = await context.supabase
        .from("questions")
        .select("task_id")
        .eq("status", "published")
        .in("task_id", unitTaskIds);
      if (pubError) throw new Error(pubError.message);

      const covered = new Set((published ?? []).map((q) => q.task_id));
      tasksWithoutQuestions = (tasks ?? [])
        .filter((t) => !covered.has(t.id))
        .map((t) => `${t.task_number}. ${t.title}`);
    }

    return {
      unitId: unit.id,
      unitTitle: unit.title,
      sequence: unit.sequence,
      unitQuiz: {
        taskCount: unitTaskIds.length,
        questionCount: unitQuestionCount,
        tasksWithoutQuestions,
      },
      cumulative: {
        unitCount: cumulativeUnitIds.length,
        taskCount: cumulativeTaskIds.length,
        questionCount: cumulativeQuestionCount,
      },
    };
  });

/** Mueve una unidad una posición arriba/abajo intercambiando `sequence` con su vecina. */
export const moveCourseUnit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; direction: "up" | "down" }) => input)
  .handler(async ({ data, context }) => {
    const admin = await context.supabase.rpc("is_admin", { p_user_id: context.userId });
    if (admin.error || !admin.data) throw new Error("No autorizado: se requiere rol de administrador.");
    const { data: units, error } = await context.supabase
      .from("course_units")
      .select("id, sequence")
      .order("sequence");
    if (error) throw new Error(error.message);

    const list = units ?? [];
    const index = list.findIndex((u) => u.id === data.id);
    if (index < 0) throw new Error("Unidad no encontrada.");
    const target = data.direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return { ok: true };

    const a = list[index];
    const b = list[target];

    // Secuencia temporal para no chocar con posibles índices únicos.
    const temp = -Math.abs(a.sequence) - 1000;
    const steps = [
      { id: a.id, sequence: temp },
      { id: b.id, sequence: a.sequence },
      { id: a.id, sequence: b.sequence },
    ];
    for (const step of steps) {
      const { error: upError } = await context.supabase
        .from("course_units")
        .update({ sequence: step.sequence })
        .eq("id", step.id);
      if (upError) throw new Error(upError.message);
    }

    return { ok: true };
  });

/**
 * Reordena todas las unidades según el orden recibido (drag & drop).
 * Asigna secuencias 1..n de forma estable, sin alterar el estado de publicación.
 */
export const reorderCourseUnits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderedIds: string[] }) => input)
  .handler(async ({ data, context }) => {
    const admin = await context.supabase.rpc("is_admin", { p_user_id: context.userId });
    if (admin.error || !admin.data) throw new Error("No autorizado: se requiere rol de administrador.");
    const { data: units, error } = await context.supabase.from("course_units").select("id");
    if (error) throw new Error(error.message);

    const known = new Set((units ?? []).map((u) => u.id));
    const ordered = data.orderedIds.filter((id) => known.has(id));
    if (ordered.length !== known.size) throw new Error("El orden recibido no coincide con las unidades existentes.");

    // Primero a secuencias temporales negativas para evitar colisiones.
    for (let i = 0; i < ordered.length; i++) {
      const { error: tmpError } = await context.supabase
        .from("course_units")
        .update({ sequence: -(i + 1) })
        .eq("id", ordered[i]);
      if (tmpError) throw new Error(tmpError.message);
    }
    for (let i = 0; i < ordered.length; i++) {
      const { error: upError } = await context.supabase
        .from("course_units")
        .update({ sequence: i + 1 })
        .eq("id", ordered[i]);
      if (upError) throw new Error(upError.message);
    }

    return { ok: true };
  });
