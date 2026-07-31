export type DomainLevelCode = "solid" | "progress" | "reinforce" | "critical";

export interface DomainLevel {
  code: DomainLevelCode;
  label: string;
  min: number;
  max: number;
  description: string;
  /** Token de color del design system aplicable a fondos o texto. */
  token: "success" | "warning" | "accent" | "destructive";
}

export const DOMAIN_LEVELS: DomainLevel[] = [
  {
    code: "solid",
    label: "Dominio sólido",
    min: 80,
    max: 100,
    description:
      "Rendimiento consistente en este dominio. Sigue practicando de vez en cuando para no perder fluidez cerca del examen.",
    token: "success",
  },
  {
    code: "progress",
    label: "En progreso",
    min: 60,
    max: 79,
    description:
      "Tienes una base correcta, pero aún hay casos complejos o situaciones híbridas que te cuestan.",
    token: "warning",
  },
  {
    code: "reinforce",
    label: "Necesita refuerzo",
    min: 40,
    max: 59,
    description:
      "Hay una brecha visible. Este dominio debería aparecer en tu plan de estudio semanal.",
    token: "accent",
  },
  {
    code: "critical",
    label: "Brecha crítica",
    min: 0,
    max: 39,
    description:
      "Riesgo real de suspender por esta área. Priorízalo antes de hacer más simulacros completos.",
    token: "destructive",
  },
];

export function getDomainLevel(pct: number): DomainLevel {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    DOMAIN_LEVELS.find((l) => clamped >= l.min && clamped <= l.max) ?? DOMAIN_LEVELS[3]
  );
}
