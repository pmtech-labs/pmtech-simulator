import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  ListChecks,
  Menu,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PLANS } from "@/services/checkoutService";

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
          "Simulador de examen PMP en español calibrado al ECO 2026 (PMBOK 8): 180 preguntas, casos reales, diagnóstico de errores y formación de 35 horas. Empieza hoy.",
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
    icon: BookOpenCheck,
    title: "Calibrado al ECO 2026, no al examen anterior",
    description:
      "Banco de preguntas etiquetado tarea por tarea contra el Exam Content Outline vigente (PMBOK 8, julio 2026) — People 33 %, Process 41 %, Business Environment 26 %, con el split real 40 % predictivo / 60 % ágil-híbrido.",
  },
  {
    icon: Puzzle,
    title: "Clusters de caso reales",
    description:
      "El formato nuevo del examen no es solo ABCD: un mismo escenario con varias preguntas encadenadas, exactamente como en la sección de estudio de casos del examen real.",
  },
  {
    icon: Target,
    title: "Diagnóstico por tipo de error, no solo aciertos",
    description:
      "Cuando fallas, no te decimos únicamente cuál era la respuesta correcta: identificamos si fue un error de secuencia, de rol, de enfoque, de análisis o de lectura — para que sepas qué corregir de verdad.",
  },
  {
    icon: TrendingUp,
    title: "Motor adaptativo por tarea ECO",
    description:
      "Seguimiento de tu dominio en cada una de las 26 tareas, no solo por dominio general. La práctica se prioriza sobre lo que de verdad te está fallando.",
  },
  {
    icon: Clock3,
    title: "Estructura fiel al examen oficial",
    description:
      "180 preguntas, 240 minutos, 3 secciones cronometradas independientes con sus descansos — igual que el examen real de PMI, no una aproximación genérica.",
  },
  {
    icon: ListChecks,
    title: "Ruta de aprendizaje por lección",
    description:
      "Practica lección a lección o lanza un simulacro acumulativo con todo lo visto hasta ese punto — tu progreso, no un banco de preguntas suelto.",
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
    description: "180 preguntas, 240 minutos, estructura y presión idénticas al examen real.",
  },
  {
    number: "04",
    title: "Corrige con criterio",
    description: "Cada fallo, explicado por tipo de error — no solo por la respuesta correcta.",
  },
];

