/**
 * Porcentajes objetivo de representación por etiqueta en el banco publicado.
 * Se comparan contra el reparto real de preguntas publicadas en /admin.
 * Ajustables por el PO sin tocar la interfaz.
 */
export const TAG_TARGET_PCT: Record<string, number> = {
  // Dominio (ECO)
  DOPE: 42,
  DOPR: 50,
  DOEN: 8,
  // Ciclo de vida
  CIPR: 50,
  CIAH: 50,
  // Área de enfoque (grupos de proceso)
  AEIN: 13,
  AEPL: 24,
  AEEJ: 31,
  AEMC: 25,
  AECI: 7,
  // Dominios de desempeño
  DDGO: 14,
  DDAL: 15,
  DDCR: 15,
  DDFI: 12,
  DDRE: 16,
  DDRI: 14,
  DDIN: 14,
  // Formato
  FOTU: 60,
  FOTM: 15,
  FOCE: 15,
  FOIN: 10,
  // Nuevas temáticas
  NTEV: 10,
  NTSO: 5,
  NTIA: 5,
  NTRE: 80,
};

export type TagDeviationTone = "ok" | "warn" | "bad";

/** Verde ≤5 pp, naranja 5-10 pp, rojo >10 pp de diferencia con el objetivo. */
export function deviationTone(diff: number): TagDeviationTone {
  const abs = Math.abs(diff);
  if (abs <= 5) return "ok";
  if (abs <= 10) return "warn";
  return "bad";
}
