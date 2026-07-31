import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ECO_DOMAIN_LABELS,
  ECO_DOMAIN_TOKENS,
  type LearningPathUnit,
} from "@/services/learningPathService";

interface Props {
  unit: LearningPathUnit | null;
  onClose: () => void;
}

export function UnitMasteryDialog({ unit, onClose }: Props) {
  useEffect(() => {
    if (!unit) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unit, onClose]);

  if (!unit) return null;

  const tasks = [...unit.tasks].sort((a, b) => (a.taskNumber ?? 0) - (b.taskNumber ?? 0));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Desglose por tarea ECO de ${unit.title}`}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-panel sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="num text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Lección {unit.sequence}
            </p>
            <h2 className="text-base font-semibold leading-snug">{unit.title}</h2>
            <p className="num mt-1 text-xs text-muted-foreground">
              {tasks.length} tarea{tasks.length === 1 ? "" : "s"} ECO · dominio medio {unit.masteryPct ?? 0}%
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!tasks.length ? (
          <p className="mt-5 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            Esta unidad no tiene tareas ECO mapeadas: es contenido de orientación y no se evalúa.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {tasks.map((t) => {
              const pct = t.masteryPct ?? 0;
              const token = ECO_DOMAIN_TOKENS[t.domain ?? "process"];
              return (
                <li key={t.id} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {t.domain && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
                        style={{ background: `var(--${token})` }}
                      >
                        {ECO_DOMAIN_LABELS[t.domain]}
                      </span>
                    )}
                    {t.taskNumber != null && (
                      <span className="num text-[11px] font-semibold text-muted-foreground">
                        Tarea {t.taskNumber}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-medium leading-snug">{t.title}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-[width]"
                        style={{ width: `${pct}%`, background: `var(--${token})` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "num w-10 text-right text-xs font-semibold",
                        t.masteryPct == null && "text-muted-foreground",
                      )}
                    >
                      {t.masteryPct == null ? "—" : `${pct}%`}
                    </span>
                  </div>
                  <p className="num mt-1.5 text-[11px] text-muted-foreground">
                    {t.attempts > 0
                      ? `${t.correct} de ${t.attempts} respuestas correctas`
                      : "Sin intentos registrados todavía"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
