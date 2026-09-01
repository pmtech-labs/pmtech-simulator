import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DOMAIN_LEVELS, getDomainLevel, type DomainLevelCode } from "@/lib/domainLevel";
import { cn } from "@/lib/utils";

const TOKEN_BG: Record<DomainLevelCode, string> = {
  solid: "bg-success/15 text-success",
  progress: "bg-warning/15 text-warning",
  reinforce: "bg-accent/15 text-accent-foreground",
  critical: "bg-destructive/15 text-destructive",
};

const TOKEN_DOT: Record<DomainLevelCode, string> = {
  solid: "bg-success",
  progress: "bg-warning",
  reinforce: "bg-accent",
  critical: "bg-destructive",
};

interface DomainLevelBadgeProps {
  pct: number;
  className?: string;
}

/** Muestra el nivel actual de dominio junto al porcentaje. */
export function DomainLevelBadge({ pct, className }: DomainLevelBadgeProps) {
  const level = getDomainLevel(pct);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        TOKEN_BG[level.code],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", TOKEN_DOT[level.code])} />
      {level.label}
    </span>
  );
}

interface DomainMasteryLegendProps {
  triggerClassName?: string;
}

/** Leyenda accesible de niveles de dominio. Funciona en escritorio y móvil. */
export function DomainMasteryLegend({ triggerClassName }: DomainMasteryLegendProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-auto gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground",
            triggerClassName,
          )}
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          Niveles de dominio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>¿Qué significa cada % de dominio?</DialogTitle>
          <DialogDescription>
            Clasificación sencilla, sin jerga de PMI®, para que sepas en qué área debes
            reforzar.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          {DOMAIN_LEVELS.map((level) => (
            <div
              key={level.code}
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3"
            >
              <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", TOKEN_DOT[level.code])} />
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {level.label}
                  <span className="num text-[11px] font-normal text-muted-foreground">
                    {level.min}-{level.max}%
                  </span>
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {level.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          El % se calcula a partir de tus respuestas correctas en cada dominio del ECO 2026.
        </p>
      </DialogContent>
    </Dialog>
  );
}
