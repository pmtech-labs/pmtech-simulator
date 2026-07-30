import { BarChart3, Lightbulb, TriangleAlert } from "lucide-react";
import { useMemo } from "react";

import { isAnswerCorrect } from "@/services/examService";
import type { AnswerValue, Question } from "@/types/exam";

export interface AnalyticsItem {
  question: Question;
  answer: AnswerValue | undefined;
}

interface LetterStat {
  letter: string;
  chosen: number;
  chosenCorrect: number;
  chosenWrong: number;
  missedCorrect: number;
}

interface FailureRow {
  questionId: string;
  index: number;
  taskCode: string;
  taskTitle: string;
  stem: string;
  optionId: string;
  optionLabel: string;
  reason: string;
  reference: string;
}

function selectedIds(question: Question, answer: AnswerValue | undefined): string[] {
  if (!answer) return [];
  if (question.format === "matching") return [];
  return answer as string[];
}

export function DistractorAnalytics({ items }: { items: AnalyticsItem[] }) {
  const { letters, failures, totalWithOptions } = useMemo(() => {
    const map = new Map<string, LetterStat>();
    const rows: FailureRow[] = [];
    let counted = 0;

    items.forEach(({ question, answer }, index) => {
      if (question.format === "matching" || !question.options) return;
      counted += 1;
      const chosen = selectedIds(question, answer);
      const correct = question.correctAnswer;

      question.options.forEach((opt) => {
        const stat = map.get(opt.id) ?? {
          letter: opt.id,
          chosen: 0,
          chosenCorrect: 0,
          chosenWrong: 0,
          missedCorrect: 0,
        };
        const isCorrectOption = correct.includes(opt.id);
        const isChosen = chosen.includes(opt.id);
        if (isChosen) {
          stat.chosen += 1;
          if (isCorrectOption) stat.chosenCorrect += 1;
          else stat.chosenWrong += 1;
        } else if (isCorrectOption) {
          stat.missedCorrect += 1;
        }
        map.set(opt.id, stat);
      });

      if (isAnswerCorrect(question, answer)) return;

      chosen
        .filter((id) => !correct.includes(id))
        .forEach((id) => {
          const opt = question.options!.find((o) => o.id === id);
          const distractor = question.explanation.distractors.find((d) => d.optionId === id);
          rows.push({
            questionId: question.id,
            index: index + 1,
            taskCode: question.taskCode,
            taskTitle: question.taskTitle,
            stem: question.stem,
            optionId: id,
            optionLabel: opt?.label ?? id,
            reason:
              distractor?.text ??
              "Esta opción no responde al enfoque que el PMBOK considera prioritario en esta situación.",
            reference: question.explanation.reference,
          });
        });

      if (!chosen.length) {
        rows.push({
          questionId: question.id,
          index: index + 1,
          taskCode: question.taskCode,
          taskTitle: question.taskTitle,
          stem: question.stem,
          optionId: "—",
          optionLabel: "Sin respuesta",
          reason: `No marcaste ninguna opción. La respuesta correcta era ${correct.join(", ")}: ${question.explanation.correct}`,
          reference: question.explanation.reference,
        });
      }
    });

    return {
      letters: [...map.values()].sort((a, b) => a.letter.localeCompare(b.letter)),
      failures: rows,
      totalWithOptions: counted,
    };
  }, [items]);

  if (!totalWithOptions) return null;

  const maxChosen = Math.max(1, ...letters.map((l) => l.chosen));

  return (
    <section className="space-y-5 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold">Analítica de distractores</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {letters.map((l) => {
          const errorRate = l.chosen ? Math.round((l.chosenWrong / l.chosen) * 100) : 0;
          return (
            <div key={l.letter} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {l.letter}
                </span>
                <span className="num text-xs text-muted-foreground">
                  elegida {l.chosen} de {totalWithOptions}
                </span>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-success"
                  style={{ width: `${(l.chosenCorrect / maxChosen) * 100}%` }}
                />
                <div
                  className="h-full bg-destructive"
                  style={{ width: `${(l.chosenWrong / maxChosen) * 100}%` }}
                />
              </div>
              <p className="num mt-2 text-xs text-muted-foreground">
                {l.chosenCorrect} acierto(s) · {l.chosenWrong} fallo(s) · {errorRate}% de error
              </p>
              {l.missedCorrect > 0 && (
                <p className="num mt-1 text-xs text-accent-foreground">
                  Era correcta {l.missedCorrect} vez/veces y no la marcaste
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-semibold">Por qué fallé</h3>
        </div>
        {failures.length === 0 ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4 text-success" />
            Sin fallos en preguntas de opción: no hay distractores que analizar.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {failures.map((f, i) => (
              <li key={`${f.questionId}-${f.optionId}-${i}`} className="rounded-xl bg-muted/60 p-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="num rounded-md bg-secondary px-2 py-0.5 font-semibold text-secondary-foreground">
                    Pregunta {f.index}
                  </span>
                  <span className="rounded-md border border-border px-2 py-0.5 text-muted-foreground">
                    {f.taskCode} · {f.taskTitle}
                  </span>
                  <span className="rounded-md border border-destructive/40 px-2 py-0.5 font-semibold text-destructive">
                    Marcaste {f.optionId}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{f.optionLabel}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.reason}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{f.reference}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
