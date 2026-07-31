import { computeDistractorStats, type AnalyticsItem } from "@/lib/distractorStats";
import { ERROR_TYPE_LABELS, ERROR_TYPE_SHORT } from "@/lib/errorTypes";
import { escapeHtml, openPrintablePdf } from "@/lib/export";
import { buildStudyPlan } from "@/lib/studyPlan";

export interface ResultReportInput {
  title: string;
  subtitle: string;
  scorePct: number;
  correct: number;
  total: number;
  extraRows?: { label: string; value: string }[];
  items: AnalyticsItem[];
}

/**
 * Abre un informe imprimible (guardar como PDF) con el resultado de la sesión,
 * el desglose por opción A–D y el patrón de errores por tipo.
 */
export function exportResultReportPdf(input: ResultReportInput): boolean {
  const { letters, failures, errorCounts } = computeDistractorStats(input.items);
  const maxError = Math.max(1, ...errorCounts.map((e) => e.occurrences));
  const plan = buildStudyPlan(errorCounts, 3);

  const summaryRows = [
    { label: "Puntuación", value: `${input.scorePct}%` },
    { label: "Respuestas correctas", value: `${input.correct} de ${input.total}` },
    ...(input.extraRows ?? []),
  ]
    .map((r) => `<tr><th>${escapeHtml(r.label)}</th><td>${escapeHtml(r.value)}</td></tr>`)
    .join("");

  const letterRows = letters
    .map((l) => {
      const errorRate = l.chosen ? Math.round((l.chosenWrong / l.chosen) * 100) : 0;
      return `<tr><td><strong>${escapeHtml(l.letter)}</strong></td><td>${l.chosen}</td><td class="ok">${l.chosenCorrect}</td><td class="ko">${l.chosenWrong}</td><td>${errorRate}%</td><td>${l.missedCorrect}</td></tr>`;
    })
    .join("");

  const errorRows = errorCounts.length
    ? errorCounts
        .map(
          (e) => `<tr><td>${escapeHtml(ERROR_TYPE_SHORT[e.errorType])}</td><td>${e.occurrences}</td><td>${escapeHtml(
            ERROR_TYPE_LABELS[e.errorType],
          )}</td><td style="width:120px"><div style="height:8px;background:#f3f5f9;border-radius:4px"><div style="height:8px;border-radius:4px;background:#b3261e;width:${Math.round(
            (e.occurrences / maxError) * 100,
          )}%"></div></div></td></tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="muted">Sin errores tipificados en esta sesión.</td></tr>`;

  const failureItems = failures.length
    ? failures
        .map(
          (f) => `<div class="item">
  <span class="tag">Pregunta ${f.index}</span>
  <span class="tag">${escapeHtml(f.taskCode)} · ${escapeHtml(f.taskTitle)}</span>
  <span class="tag">Marcaste ${escapeHtml(f.optionId)}</span>
  ${f.errorType ? `<span class="tag">${escapeHtml(ERROR_TYPE_SHORT[f.errorType])}</span>` : ""}
  <h3>${escapeHtml(f.stem)}</h3>
  <p><strong>Tu opción:</strong> ${escapeHtml(f.optionLabel)}</p>
  <p class="ko">${escapeHtml(f.reason)}</p>
  <p class="muted">${escapeHtml(f.reference)}</p>
</div>`,
        )
        .join("")
    : `<p class="muted">Sin fallos en preguntas de opción múltiple.</p>`;

  const planItems = plan.length
    ? `<h2>Plan de estudio sugerido</h2><ol>${plan
        .map(
          (s) =>
            `<li><strong>${escapeHtml(s.short)}</strong> (prioridad ${escapeHtml(s.priority)}, ${s.sharePct} % de tus fallos) — ${escapeHtml(
              s.action,
            )} <em>${escapeHtml(s.drill)} · ${s.minutes} min</em></li>`,
        )
        .join("")}</ol>`
    : "";

  return openPrintablePdf(
    input.title,
    input.subtitle,
    `<h2>Resumen del resultado</h2>
<table><tbody>${summaryRows}</tbody></table>
<h2>Desglose por opción (A–D)</h2>
<table><thead><tr><th>Opción</th><th>Veces elegida</th><th>Aciertos</th><th>Fallos</th><th>% error</th><th>Correcta no marcada</th></tr></thead><tbody>${letterRows}</tbody></table>
<h2>Patrón de errores por tipo</h2>
<table><thead><tr><th>Tipo</th><th>Nº</th><th>Qué significa</th><th></th></tr></thead><tbody>${errorRows}</tbody></table>
${planItems}
<h2>Detalle de fallos (${failures.length})</h2>${failureItems}`,
  );
}
