import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://pmtech-simulator.lovable.app/pmtech-vs-pmi-study-hall";
const TITLE = "PMTech Simulator vs PMI Study Hall: comparativa 2026";
const DESCRIPTION =
  "Comparativa honesta entre PMTech Simulator y PMI Study Hall: idioma, precio, número de preguntas, diagnóstico de errores y a qué candidato le conviene cada uno.";

const FAQS: SeoFaq[] = [
  {
    q: "¿PMI Study Hall está en español?",
    a: "Study Hall es un producto del propio PMI y su contenido está en inglés. Puedes usar el traductor del navegador, pero las preguntas situacionales pierden matices al traducirse y esos matices son justo lo que decide la respuesta correcta.",
  },
  {
    q: "¿Cuál se parece más al examen real?",
    a: "Study Hall tiene la ventaja de venir del PMI, que es quien escribe el examen. PMTech Simulator replica el formato oficial (180 preguntas, tres secciones cronometradas, descansos de 10 minutos) y añade diagnóstico por tipo de error, que Study Hall no ofrece.",
  },
  {
    q: "¿Puedo usar los dos a la vez?",
    a: "Sí, y es una combinación razonable si dominas el inglés: PMTech Simulator para entender por qué fallas y corregir el patrón, Study Hall para calibrar el estilo de redacción del PMI en las últimas semanas.",
  },
  {
    q: "¿Cuál es más barato?",
    a: "Study Hall se vende por suscripción trimestral en dólares y su precio varía según seas miembro del PMI. PMTech Simulator tiene un plan gratuito de diagnóstico y planes de pago en euros; consulta la página de precios para el importe vigente.",
  },
  {
    q: "¿Study Hall es obligatorio para aprobar el PMP?",
    a: "No. El PMI no exige ningún simulador concreto. Lo obligatorio son las 35 horas de formación y cumplir los requisitos de experiencia.",
  },
];

export const Route = createFileRoute("/pmtech-vs-pmi-study-hall")({
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
            breadcrumbName: "PMTech Simulator vs PMI Study Hall",
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
      eyebrow="Comparativa"
      h1="PMTech Simulator vs PMI Study Hall: cuál te conviene según tu perfil"
      intro="Study Hall es el simulador oficial del PMI y está en inglés. PMTech Simulator está escrito en español neutro y diagnostica el motivo de cada fallo. Esta comparativa explica en qué gana cada uno sin marketing."
      highlights={[
        "Idioma: español neutro nativo frente a inglés del PMI",
        "Diagnóstico por tipo de error frente a puntuación por dominio",
        "Formato oficial replicado: 180 preguntas y tres secciones",
        "Recomendación clara según tu nivel de inglés y tu fecha de examen",
      ]}
      sections={[
        {
          h2: "Comparativa rápida",
          table: {
            headers: ["Criterio", "PMTech Simulator", "PMI Study Hall"],
            rows: [
              ["Idioma del contenido", "Español neutro, redactado de origen", "Inglés"],
              ["Origen", "Equipo independiente de formadores PMP", "Project Management Institute"],
              [
                "Diagnóstico de errores",
                "Ocho patrones de razonamiento por pregunta",
                "Puntuación por dominio y explicación",
              ],
              ["Simulacro completo", "180 preguntas, 3 secciones, descansos", "Sí, exámenes completos"],
              ["Ruta de estudio", "14 lecciones con mastery por tarea ECO", "Contenido de estudio y minis"],
              ["Modelo de precio", "Plan gratuito + planes en euros", "Suscripción trimestral en dólares"],
              ["Prueba sin pagar", "Diagnóstico gratuito al registrarte", "Versión de muestra limitada"],
            ],
          },
        },
        {
          h2: "Dónde gana PMI Study Hall",
          bullets: [
            "Lo escribe la misma organización que redacta el examen, así que el estilo de enunciado es el más fiel posible.",
            "Su banco lleva años depurándose con datos de candidatos reales de todo el mundo.",
            "Si trabajas habitualmente en inglés, practicar en el idioma del examen elimina una variable el día de la prueba.",
          ],
        },
        {
          h2: "Dónde gana PMTech Simulator",
          bullets: [
            "Contenido escrito en español neutro desde cero: no hay pérdida de matiz por traducción automática.",
            "Cada fallo se clasifica por tipo de error —secuencia, rol, conocimiento, interpretación del enunciado, sesgo predictivo/ágil— y alimenta un plan de estudio priorizado.",
            "Mastery por cada una de las 26 tareas del ECO 2026, no solo por los tres dominios.",
            "Analítica de distractores A-D: qué opciones incorrectas eliges más y qué revela sobre tu razonamiento.",
            "Informe descargable en PDF y exportación del historial en CSV filtrable por dominio.",
          ],
        },
        {
          h2: "Qué elegir según tu caso",
          bullets: [
            "Inglés técnico cómodo y examen en inglés: empieza por Study Hall y usa PMTech para diagnosticar por qué fallas.",
            "Vas a examinarte en español o el inglés te ralentiza: PMTech Simulator como base y Study Hall opcional al final.",
            "Presupuesto ajustado: arranca con el diagnóstico gratuito de PMTech y decide después dónde invertir.",
            "Ya suspendiste una vez: prioriza el diagnóstico por tipo de error; repetir preguntas sin corregir el patrón rara vez cambia el resultado.",
          ],
        },
        {
          h2: "Aviso de independencia",
          paragraphs: [
            "PMTech Simulator es un producto independiente y no está afiliado, avalado ni patrocinado por el Project Management Institute. PMP, PMBOK y PMI Study Hall son marcas registradas de sus respectivos titulares. La información de esta comparativa se basa en las características públicas de ambos productos y puede cambiar; verifica siempre los datos oficiales antes de comprar.",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/pmtech-vs-prepcast",
          label: "PMTech Simulator vs PrepCast",
          description: "La otra comparativa clásica entre simuladores PMP.",
        },
        {
          to: "/simulador-examen-pmp",
          label: "Simulador de examen PMP",
          description: "Modos de práctica y diagnóstico de errores.",
        },
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
      ]}
      ctaTitle="Compruébalo con tu propio diagnóstico"
      ctaText="Cinco preguntas bastan para ver tu patrón de error dominante y decidir con datos en qué simulador invertir tu tiempo."
    />
  );
}
