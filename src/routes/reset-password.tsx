import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nueva contraseña · Simulador PMP" },
      {
        name: "description",
        content: "Define una nueva contraseña para tu cuenta del simulador PMP.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Nueva contraseña · Simulador PMP" },
      { property: "og:description", content: "Define una nueva contraseña de acceso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) {
        setHasSession(true);
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.session));
      setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
          }
          if (password !== confirm) {
            setError("Las contraseñas no coinciden.");
            return;
          }
          setLoading(true);
          const { error: updateError } = await supabase.auth.updateUser({ password });
          setPassword("");
          setConfirm("");
          setLoading(false);
          if (updateError) {
            setError("No se ha podido actualizar la contraseña. Solicita un enlace nuevo.");
            return;
          }
          toast.success("Contraseña actualizada correctamente.");
          navigate({ to: "/", replace: true });
        }}
        className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">Nueva contraseña</h1>
        </div>

        {!hasSession && (
          <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
            El enlace de recuperación puede haber caducado. Si el formulario falla, solicita uno
            nuevo desde “¿Olvidaste tu contraseña?”.
          </p>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="new-pass">
            Nueva contraseña
          </label>
          <input
            id="new-pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="confirm-pass">
            Repite la contraseña
          </label>
          <input
            id="confirm-pass"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}
