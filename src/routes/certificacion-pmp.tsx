import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://toppmsimulator.glacimonto.com/certificacion-pmp";
const TITLE = "Certificación PMP® 2026: guía completa en español";
const DESCRIPTION =
  "Qué es la certificación PMP®, requisitos, precio, temario del ECO 2026 y cómo prepararla en español paso a paso, con simulacros y diagnóstico de errores.";

const FAQS: SeoFaq[] = [
  {
    q: "¿Qué es la certificación PMP®?",
    a: "El Project Management Professional (PMP®) es la credencial de dirección de proyectos del Project Management Institute. Acredita que sabes dirigir proyectos en entornos predictivos, ágiles e híbridos y es la certificación de gestión de proyectos más reconocida en España y Latinoamérica.",
  },
  {
    q: "¿Cuánto vale la certificación PMP®?",
    a: "El examen cuesta 405 USD para miembros del PMI® y 555 USD para no miembros. La membresía anual (unos 139 USD más 10 USD de alta) suele salir a cuenta porque incluye el PMBOK® Guide y reduce la tasa del examen.",
  },
  {
    q: "¿Se puede hacer el examen PMP® en español?",
    a: "Sí. El PMI® ofrece ayuda de traducción al español: verás el enunciado en inglés con la traducción al español disponible en pantalla. Por eso conviene practicar con simulacros en español que reproduzcan la redacción situacional del examen real.",
  },
  {
    q: "¿Cuánto se tarda en sacar el PMP®?",
    a: "Con experiencia previa en proyectos, la mayoría de candidatos necesita entre 8 y 14 semanas: 35 horas de formación, lectura del ECO y unas 1.500-2.000 preguntas de práctica con revisión de errores.",
  },
  {
    q: "¿Caduca la certificación PMP®?",
    a: "Sí, el ciclo es de tres años y hay que acumular 60 PDU (unidades de desarrollo profesional) para renovarla, repartidas según el Triángulo de Talentos del PMI®.",
  },
];

export const Route = createFileRoute("/certificacion-pmp")({
  head: () => ({
    meta: [
      { property: "og:image", content: "https://toppmsimulator.glacimonto.com/og-image.jpg" },
      { name: "twitter:image", content: "https://toppmsimulator.glacimonto.com/og-image.jpg" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          buildSeoLandingJsonLd({
            url: URL,
            title: TITLE,
            description: DESCRIPTION,
            faqs: FAQS,
            breadcrumbName: "Certificación PMP®",
          }),
        ),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SeoLandingPage
      eyebrow="Guía 2026"
      h1="Certificación PMP®: qué es, requisitos y cómo aprobarla en español"
      intro="Todo lo que necesitas saber sobre el Project Management Professional del PMI®: elegibilidad, coste real, contenido del examen según el ECO 2026 y un plan de preparación realista para profesionales que trabajan a jornada completa."
      highlights={[
        "Requisitos de experiencia y formación explicados sin letra pequeña",
        "Coste total en euros y dólares, incluida la membresía del PMI®",
        "Los tres dominios del ECO: Personas, Proceso y Entorno de negocio",
        "Plan de estudio de 8 a 14 semanas compatible con tu trabajo",
      ]}
      sections={[
        {
          h2: "Qué acredita realmente el PMP®",
          paragraphs: [
            "El PMP® no evalúa memorización de procesos: evalúa criterio. Cada pregunta plantea una situación de proyecto y te pide decidir qué haría un director de proyectos profesional en ese contexto, con información incompleta y varias opciones razonables.",
            "Desde la actualización del Examination Content Outline, alrededor del 50 % del examen cubre enfoques ágiles e híbridos. Ya no basta con dominar el PMBOK® en su versión clásica: hay que entender cuándo un enfoque iterativo aporta más valor que uno predictivo.",
          ],
        },
        {
          h2: "Requisitos de elegibilidad",
          bullets: [
            "Con título universitario: 36 meses dirigiendo proyectos en los últimos 8 años y 35 horas de formación en dirección de proyectos.",
            "Con bachillerato o equivalente: 60 meses dirigiendo proyectos y las mismas 35 horas de formación.",
            "Alternativa: si posees el CAPM® en vigor, sustituye el requisito de las 35 horas de formación.",
            "La experiencia se declara por proyectos, no por puestos: cuenta el tiempo liderando o coordinando entregables, aunque tu cargo no fuera 'project manager'.",
          ],
        },
        {
          h2: "Cuánto cuesta la certificación PMP®",
          table: {
            headers: ["Concepto", "Miembro PMI®", "No miembro"],
            rows: [
              ["Examen PMP®", "405 USD", "555 USD"],
              ["Membresía anual + alta", "149 USD", "—"],
              ["Reexamen", "275 USD", "375 USD"],
              ["Renovación cada 3 años", "60 USD", "150 USD"],
            ],
          },
          paragraphs: [
            "Hacerse miembro antes de solicitar el examen ahorra dinero desde el primer intento y da acceso a las guías estándar en PDF.",
          ],
        },
        {
          h2: "Cómo prepararlo sin dejarte medio año",
          bullets: [
            "Semanas 1-3: completa las 35 horas de formación y recorre las 26 tareas del ECO para saber qué se te va a preguntar.",
            "Semanas 4-8: practica por dominios y unidades, no en bloque; corrige cada fallo identificando el tipo de error (secuencia, rol, conocimiento, interpretación).",
            "Semanas 9-12: simulacros completos de 180 preguntas en tres secciones cronometradas, replicando descansos y fatiga real.",
            "Última semana: repaso exclusivo de tus patrones de error y de las tareas con mastery por debajo del 70 %.",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/examen-pmp",
          label: "El examen PMP® por dentro",
          description: "Cuántas preguntas tiene, cuánto dura y cuál es la nota de corte.",
        },
        {
          to: "/requisitos-pmp",
          label: "Requisitos y precio del PMP®",
          description: "Elegibilidad, auditoría del PMI® y coste total en euros.",
        },
        {
          to: "/curso-pmp-online",
          label: "Curso PMP® online de 35 horas",
          description: "Formación que cubre el requisito obligatorio del PMI®.",
        },
        {
          to: "/simulador-examen-pmp",
          label: "Simulador de examen PMP®",
          description: "Practica con preguntas situacionales en español.",
        },
      ]}
      ctaTitle="Empieza por saber dónde estás"
      ctaText="Haz un diagnóstico de 5 preguntas y descubre en qué dominio del ECO pierdes puntos antes de invertir semanas de estudio."
    />
  );
}
