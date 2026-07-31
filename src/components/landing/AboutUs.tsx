import { Award, Bot, Building2, GraduationCap, Users } from "lucide-react";

const STATS = [
  { value: "24+", label: "años dirigiendo proyectos y PMOs" },
  { value: "12+", label: "años formando a profesionales" },
  { value: "6.600+", label: "profesionales nos siguen en LinkedIn" },
  { value: "26", label: "tareas del ECO cubiertas en el simulador" },
];

const PILLARS = [
  {
    icon: Building2,
    title: "24 años dirigiendo proyectos reales",
    description:
      "Dirección de proyectos y PMOs en Telefónica, Deutsche Telekom, BBVA, Inetum, AYESA y la Administración General del Estado, combinando enfoques predictivos y ágiles. Las preguntas del simulador salen de situaciones que hemos vivido, no de un generador genérico.",
  },
  {
    icon: GraduationCap,
    title: "Docencia universitaria y ejecutiva",
    description:
      "Profesor del Executive MBA en UNIR (dirección de operaciones y dirección de TFM), profesor de Dirección de Proyectos en la Cámara de Comercio de Madrid desde 2016, y docente en EOI, EALDE y Cerem. Sabemos dónde se atasca la gente porque lo hemos corregido cientos de veces.",
  },
  {
    icon: Award,
    title: "Certificados por quienes escriben el estándar",
    description:
      "PMP® y PMO-CP® por el Project Management Institute, PSM® por Scrum.org, CSM® por Scrum Alliance, SCPO®, KMP®, ITIL®, ISO 20000 y BIM®. Máster en Project Management por la George Washington University.",
  },
  {
    icon: Users,
    title: "Consultoría en organizaciones, no solo aulas",
    description:
      "Diseñamos e implantamos PMOs, rediseñamos la gobernanza de proyectos y acompañamos la adopción de agilidad con un marco híbrido (predictivo + ágil) adaptado a cada contexto. Esa práctica mantiene el banco de preguntas pegado a la realidad.",
  },
  {
    icon: Bot,
    title: "Inteligencia artificial aplicada a proyectos",
    description:
      "Coordinamos proyectos de innovación académica con IA en el Grupo PROEDUCA (UNIR), diseñando asistentes que apoyan a estudiantes y profesorado. Ese mismo trabajo es el que sostiene el motor de diagnóstico de errores de este simulador.",
  },
];

export function AboutUs() {
  return (
    <section id="sobre-nosotros" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Quiénes estamos detrás del simulador
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          No somos una plataforma de tests anónima. Somos un equipo de consultoría y formación en
          dirección de proyectos, agilidad y PMO, con casi 25 años gestionando proyectos y más de
          una década preparando a profesionales para el examen PMP®.
        </p>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 shadow-lift sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <dt className="font-display text-2xl font-bold text-accent sm:text-3xl">{s.value}</dt>
            <dd className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-lift">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
              <p.icon className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
        Por eso el simulador no se limita a puntuar: diagnostica el razonamiento. Es la traducción
        en software del método con el que llevamos años certificando a nuestros alumnos.
      </p>
    </section>
  );
}
