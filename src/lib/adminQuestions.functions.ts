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
        "id, question_number, stem, options, correct_answer, practicum_payload, explanation, status, item_type, format, approach, difficulty, task_id, cluster_id, times_answered, times_correct, created_at, process_group, performance_domain, focus_tags",
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

    let latestRejectionReason: string | null = null;
    if (q.status === "retired") {
      const { data: rejection } = await db
        .from("question_rejections")
        .select("reason")
        .eq("question_id", data.id)
        .order("rejected_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      latestRejectionReason = rejection?.reason ?? null;
    }

    return {
      ...q,
      task_title: task ? `${task.task_number}. ${task.title}` : null,
      domain_name: domainName,
      cluster_title: cluster?.data?.title ?? null,
      cluster_scenario: cluster?.data?.scenario_text ?? null,
      latest_rejection_reason: latestRejectionReason,
      tag_codes: (tagRows ?? []).map((t) => t.tag_code),
    };
  });

/**
 * Cambia el estado de una o varias preguntas (borrador ↔ publicada ↔ retirada)
 * desde el panel de administración, validando el rol admin con la sesión.
 */
export const setQuestionsStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ids: string[]; status: string; reason?: string }) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1),
        status: z.enum(["draft", "published", "retired"]),
        reason: z.string().trim().min(1).max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado");

    // Snapshot previo: necesario para registrar el motivo del rechazo.
    let snapshots: Array<{
      id: string;
      question_number: number;
      task_id: string;
      format: string;
      stem: string;
    }> = [];
    if (data.status === "retired" && data.reason) {
      const { data: rows } = await context.supabase
        .from("questions")
        .select("id, question_number, task_id, format, stem")
        .in("id", data.ids);
      snapshots = rows ?? [];
    }

    const { data: rows, error } = await context.supabase
      .from("questions")
      .update({ status: data.status })
      .in("id", data.ids)
      .select("id");

    if (error) throw new Error(error.message);

    if (snapshots.length > 0 && data.reason) {
      const reason = data.reason;
      await context.supabase.from("question_rejections").insert(
        snapshots.map((s) => ({
          question_id: s.id,
          question_number: s.question_number,
          task_id: s.task_id,
          format: s.format,
          stem_snapshot: s.stem,
          reason,
          rejected_by: context.userId,
        })),
      );
    }

    return { updated: rows?.length ?? 0 };
  });
