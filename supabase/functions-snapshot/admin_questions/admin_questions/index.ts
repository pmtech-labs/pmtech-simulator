// Edge Function: admin_questions
//
// Esquema de estados (ago 2026): el enum de la columna `status` pasó de 3 a 4
// valores -- draft/published/rejected/retired -- tras una corrección posterior del
// PO sobre un primer intento que reutilizaba 'retired' para dos conceptos distintos:
//   - "Rechazar" en la UI = draft -> rejected (excluir un borrador que no cumple
//     calidad, CON motivo obligatorio -- se guarda en question_rejections para que
//     los generadores aprendan de ese motivo en futuras generaciones de la misma
//     tarea, ver buildRejectionContext en _shared/rejectionContext.ts).
//   - "Retirar" en la UI = published -> retired (sacar del catálogo activo de examen
//     una pregunta que SÍ llegó a publicarse, sin motivo obligatorio -- no es un
//     fallo de calidad del contenido en sí, es una decisión de catálogo).
//   - "Volver a borrador" = cualquier estado -> draft, sin motivo, plenamente
//     reversible (la pregunta puede reeditarse y volver a pasar por el flujo).
//
// REGLA DE BLOQUE DE CASO (añadida ago 2026, petición explícita del PO): las 5
// preguntas de un mismo caso (mismo cluster_id) se sirven SIEMPRE juntas en examen,
// compartiendo un único scenario_text. Por eso NUNCA puede quedar un caso con
// algunas preguntas publicadas y otras en borrador/rechazadas/retiradas -- eso
// rompería la coherencia del caso al montar un examen. En consecuencia, cualquier
// cambio de status sobre una pregunta con cluster_id se expande automáticamente
// aquí, en el backend, a las 5 preguntas del cluster -- esto es totalmente
// independiente de lo que haga o deje de hacer la UI (que además debe avisar y dejar revisar las
// 5 antes de confirmar, pero la garantía de integridad real vive aquí).
//
// GET    -> lista preguntas para la cola de revisión, con filtros (status, domain_code, task_id,
//           approach, job_id, min_times_used, max_success_rate, cluster_id) y paginación. Usa
//           v_question_stats, que ya trae el contenido completo + estadísticas agregadas en una
//           sola vista (incluye cluster_id y cluster_scenario para poder mostrar el caso completo
//           antes de aprobar/rechazar/retirar una de sus preguntas).
// PATCH  -> cambia el status de una o varias preguntas entre los 4 valores válidos. Si alguna de
//           las preguntas solicitadas pertenece a un caso, la actualización se expande a las 5
//           preguntas de ese caso automáticamente (ver arriba). La respuesta indica qué clusters
//           se expandieron y qué ids se vieron afectados, para que la UI pueda informar al
//           revisor de qué ha pasado realmente.
//           Simplificado en su día de 5 a 3 estados (in_review y approved no tenían
//           ninguna lógica funcional distinta de draft/published, eran papeleo sin
//           efecto real -- se quitaron), y ampliado después a 4 al separar
//           "rechazar" de "retirar" (ver arriba).
// DELETE -> borrado físico, permitido ÚNICAMENTE si la pregunta nunca ha sido usada en
//           ningún examen (exam_items). Si ya se usó, se fuerza a 'retired' en su lugar
//           (cuestión de integridad de datos, no de calidad -- por eso usa 'retired' y
//           no 'rejected') y se informa por qué, para no romper la trazabilidad de
//           exámenes ya realizados. El borrado físico NO cascada al resto del cluster
//           (es una operación de limpieza puntual, no una decisión editorial de caso).

