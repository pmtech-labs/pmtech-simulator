import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Loader2, MailCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Recuperar contraseña · Simulador PMP®" },
      {
        name: "description",
        content: "Solicita un enlace para restablecer la contraseña de tu cuenta del simulador PMP®.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Recuperar contraseña · Simulador PMP®" },
      {
        property: "og:description",
        content: "Solicita un enlace seguro para restablecer tu contraseña.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
        <div className="w-full max-w-sm space-y-3 rounded-xl border border-border bg-card p-6 text-center">
          <MailCheck className="mx-auto h-6 w-6 text-primary" />
          <h1 className="text-sm font-semibold">Revisa tu correo</h1>
          <p className="text-xs text-muted-foreground">
            Si el email existe, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link to="/" className="inline-block text-xs font-medium text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          setLoading(false);
          setSent(true);
        }}
        className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">¿Olvidaste tu contraseña?</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Introduce tu correo y te enviaremos un enlace para crear una nueva contraseña.
        </p>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="forgot-email">
            Correo electrónico
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Enviando…" : "Enviar enlace"}
        </button>
      </form>
    </div>
  );
}
