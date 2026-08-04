import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Option } from "@/types/exam";

/**
 * Formato pulldown: misma lógica que mc_single, presentación en desplegable.
 * Se usa un desplegable propio (no <select> nativo) porque el re-render del
 * cronómetro cerraba la lista nativa antes de poder elegir opción.
 */
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const value = selected[0] ?? "";
  const reveal = Boolean(correctAnswer?.length);
  const isCorrect = reveal && value ? correctAnswer!.includes(value) : false;
  const correctOption = reveal ? options.find((o) => correctAnswer!.includes(o.id)) : undefined;
  const currentOption = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Selecciona la respuesta
      </label>
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-xl border bg-card px-3 py-3 text-left text-sm leading-relaxed",
            "focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-80",
            !reveal && "border-border",
            reveal && isCorrect && "border-success bg-success-soft",
            reveal && !isCorrect && "border-destructive bg-danger-soft",
          )}
        >
          <span className={cn(!currentOption && "text-muted-foreground")}>
            {currentOption ? `${currentOption.id}. ${currentOption.label}` : "— Elige una opción —"}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>

        {open && !disabled && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-border bg-card p-1 shadow-lg"
          >
            {options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.id === value}
                  onClick={() => {
                    onSelect(o.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm leading-relaxed hover:bg-muted",
                    o.id === value && "bg-muted font-medium",
                  )}
                >
                  <span className="shrink-0 font-semibold">{o.id}.</span>
                  <span>{o.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
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
