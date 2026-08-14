import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Handshake,
  ListChecks,
  Menu,
  Puzzle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AuthNavStatus } from "@/components/AuthNavStatus";
import { TryFreeButton } from "@/components/TryFreeButton";
import { AboutUs } from "@/components/landing/AboutUs";
import { SocialProof } from "@/components/landing/SocialProof";
import { NewsletterSignup } from "@/components/landing/NewsletterSignup";
import { Guarantees } from "@/components/landing/Guarantees";
import { LeadWizard } from "@/components/landing/LeadWizard";
import { HeaderNav, MobileNav } from "@/components/landing/HeaderNav";
import { Reveal } from "@/components/landing/Reveal";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import diagnosticAbstract from "@/assets/diagnostic-abstract.jpg";
import trainingSession from "@/assets/training-session.jpg";

import { TrainingContactForm } from "@/components/landing/TrainingContactForm";
import { PlanCta } from "@/components/landing/PlanCta";
import { PLANS } from "@/services/checkoutService";
import { HOME_FAQS } from "@/data/faq";


const SITE_URL = "https://pmtech-simulator.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Simulador PMP en español · Examen ECO 2026 y PMBOK 8",
      },
      {
        name: "description",
        content:
          "Simulador PMP en español que diagnostica por qué fallas: 8 tipos de error, mastery por las 26 tareas del ECO 2026, ruta de 14 lecciones y plan de estudio personalizado.",

      },
      {
        property: "og:title",
        content: "Simulador PMP en español · Examen ECO 2026 y PMBOK 8",
      },
      {
        property: "og:description",
        content:
          "Casos reales, diagnóstico por tipo de error y motor adaptativo — más formación PMP de 35 horas y boletín de gestión de proyectos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Simulador PMP en español · ECO 2026" },
      {
        name: "twitter:description",
        content:
          "Prepara el examen PMP con simulacros calibrados al ECO 2026 y diagnóstico real de tus errores.",
      },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "PMTech Simulator",
              url: SITE_URL,
              description:
                "Simulador de examen PMP y formación en dirección de proyectos en español, calibrado al ECO 2026.",
              areaServed: ["ES", "MX", "CO", "AR", "CL", "PE"],
              sameAs: [
                "https://www.linkedin.com/in/isaaclopezpena/",
                "https://isaaclopezpena.com/",
              ],
              founder: {
                "@type": "Person",
                name: "Isaac López Pena",
                jobTitle: "Consultor y formador en dirección de proyectos, agilidad y PMO",
                url: "https://www.linkedin.com/in/isaaclopezpena/",
                sameAs: ["https://www.linkedin.com/in/isaaclopezpena/"],
                alumniOf: "The George Washington University",
                hasCredential: ["PMP®", "PMO-CP®", "PSM®", "CSM®", "KMP®", "ITIL®"],
              },
            },

            {
              "@type": "WebSite",
              name: "PMTech Simulator",
              url: SITE_URL,
              inLanguage: "es",
            },
            {
              "@type": "Course",
              name: "Preparación PMP® — 35 horas de formación",
              description:
                "Formación oficial de 35 horas de contacto para cumplir el requisito de PMI y preparar el examen PMP según el ECO 2026.",
              provider: {
                "@type": "Organization",
                name: "PMTech Simulator",
                url: SITE_URL,
              },
              inLanguage: "es",
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: LandingPage,
});


const STATS = [
  { value: "26", label: "tareas del ECO 2026 cubiertas" },
  { value: "180", label: "preguntas por simulacro completo" },
  { value: "3", label: "secciones cronometradas reales" },
  { value: "8", label: "tipos de error diagnosticados" },
];

