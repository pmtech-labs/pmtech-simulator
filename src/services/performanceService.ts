import { supabase } from "@/integrations/supabase/client";
import {
  APPROACH_LABELS,
  FOCUS_TAG_LABELS,
  PERFORMANCE_DOMAIN_LABELS,
} from "@/lib/questionTags";
import { toUiDomain } from "@/services/userService";
import type { DomainCode } from "@/types/exam";

/** Dimensiones analizadas para las recomendaciones del panel. */
export type PerformanceDimension = "domain" | "approach" | "focus" | "performance_domain";

export interface PerformanceSlice {
  dimension: PerformanceDimension;
  key: string;
  label: string;
  total: number;
  correct: number;
  accuracy: number;
  avgSeconds: number;
}

export interface PerformanceBreakdown {
  answered: number;
  byDimension: Record<PerformanceDimension, PerformanceSlice[]>;
}

const DOMAIN_LABELS: Record<DomainCode, string> = {
  people: "Personas",
  process: "Procesos",
  business: "Entorno de negocio",
};

const EMPTY: PerformanceBreakdown = {
  answered: 0,
  byDimension: { domain: [], approach: [], focus: [], performance_domain: [] },
};

interface Bucket {
  total: number;
  correct: number;
  seconds: number;
}

interface ItemQuestion {
  approach: string | null;
  performance_domain: string | null;
  focus_tags: string[] | null;
  eco_tasks: { eco_domains: { code: string } | null } | null;
}

function add(map: Map<string, Bucket>, key: string, ok: boolean, seconds: number) {
  const b = map.get(key) ?? { total: 0, correct: 0, seconds: 0 };
  b.total++;
  if (ok) b.correct++;
  b.seconds += seconds;
  map.set(key, b);
}

function toSlices(
  map: Map<string, Bucket>,
  dimension: PerformanceDimension,
  labels: (key: string) => string,
): PerformanceSlice[] {
  return [...map.entries()]
    .map(([key, b]) => ({
      dimension,
      key,
      label: labels(key),
      total: b.total,
      correct: b.correct,
      accuracy: Math.round((b.correct / b.total) * 100),
      avgSeconds: Math.round(b.seconds / b.total),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}

/**
 * Rendimiento real del candidato por dominio ECO, enfoque, área de enfoque y
 * dominio de desempeño. RLS limita `exam_items` a los exámenes del usuario.
 */
export async function getPerformanceBreakdown(): Promise<PerformanceBreakdown> {
  const { data, error } = await supabase
    .from("exam_items")
    .select(
      "is_correct, time_spent_seconds, questions(approach, performance_domain, focus_tags, eco_tasks(eco_domains(code)))",
    )
    .not("is_correct", "is", null)
    .limit(1000);

  if (error || !data?.length) return EMPTY;

  const domain = new Map<string, Bucket>();
  const approach = new Map<string, Bucket>();
  const focus = new Map<string, Bucket>();
  const perf = new Map<string, Bucket>();
  let answered = 0;

  for (const row of data) {
    const q = row.questions as unknown as ItemQuestion | null;
    if (!q) continue;
    const ok = row.is_correct === true;
    const seconds = row.time_spent_seconds ?? 0;
    answered++;

    add(domain, toUiDomain(q.eco_tasks?.eco_domains?.code), ok, seconds);
    if (q.approach) add(approach, q.approach, ok, seconds);
    if (q.performance_domain) add(perf, q.performance_domain, ok, seconds);
    for (const tag of q.focus_tags ?? []) add(focus, tag, ok, seconds);
  }

  return {
    answered,
    byDimension: {
      domain: toSlices(domain, "domain", (k) => DOMAIN_LABELS[k as DomainCode] ?? k),
      approach: toSlices(approach, "approach", (k) => APPROACH_LABELS[k] ?? k),
      focus: toSlices(focus, "focus", (k) => FOCUS_TAG_LABELS[k] ?? k),
      performance_domain: toSlices(
        perf,
        "performance_domain",
        (k) => PERFORMANCE_DOMAIN_LABELS[k] ?? k,
      ),
    },
  };
}

export interface Recommendation {
  id: string;
  title: string;
  dimensionLabel: string;
  reason: string;
  accuracy: number;
  total: number;
  priority: "alta" | "media" | "baja";
  minutes: number;
  /** Parámetros de búsqueda para /practica. */
  search: Record<string, string>;
}

const DIMENSION_LABELS: Record<PerformanceDimension, string> = {
  domain: "Dominio ECO",
  approach: "Enfoque",
  focus: "Área de enfoque",
  performance_domain: "Dominio de desempeño",
};

/** Mínimo de respuestas para que una franja sea estadísticamente utilizable. */
const MIN_SAMPLE = 4;

function searchFor(slice: PerformanceSlice): Record<string, string> {
  switch (slice.dimension) {
    case "domain":
      return { modo: "domain_drill", dominio: slice.key };
    case "approach":
      return { modo: "domain_drill", enfoque: slice.key };
    case "performance_domain":
      return { modo: "domain_drill", desempeno: slice.key };
    default:
      return { modo: "domain_drill", foco: slice.key };
  }
}

function priorityOf(accuracy: number): Recommendation["priority"] {
  if (accuracy < 55) return "alta";
  if (accuracy < 70) return "media";
  return "baja";
}

/**
 * Convierte el rendimiento en un plan de práctica para hoy: la franja más débil
 * de cada dimensión, ordenada por prioridad.
 */
export function buildRecommendations(
  breakdown: PerformanceBreakdown,
  masteryByDomain?: Record<DomainCode, number>,
): Recommendation[] {
  const out: Recommendation[] = [];

  (Object.keys(breakdown.byDimension) as PerformanceDimension[]).forEach((dim) => {
    const candidate = breakdown.byDimension[dim].find((s) => s.total >= MIN_SAMPLE);
    if (!candidate || candidate.accuracy >= 85) return;
    out.push({
      id: `${dim}:${candidate.key}`,
      title: candidate.label,
      dimensionLabel: DIMENSION_LABELS[dim],
      reason: `${candidate.accuracy}% de aciertos en ${candidate.total} preguntas · ${candidate.avgSeconds}s de media`,
      accuracy: candidate.accuracy,
      total: candidate.total,
      priority: priorityOf(candidate.accuracy),
      minutes: candidate.accuracy < 55 ? 30 : 20,
      search: searchFor(candidate),
    });
  });

  if (!out.length && masteryByDomain) {
    const weakest = (Object.keys(masteryByDomain) as DomainCode[]).sort(
      (a, b) => masteryByDomain[a] - masteryByDomain[b],
    )[0];
    if (weakest) {
      out.push({
        id: `domain:${weakest}`,
        title: DOMAIN_LABELS[weakest],
        dimensionLabel: DIMENSION_LABELS.domain,
        reason: `Aún sin datos suficientes de examen: empieza por tu dominio con menor progreso (${masteryByDomain[weakest]}%).`,
        accuracy: masteryByDomain[weakest],
        total: 0,
        priority: "media",
        minutes: 20,
        search: { modo: "domain_drill", dominio: weakest },
      });
    }
  }

  const order = { alta: 0, media: 1, baja: 2 } as const;
  return out.sort((a, b) => order[a.priority] - order[b.priority] || a.accuracy - b.accuracy);
}
