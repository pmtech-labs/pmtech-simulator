import type { ErrorType } from "@/types/exam";

/**
 * Traducción de los códigos técnicos de `error_type` (tabla user_error_type_stats)
 * a texto comprensible para el candidato.
 */
export const ERROR_TYPE_LABELS: Record<ErrorType, string> = {
  sequence: "Era una acción válida, pero no la que correspondía hacer primero",
  role: "Esa decisión corresponde a otra persona, no al director de proyecto en este contexto",
  approach: "Aplicaste lógica de un enfoque (predictivo/ágil) que no corresponde a este contexto",
  analysis: "Actuaste sin considerar toda la información del escenario",
  knowledge: "El concepto o principio aplicado no es correcto",
  interpretation: "Se malinterpretó la situación descrita",
  reading: "Se pasó por alto un dato decisivo del enunciado",
  time: "La urgencia o el tiempo no se gestionaron adecuadamente",
};

/** Etiqueta corta para gráficos y tablas. */
export const ERROR_TYPE_SHORT: Record<ErrorType, string> = {
  sequence: "Secuencia",
  role: "Rol",
  approach: "Enfoque",
  analysis: "Análisis",
  knowledge: "Conocimiento",
  interpretation: "Interpretación",
  reading: "Lectura",
  time: "Tiempo",
};

export const ERROR_TYPES = Object.keys(ERROR_TYPE_LABELS) as ErrorType[];
