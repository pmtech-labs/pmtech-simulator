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

    // `authenticated` no tiene SELECT sobre `questions` (el banco solo se lee a
    // través de vistas/funciones), así que tras verificar el rol admin usamos el
    // cliente privilegiado del servidor.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin;

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

    let rejectionHistory: { reason: string; rejected_at: string; rejected_by: string | null }[] = [];
    if (q.status === "retired" || q.status === "rejected") {
      const { data: rejections } = await db
        .from("question_rejections")
        .select("reason, rejected_at, rejected_by")
        .eq("question_id", data.id)
        .order("rejected_at", { ascending: false });
      rejectionHistory = rejections ?? [];
    }
    const latestRejectionReason = rejectionHistory[0]?.reason ?? null;

    return {
      ...q,
      task_title: task ? `${task.task_number}. ${task.title}` : null,
      domain_name: domainName,
      cluster_title: cluster?.data?.title ?? null,
      cluster_scenario: cluster?.data?.scenario_text ?? null,
      latest_rejection_reason: latestRejectionReason,
      rejection_history: rejectionHistory,
      tag_codes: (tagRows ?? []).map((t) => t.tag_code),
    };
  });

/**
 * Cambia el estado de una o varias preguntas (borrador ↔ publicada ↔ rechazada
 * ↔ retirada) desde el panel de administración, validando el rol admin.
 * Cuando el estado es `rejected` se guarda el motivo del revisor.
 */
export const setQuestionsStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ids: string[]; status: string; reason?: string; force?: boolean }) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1),
        status: z.enum(["draft", "published", "retired", "rejected"]),
        reason: z.string().trim().min(1).max(2000).optional(),
        force: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Los casos (case clusters) son indivisibles: si alguna de las preguntas
    // enviadas pertenece a un caso, la acción se aplica a las 5 preguntas.
    const { data: sent } = await supabaseAdmin
      .from("questions")
      .select("id, cluster_id")
      .in("id", data.ids);

    const clusterIds = Array.from(
      new Set((sent ?? []).map((r) => r.cluster_id).filter((c): c is string => Boolean(c))),
    );

    const idSet = new Set(data.ids);
    const cascadedClusters: Array<{ cluster_id: string; question_ids: string[] }> = [];
    if (clusterIds.length > 0) {
      const { data: siblings } = await supabaseAdmin
        .from("questions")
        .select("id, cluster_id")
        .in("cluster_id", clusterIds);
      for (const cid of clusterIds) {
        const ids = (siblings ?? []).filter((s) => s.cluster_id === cid).map((s) => s.id);
        ids.forEach((id) => idSet.add(id));
        cascadedClusters.push({ cluster_id: cid, question_ids: ids });
      }
    }
    const targetIds = Array.from(idSet);

    // Salvaguarda: rechazada/retirada → borrador exige una corrección posterior
    // al último comentario del revisor, salvo confirmación explícita (force).
    if (data.status === "draft" && !data.force) {
      const { data: current, error: curErr } = await supabaseAdmin
        .from("questions")
        .select("id, question_number, status, correction_at")
        .in("id", targetIds);
      if (curErr) throw new Error(curErr.message);
      const outIds = (current ?? [])
        .filter((r) => r.status === "rejected" || r.status === "retired")
        .map((r) => r.id);
      if (outIds.length > 0) {
        const { data: rej, error: rejErr } = await supabaseAdmin
          .from("question_rejections")
          .select("question_id, rejected_at")
          .in("question_id", outIds);
        if (rejErr) throw new Error(rejErr.message);
        const lastRejection = new Map<string, string>();
        for (const r of rej ?? []) {
          if (!r.question_id) continue;
          const prev = lastRejection.get(r.question_id);
          if (!prev || r.rejected_at > prev) lastRejection.set(r.question_id, r.rejected_at);
        }
        const unfixed = (current ?? []).filter((r) => {
          if (!outIds.includes(r.id)) return false;
          const last = lastRejection.get(r.id);
          if (!last) return false;
          return !r.correction_at || new Date(r.correction_at) <= new Date(last);
        });
        if (unfixed.length > 0) {
          return {
            updated: 0,
            cascaded: false,
            cascaded_clusters: [] as Array<{ cluster_id: string; question_ids: string[] }>,
            requiresConfirmation: true as const,
            unfixed_numbers: unfixed.map((u) => u.question_number),
            message:
              unfixed.length === 1
                ? "Esta pregunta no tiene una corrección registrada posterior al último comentario del revisor. ¿Confirmas que quieres pasarla a borrador de todas formas?"
                : `Las preguntas ${unfixed.map((u) => `#${u.question_number}`).join(", ")} no tienen una corrección registrada posterior al último comentario del revisor. ¿Confirmas que quieres pasarlas a borrador de todas formas?`,
          };
        }
      }
    }

    // Snapshot previo: necesario para registrar el motivo del rechazo.
    let snapshots: Array<{
      id: string;
      question_number: number;
      task_id: string;
      format: string;
      stem: string;
    }> = [];
    if ((data.status === "rejected" || data.status === "retired") && data.reason) {
      const { data: rows } = await supabaseAdmin
        .from("questions")
        .select("id, question_number, task_id, format, stem")
        .in("id", targetIds);
      snapshots = rows ?? [];
    }

    const { data: rows, error } = await supabaseAdmin
      .from("questions")
      .update({ status: data.status })
      .in("id", targetIds)
      .select("id");

    if (error) throw new Error(error.message);

    if (snapshots.length > 0 && data.reason) {
      const reason = data.reason;
      await supabaseAdmin.from("question_rejections").insert(
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

    return {
      updated: rows?.length ?? 0,
      cascaded: cascadedClusters.length > 0,
      cascaded_clusters: cascadedClusters,
    };
  });

