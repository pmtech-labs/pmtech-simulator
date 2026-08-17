import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, CreditCard, Info, Loader2, Mail } from "lucide-react";
import { useState } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { PLANS, SALES_EMAIL, createCheckoutSession } from "@/services/checkoutService";
import { cn } from "@/lib/utils";

interface CheckoutSearch {
  plan?: string;
}

export const Route = createFileRoute("/checkout")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contratar licencia · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Resumen de tu licencia del simulador PMP: plan, duración y contenidos incluidos antes de completar la contratación.",
      },
      { property: "og:title", content: "Contratar licencia · Simulador PMP" },
      { property: "og:description", content: "Resumen del plan elegido antes de la contratación." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <CheckoutPage />
    </RequireAuth>
  ),
});

function CheckoutPage() {
  const { plan: planCode } = Route.useSearch();
  const plan = PLANS.find((p) => p.code === planCode) ?? PLANS[1];
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  const onContinue = async () => {
    setLoading(true);
    // TODO: Stripe — createCheckoutSession() debe invocar una Edge Function que cree
    // una sesión real de Stripe Checkout con client_reference_id = user.id y
    // metadata.plan_code, y redirigir a session.url. Requiere STRIPE_SECRET_KEY
    // configurada (pendiente: cuenta de Stripe propia).
    const result = await createCheckoutSession({ planCode: plan.code });
    setLoading(false);
    if (result.url) {
      window.location.href = result.url;
      return;
    }
    setPending(true);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="font-display text-xl font-bold">Resumen de tu licencia</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa el plan elegido antes de continuar.
          </p>

          <div className="mt-5 rounded-xl border border-accent bg-warning-soft/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold">Licencia {plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {plan.durationMonths === 1
                    ? "1 mes de acceso completo"
                    : `${plan.durationMonths} meses de acceso completo`}
                </p>
                {plan.tagline && (
                  <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.fullSimLimit === null
                    ? "Simulaciones completas ilimitadas"
                    : plan.fullSimLimit === 0
                      ? "No incluye simulaciones completas"
                      : `${plan.fullSimLimit} simulaciones completas incluidas`}
                </p>
              </div>
              <p className="num shrink-0 font-display text-2xl font-bold">{plan.price} €</p>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li
                  key={f.label}
                  className={cn(
                    "flex items-start gap-2 text-sm",
                    f.included ? "text-foreground" : "text-muted-foreground line-through",
                  )}
                >
                  <Check
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      f.included ? "text-success" : "text-muted-foreground/50",
                    )}
                  />
                  <span className="min-w-0">{f.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {pending ? (
            <div className="mt-5 rounded-xl border border-border bg-muted/50 p-4">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                Este paso estará disponible en cuanto activemos el cobro online. Mientras tanto,
                contacta con nosotros para activar tu licencia manualmente.
              </p>
              <a
                href={`mailto:${SALES_EMAIL}?subject=${encodeURIComponent(`Activación manual de licencia ${plan.name}`)}`}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Mail className="h-4 w-4" /> Escribir a {SALES_EMAIL}
              </a>
            </div>
          ) : (
            <button
              onClick={onContinue}
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Continuar al pago
            </button>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Precios con IVA incluido. No se realizará ningún cargo hasta que el pago online esté
            activo.
          </p>
        </div>
      </div>
    </div>
  );
}
