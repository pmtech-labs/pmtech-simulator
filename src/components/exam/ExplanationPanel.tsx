import { BookOpen, CheckCircle2, XCircle } from "lucide-react";

import type { AnswerValue, Question } from "@/types/exam";
import { isAnswerCorrect } from "@/services/examService";

export function ExplanationPanel({
  question,
  answer,
}: {
  question: Question;
  answer: AnswerValue | undefined;
}) {
  const correct = isAnswerCorrect(question, answer);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
          correct ? "bg-success-soft text-success" : "bg-danger-soft text-destructive"
        }`}
      >
        {correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        <span className="text-sm font-semibold">
          {correct ? "Respuesta correcta" : "Respuesta incorrecta"}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Explicación detallada</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-success">
          Por qué es correcta la opción válida
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {question.explanation.correct}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-destructive">
          Por qué los distractores son incorrectos según el PMBOK
        </p>
        <ul className="mt-2 space-y-2">
          {question.explanation.distractors.map((d) => (
            <li key={d.optionId} className="flex gap-2 rounded-lg bg-muted/60 p-2.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-destructive/40 text-[11px] font-bold text-destructive">
                {d.optionId.replace("l", "")}
              </span>
              <span className="min-w-0 text-sm leading-relaxed text-muted-foreground">{d.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        <span>{question.explanation.reference}</span>
        <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
          {question.taskCode} · {question.taskTitle}
        </span>
      </div>
    </section>
  );
}
