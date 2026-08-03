import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import type { PlanCode } from "@/services/checkoutService";

/**
 * CTA de plan: si no hay sesión lleva al registro conservando el plan elegido;
 * si ya hay sesión, va directo al resumen de contratación.
 */
export function PlanCta({
  planCode,
  label,
  className,
}: {
  planCode: PlanCode;
  label: string;
  className: string;
}) {
  const { isAuthenticated } = useAuth();

  return (
    <Link
      to={isAuthenticated ? "/checkout" : "/registro"}
      search={{ plan: planCode }}
      className={className}
    >
      {label} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
