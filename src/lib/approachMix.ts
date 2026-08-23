/**
 * Reparto del enfoque (ciclo de vida) para la "mezcla automática" de generación.
 *
 * Los objetivos viven en la BD (`question_tag_defs.target_pct`):
 *  - CIPR (Predictivo)            -> % de preguntas predictivas
 *  - CIAH (Adaptativo o Híbrido)  -> % repartido al 50/50 entre ágil e híbrido
 */
export type GeneratorApproach = "predictive" | "agile" | "hybrid";

export interface ApproachWeights {
  predictive: number;
  agile: number;
  hybrid: number;
}

/** Reparto por defecto (R1: 40% predictivo, 60% ágil+híbrido) si la BD no responde. */
export const DEFAULT_APPROACH_WEIGHTS: ApproachWeights = {
  predictive: 40,
  agile: 30,
  hybrid: 30,
};

/** Deriva los pesos de enfoque a partir de los objetivos de las etiquetas CI. */
export function approachWeightsFromTargets(
  targets: Record<string, number | null | undefined>,
): ApproachWeights {
  const predictive = Number(targets["CIPR"] ?? NaN);
  const adaptive = Number(targets["CIAH"] ?? NaN);
  if (!Number.isFinite(predictive) || !Number.isFinite(adaptive) || predictive + adaptive <= 0) {
    return DEFAULT_APPROACH_WEIGHTS;
  }
  return { predictive, agile: adaptive / 2, hybrid: adaptive / 2 };
}

/**
 * Reparte `total` preguntas entre los tres enfoques con el método del mayor resto,
 * de modo que la suma sea exactamente `total`.
 */
export function splitApproachCounts(
  total: number,
  weights: ApproachWeights = DEFAULT_APPROACH_WEIGHTS,
): { approach: GeneratorApproach; count: number }[] {
  const entries: [GeneratorApproach, number][] = [
    ["predictive", weights.predictive],
    ["agile", weights.agile],
    ["hybrid", weights.hybrid],
  ];
  const sum = entries.reduce((acc, [, w]) => acc + Math.max(0, w), 0);
  if (total <= 0 || sum <= 0) return [];

  const raw = entries.map(([approach, w]) => {
    const exact = (Math.max(0, w) / sum) * total;
    return { approach, exact, count: Math.floor(exact) };
  });
  let left = total - raw.reduce((acc, r) => acc + r.count, 0);
  raw
    .slice()
    .sort((a, b) => b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)))
    .forEach((r) => {
      if (left > 0) {
        r.count += 1;
        left -= 1;
      }
    });

  return raw.filter((r) => r.count > 0).map((r) => ({ approach: r.approach, count: r.count }));
}

/** Texto informativo del reparto, p. ej. "4 predictivas · 3 ágiles · 3 híbridas". */
export function describeApproachSplit(split: { approach: GeneratorApproach; count: number }[]) {
  const labels: Record<GeneratorApproach, string> = {
    predictive: "predictivas",
    agile: "ágiles",
    hybrid: "híbridas",
  };
  return split.map((s) => `${s.count} ${labels[s.approach]}`).join(" · ");
}
