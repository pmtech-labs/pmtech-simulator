import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://pmtech-simulator.lovable.app/pmtech-vs-prepcast";
const TITLE = "PMTech Simulator vs PrepCast: comparativa en español 2026";
const DESCRIPTION =
  "PMTech Simulator frente al PM Exam Simulator de PrepCast: idioma, banco de preguntas, informes, diagnóstico de errores y qué opción encaja mejor con tu preparación PMP.";

const FAQS: SeoFaq[] = [
  {
    q: "¿PrepCast tiene simulador en español?",
    a: "El PM Exam Simulator de PrepCast está en inglés. No existe una versión en español neutro equivalente, así que un candidato hispanohablante practica con una carga cognitiva extra que no tendrá relación con su dominio de la materia.",
  },
  {
    q: "¿Cuántas preguntas necesito realmente?",
    a: "Entre 1.500 y 2.000 preguntas revisadas con criterio. Un banco de 2.280 preguntas no vale más que uno menor si no analizas cada fallo: lo que mueve la nota es corregir el patrón de error, no acumular intentos.",
  },
  {
    q: "¿Qué aporta PMTech que no aporte PrepCast?",
    a: "La clasificación de cada error en ocho patrones de razonamiento, el mastery por cada una de las 26 tareas del ECO 2026 y una ruta de 14 lecciones con simulacros acumulativos, todo en español.",
  },
  {
    q: "¿Merece la pena pagar los dos?",
    a: "Solo si tu examen será en inglés y te sobra presupuesto. Para la mayoría de candidatos en España y LATAM, un simulador en su idioma con buen diagnóstico rinde más por euro invertido.",
  },
  {
    q: "¿Las explicaciones de PMTech son tan detalladas?",
    a: "Cada pregunta incluye explicación de la opción correcta y de por qué falla cada distractor, con referencia al dominio y a la tarea del ECO implicada.",
  },
];

export const Route = createFileRoute("/pmtech-vs-prepcast")({
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
            breadcrumbName: "PMTech Simulator vs PrepCast",
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
      h1="PMTech Simulator vs PrepCast: qué simulador PMP te hace aprobar antes"
      intro="PrepCast es una referencia veterana en simuladores PMP, pero solo en inglés. PMTech Simulator apuesta por el español neutro y por explicarte el motivo exacto de cada fallo. Aquí tienes las diferencias reales."
      highlights={[
        "Español neutro nativo frente a banco íntegro en inglés",
        "Diagnóstico por tipo de error frente a informes de puntuación",
        "Mastery por las 26 tareas del ECO 2026",
        "Ruta guiada de 14 lecciones con simulacros acumulativos",
      ]}
      sections={[
        {
          h2: "Comparativa rápida",
          table: {
            headers: ["Criterio", "PMTech Simulator", "PrepCast PM Exam Simulator"],
            rows: [
              ["Idioma", "Español neutro", "Inglés"],
              ["Enfoque", "Diagnóstico del razonamiento", "Volumen de preguntas y exámenes"],
              [
                "Análisis de fallos",
                "Ocho patrones de error + distractores A-D",
                "Explicaciones e informes por dominio",
              ],
              ["Ruta de estudio", "14 lecciones con desbloqueo por mastery", "Preparación libre por exámenes"],
              ["Simulacro oficial", "180 preguntas, 3 secciones, descansos", "Exámenes completos cronometrados"],
              ["Exportación", "PDF de resultados y CSV de historial", "Informes dentro de la plataforma"],
              ["Acceso inicial", "Diagnóstico gratuito al registrarte", "Prueba limitada de preguntas"],
            ],
          },
        },
        {
          h2: "Dónde gana PrepCast",
          bullets: [
            "Banco muy amplio y años de iteración con miles de candidatos.",
            "Ecosistema completo: curso de 35 horas, podcast y materiales complementarios en inglés.",
            "Si te examinas en inglés, practicar en el idioma del examen es una ventaja real.",
          ],
        },
        {
          h2: "Dónde gana PMTech Simulator",
          bullets: [
            "Preguntas situacionales escritas en español neutro, sin traducción automática que altere el matiz decisivo.",
            "Clasificación de cada error en ocho patrones de razonamiento con plan de estudio priorizado por impacto.",
            "Mastery por tarea del ECO 2026 y no solo por dominio, para saber qué estudiar exactamente.",
            "Aviso de preguntas repetidas cuando más del 30 % del simulacro ya lo habías visto, para que la nota no te engañe.",
            "Informes en PDF y exportación en CSV filtrable por dominio.",
          ],
        },
        {
          h2: "El argumento del tamaño del banco",
          paragraphs: [
            "El reclamo habitual es el número de preguntas. En la práctica, casi ningún candidato completa más de 2.000 preguntas antes del examen, y quien las completa sin analizar los fallos suele repetir el mismo error en el examen real.",
            "Por eso el criterio útil no es cuántas preguntas hay, sino qué información obtienes de cada fallo y con qué rapidez la conviertes en estudio dirigido.",
          ],
        },
        {
          h2: "Aviso de independencia",
          paragraphs: [
            "PMTech Simulator es un producto independiente y no está afiliado, avalado ni patrocinado por el Project Management Institute ni por OSP International LLC (PrepCast). PMP y PMBOK son marcas registradas del PMI; PrepCast es marca de su titular. Los datos de esta comparativa proceden de información pública y pueden cambiar.",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/pmtech-vs-pmi-study-hall",
          label: "PMTech Simulator vs PMI Study Hall",
          description: "Comparativa con el simulador oficial del PMI.",
        },
        {
          to: "/simulador-examen-pmp",
          label: "Simulador de examen PMP",
          description: "Modos de práctica y diagnóstico de errores.",
        },
        {
          to: "/curso-pmp-online",
          label: "Curso PMP online de 35 horas",
          description: "El requisito de formación del PMI, cubierto.",
        },
        {
          to: "/requisitos-pmp",
          label: "Requisitos y precio del PMP",
          description: "Qué necesitas y cuánto cuesta certificarte.",
        },
      ]}
      ctaTitle="Prueba el diagnóstico antes de pagar nada"
      ctaText="Haz cinco preguntas, mira tu patrón de error dominante y compara esa información con la que te da cualquier otro simulador."
    />
  );
}
