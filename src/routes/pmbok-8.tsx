import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://pmtech-simulator.lovable.app/pmbok-8";
const TITLE = "PMBOK 7 vs PMBOK 8: qué estudiar para el examen PMP";
const DESCRIPTION =
  "Diferencias entre PMBOK 7 y PMBOK 8, qué papel juega el ECO en el examen PMP y qué material conviene estudiar realmente para aprobar en 2026.";

const FAQS: SeoFaq[] = [
  {
    q: "¿El examen PMP se basa en el PMBOK?",
    a: "No directamente. El examen se construye sobre el Examination Content Outline (ECO), que define dominios y tareas. El PMBOK® Guide es material de referencia, no el temario oficial.",
  },
  {
    q: "¿Qué cambió con el PMBOK 7?",
    a: "Pasó de un enfoque basado en procesos y áreas de conocimiento a uno basado en 12 principios y 8 dominios de desempeño, orientado a resultados y válido para enfoques predictivos, ágiles e híbridos.",
  },
  {
    q: "¿Necesito estudiar el PMBOK entero?",
    a: "No es la forma más eficiente. Conviene usarlo como referencia para resolver dudas concretas y centrar el estudio en las 26 tareas del ECO y en práctica situacional.",
  },
  {
    q: "¿El Agile Practice Guide sigue siendo necesario?",
    a: "Sí, es muy recomendable: alrededor de la mitad del examen cubre enfoques ágiles e híbridos, y buena parte de las preguntas de Personas asume vocabulario y prácticas ágiles.",
  },
  {
    q: "¿Debo esperar a una nueva versión para examinarme?",
    a: "No. Las actualizaciones de la guía no cambian de golpe el examen, que sigue anclado al ECO. Esperar solo alarga tu preparación y encarece el proceso.",
  },
];

export const Route = createFileRoute("/pmbok-8")({
  head: () => ({
    meta: [
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
            breadcrumbName: "PMBOK 7 vs PMBOK 8",
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
      eyebrow="Material de estudio"
      h1="PMBOK 7 vs PMBOK 8: qué necesitas estudiar de verdad para el PMP"
      intro="Cada actualización de la guía genera la misma duda: ¿tengo que volver a empezar? La respuesta corta es no. El examen se construye sobre el ECO, y entender esa diferencia te ahorra semanas de lectura innecesaria."
      highlights={[
        "El ECO define el examen; el PMBOK es material de consulta",
        "Del enfoque por procesos a los principios y dominios de desempeño",
        "Qué leer y en qué orden según tu punto de partida",
        "Por qué el Agile Practice Guide pesa más de lo que parece",
      ]}
      sections={[
        {
          h2: "La diferencia clave: ECO frente a PMBOK",
          paragraphs: [
            "El Examination Content Outline es el documento que el PMI usa para construir las preguntas: tres dominios y 26 tareas. El PMBOK® Guide es una guía de buenas prácticas que sirve de apoyo, pero ninguna pregunta se escribe 'desde' un capítulo concreto de la guía.",
            "Traducido a estudio: si organizas tu preparación por tareas del ECO y practicas decisiones situacionales, cubres el examen. Si la organizas por capítulos de la guía, acabas sabiendo definiciones y fallando escenarios.",
          ],
        },
        {
          h2: "Qué cambió del enfoque clásico al actual",
          table: {
            headers: ["Aspecto", "Enfoque clásico (PMBOK 6)", "Enfoque actual"],
            rows: [
              ["Estructura", "49 procesos y 10 áreas", "12 principios y 8 dominios de desempeño"],
              ["Orientación", "Entradas, herramientas y salidas", "Resultados y entrega de valor"],
              ["Enfoques", "Predictivo dominante", "Predictivo, ágil e híbrido por igual"],
              ["Rol del PM", "Controlador del plan", "Líder facilitador del equipo"],
            ],
          },
        },
        {
          h2: "Plan de lectura recomendado",
          bullets: [
            "Primero: el ECO completo, subrayando las tareas donde no sabrías qué decidir en un caso real.",
            "Segundo: los dominios de desempeño de la guía vigente, para el marco conceptual.",
            "Tercero: el Agile Practice Guide, en especial ceremonias, roles y métricas de flujo.",
            "En paralelo, desde el día uno: preguntas situacionales con revisión de errores. La lectura sin práctica no traslada al examen.",
          ],
        },
        {
          h2: "Errores frecuentes con el material",
          bullets: [
            "Memorizar los 49 procesos como si aún fueran el temario del examen.",
            "Estudiar solo en inglés cuando vas a examinarte con ayuda de traducción al español.",
            "Aplazar la preparación esperando 'la nueva edición' de la guía.",
            "Confundir volumen de lectura con preparación: el examen mide criterio, no memoria.",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/examen-pmp",
          label: "Formato del examen PMP",
          description: "Cómo se distribuyen los dominios del ECO.",
        },
        {
          to: "/simulador-examen-pmp",
          label: "Simulador PMP en español",
          description: "Convierte la teoría en decisiones practicadas.",
        },
        {
          to: "/certificacion-pmp",
          label: "Guía de la certificación PMP",
          description: "Requisitos, coste y plan de preparación.",
        },
        {
          to: "/curso-pmp-online",
          label: "Curso PMP online de 35 horas",
          description: "Contenido alineado al ECO 2026.",
        },
      ]}
      ctaTitle="Deja de leer y empieza a decidir"
      ctaText="Comprueba con un diagnóstico de 5 preguntas si tu problema es de conocimiento o de criterio. La respuesta cambia todo tu plan de estudio."
    />
  );
}