/**
 * Devuelve las preguntas de un caso (case cluster) ordenadas por número, junto
 * con el escenario compartido, para poder repasarlas antes de confirmar una
 * acción que afecta al caso completo.
 */
export const listClusterQuestionsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { cluster_id: string }) =>
    z.object({ cluster_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: rows, error }, { data: cluster }] = await Promise.all([
      supabaseAdmin
        .from("questions")
        .select("id, question_number, stem, status, cluster_id")
        .eq("cluster_id", data.cluster_id)
        .order("question_number", { ascending: true }),
      supabaseAdmin
        .from("case_clusters")
        .select("title, scenario_text")
        .eq("id", data.cluster_id)
        .maybeSingle(),
    ]);
    if (error) throw new Error(error.message);

    return {
      cluster_id: data.cluster_id,
      cluster_title: cluster?.title ?? null,
      cluster_scenario: cluster?.scenario_text ?? null,
      questions: rows ?? [],
    };
  });


/**
 * Lista las preguntas rechazadas o retiradas junto al comentario del revisor,
 * para poder corregir erratas de texto sin salir del panel.
 */
export const listReviewedOutQuestionsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status: string }) =>
    z.object({ status: z.enum(["rejected", "retired", "all"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const statuses: Array<"rejected" | "retired"> =
      data.status === "all" ? ["rejected", "retired"] : [data.status];

    const { data: rows, error } = await supabaseAdmin
      .from("questions")
      .select(
        "id, question_number, stem, options, correct_answer, explanation, status, format, item_type, difficulty, task_id, updated_at, correction_count, correction_status, correction_notes, correction_at",
      )
      .in("status", statuses)
      .order("question_number", { ascending: true })
      .limit(2000);
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.id);
    const taskIds = Array.from(new Set((rows ?? []).map((r) => r.task_id)));

    const [{ data: rejections }, { data: tasks }] = await Promise.all([
      ids.length
        ? supabaseAdmin
            .from("question_rejections")
            .select("question_id, reason, rejected_at")
            .in("question_id", ids)
            .order("rejected_at", { ascending: false })
        : Promise.resolve({ data: [] as Array<{ question_id: string | null; reason: string; rejected_at: string }> }),
      taskIds.length
        ? supabaseAdmin
            .from("eco_tasks")
            .select("id, title, task_number")
            .in("id", taskIds)
        : Promise.resolve({ data: [] as Array<{ id: string; title: string; task_number: number }> }),
    ]);

    const historyById = new Map<string, { reason: string; rejected_at: string }[]>();
    for (const r of [...(rejections ?? [])].sort((a, b) => (a.rejected_at < b.rejected_at ? 1 : -1))) {
      if (!r.question_id) continue;
      const arr = historyById.get(r.question_id) ?? [];
      arr.push({ reason: r.reason, rejected_at: r.rejected_at });
      historyById.set(r.question_id, arr);
    }
    const taskById = new Map((tasks ?? []).map((t) => [t.id, t]));

    return (rows ?? []).map((r) => {
      const task = taskById.get(r.task_id);
      const history = historyById.get(r.id) ?? [];
      return {
        ...r,
        task_title: task ? `${task.task_number}. ${task.title}` : null,
        latest_rejection_reason: history[0]?.reason ?? null,
        latest_rejection_at: history[0]?.rejected_at ?? null,
        rejection_history: history,
      };
    });
  });

/**
 * Corrige los textos de una pregunta (enunciado, opciones y explicación) sin
 * alterar su estructura: los identificadores de opción y la respuesta correcta
 * se mantienen intactos.
 */
export const updateQuestionTextFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      stem: string;
      explanation: string;
      options: Array<{ id: string; text: string }>;
    }) =>
      z
        .object({
          id: z.string().uuid(),
          stem: z.string().trim().min(1).max(6000),
          explanation: z.string().trim().min(1).max(6000),
          options: z
            .array(z.object({ id: z.string().min(1), text: z.string().trim().min(1).max(2000) }))
            .max(20),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: current, error: readError } = await supabaseAdmin
      .from("questions")
      .select("options")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!current) throw new Error("Pregunta no encontrada");

    const currentOptions = Array.isArray(current.options)
      ? (current.options as Array<Record<string, unknown>>)
      : [];
    const textById = new Map(data.options.map((o) => [o.id, o.text]));
    const nextOptions = currentOptions.map((opt, i) => {
      const id = String(opt.id ?? opt.key ?? String.fromCharCode(65 + i));
      const text = textById.get(id);
      if (text === undefined) return opt;
      return "text" in opt || !("label" in opt) ? { ...opt, text } : { ...opt, label: text };
    });

    const { error } = await supabaseAdmin
      .from("questions")
      .update({
        stem: data.stem,
        explanation: data.explanation,
        options: nextOptions as unknown as never,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    return { ok: true };
  });

