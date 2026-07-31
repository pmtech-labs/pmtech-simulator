import { createFileRoute } from "@tanstack/react-router";

/**
 * Ruta temporal de un solo uso: crea (o confirma) el usuario administrador
 * sin necesidad de correo de verificación. Protegida por BOOTSTRAP_ADMIN_TOKEN.
 * Debe eliminarse cuando el envío de correos esté operativo.
 */
export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-bootstrap-token");
        const expected = process.env.BOOTSTRAP_ADMIN_TOKEN;
        if (!expected || token !== expected) {
          return new Response("No autorizado", { status: 401 });
        }

        let payload: { email?: string; password?: string };
        try {
          payload = (await request.json()) as { email?: string; password?: string };
        } catch {
          return Response.json({ error: "JSON inválido" }, { status: 400 });
        }

        const email = payload.email?.trim().toLowerCase();
        const password = payload.password;
        if (!email || !password || password.length < 10) {
          return Response.json({ error: "email y password (min. 10) requeridos" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let userId: string | null = null;
        const created = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (created.data.user) {
          userId = created.data.user.id;
        } else {
          const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          const existing = list.data.users.find((u) => u.email?.toLowerCase() === email);
          if (!existing) {
            return Response.json(
              { error: created.error?.message ?? "No se pudo crear el usuario" },
              { status: 400 },
            );
          }
          userId = existing.id;
          const updated = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
          });
          if (updated.error) {
            return Response.json({ error: updated.error.message }, { status: 400 });
          }
        }

        const { error: adminError } = await supabaseAdmin
          .from("admin_users")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id" });
        if (adminError) {
          return Response.json({ error: adminError.message }, { status: 400 });
        }

        return Response.json({ ok: true, user_id: userId, email });
      },
    },
  },
});
