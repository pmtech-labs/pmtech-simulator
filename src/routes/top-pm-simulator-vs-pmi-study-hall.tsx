import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://toppmsimulator.glacimonto.com/top-pm-simulator-vs-pmi-study-hall";
const TITLE = "Top PM Simulator vs PMI Study Hall: comparativa 2026";
const DESCRIPTION =
  "Comparativa honesta entre Top PM Simulator y PMI Study Hall: idioma, precio, número de preguntas, diagnóstico de errores y a qué candidato le conviene cada uno.";

const FAQS: SeoFaq[] = [
  {
    q: "¿PMI Study Hall está en español?",
    a: "Study Hall es un producto del propio PMI y su contenido está en inglés. Puedes usar el traductor del navegador, pero las preguntas situacionales pierden matices al traducirse y esos matices son justo lo que decide la respuesta correcta.",
  },
  {
    q: "¿Cuál se parece más al examen real?",
    a: "Study Hall tiene la ventaja de venir del PMI, que es quien escribe el examen. Top PM Simulator replica el formato oficial (180 preguntas, tres secciones cronometradas, descansos de 10 minutos) y añade diagnóstico por tipo de error, que Study Hall no ofrece.",
  },
  {
    q: "¿Puedo usar los dos a la vez?",
    a: "Sí, y es una combinación razonable si dominas el inglés: Top PM Simulator para entender por qué fallas y corregir el patrón, Study Hall para calibrar el estilo de redacción del PMI en las últimas semanas.",
  },
  {
    q: "¿Cuál es más barato?",
    a: "Study Hall se vende por suscripción trimestral en dólares y su precio varía según seas miembro del PMI. Top PM Simulator tiene un plan gratuito de diagnóstico y planes de pago en euros; consulta la página de precios para el importe vigente.",
  },
  {
    q: "¿Study Hall es obligatorio para aprobar el PMP?",
    a: "No. El PMI no exige ningún simulador concreto. Lo obligatorio son las 35 horas de formación y cumplir los requisitos de experiencia.",
  },
];