import { getSupabaseAdmin, getAuthenticatedUser } from "../_shared/supabaseAdmin.ts";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface UpdateStatusBody {
  question_ids: string[];
  status: "draft" | "published" | "rejected" | "retired";
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getAuthenticatedUser(req);
  if (!user) return errorResponse("No autenticado", 401);
  if (!(await requireAdmin(user.id))) return errorResponse("No autorizado (requiere rol admin)", 403);

  const admin = getSupabaseAdmin();

  if (req.method === "GET") {
    const url = new URL(req.url);
    const params = url.searchParams;
    const limit = Number(params.get("limit") ?? params.get("page_size") ?? 20);
    const offset = Number(params.get("offset") ?? (Number(params.get("page") ?? 1) - 1) * limit);

    let query = admin
      .from("v_question_stats")
      .select("*", { count: "exact" });

    const statusParam = params.get("status");
    if (statusParam) query = query.in("status", statusParam.split(",").filter(Boolean));

    const domainCode = params.get("domain_code");
    if (domainCode) query = query.eq("domain_code", domainCode);

    const taskId = params.get("task_id");
    if (taskId) query = query.eq("task_id", taskId);

    const approach = params.get("approach");
    if (approach) query = query.eq("approach", approach);

    const processGroup = params.get("process_group");
    if (processGroup) query = query.eq("process_group", processGroup);

    const performanceDomain = params.get("performance_domain");
    if (performanceDomain) query = query.eq("performance_domain", performanceDomain);

    const tagCodesParam = params.get("tag_code");
    if (tagCodesParam) {
      const codes = tagCodesParam.split(",").map((c) => c.trim()).filter(Boolean);
      if (codes.length > 0) query = query.contains("tag_codes", codes);
    }

    const jobId = params.get("job_id");
    if (jobId) query = query.eq("generation_job_id", jobId);

    const clusterId = params.get("cluster_id");
    if (clusterId) query = query.eq("cluster_id", clusterId);

    const minTimesUsed = params.get("min_times_used");
    if (minTimesUsed) query = query.gte("times_used_in_exams", Number(minTimesUsed));

    const maxSuccessRate = params.get("max_success_rate");
    if (maxSuccessRate) query = query.lte("success_rate_pct", Number(maxSuccessRate));

    const orderColumn = clusterId ? "question_number" : "created_at";
    const ascending = clusterId ? true : false;

    const { data, error, count } = await query
      .order(orderColumn, { ascending })
      .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 500);

    const rows = (data ?? []).map((r: any) => ({ ...r, id: r.question_id }));
    return jsonResponse({ data: rows, total: count ?? rows.length });
  }

  if (req.method === "PATCH") {
    const body: UpdateStatusBody = await req.json();
    if (!body.question_ids?.length || !body.status) {
      return errorResponse("Faltan campos requeridos (question_ids, status)", 400);
    }

    const { data: requested, error: lookupErr } = await admin
      .from("questions")
      .select("id, cluster_id")
      .in("id", body.question_ids);

    if (lookupErr) return errorResponse(lookupErr.message, 500);
    if (!requested?.length) return errorResponse("Ninguna de las preguntas indicadas existe", 404);

    const clusterIds = [...new Set(requested.map((q: any) => q.cluster_id).filter(Boolean))] as string[];

    let finalIds: string[] = [...body.question_ids];
    const cascadedClusters: { cluster_id: string; question_ids: string[] }[] = [];

    if (clusterIds.length > 0) {
      const { data: siblings, error: siblingsErr } = await admin
        .from("questions")
        .select("id, cluster_id")
        .in("cluster_id", clusterIds);

      if (siblingsErr) return errorResponse(siblingsErr.message, 500);

      const idSet = new Set(finalIds);
      for (const cid of clusterIds) {
        const members = (siblings ?? [])
          .filter((s: any) => s.cluster_id === cid)
          .map((s: any) => s.id as string);
        cascadedClusters.push({ cluster_id: cid, question_ids: members });
        members.forEach((id) => idSet.add(id));
      }
      finalIds = [...idSet];
    }

    const updatePayload: Record<string, unknown> = { status: body.status };
    if (body.status === "published") {
      updatePayload.reviewed_by = user.id;
      updatePayload.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await admin
      .from("questions")
      .update(updatePayload)
      .in("id", finalIds)
      .select("id, status, cluster_id, question_number");

    if (error) return errorResponse(error.message, 500);

    if (body.status === "rejected" && body.reason?.trim()) {
      const { data: rejectedQuestions } = await admin
        .from("questions")
        .select("id, question_number, task_id, format, stem")
        .in("id", finalIds);

      if (rejectedQuestions?.length) {
        const rejectionRows = rejectedQuestions.map((q: any) => ({
          question_id: q.id,
          question_number: q.question_number,
          task_id: q.task_id,
          format: q.format,
          stem_snapshot: q.stem,
          reason: body.reason!.trim(),
          rejected_by: user.id,
        }));
        const { error: rejectionErr } = await admin.from("question_rejections").insert(rejectionRows);
        if (rejectionErr) return errorResponse(rejectionErr.message, 500);
      }
    }

    return jsonResponse({
      updated: data,
      cascaded: cascadedClusters.length > 0,
      cascaded_clusters: cascadedClusters,
    });
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const questionId = url.searchParams.get("id");
    if (!questionId) return errorResponse("Falta el parámetro id", 400);

    const { count, error: usageErr } = await admin
      .from("exam_items")
      .select("id", { count: "exact", head: true })
      .eq("question_id", questionId);

    if (usageErr) return errorResponse(usageErr.message, 500);

    if (count && count > 0) {
      const { error: retireErr } = await admin
        .from("questions")
        .update({ status: "retired" })
        .eq("id", questionId);
      if (retireErr) return errorResponse(retireErr.message, 500);
      return jsonResponse({
        deleted: false,
        retired: true,
        reason: `La pregunta se usó en ${count} examen(es); se marcó como 'retired' en lugar de borrarla, para no romper el histórico de resultados.`,
      });
    }

    const { error: deleteErr } = await admin.from("questions").delete().eq("id", questionId);
    if (deleteErr) return errorResponse(deleteErr.message, 500);
    return jsonResponse({ deleted: true, retired: false });
  }

  return errorResponse("Método no soportado", 405);
});
