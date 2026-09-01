import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock3,
  Flame,
  Layers,
  Target,
  Timer,
} from "lucide-react";

import { AppShell, useExamStartPrompt } from "@/components/AppShell";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { RecommendationsCard } from "@/components/dashboard/RecommendationsCard";
import { DomainLevelBadge, DomainMasteryLegend } from "@/components/progress/DomainMasteryLegend";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DOMAINS } from "@/data/mockData";
import { useCurrentUser } from "@/hooks/useCandidateData";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel del alumno · Simulador PMP® ECO 2026" },
      {
        name: "description",
        content:
          "Panel de preparación PMP® calibrado al ECO 2026: nivel de preparación, simulaciones de 180 preguntas y práctica por dominios.",
      },
      { property: "og:title", content: "Panel del alumno · Simulador PMP® ECO 2026" },
      {
        property: "og:description",
        content: "Tu progreso, simulaciones completas y práctica por dominios ECO 2026.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

function Ring({ value }: { value: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 110 110" className="h-28 w-28 shrink-0 -rotate-90">
      <circle cx="55" cy="55" r={r} fill="none" stroke="var(--border)" strokeWidth="9" />
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
      />
    </svg>
  );
}

/** Tarjeta de inicio de simulación: abre el mismo aviso previo que el sidebar.
 * Muestra el contador "X de Y usados" cuando el plan tiene límite (1/3 meses);
 * "Ilimitados" cuando no lo tiene (6 meses, fullSimLimit=null). */
function StartSimCard({ fullSimUsed, fullSimLimit }: { fullSimUsed: number; fullSimLimit: number | null }) {
  const examPrompt = useExamStartPrompt();
  return (
    <Link
      to="/examen"
      onClick={(e) => {
        if (examPrompt) {
          e.preventDefault();
          examPrompt();
        }
      }}
      className="group flex flex-col justify-between rounded-2xl border border-border bg-primary p-5 text-primary-foreground transition-transform hover:-translate-y-0.5"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <Target className="h-5 w-5 text-accent" />
          <span className="rounded-full bg-primary-foreground/10 px-2.5 py-1 text-[11px] font-bold text-primary-foreground/80">
            {fullSimLimit === null ? "Ilimitados" : `${fullSimUsed} de ${fullSimLimit} usados`}
          </span>
        </div>
        <h3 className="mt-3 text-base font-semibold">Iniciar simulación completa</h3>
        <p className="mt-1 text-sm text-primary-foreground/70">
          180 preguntas · 240 minutos · estructura oficial con bloque de casos y 2 descansos.
        </p>
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
        Comenzar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** Plan de pago con límite de simulacros completos (1 o 3 meses) ya agotado --
 * distinto de FullSimNotIncludedCard (plan free, nunca incluido) y de
 * HalfSimUsedCard (regalo de una sola vez): aquí sí tenía cupo, se ha
 * consumido. El objetivo de negocio es empujar hacia el plan de 6 meses, que
 * es donde queremos que migren todos los usuarios (simulacros ilimitados). */
function FullSimLimitReachedCard({ fullSimLimit }: { fullSimLimit: number }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-primary/90 p-5 text-primary-foreground">
      <div>
        <div className="flex items-start justify-between gap-2">
          <Target className="h-5 w-5 text-accent" />
          <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
            {fullSimLimit} de {fullSimLimit} usados
          </span>
        </div>
        <h3 className="mt-3 text-base font-semibold">Simulacro completo</h3>
        <p className="mt-1 text-sm text-primary-foreground/70">
          Ya usaste los {fullSimLimit} simulacros completos incluidos en tu plan actual. Pasa al
          plan de 6 meses para simulacros ilimitados.
        </p>
      </div>
      <Link
        to="/checkout"
        search={{ plan: "premium_6m" }}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
      >
        Pasar a simulacros ilimitados <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/** Plan gratuito: el simulacro completo (180 preguntas) NUNCA está incluido, ni una vez
 * -- no es "ya lo usaste", es "no forma parte de este plan". Distinto del medio examen,
 * que sí es el regalo real de una sola vez. */
function FullSimNotIncludedCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-primary/90 p-5 text-primary-foreground">
      <div>
        <div className="flex items-start justify-between gap-2">
          <Target className="h-5 w-5 text-accent" />
          <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
            No incluido en el plan gratuito
          </span>
        </div>
        <h3 className="mt-3 text-base font-semibold">Simulacro completo</h3>
        <p className="mt-1 text-sm text-primary-foreground/70">
          El plan gratuito no incluye el simulacro completo (180 preguntas). Tu regalo es un
          medio examen (90 preguntas) — la práctica por dominio, lección y acumulativa sigue
          disponible sin límite.
        </p>
      </div>
      <Link
        to="/checkout"
        search={{ plan: "premium_6m" }}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
      >
        Mejorar mi plan <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/** Medio examen: 90 preguntas / 2 h, sin bloques ni descansos. */
function StartHalfSimCard() {
  return (
    <Link
      to="/examen"
      search={{ modo: "half_sim" as const }}
      className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5"
    >
      <div>
        <Timer className="h-5 w-5 text-muted-foreground" />
        <h3 className="mt-3 text-base font-semibold">Medio examen</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          90 preguntas · 120 minutos · mismo reparto que el examen real, sin bloques ni descansos.
        </p>
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
        Comenzar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** Plan gratuito, medio examen ya usado: el regalo era de una sola vez. */
function HalfSimUsedCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5">
      <div>
        <div className="flex items-start justify-between gap-2">
          <Timer className="h-5 w-5 text-muted-foreground" />
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
            Ya usado — mejora tu plan
          </span>
        </div>
        <h3 className="mt-3 text-base font-semibold">Medio examen</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ya usaste tu medio examen de regalo (90 preguntas) del plan gratuito. La práctica por
          dominio, lección y acumulativa sigue disponible sin límite.
        </p>
      </div>
      <Link
        to="/checkout"
        search={{ plan: "premium_6m" }}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
      >
        Mejorar mi plan <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Dashboard() {
  const { data: u, isLoading } = useCurrentUser();

  if (isLoading || !u) {
    return (
      <AppShell title="Panel" subtitle="Cargando tu preparación…">
        <div className="mx-auto max-w-6xl space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      </AppShell>
    );
  }

  const weakest = [...DOMAINS].sort(
    (a, b) => u.masteryByDomain[a.code] - u.masteryByDomain[b.code],
  )[0];

  // Plan gratuito: el simulacro completo NUNCA está incluido (ni una vez). El regalo real
  // de una sola vez es el medio examen (90 preguntas), gateado por freeHalfSimUsed.
  const isFree = u.plan === "free";
  const halfSimBlocked = isFree && u.freeHalfSimUsed;
  // Planes de pago con límite (1 y 3 meses, fullSimLimit=2/4): una vez agotado el cupo,
  // se empuja hacia el plan de 6 meses (fullSimLimit=null=ilimitado), que es el plan al
  // que queremos que migren todos los usuarios -- no por la duración, sino por tener
  // simulacros ilimitados.
  const fullSimLimitReached = !isFree && u.fullSimLimit !== null && u.fullSimUsed >= u.fullSimLimit;

  return (
    <AppShell
      title={`Hola, ${u.name.split(" ")[0]}`}
      subtitle="Tu preparación para el examen PMP® (ECO 2026)"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-end">
          <FeedbackDialog pageContext="dashboard" />
        </div>
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
            <div className="flex items-center gap-4">
              <div className="relative grid place-items-center">
                <Ring value={u.readiness} />
                <div className="absolute text-center">
                  <p className="num font-display text-2xl font-bold">{u.readiness}%</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Listo</p>
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">Nivel de preparación</h2>
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Umbral recomendado: 75 %. Tu punto más débil ahora mismo es
                  <strong className="text-foreground"> {weakest.name}</strong> (
                  {u.masteryByDomain[weakest.code]} %).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Target, label: "Exámenes realizados", value: u.examsTaken },
                { icon: Clock3, label: "Horas entrenadas", value: `${u.hoursTrained} h` },
                { icon: Layers, label: "Preguntas resueltas", value: u.questionsAnswered },
                { icon: Flame, label: "Racha", value: `${u.streakDays} días` },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-muted/40 p-3">
                  <m.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="num mt-2 font-display text-xl font-bold">{m.value}</p>
                  <p className="text-[11px] leading-tight text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {isFree ? (
            <FullSimNotIncludedCard />
          ) : fullSimLimitReached ? (
            <FullSimLimitReachedCard fullSimLimit={u.fullSimLimit as number} />
          ) : (
            <StartSimCard fullSimUsed={u.fullSimUsed} fullSimLimit={u.fullSimLimit} />
          )}

          {halfSimBlocked ? <HalfSimUsedCard /> : <StartHalfSimCard />}

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <Layers className="h-5 w-5 text-muted-foreground" />
                <h3 className="mt-3 text-base font-semibold">Prácticas parciales</h3>
              </div>
              <DomainMasteryLegend />
            </div>
            <div className="mt-3 space-y-2">
              {DOMAINS.map((d) => (
                <Link
                  key={d.code}
                  to="/examen"
                  search={{ modo: "domain_drill" as const, dominio: d.code, preguntas: 10 }}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  <span className="min-w-0 truncate">{d.name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="num text-xs text-muted-foreground">
                      {u.masteryByDomain[d.code]}%
                    </span>
                    <DomainLevelBadge pct={u.masteryByDomain[d.code]} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </section>

        <RecommendationsCard masteryByDomain={u.masteryByDomain} />

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h3 className="truncate text-base font-semibold">Dominio por área ECO</h3>
            <Link
              to="/progreso"
              className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Analítica
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {DOMAINS.map((d) => (
              <div key={d.code}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{d.name}</span>
                  <span className="num text-muted-foreground">
                    {u.masteryByDomain[d.code]}% · peso examen {d.weight}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${u.masteryByDomain[d.code]}%`,
                      background: `var(--${d.token})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
