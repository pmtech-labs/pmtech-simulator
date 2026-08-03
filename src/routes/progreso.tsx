import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, LineChart, Lock, Sparkles } from "lucide-react";

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

const TREND = [52, 58, 57, 63, 66, 68];

function ProgressPage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: taskMastery = [] } = useTaskMastery();
  const { data: stats = [] } = useErrorTypeStats();

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
          <svg viewBox="0 0 300 90" className="mt-4 w-full" role="img" aria-label="Evolución de preparación">
            <polyline
              points={TREND.map((v, i) => `${10 + i * 56},${80 - (v / 100) * 70}`).join(" ")}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {TREND.map((v, i) => (
              <circle key={i} cx={10 + i * 56} cy={80 - (v / 100) * 70} r="3" fill="var(--accent)" />
            ))}
          </svg>
          <p className="mt-1 text-xs text-muted-foreground">Últimas 6 semanas · +16 puntos</p>
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



        <section className="rounded-2xl border border-accent bg-warning-soft p-5">

          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
            <div>
              <h2 className="text-sm font-semibold text-accent-foreground">Próxima sesión recomendada</h2>
              <p className="mt-1 text-sm leading-relaxed text-accent-foreground/90">
                20 preguntas de <strong>Entorno de negocio · Tareas 2 y 6</strong> (48 % y 52 % de
                dominio) más un cluster de caso híbrido. Duración estimada: 35 minutos.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
