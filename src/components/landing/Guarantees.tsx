import {
  Clock3,
  Headphones,
  KeyRound,
  LineChart,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import { Reveal } from "@/components/landing/Reveal";

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: "Qué incluye el simulador",
    text: "Banco de preguntas situacionales alineado al ECO, simulacros completos de 3 secciones con descansos, práctica por dominios y ruta de 14 lecciones.",
  },
  {
    icon: LineChart,
    title: "Diagnóstico, no solo nota",
    text: "Cada fallo se clasifica en uno de los 8 patrones de razonamiento y genera un plan de estudio priorizado con tu progreso por dominio y unidad.",
  },
  {
    icon: KeyRound,
    title: "Acceso inmediato",
    text: "Activación al instante tras la compra, desde cualquier dispositivo. Tu progreso se guarda y puedes retomar el simulacro donde lo dejaste.",
  },
  {
    icon: Clock3,
    title: "Tiempos claros",
    text: "Desde 1 mes hasta 6, con fecha de inicio y fin siempre visible (el plan Gratis no caduca). Sin renovaciones automáticas sorpresa: te avisamos antes de que caduque tu licencia de pago.",
  },
  {
    icon: Headphones,
    title: "Soporte real en español",
    text: "Dudas de contenido respondidas por formadores PMP® certificados, no por un bot. Respuesta en menos de 24 h laborables.",
  },
  {
    icon: RefreshCcw,
    title: "Contenido actualizado",
    text: "Revisamos el banco con cada cambio del ECO y del PMBOK. Las actualizaciones están incluidas mientras tu licencia esté activa.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Diagnóstico inicial",
    text: "Haces un simulacro corto y detectamos tus patrones de error dominantes.",
  },
  {
    step: "02",
    title: "Plan personalizado",
    text: "Recibes una ruta priorizada por lecciones y dominios según tus puntos débiles.",
  },
  {
    step: "03",
    title: "Práctica guiada",
    text: "Entrenas por dominio y unidad con feedback inmediato y explicaciones razonadas.",
  },
  {
    step: "04",
    title: "Simulacro y examen",
    text: "Simulacros completos con condiciones reales hasta llegar listo al día del examen.",
  },
];

export function Guarantees() {
  return (
    <section id="garantias" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-accent-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Garantías y proceso
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Sabes exactamente qué compras y cómo vas a usarlo
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sin letra pequeña: qué incluye, qué soporte tienes, cómo accedes y cuánto dura.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GUARANTEES.map((g, i) => (
          <Reveal key={g.title} delay={(i % 3) * 90} className="h-full">
            <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-accent/50">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 transition-transform duration-300 group-hover:scale-110">
                  <g.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PROCESS.map((p, i) => (
          <Reveal key={p.step} delay={i * 100} className="h-full">
            <div className="group h-full rounded-2xl border border-border bg-secondary/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-card">
              <span className="font-display text-2xl font-bold text-accent transition-transform duration-300 group-hover:scale-110 inline-block">
                {p.step}
              </span>
              <h3 className="mt-3 font-display text-sm font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
