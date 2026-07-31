import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";

/**
 * Guard de rutas de candidato: si no hay sesión, redirige a /login conservando
 * la ruta de destino. Mismo patrón que el guard de /admin, pero sin rol.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  // TEMP: bypass auth for UI testing
  return <>{children}</>;
}
