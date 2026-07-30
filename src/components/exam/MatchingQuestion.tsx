import { GripVertical, RotateCcw } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { MatchingPayload } from "@/types/exam";

export function MatchingQuestion({
  payload,
  value,
  disabled,
  reveal,
  onChange,
}: {
  payload: MatchingPayload;
  value: Record<string, string>;
  disabled?: boolean;
  reveal?: boolean;
  onChange: (next: Record<string, string>) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const usedRight = new Set(Object.values(value));
  const correctFor = (leftId: string) =>
    payload.correctPairs.find(([l]) => l === leftId)?.[1];

  const assign = (leftId: string, rightId: string) => {
    if (disabled) return;
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(value)) if (v !== rightId) next[k] = v;
    next[leftId] = rightId;
    onChange(next);
  };

  const rightLabel = (id?: string) => payload.right.find((r) => r.id === id)?.label;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Escenarios de riesgo
          </p>
          {payload.left.map((l, i) => {
            const assigned = value[l.id];
            const ok = reveal ? assigned === correctFor(l.id) : undefined;
            return (
              <div
                key={l.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(l.id);
                }}
                onDragLeave={() => setOver((p) => (p === l.id ? null : p))}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(null);
                  if (dragging) assign(l.id, dragging);
                  setDragging(null);
                }}
                className={cn(
                  "rounded-xl border bg-card p-3 transition-colors",
                  over === l.id ? "border-ring bg-secondary" : "border-border",
                  reveal && ok && "border-success bg-success-soft",
                  reveal && assigned && !ok && "border-destructive bg-danger-soft",
                )}
              >
                <div className="flex gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="min-w-0 text-sm leading-relaxed">{l.label}</p>
                </div>
                <div
                  className={cn(
                    "mt-2.5 rounded-lg border border-dashed px-3 py-2 text-xs",
                    assigned
                      ? "border-transparent bg-secondary font-medium text-secondary-foreground"
                      : "border-input text-muted-foreground",
                  )}
                >
                  {assigned ? rightLabel(assigned) : "Suelta aquí una respuesta"}
                </div>
                {reveal && !ok && (
                  <p className="mt-2 text-xs font-medium text-success">
                    Correcta: {rightLabel(correctFor(l.id))}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Respuestas disponibles
          </p>
          {payload.right.map((r) => {
            const used = usedRight.has(r.id);
            return (
              <div
                key={r.id}
                draggable={!disabled}
                onDragStart={() => setDragging(r.id)}
                onDragEnd={() => setDragging(null)}
                className={cn(
                  "flex cursor-grab items-start gap-2 rounded-xl border p-3 text-sm leading-relaxed transition-opacity active:cursor-grabbing",
                  used ? "border-dashed border-input bg-muted/50 text-muted-foreground" : "border-border bg-card",
                  dragging === r.id && "opacity-50",
                  disabled && "cursor-default",
                )}
              >
                <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">{r.label}</span>
              </div>
            );
          })}
          <p className="text-[11px] text-muted-foreground">
            Arrastra cada respuesta al escenario correspondiente. En móvil, pulsa una respuesta y
            después el escenario.
          </p>
          {!disabled && (
            <div className="flex flex-wrap gap-2">
              {payload.right.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setDragging(dragging === r.id ? null : r.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-[11px] font-medium lg:hidden",
                    dragging === r.id ? "border-ring bg-secondary" : "border-border",
                  )}
                >
                  {r.label.split(":")[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!disabled && Object.keys(value).length > 0 && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar emparejamientos
        </button>
      )}

      <div className="lg:hidden">
        {dragging && (
          <div className="rounded-lg border border-ring bg-secondary p-2 text-xs">
            Seleccionada: <strong>{rightLabel(dragging)}</strong>. Pulsa un escenario para asignarla.
          </div>
        )}
        <div className="mt-2 grid gap-2">
          {payload.left.map((l, i) => (
            <button
              key={l.id}
              type="button"
              disabled={!dragging || disabled}
              onClick={() => {
                if (dragging) assign(l.id, dragging);
                setDragging(null);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-left text-xs disabled:opacity-40"
            >
              Asignar al escenario {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
