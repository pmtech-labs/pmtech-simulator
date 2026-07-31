import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  DomainLevelBadge,
  DomainMasteryLegend,
} from "@/components/progress/DomainMasteryLegend";
import { DOMAINS, MOCK_USER } from "@/data/mockData";
import { PLANS, createCheckoutSession } from "@/services/checkoutService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil y licencia · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Gestiona tu cuenta, revisa tus estadísticas por dominio ECO y el estado de tu licencia básica o premium.",
      },
      { property: "og:title", content: "Perfil y licencia · Simulador PMP" },
      { property: "og:description", content: "Cuenta, estadísticas por dominio y estado de licencia." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckout = async (code: "basica_3m" | "premium_6m") => {
    setLoading(code);
    setMessage(null);
    // TODO: backend — redirigir a la sesión real de Stripe Checkout
    await createCheckoutSession({ planCode: code });
    setLoading(null);
    setMessage(
      code === MOCK_USER.plan
        ? "Ya tienes esta licencia activa. Renovación simulada registrada."
        : "Checkout simulado completado. La integración de pago real se conectará al backend.",
    );
  };

  return (
    <AppShell title="Perfil y licencia" subtitle="Cuenta, estadísticas y suscripción">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold">Datos de la cuenta</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Nombre</p>
                  <p className="truncate text-sm font-medium">{MOCK_USER.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Correo electrónico</p>
                  <p className="truncate text-sm font-medium">{MOCK_USER.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-success bg-success-soft px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                <div className="min-w-0">
                  <p className="text-[11px] text-success">Licencia activa</p>
                  <p className="truncate text-sm font-medium">
                    Premium 6 meses · vence el {MOCK_USER.expiresAt}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Estadísticas por dominio</h2>
              <DomainMasteryLegend />
            </div>
            <div className="mt-4 space-y-4">
              {DOMAINS.map((d) => (
                <div key={d.code}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate font-medium">{d.name}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="num text-muted-foreground">
                        {MOCK_USER.masteryByDomain[d.code]}%
                      </span>
                      <DomainLevelBadge pct={MOCK_USER.masteryByDomain[d.code]} />
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${MOCK_USER.masteryByDomain[d.code]}%`, background: `var(--${d.token})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="num mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              {MOCK_USER.examsTaken} exámenes · {MOCK_USER.questionsAnswered} preguntas ·{" "}
              {MOCK_USER.hoursTrained} h
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold">Planes disponibles</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {PLANS.map((p) => {
              const active = p.code === MOCK_USER.plan;
              return (
                <div
                  key={p.code}
                  className={cn(
                    "rounded-2xl border bg-card p-5",
                    active ? "border-accent shadow-panel" : "border-border",
                  )}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">Licencia {p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.durationMonths} meses de acceso</p>
                    </div>
                    {active && (
                      <span className="shrink-0 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="num mt-3 font-display text-3xl font-bold">
                    {p.price} € <span className="text-sm font-normal text-muted-foreground">IVA incl.</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f) => (
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
                  <button
                    onClick={() => handleCheckout(p.code)}
                    disabled={loading !== null}
                    className={cn(
                      "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60",
                      active
                        ? "border border-border bg-card hover:bg-secondary"
                        : "bg-primary text-primary-foreground hover:opacity-90",
                    )}
                  >
                    {loading === p.code ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    {active ? "Renovar licencia" : `Contratar ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
          {message && (
            <p className="mt-4 rounded-lg border border-border bg-muted/60 p-3 text-sm text-muted-foreground">
              {message}
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
