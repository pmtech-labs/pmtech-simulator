export interface CheckoutParams {
  planCode: "basica_3m" | "premium_6m";
}

/**
 * Punto de integración de pago aislado.
 * TODO: backend — sustituir por Stripe Checkout (Edge Function que crea la sesión).
 */
export async function createCheckoutSession({ planCode }: CheckoutParams) {
  await new Promise((r) => setTimeout(r, 900));
  return { url: null as string | null, simulated: true, planCode };
}

export const PLANS = [
  {
    code: "basica_3m" as const,
    name: "Básica",
    durationMonths: 3,
    price: 89,
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
    code: "premium_6m" as const,
    name: "Premium",
    durationMonths: 6,
    price: 149,
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