const FAQS = [
  {
    q: "¿Está afiliado o avalado por PMI?",
    a: "No. PMTech Simulator es un producto independiente, no afiliado ni respaldado por el Project Management Institute (PMI)®. PMP® y PMBOK® son marcas registradas de PMI.",
  },
  {
    q: "¿El simulador garantiza que apruebe el examen?",
    a: "No, y desconfía de quien lo prometa. Es una herramienta de entrenamiento y diagnóstico que te da una estimación razonada de tu preparación real — complementa el estudio estructurado, la revisión de tus errores y tu experiencia profesional, no los sustituye.",
  },
  {
    q: "¿Puedo cambiar de plan Básica a Premium más adelante?",
    a: "Sí, puedes hacer upgrade en cualquier momento dentro de tu periodo de licencia; solo pagas la diferencia.",
  },
  {
    q: "¿Qué pasa si mi licencia caduca antes del examen?",
    a: "Puedes renovar cuando quieras. Si detectamos que tu dominio en Business Environment (el área que más pesa en el ECO 2026) sigue bajo al vencer, te avisamos — no dejamos que llegues al examen sin saberlo.",
  },
  {
    q: "¿Sirve si estoy usando otro material de estudio (Rita Mulcahy, PMBOK, etc.)?",
    a: "Sí, es el complemento natural. El simulador no sustituye la formación estructurada — está pensado para practicar y diagnosticar errores sobre lo que ya estás estudiando.",
  },
];

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight">PMTech Simulator</p>
            <p className="text-[11px] leading-tight text-muted-foreground">ECO 2026 · PMBOK 8</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#caracteristicas" className="transition-colors hover:text-foreground">
            Características
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-foreground">
            Cómo funciona
          </a>
          <a href="#precios" className="transition-colors hover:text-foreground">
            Precios
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            Preguntas frecuentes
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Iniciar sesión
          </Link>
          <a
            href="#precios"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            Empezar ahora <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <button
          className="grid h-9 w-9 place-items-center rounded-lg border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <a href="#caracteristicas" onClick={() => setOpen(false)}>
              Características
            </a>
            <a href="#como-funciona" onClick={() => setOpen(false)}>
              Cómo funciona
            </a>
            <a href="#precios" onClick={() => setOpen(false)}>
              Precios
            </a>
            <a href="#faq" onClick={() => setOpen(false)}>
              Preguntas frecuentes
            </a>
            <Link to="/dashboard" onClick={() => setOpen(false)}>
              Iniciar sesión
            </Link>
            <a
              href="#precios"
              onClick={() => setOpen(false)}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground"
            >
              Empezar ahora <ArrowRight className="h-4 w-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--secondary),_transparent_60%)]" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Calibrado al nuevo ECO de julio 2026 — PMBOK 8
          </span>
          <h1 className="mt-6 text-balance font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            El examen PMP cambió.
            <br />
            <span className="text-accent-foreground">Tu simulador, también debería.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            La mayoría de simuladores siguen anclados al examen anterior. El nuestro está
            construido desde cero sobre el ECO 2026: casos reales, diagnóstico por tipo de
            error y un motor que se adapta a lo que de verdad te falla.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#precios"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-panel transition-transform hover:-translate-y-0.5"
            >
              Ver planes y precios <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Cómo funciona
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Sin compromiso de permanencia · Cancela cuando quieras · No afiliado a PMI
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-4 text-center shadow-lift"
            >
              <p className="num font-display text-2xl font-bold text-foreground sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] leading-tight text-muted-foreground sm:text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              El problema
            </p>
            <h3 className="mt-2 text-lg font-semibold">
              El examen PMP ya no es solo ABCD — casi ningún simulador se ha puesto al día
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Desde julio de 2026 el examen incluye clusters de caso, preguntas gráficas y una
              nueva ponderación de dominios. La mayoría de bancos de preguntas en español siguen
              calibrados al ECO anterior — practicas para un examen que ya no existe.
            </p>
          </div>
          <div className="rounded-2xl border border-accent/40 bg-card p-6 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
              La solución
            </p>
            <h3 className="mt-2 text-lg font-semibold">
              Construido desde cero sobre el ECO vigente, con diagnóstico real
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Cada pregunta está etiquetada contra una de las 26 tareas del ECO 2026. Cada fallo
              se clasifica por tipo de error. No es un banco de preguntas más — es una
              herramienta que te dice exactamente qué te falta para llegar preparado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="caracteristicas" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Lo que hace diferente a este simulador
        </h2>
        <p className="mt-3 text-muted-foreground">
          No es marketing — es arquitectura. Cada punto de abajo existe en el producto, no en la
          promesa.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-panel"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary">
              <f.icon className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-3 text-muted-foreground">
            De cero a examen, en cuatro pasos claros.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative rounded-2xl border border-border bg-card p-5">
              <span className="num font-display text-3xl font-bold text-border">
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
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="precios" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Planes simples, sin letra pequeña
        </h2>
        <p className="mt-3 text-muted-foreground">
          Elige según cuánta profundidad de diagnóstico necesitas. Cambia de plan cuando quieras.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => {
          const isPremium = plan.code === "premium_6m";
          return (
            <div
              key={plan.code}
              className={
                isPremium
                  ? "relative rounded-2xl border-2 border-accent bg-card p-6 shadow-panel"
                  : "relative rounded-2xl border border-border bg-card p-6"
              }
            >
              {isPremium && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
                  Recomendado
                </span>
              )}
              <h3 className="text-base font-semibold">{plan.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Licencia de {plan.durationMonths} meses
              </p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="num font-display text-4xl font-bold">
                  {plan.price.toFixed(2).replace(".", ",")} €
                </span>
                <span className="text-sm text-muted-foreground">
                  / {plan.durationMonths} meses
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

              <Link
                to="/dashboard"
                className={
                  isPremium
                    ? "mt-6 flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
                    : "mt-6 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/70"
                }
              >
                Elegir {plan.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-6 max-w-lg text-center text-xs text-muted-foreground">
        Precios en EUR, impuestos no incluidos. Puedes cancelar o hacer upgrade en cualquier
        momento desde tu perfil.
      </p>
    </section>
  );
}

function EarlyAccess() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-accent-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Recién lanzado
        </span>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Estamos construyendo esto en abierto
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Somos de los primeros en construir un simulador calibrado desde cero al ECO 2026. Eso
          significa que quien empieza ahora está entre los primeros en probarlo — y su feedback
          da forma directamente al banco de preguntas y a las funciones que vienen.
        </p>
      </div>
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
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <div className="rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
        <ClipboardList className="mx-auto h-10 w-10 text-accent" />
        <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          Deja de practicar para un examen que ya no existe
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/70">
          Empieza hoy con el único simulador en español calibrado al ECO 2026 desde el primer
          día.
        </p>
        <a
          href="#precios"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
        >
          Ver planes <ArrowRight className="h-4 w-4" />
        </a>
      </div>
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
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
            <a href="#caracteristicas" className="hover:text-foreground">
              Características
            </a>
            <a href="#precios" className="hover:text-foreground">
              Precios
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
            <Link to="/dashboard" className="hover:text-foreground">
              Iniciar sesión
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-left">
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
          <div>
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
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Déjanos tus datos y te enviamos programa, fechas y precio sin compromiso. Nada
              de llamadas comerciales insistentes.
            </p>
          </div>
          <TrainingContactForm />
        </div>
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
        <Features />
        <HowItWorks />
        <Pricing />
        <Training />
        <EarlyAccess />
        <FAQ />
        <Newsletter />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

