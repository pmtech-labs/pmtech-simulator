import { cn } from "@/lib/utils";
import type { Question } from "@/types/exam";

export function QuestionNavigator({
  questions,
  current,
  answers,
  flagged,
  onSelect,
}: {
  questions: Question[];
  current: number;
  answers: Record<string, unknown>;
  flagged: Record<string, boolean>;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Navegación de preguntas
      </p>
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
        {questions.map((q, i) => {
          const answered = Boolean(answers[q.id]);
          const isFlagged = flagged[q.id];
          return (
            <button
              key={q.id}
              onClick={() => onSelect(i)}
              className={cn(
                "num relative grid aspect-square place-items-center rounded-lg border text-xs font-semibold transition-colors",
                i === current && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                answered
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              {i + 1}
              {isFlagged && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
      <ul className="space-y-1.5 text-[11px] text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Respondida
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm border border-border bg-card" /> Sin responder
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Marcada para revisión
        </li>
      </ul>
    </div>
  );
}
