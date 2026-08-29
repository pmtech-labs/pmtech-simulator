import { createFileRoute } from "@tanstack/react-router";

import {
  SeoLandingPage,
  buildSeoLandingJsonLd,
  type SeoFaq,
} from "@/components/landing/SeoLandingPage";

const URL = "https://toppmsimulator.glacimonto.com/requisitos-pmp";
const TITLE = "Requisitos PMP y precio del examen en 2026";
const DESCRIPTION =
  "Requisitos de experiencia y formación para el PMP, cómo rellenar la solicitud, qué pasa si te auditan y cuánto cuesta el examen en euros y dólares.";

const FAQS: SeoFaq[] = [
  {
    q: "¿Qué requisitos pide el PMI para el PMP?",
    a: "Con título universitario: 36 meses dirigiendo proyectos en los últimos 8 años más 35 horas de formación. Sin título universitario: 60 meses de experiencia y las mismas 35 horas.",
  },
  {
    q: "¿Cuánto cuesta el examen PMP en euros?",
    a: "555 USD para no miembros y 405 USD para miembros del PMI, aproximadamente 510 y 375 euros según el cambio. Sumando la membresía anual, hacerse miembro sale más barato desde el primer intento.",
  },
  {
    q: "¿Qué es la auditoría del PMI?",
    a: "Un porcentaje de solicitudes se selecciona al azar para verificación. Te piden copia del título, el certificado de las 35 horas y la firma de un supervisor o cliente por cada proyecto declarado. Tienes 90 días para enviarlo.",
  },
  {
    q: "¿Necesito ser project manager de título para cumplir la experiencia?",
    a: "No. Cuenta el tiempo liderando o coordinando entregables de un proyecto, aunque tu cargo fuera analista, consultor, ingeniero o responsable de área. Lo que se describe es tu rol en el proyecto, no tu puesto.",
  },
  {
    q: "¿Cuánto tiempo tengo para presentarme tras aprobar la solicitud?",
    a: "Un año de elegibilidad desde la aprobación, con hasta tres intentos dentro de ese periodo.",
  },
];

export const Route = createFileRoute("/requisitos-pmp")({
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
            breadcrumbName: "Requisitos y precio del PMP",
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
      eyebrow="Elegibilidad y costes"
      h1="Requisitos del PMP y precio real del examen"
      intro="Antes de estudiar conviene saber si eres elegible y cuánto vas a gastar. Esta guía desglosa la experiencia exigida, cómo describirla en la solicitud, qué ocurre si te auditan y el coste total del proceso."
      highlights={[
        "Experiencia exigida según tengas o no título universitario",
        "Cómo redactar las descripciones de proyecto que aprueba el PMI",
        "Qué documentación piden en una auditoría y cómo prepararla",
        "Coste completo: examen, membresía, reexamen y renovación",
      ]}
      sections={[
        {
          h2: "Requisitos de experiencia y formación",
          table: {
            headers: ["Perfil", "Experiencia dirigiendo proyectos", "Formación"],
            rows: [
              ["Título universitario o superior", "36 meses (últimos 8 años)", "35 horas de contacto"],
              ["Bachillerato / diplomado", "60 meses (últimos 8 años)", "35 horas de contacto"],
              ["Titular de CAPM® vigente", "Según el caso anterior", "Requisito cubierto"],
            ],
          },
        },
        {
          h2: "Cómo describir tus proyectos en la solicitud",
          bullets: [
            "Una entrada por proyecto, con fechas de inicio y fin sin solapamientos que inflen el cómputo.",
            "Describe objetivo, tu rol y entregables en 200-500 caracteres, usando verbos de dirección: planifiqué, coordiné, gestioné riesgos, controlé el alcance.",
            "Evita jerga interna de tu empresa y acrónimos que el revisor no pueda interpretar.",
            "Ten localizado a un supervisor o cliente que pueda firmar por cada proyecto, por si hay auditoría.",
          ],
        },
        {
          h2: "Coste total del proceso",
          table: {
            headers: ["Concepto", "Miembro PMI", "No miembro"],
            rows: [
              ["Membresía + alta", "149 USD", "—"],
              ["Examen", "405 USD", "555 USD"],
              ["Reexamen (2.º y 3.er intento)", "275 USD", "375 USD"],
              ["Renovación trienal", "60 USD", "150 USD"],
            ],
          },
          paragraphs: [
            "A esto suma la formación de 35 horas y el material de práctica. Muchas empresas lo cubren dentro del presupuesto de formación anual: pedirlo antes de matricularte suele ser la diferencia entre pagarlo tú o no.",
          ],
        },
        {
          h2: "Mantener la credencial: los 60 PDU",
          paragraphs: [
            "El ciclo de renovación es de tres años y exige 60 unidades de desarrollo profesional repartidas entre educación y contribución a la profesión, según el Triángulo de Talentos del PMI (formas de trabajar, competencias de poder y perspectiva de negocio).",
          ],
        },
      ]}
      faqs={FAQS}
      related={[
        {
          to: "/certificacion-pmp",
          label: "Guía de la certificación PMP",
          description: "Visión completa del proceso de principio a fin.",
        },
        {
          to: "/curso-pmp-online",
          label: "Curso PMP online de 35 horas",
          description: "Cubre el requisito de formación obligatorio.",
        },
        {
          to: "/examen-pmp",
          label: "Formato del examen",
          description: "Preguntas, duración y nota de corte.",
        },
        {
          to: "/simulador-examen-pmp",
          label: "Simulador PMP en español",
          description: "Practica antes de pagar la tasa del examen.",
        },
      ]}
      ctaTitle="¿Cumples los requisitos? Comprueba tu nivel"
      ctaText="Un diagnóstico rápido te dice si estás cerca del aprobado o si te conviene reforzar antes de pagar los 555 USD del examen."
    />
  );
}
