import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Gestión del currículo propio (course_units + course_unit_tasks).
 * La RLS de estas tablas solo permite escritura a service_role, así que las
 * mutaciones se hacen en servidor con el cliente admin, previa verificación
 * de que quien llama es administrador (RPC `is_admin`).
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: units, error } = await supabaseAdmin
      .from("course_units")
      .select("id, title, description, sequence, status")
      .order("sequence");
    if (error) throw new Error(error.message);

    const { data: links, error: linkError } = await supabaseAdmin
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let unitId = data.id;
    if (unitId) {
      const { error } = await supabaseAdmin
        .from("course_units")
        .update({
          title: data.title.trim(),
          description: data.description.trim() || null,
          sequence: data.sequence,
        })
        .eq("id", unitId);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabaseAdmin
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

    const { error: delError } = await supabaseAdmin
      .from("course_unit_tasks")
      .delete()
      .eq("course_unit_id", unitId!);
    if (delError) throw new Error(delError.message);

    if (data.taskIds.length) {
      const { error: insError } = await supabaseAdmin
        .from("course_unit_tasks")
        .insert(data.taskIds.map((task_id) => ({ course_unit_id: unitId!, task_id })));
      if (insError) throw new Error(insError.message);
    }

    return { id: unitId! };
  });

export const setCourseUnitStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "draft" | "published" }) => input)
  .handler(async ({ data, context }) => {
    const admin = await context.supabase.rpc("is_admin", { p_user_id: context.userId });
    if (admin.error || !admin.data) throw new Error("No autorizado: se requiere rol de administrador.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.status === "published") {
      const { count, error: countError } = await supabaseAdmin
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

    const { error } = await supabaseAdmin
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("course_unit_tasks").delete().eq("course_unit_id", data.id);
    const { error } = await supabaseAdmin.from("course_units").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
