import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://pmtech-simulator.lovable.app/curso-pmp-online";
const TITLE = "Curso PMP online en español · 35 horas para el PMI";
const DESCRIPTION =
  "Curso PMP online en español de 35 horas de contacto que cubre el requisito del PMI, alineado al ECO 2026, con simulador incluido y diagnóstico de errores.";

const FAQS: SeoFaq[] = [
  {
    q: "¿El curso cubre las 35 horas que exige el PMI?",
    a: "Sí. Al finalizar recibes un certificado con las 35 horas de contacto en dirección de proyectos, que es el documento que el PMI pide en la solicitud y en caso de auditoría.",
  },
  {
    q: "¿Es en directo o grabado?",
    a: "Combina sesiones en directo con contenido bajo demanda, para que puedas seguirlo desde España o Latinoamérica compaginándolo con tu trabajo.",
  },
  {
    q: "¿Incluye acceso al simulador?",
    a: "Sí, la formación se apoya en la ruta de 14 lecciones y en los simulacros del propio simulador, con seguimiento de mastery por tarea del ECO.",
  },
  {
    q: "¿Sirve también para conseguir PDU?",
    a: "Sí. Si ya eres PMP, las horas del programa son válidas como unidades de desarrollo profesional para tu renovación trienal.",
  },
  {
    q: "¿Qué pasa si no apruebo?",
    a: "Mantienes el acceso al material y al simulador para seguir preparándote hasta tu siguiente convocatoria. Consulta las condiciones concretas en la sección de garantías de la home.",
  },
];

export const Route = createFileRoute("/curso-pmp-online")({
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
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Course",
              name: "Curso PMP online — 35 horas de contacto",
              description: DESCRIPTION,
              inLanguage: "es",
              url: URL,
              provider: {
                "@type": "Organization",
                name: "Top PM Simulator",
                url: "https://pmtech-simulator.lovable.app",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Inicio",
                  item: "https://pmtech-simulator.lovable.app",
                },
                { "@type": "ListItem", position: 2, name: "Curso PMP online", item: URL },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SeoLandingPage
      eyebrow="Formación certificada"
      h1="Curso PMP online en español: las 35 horas que exige el PMI"
      intro="Una formación pensada para profesionales en activo: sesiones prácticas alineadas al ECO 2026, certificado de 35 horas de contacto y acceso al simulador con diagnóstico de errores para que el estudio tenga rumbo."
      highlights={[
        "Certificado de 35 horas válido para la solicitud del PMI",
        "Contenido alineado al ECO 2026 y a los enfoques ágil e híbrido",
        "Simulador y ruta de 14 lecciones incluidos",
        "Formato compatible con husos horarios de España y Latinoamérica",
      ]}
      sections={[
        {
          h2: "Qué incluye el programa",
          bullets: [
            "14 unidades que recorren los tres dominios del ECO con casos reales de proyectos.",
            "Talleres de valor ganado, análisis de riesgos y gestión de conflictos en equipos.",
            "Simulacros completos y quizzes de unidad con corrección razonada.",
            "Sesiones de resolución de dudas y revisión de la solicitud al PMI.",
            "Certificado descargable con las 35 horas de contacto.",
          ],
        },
        {
          h2: "A quién va dirigido",
          paragraphs: [
            "A jefes de proyecto, consultores, responsables de PMO, ingenieros y perfiles técnicos que ya lideran entregables y quieren acreditar ese criterio con una credencial reconocida internacionalmente.",
            "No hace falta experiencia previa con el PMBOK®, pero sí haber participado en proyectos: el programa parte de tu práctica real para conectarla con el marco del PMI.",
          ],
        },
        {
          h2: "Metodología: estudiar menos y mejor",
          paragraphs: [
            "Cada bloque teórico va seguido de práctica medida. Al terminar una unidad haces su quiz, el sistema calcula tu mastery por tarea del ECO y te indica si puedes avanzar o conviene repasar.",
            "El resultado es un itinerario que evita el error clásico de leer 700 páginas y llegar al examen sin haber entrenado la toma de decisiones bajo presión.",
          ],
        },
        {
          h2: "Formación para empresas",
          paragraphs: [
            "Impartimos ediciones cerradas para equipos y PMO, con seguimiento agregado del progreso y adaptación de casos al sector del cliente. Escríbenos desde el formulario de formación de la página de inicio para recibir una propuesta.",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/requisitos-pmp",
          label: "Requisitos y precio del PMP",
          description: "Comprueba tu elegibilidad antes de matricularte.",
        },
        {
          to: "/certificacion-pmp",
          label: "Guía de la certificación PMP",
          description: "El proceso completo, paso a paso.",
        },
        {
          to: "/simulador-examen-pmp",
          label: "Simulador PMP en español",
          description: "La práctica que acompaña a la formación.",
        },
        {
          to: "/examen-pmp",
          label: "Formato del examen",
          description: "Secciones, tiempos y nota de corte.",
        },
      ]}
      ctaTitle="Pide información sobre la próxima edición"
      ctaText="Crea tu cuenta para acceder al diagnóstico gratuito y te enviamos el calendario y el temario detallado del curso de 35 horas."
    />
  );
}