const FEATURES = [
  {
    icon: Target,
    title: "Diagnóstico de 8 tipos de error",
    description:
      "Secuencia, rol, enfoque, lectura, análisis, interpretación, conocimiento y tiempo. Sabrás si fallaste por no saber el concepto o por actuar antes de analizar — que es lo que realmente suspende el examen.",
  },
  {
    icon: TrendingUp,
    title: "Plan de estudio generado por tus errores",
    description:
      "Tu patrón de fallos se convierte en una lista priorizada de qué practicar primero, con el botón «Repasar mis errores» que reconstruye una serie solo con tus puntos débiles reales.",
  },
  {
    icon: ListChecks,
    title: "Ruta de 14 lecciones con desbloqueo por dominio",
    description:
      "No es un banco de preguntas suelto: un temario secuenciado donde el simulacro acumulativo solo se abre cuando superas el 60 % de dominio en las lecciones previas. Se aprueba avanzando, no repitiendo tests.",
  },
  {
    icon: ClipboardList,
    title: "Mastery por cada una de las 26 tareas ECO",
    description:
      "Medimos tu nivel tarea por tarea —no solo por dominio general— y lo cruzamos con tu evolución en el tiempo. Puedes tener un 78 % global y un agujero crítico en una sola tarea: aquí lo ves.",
  },
  {
    icon: Sparkles,
    title: "Motor adaptativo: practica más lo que peor llevas",
    description:
      "Cuando practicas por dominio o por lección, el sistema prioriza automáticamente las tareas ECO donde tienes menos dominio real — sin dejar de repasar lo que ya sabes. No es un banco de preguntas al azar, es una cola priorizada por tu propio historial.",
  },
  {
    icon: ShieldCheck,
    title: "Nota honesta: nuevas vs. repetidas",
    description:
      "Cada resultado indica cuántas preguntas ya habías visto y avisa si tu puntuación está inflada por repetición. Es el dato que ningún competidor te muestra porque no le favorece.",
  },
  {
    icon: Puzzle,
    title: "Escenarios encadenados y explicación de cada distractor",
    description:
      "Casos con varias preguntas sobre el mismo contexto, y explicaciones que no solo justifican la correcta: te dicen por qué cada alternativa era prematura, de otro rol o del enfoque equivocado.",
  },
  {
    icon: Timer,
    title: "Simulacro completo o medio examen, tú eliges",
    description:
      "180 preguntas en 4 horas con la estructura real del examen, o 90 preguntas en 2 horas con los mismos criterios de reparto — para cuando no puedes permitirte una sesión completa pero quieres presión real, no una práctica cualquiera.",
  },
];

const PARTNER_BENEFITS = [
  {
    icon: BarChart3,
    title: "Panel de progreso de tus alumnos",
    description:
      "Ves en qué dominios y tareas ECO falla cada grupo para ajustar tus sesiones con datos, no con intuición.",
  },
  {
    icon: Users,
    title: "Licencias por volumen desde 5 plazas",
    description:
      "Desde pequeños grupos hasta convocatorias de cientos de alumnos, con descuento progresivo y facturación única.",
  },
  {
    icon: Rocket,
    title: "Simulador nativo ECO 2026 / PMBOK 8",
    description:
      "No es un banco antiguo remapeado: tus alumnos practican exactamente lo que se les va a preguntar desde julio de 2026.",
  },
  {
    icon: Handshake,
    title: "Soporte y alta en el mismo día",
    description:
      "Nosotros mantenemos el contenido y atendemos al alumno. Tú solo repartes las plazas y sigues el avance.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Elige tu plan",
    description: "Básica o Premium, según cuánta profundidad analítica necesitas.",
  },
  {
    number: "02",
    title: "Practica por lección",
    description: "Sigue la ruta de aprendizaje o refuerza el dominio ECO donde más fallas.",
  },
  {
    number: "03",
    title: "Haz el simulacro completo",
    description:
      "180 preguntas, 240 minutos, estructura y presión idénticas al examen real. ¿Menos tiempo? Prueba el medio examen: 90 preguntas, 2 horas, mismo rigor.",
  },
  {
    number: "04",
    title: "Corrige con criterio",
    description: "Cada fallo, explicado por tipo de error — no solo por la respuesta correcta.",
  },
];

const FAQS = HOME_FAQS.map((f) => ({ id: f.id, q: f.q, a: f.a }));



