import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const importSchema = z.object({
  rows: z
    .array(
      z.object({
        email: z.string().trim().email().max(255),
        fullName: z.string().trim().max(120).optional().nullable(),
        status: z.enum(["subscribed", "unsubscribed"]).default("subscribed"),
        createdAt: z.string().trim().max(60).optional().nullable(),
      }),
    )
    .min(1)
    .max(5000),
});

export type ImportResult = {
  received: number;
  inserted: number;
  updated: number;
  unsubscribed: number;
};

/** Importa/mergea por email un CSV exportado de Substack (solo admin). */
export const importNewsletterCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => importSchema.parse(data))
  .handler(async ({ data, context }): Promise<ImportResult> => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (!isAdmin) throw new Error("No autorizado");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const byEmail = new Map<string, (typeof data.rows)[number]>();
    for (const row of data.rows) byEmail.set(row.email.toLowerCase(), row);
    const emails = [...byEmail.keys()];

    const { data: existingRows } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email")
      .in("email", emails);
    const existing = new Set((existingRows ?? []).map((r) => r.email.toLowerCase()));

    const payload = [...byEmail.entries()].map(([email, row]) => {
      const createdAt = row.createdAt ? new Date(row.createdAt) : null;
      const validDate = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : null;
      return {
        email,
        full_name: row.fullName || null,
        source: "substack_import",
        status: row.status,
        unsubscribed_at: row.status === "unsubscribed" ? new Date().toISOString() : null,
        synced_to_substack_at: new Date().toISOString(),
        ...(validDate && !existing.has(email) ? { created_at: validDate.toISOString() } : {}),
      };
    });

    for (let i = 0; i < payload.length; i += 500) {
      const { error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .upsert(payload.slice(i, i + 500), { onConflict: "email" });
      if (error) throw new Error("No se ha podido importar el CSV.");
    }

    return {
      received: payload.length,
      inserted: payload.filter((p) => !existing.has(p.email)).length,
      updated: payload.filter((p) => existing.has(p.email)).length,
      unsubscribed: payload.filter((p) => p.status === "unsubscribed").length,
    };
  });
