import { Link } from "@tanstack/react-router";

import { LoginButton } from "@/components/LoginButton";
import { useAuth } from "@/hooks/useAuth";

/**
 * Sustituye al botón "Iniciar sesión" en las cabeceras públicas cuando ya hay
 * sesión activa -- muestra "Hola, {nombre}" enlazando al dashboard, en vez de
 * seguir invitando a iniciar sesión a alguien que ya está dentro. Mismo
 * fallback de nombre que userService.ts (full_name -> email -> "Candidato"),
 * para no duplicar esa lógica con un criterio distinto.
 */
export function AuthNavStatus({ className = "", onClick }: { className?: string; onClick?: () => void }) {
  const { user, loading, isAuthenticated } = useAuth();

  // Mientras se resuelve la sesión, no mostrar nada -- evita el parpadeo de
  // "Iniciar sesión" -> "Hola, X" en cada carga de página para alguien ya logueado.
  if (loading) return <div className={`h-9 w-24 ${className}`} aria-hidden="true" />;

  if (!isAuthenticated) {
    return <LoginButton className={className} onClick={onClick} />;
  }

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Candidato";
  const firstName = fullName.split(" ")[0];

  return (
    <Link
      to="/dashboard"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:text-primary hover:underline ${className}`}
    >
      Hola, {firstName}
    </Link>
  );
}
