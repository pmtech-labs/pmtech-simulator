import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock3,
  Flame,
  History,
  Layers,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";

import { AppShell, useExamStartPrompt } from "@/components/AppShell";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import {
  DomainLevelBadge,
  DomainMasteryLegend,
} from "@/components/progress/DomainMasteryLegend";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DOMAINS } from "@/data/mockData";
import { useCurrentUser, useExamHistory } from "@/hooks/useCandidateData";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel del alumno · Simulador PMP ECO 2026" },
      {
        name: "description",
        content:
          "Panel de preparación PMP calibrado al ECO 2026: nivel de preparación, simulaciones de 180 preguntas y práctica por dominios.",
      },
      { property: "og:title", content: "Panel del alumno · Simulador PMP ECO 2026" },
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

/** Tarjeta de inicio de simulación: abre el mismo aviso previo que el sidebar. */
function StartSimCard() {
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
        <Target className="h-5 w-5 text-accent" />
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

function Dashboard() {
  const { data: u, isLoading } = useCurrentUser();
  const { data: history = [] } = useExamHistory();

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

  // Plan gratuito: un único simulacro completo de regalo.
  const freeSimBlocked = u.plan === "free" && u.freeFullSimUsed;


  return (
    <AppShell title={`Hola, ${u.name.split(" ")[0]}`} subtitle="Tu preparación para el examen PMP (ECO 2026)">
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
          {freeSimBlocked ? (
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-primary/90 p-5 text-primary-foreground">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
                    Ya usado — mejora tu plan
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold">Simulacro completo</h3>
                <p className="mt-1 text-sm text-primary-foreground/70">
                  Ya usaste el simulacro completo de regalo del plan gratuito. La práctica por
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
          ) : (
            <StartSimCard />
          )}

          <StartHalfSimCard />

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

          <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">Historial de exámenes</h3>
            <ul className="mt-3 space-y-2">
              {history.slice(0, 3).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground">{e.mode}</span>
                  <span className="num shrink-0 font-semibold">{e.score}%</span>
                </li>
              ))}
            </ul>
            {!history.length && (
              <p className="mt-3 text-sm text-muted-foreground">Aún no has completado exámenes.</p>
            )}
            <Link
              to="/historial"
              className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-foreground hover:underline"
            >
              Ver historial completo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h3 className="truncate text-base font-semibold">Dominio por área ECO</h3>
            <Link to="/progreso" className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground">
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
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-xs leading-relaxed text-accent-foreground">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
            Recomendación: dedica la próxima sesión a <strong>{weakest.name}</strong>, tu área con
            menor dominio ({u.masteryByDomain[weakest.code]} %).
          </p>
        </section>
      </div>
    </AppShell>
  );
}
