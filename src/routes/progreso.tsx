import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, LineChart, Lock, Play, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import {
  DomainLevelBadge,
  DomainMasteryLegend,
} from "@/components/progress/DomainMasteryLegend";
import { StudyPlanCard } from "@/components/progress/StudyPlanCard";
import { UnitAnalytics } from "@/components/progress/UnitAnalytics";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DOMAINS } from "@/data/mockData";
import { useCurrentUser, useErrorTypeStats, useTaskMastery } from "@/hooks/useCandidateData";
import { ERROR_TYPE_LABELS, ERROR_TYPE_SHORT } from "@/lib/errorTypes";
import { buildStudyPlan } from "@/lib/studyPlan";
import { getRecommendedSession, getScoreTrend } from "@/services/progressService";
import { useQuery } from "@tanstack/react-query";


export const Route = createFileRoute("/progreso")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mi progreso · Analítica por tarea ECO 2026" },
      {
        name: "description",
        content:
          "Analítica granular de dominio por tarea ECO 2026, evolución histórica y recomendación de próxima sesión de estudio.",
      },
      { property: "og:title", content: "Mi progreso · Analítica PMP por tarea ECO" },
      { property: "og:description", content: "Dominio por tarea ECO 2026 y recomendaciones de estudio." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ProgressPage />
    </RequireAuth>
  ),
});

