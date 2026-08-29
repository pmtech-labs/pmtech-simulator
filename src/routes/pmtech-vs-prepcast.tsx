import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://pmtech-simulator.lovable.app/pmtech-vs-prepcast";
const TITLE = "Top PM Simulator vs PrepCast: comparativa en español 2026";
const DESCRIPTION =
  "Top PM Simulator frente al PM Exam Simulator de PrepCast: idioma, banco de preguntas, informes, diagnóstico de errores y qué opción encaja mejor con tu preparación PMP.";

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
    q: "¿Qué aporta Top PM Simulator que no aporte PrepCast?",
    a: "La clasificación de cada error en ocho patrones de razonamiento, el mastery por cada una de las 26 tareas del ECO 2026 y una ruta de 14 lecciones con simulacros acumulativos, todo en español.",
  },
  {
    q: "¿Merece la pena pagar los dos?",
    a: "Solo si tu examen será en inglés y te sobra presupuesto. Para la mayoría de candidatos en España y LATAM, un simulador en su idioma con buen diagnóstico rinde más por euro invertido.",
  },
  {
    q: "¿Las explicaciones de Top PM Simulator son tan detalladas?",
    a: "Cada pregunta incluye explicación de la opción correcta y de por qué falla cada distractor, con referencia al dominio y a la tarea del ECO implicada.",
  },
];

export const Route = createFileRoute("/pmtech-vs-prepcast")({
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
            breadcrumbName: "Top PM Simulator vs PrepCast",
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
      h1="Top PM Simulator vs PrepCast: qué simulador PMP te hace aprobar antes"
      intro="PrepCast es una referencia veterana en simuladores PMP, pero solo en inglés. Top PM Simulator apuesta por el español neutro y por explicarte el motivo exacto de cada fallo. Aquí tienes las diferencias reales."
      highlights={[
        "Español neutro nativo frente a banco íntegro en inglés",
        "Diagnóstico por tipo de error frente a informes de puntuación",
        "Mastery por las 26 tareas del ECO 2026",
        "Ruta guiada de 14 lecciones con simulacros acumulativos",
      ]}
      comparison={{
        title: "Comparativa interactiva por área",
        ourName: "Top PM Simulator",
        competitorName: "PrepCast",
        rows: [
          {
            feature: "Idioma del contenido",
            category: "Funciones",
            ours: { verdict: "yes", label: "Español neutro nativo" },
            theirs: { verdict: "no", label: "Solo inglés" },
            detail:
              "El PM Exam Simulator de PrepCast está íntegramente en inglés. Un candidato hispanohablante suma una carga cognitiva que nada tiene que ver con su dominio de la materia.",
          },
          {
            feature: "Tamaño del banco de preguntas",
            category: "Funciones",
            ours: { verdict: "partial", label: "Banco enfocado y depurado" },
            theirs: { verdict: "yes", label: "Banco muy amplio" },
            detail:
              "PrepCast gana en volumen. En la práctica casi nadie completa más de 2.000 preguntas antes del examen, y hacerlo sin analizar los fallos repite el mismo error el día de la prueba.",
          },
          {
            feature: "Exportación de resultados",
            category: "Funciones",
            ours: { verdict: "yes", label: "PDF + CSV filtrable" },
            theirs: { verdict: "partial", label: "Informes en plataforma" },
            detail:
              "Descargas el informe de cada simulacro en PDF y exportas el historial completo en CSV filtrable por dominio.",
          },
          {
            feature: "Diagnóstico del error",
            category: "Metodología",
            ours: { verdict: "yes", label: "8 patrones + distractores A-D" },
            theirs: { verdict: "partial", label: "Explicaciones por dominio" },
            detail:
              "Además de explicar la respuesta correcta, Top PM Simulator clasifica el motivo del fallo y analiza qué distractores eliges con más frecuencia y qué revela eso de tu razonamiento.",
          },
          {
            feature: "Granularidad del progreso",
            category: "Metodología",
            ours: { verdict: "yes", label: "Mastery por las 26 tareas ECO" },
            theirs: { verdict: "partial", label: "Informes por dominio" },
            detail:
              "El mastery por tarea del ECO 2026 te dice exactamente qué repasar, en lugar de un porcentaje agregado por dominio.",
          },
          {
            feature: "Ruta de estudio guiada",
            category: "Metodología",
            ours: { verdict: "yes", label: "14 lecciones con desbloqueo" },
            theirs: { verdict: "no", label: "Preparación libre" },
            detail:
              "PrepCast plantea preparación libre por exámenes. Top PM Simulator ordena el camino en 14 lecciones que se desbloquean por mastery y cierran con simulacros acumulativos.",
          },
          {
            feature: "Simulacro con formato oficial",
            category: "Experiencia de simulación",
            ours: { verdict: "yes", label: "180 preguntas, 3 secciones" },
            theirs: { verdict: "yes", label: "Exámenes cronometrados" },
            detail:
              "Los dos ofrecen examen completo cronometrado. Top PM Simulator añade los descansos de 10 minutos y el bloqueo de secciones cerradas para replicar la fatiga real.",
          },
          {
            feature: "Aviso de preguntas repetidas",
            category: "Experiencia de simulación",
            ours: { verdict: "yes", label: "Alerta si supera el 30 %" },
            theirs: { verdict: "no", label: "No disponible" },
            detail:
              "Cuando más del 30 % del simulacro ya lo habías visto, el resultado lo advierte para que no confundas memoria con preparación.",
          },
          {
            feature: "Ecosistema formativo",
            category: "Experiencia de simulación",
            ours: { verdict: "partial", label: "Simulador + ruta de estudio" },
            theirs: { verdict: "yes", label: "Curso, podcast y materiales" },
            detail:
              "PrepCast ofrece un ecosistema completo en inglés (curso de 35 horas, podcast, libros). Top PM Simulator se concentra en simulación y diagnóstico en español.",
          },
        ],
      }}
      sections={[

        {
          h2: "Dónde gana PrepCast",
          bullets: [
            "Banco muy amplio y años de iteración con miles de candidatos.",
            "Ecosistema completo: curso de 35 horas, podcast y materiales complementarios en inglés.",
            "Si te examinas en inglés, practicar en el idioma del examen es una ventaja real.",
          ],
        },
        {
          h2: "Dónde gana Top PM Simulator",
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
            "Top PM Simulator es un producto independiente y no está afiliado, avalado ni patrocinado por el Project Management Institute ni por OSP International LLC (PrepCast). PMP y PMBOK son marcas registradas del PMI; PrepCast es marca de su titular. Los datos de esta comparativa proceden de información pública y pueden cambiar.",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/pmtech-vs-pmi-study-hall",
          label: "Top PM Simulator vs PMI Study Hall",
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
