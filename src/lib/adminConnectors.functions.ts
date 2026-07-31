import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Proxy servidor→servidor para actualizar un conector LLM.
 * La Edge Function `admin_connectors` acepta PATCH, pero no lo anuncia en la
 * respuesta CORS de preflight, así que el navegador no puede llamarla directamente.
 */
const patchSchema = z.object({
  id: z.string().uuid(),
  is_default: z.boolean().optional(),
  name: z.string().min(1).optional(),
  model_id: z.string().min(1).optional(),
  api_base_url: z.string().optional(),
  api_key: z.string().min(1).optional(),
});

export type PatchConnectorInput = z.infer<typeof patchSchema>;

export const patchConnectorFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PatchConnectorInput) => patchSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado");

    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const token = (getRequest()?.headers.get("authorization") ?? "").replace("Bearer ", "");

    const res = await fetch(`${url}/functions/v1/admin_connectors`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(detail || "No se ha podido actualizar el conector");
    }
    return { ok: true };
  });

export const setDefaultConnectorFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado");

    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const token = (getRequest()?.headers.get("authorization") ?? "").replace("Bearer ", "");

    const res = await fetch(`${url}/functions/v1/admin_connectors`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: data.id, is_default: true }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(detail || "No se ha podido marcar el conector como predeterminado");
    }
    return { ok: true };
  });
