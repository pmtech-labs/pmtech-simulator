import { isAnswerCorrect } from "@/services/examService";
import type { AnswerValue, ErrorType, Question } from "@/types/exam";

export interface AnalyticsItem {
  question: Question;
  answer: AnswerValue | undefined;
}

export interface LetterStat {
  letter: string;
  chosen: number;
  chosenCorrect: number;
  chosenWrong: number;
  missedCorrect: number;
}

export interface FailureRow {
  questionId: string;
  index: number;
  taskCode: string;
  taskTitle: string;
  stem: string;
  optionId: string;
  optionLabel: string;
  reason: string;
  reference: string;
  errorType?: ErrorType;
}

function selectedIds(question: Question, answer: AnswerValue | undefined): string[] {
  if (!answer) return [];
  if (question.format === "matching" || question.format === "enhanced_matching") return [];
  return answer as string[];
}

export interface DistractorStats {
  letters: LetterStat[];
  failures: FailureRow[];
  totalWithOptions: number;
  errorCounts: { errorType: ErrorType; occurrences: number }[];
}

/** Calcula el desglose por opción (A–D), los fallos y el patrón de errores de una sesión. */
export function computeDistractorStats(items: AnalyticsItem[]): DistractorStats {
  const map = new Map<string, LetterStat>();
  const rows: FailureRow[] = [];
  const errors = new Map<ErrorType, number>();
  let counted = 0;

  items.forEach(({ question, answer }, index) => {
    const correct = question.correctAnswer;
    const failed = !isAnswerCorrect(question, answer);

    if (failed && question.errorType) {
      errors.set(question.errorType, (errors.get(question.errorType) ?? 0) + 1);
    }

    if (question.format === "matching" || question.format === "enhanced_matching" || !question.options) return;
    counted += 1;
    const chosen = selectedIds(question, answer);

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

    if (!failed) return;

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
            "Esta opción no responde al enfoque que el PMBOK® considera prioritario en esta situación.",
          reference: question.explanation.reference,
          errorType: question.errorType,
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
        errorType: question.errorType,
      });
    }
  });

  return {
    letters: [...map.values()].sort((a, b) => a.letter.localeCompare(b.letter)),
    failures: rows,
    totalWithOptions: counted,
    errorCounts: [...errors.entries()]
      .map(([errorType, occurrences]) => ({ errorType, occurrences }))
      .sort((a, b) => b.occurrences - a.occurrences),
  };
}
