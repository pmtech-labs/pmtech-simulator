import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock3,
  Flame,
  History,
  Layers,
  Target,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { DOMAINS, MOCK_EXAM_HISTORY, MOCK_USER } from "@/data/mockData";

export const Route = createFileRoute("/dashboard")({
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
  component: Dashboard,
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

function Dashboard() {
  const u = MOCK_USER;

  return (
    <AppShell title={`Hola, ${u.name.split(" ")[0]}`} subtitle="Tu preparación para el examen PMP (ECO 2026)">
      <div className="mx-auto max-w-6xl space-y-6">
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
                  Estás cerca del umbral recomendado (75 %). Tu punto débil sigue siendo
                  <strong className="text-foreground"> Entorno de negocio</strong>.
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
          <Link
            to="/examen"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-primary p-5 text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <div>
              <Target className="h-5 w-5 text-accent" />
              <h3 className="mt-3 text-base font-semibold">Iniciar simulación real</h3>
              <p className="mt-1 text-sm text-primary-foreground/70">
                180 preguntas · 240 minutos · estructura oficial con bloque de casos y 2 descansos.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              Comenzar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <div className="rounded-2xl border border-border bg-card p-5">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">Práctica por dominios</h3>
            <div className="mt-3 space-y-2">
              {DOMAINS.map((d) => (
                <Link
                  key={d.code}
                  to="/examen"
                  search={{ modo: "dominio", dominio: d.code }}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  <span className="min-w-0 truncate">{d.name}</span>
                  <span className="num shrink-0 text-xs text-muted-foreground">
                    {u.masteryByDomain[d.code]}% · {d.weight}%
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">Historial de exámenes</h3>
            <ul className="mt-3 space-y-2">
              {MOCK_EXAM_HISTORY.slice(0, 3).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground">{e.mode}</span>
                  <span className="num shrink-0 font-semibold">{e.score}%</span>
                </li>
              ))}
            </ul>
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
            Recomendación: dedica la próxima sesión a <strong>Entorno de negocio · Tarea 2</strong>
            (cambios de cumplimiento), tu tarea con menor dominio (48 %).
          </p>
        </section>
      </div>
    </AppShell>
  );
}
