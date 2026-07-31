import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const trainingLeadSchema = z.object({
  fullName: z.string().trim().min(2, "Indica tu nombre").max(120),
  email: z.string().trim().email("Email no válido").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  trainingInterest: z.enum(["35_horas", "bootcamp", "in_company", "no_especificado"]),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

const newsletterSchema = z.object({
  email: z.string().trim().email("Email no válido").max(255),
  fullName: z.string().trim().max(120).optional().or(z.literal("")),
});

export const submitTrainingLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => trainingLeadSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("training_leads").insert({
      full_name: data.fullName,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      company: data.company || null,
      training_interest: data.trainingInterest,
      message: data.message || null,
      source: "landing_formacion",
    });
    if (error) throw new Error("No se ha podido registrar tu solicitud. Inténtalo de nuevo.");
    return { ok: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => newsletterSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert(
      {
        email: data.email.toLowerCase(),
        full_name: data.fullName || null,
        source: "landing_boletin",
        status: "subscribed",
        unsubscribed_at: null,
      },
      { onConflict: "email" },
    );
    if (error) throw new Error("No se ha podido completar la suscripción. Inténtalo de nuevo.");
    return { ok: true };
  });
