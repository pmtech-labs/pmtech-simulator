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

export const PLANS = [
  {
    code: "basica_3m" as const,
    name: "Básica",
    durationMonths: 3,
    price: 34.9,
    features: [
      { label: "Banco completo ECO 2026", included: true },
      { label: "Simulaciones de 180 preguntas", included: true },
      { label: "Clusters de caso", included: true },
      { label: "Practicum completo (hotspot, gráficos)", included: false },
      { label: "Analítica por tarea ECO", included: false },
      { label: "Motor adaptativo", included: false },
    ],
  },
  {
    code: "premium_1m" as const,
    name: "Premium 1 mes",
    durationMonths: 1,
    price: 24.9,
    tagline: "Para quien está a pocos días del examen y quiere la experiencia completa ya",
    features: [
      { label: "Banco completo ECO 2026", included: true },
      { label: "Simulaciones de 180 preguntas", included: true },
      { label: "Clusters de caso", included: true },
      { label: "Practicum completo (hotspot, gráficos)", included: true },
      { label: "Analítica por tarea ECO", included: true },
      { label: "Motor adaptativo", included: true },
    ],
  },
  {
    code: "premium_6m" as const,
    name: "Premium",
    durationMonths: 6,
    price: 54.9,
    features: [
      { label: "Banco completo ECO 2026", included: true },
      { label: "Simulaciones de 180 preguntas", included: true },
      { label: "Clusters de caso", included: true },
      { label: "Practicum completo (hotspot, gráficos)", included: true },
      { label: "Analítica por tarea ECO", included: true },
      { label: "Motor adaptativo", included: true },
    ],
  },
];
