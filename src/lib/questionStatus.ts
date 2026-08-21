/**
 * Etiquetas en español de los estados del banco de preguntas.
 *
 * - `draft` (Borrador): pendiente de que el supervisor la revise.
 * - `published` (Publicada): disponible para exámenes.
 * - `rejected` (Rechazada): el revisor la descartó desde borrador por algún
 *   problema de calidad; queda registrado el motivo.
 * - `retired` (Retirada): estuvo publicada y se ha sacado del banco de
 *   preguntas disponibles para examen.
 */
export const QUESTION_STATUSES = ["draft", "published", "rejected", "retired"] as const;

export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  rejected: "Rechazada",
  retired: "Retirada",
};

export function statusLabel(status: string | null | undefined): string {
  if (!status) return "—";
  return STATUS_LABELS[status] ?? status;
}

const APPROACH_LABELS: Record<string, string> = {
  predictive: "Predictivo",
  agile: "Ágil",
  hybrid: "Híbrido",
  mixed: "Mixto",
};

export function approachLabel(approach: string | null | undefined): string {
  if (!approach) return "—";
  return APPROACH_LABELS[approach] ?? approach;
}

const FORMAT_LABELS: Record<string, string> = {
  mc_single: "Respuesta única",
  mc_multi: "Respuesta múltiple",
  matching: "Emparejamiento",
  enhanced_matching: "Emparejamiento avanzado",
  graphic_based: "Basada en gráfico",
  hotspot: "Punto activo",
  pulldown: "Desplegables",
};

export function formatLabel(format: string | null | undefined): string {
  if (!format) return "—";
  return FORMAT_LABELS[format] ?? format;
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  standalone: "Independiente",
  case_child: "Parte de un caso",
  practicum: "Practicum",
};

export function itemTypeLabel(type: string | null | undefined): string {
  if (!type) return "—";
  return ITEM_TYPE_LABELS[type] ?? type;
}