function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="shrink-0 min-w-fit w-max">
            <p className="whitespace-nowrap font-display text-sm font-semibold leading-tight">PMTech Simulator</p>
            <p className="whitespace-nowrap text-[11px] leading-tight text-muted-foreground">ECO 2026 · PMBOK 8</p>
          </div>
        </div>

        <div className="hidden items-center gap-5 xl:flex">
          <HeaderNav onHome />

          <div className="flex items-center gap-3">
            <AuthNavStatus />
            <TryFreeButton />
          </div>
        </div>

        <button
          className="grid h-9 w-9 place-items-center rounded-lg border border-border xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="max-h-[75vh] overflow-y-auto border-t border-border bg-card px-4 py-4 xl:hidden">
          <MobileNav onHome onNavigate={() => setOpen(false)} />
          <div className="mt-5 flex w-fit items-center gap-3">
            <AuthNavStatus onClick={() => setOpen(false)} />
            <TryFreeButton onClick={() => setOpen(false)} />
          </div>
        </div>
      )}

    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary">
      {/* Decoración sutil sobre fondo primario sólido */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--hero-muted) 1px, transparent 1px), linear-gradient(to bottom, var(--hero-muted) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          {/* Columna de texto */}
          <div className="max-w-xl lg:max-w-none">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hero-foreground/20 bg-hero-foreground/10 px-3 py-1 text-xs font-semibold text-hero-foreground shadow-lift backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-accent" />
                ECO 2026 · PMBOK 8
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-5 text-pretty font-display text-[1.9rem] font-bold leading-[1.12] tracking-tight text-hero-foreground drop-shadow-sm sm:text-[2.25rem] lg:text-[2.5rem]">
                Descubre{" "}
                <span className="relative inline-block text-accent">
                  por qué fallas
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-accent via-accent/70 to-transparent" />
                </span>{" "}
                en el PMP, no solo cuánto
              </h1>
            </Reveal>

            <Reveal delay={150}>
              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-hero-muted sm:text-lg">
                8 tipos de error, 26 tareas ECO 2026 y un plan de estudio personalizado para
                reforzar lo que realmente te suspende.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
                <TryFreeButton size="lg" className="shadow-panel transition-all duration-300 hover:shadow-[0_18px_40px_-16px_var(--accent)]" />
                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 rounded-lg border border-hero-foreground/25 bg-hero-foreground/10 px-5 py-2.5 text-sm font-semibold text-hero-foreground backdrop-blur transition-colors hover:bg-hero-foreground/20"
                >
                  Cómo funciona
                </a>
              </div>
              <p className="mt-3 text-xs text-hero-muted/80">
                Sin permanencia · Cancela cuando quieras · Licencias para 1, 3 o 6 meses
              </p>
              <p className="mt-2 text-xs text-hero-muted/80">
                ¿Eres centro de formación?{" "}
                <Link
                  to="/partners"
                  className="font-semibold text-hero-foreground underline underline-offset-4 transition-colors hover:text-accent"
                >
                  Descubre nuestro programa de partners
                </Link>
              </p>
            </Reveal>

            {/* Stats en fila horizontal */}
            <Reveal delay={300}>
              <div className="mt-8 flex flex-wrap gap-5 sm:gap-7">
                {STATS.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="num font-display text-2xl font-bold text-hero-foreground sm:text-3xl">
                      {s.value}
                    </span>
                    <span className="max-w-[100px] text-[11px] leading-tight text-hero-muted/90">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Columna visual: mockup flotante nítido */}
          <Reveal delay={180} className="relative">
            <div className="relative mx-auto max-w-xl lg:max-w-none">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-accent/20 blur-3xl" />
              <figure className="group relative overflow-hidden rounded-2xl border border-hero-foreground/15 bg-hero-foreground/5 shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src={heroDashboard}
                  alt="Panel de analítica del simulador PMP con dominio por tareas ECO y patrón de errores"
                  width={1408}
                  height={1008}
                  fetchPriority="high"
                  className="w-full transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </figure>
              <div className="pointer-events-none absolute -bottom-8 -right-8 hidden h-40 w-40 rounded-full bg-accent/30 blur-2xl lg:block" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            <Reveal>
              <div className="h-full rounded-2xl border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-panel">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  El problema
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  Hacer 1.000 preguntas no te dice por qué fallas
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Los simuladores te devuelven un porcentaje y la letra correcta. Pero suspender el
                  PMP casi nunca es falta de teoría: es elegir la acción válida en el momento
                  equivocado, decidir por alguien que no te corresponde o aplicar lógica predictiva
                  en un contexto ágil. Un número de aciertos no distingue nada de eso — y repetir
                  preguntas que ya conoces infla tu nota y te da una falsa sensación de estar listo.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="relative h-full overflow-hidden rounded-2xl border border-accent/40 bg-card p-6 shadow-panel">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/15 blur-2xl" />
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                  La solución
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  Un motor de diagnóstico del razonamiento, no un banco de preguntas
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Cada fallo se clasifica en uno de los 8 tipos de error (secuencia, rol, enfoque,
                  lectura, análisis, interpretación, conocimiento, tiempo) y se acumula en tu
                  perfil. De ahí sale tu plan de estudio, tu dominio en cada una de las 26 tareas
                  del ECO y tu ruta de 14 lecciones. Además te decimos cuántas preguntas eran
                  nuevas y cuántas repetidas, para que tu nota signifique algo.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <figure className="group overflow-hidden rounded-3xl border border-border shadow-panel">
              <img
                src={diagnosticAbstract}
                alt="Representación del árbol de decisión del razonamiento PMP con la ruta correcta destacada"
                loading="lazy"
                width={1200}
                height={912}
                className="w-full transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="caracteristicas" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Lo que hace diferente a este simulador
          </h2>
          <p className="mt-3 text-muted-foreground">
            No es marketing — es arquitectura. Cada punto de abajo existe en el producto, no en la
            promesa.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 90}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-panel">
              <div className="pointer-events-none absolute inset-x-0 -top-24 h-32 bg-gradient-to-b from-accent/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary transition-colors duration-300 group-hover:bg-accent/20">
                <f.icon className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Cómo funciona
            </h2>
            <p className="mt-3 text-muted-foreground">De cero a examen, en cuatro pasos claros.</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 100}>
              <div className="group relative h-full rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-panel">
                <span className="num font-display text-3xl font-bold text-border transition-colors duration-300 group-hover:text-accent">
                  {step.number}
                </span>
                <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/40 lg:block" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="precios" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Planes simples, sin letra pequeña
          </h2>
          <p className="mt-3 text-muted-foreground">
            Elige según cuánta profundidad de diagnóstico necesitas. Cambia de plan cuando quieras.
          </p>
        </div>
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="h-full">
          <div className="relative h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-panel">
            <h3 className="text-base font-semibold">Gratis</h3>
            <p className="mt-1 text-xs text-muted-foreground">Sin tarjeta · practica sin límite de tiempo</p>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="num font-display text-4xl font-bold">0 €</span>
              <span className="text-sm text-muted-foreground">/ siempre</span>
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                { label: "Práctica ilimitada por dominio y lección", included: true },
                { label: "Simulacros acumulativos por unidad", included: true },
                { label: "1 medio simulacro de regalo (90 preguntas)", included: true },
                { label: "Practicum completo (hotspot, gráficos)", included: false },
                { label: "Analítica por tarea ECO", included: false },
                { label: "Motor adaptativo", included: false },
              ].map((f) => (
                <li
                  key={f.label}
                  className={
                    f.included
                      ? "flex items-start gap-2 text-sm"
                      : "flex items-start gap-2 text-sm text-muted-foreground/50"
                  }
                >
                  <CheckCircle2
                    className={
                      f.included
                        ? "mt-0.5 h-4 w-4 shrink-0 text-success"
                        : "mt-0.5 h-4 w-4 shrink-0"
                    }
                  />
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>
            <TryFreeButton
              size="lg"
              className="mt-6 w-full rounded-lg border border-border bg-secondary text-accent-foreground transition-colors hover:bg-secondary/70"
            />
          </div>
        </Reveal>
        {PLANS.map((plan, i) => {
          const isPremium = plan.code === "premium_6m";
          return (
            <Reveal key={plan.code} delay={i * 120} className="h-full">
            <div
              className={
                isPremium
                  ? "relative h-full rounded-2xl border-2 border-accent bg-card p-6 shadow-panel transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_var(--accent)]"
                  : "relative h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-panel"
              }
            >
              {isPremium && (
                <>
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/15 blur-2xl" />
                  </div>
                  <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
                    Recomendado
                  </span>
                </>
              )}
              <h3 className="text-base font-semibold">{plan.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan.tagline ?? `Licencia de ${plan.durationMonths} meses`}
              </p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="num font-display text-4xl font-bold">
                  {plan.price.toFixed(2).replace(".", ",")} €
                </span>
                <span className="text-sm text-muted-foreground">
                  / {plan.durationMonths === 1 ? "1 mes" : `${plan.durationMonths} meses`}
                </span>
              </p>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f.label}
                    className={
                      f.included
                        ? "flex items-start gap-2 text-sm"
                        : "flex items-start gap-2 text-sm text-muted-foreground/50"
                    }
                  >
                    <CheckCircle2
                      className={
                        f.included
                          ? "mt-0.5 h-4 w-4 shrink-0 text-success"
                          : "mt-0.5 h-4 w-4 shrink-0"
                      }
                    />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>

              <PlanCta
                planCode={plan.code}
                label={`Elegir ${plan.name}`}
                className={
                  isPremium
                    ? "mt-6 flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
                    : "mt-6 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/70"
                }
              />
            </div>
            </Reveal>
          );
        })}
      </div>

      <p className="mx-auto mt-6 max-w-lg text-center text-xs text-muted-foreground">
        Precios en EUR, impuestos no incluidos. Puedes cancelar o hacer upgrade en cualquier
        momento desde tu perfil.
      </p>

      <Reveal>
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <h3 className="font-display text-lg font-semibold">¿Necesitas licencias para tu centro o empresa?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Descuentos por volumen, panel de seguimiento del progreso y propuesta en 48 horas.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Ver programa de partners <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/partners"
              hash="contacto"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/70"
            >
              Solicitar propuesta
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}


