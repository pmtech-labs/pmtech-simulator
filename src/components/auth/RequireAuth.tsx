import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { LoginButton } from "@/components/LoginButton";
import { useAuth } from "@/hooks/useAuth";

/**
 * Guard de rutas de candidato: si no hay sesión, redirige a /login conservando
 * la ruta de destino. Mismo patrón que el guard de /admin, pero sin rol.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login", search: { redirect: href }, replace: true });
    }
  }, [loading, isAuthenticated, navigate, href]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Comprobando tu sesión…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-base font-semibold">Necesitas iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accede con tu cuenta para continuar con tu preparación.
          </p>
          <LoginButton size="lg" className="mt-4" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