export const Route = createFileRoute("/top-pm-simulator-vs-pmi-study-hall")({
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
            breadcrumbName: "Top PM Simulator vs PMI Study Hall",
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
      h1="Top PM Simulator vs PMI Study Hall: cuál te conviene según tu perfil"
      intro="Study Hall es el simulador oficial del PMI y está en inglés. Top PM Simulator está escrito en español neutro y diagnostica el motivo de cada fallo. Esta comparativa explica en qué gana cada uno sin marketing."
      highlights={[
        "Idioma: español neutro nativo frente a inglés del PMI",
        "Diagnóstico por tipo de error frente a puntuación por dominio",
        "Formato oficial replicado: 180 preguntas y tres secciones",
        "Recomendación clara según tu nivel de inglés y tu fecha de examen",
      ]}
      comparison={{
        title: "Comparativa interactiva por área",
        ourName: "Top PM Simulator",
        competitorName: "PMI Study Hall",
        rows: [
          {
            feature: "Idioma del contenido",
            category: "Funciones",
            ours: { verdict: "yes", label: "Español neutro nativo" },
            theirs: { verdict: "no", label: "Solo inglés" },
            detail:
              "Top PM Simulator redacta cada escenario directamente en español neutro, cuidando el matiz que decide la respuesta. Study Hall solo existe en inglés; el traductor del navegador altera precisamente esos matices situacionales.",
          },
          {
            feature: "Origen del contenido",
            category: "Funciones",
            ours: { verdict: "partial", label: "Formadores PMP independientes" },
            theirs: { verdict: "yes", label: "Project Management Institute" },
            detail:
              "Study Hall lo publica el propio PMI, la organización que escribe el examen, así que su estilo de enunciado es el más fiel posible. Top PM Simulator lo elabora un equipo independiente de formadores certificados PMP, alineado con el ECO 2026.",
          },
          {
            feature: "Exportación de resultados",
            category: "Funciones",
            ours: { verdict: "yes", label: "PDF + CSV filtrable" },
            theirs: { verdict: "partial", label: "Informes en plataforma" },
            detail:
              "Puedes descargar el informe de cada simulacro en PDF y exportar todo tu historial en CSV filtrable por dominio para analizarlo por tu cuenta.",
          },
          {
            feature: "Diagnóstico del error",
            category: "Metodología",
            ours: { verdict: "yes", label: "8 patrones de razonamiento" },
            theirs: { verdict: "partial", label: "Puntuación por dominio" },
            detail:
              "Cada fallo se clasifica por tipo —secuencia, rol, conocimiento, interpretación del enunciado, sesgo predictivo/ágil— para que corrijas el patrón, no la pregunta suelta.",
          },
          {
            feature: "Granularidad del progreso",
            category: "Metodología",
            ours: { verdict: "yes", label: "Mastery por las 26 tareas ECO" },
            theirs: { verdict: "partial", label: "Por dominio" },
            detail:
              "Saber que fallas en 'Proceso' no dice qué estudiar. Top PM Simulator mide el dominio de cada una de las 26 tareas del ECO 2026 y prioriza las que más te penalizan.",
          },
          {
            feature: "Ruta de estudio guiada",
            category: "Metodología",
            ours: { verdict: "yes", label: "14 lecciones con desbloqueo" },
            theirs: { verdict: "partial", label: "Contenido de estudio libre" },
            detail:
              "Las 14 lecciones se desbloquean por mastery y cierran con simulacros acumulativos, de modo que avanzas solo cuando consolidas lo anterior.",
          },
          {
            feature: "Simulacro con formato oficial",
            category: "Experiencia de simulación",
            ours: { verdict: "yes", label: "180 preguntas, 3 secciones" },
            theirs: { verdict: "yes", label: "Exámenes completos" },
            detail:
              "Ambos replican el examen completo. Top PM Simulator reproduce además los dos descansos de 10 minutos y bloquea las secciones ya cerradas, igual que el examen real.",
          },
          {
            feature: "Aviso de preguntas repetidas",
            category: "Experiencia de simulación",
            ours: { verdict: "yes", label: "Alerta si supera el 30 %" },
            theirs: { verdict: "no", label: "No disponible" },
            detail:
              "Si más del 30 % del simulacro ya lo habías visto, Top PM Simulator lo avisa en el resultado para que la nota no te dé una falsa sensación de preparación.",
          },
          {
            feature: "Prueba sin pagar",
            category: "Experiencia de simulación",
            ours: { verdict: "yes", label: "Diagnóstico gratuito" },
            theirs: { verdict: "partial", label: "Muestra limitada" },
            detail:
              "El diagnóstico gratuito de 5 preguntas te devuelve tu patrón de error dominante antes de decidir si pagas nada.",
          },
        ],
      }}
      sections={[

        {
          h2: "Dónde gana PMI Study Hall",
          bullets: [
            "Lo escribe la misma organización que redacta el examen, así que el estilo de enunciado es el más fiel posible.",
            "Su banco lleva años depurándose con datos de candidatos reales de todo el mundo.",
            "Si trabajas habitualmente en inglés, practicar en el idioma del examen elimina una variable el día de la prueba.",
          ],
        },
        {
          h2: "Dónde gana Top PM Simulator",
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
            "Inglés técnico cómodo y examen en inglés: empieza por Study Hall y usa Top PM Simulator para diagnosticar por qué fallas.",
            "Vas a examinarte en español o el inglés te ralentiza: Top PM Simulator como base y Study Hall opcional al final.",
            "Presupuesto ajustado: arranca con el diagnóstico gratuito de Top PM Simulator y decide después dónde invertir.",
            "Ya suspendiste una vez: prioriza el diagnóstico por tipo de error; repetir preguntas sin corregir el patrón rara vez cambia el resultado.",
          ],
        },
        {
          h2: "Aviso de independencia",
          paragraphs: [
            "Top PM Simulator es un producto independiente y no está afiliado, avalado ni patrocinado por el Project Management Institute. PMP, PMBOK y PMI Study Hall son marcas registradas de sus respectivos titulares. La información de esta comparativa se basa en las características públicas de ambos productos y puede cambiar; verifica siempre los datos oficiales antes de comprar.",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/top-pm-simulator-vs-prepcast",
          label: "Top PM Simulator vs PrepCast",
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
