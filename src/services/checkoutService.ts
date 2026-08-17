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
  /** Precio habitual futuro, si el precio actual es "de lanzamiento" (temporal).
   * Cuando está definido, la tarjeta de precios muestra un asterisco junto al
   * precio y una nota al pie aclarando que es un precio de lanzamiento -- nunca
   * se tacha un precio "anterior" que no se haya cobrado de verdad (evita el
   * problema legal de precios de referencia falsos bajo la normativa Ómnibus). */
  regularPrice?: number;
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
    code: "premium_1m",
    name: "1 mes",
    durationMonths: 1,
    price: 29.9,
    tagline: "Para quien está a pocos días del examen",
    fullSimLimit: 2,
    features: [
      { label: "Banco completo ECO 2026", included: true },
      fullSimFeature(2),
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
    price: 59.9,
    regularPrice: 69.9,
    tagline: "Para quien tiene tiempo suficiente para prepararse",
    fullSimLimit: 4,
    features: [
      { label: "Banco completo ECO 2026", included: true },
      fullSimFeature(4),
      { label: "Clusters de caso", included: true },
      { label: "Practicum completo (hotspot, gráficos)", included: true },
      { label: "Analítica por tarea ECO", included: true },
      { label: "Motor adaptativo", included: true },
    ],
  },
  {
    code: "premium_6m",
    name: "6 meses",
    durationMonths: 6,
    price: 89.9,
    regularPrice: 99.9,
    tagline: "Para quien necesita más tiempo\u00a0 o simulaciones ilimitadas",
    fullSimLimit: null,
    features: [
      { label: "Banco completo ECO 2026", included: true },
      fullSimFeature(null),
      { label: "Clusters de caso", included: true },
      { label: "Practicum completo (hotspot, gráficos)", included: true },
      { label: "Analítica por tarea ECO", included: true },
      { label: "Motor adaptativo", included: true },
    ],
  },
];

