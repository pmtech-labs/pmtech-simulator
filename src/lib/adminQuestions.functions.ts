import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Devuelve una pregunta completa (enunciado, opciones, respuesta correcta y
 * explicación) para el panel de administración, sin depender del estado
 * `published` que exige la RLS pública.
 */
export const getAdminQuestionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado");

    const db = context.supabase;

    const { data: q, error } = await db
      .from("questions")
      .select(
        "id, stem, options, correct_answer, practicum_payload, explanation, status, item_type, format, approach, difficulty, task_id, cluster_id, times_answered, times_correct, created_at, process_group, performance_domain, focus_tags",
      )
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!q) throw new Error("Pregunta no encontrada");

    const [{ data: tagRows }, { data: task }, cluster] = await Promise.all([
      db.from("question_tags").select("tag_code").eq("question_id", data.id),
      db
        .from("eco_tasks")
        .select("title, task_number, domain_id")
        .eq("id", q.task_id)
        .maybeSingle(),
      q.cluster_id
        ? db
            .from("case_clusters")
            .select("title, scenario_text")
            .eq("id", q.cluster_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    let domainName: string | null = null;
    if (task?.domain_id) {
      const { data: domain } = await db
        .from("eco_domains")
        .select("name")
        .eq("id", task.domain_id)
        .maybeSingle();
      domainName = domain?.name ?? null;
    }

    return {
      ...q,
      task_title: task ? `${task.task_number}. ${task.title}` : null,
      domain_name: domainName,
      cluster_title: cluster?.data?.title ?? null,
      cluster_scenario: cluster?.data?.scenario_text ?? null,
      tag_codes: (tagRows ?? []).map((t) => t.tag_code),
    };
  });

/**
 * Cambia el estado de una o varias preguntas (borrador ↔ publicada ↔ retirada)
 * desde el panel de administración, validando el rol admin con la sesión.
 */
export const setQuestionsStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ids: string[]; status: string }) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1),
        status: z.enum(["draft", "published", "retired"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado");

    const { data: rows, error } = await context.supabase
      .from("questions")
      .update({ status: data.status })
      .in("id", data.ids)
      .select("id");

    if (error) throw new Error(error.message);
    return { updated: rows?.length ?? 0 };
  });
