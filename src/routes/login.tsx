import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { signInCandidate } from "@/services/authService";

interface LoginSearch {
  redirect?: string;
  plan?: string;
}

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Iniciar sesión · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Accede a tu cuenta del simulador PMP en español para continuar con tus simulaciones y tu diagnóstico de errores.",
      },
      { property: "og:title", content: "Iniciar sesión · Simulador PMP" },
      { property: "og:description", content: "Accede a tu preparación PMP calibrada al ECO 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { plan, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, loading: sessionLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destination = plan ? `/checkout?plan=${plan}` : (redirect ?? "/dashboard");

  useEffect(() => {
    if (!sessionLoading && isAuthenticated) {
      navigate({ to: destination, replace: true });
    }
  }, [sessionLoading, isAuthenticated, navigate, destination]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInCandidate({ email: email.trim(), password });
      navigate({ to: destination, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No hemos podido iniciar sesión.");
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
          <span className="font-display text-base font-semibold">Top PM Simulator</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-lg font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accede para continuar con tu preparación PMP.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
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
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Entrar
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-muted-foreground">
              ¿Aún no tienes cuenta?{" "}
              <Link
                to="/registro"
                search={plan ? { plan } : {}}
                className="font-semibold text-foreground hover:underline"
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
