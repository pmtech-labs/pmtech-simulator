import { Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Accesos rápidos al tutorial de examen y a las instrucciones, para que el
 * candidato resuelva dudas antes de empezar sin abandonar la pantalla.
 */
export function HelpLinks({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Link to="/tutorial-examen" onClick={onNavigate} className={base}>
        <GraduationCap className="h-3.5 w-3.5" /> Ver tutorial
      </Link>
      <Link to="/instrucciones" onClick={onNavigate} className={base}>
        <BookOpen className="h-3.5 w-3.5" /> Ver instrucciones
      </Link>
    </div>
  );
}
