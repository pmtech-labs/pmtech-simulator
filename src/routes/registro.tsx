import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, GraduationCap, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

import {
  provisionFreeLicense,
  signUpCandidate,
  subscribeNewsletterOptIn,
} from "@/services/authService";

interface RegistroSearch {
  plan?: string;
}

export const Route = createFileRoute("/registro")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): RegistroSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Crear cuenta · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Crea tu cuenta gratuita en el simulador PMP en español y descubre por qué fallas, no solo cuánto.",
      },
      { property: "og:title", content: "Crear cuenta · Simulador PMP" },
      { property: "og:description", content: "Regístrate y empieza tu diagnóstico PMP ECO 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const { plan } = Route.useSearch();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
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
    try {
      const { needsEmailConfirmation } = await signUpCandidate({
        email: email.trim(),
        password,
        fullName: fullName.trim() || undefined,
      });
      if (needsEmailConfirmation) {
        setPendingEmail(true);
        return;
      }
      // Plan gratuito real: se aprovisiona al instante (idempotente en el backend).
      try {
        await provisionFreeLicense();
      } catch {
        setWarning(
          "Tu cuenta se ha creado, pero no hemos podido activar el plan gratuito automáticamente. Puedes seguir e intentarlo más tarde o escribirnos.",
        );
      }
      const paidPlan = plan === "basica_3m" || plan === "premium_6m";
      navigate({ to: paidPlan ? `/checkout?plan=${plan}` : "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No hemos podido crear tu cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-semibold">PMTech Simulator</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          {pendingEmail ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-7 w-7 text-success" />
              <h1 className="mt-3 text-lg font-semibold">Confirma tu correo</h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Te hemos enviado un enlace de confirmación a <strong>{email}</strong>. Cuando lo
                abras podrás iniciar sesión y continuar con tu preparación.
              </p>
              <Link
                to="/login"
                search={plan ? { plan } : {}}
                className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold">Crear cuenta</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan === "basica_3m" || plan === "premium_6m"
                  ? "Regístrate para continuar con la contratación de tu licencia."
                  : "Plan gratuito real: práctica ilimitada sin cronómetro y un simulacro completo de regalo."}
              </p>

              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <div>
                  <label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                    Nombre y apellidos
                  </label>
                  <input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                    Contraseña (mínimo 8 caracteres)
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="text-xs font-medium text-muted-foreground">
                    Repite la contraseña
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>

                {warning && (
                  <p className="rounded-lg border border-accent/40 bg-warning-soft p-2.5 text-xs text-accent-foreground">
                    {warning}
                  </p>
                )}

                {error && (
                  <p className="rounded-lg border border-destructive/40 bg-danger-soft p-2.5 text-xs text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Crear cuenta
                </button>
              </form>

              <p className="mt-4 border-t border-border pt-4 text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  search={plan ? { plan } : {}}
                  className="font-semibold text-foreground hover:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
