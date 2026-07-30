import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Option } from "@/types/exam";

export function OptionList({
  options,
  selected,
  multi,
  disabled,
  correctAnswer,
  onToggle,
}: {
  options: Option[];
  selected: string[];
  multi?: boolean;
  disabled?: boolean;
  correctAnswer?: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o) => {
        const isSelected = selected.includes(o.id);
        const isCorrect = correctAnswer?.includes(o.id);
        const reveal = Boolean(correctAnswer);
        return (
          <button
            key={o.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(o.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors sm:p-4",
              !reveal && isSelected && "border-ring bg-secondary",
              !reveal && !isSelected && "border-border bg-card hover:border-ring/60 hover:bg-secondary/50",
              reveal && isCorrect && "border-success bg-success-soft",
              reveal && !isCorrect && isSelected && "border-destructive bg-danger-soft",
              reveal && !isCorrect && !isSelected && "border-border bg-card opacity-70",
            )}
          >
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center border text-xs font-bold",
                multi ? "rounded-md" : "rounded-full",
                reveal && isCorrect && "border-success bg-success text-success-foreground",
                reveal && !isCorrect && isSelected && "border-destructive bg-destructive text-destructive-foreground",
                !reveal && isSelected && "border-primary bg-primary text-primary-foreground",
                !reveal && !isSelected && "border-input text-muted-foreground",
                reveal && !isCorrect && !isSelected && "border-input text-muted-foreground",
              )}
            >
              {o.id}
            </span>
            <span className="min-w-0 text-sm leading-relaxed">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function FlagButton({ flagged, onToggle }: { flagged: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
        flagged
          ? "border-accent bg-warning-soft text-accent-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary",
      )}
    >
      <Flag className={cn("h-3.5 w-3.5", flagged && "fill-accent text-accent")} />
      {flagged ? "Marcada para revisión" : "Marcar para revisión"}
    </button>
  );
}
