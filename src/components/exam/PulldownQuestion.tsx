import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Option } from "@/types/exam";

/** Formato pulldown: misma lógica que mc_single, presentación en desplegable. */
export function PulldownQuestion({
  options,
  selected,
  disabled,
  correctAnswer,
  onSelect,
}: {
  options: Option[];
  selected: string[];
  disabled?: boolean;
  correctAnswer?: string[];
  onSelect: (id: string) => void;
}) {
  const value = selected[0] ?? "";
  const reveal = Boolean(correctAnswer?.length);
  const isCorrect = reveal && value ? correctAnswer!.includes(value) : false;
  const correctOption = reveal ? options.find((o) => correctAnswer!.includes(o.id)) : undefined;

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Selecciona la respuesta
      </label>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-xl border bg-card px-3 py-3 pr-10 text-sm leading-relaxed",
            "focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-80",
            !reveal && "border-border",
            reveal && isCorrect && "border-success bg-success-soft",
            reveal && !isCorrect && "border-destructive bg-danger-soft",
          )}
        >
          <option value="" disabled>
            — Elige una opción —
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id}. {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {reveal && correctOption && !isCorrect && (
        <p className="flex items-start gap-1.5 text-xs font-medium text-success">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Correcta: {correctOption.id}. {correctOption.label}
        </p>
      )}
    </div>
  );
}
