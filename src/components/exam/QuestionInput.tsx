import { EarnedValueChart } from "@/components/exam/EarnedValueChart";
import { HotspotQuestion } from "@/components/exam/HotspotQuestion";
import { MatchingQuestion } from "@/components/exam/MatchingQuestion";
import { OptionList } from "@/components/exam/OptionList";
import { PulldownQuestion } from "@/components/exam/PulldownQuestion";
import type { AnswerValue, Question } from "@/types/exam";

/** Gráfico/artefacto asociado a la pregunta (formato graphic_based). */
export function QuestionGraphic({ question }: { question: Question }) {
  if (question.format !== "graphic_based") return null;
  const g = question.graphic;
  if (!g || g.chart_type !== "earned_value" || !g.evChart) return null;
  return <EarnedValueChart chart={g.evChart} />;
}

/**
 * Renderiza el cuerpo interactivo de una pregunta según su formato.
 * Centraliza mc_single, mc_multi, pulldown, matching, hotspot y graphic_based.
 */
export function QuestionInput({
  question,
  answer,
  disabled,
  reveal,
  correctAnswer,
  onChange,
}: {
  question: Question;
  answer: AnswerValue | undefined;
  disabled?: boolean;
  /** Muestra la corrección en matching usando su payload. */
  reveal?: boolean;
  correctAnswer?: string[];
  onChange: (next: AnswerValue) => void;
}) {
  const selected = Array.isArray(answer) ? answer : [];

  const toggle = (id: string) => {
    if (disabled) return;
    if (question.format === "mc_multi") {
      onChange(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]);
      return;
    }
    onChange([id]);
  };

  if (question.format === "matching" && question.matching) {
    return (
      <MatchingQuestion
        payload={question.matching}
        value={(answer as Record<string, string>) ?? {}}
        disabled={disabled}
        reveal={reveal}
        onChange={(next) => onChange(next)}
      />
    );
  }

  if (question.format === "hotspot" && question.hotspot) {
    return (
      <HotspotQuestion
        payload={question.hotspot}
        selected={selected}
        disabled={disabled}
        correctAnswer={reveal || correctAnswer?.length ? correctAnswer : undefined}
        onSelect={toggle}
      />
    );
  }

  if (question.format === "pulldown") {
    return (
      <PulldownQuestion
        options={question.options ?? []}
        selected={selected}
        disabled={disabled}
        correctAnswer={correctAnswer}
        onSelect={toggle}
      />
    );
  }

  return (
    <OptionList
      options={question.options ?? []}
      selected={selected}
      multi={question.format === "mc_multi"}
      disabled={disabled}
      correctAnswer={correctAnswer}
      onToggle={toggle}
    />
  );
}
