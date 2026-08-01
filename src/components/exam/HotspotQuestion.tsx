import { cn } from "@/lib/utils";
import type { HotspotPayload } from "@/types/exam";

/** Diagrama SVG inline con zonas clicables (formato hotspot). */
export function HotspotQuestion({
  payload,
  selected,
  disabled,
  correctAnswer,
  onSelect,
}: {
  payload: HotspotPayload;
  selected: string[];
  disabled?: boolean;
  correctAnswer?: string[];
  onSelect: (id: string) => void;
}) {
  const reveal = Boolean(correctAnswer?.length) || (disabled && payload.hotspots.some((h) => h.correct));
  const correctIds = correctAnswer?.length
    ? correctAnswer
    : payload.hotspots.filter((h) => h.correct).map((h) => h.id);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3">
        <div
          className="[&_svg]:h-auto [&_svg]:w-full"
          // El SVG procede del banco de preguntas gestionado por el equipo interno.
          dangerouslySetInnerHTML={{ __html: payload.diagram_svg }}
        />
        <div className="absolute inset-3">
          {payload.hotspots.map((h) => {
            const isSelected = selected.includes(h.id);
            const isCorrect = reveal && correctIds.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                disabled={disabled}
                aria-label={h.label}
                aria-pressed={isSelected}
                onClick={() => onSelect(h.id)}
                style={{
                  left: `${h.x_pct}%`,
                  top: `${h.y_pct}%`,
                  width: `${h.w_pct}%`,
                  height: `${h.h_pct}%`,
                }}
                className={cn(
                  "absolute rounded-md border-2 transition-colors",
                  !reveal && isSelected && "border-primary bg-primary/15",
                  !reveal && !isSelected && "border-transparent hover:border-ring/60 hover:bg-secondary/40",
                  reveal && isCorrect && "border-success bg-success/15",
                  reveal && !isCorrect && isSelected && "border-destructive bg-destructive/15",
                  reveal && !isCorrect && !isSelected && "border-transparent",
                )}
              />
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Pulsa sobre la zona del diagrama que responde a la pregunta.
      </p>

      <div className="flex flex-wrap gap-2">
        {payload.hotspots.map((h) => {
          const isSelected = selected.includes(h.id);
          const isCorrect = reveal && correctIds.includes(h.id);
          return (
            <button
              key={h.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(h.id)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium",
                !reveal && isSelected && "border-ring bg-secondary",
                !reveal && !isSelected && "border-border",
                reveal && isCorrect && "border-success bg-success-soft",
                reveal && !isCorrect && isSelected && "border-destructive bg-danger-soft",
                reveal && !isCorrect && !isSelected && "border-border opacity-70",
              )}
            >
              {h.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
