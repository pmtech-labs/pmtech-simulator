export type PlanCode = "basica_3m" | "premium_1m" | "premium_6m";

export interface CheckoutParams {
  planCode: PlanCode;
}

export interface CheckoutResult {
  url: string | null;
  /** true mientras el cobro online no esté activado (sin cuenta de Stripe propia). */
  unavailable: boolean;
  planCode: CheckoutParams["planCode"];
}

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  code: PlanCode;
  name: string;
  durationMonths: number;
  price: number;
  tagline?: string;
  fullSimLimit: number | null;
  features: PlanFeature[];
}

/**
 * Punto de integración de pago aislado.
 *
 * TODO: Stripe — createCheckoutSession() debe invocar una Edge Function que cree
 * una sesión real de Stripe Checkout con client_reference_id = user.id y
 * metadata.plan_code, y devolver session.url para redirigir con
 * `window.location.href = url`. Requiere STRIPE_SECRET_KEY configurada
 * (pendiente: cuenta de Stripe propia).
 *
 * Hasta entonces NO se simula ningún pago ni se activa ninguna licencia.
 */
export async function createCheckoutSession({ planCode }: CheckoutParams): Promise<CheckoutResult> {
  return { url: null, unavailable: true, planCode };
}

/** Contacto para activación manual de licencia mientras no hay cobro online. */
export const SALES_EMAIL = "contacto@glacimonto.com";

function fullSimFeature(limit: number | null): PlanFeature {
  if (limit === null) return { label: "Simulaciones completas ilimitadas (180 preguntas, 4h)", included: true };
  if (limit === 0) return { label: "Sin simulaciones completas (180 preguntas)", included: false };
  return { label: `${limit} simulaciones completas (180 preguntas, 4h)`, included: true };
}

export const PLANS: Plan[] = [
  {
    code: "premium_6m",
    name: "6 meses",
    durationMonths: 6,
    price: 59.9,
    fullSimLimit: null,
    tagline: "La mejor relación valor-duración para prepararte con calma",
    features: [
      { label: "Banco completo ECO 2026", included: true },
      fullSimFeature(null),
      { label: "Clusters de caso", included: true },
      { label: "Practicum completo (hotspot, gráficos)", included: true },
      { label: "Analítica por tarea ECO", included: true },
      { label: "Motor adaptativo", included: true },
    ],
  },
  {
    code: "basica_3m",
    name: "3 meses",
    durationMonths: 3,
    price: 39.9,
    fullSimLimit: 15,
    features: [
      { label: "Banco completo ECO 2026", included: true },
      fullSimFeature(15),
      { label: "Clusters de caso", included: true },
      { label: "Practicum completo (hotspot, gráficos)", included: true },
      { label: "Analítica por tarea ECO", included: true },
      { label: "Motor adaptativo", included: true },
    ],
  },
  {
    code: "premium_1m",
    name: "1 mes",
    durationMonths: 1,
    price: 29.9,
    tagline: "Si estás a pocos días del examen y necesitas la experiencia completa ya",
    fullSimLimit: 5,
    features: [
      { label: "Banco completo ECO 2026", included: true },
      fullSimFeature(5),
      { label: "Clusters de caso", included: true },
      { label: "Practicum completo (hotspot, gráficos)", included: true },
      { label: "Analítica por tarea ECO", included: true },
      { label: "Motor adaptativo", included: true },
    ],
  },
];

