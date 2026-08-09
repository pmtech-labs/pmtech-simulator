import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Proxy servidor→servidor para las acciones de gestión de usuarios.
 * La Edge Function `admin_users` acepta PATCH, pero el navegador no puede
 * llamarla directamente (el preflight CORS no anuncia PATCH).
 */
const patchSchema = z.object({
  user_id: z.string().uuid(),
  action: z.enum(["extend_license", "change_plan", "revoke_license", "toggle_admin"]),
  days: z.number().int().positive().max(3650).optional(),
  plan_code: z.string().min(1).optional(),
  make_admin: z.boolean().optional(),
});

export type PatchAdminUserInput = z.infer<typeof patchSchema>;

export const patchAdminUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PatchAdminUserInput) => patchSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("is_admin", {
      p_user_id: context.userId,
    });
    if (rpcError || !isAdmin) throw new Error("No autorizado (requiere rol admin)");

    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const token = (getRequest()?.headers.get("authorization") ?? "").replace("Bearer ", "");

    const res = await fetch(`${url}/functions/v1/admin_users`, {
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
      throw new Error(detail || "No se ha podido aplicar la acción");
    }
    return { ok: true };
  });