function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Preguntas frecuentes
        </h2>
      </div>
      <Accordion type="single" collapsible className="mt-10">
        {FAQS.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-sm font-semibold">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>{item.a}</p>
              <Link
                to="/faq"
                hash={item.id}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent-foreground underline-offset-4 hover:underline"
              >
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-8 text-center">
        <Link
          to="/faq"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          Ver todas las preguntas frecuentes <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>

  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          <ClipboardList className="mx-auto h-10 w-10 text-accent" />
          <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
            Deja de practicar para un examen que ya no existe
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/70">
            Empieza hoy con el único simulador en español calibrado al ECO 2026 desde el primer
            día.
          </p>
          <TryFreeButton
            size="lg"
            className="mt-6 px-6 py-3 transition-all duration-300 hover:shadow-[0_18px_40px_-16px_var(--accent)]"
          />
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <p className="font-display text-sm font-semibold">PMTech Simulator</p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:items-end">
            <div className="flex items-center gap-3">
              <AuthNavStatus className="text-xs px-2.5 py-1.5" />
              <TryFreeButton size="sm" />
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground sm:justify-end">
              <a href="#caracteristicas" className="hover:text-foreground">
                Características
              </a>
              <a href="#opiniones" className="hover:text-foreground">
                Opiniones
              </a>
              <a href="#sobre-nosotros" className="hover:text-foreground">
                Sobre nosotros
              </a>
              <a href="#precios" className="hover:text-foreground">
                Precios
              </a>

              <a href="#formacion" className="hover:text-foreground">
                Formación PMP
              </a>
              <a href="#garantias" className="hover:text-foreground">
                Garantías
              </a>
              <a href="#contacto" className="hover:text-foreground">
                Contacto
              </a>
              <a href="#boletin" className="hover:text-foreground">
                Boletín
              </a>
              <Link to="/faq" className="hover:text-foreground">
                FAQ
              </Link>

              <Link to="/certificacion-pmp" className="hover:text-foreground">
                Certificación PMP
              </Link>
              <Link to="/examen-pmp" className="hover:text-foreground">
                Examen PMP
              </Link>
              <Link to="/simulador-examen-pmp" className="hover:text-foreground">
                Simulador PMP
              </Link>
              <Link to="/requisitos-pmp" className="hover:text-foreground">
                Requisitos y precio
              </Link>
              <Link to="/curso-pmp-online" className="hover:text-foreground">
                Curso PMP online
              </Link>
              <Link to="/partners" className="hover:text-foreground">
                Partners y empresas
              </Link>
              <Link to="/glosario" className="hover:text-foreground">
                Glosario PMP
              </Link>
              <Link to="/pmbok-8" className="hover:text-foreground">
                PMBOK 7 vs 8
              </Link>
              <Link to="/pmtech-vs-pmi-study-hall" className="hover:text-foreground">
                vs PMI Study Hall
              </Link>
            <Link to="/pmtech-vs-prepcast" className="hover:text-foreground">
                vs PrepCast
              </Link>
            </nav>
            <nav className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground sm:justify-end">
              <Link to="/aviso-legal" className="hover:text-foreground">
                Aviso legal
              </Link>
              <Link to="/politica-de-privacidad" className="hover:text-foreground">
                Privacidad
              </Link>
              <Link to="/terminos-y-condiciones" className="hover:text-foreground">
                Términos y condiciones
              </Link>
              <Link to="/politica-de-cookies" className="hover:text-foreground">
                Cookies
              </Link>
            </nav>
          </div>
        </div>
        <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
          PMTech Simulator es un producto independiente. No está afiliado, avalado ni
          patrocinado por el Project Management Institute (PMI)®. PMP® y PMBOK® son marcas
          registradas del PMI.
        </p>
      </div>
    </footer>
  );
}

