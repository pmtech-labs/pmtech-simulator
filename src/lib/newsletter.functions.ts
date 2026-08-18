import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const eventSchema = z.object({
  eventType: z.enum(["view", "interaction", "subscribe"]),
  source: z.string().trim().max(60).optional(),
});

export type NewsletterStats = {
  subscribers: number;
  subscribers7d: number;
  subscribers30d: number;
  views: number;
  interactions: number;
  subscribeEvents: number;
  conversionPct: number;
  latest: Array<{ email: string; fullName: string | null; createdAt: string }>;
};

/** Registra un evento anónimo del bloque del boletín (sin datos personales). */
export const trackNewsletterEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => eventSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("newsletter_events").insert({
      event_type: data.eventType,
      source: data.source || "landing_boletin",
    });
    return { ok: true };
  });

/** Métricas del boletín para el panel de administración. */
export const getNewsletterStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NewsletterStats> => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (!isAdmin) throw new Error("No autorizado");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = Date.now();
    const iso = (days: number) => new Date(now - days * 86_400_000).toISOString();

    const count = async (
      table: "newsletter_subscribers" | "newsletter_events",
      apply: (q: any) => any,
    ) => {
      const { count: c } = await apply(
        supabaseAdmin.from(table).select("id", { count: "exact", head: true }),
      );
      return c ?? 0;
    };

    const [subscribers, subscribers7d, subscribers30d, views, interactions, subscribeEvents] =
      await Promise.all([
        count("newsletter_subscribers", (q) => q.eq("status", "subscribed")),
        count("newsletter_subscribers", (q) =>
          q.eq("status", "subscribed").gte("created_at", iso(7)),
        ),
        count("newsletter_subscribers", (q) =>
          q.eq("status", "subscribed").gte("created_at", iso(30)),
        ),
        count("newsletter_events", (q) => q.eq("event_type", "view")),
        count("newsletter_events", (q) => q.eq("event_type", "interaction")),
        count("newsletter_events", (q) => q.eq("event_type", "subscribe")),
      ]);

    const { data: latestRows } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      subscribers,
      subscribers7d,
      subscribers30d,
      views,
      interactions,
      subscribeEvents,
      conversionPct: interactions > 0 ? Math.round((subscribeEvents / interactions) * 1000) / 10 : 0,
      latest: (latestRows ?? []).map((r) => ({
        email: r.email,
        fullName: r.full_name,
        createdAt: r.created_at,
      })),
    };
  });
