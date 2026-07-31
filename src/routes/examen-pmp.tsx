import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://pmtech-simulator.lovable.app/examen-pmp";
const TITLE = "Examen PMP: duración, preguntas y nota de corte 2026";
const DESCRIPTION =
  "Cómo es el examen PMP por dentro: 180 preguntas, 230 minutos, tres secciones con descansos, tipos de pregunta y cuál es la nota de corte real del PMI.";

const FAQS: SeoFaq[] = [
  {
    q: "¿Cuántas preguntas tiene el examen PMP?",
    a: "180 preguntas, de las cuales 5 son de prueba y no puntúan. Se reparten en tres secciones de 60 preguntas con dos descansos opcionales de 10 minutos.",
  },
  {
    q: "¿Cuánto dura el examen PMP?",
    a: "230 minutos de reloj de examen, más los dos descansos de 10 minutos que no consumen tiempo de prueba. En total, unas 4 horas y 10 minutos en el centro o ante la cámara.",
  },
  {
    q: "¿Cuál es la nota de corte del PMP?",
    a: "El PMI no publica un porcentaje oficial. El examen usa puntuación psicométrica y devuelve un nivel por dominio (Above Target, Target, Below Target, Needs Improvement). Como referencia práctica, quienes superan el 70-75 % en simulacros realistas suelen aprobar.",
  },
  {
    q: "¿Puedo volver a una sección anterior?",
    a: "No. Una vez confirmas el final de una sección, queda bloqueada. Por eso conviene marcar y revisar dentro de cada bloque antes de cerrarlo.",
  },
  {
    q: "¿Qué tipos de pregunta aparecen?",
    a: "Mayoría de opción múltiple situacional, más preguntas de respuesta múltiple, emparejamiento (drag and drop), puntos calientes sobre gráficos y algunas de cálculo (valor ganado, estimaciones).",
  },
];

export const Route = createFileRoute("/examen-pmp")({
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
            breadcrumbName: "Examen PMP",
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
      eyebrow="Formato del examen"
      h1="Examen PMP: cuántas preguntas tiene, cuánto dura y cómo se aprueba"
      intro="El formato del examen condiciona tu estrategia tanto como el temario. Aquí tienes la estructura exacta de las tres secciones, el reparto por dominios del ECO y qué significan realmente los niveles del informe de resultados."
      highlights={[
        "180 preguntas en tres secciones de 60, con dos descansos de 10 minutos",
        "230 minutos de reloj: 1,28 minutos por pregunta de media",
        "42 % Personas, 50 % Proceso, 8 % Entorno de negocio",
        "Alrededor del 50 % del contenido es ágil o híbrido",
      ]}
      sections={[
        {
          h2: "Estructura real del examen",
          table: {
            headers: ["Bloque", "Preguntas", "Tiempo aproximado"],
            rows: [
              ["Sección 1", "60", "~77 minutos"],
              ["Descanso 1 (opcional)", "—", "10 minutos"],
              ["Sección 2", "60", "~77 minutos"],
              ["Descanso 2 (opcional)", "—", "10 minutos"],
              ["Sección 3", "60", "~76 minutos"],
            ],
          },
          paragraphs: [
            "Las secciones cerradas no se pueden reabrir. Esto cambia por completo la gestión del tiempo: no puedes dejar 20 preguntas 'para el final' del examen, solo para el final de tu bloque actual.",
          ],
        },
        {
          h2: "Reparto por dominios del ECO 2026",
          bullets: [
            "Personas (42 %): liderazgo, gestión de conflictos, equipos de alto rendimiento, servant leadership.",
            "Proceso (50 %): planificación, alcance, cronograma, coste, riesgos, calidad y entrega de valor.",
            "Entorno de negocio (8 %): cumplimiento normativo, beneficios del proyecto y cambio organizativo.",
          ],
        },
        {
          h2: "Cómo se puntúa y qué significa la nota de corte",
          paragraphs: [
            "El PMI no publica un umbral fijo de aciertos. Cada pregunta tiene un peso distinto según su dificultad estadística, y el informe final devuelve un nivel por dominio en lugar de un porcentaje.",
            "En la práctica, los candidatos que mantienen entre un 70 % y un 75 % de aciertos en simulacros bien calibrados —no en bancos de preguntas fáciles— aprueban con margen. Un 85 % en un simulacro trivial no dice nada útil.",
          ],
        },
        {
          h2: "Errores de gestión del tiempo que suspenden exámenes",
          bullets: [
            "Releer tres veces enunciados largos: la primera lectura correcta vale más que tres apresuradas.",
            "Saltarse los descansos: la fatiga en la sección 3 cuesta más puntos que los 10 minutos ahorrados.",
            "Marcar demasiadas preguntas para revisar y quedarse sin tiempo dentro del bloque.",
            "No identificar la palabra clave del enunciado: 'primero', 'mejor', 'siguiente' cambian la respuesta correcta.",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/simulador-examen-pmp",
          label: "Simulador de examen PMP",
          description: "Replica las tres secciones cronometradas con descansos.",
        },
        {
          to: "/certificacion-pmp",
          label: "Guía de la certificación PMP",
          description: "Requisitos, coste y plan de preparación completo.",
        },
        {
          to: "/pmbok-8",
          label: "PMBOK 7 y PMBOK 8",
          description: "Qué cambia y qué necesitas estudiar de verdad.",
        },
        {
          to: "/requisitos-pmp",
          label: "Requisitos y precio",
          description: "Elegibilidad, auditoría y tasas del PMI.",
        },
      ]}
      ctaTitle="Practica el examen tal y como es"
      ctaText="Tres secciones cronometradas, navegador bloqueado entre bloques y feedback solo al final: el simulacro completo reproduce las condiciones reales del PMP."
    />
  );
}
