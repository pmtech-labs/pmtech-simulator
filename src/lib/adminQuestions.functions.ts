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

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: q, error } = await supabaseAdmin
      .from("questions")
      .select(
        "id, stem, options, correct_answer, practicum_payload, explanation, status, item_type, format, approach, difficulty, task_id, cluster_id, times_answered, times_correct, created_at",
      )
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!q) throw new Error("Pregunta no encontrada");

    const [{ data: task }, cluster] = await Promise.all([
      supabaseAdmin
        .from("eco_tasks")
        .select("title, task_number, domain_id")
        .eq("id", q.task_id)
        .maybeSingle(),
      q.cluster_id
        ? supabaseAdmin
            .from("case_clusters")
            .select("title, scenario_text")
            .eq("id", q.cluster_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    let domainName: string | null = null;
    if (task?.domain_id) {
      const { data: domain } = await supabaseAdmin
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
    };
  });
