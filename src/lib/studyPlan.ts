import { ERROR_TYPE_LABELS, ERROR_TYPE_SHORT } from "@/lib/errorTypes";
import type { DomainCode, ErrorType } from "@/types/exam";

export interface StudyPlanStep {
  errorType: ErrorType;
  short: string;
  meaning: string;
  occurrences: number;
  sharePct: number;
  priority: "alta" | "media" | "baja";
  action: string;
  drill: string;
  minutes: number;
  domains: DomainCode[];
}

interface Recipe {
  action: string;
  drill: string;
  domains: DomainCode[];
}

/** Recomendación de práctica asociada a cada causa de fallo. */
const RECIPES: Record<ErrorType, Recipe> = {
  sequence: {
    action:
      "Entrena la pregunta «¿qué hago PRIMERO?»: antes de responder, ordena mentalmente las cuatro opciones en una línea temporal.",
    drill: "Serie de 20 preguntas situacionales de priorización de acciones (Procesos + Personas).",
    domains: ["process", "people"],
  },
  role: {
    action:
      "Repasa los límites de autoridad del director de proyecto frente a patrocinador, PMO, product owner y equipo.",
    drill: "Serie de 15 preguntas de atribución de responsabilidad y escalado.",
    domains: ["people", "business"],
  },
  approach: {
    action:
      "Identifica en cada enunciado las señales de predictivo, ágil o híbrido antes de elegir la respuesta.",
    drill: "Serie mixta de 20 preguntas etiquetadas por enfoque (ágil vs. predictivo).",
    domains: ["process", "business"],
  },
  analysis: {
    action:
      "Fuerza una segunda lectura del escenario y lista los datos relevantes antes de mirar las opciones.",
    drill: "2 clusters de caso con gráficos de valor ganado y datos numéricos.",
    domains: ["process"],
  },
  knowledge: {
    action:
      "Consolida los conceptos base de las tareas ECO con menor dominio antes de seguir haciendo simulaciones.",
    drill: "Serie de 25 preguntas de concepto puro con explicación inmediata.",
    domains: ["process", "business"],
  },
  interpretation: {
    action:
      "Parafrasea el escenario en una frase propia («el problema real es…») antes de responder.",
    drill: "Serie de 15 preguntas de escenario largo con feedback inmediato.",
    domains: ["people", "process"],
  },
  reading: {
    action:
      "Subraya mentalmente fechas, cifras, roles y restricciones: los datos decisivos suelen ir en la última frase.",
    drill: "Serie de 15 preguntas con enunciado extenso y control de tiempo por pregunta.",
    domains: ["process", "business"],
  },
  time: {
    action:
      "Practica con límite estricto de 70 segundos por pregunta para automatizar el ritmo del examen.",
    drill: "Simulación cronometrada de 1 sección (60 preguntas, 80 minutos).",
    domains: ["people", "process", "business"],
  },
};

/**
 * Convierte las estadísticas de `user_error_type_stats` en un plan de estudio
 * priorizado: primero las causas que más veces te han hecho fallar.
 */
export function buildStudyPlan(
  stats: { errorType: ErrorType; occurrences: number }[],
  maxSteps = 4,
): StudyPlanStep[] {
  const total = stats.reduce((sum, s) => sum + s.occurrences, 0);
  if (!total) return [];

  return [...stats]
    .filter((s) => s.occurrences > 0)
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, maxSteps)
    .map((s, i) => {
      const sharePct = Math.round((s.occurrences / total) * 100);
      const recipe = RECIPES[s.errorType];
      return {
        errorType: s.errorType,
        short: ERROR_TYPE_SHORT[s.errorType],
        meaning: ERROR_TYPE_LABELS[s.errorType],
        occurrences: s.occurrences,
        sharePct,
        priority: i === 0 || sharePct >= 25 ? "alta" : sharePct >= 12 ? "media" : "baja",
        action: recipe.action,
        drill: recipe.drill,
        minutes: sharePct >= 25 ? 45 : sharePct >= 12 ? 30 : 20,
        domains: recipe.domains,
      } satisfies StudyPlanStep;
    });
}

export function studyPlanSummary(steps: StudyPlanStep[]) {
  if (!steps.length) return "Aún no hay suficientes fallos registrados para generar un plan.";
  const minutes = steps.reduce((sum, s) => sum + s.minutes, 0);
  return `${steps.length} bloques · ${minutes} minutos estimados · empieza por «${steps[0].short}» (${steps[0].sharePct} % de tus fallos).`;
}
