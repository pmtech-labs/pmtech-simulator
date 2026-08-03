import { EarnedValueChart } from "@/components/exam/EarnedValueChart";
import { HotspotQuestion } from "@/components/exam/HotspotQuestion";
import { MatchingQuestion } from "@/components/exam/MatchingQuestion";
import type { GraphicPayload, HotspotPayload, MatchingPayload } from "@/types/exam";

/**
 * Renderiza el material visual de una pregunta (gráfico, diagrama de red,
 * hotspot o matching) en modo solo lectura para la cola de revisión.
 * Reutiliza los mismos componentes que usa el examen del candidato.
 */
export function QuestionMediaPreview({
  format,
  payload,
  correctAnswer,
}: {
  format: string;
  payload: unknown;
  correctAnswer?: unknown;
}) {
  if (!payload || typeof payload !== "object") return null;
  const raw = payload as Record<string, unknown>;

  if (format === "graphic_based") {
    const g = raw as unknown as GraphicPayload;
    if (g.chart_type === "earned_value" && g.evChart) {
      return (
        <div className="mb-3">
          <EarnedValueChart chart={g.evChart} />
        </div>
      );
    }
    if (g.chart_type === "network_diagram" && g.diagram_svg) {
      return (
        <div
          className="mb-3 w-full overflow-x-auto rounded-lg border border-border bg-card p-3 [&_svg]:h-auto [&_svg]:max-w-none"
          // El SVG procede del banco de preguntas gestionado por el equipo editorial.
          dangerouslySetInnerHTML={{ __html: g.diagram_svg }}
        />
      );
    }
    return null;
  }

  if (format === "hotspot" && typeof raw.diagram_svg === "string" && Array.isArray(raw.hotspots)) {
    const ids = Array.isArray(correctAnswer)
      ? (correctAnswer as unknown[]).filter((v): v is string => typeof v === "string")
      : [];
    return (
      <div className="mb-3">
        <HotspotQuestion
          payload={raw as unknown as HotspotPayload}
          selected={[]}
          disabled
          correctAnswer={ids.length ? ids : undefined}
          onSelect={() => {}}
        />
      </div>
    );
  }

  if (
    (format === "matching" || format === "enhanced_matching") &&
    Array.isArray(raw.left) &&
    Array.isArray(raw.right)
  ) {
    return (
      <div className="mb-3">
        <MatchingQuestion
          payload={raw as unknown as MatchingPayload}
          value={{}}
          disabled
          reveal
          onChange={() => {}}
        />
      </div>
    );
  }

  return null;
}
