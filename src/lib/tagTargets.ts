/**
 * Los porcentajes objetivo por etiqueta viven ahora en la base de datos
 * (`question_tag_defs.target_pct`) y se leen con `useTagDefs()`.
 * Aquí solo queda la escala de color de la desviación.
 */
export type TagDeviationTone = "ok" | "warn" | "bad";

/** Verde ≤5 pp, naranja 5-10 pp, rojo >10 pp de diferencia con el objetivo. */
export function deviationTone(diff: number): TagDeviationTone {
  const abs = Math.abs(diff);
  if (abs <= 5) return "ok";
  if (abs <= 10) return "warn";
  return "bad";
}