function ProgressPage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: taskMastery = [] } = useTaskMastery();
  const { data: stats = [] } = useErrorTypeStats();
  const { data: trend = [] } = useQuery({
    queryKey: ["score-trend"],
    queryFn: () => getScoreTrend(8),
    staleTime: 60_000,
  });
  const { data: recommended } = useQuery({
    queryKey: ["recommended-session"],
    queryFn: getRecommendedSession,
    staleTime: 60_000,
  });

  const isPremium = user?.plan === "premium_6m" || user?.plan === "premium_1m";
  const errorStats = [...stats].sort((a, b) => b.occurrences - a.occurrences);
  const maxErrors = Math.max(...errorStats.map((s) => s.occurrences), 1);
  const studyPlan = buildStudyPlan(stats);

  if (isLoading || !user) {
    return (
      <AppShell title="Mi progreso" subtitle="Cargando tu analítica…">
        <div className="mx-auto max-w-5xl space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      </AppShell>
    );
  }


  return (
    <AppShell title="Mi progreso" subtitle="Analítica de brecha por dominio y tarea ECO">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border border-accent bg-warning-soft p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-accent-foreground">Próxima sesión recomendada</h2>
              {!recommended ? (
                <p className="mt-1 text-sm leading-relaxed text-accent-foreground/90">
                  Completa una práctica parcial o un simulacro para que podamos recomendarte la
                  próxima sesión con tus datos reales.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-sm leading-relaxed text-accent-foreground/90">
                    Practica {recommended.questionCount} preguntas repartidas en{" "}
                    {recommended.tasks.length} tareas priorizadas por recencia, fallos recientes y
                    tendencia semanal. Duración estimada: {recommended.estimatedMinutes} minutos.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {recommended.tasks.map((t) => (
                      <li
                        key={t.taskId}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent/40 bg-card/60 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-accent-foreground">
                            <span className="num mr-2 text-accent-foreground/70">{t.code}</span>
                            {t.title}
                          </p>
                          <p className="mt-0.5 text-xs leading-snug text-accent-foreground/75">
                            {t.reasons.join(" · ")}
                          </p>
                        </div>
                        <Link
                          to="/practica"
                          search={{ tareas: t.taskId, origen: "recomendacion" as const }}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Practicar esta tarea
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/practica"
                    search={{
                      tareas: recommended.tasks.map((t) => t.taskId).join(","),
                      origen: "recomendacion" as const,
                    }}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar sesión recomendada ({recommended.questionCount} preguntas)
                  </Link>
                </>
              )}

            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Dominio por área ECO</h2>
            <DomainMasteryLegend />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {DOMAINS.map((d) => (
              <div key={d.code} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{d.name}</p>
                  <DomainLevelBadge pct={user.masteryByDomain[d.code]} />
                </div>
                <p className="num mt-2 font-display text-3xl font-bold">
                  {user.masteryByDomain[d.code]}%
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${user.masteryByDomain[d.code]}%`, background: `var(--${d.token})` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">Peso en el examen: {d.weight}%</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Evolución del nivel de preparación</h2>
          </div>
          {trend.length < 2 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Necesitas al menos dos exámenes finalizados (prácticas parciales o simulacros) para ver
              tu evolución.
            </p>
          ) : (
            <>
              <svg viewBox="0 0 300 90" className="mt-4 w-full" role="img" aria-label="Evolución de preparación">
                <polyline
                  points={trend
                    .map((t, i) => `${10 + (i * 280) / (trend.length - 1)},${80 - (t.score / 100) * 70}`)
                    .join(" ")}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {trend.map((t, i) => (
                  <circle
                    key={i}
                    cx={10 + (i * 280) / (trend.length - 1)}
                    cy={80 - (t.score / 100) * 70}
                    r="3"
                    fill="var(--accent)"
                  />
                ))}
              </svg>
              <div className="num mt-1 flex justify-between text-[10px] text-muted-foreground">
                {trend.map((t, i) => (
                  <span key={i}>{t.label}</span>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Últimos {trend.length} exámenes finalizados · {trend[trend.length - 1].score - trend[0].score >= 0 ? "+" : ""}
                {trend[trend.length - 1].score - trend[0].score} puntos
              </p>
            </>
          )}
        </section>

        <section className="relative rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Dominio por tarea ECO</h2>
          <div className="mt-4 space-y-3">
            {taskMastery.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Todavía no hay datos por tarea. Completa una práctica para empezar a medir tu
                dominio.
              </p>
            )}
            {taskMastery.map((t) => (
              <div key={t.code} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    <span className="num mr-2 text-muted-foreground">{t.code}</span>
                    {t.title}
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${t.mastery}%`, background: `var(--${t.domain})` }}
                    />
                  </div>
                </div>
                <span className="num shrink-0 text-sm font-semibold">{t.mastery}%</span>
              </div>
            ))}
          </div>

          {!isPremium && (
            <div className="absolute inset-0 grid place-items-center rounded-2xl bg-card/90 backdrop-blur-sm">
              <div className="max-w-xs text-center">
                <Lock className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">Analítica por tarea (Premium)</p>
              </div>
            </div>
          )}
        </section>

        <section className="relative rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Patrón de errores por tipo</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Cuántas veces has fallado por cada causa. Te dice si tu problema es de conocimiento, de
            secuencia de acciones o de atribución de rol.
          </p>
          <div className="mt-4 space-y-3">
            {errorStats.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aún no hemos registrado patrones de error. Practica en modo formativo para
                diagnosticarlos.
              </p>
            )}
            {errorStats.map((s) => (
              <div key={s.errorType} className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm">
                    <span className="font-medium">{ERROR_TYPE_SHORT[s.errorType]}</span>
                    <span className="block text-[11px] leading-snug text-muted-foreground">
                      {ERROR_TYPE_LABELS[s.errorType]}
                    </span>
                  </p>
                  <span className="num shrink-0 text-sm font-semibold">{s.occurrences}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.round((s.occurrences / maxErrors) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!isPremium && (
            <div className="absolute inset-0 grid place-items-center rounded-2xl bg-card/90 backdrop-blur-sm">
              <div className="max-w-xs text-center">
                <Lock className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">Patrón de errores (Premium)</p>
              </div>
            </div>
          )}
        </section>

        <UnitAnalytics />

        <StudyPlanCard steps={studyPlan} />
      </div>
    </AppShell>
  );
}
