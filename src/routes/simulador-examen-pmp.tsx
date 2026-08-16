import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://pmtech-simulator.lovable.app/simulador-examen-pmp";
const TITLE = "Simulador de examen PMP en español · Preguntas ECO 2026";
const DESCRIPTION =
  "Simulador PMP en español con preguntas situacionales tipo examen, simulacro completo de 180 preguntas, diagnóstico por tipo de error y mastery por tarea del ECO.";

const FAQS: SeoFaq[] = [
  {
    q: "¿Hay un simulador de examen PMP gratis en español?",
    a: "Sí: puedes crear una cuenta y hacer simulacros de diagnóstico sin pagar. Los simulacros completos de 180 preguntas y la analítica avanzada forman parte de los planes de pago.",
  },
  {
    q: "¿Las preguntas están traducidas o escritas en español?",
    a: "Están redactadas en español neutro desde cero, siguiendo la estructura situacional del examen real. No son traducciones automáticas de bancos en inglés, que suelen perder los matices que determinan la respuesta correcta.",
  },
  {
    q: "¿Cuántas preguntas debo hacer antes de examinarme?",
    a: "Entre 1.500 y 2.000 preguntas revisadas con criterio. Importa más el análisis de cada fallo que el volumen: repetir 3.000 preguntas sin corregir el patrón de error no mueve la aguja.",
  },
  {
    q: "¿El simulador se adapta a mi nivel?",
    a: "Sí. El motor calcula tu mastery por cada una de las 26 tareas del ECO y prioriza las unidades donde acumulas más fallos, generando un plan de estudio ordenado por impacto.",
  },
  {
    q: "¿Puedo practicar solo un dominio?",
    a: "Sí, con el modo de práctica por dominios puedes seleccionar Personas, Proceso o Entorno de negocio y hacer mini-simulaciones con métricas de acierto y tiempo por dominio.",
  },
];

export const Route = createFileRoute("/simulador-examen-pmp")({
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
            breadcrumbName: "Simulador de examen PMP",
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
      eyebrow="Simulacros en español"
      h1="Simulador de examen PMP en español con diagnóstico de tus errores"
      intro="La mayoría de simuladores te dice cuántas fallaste. Este te dice por qué fallaste: clasifica cada error en ocho patrones de razonamiento y convierte esa información en un plan de estudio priorizado."
      highlights={[
        "Preguntas situacionales escritas en español neutro, no traducidas",
        "Simulacro completo de 180 preguntas en tres secciones cronometradas",
        "Mastery por cada una de las 26 tareas del ECO 2026",
        "Analítica de distractores A-D y patrones de error",
      ]}
      sections={[
        {
          h2: "Por qué fallar sin saber los motivos no sirve de nada",
          paragraphs: [
            "Dos candidatos pueden fallar la misma pregunta por motivos opuestos: uno no conocía la herramienta, el otro la conocía pero eligió el momento equivocado del ciclo de vida. El remedio es distinto en cada caso, y un porcentaje global no lo distingue.",
            "El motor clasifica cada respuesta incorrecta por tipo de error —secuencia, rol, conocimiento, interpretación del enunciado, sesgo predictivo/ágil, entre otros— y te muestra el patrón dominante para que estudies lo que realmente te está costando puntos.",
          ],
        },
        {
          h2: "Modos de práctica disponibles",
          bullets: [
            "Simulacro completo: 180 preguntas, tres secciones, descansos de 10 minutos y feedback solo al final, como en el examen real.",
            "Práctica por dominios: elige Personas, Proceso o Entorno de negocio y mide acierto y tiempo por dominio.",
            "Quiz de unidad: mini-simulaciones ligadas a las 14 lecciones de la ruta de aprendizaje.",
            "Repaso de errores: reabre exclusivamente las preguntas asociadas a tus fallos recientes.",
            "Simulacro acumulativo: todo lo estudiado hasta la lección actual, disponible al superar el umbral de mastery.",
          ],
        },
        {
          h2: "Qué ves después de cada simulacro",
          bullets: [
            "Nivel por dominio con una leyenda en español sin jerga: sólido, en progreso, a reforzar o brecha crítica.",
            "Desglose de distractores A-D: qué opciones incorrectas eliges más y qué revela sobre tu razonamiento.",
            "Preguntas nuevas frente a repetidas, con aviso si más del 30 % ya las habías visto.",
            "Informe descargable en PDF y exportación de historial en CSV, filtrable por dominio.",
          ],
        },
        {
          h2: "Cómo usarlo en las últimas cuatro semanas",
          paragraphs: [
            "Alterna un simulacro completo semanal con práctica dirigida diaria de 20-30 minutos sobre tus tareas ECO más débiles. El simulacro mide, la práctica corrige; hacer solo simulacros agota el banco de preguntas sin cerrar brechas.",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/examen-pmp",
          label: "Formato del examen PMP",
          description: "Duración, secciones y nota de corte.",
        },
        {
          to: "/certificacion-pmp",
          label: "Guía de la certificación PMP",
          description: "Requisitos, coste y calendario de estudio.",
        },
        {
          to: "/curso-pmp-online",
          label: "Curso PMP online de 35 horas",
          description: "El requisito de formación del PMI, cubierto.",
        },
        {
          to: "/pmbok-8",
          label: "PMBOK 7 vs PMBOK 8",
          description: "Qué versión estudiar para el examen actual.",
        },
      ]}
      ctaTitle="Haz tu primer diagnóstico ahora"
      ctaText="Cinco preguntas bastan para ver tu patrón de error dominante y qué lección de la ruta deberías atacar primero."
    />
  );
}
