import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Estadísticas del panel de administración servidas desde el propio servidor
 * de la app (no desde la Edge Function `admin_stats`, que devolvía 403).
 * La comprobación de rol admin se hace con el JWT del usuario mediante `is_admin`.
 */
export const getAdminStatsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { view: string; limit?: number }) =>
    z
      .object({
        view: z.enum([
          "coverage",
          "hardest_questions",
          "most_used_questions",
          "exams",
          "tags",
        ]),
        limit: z.number().int().positive().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase;

    const { data: isAdmin, error: rpcError } = await db.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado (requiere rol admin)");

    const limit = data.limit ?? 20;

    if (data.view === "coverage") {
      const { data: rows, error } = await db
        .from("v_task_coverage")
        .select(
          "domain_code, domain_name, domain_weight_pct, task_id, task_number, task_title, published_count, draft_count, in_review_count",
        )
        .order("domain_sort_order")
        .order("task_number");
      if (error) throw new Error(error.message);
      return rows ?? [];
    }

    if (data.view === "tags") {
      const { data: rows, error } = await db
        .from("v_question_stats")
        .select("status, tag_codes")
        .in("status", ["draft", "published", "retired", "rejected"]);
      if (error) throw new Error(error.message);
      return rows ?? [];
    }

    if (data.view === "exams") {
      const { data: rows, error } = await db.rpc("admin_exam_stats");
      if (error) throw new Error(error.message);
      return rows ?? [];
    }

    const columns =
      "question_id, stem, domain_name, task_title, status, success_rate_pct, times_answered, times_used_in_exams, process_group, performance_domain, focus_tags, tag_codes";

    if (data.view === "hardest_questions") {
      const { data: rows, error } = await db
        .from("v_question_stats")
        .select(columns)
        .gt("times_answered", 0)
        .order("success_rate_pct", { ascending: true })
        .limit(limit);
      if (error) throw new Error(error.message);
      return rows ?? [];
    }

    const { data: rows, error } = await db
      .from("v_question_stats")
      .select(columns)
      .order("times_used_in_exams", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