function Training() {
  return (
    <section id="formacion" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <figure className="group mb-8 overflow-hidden rounded-2xl border border-border shadow-panel">
              <img
                src={trainingSession}
                alt="Sesión de formación PMP en directo con un grupo de profesionales"
                loading="lazy"
                width={1200}
                height={912}
                className="h-56 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:h-64"
              />
            </figure>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-accent-foreground">
              <GraduationCap className="h-3.5 w-3.5 text-accent" />
              Formación PMP® · 35 horas
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Pensabas prepararte por tu cuenta?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              PMI exige 35 horas de formación en dirección de proyectos para poder
              presentarte al examen PMP. Estudiar solo con un libro es posible, pero la
              mayoría de suspensos vienen de no saber interpretar el enfoque del examen, no
              de falta de experiencia.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "35 horas de contacto acreditables para tu solicitud a PMI",
                "Sesiones en directo en español, orientadas al ECO 2026 y PMBOK 8",
                "Simulador incluido durante toda la formación",
                "Revisión de tu solicitud y de tu experiencia antes de aplicar",
                "Modalidad individual o in-company para equipos",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 transition-transform duration-300 hover:translate-x-1"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Déjanos tus datos y te enviamos programa, fechas y precio sin compromiso. Nada
              de llamadas comerciales insistentes.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/partners"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Formación in-company para equipos <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/partners"
                hash="contacto"
                className="text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline"
              >
                Solicitar propuesta para mi centro
              </Link>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <TrainingContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PartnersBenefits() {
  return (
    <section id="centros" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            Centros de formación y empresas
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Formas equipos o alumnos para el PMP?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Licencias por volumen, panel de seguimiento y el único simulador en español nativo ECO 2026.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PARTNER_BENEFITS.map((b, i) => (
          <Reveal key={b.title} delay={i * 90}>
            <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-panel">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary transition-colors duration-300 group-hover:bg-accent/20">
                <b.icon className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={360}>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/partners"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Ver programa de partners <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/partners"
            hash="contacto"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Solicitar propuesta
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function PartnersBand() {
  return (
    <section id="partners" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                Centros de formación y empresas
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                ¿Formas equipos o alumnos para el PMP?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Licencias por volumen desde 10 plazas, panel de seguimiento del progreso de tus
                alumnos y el único simulador en español nativo ECO 2026 / PMBOK 8. Ya trabajamos
                con universidades y cámaras de comercio.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/partners"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Ver programa de partners <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/partners"
                  hash="contacto"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Solicitar propuesta
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ya colaboramos con
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-5">
                <img
                  src="/partners/unir-logo.svg"
                  alt="UNIR — Universidad Internacional de La Rioja"
                  className="h-7 w-auto opacity-80 grayscale"
                />
                <img
                  src="/partners/camara-madrid-logo.png"
                  alt="Cámara de Comercio de Madrid"
                  className="h-12 w-auto opacity-80 grayscale"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section id="boletin" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Aunque todavía no te certifiques, sigue aprendiendo
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Un boletín para quien dirige proyectos de verdad: cambios del PMBOK y del ECO,
            metodologías predictivas, ágiles e híbridas, casos reales, plantillas y errores
            que se repiten en cualquier organización.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Sin spam. Baja en un clic. Tus datos no se ceden a terceros.
          </p>
        </div>
        <NewsletterSignup />
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Guarantees />
        <AboutUs />
        <Pricing />
        <Training />
        <PartnersBenefits />
        <PartnersBand />
        <FAQ />
        <Newsletter />
        <FinalCta />
        <LeadWizard />
      </main>
      <Footer />
    </div>
  );
}


